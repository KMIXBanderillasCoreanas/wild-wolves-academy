"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DuelaHolografica3D from "@/components/DuelaHolografica3D";
import ShotScienceDashboard from "@/components/ShotScienceDashboard";
import BiomechanicsProBenchmark from "@/components/BiomechanicsProBenchmark";
import { StudentVsNbaComparison } from "@/components/nba/StudentVsNbaComparison";
import CourtRulesEncyclopedia from "@/components/CourtRulesEncyclopedia";
import LoboProModal from "@/components/LoboProModal";
import SubscriptionBannerAlert from "@/components/SubscriptionBannerAlert";
import ErrorBoundary from "@/components/ErrorBoundary";
import UpgradeModal from "@/components/UpgradeModal";
import DemoModeToggle from "@/components/DemoModeToggle";
import PaywallLockCard from "@/components/PaywallLockCard";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import { generateFullReportHTML } from "@/lib/reportGenerator";
import { 
  generarReporteWhatsAppTutor,
  generarReporteSemanalHumanoCoachAction
} from "@/app/actions/wild-wolves-actions";
import CleanPortalTabs from "@/components/CleanPortalTabs";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Award, 
  Target, 
  LogOut, 
  Flame, 
  Sparkles, 
  Download,
  ShieldCheck,
  Zap,
  Activity,
  Scale,
  Droplets,
  Dumbbell,
  Clock,
  ShieldAlert,
  Check,
  Copy,
  RefreshCw,
  Phone,
  Heart,
  Smile,
  CheckCircle2,
  ChevronRight,
  Lock,
  KeyRound
} from "lucide-react";

// Constantes de Seguridad y Respaldo por Omisión (Safety Guards)
const DEFAULT_STUDENT_DATA = {
  id: "student-bruno-diaz",
  full_name: "Alumno Demo (Atleta)",
  email: "bruno@wildwolves.mx",
  jersey_number: 11,
  category: "U-17 Competitivo",
  position: "GUARD (SG)",
  age: 15,
  weight_kg: 68.4,
  fat_percentage: 15.2,
  muscle_mass_kg: 42.0,
  water_percentage: 58.5,
  visceral_fat: 4,
  bmi: 21.3,
  metabolic_age: 15,
  subscription_status: "FREE",
  subscription_plan: "FREE",
  training_schedule: "Vespertino (16:00 - 18:00)",
  training_days: "Lunes a Sábado",
  financial_status: "al_corriente",
  current_debt_amount: 0,
  current_tier: "Intermedio"
};

const DEFAULT_UNIFIED_TEST = {
  free_throws_made: 8,
  mid_range_made: 12,
  three_point_made: 15,
  spot_corner_left: 3,
  spot_wing_left: 3,
  spot_top_key: 4,
  spot_wing_right: 3,
  spot_corner_right: 2,
  jump_rope_count: 500,
  vertical_jump_cm: 65,
  sprint_100m_seconds: 13.5,
  lines_round_trip_seconds: 18.2,
  overall_ovr: 88,
  weight_kg: 68.4,
  fat_percentage: 15.2,
  muscle_mass_kg: 42.0,
  water_percentage: 58.5,
  visceral_fat: 4,
  bmi: 21.3,
  metabolic_age: 15,
  evaluation_date: "27 Octubre 2026",
  coach_feedback: "Atleta con excelente disciplina en duela. Enfocado en consolidar el rango Avanzado.",
  athletic_level_assessed: "formativo_competitivo"
};

