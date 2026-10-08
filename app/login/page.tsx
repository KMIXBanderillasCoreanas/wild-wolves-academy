"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Sparkles,
  CreditCard,
  Phone
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [role, setRole] = useState<"student" | "coach">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    errorParam === "coach_only"
      ? { type: "error", text: "Acceso restringido: El panel técnico requiere credenciales de Entrenador (Coach Ricardo)." }
      : null
  );

  // Guardar sesión universal tanto en localStorage como en Cookies
  const saveSession = (userRole: "student" | "coach", userEmail: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ww_user_role", userRole);
      localStorage.setItem("ww_user_email", userEmail);
      document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event("auth_changed"));
    }
  };

  // Login formal por formulario
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEmail = identifier.trim() || (role === "coach" ? "coach@wildwolves.mx" : "atleta@wildwolves.mx");
    
    saveSession(role, effectiveEmail);

    if (role === "coach") {
      HoopStore.loginAsCoach();
      setStatusMessage({ type: "success", text: "¡Credenciales validadas! Bienvenido Coach Ricardo..." });
      setTimeout(() => router.push(redirectParam || "/dashboard-coach"), 350);
    } else {
      HoopStore.loginAsStudent("student_01");
      setStatusMessage({ type: "success", text: "¡Acceso concedido! Entrando a tu expediente atlético..." });
      setTimeout(() => router.push(redirectParam || "/dashboard-student"), 350);
    }
  };

  // Acceso Rápido 1-Clic para pruebas y evaluaciones ágiles
  const handleQuickAccess = (selectedRole: "coach" | "student" | "parent") => {
    if (selectedRole === "coach") {
      setRole("coach");
      saveSession("coach", "coach@wildwolves.mx");
      HoopStore.loginAsCoach();
      setStatusMessage({ type: "success", text: "Iniciando como Coach Ricardo (Director Técnico)..." });
      setTimeout(() => router.push(redirectParam || "/dashboard-coach"), 300);
    } else if (selectedRole === "parent") {
      setRole("student");
      saveSession("student", "elena.morales@tutor.wildwolves.academy");
      HoopStore.loginAsParent("student_01");
      setStatusMessage({ type: "success", text: "Iniciando como Elena Morales (Tutor)..." });
      setTimeout(() => router.push(redirectParam || "/dashboard-student"), 300);
    } else {
      setRole("student");
      saveSession("student", "lucas.morales@wildwolves.academy");
      HoopStore.loginAsStudent("student_01");
      setStatusMessage({ type: "success", text: "Iniciando como Lucas Morales (Alumno)..." });
      setTimeout(() => router.push(redirectParam || "/dashboard-student"), 300);
    }
  };

  // Autenticación Social (Google)
  const handleGoogleAuth = () => {
    saveSession(role, role === "coach" ? "coach@wildwolves.mx" : "atleta.google@wildwolves.mx");
    HoopStore.signInWithGoogle(role);
    setStatusMessage({ type: "success", text: "Conectado vía Google. Redirigiendo..." });
    setTimeout(() => {
      router.push(redirectParam || (role === "coach" ? "/dashboard-coach" : "/dashboard-student"));
    }, 400);
  };

  // Autenticación Social (Apple)
  const handleAppleAuth = () => {
    saveSession(role, role === "coach" ? "coach@wildwolves.mx" : "atleta.apple@wildwolves.mx");
    HoopStore.signInWithApple(role);
    setStatusMessage({ type: "success", text: "Conectado vía Apple ID. Redirigiendo..." });
    setTimeout(() => {
      router.push(redirectParam || (role === "coach" ? "/dashboard-coach" : "/dashboard-student"));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Luces de fondo deportivas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#ea580c]/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-96 h-96 bg-[#0284c7]/15 blur-[110px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Cabecera de la Marca */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#161b26] border border-[#ea580c]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#ea580c] mb-3 shadow-lg">
            <Flame className="w-4 h-4 text-[#ea580c] animate-pulse" />
            <span>CDMX BASKETBALL ACADEMY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            WILD <span className="text-[#ea580c]">WOLVES</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Plataforma de Rendimiento, Analítica Combine y Desarrollo Atlético
          </p>

          {/* Tarifa Oficial Transparente */}
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-[#161b26]/90 border border-emerald-500/40 rounded-full font-mono text-[11px] text-emerald-400 shadow-sm">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cuota Oficial: <strong>$50 MXN / Clase</strong></span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-300">$150 sem / $600 mes</span>
          </div>
        </div>

        {/* Notificaciones */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2.5 animate-fadeIn ${
              statusMessage.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            {statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tarjeta de Acceso */}
        <div className="bg-[#161b26]/85 backdrop-blur-xl border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/60 relative">
          
          {/* Selector de Rol */}
          <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1.5 rounded-2xl mb-6 border border-zinc-800 font-sans">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                role === "student"
                  ? "bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" /> Alumno / Tutor
            </button>
            <button
              type="button"
              onClick={() => setRole("coach")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                role === "coach"
                  ? "bg-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Entrenador (Coach)
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 font-mono">
                {role === "student" ? "Matrícula o Correo del Tutor" : "Correo Institucional del Coach"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder={role === "student" ? "ej. WW-2026-08 o correo" : "coach@wildwolves.mx"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white transition placeholder-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 font-mono">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white transition placeholder-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                role === "coach"
                  ? "bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-[#ea580c]/30 hover:brightness-110 active:scale-95"
                  : "bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-[#0284c7]/30 hover:brightness-110 active:scale-95"
              }`}
            >
              <span>Ingresar como {role === "coach" ? "Coach Wild Wolves" : "Atleta Wild Wolves"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Botones Sociales Rápidos */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="py-2 px-3 rounded-xl bg-[#090d16] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleAuth}
              className="py-2 px-3 rounded-xl bg-[#090d16] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.06 1.71-.93 2.73 1 .08 2.03-.49 2.65-1.24z"/>
              </svg>
              <span>Apple ID</span>
            </button>
          </div>

          {/* Accesos Demo 1-Clic */}
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2 text-center">
              ⚡ Modo Rápido de Demostración (1 Clic)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAccess("coach")}
                className="py-1.5 px-2 rounded-lg bg-[#ea580c]/10 hover:bg-[#ea580c]/20 border border-[#ea580c]/30 text-[#ea580c] font-bold text-[11px] transition text-center cursor-pointer"
              >
                Coach Ricardo
              </button>
              <button
                type="button"
                onClick={() => handleQuickAccess("student")}
                className="py-1.5 px-2 rounded-lg bg-[#0284c7]/10 hover:bg-[#0284c7]/20 border border-[#0284c7]/30 text-[#38bdf8] font-bold text-[11px] transition text-center cursor-pointer"
              >
                Lucas (Atleta)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAccess("parent")}
                className="py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[11px] transition text-center cursor-pointer"
              >
                Elena (Tutor)
              </button>
            </div>
          </div>

          {/* Pie de tarjeta */}
          <div className="mt-5 pt-4 border-t border-zinc-800 text-center space-y-2">
            <p className="text-zinc-500 text-xs leading-relaxed">
              ¿Olvidaste tu contraseña o requieres informes? Contacta a la coordinación deportiva en cancha.
            </p>
            <a
              href="https://wa.me/525522427769"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition pt-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp de Atención: 55 2242 7769</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090d16] flex items-center justify-center font-mono text-zinc-400 text-xs">Cargando acceso oficial...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
