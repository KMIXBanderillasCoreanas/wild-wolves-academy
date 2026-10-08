"use client";

import React, { useState } from "react";
import { X, Mail, Lock, CheckCircle2, Calendar, Clock, AlertCircle, Eye, EyeOff, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: "student" | "coach_pending";
  onSuccess?: (role: string) => void;
}

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AuthModal({
  isOpen,
  onClose,
  targetRole = "student",
  onSuccess,
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estado del compromiso de entrenamiento (de lunes a sábado)
  const [selectedDays, setSelectedDays] = useState<string[]>(["Lunes", "Miércoles", "Viernes"]);
  const [shift, setShift] = useState<"matutino_9_11" | "vespertino_5_7">("vespertino_5_7");

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // 1. REGISTRO / LOGIN CON GOOGLE REAL
  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_target_role", targetRole);
        if (fullName) localStorage.setItem("ww_target_name", fullName);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            assigned_role: targetRole,
          },
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con Google");
      setLoading(false);
    }
  };

  // 2. REGISTRO / LOGIN CON EMAIL REAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        // Registro en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "Atleta Wild Wolves",
              assigned_role: targetRole,
            },
          },
        });

        if (error) throw error;

        // Guardar compromiso de entrenamiento si es alumno
        if (data.user && targetRole === "student") {
          try {
            await supabase.from("attendance_commitments").insert({
              user_id: data.user.id,
              days_selected: selectedDays,
              shift: shift,
              commitment_agreement: true,
            });
          } catch (commitmentErr) {
            console.warn("Nota: No se pudo guardar compromiso directo:", commitmentErr);
          }

          // Sincronizar estado local
          if (typeof window !== "undefined") {
            localStorage.setItem("ww_user_role", "student");
            localStorage.setItem("ww_user_email", email);
            if (fullName) localStorage.setItem("ww_student_name", fullName);
            document.cookie = "user_role=student; path=/; max-age=86400; SameSite=Lax";
            document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
            window.dispatchEvent(new Event("auth_changed"));
          }
          HoopStore.loginAsStudent("student_" + Date.now(), fullName || "Atleta Wild Wolves", email);
        }

        setSuccessMsg(
          targetRole === "coach_pending"
            ? "¡Solicitud de Coach enviada con éxito! Tu acceso está en revisión por el Super Administrador."
            : "¡Registro exitoso en Wild Wolves CDMX! Revisa tu correo o inicia sesión para acceder a tu entrenamiento."
        );

        if (onSuccess) onSuccess(targetRole);
      } else {
        // Inicio de sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirección según rol
        let userRole: string = targetRole;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", data.user.id)
            .single();

          if (profile?.role === "coach_pending" || profile?.status === "pending") {
            setErrorMsg("Tu solicitud de Coach sigue en revisión por el Super Administrador.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          if (profile?.role) {
            userRole = profile.role as any;
          }
        } catch (profileErr) {
          console.warn("Perfil en Supabase:", profileErr);
        }

        // Sincronización de cookies y localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", userRole);
          localStorage.setItem("ww_user_email", email);
          document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        if (userRole === "coach" || userRole === "superadmin") {
          window.location.href = "/dashboard-coach";
        } else {
          window.location.href = "/dashboard-student";
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error de autenticación con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-[#161b26] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#ea580c]/20 text-[#f97316] border border-[#ea580c]/40 px-3.5 py-1 rounded-full">
            {targetRole === "coach_pending"
              ? "Postulación Staff Técnico"
              : "Portal Oficial • Alumnos & Padres"}
          </span>
          <h2 className="text-2xl font-black uppercase mt-3 tracking-wide text-white">
            {isRegister ? "Crear Cuenta Oficial" : "Iniciar Sesión"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
            Canchas de Pavimento • Deportivo Carmen Serdán (CDMX)
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BOTÓN OFICIAL DE GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-3 cursor-pointer mb-5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            o mediante correo institucional
          </span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                {targetRole === "coach_pending"
                  ? "Nombre Completo del Entrenador"
                  : "Nombre Completo del Atleta o Tutor"}
              </label>
              <input
                type="text"
                required
                placeholder="Nombre y Apellidos"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] rounded-xl py-2.5 px-3.5 text-sm text-white outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] rounded-xl py-2.5 pl-10 pr-11 text-sm text-white outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* MÓDULO OBLIGATORIO: DÍAS DE ENTRENAMIENTO Y HORARIO (LUNES A SÁBADO) */}
          {isRegister && targetRole === "student" && (
            <div className="bg-[#121724] border border-zinc-800 p-4 rounded-2xl space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ea580c]">
                  <Calendar className="w-4 h-4" /> Compromiso de Asistencia Semanal
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {selectedDays.length} días seleccionados
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Selecciona los días en que el atleta entrenará en las canchas de pavimento (Lunes a Sábado):
              </p>

              <div className="grid grid-cols-3 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                        active
                          ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                          : "bg-[#07090e] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="block text-[11px] font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f97316]" /> Turno de Entrenamiento:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShift("matutino_9_11")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      shift === "matutino_9_11"
                        ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                        : "bg-[#07090e] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div>Matutino</div>
                    <div className="text-[10px] opacity-80 font-normal">09:00 a 11:00 hrs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShift("vespertino_5_7")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      shift === "vespertino_5_7"
                        ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                        : "bg-[#07090e] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div>Vespertino</div>
                    <div className="text-[10px] opacity-80 font-normal">17:00 a 19:00 hrs</div>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 bg-[#07090e] p-2.5 rounded-xl border border-zinc-800/80">
                📍 Sede: Canchas de Pavimento • Deportivo Carmen Serdán. Asistencia requerida con ropa deportiva e hidratación.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-[#ea580c]/30 cursor-pointer hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? "Procesando en Supabase..."
              : isRegister
              ? targetRole === "coach_pending"
                ? "Enviar Solicitud de Coach"
                : "Completar Registro Real"
              : "Entrar a mi Cuenta"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión aquí"
              : targetRole === "coach_pending"
              ? "¿Ya te postulaste? Inicia sesión aquí"
              : "¿Eres nuevo atleta o padre? Regístrate aquí"}
          </button>
        </div>
      </div>
    </div>
  );
}
