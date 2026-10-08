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
        const userEmail = (data.user.email || "").toLowerCase();
        const isMasterAdmin = 
          userEmail === "wildwolvescdmx@gmail.com" ||
          userEmail === "ricardo@wildwolves.mx" || 
          userEmail === "carlos@wildwolves.mx" || 
          userEmail === "director@wildwolves.mx";

        let role = isMasterAdmin ? "superadmin" : (targetRole || "student");

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status, full_name")
            .eq("id", data.user.id)
            .single();

          if (isMasterAdmin) {
            role = "superadmin";
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: profile?.full_name || "Coach Ricardo (Director General)",
              role: "superadmin",
              status: "active",
            });
          } else if (profile?.role) {
            role = profile.role;
          } else {
            // Auto registrar en profiles si es primer inicio con Google
            role = targetRole || "student";
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "Atleta Wild Wolves",
              role: role,
              status: "active",
            });
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
