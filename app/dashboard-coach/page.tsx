'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { HoopStore } from '@/lib/store';
import { 
  StudentProfile, 
  User, 
  Evaluation, 
  BasketballMetrics, 
  RawEvaluationStats,
  Position,
  PaymentFrequency,
  ShiftType,
  AttendanceStatus,
  Role
} from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { MedicalModal } from '@/components/MedicalModal';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import CourtAttendanceCommand from '@/components/CourtAttendanceCommand';
import TestDayEvaluator from '@/components/TestDayEvaluator';
import DualCoachCommand from '@/components/DualCoachCommand';
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
  ChevronDown,
  Edit3,
  Trash2,
  Lock,
  Crown,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ww_mateo_07');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | 'superadmin'>('coach');

  // Filtros del Roster
  const [filterGender, setFilterGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [filterAge, setFilterAge] = useState<'ALL' | 'SUB15' | 'SUB18' | 'SENIOR'>('ALL');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  // Modales
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isEditEvalModalOpen, setIsEditEvalModalOpen] = useState(false);
  const [isDeleteEvalModalOpen, setIsDeleteEvalModalOpen] = useState(false);
  const [evalToEdit, setEvalToEdit] = useState<Evaluation | null>(null);
  const [evalToDelete, setEvalToDelete] = useState<Evaluation | null>(null);

  // Modal de Nuevo Atleta en Cancha
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'M' | 'F'>('M');
  const [newStudentAge, setNewStudentAge] = useState<number>(15);
  const [newStudentPosition, setNewStudentPosition] = useState<Position>('Base');
  const [newStudentShift, setNewStudentShift] = useState<ShiftType>('matutino_9_11');
  const [newStudentPhone, setNewStudentPhone] = useState('5522427769');
  const [newStudentGuardian, setNewStudentGuardian] = useState('Tutor de Atleta');

  // Formulario de Nueva Evaluación
  const [freeThrowMade, setFreeThrowMade] = useState<number>(17);
  const [midRangePct, setMidRangePct] = useState<number>(85);
  const [threePointPct, setThreePointPct] = useState<number>(90);
  const [verticalJumpCm, setVerticalJumpCm] = useState<number>(75);
  const [sprint100mSeconds, setSprint100mSeconds] = useState<number>(11.5);
  const [agilityTTestSeconds, setAgilityTTestSeconds] = useState<number>(9.3);
  const [coachNotes, setCoachNotes] = useState<string>('Progreso consistente en tiros libres y velocidad de sprint en transición.');

  // Formulario de Edición de Evaluación (Solo Superadmin)
  const [editFreeThrowMade, setEditFreeThrowMade] = useState<number>(17);
  const [editMidRangePct, setEditMidRangePct] = useState<number>(85);
  const [editThreePointPct, setEditThreePointPct] = useState<number>(90);
  const [editVerticalJumpCm, setEditVerticalJumpCm] = useState<number>(75);
  const [editSprint100mSeconds, setEditSprint100mSeconds] = useState<number>(11.5);
  const [editAgilityTTestSeconds, setEditAgilityTTestSeconds] = useState<number>(9.3);
  const [editCoachNotes, setEditCoachNotes] = useState<string>('');

  useEffect(() => {
    const user = HoopStore.getCurrentUser();
    setCurrentUser(user);

    // Detección de Rol
    const roleInStorage = typeof window !== 'undefined' ? localStorage.getItem('ww_user_role') : null;
    if (roleInStorage === 'superadmin' || user?.role === 'superadmin') {
      setCurrentRole('superadmin');
    } else {
      setCurrentRole('coach');
    }

    // Sincronización en vivo con Supabase Auth
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data?.user;
      if (authUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const isDirector = 
            authUser.email === 'ricardo@wildwolves.mx' || 
            authUser.email === 'carlos@wildwolves.mx' ||
            authUser.email?.toLowerCase().includes('wildwolvescdmx');

          const role = profile?.role || (isDirector ? 'superadmin' : 'coach');
          setCurrentRole(role === 'superadmin' ? 'superadmin' : 'coach');

          if (typeof window !== 'undefined') {
            localStorage.setItem('ww_user_role', role);
            localStorage.setItem('ww_user_email', authUser.email || '');
            document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `user_email=${encodeURIComponent(authUser.email || '')}; path=/; max-age=86400; SameSite=Lax`;
          }
        } catch (e) {
          console.warn('Profile sync in dashboard-coach:', e);
        }
      }
    });

    const filterRealAthletes = (raw: StudentProfile[]) => {
      return (raw || []).filter((s) => {
        const email = (s.email || "").toLowerCase().trim();
        return (
          email !== "wildwolvescdmx@gmail.com" &&
          email !== "ricardo@wildwolves.mx" &&
          s.role !== "superadmin" &&
          s.role !== "coach"
        );
      });
    };

    const list = filterRealAthletes(HoopStore.getStudents());
    setStudents(list);
    if (list.length > 0) {
      setSelectedStudentId(list[0].id);
    }

    // Sincronización en vivo con Supabase PostgreSQL
    HoopStore.syncWithSupabase().then((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setStudents(filterRealAthletes(remoteList));
      }
    });

    const handlePaymentRecorded = () => {
      setStudents(filterRealAthletes(HoopStore.getStudents()));
    };
    window.addEventListener('payment_recorded', handlePaymentRecorded);
    return () => {
      window.removeEventListener('payment_recorded', handlePaymentRecorded);
    };
  }, []);

  // Filtrado de atletas en el roster (Excluyendo al Fundador/Director)
  const filteredStudents = students.filter((s) => {
    const email = (s.email || "").toLowerCase().trim();
    if (email === "wildwolvescdmx@gmail.com" || email === "ricardo@wildwolves.mx" || s.role === "superadmin" || s.role === "coach") {
      return false;
    }
    if (filterGender !== 'ALL' && s.gender !== filterGender) return false;
    if (filterPosition !== 'ALL' && s.position !== filterPosition) return false;
    if (filterAge === 'SUB15' && s.age >= 16) return false;
    if (filterAge === 'SUB18' && (s.age < 16 || s.age > 18)) return false;
    if (filterAge === 'SENIOR' && s.age <= 18) return false;
    return true;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);
  const isSuperAdmin = currentRole === 'superadmin';

  // Alta de Atleta en Cancha por el Coach
  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const created = HoopStore.addStudent({
      fullName: newStudentName.trim(),
      email: `${newStudentName.toLowerCase().replace(/[^a-z0-9]/g, '')}@wildwolves.mx`,
      phone: newStudentPhone || '5522427769',
      parentPhone: newStudentPhone || '5522427769',
      guardianName: newStudentGuardian || 'Tutor de Atleta',
      gender: newStudentGender,
      age: Number(newStudentAge) || 15,
      position: newStudentPosition,
      jerseyNumber: Math.floor(Math.random() * 90) + 10,
      role: 'student',
      shift: newStudentShift,
      avatarUrl: '/logo-official.png',
      stripeStatus: 'pending',
      medicalNotes: {
        bloodType: 'O+',
        allergies: 'Ninguna',
        emergencyContact: newStudentGuardian || 'Tutor de Atleta',
        emergencyPhone: newStudentPhone || '5522427769',
        medicalConditions: 'Apto para entrenamiento en cancha.',
        lastCheckup: new Date().toLocaleDateString('es-MX'),
      },
    });

    const updatedList = HoopStore.getStudents();
    setStudents(updatedList);
    setSelectedStudentId(created.id);
    setIsAddStudentModalOpen(false);
    setNewStudentName('');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f97316', '#38bdf8']
      });
    } catch {}
  };

  // Toggle para testing de RBAC por el administrador
  const toggleRole = () => {
    const nextRole = currentRole === 'coach' ? 'superadmin' : 'coach';
    setCurrentRole(nextRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ww_user_role', nextRole);
    }
  };

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
  const handleRecordDailyAttendance = (studentId: string, date: string, shift: ShiftType, status: AttendanceStatus, notes?: string) => {
    HoopStore.recordDailyAttendance(studentId, date, shift, status, notes);
    setStudents(HoopStore.getStudents());
  };

  // Control Financiero: Registrar Cobro
  const handleRecordPayment = (studentId: string, amount: number, method: 'Efectivo' | 'Transferencia' | 'Stripe') => {
    HoopStore.recordPayment(studentId, amount, method);
    setStudents(HoopStore.getStudents());
  };

  // Control Financiero: Actualizar Modalidad
  const handleUpdateFrequency = (studentId: string, frequency: PaymentFrequency) => {
    HoopStore.updatePaymentFrequency(studentId, frequency);
    setStudents(HoopStore.getStudents());
  };

  // Guardado de nueva evaluación (Permitido para Coach y Superadmin)
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Normalización de métricas 0-100
    const freeThrowScore = Math.min(100, Math.max(0, Math.round((freeThrowMade / 20) * 100)));
    const verticalScore = Math.min(100, Math.max(20, Math.round((verticalJumpCm / 90) * 100)));
    const sprintScore = Math.min(100, Math.max(20, Math.round(100 - (sprint100mSeconds - 10.5) * 15)));
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

  // Abrir Modal de Edición (Exclusivo Superadmin)
  const handleOpenEditEval = (ev: Evaluation) => {
    if (!isSuperAdmin) return;
    setEvalToEdit(ev);
    setEditFreeThrowMade(ev.rawStats?.freeThrowMade || Math.round((ev.metrics.freeThrow * 20) / 100));
    setEditMidRangePct(ev.rawStats?.midRangePct || ev.metrics.midRange);
    setEditThreePointPct(ev.rawStats?.threePointPct || ev.metrics.threePoint);
    setEditVerticalJumpCm(ev.rawStats?.verticalJumpCm || Math.round((ev.metrics.verticalJump * 90) / 100));
    setEditSprint100mSeconds(ev.rawStats?.sprint100mSeconds || 11.5);
    setEditAgilityTTestSeconds(ev.rawStats?.agilityTTestSeconds || 9.2);
    setEditCoachNotes(ev.coachNotes || '');
    setIsEditEvalModalOpen(true);
  };

  // Guardar Edición de Evaluación (Exclusivo Superadmin)
  const handleSaveEditEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !evalToEdit || !isSuperAdmin) return;

    const freeThrowScore = Math.min(100, Math.max(0, Math.round((editFreeThrowMade / 20) * 100)));
    const verticalScore = Math.min(100, Math.max(20, Math.round((editVerticalJumpCm / 90) * 100)));
    const sprintScore = Math.min(100, Math.max(20, Math.round(100 - (editSprint100mSeconds - 10.5) * 15)));
    const agilityScore = Math.min(100, Math.max(20, Math.round(100 - (editAgilityTTestSeconds - 8.5) * 17)));

    const updatedMetrics: BasketballMetrics = {
      freeThrow: freeThrowScore,
      midRange: editMidRangePct,
      threePoint: editThreePointPct,
      verticalJump: verticalScore,
      sprint100m: sprintScore,
      agilityTTest: agilityScore,
    };

    const updatedRaw: RawEvaluationStats = {
      freeThrowMade: editFreeThrowMade,
      freeThrowTotal: 20,
      midRangePct: editMidRangePct,
      threePointPct: editThreePointPct,
      verticalJumpCm: editVerticalJumpCm,
      sprint100mSeconds: editSprint100mSeconds,
      agilityTTestSeconds: editAgilityTTestSeconds,
    };

    HoopStore.editEvaluation(selectedStudent.id, evalToEdit.id, updatedMetrics, updatedRaw, editCoachNotes);
    setStudents(HoopStore.getStudents());
    setIsEditEvalModalOpen(false);
    setEvalToEdit(null);
  };

  // Abrir Confirmación de Eliminación (Exclusivo Superadmin)
  const handleOpenDeleteEval = (ev: Evaluation) => {
    if (!isSuperAdmin) return;
    setEvalToDelete(ev);
    setIsDeleteEvalModalOpen(true);
  };

  // Confirmar Eliminación (Exclusivo Superadmin)
  const handleConfirmDeleteEval = () => {
    if (!selectedStudent || !evalToDelete || !isSuperAdmin) return;
    HoopStore.deleteEvaluation(selectedStudent.id, evalToDelete.id);
    setStudents(HoopStore.getStudents());
    setIsDeleteEvalModalOpen(false);
    setEvalToDelete(null);
  };

  if (!selectedStudent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto text-2xl font-black">
          WW
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
            Panel Dirección Técnica • Deportivo Carmen Serdán CDMX
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-3">
            Cargando Plantel de Atletas...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Panel Superior de Control con Roster y RBAC Indicator */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-[#27272a]">
          <div className="flex items-center gap-3.5">
            {/* Logotipo Oficial Original */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves Logo"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isSuperAdmin
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                }`}>
                  {isSuperAdmin ? <Crown className="w-3 h-3 text-amber-400" /> : <ShieldCheck className="w-3 h-3 text-orange-400" />}
                  ROL OPERACIONAL: {isSuperAdmin ? 'SUPER ADMINISTRADOR (NIVEL 0)' : 'COACH DEPORTIVO (NIVEL 1)'}
                </span>
                <span className="text-zinc-400 text-xs font-mono">
                  {students.length} Atletas • Deportivo Carmen Serdán
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Control Técnico, Evaluaciones &amp; Asistencia Diaria
              </h1>
            </div>
          </div>

          {/* Acciones Rápidas & Switcher RBAC */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Toggle RBAC para demostración o superadmin */}
            <button
              onClick={toggleRole}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                isSuperAdmin
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
              title="Cambiar permisos de vista"
            >
              {isSuperAdmin ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isSuperAdmin ? 'Modo SuperAdmin' : 'Modo Coach'}</span>
            </button>

            {selectedStudent && (
              <button
                onClick={() => setIsMedicalModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Ficha Médica ({selectedStudent.fullName.split(' ')[0]})</span>
              </button>
            )}

            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Nuevo Atleta</span>
            </button>

            {selectedStudent && (
              <button
                onClick={() => setIsEvalModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Nueva Evaluación</span>
              </button>
            )}

            {selectedStudent && <WhatsAppReportButton student={selectedStudent} label="WhatsApp" />}
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
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500 bg-[#0a0e17] rounded-xl border border-[#27272a] mt-2">
              No hay atletas registrados o no coinciden con los filtros. Haz clic en &quot;+ Nuevo Atleta&quot; para dar de alta en cancha.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {filteredStudents.map((st) => {
                const isSelected = selectedStudent ? st.id === selectedStudent.id : false;
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
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={st.avatarUrl || '/logo-official.png'}
                        alt={st.fullName}
                        className="w-9 h-9 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {st.fullName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {st.position} • #{st.jerseyNumber || '—'}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      st.finances?.status === 'al_corriente' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {st.finances?.status === 'al_corriente' ? '$0' : `$${st.finances?.balanceDue || 50}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!selectedStudent ? (
        <div className="bg-[#121724] border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white">
            Plantel de Cancha Listo para Registro
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            La base de datos se encuentra limpia y en blanco. Puedes dar de alta al primer atleta que se presente a entrenamiento o esperar registros desde la web pública.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Primer Atleta en Cancha</span>
            </button>
            <Link
              href="/master-bunker-hq"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Ir a Búnker HQ</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Comando Táctico Stitch en Cancha */}
          <div className="mb-6">
            <CourtAttendanceCommand />
          </div>

          {/* 2. Pase de Lista y Asistencia Oficial de Atletas en Cancha */}
          <AttendanceTracker
            student={selectedStudent}
            allStudents={students}
            readOnly={false}
            onRecordDailyAttendance={handleRecordDailyAttendance}
            onPaymentRecorded={() => {
              setStudents(HoopStore.getStudents());
            }}
          />

          {/* 3. Módulo Táctico Dual: Diagnóstico Día 1, Preparación Física y Baloncesto */}
          <div className="mb-6">
            <DualCoachCommand />
          </div>

          {/* 4. Módulo de Captura en Cancha: Test Day Biomecánico */}
          <div className="mb-6">
            <TestDayEvaluator />
          </div>

          {/* 5. Radar 360° del Atleta Seleccionado (Comparativa Mes Actual vs. Mes Anterior) */}
          <RadarChart360
            metricsCurrent={selectedStudent.metricsCurrent}
            metricsPrevious={selectedStudent.metricsPrevious}
            athleteName={selectedStudent.fullName}
          />

      {/* 4. PASO 3: SECCIÓN DE HISTORIAL DE EVALUACIONES & RESTRICCIÓN RBAC */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                HISTORIAL DE PRUEBAS DEPORTIVAS (TEST DAY)
              </span>
              {isSuperAdmin ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  PERMISOS ACTIVOS: EDICIÓN &amp; ELIMINACIÓN
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400 bg-[#0a0e17] px-2 py-0.5 rounded border border-[#27272a] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-500" />
                  Modo Coach: Solo Lectura del Histórico
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              <span>Bitácora de Evaluaciones: {selectedStudent.fullName}</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              {isSuperAdmin
                ? 'Como Super Administrador puedes editar cualquier prueba previa o eliminarla con recalibración del radar.'
                : 'Los Coaches pueden ingresar nuevas pruebas deportivas pero no pueden modificar ni borrar el histórico de métricas.'}
            </p>
          </div>

          <button
            onClick={() => setIsEvalModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Cargar Evaluación Mensual</span>
          </button>
        </div>

        {/* Lista de Evaluaciones del Atleta con Botones según Rol */}
        {selectedStudent.evaluations.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500 bg-[#0a0e17] rounded-xl border border-[#27272a]">
            Este atleta no tiene evaluaciones históricas registradas. Haz clic en &quot;+ Cargar Evaluación Mensual&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedStudent.evaluations.map((ev, index) => (
              <div
                key={ev.id}
                className="bg-[#0a0e17] border border-[#27272a] hover:border-zinc-700 rounded-xl p-4 font-mono text-xs transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-white font-bold text-sm font-sans">{ev.date}</span>
                    <span className="text-[10px] text-zinc-400">evaluado por {ev.coachName}</span>
                    {index === 0 && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        Vigente
                      </span>
                    )}
                  </div>

                  {/* Acciones de Edición/Eliminación: EXCLUSIVAS PARA SUPERADMIN */}
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditEval(ev)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Editar evaluación deportiva"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteEval(ev)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Eliminar evaluación del histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-600" />
                      <span>Protegido contra edición</span>
                    </div>
                  )}
                </div>

                {/* Métricas Raw de la Prueba */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 my-2 text-[11px] pt-1 border-t border-zinc-800/60">
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">T. Libres</span>
                    <strong className="text-white">{ev.rawStats?.freeThrowMade || Math.round((ev.metrics.freeThrow * 20)/100)}/20</strong>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">Media Dist.</span>
                    <strong className="text-white">{ev.rawStats?.midRangePct || ev.metrics.midRange}%</strong>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">Triples</span>
                    <strong className="text-white">{ev.rawStats?.threePointPct || ev.metrics.threePoint}%</strong>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">Salto</span>
                    <strong className="text-orange-400">{ev.rawStats?.verticalJumpCm || Math.round((ev.metrics.verticalJump * 90)/100)} cm</strong>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">100m Sprint</span>
                    <strong className="text-sky-400">{ev.rawStats?.sprint100mSeconds || 11.5}s</strong>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg">
                    <span className="text-zinc-500 text-[10px] block">T-Test Agilidad</span>
                    <strong className="text-emerald-400">{ev.rawStats?.agilityTTestSeconds || 9.2}s</strong>
                  </div>
                </div>

                {ev.coachNotes && (
                  <div className="p-2.5 bg-zinc-900/40 rounded-lg text-zinc-300 font-sans text-xs mt-2 border border-zinc-800/40">
                    <span className="font-mono font-bold text-orange-400 mr-1.5">Feedback:</span>
                    {ev.coachNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Cuerda & Resistencia */}
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

      {/* 6. Modal de Ficha Médica */}
      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        student={selectedStudent}
        isCoach={true}
      />

      {/* 7. Modal de Nueva Evaluación (Coach & SuperAdmin) */}
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
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiros Libres Anotados (Base 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={freeThrowMade}
                    onChange={(e) => setFreeThrowMade(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Media Distancia (% Eficacia)
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

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiro de 3 / Larga Distancia (%)
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

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Sprint 100m (Segundos)
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

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    T-Test Agilidad (Segundos)
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

      {/* 8. MODAL DE EDICIÓN DE EVALUACIÓN (SOLO SUPERADMINISTRADOR) */}
      {isEditEvalModalOpen && evalToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-[#18181b] border border-amber-500/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full relative my-8 font-sans shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                  <Crown className="w-3 h-3 text-amber-400" />
                  EDICIÓN SUPERADMINISTRADOR • {evalToEdit.date}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Modificar Evaluación Histórica</h3>
                <p className="text-xs font-mono text-zinc-400">Atleta: {selectedStudent.fullName}</p>
              </div>
              <button
                onClick={() => setIsEditEvalModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEval} className="mt-5 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiros Libres Anotados (Base 20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editFreeThrowMade}
                    onChange={(e) => setEditFreeThrowMade(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Media Distancia (% Eficacia)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editMidRangePct}
                    onChange={(e) => setEditMidRangePct(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Tiro de 3 / Larga Distancia (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editThreePointPct}
                    onChange={(e) => setEditThreePointPct(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Salto Vertical Real (cm)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="120"
                    value={editVerticalJumpCm}
                    onChange={(e) => setEditVerticalJumpCm(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    Sprint 100m (Segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="9.0"
                    max="20.0"
                    value={editSprint100mSeconds}
                    onChange={(e) => setEditSprint100mSeconds(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>

                <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                    T-Test Agilidad (Segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="7.0"
                    max="16.0"
                    value={editAgilityTTestSeconds}
                    onChange={(e) => setEditAgilityTTestSeconds(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-base"
                  />
                </div>
              </div>

              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">
                  Observaciones Técnicas (Modificadas)
                </label>
                <textarea
                  rows={3}
                  value={editCoachNotes}
                  onChange={(e) => setEditCoachNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditEvalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios &amp; Recalcular Radar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (SOLO SUPERADMINISTRADOR) */}
      {isDeleteEvalModalOpen && evalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18181b] border border-rose-500/40 rounded-2xl p-6 sm:p-7 max-w-md w-full font-sans shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center">
              ¿Eliminar Evaluación del Histórico?
            </h3>
            <p className="text-xs text-zinc-400 text-center mt-2 font-mono">
              Estás a punto de borrar la evaluación del <strong className="text-white">{evalToDelete.date}</strong> para <strong className="text-white">{selectedStudent?.fullName}</strong>.
              El radar 360° se recalibrará automáticamente con la prueba previa.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteEvalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEval}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 10. MODAL DE REGISTRO RÁPIDO DE ATLETA EN CANCHA (COACH & ADMIN) */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8 max-w-lg w-full relative my-8 font-sans shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ALTA IN SITU • CANCHA DEPORTIVO CARMEN SERDÁN
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Registrar Atleta en Cancha</h3>
                <p className="text-xs font-mono text-zinc-400">Ingreso directo al roster y control de asistencia</p>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="mt-5 space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Nombre Completo del Atleta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mateo González Morales"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-white font-sans text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Género
                  </label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'M' | 'F')}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="M">Varonil</option>
                    <option value="F">Femenil</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Edad (Años)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={newStudentAge}
                    onChange={(e) => setNewStudentAge(parseInt(e.target.value) || 15)}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Posición
                  </label>
                  <select
                    value={newStudentPosition}
                    onChange={(e) => setNewStudentPosition(e.target.value as Position)}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Base">Base</option>
                    <option value="Escolta">Escolta</option>
                    <option value="Alero">Alero</option>
                    <option value="Ala-Pívot">Ala-Pívot</option>
                    <option value="Pívot">Pívot</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Turno Asignado
                  </label>
                  <select
                    value={newStudentShift}
                    onChange={(e) => setNewStudentShift(e.target.value as ShiftType)}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="matutino_9_11">09:00 - 11:00 hrs</option>
                    <option value="vespertino_17_19">17:00 - 19:00 hrs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    WhatsApp Atleta / Tutor
                  </label>
                  <input
                    type="tel"
                    placeholder="55 2242 7769"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                    Nombre del Tutor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sofía Morales"
                    value={newStudentGuardian}
                    onChange={(e) => setNewStudentGuardian(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dar de Alta &amp; Activar Ficha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
