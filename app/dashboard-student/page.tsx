"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ==============================================================================
// 1. DEFINICIÓN DEL ESCALAFÓN BIOLÓGICO (NIVELES 1 AL 9)
// ==============================================================================
interface BiologicalRankInfo {
  level: number;
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
}

const BIOLOGICAL_RANKS: Record<number, BiologicalRankInfo> = {
  1: {
    level: 1,
    title: "Cachorro Novato",
    subtitle: "Iniciación Sedentaria / Adaptación Motriz",
    badgeGlow: "shadow-[0_0_15px_rgba(148,163,184,0.2)]",
    badgeBorder: "border-slate-500/60",
    badgeBg: "bg-slate-900/80",
    textColor: "text-slate-300",
    accentColor: "#94a3b8",
    icon: "pets",
    description: "Fase de entrada. Acondicionamiento neuromuscular inicial, control de postura y adaptación cardiovascular básica sin sobrecarga.",
    milestone: "1-2 vueltas continuas • Cuerda básica",
    nextGoal: "Lograr 5 vueltas a la cancha sin detenerse para desbloquear Nivel 2."
  },
  2: {
    level: 2,
    title: "Lobo Rastreador",
    subtitle: "Adaptación 5 Vueltas / Ritmo Continuo",
    badgeGlow: "shadow-[0_0_18px_rgba(56,189,248,0.25)]",
    badgeBorder: "border-sky-600/60",
    badgeBg: "bg-sky-950/70",
    textColor: "text-sky-300",
    accentColor: "#38bdf8",
    icon: "explore",
    description: "Capacidad aeróbica en desarrollo. El atleta completa 5 vueltas a la cancha Carmen Serdán y coordina saltos de cuerda continuos.",
    milestone: "5 vueltas • Cuerda 40-50 saltos",
    nextGoal: "Alcanzar 100 saltos de cuerda continuos e iniciar series 3x25 para subir a Nivel 3."
  },
  3: {
    level: 3,
    title: "Lobo Cazador",
    subtitle: "Fuerza Base Calistenia / Batería 3x25",
    badgeGlow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    badgeBorder: "border-amber-600/60",
    badgeBg: "bg-amber-950/70",
    textColor: "text-amber-300",
    accentColor: "#f59e0b",
    icon: "fitness_center",
    description: "Fuerza calisténica consolidada. Ejecuta sentadillas y abdominales en autocarga con buena profundidad y 100 saltos de cuerda sin tropiezo.",
    milestone: "Cuerda 100 reps • Batería 3x25 en marcha",
    nextGoal: "Sostener trote continuo de 15 minutos en cancha para ascender a Nivel 4."
  },
  4: {
    level: 4,
    title: "Lobo de Guardia",
    subtitle: "Resistencia 15 Minutos / Mecánica Tiro",
    badgeGlow: "shadow-[0_0_22px_rgba(20,184,166,0.35)]",
    badgeBorder: "border-teal-500/60",
    badgeBg: "bg-teal-950/70",
    textColor: "text-teal-300",
    accentColor: "#14b8a6",
    icon: "security",
    description: "Resistencia de medio fondo y mecánica de tiro estructurada. Mantiene trote continuo durante 15 minutos sin claudicar.",
    milestone: "15 min trote continuo • Tiro Libre 50%",
    nextGoal: "Llegar a 25 min de trote continuo y salto +60 cm para obtener el rango Lobo Alfa Formativo."
  },
  5: {
    level: 5,
    title: "Lobo Alfa Formativo",
    subtitle: "Motor Biológico 25 Min / Batería 3x25 Full",
    badgeGlow: "shadow-[0_0_25px_rgba(74,225,118,0.4)]",
    badgeBorder: "border-emerald-500/70",
    badgeBg: "bg-emerald-950/70",
    textColor: "text-emerald-300",
    accentColor: "#4ae176",
    icon: "shield",
    description: "Atleta en plenitud formativa. Trote ininterrumpido de 25 minutos, Batería 3x25 completa (sentadillas, abs, gemelos) y salto vertical de +60 cm.",
    milestone: "25 min trote • Salto +60 cm • 3x25 Completo",
    nextGoal: "Alcanzar 40 min de trote ininterrumpido y 500 saltos de cuerda para ser Lobo Élite CDMX."
  },
  6: {
    level: 6,
    title: "Lobo Élite CDMX",
    subtitle: "Alta Competencia 40 Min / Cuerda 500",
    badgeGlow: "shadow-[0_0_28px_rgba(56,189,248,0.5)]",
    badgeBorder: "border-cyan-400/80",
    badgeBg: "bg-cyan-950/70",
    textColor: "text-cyan-300",
    accentColor: "#00a6e0",
    icon: "stars",
    description: "Nivel competitivo avanzado en torneos locales. Trote de 40 minutos sostenido, cuerda de 500 reps y agilidad defensiva sobresaliente.",
    milestone: "40 min trote continuo • Cuerda 500 • Sprint 13.8s",
    nextGoal: "Sostener 60 minutos (1 hora) de trote aeróbico y triples consistentes para Nivel 7."
  },
  7: {
    level: 7,
    title: "Lobo Guerrero",
    subtitle: "Resistencia 1 Hora Continua / Triples Pro",
    badgeGlow: "shadow-[0_0_30px_rgba(246,96,24,0.55)]",
    badgeBorder: "border-orange-500/80",
    badgeBg: "bg-orange-950/70",
    textColor: "text-orange-300",
    accentColor: "#f66018",
    icon: "local_fire_department",
    description: "Atleta de resistencia extrema. Resiste 1 hora continua de trote, gran potencia de piernas y efectividad perimetral de 3 puntos.",
    milestone: "60 min trote • Triples 60%+ • Sprint sub 13.5s",
    nextGoal: "Alcanzar Postura Óptima certificada y dominar la Batería 3x25 estricta con 45s de descanso para Nivel 8."
  },
  8: {
    level: 8,
    title: "Lobo Maestro",
    subtitle: "Perfección Biomecánica / Postura Óptima",
    badgeGlow: "shadow-[0_0_35px_rgba(251,191,36,0.65)]",
    badgeBorder: "border-amber-400",
    badgeBg: "bg-amber-950/80",
    textColor: "text-amber-200",
    accentColor: "#fbbf24",
    icon: "workspace_premium",
    description: "Maestría técnica y biomecánica impecable. Control postural absoluto avalado por el Coach, descansos reducidos a 45s y salto vertical +70 cm.",
    milestone: "Postura Óptima • 3x25 Estricta 45s • Salto +70 cm",
    nextGoal: "Completar 2 horas ininterrumpidas o recibir certificación Ultra Instinto para alcanzar el rango supremo."
  },
  9: {
    level: 9,
    title: "Lobo Ultra Instinto",
    subtitle: "Capacidad Biológica Suprema / 2 Horas Trote",
    badgeGlow: "shadow-[0_0_45px_rgba(217,70,239,0.7),0_0_70px_rgba(123,208,255,0.5)]",
    badgeBorder: "border-fuchsia-400",
    badgeBg: "bg-gradient-to-r from-purple-950/80 via-fuchsia-950/80 to-cyan-950/80",
    textColor: "text-fuchsia-200",
    accentColor: "#d946ef",
    icon: "auto_awesome",
    description: "Cúspide del rendimiento atlético en Wild Wolves CDMX. Resistencia de 2 horas continuas, drill de rebote al tablero dominado, biomecánica automatizada sin fatiga.",
    milestone: "2 Horas Trote / Postura Ultra Instinto • Dominio Tablero",
    nextGoal: "¡Has alcanzado la cima biológica de la Manada! Mantén la disciplina y lidera a tus compañeros."
  }
};

