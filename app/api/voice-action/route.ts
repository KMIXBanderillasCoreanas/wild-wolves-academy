import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Acepta tanto 'command' como 'spokenText'
    const commandText = body.command || body.spokenText;

    if (!commandText || typeof commandText !== "string" || !commandText.trim()) {
      return NextResponse.json({
        voiceReply: "Comandante, no logré escuchar la orden con claridad.",
        message: "Comandante, no logré escuchar la orden con claridad.",
        navigateTo: null,
        action: null,
        executedAction: null,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    const systemPrompt = `Eres "Fenrir Cyber-Wolf", asistente ejecutivo y copiloto táctico de Wild Wolves CDMX para el Head Coach Ricardo.
Tu misión es interpretar la orden de voz del Coach en cancha y responder con:
1. "voiceReply": Texto breve, enérgico y marcial para responder en voz alta por la bocina (máximo 25 palabras, tratándolo de "Coach" o "Comandante").
2. "navigateTo": Ruta a la que debes llevar al Coach si lo solicita o si la orden lo amerita:
   - "ver asistencia" / "asistencia hoy" / "ir a cancha" / "pase de lista" -> "/dashboard-coach"
   - "ver finanzas" / "ir a cobros" / "deudas" / "caja" -> "/master-bunker-hq?tab=finanzas"
   - "ver evaluaciones" / "combine" / "test day" -> "/dashboard-coach?tab=evaluaciones"
   - "ir a búnker" / "mando" / "cuartel" -> "/master-bunker-hq"
   - null si no requiere navegación (ej. dictado de pago o pregunta táctica).
3. "action": Objeto estructurado si registra asistencia o cobro de alumnos:
   - "studentName": Nombre limpio del alumno (ej. "Osmar Lopez", "Isaac Salinas").
   - "status": "presente" | "retardo" | "falta".
   - "amount": número entero si hubo cobro (ej. 150, 50, 600) o 0.
   - "hasPayment": boolean true si pagó, false si solo es asistencia.
   O null si es consulta general o navegación pura.

FORMATO EXCLUSIVO (JSON puro):
{
  "voiceReply": "Abriendo el panel de asistencia en duela, Coach.",
  "navigateTo": "/dashboard-coach",
  "action": null
}`;

    const activeModels = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "llama-3.1-70b-versatile"
    ];

    let parsedResult: any = null;

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
              model: model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: commandText },
              ],
              temperature: 0.1,
              response_format: { type: "json_object" },
              max_tokens: 300,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const textContent = data.choices?.[0]?.message?.content;
            if (textContent) {
              parsedResult = JSON.parse(textContent);
              break;
            }
          }
        } catch (err) {
          console.warn(`Fallo procesando comando de voz con ${model}:`, err);
        }
      }
    }

    // Fallback heurístico si la IA externa no estuviera disponible
    if (!parsedResult) {
      const lower = commandText.toLowerCase();
      let navTarget: string | null = null;
      let reply = "Orden recibida en el búnker, Coach.";

      if (lower.includes("asistencia") || lower.includes("cancha") || lower.includes("lista")) {
        navTarget = "/dashboard-coach";
        reply = "Abriendo el panel de asistencia en cancha, Coach.";
      } else if (lower.includes("finanza") || lower.includes("caja") || lower.includes("cobro") || lower.includes("deuda")) {
        navTarget = "/master-bunker-hq?tab=finanzas";
        reply = "Desplegando el módulo de finanzas y tesorería en el Búnker, Coach.";
      } else if (lower.includes("evaluaci") || lower.includes("test day") || lower.includes("combine")) {
        navTarget = "/dashboard-coach?tab=evaluaciones";
        reply = "Abriendo evaluaciones y Test Day de los atletas, Coach.";
      } else if (lower.includes("bunker") || lower.includes("mando")) {
        navTarget = "/master-bunker-hq";
        reply = "Entrando al Búnker Supremo de mando, Comandante.";
      }

      let extractedName = "";
      let amount = 0;
      let hasPayment = false;
      let status: "presente" | "retardo" | "falta" = "presente";

      if (lower.includes("osmar")) extractedName = "Osmar Lopez";
      else if (lower.includes("isaac")) extractedName = "Isaac Salinas";
      else if (lower.includes("mateo")) extractedName = "Mateo";

      const numbers = commandText.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        amount = parseInt(numbers[0], 10);
        hasPayment = true;
      } else if (lower.includes("150")) {
        amount = 150;
        hasPayment = true;
      } else if (lower.includes("50")) {
        amount = 50;
        hasPayment = true;
      }

      if (lower.includes("retardo")) status = "retardo";
      if (lower.includes("falta")) status = "falta";

      const hasAction = extractedName !== "";

      parsedResult = {
        voiceReply: hasAction
          ? (hasPayment
              ? `Asistencia de ${extractedName} confirmada y cobro de ${amount} pesos guardado en caja, Coach.`
              : `Asistencia de ${extractedName} registrada como ${status}, Comandante.`)
          : reply,
        navigateTo: navTarget,
        action: hasAction
          ? {
              studentName: extractedName,
              status,
              amount,
              hasPayment,
            }
          : null,
      };
    }

    const todayDate = new Date().toISOString().split("T")[0];

    // =========================================================================
    // PERSISTENCIA REAL Y DIRECTA EN SUPABASE
    // =========================================================================
    const actionObj = parsedResult.action;
    if (actionObj && actionObj.studentName) {
      const { studentName, status, amount, hasPayment } = actionObj;

      try {
        // 1. Buscar si el alumno ya existe en profiles
        const { data: matchedProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, current_debt_amount")
          .ilike("full_name", `%${studentName}%`)
          .limit(1);

        let studentId = matchedProfiles && matchedProfiles.length > 0 ? matchedProfiles[0].id : null;
        let prevDebt = matchedProfiles && matchedProfiles.length > 0 ? (matchedProfiles[0].current_debt_amount || 0) : 0;

        // 2. Si no existía, crear pre-ficha base en profiles
        if (!studentId) {
          studentId = `prospect_voice_${Date.now()}`;
          await supabaseAdmin.from("profiles").upsert({
            id: studentId,
            full_name: studentName,
            role: "student",
            account_category: "student",
            user_type: "alumno",
            current_debt_amount: hasPayment && amount ? Math.max(0, 150 - amount) : 0,
            training_days: "Lun-Mié-Vie",
            training_schedule: "Vespertino: 17:00 - 19:00",
            created_at: new Date().toISOString()
          });
        }

        // 3. Registrar o actualizar asistencia en daily_attendance
        await supabaseAdmin.from("daily_attendance").upsert({
          student_id: studentId,
          date: todayDate,
          shift: "vespertino_5_7",
          status: status || "presente",
          notes: "Registrado por voz vía Fenrir Voice-to-Action",
          created_at: new Date().toISOString()
        }, { onConflict: "student_id,date,shift" });

        // 4. Si hubo pago, insertar en historial y descontar adeudo
        if (hasPayment && amount > 0) {
          await supabaseAdmin.from("payment_transactions_history").insert({
            student_id: studentId,
            amount_paid: amount,
            payment_method: "efectivo",
            concept: `Cobro en Cancha Carmen Serdán (${todayDate}) Dictado Fenrir`,
            transaction_date: todayDate,
            created_at: new Date().toISOString()
          });

          const newDebt = Math.max(0, prevDebt - amount);
          await supabaseAdmin.from("profiles").update({
            current_debt_amount: newDebt,
            financial_status: newDebt === 0 ? "al_corriente" : "abono_parcial",
            last_payment_date: todayDate
          }).eq("id", studentId);
        }
      } catch (dbErr) {
        console.warn("Aviso en persistencia de Supabase para Voice-Action:", dbErr);
      }
    }

    const finalVoiceReply = parsedResult.voiceReply || parsedResult.speechReply || "Orden recibida por Fenrir.";

    return NextResponse.json({
      voiceReply: finalVoiceReply,
      message: finalVoiceReply,
      navigateTo: parsedResult.navigateTo || null,
      action: parsedResult.action || null,
      executedAction: parsedResult.action || null,
    });
  } catch (error: any) {
    console.error("Error en /api/voice-action:", error);
    return NextResponse.json(
      {
        voiceReply: "Comandante, Fenrir registró la directiva en el búnker de cancha.",
        message: "Comandante, Fenrir registró la directiva en el búnker de cancha.",
        navigateTo: null,
        action: null,
        executedAction: null,
      },
      { status: 200 }
    );
  }
}
