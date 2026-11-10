import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Obtener perfiles de la academia excluyendo coaches y superadmins
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, account_category, user_type, current_debt_amount, financial_status, is_provisional, scholarship_percentage, default_class_cost, selected_days, training_days, training_schedule, schedules_by_day, number, category, parent_phone, emergency_phone")
      .order("created_at", { ascending: false });

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    // Excluir staff y director
    const athletes = (profiles || []).filter((p: any) => {
      const email = (p.email || "").toLowerCase().trim();
      const role = (p.role || "").toLowerCase().trim();
      if (email === "wildwolvescdmx@gmail.com" || email === "ricardo@wildwolves.mx") return false;
      if (role === "superadmin" || role === "coach") return false;
      return true;
    });

    // 2. Obtener pre-fichas de prospect_athletes
    let prospects: any[] = [];
    try {
      const { data: pData } = await supabase
        .from("prospect_athletes")
        .select("*")
        .order("created_at", { ascending: false });
      if (pData) prospects = pData;
    } catch {}

    // 3. Obtener asistencias de la fecha solicitada si se provee
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date") || new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

    let attendance: any[] = [];
    try {
      const { data: attData } = await supabase
        .from("daily_attendance")
        .select("id, student_id, status, date")
        .eq("date", dateQuery);
      if (attData) attendance = attData;
    } catch {}

    // 4. Obtener pagos recientes
    let payments: any[] = [];
    try {
      const { data: payData } = await supabase
        .from("membership_payments")
        .select("student_id, amount, status, payment_date")
        .order("payment_date", { ascending: false });
      if (payData) payments = payData;
    } catch {}

    // 5. Obtener pruebas deportivas más recientes (Tiros 55, Sprint 100m, Líneas, Salto de cuerda)
    let skillsLogs: any[] = [];
    try {
      const { data: sLogs } = await supabase
        .from("basketball_skills_logs")
        .select("student_id, test_date, free_throws_made, mid_range_made, three_point_made, sprint_100m_seconds, lines_round_trip_seconds, vertical_jump_cm")
        .order("created_at", { ascending: false });
      if (sLogs) skillsLogs = sLogs;
    } catch {}

    let baselineLogs: any[] = [];
    try {
      const { data: bLogs } = await supabase
        .from("student_initial_baseline")
        .select("student_id, initial_jump_rope_max");
      if (bLogs) baselineLogs = bLogs;
    } catch {}

    return NextResponse.json({
      success: true,
      athletes,
      prospects,
      attendance,
      payments,
      skillsLogs,
      baselineLogs,
      targetDate: dateQuery
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
