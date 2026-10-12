// app/api/voice-action/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const GROQ_KEY = process.env.GROQ_API_KEY || "";

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

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const today = new Date().toISOString().split("T")[0];

    // 1. OBTENER MÉTRICAS VIVAS DE SUPABASE
    // A. Asistencias de hoy (presentes)
    let confirmedAthletes: string[] = [];
    try {
      let attendanceToday: any[] = [];
      const { data: attData, error: attErr } = await supabase
        .from("daily_attendance")
        .select("status, student_id, profiles(full_name)")
        .or(`date.eq.${today},attendance_date.eq.${today}`);

      if (!attErr && attData) {
        attendanceToday = attData as any[];
      } else {
        const resDate = await supabase
          .from("daily_attendance")
          .select("status, student_id")
          .eq("date", today);
        attendanceToday = (resDate.data as any[]) || [];
      }

      const presentRecords = attendanceToday.filter(
        (a: any) => a.status === "presente"
      );

      // Si profiles no vino embebido o viene como array/objeto
      for (const rec of presentRecords) {
        if (rec.profiles?.full_name) {
          confirmedAthletes.push(rec.profiles.full_name);
        } else if (rec.student_id) {
          const { data: p } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", rec.student_id)
            .single();
          if (p?.full_name) confirmedAthletes.push(p.full_name);
        }
      }
    } catch (e) {
      console.warn("Aviso obteniendo asistencia hoy:", e);
    }

    // B. Finanzas del día (pagos de hoy)
    let incomeToday = 0;
    try {
      // 1) Intentar payment_transactions_history
      const { data: histToday } = await supabase
        .from("payment_transactions_history")
        .select("amount_paid, amount, created_at")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lte("created_at", `${today}T23:59:59.999Z`);

      if (histToday && histToday.length > 0) {
        incomeToday = histToday.reduce(
          (acc: number, curr: any) =>
            acc + Number(curr.amount_paid || curr.amount || 0),
          0
        );
      } else {
        // 2) Fallback con membership_payments si no hay en historial
        const { data: memPayments } = await supabase
          .from("membership_payments")
          .select("amount, status")
          .eq("payment_date", today)
          .eq("status", "pagado");

        if (memPayments && memPayments.length > 0) {
          incomeToday = memPayments.reduce(
            (acc: number, curr: any) => acc + Number(curr.amount || 0),
            0
          );
        }
      }
    } catch (e) {
      console.warn("Aviso obteniendo pagos hoy:", e);
    }

    // 2. CONTEXTO OPERATIVO INYECTADO A GROQ
    const systemPrompt = `Eres "Fenrir Cyber-Wolf", asistente ejecutivo exclusivo del Head Coach Ricardo en Wild Wolves CDMX.
MÉTRICAS VIVAS DE HOY (${today}):
- Atletas confirmados hoy: ${
      confirmedAthletes.length > 0
        ? confirmedAthletes.join(", ")
        : "Ninguno registrado aún"
    } (Total: ${confirmedAthletes.length}).
- Ingresos cobrados hoy en caja: $${incomeToday} MXN.

REGLAS DE ORO OBLIGATORIAS:
1. Responde de forma CONCISA, directa y marcial (MÁXIMO 20 PALABRAS).
2. NUNCA repitas la orden del Coach ni uses frases de relleno como "¿En qué más te puedo ayudar?".
3. Cero formato Markdown (sin asteriscos, guiones ni numerales), ya que tu texto va directo a voz.
4. Mapeo de rutas para navegación:
   - "asistencia", "cancha", "quién vino", "pase de lista" -> "navigateTo": "/dashboard-coach"
   - "finanzas", "ingresos", "caja", "cuánto he ganado", "cuánto dinero" -> "navigateTo": "/master-bunker-hq?tab=finanzas"
   - "búnker", "dirección", "mando central" -> "navigateTo": "/master-bunker-hq"
   - "evaluaciones", "test day" -> "navigateTo": "/dashboard-coach?tab=evaluaciones"
   - Si no requiere cambiar de pantalla -> "navigateTo": null

ESQUEMA JSON PURO OBLIGATORIO:
{
  "voiceReply": "Texto exacto para hablar en voz alta",
  "navigateTo": string | null,
  "action": {
    "studentName": string | null,
    "status": "presente" | "falta" | null,
    "amount": number | null
  }
}`;

    const modelsToTry = [
      "llama-3.1-70b-versatile",
      "llama-3.3-70b-versatile",
      "qwen/qwen3.8-27b",
    ];

    let parsed: any = null;

    for (const model of modelsToTry) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
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
          }),
        });

        if (res.ok) {
          const groqData = await res.json();
          const raw = groqData.choices?.[0]?.message?.content || "{}";
          parsed = JSON.parse(raw);
          break;
        }
      } catch (err) {
        console.warn(`Intento con modelo ${model} falló:`, err);
      }
    }

    // Respaldo heurístico en caso de falla de API externa
    if (!parsed || !parsed.voiceReply) {
      const lower = spokenText.toLowerCase();
      let navTarget: string | null = null;
      let reply = "Orden recibida en duela, Coach.";

      if (
        lower.includes("quien") ||
        lower.includes("quién") ||
        lower.includes("asist") ||
        lower.includes("cancha") ||
        lower.includes("lista")
      ) {
        navTarget = "/dashboard-coach";
        reply =
          confirmedAthletes.length > 0
            ? `Hoy confirmaron ${confirmedAthletes.length} atletas: ${confirmedAthletes.slice(0, 3).join(", ")}.`
            : "No hay atletas confirmados hoy aún, Coach.";
      } else if (
        lower.includes("finanz") ||
        lower.includes("caja") ||
        lower.includes("ingreso") ||
        lower.includes("cobro") ||
        lower.includes("dinero") ||
        lower.includes("generado") ||
        lower.includes("ganado")
      ) {
        navTarget = "/master-bunker-hq?tab=finanzas";
        reply = `Hoy se han cobrado ${incomeToday} pesos en caja, Coach.`;
      } else if (lower.includes("bunker") || lower.includes("mando")) {
        navTarget = "/master-bunker-hq";
        reply = "Entrando al Búnker Central de Mando.";
      }

      parsed = {
        voiceReply: reply,
        navigateTo: navTarget,
        action: null,
      };
    }

    // 3. PERSISTENCIA EN DUELA (Si dictó asistencia o cobro de algún alumno)
    if (parsed.action?.studentName) {
      try {
        const { data: athletes } = await supabase
          .from("profiles")
          .select("id, current_debt_amount")
          .ilike("full_name", `%${parsed.action.studentName}%`)
          .limit(1);

        let athleteId = athletes?.[0]?.id;
        const currentDebt = athletes?.[0]?.current_debt_amount || 0;

        if (!athleteId) {
          athleteId = `voice_${Date.now()}`;
          await supabase.from("profiles").upsert({
            id: athleteId,
            full_name: parsed.action.studentName,
            role: "student",
            current_debt_amount:
              parsed.action.amount && parsed.action.amount > 0
                ? Math.max(0, 150 - parsed.action.amount)
                : 0,
            created_at: new Date().toISOString(),
          });
        }

        if (parsed.action.status) {
          await supabase.from("daily_attendance").upsert(
            {
              student_id: athleteId,
              date: today,
              shift: "vespertino_5_7",
              status: parsed.action.status,
              notes: "Registrado por voz Fenrir",
            },
            { onConflict: "student_id,date,shift" }
          );
        }

        if (parsed.action.amount && parsed.action.amount > 0) {
          await supabase.from("payment_transactions_history").insert({
            student_id: athleteId,
            amount_paid: parsed.action.amount,
            previous_debt: currentDebt,
            remaining_debt: Math.max(0, currentDebt - parsed.action.amount),
            payment_method: "efectivo",
            transaction_type:
              currentDebt - parsed.action.amount <= 0 ? "pago_completo" : "abono",
            venue: "Deportivo Carmen Serdán",
            notes: `Cobro en Cancha Dictado Fenrir (${today})`,
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
        console.warn("Aviso persistiendo acción en Supabase:", dbErr);
      }
    }

    const cleanVoiceReply = (parsed.voiceReply || "Orden procesada, Coach.")
      .replace(/[*#_`~]/g, "")
      .trim();

    return NextResponse.json({
      voiceReply: cleanVoiceReply,
      navigateTo: parsed.navigateTo || null,
      action: parsed.action || null,
    });
  } catch (error: any) {
    console.error("Error en voice-action:", error);
    return NextResponse.json({
      voiceReply: "Orden no procesada. Repite el comando, Coach.",
      navigateTo: null,
      action: null,
    });
  }
}
