import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const { data } = await supabase.auth.exchangeCodeForSession(code);
      if (data?.user) {
        // Consultar el rol del usuario en profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "coach" || profile?.role === "superadmin") {
          return NextResponse.redirect(`${origin}/dashboard-coach`);
        }
      }
    } catch (e) {
      console.error("Error exchanging code for session:", e);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard-student`);
}
