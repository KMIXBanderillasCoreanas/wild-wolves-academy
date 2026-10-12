// app/api/voice-action/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const spokenText = body.spokenText || body.command || "";

    if (!spokenText.trim()) {
      return NextResponse.json({
        voiceReply: "Comandante, no logré escuchar la orden.",
        navigateTo: null,
        action: null,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    const systemPrompt = `Eres "Fenrir", el copiloto ejecutivo del Head Coach Ricardo en Wild Wolves CDMX.
Misión: Interpretar órdenes en duela y responder en JSON puro.
Reglas de mapeo de rutas:
- Si pide ver asistencia, pase de lista o cancha: "navigateTo": "/dashboard-coach"
- Si pide ver finanzas, caja o cobros: "navigateTo": "/master-bunker-hq?tab=finanzas"
- Si pide ver búnker, dirección o mando: "navigateTo": "/master-bunker-hq"
- Si pide ver evaluaciones o test day: "navigateTo": "/dashboard-coach?tab=evaluaciones"
- Si es solo una orden de cobro, asistencia o pregunta sin cambio de pantalla: "navigateTo": null
Reglas de voz:
- "voiceReply": Máximo 20 palabras. Lenguaje directo y marcial. Sin markdown ni asteriscos.

ESQUEMA OBLIGATORIO (JSON puro):
{
  "voiceReply": "Texto directo para hablar en voz alta",
  "navigateTo": "/dashboard-coach" | "/master-bunker-hq?tab=finanzas" | "/master-bunker-hq" | "/dashboard-coach?tab=evaluaciones" | null,
  "action": {
    "studentName": string | null,
    "status": "presente" | "falta" | null,
    "amount": number | null,
    "hasPayment": boolean
  }
}`;

    const activeModels = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "llama-3.1-70b-versatile"
    ];

    let parsed: any = null;

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
                { role: "user", content: spokenText },
              ],
              temperature: 0.1,
              response_format: { type: "json_object" },
              max_tokens: 250,
            }),
          });

          if (res.ok) {
            const groqData = await res.json();
            const rawContent = groqData.choices?.[0]?.message?.content;
            if (rawContent) {
              parsed = JSON.parse(rawContent);
              break;
            }
          }
        } catch (err) {
          console.warn(`Aviso modelo ${model}:`, err);
        }
      }
    }

    // Respaldo heurístico de duela
    if (!parsed) {
      const lower = spokenText.toLowerCase();
      let navTarget: string | null = null;
      let reply = "Orden registrada en duela, Coach.";

      if (lower.includes("asistencia") || lower.includes("cancha") || lower.includes("lista")) {
        navTarget = "/dashboard-coach";
        reply = "Abriendo el panel de asistencia en cancha, Coach.";
      } else if (lower.includes("finanza") || lower.includes("caja") || lower.includes("cobro") || lower.includes("deuda")) {
        navTarget = "/master-bunker-hq?tab=finanzas";
        reply = "Abriendo módulo de finanzas en el Búnker, Coach.";
      } else if (lower.includes("evaluaci") || lower.includes("test day")) {
        navTarget = "/dashboard-coach?tab=evaluaciones";
        reply = "Abriendo evaluaciones y Test Day, Coach.";
      } else if (lower.includes("bunker") || lower.includes("mando")) {
        navTarget = "/master-bunker-hq";
        reply = "Entrando al Búnker Central de Dirección, Comandante.";
      }

      let studentName: string | null = null;
      let amount: number | null = null;
      let hasPayment = false;
      let status: "presente" | "falta" | null = null;

      if (lower.includes("osmar")) studentName = "Osmar Lopez";
      else if (lower.includes("isaac")) studentName = "Isaac Salinas";
      else if (lower.includes("mateo")) studentName = "Mateo";

      const numbers = spokenText.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        amount = parseInt(numbers[0], 10);
        hasPayment = true;
      }

      if (lower.includes("presente") || lower.includes("vino")) status = "presente";
      if (lower.includes("falta") || lower.includes("no vino")) status = "falta";

      if (studentName) {
        reply = hasPayment
          ? `Asistencia de ${studentName} guardada y cobro de ${amount} pesos registrado.`
          : `Asistencia de ${studentName} registrada como ${status || "presente"}.`;
      }

      parsed = {
        voiceReply: reply,
        navigateTo: navTarget,
        action: studentName ? { studentName, status: status || "presente", amount, hasPayment } : null,
      };
    }

    // Persistencia directa en Supabase
    if (parsed.action?.studentName) {
      try {
        const cookieStore = cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
        );

        const today = new Date().toISOString().split("T")[0];

        const { data: athletes } = await supabase
          .from("profiles")
          .select("id, current_debt_amount")
          .ilike("full_name", `%${parsed.action.studentName}%`)
          .limit(1);

        let athleteId = athletes?.[0]?.id;
        const currentDebt = athletes?.[0]?.current_debt_amount || 0;

        // Si es atleta nuevo en duela, crear pre-ficha
        if (!athleteId) {
          athleteId = `voice_${Date.now()}`;
          await supabase.from("profiles").upsert({
            id: athleteId,
            full_name: parsed.action.studentName,
            role: "student",
            current_debt_amount: parsed.action.hasPayment && parsed.action.amount ? Math.max(0, 150 - parsed.action.amount) : 0,
            created_at: new Date().toISOString(),
          });
        }

        // Registrar asistencia
        if (parsed.action.status) {
          await supabase.from("daily_attendance").upsert({
            student_id: athleteId,
            date: today,
            shift: "vespertino_5_7",
            status: parsed.action.status,
            notes: "Registrado por voz Fenrir",
            created_at: new Date().toISOString(),
          }, { onConflict: "student_id,date,shift" });
        }

        // Registrar cobro y reducir deuda
        if (parsed.action.amount && parsed.action.amount > 0) {
          await supabase.from("payment_transactions_history").insert({
            student_id: athleteId,
            amount_paid: parsed.action.amount,
            payment_method: "efectivo",
            concept: `Cobro en Cancha (${today}) Dictado Fenrir`,
            transaction_date: today,
            created_at: new Date().toISOString(),
          });

          await supabase
            .from("profiles")
            .update({
              current_debt_amount: Math.max(0, currentDebt - parsed.action.amount),
              last_payment_date: today,
            })
            .eq("id", athleteId);
        }
      } catch (dbErr) {
        console.warn("Aviso en guardado Supabase:", dbErr);
      }
    }

    // Normalizar texto limpio sin Markdown
    const cleanVoiceReply = (parsed.voiceReply || "Orden recibida por Fenrir.")
      .replace(/[*#_`~]/g, "")
      .trim();

    return NextResponse.json({
      voiceReply: cleanVoiceReply,
      message: cleanVoiceReply,
      navigateTo: parsed.navigateTo || null,
      action: parsed.action || null,
    });
  } catch (error: any) {
    console.error("Error en /api/voice-action:", error);
    return NextResponse.json({
      voiceReply: "Orden no procesada. Verifica conexión.",
      navigateTo: null,
      action: null,
    });
  }
}
