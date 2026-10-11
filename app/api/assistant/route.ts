import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, contextData } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const freeLlmApiUrl = process.env.FREE_LLM_API_URL;

    // Si aún no se ha configurado la clave secreta
    if (!apiKey || apiKey === "tu_clave_secreta_aqui") {
      return NextResponse.json({
        reply: "🐺 *Lobo Táctico IA en modo reposo:*\n\nCoach Ricardo, para activar mis respuestas de IA en tiempo real, ingresa tu clave gratuita de Google Gemini en tu archivo `.env.local`:\n\n`GEMINI_API_KEY=\"AIzaSy...\"`\n\nPuedes generar tu clave en segundos sin costo en: **aistudio.google.com**.\n\n_Mientras tanto, todas las funciones de pase de lista, finanzas, cobro en duela y pruebas de cancha continúan al 100%._"
      });
    }

    // Prompt del sistema adaptado y blindado a Wild Wolves CDMX
    const systemPrompt = `Eres "Lobo Táctico IA", el asistente técnico oficial y consultor biomecánico de la academia Wild Wolves Basketball Academy CDMX en el Deportivo Carmen Serdán.
Tu función es asistir al Head Coach Ricardo con la configuración de la app, rutinas de entrenamiento, dosificación calisténica y biomecánica (Batería 3x25, saltos de cuerda 100-1000, 5 spots de triples), redacción de recibos y comunicados para tutores y familias (ej. Catalina López, abuela de Osmar López), y análisis deportivo del escalafón biológico de 9 tiers.
Contexto deportivo actual recibido: ${JSON.stringify(contextData || {})}.
Instrucciones de respuesta:
- Responde de forma concisa, profesional, motivadora, técnica y táctica.
- Usa terminología de baloncesto y calistenia propia de Wild Wolves (Carmen Serdán, Duela, Manada, Escuadra, Dominio de fundamentos).
- Si te piden redactar un mensaje para WhatsApp a padres de familia, formatéalo limpio y listo para enviar con emojis adecuados.`;

    // 1. Si se configuró proxy FreeLLMAPI / OpenAI-compatible
    if (freeLlmApiUrl) {
      const openAiUrl = freeLlmApiUrl.endsWith("/") ? `${freeLlmApiUrl}chat/completions` : `${freeLlmApiUrl}/chat/completions`;
      const response = await fetch(openAiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...(messages || []).map((m: any) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en servidor LLM proxy (${response.status})`);
      }

      const data = await response.json();
      const replyText =
        data.choices?.[0]?.message?.content ||
        "Lobo Táctico en espera. No se pudo generar la respuesta.";
      return NextResponse.json({ reply: replyText });
    }

    // 2. Conexión nativa directa con Google Gemini 1.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const formattedContents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "¡Entendido, Head Coach Ricardo! Lobo Táctico IA conectado y listo para la estrategia en duela." }],
      },
      ...(messages || []).map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      })),
    ];

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API Error:", errBody);
      return NextResponse.json({
        reply: `⚠️ Error de comunicación con Gemini (${response.status}). Verifica que la clave GEMINI_API_KEY sea válida en Google AI Studio.`
      });
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lobo Táctico en espera. No se pudo generar la respuesta.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Assistant API handler error:", error);
    return NextResponse.json(
      { reply: `⚠️ Disculpa Coach, ocurrió un error en la conexión: ${error.message || "Fallo de red"}` },
      { status: 200 } // Devolver 200 para que el chat muestre el mensaje sin romper la UI
    );
  }
}
