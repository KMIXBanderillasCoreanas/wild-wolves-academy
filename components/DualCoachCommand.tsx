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
  Award
} from "lucide-react";
import { enqueueOfflineAction, getOfflineQueueCount } from "@/lib/offlineSync";

export default function DualCoachCommand() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dia1" | "fisico" | "baloncesto">("dia1");

  // ==========================================
  // 1. ESTADOS DÍA 1 (LÍNEA BASE / ENTRADA)
  // ==========================================
  const [entryLaps, setEntryLaps] = useState<number>(2);
  const [entryRope, setEntryRope] = useState<number>(25);
  const [entryPushupsForm, setEntryPushupsForm] = useState<string>("hincado");
  const [entrySquats, setEntrySquats] = useState<number>(12);
  const [entryNotes, setEntryNotes] = useState<string>(
    "Primer día: fatiga rápida tras trotar 2 vueltas continuas. Postura encorvada. Requiere adaptación progresiva sin impacto articular."
  );
  const [hasExistingBaseline, setHasExistingBaseline] = useState<boolean>(false);

  // ==========================================
  // 2. ESTADOS MÓDULO A: PREPARACIÓN FÍSICA
  // ==========================================
  // Interruptores táctiles del Coach (Toggles ON/OFF)
  const [enableLaps, setEnableLaps] = useState<boolean>(true);
  const [enableJumpRope, setEnableJumpRope] = useState<boolean>(true);
  const [enablePushups, setEnablePushups] = useState<boolean>(true);
  const [enable3x25, setEnable3x25] = useState<boolean>(true);
  const [enableIsometrics, setEnableIsometrics] = useState<boolean>(false);
  const [enableLunges, setEnableLunges] = useState<boolean>(false);

  // Métricas Físicas
  const [lapsDone, setLapsDone] = useState<number>(6);
  const [joggingMin, setJoggingMin] = useState<number>(12);
  const [ropeCount, setRopeCount] = useState<number>(150);
  const [pushupVariation, setPushupVariation] = useState<string>("brazos_cerrados");
  const [pushupReps, setPushupReps] = useState<number>(15);
  const [squats3x25, setSquats3x25] = useState<boolean>(true);
  const [abs3x25, setAbs3x25] = useState<boolean>(true);
  const [wallSitSec, setWallSitSec] = useState<number>(60);
  const [plankSec, setPlankSec] = useState<number>(45);
  const [lungesLaps, setLungesLaps] = useState<number>(2);
  const [hasAnkleWeights, setHasAnkleWeights] = useState<boolean>(false);

  // ==========================================
  // 3. ESTADOS MÓDULO B: TÉCNICA DE BALONCESTO
  // ==========================================
  // Interruptores del Coach
  const [enableShooting, setEnableShooting] = useState<boolean>(true);
  const [enableSpeedLines, setEnableSpeedLines] = useState<boolean>(true);
  const [enableFlight, setEnableFlight] = useState<boolean>(true);

  // Métricas Baloncesto
  const [shootingBase, setShootingBase] = useState<5 | 10>(5);
  const [ftMade, setFtMade] = useState<number>(3);
  const [midMade, setMidMade] = useState<number>(2);
  const [threeMade, setThreeMade] = useState<number>(1);
  const [halfMade, setHalfMade] = useState<number>(0);
  const [sprint100m, setSprint100m] = useState<number>(14.8);
  const [linesOneWay, setLinesOneWay] = useState<number>(11.5);
  const [linesRoundTrip, setLinesRoundTrip] = useState<number>(24.2);
  const [defensiveTouch, setDefensiveTouch] = useState<boolean>(true);
  const [verticalJumpCm, setVerticalJumpCm] = useState<number>(62);
  const [broadJumpCm, setBroadJumpCm] = useState<number>(195);
  const [boardDrillDone, setBoardDrillDone] = useState<boolean>(true);
  const [basketNotes, setBasketNotes] = useState<string>(
    "Excelente salto al tablero en suspensión. Buen ritmo en líneas defensivas ida y vuelta."
  );

  // Estados de control
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Carga de atletas
  const loadStudentsAndBaseline = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("role", "student");

        if (profiles && profiles.length > 0) {
          setStudents(profiles);
          const currentId = selectedStudentId || profiles[0].id;
          setSelectedStudentId(currentId);
          await loadBaselineForStudent(currentId);
          return;
        }
      }

      // Fallback a HoopStore
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
        const defaultList = [
          { id: "ww_santiago_11", full_name: "Santiago Morales", email: "santiago@wildwolves.mx" },
          { id: "ww_mateo_07", full_name: "Mateo Hernández", email: "mateo@wildwolves.mx" },
          { id: "ww_diego_23", full_name: "Diego Ramírez", email: "diego@wildwolves.mx" }
        ];
        setStudents(defaultList);
        setSelectedStudentId(defaultList[0].id);
        loadBaselineForStudent(defaultList[0].id);
      }
    } catch (err) {
      console.warn("Fallo cargando alumnos en DualCoachCommand:", err);
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
          return;
        }
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
          return;
        }
      }

      setHasExistingBaseline(false);
    } catch (e) {
      console.warn("Fallo cargando baseline:", e);
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
      // CASO 1: DIAGNÓSTICO DÍA 1 (LÍNEA BASE)
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

        // Respaldo local
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
        setFeedbackSuccess("¡Línea base del Día 1 guardada! Se utilizará para calcular el Δ de rendimiento.");
      }

      // ----------------------------------------------------
      // CASO 2: PREPARACIÓN FÍSICA MODULAR
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
          squats_3x25_done: enable3x25 ? squats3x25 : false,
          abs_3x25_done: enable3x25 ? abs3x25 : false,
          wall_sit_seconds: enableIsometrics ? wallSitSec : 0,
          plank_seconds: enableIsometrics ? plankSec : 0,
          lunges_laps: enableLunges ? lungesLaps : 0,
          has_ankle_weights: hasAnkleWeights
        };

        // Respaldo local
        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("ww_physical_logs") || "{}");
          if (!stored[selectedStudentId]) stored[selectedStudentId] = [];
          stored[selectedStudentId].unshift(physicalPayload);
          localStorage.setItem("ww_physical_logs", JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent("physical_training_logged", { detail: physicalPayload }));
        }

        if (navigator.onLine) {
          await supabase.from("physical_training_logs").insert(physicalPayload);
        } else {
          enqueueOfflineAction("PHYSICAL_LOG", physicalPayload);
        }

        setFeedbackSuccess("¡Sesión de Preparación Física registrada exitosamente en el expediente!");
      }

      // ----------------------------------------------------
      // CASO 3: TÉCNICA DE BALONCESTO
      // ----------------------------------------------------
      else if (activeTab === "baloncesto") {
        const basketballPayload = {
          student_id: selectedStudentId,
          coach_id: coachId,
          test_date: todayDate,
          is_shooting_active: enableShooting,
          is_speed_lines_active: enableSpeedLines,
          is_flight_active: enableFlight,
          shooting_base_attempts: shootingBase,
          free_throws_made: enableShooting ? ftMade : 0,
          mid_range_made: enableShooting ? midMade : 0,
          three_point_made: enableShooting ? threeMade : 0,
          half_court_made: enableShooting ? halfMade : 0,
          sprint_100m_seconds: enableSpeedLines ? sprint100m : null,
          lines_one_way_seconds: enableSpeedLines ? linesOneWay : null,
          lines_round_trip_seconds: enableSpeedLines ? linesRoundTrip : null,
          defensive_touch_verified: defensiveTouch,
          vertical_jump_cm: enableFlight ? verticalJumpCm : null,
          broad_jump_cm: enableFlight ? broadJumpCm : null,
          board_rebound_drill_done: boardDrillDone,
          coach_notes: basketNotes
        };

        // Respaldo local
        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("ww_basketball_logs") || "{}");
          if (!stored[selectedStudentId]) stored[selectedStudentId] = [];
          stored[selectedStudentId].unshift(basketballPayload);
          localStorage.setItem("ww_basketball_logs", JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent("basketball_skills_logged", { detail: basketballPayload }));
        }

        if (navigator.onLine) {
          await supabase.from("basketball_skills_logs").insert(basketballPayload);
        } else {
          enqueueOfflineAction("BASKETBALL_LOG", basketballPayload);
        }

        setFeedbackSuccess("¡Pruebas Técnicas de Baloncesto registradas y publicadas!");
      }

      setTimeout(() => setFeedbackSuccess(null), 4500);
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="w-full bg-surface-container-low border border-surface-container rounded-3xl p-5 sm:p-7 text-on-surface shadow-2xl transition-all">
      
      {/* 1. HEADER DE COMANDO DUAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-surface-container gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-primary-container/20 text-primary border border-primary-container/30 px-3 py-1 rounded-full font-bold">
              Wild Wolves CDMX • Sede Carmen Serdán
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase bg-surface-container text-secondary border border-secondary/20 px-2.5 py-1 rounded-full font-bold">
              Arquitectura Dual de Entrenamiento
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-2 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-primary-container" />
            <span>Control Táctico Dual: Físico vs. Baloncesto</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Separación estricta de dominios con línea base del Día 1 e interruptores ON/OFF por sesión.
          </p>
        </div>

        {/* SELECTOR DE ATLETA */}
        <div className="w-full lg:w-80 shrink-0">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold block mb-1.5">
            Atleta a Evaluar en Cancha:
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 bg-surface-container border border-surface-container-high rounded-xl text-xs font-bold text-white outline-none focus:border-secondary transition cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121724] text-white">
                  {s.full_name} ({s.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. PESTAÑAS PRINCIPALES DEL SISTEMA DUAL */}
      <div className="flex flex-wrap gap-2.5 my-6 border-b border-surface-container pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("dia1")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "dia1"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-102"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high/50"
          }`}
        >
          <UserCheck className="w-4 h-4" /> 1. Diagnóstico Día 1 (Llegada)
          {hasExistingBaseline && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" title="Línea base registrada" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fisico")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "fisico"
              ? "bg-primary-container text-on-primary shadow-lg shadow-primary-container/30 scale-102"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high/50"
          }`}
        >
          <Activity className="w-4 h-4" /> 2. Preparación Física (Motor Biológico)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("baloncesto")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
            activeTab === "baloncesto"
              ? "bg-secondary-container text-on-secondary-container shadow-lg shadow-secondary-container/30 scale-102"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high/50"
          }`}
        >
          <Target className="w-4 h-4" /> 3. Técnica de Baloncesto (Fundamentos)
        </button>
      </div>

      <form onSubmit={handleSaveData} className="space-y-6">

        {/* ========================================================================= */}
        {/* VISTA 1: DIAGNÓSTICO DÍA 1 (LÍNEA BASE / ENTRADA)                         */}
        {/* ========================================================================= */}
        {activeTab === "dia1" && (
          <div className="bg-surface-container/60 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-container gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> Foto Inicial del Atleta (¿Cómo llegó al club?)
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Registra el punto de partida real del alumno para calcular la gráfica de evolución: Δ Rendimiento = Registro Actual - Día 1.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto font-bold">
                {hasExistingBaseline ? "LÍNEA BASE YA REGISTRADA" : "PENDIENTE DE CAPTURA"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vueltas Soportadas */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase block mb-1">
                  Vueltas Iniciales (antes de parar):
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={entryLaps}
                  onChange={(e) => setEntryLaps(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-container-high rounded-xl text-base font-black text-amber-400"
                  placeholder="Ej. 2"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Trote continuo soportado</span>
              </div>

              {/* Saltos de Cuerda Máximos */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase block mb-1">
                  Saltos Continuos de Cuerda:
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={entryRope}
                  onChange={(e) => setEntryRope(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-container-high rounded-xl text-base font-black text-amber-400"
                  placeholder="Ej. 25"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Sin tropezar a pies juntos</span>
              </div>

              {/* Forma de Lagartija */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase block mb-1">
                  Forma Inicial de Flexión:
                </label>
                <select
                  value={entryPushupsForm}
                  onChange={(e) => setEntryPushupsForm(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-bold text-white outline-none"
                >
                  <option value="hincado">1. Con apoyo hincado / rodillas</option>
                  <option value="inclinada">2. Inclinada en barra / banca</option>
                  <option value="brazos_cerrados">3. En suelo (Brazos cerrados)</option>
                  <option value="completa">4. Completa estricta</option>
                </select>
                <span className="text-[10px] text-on-surface-variant mt-1 block">Nivel de fuerza en empuje</span>
              </div>

              {/* Sentadillas Iniciales */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase block mb-1">
                  Sentadillas al Aire Iniciales:
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={entrySquats}
                  onChange={(e) => setEntrySquats(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-container-high rounded-xl text-base font-black text-amber-400"
                  placeholder="Ej. 12"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Espalda neutral y control</span>
              </div>
            </div>

            {/* Notas Biomecánicas de Llegada */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1.5">
                Diagnóstico Postural y Biomecánico de Entrada:
              </label>
              <textarea
                rows={3}
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                className="w-full p-3.5 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-white outline-none focus:border-amber-500 transition resize-none leading-relaxed"
                placeholder="Anotar si se encorva, si mete rodillas (valgo), si le falta flexibilidad o si se fatiga prematuramente..."
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: MÓDULO A - PREPARACIÓN FÍSICA & MOTOR BIOLÓGICO                  */}
        {/* ========================================================================= */}
        {activeTab === "fisico" && (
          <div className="space-y-5 animate-fade-in">
            {/* INTERRUPTORES TÁCTILES DEL COACH */}
            <div className="bg-surface-container/80 border border-surface-container-high p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-container" />
                <span>Interruptores de Sesión (Activar qué entrena hoy):</span>
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEnableLaps(!enableLaps)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableLaps ? "bg-primary-container/30 border-primary-container text-primary" : "bg-surface-container border-transparent text-outline"
                  }`}
                >
                  {enableLaps ? "✓ Vueltas/Trote ON" : "Vueltas OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnableJumpRope(!enableJumpRope)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableJumpRope ? "bg-primary-container/30 border-primary-container text-primary" : "bg-surface-container border-transparent text-outline"
                  }`}
                >
                  {enableJumpRope ? "✓ Cuerda ON" : "Cuerda OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnablePushups(!enablePushups)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enablePushups ? "bg-primary-container/30 border-primary-container text-primary" : "bg-surface-container border-transparent text-outline"
                  }`}
                >
                  {enablePushups ? "✓ Lagartijas ON" : "Lagartijas OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnable3x25(!enable3x25)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enable3x25 ? "bg-primary-container/30 border-primary-container text-primary" : "bg-surface-container border-transparent text-outline"
                  }`}
                >
                  {enable3x25 ? "✓ Batería 3x25 ON" : "3x25 OFF"}
                </button>

                <button
                  type="button"
                  onClick={() => setEnableIsometrics(!enableIsometrics)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    enableIsometrics ? "bg-primary-container/30 border-primary-container text-primary" : "bg-surface-container border-transparent text-outline"
                  }`}
                >
                  {enableIsometrics ? "✓ Isometría ON" : "Isometría OFF"}
                </button>
              </div>
            </div>

            {/* CAMPOS CONDICIONALES ACTIVOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* 1. Vueltas a la cancha */}
              {enableLaps && (
                <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Vueltas a la Cancha Hoy:</span>
                    <span className="font-mono text-base font-black text-primary">{lapsDone} vueltas</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={lapsDone}
                    onChange={(e) => setLapsDone(Number(e.target.value))}
                    className="w-full accent-primary-container cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-surface-container-high">
                    <span>Minutos continuos:</span>
                    <input
                      type="number"
                      value={joggingMin}
                      onChange={(e) => setJoggingMin(Number(e.target.value))}
                      className="w-16 h-8 bg-surface-container-lowest border border-surface-container-high rounded text-center font-bold text-white"
                    />
                  </div>
                </div>
              )}

              {/* 2. Cuerda */}
              {enableJumpRope && (
                <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Saltos de Cuerda:</span>
                    <span className="font-mono text-base font-black text-tertiary">{ropeCount} saltos</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="20"
                    value={ropeCount}
                    onChange={(e) => setRopeCount(Number(e.target.value))}
                    className="w-full accent-tertiary cursor-pointer"
                  />
                  <div className="text-[10px] text-on-surface-variant pt-1 border-t border-surface-container-high">
                    Progresión: 50 a dos pies, 25 pierna izquierda, 25 derecha.
                  </div>
                </div>
              )}

              {/* 3. Lagartijas */}
              {enablePushups && (
                <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high space-y-2">
                  <span className="font-bold text-white block">Fase de Lagartija:</span>
                  <select
                    value={pushupVariation}
                    onChange={(e) => setPushupVariation(e.target.value)}
                    className="w-full h-9 px-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-xs font-bold text-white outline-none"
                  >
                    <option value="hincado">1. Con apoyo hincado / rodillas</option>
                    <option value="brazos_cerrados">2. Brazos cerrados (tríceps)</option>
                    <option value="brazos_abiertos">3. Brazos abiertos (pectoral)</option>
                    <option value="pie_sobre_pie">4. Pie sobre pie alternado</option>
                  </select>
                  <div className="flex justify-between items-center pt-1 text-[11px] text-on-surface-variant">
                    <span>Repeticiones logradas:</span>
                    <input
                      type="number"
                      value={pushupReps}
                      onChange={(e) => setPushupReps(Number(e.target.value))}
                      className="w-16 h-8 bg-surface-container-lowest border border-surface-container-high rounded text-center font-bold text-white"
                    />
                  </div>
                </div>
              )}

              {/* 4. Batería 3x25 */}
              {enable3x25 && (
                <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high space-y-2.5">
                  <span className="font-bold text-white block">Batería de Autocarga 3x25:</span>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-surface-container-lowest">
                    <span className="text-xs text-on-surface">Sentadillas (3 series de 25)</span>
                    <input
                      type="checkbox"
                      checked={squats3x25}
                      onChange={(e) => setSquats3x25(e.target.checked)}
                      className="w-4 h-4 accent-primary-container"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-surface-container-lowest">
                    <span className="text-xs text-on-surface">Abdominales (3 series de 25)</span>
                    <input
                      type="checkbox"
                      checked={abs3x25}
                      onChange={(e) => setAbs3x25(e.target.checked)}
                      className="w-4 h-4 accent-primary-container"
                    />
                  </label>
                </div>
              )}

              {/* 5. Isometría */}
              {enableIsometrics && (
                <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-high space-y-2">
                  <span className="font-bold text-white block">Isometría Postural:</span>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-on-surface-variant">Silla en pared:</span>
                    <span className="font-mono font-bold text-white">{wallSitSec} seg</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={wallSitSec}
                    onChange={(e) => setWallSitSec(Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-on-surface-variant">Plancha isométrica:</span>
                    <span className="font-mono font-bold text-white">{plankSec} seg</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={plankSec}
                    onChange={(e) => setPlankSec(Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer"
                  />
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: MÓDULO B - TÉCNICA DE BALONCESTO (FUNDAMENTOS)                   */}
        {/* ========================================================================= */}
        {activeTab === "baloncesto" && (
          <div className="space-y-5 animate-fade-in">
            {/* BATERÍA DE TIRO ESCALONADO (5 vs 10 TIROS) */}
            <div className="bg-surface-container/80 border border-surface-container-high rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-container gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-secondary flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" /> Batería de Tiro Escalonado
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Fase inicial de 5 tiros por zona, escalando a 10 tiros con suspensión.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-lowest border border-surface-container-high self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShootingBase(5)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      shootingBase === 5 ? "bg-secondary text-on-secondary shadow" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Fase 5 Tiros
                  </button>
                  <button
                    type="button"
                    onClick={() => setShootingBase(10)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      shootingBase === 10 ? "bg-secondary text-on-secondary shadow" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Fase 10 Tiros
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                {/* Tiro Libre */}
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <span className="text-on-surface-variant block mb-1 font-bold">Tiro Libre</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={ftMade}
                    onChange={(e) => setFtMade(Number(e.target.value))}
                    className="w-16 h-10 bg-surface-container-lowest border border-surface-container-high rounded-xl text-center font-black text-lg text-tertiary mx-auto"
                  />
                  <span className="text-[10px] text-outline mt-1 block">de {shootingBase} intentos</span>
                </div>

                {/* Media Distancia */}
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <span className="text-on-surface-variant block mb-1 font-bold">Media Distancia</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={midMade}
                    onChange={(e) => setMidMade(Number(e.target.value))}
                    className="w-16 h-10 bg-surface-container-lowest border border-surface-container-high rounded-xl text-center font-black text-lg text-secondary mx-auto"
                  />
                  <span className="text-[10px] text-outline mt-1 block">de {shootingBase} intentos</span>
                </div>

                {/* Triples */}
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <span className="text-on-surface-variant block mb-1 font-bold">Triples</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={threeMade}
                    onChange={(e) => setThreeMade(Number(e.target.value))}
                    className="w-16 h-10 bg-surface-container-lowest border border-surface-container-high rounded-xl text-center font-black text-lg text-primary mx-auto"
                  />
                  <span className="text-[10px] text-outline mt-1 block">de {shootingBase} intentos</span>
                </div>

                {/* Media Cancha */}
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <span className="text-on-surface-variant block mb-1 font-bold">Media Cancha</span>
                  <input
                    type="number"
                    min="0"
                    max={shootingBase}
                    value={halfMade}
                    onChange={(e) => setHalfMade(Number(e.target.value))}
                    className="w-16 h-10 bg-surface-container-lowest border border-surface-container-high rounded-xl text-center font-black text-lg text-purple-400 mx-auto"
                  />
                  <span className="text-[10px] text-outline mt-1 block">de {shootingBase} intentos</span>
                </div>
              </div>
            </div>

            {/* VELOCIDAD Y LÍNEAS DEFENSIVAS */}
            <div className="bg-surface-container/80 border border-surface-container-high rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary-container" /> Velocidad de Desplazamiento y Líneas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <label className="text-on-surface-variant font-bold block mb-1">Sprint 100m Planos (s):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sprint100m}
                    onChange={(e) => setSprint100m(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-white"
                  />
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <label className="text-on-surface-variant font-bold block mb-1">Línea: Solo Ida (s):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={linesOneWay}
                    onChange={(e) => setLinesOneWay(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-secondary"
                  />
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <label className="text-on-surface-variant font-bold block mb-1">Línea: Ida y Vuelta (s):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={linesRoundTrip}
                    onChange={(e) => setLinesRoundTrip(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-bold text-primary"
                  />
                </div>
              </div>

              {/* POSTURA DEFENSIVA BAJA TOCANDO PISO */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 cursor-pointer text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-tertiary" />
                  <span className="text-white font-medium">Verificación: Toca el piso con la mano en cada línea (Postura Baja)</span>
                </div>
                <input
                  type="checkbox"
                  checked={defensiveTouch}
                  onChange={(e) => setDefensiveTouch(e.target.checked)}
                  className="w-4 h-4 accent-tertiary"
                />
              </label>
            </div>

            {/* VUELO Y DRILL DE TABLERO */}
            <div className="bg-surface-container/80 border border-surface-container-high rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-tertiary" /> Salto, Vuelo y Drill de Rebote en Tablero
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <label className="text-on-surface-variant font-bold block mb-1">Salto Vertical de Despegue (cm):</label>
                  <input
                    type="number"
                    value={verticalJumpCm}
                    onChange={(e) => setVerticalJumpCm(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-black text-white"
                  />
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high">
                  <label className="text-on-surface-variant font-bold block mb-1">Salto Horizontal de Longitud (cm):</label>
                  <input
                    type="number"
                    value={broadJumpCm}
                    onChange={(e) => setBroadJumpCm(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-container-high rounded-lg font-mono font-black text-white"
                  />
                </div>
              </div>

              {/* DRILL TABLERO */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high cursor-pointer text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-container" />
                  <div>
                    <span className="text-white font-bold block">Drill Tablero: Lanzar, atrapar en lo más alto y encestar</span>
                    <span className="text-[10px] text-on-surface-variant">Evalúa coordinación ojo-mano en el punto más alto del salto.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={boardDrillDone}
                  onChange={(e) => setBoardDrillDone(e.target.checked)}
                  className="w-5 h-5 accent-primary-container"
                />
              </label>
            </div>
          </div>
        )}

        {/* FEEDBACK DEL COACH */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1.5">
            Observaciones y Feedback del Head Coach:
          </label>
          <textarea
            rows={2}
            value={basketNotes}
            onChange={(e) => setBasketNotes(e.target.value)}
            className="w-full p-3.5 bg-surface-container border border-surface-container-high rounded-xl text-xs text-white outline-none focus:border-secondary transition resize-none leading-relaxed"
            placeholder="Anotar recomendaciones técnicas, correcciones de codo o felicitaciones por esfuerzo..."
          />
        </div>

        {/* BOTÓN DE PUBLICACIÓN */}
        <button
          type="submit"
          disabled={saving || !selectedStudentId}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-sky-600 text-black font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition shadow-2xl cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-5 h-5 fill-black" />
          <span>
            {saving
              ? "Guardando en Supabase..."
              : activeTab === "dia1"
              ? "Guardar Línea Base (Día 1) del Atleta"
              : activeTab === "fisico"
              ? "Guardar Sesión de Preparación Física"
              : "Guardar Pruebas Técnicas de Baloncesto"}
          </span>
        </button>

        {/* FEEDBACK TOAST */}
        {feedbackSuccess && (
          <div className="p-4 rounded-xl bg-tertiary/20 text-tertiary text-xs font-bold text-center border border-tertiary/30 animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

      </form>
    </div>
  );
}
