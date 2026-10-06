'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { StudentProfile, User } from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import { 
  Lock, 
  ShieldAlert, 
  Ruler, 
  Weight, 
  Calendar, 
  Flame, 
  Printer 
} from 'lucide-react';

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const deniedParam = searchParams.get('denied');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [showRbacWarning, setShowRbacWarning] = useState(false);

  useEffect(() => {
    const user = HoopStore.getCurrentUser();
    setCurrentUser(user);

    const studentData = HoopStore.getStudent(user.studentId || 'student_01');
    setStudent(studentData);

    if (deniedParam) {
      setShowRbacWarning(true);
    }
  }, [deniedParam]);

  const handleToggleRope = (day: number) => {
    if (!student) return;
    const updated = HoopStore.toggleRopeSession(student.id, day);
    if (updated) setStudent(updated);
  };

  const handleToggleEndurance = (day: number) => {
    if (!student) return;
    const updated = HoopStore.toggleEnduranceSession(student.id, day);
    if (updated) setStudent(updated);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (!student) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-sm">
        Cargando perfil del atleta...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Security Banner if user was redirected by middleware */}
      {showRbacWarning && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <strong className="font-bold">Aviso de Restricción RBAC: </strong>
              Se te ha redirigido a tu portal de Alumno porque intentaste ingresar al Panel Administrativo de Coach. Tu perfil actual está en <strong className="text-white">Modo Solo Lectura</strong>.
            </div>
          </div>
          <button
            onClick={() => setShowRbacWarning(false)}
            className="text-amber-400 hover:text-white font-bold px-2 py-1 rounded-lg"
          >
            Entendido
          </button>
        </div>
      )}

      {/* 2. Top Student Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-xl shadow-blue-500/20 bg-slate-800">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow">
                #{student.jerseyNumber}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {student.position}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {student.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Lock className="w-3 h-3" />
                  Modo Alumno (Solo Lectura)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {student.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-orange-400" />
                  <span>Estatura: <strong className="text-slate-200">{student.height}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-orange-400" />
                  <span>Peso: <strong className="text-slate-200">{student.weight}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Edad: <strong className="text-slate-200">{student.age} años</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (WhatsApp + Print) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <WhatsAppReportButton student={student} label="Enviar Reporte por WhatsApp" />
            
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Central Radar 360 */}
      <RadarChart360
        metrics={student.currentMetrics}
        benchmarkMetrics={student.benchmarkMetrics}
        athleteName={student.name}
      />

      {/* 4. Progressive Rope Overload & Endurance Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RopeTracker
          sessions={student.trainingPlan.ropeTracker}
          onToggleSession={handleToggleRope}
          athleteName={student.name}
        />

        <EnduranceCalendar
          sessions={student.trainingPlan.enduranceCalendar}
          onToggleSession={handleToggleEndurance}
          athleteName={student.name}
        />
      </div>

      {/* 5. Historical Evaluations (Read Only) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Bitácora de Evaluaciones
              </span>
              <span className="text-xs text-slate-400">Firmado por Cuerpo Técnico</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">Historial de Pruebas &amp; Devoluciones</h3>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span>Edición Bloqueada para Alumnos</span>
          </div>
        </div>

        <div className="space-y-3.5">
          {student.evaluations.map((ev, index) => (
            <div
              key={ev.id}
              className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{ev.date}</span>
                    {ev.prAchieved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        RÉCORD PERSONAL (PR)
                      </span>
                    )}
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Última Oficial
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Evaluado por: <span className="text-slate-300 font-semibold">{ev.coachName}</span>
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
                <span className="font-bold text-orange-400 mr-1.5">Comentarios del Coach:</span>
                {ev.coachNotes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-sm">Cargando portal del alumno...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
