"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { Crown, Key, ShieldAlert, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function HeadCoachMasterHQ() {
  const router = useRouter();
  const [masterKey, setMasterKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState(false);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = masterKey.trim().toUpperCase();
    let adminEmail = "director@wildwolves.mx";

    if (normalized === "RICARDO-WOLVES-2026") {
      adminEmail = "ricardo@wildwolves.mx";
    } else if (normalized === "CARLOS-WOLVES-2026") {
      adminEmail = "carlos@wildwolves.mx";
    } else if (normalized === "WW-SUPERADMIN-KEY-99") {
      adminEmail = "director@wildwolves.mx";
    } else {
      setError(true);
      return;
    }

    // Otorga privilegios irrestrictos de superadmin
    if (typeof window !== "undefined") {
      localStorage.setItem("ww_user_role", "superadmin");
      localStorage.setItem("ww_user_email", adminEmail);
      document.cookie = "user_role=superadmin; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `user_email=${encodeURIComponent(adminEmail)}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event("auth_changed"));
    }

    HoopStore.loginAsCoach();
    router.push("/dashboard-coach?full_access=unrestricted");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* Luz dorada de seguridad */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

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

      <div className="w-full max-w-md bg-[#0f131c] border border-amber-500/40 p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] z-10">
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-2">
            <Crown className="w-3.5 h-3.5" /> DIRECCIÓN GENERAL • NIVEL 0
          </div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">Master Head Coach HQ</h2>
          <p className="text-xs text-zinc-400 mt-1">Consola de Mando Directivo • Deportivo Carmen Serdán</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-2 animate-fadeIn font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Clave de autorización no válida. Acceso restringido.</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">
              CLAVE MAESTRA DE SUPERADMINISTRADOR
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <input
                type={showKey ? "text" : "password"}
                required
                placeholder="Ingresa clave personal..."
                value={masterKey}
                onChange={(e) => { setMasterKey(e.target.value); setError(false); }}
                className="w-full bg-[#090d16] border border-amber-500/30 focus:border-amber-500 focus:outline-none rounded-xl py-3 pl-10 pr-10 text-sm text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Consola protegida con blindaje RBAC y registro de auditoría.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 font-bold rounded-xl text-sm transition mt-2 text-white shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Desbloquear Privilegios Directivos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <Link
            href="/master-bunker-hq"
            className="text-xs font-mono text-zinc-400 hover:text-amber-400 transition"
          >
            &rarr; Ir al Búnker Central (Finanzas &amp; Coaches)
          </Link>
        </div>
      </div>
    </div>
  );
}