// Algoritmo de cálculo dinámico de Rango Biológico
function calculateBiologicalRank(perf: any): BiologicalRankInfo {
  const joggingMin = Number(perf.jogging_minutes) || 0;
  const laps = Number(perf.court_laps_done) || 0;
  const rope = Number(perf.jump_rope_count) || 0;
  const posture = perf.posture_status || "optima";
  const verticalJump = Number(perf.vertical_jump_cm) || 0;
  const sprintSec = Number(perf.sprint_100m_seconds) || 15;
  const threeMade = Number(perf.three_point_made) || 0;

  // Nivel 9: Ultra Instinto
  if (posture === "ultra_instinto" || joggingMin >= 120 || (joggingMin >= 90 && rope >= 1000)) {
    return BIOLOGICAL_RANKS[9];
  }
  // Nivel 8: Lobo Maestro
  if ((posture === "optima" && joggingMin >= 60 && perf.squats_3x25_done && perf.abs_3x25_done) || joggingMin >= 75) {
    return BIOLOGICAL_RANKS[8];
  }
  // Nivel 7: Lobo Guerrero
  if (joggingMin >= 60 || rope >= 800 || (threeMade >= 3 && sprintSec <= 13.5 && sprintSec > 0)) {
    return BIOLOGICAL_RANKS[7];
  }
  // Nivel 6: Lobo Élite CDMX
  if (joggingMin >= 40 || rope >= 500 || laps >= 20) {
    return BIOLOGICAL_RANKS[6];
  }
  // Nivel 5: Lobo Alfa Formativo
  if (joggingMin >= 25 || laps >= 12 || rope >= 300 || verticalJump >= 60) {
    return BIOLOGICAL_RANKS[5];
  }
  // Nivel 4: Lobo de Guardia
  if (joggingMin >= 15 || laps >= 8 || rope >= 150) {
    return BIOLOGICAL_RANKS[4];
  }
  // Nivel 3: Lobo Cazador
  if (laps >= 5 || rope >= 100 || perf.squats_3x25_done) {
    return BIOLOGICAL_RANKS[3];
  }
  // Nivel 2: Lobo Rastreador
  if (laps >= 3 || rope >= 40) {
    return BIOLOGICAL_RANKS[2];
  }
  // Nivel 1: Cachorro Novato
  return BIOLOGICAL_RANKS[1];
}

