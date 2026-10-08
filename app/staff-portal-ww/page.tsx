"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { Shield, KeyRound, Mail, Lock, AlertTriangle, ArrowRight } from "lucide-react";

export default function StaffPortalPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación estricta del PIN de Entrenador
    if (pin.trim() === "WOLVES-STAFF-2026") {
      const coachEmail = email.trim() || "coach@wildwolves.mx";
      
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", "coach");
        localStorage.setItem("ww_user_email", coachEmail);
        document.cookie = "user_role=coach; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `user_email=${encodeURIComponent(coachEmail)}; path=/; max-age=86400; SameSite=Lax`;
        window.dispatchEvent(new Event("auth_changed"));
      }

      HoopStore.loginAsCoach();
      router.push("/dashboard-coach");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* Luz de fondo deportiva naranja */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ea580c]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#161b26] border border-[#ea580c]/50 p-8 rounded-3xl shadow-2xl z-10">
        <div className="flex items-center gap-3 text-[#ea580c] mb-6">
          <Shield className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Staff Técnico Wild Wolves</h2>
            <p className="text-xs text-zinc-400">Portal Privado para Entrenadores de Cancha</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-2 animate-fadeIn font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>PIN de Staff incorrecto o no autorizado.</span>
          </div>
        )}

        <form onSubmit={handleStaffLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">
              PIN DE AUTORIZACIÓN DEL CLUB
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ea580c]" />
              <input
                type="password"
                required
                placeholder="Ingresa el PIN de Coach"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Clave de seguridad restringida exclusiva para el cuerpo técnico oficial.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">
              Correo de Entrenador
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="coach@wildwolves.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">
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
                className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] font-bold rounded-xl text-sm transition mt-2 text-white shadow-lg shadow-[#ea580c]/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Validar Acceso de Coach</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
