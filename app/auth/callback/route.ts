import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const targetRole = searchParams.get("target_role");

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (data?.user) {
        // Consultar el rol del usuario en la tabla profiles
        let role = targetRole || "student";
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", data.user.id)
            .single();

          if (profile?.role) {
            role = profile.role;
          }
        } catch (e) {
          console.warn("Aviso al consultar profile en callback:", e);
        }

        // Redirección y blindaje de cookies según rol
        if (role === "coach_pending") {
          const res = NextResponse.redirect(`${origin}/apply-coach-ww?status=pending`);
          res.cookies.set("user_role", "coach_pending", { path: "/", maxAge: 86400, sameSite: "lax" });
          if (data.user.email) {
            res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 86400, sameSite: "lax" });
          }
          return res;
        }

        if (role === "superadmin") {
          const res = NextResponse.redirect(`${origin}/master-bunker-hq`);
          res.cookies.set("user_role", "superadmin", { path: "/", maxAge: 86400, sameSite: "lax" });
          if (data.user.email) {
            res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 86400, sameSite: "lax" });
          }
          return res;
        }

        if (role === "coach") {
          const res = NextResponse.redirect(`${origin}/dashboard-coach`);
          res.cookies.set("user_role", "coach", { path: "/", maxAge: 86400, sameSite: "lax" });
          if (data.user.email) {
            res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 86400, sameSite: "lax" });
          }
          return res;
        }

        // Alumno o Tutor (student)
        const res = NextResponse.redirect(`${origin}/dashboard-student`);
        res.cookies.set("user_role", "student", { path: "/", maxAge: 86400, sameSite: "lax" });
        if (data.user.email) {
          res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 86400, sameSite: "lax" });
        }
        return res;
      }
    } catch (e) {
      console.error("Error exchanging OAuth code for session:", e);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard-student`);
}
