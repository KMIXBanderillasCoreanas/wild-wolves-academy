"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [commitment, setCommitment] = useState<any>(null);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 15, goal: 16, percentage: 94 });
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // ESTADOS DE LÍNEA BASE (DÍA 1 / LLEGADA)
  // ==========================================
  const [baseline, setBaseline] = useState<any>({
    entry_date: "12 Septiembre 2026",
    initial_laps_completed: 2,
    initial_jump_rope_max: 25,
    initial_pushups_form: "hincado",
    initial_squats_count: 12,
    initial_posture_notes: "Llegó con fatiga prematura tras trotar 2 vueltas. Postura encorvada.",
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
    free_throws_made: 4,
    shooting_base_attempts: 5,
    sprint_100m_seconds: 13.8,
    lines_round_trip_seconds: 24.1,
    vertical_jump_cm: 65,
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

        // 1. Cargar datos locales de línea base y logs si existen
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
                  court_laps_done: latestP.court_laps_done || prev.court_laps_done,
                  jogging_minutes: latestP.jogging_minutes || prev.jogging_minutes,
                  jump_rope_count: latestP.jump_rope_count || prev.jump_rope_count,
                  pushups_reps: latestP.pushups_reps || prev.pushups_reps,
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
                  free_throws_made: latestB.free_throws_made || prev.free_throws_made,
                  shooting_base_attempts: latestB.shooting_base_attempts || prev.shooting_base_attempts,
                  vertical_jump_cm: latestB.vertical_jump_cm || prev.vertical_jump_cm,
                  sprint_100m_seconds: latestB.sprint_100m_seconds || prev.sprint_100m_seconds,
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
            pushups_reps: physicalData?.pushups_reps ?? prev.pushups_reps,
            free_throws_made: basketData?.free_throws_made ?? prev.free_throws_made,
            shooting_base_attempts: basketData?.shooting_base_attempts ?? prev.shooting_base_attempts,
            vertical_jump_cm: basketData?.vertical_jump_cm ?? prev.vertical_jump_cm,
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
          court_laps_done: e.detail.court_laps_done || prev.court_laps_done,
          jogging_minutes: e.detail.jogging_minutes || prev.jogging_minutes,
          jump_rope_count: e.detail.jump_rope_count || prev.jump_rope_count,
          pushups_reps: e.detail.pushups_reps || prev.pushups_reps,
          isReal: true
        }));
      }
    };
    const handleBasketUpdate = (e: any) => {
      if (e.detail) {
        setCurrentPerformance((prev: any) => ({
          ...prev,
          free_throws_made: e.detail.free_throws_made || prev.free_throws_made,
          shooting_base_attempts: e.detail.shooting_base_attempts || prev.shooting_base_attempts,
          vertical_jump_cm: e.detail.vertical_jump_cm || prev.vertical_jump_cm,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-xs text-secondary font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span>Cargando Telemetría Cyber Wolves...</span>
        </div>
      </div>
    );
  }

  // Cálculos de Δ Rendimiento
  const deltaLaps = Math.max(0, currentPerformance.court_laps_done - baseline.initial_laps_completed);
  const lapsIncreasePct = baseline.initial_laps_completed > 0 ? Math.round((deltaLaps / baseline.initial_laps_completed) * 100) : 500;
  
  const deltaRope = Math.max(0, currentPerformance.jump_rope_count - baseline.initial_jump_rope_max);
  const ropeIncreasePct = baseline.initial_jump_rope_max > 0 ? Math.round((deltaRope / baseline.initial_jump_rope_max) * 100) : 1300;

  const currentShootingPct = Math.round((currentPerformance.free_throws_made / (currentPerformance.shooting_base_attempts || 5)) * 100);

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col pb-24 selection:bg-primary-container selection:text-on-primary">
      
      {/* HEADER NAVEGACIÓN */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container">
        <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">sports_basketball</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface uppercase tracking-tight">Portal Atleta</span>
              <span className="text-[10px] text-secondary tracking-wider uppercase font-mono">Wwolves CDMX</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant block font-mono">#11 MORALES</span>
              <span className="text-[10px] text-primary font-bold">ACTIVO</span>
            </div>
            <button 
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 space-y-4">
        
        {/* 1. HERO: CYBER WOLVES ELITE PLAYER CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-5 border border-surface-container-high shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-container via-secondary to-primary-container"></div>
          
          <div className="flex items-center justify-between text-[10px] font-mono text-secondary mb-3.5">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              CYBER WOLVES // ELITE #11
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono font-black text-[10px] border border-primary-container/30">
                OVR {evaluation.overall_ovr}
              </span>
              <span className="bg-surface-container px-2.5 py-0.5 rounded text-on-surface-variant font-bold">
                #CARD-8841-CDMX
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Holographic Avatar Box */}
            <div className="relative shrink-0 w-24 h-28 rounded-2xl overflow-hidden bg-surface-container-highest border border-secondary/40 shadow-[0_0_20px_rgba(123,208,255,0.25)]">
              <img 
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80" 
                alt="Player Card"
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
              <span className="absolute bottom-1 right-1 text-[10px] font-black text-on-primary bg-primary-container px-1.5 py-0.5 rounded">#11</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-on-surface truncate tracking-tight">{profile?.full_name || "Santiago Morales"}</h1>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Atleta Formativo • Dep. Carmen Serdán
              </p>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary shadow-sm">
                  JERSEY #11
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary uppercase border border-secondary/30">
                  GUARD (SG)
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary uppercase border border-tertiary/20">
                  Nivel Formativo
                </span>
              </div>
            </div>
          </div>

          {/* Días y Horarios */}
          <div className="grid grid-cols-1 gap-1.5 mt-4">
            <div className="flex items-center gap-2 bg-surface-container-high/80 px-3.5 py-2.5 rounded-xl text-xs">
              <span className="material-symbols-outlined text-secondary text-base">calendar_month</span>
              <span className="font-medium">Días: {commitment?.days_selected?.join(", ") || "Lunes, Miércoles, Viernes"}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high/80 px-3.5 py-2.5 rounded-xl text-xs">
              <span className="material-symbols-outlined text-primary text-base">schedule</span>
              <span className="font-medium">Horario: {commitment?.shift === "matutino_9_11" ? "Matutino (09:00 - 11:00)" : "Vespertino (17:00 - 19:00)"}</span>
            </div>
          </div>

          {/* Métrica de Asistencia y Disciplina */}
          <div className="bg-surface-container p-3.5 rounded-2xl mt-3 flex flex-col gap-2 border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                {attendanceStats.percentage}% Asistencia
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
        {/* 2. EVOLUCIÓN TEMPORAL: DÍA 1 (LLEGADA) VS. HOY (Δ RENDIMIENTO)             */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-lg">trending_up</span>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">
                  Evolución Temporal: Día 1 vs. Semana Actual
                </h2>
              </div>
              <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                Δ Rendimiento = Registro Semana Actual − Línea Base Día 1
              </p>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
              Seguimiento Activo
            </span>
          </div>

          {/* TARJETAS COMPARATIVAS DÍA 1 VS ACTUAL */}
          <div className="space-y-3">
            
            {/* COMPARATIVA 1: VUELTAS A LA CANCHA */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">directions_run</span>
                  Vueltas Continuas a la Cancha
                </span>
                <span className="text-primary font-mono text-[11px] font-black bg-primary-container/20 px-2 py-0.5 rounded-md border border-primary-container/30">
                  +{lapsIncreasePct}% (Δ +{deltaLaps} vueltas)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Llegada):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    {baseline.initial_laps_completed} vueltas
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Fatiga prematura</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-primary font-mono font-black text-sm">
                    {currentPerformance.court_laps_done} vueltas continuas
                  </span>
                  <span className="text-[9px] text-primary block mt-0.5">Trote de 25 min</span>
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
                    {baseline.initial_jump_rope_max} saltos
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">A pies juntos con tropiezos</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-tertiary font-mono font-black text-sm">
                    {currentPerformance.jump_rope_count} saltos
                  </span>
                  <span className="text-[9px] text-tertiary block mt-0.5">Protocolo 50-25-25</span>
                </div>
              </div>
            </div>

            {/* COMPARATIVA 3: TIRO Y PRECISIÓN */}
            <div className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">sports_basketball</span>
                  Eficacia de Tiro Libre
                </span>
                <span className="text-secondary font-mono text-[11px] font-black bg-secondary-container/20 px-2 py-0.5 rounded-md border border-secondary/30">
                  {currentShootingPct}% de Acierto
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Día 1 (Mecánica Inicial):</span>
                  <span className="text-amber-400 font-mono font-black text-sm">
                    1 / 5 tiros (20%)
                  </span>
                  <span className="text-[9px] text-outline block mt-0.5">Desviación de codo</span>
                </div>
                <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container">
                  <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Semana Actual:</span>
                  <span className="text-secondary font-mono font-black text-sm">
                    {currentPerformance.free_throws_made} / {currentPerformance.shooting_base_attempts || 5} aciertos ({currentShootingPct}%)
                  </span>
                  <span className="text-[9px] text-secondary block mt-0.5">Mecánica fija en suspensión</span>
                </div>
              </div>
            </div>

          </div>

          {/* TIMELINE DE PROGRESIÓN NARRATIVA */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Ruta de Sobrecarga Progresiva:
            </span>
            <p className="text-on-surface font-mono text-[11px] leading-relaxed">
              "Día 1: {baseline.initial_laps_completed} vueltas a la cancha → Semana 4: 12 vueltas continuas → Mes 3: 25 minutos continuos sin detenerse."
            </p>
          </div>
        </section>

        {/* 3. ESTATUS FINANCIERO */}
        <section className="bg-surface-container-low rounded-3xl p-5 border border-surface-container-high shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-lg">health_and_safety</span>
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
              <span>Descargar Comprobante Digital #8841</span>
            </button>
          </div>
        </section>

        {/* 4. TEST DAY BIOMECÁNICO */}
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
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary-container to-surface-variant text-on-primary flex items-center justify-center text-xl font-black shadow-md shadow-primary-container/30">
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

      {/* TOAST FLOTANTE */}
      <div className={`fixed bottom-8 inset-x-4 max-w-lg mx-auto z-50 bg-surface-container-highest text-on-surface p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 border border-surface-container ${
        toastVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}>
        <span className="material-symbols-outlined text-tertiary text-2xl">task_alt</span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-on-surface truncate">Comprobante Digital Generado</span>
          <span className="text-[10px] text-on-surface-variant truncate">Recibo #REC-8841 enviado al correo registrado.</span>
        </div>
      </div>

    </div>
  );
}
