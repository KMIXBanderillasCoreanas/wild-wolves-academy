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

      const effectiveRole = isMasterAdmin ? "superadmin" : (data?.role || "student");

      setProfile(data ? { ...data, role: effectiveRole } : { id: userId, email: cleanEmail, role: effectiveRole });

      // Sincronizar cookies y almacenamiento local para acceso inmediato offline
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", effectiveRole);
        if (cleanEmail) localStorage.setItem("ww_user_email", cleanEmail);
        document.cookie = `user_role=${effectiveRole}; path=/; max-age=31536000; SameSite=Lax`;
        if (cleanEmail) document.cookie = `user_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(new Event("auth_changed"));
      }

      // Redirección inteligente solo si está en la raíz "/" o login para evitar parpadeos
      if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "/login")) {
        if (effectiveRole === "superadmin") {
          window.location.href = "/master-bunker-hq";
        } else if (effectiveRole === "coach") {
          window.location.href = "/dashboard-coach";
        } else if (data?.account_category === "guardian_family" || data?.role === "parent" || data?.role === "guardian") {
          window.location.href = "/dashboard-guardian";
        } else if (effectiveRole === "student") {
          window.location.href = "/dashboard-student";
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
