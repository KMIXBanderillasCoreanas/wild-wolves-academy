'use client';

import React, { useState } from 'react';
import { Search, Sparkles, X, Brain } from 'lucide-react';

interface VideoSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialQuery?: string;
  detectedIntent?: string;
}

export default function VideoSearchBar({
  onSearch,
  isLoading = false,
  initialQuery = '',
  detectedIntent
}: VideoSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
    onSearch(prompt);
  };

  const quickPrompts = [
    { label: '🎯 Mecánica de Tiro & Gather', prompt: 'Mecánica de tiro NBA y paso cero' },
    { label: '⚡ Crossover & Desaceleración', prompt: 'Dominio de crossover y frenado en 45 grados' },
    { label: '🛡️ Postura Defensiva 1v1', prompt: 'Postura defensiva de alta competición y negación' },
    { label: '🏀 Pick & Roll y Rebotes', prompt: 'Lectura de pick and roll y física de rebotes' },
    { label: '💥 Salto Vertical & Calistenia', prompt: 'Ejercicios de calistenia para salto vertical' },
    { label: '💧 Hidratación de Duela', prompt: 'Hidratación pre y post entrenamiento con electrolitos' }
  ];

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-cyan-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pregunta al Lobo Táctico: Ej. '¿Cómo mejorar mi salto vertical sin lesionarme?'"
            className="w-full rounded-2xl border border-cyan-500/30 bg-[#0d1322] py-3.5 pl-12 pr-28 text-sm text-zinc-100 placeholder-zinc-500 shadow-xl focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <Sparkles className="h-4 w-4 animate-spin text-cyan-200" />
              ) : (
                <>
                  <Brain className="h-3.5 w-3.5" />
                  Buscar IA
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Chips de Búsqueda Rápida */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold shrink-0">
          Sugerencias:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPrompt(qp.prompt)}
            className="shrink-0 rounded-lg border border-zinc-800 bg-[#12182b] px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-[#15203b] transition"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Intención detectada por IA */}
      {detectedIntent && (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-3 py-1.5 text-xs text-cyan-300">
          <Brain className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span className="font-mono text-[11px]">Intención IA: {detectedIntent}</span>
        </div>
      )}
    </div>
  );
}
