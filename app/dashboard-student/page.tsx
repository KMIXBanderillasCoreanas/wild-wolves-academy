'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { StudentProfile, User, PaymentRecord } from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import confetti from 'canvas-confetti';
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
  ShieldCheck,
  Receipt,
  MapPin,
  Clock,
  Sparkles,
  Check,
  X,
  Calendar
} from 'lucide-react';

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const deniedParam = searchParams.get('denied');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRbacWarning, setShowRbacWarning] = useState(false);
  
  // Modal de pago directo
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState<'Stripe' | 'Transferencia'>('Stripe');

  useEffect(() => {
    const user = HoopStore.getCurrentUser();
    setCurrentUser(user);

    // Cargar perfil del estudiante
    let studentData = HoopStore.getStudent(user.studentId || 'ww_mateo_07');
    if (!studentData) {
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('ww_student_name') : null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ww_user_email') : null;
      const syncedUser = HoopStore.loginAsStudent(
        user.studentId || 'ww_mateo_07',
        storedName || user.fullName || 'Atleta Wild Wolves',
        storedEmail || user.email || 'atleta@wildwolves.mx'
      );
      studentData = HoopStore.getStudent(syncedUser.studentId || 'ww_mateo_07');
    }
    setStudent(studentData);

    // Sincronización en vivo con Supabase
    HoopStore.syncWithSupabase().then(() => {
      const refreshed = HoopStore.getStudent(user.studentId || 'ww_mateo_07');
      if (refreshed) setStudent(refreshed);
    });

    if (deniedParam) {
      setShowRbacWarning(true);
    }
  }, [deniedParam]);

  // Manejador de pago en línea / pasarela
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      const amountToPay = student.finances.balanceDue > 0 ? student.finances.balanceDue : student.finances.costPerClass;
      const todayStr = new Date().toISOString().split('T')[0];

      // Registrar recibo y actualizar estatus
      HoopStore.recordPaymentWithReceipt({
        studentId: student.id,
        studentName: student.fullName,
        guardianName: student.guardianName || student.medicalNotes?.emergencyContact || 'Tutor de Atleta',
        guardianPhone: student.parentPhone || student.phone || '5522427769',
        amount: amountToPay,
        date: todayStr,
        method: payMethod,
        status: 'Pagado',
        notes: `Pago en línea (${payMethod}) por cuota Wild Wolves`,
        shift: student.shift || 'matutino_9_11',
      });

      const updated = HoopStore.getStudent(student.id);
      if (updated) setStudent({ ...updated });

      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f97316', '#38bdf8']
        });
      } catch {}

      setTimeout(() => {
        setPaymentSuccess(false);
        setIsPayModalOpen(false);
      }, 1800);
    }, 1200);
  };

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-4">
        {/* Skeleton Loading State */}
        <div className="h-32 bg-[#18181b]/70 rounded-2xl animate-pulse border border-[#27272a]" />
        <div className="h-64 bg-[#18181b]/70 rounded-2xl animate-pulse border border-[#27272a]" />
        <div className="h-80 bg-[#18181b]/70 rounded-2xl animate-pulse border border-[#27272a]" />
      </div>
    );
  }

  const isUpToDate = student.finances.status === 'al_corriente';
  const assignedShift = student.shift || 'matutino_9_11';
  const shiftLabel = assignedShift === 'matutino_9_11' ? 'Matutino: 09:00 a 11:00 hrs' : 'Vespertino: 17:00 a 19:00 hrs';

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

  const receiptsList: PaymentRecord[] = student.finances?.paymentHistory || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Alerta de RBAC si intentó acceder a área de entrenador */}
      {showRbacWarning && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300 font-mono animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <strong className="font-bold">RBAC: ACCESO TRANSPARENTE DE CONSULTA. </strong>
              Estás en tu portal oficial de atleta/tutor con acceso de solo lectura a tus métricas y recibos.
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
                Acceso de consulta a asistencias, estado de cuenta oficial y radar biomecánico.
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

      {/* 3. TARJETA OFICIAL DE ATLETA (Dorsal, Posición, Turno Asignado & Sede) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ea580c]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar & Dorsal Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-500 bg-zinc-900 shadow-xl">
                <img
                  src={student.avatarUrl || '/logo-official.png'}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {student.jerseyNumber && (
                <div className="absolute -bottom-2 -right-2 bg-[#ea580c] text-white font-mono font-black text-xs px-2 py-0.5 rounded-lg border-2 border-[#18181b] shadow-md">
                  #{student.jerseyNumber}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono">
                {/* Posición */}
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
                  {student.position}
                </span>
                {/* Género & Edad */}
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {student.gender === 'M' ? 'Varonil' : 'Femenil'} • {student.age} años
                </span>
                {/* Modo Solo Lectura */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Lock className="w-3 h-3" />
                  Consulta Privada (Solo Lectura)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {student.fullName}
              </h1>

              {/* Turno Asignado & Sede Oficial */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 mt-1">
                <div className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Turno: <strong className="text-white">{shiftLabel}</strong></span>
                </div>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1 text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-[#ea580c] flex-shrink-0" />
                  <span>Sede: <strong className="text-white">Deportivo Carmen Serdán (CDMX)</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <WhatsAppReportButton student={student} label="Mi Reporte Técnico" />
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN ESTADO DE CUENTA & COBRANZA OFICIAL */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                FINANZAS &amp; MENSUALIDAD
              </span>
              <span className="text-zinc-400 text-xs font-mono">Cuota Oficial: $50 Pesos / Clase</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BadgeDollarSign className="w-5 h-5 text-orange-500" />
              <span>Estado de Cuenta del Atleta</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Modalidad de pago: <strong className="text-white">{getFrequencyText()}</strong>
            </p>
          </div>

          {/* Semáforo & Botón de Pago */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-mono text-center ${
              isUpToDate
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="text-[10px] uppercase font-bold">Estatus del Mes</div>
              <div className="text-base font-black flex items-center justify-center gap-1.5">
                {isUpToDate ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{isUpToDate ? 'Al Corriente ($0)' : `Adeudo: $${student.finances.balanceDue} MXN`}</span>
              </div>
            </div>

            {!isUpToDate && (
              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar Cuota Pendiente</span>
              </button>
            )}
          </div>
        </div>

        {/* Historial de Recibos de Pago */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-zinc-400 uppercase text-[10px] font-bold">
              Historial de Recibos y Pagos Registrados ({receiptsList.length}):
            </span>
            <span className="text-[10px] text-zinc-500">
              Emitidos por Wild Wolves CDMX
            </span>
          </div>

          {receiptsList.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500 bg-[#0a0e17] rounded-xl border border-[#27272a]">
              No hay recibos anteriores registrados para este atleta.
            </div>
          ) : (
            <div className="space-y-2">
              {receiptsList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-[#0a0e17] border border-[#27272a] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">${rec.amount} MXN</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300">{rec.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {rec.method}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        {rec.notes || 'Pago de cuota de entrenamiento'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Pagado
                    </span>
                    <span className="text-[10px] text-zinc-600">ID: {rec.id.substring(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. SECCIÓN MI ASISTENCIA EN CANCHA */}
      <AttendanceTracker
        student={student}
        readOnly={true}
      />

      {/* 6. RADAR 360° DE HABILIDADES (READ-ONLY) */}
      <RadarChart360
        metricsCurrent={student.metricsCurrent}
        metricsPrevious={student.metricsPrevious}
        athleteName={student.fullName}
      />

      {/* 7. CALENDARIO DE RESISTENCIA & PROGRESO DE CUERDA (100% LECTURA) */}
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

      {/* 8. FICHA MÉDICA DE CONSULTA */}
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

      {/* 9. MODAL INTERACTIVO DE PAGO DIRECTO */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 sm:p-7 max-w-sm w-full font-sans shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
                  PASARELA DE PAGO EN LÍNEA
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Pagar Cuota Wild Wolves</h3>
                <p className="text-xs text-zinc-400 font-mono">Atleta: {student.fullName}</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3 font-mono">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                  ✓
                </div>
                <h4 className="text-base font-bold text-white">¡Pago Procesado con Éxito!</h4>
                <p className="text-xs text-zinc-400">Tu recibo ha sido generado y el saldo está en $0 MXN.</p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
                  <span className="text-[10px] text-zinc-400 uppercase">Total a Liquidar:</span>
                  <div className="text-2xl font-black text-white mt-1">
                    ${student.finances.balanceDue > 0 ? student.finances.balanceDue : student.finances.costPerClass}{' '}
                    <span className="text-xs font-normal text-zinc-500">MXN</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">Seleccionar Método:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod('Stripe')}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        payMethod === 'Stripe'
                          ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta / Stripe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod('Transferencia')}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        payMethod === 'Transferencia'
                          ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>SPEI</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <span>Procesando pago seguro...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar Pago de Cuota</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-zinc-400 text-xs">
        Cargando portal privado del alumno...
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}
