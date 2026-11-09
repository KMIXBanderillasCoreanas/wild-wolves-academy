import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, payload } = body;

    if (!userId || !payload) {
      return NextResponse.json({ error: "userId y payload son requeridos" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Si en el onboarding se seleccionó ser tutor familiar, asegurar también el rol "guardian"
    if (payload.account_category === "guardian_family") {
      payload.role = "guardian";
    }

    // Actualizar perfil de forma segura sin bloqueo por recursión de políticas RLS
    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar perfil de onboarding:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error("Excepción en update-onboarding-profile:", err);
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
