"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { Lock, Mail, ArrowRight, UserPlus, Flame, CreditCard, Sparkles } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      // Forzado estricto: Todo registro y login público es Alumno/Padre
      localStorage.setItem("ww_user_role", "student");
      localStorage.setItem("ww_user_email", email || "atleta@wildwolves.academy");
      if (name) localStorage.setItem("ww_student_name", name);
      
      // Sincronización de cookies para Middleware
      document.cookie = "user_role=student; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `user_email=${encodeURIComponent(email || "atleta@wildwolves.academy")}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event("auth_changed"));
    }

    // Sincronizar con el store oficial
    HoopStore.loginAsStudent(email ? `stu_${email.replace(/[^a-zA-Z0-9]/g, '_')}` : "student_01", name, email);
    router.push("/dashboard-student");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0284c7]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#161b26] border border-[#0284c7]/40 px-3.5 py-1 rounded-full text-xs font-bold text-[#38bdf8] mb-3 shadow-lg">
            <Flame className="w-4 h-4 text-[#38bdf8] animate-pulse" /> ACCESO FAMILIA & ATLETAS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            WILD <span className="text-[#0284c7]">WOLVES</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Portal Oficial de Alumnos y Padres de Familia</p>

          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-[#161b26] border border-emerald-500/40 rounded-full font-mono text-[11px] text-emerald-400">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarifa Oficial: <strong>$50 MXN / Clase</strong></span>
          </div>
        </div>

        <div className="bg-[#161b26]/90 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex border-b border-zinc-800 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 text-center font-bold text-sm pb-2 transition cursor-pointer ${
                !isRegister ? "text-[#38bdf8] border-b-2 border-[#38bdf8]" : "text-zinc-500 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 text-center font-bold text-sm pb-2 transition cursor-pointer ${
                isRegister ? "text-[#38bdf8] border-b-2 border-[#38bdf8]" : "text-zinc-500 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5 font-mono">
                  Nombre del Atleta o Tutor
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodrigo Mendoza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#0284c7] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white transition placeholder-zinc-600 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5 font-mono">
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
                  className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#0284c7] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white transition placeholder-zinc-600 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5 font-mono">
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
                  className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#0284c7] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white transition placeholder-zinc-600 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-lg shadow-[#0284c7]/20 hover:brightness-110 transition cursor-pointer active:scale-95"
            >
              <span>{isRegister ? "Completar Registro de Atleta" : "Entrar a mi Perfil"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Información de Soporte */}
          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-[11px]">
              ¿Dudas con tu inscripción o acceso? Contacta a coordinación deportiva en cancha.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