function calculateRankProgress(currentRank: BiologicalRankInfo, perf: any): { percent: number; label: string } {
  if (currentRank.level === 9) {
    return { percent: 100, label: "Rango Máximo Alcanzado (100%)" };
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
  const [attendanceStats, setAttendanceStats] = useState({ total: 15, goal: 16, percentage: 94 });
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRankModal, setShowRankModal] = useState(false);

  // ==========================================
  // ESTADOS DE LÍNEA BASE (DÍA 1 / LLEGADA)
  // ==========================================
  const [baseline, setBaseline] = useState<any>({
    entry_date: "12 Septiembre 2026",
    initial_laps_completed: 2,
    initial_jump_rope_max: 25,
    initial_pushups_form: "hincado",
    initial_squats_count: 12,
    initial_posture_notes: "Llegó con fatiga prematura tras trotar 2 vueltas continuas. Postura encorvada. Requiere adaptación biomecánica inicial sin sobrecargas.",
    isReal: false
  });

  // ==========================================
  // ESTADOS DE RENDIMIENTO ACTUAL (HOY / SEMANA ACTUAL)
  // ==========================================
  const [currentPerformance, setCurrentPerformance] = useState<any>({
    court_laps_done: 12,
    jogging_minutes: 25,
    jump_rope_count: 350,
    pushups_variation: "brazos_cerrados",
    pushups_reps: 20,
    squats_3x25_done: true,
    abs_3x25_done: true,
    calves_3x25_done: true,
    wall_sit_seconds: 120,
    plank_seconds: 60,
    lunges_laps: 2,
    posture_status: "optima",
    rest_seconds: 45,
    shooting_base_attempts: 5,
    free_throws_made: 4,
    mid_range_made: 3,
    three_point_made: 2,
    half_court_made: 0,
    sprint_100m_seconds: 13.8,
    lines_one_way_seconds: 11.2,
    lines_round_trip_seconds: 24.1,
    defensive_touch_verified: true,
    vertical_jump_cm: 65,
    broad_jump_cm: 195,
    board_rebound_drill_done: true,
    coach_notes: "Mecánica sólida en tiro en suspensión. Excelente amortiguación en el drill de rebote al tablero y salida rápida.",
    isReal: false
  });

  // ==========================================
  // ESTADO DE TEST DAY BIOMECÁNICO (OVR)
  // ==========================================
  const [evaluation, setEvaluation] = useState<any>({
    overall_ovr: 81,
    athletic_level_assessed: "formativo_desarrollo",
    court_laps_count: 6,
    squats_count: 18,
    pushups_count: 12,
    plank_seconds: 90,
    jump_rope_count: 250,
    short_range_shots_made: 4,
    coach_feedback: "Excelente evolución desde el Día 1. Destaca la fluidez en el trote y la amortiguación en cada salto.",
    evaluation_date: "Octubre 2026",
    isReal: false
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Cargar datos locales de línea base y logs si existen en localStorage
        if (typeof window !== "undefined") {
          try {
            const localBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
            const keys = Object.keys(localBaseline);
            if (keys.length > 0) {
              const matched = user?.id && localBaseline[user.id] ? localBaseline[user.id] : localBaseline[keys[keys.length - 1]];
              if (matched) {
                setBaseline({ ...matched, isReal: true });
              }
            }

            const localPhysical = JSON.parse(localStorage.getItem("ww_physical_logs") || "{}");
            const pKeys = Object.keys(localPhysical);
            if (pKeys.length > 0) {
              const pLogs = user?.id && localPhysical[user.id] ? localPhysical[user.id] : localPhysical[pKeys[pKeys.length - 1]];
              if (pLogs && pLogs.length > 0) {
                const latestP = pLogs[0];
                setCurrentPerformance((prev: any) => ({
                  ...prev,
                  court_laps_done: latestP.court_laps_done ?? prev.court_laps_done,
                  jogging_minutes: latestP.jogging_minutes ?? prev.jogging_minutes,
                  jump_rope_count: latestP.jump_rope_count ?? prev.jump_rope_count,
                  pushups_variation: latestP.pushups_variation ?? prev.pushups_variation,
                  pushups_reps: latestP.pushups_reps ?? prev.pushups_reps,
                  squats_3x25_done: latestP.squats_3x25_done ?? prev.squats_3x25_done,
                  abs_3x25_done: latestP.abs_3x25_done ?? prev.abs_3x25_done,
                  calves_3x25_done: latestP.calves_3x25_done ?? prev.calves_3x25_done,
                  wall_sit_seconds: latestP.wall_sit_seconds ?? prev.wall_sit_seconds,
                  plank_seconds: latestP.plank_seconds ?? prev.plank_seconds,
                  lunges_laps: latestP.lunges_laps ?? prev.lunges_laps,
                  posture_status: latestP.posture_status ?? prev.posture_status,
                  rest_seconds: latestP.rest_seconds ?? prev.rest_seconds,
                  isReal: true
                }));
              }
            }

            const localBasket = JSON.parse(localStorage.getItem("ww_basketball_logs") || "{}");
            const bKeys = Object.keys(localBasket);
            if (bKeys.length > 0) {
              const bLogs = user?.id && localBasket[user.id] ? localBasket[user.id] : localBasket[bKeys[bKeys.length - 1]];
              if (bLogs && bLogs.length > 0) {
                const latestB = bLogs[0];
                setCurrentPerformance((prev: any) => ({
                  ...prev,
                  shooting_base_attempts: latestB.shooting_base_attempts ?? prev.shooting_base_attempts,
                  free_throws_made: latestB.free_throws_made ?? prev.free_throws_made,
                  mid_range_made: latestB.mid_range_made ?? prev.mid_range_made,
                  three_point_made: latestB.three_point_made ?? prev.three_point_made,
                  half_court_made: latestB.half_court_made ?? prev.half_court_made,
                  vertical_jump_cm: latestB.vertical_jump_cm ?? prev.vertical_jump_cm,
                  broad_jump_cm: latestB.broad_jump_cm ?? prev.broad_jump_cm,
                  sprint_100m_seconds: latestB.sprint_100m_seconds ?? prev.sprint_100m_seconds,
                  lines_one_way_seconds: latestB.lines_one_way_seconds ?? prev.lines_one_way_seconds,
                  lines_round_trip_seconds: latestB.lines_round_trip_seconds ?? prev.lines_round_trip_seconds,
                  defensive_touch_verified: latestB.defensive_touch_verified ?? prev.defensive_touch_verified,
                  board_rebound_drill_done: latestB.board_rebound_drill_done ?? prev.board_rebound_drill_done,
                  coach_notes: latestB.coach_notes ?? prev.coach_notes,
                  isReal: true
                }));
              }
            }
          } catch (err) {
            console.warn("Fallo leyendo storage:", err);
          }
        }

        if (!user) {
          const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;
          const storedName = typeof window !== "undefined" ? localStorage.getItem("ww_target_name") : null;
          setProfile({
            full_name: storedName || "Santiago Morales",
            email: storedEmail || "santiago.morales@wildwolves.mx",
          });
          setCommitment({
            days_selected: ["Lunes", "Miércoles", "Viernes"],
            shift: "vespertino_5_7",
          });
          setLastPayment({
            amount: 600,
            payment_date: "02 Octubre 2026",
            status: "pagado",
          });
          setLoading(false);
          return;
        }

        // Carga desde Supabase
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        const { data: comm } = await supabase.from("attendance_commitments").select("*").eq("user_id", user.id).maybeSingle();
        const { data: pay } = await supabase.from("membership_payments").select("*").eq("student_id", user.id).order("payment_date", { ascending: false }).limit(1).maybeSingle();
        
        // A) Consultar Línea Base (Día 1)
        const { data: baselineData } = await supabase
          .from("student_initial_baseline")
          .select("*")
          .eq("student_id", user.id)
          .maybeSingle();

        if (baselineData) {
          setBaseline({ ...baselineData, isReal: true });
        }

        // B) Consultar Registro Físico más reciente
        const { data: physicalData } = await supabase
          .from("physical_training_logs")
          .select("*")
          .eq("student_id", user.id)
          .order("training_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        // C) Consultar Registro Baloncesto más reciente
        const { data: basketData } = await supabase
          .from("basketball_skills_logs")
          .select("*")
          .eq("student_id", user.id)
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
          .eq("student_id", user.id)
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

        setProfile(prof || { full_name: "Santiago Morales", email: user.email });
        setCommitment(comm || { days_selected: ["Lunes", "Miércoles", "Viernes"], shift: "vespertino_5_7" });
        setLastPayment(pay);
      } catch (e) {
        console.error("Error cargando dashboard:", e);
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
      // Ignorar error
    }
    window.location.href = "/";
  };

  // Cálculo del Rango Biológico activo
  const activeRank = calculateBiologicalRank(currentPerformance);
  const rankProgress = calculateRankProgress(activeRank, currentPerformance);

  // Cálculos de Δ Rendimiento
  const initialLaps = Number(baseline.initial_laps_completed) || 2;
  const currentLaps = Number(currentPerformance.court_laps_done) || 12;
  const deltaLaps = Math.max(0, currentLaps - initialLaps);
  const lapsIncreasePct = initialLaps > 0 ? Math.round((deltaLaps / initialLaps) * 100) : 500;
  
  const initialRope = Number(baseline.initial_jump_rope_max) || 25;
  const currentRope = Number(currentPerformance.jump_rope_count) || 350;
  const deltaRope = Math.max(0, currentRope - initialRope);
  const ropeIncreasePct = initialRope > 0 ? Math.round((deltaRope / initialRope) * 100) : 1300;

  const shootingAttempts = Number(currentPerformance.shooting_base_attempts) || 5;
  const currentShootingPct = Math.round(((Number(currentPerformance.free_throws_made) || 4) / shootingAttempts) * 100);
  const shootingDeltaPct = Math.max(0, currentShootingPct - 20);

  // Estatus Postural del Coach
  const postureStatus = currentPerformance.posture_status || "optima";
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
    <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col pb-28 selection:bg-primary-container selection:text-on-primary">
      
      {/* ========================================================================= */}
      {/* HEADER NAVEGACIÓN Y STATUS ATLETA                                         */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container">
        <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-xl">sports_basketball</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-on-surface uppercase tracking-tight">Portal Atleta</span>
              <span className="text-[10px] text-secondary tracking-wider uppercase font-mono">Carmen Serdán • CDMX</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant block font-mono font-bold">#11 MORALES</span>
              <span className="text-[9px] text-tertiary font-bold flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                MEMBRESÍA ACTIVA
              </span>
            </div>
            <button 
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONTENIDO PRINCIPAL                                                       */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 space-y-4">
        
        {/* ========================================================================= */}
        {/* 1. HERO: CYBER WOLVES ELITE PLAYER CARD & ESCALAFÓN BIOLÓGICO             */}
        {/* ========================================================================= */}
        <section className={`relative overflow-hidden rounded-3xl bg-surface-container-low p-5 border ${activeRank.badgeBorder} ${activeRank.badgeGlow} transition-all duration-500`}>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-container via-secondary to-tertiary"></div>
          
          {/* Header Superior de la Tarjeta */}
          <div className="flex items-center justify-between text-[10px] font-mono text-secondary mb-3.5">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              CYBER WOLVES // ELITE #11
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono font-black text-[10px] border border-primary-container/30">
                OVR {evaluation.overall_ovr}
              </span>
              <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold">
                #WW-8841
              </span>
            </div>
          </div>

          {/* Información del Jugador y Avatar Holográfico */}
          <div className="flex gap-4 items-center">
            {/* Box con Foto y Borde de Aura */}
            <div className={`relative shrink-0 w-24 h-28 rounded-2xl overflow-hidden bg-surface-container-highest border ${activeRank.badgeBorder} shadow-lg`}>
              <img 
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80" 
                alt="Player Card"
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
              <span className="absolute bottom-1 right-1 text-[10px] font-black text-on-primary bg-primary-container px-1.5 py-0.5 rounded shadow">
                #11
              </span>
            </div>

            {/* Datos Personales y Categoría */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-on-surface truncate tracking-tight">
                {profile?.full_name || "Santiago Morales"}
              </h1>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Atleta Formativo • Dep. Carmen Serdán
              </p>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary">
                  JERSEY #11
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-secondary border border-secondary/30">
                  GUARD (SG)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/20">
                  U-17 ÉLITE
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* INSIGNIA DE RANGO BIOLÓGICO ACTIVO (NIVELES 1 AL 9)                   */}
          {/* ===================================================================== */}
          <div className={`mt-4 rounded-2xl p-3.5 border ${activeRank.badgeBorder} ${activeRank.badgeBg} ${activeRank.badgeGlow} relative overflow-hidden`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container-lowest/80 flex items-center justify-center border border-white/10 shrink-0">
                  <span className={`material-symbols-outlined text-2xl ${activeRank.textColor}`}>
                    {activeRank.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-on-surface-variant">
                      Rango Biológico Activo
                    </span>
                    <span className={`text-[9px] font-black font-mono px-1.5 py-0.2 rounded uppercase ${activeRank.textColor} bg-white/5 border border-white/10`}>
                      NIVEL {activeRank.level} / 9
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
                className="shrink-0 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-variant text-secondary border border-secondary/30 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Escalafón</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-sans">
              {activeRank.description}
            </p>

            {/* Barra de Progreso hacia el siguiente rango */}
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="text-on-surface-variant">
                  {rankProgress.label}
                </span>
                <span className={`font-black ${activeRank.textColor}`}>
                  {rankProgress.percent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-secondary via-primary-container to-tertiary"
                  style={{ width: `${rankProgress.percent}%` }}
                />
              </div>
              <p className="text-[9px] text-outline mt-1.5 font-mono italic">
                Próximo hito: {activeRank.nextGoal}
              </p>
            </div>
          </div>

          {/* Días y Horarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-xl text-xs border border-surface-container-high/60">
              <span className="material-symbols-outlined text-secondary text-base shrink-0">calendar_month</span>
              <span className="font-medium text-[11px] truncate">
                {commitment?.days_selected?.join(", ") || "Lunes, Miércoles, Viernes"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-xl text-xs border border-surface-container-high/60">
              <span className="material-symbols-outlined text-primary text-base shrink-0">schedule</span>
              <span className="font-medium text-[11px] truncate">
                {commitment?.shift === "matutino_9_11" ? "Matutino (09:00 - 11:00)" : "Vespertino (17:00 - 19:00)"}
              </span>
            </div>
          </div>

          {/* Métrica de Asistencia y Disciplina */}
          <div className="bg-surface-container p-3.5 rounded-2xl mt-3 flex flex-col gap-2 border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                {attendanceStats.percentage}% Asistencia en Cancha
              </span>
              <span className="text-[10px] font-bold text-tertiary bg-surface-container-lowest px-2.5 py-0.5 rounded-full uppercase border border-tertiary/20">
                Récord Élite
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-sans">
              {attendanceStats.total} de {attendanceStats.goal} entrenamientos asistidos en cancha Carmen Serdán
            </p>
            {/* Streak Dots */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full ${
                    i === 13 ? "bg-surface-variant" : "bg-tertiary shadow-[0_0_6px_rgba(74,225,118,0.6)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. DIAGNÓSTICO BIOMECÁNICO Y PRESCRIPCIÓN DEL COACH                        */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-surface-container-high shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">health_and_safety</span>
              <h2 className="text-sm font-black text-white uppercase tracking-wide">
                Diagnóstico Postural & Prescripción
              </h2>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-surface-container text-secondary border border-secondary/30 uppercase font-bold">
              Staff Oficial
            </span>
          </div>

          {/* Tarjeta de Estatus Postural */}
          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">accessibility_new</span>
                Estatus Biomecánico del Atleta:
              </span>

              {/* Badges según estatus postural */}
              {postureStatus === "ultra_instinto" && (
                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/50 shadow-[0_0_12px_rgba(217,70,239,0.5)] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  [IMPECABLE ULTRA INSTINTO]
                </span>
              )}
              {postureStatus === "optima" && (
                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(74,225,118,0.3)] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  [ÓPTIMA CERTIFICADA]
                </span>
              )}
              {postureStatus === "en_correccion" && (
                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  [EN CORRECCIÓN ACTIVA]
                </span>
              )}
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {postureStatus === "ultra_instinto" &&
                "Biomecánica profesional Ultra Instinto: fluidez neuromuscular automatizada, balance perfecto en despegue de tiro y absorción elástica al caer."}
              {postureStatus === "optima" &&
                "Postura Óptima validada por el Head Coach: espalda neutra, ángulo de codo a 90° en suspensión y amortiguación simétrica sin sobrecarga lesiva."}
              {postureStatus === "en_correccion" &&
                "En corrección biomecánica: el coach vigila la alineación de rodillas en sentadilla y la trayectoria vertical del codo. Se aplican series cortas con descanso vigilado."}
            </p>

            {/* Prescripción de Descanso Asignado */}
            <div className="mt-1 pt-2.5 border-t border-surface-container-high flex items-center justify-between bg-surface-container-lowest/60 p-2.5 rounded-xl border border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">timer</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface block">
                    Descanso Asignado entre Series:
                  </span>
                  <span className="text-[9px] text-outline font-mono">
                    Recuperación aláctica para preservar técnica estricta
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-secondary bg-secondary-container/20 px-2.5 py-1 rounded-lg border border-secondary/30">
                {restSeconds}s pausa
              </span>
            </div>
          </div>

          {/* Feedback Técnico y Biomecánico del Coach */}
          <div className="bg-surface-container p-3.5 rounded-2xl border-l-4 border-primary-container">
            <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">
              Diagnóstico Biomecánico del Head Coach:
            </span>
            <p className="text-xs text-on-surface italic mt-1 leading-relaxed">
              "{currentPerformance.coach_notes || baseline.initial_posture_notes || 'Mecánica sólida en suspensión. Excelente amortiguación en el drill de rebote al tablero.'}"
            </p>
            <span className="text-[10px] text-on-surface-variant block mt-1.5 font-mono">
              Coach Ricardo • Head Coach Formativo Wild Wolves CDMX
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. EVOLUCIÓN TEMPORAL: DÍA 1 (LLEGADA) VS. HOY (Δ RENDIMIENTO)             */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-start justify-between">
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
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
              Seguimiento Activo
            </span>
          </div>

          {/* TARJETAS COMPARATIVAS DÍA 1 VS ACTUAL */}
          <div className="space-y-3">
            
            {/* COMPARATIVA 1: VUELTAS Y TROTE CONTINUO */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">directions_run</span>
                  Vueltas & Resistencia Aeróbica
                </span>
                <span className="text-primary font-mono text-[11px] font-black bg-primary-container/20 px-2 py-0.5 rounded-md border border-primary-container/30">
                  +{lapsIncreasePct}% (Δ +{deltaLaps} vueltas)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Llegada):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    {initialLaps} vueltas
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Fatiga prematura inicial</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-primary font-mono font-black text-sm">
                    {currentLaps} vueltas continuas
                  </span>
                  <span className="text-[9px] text-primary block mt-0.5 font-bold">
                    {currentPerformance.jogging_minutes} min trote continuo
                  </span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 2: SALTOS DE CUERDA */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-base">fitness_center</span>
                  Saltos Continuos de Cuerda
                </span>
                <span className="text-tertiary font-mono text-[11px] font-black bg-tertiary-container/20 px-2 py-0.5 rounded-md border border-tertiary/30">
                  +{ropeIncreasePct}% (Δ +{deltaRope} saltos)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Llegada):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    {initialRope} saltos
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">A pies juntos con tropiezos</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-tertiary font-mono font-black text-sm">
                    {currentRope} saltos continuos
                  </span>
                  <span className="text-[9px] text-tertiary block mt-0.5 font-bold">Ritmo constante</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 3: CALISTENIA & LAGARTIJAS (FORMA BIOMECÁNICA) */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">accessibility</span>
                  Fuerza de Empuje (Lagartijas)
                </span>
                <span className="text-secondary font-mono text-[11px] font-black bg-secondary-container/20 px-2 py-0.5 rounded-md border border-secondary/30">
                  Sobrecarga Progresiva
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Forma Inicial):</span>
                  <span className="text-amber-400 font-mono font-black text-xs block truncate">
                    {formatPushupVariation(baseline.initial_pushups_form)}
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Autocarga reducida</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-secondary font-mono font-black text-xs block truncate">
                    {formatPushupVariation(currentPerformance.pushups_variation)}
                  </span>
                  <span className="text-[9px] text-secondary block mt-0.5 font-bold">
                    {currentPerformance.pushups_reps || 20} repeticiones estrictas
                  </span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 4: BATERÍA 3X25 TREN INFERIOR */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-base">sports_gymnastics</span>
                  Batería 3x25 & Tren Inferior
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {currentPerformance.squats_3x25_done ? "Completada ✓" : "En desarrollo"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1:</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    {baseline.initial_squats_count || 12} sentadillas
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Fatiga en cuádriceps</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-emerald-400 font-mono font-black text-xs block">
                    Sentadillas 3x25 {currentPerformance.squats_3x25_done ? "✓" : "..."}
                  </span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5 font-bold">
                    Abs 3x25 {currentPerformance.abs_3x25_done ? "✓" : "..."} • Gemelos 3x25 {currentPerformance.calves_3x25_done ? "✓" : "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 5: TIRO GRADUADO Y PRECISIÓN */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-orange-400 text-base">sports_basketball</span>
                  Eficacia de Tiro Graduado ({shootingAttempts} Tiros Base)
                </span>
                <span className="text-orange-400 font-mono text-[11px] font-black bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
                  {currentShootingPct}% (+{shootingDeltaPct}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Mecánica Inicial):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    1 / 5 tiros (20%)
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Desviación motriz de codo</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-orange-400 font-mono font-black text-xs block truncate">
                    Libres: {currentPerformance.free_throws_made}/{shootingAttempts} ({currentShootingPct}%)
                  </span>
                  <span className="text-[9px] text-orange-300 block mt-0.5 font-medium truncate">
                    Media: {currentPerformance.mid_range_made ?? 3}/{shootingAttempts} • Triples: {currentPerformance.three_point_made ?? 2}/{shootingAttempts}
                  </span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 6: SALTO VERTICAL Y DRILL DE TABLERO */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sky-400 text-base">flight_takeoff</span>
                  Capacidad de Salto & Velocidad
                </span>
                <span className="text-sky-400 font-mono text-[11px] font-black bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/30">
                  {currentPerformance.vertical_jump_cm || 65} cm vertical
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Sin Registro):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    Base Motriz
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Salto plano sin elevación</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-sky-400 font-mono font-black text-xs block">
                    Vertical: {currentPerformance.vertical_jump_cm || 65}cm • Long: {currentPerformance.broad_jump_cm || 195}cm
                  </span>
                  <span className="text-[9px] text-sky-300 block mt-0.5 font-medium">
                    Sprint 100m: {currentPerformance.sprint_100m_seconds}s • Tablero {currentPerformance.board_rebound_drill_done ? "✓" : "..."}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* TIMELINE DE PROGRESIÓN NARRATIVA */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Ruta de Sobrecarga Progresiva Wild Wolves:
            </span>
            <p className="text-on-surface font-mono text-[11px] leading-relaxed">
              "Día 1: {initialLaps} vueltas a la cancha → Semana 4: 12 vueltas continuas → Mes 3: {currentPerformance.jogging_minutes} minutos ininterrumpidos en cancha Carmen Serdán."
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ESTATUS FINANCIERO & MEMBRESÍA                                         */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-surface-container-high shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-lg">payments</span>
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">Estatus Financiero</h2>
            </div>
            <span className="text-[10px] font-bold uppercase text-on-tertiary bg-tertiary-container px-2.5 py-0.5 rounded-full">
              Membresía Activa
            </span>
          </div>

          <div className="bg-surface-container p-3.5 rounded-2xl flex items-center justify-between border border-surface-container-high/60">
            <div>
              <span className="text-sm font-bold text-on-surface block">Mensualidad Vigente</span>
              <span className="text-[10px] text-on-surface-variant">Cubre Academia Formativa CDMX</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-tertiary">${lastPayment?.amount || 600} MXN</span>
              <span className="text-[10px] text-on-surface-variant block font-mono">/ Mes Pagado</span>
            </div>
          </div>

          <div className="text-[11px] bg-surface-container-lowest p-3 rounded-xl flex justify-between text-on-surface-variant font-mono border border-surface-container">
            <span>Último pago: {lastPayment?.payment_date || "02 Octubre 2026"}</span>
            <span className="text-secondary font-bold">Faltan 14 días</span>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/525549128810?text=Hola,%20solicito%20aclaraci%C3%B3n%20sobre%20la%20membres%C3%ADa%20de%20Santiago%20Morales%20%2311"
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
              <span>Descargar Comprobante Digital #WW-8841</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. TEST DAY BIOMECÁNICO (OVR)                                              */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-surface-container-high shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">radar</span>
              <div>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">Test Day Biomecánico</h2>
                <span className="text-[10px] text-on-surface-variant block font-mono">
                  {evaluation.evaluation_date} • Deportivo Carmen Serdán
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded uppercase font-bold ${
              evaluation.isReal 
                ? "bg-tertiary/20 text-tertiary border border-tertiary/30" 
                : "bg-surface-container text-on-surface-variant"
            }`}>
              {evaluation.isReal ? "Validado por Coach" : "Registro Base"}
            </span>
          </div>

          {/* OVR Score */}
          <div className="bg-surface-container p-3.5 rounded-2xl flex items-center justify-between border border-surface-container-high/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-surface-variant text-on-primary flex items-center justify-center text-xl font-black shadow-md shadow-primary-container/30">
                {evaluation.overall_ovr}
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block uppercase">Puntaje General (OVR)</span>
                <span className="text-[10px] text-primary font-medium">Nivel Formativo en Desarrollo</span>
              </div>
            </div>
            <span className="text-[10px] text-secondary font-mono bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-secondary/20 font-bold">
              Rank #4 U-17
            </span>
          </div>

          {/* Feedback Coach */}
          <div className="bg-surface-container p-3.5 rounded-2xl border-l-4 border-primary-container">
            <span className="text-[10px] font-bold text-on-surface block uppercase tracking-wider">Feedback Técnico Oficial:</span>
            <p className="text-xs text-on-surface italic mt-1 leading-relaxed">
              "{evaluation.coach_feedback}"
            </p>
            <span className="text-[10px] text-on-surface-variant block mt-1.5 font-mono">Coach Ricardo • Head Coach Formativo</span>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* MODAL: ESCALAFÓN BIOLÓGICO COMPLETO (NIVELES 1 AL 9)                      */}
      {/* ========================================================================= */}
      {showRankModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-low border border-surface-container-high rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">military_tech</span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Escalafón Biológico Wild Wolves
                  </h3>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    Los 9 Rangos del Motor Físico y Técnico
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowRankModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Content: Lista de los 9 Rangos */}
            <div className="p-4 overflow-y-auto space-y-3">
              {Object.values(BIOLOGICAL_RANKS).map((rank) => {
                const isActive = rank.level === activeRank.level;
                const isPassed = rank.level < activeRank.level;

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
                            : "bg-surface-container text-on-surface-variant"
                        }`}>
                          <span className="material-symbols-outlined text-base">{rank.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-on-surface-variant">
                              NIVEL {rank.level}
                            </span>
                            <span className={`text-xs font-black ${isActive ? rank.textColor : "text-white"}`}>
                              {rank.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant font-medium block">
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

                    <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                      {rank.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-on-surface-variant">Requisito Clave:</span>
                      <span className="text-white font-bold">{rank.milestone}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-surface-container bg-surface-container/60 text-center">
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
      <div className={`fixed bottom-8 inset-x-4 max-w-lg mx-auto z-50 bg-surface-container-highest text-on-surface p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 border border-surface-container ${
        toastVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}>
        <span className="material-symbols-outlined text-tertiary text-2xl">task_alt</span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-on-surface truncate">Comprobante Digital Generado</span>
          <span className="text-[10px] text-on-surface-variant truncate">Recibo #WW-8841 enviado al correo registrado.</span>
        </div>
      </div>

    </div>
  );
}
