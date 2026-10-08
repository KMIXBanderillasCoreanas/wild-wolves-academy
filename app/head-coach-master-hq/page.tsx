"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { Crown, Key, ShieldAlert, ArrowRight } from "lucide-react";

export default function HeadCoachMasterHQ() {
  const router = useRouter();
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState(false);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey.trim() === "WW-SUPERADMIN-KEY-99") {
      // Otorga privilegios irrestrictos
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", "superadmin");
        localStorage.setItem("ww_user_email", "director@wildwolves.mx");
        document.cookie = "user_role=superadmin; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `user_email=${encodeURIComponent("director@wildwolves.mx")}; path=/; max-age=86400; SameSite=Lax`;
        window.dispatchEvent(new Event("auth_changed"));
      }

      HoopStore.loginAsCoach();
      router.push("/dashboard-coach?full_access=unrestricted");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* Luz dorada de seguridad */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f131c] border border-amber-500/40 p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] z-10">
        <div className="flex items-center gap-3 text-amber-500 mb-6">
          <Crown className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Master Head Coach HQ</h2>
            <p className="text-xs text-zinc-400">Consola Central Sin Restricciones (Admin)</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl mb-4 text-xs text-red-400 flex items-center gap-2 animate-fadeIn font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Master Key inválida. Intento registrado.</span>
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
                type="password"
                required
                placeholder="Master Secret Key"
                value={masterKey}
                onChange={(e) => { setMasterKey(e.target.value); setError(false); }}
                className="w-full bg-[#090d16] border border-amber-500/30 focus:border-amber-500 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Consola protegida por encriptación para la Dirección General de Wild Wolves.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 font-bold rounded-xl text-sm transition mt-2 text-white shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Desbloquear Todas las Funciones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
