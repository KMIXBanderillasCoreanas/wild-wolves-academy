"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const cleanEmail = (email || data?.email || "").toLowerCase().trim();
      const isMasterAdmin = 
        cleanEmail === "wildwolvescdmx@gmail.com" ||
        cleanEmail === "ricardo@wildwolves.mx" || 
        cleanEmail === "carlos@wildwolves.mx" || 
        cleanEmail === "director@wildwolves.mx";

      const isGuardian = 
        data?.account_category === "guardian_family" || 
        data?.role === "guardian" || 
        data?.role === "parent" || 
        (typeof window !== "undefined" && localStorage.getItem("ww_user_role") === "guardian");

      const effectiveRole = isMasterAdmin ? "superadmin" : (isGuardian ? "guardian" : (data?.role || "student"));

      // Auto-vinculación en login con prospect_athletes si existe pre-ficha por nombre
      if (data?.full_name && userId && !isMasterAdmin) {
        try {
          await supabase
            .from("prospect_athletes")
            .update({ claimed_user_id: userId })
            .ilike("athlete_full_name", data.full_name)
            .is("claimed_user_id", null);
        } catch {
          // Si la tabla aún no existe o falla la consulta, no interrumpir auth
        }
      }

      setProfile(data ? { ...data, role: effectiveRole } : { id: userId, email: cleanEmail, role: effectiveRole });

      // Sincronizar cookies y almacenamiento local para acceso inmediato offline
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", effectiveRole);
        if (cleanEmail) localStorage.setItem("ww_user_email", cleanEmail);
        if (isGuardian) {
          localStorage.setItem("ww_account_category", "guardian_family");
          document.cookie = `account_category=guardian_family; path=/; max-age=31536000; SameSite=Lax`;
        }
        document.cookie = `user_role=${effectiveRole}; path=/; max-age=31536000; SameSite=Lax`;
        if (cleanEmail) document.cookie = `user_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(new Event("auth_changed"));
      }

      // Si es tutor y se encuentra en dashboard-student, redirigir sin demora
      if (isGuardian && typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard-student")) {
        window.location.replace("/dashboard-guardian");
        return;
      }

      // Redirección inteligente solo si está en la raíz "/" o login para evitar parpadeos y bucles
      if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "/login")) {
        const searchParams = new URLSearchParams(window.location.search);
        const hasDenied = searchParams.get("denied");
        const redirectParam = searchParams.get("redirect");

        if (!hasDenied) {
          if (redirectParam && (effectiveRole === "superadmin" || effectiveRole === "coach")) {
            window.location.href = redirectParam;
          } else if (effectiveRole === "superadmin") {
            window.location.href = "/master-bunker-hq";
          } else if (effectiveRole === "coach") {
            window.location.href = "/dashboard-coach";
          } else if (data?.account_category === "guardian_family" || data?.role === "parent" || data?.role === "guardian") {
            window.location.href = "/dashboard-guardian";
          } else if (effectiveRole === "student") {
            window.location.href = "/dashboard-student";
          }
        }
      }
    } catch (err) {
      console.warn("Error en fetchProfile de AuthContext:", err);
    }
  };

  useEffect(() => {
    // 1. Obtener sesión activa persistida al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // 2. Escuchar cambios de sesión y renovaciones automáticas de token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user.email);
        } else {
          setProfile(null);
          if (typeof window !== "undefined" && event === "SIGNED_OUT") {
            localStorage.removeItem("ww_user_role");
            localStorage.removeItem("ww_user_email");
            document.cookie = "user_role=; path=/; max-age=0";
            document.cookie = "user_email=; path=/; max-age=0";
            window.dispatchEvent(new Event("auth_changed"));
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Aviso al cerrar sesión:", e);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ww_user_role");
      localStorage.removeItem("ww_user_email");
      document.cookie = "user_role=; path=/; max-age=0";
      document.cookie = "user_email=; path=/; max-age=0";
      window.dispatchEvent(new Event("auth_changed"));
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
