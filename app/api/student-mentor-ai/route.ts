import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { evaluarSeguridadPeticion } from "@/lib/lobo-centinela-guard";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();

    // Blindaje Lobo Centinela
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "student_mentor_ai",
      payloadContent: body
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon, code: sec.codigoBloqueo }, { status: 403 });
    }

    const { messages, category = "student" } = body;

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

    // 1. OBTENER USUARIO ACTUAL
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = (user?.email || "").toLowerCase().trim();
    const isMasterCoach = userEmail === "wildwolvescdmx@gmail.com" || userEmail === "ricardo@wildwolves.mx";

    // 2. CONTROL DE CUOTAS RIGUROSO (5 CONSULTAS MENSUALES FREE, 50 LOBO PRO, 100 FAMILIAR ÉLITE)
    let currentUsage = 1;
    let maxQueries = 5;

    if (!isMasterCoach) {
      if (user?.id) {
        // Consultar uso actual en perfil o metadatos
        const { data: prof } = await supabase
          .from("profiles")
          .select("ai_queries_used, ai_plan")
          .eq("id", user.id)
          .maybeSingle();

        if (prof?.ai_plan === "pro" || prof?.ai_plan === "standard_99") {
          maxQueries = 50;
        } else if (prof?.ai_plan === "elite_familiar" || prof?.ai_plan === "family_199") {
          maxQueries = 100;
        } else {
          maxQueries = 5; // Plan Free / Invitado
        }

        currentUsage = (prof?.ai_queries_used || 0) + 1;

        if (currentUsage > maxQueries) {
          const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
            `Hola Coach Ricardo, alcancé mi límite mensual de ${maxQueries} consultas de IA en Wild Wolves CDMX. Quisiera activar mi suscripción Lobo Pro ($99 MXN) o Pack Familiar Élite ($149 MXN).`
          )}`;

          return NextResponse.json({
            reply: `🐺 *Límite Mensual de Consultas de IA Alcanzado*\n\nHas consumido tus **${maxQueries} consultas disponibles** de este mes en Wild Wolves CDMX.\n\nPara desbloquear análisis continuo de mecánicas de tiro, corrección biomecánica y preparación táctica, activa tu plan con el Head Coach Ricardo en duela:\n\n• **Atleta Lobo Pro ($99 MXN/mes):** 50 consultas + módulo de biomecánica de tiro.\n• **Pack Familiar Élite ($149 MXN/mes):** 100 consultas compartidas + reportes detallados para tutores.`,
            isExceeded: true,
            whatsappUrl: coachWhatsAppUrl,
            used: currentUsage - 1,
            max: maxQueries
          });
        }

        // Actualizar contador en profiles
        await supabase
          .from("profiles")
          .update({ ai_queries_used: currentUsage })
          .eq("id", user.id);
      }
    }

    const apiKey = process.env.GROQ_API_KEY;

    // 3. CANDADO TEMÁTICO DE SEGURIDAD Y MANUALES DE REFERENCIA OFICIALES (REFERENCE BOOKS)
    const systemPrompt = `Eres "Lobo Mentor IA", el asesor deportivo oficial de la academia Wild Wolves CDMX (Deportivo Carmen Serdán) para atletas y tutores familiares.
CANDADO TEMÁTICO ESTRICTO:
- ÚNICAMENTE respondes sobre: básquetbol formativo, reglas FIBA, técnica de tiro, salto vertical, series de entrenamiento 3x25, estiramientos, preparación física oficial, nutrición e hidratación de duela y prevención de lesiones deportivas.
- Si el usuario pregunta de temas ajenos a la academia o al baloncesto, responde amablemente que solo estás facultado para asesorar sobre el entrenamiento de Wild Wolves CDMX.
- Nivel de lenguaje: Motivador, claro, estructurado, profesional y pedagógico.
- Categoría de usuario: ${category === "guardian" ? "Tutor Familiar" : "Atleta Lobo"}.

MANUAL DE PREPARACIÓN FÍSICA OFICIAL (DEPORTIVO CARMEN SERDÁN):
- Enfoque: Entrenamiento al aire libre en las duelas y canchas del Deportivo Carmen Serdán.
- Equipamiento base permitido: Peso corporal (calistenia), mancuernas ligeras de 2 kg y bandas o poleas de resistencia de 2 kg.
- Tren Inferior (Salto y Explosividad): Sentadillas estáticas en pared (Wall-sits a 60°-90°), desplantes caminando, saltos pliométricos con recepción controlada punta-planta-talón y elevaciones de pantorrilla a una pierna.
- Core y Estabilidad: Plancha abdominal frontal y lateral (tiempo bajo tensión de 30-45s), elevaciones de piernas y dead bugs para estabilidad lumbopélvica.
- Tren Superior (Mancuernas 2 kg / Bandas): Press militar ligero, elevaciones laterales, curl de bíceps con banda/polea y extensiones de tríceps para el tiro.

GUÍA OFICIAL DE NUTRICIÓN E HIDRATACIÓN (DIRECTRIZ ESTRICTA):
Para orientar sobre alimentos y líquidos recomendados, utiliza EXCLUSIVAMENTE estos lineamientos oficiales:
1. Agua Natural: Consumo base y obligatorio antes, durante y después de los entrenamientos (turnos matutino 09:00–11:00 y vespertino 17:00–19:00).
2. Bebidas Electrolíticas Caseras / Refresher Naturales: Recomienda opciones ricas en minerales naturales (agua con pizca de sal marina, jugo de limón y toque de miel natural, o electrolitos limpios sin exceso de azúcares procesados ni colorantes) para evitar calambres y deshidratación en duela exterior.
3. Snacks Pre-Entrenamiento (45 min antes): Alimentos de rápida y fácil digestión: plátano maduro con crema de cacahuate o miel, avena ligera cocida en agua o fruta de temporada. Nunca aconsejes frituras, grasas saturadas o lácteos pesados antes del entrenamiento.
4. Recuperación Post-Entrenamiento (30-60 min): Proteínas de alta calidad (pollo, huevo, atún, queso panela, legumbres) combinadas con carbohidratos complejos (arroz, avena, tortillas de maíz, papa) para reparar fibras musculares.`;

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

    const nvidiaKey = process.env.NVIDIA_API_KEY;

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

    // 4. RESPALDO CON NVIDIA NIM GRATUITO (DeepSeek v4.1 Flash o Llama 3.2 90B)
    if (!reply && nvidiaKey) {
      const nvidiaModels = [
        "deepseek-ai/deepseek-v4.1-flash",
        "meta/llama-3.2-90b-vision-instruct"
      ];
      for (const nvModel of nvidiaModels) {
        try {
          const nvRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: nvModel,
              messages: formattedMessages,
              temperature: 0.4,
              max_tokens: 700,
            }),
          });

          if (nvRes.ok) {
            const nvData = await nvRes.json();
            const nvText = nvData.choices?.[0]?.message?.content;
            if (nvText && nvText.trim()) {
              reply = nvText.trim();
              break;
            }
          }
        } catch (nvErr) {
          console.warn(`Fallback NVIDIA modelo ${nvModel}:`, nvErr);
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
