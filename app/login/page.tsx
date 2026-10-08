"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  Flame, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Shield, 
  KeyRound,
  ArrowLeft
} from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Autenticación con Google blindada
  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            assigned_role: "student",
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
      setErrorMsg(
        "El acceso directo con Google se encuentra en mantenimiento. Por favor regístrate o inicia sesión con tu correo electrónico y contraseña aquí abajo."
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Registro con Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || "Atleta Wild Wolves",
              assigned_role: "student",
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered") || error.message.includes("User already")) {
            setErrorMsg("Este correo ya está registrado. Selecciona 'Iniciar Sesión' para continuar.");
            setLoading(false);
            return;
          }
          throw error;
        }

        // Guardar perfil en Supabase
        if (data.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: email,
              full_name: name || "Atleta Wild Wolves",
              role: "student",
              status: "active",
            });
          } catch (profileErr) {
            console.warn("Perfil Supabase sync aviso:", profileErr);
          }
        }

        // Sincronización de sesión local
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", "student");
          localStorage.setItem("ww_user_email", email);
          if (name) localStorage.setItem("ww_student_name", name);
          document.cookie = "user_role=student; path=/; max-age=86400; SameSite=Lax";
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        HoopStore.loginAsStudent(
          data.user ? data.user.id : `stu_${Date.now()}`,
          name || "Atleta Wild Wolves",
          email
        );

        setSuccessMsg("¡Registro exitoso! Accediendo a tu portal de atleta...");
        setTimeout(() => {
          router.push("/dashboard-student");
        }, 1000);
      } else {
        // 2. Inicio de Sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Si el usuario existe solo localmente o credenciales incorrectas
          throw error;
        }

        // Detección de rol
        let userRole = "student";
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
          console.warn("Aviso perfil:", profileErr);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", userRole);
          localStorage.setItem("ww_user_email", email);
          document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        HoopStore.loginAsStudent(data.user.id, name || "Atleta Wild Wolves", email);

        if (userRole === "coach" || userRole === "superadmin") {
          router.push("/dashboard-coach");
        } else {
          router.push("/dashboard-student");
        }
      }
    } catch (err: any) {
      // Fallback amigable si hay problema de red con Supabase
      console.warn("Auth Supabase notice:", err);
      setErrorMsg(err.message || "Error al autenticar. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Resplandor deportivo cálido */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ea580c]/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Enlace para volver */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs font-mono text-zinc-400 z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Inicio
        </Link>
        <span className="text-[11px] text-zinc-500">Carmen Serdán • CDMX</span>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Encabezado con Logotipo Oficial */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center drop-shadow-[0_0_25px_rgba(234,88,12,0.35)]">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo Oficial"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-[#121724] border border-[#ea580c]/40 px-3.5 py-1 rounded-full text-xs font-bold text-[#ea580c] mb-2 shadow-lg">
            <Flame className="w-3.5 h-3.5 text-[#ea580c] animate-pulse" /> ACCESO ALUMNOS &amp; FAMILIAS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">Plataforma de Alto Rendimiento &amp; Métricas</p>

          <div className="inline-flex items-center gap-2 mt-2 px-3 py-0.5 bg-[#121724] border border-emerald-500/30 rounded-full font-mono text-[10px] text-emerald-400">
            <CreditCard className="w-3 h-3" />
            <span>Tarifa Oficial: <strong>$50 MXN / Clase</strong></span>
          </div>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-[#0d1017] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Pestañas Iniciar Sesión / Registrarse */}
          <div className="flex border-b border-zinc-800 pb-3 mb-5 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 text-center font-bold text-xs pb-2 transition cursor-pointer ${
                !isRegister
                  ? "text-[#ea580c] border-b-2 border-[#ea580c]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 text-center font-bold text-xs pb-2 transition cursor-pointer ${
                isRegister
                  ? "text-[#ea580c] border-b-2 border-[#ea580c]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Crear Cuenta Nueva
            </button>
          </div>

          {/* Avisos */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Botón de Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer mb-4 shadow-sm"
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
            <span>{isRegister ? "Registrarme con Google" : "Continuar con Google"}</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              o con tu correo
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                  Nombre Completo del Atleta o Tutor
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodrigo Mendoza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white transition placeholder-zinc-600 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="tutor@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white transition placeholder-zinc-600 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white transition placeholder-zinc-600 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-lg shadow-[#ea580c]/30 hover:brightness-110 transition cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Procesando..." : isRegister ? "Completar Registro de Atleta" : "Entrar a mi Perfil"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Accesos Rápidos de Otros Roles */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <Link href="/apply-coach-ww" className="hover:text-[#ea580c] transition flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#ea580c]" /> Postulación Coach
            </Link>
            <Link href="/master-bunker-hq" className="hover:text-amber-400 transition flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-500" /> Búnker Master
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
