import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_SYyJnZPqfIHN5cYH3I-5YQ_foTlKdNa",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options });
            } catch {}
          },
        },
      }
    );

    // 1. BLINDAJE DE SEGURIDAD ESTRICTO: SOLO HEAD COACH RICARDO / SUPERADMIN
    const { data: { user } } = await supabase.auth.getUser();
    const roleCookie = cookieStore.get("user_role")?.value;
    const emailCookie = cookieStore.get("user_email")?.value;

    const effectiveEmail = (user?.email || emailCookie || "").toLowerCase().trim();
    const isMasterAuthorized = 
      effectiveEmail === "wildwolvescdmx@gmail.com" ||
      effectiveEmail === "ricardo@wildwolves.mx" ||
      effectiveEmail === "director@wildwolves.mx" ||
      roleCookie === "superadmin";

    if (!isMasterAuthorized) {
      return NextResponse.json(
        { error: "Acceso denegado. Lobo Central IA es exclusivo para el Head Coach Ricardo." },
        { status: 403 }
      );
    }

    const { messages, customContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const freeLlmApiUrl = process.env.FREE_LLM_API_URL;

    // Si aún no se ha configurado la clave secreta
    if (!apiKey || apiKey === "tu_clave_secreta_aqui") {
      return NextResponse.json({
        reply: "🐺 *Lobo Central IA en espera:*\n\nCoach Ricardo, para activar las respuestas de IA en tiempo real, ingresa tu clave gratuita de Google Gemini en tu archivo `.env.local`:\n\n`GEMINI_API_KEY=\"AIzaSy...\"`\n\nPuedes generar tu clave en segundos sin costo en: **aistudio.google.com**.\n\n_Mientras tanto, todas las funciones del Búnker, pase de lista, finanzas y evaluaciones continúan operando al 100%._"
      });
    }

    // 2. CONTEXTO SUPREMO DEL SISTEMA WILD WOLVES CDMX
    const systemPrompt = `Eres "Lobo Central IA", el copiloto ejecutivo y director técnico digital exclusivo del Head Coach Ricardo en la academia de básquetbol Wild Wolves CDMX (Sede: Canchas Techadas Deportivo Carmen Serdán).

TUS FACULTADES SUPREMAS:
1. GESTIÓN Y PLANEACIÓN DEPORTIVA: Dosificar entrenamientos de cancha (calentamiento articular 15m, fundamentos biomecánicos 30m, drills con balón 45m, partido condicionado 25m, vuelta a la calma 5m) y tareas en casa (cuerda progresiva 100 a 1000 saltos, planchas isométricas con peso, trote y batería calisténica 3x25).
2. COMUNICACIÓN TÁCTICA PARA WHATSAPP: Redactar avisos formales, enérgicos y profesionales para padres y tutores (recordatorios de domingo 16:00 a 18:00 hrs, inicios de clase, avisos de lluvia o techumbre, cuotas de $50/$150/$600 MXN sin generar fricción, y convocatorias al Test Day Biomecánico).
3. CONFIGURACIÓN DEL SISTEMA Y EVALUACIÓN: Asesorar al Coach en la colocación de atletas en el escalafón biológico oficial de 9 Tiers (Principiante, Básico, Intermedio, Avanzado, Militar, Élite, Bestia Alfa, Titán Wolf, Ultra Instinto) y en el Combine de 5 spots de tiros perimetrales.

REGLAS DE TONO Y FORMATO:
- Enérgico, conciso, ultra-profesional y enfocado en básquetbol formativo de alto rendimiento.
- Cuando redactes para WhatsApp, usa negritas (*), emojis deportivos oficiales (🐺🏀🔥) y estructura visual limpia lista para copiar y pegar.
- Contexto de la consulta actual: ${JSON.stringify(customContext || {})}`;

    // 3. INFERENCIA CON PROXY FREELLMAPI (SI ESTÁ DEFINIDO)
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
        "Lobo Central en espera. No se pudo generar la directiva táctica.";
      return NextResponse.json({ reply: replyText });
    }

    // 4. INFERENCIA DIRECTA CON GOOGLE GEMINI 1.5 FLASH
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const formattedContents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "¡Entendido, Head Coach Ricardo! Lobo Central IA conectado con acceso SuperAdmin y listo para dirigir la estrategia en duela." }],
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
          maxOutputTokens: 1200,
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
      "Lobo Central en espera. No se pudo generar la respuesta.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Lobo Central handler error:", error);
    return NextResponse.json(
      { reply: `⚠️ Error en el centro de mando IA: ${error.message || "Fallo de comunicación"}` },
      { status: 200 }
    );
  }
}
