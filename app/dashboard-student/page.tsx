"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

// ==============================================================================
// 1. DEFINICIÓN DEL ESCALAFÓN BIOLÓGICO (9 TIERS OFICIALES WILD WOLVES)
// Principiante -> Básico -> Intermedio -> Avanzado -> Militar -> Élite -> Bestia Alfa -> Titán Wolf -> Ultra Instinto
// ==============================================================================
interface BiologicalRankInfo {
  level: number;
  tierName: string;
  title: string;
  subtitle: string;
  badgeGlow: string;
  badgeBorder: string;
  badgeBg: string;
  textColor: string;
  accentColor: string;
  icon: string;
  description: string;
  milestone: string;
  nextGoal: string;
  joggingTime: string;
  restTime: string;
  gymAccess: boolean;
}

const BIOLOGICAL_RANKS: Record<number, BiologicalRankInfo> = {
  1: {
    level: 1,
    tierName: "Principiante",
    title: "Tier 1: Principiante",
    subtitle: "Iniciación Sedentaria & Adaptación Motriz",
    badgeGlow: "shadow-[0_0_15px_rgba(148,163,184,0.2)]",
    badgeBorder: "border-slate-500/60",
    badgeBg: "bg-slate-900/80",
    textColor: "text-slate-300",
    accentColor: "#94a3b8",
    icon: "pets",
    description: "Fase de entrada. Acondicionamiento neuromuscular inicial, control de postura y adaptación cardiovascular básica sin sobrecarga.",
    milestone: "1-2 vueltas continuas • Cuerda básica",
    nextGoal: "Dominar los 6 ejercicios base para ascender automáticamente a Tier Básico.",
    joggingTime: "10-15 Min",
    restTime: "90s entre series",
    gymAccess: false
  },
  2: {
    level: 2,
    tierName: "Básico",
    title: "Tier 2: Básico",
    subtitle: "Adaptación 5 Vueltas & Ritmo Continuo",
    badgeGlow: "shadow-[0_0_18px_rgba(56,189,248,0.25)]",
    badgeBorder: "border-sky-600/60",
    badgeBg: "bg-sky-950/70",
    textColor: "text-sky-300",
    accentColor: "#38bdf8",
    icon: "explore",
    description: "Capacidad aeróbica en desarrollo. El atleta completa 5 vueltas a la cancha Carmen Serdán y coordina saltos de cuerda continuos.",
    milestone: "5 vueltas • Cuerda 40-50 saltos",
    nextGoal: "Alcanzar 100 saltos de cuerda y consolidar batería 3x25 para subir a Intermedio.",
    joggingTime: "20 Min",
    restTime: "75s entre series",
    gymAccess: false
  },
  3: {
    level: 3,
    tierName: "Intermedio",
    title: "Tier 3: Intermedio",
    subtitle: "Fuerza Base Calistenia & Batería 3x25",
    badgeGlow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    badgeBorder: "border-amber-600/60",
    badgeBg: "bg-amber-950/70",
    textColor: "text-amber-300",
    accentColor: "#f59e0b",
    icon: "fitness_center",
    description: "Fuerza calisténica consolidada. Ejecuta sentadillas y abdominales en autocarga con buena profundidad y 100 saltos de cuerda sin tropiezo.",
    milestone: "Cuerda 100 reps • Batería 3x25 en marcha",
    nextGoal: "Sostener trote continuo de 35 minutos en cancha para ascender a Avanzado.",
    joggingTime: "25 Min",
    restTime: "60s entre series",
    gymAccess: false
  },
  4: {
    level: 4,
    tierName: "Avanzado",
    title: "Tier 4: Avanzado",
    subtitle: "Resistencia 35 Minutos & Cargas Ligeras",
    badgeGlow: "shadow-[0_0_22px_rgba(20,184,166,0.35)]",
    badgeBorder: "border-teal-500/60",
    badgeBg: "bg-teal-950/70",
    textColor: "text-teal-300",
    accentColor: "#14b8a6",
    icon: "security",
    description: "Resistencia de medio fondo y mecánica de tiro estructurada. Mantiene trote continuo durante 35 minutos sin claudicar.",
    milestone: "35 min trote continuo • Tiro Libre 50%",
    nextGoal: "Completar la batería militar y sostener 45 min de trote para obtener rango Militar.",
    joggingTime: "35 Min",
    restTime: "50s entre series",
    gymAccess: false
  },
  5: {
    level: 5,
    tierName: "Militar",
    title: "Tier 5: Militar",
    subtitle: "Calistenia Férrea & Acceso a Sala de Cargas",
    badgeGlow: "shadow-[0_0_25px_rgba(74,225,118,0.4)]",
    badgeBorder: "border-emerald-500/70",
    badgeBg: "bg-emerald-950/70",
    textColor: "text-emerald-300",
    accentColor: "#4ae176",
    icon: "military_tech",
    description: "Atleta en plenitud física. Trote de 45 minutos, Batería 3x25 estricta y desbloqueo de acceso a la sala de pesas y cargas progresivas.",
    milestone: "45 min trote • Salto +60 cm • Pesas Desbloqueadas",
    nextGoal: "Alcanzar 60 min (1 hora) de trote ininterrumpido y 500 saltos de cuerda para ser Élite.",
    joggingTime: "45 Min",
    restTime: "45s entre series",
    gymAccess: true
  },
  6: {
    level: 6,
    tierName: "Élite",
    title: "Tier 6: Élite",
    subtitle: "Alta Competencia CDMX & Pliometría Pro",
    badgeGlow: "shadow-[0_0_28px_rgba(56,189,248,0.5)]",
    badgeBorder: "border-cyan-400/80",
    badgeBg: "bg-cyan-950/70",
    textColor: "text-cyan-300",
    accentColor: "#00a6e0",
    icon: "stars",
    description: "Nivel competitivo avanzado en torneos locales. Trote de 60 minutos (1 hora) sostenido, cuerda de 500 reps y pliometría avanzada.",
    milestone: "60 min trote continuo • Cuerda 500 • Sprint 13.8s",
    nextGoal: "Sostener 75 minutos y triples consistentes para desbloquear Tier Bestia Alfa.",
    joggingTime: "60 Min (1 Hora)",
    restTime: "40s entre series",
    gymAccess: true
  },
  7: {
    level: 7,
    tierName: "Bestia Alfa",
    title: "Tier 7: Bestia Alfa",
    subtitle: "Potencia Extrema & Resistencia 75 Min",
    badgeGlow: "shadow-[0_0_30px_rgba(246,96,24,0.55)]",
    badgeBorder: "border-orange-500/80",
    badgeBg: "bg-orange-950/70",
    textColor: "text-orange-300",
    accentColor: "#f66018",
    icon: "local_fire_department",
    description: "Atleta de resistencia extrema. Resiste 75 minutos continuos de trote, gran potencia de piernas y efectividad perimetral de 3 puntos.",
    milestone: "75 min trote • Triples 60%+ • Sprint sub 13.5s",
    nextGoal: "Alcanzar Postura Óptima certificada y 90 minutos de trote para ascender a Titán Wolf.",
    joggingTime: "75 Min",
    restTime: "35s entre series",
    gymAccess: true
  },
  8: {
    level: 8,
    tierName: "Titán Wolf",
    title: "Tier 8: Titán Wolf",
    subtitle: "Maestría Biomecánica & Resistencia 90 Min",
    badgeGlow: "shadow-[0_0_35px_rgba(251,191,36,0.65)]",
    badgeBorder: "border-amber-400",
    badgeBg: "bg-amber-950/80",
    textColor: "text-amber-200",
    accentColor: "#fbbf24",
    icon: "workspace_premium",
    description: "Maestría técnica y biomecánica impecable. Control postural absoluto avalado por el Coach, descansos reducidos a 30s y salto vertical +70 cm.",
    milestone: "Postura Óptima • 90 min trote • Salto +70 cm",
    nextGoal: "Completar 2 horas ininterrumpidas para alcanzar la cúspide suprema: Ultra Instinto.",
    joggingTime: "90 Min",
    restTime: "30s entre series",
    gymAccess: true
  },
  9: {
    level: 9,
    tierName: "Ultra Instinto",
    title: "Tier 9: Ultra Instinto",
    subtitle: "Capacidad Biológica Suprema • 2 Horas Continuas",
    badgeGlow: "shadow-[0_0_45px_rgba(217,70,239,0.7),0_0_70px_rgba(123,208,255,0.5)]",
    badgeBorder: "border-fuchsia-400",
    badgeBg: "bg-gradient-to-r from-purple-950/80 via-fuchsia-950/80 to-cyan-950/80",
    textColor: "text-fuchsia-200",
    accentColor: "#d946ef",
    icon: "auto_awesome",
    description: "Cúspide del rendimiento atlético en Wild Wolves CDMX. Resistencia de 2 horas continuas, drill de rebote al tablero dominado, biomecánica automatizada sin fatiga.",
    milestone: "2 Horas Trote / Postura Ultra Instinto • Dominio Total",
    nextGoal: "¡Has alcanzado la cima biológica de la Manada! Mantén la disciplina y lidera a tus compañeros.",
    joggingTime: "120 Min (2 Horas)",
    restTime: "Mínimo / Automatizado",
    gymAccess: true
  }
};

