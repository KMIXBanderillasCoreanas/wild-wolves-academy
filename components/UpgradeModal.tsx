'use client';

import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Zap, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Film, 
  Scale, 
  Brain, 
  Lock, 
  KeyRound, 
  ArrowRight,
  ExternalLink,
  Award,
  Flame,
  Check
} from 'lucide-react';
import { canjearFolioActivacion } from '@/app/actions/subscription-actions';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';

export interface UpgradeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  featureTitle?: string;
  featureDescription?: string;
  studentName?: string;
  studentEmail?: string;
  userId?: string;
  variant?: 'modal' | 'inline' | 'card';
  onActivated?: () => void;
}

export default function UpgradeModal({
  isOpen = true,
  onClose,
  featureTitle = 'Contenido Exclusivo para Atletas Lobo Pro',
  featureDescription = 'Esta lección de video táctico y las herramientas de análisis biomecánico requieren una membresía activa de 30 días.',
  studentName = 'Atleta Lobo',
  studentEmail = '',
  userId = '',
  variant = 'modal',
  onActivated
}: UpgradeModalProps) {
  const { setMode } = useSubscriptionTier();
  const [folioInput, setFolioInput] = useState('');
  const [folioLoading, setFolioLoading] = useState(false);
  const [folioError, setFolioError] = useState<string | null>(null);
  const [folioSuccess, setFolioSuccess] = useState<string | null>(null);
  const [showFolioInput, setShowFolioInput] = useState(false);

  // Mensaje predeterminado de WhatsApp para el Coach Ricardo
  const waMessage = encodeURIComponent(
    `¡Hola Coach Ricardo! 🐺🏀 Me interesa adquirir mi Folio Lobo Pro de 30 días ($99 MXN) para desbloquear la Videoteca Táctica, la Visión de Báscula y las herramientas de IA en Wild Wolves OS.\n\n` +
    `• Atleta: ${studentName || 'Alumno de la Academia'}\n` +
    (studentEmail ? `• Correo: ${studentEmail}\n` : '') +
    `• Módulo de interés: ${featureTitle}\n\n` +
    `¿Me comparte la cuenta de depósito o enlace de pago por favor?`
  );

  const waUrl = `https://wa.me/525522427769?text=${waMessage}`;

  const handleRedeemFolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folioInput.trim()) return;

    setFolioLoading(true);
    setFolioError(null);
    setFolioSuccess(null);

    try {
      const res = await canjearFolioActivacion(folioInput.trim(), userId || 'demo-user');
      if (res.success) {
        setFolioSuccess(res.message || '¡Folio activado con éxito por 30 días!');
        setMode('pro');
        if (onActivated) onActivated();
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        setFolioError(res.message || 'Código de folio no válido o ya utilizado.');
      }
    } catch (err: any) {
      setFolioError('Error al validar folio: ' + (err?.message || 'Intente de nuevo.'));
    } finally {
      setFolioLoading(false);
    }
  };

  // Contenido interno reutilizable
  const content = (
    <div className="relative w-full overflow-hidden rounded-3xl border border-amber-500/40 bg-[#0a0d16] text-zinc-100 shadow-2xl backdrop-blur-xl">
      {/* Resplandor decorativo de fondo */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-600/10 blur-3xl" />

      {/* Header con insignia */}
      <div className="border-b border-zinc-800/80 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-orange-600/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Crown className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3 w-3" /> Membresía Oficial de Duela
              </div>
              <h3 className="mt-1 text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                Acceso Exclusivo Atleta Lobo Pro / Pack Familiar Élite
              </h3>
            </div>
          </div>

          {variant === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Banner de característica bloqueada */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
          <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">{featureTitle}</span>
            <p className="text-zinc-300 text-[11px]">{featureDescription}</p>
          </div>
        </div>

        {/* 3 Grandes Beneficios */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            ¿Qué incluye el Folio Lobo Pro de 30 días?
          </span>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Beneficio 1: Videoteca */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0d1220]/80 p-4 transition hover:border-cyan-500/40 hover:bg-[#0d1220]">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <Film className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Videoteca Táctica</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Curriculum Carmen Serdán con lecciones completas de tiro, pick & roll y fundamentos FIBA.
              </p>
            </div>

            {/* Beneficio 2: IA Rendimiento */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0d1220]/80 p-4 transition hover:border-purple-500/40 hover:bg-[#0d1220]">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
                <Brain className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">IA de Duela</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Análisis biomecánico, corrección de postura de tiro y plan de saltos personalizado.
              </p>
            </div>

            {/* Beneficio 3: Báscula Visión */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0d1220]/80 p-4 transition hover:border-emerald-500/40 hover:bg-[#0d1220]">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Scale className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Visión de Báscula</h4>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Sube capturas de pantalla de báscula OKOK o bioimpedancia y registra grasa y músculo al instante.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Precio y Acción Principal */}
        <div className="rounded-2xl border border-zinc-700/80 bg-gradient-to-r from-zinc-900 via-[#0d1220] to-zinc-900 p-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-white">$99</span>
                <span className="text-xs font-mono uppercase text-zinc-400">MXN / 30 Días</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Pago único sin cargos recurrentes forzados ni tarjetas obligatorias.
              </p>
            </div>

            {/* Botón de Adquisición vía WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/50 transition-all hover:brightness-110 active:scale-95 text-center"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Pedir Folio por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Canje de Folio si ya tiene uno */}
        <div className="border-t border-zinc-800/80 pt-4">
          {!showFolioInput ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">¿Ya tienes un código de activación de 30 días?</span>
              <button
                type="button"
                onClick={() => setShowFolioInput(true)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline transition"
              >
                Canjear Código Aquí &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleRedeemFolio} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Ej. WOLVES-PRO-99-XXXX"
                    value={folioInput}
                    onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-zinc-700 bg-black/60 py-2.5 pl-9 pr-3 text-xs font-mono uppercase text-white outline-none focus:border-amber-500 tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  disabled={folioLoading || !folioInput.trim()}
                  className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black uppercase text-black hover:bg-amber-400 disabled:opacity-50 transition"
                >
                  {folioLoading ? 'Validando...' : 'Canjear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFolioInput(false)}
                  className="p-2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Cancelar
                </button>
              </div>

              {folioError && (
                <p className="text-[11px] font-mono text-red-400">{folioError}</p>
              )}
              {folioSuccess && (
                <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> {folioSuccess}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Si es modalidad modal flotante
  if (variant === 'modal') {
    if (!isOpen) return null;
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Ventana de Actualización Lobo Pro"
      >
        <div className="w-full max-w-2xl">{content}</div>
      </div>
    );
  }

  // Si es modalidad inline / card (paywall dentro de la página)
  return <div className="w-full max-w-2xl mx-auto my-4">{content}</div>;
}
