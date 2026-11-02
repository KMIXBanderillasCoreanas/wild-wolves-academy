'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, LogIn } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Unhandled Client Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-md w-full bg-[#0c101c] border border-amber-500/40 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Emblema */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
          Sesión o Red en Calibración • Wild Wolves CDMX
        </span>

        <h2 className="text-xl font-black uppercase text-white tracking-wide mb-2">
          Sesión no detectada o Conexión Interrumpida
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          No se pudo sincronizar la telemetría de duela o la sesión de usuario expiró. Puedes reintentar la conexión segura o volver al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-black/60 border border-red-500/30 text-red-300 font-mono text-[11px] text-left max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión Segura</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/login"
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </Link>

            <Link
              href="/"
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ir al Inicio</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
          Deportivo Carmen Serdán • Sistema Operativo Wild Wolves
        </div>
      </div>
    </div>
  );
}