// Verificación de Dominio de los 6 Ejercicios de la Rutina Base
interface BaseMasteryState {
  pushups: boolean;
  squats: boolean;
  abs: boolean;
  calves: boolean;
  stairs: boolean;
  lunges: boolean;
  masteredCount: number;
  allMastered: boolean;
}

function checkBaseExercisesMastery(perf: any, baseline: any): BaseMasteryState {
  const pushups = Boolean(
    perf?.pushups_3x25_done || 
    perf?.pushups_done || 
    (Number(perf?.court_laps_done) >= 3 && baseline?.initial_pushup_variant) ||
    baseline?.initial_pushup_variant === "cerrada" ||
    baseline?.initial_pushup_variant === "pie_sobre_pie"
  );
  const squats = Boolean(perf?.squats_3x25_done || Number(perf?.squats_done) >= 20 || perf?.squats_completed);
  const abs = Boolean(perf?.abs_3x25_done || Number(perf?.abs_done) >= 20 || perf?.abs_completed);
  const calves = Boolean(perf?.calves_3x25_done || Number(perf?.calves_done) >= 20 || perf?.calves_completed);
  const stairs = Boolean(Number(perf?.jump_rope_count) >= 60 || Number(baseline?.initial_jump_rope_max) >= 30 || Number(perf?.court_laps_done) >= 4);
  const lunges = Boolean(Number(perf?.lunges_laps) >= 1 || perf?.lunges_done || Number(perf?.wall_sit_seconds) >= 30);

  const masteredCount = [pushups, squats, abs, calves, stairs, lunges].filter(Boolean).length;
  const allMastered = masteredCount === 6;

  return { pushups, squats, abs, calves, stairs, lunges, masteredCount, allMastered };
}

// Algoritmo de cálculo dinámico de Rango Biológico & Desbloqueo Automático
function calculateBiologicalRank(perf: any, baseline: any = {}): BiologicalRankInfo {
  const mastery = checkBaseExercisesMastery(perf, baseline);
  const joggingMin = Number(perf?.jogging_minutes) || 0;
  const laps = Number(perf?.court_laps_done) || 0;
  const rope = Number(perf?.jump_rope_count) || 0;
  const posture = perf?.posture_status || "optima";

  // Nivel 9: Ultra Instinto
  if (posture === "ultra_instinto" || joggingMin >= 120 || (joggingMin >= 90 && rope >= 1000)) {
    return BIOLOGICAL_RANKS[9];
  }
  // Nivel 8: Titán Wolf
  if ((posture === "optima" && joggingMin >= 60 && mastery.allMastered) || joggingMin >= 75) {
    return BIOLOGICAL_RANKS[8];
  }
  // Nivel 7: Bestia Alfa
  if (joggingMin >= 60 || rope >= 800 || (mastery.allMastered && joggingMin >= 45)) {
    return BIOLOGICAL_RANKS[7];
  }
  // Nivel 6: Élite
  if (joggingMin >= 40 || rope >= 500 || laps >= 20 || (mastery.allMastered && joggingMin >= 30)) {
    return BIOLOGICAL_RANKS[6];
  }
  // Nivel 5: Militar (Desbloqueo de Sala de Pesas)
  if (joggingMin >= 25 || laps >= 12 || (mastery.allMastered && joggingMin >= 20)) {
    return BIOLOGICAL_RANKS[5];
  }
  // Nivel 4: Avanzado
  if (joggingMin >= 15 || laps >= 8 || rope >= 150) {
    return BIOLOGICAL_RANKS[4];
  }
  // Nivel 3: Intermedio
  if (laps >= 5 || rope >= 100 || mastery.allMastered) {
    return BIOLOGICAL_RANKS[3];
  }
  // Nivel 2: Básico (Promoción automática si domina rutina base o tiene ritmo)
  if (laps >= 3 || rope >= 40 || mastery.masteredCount >= 4) {
    return BIOLOGICAL_RANKS[2];
  }
  // Nivel 1: Principiante
  return BIOLOGICAL_RANKS[1];
}

