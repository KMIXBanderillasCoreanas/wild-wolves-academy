import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MASTER_SECRET = process.env.MASTER_SUPERADMIN_SECRET || "WW-SUPERADMIN-FULL-2026";

// Cliente con permisos de administración
const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret.trim() !== MASTER_SECRET.trim()) {
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

    return NextResponse.json({
      coaches: coaches || [],
      commitments: commitments || [],
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
    const { secret, action, userId } = body;

    if (!secret || secret.trim() !== MASTER_SECRET.trim()) {
      return NextResponse.json({ error: "Clave Maestra Inválida" }, { status: 401 });
    }

    if (action === "approve") {
      const { error } = await adminSupabase
        .from("profiles")
        .update({ role: "coach", status: "active" })
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Coach aprobado con éxito" });
    }

    if (action === "reject") {
      const { error } = await adminSupabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Coach eliminado con éxito" });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
