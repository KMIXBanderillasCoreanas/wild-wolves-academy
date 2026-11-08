import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!userId && !email) {
      return NextResponse.json({ error: "id o email es requerido" }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    let query = supabase.from("profiles").select("*");

    if (userId) {
      query = query.eq("id", userId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Consultar también su compromiso de asistencia si existe
    let commitment = null;
    const targetUserId = profile?.id || userId;
    if (targetUserId) {
      const { data: commData } = await supabase
        .from("attendance_commitments")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();
      commitment = commData || null;
    }

    return NextResponse.json({ success: true, profile, commitment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
