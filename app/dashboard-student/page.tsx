'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { StudentProfile, User } from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import { 
  Lock, 
  ShieldAlert, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  CalendarCheck,
  BadgeDollarSign,
  MessageCircle,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const deniedParam = searchParams.get('denied');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRbacWarning, setShowRbacWarning] = useState(false);
  const [isPayingStripe, setIsPayingStripe] = useState(false);

  useEffect(() => {
    const user = HoopStore.getCurrentUser();
    setCurrentUser(user);

    // El alumno SOLO ve sus propios datos: no tiene acceso a listas de otros atletas
    let studentData = HoopStore.getStudent(user.studentId || 'student_01');
    if (!studentData) {
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('ww_student_name') : null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ww_user_email') : null;
      const syncedUser = HoopStore.loginAsStudent(
        user.studentId || 'student_01',
        storedName || user.fullName || 'Atleta Wild Wolves',
        storedEmail || user.email || 'atleta@wildwolves.mx'
      );
      studentData = HoopStore.getStudent(syncedUser.studentId || 'student_01');
    }
    setStudent(studentData);

    // Sincronización en vivo con Supabase
    HoopStore.syncWithSupabase().then(() => {
      const refreshed = HoopStore.getStudent(user.studentId || 'student_01');
      if (refreshed) setStudent(refreshed);
    });

    if (deniedParam) {
      setShowRbacWarning(true);
    }
  }, [deniedParam]);

  const handlePayStripe = () => {
    if (!student) return;
    setIsPayingStripe(true);
    setTimeout(() => {
      const updated = HoopStore.payStripeTuition(student.id);
      if (updated) setStudent({ ...updated });
      setIsPayingStripe(false);
    }, 1200);
  };

  if (!student) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-zinc-400 text-xs">
        Cargando portal privado del alumno...
      </div>
    );
  }

  const isUpToDate = student.finances.status === 'al_corriente';

  const getFrequencyText = () => {
    switch (student.finances.frequency) {
      case 'al_dia':
        return 'Al Día ($50 MXN por clase)';
      case 'semanal':
        return 'A la Semana ($150 MXN / 3 clases)';
      case 'mensual':
        return 'Al Mes ($600 MXN / 12 clases)';
      default:
        return 'Al Día ($50 MXN)';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Alerta de RBAC si intentó acceder al área de Coach */}
      {showRbacWarning && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300 font-mono animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <strong className="font-bold">RBAC: ACCESO DE SOLO LECTURA. </strong>
              Se te ha redirigido a tu portal porque intentaste acceder al Panel de Entrenador. Como alumno, solo tienes acceso de consulta privada a tus métricas.
            </div>
          </div>
          <button
            onClick={() => setShowRbacWarning(false)}
            className="text-amber-400 hover:text-white font-bold px-2 py-1 rounded cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* 2. Banner de Tutor si es un Padre de Familia */}
      {currentUser?.role === 'parent' && (
        <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-[#18181b] border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
              👨‍👦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  PORTAL DEL TUTOR / PADRE DE FAMILIA
                </span>
                <span className="text-zinc-400 text-[11px]">
                  Supervisando a: <strong className="text-white">{student.fullName}</strong>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                Tienes acceso de supervisión a los días entrenados, balance de cuotas ($50/clase) y radar biomecánico de tu hijo(a).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/525522427769?text=${encodeURIComponent(`Hola Coach Ricardo, le escribe el tutor de ${student.fullName}. Quisiera comunicarme sobre sus entrenamientos en Wild Wolves.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer w-full sm:w-auto justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a Coach Ricardo</span>
            </a>
          </div>
        </div>
      )}

      {/* 3. Ficha Personal del Alumno (Avatar, Posición, Rol Badge y Stripe Status) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-orange-500 bg-zinc-900">
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  {student.position}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {student.gender === 'M' ? 'Varonil' : 'Femenil'} • {student.age} años
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentUser?.role === 'parent'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  <Lock className="w-3 h-3" />
                  {currentUser?.role === 'parent' ? 'Supervisión de Tutor' : 'Alumno (Solo Lectura)'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {student.fullName}
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                {student.email} • {student.phone}
              </p>
            </div>
          </div>

          {/* Tarjeta de Estado Financiero ($50 pesos / clase) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-[#0a0e17] rounded-xl border border-[#27272a] flex items-center gap-3 w-full sm:w-auto justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Costo de Clase: $50 Pesos</span>
                <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                  Modalidad: <strong className="text-white">{getFrequencyText()}</strong>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {isUpToDate ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Al Corriente ($0 Adeudo)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Adeudo: ${student.finances.balanceDue} MXN
                    </span>
                  )}
                </div>
              </div>

              {!isUpToDate && (
                <button
                  onClick={handlePayStripe}
                  disabled={isPayingStripe}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isPayingStripe ? 'Conectando...' : 'Pagar Stripe'}</span>
                </button>
              )}
            </div>

            <WhatsAppReportButton student={student} label="Mi Reporte" />
          </div>
        </div>
      </div>

      {/* 3. MÓDULO DE ASISTENCIA (Total de días entrenados y qué días entrena) */}
      <AttendanceTracker
        student={student}
        readOnly={true}
      />

      {/* 4. Ficha Médica y Contacto de Emergencia (Lectura Privada para Atleta y Tutor) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Ficha Médica y Seguridad en Cancha
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Apto para Alto Rendimiento
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0a0e17] p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">Grupo Sanguíneo:</span>
            <strong className="text-white text-xs">{student.medicalNotes?.bloodType || 'O+'}</strong>
          </div>
          <div className="bg-[#0a0e17] p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">Alergias Registradas:</span>
            <strong className="text-orange-400 text-xs">{student.medicalNotes?.allergies || 'Ninguna conocida'}</strong>
          </div>
          <div className="bg-[#0a0e17] p-3 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">Contacto de Emergencia:</span>
            <strong className="text-sky-400 text-xs">{student.medicalNotes?.emergencyContact} ({student.medicalNotes?.emergencyPhone})</strong>
          </div>
        </div>
      </div>

      {/* 5. RadarChart360 con Comparativa del Mes Actual vs. Mes Anterior */}
      <RadarChart360
        metricsCurrent={student.metricsCurrent}
        metricsPrevious={student.metricsPrevious}
        athleteName={student.fullName}
      />

      {/* 5. Calendario de Resistencia y Progreso de Cuerda (100% LECTURA ESTRICTA: Sin inputs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RopeTracker
          training={student.training}
          readOnly={true}
        />

        <EnduranceCalendar
          training={student.training}
          readOnly={true}
        />
      </div>

      {/* 6. Historial de Evaluaciones Técnicas */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Evaluaciones Mensuales Oficiales</h4>
            <p className="text-[10px] font-mono text-zinc-400">Firmado por el cuerpo técnico de la academia</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-[#0a0e17] px-2.5 py-1 rounded border border-[#27272a]">
            Modo Consulta Privada
          </span>
        </div>

        <div className="space-y-3">
          {student.evaluations.map((ev, index) => (
            <div
              key={ev.id}
              className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-4 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{ev.date}</span>
                  <span className="text-[10px] text-zinc-400">por {ev.coachName}</span>
                  {index === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Vigente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-400">T. Libres: <strong className="text-white">{ev.rawStats.freeThrowMade}/{ev.rawStats.freeThrowTotal}</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">Salto: <strong className="text-orange-400">{ev.rawStats.verticalJumpCm} cm</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">T-Test: <strong className="text-sky-400">{ev.rawStats.agilityTTestSeconds}s</strong></span>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 text-zinc-300 font-sans text-xs leading-relaxed">
                <span className="font-mono font-bold text-orange-400 mr-1.5">Feedback:</span>
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
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center font-mono text-zinc-400 text-xs">Cargando datos del atleta...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
