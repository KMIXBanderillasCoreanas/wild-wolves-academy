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
  KeyRound,
  Loader2,
  ExternalLink,
  Users,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { canjearFolioActivacion } from "@/app/actions/subscription-actions";
import { marcarAtletaIndependienteAction } from "@/app/actions/membership-actions";

interface LoboProModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  studentName?: string;
  studentEmail?: string;
  athleteAge?: number;
  hasGuardian?: boolean;
  initialIndependentMinor?: boolean;
  onActivated?: (plan: "pro" | "elite_familiar" | "PRO_99" | "ELITE_149" | any) => void;
}

export default function LoboProModal({
  isOpen,
  onClose,
  userId,
  studentName = "Atleta Lobo",
  studentEmail = "",
  athleteAge = 15,
  hasGuardian = false,
  initialIndependentMinor = false,
  onActivated
}: LoboProModalProps) {
  // 1. REGLA DE HOOKS: Declaración incondicional al inicio absoluto
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "elite_familiar">("pro");
  const [activationCode, setActivationCode] = useState<string>("");
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [isIndependentMinor, setIsIndependentMinor] = useState<boolean>(initialIndependentMinor);
  const [settingIndependent, setSettingIndependent] = useState<boolean>(false);

  // Retorno condicional seguro después de todos los Hooks
  if (!isOpen) return null;

  const isMinorWithoutGuardian = athleteAge < 18 && !hasGuardian && !isIndependentMinor;

  // Enlace dinámico de WhatsApp hacia el Head Coach Ricardo con datos reales codificados
  const handleOpenWhatsApp = () => {
    const planLabel = selectedPlan === "pro" 
      ? "Atleta Lobo Pro ($99 MXN/mes - 50 consultas IA)" 
      : "Pack Familiar Élite ($149 MXN/mes - 100 consultas IA)";

    const effectiveName = studentName && studentName !== "Atleta Lobo"
      ? studentName
      : (typeof window !== "undefined" ? localStorage.getItem("ww_student_name") || "Atleta Wild Wolves" : "Atleta Wild Wolves");
      
    const effectiveAge = athleteAge && athleteAge > 0
      ? athleteAge
      : (typeof window !== "undefined" && localStorage.getItem("ww_athlete_age") ? Number(localStorage.getItem("ww_athlete_age")) : 15);

    const effectiveEmail = studentEmail
      ? studentEmail
      : (typeof window !== "undefined" ? localStorage.getItem("ww_user_email") || "registrado en duela" : "registrado en duela");

    const message = `Hola Coach Ricardo, deseo activar la suscripción *${planLabel}* para mi cuenta en Wild Wolves Basketball Academy CDMX.\n\n🐺 Atleta: ${effectiveName}\n🎂 Edad: ${effectiveAge} años\n📧 Correo: ${effectiveEmail}\n🏀 Sede: Deportivo Carmen Serdán\n\n¿Me podría indicar los pasos para confirmar mi activación?`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/525522427769?text=${encoded}`;
    window.open(url, "_blank");
  };

  // Enlace para que el menor comparta con su tutor legal
  const handleShareWithGuardianWhatsApp = () => {
    const guardianMsg = `Hola! Estoy entrenando en Wild Wolves Basketball Academy CDMX (Deportivo Carmen Serdán). Te comparto la app para que te vincules como mi tutor y puedas consultar mis asistencias, reportes de tiro y activar mi membresía Lobo Pro: https://wildwolves.mx/dashboard-guardian`;
    const url = `https://wa.me/?text=${encodeURIComponent(guardianMsg)}`;
    window.open(url, "_blank");
  };

  // Activación de la excepción para menor independiente
  const handleToggleIndependentMinor = async () => {
    try {
      setSettingIndependent(true);
      await marcarAtletaIndependienteAction({
        studentId: userId,
        studentEmail
      });
      setIsIndependentMinor(true);
    } catch {
      setIsIndependentMinor(true);
    } finally {
      setSettingIndependent(false);
    }
  };

  // Validación y canje mediante la Server Action oficial canjearFolioActivacion
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeSuccess(null);
    setCodeError(null);

    const clean = activationCode.trim().toUpperCase();
    if (!clean) {
      setCodeError("Por favor ingresa un folio o código de activación de duela.");
      return;
    }

    try {
      setIsRedeeming(true);
      const res = await canjearFolioActivacion(clean, userId, studentEmail);

      if (res.success) {
        setCodeSuccess(res.message || "¡Membresía activada con éxito por 30 días!");
        if (onActivated) {
          onActivated(res.plan || selectedPlan);
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setCodeError(res.error || "Folio no reconocido. Solicita tu código oficial con el Coach Ricardo en duela.");
      }
    } catch {
      setCodeError("Error de red al validar folio. Intenta nuevamente o contacta al Coach Ricardo por WhatsApp.");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b0e17] border border-orange-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f66018] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                  Membresías Oficiales (Ciclo 30 Días)
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase font-black">
                  Wild Wolves CDMX
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5 mt-0.5">
                Desbloquea Lobo Pro <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de Cuota Free / Bienvenida */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Nivel actual: <b>5 consultas de IA / mes</b> (o 15 con Bono de Bienvenida)</span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">Deportivo Carmen Serdán</span>
        </div>

        {/* CASO: MENOR DE EDAD SIN TUTOR VINCULADO */}
        {isMinorWithoutGuardian ? (
          <div className="bg-gradient-to-b from-amber-950/40 to-[#121622] border border-amber-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-white tracking-wide">
                  Atleta Menor de Edad ({athleteAge} años)
                </h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Para mantener la seguridad de los atletas formativos, las suscripciones suelen ser gestionadas por un padre o tutor familiar desde el Portal de Familias.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleShareWithGuardianWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Reenviar a mis Tutores</span>
              </button>

              <button
                type="button"
                onClick={handleToggleIndependentMinor}
                disabled={settingIndependent}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{settingIndependent ? "Activando..." : "Soy atleta independiente"}</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono text-center">
              Si tus tutores no utilizan la app, el modo independiente te permite coordinar tu plan directamente con Coach Ricardo.
            </p>
          </div>
        ) : (
          /* VISTA DE ADQUISICIÓN DIRECTA DESBLOQUEADA */
          <>
            {isIndependentMinor && athleteAge < 18 && (
              <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-mono text-orange-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Modo Atleta Independiente activo ({athleteAge} años). Pago coordinado con Coach Ricardo.</span>
              </div>
            )}

            {/* Selector Interactivo de Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Tarjeta 1: Atleta Lobo Pro ($99) */}
              <div 
                onClick={() => setSelectedPlan("pro")}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "pro"
                    ? "bg-gradient-to-b from-orange-950/60 via-[#131722] to-[#0c0f17] border-[#f66018] shadow-[0_0_28px_rgba(246,96,24,0.38)] ring-2 ring-orange-500/70 scale-[1.02]"
                    : "bg-[#0f131d] border-zinc-800/90 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wide">
                      Atleta Lobo Pro
                    </span>
                    {selectedPlan === "pro" ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded bg-orange-500 text-black">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ELEGIDO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Seleccionar</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black font-mono text-white">$99</span>
                    <span className="text-xs text-zinc-400 font-mono">MXN / 30 días</span>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl px-2.5 py-1.5 my-2.5 text-[11px] font-mono font-bold text-orange-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>50 Consultas IA / mes</span>
                  </div>

                  <ul className="text-[11px] text-zinc-300 space-y-2 mt-3 font-sans">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span><b>Módulo de Biomecánica:</b> Detección de salto vertical y postura.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span><b>Táctica vs Defensas Altos:</b> Fintas, ángulos y flotadoras.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>Series 3x25 de calistenia para duela exterior.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tarjeta 2: Pack Familiar Élite ($149) */}
              <div 
                onClick={() => setSelectedPlan("elite_familiar")}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "elite_familiar"
                    ? "bg-gradient-to-b from-fuchsia-950/60 via-[#131722] to-[#0c0f17] border-fuchsia-500 shadow-[0_0_28px_rgba(217,70,239,0.38)] ring-2 ring-fuchsia-500/70 scale-[1.02]"
                    : "bg-[#0f131d] border-zinc-800/90 hover:border-zinc-700 opacity-75 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase tracking-wide">
                      Pack Familiar Élite
                    </span>
                    {selectedPlan === "elite_familiar" ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded bg-fuchsia-500 text-black">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ELEGIDO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Seleccionar</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black font-mono text-white">$149</span>
                    <span className="text-xs text-zinc-400 font-mono">MXN / 30 días</span>
                  </div>

                  <div className="bg-fuchsia-500/10 border border-fuchsia-500/25 rounded-xl px-2.5 py-1.5 my-2.5 text-[11px] font-mono font-bold text-fuchsia-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                    <span>100 Consultas IA compartidas / mes</span>
                  </div>

                  <ul className="text-[11px] text-zinc-300 space-y-2 mt-3 font-sans">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span><b>Acceso Compartido:</b> Para el alumno y sus tutores legales.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span><b>Reportes Detallados:</b> Expedientes descargables para familias.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>Prioridad en Combine, Torneos y Asesoría Directa.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Botón Principal: Activación Dinámica vía WhatsApp */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>
                Activar {selectedPlan === "pro" ? "Atleta Lobo Pro ($99 MXN)" : "Pack Familiar Élite ($149 MXN)"} por WhatsApp
              </span>
              <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
            </button>
          </>
        )}

        {/* Validación y Canje de Folio / Código de Activación */}
        <form onSubmit={handleValidateCode} className="pt-3 border-t border-zinc-800/80 space-y-2.5">
          <label className="text-[11px] font-mono font-bold text-zinc-400 block flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-orange-400" /> ¿Cuentas con un folio de activación o cupón promocional?
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="Ej. WW-PRO-2026, WW-FAM-2026 o BIENVENIDA-15"
              disabled={isRedeeming}
              className="flex-1 h-11 px-3.5 bg-[#0f131d] border border-zinc-700 rounded-xl text-xs font-mono text-white uppercase focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isRedeeming}
              className="px-5 h-11 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span>Validando...</span>
                </>
              ) : (
                <span>Canjear</span>
              )}
            </button>
          </div>

          {codeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{codeSuccess}</span>
            </div>
          )}

          {codeError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-[11px] font-mono text-red-300 font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{codeError}</span>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
