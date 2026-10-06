'use client';

import React, { useState } from 'react';
import { EnduranceSession } from '@/lib/types';
import { 
  HeartPulse, 
  CheckCircle2, 
  Circle, 
  Timer, 
  Activity, 
  Flame, 
  Lock,
  ChevronRight
} from 'lucide-react';

interface EnduranceCalendarProps {
  sessions: EnduranceSession[];
  onToggleSession?: (day: number) => void;
  readOnly?: boolean;
  athleteName?: string;
}

export function EnduranceCalendar({
  sessions,
  onToggleSession,
  readOnly = false,
  athleteName,
}: EnduranceCalendarProps) {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  const completedCount = sessions.filter((s) => s.completed).length;
  const totalMinutes = sessions
    .filter((s) => s.completed)
    .reduce((acc, curr) => acc + curr.minutesEstimated, 0);

  const phases = Array.from(new Set(sessions.map((s) => s.phase)));

  const filteredSessions = sessions.filter((s) => {
    if (selectedPhase === 'all') return true;
    return s.phase === selectedPhase;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Cardio &amp; VO2 Max
            </span>
            <span className="text-xs text-slate-400">Progresión 30s ➔ 60 Minutos</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>Calendario de Resistencia Aeróbica</span>
            <HeartPulse className="w-5 h-5 text-rose-500" />
          </h3>
          <p className="text-xs text-slate-400">
            Adaptación cardiovascular escalonada de juego completo para {athleteName || 'el Atleta'}
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Tiempo Acumulado</div>
            <div className="text-lg font-black text-sky-400">
              {totalMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Completadas</div>
            <div className="text-lg font-black text-emerald-400">
              {completedCount} / {sessions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setSelectedPhase('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedPhase === 'all'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          Todas las Fases ({sessions.length})
        </button>
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPhase === phase
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {phase.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Sessions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredSessions.map((session) => (
          <div
            key={session.day}
            onClick={() => {
              if (!readOnly && onToggleSession) onToggleSession(session.day);
            }}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              session.completed
                ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Día {session.day} • {session.phase.split(':')[0]}
                </span>
                {session.completed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Logrado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <Circle className="w-3 h-3" />
                    Pendiente
                  </span>
                )}
              </div>

              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>{session.targetDuration}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>{session.heartRateZone}</span>
              </span>
              <span className="font-semibold text-slate-300">~{session.minutesEstimated} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
