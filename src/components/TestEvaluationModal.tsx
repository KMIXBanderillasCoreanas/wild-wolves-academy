'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { Athlete, BasketballMetrics, RawAthleticRecord, TestEvaluation } from '@/types/basketball';
import { 
  X, 
  Trophy, 
  Zap, 
  Target, 
  Dribbble, 
  Activity, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Save,
  CheckCircle2
} from 'lucide-react';

interface TestEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  onSaveEvaluation: (evaluation: TestEvaluation) => void;
}

export function TestEvaluationModal({
  isOpen,
  onClose,
  athlete,
  onSaveEvaluation,
}: TestEvaluationModalProps) {
  const { role, isCoach } = useAuth();

  const [verticalJumpInches, setVerticalJumpInches] = useState<number>(32.0);
  const [threePointPct, setThreePointPct] = useState<number>(45.0);
  const [freeThrowPct, setFreeThrowPct] = useState<number>(85.0);
  const [laneAgilitySeconds, setLaneAgilitySeconds] = useState<number>(10.5);
  const [ballHandlingScore, setBallHandlingScore] = useState<number>(90);
  const [defensiveScore, setDefensiveScore] = useState<number>(85);
  const [beepTestLevel, setBeepTestLevel] = useState<number>(13.5);
  const [coachNotes, setCoachNotes] = useState<string>('Evaluación técnica completada. Sobresaliente explosividad en salto vertical y mejora del 5% en efectividad de tiro.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // If role is Alumno, block editing and show security RBAC advisory
  if (!isCoach) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
            RBAC: ACCESO DENEGADO (SOLO LECTURA)
          </span>

          <h3 className="text-xl font-bold text-white mt-4 mb-2">
            Modo Alumno Activo
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Tu cuenta tiene el rol de <strong className="text-orange-400">Alumno</strong>. Por motivos de integridad deportiva y seguridad RBAC, solo el cuerpo técnico (<strong className="text-white">Coach Marcus Vance</strong>) tiene autorización para asentar nuevas pruebas, calibrar tiempos de cronómetro y actualizar métricas de radar.
          </p>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-left text-xs text-slate-400 mb-6">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Política de Seguridad Deportiva:
            </div>
            Para simular el registro de pruebas, cambia el rol en la barra superior a &ldquo;Coach Marcus Vance&rdquo;.
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
          >
            Entendido, volver al modo consulta
          </button>
        </div>
      </div>
    );
  }

  // Calculate normalized 0-100 radar scores based on standard basketball combine formulas
  const calculateDerivedMetrics = (): BasketballMetrics => {
    // Shooting: weighted blend of 3pt (60%) and FT (40%) normalized
    const shooting = Math.min(100, Math.max(30, Math.round((threePointPct * 1.2 + freeThrowPct * 0.5))));
    
    // Vertical Jump: 20 inches = 50, 40 inches = 100
    const verticalJump = Math.min(100, Math.max(20, Math.round((verticalJumpInches / 40) * 100)));
    
    // Agility: 14s = 50, 10s = 100 (inverted scale)
    const agilitySpeed = Math.min(100, Math.max(30, Math.round(100 - ((laneAgilitySeconds - 10) * 12.5))));
    
    // Stamina: beep test level 10 = 60, level 15 = 100
    const staminaFitness = Math.min(100, Math.max(40, Math.round((beepTestLevel / 15) * 100)));

    return {
      shooting,
      ballHandling: ballHandlingScore,
      verticalJump,
      agilitySpeed,
      defensiveIQ: defensiveScore,
      staminaFitness,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const derivedMetrics = calculateDerivedMetrics();
    const rawStats: RawAthleticRecord = {
      verticalJumpInches,
      threePointPct,
      freeThrowPct,
      laneAgilitySeconds,
      beepTestLevel,
      turnoverRatePct: 9.2,
    };

    // Check if new vertical jump is higher than previous best
    const isNewPR = verticalJumpInches > (athlete.evaluations[0]?.rawStats.verticalJumpInches || 30);

    const newEvaluation: TestEvaluation = {
      id: `eval_${Date.now()}`,
      athleteId: athlete.id,
      date: new Date().toISOString().split('T')[0],
      coachName: 'Coach Marcus Vance',
      coachNotes,
      metrics: derivedMetrics,
      rawStats,
      personalRecordAchieved: isNewPR,
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onSaveEvaluation(newEvaluation);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Panel Oficial de Coach
              </span>
              <span className="text-xs text-slate-400">Atleta: #{athlete.jerseyNumber} {athlete.name}</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">Registrar Nueva Prueba Física</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Salto Vertical */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Zap className="w-4 h-4 text-orange-400" />
                Salto Vertical (Pulgadas)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="15"
                  max="50"
                  value={verticalJumpInches}
                  onChange={(e) => setVerticalJumpInches(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-400 font-medium">in ({Math.round(verticalJumpInches * 2.54)} cm)</span>
              </div>
            </div>

            {/* Agilidad de Carril */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Lane Agility Drill (Segundos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="8.0"
                  max="16.0"
                  value={laneAgilitySeconds}
                  onChange={(e) => setLaneAgilitySeconds(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-400 font-medium">segundos</span>
              </div>
            </div>

            {/* Tiro Triple % */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Tiro de 3 Puntos (% Eficacia)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="10"
                  max="100"
                  value={threePointPct}
                  onChange={(e) => setThreePointPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-400 font-medium">% 3PT</span>
              </div>
            </div>

            {/* Tiro Libre % */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                Tiro Libre (% Free Throw)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="100"
                  value={freeThrowPct}
                  onChange={(e) => setFreeThrowPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-400 font-medium">% FT</span>
              </div>
            </div>

            {/* Manejo de Balón */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <Dribbble className="w-4 h-4 text-purple-400" />
                Control & Drible (0 - 100)
              </label>
              <input
                type="range"
                min="40"
                max="100"
                value={ballHandlingScore}
                onChange={(e) => setBallHandlingScore(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-semibold">
                <span>Básico (40)</span>
                <span className="text-orange-400 font-bold">{ballHandlingScore} pts</span>
                <span>Elite (100)</span>
              </div>
            </div>

            {/* Defensa & Desplazamiento */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Defensa & IQ Táctico (0 - 100)
              </label>
              <input
                type="range"
                min="40"
                max="100"
                value={defensiveScore}
                onChange={(e) => setDefensiveScore(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-semibold">
                <span>Zonal (40)</span>
                <span className="text-orange-400 font-bold">{defensiveScore} pts</span>
                <span>Lockdown (100)</span>
              </div>
            </div>
          </div>

          {/* Coach Notes */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Observaciones Técnicas del Coach
            </label>
            <textarea
              rows={3}
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              placeholder="Anotar detalles biomecánicos, actitud táctica o recomendaciones de entrenamiento..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Guardando...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publicar Evaluación & Actualizar Radar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