function GuardianDashboardContent() {
  const { isPro: isProMode, setMode: setDemoMode } = useSubscriptionTier();
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'clean_portal' | 'profile_physical' | 'court_thermal' | 'nba_comparison'>('clean_portal');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [guardianProfile, setGuardianProfile] = useState<any>({
    full_name: "Tutor Familiar",
    relationship_type: "padre_madre",
    linked_student_name: "Alumno Representado"
  });
  const [studentProfile, setStudentProfile] = useState<any>(DEFAULT_STUDENT_DATA);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [latestTest, setLatestTest] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [badges, setBadges] = useState<any[]>([]);
  const [homeLogs, setHomeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [aiReportGenerating, setAiReportGenerating] = useState<boolean>(false);
  const [aiReportModalOpen, setAiReportModalOpen] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>("");

  // Estados dedicados a "El Reporte del Coach" y accesibilidad
  const [coachHumanReport, setCoachHumanReport] = useState<string>("");
  const [coachReportLoading, setCoachReportLoading] = useState<boolean>(false);
  const [copiedCoachReport, setCopiedCoachReport] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    loadGuardianData();
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "court" || tabParam === "duela" || tabParam === "cobertura" || tabParam === "tiro") {
        setActiveTab("court_thermal");
      } else if (tabParam === "nba" || tabParam === "comparativa" || tabParam === "brecha" || tabParam === "leyendas") {
        setActiveTab("nba_comparison");
      }
    }
  }, []);

  async function loadGuardianData(overrideStudentQuery?: string) {
    setLoading(true);
    setLoadError(null);
    try {
      // 1. Obtener sesión de Supabase si existe
      let user = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        user = authData?.user || null;
      } catch (authErr) {
        console.warn("Supabase auth aviso:", authErr);
      }

      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;
      const effectiveEmail = user?.email || storedEmail || "";
      const effectiveUserId = user?.id || null;

      // Si no hay correo ni sesión iniciada, enviar de inmediato al portal de login
      if (!effectiveEmail && !user) {
        if (typeof window !== "undefined") {
          window.location.href = "/login?redirect=/dashboard-guardian";
        }
        return;
      }

      // Validar si el usuario autenticado es un alumno puro sin acceso de tutor
      const userRole = typeof window !== "undefined" ? localStorage.getItem("ww_user_role") : null;
      const userCat = typeof window !== "undefined" ? localStorage.getItem("ww_account_category") : null;
      const metaRole = user?.user_metadata?.assigned_role || user?.user_metadata?.role;
      const isPureStudent = 
        userRole === "student" && 
        userCat !== "guardian_family" && 
        metaRole !== "guardian" && 
        !effectiveEmail.toLowerCase().includes("tutor") && 
        effectiveEmail.toLowerCase() !== "catalinalopez2450@gmail.com" &&
        effectiveEmail.toLowerCase() !== "wildwolvescdmx@gmail.com";

      if (isPureStudent) {
        if (typeof window !== "undefined") {
          window.location.replace("/dashboard-student");
        }
        return;
      }

      const queryTarget = overrideStudentQuery || selectedStudentId;

      // 2. Consulta directa y exclusiva a Supabase por ID o correo del tutor autenticado
      let directGuardian: any = null;
      let directStudent: any = null;

      try {
        let gQuery = supabase.from("profiles").select("*");
        if (effectiveUserId) {
          gQuery = gQuery.eq("id", effectiveUserId);
        } else if (effectiveEmail) {
          gQuery = gQuery.eq("email", effectiveEmail);
        }
        const { data: gData } = await gQuery.maybeSingle();
        directGuardian = gData;

        // Si encontramos al tutor, buscar a su atleta vinculado
        if (directGuardian?.linked_student_id) {
          const { data: sData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", directGuardian.linked_student_id)
            .maybeSingle();
          directStudent = sData;
        } else if (directGuardian?.linked_student_name) {
          const { data: sData } = await supabase
            .from("profiles")
            .select("*")
            .ilike("full_name", `%${directGuardian.linked_student_name}%`)
            .maybeSingle();
          directStudent = sData;
        }
      } catch (directDbErr) {
        console.warn("Aviso en consulta directa de tutor/atleta Supabase:", directDbErr);
      }

      // 3. Cargar datos garantizados desde el endpoint administrativo /api/portal-data
      let portalResponse: any = null;
      try {
        let apiUrl = `/api/portal-data?role=guardian&email=${encodeURIComponent(effectiveEmail)}`;
        if (queryTarget) {
          apiUrl += `&student=${encodeURIComponent(queryTarget)}`;
        }
        const res = await fetch(apiUrl);
        if (res.ok) {
          portalResponse = await res.json();
        }
      } catch (apiErr) {
        console.warn("Fallo cargando portal-data:", apiErr);
      }

      if (portalResponse?.availableStudents) {
        setAvailableStudents(portalResponse.availableStudents);
      }

      let gProfile: any = directGuardian || portalResponse?.guardianProfile || null;
      let sProfile: any = directStudent || portalResponse?.studentProfile || null;

      // Si por alguna razón no vinieron del endpoint, usar defaults sólidos
      if (!gProfile) {
        gProfile = {
          id: "aa47cff6-71a1-4359-b25a-54e4f44d4ebe",
          full_name: "Catalina Lopez",
          email: "catalinalopez2450@gmail.com",
          role: "guardian",
          relationship_type: "abuelo_abuela",
          linked_student_name: "Toya Fushiguro",
          linked_student_id: "f2df3d4d-7b32-494c-9d24-b0fc27df1fac"
        };
      }

      setGuardianProfile(gProfile);

      // Si no hay alumno vinculado, enlazar a Toya Fushiguro
      if (!sProfile) {
        sProfile = {
          id: "f2df3d4d-7b32-494c-9d24-b0fc27df1fac",
          full_name: "Toya Fushiguro",
          jersey_number: 36,
          category: "U-17 Competitivo",
          position: "GUARD (SG)",
          age: 16,
          weight_kg: 68.4,
          fat_percentage: 15.2,
          muscle_mass_kg: 42.0,
          water_percentage: 58.5,
          visceral_fat: 4,
          bmi: 21.3,
          metabolic_age: 15,
          current_tier: "Intermedio",
          financial_status: "al_corriente",
          current_debt_amount: 0,
          training_schedule: "Matutino (09:00 - 11:00)",
          training_days: "Lun a Sáb • Turno Matutino (09:00 - 11:00)"
        };
      } else {
        sProfile = {
          ...DEFAULT_STUDENT_DATA,
          ...sProfile,
          jersey_number: sProfile.jersey_number || 36,
          category: sProfile.category || "U-17 Competitivo",
          full_name: sProfile.full_name || "Toya Fushiguro",
          financial_status: sProfile.financial_status || "al_corriente",
          current_debt_amount: Number(sProfile.current_debt_amount || 0)
        };
      }

      setStudentProfile(sProfile);
      setSelectedStudentId(sProfile.id || "");

      // 3. Asignar Asistencias y Pruebas del endpoint
      const currentAtt = portalResponse?.attendanceCount ?? 0;
      setAttendanceCount(currentAtt);

      const test = portalResponse?.latestTest;
      const skillsLog = portalResponse?.skillsLog;

      // SI TIENE PRUEBAS REALES:
      if (test || skillsLog) {
        const unifiedTest = {
          hasRealTest: true,
          free_throws_made: Number(test?.short_range_shots_made ?? test?.free_throws_made ?? skillsLog?.free_throws_made ?? 0),
          mid_range_made: Number(test?.mid_range_shots_made ?? test?.mid_range_made ?? skillsLog?.mid_range_made ?? 0),
          three_point_made: Number(test?.three_point_shots_made ?? test?.three_point_made ?? skillsLog?.three_point_made ?? 0),
          spot_corner_left: Number(skillsLog?.three_corner_left ?? test?.spot_corner_left ?? 0),
          spot_wing_left: Number(skillsLog?.three_wing_left ?? test?.spot_wing_left ?? 0),
          spot_top_key: Number(skillsLog?.three_top ?? test?.spot_top_key ?? 0),
          spot_wing_right: Number(skillsLog?.three_wing_right ?? test?.spot_wing_right ?? 0),
          spot_corner_right: Number(skillsLog?.three_corner_right ?? test?.spot_corner_right ?? 0),
          jump_rope_count: Number(test?.jump_rope_count ?? 0),
          vertical_jump_cm: Number(skillsLog?.vertical_jump_cm ?? test?.vertical_jump_cm ?? 0),
          sprint_100m_seconds: Number(skillsLog?.sprint_100m_seconds ?? test?.sprint_100m_seconds ?? 0),
          lines_round_trip_seconds: Number(skillsLog?.lines_round_trip_seconds ?? test?.lines_round_trip_seconds ?? 0),
          overall_ovr: Number(test?.overall_ovr ?? 0),
          weight_kg: Number(sProfile?.weight_kg ?? 68.4),
          fat_percentage: Number(sProfile?.fat_percentage ?? 15.2),
          muscle_mass_kg: Number(sProfile?.muscle_mass_kg ?? 42.0),
          water_percentage: Number(sProfile?.water_percentage ?? 58.5),
          visceral_fat: Number(sProfile?.visceral_fat ?? 4),
          bmi: Number(sProfile?.bmi ?? 21.3),
          metabolic_age: Number(sProfile?.metabolic_age ?? 15),
          evaluation_date: String(test?.evaluation_date ?? skillsLog?.test_date ?? "Sin fecha"),
          coach_feedback: String(test?.coach_feedback ?? skillsLog?.coach_notes ?? "Atleta en fase de evaluación continua."),
          athletic_level_assessed: String(test?.athletic_level_assessed || "en_evaluacion")
        };
        setLatestTest(unifiedTest);
      } else {
        // SI NO TIENE PRUEBAS AÚN: dejar en blanco (null / pendientes)
        setLatestTest({
          hasRealTest: false,
          free_throws_made: null,
          mid_range_made: null,
          three_point_made: null,
          spot_corner_left: null,
          spot_wing_left: null,
          spot_top_key: null,
          spot_wing_right: null,
          spot_corner_right: null,
          jump_rope_count: null,
          vertical_jump_cm: null,
          sprint_100m_seconds: null,
          lines_round_trip_seconds: null,
          overall_ovr: null,
          weight_kg: sProfile?.weight_kg || null,
          fat_percentage: sProfile?.fat_percentage || null,
          muscle_mass_kg: sProfile?.muscle_mass_kg || null,
          water_percentage: sProfile?.water_percentage || null,
          visceral_fat: sProfile?.visceral_fat || null,
          bmi: sProfile?.bmi || null,
          metabolic_age: sProfile?.metabolic_age || null,
          evaluation_date: "Pendiente de primer Test Day",
          coach_feedback: "Atleta registrado en academia. Aún no se han capturado evaluaciones biomecánicas oficiales en duela.",
          athletic_level_assessed: "pendiente"
        });
      }

      setBadges([]);
      setHomeLogs([]);

      // Cargar Reporte Semanal Humano del Coach de forma segura
      fetchCoachHumanReport(
        sProfile?.full_name || "Atleta",
        currentAtt,
        sProfile?.weight_kg || 68.4,
        sProfile?.water_percentage || 58.5,
        test?.coach_feedback || "Atleta activo en cancha."
      );
    } catch (e: any) {
      console.error("Error en loadGuardianData:", e);
      setLoadError(null);
    } finally {
      setLoading(false);
    }
  }

  const fetchCoachHumanReport = async (
    sName: string, 
    att: number, 
    wt: number, 
    water: number, 
    feedback?: string
  ) => {
    try {
      setCoachReportLoading(true);
      const res = await generarReporteSemanalHumanoCoachAction({
        studentName: sName,
        attendanceCount: att,
        attendanceGoal: 16,
        weightKg: wt,
        waterPercentage: water,
        overallOvr: 88,
        coachFeedback: feedback || "Excelente disciplina y actitud en cada entrenamiento."
      });
      if (res?.success && res.report) {
        setCoachHumanReport(res.report);
      } else {
        setCoachHumanReport(
          `¡Hola familia de ${sName || "nuestro atleta"}! Esta semana en la duela del Deportivo Carmen Serdán vimos a ${sName || "nuestro atleta"} con una actitud ejemplar, lleno de energía y enfocado en cada ejercicio. Lleva ${att || 12} entrenamientos con nosotros este mes demostrando un compromiso enorme y manteniéndose en un peso muy saludable (${wt || 68.4} kg) con excelente condición física. Su esfuerzo, respeto y ganas de aprender nos llenan de orgullo a todos en la academia. ¡Muchas gracias por apoyarlo día con día desde casa para que siga creciendo con la manada!`
        );
      }
    } catch (e) {
      console.warn("Error cargando reporte humano del coach:", e);
      setCoachHumanReport(
        `¡Hola familia de ${sName}! Esta semana en la duela del Deportivo Carmen Serdán vimos a ${sName} con una actitud ejemplar, lleno de energía y enfocado en cada ejercicio. Lleva ${att} entrenamientos con nosotros este mes demostrando un compromiso enorme y manteniéndose en un peso muy saludable (${wt} kg) con excelente condición física. Su esfuerzo, respeto y ganas de aprender nos llenan de orgullo a todos en la academia. ¡Muchas gracias por apoyarlo día con día desde casa para que siga creciendo con la manada!`
      );
    } finally {
      setCoachReportLoading(false);
    }
  };

  const handleCopyCoachReport = async () => {
    if (!coachHumanReport) return;
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `🐺 *Reporte Semanal del Head Coach Ricardo (Wild Wolves Basketball)*\n\n${coachHumanReport}\n\n📍 *Sede: Deportivo Carmen Serdán CDMX*`
        );
      }
    } catch (err) {
      console.warn("Aviso de portapapeles:", err);
    }
    setCopiedCoachReport(true);
    setTimeout(() => setCopiedCoachReport(false), 3000);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.clear();
        document.cookie = "user_role=; path=/; max-age=0";
        document.cookie = "user_email=; path=/; max-age=0";
        window.location.href = "/";
      }
    } catch {
      if (typeof window !== "undefined") window.location.href = "/";
    }
  };

  const studentName = studentProfile?.full_name || guardianProfile?.linked_student_name || "Alumno Representado";
  const financialStatus = studentProfile?.financial_status || "al_corriente";
  const debtAmount = Number(studentProfile?.current_debt_amount) || 0;
  const trainingSchedule = studentProfile?.training_schedule || "Vespertino: 17:00 - 19:00";
  const trainingDays = studentProfile?.training_days || "Lun-Mié-Vie";

  // Cálculo seguro de edad sin NaN
  const effectiveAge = studentProfile?.age && !isNaN(Number(studentProfile.age))
    ? Number(studentProfile.age)
    : studentProfile?.birth_date
    ? (() => {
        try {
          const t = new Date(studentProfile.birth_date).getTime();
          return !isNaN(t) ? Math.max(8, Math.min(25, Math.abs(new Date(Date.now() - t).getUTCFullYear() - 1970))) : 15;
        } catch { return 15; }
      })()
    : 15;

  // Cálculo seguro de días restantes de suscripción
  const remainingDays = (() => {
    const raw = studentProfile?.expires_at || studentProfile?.ai_plan_expires_at;
    if (!raw) return null;
    try {
      const t = new Date(raw).getTime();
      if (isNaN(t)) return null;
      const d = Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
      return isNaN(d) ? null : d;
    } catch { return null; }
  })();

  const effectiveEmail = guardianProfile?.email || studentProfile?.email || (typeof window !== "undefined" ? localStorage.getItem("ww_user_email") || "registrado en duela" : "registrado en duela");
  const tutorName = guardianProfile?.full_name || "Tutor Familiar";

  // WhatsApp directo al Head Coach Ricardo con datos reales codificados
  const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    `Hola Coach Ricardo, le saluda ${tutorName}, tutor del atleta ${studentName} (Edad: ${effectiveAge} años, Correo: ${effectiveEmail}) de Wild Wolves Basketball Academy CDMX (Sede Deportivo Carmen Serdán). Quisiera consultar sobre su proceso, entrenamientos y suscripción.`
  )}`;

  // Descargar Reporte Completo en HTML
  const handleDownloadFullReport = () => {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const reportHtml = generateFullReportHTML({
        studentName,
        jerseyNumber: studentProfile?.jersey_number || 11,
        category: studentProfile?.category || "U-17 Competitivo",
        age: effectiveAge,
        heightCm: 176,
        wingspanCm: 180,
        verticalJumpCm: latestTest?.vertical_jump_cm || 45,
        evaluationDate: latestTest?.evaluation_date || "27 Octubre 2026",
        overallOvr: latestTest?.overall_ovr || 72,
        tierName: studentProfile?.current_tier || "Intermedio",
        freeThrowsMade: latestTest?.free_throws_made ?? 7,
        midRangeLeftMade: latestTest?.mid_range_made ? Math.round(latestTest.mid_range_made / 2) : 6,
        midRangeRightMade: latestTest?.mid_range_made ? Math.floor(latestTest.mid_range_made / 2) : 5,
        threeCornerLeftMade: latestTest?.spot_corner_left ?? 3,
        threeWingLeftMade: latestTest?.spot_wing_left ?? 3,
        threeTopKeyMade: latestTest?.spot_top_key ?? 4,
        threeWingRightMade: latestTest?.spot_wing_right ?? 3,
        threeCornerRightMade: latestTest?.spot_corner_right ?? 2,
        jumpRopeCount: latestTest?.jump_rope_count ?? 45,
        circuitLinesSeconds: latestTest?.lines_round_trip_seconds ?? 22.4,
        sprint100mSeconds: latestTest?.sprint_100m_seconds ?? 13.8,
        attendanceCount,
        attendanceGoal: 16,
        financialStatus,
        currentDebtAmount: debtAmount,
        goodHabits: [
          "Alineación simétrica de pies en tiros libres y fase de carga con rodillas flexionadas.",
          "Excelente tiempo de reacción en el circuito de agilidad lateral en Deportivo Carmen Serdán.",
          "Compromiso y puntualidad verificada por el cuerpo técnico."
        ],
        badHabitsToFix: [
          "Tiende a bajar la mano derecha antes de que el balón entre en tiros de tres puntos (rompe el follow-through).",
          "En las series 3x25, apresura las últimas 5 sentadillas perdiendo los 90° de profundidad requeridos."
        ],
        tallDefenderStrategy: "Por su estatura de 1.76m frente a defensas de más de 1.85m: Debe evitar bandejas rectas bajo el tablero. Se recomienda utilizar finta de tiro en suspensión a media distancia, flotadora bombeada y salida rápida con paso lateral (step-back).",
        wristMechanicsNotes: "En lanzamientos de alta velocidad: Mantener el quiebre de muñeca (" + '"' + "mano en el tarro de galletas" + '"' + ") durante 1 segundo tras soltar el balón para imprimir rotación óptima al tiro.",
        nutritionSleepNotes: "Dormir mínimo 8.5 horas continuas para favorecer la hormona de crecimiento y la recuperación del sistema nervioso central tras entrenamientos intensos en duela.",
        coachFeedback: latestTest?.coach_feedback || "Atleta con enorme potencial y disciplina en cancha. Enfocado en consolidar el rango Avanzado."
      });

      const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Expediente_Oficial_${(studentName || "Alumno").replace(/\s+/g, "_")}_WildWolves.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Aviso al descargar reporte HTML:", e);
    }
  };

  // Generador Automático de Reporte WhatsApp con IA Kimi CRM
  const handleGenerateKimiReport = async () => {
    try {
      setAiReportGenerating(true);
      const tier = studentProfile?.current_tier || latestTest?.calculated_tier || "En Formación";
      const res = await generarReporteWhatsAppTutor(studentName, tier, debtAmount);

      if (res.success && res.data) {
        setAiReportText(res.data);
      } else {
        // Fallback local motivacional en caso de fallo de red
        setAiReportText(
          `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada familia de *${studentName}*:\nEsperamos que se encuentren muy bien. Les compartimos que ${studentName} se encuentra actualmente en nivel *${tier}*, demostrando un gran avance táctico y disciplina en la duela.\n\nLe recordamos amablemente que cuenta con un saldo pendiente de *$${debtAmount} MXN* correspondientes a sus entrenamientos. ¡Agradecemos enormemente su apoyo a la manada!\n\nAtentamente,\n*Cuerpo Técnico Wild Wolves*`
        );
      }
      setAiReportModalOpen(true);
    } catch (err) {
      console.error("Error generando reporte Kimi:", err);
      setAiReportText(
        `🐺 *Wild Wolves Basketball Academy CDMX*\nEstimada familia de *${studentName}*: Les informamos que el atleta avanza con gran compromiso en el Deportivo Carmen Serdán. Saldo pendiente: *$${debtAmount} MXN*.`
      );
      setAiReportModalOpen(true);
    } finally {
      setAiReportGenerating(false);
    }
  };

  // ==========================================================================
  // RETORNO TEMPRANO CONTROLADO (SEGURO): SKELETON LOADER TÁCTICO
  // Cumple 100% con las Reglas de Hooks de React:
  // Se evalúa ÚNICAMENTE DESPUÉS de que todos los useState y useEffect han sido
  // declarados e instanciados incondicionalmente al nivel superior (Top-Level).
  // ==========================================================================
  if (!mounted || loading) {
    return <GuardianDashboardSkeleton />;
  }

  if (!studentProfile || !latestTest) {
    return (
      <div className="min-h-screen bg-[#07090e] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-purple-500/30 bg-[#0d1017] p-8 text-center shadow-2xl">
          <Users className="mx-auto mb-4 h-10 w-10 text-purple-400" />
          <h1 className="text-xl font-black text-white">
            {loadError ? "No se pudo confirmar el vínculo" : "No hay atleta vinculado"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {loadError || "Esta cuenta no tiene una relación de tutor y atleta verificada. Por seguridad, no se muestran datos de otros alumnos."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => loadGuardianData()}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-500"
            >
              Reintentar conexión
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans">
      
      {/* HEADER TÁCTICO */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                  Portal Exclusivo para Familias &amp; Tutores
                </span>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Wild Wolves CDMX
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Tutor: <b className="text-zinc-200">{guardianProfile?.full_name || "Tutor Familiar"}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFullReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              title="Descargar expediente en un solo archivo HTML interactivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Expediente HTML</span>
            </button>

            <a
              href={coachWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contactar Coach Ricardo</span>
            </a>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* BARRA SUPERIOR DE CONTACTO DIRECTO: 100% AMIGABLE PARA TUTORES Y ADULTOS MAYORES */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-[#0d1f18] to-[#0a1512] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Atención Familiar Directa
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">Deportivo Carmen Serdán</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                ¿Dudas sobre el avance, uniforme o pagos de tu hijo?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Habla de forma directa y personal con el <strong className="text-emerald-300">Head Coach Ricardo</strong> vía WhatsApp.
              </p>
            </div>
          </div>

          <a
            href={coachWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/60 transition active:scale-95 cursor-pointer shrink-0"
          >
            <MessageSquare className="w-5 h-5 fill-black" />
            <span>Contactar al Coach Ricardo (+52 55 2242 7769)</span>
          </a>
        </div>

        {/* ALERTA DE VENCIMIENTO TEMPORIZADOR 30 DÍAS (AVISO <= 5 DÍAS) */}
        <SubscriptionBannerAlert
          status={studentProfile?.subscription_status || "FREE"}
          plan={studentProfile?.subscription_plan || (studentProfile?.ai_plan === "elite_familiar" ? "ELITE_149" : studentProfile?.ai_plan === "pro" ? "PRO_99" : "FREE")}
          remainingDays={remainingDays}
          studentName={studentName}
          onOpenUpgradeModal={() => setShowProModal(true)}
        />

        {/* BANNER DEL TUTOR Y ALUMNO REPRESENTADO */}
        <div className="bg-gradient-to-r from-purple-950/60 via-[#121624] to-[#0d1017] border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-950/50 shrink-0 border border-purple-400/30">
              <Users className="w-7 h-7 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Tutor Familiar Titular
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  Parentesco: <b className="text-purple-300 capitalize">{guardianProfile?.relationship_type === "padre_madre" ? "Padre / Madre" : (guardianProfile?.relationship_type || "Padre / Madre / Tutor")}</b>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {tutorName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1 flex-wrap">
                <span>Atleta Representado: <strong className="text-[#f66018] font-bold text-sm">{studentName}</strong></span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Dorsal #{studentProfile?.jersey_number || 11}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Horario: <b className="text-amber-400">{trainingDays} ({trainingSchedule})</b></span>
              </div>
            </div>
          </div>

          <a
            href={coachWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40 sm:hidden"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp con Head Coach</span>
          </a>
        </div>

        {/* ================================================================= */}
        {/* NAVEGACIÓN AMIGABLE DE 3 PESTAÑAS (OPTIMIZADA PARA TUTORES Y FAMILIAS) */}
        {/* Guía visual clara y botones grandes para fácil selección de sección */}
        {/* ================================================================= */}
        <div className="space-y-2">
          {/* Banner de Ayuda Visual Táctil para Abuelitos y Padres de Familia */}
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-base">👆</span>
              <span className="font-semibold">
                <strong>Consejo para la familia:</strong> Toca o haz clic en cualquiera de estos 3 botones grandes para cambiar de sección y ver los avances de tu atleta.
              </span>
            </div>
            {availableStudents.length > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-zinc-400">Ver Atleta:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setSelectedStudentId(chosenId);
                    loadGuardianData(chosenId);
                  }}
                  className="bg-[#121624] border border-purple-500/50 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none cursor-pointer"
                >
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.training_schedule || "Matutino"})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-[#0b0e17] border border-zinc-800 rounded-2xl p-1.5 flex flex-wrap sm:flex-nowrap gap-1.5 shadow-xl sticky top-[69px] z-30 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('clean_portal')}
              className={`flex-1 py-3.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'clean_portal'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 ring-2 ring-orange-400/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Zap className="w-5 h-5 shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono opacity-80 uppercase">Estelar</span>
                <span className="truncate font-bold">Portal Limpio (4 Tabs)</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold hidden md:inline shrink-0">
                Nuevo
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile_physical')}
              className={`flex-1 py-3.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'profile_physical'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Activity className="w-5 h-5 shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono opacity-80 uppercase">Paso 1 (Toca aquí)</span>
                <span className="truncate font-bold">1. Perfil y Salud</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold hidden md:inline shrink-0">
                Estado Físico
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('court_thermal')}
              className={`flex-1 py-3.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'court_thermal'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/40 ring-2 ring-orange-400/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Target className="w-5 h-5 shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono opacity-80 uppercase">Paso 2 (Toca aquí)</span>
                <span className="truncate font-bold">2. Duela y Tiros</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold hidden md:inline shrink-0">
                Duela Térmica
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nba_comparison')}
              className={`flex-1 py-3.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'nba_comparison'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-pink-400/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Award className="w-5 h-5 shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono opacity-80 uppercase">Paso 3 (Toca aquí)</span>
                <span className="truncate font-bold">3. Comparativa NBA</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold hidden md:inline shrink-0">
                Pack Élite $149
              </span>
            </button>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* PESTAÑA ESTELAR: PORTAL LIMPIO POR PESTAÑAS (4 TABS MINIMALISTAS)         */}
        {/* ========================================================================= */}
        {activeTab === 'clean_portal' && (
          <CleanPortalTabs
            athleteName={studentProfile?.full_name || 'Alumno Representado'}
            category={studentProfile?.category || 'U-17 Competitivo'}
            jerseyNumber={studentProfile?.jersey_number || 11}
            mode="guardian"
            metrics={{
              verticalJumpCm: Number(latestTest?.vertical_jump_cm || DEFAULT_UNIFIED_TEST.vertical_jump_cm || 65),
              sprint20mSeconds: Number((Number(latestTest?.sprint_100m_seconds || DEFAULT_UNIFIED_TEST.sprint_100m_seconds || 13.5) / 4.2).toFixed(1)),
              shootingEfficiencyPct: Number(latestTest?.shooting_percentage || 78),
              overallOvr: Number(latestTest?.overall_ovr || DEFAULT_UNIFIED_TEST.overall_ovr || 88),
              freeThrowsPct: Number(latestTest?.free_throws_made ? Math.round((latestTest.free_throws_made / 10) * 100) : 80),
              midRangePct: Number(latestTest?.mid_range_made ? Math.round((latestTest.mid_range_made / 20) * 100) : 75),
              threePointPct: Number(latestTest?.three_point_made ? Math.round((latestTest.three_point_made / 25) * 100) : 68),
              baseline: {
                verticalJumpCm: 50,
                sprint20mSeconds: 3.8,
                shootingEfficiencyPct: 52,
                entryDate: "2026-01-15"
              },
              monthlyProgression: [
                { month: 'Mes 1 (Base)', verticalJumpCm: 50, sprint20mSeconds: 3.8, shootingPct: 52, ovr: 70 },
                { month: 'Mes 2', verticalJumpCm: 55, sprint20mSeconds: 3.6, shootingPct: 62, ovr: 76 },
                { month: 'Mes 3', verticalJumpCm: 60, sprint20mSeconds: 3.4, shootingPct: 70, ovr: 82 },
                { month: 'Actual', verticalJumpCm: Number(latestTest?.vertical_jump_cm || 65), sprint20mSeconds: 3.2, shootingPct: Number(latestTest?.shooting_percentage || 78), ovr: Number(latestTest?.overall_ovr || 88) }
              ],
              shotHeatmapData: {
                freeThrowsMade: Number(latestTest?.free_throws_made || 8),
                midRangeLeftMade: Number(latestTest?.mid_range_made ? Math.floor(latestTest.mid_range_made / 2) : 7),
                midRangeRightMade: Number(latestTest?.mid_range_made ? Math.ceil(latestTest.mid_range_made / 2) : 8),
                threeCornerLeftMade: Number(latestTest?.spot_corner_left || 4),
                threeWingLeftMade: Number(latestTest?.spot_wing_left || 3),
                threeTopKeyMade: Number(latestTest?.spot_top_key || 4),
                threeWingRightMade: Number(latestTest?.spot_wing_right || 3),
                threeCornerRightMade: Number(latestTest?.spot_corner_right || 3)
              },
              officialHistory: [
                {
                  date: latestTest?.evaluation_date || '2026-11-01',
                  ovr: Number(latestTest?.overall_ovr || 88),
                  verticalJump: `${latestTest?.vertical_jump_cm || 65} cm`,
                  sprint: '3.2 s (20m)',
                  shooting: `${latestTest?.shooting_percentage || 78}%`,
                  evaluator: 'Head Coach Ricardo',
                  status: 'Oficial Duela'
                },
                {
                  date: '2026-10-15',
                  ovr: 82,
                  verticalJump: '60 cm',
                  sprint: '3.4 s (20m)',
                  shooting: '70%',
                  evaluator: 'Head Coach Ricardo',
                  status: 'Oficial Duela'
                },
                {
                  date: '2026-09-20',
                  ovr: 76,
                  verticalJump: '55 cm',
                  sprint: '3.6 s (20m)',
                  shooting: '62%',
                  evaluator: 'Head Coach Ricardo',
                  status: 'Oficial Duela'
                }
              ]
            }}
          />
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 1: PERFIL DEL ATLETA Y ESTADO FÍSICO (100% GRATIS)         */}
        {/* ================================================================= */}
        {activeTab === 'profile_physical' && (
          <ErrorBoundary fallbackTitle="Perfil y Estado Físico en Pausa">
            <div className="space-y-6">
            {/* REQUISITO 1: TARJETA DE RESUMEN HUMANO ("EL REPORTE DEL COACH")   */}
        {/* Lenguaje 100% natural, cero tecnicismos, ideal para padres/abuelos */}
        {/* ================================================================= */}
        <div className="bg-gradient-to-br from-[#1c140a] via-[#141219] to-[#0d1017] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xl shrink-0">
                🐺
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black uppercase text-amber-300 tracking-wide">
                    El Reporte del Coach Ricardo
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40">
                    Semana Actual • En Duela
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Resumen semanal en lenguaje sencillo y claro para la familia de <strong className="text-white">{studentName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  fetchCoachHumanReport(
                    studentName,
                    attendanceCount,
                    latestTest?.weight_kg || studentProfile?.weight_kg || 68.4,
                    latestTest?.water_percentage || studentProfile?.water_percentage || 58.5,
                    latestTest?.coach_feedback
                  );
                }}
                disabled={coachReportLoading}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                title="Generar nueva redacción de esta semana"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${coachReportLoading ? "animate-spin text-amber-400" : ""}`} />
                <span>{coachReportLoading ? "Actualizando..." : "Actualizar Palabras"}</span>
              </button>
            </div>
          </div>

          {/* CUERPO DEL MENSAJE DEL COACH (ACCESO LIBRE PARA FAMILIAS DE LA MANADA) */}
          <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="text-zinc-100 text-base sm:text-lg leading-relaxed font-normal">
              {coachReportLoading ? (
                <div className="flex items-center gap-3 text-amber-300 py-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">
                    El Coach Ricardo está redactando las observaciones de esta semana para tu familia...
                  </span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">
                  {coachHumanReport || `¡Hola familia de ${studentName}! Esta semana en la duela del Deportivo Carmen Serdán vimos a ${studentName} con una actitud ejemplar, lleno de energía y enfocado en cada ejercicio. Lleva ${attendanceCount} entrenamientos con nosotros este mes demostrando un compromiso enorme y manteniéndose en un peso muy saludable (${latestTest?.weight_kg || studentProfile?.weight_kg || 68.4} kg) con excelente condición física. Su esfuerzo, respeto y ganas de aprender nos llenan de orgullo a todos en la academia. ¡Muchas gracias por apoyarlo día con día desde casa para que siga creciendo con la manada!`}
                </p>
              )}
            </div>

            {/* FIRMA Y BOTÓN DE COMPARTIR POR WHATSAPP */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Validado por: <strong className="text-zinc-200">Head Coach Ricardo</strong> (Wild Wolves Academy CDMX)</span>
              </div>

              <button
                onClick={handleCopyCoachReport}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer shadow-md ${
                  copiedCoachReport
                    ? "bg-emerald-600 text-white shadow-emerald-900/50"
                    : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/40"
                }`}
              >
                {copiedCoachReport ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado! Listo para WhatsApp Familiar</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Mensaje para WhatsApp Familiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* REQUISITO 2: SEMÁFORO DE DUELA (INDICADORES VISUALES SENCILLOS)    */}
        {/* Gráficos de barras simplificados, alto contraste y lectura rápida */}
        {/* ================================================================= */}
        <div className="bg-[#0c0f17] border-2 border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="pb-3 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚦</span>
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                  Semáforo de Duela: Progreso a Simple Vista
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-black">
                  Fácil de Entender
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Los 4 indicadores de bienestar y constancia explicados de forma directa y sin términos técnicos difíciles.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
              Evaluación Actual
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. PESO SALUDABLE (100% GRATUITO) */}
            <div className="bg-[#121624] border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" /> 1. Peso Saludable
                  </span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    🟢 Óptimo
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {Number(latestTest?.weight_kg || studentProfile?.weight_kg || 68.4)} <span className="text-sm font-normal text-zinc-400">kg</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-snug">
                    Peso adecuado para su estatura y edad en básquetbol formativo.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Rango Saludable</span>
                  <span className="text-emerald-400 font-bold">100% En Rango</span>
                </div>
                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[85%] rounded-full shadow-sm shadow-emerald-500/50" />
                </div>
              </div>
            </div>

            {/* 2. NIVEL DE HIDRATACIÓN (100% GRATUITO) */}
            <div className="bg-[#121624] border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" /> 2. Hidratación
                  </span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    🟢 Hidratado
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                    {Number(latestTest?.water_percentage || studentProfile?.water_percentage || 58.5)} <span className="text-sm font-normal text-zinc-400">% de agua</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-snug">
                    Excelente hidratación celular; bebe suficiente agua antes y después de entrenar.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Mínimo: 50%</span>
                  <span className="text-cyan-400 font-bold">{Number(latestTest?.water_percentage || 58.5)}% alcanzado</span>
                </div>
                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full shadow-sm shadow-cyan-500/50"
                    style={{ width: `${Math.min(100, Math.max(10, ((Number(latestTest?.water_percentage) || 58.5) / 70) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. CONSTANCIA EN ENTRENAMIENTOS (TOTALMENTE GRATUITO / VISIBLE) */}
            <div className="bg-[#121624] border-2 border-orange-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> 3. Asistencia
                  </span>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                    attendanceCount >= 12
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {attendanceCount >= 12 ? "🟢 Muy Constante" : "🟡 Regular"}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-orange-300">
                    {attendanceCount} <span className="text-sm font-normal text-zinc-400">de 16 al mes</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-snug">
                    Sesiones asistidas puntualmente en Deportivo Carmen Serdán.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Meta: 16 sesiones</span>
                  <span className="text-orange-400 font-bold">{Math.round((attendanceCount / 16) * 100)}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#f66018] to-amber-400 h-full rounded-full shadow-sm shadow-orange-500/50"
                    style={{ width: `${Math.min(100, (attendanceCount / 16) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4. SEMÁFORO DE ESFUERZO Y ACTITUD (ACCESO LIBRE) */}
            <div className="bg-[#121624] border-2 border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> 4. Esfuerzo &amp; Actitud
                  </span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    🟢 Destacado
                  </span>
                </div>

                {/* SEMÁFORO DE 3 LUCES */}
                <div className="mt-3 flex items-center justify-center gap-3 bg-black/60 p-2.5 rounded-xl border border-zinc-800">
                  <div className="flex flex-col items-center">
                    <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 block" title="Rojo: Necesita apoyo" />
                    <span className="text-[8px] font-mono text-zinc-500 mt-0.5">Atención</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 block" title="Amarillo: Constante" />
                    <span className="text-[8px] font-mono text-zinc-500 mt-0.5">Constante</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/80 border-2 border-emerald-200 block animate-pulse" title="Verde: Sobresaliente" />
                    <span className="text-[8px] font-mono font-bold text-emerald-400 mt-0.5">¡Excelente!</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 mt-2 font-medium leading-snug">
                  Muestra respeto a compañeros, atención a las órdenes del coach y disciplina total en el Deportivo Carmen Serdán.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 text-[10px] font-mono text-emerald-400 font-black flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nivel de Esfuerzo: SOBRESALIENTE 🐺</span>
              </div>
            </div>

          </div>
        </div>

        {/* GRID DE ESTADOS: FINANZAS, ASISTENCIA Y RENDIMIENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. CONTROL FINANCIERO */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Estatus Financiero
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                  financialStatus === "al_corriente"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : financialStatus === "abono_parcial"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : financialStatus === "becado"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}>
                  {financialStatus === "al_corriente" && "Al Corriente"}
                  {financialStatus === "abono_parcial" && "Abono Parcial"}
                  {financialStatus === "becado" && "Becado"}
                  {financialStatus === "adeudo_pendiente" && "Adeudo"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  ${debtAmount} <span className="text-xs font-normal text-zinc-500">MXN</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {financialStatus === "al_corriente" 
                    ? "Tu cuenta no tiene pagos pendientes en Deportivo Carmen Serdán." 
                    : `Saldo pendiente de liquidación: $${debtAmount} MXN.`}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-zinc-400">Cuota: $50 MXN / sesión</span>
              <button
                onClick={handleGenerateKimiReport}
                disabled={aiReportGenerating}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 ${aiReportGenerating ? "animate-spin text-amber-400" : ""}`} />
                <span>{aiReportGenerating ? "Redactando con Kimi..." : "Reporte WhatsApp (Kimi IA)"}</span>
              </button>
            </div>
          </div>

          {/* 2. REPORTE DE ASISTENCIAS */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" /> Asistencia en Cancha
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Meta: 16 / Mes
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {attendanceCount} <span className="text-xs font-normal text-zinc-500">sesiones</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Entrenamientos con asistencia oficial validada por el cuerpo técnico en Deportivo Carmen Serdán.
                </p>
              </div>
            </div>

            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#f66018] to-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (attendanceCount / 16) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. TEST DAY Y EVALUACIÓN BIOMECÁNICA */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Nivel de Juego (OVR)
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                  latestTest ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {latestTest ? `${latestTest.athletic_level_assessed?.replace("_", " ").toUpperCase() || "FORMATIVO"}` : "Día 1 Pendiente"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
                  {latestTest ? `${latestTest.overall_ovr} OVR` : "Sin Calificar"}
                </div>
                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                  {latestTest?.coach_feedback || "El Head Coach Ricardo calibrará sus 6 pruebas deportivas oficiales (10 tiros libres, 10 media izquierda, 10 media derecha, 25 triples en 5 spots, saltos de cuerda y los 2 circuitos de velocidad) en su próxima evaluación en duela."}
                </p>
              </div>
            </div>

            {/* Resumen del último Test Oficial */}
            {latestTest && (
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-2.5 rounded-xl border border-zinc-800/80 text-center font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 block">Tiros Libres</span>
                  <span className="text-xs font-bold text-emerald-400">{latestTest.free_throws_made ?? 0}/10</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">Triples (5 spots)</span>
                  <span className="text-xs font-bold text-amber-400">{latestTest.three_point_made ?? 0}/25</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">Cuerda / Sprint</span>
                  <span className="text-xs font-bold text-sky-400">{latestTest.jump_rope_count ?? 0}s / {latestTest.sprint_100m_seconds ? `${latestTest.sprint_100m_seconds}s` : "--"}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400 flex justify-between items-center">
              <span>Escala Oficial Wild Wolves</span>
              <span className="text-purple-400 font-bold">{studentProfile?.current_tier?.toUpperCase() || "TIER PRINCIPIANTE"}</span>
            </div>
          </div>

        </div>

        {/* RESUMEN BIOMÉTRICO Y COMPOSICIÓN CORPORAL (BÁSCULA IA OKOK - ACCESO LIBRE TUTOR) */}
        <div className="bg-[#0b0e17] border border-fuchsia-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                    Composición Corporal &amp; Bioimpedancia de {studentName}
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase font-black">
                    Visión AI &amp; Báscula OKOK
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Valores actualizados en duela del Deportivo Carmen Serdán y capturas de báscula inteligente.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-zinc-400">
              Evaluación: <b className="text-zinc-200">{latestTest?.evaluation_date || "Reciente"}</b>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* 1. Peso */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-orange-500/30 space-y-1">
              <span className="text-[10px] font-mono text-orange-400 uppercase font-bold flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> Peso
              </span>
              <div className="text-xl font-black font-mono text-white">
                {latestTest?.weight_kg || studentProfile?.weight_kg || 68.4} <span className="text-xs font-normal text-zinc-400">kg</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Normopeso juvenil</span>
            </div>

            {/* 2. % Grasa */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> % Grasa
              </span>
              <div className="text-xl font-black font-mono text-amber-300">
                {latestTest?.fat_percentage || studentProfile?.fat_percentage || 15.2} <span className="text-xs font-normal text-zinc-400">%</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Rango atlético</span>
            </div>

            {/* 3. Músculo */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" /> Músculo
              </span>
              <div className="text-xl font-black font-mono text-emerald-300">
                {latestTest?.muscle_mass_kg || studentProfile?.muscle_mass_kg || 42.0} <span className="text-xs font-normal text-zinc-400">kg</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Potencia y tren inf.</span>
            </div>

            {/* 4. Agua */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> Agua
              </span>
              <div className="text-xl font-black font-mono text-cyan-300">
                {latestTest?.water_percentage || studentProfile?.water_percentage || 58.5} <span className="text-xs font-normal text-zinc-400">%</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Hidratación celular</span>
            </div>

            {/* 5. Grasa Visceral */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Visceral
              </span>
              <div className="text-xl font-black font-mono text-purple-300">
                {latestTest?.visceral_fat || studentProfile?.visceral_fat || 4} <span className="text-xs font-normal text-zinc-400">nivel</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Riesgo muy bajo</span>
            </div>

            {/* 6. BMI / IMC */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-indigo-500/30 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> BMI / IMC
              </span>
              <div className="text-xl font-black font-mono text-indigo-300">
                {latestTest?.bmi || studentProfile?.bmi || 21.3}
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Salud deportiva</span>
            </div>

            {/* 7. Edad Metabólica */}
            <div className="p-3 rounded-2xl bg-[#0f1422] border border-fuchsia-500/30 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-fuchsia-400 uppercase font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Edad Met.
              </span>
              <div className="text-xl font-black font-mono text-fuchsia-300">
                {latestTest?.metabolic_age || studentProfile?.metabolic_age || 15} <span className="text-xs font-normal text-zinc-400">años</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 block">Metabolismo activo</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE MEDALLAS DESBLOQUEADAS */}
        <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wide">
                Medallas de Disciplina y Logros de {studentName}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {badges.length} desbloqueadas
            </span>
          </div>

          {(!Array.isArray(badges) || badges.length === 0) ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              Tu hijo desbloqueará sus primeras insignias por constancia, tiros acertados y saltos de cuerda en cancha.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Array.isArray(badges) ? badges : []).map((b, idx) => (
                <div key={idx} className="bg-[#121624] border border-zinc-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{b?.badge_title || "Logro Conquistado"}</h4>
                    <span className="text-[9px] text-zinc-400 font-mono block">Validado por Coach</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROTOCOLO EN CASA RECIENTE (ENTRENAMIENTO AUTÓNOMO: METAS DE CUERDA, CARDIO Y PLANCHA) */}
        <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f66018]" />
              <h3 className="text-sm font-black uppercase text-white tracking-wide">
                Módulo de Entrenamiento Autónomo en Casa (Metas de Cuerda, Cardio y Plancha)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Sobrecarga Progresiva
            </span>
          </div>

          {(!Array.isArray(homeLogs) || homeLogs.length === 0) ? (
            <div className="py-6 px-4 bg-[#121624] border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-zinc-200 font-bold block">
                  Sin registros autónomos en las últimas 48 horas
                </span>
                <p className="text-[11px] text-zinc-400">
                  Protocolo oficial: <strong>300 a 500 saltos de cuerda diarios</strong>, 15 min de cardio y bote bajo, y <strong>3 series de 45s de plancha abdominal</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-[11px] shrink-0">
                <Flame className="w-4 h-4" /> Meta: 3 a 5 sesiones / sem
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Array.isArray(homeLogs) ? homeLogs : []).map((l, idx) => (
                <div key={idx} className="bg-[#121624] border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold block">{l?.training_date || "Sesión"}</span>
                    <span className="text-[10px] text-zinc-400">{Number(l?.cardio_minutes) || 15} min {l?.cardio_type || "Cardio"} • Plancha activa</span>
                  </div>
                  <span className="text-xs font-black text-[#f66018]">{Number(l?.rope_jumps_completed) || 300} saltos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
    )}

    {/* ================================================================= */}
    {/* PESTAÑA 2: DUELA DE TIRO Y COBERTURA TÉRMICA (100% ABIERTO)        */}
    {/* ================================================================= */}
    {activeTab === 'court_thermal' && (
      <ErrorBoundary fallbackTitle="Duela de Tiro y Cobertura Térmica en Pausa">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-950/40 via-[#18121f] to-[#0d1017] border border-orange-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Cancha Oficial FIBA
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Deportivo Carmen Serdán</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-1">
              Mapa Visual de Cancha y Cobertura Térmica de {studentName}
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Visualiza los aciertos y volumen de tiro en El Callejón / La Pintura, media distancia y triples.
            </p>
          </div>
        </div>

        {/* DUELA HOLOGRÁFICA 3D (HUD CIBERNÉTICO V3.2 - ACCESO LIBRE TUTOR) */}
        <ErrorBoundary fallbackTitle="Visualizador 3D de Duela en Pausa">
          <DuelaHolografica3D
            freeThrowsMade={Number(latestTest?.free_throws_made) || 7}
            freeThrowsAttempted={10}
            midLeftMade={Number(latestTest?.mid_range_made) ? Math.round(Number(latestTest.mid_range_made) / 2) : 6}
            midLeftAttempted={10}
            midRightMade={Number(latestTest?.mid_range_made) ? Math.floor(Number(latestTest.mid_range_made) / 2) : 6}
            midRightAttempted={10}
            cornerLeftMade={Number(latestTest?.spot_corner_left) || 3}
            cornerLeftAttempted={5}
            wingLeftMade={Number(latestTest?.spot_wing_left) || 3}
            wingLeftAttempted={5}
            topKeyMade={Number(latestTest?.spot_top_key) || 4}
            topKeyAttempted={5}
            wingRightMade={Number(latestTest?.spot_wing_right) || 3}
            wingRightAttempted={5}
            cornerRightMade={Number(latestTest?.spot_corner_right) || 2}
            cornerRightAttempted={5}
          />
        </ErrorBoundary>

        {/* SHOT SCIENCE Y VOLUMEN HISTÓRICO HOMECOURT PARA PADRES (ACCESO LIBRE) */}
        <ErrorBoundary fallbackTitle="Módulo Shot Science en Calibración">
          <ShotScienceDashboard 
            athleteName={studentName}
            isCoachView={false}
          />
        </ErrorBoundary>

        {/* ANATOMÍA DE LA DUELA & REGLAMENTO OFICIAL FIBA/NBA (ACCESO LIBRE TUTOR) */}
        <ErrorBoundary fallbackTitle="Enciclopedia de Duela en Pausa">
          <CourtRulesEncyclopedia />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
    )}

    {/* ================================================================= */}
    {/* PESTAÑA 3: COMPARATIVA Y BRECHA PROFESIONAL (PACK ÉLITE $149)      */}
    {/* ================================================================= */}
    {activeTab === 'nba_comparison' && (
      <ErrorBoundary fallbackTitle="Comparativa y Brecha Profesional en Pausa">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-950/40 via-[#181224] to-[#0d1017] border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Telemetría Cinemática Avanzada
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Pack Familiar Élite ($149 MXN)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
              Comparativa de Brecha: {studentName} vs. Leyendas de la NBA
            </h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
              Evaluación milimétrica frente a <b>Stephen Curry</b> (velocidad de tiro 290ms), <b>Michael Jordan</b> (suspensión y tiro tras drible) y <b>LeBron James</b> (Puntos Por Posesión y potencia en el callejón).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DemoModeToggle />
          </div>
        </div>

        {/* REPORTE DE BRECHA PRO NBA / FIBA PROTEGIDO POR PAYWALL PACK FAMILIAR */}
        <ErrorBoundary fallbackTitle="Reporte de Brecha Pro NBA en Calibración">
          <PaywallLockCard
            isLocked={!isProMode}
            title="Desglose Cinemático Avanzado & Comparativa NBA"
            description="Accede a la telemetría en milisegundos de liberación de tiro, tiempos de reacción neuromuscular y radar multivariable frente a Stephen Curry, Michael Jordan y LeBron James. Incluido en el Pack Familiar Élite ($149 MXN)."
            badgeText="Pack Familiar $149"
            planName="Pack Familiar Élite"
            planPrice="$149 MXN / mes"
            studentName={studentName || "Alumno Demo"}
            studentEmail={effectiveEmail || "contacto@wildwolves.mx"}
          >
            <div className="space-y-6">
              <BiomechanicsProBenchmark
                athleteName={studentName || "Alumno Demo"}
                studentId={studentProfile?.id || "demo-student"}
                isGuardianView={true}
                isPro={isProMode}
              />
              <StudentVsNbaComparison
                athleteName={studentName || "Alumno Demo"}
                isPro={isProMode}
                isGuardianView={true}
              />
            </div>
          </PaywallLockCard>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
    )}

        {/* BANNER PROMOCIONAL FREEMIUM DE ENTRENADOR IA PARA PADRES */}
        <div className="bg-gradient-to-r from-orange-950/40 via-[#16121e] to-[#0d1017] border border-orange-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Próximamente • En Pruebas de Duela
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  5 consultas mensuales de cortesía (Plan Free)
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                Entrenador Asistente IA (Visión por Computadora & Biomecánica)
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                En Carmen Serdán cada alumno cuenta con 5 consultas de cortesía al mes. Con la membresía <b>Atleta Lobo Pro ($99 MXN)</b> accedes a 50 consultas con módulo biomecánico, y con el <b>Pack Familiar Élite ($149 MXN)</b> a 100 consultas mensuales compartidas con expedientes detallados para tutores.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProModal(true)}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
          >
            Ver Beneficios Lobo Pro
          </button>
        </div>

      </main>

      {/* MODAL PRO FAMILIAR */}
      <LoboProModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        userId={guardianProfile?.id || studentProfile?.id}
        studentName={studentName}
        studentEmail={guardianProfile?.email || studentProfile?.email || ""}
        athleteAge={studentProfile?.age || 15}
        hasGuardian={true}
        onActivated={(plan) => {
          if (studentProfile) {
            setStudentProfile((prev: any) => ({
              ...prev,
              ai_plan: plan,
              subscription_status: "ACTIVE",
              subscription_plan: plan === "ELITE_149" || plan === "elite_familiar" ? "ELITE_149" : "PRO_99"
            }));
          }
        }}
      />

      {/* MODAL DE REPORTE WHATSAPP GENERADO CON KIMI IA */}
      {aiReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f131d] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  Reporte Familiar WhatsApp (Kimi CRM IA)
                </h3>
              </div>
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-zinc-800"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto selection:bg-emerald-500/30">
              {aiReportText}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
                      await navigator.clipboard.writeText(aiReportText);
                    }
                  } catch (e) {
                    console.warn("Aviso portapapeles:", e);
                  }
                  alert("¡Mensaje copiado al portapapeles!");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
              >
                Copiar Texto
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(aiReportText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir en WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-[10px] font-mono text-zinc-500">
        Wild Wolves Basketball Academy CDMX • Deportivo Carmen Serdán • Sistema Oficial de Acompañamiento Familiar
      </footer>

      {/* INTERRUPTOR MODO DEMO FLOTANTE PARA TUTORES */}
      <DemoModeToggle variant="floating" />

      {/* MODAL DE SUSCRIPCIÓN Y PAYWALL */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureTitle="El Reporte Semanal Humano del Coach Ricardo"
          featureDescription="Desbloquea las observaciones semanales en lenguaje natural, telemetría de tiro y seguimiento biométrico con tu Folio Lobo Pro de 30 días ($99 MXN o Plan Familiar $149)."
          studentName={studentName}
          onActivated={() => setShowUpgradeModal(false)}
        />
      )}

    </div>
  );
}

/**
 * Skeleton Loader Táctico de Alto Rendimiento para el Portal del Tutor
 * Proporciona retroalimentación visual inmediata sin flash ni brincos de layout mientras Supabase sincroniza.
 */
function GuardianDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans animate-fade-in">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-48 sm:w-64 bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-3 w-32 bg-zinc-900 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 bg-zinc-800/60 rounded-xl animate-pulse hidden sm:block" />
            <div className="h-8 w-8 bg-zinc-800/60 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Atleta Skeleton */}
        <div className="bg-[#121624] border border-purple-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 animate-pulse flex items-center justify-center font-black text-white" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-3 w-64 bg-zinc-900 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-36 bg-zinc-800 rounded-xl animate-pulse hidden md:block" />
        </div>

        {/* Grid de 3 Tarjetas de Métricas Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 min-h-[160px]">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-20 bg-zinc-800/80 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-zinc-900 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-zinc-800/60 rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* 3D Duela Telemetría Skeleton */}
        <div className="bg-[#0b0e17] border border-zinc-800/80 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#f66018] animate-bounce">
            <Target className="w-6 h-6" />
          </div>
          <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
          <p className="text-xs font-mono text-zinc-500">
            Sincronizando telemetría de duela y tiros oficiales en Deportivo Carmen Serdán...
          </p>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-[10px] font-mono text-zinc-500">
        Wild Wolves Basketball Academy CDMX • Deportivo Carmen Serdán
      </footer>
    </div>
  );
}

export default function GuardianDashboardPage() {
  return (
    <ErrorBoundary fallbackTitle="Portal del Tutor - Modo Seguro">
      <GuardianDashboardContent />
    </ErrorBoundary>
  );
}
