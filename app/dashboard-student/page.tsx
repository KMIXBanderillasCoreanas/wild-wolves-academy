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

  // Estado reactivo de Test Day Dinámico por Nivel
  const [evaluation, setEvaluation] = useState<any>({
    overall_ovr: 81,
    athletic_level_assessed: "formativo_desarrollo",
    court_laps_count: 5,
    squats_count: 15,
    pushups_count: 10,
    plank_seconds: 90,
    jump_rope_count: 200,
    short_range_shots_made: 3,
    jogging_minutes: 18,
    stairs_jumps_count: 8,
    jump_rope_series_count: 250,
    mid_range_shots_made: 6,
    elite_jogging_minutes: 45,
    elite_plank_seconds: 240,
    elite_jump_rope_count: 750,
    plyometric_circuit_minutes: 4,
    three_point_shots_made: 7,
    half_court_shots_made: 1,
    coach_feedback: "Excelente lectura de bloqueo y salida rápida. Enfocar trabajo de pie pivote y amortiguación en drills de cancha.",
    evaluation_date: "Octubre 2026",
    isReal: false
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Cargar Evaluación Local Detallada si existe
        if (typeof window !== "undefined") {
          try {
            const detailedStored = JSON.parse(localStorage.getItem("ww_detailed_test_records") || "{}");
            const keys = Object.keys(detailedStored);
            if (keys.length > 0) {
              const matched = user?.id && detailedStored[user.id] ? detailedStored[user.id] : detailedStored[keys[keys.length - 1]];
              if (matched) {
                setEvaluation((prev: any) => ({
                  ...prev,
                  ...matched,
                  isReal: true
                }));
              }
            }
          } catch (err) {
            console.warn("Fallo leyendo evaluaciones locales:", err);
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
        
        // Consultar primero la tabla detailed_test_records
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
        } else {
          // Fallback a student_evaluations tradicional
          const { data: evalData } = await supabase
            .from("student_evaluations")
            .select("*")
            .eq("student_id", user.id)
            .order("evaluation_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (evalData) {
            setEvaluation((prev: any) => ({
              ...prev,
              overall_ovr: evalData.overall_ovr,
              coach_feedback: evalData.coach_feedback || "Progreso constante en cancha.",
              evaluation_date: evalData.evaluation_date,
              isReal: true
            }));
          }
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

    // Listener reactivo al publicar nueva prueba en la misma sesión
    const handleTestDayUpdate = (e: any) => {
      if (e.detail) {
        setEvaluation((prev: any) => ({
          ...prev,
          ...e.detail,
          isReal: true
        }));
      }
    };

    window.addEventListener("test_day_updated", handleTestDayUpdate);
    return () => {
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

  const level = evaluation.athletic_level_assessed || "formativo_desarrollo";

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
        
        {/* HERO: CYBER WOLVES ELITE PLAYER CARD */}
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
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  level === "iniciacion_adaptacion" 
                    ? "bg-tertiary-container/30 text-tertiary border-tertiary/20" 
                    : level === "formativo_desarrollo"
                    ? "bg-secondary-container/30 text-secondary border-secondary/20"
                    : "bg-primary-container/30 text-primary border-primary-container/20"
                }`}>
                  {level === "iniciacion_adaptacion" ? "Nivel 1 Adaptación" : level === "formativo_desarrollo" ? "Nivel 2 Formativo" : "Nivel 3 Élite"}
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

        {/* ESTATUS FINANCIERO */}
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

        {/* ========================================================================= */}
        {/* TEST DAY BIOMECÁNICO DINÁMICO POR NIVEL                                   */}
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

          {/* OVR Score y Nivel */}
          <div className="bg-surface-container p-3.5 rounded-2xl flex items-center justify-between border border-surface-container-high/60">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary-container to-surface-variant text-on-primary flex items-center justify-center text-xl font-black shadow-md shadow-primary-container/30">
                {evaluation.overall_ovr}
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block uppercase">Puntaje General (OVR)</span>
                <span className="text-[10px] text-primary font-medium">
                  {level === "iniciacion_adaptacion" ? "Nivel 1: Iniciación & Adaptación" : level === "formativo_desarrollo" ? "Nivel 2: Formativo en Desarrollo" : "Nivel 3: Competitivo Élite"}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-secondary font-mono bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-secondary/20 font-bold">
              {level === "iniciacion_adaptacion" ? "Grupo Adaptación" : "Roster Oficial"}
            </span>
          </div>

          {/* DESGLOSE DINÁMICO SEGÚN EL NIVEL EVALUADO */}
          {level === "iniciacion_adaptacion" ? (
            /* MÉTRICAS NIVEL 1 */
            <div className="space-y-3 pt-1">
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Resistencia: Vueltas a Cancha</span>
                <span className="text-tertiary font-bold">{evaluation.court_laps_count || 5} vueltas continuas</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Sentadillas al Aire (Control)</span>
                <span className="text-secondary font-bold">{evaluation.squats_count || 15} repeticiones</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Flexiones / Lagartijas</span>
                <span className="text-primary font-bold">{evaluation.pushups_count || 8} repeticiones</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Plancha Adaptada</span>
                <span className="text-tertiary font-bold">{evaluation.plank_seconds || 30} segundos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Salto de Cuerda Suave</span>
                <span className="text-secondary font-bold">{evaluation.jump_rope_count || 35} saltos pies juntos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Tiro Cercano al Aro</span>
                <span className="text-primary font-bold">{evaluation.short_range_shots_made || 3} / 5 aciertos</span>
              </div>
            </div>
          ) : level === "formativo_desarrollo" ? (
            /* MÉTRICAS NIVEL 2 */
            <div className="space-y-3 pt-1">
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Trote Continuo Cronometrado</span>
                <span className="text-secondary font-bold">{evaluation.jogging_minutes || 18} minutos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Plancha Central (Core)</span>
                <span className="text-primary font-bold">{evaluation.plank_seconds || 120} segundos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Pliometría: Escaleras Amortiguadas</span>
                <span className="text-tertiary font-bold">{evaluation.stairs_jumps_count || 8} saltos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Protocolo de Cuerda (100-400)</span>
                <span className="text-secondary font-bold">{evaluation.jump_rope_series_count || evaluation.jump_rope_count || 250} saltos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Tiro en Suspensión (Media Distancia)</span>
                <span className="text-primary font-bold">{evaluation.mid_range_shots_made || 6} / 10 aciertos</span>
              </div>
            </div>
          ) : (
            /* MÉTRICAS NIVEL 3 ÉLITE */
            <div className="space-y-3 pt-1">
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Resistencia Máxima (Meta 1h)</span>
                <span className="text-primary font-bold">{evaluation.elite_jogging_minutes || 45} minutos continuos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Plancha Isométrica Núcleo</span>
                <span className="text-secondary font-bold">{evaluation.elite_plank_seconds || 240} seg</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Cuerda Alto Volumen Diario</span>
                <span className="text-tertiary font-bold">{evaluation.elite_jump_rope_count || 750} saltos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Pliometría: Escaleras Altas</span>
                <span className="text-primary font-bold">{evaluation.stairs_jumps_count || 18} saltos</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">Triples Perimetrales</span>
                <span className="text-tertiary font-bold">{evaluation.three_point_shots_made || 7} / 10 triples</span>
              </div>
            </div>
          )}

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
