"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";

export default function AuthSync() {
  useEffect(() => {
    // 1. Asegurar cookies desde localStorage al iniciar si el usuario ya tiene sesión
    const syncLocalToCookies = () => {
      if (typeof window === "undefined") return;
      const storedRole = localStorage.getItem("ww_user_role");
      const storedEmail = localStorage.getItem("ww_user_email");

      if (storedRole) {
        document.cookie = `user_role=${storedRole}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (storedEmail) {
        document.cookie = `user_email=${encodeURIComponent(storedEmail)}; path=/; max-age=86400; SameSite=Lax`;
      }
    };

    syncLocalToCookies();

    // 2. Suscribirse a cambios de estado de autenticación en Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const email = user.email || "";

        // Detección de rol prioritario por correo oficial
        const isMasterAdmin = 
          email === "ricardo@wildwolves.mx" || 
          email === "carlos@wildwolves.mx" || 
          email === "director@wildwolves.mx" ||
          email.toLowerCase().includes("wildwolvescdmx");

        let detectedRole = isMasterAdmin ? "superadmin" : "student";

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status, full_name")
            .eq("id", user.id)
            .single();

          if (profile?.role) {
            detectedRole = profile.role;
          } else if (isMasterAdmin) {
            // Auto-crear o asegurar perfil de superadmin
            await supabase.from("profiles").upsert({
              id: user.id,
              email: email,
              full_name: profile?.full_name || "Coach Ricardo (Director)",
              role: "superadmin",
              status: "active"
            });
            detectedRole = "superadmin";
          }
        } catch (err) {
          console.warn("Aviso en sincronización de perfil:", err);
        }

        // Sincronizar almacenamiento local y cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", detectedRole);
          localStorage.setItem("ww_user_email", email);
          document.cookie = `user_role=${detectedRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        // Actualizar HoopStore según el rol
        if (detectedRole === "coach" || detectedRole === "superadmin") {
          HoopStore.setCurrentUser({
            id: user.id,
            fullName: isMasterAdmin ? "Coach Ricardo" : (user.user_metadata?.full_name || "Coach de Cancha"),
            email: email,
            role: detectedRole as any,
            avatarUrl: "/logo-official.png",
            provider: "supabase"
          });
        } else {
          HoopStore.loginAsStudent(user.id, user.user_metadata?.full_name || "Atleta Wild Wolves", email);
        }
      } else if (event === "SIGNED_OUT") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("ww_user_role");
          localStorage.removeItem("ww_user_email");
          document.cookie = "user_role=; path=/; max-age=0";
          document.cookie = "user_email=; path=/; max-age=0";
          window.dispatchEvent(new Event("auth_changed"));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
