'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Crown, RefreshCw, Home, LogIn, KeyRound } from 'lucide-react';

export default function MasterBunkerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Búnker Central Exception Handler:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05070a] text-zinc-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-md w-full bg-[#0d1017] border border-amber-500/40 p-8 rounded-3xl text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <Crown className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
          Comandancia General • Modo Seguro
        </div>

        <h2 className="text-xl font-black uppercase text-white tracking-wide mb-2">
          Sesión de Dirección no detectada
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          No se pudieron validar las credenciales de SuperAdmin en tiempo real o la conexión con Supabase fue interrumpida. Puedes reintentar la conexión o ingresar mediante Llave Maestra.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión Segura</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Recargar Búnker con Llave Maestra</span>
          </button>

          <Link
            href="/"
            className="block py-2 text-xs text-zinc-500 hover:text-white transition"
          >
            &larr; Volver al Portal Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
