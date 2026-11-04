'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, Home, MessageSquare, LogIn } from 'lucide-react';

export default function StudentDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal del Atleta Exception Handler:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-white">
      <div className="max-w-md w-full bg-[#0d1017] border border-amber-500/30 p-8 rounded-3xl text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
          Portal del Atleta • Modo de Recuperación Segura
        </div>

        <h2 className="text-xl font-black uppercase text-white tracking-wide mb-2">
          Sincronización en Duela Temporalmente Interrumpida
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          Ocurrió una interrupción al cargar las métricas deportivas o la sesión expiró. Puedes reintentar la conexión o comunicarte directamente con el Coach Ricardo por WhatsApp.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión</span>
          </button>

          <a
            href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo%2C%20tuve%20un%20inconveniente%20al%20acceder%20a%20mi%20Portal%20de%20Atleta%20en%20Wild%20Wolves.%20%C2%BFMe%20apoya%20con%20mi%20sesi%C3%B3n%20por%20favor%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contactar al Coach Ricardo (WhatsApp)</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Link
              href="/login"
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </Link>

            <Link
              href="/"
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