function calculateRankProgress(currentRank: BiologicalRankInfo, perf: any): { percent: number; label: string } {
  if (currentRank.level === 9) {
    return { percent: 100, label: "Rango Máximo Alcanzado (100%)" };
  }
  if (currentRank.level === 0) {
    return { percent: 0, label: "0% • Esperando Diagnóstico Día 1 en Cancha" };
  }
  
  const joggingMin = Number(perf.jogging_minutes) || 0;
  const rope = Number(perf.jump_rope_count) || 0;
  const laps = Number(perf.court_laps_done) || 0;
  
  switch (currentRank.level) {
    case 1: {
      const p = Math.min(95, Math.max(10, Math.round((laps / 3) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 2 (Meta: 3-5 vueltas)` };
    }
    case 2: {
      const p = Math.min(95, Math.max(15, Math.round((rope / 100) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 3 (Meta: 100 saltos de cuerda)` };
    }
    case 3: {
      const p = Math.min(95, Math.max(20, Math.round((joggingMin / 15) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 4 (Meta: 15 min de trote)` };
    }
    case 4: {
      const p = Math.min(95, Math.max(25, Math.round((joggingMin / 25) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 5 (Meta: 25 min de trote continuo)` };
    }
    case 5: {
      const p = Math.min(95, Math.max(30, Math.round((joggingMin / 40) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 6 (Meta: 40 min de trote continuo)` };
    }
    case 6: {
      const p = Math.min(95, Math.max(35, Math.round((joggingMin / 60) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 7 (Meta: 60 min / 1 hora de trote)` };
    }
    case 7: {
      const p = Math.min(95, Math.max(40, Math.round((joggingMin / 75) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 8 (Meta: Postura Óptima y 75 min)` };
    }
    case 8: {
      const p = Math.min(95, Math.max(45, Math.round((joggingMin / 120) * 100)));
      return { percent: p, label: `${p}% hacia Nivel 9 (Meta: 120 min / Ultra Instinto)` };
    }
    default:
      return { percent: 50, label: "En progreso activo" };
  }
}

function formatPushupVariation(variant: string | null | undefined): string {
  switch (variant) {
    case "hincado":
      return "Hincado (Apoyo en rodillas)";
    case "brazos_cerrados":
      return "Brazos Cerrados (Tríceps y pectoral)";
    case "brazos_abiertos":
      return "Brazos Abiertos (Pectoral mayor)";
    case "pie_sobre_pie":
      return "Pie sobre Pie (Sobrecarga unilateral)";
    default:
      return variant || "Brazos Cerrados";
  }
}

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [commitment, setCommitment] = useState<any>(null);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, goal: 16, percentage: 100 });
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);

  // ==========================================
  // ESTADOS DE LÍNEA BASE (DÍA 1 / LLEGADA)
  // ==========================================
  const [baseline, setBaseline] = useState<any>({
    entry_date: null,
    initial_laps_completed: 0,
    initial_jump_rope_max: 0,
    initial_pushups_form: null,
    initial_squats_count: 0,
    initial_posture_notes: "",
    isReal: false
  });

  // ==========================================
  // ESTADOS DE RENDIMIENTO ACTUAL
  // ==========================================
  const [currentPerformance, setCurrentPerformance] = useState<any>({
    court_laps_done: 0,
    jogging_minutes: 0,
    jump_rope_count: 0,
    pushups_variation: null,
    pushups_reps: 0,
    squats_3x25_done: false,
    abs_3x25_done: false,
    calves_3x25_done: false,
    wall_sit_seconds: 0,
    plank_seconds: 0,
    lunges_laps: 0,
    posture_status: "pendiente",
    rest_seconds: 45,
    shooting_base_attempts: 5,
    free_throws_made: 0,
    mid_range_made: 0,
    three_point_made: 0,
    half_court_made: 0,
    sprint_100m_seconds: 0,
    lines_one_way_seconds: 0,
    lines_round_trip_seconds: 0,
    defensive_touch_verified: false,
    vertical_jump_cm: 0,
    broad_jump_cm: 0,
    board_rebound_drill_done: false,
    coach_notes: "",
    isReal: false
  });

  // ==========================================
  // ESTADO DE TEST DAY BIOMECÁNICO (OVR)
  // ==========================================
  const [evaluation, setEvaluation] = useState<any>({
    overall_ovr: 70,
    athletic_level_assessed: "iniciacion_adaptacion",
    court_laps_count: 0,
    squats_count: 0,
    pushups_count: 0,
    plank_seconds: 0,
    jump_rope_count: 0,
    short_range_shots_made: 0,
    coach_feedback: "Tu evaluación técnica aún no se aplica. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base.",
    evaluation_date: "Por programar",
    isReal: false
  });

  useEffect(() => {
    async function loadData() {
      try {
        let user = null;
        try {
          const res = await supabase.auth.getUser();
          user = res.data?.user;
        } catch (authErr) {
          console.warn("Supabase auth check:", authErr);
        }

        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;
        const storedName = typeof window !== "undefined" ? (localStorage.getItem("ww_student_name") || localStorage.getItem("ww_target_name")) : null;
        const storedRole = typeof window !== "undefined" ? localStorage.getItem("ww_user_role") : null;

        // Si no hay usuario ni credenciales guardadas, cargar modo invitado seguro sin expulsar
        if (!user && !storedEmail) {
          setProfile({
            full_name: "Atleta Wild Wolves",
            email: "atleta@wildwolves.mx",
            role: "student",
            isGuest: true,
            isCoachOrAdmin: false,
            jersey_number: 11,
            position: "GUARD (SG)"
          });
          setLoading(false);
          return;
        }

        const effectiveId = user?.id;
        const effectiveEmail = user?.email || storedEmail || "atleta@wildwolves.mx";
        const effectiveName = user?.user_metadata?.full_name || storedName || "Atleta Wild Wolves";

        let prof: any = null;
        let comm: any = null;
        let pay: any = null;

        if (effectiveId) {
          const { data: p } = await supabase.from("profiles").select("*").eq("id", effectiveId).maybeSingle();
          const { data: c } = await supabase.from("attendance_commitments").select("*").eq("user_id", effectiveId).maybeSingle();
          const { data: py } = await supabase.from("membership_payments").select("*").eq("student_id", effectiveId).order("payment_date", { ascending: false }).limit(1).maybeSingle();
          prof = p;
          comm = c;
          pay = py;

          // Asistencias reales en Supabase
          const { count: attCount } = await supabase
            .from("daily_attendance")
            .select("*", { count: "exact", head: true })
            .eq("student_id", effectiveId)
            .eq("status", "presente");

          if (typeof attCount === "number") {
            setAttendanceStats({
              total: attCount,
              goal: 16,
              percentage: Math.min(100, Math.round((attCount / 16) * 100))
            });
          }

          // A) Consultar Línea Base (Día 1)
          const { data: baselineData } = await supabase
            .from("student_initial_baseline")
            .select("*")
            .eq("student_id", effectiveId)
            .maybeSingle();

          if (baselineData) {
            setBaseline({ ...baselineData, isReal: true });
          }

          // B) Consultar Registro Físico más reciente
          const { data: physicalData } = await supabase
            .from("physical_training_logs")
            .select("*")
            .eq("student_id", effectiveId)
            .order("training_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          // C) Consultar Registro Baloncesto más reciente
          const { data: basketData } = await supabase
            .from("basketball_skills_logs")
            .select("*")
            .eq("student_id", effectiveId)
            .order("test_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (physicalData || basketData) {
            setCurrentPerformance((prev: any) => ({
              ...prev,
              court_laps_done: physicalData?.court_laps_done ?? prev.court_laps_done,
              jogging_minutes: physicalData?.jogging_minutes ?? prev.jogging_minutes,
              jump_rope_count: physicalData?.jump_rope_count ?? prev.jump_rope_count,
              pushups_variation: physicalData?.pushups_variation ?? prev.pushups_variation,
              pushups_reps: physicalData?.pushups_reps ?? prev.pushups_reps,
              squats_3x25_done: physicalData?.squats_3x25_done ?? prev.squats_3x25_done,
              abs_3x25_done: physicalData?.abs_3x25_done ?? prev.abs_3x25_done,
              calves_3x25_done: physicalData?.calves_3x25_done ?? prev.calves_3x25_done,
              wall_sit_seconds: physicalData?.wall_sit_seconds ?? prev.wall_sit_seconds,
              plank_seconds: physicalData?.plank_seconds ?? prev.plank_seconds,
              lunges_laps: physicalData?.lunges_laps ?? prev.lunges_laps,
              shooting_base_attempts: basketData?.shooting_base_attempts ?? prev.shooting_base_attempts,
              free_throws_made: basketData?.free_throws_made ?? prev.free_throws_made,
              mid_range_made: basketData?.mid_range_made ?? prev.mid_range_made,
              three_point_made: basketData?.three_point_made ?? prev.three_point_made,
              half_court_made: basketData?.half_court_made ?? prev.half_court_made,
              vertical_jump_cm: basketData?.vertical_jump_cm ?? prev.vertical_jump_cm,
              broad_jump_cm: basketData?.broad_jump_cm ?? prev.broad_jump_cm,
              sprint_100m_seconds: basketData?.sprint_100m_seconds ?? prev.sprint_100m_seconds,
              lines_one_way_seconds: basketData?.lines_one_way_seconds ?? prev.lines_one_way_seconds,
              lines_round_trip_seconds: basketData?.lines_round_trip_seconds ?? prev.lines_round_trip_seconds,
              board_rebound_drill_done: basketData?.board_rebound_drill_done ?? prev.board_rebound_drill_done,
              coach_notes: basketData?.coach_notes ?? prev.coach_notes,
              isReal: true
            }));
          }

          // D) Consultar Test Day Biomecánico
          const { data: detailedData } = await supabase
            .from("detailed_test_records")
            .select("*")
            .eq("student_id", effectiveId)
            .order("evaluation_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (detailedData) {
            setEvaluation((prev: any) => ({
              ...prev,
              ...detailedData,
              isReal: true
            }));
          }
        }

        // Cargar caché local offline si no hay datos remotos
        if (typeof window !== "undefined" && effectiveId) {
          try {
            const localBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
            if (localBaseline[effectiveId]) {
              setBaseline((prev: any) => ({ ...prev, ...localBaseline[effectiveId], isReal: true }));
            }
          } catch (e) {
            // Ignorar
          }
        }

        const cleanEmail = effectiveEmail.toLowerCase().trim();
        const isSuperAdminEmail = cleanEmail === "wildwolvescdmx@gmail.com";
        const isSuperAdmin = prof?.role === "superadmin" || isSuperAdminEmail || storedRole === "superadmin";
        const isCoachOrAdmin = isSuperAdmin || prof?.role === "coach" || storedRole === "coach";

        if (isSuperAdmin) {
          prof = {
            ...prof,
            id: effectiveId,
            full_name: "Coach Ricardo (Director General)",
            email: "wildwolvescdmx@gmail.com",
            role: "superadmin",
            jersey_number: "00",
            position: "DIRECTOR GENERAL • NIVEL 0",
            status: "active"
          };
          pay = {
            status: "pagado",
            amount: 0,
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: "Vitalicio",
            notes: "Membresía vitalicia y control directivo del club"
          };
        }

        setProfile({
          id: effectiveId,
          full_name: isSuperAdmin ? "Coach Ricardo (Director General)" : (prof?.full_name || effectiveName),
          email: effectiveEmail,
          role: isSuperAdmin ? "superadmin" : (prof?.role || storedRole || "student"),
          avatar_url: prof?.avatar_url || null,
          jersey_number: isSuperAdmin ? "00" : (prof?.jersey_number || 11),
          position: isSuperAdmin ? "DIRECTOR GENERAL • NIVEL 0" : (prof?.position || "GUARD (SG)"),
          isSuperAdmin: isSuperAdmin,
          isCoachOrAdmin: isCoachOrAdmin,
          isGuest: false
        });

        // Manejo de compromiso de asistencia
        if (comm) {
          setCommitment(comm);
        } else if (typeof window !== "undefined") {
          const localDays = localStorage.getItem("ww_selected_days");
          if (localDays) {
            setCommitment({
              days_selected: JSON.parse(localDays),
              shift: localStorage.getItem("ww_selected_shift") || "vespertino_5_7",
              frequency_type: localStorage.getItem("ww_frequency_type") || "cada_tercer_dia_3_dias"
            });
          } else if (!isCoachOrAdmin) {
            setShowCommitmentModal(true);
          }
        }

        if (pay) {
          setLastPayment(pay);
        }

      } catch (e) {
        console.error("Error al cargar dashboard de atleta:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Listeners reactivos para sincronización en tiempo real
    const handleBaselineUpdate = (e: any) => {
      if (e.detail) setBaseline({ ...e.detail, isReal: true });
    };
    const handlePhysicalUpdate = (e: any) => {
      if (e.detail) {
        setCurrentPerformance((prev: any) => ({
          ...prev,
          court_laps_done: e.detail.court_laps_done ?? prev.court_laps_done,
          jogging_minutes: e.detail.jogging_minutes ?? prev.jogging_minutes,
          jump_rope_count: e.detail.jump_rope_count ?? prev.jump_rope_count,
          pushups_variation: e.detail.pushups_variation ?? prev.pushups_variation,
          pushups_reps: e.detail.pushups_reps ?? prev.pushups_reps,
          squats_3x25_done: e.detail.squats_3x25_done ?? prev.squats_3x25_done,
          abs_3x25_done: e.detail.abs_3x25_done ?? prev.abs_3x25_done,
          calves_3x25_done: e.detail.calves_3x25_done ?? prev.calves_3x25_done,
          wall_sit_seconds: e.detail.wall_sit_seconds ?? prev.wall_sit_seconds,
          plank_seconds: e.detail.plank_seconds ?? prev.plank_seconds,
          lunges_laps: e.detail.lunges_laps ?? prev.lunges_laps,
          posture_status: e.detail.posture_status ?? prev.posture_status,
          rest_seconds: e.detail.rest_seconds ?? prev.rest_seconds,
          isReal: true
        }));
      }
    };
    const handleBasketUpdate = (e: any) => {
      if (e.detail) {
        setCurrentPerformance((prev: any) => ({
          ...prev,
          shooting_base_attempts: e.detail.shooting_base_attempts ?? prev.shooting_base_attempts,
          free_throws_made: e.detail.free_throws_made ?? prev.free_throws_made,
          mid_range_made: e.detail.mid_range_made ?? prev.mid_range_made,
          three_point_made: e.detail.three_point_made ?? prev.three_point_made,
          half_court_made: e.detail.half_court_made ?? prev.half_court_made,
          vertical_jump_cm: e.detail.vertical_jump_cm ?? prev.vertical_jump_cm,
          broad_jump_cm: e.detail.broad_jump_cm ?? prev.broad_jump_cm,
          sprint_100m_seconds: e.detail.sprint_100m_seconds ?? prev.sprint_100m_seconds,
          lines_one_way_seconds: e.detail.lines_one_way_seconds ?? prev.lines_one_way_seconds,
          lines_round_trip_seconds: e.detail.lines_round_trip_seconds ?? prev.lines_round_trip_seconds,
          defensive_touch_verified: e.detail.defensive_touch_verified ?? prev.defensive_touch_verified,
          board_rebound_drill_done: e.detail.board_rebound_drill_done ?? prev.board_rebound_drill_done,
          coach_notes: e.detail.coach_notes ?? prev.coach_notes,
          isReal: true
        }));
      }
    };
    const handleTestDayUpdate = (e: any) => {
      if (e.detail) setEvaluation((prev: any) => ({ ...prev, ...e.detail, isReal: true }));
    };

    window.addEventListener("student_baseline_updated", handleBaselineUpdate);
    window.addEventListener("physical_training_logged", handlePhysicalUpdate);
    window.addEventListener("basketball_skills_logged", handleBasketUpdate);
    window.addEventListener("test_day_updated", handleTestDayUpdate);

    return () => {
      window.removeEventListener("student_baseline_updated", handleBaselineUpdate);
      window.removeEventListener("physical_training_logged", handlePhysicalUpdate);
      window.removeEventListener("basketball_skills_logged", handleBasketUpdate);
      window.removeEventListener("test_day_updated", handleTestDayUpdate);
    };
  }, []);

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorar
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("ww_user_role");
      localStorage.removeItem("ww_user_email");
      localStorage.removeItem("ww_student_name");
      localStorage.removeItem("ww_target_name");
    }
    window.location.href = "/login";
  };

  // Verificación de evaluación real
  const isEvaluated = Boolean(currentPerformance.isReal || baseline.isReal);
  const baseMastery = checkBaseExercisesMastery(currentPerformance, baseline);

  // Cálculo del Rango Biológico activo o estado pendiente de Día 1
  const activeRank: BiologicalRankInfo = isEvaluated
    ? calculateBiologicalRank(currentPerformance, baseline)
    : {
        level: 0,
        tierName: "Iniciación",
        title: "Iniciación / Día 1 Pendiente",
        subtitle: "Esperando Diagnóstico en Cancha Carmen Serdán",
        badgeGlow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
        badgeBorder: "border-slate-600/60",
        badgeBg: "bg-slate-900/80",
        textColor: "text-slate-300",
        accentColor: "#94a3b8",
        icon: "hourglass_top",
        description: "Fase de bienvenida. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base inicial de 2 vueltas y saltos de cuerda.",
        milestone: "Asistir al primer entrenamiento",
        nextGoal: "Completar la evaluación de Día 1 con el Head Coach Ricardo para activar tu Tier 1 Principiante.",
        joggingTime: "Adaptación",
        restTime: "Libre",
        gymAccess: false
      };

  const rankProgress = calculateRankProgress(activeRank, currentPerformance);

  // Cálculos de Δ Rendimiento
  const initialLaps = Number(baseline.initial_laps_completed) || 0;
  const currentLaps = Number(currentPerformance.court_laps_done) || 0;
  const deltaLaps = Math.max(0, currentLaps - initialLaps);
  const lapsIncreasePct = initialLaps > 0 ? Math.round((deltaLaps / initialLaps) * 100) : 0;
  
  const initialRope = Number(baseline.initial_jump_rope_max) || 0;
  const currentRope = Number(currentPerformance.jump_rope_count) || 0;
  const deltaRope = Math.max(0, currentRope - initialRope);
  const ropeIncreasePct = initialRope > 0 ? Math.round((deltaRope / initialRope) * 100) : 0;

  const shootingAttempts = Number(currentPerformance.shooting_base_attempts) || 5;
  const currentShootingPct = shootingAttempts > 0 ? Math.round(((Number(currentPerformance.free_throws_made) || 0) / shootingAttempts) * 100) : 0;

  // Estatus Postural del Coach
  const postureStatus = currentPerformance.posture_status || "pendiente";
  const restSeconds = currentPerformance.rest_seconds || 45;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-xs text-secondary font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span>Sincronizando Telemetría Cyber Wolves...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary">
      
      {/* ========================================================================= */}
      {/* HEADER NAVEGACIÓN Y STATUS ATLETA (STICKY, SIN COLISIÓN)                  */}
      {/* ========================================================================= */}
      <header className="sticky top-0 inset-x-0 z-40 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-surface-container shadow-lg">
        <div className="h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo y Nombre de la Academia */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* CONTENEDOR DE LOGO INSTITUCIONAL DE COBERTURA TOTAL */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden shadow-lg border border-orange-500/40 shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm4ikoFqujPLuz7TfbSmtR5c4AMiAS3BhardFvx2oWyb5zvQKUuwMzY0hY3UUgqB6hjHbMxbKwLhKnm_QngrultrguEkfNxGcCereyCs-hSt8yKZqcP8NyXwn4hysLv-sJlkNAEeOIHIxhbz0rx94tIc5raNQVE7oBNC54iBbsWVAT3EI5RJymE4lGZPo96i-XCSHgLeEEeo9UEQzy402-JMhDrPGxuqyNHMTGZsM"
                  alt="Wild Wolves CDMX Emblem"
                  className="w-full h-full object-cover transform scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = "/logo-official.png";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight uppercase group-hover:text-primary transition">
                    Wild Wolves CDMX
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary-container/20 text-primary font-mono font-bold">
                    {profile?.isSuperAdmin ? "DIRECCIÓN GENERAL" : "PORTAL ATLETA"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-mono">
                  Deportivo Carmen Serdán
                </span>
              </div>
            </Link>
          </div>

          {/* Enlaces y Datos de Sesión */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Si es SuperAdmin o Coach, acceso directo */}
            {profile?.isSuperAdmin ? (
              <Link
                href="/master-bunker-hq"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">crown</span>
                <span>Búnker Central HQ</span>
              </Link>
            ) : profile?.isCoachOrAdmin ? (
              <Link
                href="/dashboard-coach"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">shield_person</span>
                <span>Panel Coach</span>
              </Link>
            ) : null}

            {/* Nombre del Usuario y Estatus */}
            <div className="text-right hidden sm:block">
              <span className="text-xs text-white font-bold block truncate max-w-[170px]">
                {profile?.full_name || "Atleta Wild Wolves"}
              </span>
              <span className="text-[9px] text-tertiary font-bold flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                {profile?.isSuperAdmin
                  ? "SUPERADMIN (DIRECTOR)"
                  : profile?.isCoachOrAdmin 
                  ? "VISTA PREVIA COACH" 
                  : lastPayment?.status === "pagado" 
                  ? "MEMBRESÍA ACTIVA" 
                  : "REGISTRADO"}
              </span>
            </div>

            {/* Botón de Logout */}
            <button 
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-container-high transition cursor-pointer border border-surface-container-high shadow-sm"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* BANNER DE VISTA PREVIA O SUPERADMIN */}
      {profile?.isSuperAdmin ? (
        <div className="bg-amber-950/80 border-b border-amber-500/50 px-4 py-2.5 text-xs font-mono text-amber-200 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-base">crown</span>
            <span>
              <strong>CONSOLA DE DIRECCIÓN GENERAL (SUPERADMIN)</strong> • Acceso Raíz Activo (<strong>{profile.email}</strong>).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/master-bunker-hq" className="px-3 py-1 rounded-xl bg-amber-500 text-black font-black hover:bg-amber-400 transition text-[11px] shadow">
              Abrir Búnker Central HQ →
            </Link>
            <Link href="/dashboard-coach" className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 hover:text-white transition text-[11px]">
              Panel Coach →
            </Link>
          </div>
        </div>
      ) : profile?.isCoachOrAdmin ? (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base text-amber-400">visibility</span>
          <span>
            Estás explorando el portal en <strong>Modo Vista Previa de Alumno</strong> con tu cuenta de Staff (<strong>{profile.email}</strong>).
          </span>
          <Link href="/dashboard-coach" className="underline font-bold text-amber-300 hover:text-white ml-2">
            Regresar al Panel de Control →
          </Link>
        </div>
      ) : null}

      {profile?.isGuest && (
        <div className="bg-sky-500/15 border-b border-sky-500/30 px-4 py-2 text-center text-xs text-sky-200 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base text-sky-400">info</span>
          <span>
            Explorando en <strong>Modo Vista Previa</strong>. Para sincronizar tus marcas y pagos en Carmen Serdán,
          </span>
          <Link href="/login" className="underline font-bold text-sky-300 hover:text-white ml-1">
            Inicia Sesión con tu Cuenta →
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTENIDO PRINCIPAL: RESPONSIVE FLUID CONTAINER A CUALQUIER PANTALLA       */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        
        {/* GRID PRINCIPAL: 1 COL EN MÓVIL, 12 COLUMNAS EN DESKTOP/TABLET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===================================================================== */}
          {/* COLUMNA IZQUIERDA: CYBER WOLF PLAYER CARD & STATUS (40% EN PANTALLA) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5">
            
            {/* 1. HERO CARD: CYBER WOLVES ELITE PLAYER CARD */}
            <section className={`relative overflow-hidden rounded-3xl bg-surface-container-low p-5 sm:p-6 border ${activeRank.badgeBorder} ${activeRank.badgeGlow} transition-all duration-500 shadow-2xl`}>
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-container via-secondary to-tertiary"></div>
              
              {/* Header Superior de la Tarjeta */}
              <div className="flex items-center justify-between text-[11px] font-mono text-secondary mb-4">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  CYBER WOLVES // ATLETA OFICIAL
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono font-black text-xs border border-primary-container/30">
                    OVR {evaluation.isReal ? evaluation.overall_ovr : "--"}
                  </span>
                  <span className="bg-surface-container px-2.5 py-0.5 rounded text-zinc-300 font-bold text-[10px]">
                    #WW-{profile?.id ? profile.id.slice(0, 4).toUpperCase() : "CDMX"}
                  </span>
                </div>
              </div>

              {/* Información del Jugador y Avatar Oficial */}
              <div className="flex gap-4 sm:gap-5 items-center">
                {/* Holographic Avatar Box con Logo Oficial Nítido de Cobertura Total */}
                <div className="relative shrink-0 w-28 h-32 sm:w-32 sm:h-36 rounded-2xl overflow-hidden bg-surface-container-highest border border-orange-500/40 shadow-xl">
                  <img 
                    src={profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBm4ikoFqujPLuz7TfbSmtR5c4AMiAS3BhardFvx2oWyb5zvQKUuwMzY0hY3UUgqB6hjHbMxbKwLhKnm_QngrultrguEkfNxGcCereyCs-hSt8yKZqcP8NyXwn4hysLv-sJlkNAEeOIHIxhbz0rx94tIc5raNQVE7oBNC54iBbsWVAT3EI5RJymE4lGZPo96i-XCSHgLeEEeo9UEQzy402-JMhDrPGxuqyNHMTGZsM"} 
                    alt="Wild Wolves CDMX Emblem"
                    className="w-full h-full object-cover transform scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/logo-official.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent pointer-events-none"></div>
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] font-black text-on-primary bg-primary-container px-2 py-0.5 rounded shadow">
                    {profile?.isSuperAdmin ? "#DIRECTOR" : (profile?.jersey_number ? `#${profile.jersey_number}` : "#WW")}
                  </span>
                </div>

                {/* Datos Personales y Categoría */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-on-surface truncate tracking-tight">
                    {profile?.full_name || "Atleta Wild Wolves"}
                  </h1>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 font-medium truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0"></span>
                    <span className="truncate">{profile?.email || "Deportivo Carmen Serdán"}</span>
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-container text-on-primary shadow-sm">
                      {profile?.jersey_number ? `JERSEY #${profile.jersey_number}` : "ACTIVO"}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-secondary border border-secondary/30">
                      {profile?.position || "FORMATIVO"}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/20">
                      CARMEN SERDÁN
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* INSIGNIA DE RANGO BIOLÓGICO ACTIVO                               */}
              {/* ================================================================= */}
              <div className={`mt-5 rounded-2xl p-4 border ${activeRank.badgeBorder} ${activeRank.badgeBg} ${activeRank.badgeGlow} relative overflow-hidden`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/80 flex items-center justify-center border border-white/10 shrink-0">
                      <span className={`material-symbols-outlined text-2xl ${activeRank.textColor}`}>
                        {activeRank.icon}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-zinc-400">
                          Rango Biológico Activo
                        </span>
                        <span className={`text-[9px] font-black font-mono px-1.5 py-0.2 rounded uppercase ${activeRank.textColor} bg-white/5 border border-white/10`}>
                          {activeRank.level > 0 ? `NIVEL ${activeRank.level} / 9` : "DÍA 1 PENDIENTE"}
                        </span>
                      </div>
                      <h3 className={`text-base font-black tracking-tight ${activeRank.textColor}`}>
                        {activeRank.title}
                      </h3>
                    </div>
                  </div>

                  {/* Botón para ver los 9 rangos */}
                  <button
                    onClick={() => setShowRankModal(true)}
                    className="shrink-0 text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-secondary border border-secondary/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Escalafón</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed font-sans">
                  {activeRank.description}
                </p>

                {/* Barra de Progreso hacia el siguiente rango */}
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-zinc-400">
                      {rankProgress.label}
                    </span>
                    <span className={`font-black ${activeRank.textColor}`}>
                      {rankProgress.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-container-lowest overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-secondary via-primary-container to-tertiary"
                      style={{ width: `${rankProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5 font-mono italic">
                    Próximo hito: {activeRank.nextGoal}
                  </p>
                </div>

                {/* PARÁMETROS DEL TIER Y ACCESO */}
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/10 text-center">
                  <div className="bg-surface-container-lowest/70 rounded-xl p-2 border border-white/5">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block font-bold">Trote Asignado</span>
                    <span className="text-xs font-black text-white font-mono mt-0.5 block">{activeRank.joggingTime}</span>
                  </div>
                  <div className="bg-surface-container-lowest/70 rounded-xl p-2 border border-white/5">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block font-bold">Descanso Series</span>
                    <span className="text-xs font-black text-secondary font-mono mt-0.5 block">{activeRank.restTime}</span>
                  </div>
                  <div className={`rounded-xl p-2 border ${activeRank.gymAccess ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-surface-container-lowest/70 border-white/5 text-zinc-400"}`}>
                    <span className="text-[9px] font-mono uppercase block font-bold">Sala Cargas</span>
                    <span className={`text-[10px] font-black font-mono mt-0.5 flex items-center justify-center gap-0.5 ${activeRank.gymAccess ? "text-emerald-400" : "text-zinc-500"}`}>
                      <span className="material-symbols-outlined text-[12px]">{activeRank.gymAccess ? "fitness_center" : "lock"}</span>
                      {activeRank.gymAccess ? "Desbloqueado" : "Bloqueado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* BATERÍA BASE DE CALISTENIA: 6 EJERCICIOS DE AUTOCARGA             */}
              {/* ================================================================= */}
              <div className="bg-surface-container-low/90 border border-surface-container-high rounded-2xl p-4 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">exercise</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wide">
                        Batería Base de Autocarga
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        6 Pilares para Ascenso de Tier
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    baseMastery.allMastered 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                      : "bg-surface-container text-zinc-400 border-white/10"
                  }`}>
                    {baseMastery.masteredCount} / 6 Dominados
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {/* 1. Lagartijas */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.pushups 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.pushups ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.pushups ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">1. Lagartijas</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">3x25 / Variantes</span>
                    </div>
                  </div>

                  {/* 2. Sentadillas */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.squats 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.squats ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.squats ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">2. Sentadillas</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">Autocarga</span>
                    </div>
                  </div>

                  {/* 3. Abdominales */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.abs 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.abs ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.abs ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">3. Abdominales</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">3 Fases Core</span>
                    </div>
                  </div>

                  {/* 4. Pantorrillas */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.calves 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.calves ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.calves ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">4. Pantorrillas</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">Elevación 3x25</span>
                    </div>
                  </div>

                  {/* 5. Cuerda / Escaleras */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.stairs 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.stairs ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.stairs ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">5. Cuerda/Gradas</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">Ritmo & Salto</span>
                    </div>
                  </div>

                  {/* 6. Desplantes / Isometría */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    baseMastery.lunges 
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" 
                      : "bg-surface-container-lowest/60 border-white/5 text-zinc-400"
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${baseMastery.lunges ? "text-emerald-400" : "text-zinc-500"}`}>
                      {baseMastery.lunges ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold block truncate">6. Desplantes</span>
                      <span className="text-[9px] text-zinc-400 block truncate font-mono">Pared & Isometría</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  ⚡ <em>Al dominar los 6 pilares de autocarga y alcanzar la marca de trote de tu rango, el sistema te promueve automáticamente al siguiente nivel.</em>
                </p>
              </div>

              {/* Días y Horarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                <div className="flex items-center gap-2.5 bg-surface-container px-3.5 py-2.5 rounded-xl text-xs border border-surface-container-high/60">
                  <span className="material-symbols-outlined text-secondary text-lg shrink-0">calendar_month</span>
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-400 block font-mono">Días Programados:</span>
                    <span className="font-bold text-xs truncate block text-white">
                      {commitment?.days_selected?.length > 0 ? commitment.days_selected.join(", ") : "Días por seleccionar"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-surface-container px-3.5 py-2.5 rounded-xl text-xs border border-surface-container-high/60">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">schedule</span>
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-400 block font-mono">Turno Oficial:</span>
                    <span className="font-bold text-xs truncate block text-white">
                      {commitment?.shift === "matutino_9_11" ? "Matutino (09:00 - 11:00 hrs)" : "Vespertino (17:00 - 19:00 hrs)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métrica de Asistencia y Disciplina */}
              <div className="bg-surface-container p-4 rounded-2xl mt-4 flex flex-col gap-2 border border-surface-container-high/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                    {attendanceStats.total} Asistencias Registradas
                  </span>
                  <span className="text-[10px] font-bold text-tertiary bg-surface-container-lowest px-2.5 py-0.5 rounded-full uppercase border border-tertiary/20">
                    Pase de Lista Carmen Serdán
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Asistencias oficiales validadas en cancha por el cuerpo técnico durante la temporada actual.
                </p>
              </div>
            </section>

            {/* 2. ESTATUS FINANCIERO & MEMBRESÍA */}
            <section className="bg-surface-container-low rounded-3xl p-5 sm:p-6 border border-surface-container-high shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-xl">payments</span>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">Estatus Financiero</h2>
                </div>
                <span className="text-[10px] font-bold uppercase text-on-tertiary bg-tertiary-container px-2.5 py-0.5 rounded-full">
                  {lastPayment?.status === "pagado" ? "Membresía Activa" : "Registro Activo"}
                </span>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl flex items-center justify-between border border-surface-container-high/60">
                <div>
                  <span className="text-sm font-bold text-white block">
                    {lastPayment?.status === "pagado" ? "Mensualidad Vigente" : "Inscripción en Cancha"}
                  </span>
                  <span className="text-xs text-zinc-400">Cubre Academia Formativa Carmen Serdán</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-tertiary">
                    {lastPayment?.amount ? `$${lastPayment.amount} MXN` : "Cuotas $50 / $150 / $600"}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {lastPayment?.status === "pagado" ? "/ Mes Pagado" : "Pago en Cancha"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href="https://wa.me/525549128810?text=Hola,%20solicito%20aclaraci%C3%B3n%20sobre%20la%20membres%C3%ADa%20en%20Wild%20Wolves%20CDMX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-full flex items-center justify-center gap-2 bg-tertiary-container hover:bg-tertiary text-on-tertiary text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Aclaraciones de Pago vía WhatsApp</span>
                </a>
                <button
                  onClick={triggerToast}
                  className="h-11 w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-variant text-secondary text-xs font-bold rounded-xl transition cursor-pointer border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Descargar Comprobante Digital Oficial</span>
                </button>
              </div>
            </section>

          </div>

          {/* ===================================================================== */}
          {/* COLUMNA DERECHA: TELEMETRÍA, DIAGNÓSTICO Y AVANCE (60% EN PANTALLA)  */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">

            {/* 1. DIAGNÓSTICO BIOMECÁNICO Y PRESCRIPCIÓN DEL COACH */}
            <section className="bg-surface-container-low rounded-3xl p-5 sm:p-6 border border-surface-container-high shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-xl">health_and_safety</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">
                    Diagnóstico Postural & Prescripción
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-surface-container text-secondary border border-secondary/30 uppercase font-bold">
                  Staff Oficial
                </span>
              </div>

              {/* Tarjeta de Estatus Postural */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-2xl border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">accessibility_new</span>
                    Estatus Biomecánico del Atleta:
                  </span>

                  {/* Badges según estatus postural */}
                  {!isEvaluated ? (
                    <span className="text-[10px] font-black font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">hourglass_top</span>
                      [DÍA 1 PENDIENTE]
                    </span>
                  ) : postureStatus === "ultra_instinto" ? (
                    <span className="text-[10px] font-black font-mono px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/50 shadow-[0_0_12px_rgba(217,70,239,0.5)] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      [IMPECABLE ULTRA INSTINTO]
                    </span>
                  ) : postureStatus === "optima" ? (
                    <span className="text-[10px] font-black font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(74,225,118,0.3)] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      [ÓPTIMA CERTIFICADA]
                    </span>
                  ) : (
                    <span className="text-[10px] font-black font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      [EN CORRECCIÓN ACTIVA]
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {!isEvaluated ? (
                    "Tu evaluación técnica aún no se aplica. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base."
                  ) : postureStatus === "ultra_instinto" ? (
                    "Biomecánica profesional Ultra Instinto: fluidez neuromuscular automatizada, balance perfecto en despegue de tiro y absorción elástica al caer."
                  ) : postureStatus === "optima" ? (
                    "Postura Óptima validada por el Head Coach: espalda neutra, ángulo de codo a 90° en suspensión y amortiguación simétrica sin sobrecarga lesiva."
                  ) : (
                    "En corrección biomecánica: el coach vigila la alineación de rodillas en sentadilla y la trayectoria vertical del codo. Se aplican series cortas con descanso vigilado."
                  )}
                </p>

                {/* Prescripción de Descanso Asignado */}
                <div className="mt-1 pt-3 border-t border-surface-container-high flex items-center justify-between bg-surface-container-lowest/60 p-3 rounded-xl border border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-lg">timer</span>
                    <div>
                      <span className="text-[11px] uppercase font-bold text-white block">
                        Descanso Asignado entre Series:
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Recuperación aláctica para preservar técnica estricta
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-secondary bg-secondary-container/20 px-3 py-1.5 rounded-lg border border-secondary/30">
                    {isEvaluated ? `${restSeconds}s pausa` : "45s estándar"}
                  </span>
                </div>
              </div>

              {/* Feedback Técnico y Biomecánico del Coach */}
              <div className="bg-surface-container p-4 rounded-2xl border-l-4 border-primary-container">
                <span className="text-[11px] font-bold text-primary block uppercase tracking-wider">
                  Diagnóstico Biomecánico del Head Coach:
                </span>
                <p className="text-xs text-white italic mt-1.5 leading-relaxed font-sans">
                  "{!isEvaluated 
                    ? "Tu evaluación técnica aún no se aplica. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base." 
                    : (currentPerformance.coach_notes || baseline.initial_posture_notes || "Mecánica sólida en suspensión. Excelente amortiguación en el drill de rebote al tablero.")}"
                </p>
                <span className="text-[10px] text-zinc-400 block mt-2 font-mono">
                  Coach Ricardo • Head Coach Formativo Wild Wolves CDMX
                </span>
              </div>
            </section>

            {/* 2. EVOLUCIÓN TEMPORAL: DÍA 1 VS. AVANCE ACTUAL (Δ RENDIMIENTO) */}
            <section className="bg-surface-container-low rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-2xl space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-lg">trending_up</span>
                    <h2 className="text-sm font-black text-white uppercase tracking-wide">
                      Evolución: Día 1 vs. Avance Actual
                    </h2>
                  </div>
                  <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                    Δ Rendimiento = Telemetría Actual − Línea Base de Entrada
                  </p>
                </div>
                <span className="text-[9px] font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                  {isEvaluated ? "Seguimiento Activo" : "Día 1 Pendiente"}
                </span>
              </div>

              {/* SI EL ATLETA NO TIENE EVALUACIÓN AÚN: ESTADO VACÍO ELEGANTE */}
              {!isEvaluated ? (
                <div className="py-14 px-6 text-center bg-surface-container/70 rounded-2xl border border-amber-500/20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <span className="material-symbols-outlined text-3xl">sports_score</span>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Línea Base en Espera de tu Primer Entrenamiento
                  </h3>
                  <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
                    Tu evaluación técnica aún no se aplica. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-surface-container-highest text-[10px] font-mono text-amber-300">
                    <span>Protocolo Inicial: 2 vueltas de diagnóstico • Saltos de cuerda • Batería 3x25</span>
                  </div>
                </div>
              ) : (
                /* GRID RESPONSIVE DE TELEMETRÍA (2 COLS EN TABLET/DESKTOP) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* COMPARATIVA 1: VUELTAS Y TROTE */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">directions_run</span>
                        Vueltas & Resistencia
                      </span>
                      <span className="text-primary font-mono text-[11px] font-black bg-primary-container/20 px-2 py-0.5 rounded-md border border-primary-container/30">
                        +{lapsIncreasePct}% (Δ +{deltaLaps})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Día 1:</span>
                        <span className="text-amber-400 font-mono font-black text-sm">
                          {initialLaps} vueltas
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actual:</span>
                        <span className="text-primary font-mono font-black text-sm">
                          {currentLaps} vueltas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COMPARATIVA 2: SALTOS DE CUERDA */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-tertiary text-base">fitness_center</span>
                        Saltos de Cuerda
                      </span>
                      <span className="text-tertiary font-mono text-[11px] font-black bg-tertiary-container/20 px-2 py-0.5 rounded-md border border-tertiary/30">
                        +{ropeIncreasePct}% (Δ +{deltaRope})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Día 1:</span>
                        <span className="text-amber-400 font-mono font-black text-sm">
                          {initialRope} saltos
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actual:</span>
                        <span className="text-tertiary font-mono font-black text-sm">
                          {currentRope} saltos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COMPARATIVA 3: CALISTENIA & LAGARTIJAS */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary text-base">accessibility</span>
                        Fuerza de Empuje
                      </span>
                      <span className="text-secondary font-mono text-[11px] font-black bg-secondary-container/20 px-2 py-0.5 rounded-md border border-secondary/30">
                        Sobrecarga
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Día 1:</span>
                        <span className="text-amber-400 font-mono font-black text-xs block truncate">
                          {formatPushupVariation(baseline.initial_pushups_form)}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actual:</span>
                        <span className="text-secondary font-mono font-black text-xs block truncate">
                          {currentPerformance.pushups_reps || 0} reps ({formatPushupVariation(currentPerformance.pushups_variation)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COMPARATIVA 4: BATERÍA 3X25 */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-400 text-base">sports_gymnastics</span>
                        Batería 3x25
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {currentPerformance.squats_3x25_done ? "Completada ✓" : "En desarrollo"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Día 1:</span>
                        <span className="text-amber-400 font-mono font-black text-sm">
                          {baseline.initial_squats_count || 0} sentadillas
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actual:</span>
                        <span className="text-emerald-400 font-mono font-black text-xs block">
                          Sentadilla {currentPerformance.squats_3x25_done ? "✓" : "..."} • Abs {currentPerformance.abs_3x25_done ? "✓" : "..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COMPARATIVA 5: TIRO GRADUADO */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-orange-400 text-base">sports_basketball</span>
                        Tiro Graduado ({shootingAttempts} Tiros)
                      </span>
                      <span className="text-orange-400 font-mono text-[11px] font-black bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
                        {currentShootingPct}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Día 1:</span>
                        <span className="text-amber-400 font-mono font-black text-xs block truncate">
                          Base motriz
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Actual:</span>
                        <span className="text-orange-400 font-mono font-black text-xs block truncate">
                          Libres: {currentPerformance.free_throws_made}/{shootingAttempts} ({currentShootingPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COMPARATIVA 6: VELOCIDAD Y SALTO */}
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sky-400 text-base">flight_takeoff</span>
                        Vuelo & Velocidad
                      </span>
                      <span className="text-sky-400 font-mono text-[11px] font-black bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/30">
                        {currentPerformance.vertical_jump_cm ? `${currentPerformance.vertical_jump_cm} cm` : "En progreso"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Sprint:</span>
                        <span className="text-amber-400 font-mono font-black text-xs block truncate">
                          {currentPerformance.sprint_100m_seconds ? `${currentPerformance.sprint_100m_seconds}s` : "Pendiente"}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Tablero:</span>
                        <span className="text-sky-400 font-mono font-black text-xs block truncate">
                          {currentPerformance.board_rebound_drill_done ? "Completado ✓" : "En desarrollo"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </section>

            {/* 3. TEST DAY BIOMECÁNICO (OVR) */}
            <section className="bg-surface-container-low rounded-3xl p-5 sm:p-6 border border-surface-container-high shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-xl">radar</span>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Test Day Biomecánico</h2>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      {evaluation.evaluation_date} • Deportivo Carmen Serdán
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded uppercase font-bold ${
                  evaluation.isReal 
                    ? "bg-tertiary/20 text-tertiary border border-tertiary/30" 
                    : "bg-surface-container text-zinc-400"
                }`}>
                  {evaluation.isReal ? "Validado por Coach" : "Día 1 Pendiente"}
                </span>
              </div>

              {/* OVR Score */}
              <div className="bg-surface-container p-4 rounded-2xl flex items-center justify-between border border-surface-container-high/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary-container to-surface-variant text-on-primary flex items-center justify-center text-xl font-black shadow-md shadow-primary-container/30">
                    {evaluation.isReal ? evaluation.overall_ovr : "--"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">Puntaje General (OVR)</span>
                    <span className="text-[10px] text-primary font-medium">
                      {evaluation.isReal ? "Nivel Formativo en Desarrollo" : "Pendiente de Diagnóstico Inicial"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Coach */}
              <div className="bg-surface-container p-4 rounded-2xl border-l-4 border-primary-container">
                <span className="text-[11px] font-bold text-white block uppercase tracking-wider">Feedback Técnico Oficial:</span>
                <p className="text-xs text-zinc-300 italic mt-1.5 leading-relaxed font-sans">
                  "{evaluation.isReal ? evaluation.coach_feedback : "Tu evaluación técnica aún no se aplica. Preséntate a tu primer entrenamiento en Deportivo Carmen Serdán para que el Head Coach registre tu línea base."}"
                </p>
                <span className="text-[10px] text-zinc-400 block mt-2 font-mono">Coach Ricardo • Head Coach Formativo</span>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL ONBOARDING PACTO DE ENTRENAMIENTO (OBLIGATORIO)                     */}
      {/* ========================================================================= */}
      {showCommitmentModal && (
        <AuthModal
          isOpen={showCommitmentModal}
          onClose={() => setShowCommitmentModal(false)}
          userId={profile?.id}
          targetRole="student"
          onSuccess={() => {
            setShowCommitmentModal(false);
            if (typeof window !== "undefined") {
              const localDays = localStorage.getItem("ww_selected_days");
              if (localDays) {
                setCommitment({
                  days_selected: JSON.parse(localDays),
                  shift: localStorage.getItem("ww_selected_shift") || "vespertino_5_7",
                  frequency_type: localStorage.getItem("ww_frequency_type") || "cada_tercer_dia_3_dias"
                });
              }
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ESCALAFÓN BIOLÓGICO COMPLETO (NIVELES 1 AL 9)                      */}
      {/* ========================================================================= */}
      {showRankModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-low border border-surface-container-high rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-surface-container flex items-center justify-between bg-surface-container/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-2xl">military_tech</span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Escalafón Biológico Wild Wolves
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Los 9 Rangos del Motor Físico y Técnico
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowRankModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Content: Lista de los 9 Rangos */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {Object.values(BIOLOGICAL_RANKS).map((rank) => {
                const isActive = rank.level === activeRank.level;
                const isPassed = rank.level < activeRank.level && activeRank.level > 0;

                return (
                  <div
                    key={rank.level}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? `${rank.badgeBorder} ${rank.badgeBg} ${rank.badgeGlow} scale-[1.01]`
                        : isPassed
                        ? "border-emerald-500/30 bg-surface-container/40 opacity-80"
                        : "border-surface-container-high/60 bg-surface-container-lowest/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                          isActive 
                            ? "bg-surface-container-lowest text-white border border-white/20" 
                            : isPassed 
                            ? "bg-emerald-950/60 text-emerald-400" 
                            : "bg-surface-container text-zinc-400"
                        }`}>
                          <span className="material-symbols-outlined text-base">{rank.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
                              NIVEL {rank.level}
                            </span>
                            <span className={`text-xs font-black ${isActive ? rank.textColor : "text-white"}`}>
                              {rank.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium block">
                            {rank.subtitle}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 uppercase shrink-0">
                          Tu Rango Actual
                        </span>
                      )}
                      {isPassed && (
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase shrink-0 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">check</span>
                          Superado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      {rank.description}
                    </p>

                    {/* Parámetros del Tier en el modal */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-center">
                      <div className="bg-surface-container-lowest/60 rounded-lg p-1">
                        <span className="text-zinc-400 block text-[9px]">Trote:</span>
                        <span className="text-white font-bold truncate">{rank.joggingTime}</span>
                      </div>
                      <div className="bg-surface-container-lowest/60 rounded-lg p-1">
                        <span className="text-zinc-400 block text-[9px]">Descanso:</span>
                        <span className="text-secondary font-bold truncate">{rank.restTime}</span>
                      </div>
                      <div className={`rounded-lg p-1 ${rank.gymAccess ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "bg-surface-container-lowest/60 text-zinc-400"}`}>
                        <span className="text-zinc-400 block text-[9px]">Sala Pesas:</span>
                        <span className="font-bold flex items-center justify-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">{rank.gymAccess ? "fitness_center" : "lock"}</span>
                          {rank.gymAccess ? "Acceso" : "Bloqueado"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400">Requisito Clave:</span>
                      <span className="text-white font-bold">{rank.milestone}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-surface-container bg-surface-container/60 text-center">
              <button
                onClick={() => setShowRankModal(false)}
                className="w-full py-2.5 bg-primary-container text-on-primary font-bold text-xs rounded-xl transition hover:opacity-95 cursor-pointer shadow-md"
              >
                Entendido, Continuar Entrenando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST FLOTANTE                                                            */}
      {/* ========================================================================= */}
      <div className={`fixed bottom-8 inset-x-4 max-w-md mx-auto z-50 bg-surface-container-highest text-on-surface p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 border border-surface-container ${
        toastVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}>
        <span className="material-symbols-outlined text-tertiary text-2xl">task_alt</span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white truncate">Comprobante Digital Generado</span>
          <span className="text-[10px] text-zinc-400 truncate">Comprobante digital enviado al correo del atleta.</span>
        </div>
      </div>

    </div>
  );
}
