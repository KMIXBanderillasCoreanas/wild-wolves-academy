'use client';

import React, { useEffect, useState } from 'react';
import { HoopStore } from '@/lib/store';
import { 
  StudentProfile, 
  User, 
  Evaluation, 
  BasketballMetrics, 
  RawEvaluationStats,
  Position,
  PaymentFrequency
} from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { MedicalModal } from '@/components/MedicalModal';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { FinanceManager } from '@/components/FinanceManager';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  Heart, 
  Filter, 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles,
  Zap,
  Target,
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student_01');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Filtros del Roster
  const [filterGender, setFilterGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [filterAge, setFilterAge] = useState<'ALL' | 'SUB15' | 'SUB18' | 'SENIOR'>('ALL');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  // Modales
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Formulario de Nueva Evaluación
  const [freeThrowMade, setFreeThrowMade] = useState<number>(17);
  const [midRangePct, setMidRangePct] = useState<number>(85);
  const [threePointPct, setThreePointPct] = useState<number>(90);
  const [verticalJumpCm, setVerticalJumpCm] = useState<number>(75);
  const [sprint100mSeconds, setSprint100mSeconds] = useState<number>(11.5);
  const [agilityTTestSeconds, setAgilityTTestSeconds] = useState<number>(9.3);
  const [coachNotes, setCoachNotes] = useState<string>('Progreso consistente en tiros libres y velocidad de sprint en transición.');

  useEffect(() => {
    setCurrentUser(HoopStore.getCurrentUser());
    const list = HoopStore.getStudents();
    setStudents(list);
    if (list.length > 0) {
      setSelectedStudentId(list[0].id);
    }
    // Sincronización en vivo con Supabase PostgreSQL
    HoopStore.syncWithSupabase().then((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setStudents(remoteList);
      }
    });
  }, []);

  // Filtrado de atletas en el roster
  const filteredStudents = students.filter((s) => {
    if (filterGender !== 'ALL' && s.gender !== filterGender) return false;
    if (filterPosition !== 'ALL' && s.position !== filterPosition) return false;
    if (filterAge === 'SUB15' && s.age >= 16) return false;
    if (filterAge === 'SUB18' && (s.age < 16 || s.age > 18)) return false;
    if (filterAge === 'SENIOR' && s.age <= 18) return false;
    return true;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Actualizador del plan de cuerda
  const handleUpdateRopeTargets = (ropeTarget: number, ropeToday: number) => {
    if (!selectedStudent) return;
    const updated = HoopStore.updateTrainingTargets(
      selectedStudent.id,
      ropeTarget,
      selectedStudent.training.joggingTarget,
      ropeToday,
      selectedStudent.training.joggingMinutesToday
    );
    if (updated) {
      setStudents(HoopStore.getStudents());
    }
  };

  // Actualizador del plan de trote
  const handleUpdateJoggingTargets = (joggingTarget: number, joggingToday: number) => {
    if (!selectedStudent) return;
    const updated = HoopStore.updateTrainingTargets(
      selectedStudent.id,
      selectedStudent.training.ropeTarget,
      joggingTarget,
      selectedStudent.training.ropeJumpsToday,
      joggingToday
    );
    if (updated) {
      setStudents(HoopStore.getStudents());
    }
  };

  // Validador de días del cronograma
  const handleToggleDay = (day: number) => {
    if (!selectedStudent) return;
    const updated = HoopStore.toggleScheduleDay(selectedStudent.id, day);
    if (updated) {
      setStudents(HoopStore.getStudents());
    }
  };

  // Control de Asistencia del Coach
  const handleRecordAttendance = (studentId: string, date: string, dayName: string, present: boolean, topic: string) => {
    HoopStore.recordAttendance(studentId, date, dayName, present, topic);
    setStudents(HoopStore.getStudents());
  };

  // Control Financiero: Registrar Cobro ($50 pesos / clase)
  const handleRecordPayment = (studentId: string, amount: number, method: 'Efectivo' | 'Transferencia' | 'Stripe') => {
    HoopStore.recordPayment(studentId, amount, method);
    setStudents(HoopStore.getStudents());
  };

  // Control Financiero: Actualizar Modalidad (al día $50, semanal $150, mensual $600)
  const handleUpdateFrequency = (studentId: string, frequency: PaymentFrequency) => {
    HoopStore.updatePaymentFrequency(studentId, frequency);
    setStudents(HoopStore.getStudents());
  };

  // Guardado y recálculo automático de la evaluación mensual
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Normalización de métricas a escala 0 - 100
    const freeThrowScore = Math.min(100, Math.max(0, Math.round((freeThrowMade / 20) * 100)));
    const verticalScore = Math.min(100, Math.max(20, Math.round((verticalJumpCm / 90) * 100)));
    // 100m: 10.5s = 100, 14.5s = 40
    const sprintScore = Math.min(100, Math.max(20, Math.round(100 - (sprint100mSeconds - 10.5) * 15)));
    // T-Test: 8.5s = 100, 12s = 40
    const agilityScore = Math.min(100, Math.max(20, Math.round(100 - (agilityTTestSeconds - 8.5) * 17)));

    const newMetrics: BasketballMetrics = {
      freeThrow: freeThrowScore,
      midRange: midRangePct,
      threePoint: threePointPct,
      verticalJump: verticalScore,
      sprint100m: sprintScore,
      agilityTTest: agilityScore,
    };

    const rawStats: RawEvaluationStats = {
      freeThrowMade,
      freeThrowTotal: 20,
      midRangePct,
      threePointPct,
      verticalJumpCm,
      sprint100mSeconds,
      agilityTTestSeconds,
    };

    const newEval: Evaluation = {
      id: `eval_${Date.now()}`,
      studentId: selectedStudent.id,
      date: new Date().toLocaleDateString('es-MX'),
      coachName: currentUser?.fullName || 'Coach Ricardo',
      metrics: newMetrics,
      rawStats,
      coachNotes,
    };

    // Al guardar, se recalcula y actualiza automáticamente el radar mes actual vs mes anterior
    HoopStore.updateStudentMetrics(selectedStudent.id, newMetrics, newEval);
    setStudents(HoopStore.getStudents());

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#38bdf8', '#10b981'],
      });
    } catch {}

    setIsEvalModalOpen(false);
  };

  if (!selectedStudent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto text-2xl font-black">
          WW
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
            Panel Coach Ricardo • Academia CDMX
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-3">
            Roster Oficial Vacío
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
            No hay atletas precargados en el sistema. Los atletas aparecerán aquí automáticamente en cuanto se registren en la plataforma o puedes agregar el primero.
          </p>
        </div>
        <button
          onClick={() => {
            const created = HoopStore.registerStudent({
              fullName: 'Nuevo Atleta',
              email: 'atleta@wildwolves.academy',
              phone: '55 2242 7769',
              gender: 'M',
              age: 16,
              position: 'Base',
              role: 'student',
              avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
              stripeStatus: 'active',
              medicalNotes: {
                bloodType: 'O+',
                allergies: 'Ninguna',
                emergencyContact: 'Tutor',
                emergencyPhone: '55 2242 7769',
                medicalConditions: 'Apto para alto rendimiento',
                lastCheckup: new Date().toLocaleDateString('es-MX'),
              },
            });
            setStudents(HoopStore.getStudents());
            setSelectedStudentId(created.id);
          }}
          className="py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition shadow-lg shadow-orange-600/30 cursor-pointer"
        >
          + Registrar Primer Atleta en Cancha
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Panel Superior de Control con Roster y Filtros Rápidos */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-[#27272a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                COACH ADMINISTRADOR: RICARDO • CONTROL TOTAL &amp; DIRECCIÓN TÉCNICA
              </span>
              <span className="text-zinc-400 text-xs font-mono">
                {students.length} Atletas Registrados
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Control Administrativo, Financiero &amp; Evaluación Deportiva
            </h1>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setIsMedicalModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Ficha Médica ({selectedStudent.fullName.split(' ')[0]})</span>
            </button>

            <button
              onClick={() => setIsEvalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Cargar Evaluación Mensual</span>
            </button>

            <WhatsAppReportButton student={selectedStudent} label="WhatsApp Reporte" />
          </div>
        </div>

        {/* Filtros Rápidos del Roster */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <Filter className="w-3.5 h-3.5 text-orange-400" />
              <span>Filtros de Plantel:</span>
            </div>

            {/* Filtro Género */}
            <div className="flex items-center bg-[#0a0e17] rounded-lg p-1 border border-[#27272a] gap-1">
              {(['ALL', 'M', 'F'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    filterGender === g ? 'bg-orange-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {g === 'ALL' ? 'Todos' : g === 'M' ? 'Varonil' : 'Femenil'}
                </button>
              ))}
            </div>

            {/* Filtro Rango de Edad */}
            <div className="flex items-center bg-[#0a0e17] rounded-lg p-1 border border-[#27272a] gap-1">
              {(['ALL', 'SUB15', 'SUB18', 'SENIOR'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setFilterAge(a)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    filterAge === a ? 'bg-orange-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {a === 'ALL' ? 'Todas Edades' : a === 'SUB15' ? 'Sub-15' : a === 'SUB18' ? 'Sub-18' : 'Senior'}
                </button>
              ))}
            </div>

            {/* Filtro Posición */}
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="bg-[#0a0e17] border border-[#27272a] text-zinc-300 text-xs font-mono py-1.5 px-3 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">Todas las Posiciones</option>
              <option value="Base">Base</option>
              <option value="Escolta">Escolta</option>
              <option value="Alero">Alero</option>
              <option value="Ala-Pívot">Ala-Pívot</option>
              <option value="Pívot">Pívot</option>
            </select>
          </div>

          {/* Roster de Atletas (Selector con Tarjetas Rápidas) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {filteredStudents.map((st) => {
              const isSelected = st.id === selectedStudent.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm'
                      : 'bg-[#0a0e17] border-[#27272a] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatarUrl}
                      alt={st.fullName}
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {st.fullName}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {st.position} • {st.gender === 'M' ? 'Varonil' : 'Femenil'} ({st.age}a)
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    st.stripeStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {st.stripeStatus === 'active' ? 'Al Día' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Control Financiero y Cobranza Exclusivo de Administración ($50 por clase) */}
      <FinanceManager
        students={students}
        onRecordPayment={handleRecordPayment}
        onUpdateFrequency={handleUpdateFrequency}
      />

      {/* 3. Pase de Lista y Asistencia Oficial de Atletas */}
      <AttendanceTracker
        student={selectedStudent}
        allStudents={students}
        readOnly={false}
        onRecordAttendance={handleRecordAttendance}
      />

      {/* 4. Radar 360° del Atleta Seleccionado (Comparativa Mes Actual vs. Mes Anterior) */}
      <RadarChart360
        metricsCurrent={selectedStudent.metricsCurrent}
        metricsPrevious={selectedStudent.metricsPrevious}
        athleteName={selectedStudent.fullName}
      />

      {/* 5. Asignador y Calibrador del Plan de Cuerda y Resistencia (Totalmente Editable por el Coach) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RopeTracker
          training={selectedStudent.training}
          readOnly={false}
          onToggleDay={handleToggleDay}
          onUpdateTargets={handleUpdateRopeTargets}
        />

        <EnduranceCalendar
          training={selectedStudent.training}
          readOnly={false}
          onToggleDay={handleToggleDay}
          onUpdateTargets={handleUpdateJoggingTargets}
        />
      </div>

      {/* 6. Modal de Ficha Médica y Contacto de Emergencia */}
      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        student={selectedStudent}
        isCoach={true}
      />

      {/* 7. Modal de Carga de Evaluación Mensual */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8 max-w-2xl w-full relative my-8 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  EVALUACIÓN COMBINE MENSUAL
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Cargar Nueva Evaluación Técnica</h3>
                <p className="text-xs font-mono text-zinc-400">Atleta: {selectedStudent.fullName}</p>
              </div>
              <button
                onClick={() => setIsEvalModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="mt-5 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Tiros Libres (base 20 tiros) */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiros Libres Anotados (Base 20 tiros)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={freeThrowMade}
                      onChange={(e) => setFreeThrowMade(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                    />
                    <span className="text-zinc-400">/ 20 ({Math.round((freeThrowMade / 20) * 100)}%)</span>
                  </div>
                </div>

                {/* Media Distancia % */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiro de Media Distancia (% Eficacia)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={midRangePct}
                    onChange={(e) => setMidRangePct(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                {/* Tiro de 3 % */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiro de 3 / Larga Distancia (% 3PT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={threePointPct}
                    onChange={(e) => setThreePointPct(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                {/* Salto Vertical (cm) */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Salto Vertical Real (Centímetros)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="120"
                    value={verticalJumpCm}
                    onChange={(e) => setVerticalJumpCm(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                {/* Sprint 100m (segundos) */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Sprint 100m Planos (Segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="9.0"
                    max="20.0"
                    value={sprint100mSeconds}
                    onChange={(e) => setSprint100mSeconds(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                {/* Agilidad T-Test (segundos) */}
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Agilidad en T-Test Defensivo (Segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="7.0"
                    max="16.0"
                    value={agilityTTestSeconds}
                    onChange={(e) => setAgilityTTestSeconds(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>
              </div>

              {/* Observaciones del Entrenador */}
              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                  Observaciones Técnicas del Mes
                </label>
                <textarea
                  rows={3}
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-xs font-sans focus:outline-none focus:border-orange-500"
                  placeholder="Detalles sobre biomecánica, disciplina en las series y actitud competitiva..."
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Guardar y Recalcular Radar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
