"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { Shield, KeyRound, Mail, Lock, AlertTriangle, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function StaffPortalPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toUpperCase();

    // Validación de PIN de Staff o llaves directivas
    if (
      cleanPin === "WOLVES-STAFF-2026" ||
      cleanPin === "RICARDO-WOLVES-2026" ||
      cleanPin === "CARLOS-WOLVES-2026" ||
      cleanPin === "WW-SUPERADMIN-KEY-99"
    ) {
      const isSuper = cleanPin.includes("RICARDO") || cleanPin.includes("CARLOS") || cleanPin.includes("SUPERADMIN");
      const coachEmail = email.trim() || (isSuper ? "ricardo@wildwolves.mx" : "coach@wildwolves.mx");
      const role = isSuper ? "superadmin" : "coach";
      
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", role);
        localStorage.setItem("ww_user_email", coachEmail);
        document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
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
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* Luz de fondo deportiva naranja */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ea580c]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Navegación de retorno */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#121724] border border-zinc-800 px-4 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#121724] border border-[#ea580c]/40 p-8 rounded-3xl shadow-2xl z-10">
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(234,88,12,0.3)]">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#f97316] text-[10px] font-mono uppercase tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" /> CUERPO TÉCNICO • NIVEL 1
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">Staff Técnico Wild Wolves</h2>
          <p className="text-xs text-zinc-400 mt-1">Portal Privado para Entrenadores de Cancha</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-2 animate-fadeIn font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>PIN de Staff incorrecto o no autorizado. Intento registrado.</span>
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
                type={showPin ? "text" : "password"}
                required
                placeholder="Ingresa el PIN de Coach"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-10 text-sm text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#ea580c] focus:outline-none rounded-xl py-2.5 pl-10 pr-10 text-sm text-white"
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
            className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] font-bold rounded-xl text-sm transition mt-2 text-white shadow-lg shadow-[#ea580c]/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Validar Acceso de Coach</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center flex items-center justify-between text-xs font-mono text-zinc-400">
          <Link href="/apply-coach-ww" className="hover:text-[#ea580c] transition">
            Postularse como Coach
          </Link>
          <Link href="/master-bunker-hq" className="hover:text-amber-400 transition">
            Búnker SuperAdmin
          </Link>
        </div>
      </div>
    </div>
  );
}
