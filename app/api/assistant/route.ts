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

    // Segmentación y Especialización de IA por Rol Específico:
    // 1. "director_tactico" / "coach" / "superadmin": Mando táctico, dosificación de entrenamientos, balances y gestión de caja.
    // 2. "crm_whatsapp": Redacción ejecutiva y personalizada de WhatsApp para prospectos, bienvenida, recordatorio de cuotas y confirmación de asistencia.
    // 3. "mentor_atleta": Asesoría deportiva, mecánica de tiro (20TL), salto vertical, batería 3x25 y prevención de fatiga.
    // 4. "tutor_familiar": Orientación para padres de familia (horarios Carmen Serdán, hidratación, material deportivo y cuotas).

    let roleSystemDirective = "";
    if (userRole === "crm_whatsapp" || customContext?.mode === "whatsapp" || customContext?.mode === "crm") {
      roleSystemDirective = `ROL: "Lobo WhatsApp CRM & Comunicación Directa".
Misión:
- Redactar mensajes para WhatsApp listos para copiar y pegar dirigidos a tutores o prospectos.
- Estructura limpia: saludo empático y enérgico, detalles claros con negritas (*), emojis deportivos y llamada a la acción precisa.
- Incluir siempre los detalles oficiales: Deportivo Carmen Serdán (Sábados 09:00 AM, Domingos 16:00 a 18:00 hrs, Lun-Mié-Vie 17:00 a 19:00 hrs).
- Cortesías ($0 clase muestra gratis) o cuotas ($50 por sesión) según el caso.`;
    } else if (userRole === "student" || customContext?.mode === "atleta") {
      roleSystemDirective = `ROL: "Lobo Mentor Deportivo & Biomecánica".
Misión:
- Asesorar exclusivamente en técnica de tiro libre (serie base de 20 tiros), media distancia, salto vertical, batería física 3x25 y calentamiento.
- Tono: Motivador, riguroso, formativo y enfocado en hábitos de alto rendimiento.`;
    } else if (userRole === "guardian" || customContext?.mode === "tutor") {
      roleSystemDirective = `ROL: "Lobo Atención a Familias & Tutores".
Misión:
- Resolver dudas de padres y tutores sobre horarios de entrenamiento, puntualidad, hidratación reglamentaria, uniforme y aportaciones.
- Tono: Respetuoso, claro, cordial y formal.`;
    } else {
      roleSystemDirective = `ROL: "Lobo Táctico IA • Dirección Técnica & Head Coach".
Misión:
- Copiloto ejecutivo y estratega deportivo del Head Coach Ricardo en Wild Wolves CDMX.
- Dosificación de entrenamientos de 120 minutos en duela, divisiones por bloques (calentamiento, técnica individual, táctica colectiva, estiramiento).
- Análisis de asistencias, balances de caja y atletas en riesgo de inasistencia.`;
    }

    const systemPrompt = `Eres el núcleo de Inteligencia Artificial especializada de Wild Wolves CDMX (Sede: Deportivo Carmen Serdán).
${roleSystemDirective}

Directrices Generales:
- Idioma: Español (México).
- Sin rellenos genéricos. Directo al punto y accionable.
- Contexto deportivo actual: ${JSON.stringify(contextData || customContext || {})}`;

    // Lista de modelos activos en Groq con cascada inteligente (Llama 3.3 / Llama 3.1 / Mixtral)
    const activeModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768"
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
