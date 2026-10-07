'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/lib/types';
import { 
  CalendarCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Plus, 
  Flame, 
  Activity,
  Check
} from 'lucide-react';

interface AttendanceTrackerProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  readOnly?: boolean;
  onRecordAttendance?: (studentId: string, date: string, dayName: string, present: boolean, topic: string) => void;
}

export function AttendanceTracker({
  student,
  allStudents,
  readOnly = false,
  onRecordAttendance,
}: AttendanceTrackerProps) {
  // Estado para el pase de lista del Coach
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState<string>('Técnica de tiro, salto vertical y trabajo táctico');
  const [quickAttendanceState, setQuickAttendanceState] = useState<{ [id: string]: boolean }>({});

  const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDayName = dayOfWeekNames[new Date(sessionDate).getDay()] || 'Lunes';

  const history = student.attendanceHistory || [];
  const presentCount = history.filter((h) => h.present).length;
  const attendanceRate = history.length > 0 ? Math.round((presentCount / history.length) * 100) : 100;

  const handleMarkCoach = (targetStudentId: string, present: boolean) => {
    if (onRecordAttendance) {
      onRecordAttendance(targetStudentId, sessionDate, currentDayName, present, sessionTopic);
      setQuickAttendanceState((prev) => ({ ...prev, [targetStudentId]: present }));
    }
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none font-sans">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              REGISTRO DE ASISTENCIA
            </span>
            <span className="text-zinc-400 text-xs font-mono">Control de Asistencia Oficial</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <span>Asistencia y Días de Entrenamiento</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            {readOnly 
              ? `Historial de entrenamientos completados por ${student.fullName}`
              : 'Pase de lista diario, validación de sesiones y control del plantel'}
          </p>
        </div>

        {/* Resumen numérico en tipografía monoespaciada */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Días Entrenados</div>
            <div className="text-xl font-mono font-black text-emerald-400">
              {student.totalDaysTrained}{' '}
              <span className="text-[10px] font-normal text-zinc-500">sesiones</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">% Asistencia</div>
            <div className="text-xl font-mono font-black text-orange-400">
              {attendanceRate}%
            </div>
          </div>
        </div>
      </div>

      {/* DÍAS QUE ENTRENA (Visible en ambos roles, esencial para el Alumno) */}
      <div className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Días Programados de Entrenamiento
            </span>
            <div className="text-xs text-zinc-300">
              Este atleta tiene asignado el calendario regular:
            </div>
          </div>

          {/* Badges de Días de la semana */}
          <div className="flex flex-wrap items-center gap-2">
            {(student.trainingDays || ['Lunes', 'Miércoles', 'Viernes']).map((day) => (
              <span
                key={day}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/10 text-orange-300 border border-orange-500/30"
              >
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>{day}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PASE DE LISTA INTERACTIVO (SOLO PARA COACH) */}
      {!readOnly && allStudents && (
        <div className="mb-6 p-4 bg-[#0a0e17] border border-emerald-500/30 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#27272a]">
            <div>
              <span className="text-emerald-400 font-bold uppercase text-[11px] block">
                Pase de Lista del Día: {currentDayName}
              </span>
              <span className="text-[10px] text-zinc-400">
                Marca la asistencia de los atletas para la fecha seleccionada:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Tema / Foco de la Sesión de Hoy:</label>
            <input
              type="text"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-200 text-xs font-sans focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Lista de Atletas para marcar asistencia */}
          <div className="pt-2">
            <span className="text-[10px] text-zinc-400 uppercase block mb-2">Plantel de Atletas:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {allStudents.map((st) => {
                const isMarkedPresent = quickAttendanceState[st.id];
                return (
                  <div
                    key={st.id}
                    className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <img
                        src={st.avatarUrl}
                        alt={st.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-white truncate">{st.fullName.split(' ')[0]}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleMarkCoach(st.id, true)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isMarkedPresent === true
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                        }`}
                        title="Marcar Asistencia"
                      >
                        <Check className="w-3 h-3" />
                        <span>Asistió</span>
                      </button>

                      <button
                        onClick={() => handleMarkCoach(st.id, false)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isMarkedPresent === false
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-rose-400'
                        }`}
                        title="Marcar Falta"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Falta</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BITÁCORA HISTÓRICA DE ASISTENCIAS DEL ATLETA */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-zinc-400">
            Historial de sesiones ({history.length} registradas):
          </span>
          {readOnly && (
            <span className="text-[10px] text-zinc-500 bg-[#0a0e17] px-2 py-0.5 rounded border border-[#27272a] flex items-center gap-1">
              <Lock className="w-3 h-3 text-orange-400" />
              Consulta Privada
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {history.map((record) => (
            <div
              key={record.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                record.present
                  ? 'bg-[#0a0e17] border-[#27272a] text-zinc-300'
                  : 'bg-rose-950/10 border-rose-500/20 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  record.present 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {record.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{record.date}</span>
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold">• {record.dayName}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      record.present 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {record.present ? 'ASISTIÓ' : 'FALTA'}
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
                Sesión de Cancha Oficial
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
