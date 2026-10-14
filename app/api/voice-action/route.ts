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

    // Normalización de Fecha Local (CDMX) para evitar desfases UTC
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

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

    // B. Finanzas del día (pagos de hoy en fecha local CDMX)
    let incomeToday = 0;
    try {
      // 1) Intentar payment_transactions_history filtrando por transaction_date o created_at local
      const { data: histToday } = await supabase
        .from("payment_transactions_history")
        .select("amount_paid, transaction_date")
        .eq("transaction_date", today);

      if (histToday && histToday.length > 0) {
        incomeToday = histToday.reduce(
          (acc: number, curr: any) =>
            acc + Number(curr.amount_paid || 0),
          0
        );
      } else {
        // Fallback por rango de fecha en created_at
        const { data: histRange } = await supabase
          .from("payment_transactions_history")
          .select("amount_paid, created_at")
          .gte("created_at", `${today}T00:00:00.000Z`)
          .lte("created_at", `${today}T23:59:59.999Z`);

        if (histRange && histRange.length > 0) {
          incomeToday = histRange.reduce(
            (acc: number, curr: any) => acc + Number(curr.amount_paid || 0),
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
      }
    } catch (e) {
      console.warn("Aviso obteniendo pagos hoy:", e);
    }

    // C. Atletas con adeudo pendiente
    let athletesWithDebt = 0;
    try {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gt("current_debt_amount", 0);
      athletesWithDebt = count || 0;
    } catch (e) {
      console.warn("Aviso obteniendo atletas con adeudo:", e);
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
- Atletas con saldo o adeudo pendiente: ${athletesWithDebt}.

REGLAS DE ORO OBLIGATORIAS:
1. Responde de forma CONCISA, directa y marcial (MÁXIMO 25 PALABRAS).
2. Si el Coach solicita "corte de caja", "reporte de hoy", "cuánto he ganado" o resumen general, responde exactamente con esta estructura limpia:
   "Corte listo, Coach: Hemos cobrado $${incomeToday} pesos hoy, ${confirmedAthletes.length} atletas confirmados en cancha y ${athletesWithDebt} atletas con saldo pendiente."
3. NUNCA repitas la orden del Coach ni uses frases de relleno como "¿En qué más te puedo ayudar?".
4. Cero formato Markdown (sin asteriscos, numerales ni viñetas), ya que tu texto va directo a voz.
5. Mapeo de rutas para navegación:
   - "asistencia", "cancha", "quién vino", "pase de lista", "alumnos" -> "navigateTo": "/dashboard-coach"
   - "finanzas", "ingresos", "caja", "cuánto he ganado", "corte de caja", "dinero" -> "navigateTo": "/master-bunker-hq?tab=finanzas"
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
        lower.includes("corte") ||
        (lower.includes("reporte") && lower.includes("hoy")) ||
        lower.includes("cuanto he ganado") ||
        lower.includes("cuánto he ganado")
      ) {
        navTarget = "/master-bunker-hq?tab=finanzas";
        reply = `Corte listo, Coach: Hemos cobrado $${incomeToday} pesos hoy, ${confirmedAthletes.length} atletas confirmados en cancha y ${athletesWithDebt} atletas con saldo pendiente.`;
      } else if (
        lower.includes("quien") ||
        lower.includes("quién") ||
        lower.includes("asist") ||
        lower.includes("cancha") ||
        lower.includes("alumnos") ||
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
        const studentQueryName = parsed.action.studentName.trim();
        // Búsqueda flexible tolerante a acentos
        const { data: athletes } = await supabase
          .from("profiles")
          .select("id, full_name, current_debt_amount")
          .ilike("full_name", `%${studentQueryName}%`)
          .limit(5);

        // Si no encontró con acento o sin acento, intentar fallback
        let matched = athletes?.[0];
        if (!matched) {
          const stripped = studentQueryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const { data: allProfiles } = await supabase.from("profiles").select("id, full_name, current_debt_amount");
          matched = allProfiles?.find((p: any) => {
            const pNorm = (p.full_name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return pNorm.includes(stripped.toLowerCase());
          });
        }

        const athleteId = matched?.id;
        const currentDebt = Number(matched?.current_debt_amount || 0);

        if (athleteId) {
          if (parsed.action.status) {
            await supabase.from("daily_attendance").upsert(
              {
                student_id: athleteId,
                date: today,
                status: parsed.action.status,
              },
              { onConflict: "student_id,date" }
            );
          }

          const parsedAmount = Number(parsed.action.amount || 0);
          if (parsedAmount > 0) {
            const newDebt = Math.max(0, currentDebt - parsedAmount);

            // Inserción garantizada en historial de transacciones con fecha local CDMX
            await supabase.from("payment_transactions_history").insert({
              student_id: athleteId,
              amount_paid: parsedAmount,
              remaining_debt: newDebt,
              payment_method: "efectivo",
              concept: "Entrenamiento / Cuota",
              transaction_date: today,
            });

            // Descontar de inmediato el adeudo en profiles
            await supabase
              .from("profiles")
              .update({
                current_debt_amount: newDebt,
                financial_status: newDebt === 0 ? "al_corriente" : "abono_parcial",
                last_attended_at: today,
              })
              .eq("id", athleteId);
          }
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
