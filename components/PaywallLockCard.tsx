'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Crown, 
  Sparkles, 
  MessageCircle, 
  KeyRound, 
  Check, 
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import UpgradeModal from '@/components/UpgradeModal';

export interface PaywallLockCardProps {
  isLocked: boolean;
  title: string;
  description: string;
  badgeText?: string;
  planName?: string;
  planPrice?: string;
  studentName?: string;
  studentEmail?: string;
  children: React.ReactNode;
  blurIntensity?: 'sm' | 'md' | 'lg';
  className?: string;
  onUnlocked?: () => void;
}

export default function PaywallLockCard({
  isLocked,
  title,
  description,
  badgeText = 'Acceso Exclusivo Lobo Pro',
  planName = 'Lobo Pro 30 Días',
  planPrice = '$99 MXN',
  studentName = 'Atleta Lobo',
  studentEmail = '',
  children,
  blurIntensity = 'md',
  className = '',
  onUnlocked
}: PaywallLockCardProps) {
  const { setMode } = useSubscriptionTier();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Si no está bloqueado, renderizar directamente los elementos activos
  if (!isLocked) {
    return <>{children}</>;
  }

  const waMessage = encodeURIComponent(
    `¡Hola Coach Ricardo! 🐺🏀 Me interesa adquirir mi ${planName} (${planPrice}) para desbloquear el módulo: "${title}" en Wild Wolves OS.\n\n` +
    `• Atleta: ${studentName}\n` +
    (studentEmail ? `• Correo: ${studentEmail}\n` : '') +
    `¿Me apoya con los datos para activar mi folio por favor?`
  );
  const waUrl = `https://wa.me/525522427769?text=${waMessage}`;

  const blurClass =
    blurIntensity === 'sm'
      ? 'blur-[2px]'
      : blurIntensity === 'lg'
      ? 'blur-[6px]'
      : 'blur-[4px]';

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-amber-500/30 ${className}`}>
      {/* Contenido protegido en segundo plano con filtro desenfocado y no interactivo */}
      <div 
        aria-hidden="true"
        className={`pointer-events-none select-none opacity-30 filter ${blurClass} transition-all duration-300`}
      >
        {children}
      </div>

      {/* Capa de oscurecimiento y gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/75 via-[#090d16]/90 to-[#090d16]/95 backdrop-blur-[2px]" />

      {/* Tarjeta Central de Paywall */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="max-w-md w-full bg-[#0c101c]/95 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative">
          
          {/* Insignia y Corona */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest font-black mb-2">
            <Lock className="w-3 h-3 text-amber-400" />
            {badgeText}
          </span>

          <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide mb-1.5">
            {title}
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            {description}
          </p>

          <div className="flex items-center justify-center gap-2 mb-4 bg-black/50 border border-zinc-800 rounded-xl py-2 px-3">
            <span className="text-xl font-black text-amber-400 font-mono">{planPrice}</span>
            <span className="text-[11px] text-zinc-400">pago único sin cargos recurrentes</span>
          </div>

          {/* Botones de Conversión */}
          <div className="space-y-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95 text-center"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Solicitar Folio por WhatsApp</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 hover:border-amber-500/50 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Canjear Folio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('pro');
                  if (onUnlocked) onUnlocked();
                }}
                className="py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold transition flex items-center justify-center gap-1"
                title="Desbloquear temporalmente en modo demo para pruebas"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Demo Pro</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Paywall Flotante Completo si desea ver todos los beneficios */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureTitle={title}
          featureDescription={description}
          studentName={studentName}
          studentEmail={studentEmail}
          onActivated={() => {
            setShowUpgradeModal(false);
            if (onUnlocked) onUnlocked();
          }}
        />
      )}
    </div>
  );
}
