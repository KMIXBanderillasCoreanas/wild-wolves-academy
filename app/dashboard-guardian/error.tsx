'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Users, RefreshCw, Home, MessageSquare, LogIn } from 'lucide-react';

export default function GuardianDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal del Tutor Exception Handler:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex items-center justify-center p-4 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-md w-full bg-[#0d1017] border border-purple-500/30 p-8 rounded-3xl text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-lg shadow-purple-500/10">
          <Users className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
          Acompañamiento Familiar • Modo Seguro
        </div>

        <h2 className="text-xl font-black uppercase text-white tracking-wide mb-2">
          Sesión de Tutor no detectada
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          No se pudieron cargar los datos del atleta representado o la sesión expiró. Puedes reintentar la conexión o comunicarte directamente con el Head Coach Ricardo por WhatsApp.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión</span>
          </button>

          <a
            href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo%2C%20tuve%20un%20inconveniente%20al%20acceder%20al%20Portal%20del%20Tutor%20de%20mi%20atleta.%20%C2%BFMe%20apoya%20con%20el%20acceso%20por%20favor%3F"
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
