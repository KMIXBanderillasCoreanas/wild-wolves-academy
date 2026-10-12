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

    const { messages, category = "student" } = await req.json();

    // 1. OBTENER USUARIO ACTUAL
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = (user?.email || "").toLowerCase().trim();
    const isMasterCoach = userEmail === "wildwolvescdmx@gmail.com" || userEmail === "ricardo@wildwolves.mx";

    // 2. CONTROL DE CUOTAS (3 CONSULTAS GRATUITAS MENSUALES PARA ALUMNOS Y TUTORES)
    let currentUsage = 1;
    let maxQueries = 3;

    if (!isMasterCoach) {
      if (user?.id) {
        // Consultar uso actual en perfil o metadatos
        const { data: prof } = await supabase
          .from("profiles")
          .select("ai_queries_used, ai_plan")
          .eq("id", user.id)
          .maybeSingle();

        if (prof?.ai_plan === "pro") maxQueries = 30;
        else if (prof?.ai_plan === "elite_familiar") maxQueries = 60;
        else maxQueries = 3;

        currentUsage = (prof?.ai_queries_used || 0) + 1;

        if (currentUsage > maxQueries) {
          return NextResponse.json({
            reply: `🐺 *Límite de Consultas Alcanzado*\n\nHas utilizado tus ${maxQueries} consultas gratuitas de este mes en Wild Wolves CDMX.\n\nPara desbloquear asesoría ilimitada 24/7 de mecánicas de tiro, rutinas de casa y preparación de Combine, consulta con el Head Coach Ricardo sobre la **Membresía Lobo Pro ($99 MXN/mes)** o el **Pack Familiar Élite ($149 MXN/mes)**.`,
            isExceeded: true,
          });
        }

        // Actualizar contador
        await supabase
          .from("profiles")
          .update({ ai_queries_used: currentUsage })
          .eq("id", user.id);
      }
    }

    const apiKey = process.env.GROQ_API_KEY;

    // 3. CANDADO TEMÁTICO DE SEGURIDAD (SOLO BALONCESTO, ENTRENAMIENTO, REGLAS Y NUTRICIÓN DEPORTIVA)
    const systemPrompt = `Eres "Lobo Mentor IA", el asesor deportivo oficial de la academia Wild Wolves CDMX (Deportivo Carmen Serdán) para atletas y tutores familiares.
CANDADO TEMÁTICO ESTRICTO:
- ÚNICAMENTE respondes sobre: básquetbol formativo, reglas FIBA, técnica de tiro, salto vertical, Batería 3x25, estiramientos, hidratación y prevención de lesiones deportivas.
- Si el usuario pregunta de temas ajenos a la academia o al baloncesto, responde amablemente que solo estás facultado para asesorar sobre el entrenamiento de Wild Wolves CDMX.
- Nivel de lenguaje: Motivador, claro, estructurado, profesional y pedagógico.
- Categoría de usuario: ${category === "guardian" ? "Tutor Familiar" : "Atleta Lobo"}.`;

    const activeModels = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "llama-3.1-70b-versatile"
    ];

    let reply = "";

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
        content: m.content || "",
      })),
    ];

    if (apiKey) {
      for (const model of activeModels) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: formattedMessages,
              temperature: 0.5,
              max_tokens: 800,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (text && text.trim()) {
              reply = text.trim();
              break;
            }
          }
        } catch (e) {
          console.warn(`Fallback modelo ${model}:`, e);
        }
      }
    }

    if (!reply) {
      reply = "Atleta Lobo, recuerda concentrarte en la alineación del codo y la muñeca al lanzar, manteniendo flexión en las rodillas. Para consultas detalladas de tu plan, acércate al Head Coach Ricardo en cancha.";
    }

    // Pie de página de consumo de cuotas obligatorio
    const remainingQueries = Math.max(0, maxQueries - currentUsage);
    if (!isMasterCoach) {
      reply += `\n\n━━━━━━━━━━━━━━━━━━━━━\n📊 *Estado de Consultas:* Has ocupado ${currentUsage} de ${maxQueries} consultas gratuitas de tu mes. Te quedan ${remainingQueries} disponibles.`;
    }

    return NextResponse.json({
      reply,
      usage: {
        used: currentUsage,
        total: maxQueries,
        remaining: remainingQueries,
      },
    });
  } catch (error: any) {
    console.error("Error en student-mentor-ai:", error);
    return NextResponse.json(
      {
        reply: "Atleta, ocurrió un detalle de conexión temporal. Intenta realizar tu consulta nuevamente en un momento.",
      },
      { status: 200 }
    );
  }
}
