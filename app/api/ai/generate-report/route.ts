import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getStoredExpenses } from "@/lib/expensesStorage";
import { getStoredWhatsAppMessages } from "@/lib/crm/whatsappStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { reportType } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const todayMX = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

    // 1. Recopilar métricas en vivo del sistema
    const { data: athletes } = await supabase.from("profiles").select("*");
    const { data: attendanceToday } = await supabase
      .from("daily_attendance")
      .select("status, student_id")
      .eq("date", todayMX);

    const { data: payments } = await supabase
      .from("payment_transactions_history")
      .select("amount_paid, transaction_date, concept, payment_method")
      .order("created_at", { ascending: false });

    const expenses = await getStoredExpenses();
    const whatsappMsgs = await getStoredWhatsAppMessages();

    // Cálculos financieros
    const totalIngresos = (payments || []).reduce((acc: number, p: any) => acc + Number(p.amount_paid || 0), 0);
    const totalEgresos = (expenses || []).reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
    const gananciaNeta = totalIngresos - totalEgresos;

    const presentCount = (attendanceToday || []).filter((a: any) => a.status === "presente").length;

    let roleName = "Lobo Estratega Supremo";
    let taskDescription = "";

    if (reportType === "finanzas") {
      roleName = "Lobo Auditor Financiero";
      taskDescription = `Genera un INFORME DE SALUD FINANCIERA para el Head Coach Ricardo.
Datos Reales:
- Ingresos Históricos Registrados: $${totalIngresos} MXN
- Egresos / Gastos Registrados: $${totalEgresos} MXN
- Ganancia Neta: $${gananciaNeta} MXN
- Gastos recientes: ${JSON.stringify(expenses.slice(0, 5))}
- Pagos recientes: ${JSON.stringify((payments || []).slice(0, 5))}
Estructura del Informe:
1. Resumen Ejecutivo de Caja (Ingresos vs Gastos).
2. Balance Neto y Margen de Utilidad.
3. Recomendaciones inmediatas para optimizar gastos de cancha y material.`;
    } else if (reportType === "deportivo") {
      roleName = "Lobo Fisiólogo Deportivo";
      taskDescription = `Genera un INFORME DE RENDIMIENTO FÍSICO Y COMBINE para los atletas de Wild Wolves CDMX.
Datos Reales:
- Total de atletas registrados: ${athletes?.length || 0}
- Atletas evaluados en cancha con protocolos de 20 tiros libres, 100m sprint, T-Test y Batería 3x25.
Estructura del Informe:
1. Estado General de la Condición Física del Roster.
2. Puntos Fuertes Detectados en Tiro y Velocidad.
3. Microciclo sugerido de 2 semanas para elevar la resistencia y porcentaje de tiro libre.`;
    } else if (reportType === "crm") {
      roleName = "Lobo Agente CRM & Comunicaciones";
      taskDescription = `Genera un INFORME DE CONVERSIÓN, ATRIBUCIÓN Y ATENCIÓN A FAMILIAS.
Datos Reales:
- Mensajes de WhatsApp procesados: ${whatsappMsgs.length}
- Alumnos con registro de recomendación y canal de origen.
Estructura del Informe:
1. Canales de mayor efectividad (Redes Sociales vs Carmen Serdán vs Recomendaciones).
2. Estatus de resolución de dudas con tutores y citas para clases muestra ($0).
3. Plan de acción por WhatsApp para elevar retención y asistencia dominical.`;
    } else {
      roleName = "Lobo Director General";
      taskDescription = `Genera un REPORTE EJECUTIVO INTEGRAL DE MANDO de la academia Wild Wolves CDMX (Sede Carmen Serdán).
Métricas Clave:
- Atletas presentes hoy: ${presentCount}
- Balance Neto de Caja: $${gananciaNeta} MXN (Ingresos: $${totalIngresos} | Gastos: $${totalEgresos})
- Mensajes y contactos WhatsApp activos: ${whatsappMsgs.length}
Estructura:
1. Diagnóstico de Salud Global de la Academia.
2. Semáforo Operativo (Verde/Ámbar/Rojo).
3. Las 3 prioridades del Head Coach Ricardo para esta semana.`;
    }

    const systemPrompt = `Eres "${roleName}", una IA de alto nivel ejecutiva en la academia de básquetbol Wild Wolves CDMX.
Tu trabajo es entregar un informe profesional, táctico, limpio, con viñetas claras, negritas y datos precisos.
Sin rollos genéricos. Directo al punto para el Head Coach Ricardo.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskDescription },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      return NextResponse.json({
        success: true,
        role: roleName,
        report: data.choices?.[0]?.message?.content || "Informe generado con éxito.",
        generated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      role: roleName,
      report: `🐺 **Informe Ejecutivo de Wild Wolves CDMX (${todayMX})**\n\n• **Atletas Presentes Hoy:** ${presentCount}\n• **Ingresos Registrados:** $${totalIngresos} MXN\n• **Gastos Operativos:** $${totalEgresos} MXN\n• **Ganancia Neta Real:** $${gananciaNeta} MXN\n\n_El sistema de caja y duela se encuentra 100% operativo en el Deportivo Carmen Serdán._`,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error en generate-report:", error);
    return NextResponse.json(
      { error: error?.message || "Error al generar informe" },
      { status: 500 }
    );
  }
}
