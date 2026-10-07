'use client';

import React, { useState } from 'react';
import { ProgressiveTraining } from '@/lib/types';
import { 
  HeartPulse, 
  Lock, 
  Settings2, 
  Check, 
  Activity,
  Timer
} from 'lucide-react';

interface EnduranceCalendarProps {
  training: ProgressiveTraining;
  readOnly?: boolean;
  onToggleDay?: (day: number) => void;
  onUpdateTargets?: (joggingTarget: number, joggingToday: number) => void;
}

export function EnduranceCalendar({
  training,
  readOnly = false,
  onToggleDay,
  onUpdateTargets,
}: EnduranceCalendarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editToday, setEditToday] = useState(training.joggingMinutesToday);
  const [editTarget, setEditTarget] = useState(training.joggingTarget);

  const completedDays = training.schedule.filter((s) => s.completed).length;
  const progressPct = Math.round((training.joggingMinutesToday / training.joggingTarget) * 100);

  const handleSave = () => {
    if (onUpdateTargets) {
      onUpdateTargets(Number(editTarget), Number(editToday));
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-none">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Calendario de Resistencia Aeróbica</h4>
            <p className="text-[10px] font-mono text-zinc-400">Progresión de trote continuo: meta 60 minutos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {readOnly ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-[#0a0e17] px-2 py-1 rounded border border-[#27272a]">
              <Lock className="w-3 h-3 text-sky-400" />
              Lectura Estricta
            </span>
          ) : (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
              title="Calibrar minutos de trote"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor rápido para Coach */}
      {!readOnly && isEditing && (
        <div className="mb-4 p-3 bg-[#0a0e17] border border-sky-500/30 rounded-xl space-y-2.5">
          <div className="text-[10px] font-mono font-bold text-sky-400 uppercase">
            Ajustar Minutos de Trote por el Entrenador:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Minutos Hoy:</label>
              <input
                type="number"
                value={editToday}
                onChange={(e) => setEditToday(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Meta Minutos:</label>
              <input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(parseInt(e.target.value) || 60)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs font-mono"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Guardar Ajuste</span>
          </button>
        </div>
      )}

      {/* Indicador de Minutos Trotados Hoy */}
      <div className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-3.5 mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-zinc-300">Minutos trotados hoy:</span>
          <span className="text-xl font-mono font-black text-white">
            <span className="text-sky-400">{training.joggingMinutesToday} min</span>
            <span className="text-xs text-zinc-500 font-normal"> / meta {training.joggingTarget} min</span>
          </span>
        </div>

        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-sky-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
          <span>{progressPct}% alcanzado hoy</span>
          <span>Días validados: {completedDays} / 30</span>
        </div>
      </div>

      {/* Cronograma de Días */}
      <div>
        <div className="text-[11px] font-mono text-zinc-400 mb-2">
          Plan de trote progresivo (30s ➔ 60 min):
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {training.schedule.map((item) => (
            <div
              key={item.day}
              onClick={() => {
                if (!readOnly && onToggleDay) onToggleDay(item.day);
              }}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                item.completed
                  ? 'bg-sky-950/20 border-sky-500/40 text-sky-300'
                  : 'bg-[#0a0e17] border-[#27272a] text-zinc-400'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-zinc-500'}`}
              title={`Día ${item.day}: ${item.joggingMinutes} min (${item.phase})`}
            >
              <div className="text-[9px] font-mono uppercase text-zinc-500">D{item.day}</div>
              <div className="text-[11px] font-mono font-bold">{item.joggingMinutes}m</div>
              <div className="text-[9px] mt-0.5">
                {item.completed ? '✓' : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
