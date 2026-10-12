import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, contextData, customContext, userRole = "coach", userPlan = "free" } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Control de Cuotas de IA por Rol y Modalidad:
    // SuperAdmin / Coach: Ilimitado ($0)
    // Alumno / Tutor Free: 3 consultas / mes
    // Lobo Pro ($99): 30 consultas / mes
    // Lobo Élite Familiar ($149): 60 consultas / mes
    const isCoach = userRole === "coach" || userRole === "superadmin";
    const monthlyMax = isCoach ? 9999 : userPlan === "elite_familiar" ? 60 : userPlan === "pro" ? 30 : 3;
    const currentUsed = (customContext?.usedQueries ?? contextData?.usedQueries ?? 1);
    const remaining = Math.max(0, monthlyMax - currentUsed);

    const systemPrompt = `Eres "Lobo Táctico IA", el copiloto ejecutivo y director técnico digital del Head Coach Ricardo en la academia de básquetbol Wild Wolves CDMX (Sede: Deportivo Carmen Serdán).
Misión:
- Asistir en dosificación de entrenamientos en cancha (2 horas) y rutinas en casa (Batería 3x25, cuerda 100-1000).
- Gestión táctica de asistencias, retardos e inasistencias en cancha y turno dominical (16:00 a 18:00 hrs).
- Finanzas en duela (cuotas de $50, $150, $600 MXN sin fricción con los tutores).
- Redacción de mensajes oficiales para WhatsApp listos para copiar con emojis y negritas (*).

Tono: Táctico, conciso, motivador, respetuoso y profesional.
Contexto deportivo actual: ${JSON.stringify(contextData || customContext || {})}`;

    // Lista de modelos activos en Groq con cascada inteligente (Llama / Qwen / GPT-OSS)
    const activeModels = [
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b"
    ];

    let reply = "";
    let lastError = "";

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.content || "",
      })),
    ];

    for (const model of activeModels) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            temperature: 0.4,
            max_tokens: 1024,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            reply = content.trim();
            break; // Respuesta generada con éxito
          }
        } else {
          const errText = await groqResponse.text();
          lastError = errText;
          console.warn(`Modelo ${model} no disponible en Groq, saltando al siguiente...`, errText);
        }
      } catch (e: any) {
        lastError = e.message;
        console.warn(`Error llamando a ${model}:`, e);
      }
    }

    if (!reply) {
      console.error("Ningún modelo de Groq respondió. Último error:", lastError);
      return NextResponse.json({
        reply: "Coach Ricardo, el núcleo de Groq está recalibrando sus clústeres. Tu indicación fue recibida; puedes reenviarla o consultar directamente.",
      });
    }

    if (reply && !isCoach) {
      reply += `\n\n_📊 Consumo de IA: Ocupaste ${currentUsed} de ${monthlyMax} consultas mensuales (${remaining} restantes)._`;
    }

    return NextResponse.json({ 
      reply,
      quota: {
        isUnlimited: isCoach,
        used: currentUsed,
        total: monthlyMax,
        remaining
      }
    });
  } catch (error: any) {
    console.error("Excepción en asistente:", error);
    return NextResponse.json(
      { reply: "Coach Ricardo, el asistente está reconectando con el búnker. Envía tu consulta nuevamente." },
      { status: 200 }
    );
  }
}
