'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CoachDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error capturado en /dashboard-coach:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Búnker Técnico • Error de Inicialización
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Interrupción en Panel Técnico
          </h2>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Se detectó una discrepancia al sincronizar los datos de atletas o la sesión del Coach.
          </p>
        </div>

        {error?.message && (
          <div className="bg-[#0a0d14] border border-[#27272a] p-3 rounded-xl text-left">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Detalle del error:</span>
            <p className="text-xs font-mono text-rose-400 break-words line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-lg shadow-orange-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recargar Panel</span>
          </button>
          <Link
            href="/master-bunker-hq"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#27272a] hover:bg-zinc-700 text-zinc-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Búnker HQ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
