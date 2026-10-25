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
            is_provisional: false,
          });
        } else if (profile?.role) {
          role = profile.role;
        } else {
          // SHADOW PROFILE & PROSPECT MERGE:
          // Verificar si existe un prospecto o perfil provisional creado previamente en cancha
          const newUserName = (
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            ""
          ).trim();
          const newUserPhone = data.user.user_metadata?.phone || "";

          // 1. Buscar en prospect_athletes primero (caso Bruno Sánchez, Osmar, etc.)
          let matchedProspect: any = null;
          if (newUserName) {
            const { data: foundPr } = await supabase
              .from("prospect_athletes")
              .select("*")
              .ilike("full_name", `%${newUserName}%`)
              .limit(1)
              .maybeSingle();
            matchedProspect = foundPr;
          }

          let provisionalProfile: any = null;
          if (newUserName) {
            const { data: foundProv } = await supabase
              .from("profiles")
              .select("*")
              .eq("is_provisional", true)
              .ilike("full_name", `%${newUserName}%`)
              .limit(1)
              .maybeSingle();
            provisionalProfile = foundProv;
          }

          if (matchedProspect) {
            // Reclamar y fusionar datos del prospecto creado en cancha
            await supabase
              .from("prospect_athletes")
              .update({ claimed_user_id: data.user.id })
              .eq("id", matchedProspect.id);

            const tDays = Array.isArray(matchedProspect.training_days)
              ? matchedProspect.training_days.join("-")
              : (matchedProspect.training_days || "Lun-Mié-Vie");

            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: matchedProspect.full_name || newUserName,
              role: "student",
              user_type: "student",
              account_category: "student",
              status: "active",
              is_provisional: false,
              parent_name: matchedProspect.guardian_name || matchedProspect.parent_name || null,
              notes: matchedProspect.notes || null,
              current_debt_amount: Number(matchedProspect.debt_amount || 0),
              financial_status: matchedProspect.financial_status || "al_corriente",
              training_days: tDays,
              training_schedule: matchedProspect.training_schedule || "17:00 - 19:00",
              phone_number: matchedProspect.contact_phone || newUserPhone || null,
            });
          } else if (provisionalProfile) {
            // Transferir asistencias y pagos del perfil provisional al ID real
            await supabase
              .from("daily_attendance")
              .update({ student_id: data.user.id })
              .eq("student_id", provisionalProfile.id);

            await supabase
              .from("payment_transactions_history")
              .update({ student_id: data.user.id })
              .eq("student_id", provisionalProfile.id);

            // Eliminar fila provisional anterior
            await supabase
              .from("profiles")
              .delete()
              .eq("id", provisionalProfile.id);

            // Crear perfil definitivo heredando deuda, nivel, notas y vínculos familiares
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: provisionalProfile.full_name || newUserName,
              role: "student",
              user_type: "student",
              account_category: "student",
              status: "active",
              is_provisional: false,
              parent_name: provisionalProfile.parent_name || null,
              notes: provisionalProfile.notes || null,
              current_debt_amount: provisionalProfile.current_debt_amount || 0,
              financial_status: provisionalProfile.financial_status || "al_corriente",
              training_days: provisionalProfile.training_days || "Lun-Mié-Vie",
              training_schedule: provisionalProfile.training_schedule || "17:00 - 19:00",
              scholarship_percentage: provisionalProfile.scholarship_percentage || 0,
              default_class_cost: provisionalProfile.default_class_cost || 50,
            });

            // Si la tutora (Catalina) estaba vinculada al ID provisional, actualizar su enlace
            await supabase
              .from("profiles")
              .update({ linked_student_id: data.user.id })
              .eq("linked_student_id", provisionalProfile.id);
          } else {
            // Registrar nuevo alumno limpio
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: newUserName || "Atleta Wild Wolves",
              role: "student",
              user_type: "student",
              account_category: "student",
              status: "active",
              is_provisional: false,
            });
          }
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
