"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  Clock, 
  MessageCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function ApplyCoachPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("Fundamentos Técnicos de Básquetbol");
  const [shiftAvailability, setShiftAvailability] = useState("ambos");
  const [experience, setExperience] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Registro en Supabase Auth con rol 'coach_pending'
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            assigned_role: "coach_pending",
            phone,
            specialty,
            shift_availability: shiftAvailability,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already")) {
          setErrorMsg("Este correo ya está registrado en el club. Si ya eres coach o aspirante, inicia sesión directamente.");
          setLoading(false);
          return;
        }
        throw error;
      }

      const userId = data.user?.id;

      if (userId) {
        // 2. Guardar perfil con status 'pending' y role 'coach_pending'
        try {
          await supabase.from("profiles").upsert({
            id: userId,
            email: email,
            full_name: fullName,
            role: "coach_pending",
            status: "pending",
          });
        } catch (profErr) {
          console.warn("Aviso al crear perfil de coach en Supabase:", profErr);
        }

        // 3. Registrar expediente en coach_applications si la tabla está disponible
        try {
          await supabase.from("coach_applications").insert({
            user_id: userId,
            full_name: fullName,
            email: email,
            phone: phone,
            specialty: specialty,
            shift_availability: shiftAvailability,
            experience: experience,
            status: "pending",
          });
        } catch (appErr) {
          console.warn("Aviso al registrar solicitud formal:", appErr);
        }

        // Sincronizar estado local en el navegador
        if (typeof window !== "undefined") {
          localStorage.setItem("ww_user_role", "coach_pending");
          localStorage.setItem("ww_user_email", email);
          document.cookie = "user_role=coach_pending; path=/; max-age=86400; SameSite=Lax";
          document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
          window.dispatchEvent(new Event("auth_changed"));
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la postulación. Por favor verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappDirectorUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    `Hola Coach Ricardo, acabo de registrar mi postulación como Entrenador para Wild Wolves CDMX (Deportivo Carmen Serdán).\n\n• Nombre: ${fullName}\n• Correo: ${email}\n• Especialidad: ${specialty}\n• Teléfono: ${phone}\n\nQuedo a la espera de la revisión en el Búnker Central.`
  )}`;

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Luz radial de fondo naranja */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ea580c]/12 blur-[140px] rounded-full pointer-events-none" />

      {/* Navegación superior */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between text-xs font-mono text-zinc-400 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
        </Link>
        <Link
          href="/login"
          className="text-[#ea580c] hover:underline font-bold"
        >
          ¿Ya tienes cuenta? Iniciar Sesión
        </Link>
      </div>

      <div className="max-w-lg w-full relative z-10 my-4">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-3 drop-shadow-[0_0_25px_rgba(234,88,12,0.4)]">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves CDMX Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#f97316] text-[10px] font-mono uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" /> Staff Técnico • Postulación Oficial
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Unirse al Cuerpo Técnico
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
            Forma parte de los entrenadores de <strong className="text-zinc-200">Wild Wolves CDMX</strong> en Deportivo Carmen Serdán.
          </p>
        </div>

        {submitted ? (
          /* Pantalla de Éxito / Confirmación */
          <div className="bg-[#0d1017] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              Estatus: Pendiente de Aprobación
            </span>

            <h2 className="text-xl font-black uppercase tracking-tight text-white mt-3">
              ¡Postulación Registrada con Éxito!
            </h2>

            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Tu expediente y cuenta de acceso han sido creados. Por políticas de seguridad, el <strong>Super Administrador (Coach Ricardo)</strong> validará tu perfil en el Búnker Central antes de habilitar los paneles de control de asistencia y métricas.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-[#121724] border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Aspirante:</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Correo registrado:</span>
                <span className="font-mono text-zinc-200">{email}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Especialidad:</span>
                <span className="text-orange-400 font-medium">{specialty}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={whatsappDirectorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Notificar a Coach Ricardo vía WhatsApp
              </a>

              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de Postulación de Entrenador */
          <div className="bg-[#0d1017] border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                  Nombre Completo del Coach
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza López"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="coach@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                    Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                    WhatsApp / Celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      placeholder="55 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                    Turno Disponible
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <select
                      value={shiftAvailability}
                      onChange={(e) => setShiftAvailability(e.target.value)}
                      className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-3 text-xs text-white font-sans cursor-pointer"
                    >
                      <option value="vespertino">Vespertino (17:00 - 19:00 hrs)</option>
                      <option value="matutino">Matutino (09:00 - 11:00 hrs)</option>
                      <option value="ambos">Ambos Turnos / Rotativo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                  Especialidad Principal
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-3 text-xs text-white font-sans cursor-pointer"
                  >
                    <option value="Fundamentos Técnicos de Básquetbol">Fundamentos Técnicos de Básquetbol (Tiro, Bote, Pases)</option>
                    <option value="Preparación Física & Calistenia">Preparación Física &amp; Calistenia (Salto, Resistencia, Autocarga)</option>
                    <option value="Táctica Ofensiva/Defensiva">Estrategia Táctica (Sistemas, Lectura de Bloqueos, Scouts)</option>
                    <option value="Iniciación Formativa Infantil">Iniciación Formativa (Categorías 6 a 12 Años)</option>
                    <option value="Élite & Selectivo Competitivo">Alto Rendimiento &amp; Selectivos CDMX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1 font-mono">
                  Experiencia o Certificaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Lic. en Educación Física, certificación FIBA, experiencia en ligas juveniles..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#07090e] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl p-3 text-xs text-white placeholder-zinc-600 font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-lg shadow-[#ea580c]/30 hover:brightness-110 transition cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Registrando Postulación..." : "Enviar Postulación de Coach"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-400 font-mono">
              ¿Ya formas parte del cuerpo técnico?{" "}
              <Link href="/login?role=coach" className="text-[#ea580c] hover:underline font-bold">
                Ingresar al Portal de Coaches &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
