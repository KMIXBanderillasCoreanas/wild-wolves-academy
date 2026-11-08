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

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
