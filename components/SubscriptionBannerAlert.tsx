"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Clock, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Crown,
  Zap,
  ShieldAlert,
  X
} from "lucide-react";
import { generarSugerenciaRenovacionAction } from "@/app/actions/membership-actions";

interface SubscriptionBannerAlertProps {
  status?: "FREE" | "ACTIVE" | "EXPIRED";
  plan?: "FREE" | "PRO_99" | "ELITE_149";
  remainingDays?: number | null;
  studentName?: string;
  onOpenUpgradeModal?: () => void;
}

export default function SubscriptionBannerAlert({
  status = "FREE",
  plan = "FREE",
  remainingDays = null,
  studentName = "Atleta Lobo",
  onOpenUpgradeModal
}: SubscriptionBannerAlertProps) {
  const [kimiSuggestion, setKimiSuggestion] = useState<string | null>(null);
  const [loadingKimi, setLoadingKimi] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Solo mostrar si faltan <= 5 días o si ya expiró
  const isExpiringSoon = status === "ACTIVE" && remainingDays !== null && remainingDays <= 5 && remainingDays > 0;
  const isExpired = status === "EXPIRED" || (status === "ACTIVE" && remainingDays !== null && remainingDays <= 0);

  if (!isExpiringSoon && !isExpired) {
    return null;
  }

  const planLabel = plan === "ELITE_149" ? "Pack Familiar Élite ($149 MXN)" : "Atleta Lobo Pro ($99 MXN)";

  // Enlace directo de renovación a WhatsApp con el Coach Ricardo
  const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    isExpired
      ? `Hola Coach Ricardo, mi suscripción de *${planLabel}* en Wild Wolves CDMX ha expirado. Quisiera renovar mi membresía para reactivar mis consultas de IA y telemetría de duela.\n\n🐺 Atleta: ${studentName}`
      : `Hola Coach Ricardo, mi suscripción de *${planLabel}* vence en *${remainingDays} día(s)*. Quisiera renovar mi membresía para no perder mis análisis biomecánicos y consultas en Carmen Serdán.\n\n🐺 Atleta: ${studentName}`
  )}`;

  const handleFetchKimiSuggestion = async () => {
    if (kimiSuggestion) {
      setModalOpen(true);
      return;
    }

    try {
      setLoadingKimi(true);
      const res = await generarSugerenciaRenovacionAction({
        studentName,
        daysRemaining: remainingDays || 1,
        planType: plan
      });
      if (res.success && res.text) {
        setKimiSuggestion(res.text);
      }
      setModalOpen(true);
    } catch {
      setKimiSuggestion(
        "🐺 Recuerda renovar tu membresía para mantener activas las 50 consultas de IA, la biomecánica de tiro contra defensores altos y la telemetría oficial de cancha en Carmen Serdán."
      );
      setModalOpen(true);
    } finally {
      setLoadingKimi(false);
    }
  };

  return (
    <>
      <div 
        className={`w-full rounded-2xl p-4 sm:p-5 border transition-all duration-300 shadow-xl ${
          isExpired
            ? "bg-gradient-to-r from-red-950/60 via-[#181014] to-[#0e111a] border-red-500/50 shadow-red-950/40"
            : "bg-gradient-to-r from-amber-950/60 via-[#181410] to-[#0e111a] border-amber-500/50 shadow-amber-950/40"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isExpired
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse"
              }`}
            >
              {isExpired ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isExpired
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {isExpired ? "Ciclo de 30 Días Vencido" : `Vence en ${remainingDays} día${remainingDays === 1 ? "" : "s"}`}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Plan actual: <b className="text-white">{planLabel}</b>
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight mt-1">
                {isExpired 
                  ? "Tu suscripción ha finalizado • Reactiva hoy para continuar" 
                  : `¡Aviso de Renovación! Tu ciclo de 30 días concluye pronto`}
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                {isExpired
                  ? "Tus consultas han vuelto al nivel Free (5 mensuales). Renueva para reactivar 50 consultas y telemetría de tiro."
                  : `Te quedan ${remainingDays} día${remainingDays === 1 ? "" : "s"} para renovar sin perder tus registros tácticos y análisis biomecánicos.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleFetchKimiSuggestion}
              disabled={loadingKimi}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loadingKimi ? "animate-spin text-amber-400" : ""}`} />
              <span>{loadingKimi ? "Analizando..." : "¿Por qué renovar? (Kimi IA)"}</span>
            </button>

            <a
              href={coachWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                isExpired
                  ? "bg-red-600 hover:bg-red-500 shadow-red-950/50"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50"
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Renovar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Modal de Sugerencia Kimi IA */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f131d] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                    Asesor Deportivo Kimi CRM
                  </span>
                  <h4 className="text-sm font-black uppercase text-white tracking-wide">
                    Ventajas de Renovar {planLabel}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {kimiSuggestion}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
              >
                Entendido
              </button>
              <a
                href={coachWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Contactar Coach Ricardo</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
