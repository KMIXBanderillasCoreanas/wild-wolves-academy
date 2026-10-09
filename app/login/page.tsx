"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Shield, 
  ArrowLeft,
  Users,
  Eye,
  EyeOff
} from "lucide-react";

type RolePortal = "student" | "coach";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Rol activo seleccionado en pestañas (Solo Atletas o Coaches)
  const [activePortal, setActivePortal] = useState<RolePortal>("student");
  const [isRegister, setIsRegister] = useState(false);

  // Campos de formulario
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Detectar parámetros en la URL
    const modeParam = searchParams.get("mode");
    const roleParam = searchParams.get("role");

    if (modeParam === "register") {
      setIsRegister(true);
    }
    if (roleParam === "coach") {
      setActivePortal("coach");
    }
  }, [searchParams]);

  // Limpiar mensajes al cambiar pestaña
  const switchPortal = (portal: RolePortal) => {
    setActivePortal(portal);
    setErrorMsg("");
    setSuccessMsg("");
    if (portal !== "student") {
      setIsRegister(false);
    }
  };

  // Autenticación con Google blindada para alumnos
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
          errorLower.includes("unsupported provider") ||
          errorLower.includes("provider is not enabled") ||
          errorLower.includes("not enabled");

        if (isUnsupported) {
          setErrorMsg(
            "El acceso rápido con Google se encuentra en mantenimiento temporal. Por favor ingresa con tu correo y contraseña abajo."
          );
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
      }
    } catch {
      setErrorMsg(
        "El acceso rápido con Google se encuentra en mantenimiento temporal. Por favor ingresa con tu correo y contraseña abajo."
      );
      setLoading(false);
    }
  };

  // Manejador Principal con Detección Automática de Roles
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister && activePortal === "student") {
        // 1. Registro de Nuevo Atleta / Familia
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

        const isFounderAccount = 
          email.toLowerCase().includes("wildwolvescdmx") || 
          email.toLowerCase() === "ricardo@wildwolves.mx";

        const assignedRole = isFounderAccount ? "superadmin" : "student";
        const officialName = isFounderAccount 
          ? "Coach Ricardo (Fundador y Director General)" 
          : (name || "Atleta Wild Wolves");

        if (data.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: email,
              full_name: officialName,
              role: assignedRole,
              status: "active",
            });
          } catch (profileErr) {
            console.warn("Perfil Supabase sync aviso:", profileErr);
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", assignedRole);
          localStorage.setItem("ww_user_email", email);
          if (name) localStorage.setItem("ww_student_name", officialName);
          document.cookie = `user_role=${assignedRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        if (isFounderAccount) {
          HoopStore.loginAsCoach();
          setSuccessMsg("¡Cuenta de Fundador / Director General confirmada! Ingresando al Búnker...");
          setTimeout(() => {
            router.push("/master-bunker-hq");
          }, 800);
          return;
        }

        HoopStore.loginAsStudent(
          data.user ? data.user.id : `stu_${Date.now()}`,
          name || "Atleta Wild Wolves",
          email
        );

        setSuccessMsg("¡Cuenta creada exitosamente! Ingresando a tu portal de atleta...");
        setTimeout(() => {
          router.push("/dashboard-student");
        }, 800);
      } else {
        // 2. Inicio de Sesión General (con Autodetección de Rol)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        const user = data.user;
        const userEmail = user.email || email;

        // Detección de Rol Prioritario por Dirección / Club Oficial
        const isMasterDirector = 
          userEmail === "ricardo@wildwolves.mx" || 
          userEmail === "carlos@wildwolves.mx" || 
          userEmail === "director@wildwolves.mx" ||
          userEmail.toLowerCase().includes("wildwolvescdmx");

        let userRole = isMasterDirector ? "superadmin" : (activePortal === "coach" ? "coach" : "student");

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status, full_name")
            .eq("id", user.id)
            .single();

          if (profile?.role === "coach_pending" || profile?.status === "pending") {
            setErrorMsg("Tu postulación de Coach sigue en revisión por la Dirección Técnica en el Búnker Central.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          if (profile?.role) {
            userRole = profile.role;
          } else if (isMasterDirector) {
            // Asegurar perfil directivo
            await supabase.from("profiles").upsert({
              id: user.id,
              email: userEmail,
              full_name: profile?.full_name || "Coach Ricardo",
              role: "superadmin",
              status: "active"
            });
            userRole = "superadmin";
          }
        } catch (profileErr) {
          console.warn("Aviso perfil:", profileErr);
        }

        // Blindar sincronización en cookies y localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", userRole);
          localStorage.setItem("ww_user_email", userEmail);
          document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }

        // Actualizar almacén local
        if (userRole === "coach" || userRole === "superadmin") {
          HoopStore.setCurrentUser({
            id: user.id,
            fullName: isMasterDirector ? "Coach Ricardo" : (user.user_metadata?.full_name || "Coach Wild Wolves"),
            email: userEmail,
            role: userRole as any,
            avatarUrl: "/logo-official.png",
            provider: "supabase"
          });
        } else {
          HoopStore.loginAsStudent(user.id, user.user_metadata?.full_name || "Atleta Wild Wolves", userEmail);
        }

        setSuccessMsg(`¡Bienvenido! Accediendo como ${userRole.toUpperCase()}...`);

        // Redirección inteligente respetando query params o según rol
        const redirectParam = searchParams.get("redirect");
        setTimeout(() => {
          if (redirectParam && (userRole === "coach" || userRole === "superadmin")) {
            router.push(redirectParam);
          } else if (userRole === "superadmin") {
            router.push("/master-bunker-hq");
          } else if (userRole === "coach") {
            router.push("/dashboard-coach");
          } else {
            router.push("/dashboard-student");
          }
        }, 800);
      }
    } catch (err: any) {
      console.warn("Error de autenticación:", err);
      setErrorMsg(err.message || "Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Resplandor ambiental deportivo según rol */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[160px] rounded-full pointer-events-none transition-colors duration-500 ${
        activePortal === "coach" 
          ? "bg-[#ea580c]/18" 
          : "bg-sky-500/15"
      }`} />

      {/* Barra de Retorno */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs font-mono text-zinc-400 z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Inicio
        </Link>
        <span className="text-[11px] text-zinc-500">Deportivo Carmen Serdán • CDMX</span>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Encabezado con Logotipo Oficial */}
        <div className="text-center mb-5">
          {/* Logotipo Oficial Original */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 flex items-center justify-center">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={72}
              height={72}
              className="object-contain select-none"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5">Plataforma Oficial &amp; Control de Alto Rendimiento</p>
        </div>

        {/* SELECTOR DE ROL (2 PESTAÑAS: ATLETAS Y COACHES) */}
        <div className="bg-[#10141f] border border-zinc-800 p-1.5 rounded-2xl mb-4 flex items-center gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => switchPortal("student")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === "student"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Atletas</span>
          </button>

          <button
            type="button"
            onClick={() => switchPortal("coach")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === "coach"
                ? "bg-[#ea580c]/25 text-[#ea580c] border border-[#ea580c]/40 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Coaches</span>
          </button>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-[#0d1017] border border-zinc-800 p-6 sm:p-7 rounded-3xl shadow-2xl backdrop-blur-xl">
          
          {/* VISTA 1: ATLETAS Y FAMILIAS */}
          {activePortal === "student" && (
            <>
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
                  Crear Cuenta de Atleta
                </button>
              </div>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer mb-4 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
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
            </>
          )}

          {/* VISTA 2: STAFF Y COACHES (AVISO DE ROL) */}
          {activePortal === "coach" && (
            <div className="mb-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#ea580c]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Portal Cuerpo Técnico</span>
                </div>
                <Link
                  href="/apply-coach-ww"
                  className="text-[11px] font-bold text-[#ea580c] hover:underline"
                >
                  + Postularse como Coach
                </Link>
              </div>
            </div>
          )}

          {/* Avisos de Alerta / Éxito */}
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

          {/* Formulario Principal de Correo y Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && activePortal === "student" && (
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
                {activePortal === "coach" ? "Correo de Entrenador" : "Correo Electrónico"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder={activePortal === "coach" ? "coach@wildwolves.mx" : "alumno@ejemplo.com"}
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
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-10 text-xs text-white transition placeholder-zinc-600 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 mt-2 shadow-lg bg-gradient-to-r from-[#ea580c] to-[#f97316] shadow-[#ea580c]/30 text-white"
            >
              <span>
                {loading
                  ? "Verificando Credenciales..."
                  : isRegister
                  ? "Completar Registro de Atleta"
                  : activePortal === "coach"
                  ? "Entrar al Panel de Coach"
                  : "Entrar a mi Perfil"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Accesos de Respaldo */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            {activePortal !== "coach" && (
              <button
                type="button"
                onClick={() => switchPortal("coach")}
                className="hover:text-[#ea580c] transition flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#ea580c]" /> Acceso Coaches
              </button>
            )}
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-300 transition"
            >
              ← Volver al Club
            </Link>
            {activePortal !== "student" && (
              <button
                type="button"
                onClick={() => switchPortal("student")}
                className="hover:text-sky-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3 h-3 text-sky-400" /> Portal Atletas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-zinc-400 flex items-center justify-center font-mono text-xs">
          Cargando consola Wild Wolves CDMX...
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

