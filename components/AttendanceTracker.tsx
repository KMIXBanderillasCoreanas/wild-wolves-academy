'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile, ShiftType, AttendanceStatus } from '@/lib/types';
import { HoopStore } from '@/lib/store';
import { 
  CalendarCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Activity,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  Users,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AttendanceTrackerProps {
  student?: StudentProfile | null;
  allStudents?: StudentProfile[];
  readOnly?: boolean;
  onRecordAttendance?: (studentId: string, date: string, dayName: string, present: boolean, topic: string) => void;
  onRecordDailyAttendance?: (studentId: string, date: string, shift: ShiftType, status: AttendanceStatus, notes?: string) => void;
}

export function AttendanceTracker({
  student,
  allStudents,
  readOnly = false,
  onRecordAttendance,
  onRecordDailyAttendance,
}: AttendanceTrackerProps) {
  // Estado para el pase de lista
  const [sessionDate, setSessionDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedShift, setSelectedShift] = useState<ShiftType | 'all'>('all');
  const [sessionTopic, setSessionTopic] = useState<string>('Fundamentos técnicos, tiro y acondicionamiento');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Lista de alumnos activa
  const roster = allStudents && allStudents.length > 0 ? allStudents : HoopStore.getStudents();

  const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDayName = dayOfWeekNames[new Date(sessionDate).getDay()] || 'Lunes';

  // Cargar estado de asistencia para la fecha seleccionada
  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    roster.forEach((st) => {
      const record = st.attendanceHistory?.find((h) => h.date === sessionDate);
      if (record) {
        if (record.status) {
          map[st.id] = record.status;
        } else if (record.present) {
          map[st.id] = 'presente';
        } else {
          map[st.id] = 'falta';
        }
      }
    });
    setAttendanceMap(map);
  }, [sessionDate, roster]);

  // Manejador de 1-clic: Presente / Falta / Retardo
  const handleMarkStatus = (targetStudentId: string, status: AttendanceStatus, studentShift: ShiftType) => {
    const shiftToSave = studentShift || (selectedShift !== 'all' ? selectedShift : 'matutino_9_11');
    
    // Guardar en HoopStore y Supabase
    HoopStore.recordDailyAttendance(
      targetStudentId,
      sessionDate,
      shiftToSave,
      status,
      sessionTopic
    );

    if (onRecordDailyAttendance) {
      onRecordDailyAttendance(targetStudentId, sessionDate, shiftToSave, status, sessionTopic);
    } else if (onRecordAttendance) {
      onRecordAttendance(targetStudentId, sessionDate, currentDayName, status !== 'falta', sessionTopic);
    }

    setAttendanceMap((prev) => ({ ...prev, [targetStudentId]: status }));

    const stName = roster.find((s) => s.id === targetStudentId)?.fullName || 'Atleta';
    setSaveFeedback(`✓ ${stName.split(' ')[0]}: ${status.toUpperCase()} registrado`);
    setTimeout(() => setSaveFeedback(null), 2500);

    if (status === 'presente') {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399']
        });
      } catch {}
    }
  };

  // Filtrado de alumnos según turno seleccionado
  const filteredRoster = roster.filter((s) => {
    if (selectedShift === 'all') return true;
    const sShift = s.shift || 'matutino_9_11';
    return sShift === selectedShift;
  });

  // Estadísticas del estudiante individual (para vista alumno o cabecera)
  const history = student?.attendanceHistory || [];
  const presentCount = history.filter((h) => h.present || h.status === 'presente' || h.status === 'retardo').length;
  const retardoCount = history.filter((h) => h.status === 'retardo').length;
  const faltaCount = history.filter((h) => !h.present || h.status === 'falta').length;
  const attendanceRate = history.length > 0 ? Math.round((presentCount / history.length) * 100) : 100;

  // RENDER EN MODO ALUMNO / READ-ONLY
  if (readOnly) {
    if (!student) {
      return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 text-center text-xs font-mono text-zinc-500">
          No hay atleta seleccionado en este momento. La base de datos está limpia.
        </div>
      );
    }
    return (
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                MI ASISTENCIA EN CANCHA
              </span>
              <span className="text-zinc-400 text-xs font-mono">Deportivo Carmen Serdán CDMX</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              <span>Registro de Asistencia &amp; Disciplina</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Bitácora oficial de entrenamientos asistidos, retardos y cumplimiento
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono">
            <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
              <div className="text-[10px] text-zinc-400 uppercase">Asistencias</div>
              <div className="text-xl font-black text-emerald-400">{presentCount}</div>
            </div>
            <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-amber-500/30 text-center">
              <div className="text-[10px] text-amber-400 uppercase">Retardos</div>
              <div className="text-xl font-black text-amber-400">{retardoCount}</div>
            </div>
            <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-rose-500/30 text-center">
              <div className="text-[10px] text-rose-400 uppercase">Faltas</div>
              <div className="text-xl font-black text-rose-400">{faltaCount}</div>
            </div>
            <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#ea580c]/30 text-center">
              <div className="text-[10px] text-[#f97316] uppercase">% Asistencia</div>
              <div className="text-xl font-black text-[#ea580c]">{attendanceRate}%</div>
            </div>
          </div>
        </div>

        {/* Turno y Días del Alumno */}
        <div className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                Turno &amp; Días Programados
              </span>
              <div className="text-xs text-zinc-300 flex items-center gap-2">
                <span className="font-bold text-white">
                  {student.shift === 'vespertino_5_7'
                    ? 'Turno Vespertino: 17:00 a 19:00 hrs'
                    : 'Turno Matutino: 09:00 a 11:00 hrs'}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Sede: Deportivo Carmen Serdán</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(student.trainingDays || ['Lunes', 'Miércoles', 'Viernes']).map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/10 text-orange-300 border border-orange-500/30"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>{day}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bitácora Histórica */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500 bg-[#0a0e17] rounded-xl border border-[#27272a]">
              Aún no hay registros de asistencia en el sistema.
            </div>
          ) : (
            history.map((record) => {
              const isPresent = record.status === 'presente' || (!record.status && record.present);
              const isRetardo = record.status === 'retardo';
              const isFalta = record.status === 'falta' || (!record.status && !record.present);

              return (
                <div
                  key={record.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                    isPresent
                      ? 'bg-[#0a0e17] border-[#27272a] text-zinc-300'
                      : isRetardo
                      ? 'bg-amber-950/10 border-amber-500/20 text-amber-200'
                      : 'bg-rose-950/10 border-rose-500/20 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isPresent
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isRetardo
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isPresent ? <CheckCircle2 className="w-4 h-4" /> : isRetardo ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{record.date}</span>
                        <span className="text-[11px] font-mono text-zinc-400">• {record.dayName}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isRetardo
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isPresent ? 'PRESENTE' : isRetardo ? 'RETARDO' : 'FALTA'}
                        </span>
                      </div>
                      {record.topic && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 font-sans">
                          {record.topic}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 text-right">
                    {record.shift === 'vespertino_5_7' ? 'Vespertino (17-19 hrs)' : 'Matutino (09-11 hrs)'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // RENDER EN MODO COACH / SUPERADMIN (INTERACTIVO 1-CLIC CON SUPABASE)
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none font-sans">
      {/* Cabecera Técnica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              OPERACIONAL RBAC • CONTROL DE ASISTENCIA DIARIA
            </span>
            <span className="text-zinc-400 text-xs font-mono">Sincronización en Vivo Supabase</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <span>Pase de Lista en Cancha &amp; Control de Turnos</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Marca asistencia rápida con 1 clic: Presente, Falta o Retardo. Valida estatus de pago en tiempo real.
          </p>
        </div>

        {/* Feedback flotante */}
        {saveFeedback && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs animate-fadeIn flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Controles de Sesión: Selector de Fecha & Filtro de Turno */}
      <div className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-4 mb-5 space-y-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Selector de Fecha */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block mb-1">Fecha de Sesión:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] font-bold">
                  {currentDayName}
                </span>
              </div>
            </div>
          </div>

          {/* Filtro de Turnos */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block mb-1">Filtro de Turno:</span>
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedShift('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedShift === 'all'
                    ? 'bg-[#ea580c] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({roster.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('matutino_9_11')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedShift === 'matutino_9_11'
                    ? 'bg-amber-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Matutino 09:00 - 11:00</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('vespertino_5_7')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedShift === 'vespertino_5_7'
                    ? 'bg-sky-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Vespertino 17:00 - 19:00</span>
              </button>
            </div>
          </div>
        </div>

        {/* Foco de la Sesión */}
        <div>
          <label className="text-[10px] text-zinc-400 uppercase block mb-1">Tema / Trabajo Técnico del Día:</label>
          <input
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            placeholder="Ej. Mecánica de tiro en suspensión, defensa de pick and roll y cardio"
            className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-xs font-sans focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Lista de Atletas para Pase de Lista */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-[#27272a]">
          <span className="uppercase text-[10px] font-bold">
            Atletas en {selectedShift === 'all' ? 'Todos los Turnos' : selectedShift === 'matutino_9_11' ? 'Turno Matutino' : 'Turno Vespertino'} ({filteredRoster.length})
          </span>
          <span className="text-[10px] text-zinc-500">
            Sede: Deportivo Carmen Serdán CDMX
          </span>
        </div>

        {filteredRoster.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500 bg-[#0a0e17] rounded-xl border border-[#27272a]">
            No hay atletas asignados a este turno.
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]">
            {filteredRoster.map((st) => {
              const currentStatus = attendanceMap[st.id];
              const isUpToDate = st.finances?.status === 'al_corriente';
              const stShift = st.shift || 'matutino_9_11';

              return (
                <div
                  key={st.id}
                  className="py-3 px-2 rounded-xl hover:bg-[#0a0e17]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
                >
                  {/* Info Atleta + Avatar + Pago Badge */}
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatarUrl || '/logo-official.png'}
                      alt={st.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-sans">{st.fullName}</span>
                        {st.jerseyNumber && (
                          <span className="text-[10px] bg-zinc-800 text-orange-400 font-bold px-1.5 py-0.2 rounded border border-zinc-700">
                            #{st.jerseyNumber}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {st.position} • {st.gender === 'M' ? 'Var' : 'Fem'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* Turno Badge */}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          stShift === 'matutino_9_11'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        }`}>
                          {stShift === 'matutino_9_11' ? 'Matutino (09:00 - 11:00)' : 'Vespertino (17:00 - 19:00)'}
                        </span>

                        {/* Semáforo de Cobranza */}
                        {isUpToDate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Al corriente ($0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            Adeudo: ${st.finances?.balanceDue || 50} MXN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de 1 Clic: Presente, Falta, Retardo */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    {/* Botón Presente (Verde) */}
                    <button
                      type="button"
                      onClick={() => handleMarkStatus(st.id, 'presente', stShift)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        currentStatus === 'presente'
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-emerald-950/40 hover:text-emerald-300 border border-zinc-700'
                      }`}
                      title="Marcar Presente"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Presente</span>
                    </button>

                    {/* Botón Retardo (Amarillo) */}
                    <button
                      type="button"
                      onClick={() => handleMarkStatus(st.id, 'retardo', stShift)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        currentStatus === 'retardo'
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-amber-950/40 hover:text-amber-300 border border-zinc-700'
                      }`}
                      title="Marcar Retardo"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Retardo</span>
                    </button>

                    {/* Botón Falta (Rojo) */}
                    <button
                      type="button"
                      onClick={() => handleMarkStatus(st.id, 'falta', stShift)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        currentStatus === 'falta'
                          ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-rose-950/40 hover:text-rose-300 border border-zinc-700'
                      }`}
                      title="Marcar Falta"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Falta</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceTracker;
