'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Athlete, TestEvaluation } from '@/types/basketball';
import { 
  Trophy, 
  Calendar, 
  UserCheck, 
  PlusCircle, 
  Lock, 
  Award, 
  TrendingUp, 
  ChevronRight,
  Flame
} from 'lucide-react';

interface EvaluationHistoryProps {
  athlete: Athlete;
  onOpenNewTestModal: () => void;
}

export function EvaluationHistory({ athlete, onOpenNewTestModal }: EvaluationHistoryProps) {
  const { isCoach, triggerDeniedAction } = useAuth();

  const handleCreateTestClick = () => {
    if (!isCoach) {
      triggerDeniedAction();
      return;
    }
    onOpenNewTestModal();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Bitácora Histórica
            </span>
            <span className="text-slate-400 text-xs">{athlete.evaluations.length} Evaluaciones Registradas</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">Historial de Pruebas & Récords (PR)</h3>
        </div>

        {/* Action button */}
        <button
          onClick={handleCreateTestClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
            isCoach
              ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/25 active:scale-95'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer'
          }`}
        >
          {isCoach ? (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Nueva Prueba</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-orange-400" />
              <span>Nueva Prueba (Solo Coach)</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {athlete.evaluations.map((evalItem, index) => (
          <div
            key={evalItem.id}
            className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{evalItem.date}</span>
                    {evalItem.personalRecordAchieved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        NUEVO PR
                      </span>
                    )}
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Vigente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Evaluador: <span className="text-slate-300 font-medium">{evalItem.coachName}</span>
                  </p>
                </div>
              </div>

              {/* Quick Stat Pill */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Salto Max</div>
                  <div className="text-sm font-black text-orange-400">{evalItem.rawStats.verticalJumpInches}&quot;</div>
                </div>
                <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">3PT %</div>
                  <div className="text-sm font-black text-emerald-400">{evalItem.rawStats.threePointPct}%</div>
                </div>
                <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Agilidad</div>
                  <div className="text-sm font-black text-sky-400">{evalItem.rawStats.laneAgilitySeconds}s</div>
                </div>
              </div>
            </div>

            {/* Coach Notes */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-orange-400 mr-1.5">Feedback Técnico:</span>
              {evalItem.coachNotes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
