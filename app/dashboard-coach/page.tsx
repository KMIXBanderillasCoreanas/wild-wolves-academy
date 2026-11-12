'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { HoopStore, generateSchedule } from '@/lib/store';
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
  Role,
  ProgressiveTraining
} from '@/lib/types';
import { RadarChart360 } from '@/components/RadarChart360';
import { RopeTracker } from '@/components/RopeTracker';
import { EnduranceCalendar } from '@/components/EnduranceCalendar';
import { MedicalModal } from '@/components/MedicalModal';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import CourtAttendanceCommand from '@/components/CourtAttendanceCommand';
import BasketballCourtHeatmap from '@/components/BasketballCourtHeatmap';
import TacticalCourtStitch from '@/components/TacticalCourtStitch';
import SportsTestExpressModal from '@/components/SportsTestExpressModal';
import TestDayEvaluator from '@/components/TestDayEvaluator';
import DualCoachCommand from '@/components/DualCoachCommand';
import SmartPlacementCRM from '@/components/SmartPlacementCRM';
import { FinanceManager } from '@/components/FinanceManager';
import BioimpedanceWizard from '@/components/BioimpedanceWizard';
import MatchSheetScanner from '@/components/MatchSheetScanner';
import WhatsAppAIEngine from '@/components/WhatsAppAIEngine';
import CourtVisionHUD from '@/components/CourtVisionHUD';
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
  Flame,
  Layers,
  ChevronDown,
  Edit3,
  Trash2,
  Lock,
  Crown,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2,
  LogOut,
  UploadCloud,
  FileJson
} from 'lucide-react';

function CoachDashboardContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ww_mateo_07');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | 'superadmin'>('coach');

  // Pestañas Principales en Estructura: 1. Cancha & Asistencia | 2. Pruebas Básicas | 3. Cédulas OCR | 4. Finanzas | 5. Reportes IA & WhatsApp
  const [coachActiveTab, setCoachActiveTab] = useState<'cancha_eval' | 'pruebas_basicas' | 'match_ocr' | 'finanzas_gestion' | 'reportes_ia'>('cancha_eval');
  const [selectedAthleteForModal, setSelectedAthleteForModal] = useState<StudentProfile | null>(null);


  // Filtros del Roster
  const [filterGender, setFilterGender] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [filterAge, setFilterAge] = useState<'ALL' | 'SUB15' | 'SUB18' | 'SENIOR'>('ALL');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState<string>('');

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
    let isMounted = true;

    try {
      const user = HoopStore.getCurrentUser();
      if (isMounted) setCurrentUser(user);

      // Detección de Rol
      const roleInStorage = typeof window !== 'undefined' ? localStorage.getItem('ww_user_role') : null;
      if (roleInStorage === 'superadmin' || user?.role === 'superadmin') {
        if (isMounted) setCurrentRole('superadmin');
      } else {
        if (isMounted) setCurrentRole('coach');
      }
    } catch (e) {
      console.warn('Error reading local user:', e);
    }

    const filterRealAthletes = (raw: StudentProfile[]) => {
      return (raw || []).filter((s) => {
        const email = (s?.email || "").toLowerCase().trim();
        return (
          email !== "wildwolvescdmx@gmail.com" &&
          email !== "ricardo@wildwolves.mx" &&
          s?.role !== "superadmin" &&
          s?.role !== "coach"
        );
      });
    };

    // Carga inicial local y limpieza de almacenamiento
    try {
      if (typeof window !== "undefined") {
        // Purgar Bruno de todas las llaves locales
        ['ww_offline_sports_tests', 'wild_wolves_offline_queue', 'ww_offline_queue', 'wildwolves_offline_queue'].forEach(k => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const cleaned = parsed.filter((item: any) => {
                  const p = item.payload || item;
                  const name = (p.full_name || p.athlete_name || p.name || p.athlete_full_name || '').toLowerCase();
                  return !name.includes('bruno');
                });
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          } catch {}
        });
      }

      const localList = filterRealAthletes(HoopStore.getStudents() || []);
      if (isMounted) {
        setStudents(localList);
        if (localList.length > 0) {
          setSelectedStudentId(localList[0].id);
        }
      }
    } catch (e) {
      console.warn('Error reading HoopStore students:', e);
    }

    // Sincronización en vivo con Supabase Auth
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data?.user;
      if (authUser && isMounted) {
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
          if (isMounted) setCurrentRole(role === 'superadmin' ? 'superadmin' : 'coach');

          if (typeof window !== 'undefined') {
            localStorage.setItem('ww_user_role', role);
            localStorage.setItem('ww_user_email', authUser.email || '');
            document.cookie = `user_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
            document.cookie = `user_email=${encodeURIComponent(authUser.email || '')}; path=/; max-age=31536000; SameSite=Lax`;
          }
        } catch (e) {
          console.warn('Profile sync in dashboard-coach:', e);
        }
      }
    }).catch((err) => {
      console.warn('Supabase auth error in dashboard-coach:', err);
    });

    // Sincronización en vivo con Supabase PostgreSQL
    HoopStore.syncWithSupabase()
      .then((remoteList) => {
        if (isMounted && remoteList && remoteList.length > 0) {
          const filtered = filterRealAthletes(remoteList);
          setStudents(filtered);
          if (filtered.length > 0) {
            setSelectedStudentId((prev) => (filtered.some((s) => s.id === prev) ? prev : filtered[0].id));
          }
        }
      })
      .catch((err) => {
        console.warn('syncWithSupabase error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const handlePaymentRecorded = () => {
      if (isMounted) {
        setStudents(filterRealAthletes(HoopStore.getStudents() || []));
      }
    };

    const handleSportsTestsUpdated = (e: any) => {
      if (!isMounted) return;
      const updatedStudentId = e?.detail?.studentId;
      const updatedEval = e?.detail?.evaluation;

      // Actualizar estado local inmediatamente para reactividad instantánea
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === updatedStudentId && updatedEval) {
            const currentEvals = s.evaluations || [];
            return {
              ...s,
              evaluations: [
                {
                  id: `eval-live-${Date.now()}`,
                  studentId: s.id,
                  evaluatorId: 'coach-live',
                  date: updatedEval.evaluation_date || new Date().toISOString(),
                  overallOvr: updatedEval.overall_ovr,
                  jumpRopeCount: updatedEval.jump_rope_count,
                  rawStats: updatedEval.rawStats || {
                    shootingPercentage: updatedEval.shooting_percentage,
                    sprint100mSeconds: updatedEval.sprint_seconds,
                    jumpRopeCount: updatedEval.jump_rope_count,
                    verticalJumpCm: 50,
                  },
                } as any,
                ...currentEvals,
              ],
            };
          }
          return s;
        })
      );
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('payment_recorded', handlePaymentRecorded);
      window.addEventListener('sports_tests_updated', handleSportsTestsUpdated);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('payment_recorded', handlePaymentRecorded);
        window.removeEventListener('sports_tests_updated', handleSportsTestsUpdated);
      }
    };
  }, []);

  // Filtrado de atletas en el roster con barra de búsqueda rápida
  const filteredStudents = students.filter((s) => {
    const email = (s.email || "").toLowerCase().trim();
    if (email === "wildwolvescdmx@gmail.com" || email === "ricardo@wildwolves.mx" || s.role === "superadmin" || s.role === "coach") {
      return false;
    }
    if (athleteSearchQuery.trim()) {
      const q = athleteSearchQuery.toLowerCase().trim();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchJersey = s.jerseyNumber ? String(s.jerseyNumber).includes(q) : false;
      const matchPos = s.position ? s.position.toLowerCase().includes(q) : false;
      if (!matchName && !matchJersey && !matchPos) return false;
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ww_user_role');
      localStorage.removeItem('ww_user_email');
      localStorage.removeItem('ww_student_name');
      localStorage.removeItem('ww_target_name');
      document.cookie = 'user_role=; path=/; max-age=0';
      document.cookie = 'user_email=; path=/; max-age=0';
      window.dispatchEvent(new Event('auth_changed'));
      window.location.href = '/login';
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Cargando Búnker Táctico...
        </span>
      </div>
    );
  }

  const athleteDisplayName = selectedStudent?.fullName || 'Atleta';
  const athleteFirstName = athleteDisplayName.split(' ')[0] || 'Atleta';
  const evaluationsList = Array.isArray(selectedStudent?.evaluations) ? selectedStudent.evaluations : [];
  const trainingData: ProgressiveTraining = selectedStudent?.training || {
    ropeJumpsToday: 100,
    ropeTarget: 500,
    joggingMinutesToday: 10,
    joggingTarget: 30,
    schedule: generateSchedule(1),
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
        {/* SELECTOR SUPERIOR: ESTRUCTURA MODULAR INDEPENDIENTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#121724] border border-zinc-800 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <button
                type="button"
                onClick={() => setCoachActiveTab('cancha_eval')}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  coachActiveTab === 'cancha_eval'
                    ? 'bg-[#ea580c] text-white shadow-lg shadow-orange-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1. Cancha & Asistencia</span>
              </button>

              <button
                type="button"
                onClick={() => setCoachActiveTab('pruebas_basicas')}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  coachActiveTab === 'pruebas_basicas'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Target className="w-4 h-4 text-purple-300" />
                <span>2. Pruebas Deportivas Básicas</span>
              </button>

              <button
                type="button"
                onClick={() => setCoachActiveTab('match_ocr')}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  coachActiveTab === 'match_ocr'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-600/30 ring-1 ring-orange-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>3. Cédulas OCR</span>
              </button>

              <button
                type="button"
                onClick={() => setCoachActiveTab('finanzas_gestion')}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  coachActiveTab === 'finanzas_gestion'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span className="text-amber-400 font-bold">$</span>
                <span>4. Finanzas & Caja</span>
              </button>

              <button
                type="button"
                onClick={() => setCoachActiveTab('reportes_ia')}
                className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  coachActiveTab === 'reportes_ia'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>5. Reportes IA & WhatsApp</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 px-3 py-1 hidden xl:block">
              {coachActiveTab === 'cancha_eval' 
                ? '⚡ Cancha en Vivo: Pase 1-Tap & Cobro' 
                : coachActiveTab === 'pruebas_basicas'
                ? '🎯 Pruebas Deportivas Básicas (Tiro, Velocidad, Cuerda)'
                : coachActiveTab === 'match_ocr' 
                ? '📷 Escáner de Cédulas OCR' 
                : coachActiveTab === 'finanzas_gestion'
                ? '💰 Finanzas y Control de Pagos'
                : '🤖 Reportes Automatizados IA para Tutores'}
            </div>
          </div>

          {/* VISTA 1: MODO CANCHA — EXCLUSIVO COMANDO EN VIVO (PASO DE LISTA & COBROS) */}
          {coachActiveTab === 'cancha_eval' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Comando Táctico Stitch en Cancha con Lista, Horarios Oficiales y Cobro */}
              <CourtAttendanceCommand />
            </div>
          )}

          {/* VISTA 2: PRUEBAS DEPORTIVAS BÁSICAS (EJECUCIÓN DE TIRO, VELOCIDAD 100M, SALTO DE CUERDA) */}
          {coachActiveTab === 'pruebas_basicas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#0f1420] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                        Registro de Pruebas Deportivas Básicas
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Duela Carmen Serdán • Ejecución de Tiro (55 Lanzamientos), Máxima Velocidad (100m sprint), Salto de Cuerda y Líneas.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón para Subir Pruebas Deportivas (JSON o Archivo de Pruebas) */}
                    <label className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-zinc-700 cursor-pointer transition shadow-md">
                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                      <span>Subir Pruebas (JSON / Archivo)</span>
                      <input
                        type="file"
                        accept=".json,.csv,.txt"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const text = await file.text();
                            let parsed: any;
                            try {
                              parsed = JSON.parse(text);
                            } catch {
                              alert("Formato no reconocido como JSON válido. Asegúrate de seleccionar el archivo exportado de pruebas.");
                              return;
                            }
                            const res = await fetch("/api/sync-offline-tests", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(parsed)
                            });
                            if (res.ok) {
                              if (typeof window !== "undefined") {
                                localStorage.removeItem("ww_offline_queue");
                                localStorage.removeItem("ww_offline_sports_tests");
                                localStorage.removeItem("wild_wolves_offline_queue");
                              }
                              alert("¡Pruebas deportivas subidas y sincronizadas con éxito a Supabase!");
                              HoopStore.syncWithSupabase().then((list) => {
                                if (list && list.length > 0) setStudents(list);
                              });
                            } else {
                              const errData = await res.json();
                              alert("Error al sincronizar: " + (errData.error || "Fallo en servidor"));
                            }
                          } catch (err: any) {
                            alert("Error al leer archivo: " + err.message);
                          }
                        }}
                      />
                    </label>

                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={() => setSelectedAthleteForModal(selectedStudent)}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-950/50 transition cursor-pointer shrink-0"
                      >
                        <PlusCircle className="w-4 h-4 text-purple-200" />
                        <span>+ Calificar Pruebas de {selectedStudent.fullName.split(' ')[0]}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Selector de Atleta Rápido */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                    Selecciona al Atleta para Ver su % de Tiro y Registrar Pruebas:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {students.map((st) => {
                      const isSelected = selectedStudent?.id === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStudentId(st.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 font-black ring-1 ring-purple-300'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[10px] opacity-75">#{st.jerseyNumber || 11}</span>
                          <span>{st.fullName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cancha Táctica Stitch Interactiva (Medidas Oficiales FIBA, Iluminación Radial y Desglose Biomecánico) */}
                {selectedStudent && (
                  <div className="space-y-6">
                    {/* Cancha Táctica Stitch Interactiva (Medidas Oficiales FIBA, Iluminación Radial y Desglose Biomecánico) */}
                    {(() => {
                      const latestEv = selectedStudent.evaluations?.[0];
                      const raw = (latestEv as any)?.rawStats || {};

                      // Priorizar evaluaciones dinámicas en tiempo real (eliminando bloqueos estáticos)
                      const officialShootingPct = raw.shootingPercentage ?? (latestEv as any)?.shootingPercentage ?? selectedStudent.metricsCurrent?.freeThrow ?? 60;
                      const officialSprintSec = raw.sprint100mSeconds ?? (latestEv as any)?.sprint100mSeconds ?? 12.5;
                      const officialRopeCount = (latestEv as any)?.jumpRopeCount ?? raw.jumpRopeCount ?? selectedStudent.training?.ropeJumpsToday ?? 150;
                      const officialVerticalCm = raw.verticalJumpCm ?? (latestEv as any)?.verticalJumpCm ?? 40;
                      const officialOvr = (latestEv as any)?.overallOvr ?? raw.overallOvr ?? 75;

                      return (
                        <>
                          <TacticalCourtStitch
                            athleteName={selectedStudent.fullName}
                            jerseyNumber={selectedStudent.jerseyNumber || 10}
                            category={(selectedStudent as any).category || (selectedStudent.position ? `${selectedStudent.position} · Formativo` : "U-17 Formativo")}
                            overallOvr={officialOvr}
                            shootingPercentage={officialShootingPct}
                            initialZone="paint"
                          />

                          {/* Fichas de las 3 Pruebas Básicas Clave con Métricas Reales */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1 shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-orange-400 uppercase font-mono">1. Tiro (Efectividad Total)</span>
                                <Target className="w-4 h-4 text-orange-400" />
                              </div>
                              <p className="text-2xl font-black text-white font-mono">
                                {officialShootingPct}% Acertado
                              </p>
                              <p className="text-[11px] text-zinc-400">
                                Protocolo oficial de 55 lanzamientos (10 TL + 20 Media + 25 Triples)
                              </p>
                            </div>

                            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1 shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono">2. Velocidad y Circuito</span>
                                <Activity className="w-4 h-4 text-emerald-400" />
                              </div>
                              <p className="text-2xl font-black text-emerald-400 font-mono">
                                {officialSprintSec}s
                              </p>
                              <p className="text-[11px] text-zinc-400">
                                Salto vertical: <strong className="text-white">{officialVerticalCm} cm</strong> · Circuito de líneas ida y vuelta
                              </p>
                            </div>

                            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1 shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-amber-400 uppercase font-mono">3. Saltar la Cuerda</span>
                                <Flame className="w-4 h-4 text-amber-400" />
                              </div>
                              <p className="text-2xl font-black text-amber-400 font-mono">
                                {officialRopeCount.toLocaleString('es-MX')} saltos
                              </p>
                              <p className="text-[11px] text-zinc-400">
                                Resistencia neuromuscular y pliométrica evaluada en duela
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA 3: ESCÁNER DE HOJA DE PARTIDO (OCR DUELA) */}
          {coachActiveTab === 'match_ocr' && (
            <div className="space-y-6 animate-fadeIn">
              <MatchSheetScanner
                studentId={selectedStudent?.id || students[0]?.id || ''}
                studentName={selectedStudent?.fullName || students[0]?.fullName || 'Plantel Carmen Serdán'}
                onSyncSuccess={() => {
                  setStudents(HoopStore.getStudents());
                }}
              />
            </div>
          )}

          {/* VISTA 4: FINANZAS & CONTROL DE PAGOS */}
          {coachActiveTab === 'finanzas_gestion' && (
            <div className="space-y-6 animate-fadeIn">
              <FinanceManager
                students={students}
                onRecordPayment={handleRecordPayment}
                onUpdateFrequency={handleUpdateFrequency}
              />
            </div>
          )}

          {/* VISTA 5: GENERADOR DE REPORTES AUTOMATIZADOS CON IA & WHATSAPP CRM */}
          {coachActiveTab === 'reportes_ia' && (
            <div className="space-y-6 animate-fadeIn">
              <WhatsAppAIEngine 
                records={students.map(s => ({
                  athlete_name: s.fullName,
                  jersey_number: s.jerseyNumber || 11,
                  category: (s as any).category || 'U-17 Competitivo',
                  overall_ovr: (s as any).ovr || 85,
                  free_throws_made: s.metricsCurrent?.freeThrow ? Math.round(s.metricsCurrent.freeThrow / 10) : 10,
                  three_point_made: s.metricsCurrent?.threePoint ? Math.round(s.metricsCurrent.threePoint / 4) : 15,
                  vertical_jump_cm: s.metricsCurrent?.verticalJump || 110,
                  coach_feedback: 'Evaluación técnica completada en duela Carmen Serdán.',
                  tutor_phone: (s as any).parentPhone || (s as any).phone || '5522427769',
                  parent_name: (s as any).parentName,
                  student_id: s.id
                }))}
              />
            </div>
          )}

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
                <p className="text-xs font-mono text-zinc-400">Atleta: {athleteDisplayName}</p>
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
                <p className="text-xs font-mono text-zinc-400">Atleta: {athleteDisplayName}</p>
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

      {/* 11. MODAL DE PRUEBAS DEPORTIVAS BÁSICAS EXPRESS */}
      {selectedAthleteForModal && (
        <SportsTestExpressModal
          athlete={{
            id: selectedAthleteForModal.id,
            full_name: selectedAthleteForModal.fullName,
            category: (selectedAthleteForModal as any).category || "U-15",
          }}
          onClose={() => setSelectedAthleteForModal(null)}
          onSaved={() => {
            setSelectedAthleteForModal(null);
            try {
              const stored = JSON.parse(localStorage.getItem("ww_student_evaluations") || "{}");
              const savedEval = stored[selectedAthleteForModal.id];
              if (savedEval) {
                setStudents((prev) =>
                  prev.map((s) => {
                    if (s.id === selectedAthleteForModal.id) {
                      return {
                        ...s,
                        evaluations: [
                          {
                            id: `eval-immediate-${Date.now()}`,
                            studentId: s.id,
                            evaluatorId: "coach-direct",
                            date: savedEval.evaluation_date || new Date().toISOString(),
                            overallOvr: savedEval.overall_ovr,
                            jumpRopeCount: savedEval.jump_rope_count,
                            shootingPercentage: savedEval.shooting_percentage,
                            rawStats: savedEval.rawStats || {
                              shootingPercentage: savedEval.shooting_percentage,
                              sprint100mSeconds: savedEval.sprint_seconds,
                              jumpRopeCount: savedEval.jump_rope_count,
                              verticalJumpCm: 50,
                            },
                          } as any,
                          ...(s.evaluations || []),
                        ],
                      };
                    }
                    return s;
                  })
                );
              }
            } catch {}
            HoopStore.syncWithSupabase().then((list) => {
              if (list) setStudents(list);
            });
          }}
        />
      )}
      </div>
    </>
  );
}

export default function CoachDashboardPage() {
  return (
    <ErrorBoundary fallbackTitle="Portal del Coach - Modo Seguro">
      <CoachDashboardContent />
    </ErrorBoundary>
  );
}
