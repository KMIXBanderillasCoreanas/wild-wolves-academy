'use client';

import React, { useEffect, useState } from 'react';
import { HoopStore } from '@/lib/store';
import { StudentProfile, User, Evaluation, BasketballMetrics, RawAthleticRecord } from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { MedicalModal } from '@/components/MedicalModal';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import confetti from 'canvas-confetti';
import { 
  KeyRound, 
  ShieldCheck, 
  Heart, 
  PlusCircle, 
  Sparkles, 
  UserCheck, 
  Ruler, 
  Weight, 
  Calendar, 
  Flame, 
  Zap, 
  Target, 
  Activity, 
  Dribbble, 
  Shield, 
  Printer, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student_01');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals state
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isNewEvalModalOpen, setIsNewEvalModalOpen] = useState(false);

  // New Eval Form state
  const [verticalJumpInches, setVerticalJumpInches] = useState<number>(33.0);
  const [threePointPct, setThreePointPct] = useState<number>(47.5);
  const [freeThrowPct, setFreeThrowPct] = useState<number>(88.0);
  const [laneAgilitySeconds, setLaneAgilitySeconds] = useState<number>(10.2);
  const [ballHandlingScore, setBallHandlingScore] = useState<number>(92);
  const [defensiveScore, setDefensiveScore] = useState<number>(86);
  const [beepTestLevel, setBeepTestLevel] = useState<number>(13.8);
  const [coachNotes, setCoachNotes] = useState<string>('Progreso biomecánico notable. Mejora del 6% en velocidad de salida tras drible.');

  useEffect(() => {
    setCurrentUser(HoopStore.getCurrentUser());
    const list = HoopStore.getStudents();
    setStudents(list);
    if (list.length > 0) {
      setSelectedStudentId(list[0].id);
    }
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleToggleRope = (day: number) => {
    if (!selectedStudent) return;
    const updated = HoopStore.toggleRopeSession(selectedStudent.id, day);
    if (updated) {
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  };

  const handleToggleEndurance = (day: number) => {
    if (!selectedStudent) return;
    const updated = HoopStore.toggleEnduranceSession(selectedStudent.id, day);
    if (updated) {
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  };

  const calculateDerivedMetrics = (): BasketballMetrics => {
    const shooting = Math.min(100, Math.max(30, Math.round(threePointPct * 1.2 + freeThrowPct * 0.5)));
    const verticalJump = Math.min(100, Math.max(20, Math.round((verticalJumpInches / 40) * 100)));
    const agilitySpeed = Math.min(100, Math.max(30, Math.round(100 - (laneAgilitySeconds - 10) * 12.5)));
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

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const newMetrics = calculateDerivedMetrics();
    const rawStats: RawAthleticRecord = {
      verticalJumpInches,
      threePointPct,
      freeThrowPct,
      laneAgilitySeconds,
      beepTestLevel,
    };

    const isPR = verticalJumpInches > (selectedStudent.evaluations[0]?.rawStats.verticalJumpInches || 30);

    const newEval: Evaluation = {
      id: `eval_${Date.now()}`,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      coachName: currentUser?.name || 'Coach Marcus Vance',
      metrics: newMetrics,
      rawStats,
      coachNotes,
      prAchieved: isPR,
    };

    HoopStore.updateStudentMetrics(selectedStudent.id, newMetrics, newEval);
    const refreshed = HoopStore.getStudents();
    setStudents(refreshed);

    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f97316', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch {}

    setIsNewEvalModalOpen(false);
  };

  if (!selectedStudent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-sm">
        Cargando consola de administración...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header with Student Selector & Coach Powers */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Selected Athlete info */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-xl shadow-orange-500/20 bg-slate-800">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow">
                #{selectedStudent.jerseyNumber}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {selectedStudent.position}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedStudent.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Coach CRUD Activo
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {selectedStudent.name}
                </h1>

                {/* Athlete Dropdown */}
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      Plantel: #{st.jerseyNumber} {st.name} ({st.position.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-orange-400" />
                  <span>Estatura: <strong className="text-slate-200">{selectedStudent.height}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-orange-400" />
                  <span>Peso: <strong className="text-slate-200">{selectedStudent.weight}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Edad: <strong className="text-slate-200">{selectedStudent.age} años</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Coach Actions (Medical Modal + New Evaluation + WhatsApp) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setIsMedicalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>Ficha Médica (Privada)</span>
            </button>

            <button
              onClick={() => setIsNewEvalModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-lg shadow-orange-600/30 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Evaluación Combine</span>
            </button>

            <WhatsAppReportButton student={selectedStudent} label="Reporte WhatsApp" />
          </div>
        </div>
      </div>

      {/* 2. Central Radar 360 */}
      <RadarChart360
        metrics={selectedStudent.currentMetrics}
        benchmarkMetrics={selectedStudent.benchmarkMetrics}
        athleteName={selectedStudent.name}
      />

      {/* 3. Rope Tracker & Endurance Calendar (Editable by Coach) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RopeTracker
          sessions={selectedStudent.trainingPlan.ropeTracker}
          onToggleSession={handleToggleRope}
          athleteName={selectedStudent.name}
          readOnly={false}
        />

        <EnduranceCalendar
          sessions={selectedStudent.trainingPlan.enduranceCalendar}
          onToggleSession={handleToggleEndurance}
          athleteName={selectedStudent.name}
          readOnly={false}
        />
      </div>

      {/* 4. Historical Bitácora & Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Consola de Evaluación
              </span>
              <span className="text-xs text-slate-400">Total: {selectedStudent.evaluations.length} Pruebas Asentadas</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">Bitácora Oficial de Pruebas Físicas</h3>
          </div>

          <button
            onClick={() => setIsNewEvalModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-orange-400" />
            <span>Asentar Prueba</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {selectedStudent.evaluations.map((ev, idx) => (
            <div
              key={ev.id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{ev.date}</span>
                    {ev.prAchieved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        PR REGISTRADO
                      </span>
                    )}
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Vigente
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Evaluador: <span className="text-slate-300 font-medium">{ev.coachName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Salto</div>
                    <div className="text-sm font-black text-orange-400">{ev.rawStats.verticalJumpInches}&quot;</div>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">3PT %</div>
                    <div className="text-sm font-black text-emerald-400">{ev.rawStats.threePointPct}%</div>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 rounded-xl border border-slate-700 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Agilidad</div>
                    <div className="text-sm font-black text-sky-400">{ev.rawStats.laneAgilitySeconds}s</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-orange-400 mr-1.5">Notas Técnicas:</span>
                {ev.coachNotes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Medical Modal (Private Coach Access) */}
      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        student={selectedStudent}
        isCoach={true}
      />

      {/* 6. New Evaluation Modal Form */}
      {isNewEvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Combine Entry Form
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Registrar Nueva Prueba Combine</h3>
                <p className="text-xs text-slate-400">Atleta: #{selectedStudent.jerseyNumber} {selectedStudent.name}</p>
              </div>
              <button
                onClick={() => setIsNewEvalModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Salto Vertical */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    Salto Vertical (Pulgadas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="50"
                    value={verticalJumpInches}
                    onChange={(e) => setVerticalJumpInches(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Equivalente: ~{Math.round(verticalJumpInches * 2.54)} cm
                  </div>
                </div>

                {/* Lane Agility */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Lane Agility Drill (Segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="8.0"
                    max="16.0"
                    value={laneAgilitySeconds}
                    onChange={(e) => setLaneAgilitySeconds(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Meta Top D1: &lt; 10.5 segundos
                  </div>
                </div>

                {/* 3PT % */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Tiro de 3 Puntos (% 3PT)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    max="100"
                    value={threePointPct}
                    onChange={(e) => setThreePointPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Free Throw % */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Tiro Libre (% Free Throw)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="100"
                    value={freeThrowPct}
                    onChange={(e) => setFreeThrowPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Ball Handling Slider */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Dribbble className="w-4 h-4 text-purple-400" />
                      Manejo de Balón
                    </span>
                    <span className="text-orange-400 font-bold">{ballHandlingScore}/100</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={ballHandlingScore}
                    onChange={(e) => setBallHandlingScore(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Defensive IQ Slider */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Defensa &amp; IQ Táctico
                    </span>
                    <span className="text-orange-400 font-bold">{defensiveScore}/100</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={defensiveScore}
                    onChange={(e) => setDefensiveScore(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>

              {/* Coach Observations */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Devolución Técnica del Coach
                </label>
                <textarea
                  rows={3}
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Detallar fluidez de tiro, ritmo de aceleración, actitud táctica..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEvalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publicar Evaluación &amp; Actualizar Radar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
