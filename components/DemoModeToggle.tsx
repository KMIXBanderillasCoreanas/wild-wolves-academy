'use client';

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Lock, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';

interface DemoModeToggleProps {
  variant?: 'floating' | 'navbar' | 'compact';
  className?: string;
}

export default function DemoModeToggle({
  variant = 'floating',
  className = ''
}: DemoModeToggleProps) {
  const { isPro, mode, isDemoActive, setMode, toggleDemo, resetToAuto } = useSubscriptionTier();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Variante NAVBAR (Píldora interactiva para barra de navegación)
  if (variant === 'navbar') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={toggleDemo}
          title="Alternar entre modo Gratuito y Lobo Pro para pruebas de duela"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer select-none active:scale-95 ${
            isPro
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300 hover:border-amber-400'
              : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
          }`}
        >
          {isPro ? (
            <>
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-[11px] tracking-wide text-amber-200">DEMO: PRO $99</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-[11px] tracking-wide text-zinc-300">DEMO: GRATIS</span>
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            </>
          )}
        </button>
      </div>
    );
  }

  // Variante COMPACTA (para headers o tarjetas)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-xl p-1 ${className}`}>
        <button
          type="button"
          onClick={() => setMode('free')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 ${
            !isPro
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>GRATIS</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('pro')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 ${
            isPro
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Crown className="w-3 h-3" />
          <span>PRO $99</span>
        </button>
      </div>
    );
  }

  // Variante FLOATING (Por defecto: botón flotante discreto en esquina inferior derecha)
  return (
    <aside 
      aria-label="Panel de Control Modo Demo"
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-sans select-none ${className}`}
    >
      {/* Panel Desplegable con Detalles de Prueba */}
      {expanded && (
        <div className="w-72 bg-[#0c101c]/95 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Simulador de Duela</span>
            </div>
            {isDemoActive && (
              <button
                type="button"
                onClick={resetToAuto}
                title="Restablecer a suscripción real de la base de datos"
                className="text-[10px] font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Auto
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
            Alterna el estado para previsualizar los candados del paywall (videos exclusivos, visión IA y báscula) o desbloquear todo el sistema:
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode('free')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer ${
                !isPro
                  ? 'bg-zinc-800/90 border-amber-500/60 text-white shadow-md'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Lock className={`w-4 h-4 ${!isPro ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span className="text-[11px] font-bold">Modo Gratis</span>
              <span className="text-[9px] font-mono text-zinc-400">Ver Candados</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pro')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer ${
                isPro
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/30 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Crown className={`w-4 h-4 ${isPro ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span className="text-[11px] font-bold">Lobo Pro ($99)</span>
              <span className="text-[9px] font-mono text-emerald-400">Desbloqueado</span>
            </button>
          </div>

          <div className="bg-black/50 border border-zinc-800 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-zinc-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {isPro
                ? 'Estado actual: Tienes acceso completo a videoteca, radar 360 y análisis IA.'
                : 'Estado actual: Los videos avanzados y la lectura de báscula IA mostrarán la ventana de venta (Paywall).'}
            </span>
          </div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <div className="flex items-center gap-1.5 bg-[#090d16]/95 border border-zinc-700/80 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={toggleDemo}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isPro
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-600/30 font-black'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
          title="Haz clic para alternar entre Modo Gratis y Lobo Pro"
        >
          {isPro ? (
            <>
              <Crown className="w-3.5 h-3.5" />
              <span>Lobo Pro 30D (Activo)</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo Gratuito (Bloqueado)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition border border-zinc-700/60 cursor-pointer"
          title={expanded ? 'Cerrar panel' : 'Configurar simulación de suscripción'}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
