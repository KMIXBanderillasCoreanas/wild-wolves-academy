"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  Activity, 
  Target, 
  UserCheck, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  Timer, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Layers,
  Award,
  Clock,
  HeartPulse,
  Crosshair,
  Check
} from "lucide-react";
import { enqueueOfflineAction } from "@/lib/offlineSync";
import TierProgressionBar, { getTierForMetrics } from "@/components/TierProgressionBar";

export default function DualCoachCommand() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dia1" | "fisico" | "baloncesto">("dia1");

  // ==========================================
  // 1. PESTAÑA 1: DIAGNÓSTICO DÍA 1 (LÍNEA BASE INICIAL)
  // ==========================================
  const [entryLaps, setEntryLaps] = useState<number>(2);
  const [entryRope, setEntryRope] = useState<number>(25);
  const [entryPushupsForm, setEntryPushupsForm] = useState<string>("hincado");
  const [entrySquats, setEntrySquats] = useState<number>(12);
  const [entryNotes, setEntryNotes] = useState<string>(
    "Llegó con fatiga prematura tras trotar 2 vueltas continuas. Postura encorvada. Requiere adaptación biomecánica inicial sin sobrecargas."
  );
  const [hasExistingBaseline, setHasExistingBaseline] = useState<boolean>(false);

  // ==========================================
  // 2. PESTAÑA 2: PREPARACIÓN FÍSICA Y CALISTENIA
  // ==========================================
  // Interruptores táctiles (toggles) de activación para la sesión
  const [enableLaps, setEnableLaps] = useState<boolean>(true);
  const [enableJumpRope, setEnableJumpRope] = useState<boolean>(true);
  const [enablePushups, setEnablePushups] = useState<boolean>(true);
  const [enableIsometrics, setEnableIsometrics] = useState<boolean>(false);

  // Formulario reactivo: Batería 3x25 del documento base
  const [pushupVariation, setPushupVariation] = useState<string>("brazos_cerrados");
  const [pushupReps, setPushupReps] = useState<number>(25);
  const [squats3x25, setSquats3x25] = useState<boolean>(true);
  const [abs3x25, setAbs3x25] = useState<boolean>(true);
  const [calves3x25, setCalves3x25] = useState<boolean>(true);
  const [lungesLaps, setLungesLaps] = useState<number>(2);

  // Cronómetro trote continuo (25 min hasta 2 horas / 120 min)
  const [lapsDone, setLapsDone] = useState<number>(12);
  const [joggingMin, setJoggingMin] = useState<number>(25);
  const [ropeCount, setRopeCount] = useState<number>(250);

  // Sentadilla isométrica en pared (1 a 20 min) y plancha
  const [wallSitMin, setWallSitMin] = useState<number>(2);
  const [plankSec, setPlankSec] = useState<number>(60);

  // Selector de estatus postural: [En Corrección] [Óptima] [Impecable Ultra Instinto]
  const [postureStatus, setPostureStatus] = useState<"en_correccion" | "optima" | "ultra_instinto">("optima");
  const [restSeconds, setRestSeconds] = useState<number>(45);

  // Escalafón Biológico Oficial (9 Tiers) calculado reactivamente
  const calculatedTier = getTierForMetrics(lapsDone, joggingMin, ropeCount, postureStatus);

  // ==========================================
  // 3. PESTAÑA 3: PRUEBAS TÉCNICAS DE BALONCESTO & 5 SPOTS
  // ==========================================
  // Circuito de 25 Tiros Perimetrales (5 Puntos Clave: 0-5 aciertos cada uno)
  const [spotCornerLeft, setSpotCornerLeft] = useState<number>(3);
  const [spotWingLeft, setSpotWingLeft] = useState<number>(4);
  const [spotTopKey, setSpotTopKey] = useState<number>(4);
  const [spotWingRight, setSpotWingRight] = useState<number>(3);
  const [spotCornerRight, setSpotCornerRight] = useState<number>(4);

  // Mecánica de Suspensión y Parábola (1 a 10)
  const [suspensionHeight, setSuspensionHeight] = useState<number>(8);
  const [arcParabola, setArcParabola] = useState<number>(8);
  const [followThrough, setFollowThrough] = useState<number>(9);

  // Habilidades Especiales de Bote y Manejo (Switches Táctiles)
  const [ankleBreakerDone, setAnkleBreakerDone] = useState<boolean>(true);
  const [behindBackDone, setBehindBackDone] = useState<boolean>(true);

  // Habilidades de Vuelo y Salto (Switches Táctiles)
  const [midAirSwitchDone, setMidAirSwitchDone] = useState<boolean>(true);

  // Selector de Base de Tiros Adicional: [5 Tiros] vs [10 Tiros]
  const [shootingBase, setShootingBase] = useState<5 | 10>(5);
  const [ftMade, setFtMade] = useState<number>(4);
  const [midMade, setMidMade] = useState<number>(3);
  const [threeMade, setThreeMade] = useState<number>(2);
  const [halfMade, setHalfMade] = useState<number>(0);

  // Campos de velocidad con milésimas (00.00s)
  const [sprint100m, setSprint100m] = useState<string>("14.20");
  const [linesOneWay, setLinesOneWay] = useState<string>("11.50");
  const [linesRoundTrip, setLinesRoundTrip] = useState<string>("24.10");
  const [defensiveTwoHands, setDefensiveTwoHands] = useState<boolean>(true);

  // Pruebas de salto y drill de tablero
  const [verticalJumpCm, setVerticalJumpCm] = useState<number>(64);
  const [broadJumpCm, setBroadJumpCm] = useState<number>(195);
  const [boardDrillDone, setBoardDrillDone] = useState<boolean>(true);
  const [basketNotes, setBasketNotes] = useState<string>(
    "Mecánica sólida en tiro en suspensión. Excelente amortiguación en el drill de rebote al tablero."
  );

  // Estados de control y feedback
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Carga de atletas registrados
  const loadStudentsAndBaseline = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("role", "student")
          .neq("email", "wildwolvescdmx@gmail.com");

        if (profiles && profiles.length > 0) {
          setStudents(profiles);
          const currentId = selectedStudentId || profiles[0].id;
          setSelectedStudentId(currentId);
          await loadBaselineForStudent(currentId);
          return;
        } else {
          setStudents([]);
          setSelectedStudentId("");
          return;
        }
      }

      // Fallback local solo si hay atletas reales cacheados
      const local = HoopStore.getStudents();
      if (local && local.length > 0) {
        const mapped = local.map((s) => ({
          id: s.id,
          full_name: s.fullName,
          email: s.email
        }));
        setStudents(mapped);
        const currentId = selectedStudentId || mapped[0].id;
        setSelectedStudentId(currentId);
        loadBaselineForStudent(currentId);
      } else {
        setStudents([]);
        setSelectedStudentId("");
      }
    } catch (err) {
      console.warn("Fallo cargando alumnos en DualCoachCommand:", err);
      setStudents([]);
      setSelectedStudentId("");
    }
  }, [selectedStudentId]);

  const loadBaselineForStudent = async (studentId: string) => {
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const { data } = await supabase
          .from("student_initial_baseline")
          .select("*")
          .eq("student_id", studentId)
          .maybeSingle();

        if (data) {
          setEntryLaps(data.initial_laps_completed ?? 2);
          setEntryRope(data.initial_jump_rope_max ?? 25);
          setEntryPushupsForm(data.initial_pushups_form ?? "hincado");
          setEntrySquats(data.initial_squats_count ?? 12);
          setEntryNotes(data.initial_posture_notes ?? "");
          setHasExistingBaseline(true);
        } else {
          setHasExistingBaseline(false);
        }

        // Cargar últimas pruebas técnicas de baloncesto registradas
        const { data: bLog } = await supabase
          .from("basketball_skills_logs")
          .select("*")
          .eq("student_id", studentId)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (bLog) {
          if (typeof bLog.spot_corner_left === "number") setSpotCornerLeft(bLog.spot_corner_left);
          if (typeof bLog.spot_wing_left === "number") setSpotWingLeft(bLog.spot_wing_left);
          if (typeof bLog.spot_top_key === "number") setSpotTopKey(bLog.spot_top_key);
          if (typeof bLog.spot_wing_right === "number") setSpotWingRight(bLog.spot_wing_right);
          if (typeof bLog.spot_corner_right === "number") setSpotCornerRight(bLog.spot_corner_right);
          if (typeof bLog.mechanics_suspension_height === "number") setSuspensionHeight(bLog.mechanics_suspension_height);
          if (typeof bLog.mechanics_arc_parabola === "number") setArcParabola(bLog.mechanics_arc_parabola);
          if (typeof bLog.mechanics_follow_through === "number") setFollowThrough(bLog.mechanics_follow_through);
          if (typeof bLog.ankle_breaker_done === "boolean") setAnkleBreakerDone(bLog.ankle_breaker_done);
          if (typeof bLog.behind_back_done === "boolean") setBehindBackDone(bLog.behind_back_done);
          if (typeof bLog.mid_air_switch_done === "boolean") setMidAirSwitchDone(bLog.mid_air_switch_done);
          if (typeof bLog.vertical_jump_cm === "number") setVerticalJumpCm(bLog.vertical_jump_cm);
          if (typeof bLog.broad_jump_cm === "number") setBroadJumpCm(bLog.broad_jump_cm);
          if (typeof bLog.board_rebound_drill_done === "boolean") setBoardDrillDone(bLog.board_rebound_drill_done);
        }
        return;
      }

      // Respaldo en localStorage
      if (typeof window !== "undefined") {
        const localBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
        if (localBaseline[studentId]) {
          const b = localBaseline[studentId];
          setEntryLaps(b.initial_laps_completed ?? 2);
          setEntryRope(b.initial_jump_rope_max ?? 25);
          setEntryPushupsForm(b.initial_pushups_form ?? "hincado");
          setEntrySquats(b.initial_squats_count ?? 12);
          setEntryNotes(b.initial_posture_notes ?? "");
          setHasExistingBaseline(true);
        } else {
          setHasExistingBaseline(false);
        }

        const localBasket = JSON.parse(localStorage.getItem("ww_basketball_logs") || "{}");
        if (localBasket[studentId] && localBasket[studentId][0]) {
          const bLog = localBasket[studentId][0];
          if (typeof bLog.spot_corner_left === "number") setSpotCornerLeft(bLog.spot_corner_left);
          if (typeof bLog.spot_wing_left === "number") setSpotWingLeft(bLog.spot_wing_left);
          if (typeof bLog.spot_top_key === "number") setSpotTopKey(bLog.spot_top_key);
          if (typeof bLog.spot_wing_right === "number") setSpotWingRight(bLog.spot_wing_right);
          if (typeof bLog.spot_corner_right === "number") setSpotCornerRight(bLog.spot_corner_right);
          if (typeof bLog.mechanics_suspension_height === "number") setSuspensionHeight(bLog.mechanics_suspension_height);
          if (typeof bLog.mechanics_arc_parabola === "number") setArcParabola(bLog.mechanics_arc_parabola);
          if (typeof bLog.mechanics_follow_through === "number") setFollowThrough(bLog.mechanics_follow_through);
          if (typeof bLog.ankle_breaker_done === "boolean") setAnkleBreakerDone(bLog.ankle_breaker_done);
          if (typeof bLog.behind_back_done === "boolean") setBehindBackDone(bLog.behind_back_done);
          if (typeof bLog.mid_air_switch_done === "boolean") setMidAirSwitchDone(bLog.mid_air_switch_done);
        }
      }
    } catch (e) {
      console.warn("Fallo cargando baseline o basket log:", e);
    }
  };

  useEffect(() => {
    loadStudentsAndBaseline();
  }, [loadStudentsAndBaseline]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    loadBaselineForStudent(studentId);
  };

  // Guardado de Datos
  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setSaving(true);
    setFeedbackSuccess(null);

    const todayDate = new Date().toISOString().split("T")[0];
    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const coachId = authData?.user?.id || null;

      // ----------------------------------------------------
      // CASO 1: PESTAÑA 1 - DIAGNÓSTICO DÍA 1 (LÍNEA BASE)
      // ----------------------------------------------------
      if (activeTab === "dia1") {
        const baselinePayload = {
          student_id: selectedStudentId,
          coach_id: coachId,
          entry_date: todayDate,
          initial_laps_completed: entryLaps,
          initial_jump_rope_max: entryRope,
          initial_pushups_form: entryPushupsForm,
          initial_squats_count: entrySquats,
          initial_posture_notes: entryNotes
        };

        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
          stored[selectedStudentId] = { ...baselinePayload, student_name: selectedStudent?.full_name };
          localStorage.setItem("ww_student_baseline", JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent("student_baseline_updated", { detail: baselinePayload }));
        }

        if (navigator.onLine) {
          await supabase.from("student_initial_baseline").upsert(baselinePayload, { onConflict: "student_id" });
        } else {
          enqueueOfflineAction("BASELINE", baselinePayload);
        }

        setHasExistingBaseline(true);
        setFeedbackSuccess("¡Línea base del Día 1 guardada! Servirá como referencia exacta para calcular el Δ de evolución.");
      }

      // ----------------------------------------------------
      // CASO 2: PESTAÑA 2 - PREPARACIÓN FÍSICA Y CALISTENIA
      // ----------------------------------------------------
      else if (activeTab === "fisico") {
        const physicalPayload = {
          student_id: selectedStudentId,
          coach_id: coachId,
          training_date: todayDate,
          is_cardio_active: enableLaps,
          is_strength_active: enablePushups,
          is_isometric_active: enableIsometrics,
          court_laps_done: enableLaps ? lapsDone : 0,
          jogging_minutes: enableLaps ? joggingMin : 0,
          jump_rope_count: enableJumpRope ? ropeCount : 0,
          pushups_variation: enablePushups ? pushupVariation : null,
          pushups_reps: enablePushups ? pushupReps : 0,
          squats_3x25_done: squats3x25,
          abs_3x25_done: abs3x25,
          calves_3x25_done: calves3x25,
          wall_sit_seconds: enableIsometrics ? wallSitMin * 60 : 0,
          plank_seconds: enableIsometrics ? plankSec : 0,
          lunges_laps: lungesLaps,
          posture_status: postureStatus,
          rest_seconds: restSeconds
        };

        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("ww_physical_logs") || "{}");
          if (!stored[selectedStudentId]) stored[selectedStudentId] = [];
          stored[selectedStudentId].unshift(physicalPayload);
          localStorage.setItem("ww_physical_logs", JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent("physical_training_logged", { detail: physicalPayload }));
        }

        if (navigator.onLine) {
          await supabase.from("physical_training_logs").insert({
            student_id: selectedStudentId,
            coach_id: coachId,
            training_date: todayDate,
            is_cardio_active: enableLaps,
            is_strength_active: enablePushups,
            is_isometric_active: enableIsometrics,
            court_laps_done: enableLaps ? lapsDone : 0,
            jogging_minutes: enableLaps ? joggingMin : 0,
            jump_rope_count: enableJumpRope ? ropeCount : 0,
            pushups_variation: enablePushups ? pushupVariation : null,
            pushups_reps: enablePushups ? pushupReps : 0,
            squats_3x25_done: squats3x25,
            abs_3x25_done: abs3x25,
            wall_sit_seconds: enableIsometrics ? wallSitMin * 60 : 0,
            plank_seconds: enableIsometrics ? plankSec : 0,
            lunges_laps: lungesLaps
          });
        } else {
          enqueueOfflineAction("PHYSICAL_LOG", physicalPayload);
        }

        setFeedbackSuccess(`¡Sesión de Preparación Física registrada! Postura: [${postureStatus === "ultra_instinto" ? "Impecable Ultra Instinto" : postureStatus === "optima" ? "Óptima" : "En Corrección"}]`);
      }

      // ----------------------------------------------------
      // CASO 3: PESTAÑA 3 - PRUEBAS TÉCNICAS DE BALONCESTO
      // ----------------------------------------------------
      else if (activeTab === "baloncesto") {
        const spotsTotal = spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight;
        const mechanicsScore = Number(((suspensionHeight + arcParabola + followThrough) / 3).toFixed(1));

        const basketballPayload = {
          student_id: selectedStudentId,
          coach_id: coachId,
          test_date: todayDate,
          shooting_base_attempts: shootingBase,
          free_throws_made: ftMade,
          mid_range_made: midMade,
          three_point_made: threeMade,
          half_court_made: halfMade,
          spot_corner_left: spotCornerLeft,
          spot_wing_left: spotWingLeft,
          spot_top_key: spotTopKey,
          spot_wing_right: spotWingRight,
          spot_corner_right: spotCornerRight,
          spots_total_made: spotsTotal,
          mechanics_suspension_height: suspensionHeight,
          mechanics_arc_parabola: arcParabola,
          mechanics_follow_through: followThrough,
          mechanics_overall_score: mechanicsScore,
          ankle_breaker_done: ankleBreakerDone,
          behind_back_done: behindBackDone,
          mid_air_switch_done: midAirSwitchDone,
          sprint_100m_seconds: parseFloat(sprint100m) || 14.20,
          lines_one_way_seconds: parseFloat(linesOneWay) || 11.50,
          lines_round_trip_seconds: parseFloat(linesRoundTrip) || 24.10,
          defensive_touch_verified: defensiveTwoHands,
          vertical_jump_cm: verticalJumpCm,
          broad_jump_cm: broadJumpCm,
          board_rebound_drill_done: boardDrillDone,
          coach_notes: basketNotes
        };

        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("ww_basketball_logs") || "{}");
          if (!stored[selectedStudentId]) stored[selectedStudentId] = [];
          stored[selectedStudentId].unshift(basketballPayload);
          localStorage.setItem("ww_basketball_logs", JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent("basketball_skills_logged", { detail: basketballPayload }));
        }

        // Evaluar medallas ganadas en tiempo real
        const badgesToAward: Array<{ key: string; title: string; icon: string }> = [];
        if (spotsTotal >= 18) {
          badgesToAward.push({ key: "francotirador_alfa", title: "Francotirador Alfa", icon: "Crosshair" });
        }
        if (ankleBreakerDone && behindBackDone) {
          badgesToAward.push({ key: "crossover_mortal", title: "Crossover Mortal", icon: "Zap" });
        }
        if (midAirSwitchDone && verticalJumpCm >= 60) {
          badgesToAward.push({ key: "gravedad_cero", title: "Gravedad Cero", icon: "Flame" });
        }

        if (typeof window !== "undefined" && badgesToAward.length > 0) {
          const existingBadges = JSON.parse(localStorage.getItem("ww_student_badges") || "{}");
          if (!existingBadges[selectedStudentId]) existingBadges[selectedStudentId] = [];
          badgesToAward.forEach(b => {
            if (!existingBadges[selectedStudentId].some((eb: any) => eb.badge_key === b.key)) {
              existingBadges[selectedStudentId].push({
                badge_key: b.key,
                badge_title: b.title,
                badge_icon: b.icon,
                unlocked_at: new Date().toISOString()
              });
            }
          });
          localStorage.setItem("ww_student_badges", JSON.stringify(existingBadges));
          window.dispatchEvent(new CustomEvent("student_badges_updated", { detail: existingBadges[selectedStudentId] }));
        }

        if (navigator.onLine) {
          try {
            const { error: insErr } = await supabase.from("basketball_skills_logs").insert(basketballPayload);
            if (insErr) {
              console.warn("Retrying with legacy payload structure if new columns not yet applied:", insErr);
              const legacyPayload = {
                student_id: selectedStudentId,
                coach_id: coachId,
                test_date: todayDate,
                shooting_base_attempts: shootingBase,
                free_throws_made: ftMade,
                mid_range_made: midMade,
                three_point_made: threeMade,
                half_court_made: halfMade,
                sprint_100m_seconds: parseFloat(sprint100m) || 14.20,
                lines_one_way_seconds: parseFloat(linesOneWay) || 11.50,
                lines_round_trip_seconds: parseFloat(linesRoundTrip) || 24.10,
                defensive_touch_verified: defensiveTwoHands,
                vertical_jump_cm: verticalJumpCm,
                broad_jump_cm: broadJumpCm,
                board_rebound_drill_done: boardDrillDone,
                coach_notes: basketNotes
              };
              await supabase.from("basketball_skills_logs").insert(legacyPayload);
            }

            if (badgesToAward.length > 0) {
              for (const b of badgesToAward) {
                try {
                  await supabase.from("student_earned_badges").upsert({
                    student_id: selectedStudentId,
                    badge_key: b.key,
                    badge_title: b.title,
                    badge_icon: b.icon,
                    metadata: { unlocked_by: "coach_evaluation", spots_made: spotsTotal, date: todayDate }
                  }, { onConflict: "student_id,badge_key" });
                } catch (bErr) {
                  console.warn("Badge sync note:", bErr);
                }
              }
            }
          } catch (netErr) {
            console.warn("Error en supabase insert:", netErr);
            enqueueOfflineAction("BASKETBALL_LOG", basketballPayload);
          }
        } else {
          enqueueOfflineAction("BASKETBALL_LOG", basketballPayload);
        }

        setFeedbackSuccess("¡Pruebas Técnicas de Baloncesto (5 Spots & Habilidades) registradas y medallas actualizadas!");
      }

      setTimeout(() => setFeedbackSuccess(null), 4500);
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#10131a] border border-[#272a32] rounded-3xl p-5 sm:p-7 text-[#e0e2ec] shadow-2xl transition-all">
      
      {/* 1. HEADER DE COMANDO DUAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#272a32] gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#f66018]/20 text-[#ffb599] border border-[#f66018]/30 px-3 py-1 rounded-full font-bold">
              Wild Wolves CDMX • Sede Carmen Serdán
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#1d2027] text-[#7bd0ff] border border-[#7bd0ff]/20 px-2.5 py-1 rounded-full font-bold">
              Sistema Modular Dual de Entrenamiento
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-2 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#f66018]" />
            <span>Módulo de Comando del Coach</span>
          </h2>
          <p className="text-xs text-[#e2bfb2] mt-0.5 font-sans">
            Separación de raíz: Preparación Física (Motor Biológico) vs. Técnica de Baloncesto (Fundamentos).
          </p>
        </div>

        {/* SELECTOR DE ATLETA REGISTRADO */}
        <div className="w-full lg:w-96 shrink-0">
          <label className="text-[10px] font-mono text-[#e2bfb2] uppercase font-bold block mb-1.5">
            Seleccionar Atleta Registrado:
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              disabled={students.length === 0}
              className="w-full h-11 px-3.5 pr-10 bg-[#1d2027] border border-[#32353d] rounded-xl text-xs font-bold text-white outline-none focus:border-[#7bd0ff] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {students.length === 0 ? (
                <option value="" className="bg-[#10131a] text-zinc-400">
                  Esperando alumnos reales para evaluación de Día 1 o Test Day.
                </option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#10131a] text-white">
                    {s.full_name} ({s.email})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* BANNER INFORMATIVO SI NO HAY ALUMNOS EN LA BASE DE DATOS */}
      {students.length === 0 && (
        <div className="my-4 p-4 rounded-2xl bg-[#191b23] border border-amber-500/40 flex items-center gap-3.5 text-xs text-amber-200 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold block uppercase tracking-wide text-amber-300">
              Esperando alumnos reales para evaluación de Día 1 o Test Day
            </span>
            <span className="text-[11px] text-zinc-300">
              Aún no hay atletas registrados en Supabase. En cuanto un alumno complete su registro inicial con Google o correo en el Deportivo Carmen Serdán, se habilitará automáticamente su evaluación técnica y física.
            </span>
          </div>
        </div>
      )}

      {/* 2. PESTAÑAS PRINCIPALES DEL SISTEMA DUAL */}
      <div className="flex flex-wrap gap-2.5 my-6 border-b border-[#272a32] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("dia1")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "dia1"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-102"
              : "bg-[#1d2027] text-[#e0e2ec] hover:text-white border border-[#32353d]"
          }`}
        >
          <UserCheck className="w-4 h-4" /> 1. Diagnóstico Día 1 (Línea Base)
          {hasExistingBaseline && (
            <span className="w-2 h-2 rounded-full bg-[#4ae176] ml-1" title="Línea base registrada" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fisico")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "fisico"
              ? "bg-[#f66018] text-white shadow-lg shadow-[#f66018]/30 scale-102"
              : "bg-[#1d2027] text-[#e0e2ec] hover:text-white border border-[#32353d]"
          }`}
        >
          <Activity className="w-4 h-4" /> 2. Preparación Física & Calistenia
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("baloncesto")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "baloncesto"
              ? "bg-[#00a6e0] text-white shadow-lg shadow-[#00a6e0]/30 scale-102"
              : "bg-[#1d2027] text-[#e0e2ec] hover:text-white border border-[#32353d]"
          }`}
        >
          <Target className="w-4 h-4" /> 3. Pruebas Técnicas de Baloncesto
        </button>
      </div>

      <form onSubmit={handleSaveData} className="space-y-6">

        {/* ========================================================================= */}
        {/* PESTAÑA 1: DIAGNÓSTICO DÍA 1 (LÍNEA BASE INICIAL)                         */}
        {/* ========================================================================= */}
        {activeTab === "dia1" && (
          <div className="bg-[#191b23] border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#272a32] gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> Foto Inicial del Atleta (¿Cómo llegó al club?)
                </h3>
                <p className="text-xs text-[#e2bfb2] mt-0.5">
                  Registra el punto de partida real del alumno para que el sistema grafique su avance semana con semana.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto font-bold">
                {hasExistingBaseline ? "LÍNEA BASE YA REGISTRADA" : "PENDIENTE DE CAPTURA"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vueltas Soportadas */}
              <div className="bg-[#1d2027] p-4 rounded-xl border border-[#32353d]">
                <label className="text-[11px] font-bold text-[#e2bfb2] uppercase block mb-1">
                  Vueltas a la Cancha:
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={entryLaps}
                  onChange={(e) => setEntryLaps(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0b0e15] border border-[#32353d] rounded-xl text-lg font-black text-amber-400 font-mono"
                  placeholder="Ej. 2 vueltas"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Aguante antes de fatigarse</span>
              </div>

              {/* Saltos de Cuerda Continuos */}
              <div className="bg-[#1d2027] p-4 rounded-xl border border-[#32353d]">
                <label className="text-[11px] font-bold text-[#e2bfb2] uppercase block mb-1">
                  Saltos Continuos de Cuerda:
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={entryRope}
                  onChange={(e) => setEntryRope(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0b0e15] border border-[#32353d] rounded-xl text-lg font-black text-amber-400 font-mono"
                  placeholder="Ej. 25 saltos"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Sin tropezar a pies juntos</span>
              </div>

              {/* Selector de Variante Inicial de Lagartija */}
              <div className="bg-[#1d2027] p-4 rounded-xl border border-[#32353d]">
                <label className="text-[11px] font-bold text-[#e2bfb2] uppercase block mb-1">
                  Variante Inicial de Lagartija:
                </label>
                <select
                  value={entryPushupsForm}
                  onChange={(e) => setEntryPushupsForm(e.target.value)}
                  className="w-full h-11 px-2.5 bg-[#0b0e15] border border-[#32353d] rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
                >
                  <option value="hincado">Hincado / Rodillas en piso</option>
                  <option value="brazos_cerrados">Brazos Cerrados (Tríceps)</option>
                  <option value="brazos_abiertos">Brazos Abiertos (Pectoral)</option>
                  <option value="pie_sobre_pie">Pie sobre Pie (Alternado)</option>
                </select>
                <span className="text-[10px] text-zinc-500 mt-1 block">Postura de empuje inicial</span>
              </div>

              {/* Sentadillas al Aire Iniciales */}
              <div className="bg-[#1d2027] p-4 rounded-xl border border-[#32353d]">
                <label className="text-[11px] font-bold text-[#e2bfb2] uppercase block mb-1">
                  Sentadillas al Aire:
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={entrySquats}
                  onChange={(e) => setEntrySquats(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0b0e15] border border-[#32353d] rounded-xl text-lg font-black text-amber-400 font-mono"
                  placeholder="Ej. 12"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Control neutral sin peso</span>
              </div>
            </div>

            {/* Diagnóstico Biomecánico y Postural de Entrada */}
            <div>
              <label className="text-xs font-bold text-[#e2bfb2] uppercase block mb-1.5">
                Diagnóstico Biomecánico y Postural de Entrada:
              </label>
              <textarea
                rows={3}
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                className="w-full p-3.5 bg-[#0b0e15] border border-[#32353d] rounded-xl text-xs text-white outline-none focus:border-amber-500 transition resize-none leading-relaxed"
                placeholder="Anotar si se encorva, si mete rodillas (valgo), fatiga rápida o rigidez en tobillos..."
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 2: PREPARACIÓN FÍSICA Y CALISTENIA (MOTOR BIOLÓGICO)              */}
        {/* ========================================================================= */}
        {activeTab === "fisico" && (
          <div className="space-y-5 animate-fade-in">
            
            {/* ESCALAFÓN BIOLÓGICO OFICIAL (9 TIERS) & REQUISITOS DE GRADUACIÓN */}
            <TierProgressionBar 
              currentLevel={calculatedTier.level}
              onSelectTier={(selectedTier) => {
                setRestSeconds(selectedTier.restSeconds);
              }}
            />

            {/* INTERRUPTORES TÁCTILES DEL COACH */}
            <div className="bg-[#191b23] border border-[#272a32] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#f66018]" />
                <span>Interruptores de Sesión: Activar / Desactivar Ejercicios:</span>
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEnableLaps(!enableLaps)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableLaps ? "bg-[#f66018]/25 border-[#f66018] text-[#ffb599]" : "bg-[#1d2027] border-transparent text-zinc-500"
                  }`}
                >
                  {enableLaps ? "✓ Vueltas/Trote ON" : "Vueltas OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnableJumpRope(!enableJumpRope)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableJumpRope ? "bg-[#f66018]/25 border-[#f66018] text-[#ffb599]" : "bg-[#1d2027] border-transparent text-zinc-500"
                  }`}
                >
                  {enableJumpRope ? "✓ Cuerda ON" : "Cuerda OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnablePushups(!enablePushups)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enablePushups ? "bg-[#f66018]/25 border-[#f66018] text-[#ffb599]" : "bg-[#1d2027] border-transparent text-zinc-500"
                  }`}
                >
                  {enablePushups ? "✓ Lagartijas ON" : "Lagartijas OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnableIsometrics(!enableIsometrics)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableIsometrics ? "bg-[#f66018]/25 border-[#f66018] text-[#ffb599]" : "bg-[#1d2027] border-transparent text-zinc-500"
                  }`}
                >
                  {enableIsometrics ? "✓ Isometría ON" : "Isometría OFF"}
                </button>
              </div>
            </div>

            {/* BATERÍA 3X25 DEL DOCUMENTO BASE */}
            <div className="bg-[#191b23] border border-[#272a32] p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#272a32]">
                <h4 className="text-xs font-black uppercase text-[#ffb599] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#f66018]" />
                  <span>Batería de Autocarga 3x25 (Documento Base Wild Wolves)</span>
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">3 series de 25 repeticiones</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#1d2027] border border-[#32353d] cursor-pointer text-xs">
                  <span className="font-bold text-white">Sentadillas (3x25)</span>
                  <input
                    type="checkbox"
                    checked={squats3x25}
                    onChange={(e) => setSquats3x25(e.target.checked)}
                    className="w-4 h-4 accent-[#f66018]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#1d2027] border border-[#32353d] cursor-pointer text-xs">
                  <span className="font-bold text-white">Abdominales 3 Fases (3x25)</span>
                  <input
                    type="checkbox"
                    checked={abs3x25}
                    onChange={(e) => setAbs3x25(e.target.checked)}
                    className="w-4 h-4 accent-[#f66018]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#1d2027] border border-[#32353d] cursor-pointer text-xs">
                  <span className="font-bold text-white">Pantorrillas (3x25)</span>
                  <input
                    type="checkbox"
                    checked={calves3x25}
                    onChange={(e) => setCalves3x25(e.target.checked)}
                    className="w-4 h-4 accent-[#f66018]"
                  />
                </label>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1d2027] border border-[#32353d] text-xs">
                  <span className="font-bold text-white">Vueltas Desplantes:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={lungesLaps}
                    onChange={(e) => setLungesLaps(Number(e.target.value))}
                    className="w-14 h-8 bg-[#0b0e15] border border-[#32353d] rounded text-center font-bold text-white"
                  />
                </div>
              </div>
            </div>

            {/* CRONÓMETRO DE TROTE Y RESISTENCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Trote Continuo: 25 min hasta 2 horas */}
              {enableLaps && (
                <div className="bg-[#191b23] border border-[#272a32] p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-[#f66018]" />
                      Trote Continuo (25 min a 2 horas):
                    </span>
                    <span className="font-mono text-base font-black text-[#ffb599]">
                      {joggingMin} minutos
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={joggingMin}
                    onChange={(e) => setJoggingMin(Number(e.target.value))}
                    className="w-full accent-[#f66018] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>10 min</span>
                    <span>25 min (Meta Base)</span>
                    <span>60 min (1h)</span>
                    <span>120 min (2h Ultra)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#272a32]">
                    <span className="text-zinc-400">Vueltas completadas hoy:</span>
                    <input
                      type="number"
                      value={lapsDone}
                      onChange={(e) => setLapsDone(Number(e.target.value))}
                      className="w-18 h-8 bg-[#0b0e15] border border-[#32353d] rounded-lg text-center font-bold text-white"
                    />
                  </div>
                </div>
              )}

              {/* Salto de Cuerda y Lagartijas */}
              {enableJumpRope && (
                <div className="bg-[#191b23] border border-[#272a32] p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-[#4ae176]" />
                      Saltos de Cuerda en Sesión:
                    </span>
                    <span className="font-mono text-base font-black text-[#4ae176]">
                      {ropeCount} saltos
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={ropeCount}
                    onChange={(e) => setRopeCount(Number(e.target.value))}
                    className="w-full accent-[#4ae176] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>50</span>
                    <span>250</span>
                    <span>500</span>
                    <span>1,000 Diario</span>
                  </div>
                  {enablePushups && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#272a32]">
                      <span className="text-zinc-400">Variante lagartija:</span>
                      <select
                        value={pushupVariation}
                        onChange={(e) => setPushupVariation(e.target.value)}
                        className="h-8 px-2 bg-[#0b0e15] border border-[#32353d] rounded-lg text-xs font-bold text-white outline-none"
                      >
                        <option value="hincado">Hincado</option>
                        <option value="brazos_cerrados">Brazos Cerrados</option>
                        <option value="brazos_abiertos">Brazos Abiertos</option>
                        <option value="pie_sobre_pie">Pie sobre Pie</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ISOMETRÍA EN PARED & SELECTORES POSTURALES */}
            <div className="bg-[#191b23] border border-[#272a32] p-5 rounded-2xl space-y-4">
              {enableIsometrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#272a32]">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white">Sentadilla Isométrica en Pared (1 a 20 min):</span>
                      <span className="font-mono text-[#7bd0ff]">{wallSitMin} minutos</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={wallSitMin}
                      onChange={(e) => setWallSitMin(Number(e.target.value))}
                      className="w-full accent-[#7bd0ff] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white">Plancha Isométrica:</span>
                      <span className="font-mono text-[#7bd0ff]">{plankSec} segundos</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="300"
                      step="15"
                      value={plankSec}
                      onChange={(e) => setPlankSec(Number(e.target.value))}
                      className="w-full accent-[#7bd0ff] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* SELECTOR DE ESTATUS POSTURAL Y SEGUNDOS DE DESCANSO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#e2bfb2] block mb-2">
                    Estatus Postural del Atleta (Evaluación del Coach):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPostureStatus("en_correccion")}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        postureStatus === "en_correccion"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow"
                          : "bg-[#1d2027] border-transparent text-zinc-500"
                      }`}
                    >
                      En Corrección
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostureStatus("optima")}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        postureStatus === "optima"
                          ? "bg-[#4ae176]/20 border-[#4ae176] text-[#4ae176] shadow"
                          : "bg-[#1d2027] border-transparent text-zinc-500"
                      }`}
                    >
                      Óptima
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostureStatus("ultra_instinto")}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        postureStatus === "ultra_instinto"
                          ? "bg-[#7bd0ff]/20 border-[#7bd0ff] text-[#7bd0ff] shadow-md shadow-[#7bd0ff]/20 font-black"
                          : "bg-[#1d2027] border-transparent text-zinc-500"
                      }`}
                    >
                      Ultra Instinto
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase text-[#e2bfb2] block">
                      Segundos de Descanso Asignados entre Series:
                    </label>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">
                      Mandatorio Tier: {calculatedTier.restSeconds}s
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {[
                      { sec: 120, label: "T1 (120s)" },
                      { sec: 90, label: "T2 (90s)" },
                      { sec: 60, label: "T3 (60s)" },
                      { sec: 45, label: "T4 (45s)" },
                      { sec: 30, label: "T5 (30s)" },
                      { sec: 15, label: "T7-9 (15s)" },
                      { sec: 10, label: "T6 (10s)" },
                    ].map(({ sec, label }) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setRestSeconds(sec)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer border text-center ${
                          restSeconds === sec
                            ? "bg-[#f66018] border-[#f66018] text-white shadow-lg shadow-orange-500/20"
                            : "bg-[#1d2027] border-transparent text-zinc-400 hover:text-white"
                        }`}
                        title={label}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 3: PRUEBAS TÉCNICAS DE BALONCESTO & 5 SPOTS                       */}
        {/* ========================================================================= */}
        {activeTab === "baloncesto" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. CIRCUITO DE 25 TIROS PERIMETRALES (5 PUNTOS CLAVE) */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#272a32] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-[#f66018]" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wide">
                      Circuito Perimetral de 25 Tiros (5 Puntos Clave)
                    </h3>
                  </div>
                  <p className="text-xs text-[#e2bfb2] mt-0.5">
                    Evaluación táctil de efectividad perimetral: 5 lanzamientos por estación clave en la duela.
                  </p>
                </div>

                {/* Score Total y Porcentaje */}
                <div className="flex items-center gap-3 bg-[#0b0e15] px-4 py-2 rounded-xl border border-[#32353d] self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-mono block">Aciertos Totales:</span>
                    <span className="text-lg font-black font-mono text-[#f66018]">
                      {spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight} / 25
                    </span>
                  </div>
                  <div className="h-8 w-px bg-zinc-800"></div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block">Efectividad:</span>
                    <span className="text-lg font-black font-mono text-[#4ae176]">
                      {Math.round(((spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) / 25) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Efectividad */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 text-[11px]">Barra de Rendimiento Perimetral:</span>
                  <span className={`font-black ${
                    (spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) >= 18 
                      ? "text-emerald-400" 
                      : (spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) >= 12 
                      ? "text-amber-400" 
                      : "text-zinc-400"
                  }`}>
                    {Math.round(((spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) / 25) * 100)}% de efectividad
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0b0e15] rounded-full overflow-hidden border border-[#32353d]">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-400"
                    style={{ width: `${Math.round(((spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) / 25) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Banner de Insignia Francotirador Alfa si cumple >= 18 */}
              {(spotCornerLeft + spotWingLeft + spotTopKey + spotWingRight + spotCornerRight) >= 18 && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      <strong>¡Medalla Francotirador Alfa Activada!</strong> El atleta supera la marca de 18/25 en el circuito perimetral oficial.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase shrink-0 font-mono">
                    Desbloqueada
                  </span>
                </div>
              )}

              {/* Grid Táctil de las 5 Estaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  {
                    name: "1. Esquina Izquierda",
                    sub: "Corner Left",
                    val: spotCornerLeft,
                    set: setSpotCornerLeft,
                    accent: "border-sky-500/30 text-sky-400"
                  },
                  {
                    name: "2. Ala 45° Izquierda",
                    sub: "Wing Left",
                    val: spotWingLeft,
                    set: setSpotWingLeft,
                    accent: "border-cyan-500/30 text-cyan-400"
                  },
                  {
                    name: "3. Cabecera Central",
                    sub: "Top of the Key",
                    val: spotTopKey,
                    set: setSpotTopKey,
                    accent: "border-orange-500/40 text-orange-400"
                  },
                  {
                    name: "4. Ala 45° Derecha",
                    sub: "Wing Right",
                    val: spotWingRight,
                    set: setSpotWingRight,
                    accent: "border-cyan-500/30 text-cyan-400"
                  },
                  {
                    name: "5. Esquina Derecha",
                    sub: "Corner Right",
                    val: spotCornerRight,
                    set: setSpotCornerRight,
                    accent: "border-sky-500/30 text-sky-400"
                  }
                ].map((spot, idx) => (
                  <div 
                    key={idx}
                    className={`bg-[#1d2027] border ${spot.accent} p-3.5 rounded-2xl flex flex-col items-center justify-between text-center relative group`}
                  >
                    <div className="w-full mb-2">
                      <span className="text-white text-xs font-black block truncate">{spot.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono block">{spot.sub}</span>
                    </div>

                    {/* Selector de número grande */}
                    <div className="my-1.5 flex items-center justify-center">
                      <div className="w-14 h-12 rounded-xl bg-[#0b0e15] border border-[#32353d] flex items-center justify-center text-xl font-mono font-black text-white group-hover:border-orange-500/50 transition">
                        {spot.val}
                        <span className="text-xs text-zinc-500 ml-0.5 font-normal">/5</span>
                      </div>
                    </div>

                    {/* Botones táctiles 0 al 5 con un solo toque */}
                    <div className="grid grid-cols-6 gap-1 w-full mt-2">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => spot.set(num)}
                          className={`py-1.5 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                            spot.val === num
                              ? "bg-gradient-to-t from-orange-600 to-amber-500 text-white font-black shadow-md shadow-orange-500/30 scale-105"
                              : "bg-[#0b0e15] text-zinc-400 hover:text-white hover:bg-zinc-800"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. MECÁNICA DE SUSPENSIÓN Y PARÁBOLA */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#272a32] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#7bd0ff]" />
                    <h3 className="text-sm font-black uppercase text-white tracking-wide">
                      Mecánica de Suspensión, Parábola y Guía
                    </h3>
                  </div>
                  <p className="text-xs text-[#e2bfb2] mt-0.5">
                    Evaluación biomecánica cualitativa en escala de 1 a 10.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#0b0e15] px-3.5 py-1.5 rounded-xl border border-[#32353d] self-start sm:self-auto">
                  <span className="text-[10px] text-zinc-400 font-mono">Calificación Biomecánica:</span>
                  <span className="text-sm font-black font-mono text-[#7bd0ff]">
                    {((suspensionHeight + arcParabola + followThrough) / 3).toFixed(1)} / 10
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Altura de suspensión */}
                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">1. Altura de Suspensión</span>
                    <span className="font-mono text-sm font-black text-[#7bd0ff]">{suspensionHeight}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={suspensionHeight}
                    onChange={(e) => setSuspensionHeight(Number(e.target.value))}
                    className="w-full accent-[#7bd0ff] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-400 block">
                    Elevación en despegue y suelta en el punto máximo de suspensión.
                  </span>
                </div>

                {/* Arco parabólico */}
                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">2. Arco Parabólico</span>
                    <span className="font-mono text-sm font-black text-amber-400">{arcParabola}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={arcParabola}
                    onChange={(e) => setArcParabola(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-400 block">
                    Ángulo de entrada (~45°–52°) sin trayectoria plana o errática.
                  </span>
                </div>

                {/* Guía del brazo ("follow-through") */}
                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">3. Follow-Through (Guía)</span>
                    <span className="font-mono text-sm font-black text-[#4ae176]">{followThrough}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={followThrough}
                    onChange={(e) => setFollowThrough(Number(e.target.value))}
                    className="w-full accent-[#4ae176] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-400 block">
                    Extensión completa del brazo rector y quiebre de muñeca (&quot;cuello de ganso&quot;).
                  </span>
                </div>
              </div>
            </div>

            {/* 3. HABILIDADES ESPECIALES DE BOTE Y MANEJO */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-[#272a32]">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black uppercase text-white tracking-wide">
                    Habilidades Especiales de Bote y Manejo (Switches Táctiles)
                  </h3>
                </div>
                <p className="text-xs text-[#e2bfb2] mt-0.5">
                  Desbloquean la medalla &quot;Crossover Mortal&quot; al consolidar ambas variantes con fluidez.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Switch 1: Rompimiento de Tobillos */}
                <label className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer text-xs ${
                  ankleBreakerDone 
                    ? "bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-500/10" 
                    : "bg-[#0b0e15] border-[#32353d] opacity-75"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      ankleBreakerDone ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-bold block text-xs">
                        Rompimiento de Tobillos (Ankle Breaker)
                      </span>
                      <span className="text-[10px] text-zinc-400 leading-tight block">
                        Cambio drástico de ritmo, transferencia de peso y centro de gravedad bajo.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ankleBreakerDone}
                    onChange={(e) => setAnkleBreakerDone(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 ml-2"
                  />
                </label>

                {/* Switch 2: Drible / Pase por la Espalda */}
                <label className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer text-xs ${
                  behindBackDone 
                    ? "bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-500/10" 
                    : "bg-[#0b0e15] border-[#32353d] opacity-75"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      behindBackDone ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-bold block text-xs">
                        Drible / Pase por la Espalda
                      </span>
                      <span className="text-[10px] text-zinc-400 leading-tight block">
                        Behind the back en velocidad máxima sin mirar el balón.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={behindBackDone}
                    onChange={(e) => setBehindBackDone(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 ml-2"
                  />
                </label>
              </div>

              {ankleBreakerDone && behindBackDone && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-300 font-mono">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>⚡ <strong>¡Crossover Mortal Concedido!</strong> Ambas técnicas de desestabilización validadas.</span>
                </div>
              )}
            </div>

            {/* 4. HABILIDADES DE VUELO Y SALTO */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-[#272a32]">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#4ae176]" />
                  <h3 className="text-sm font-black uppercase text-white tracking-wide">
                    Habilidades de Vuelo, Salto y Finalización
                  </h3>
                </div>
                <p className="text-xs text-[#e2bfb2] mt-0.5">
                  Métricas pliométricas y control del cuerpo en suspensión (Gravedad Cero).
                </p>
              </div>

              {/* Switch Cambio de Manos en el Aire */}
              <label className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer text-xs ${
                midAirSwitchDone 
                  ? "bg-emerald-950/25 border-emerald-500/50 shadow-md shadow-emerald-500/10" 
                  : "bg-[#0b0e15] border-[#32353d] opacity-75"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    midAirSwitchDone ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-white font-bold block text-xs">
                      Cambio de Manos en el Aire (Mid-Air Hand Switch / Double Clutch)
                    </span>
                    <span className="text-[10px] text-zinc-400 leading-tight block">
                      Ajuste acrobático en el punto más alto del salto para esquivar bloqueo defensivo.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={midAirSwitchDone}
                  onChange={(e) => setMidAirSwitchDone(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 ml-2"
                />
              </label>

              {/* Inputs Métricos: Salto Vertical y Longitud */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d]">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-zinc-400 font-bold block">Salto Vertical Estático (cm):</label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Meta: +60cm</span>
                  </div>
                  <input
                    type="number"
                    value={verticalJumpCm}
                    onChange={(e) => setVerticalJumpCm(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#0b0e15] border border-[#32353d] rounded-lg font-mono font-black text-white text-base"
                    placeholder="64"
                  />
                </div>

                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d]">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-zinc-400 font-bold block">Salto de Longitud Horizontal (cm):</label>
                    <span className="text-[10px] text-sky-400 font-mono font-bold">Potencia horizontal</span>
                  </div>
                  <input
                    type="number"
                    value={broadJumpCm}
                    onChange={(e) => setBroadJumpCm(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#0b0e15] border border-[#32353d] rounded-lg font-mono font-black text-white text-base"
                    placeholder="195"
                  />
                </div>
              </div>

              {/* Switch Drill Tablero */}
              <label className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer text-xs ${
                boardDrillDone 
                  ? "bg-orange-950/25 border-orange-500/50 shadow-md shadow-orange-500/10" 
                  : "bg-[#0b0e15] border-[#32353d] opacity-75"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    boardDrillDone ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-white font-bold block text-xs">
                      Drill Tablero: Lanzar balón, captura en el punto máximo de suspensión y tiro inmediato
                    </span>
                    <span className="text-[10px] text-zinc-400 leading-tight block">
                      Amortiguación elástica y coordinación en rebote ofensivo antes de tocar el suelo.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={boardDrillDone}
                  onChange={(e) => setBoardDrillDone(e.target.checked)}
                  className="w-5 h-5 accent-orange-500 ml-2"
                />
              </label>

              {midAirSwitchDone && verticalJumpCm >= 60 && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>🔥 <strong>¡Medalla Gravedad Cero Concedida!</strong> Cambio de manos + Salto vertical &gt;=60cm alcanzado.</span>
                </div>
              )}
            </div>

            {/* 5. VELOCIDAD DE DESPLAZAMIENTO Y LÍNEAS DEFENSIVAS */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-[#f66018]" /> Velocidad de Desplazamiento y Líneas Defensivas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d]">
                  <label className="text-zinc-400 font-bold block mb-1">Sprint 100m (00.00s):</label>
                  <input
                    type="text"
                    value={sprint100m}
                    onChange={(e) => setSprint100m(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0e15] border border-[#32353d] rounded-lg font-mono font-bold text-white text-center text-base"
                    placeholder="14.20"
                  />
                </div>

                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d]">
                  <label className="text-zinc-400 font-bold block mb-1">Línea Solo Ida (00.00s):</label>
                  <input
                    type="text"
                    value={linesOneWay}
                    onChange={(e) => setLinesOneWay(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0e15] border border-[#32353d] rounded-lg font-mono font-bold text-[#7bd0ff] text-center text-base"
                    placeholder="11.50"
                  />
                </div>

                <div className="bg-[#1d2027] p-3.5 rounded-xl border border-[#32353d]">
                  <label className="text-zinc-400 font-bold block mb-1">Línea Ida y Vuelta (00.00s):</label>
                  <input
                    type="text"
                    value={linesRoundTrip}
                    onChange={(e) => setLinesRoundTrip(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0b0e15] border border-[#32353d] rounded-lg font-mono font-bold text-[#ffb599] text-center text-base"
                    placeholder="24.10"
                  />
                </div>
              </div>

              {/* VERIFICACIÓN TOQUE DE PISO DEFENSIVO CON DOS MANOS */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b0e15] border border-[#32353d] cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#4ae176]" />
                  <div>
                    <span className="text-white font-bold block">Verificación de Toque de Piso Defensivo</span>
                    <span className="text-[10px] text-zinc-400">El atleta toca la duela/cancha con ambas manos en cada línea antes de girar.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={defensiveTwoHands}
                  onChange={(e) => setDefensiveTwoHands(e.target.checked)}
                  className="w-4 h-4 accent-[#4ae176]"
                />
              </label>
            </div>

            {/* 6. BATERÍA TRADICIONAL COMPLEMENTARIA (TIROS LIBRES & MEDIA DISTANCIA) */}
            <div className="bg-[#191b23] border border-[#272a32] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#272a32] gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#7bd0ff]" /> Tiros Libres y Media Distancia Complementarios
                  </h3>
                  <span className="text-[10px] text-zinc-400">Pruebas estandarizadas adicionales para evaluación formativa.</span>
                </div>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0b0e15] border border-[#32353d]">
                  <button
                    type="button"
                    onClick={() => setShootingBase(5)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      shootingBase === 5 ? "bg-[#00a6e0] text-white shadow" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Base 5
                  </button>
                  <button
                    type="button"
                    onClick={() => setShootingBase(10)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      shootingBase === 10 ? "bg-[#00a6e0] text-white shadow" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Base 10
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
                {/* Tiro Libre */}
                <div className="bg-[#1d2027] p-3 rounded-xl border border-[#32353d]">
                  <span className="text-zinc-400 block mb-1 font-bold">Tiro Libre</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={ftMade}
                    onChange={(e) => setFtMade(Number(e.target.value))}
                    className="w-16 h-10 bg-[#0b0e15] border border-[#32353d] rounded-xl text-center font-black text-lg text-[#4ae176] mx-auto font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">de {shootingBase} intentos</span>
                </div>

                {/* Media Distancia */}
                <div className="bg-[#1d2027] p-3 rounded-xl border border-[#32353d]">
                  <span className="text-zinc-400 block mb-1 font-bold">Media Distancia</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={midMade}
                    onChange={(e) => setMidMade(Number(e.target.value))}
                    className="w-16 h-10 bg-[#0b0e15] border border-[#32353d] rounded-xl text-center font-black text-lg text-[#7bd0ff] mx-auto font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">de {shootingBase} intentos</span>
                </div>

                {/* Media Cancha */}
                <div className="bg-[#1d2027] p-3 rounded-xl border border-[#32353d] col-span-2 sm:col-span-1">
                  <span className="text-zinc-400 block mb-1 font-bold">Media Cancha</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={halfMade}
                    onChange={(e) => setHalfMade(Number(e.target.value))}
                    className="w-16 h-10 bg-[#0b0e15] border border-[#32353d] rounded-xl text-center font-black text-lg text-purple-400 mx-auto font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">de {shootingBase} intentos</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* FEEDBACK DEL HEAD COACH */}
        <div>
          <label className="text-xs font-bold text-[#e2bfb2] uppercase block mb-1.5">
            Observaciones Técnicas y Diagnóstico del Coach:
          </label>
          <textarea
            rows={2}
            value={basketNotes}
            onChange={(e) => setBasketNotes(e.target.value)}
            className="w-full p-3.5 bg-[#191b23] border border-[#272a32] rounded-xl text-xs text-white outline-none focus:border-[#7bd0ff] transition resize-none leading-relaxed"
            placeholder="Anotar recomendaciones biomecánicas, postura defensiva, descanso o correcciones..."
          />
        </div>

        {/* BOTÓN DE PUBLICACIÓN */}
        <button
          type="submit"
          disabled={saving || !selectedStudentId}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#f66018] via-amber-500 to-[#00a6e0] text-black font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition shadow-2xl cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-5 h-5 fill-black" />
          <span>
            {saving
              ? "Guardando en Supabase..."
              : activeTab === "dia1"
              ? "Guardar Línea Base (Día 1) del Atleta"
              : activeTab === "fisico"
              ? "Guardar Sesión de Preparación Física & Calistenia"
              : "Guardar Pruebas Técnicas de Baloncesto"}
          </span>
        </button>

        {/* TOAST CONFIRMACIÓN */}
        {feedbackSuccess && (
          <div className="p-4 rounded-xl bg-[#4ae176]/20 text-[#4ae176] text-xs font-bold text-center border border-[#4ae176]/30 animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

      </form>
    </div>
  );
}
