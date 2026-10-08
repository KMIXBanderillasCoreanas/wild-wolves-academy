"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  Shield,
  UserCheck
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: "student" | "coach_pending";
  initialMode?: "register" | "login";
  onSuccess?: (role: string) => void;
}

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AuthModal({
  isOpen,
  onClose,
  targetRole = "student",
  initialMode = "register",
  onSuccess,
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
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

  useEffect(() => {
    setIsRegister(initialMode === "register");
    setErrorMsg("");
    setSuccessMsg("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // 1. REGISTRO / LOGIN CON GOOGLE REAL CON INTERCEPCIÓN BLINDADA
  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_target_role", targetRole);
        if (fullName) localStorage.setItem("ww_target_name", fullName);
        localStorage.setItem("ww_selected_days", JSON.stringify(selectedDays));
        localStorage.setItem("ww_selected_shift", shift);
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
        const errorLower = (error.message || "").toLowerCase();
        const isUnsupported =
          error.status === 400 ||
          (error as any).statusCode === 400 ||
          (error as any).statusCode === "400" ||
          errorLower.includes("unsupported provider") ||
          errorLower.includes("provider is not enabled") ||
          errorLower.includes("not enabled");

        if (isUnsupported) {
          setErrorMsg(
            "El acceso directo con Google se encuentra en mantenimiento. Por favor regístrate o inicia sesión con tu correo electrónico y contraseña aquí abajo."
          );
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
      }
    } catch (err: any) {
      const errLower = (err?.message || "").toLowerCase();
      const isUnsupported =
        err?.status === 400 ||
        err?.statusCode === 400 ||
        errLower.includes("unsupported provider") ||
        errLower.includes("provider is not enabled") ||
        errLower.includes("not enabled");

      if (isUnsupported) {
        setErrorMsg(
          "El acceso directo con Google se encuentra en mantenimiento. Por favor regístrate o inicia sesión con tu correo electrónico y contraseña aquí abajo."
        );
      } else {
        setErrorMsg(err?.message || "Error al conectar con Google");
      }
      setLoading(false);
    }
  };

  // 2. REGISTRO / LOGIN CON EMAIL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        // Modo Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || (targetRole === "coach_pending" ? "Aspirante Coach" : "Atleta Wild Wolves"),
              assigned_role: targetRole,
            },
          },
        });

        if (error) {
          // Si el usuario ya existe, sugerir iniciar sesión
          if (error.message.includes("already registered") || error.message.includes("User already")) {
            setErrorMsg("Este correo ya se encuentra registrado. Cambia a 'Iniciar Sesión' para entrar.");
            setLoading(false);
            return;
          }
          throw error;
        }

        if (targetRole === "coach_pending") {
          // Guardar estado de coach pendiente
          try {
            if (data.user) {
              await supabase.from("profiles").upsert({
                id: data.user.id,
                email: email,
                full_name: fullName || "Aspirante Coach",
                role: "coach_pending",
                status: "pending",
              });
            }
          } catch (upsertErr) {
            console.warn("Aviso profiles:", upsertErr);
          }

          setSuccessMsg(
            "✅ ¡Postulación como Coach Recibida! Tu cuenta está en revisión. El Super Administrador la aprobará desde el Búnker Central antes de que puedas acceder al panel."
          );
          setLoading(false);
          return;
        }

        // Si es alumno, guardar en profiles y en attendance_commitments
        if (data.user && targetRole === "student") {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: email,
              full_name: fullName || "Atleta Wild Wolves",
              role: "student",
              status: "active",
            });
            await supabase.from("attendance_commitments").insert({
              user_id: data.user.id,
              days_selected: selectedDays,
              shift: shift,
              commitment_agreement: true,
            });
          } catch (commitmentErr) {
            console.warn("Aviso compromiso:", commitmentErr);
          }
        }

        // Sincronización inmediata de sesión para Alumno
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", "student");
          localStorage.setItem("ww_user_email", email);
          if (fullName) localStorage.setItem("ww_student_name", fullName);
          localStorage.setItem("ww_selected_days", JSON.stringify(selectedDays));
          localStorage.setItem("ww_selected_shift", shift);
          document.cookie = "user_role=student; path=/; max-age=86400; SameSite=Lax";
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }
        HoopStore.loginAsStudent("student_" + Date.now(), fullName || "Atleta Wild Wolves", email);

        setSuccessMsg("¡Registro exitoso! Accediendo a tu plataforma...");
        setTimeout(() => {
          if (onSuccess) onSuccess("student");
          window.location.href = "/dashboard-student";
        }, 1200);
      } else {
        // Modo Inicio de Sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Validar perfil en Supabase
        let userRole: string = targetRole;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", data.user.id)
            .single();

          if (profile?.role === "coach_pending" || profile?.status === "pending") {
            setErrorMsg("Tu solicitud de Coach sigue en revisión por el Super Administrador en el Búnker Central.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          if (profile?.role) {
            userRole = profile.role;
          }
        } catch (profileErr) {
          console.warn("Perfil Supabase:", profileErr);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", userRole);
          localStorage.setItem("ww_user_email", email);
          document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        if (onSuccess) {
          onSuccess(userRole);
        }

        if (userRole === "coach" || userRole === "superadmin") {
          window.location.href = "/dashboard-coach";
        } else {
          window.location.href = "/dashboard-student";
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar solicitud.");
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

        <div className="text-center mb-5">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#ea580c]/15 text-[#f97316] border border-[#ea580c]/30 px-3.5 py-1 rounded-full">
            {targetRole === "coach_pending"
              ? "Postulación Staff Técnico"
              : "Portal Oficial • Alumnos & Padres"}
          </span>
          <h2 className="text-2xl font-black uppercase mt-3 tracking-wide text-white">
            {targetRole === "coach_pending"
              ? isRegister
                ? "Registro de Entrenador"
                : "Acceso Staff Técnico"
              : isRegister
              ? "Registro de Atleta o Tutor"
              : "Iniciar Sesión"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
            Deportivo Carmen Serdán (CDMX)
          </p>
        </div>

        {/* PESTAÑAS CLARAS: REGISTRARSE / INICIAR SESIÓN */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#07090e] border border-zinc-800 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              isRegister
                ? "bg-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {targetRole === "coach_pending" ? "1. Postularme (Nuevo)" : "1. Crear Cuenta (Nuevo)"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              !isRegister
                ? "bg-[#ea580c] text-white shadow-md shadow-[#ea580c]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            2. Iniciar Sesión
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
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
          {isRegister ? "Registrarme con Google" : "Continuar con Google"}
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-[11px] uppercase font-bold tracking-wider">
            o con tu correo
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
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
                Selecciona los días en que el atleta asistirá (Lunes a Sábado):
              </p>

              <div className="grid grid-cols-3 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
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
                📍 Sede: Deportivo Carmen Serdán (CDMX). Presentarse con ropa deportiva e hidratación.
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
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión aquí"
              : targetRole === "coach_pending"
              ? "¿Aspirante a coach? Regístrate aquí"
              : "¿Eres nuevo atleta o padre? Regístrate aquí"}
          </button>
        </div>
      </div>
    </div>
  );
}
