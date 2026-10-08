import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Claves Maestras Autorizadas por Administrador
const VALID_KEYS: Record<string, string> = {
  "RICARDO-WOLVES-2026": "Coach Ricardo",
  "CARLOS-WOLVES-2026": "Carlos",
  "WW-SUPERADMIN-FULL-2026": "Super Administrador",
};

function getAdminUser(secret: string): string | null {
  if (!secret) return null;
  const normalized = secret.trim().toUpperCase();
  return VALID_KEYS[normalized] || null;
}

// Cliente con permisos de administración
const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const adminUser = getAdminUser(secret || "");
  if (!adminUser) {
    return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 });
  }

  try {
    const { data: coaches, error: coachErr } = await adminSupabase
      .from("profiles")
      .select("*")
      .in("role", ["coach_pending", "coach"])
      .order("created_at", { ascending: false });

    const { data: commitments, error: commErr } = await adminSupabase
      .from("attendance_commitments")
      .select("*, profiles:user_id(email, full_name)");

    // Pagos registrados en Supabase (si existe la tabla)
    let payments: any[] = [];
    try {
      const { data: payData } = await adminSupabase
        .from("student_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (payData) payments = payData;
    } catch {}

    // Asistencias registradas
    let attendance: any[] = [];
    try {
      const { data: attData } = await adminSupabase
        .from("daily_attendance")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (attData) attendance = attData;
    } catch {}

    return NextResponse.json({
      adminUser,
      coaches: coaches || [],
      commitments: commitments || [],
      payments,
      attendance,
      coachErr,
      commErr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, action, userId, payment } = body;

    const adminUser = getAdminUser(secret || "");
    if (!adminUser) {
      return NextResponse.json({ error: "Clave Maestra Inválida" }, { status: 401 });
    }

    if (action === "approve") {
      const { error } = await adminSupabase
        .from("profiles")
        .update({ role: "coach", status: "active" })
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        message: `Coach aprobado con éxito por ${adminUser}` 
      });
    }

    if (action === "reject") {
      const { error } = await adminSupabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        message: `Coach eliminado con éxito por ${adminUser}` 
      });
    }

    if (action === "record_payment" && payment) {
      const { error } = await adminSupabase
        .from("student_payments")
        .insert({
          student_id: payment.studentId,
          student_name: payment.studentName,
          guardian_name: payment.guardianName,
          amount: payment.amount,
          payment_date: payment.date,
          method: payment.method,
          status: payment.status || 'Pagado',
          notes: payment.notes || `Registrado por ${adminUser}`
        });

      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: `Pago registrado con éxito por ${adminUser}`
      });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
