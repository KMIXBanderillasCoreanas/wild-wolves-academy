"use client";

import React, { useState } from "react";
import { 
  X, 
  Crown, 
  Zap, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Award,
  KeyRound
} from "lucide-react";

interface LoboProModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentEmail?: string;
  onActivated?: (plan: "pro" | "elite_familiar") => void;
}

export default function LoboProModal({
  isOpen,
  onClose,
  studentName = "Atleta Lobo",
  studentEmail = "",
  onActivated
}: LoboProModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "elite_familiar">("pro");
  const [activationCode, setActivationCode] = useState<string>("");
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Enlace directo al WhatsApp oficial del Head Coach Ricardo
  const handleOpenWhatsApp = () => {
    const planLabel = selectedPlan === "pro" 
      ? "Atleta Lobo Pro ($99 MXN/mes)" 
      : "Pack Familiar Élite ($149 MXN/mes)";

    const message = `Hola Coach Ricardo, deseo activar la suscripción Lobo Pro para mi cuenta en Wild Wolves CDMX.\n\nAtleta: ${studentName}\nCorreo: ${studentEmail || "registrado en duela"}\nPlan solicitado: ${planLabel}`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/525522427769?text=${encoded}`;
    window.open(url, "_blank");
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeSuccess(null);
    setCodeError(null);

    const clean = activationCode.trim().toUpperCase();
    if (!clean) {
      setCodeError("Por favor ingresa un folio o código de activación.");
      return;
    }

    // Códigos canónicos oficiales o folios de duela
    if (
      clean.startsWith("WW-PRO-") || 
      clean.startsWith("FOLIO-") || 
      clean === "WOLVES2026" || 
      clean === "CARMEN-SERDAN-PRO"
    ) {
      setCodeSuccess(`¡Suscripción ${selectedPlan === "pro" ? "Lobo Pro" : "Familiar Élite"} activada con éxito para ${studentName}!`);
      if (onActivated) {
        onActivated(selectedPlan);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setCodeError("Folio no reconocido. Solicita tu código oficial con el Coach Ricardo en duela.");
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c0f17] border border-orange-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                Membresía Exclusiva
              </span>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Desbloquea Lobo Pro <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Planes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Plan 1: Atleta Lobo Pro */}
          <div 
            onClick={() => setSelectedPlan("pro")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === "pro"
                ? "bg-gradient-to-b from-orange-950/40 to-[#121622] border-orange-500 shadow-xl shadow-orange-500/20 scale-[1.02]"
                : "bg-[#10141f] border-zinc-800 hover:border-zinc-700 opacity-80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase">Atleta Lobo Pro</span>
                {selectedPlan === "pro" && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-black font-mono text-white">$99</span>
                <span className="text-[11px] text-zinc-400 font-mono">MXN/mes</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1.5 mt-3 font-sans">
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>50 Consultas IA / mes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Plan nutricional personalizado</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Análisis de biomecánica de tiro</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan 2: Pack Familiar Élite */}
          <div 
            onClick={() => setSelectedPlan("elite_familiar")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === "elite_familiar"
                ? "bg-gradient-to-b from-purple-950/40 to-[#121622] border-purple-400 shadow-xl shadow-purple-500/20 scale-[1.02]"
                : "bg-[#10141f] border-zinc-800 hover:border-zinc-700 opacity-80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase">Pack Familiar Élite</span>
                {selectedPlan === "elite_familiar" && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-black font-mono text-white">$149</span>
                <span className="text-[11px] text-zinc-400 font-mono">MXN/mes</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1.5 mt-3 font-sans">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Consultas ilimitadas (Atleta + Tutor)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Reportes médicos y de progresión</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Prioridad en Combine & Torneos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón Principal: Activación vía WhatsApp */}
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span>Activar con Coach Ricardo por WhatsApp</span>
        </button>

        {/* Validación por Folio / Código de Cancha */}
        <form onSubmit={handleValidateCode} className="pt-2 border-t border-zinc-800/80 space-y-2">
          <label className="text-[11px] font-mono font-bold text-zinc-400 block flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-orange-400" /> ¿Ya tienes un folio o código de activación de duela?
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="Ej. WW-PRO-2026 o FOLIO-77"
              className="flex-1 h-10 px-3 bg-[#10141f] border border-zinc-700 rounded-xl text-xs font-mono text-white uppercase focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="px-4 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Canjear
            </button>
          </div>

          {codeSuccess && (
            <p className="text-[11px] font-mono text-emerald-400 font-bold animate-in fade-in">
              {codeSuccess}
            </p>
          )}

          {codeError && (
            <p className="text-[11px] font-mono text-red-400 font-bold animate-in fade-in">
              {codeError}
            </p>
          )}
        </form>

      </div>
    </div>
  );
}
