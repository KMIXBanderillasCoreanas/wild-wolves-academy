import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

// Función para clasificar categoría por edad automáticamente
function getCategoryByAge(age?: number): string {
  if (!age || isNaN(age)) return "U-15 FORMATIVO (12-14 AÑOS)";
  if (age <= 9) return "U-10 MINI WOLVES (7-9 AÑOS)";
  if (age <= 11) return "U-12 PASARELA (10-11 AÑOS)";
  if (age <= 14) return "U-15 FORMATIVO (12-14 AÑOS)";
  if (age <= 16) return "U-17 COMPETITIVO (15-16 AÑOS)";
  if (age <= 19) return "U-20 JUVENIL / ÉLITE (17-19 AÑOS)";
  return "ADULTOS LIBRES (+20 AÑOS)";
}

export async function POST(req: Request) {
  try {
    const { messages, contextData, customContext, userRole = "coach", userPlan = "free" } = await req.json();
    const rawKey = process.env.GROQ_API_KEY || "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    const isCoach = userRole === "coach" || userRole === "superadmin";
    const monthlyMax = isCoach ? 9999 : userPlan === "elite_familiar" ? 60 : userPlan === "pro" ? 30 : 3;
    const currentUsed = (customContext?.usedQueries ?? contextData?.usedQueries ?? 1);
    const remaining = Math.max(0, monthlyMax - currentUsed);

    // Detección de última instrucción del Coach para comandos ejecutivos
    const lastUserMsg = [...(messages || [])].reverse().find((m: any) => m.role === "user")?.content || "";
    const lowerUserMsg = lastUserMsg.toLowerCase().trim();

    const supabase = getAdminSupabase();

    // 1. COMANDO ACCIONABLE: AGREGAR ALUMNO POR NOMBRE (Ej: "Agrega a Bruno Díaz" o "Registra a Mateo de 13 años")
    if (
      isCoach &&
      (lowerUserMsg.startsWith("agrega a ") ||
       lowerUserMsg.startsWith("agregar a ") ||
       lowerUserMsg.startsWith("registra a ") ||
       lowerUserMsg.startsWith("registrar a ") ||
       lowerUserMsg.startsWith("crea al alumno ") ||
       lowerUserMsg.includes("agrega un alumno"))
    ) {
      let rawName = lastUserMsg
        .replace(/^(agrega a|agregar a|registra a|registrar a|crea al alumno|agrega un alumno)/i, "")
        .replace(/\b(de \d+ años|con \d+ años|\d+ años)\b/i, "")
        .trim();

      // Extraer edad si la mencionó (ej. "de 13 años")
      const ageMatch = lastUserMsg.match(/(\d+)\s*años/i);
      const extractedAge = ageMatch ? parseInt(ageMatch[1], 10) : 13;
      const category = getCategoryByAge(extractedAge);

      // Si el nombre quedó vacío o genérico
      if (!rawName) rawName = "Nuevo Atleta Wild Wolves";

      // Validar homónimos en la base de datos (Ej: Bruno Díaz vs Bruno Sánchez)
      const { data: existingAthletes } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .ilike("full_name", `%${rawName.split(" ")[0]}%`);

      const newId = `prospect_${Date.now()}`;
      const newAthleteRow = {
        id: newId,
        full_name: rawName,
        category,
        training_days: ["martes", "jueves", "sabado"],
        training_schedule: "Vespertino: 17:00 - 19:00",
        financial_status: "al_corriente",
        debt_amount: 0,
        current_tier: "principiante",
        notes: `Registrado por comando directo de IA solicitado por el Coach Ricardo. Edad: ${extractedAge} años.`
      };

      await supabase.from("prospect_athletes").upsert(newAthleteRow);

      let replyMsg = `🐺 **¡Misión cumplida, Coach Ricardo!** He dado de alta en la duela a **${rawName}**.\n\n` +
        `• **Categoría Asignada:** ${category} (${extractedAge} años)\n` +
        `• **Días Sugeridos:** Martes, Jueves y Sábado (17:00 - 19:00)\n` +
        `• **Estatus Financiero:** Al Corriente ($0 adeudo)\n\n`;

      if (existingAthletes && existingAthletes.length > 0) {
        replyMsg += `⚠️ *Nota de Homónimos:* Encontré coincidencias similares en la manada: ${existingAthletes.map(a => `**${a.full_name}**`).join(", ")}. He registrado a **${rawName}** con expediente independiente para evitar confusiones.`;
      }

      return NextResponse.json({
        reply: replyMsg,
        actionExecuted: {
          type: "ATHLETE_CREATED",
          athlete: newAthleteRow
        }
      });
    }

    // 2. COMANDO ACCIONABLE: PERDONAR ADEUDO (Ej: "Perdónale la deuda a Bruno" o "Condonar deuda de Bruno Sánchez")
    if (
      isCoach &&
      (lowerUserMsg.includes("perdona") || lowerUserMsg.includes("perdonale") || lowerUserMsg.includes("condonar")) &&
      (lowerUserMsg.includes("deuda") || lowerUserMsg.includes("adeudo"))
    ) {
      // Buscar al atleta mencionado en el mensaje
      const { data: athletesWithDebt } = await supabase
        .from("profiles")
        .select("id, full_name, current_debt_amount")
        .gt("current_debt_amount", 0);

      const targetAthlete = athletesWithDebt?.find((a: any) => 
        lowerUserMsg.includes(a.full_name.toLowerCase()) || 
        a.full_name.toLowerCase().split(" ").some((part: string) => part.length > 2 && lowerUserMsg.includes(part))
      );

      if (targetAthlete) {
        const todayDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
        await supabase.from("profiles").update({
          current_debt_amount: 0,
          financial_status: "al_corriente"
        }).eq("id", targetAthlete.id);

        await supabase.from("payment_transactions_history").insert({
          student_id: targetAthlete.id,
          amount_paid: 0,
          remaining_debt: 0,
          payment_method: "cortesia",
          concept: `Adeudo condonado por orden del Coach Ricardo vía IA (${todayDate})`,
          transaction_date: todayDate,
          created_at: new Date().toISOString()
        });

        return NextResponse.json({
          reply: `🐺 **Entendido, Coach Ricardo.** He condonado y perdonado el adeudo de **$${targetAthlete.current_debt_amount} MXN** a **${targetAthlete.full_name}**.\n\nSu cuenta ahora figura como **Al Corriente ($0 Adeudo)** y se asentó en la bitácora de caja como cortesía autorizada de Dirección General.`
        });
      }
    }

    // Directrices del Asistente
    const roleSystemDirective = `ROL: "Lobo Táctico IA • Mentor y Especialista Deportivo Total del Head Coach Ricardo".
Misión y Alcance Completo:
1. CONSULTAS DE CUALQUIER TEMA TÉCNICO:
   - Estás 100% abierto a responder cualquier tema que pregunte el Coach Ricardo sin restricciones:
     * Nutrición deportiva para basquetbolistas, hidratación y electrolitos.
     * Protocolos de descanso, sueño profundo y recuperación del sistema nervioso central (SNC).
     * Ejercicios pliométricos y biomecánicos específicos para salto vertical (fase excéntrica, cuádriceps, glúteo y gemelos).
     * Salto de longitud y transferencia de potencia horizontal a vertical.
     * Ejercicios de velocidad pura, arranques de atletismo (primer paso explosivo, triple extensión).
2. TÁCTICA FRENTE A RIVALES MÁS ALTOS:
   - Si el atleta mide 1.76m (como Bruno Díaz) y se enfrenta a defensores de más de 1.85m, dosifica:
     * Reducción de Release Time (<0.65s).
     * Aumento del arco de tiro a más de 50 grados.
     * Uso de step-backs, flotadoras (teardrops) y fintas en penetración.
3. PRECISIÓN DE ALTA VELOCIDAD Y MUÑEQUEO (HIGH-SPEED MOTION):
   - Considera la micro-cinemática: en atletas veloces, el quiebre de muñeca (follow-through) ocurre en milisegundos. Detalla cómo mantener los dedos apuntando al aro ("meter la mano en el tarro de galletas") y no bajar el brazo antes de que el balón cruce la red.
4. GENERACIÓN DE RUTINAS COMPLETAS PARA EXPORTAR:
   - Cuando el Coach Ricardo te pida una rutina (ej. "dame una rutina completa de salto vertical para enviar"), entrégale un desglose estructurado con series, repeticiones, descansos y consejos biomecánicos listo para compartir.
5. TONO: Profesional, científico, riguroso, directo y leal al Head Coach Ricardo y a Wild Wolves CDMX (Deportivo Carmen Serdán).`;

    const systemPrompt = `Eres el núcleo de Inteligencia Artificial especializada de Wild Wolves CDMX (Sede: Deportivo Carmen Serdán).
${roleSystemDirective}

Directrices Generales:
- Idioma: Español (México).
- Contexto deportivo actual: ${JSON.stringify(contextData || customContext || {})}`;

    const activeModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b"
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
            break;
          }
        } else {
          const errText = await groqResponse.text();
          lastError = errText;
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!reply) {
      reply = "Coach Ricardo, indicación procesada por el núcleo de seguridad local. ¿En qué más puedo apoyarte en la duela?";
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
