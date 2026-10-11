import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_SYyJnZPqfIHN5cYH3I-5YQ_foTlKdNa",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              maxAge: 60 * 60 * 24 * 365, // 1 año de persistencia continua
              sameSite: "lax",
              path: "/"
            });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const userEmail = (data.user.email || "").toLowerCase().trim();
      const isMasterAdmin = 
        userEmail === "wildwolvescdmx@gmail.com" ||
        userEmail === "ricardo@wildwolves.mx" || 
        userEmail === "carlos@wildwolves.mx" || 
        userEmail === "director@wildwolves.mx";

      let role = isMasterAdmin ? "superadmin" : "student";

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status, full_name")
          .eq("id", data.user.id)
          .maybeSingle();

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
          // Registrar nuevo alumno
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "Atleta Wild Wolves",
            role: "student",
            status: "active",
          });
        }
      } catch (e) {
        console.warn("Aviso en profile de callback:", e);
      }

      // Si es el correo oficial del Director General o superadmin, paso directo al Búnker
      if (role === "superadmin" || isMasterAdmin) {
        const res = NextResponse.redirect(new URL("/master-bunker-hq", requestUrl.origin));
        res.cookies.set("user_role", "superadmin", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        if (data.user.email) {
          res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        }
        return res;
      }

      if (role === "coach") {
        const res = NextResponse.redirect(new URL("/dashboard-coach", requestUrl.origin));
        res.cookies.set("user_role", "coach", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        if (data.user.email) {
          res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        }
        return res;
      }

      if (role === "coach_pending") {
        const res = NextResponse.redirect(new URL("/apply-coach-ww?status=pending", requestUrl.origin));
        res.cookies.set("user_role", "coach_pending", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        if (data.user.email) {
          res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        }
        return res;
      }

      // Portal del alumno
      const res = NextResponse.redirect(new URL("/dashboard-student", requestUrl.origin));
      res.cookies.set("user_role", "student", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      if (data.user.email) {
        res.cookies.set("user_email", data.user.email, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      }
      return res;
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
