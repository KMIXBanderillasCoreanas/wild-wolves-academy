'use client';

import React, { useState } from 'react';
import { RopeSession } from '@/lib/types';
import { 
  Zap, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Flame, 
  Award,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RopeTrackerProps {
  sessions: RopeSession[];
  onToggleSession?: (day: number) => void;
  readOnly?: boolean;
  athleteName?: string;
}

export function RopeTracker({
  sessions,
  onToggleSession,
  readOnly = false,
  athleteName,
}: RopeTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = sessions.filter((s) => s.completed).length;
  const progressPct = Math.round((completedCount / sessions.length) * 100);
  const totalJumpsCompleted = sessions
    .filter((s) => s.completed)
    .reduce((acc, curr) => acc + curr.targetJumps, 0);

  const handleToggle = (day: number, alreadyCompleted: boolean) => {
    if (readOnly) return;
    if (onToggleSession) {
      onToggleSession(day);
      if (!alreadyCompleted) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#f97316', '#fbbf24', '#38bdf8'],
          });
        } catch {}
      }
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'completed') return s.completed;
    if (filter === 'pending') return !s.completed;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Sobrecarga Progresiva
            </span>
            <span className="text-xs text-slate-400">Progreso 100 ➔ 1,000 Saltos</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>Rope Overload Tracker</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400">
            Acondicionamiento pliométrico y rapidez de pies para {athleteName || 'el Atleta'}
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Saltos Totales</div>
            <div className="text-lg font-black text-amber-400">
              {totalJumpsCompleted.toLocaleString()}
            </div>
          </div>
          <div className="px-3.5 py-2 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Progreso</div>
            <div className="text-lg font-black text-emerald-400">
              {progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{completedCount} de {sessions.length} Días Completados</span>
          </span>
          <span className="text-orange-400 font-bold">{progressPct}% completado</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'pending' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes ({sessions.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'completed' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Logrados ({completedCount})
          </button>
        </div>

        {readOnly && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-orange-400" />
            <span>Modo Lectura</span>
          </div>
        )}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredSessions.map((session) => (
          <div
            key={session.day}
            onClick={() => handleToggle(session.day, session.completed)}
            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
              session.completed
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Día {session.day}
              </span>
              {session.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500" />
              )}
            </div>

            <div className="text-base font-black text-white">
              {session.targetJumps} <span className="text-[10px] font-medium text-slate-400">saltos</span>
            </div>

            <div className="text-[10px] text-slate-400 mt-1">
              {session.completed ? (
                <span className="text-emerald-400 font-bold">✓ Completado</span>
              ) : (
                <span>Meta pendiente</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
