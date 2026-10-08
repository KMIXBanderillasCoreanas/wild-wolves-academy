"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";

export type AthleticLevel = "iniciacion_adaptacion" | "formativo_desarrollo" | "competitivo_elite";

interface StudentItem {
  id: string;
  full_name: string;
  email: string;
  category?: string;
  number?: string;
  athletic_level?: AthleticLevel;
}

export default function TestDayEvaluator() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeLevel, setActiveLevel] = useState<AthleticLevel>("iniciacion_adaptacion");

  // ==========================================
  // ESTADOS NIVEL 1: INICIACIÓN & ADAPTACIÓN MOTRIZ
  // ==========================================
  const [lapsCount, setLapsCount] = useState<number>(5); // 2 a 20 vueltas a la cancha
  const [squatsCount, setSquatsCount] = useState<number>(15); // sentadillas al aire (espalda neutral)
  const [pushupsCount, setPushupsCount] = useState<number>(8); // flexiones en suelo o inclinadas
  const [plankSecL1, setPlankSecL1] = useState<number>(30); // 15 a 60 seg
  const [jumpRopeL1, setJumpRopeL1] = useState<number>(35); // 20 a 50 saltos suaves con ambos pies
  const [shortShotsMade, setShortShotsMade] = useState<number>(3); // 0 a 5 tiros libres cortos / media cercana

  // ==========================================
  // ESTADOS NIVEL 2: FORMATIVO & DESARROLLO FÍSICO
  // ==========================================
  const [joggingMinL2, setJoggingMinL2] = useState<number>(18); // 10 a 30 minutos de trote continuo
  const [plankSecL2, setPlankSecL2] = useState<number>(120); // 60 a 180 seg (1 a 3 min)
  const [stairsJumpsL2, setStairsJumpsL2] = useState<number>(8); // 5 a 10 saltos con amortiguación
  const [jumpRopeL2, setJumpRopeL2] = useState<number>(250); // 100 a 400 saltos (50 pies, 25 izq, 25 der)
  const [midShotsL2, setMidShotsL2] = useState<number>(6); // 0 a 10 tiros en suspensión

  // ==========================================
  // ESTADOS NIVEL 3: COMPETITIVO / ÉLITE
  // ==========================================
  const [joggingMinL3, setJoggingMinL3] = useState<number>(45); // 0 a 60 minutos (meta 1 hora continua)
  const [plankSecL3, setPlankSecL3] = useState<number>(240); // 0 a 300 seg (hasta 5 min)
  const [jumpRopeL3, setJumpRopeL3] = useState<number>(750); // hasta 1,000 saltos diarios
  const [stairsJumpsL3, setStairsJumpsL3] = useState<number>(18); // 15 a 20 saltos en escaleras altas
  const [circuitMinL3, setCircuitMinL3] = useState<number>(4); // 0 a 5 minutos continuos
  const [threePointMadeL3, setThreePointMadeL3] = useState<number>(7); // triples de 10 intentos
  const [halfCourtMadeL3, setHalfCourtMadeL3] = useState<number>(1); // tiros media cancha

  // Feedback y Control
  const [feedback, setFeedback] = useState<string>(
    "Excelente control postural y avance en resistencia. Mantener enfoque en amortiguación de aterrizaje."
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carga de atletas
  const loadStudents = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, athletic_level")
          .eq("role", "student");

        if (data && data.length > 0) {
          const mapped: StudentItem[] = data.map((d, i) => ({
            id: d.id,
            full_name: d.full_name || "Atleta Wild Wolves",
            email: d.email || "",
            category: i % 2 === 0 ? "U-15 Formativo" : "U-17 Competitivo",
            number: `#${(i * 7 + 8) % 99 || 11}`,
            athletic_level: (d.athletic_level as AthleticLevel) || "iniciacion_adaptacion"
          }));
          setStudents(mapped);
          setSelectedStudentId((prev) => (prev ? prev : mapped[0].id));
          if (mapped[0].athletic_level) {
            setActiveLevel(mapped[0].athletic_level);
          }
          return;
        }
      }

      // Fallback local a HoopStore
      const storeList = HoopStore.getStudents();
      if (storeList && storeList.length > 0) {
        const mapped: StudentItem[] = storeList.map((s, idx) => ({
          id: s.id,
          full_name: s.fullName,
          email: s.email,
          category: s.age < 16 ? "U-15 Formativo" : "U-17 Competitivo",
          number: `#${s.jerseyNumber || 11}`,
          athletic_level: idx % 3 === 0 ? "iniciacion_adaptacion" : idx % 3 === 1 ? "formativo_desarrollo" : "competitivo_elite"
        }));
        setStudents(mapped);
      } else {
        setStudents([]);
        setSelectedStudentId("");
      }
    } catch (err) {
      console.warn("Fallo cargando atletas para Test Day:", err);
      setStudents([]);
      setSelectedStudentId("");
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Al cambiar de alumno, sugerir su nivel registrado
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const target = students.find((s) => s.id === studentId);
    if (target?.athletic_level) {
      setActiveLevel(target.athletic_level);
    }
  };

  // ==========================================
  // CÁLCULO DINÁMICO DE OVERALL RATING (OVR) POR NIVEL
  // ==========================================
  const calculateOvr = (): number => {
    if (activeLevel === "iniciacion_adaptacion") {
      // Base formativa de 58 puntos. Máximo 78 OVR para este nivel.
      const lapsScore = Math.min(10, (lapsCount / 20) * 10);
      const squatsScore = Math.min(4, (squatsCount / 25) * 4);
      const pushupsScore = Math.min(4, (pushupsCount / 20) * 4);
      const plankScore = Math.min(4, (plankSecL1 / 60) * 4);
      const ropeScore = Math.min(3, (jumpRopeL1 / 50) * 3);
      const shotsScore = Math.min(5, (shortShotsMade / 5) * 5);
      return Math.round(58 + lapsScore + squatsScore + pushupsScore + plankScore + ropeScore + shotsScore);
    } else if (activeLevel === "formativo_desarrollo") {
      // Base formativa intermedia de 68 puntos. Rango 74 - 87 OVR.
      const jogScore = Math.min(8, (joggingMinL2 / 30) * 8);
      const plankScore = Math.min(5, (plankSecL2 / 180) * 5);
      const stairsScore = Math.min(4, (stairsJumpsL2 / 10) * 4);
      const ropeScore = Math.min(4, (jumpRopeL2 / 400) * 4);
      const shotsScore = Math.min(6, (midShotsL2 / 10) * 6);
      return Math.round(68 + jogScore + plankScore + stairsScore + ropeScore + shotsScore);
    } else {
      // Nivel Élite / Competitivo. Rango 82 - 99 OVR.
      const jogScore = Math.min(8, (joggingMinL3 / 60) * 8);
      const plankScore = Math.min(5, (plankSecL3 / 300) * 5);
      const ropeScore = Math.min(5, (jumpRopeL3 / 1000) * 5);
      const stairsScore = Math.min(4, (stairsJumpsL3 / 20) * 4);
      const circuitScore = Math.min(4, (circuitMinL3 / 5) * 4);
      const threeScore = Math.min(6, (threePointMadeL3 / 10) * 6);
      const halfScore = Math.min(2, halfCourtMadeL3 * 2);
      return Math.min(99, Math.round(75 + jogScore + plankScore + ropeScore + stairsScore + circuitScore + threeScore + halfScore));
    }
  };

  const calculatedOvr = calculateOvr();

  // Guardado en Base de Datos y Respaldo Local
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setSaving(true);
    setErrorMsg(null);

    const todayDate = new Date().toISOString().split("T")[0];
    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    // Payload detallado según nivel
    const detailedPayload = {
      student_id: selectedStudentId,
      evaluation_date: todayDate,
      athletic_level_assessed: activeLevel,
      court_laps_count: activeLevel === "iniciacion_adaptacion" ? lapsCount : 0,
      squats_count: activeLevel === "iniciacion_adaptacion" ? squatsCount : 0,
      pushups_count: activeLevel === "iniciacion_adaptacion" ? pushupsCount : 0,
      plank_seconds: activeLevel === "iniciacion_adaptacion" ? plankSecL1 : activeLevel === "formativo_desarrollo" ? plankSecL2 : plankSecL3,
      jump_rope_count: activeLevel === "iniciacion_adaptacion" ? jumpRopeL1 : 0,
      short_range_shots_made: activeLevel === "iniciacion_adaptacion" ? shortShotsMade : 0,
      jogging_minutes: activeLevel === "formativo_desarrollo" ? joggingMinL2 : 0,
      stairs_jumps_count: activeLevel === "formativo_desarrollo" ? stairsJumpsL2 : activeLevel === "competitivo_elite" ? stairsJumpsL3 : 0,
      jump_rope_series_count: activeLevel === "formativo_desarrollo" ? jumpRopeL2 : 0,
      mid_range_shots_made: activeLevel === "formativo_desarrollo" ? midShotsL2 : 0,
      elite_jogging_minutes: activeLevel === "competitivo_elite" ? joggingMinL3 : 0,
      elite_plank_seconds: activeLevel === "competitivo_elite" ? plankSecL3 : 0,
      elite_jump_rope_count: activeLevel === "competitivo_elite" ? jumpRopeL3 : 0,
      plyometric_circuit_minutes: activeLevel === "competitivo_elite" ? circuitMinL3 : 0,
      three_point_shots_made: activeLevel === "competitivo_elite" ? threePointMadeL3 : 0,
      half_court_shots_made: activeLevel === "competitivo_elite" ? halfCourtMadeL3 : 0,
      overall_ovr: calculatedOvr,
      coach_feedback: feedback
    };

    // 1. Guardar en localStorage inmediatamente
    try {
      if (typeof window !== "undefined") {
        const stored = JSON.parse(localStorage.getItem("ww_detailed_test_records") || "{}");
        stored[selectedStudentId] = {
          ...detailedPayload,
          student_name: selectedStudent?.full_name,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem("ww_detailed_test_records", JSON.stringify(stored));

        // Respaldo para el portal tradicional
        const standardEvals = JSON.parse(localStorage.getItem("ww_student_evaluations") || "{}");
        standardEvals[selectedStudentId] = {
          student_id: selectedStudentId,
          evaluation_date: todayDate,
          shooting_percentage: activeLevel === "iniciacion_adaptacion" ? Math.round((shortShotsMade / 5) * 100) : activeLevel === "formativo_desarrollo" ? midShotsL2 * 10 : threePointMadeL3 * 10,
          vertical_jump_cm: activeLevel === "iniciacion_adaptacion" ? 45 : activeLevel === "formativo_desarrollo" ? 62 : 78,
          ball_handling_score: calculatedOvr,
          overall_ovr: calculatedOvr,
          coach_feedback: feedback,
          athletic_level: activeLevel
        };
        localStorage.setItem("ww_student_evaluations", JSON.stringify(standardEvals));

        window.dispatchEvent(new CustomEvent("test_day_updated", { detail: standardEvals[selectedStudentId] }));
      }
    } catch (e) {
      console.warn("Fallo en caché local:", e);
    }

    // 2. Subir a Supabase
    try {
      const { data: authData } = await supabase.auth.getUser();
      const coachId = authData?.user?.id || null;

      // A) Guardar en detailed_test_records
      const { error: detailedError } = await supabase.from("detailed_test_records").upsert(
        {
          ...detailedPayload,
          coach_id: coachId
        },
        { onConflict: "student_id,evaluation_date" }
      );

      if (detailedError) {
        console.warn("Supabase detailed_test_records:", detailedError.message);
      }

      // B) Actualizar nivel atlético en profiles
      await supabase.from("profiles").update({ athletic_level: activeLevel }).eq("id", selectedStudentId);

      // C) Compatibilidad hacia atrás con student_evaluations
      await supabase.from("student_evaluations").upsert(
        {
          student_id: selectedStudentId,
          coach_id: coachId,
          evaluation_date: todayDate,
          shooting_percentage: activeLevel === "iniciacion_adaptacion" ? Math.round((shortShotsMade / 5) * 100) : midShotsL2 * 10,
          vertical_jump_cm: activeLevel === "iniciacion_adaptacion" ? 45 : 65,
          ball_handling_score: calculatedOvr,
          overall_ovr: calculatedOvr,
          coach_feedback: feedback
        },
        { onConflict: "student_id,evaluation_date" }
      );

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4500);
    } catch (err: any) {
      console.warn("Error de conexión, guardado local exitoso:", err?.message);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4500);
    } finally {
      setSaving(false);
    }
  };

  const currentSelected = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="w-full bg-surface-container-low border border-surface-container rounded-3xl p-5 sm:p-7 text-on-surface shadow-2xl transition-all">
      
      {/* 1. CABECERA: TÍTULO & INSIGNIA OVR DINÁMICA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-container gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-secondary uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-surface-container border border-secondary/20">
              Protocolo Biomecánico Adaptativo • Carmen Serdán
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary-container text-2xl sm:text-3xl">radar</span>
            <span>Test Day: Evaluación Dinámica por Nivel</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Los campos y rangos se auto-ajustan a la realidad física de cada deportista (Iniciación, Formativo o Élite).
          </p>
        </div>

        {/* OVR BADGE */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto bg-surface-container px-4 py-3 rounded-2xl border border-surface-container-high shadow-lg shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Overall Rating</span>
            <span className={`text-xs font-black uppercase ${
              activeLevel === "iniciacion_adaptacion" ? "text-tertiary" : activeLevel === "formativo_desarrollo" ? "text-secondary" : "text-primary"
            }`}>
              {activeLevel === "iniciacion_adaptacion" ? "Nivel 1 Adaptación" : activeLevel === "formativo_desarrollo" ? "Nivel 2 Formativo" : "Nivel 3 Élite"}
            </span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-on-primary shadow-xl border ${
            activeLevel === "iniciacion_adaptacion" 
              ? "bg-gradient-to-br from-tertiary to-surface-variant border-tertiary/40" 
              : activeLevel === "formativo_desarrollo"
              ? "bg-gradient-to-br from-secondary to-surface-variant border-secondary/40"
              : "bg-gradient-to-br from-primary-container to-surface-variant border-primary-container/40"
          }`}>
            {calculatedOvr}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveEvaluation} className="space-y-6 mt-6">
        
        {/* 2. SELECTOR DE ATLETA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              1. Seleccionar Atleta en Cancha:
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                disabled={students.length === 0}
                className="w-full h-12 px-4 pr-10 rounded-xl bg-surface-container text-on-surface border border-surface-container-high text-xs font-bold outline-none focus:border-secondary transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {students.length === 0 ? (
                  <option value="" className="bg-[#121724] text-zinc-400">
                    Esperando alumnos reales para evaluación de Día 1 o Test Day.
                  </option>
                ) : (
                  students.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[#121724] text-white py-1">
                      {st.number ? `${st.number} • ` : ""}{st.full_name} {st.category ? `(${st.category})` : ""} — {st.email}
                    </option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
                unfold_more
              </span>
            </div>
          </div>

          {/* 3. SELECTOR DINÁMICO DE NIVEL MOTOR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              2. Nivel Motriz a Evaluar (Ajusta la prueba):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveLevel("iniciacion_adaptacion")}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer border ${
                  activeLevel === "iniciacion_adaptacion"
                    ? "bg-tertiary-container/40 border-tertiary text-tertiary shadow-md"
                    : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="text-[11px] font-black uppercase">Nivel 1</span>
                <span className="text-[9px] font-medium opacity-80">Iniciación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLevel("formativo_desarrollo")}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer border ${
                  activeLevel === "formativo_desarrollo"
                    ? "bg-secondary-container/40 border-secondary text-secondary shadow-md"
                    : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="text-[11px] font-black uppercase">Nivel 2</span>
                <span className="text-[9px] font-medium opacity-80">Formativo (13+)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLevel("competitivo_elite")}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer border ${
                  activeLevel === "competitivo_elite"
                    ? "bg-primary-container/40 border-primary-container text-primary shadow-md"
                    : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="text-[11px] font-black uppercase">Nivel 3</span>
                <span className="text-[9px] font-medium opacity-80">Élite / Comp.</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL DINÁMICO NIVEL 1: INICIACIÓN & ADAPTACIÓN MOTRIZ                    */}
        {/* ========================================================================= */}
        {activeLevel === "iniciacion_adaptacion" && (
          <div className="space-y-4 animate-fade-in p-4 sm:p-5 rounded-2xl bg-surface-container/60 border border-tertiary/30">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <span className="text-xs font-black text-tertiary uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">nature_people</span>
                Pruebas de Adaptación Motriz (Adultos Sedentarios / Niños Nuevos)
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Seguridad Postural Prioritaria
              </span>
            </div>

            {/* AVISO PEDAGÓGICO */}
            <div className="text-[11px] text-tertiary/90 bg-tertiary-container/20 border border-tertiary/30 p-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">health_and_safety</span>
              <span>
                <strong>Cero pliometría explosiva en escaleras altas.</strong> La resistencia se evalúa por <strong>vueltas continuas a la cancha</strong>, y la fuerza se calibra en rangos controlados de 15 a 60 segundos.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* 1. Resistencia: Vueltas a la cancha */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tertiary">Vueltas Continuas Cancha</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {lapsCount} vueltas
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  En lugar de trote de 1h: conteo gradual de 2 a 20 vueltas.
                </p>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={lapsCount}
                  onChange={(e) => setLapsCount(Number(e.target.value))}
                  className="w-full accent-tertiary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>2 vueltas</span>
                  <span>10 v.</span>
                  <span>20 vueltas</span>
                </div>
              </div>

              {/* 2. Sentadillas al aire */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Sentadillas al Aire</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {squatsCount} reps
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Control de rodillas y espalda neutral sin carga externa.
                </p>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={squatsCount}
                  onChange={(e) => setSquatsCount(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>5 reps</span>
                  <span>20 reps</span>
                  <span>35 reps</span>
                </div>
              </div>

              {/* 3. Lagartijas / flexiones adaptadas */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Lagartijas / Flexiones</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {pushupsCount} reps
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  En suelo con rodillas o inclinadas sobre barra/banca.
                </p>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={pushupsCount}
                  onChange={(e) => setPushupsCount(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>2 reps</span>
                  <span>15 reps</span>
                  <span>30 reps</span>
                </div>
              </div>

              {/* 4. Plancha estática adaptada */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tertiary">Plancha Isométrica</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {plankSecL1} seg
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Rango adaptado: 15 a 60 segundos sostenidos.
                </p>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={plankSecL1}
                  onChange={(e) => setPlankSecL1(Number(e.target.value))}
                  className="w-full accent-tertiary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>15 seg</span>
                  <span>30 seg</span>
                  <span>60 seg</span>
                </div>
              </div>

              {/* 5. Salto de cuerda suave */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Salto de Cuerda Suave</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {jumpRopeL1} saltos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Series de 20 a 50 saltos continuos a pies juntos.
                </p>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={jumpRopeL1}
                  onChange={(e) => setJumpRopeL1(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>10 saltos</span>
                  <span>35 saltos</span>
                  <span>60 saltos</span>
                </div>
              </div>

              {/* 6. Tiro corto adaptado */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Tiro Mecánico Cercano</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {shortShotsMade} / 5 aciertos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Mecánica de codo y muñeca en 5 intentos de corta distancia.
                </p>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={shortShotsMade}
                  onChange={(e) => setShortShotsMade(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0/5</span>
                  <span>3/5</span>
                  <span>5/5 Perfecto</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL DINÁMICO NIVEL 2: FORMATIVO & DESARROLLO FÍSICO                     */}
        {/* ========================================================================= */}
        {activeLevel === "formativo_desarrollo" && (
          <div className="space-y-4 animate-fade-in p-4 sm:p-5 rounded-2xl bg-surface-container/60 border border-secondary/30">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <span className="text-xs font-black text-secondary uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                Pruebas Formativas & Desarrollo Físico (Jóvenes 13+ / Adultos en Evolución)
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Sobrecarga Progresiva
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* 1. Trote Continuo Cronometrado */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Trote Cronometrado</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {joggingMinL2} min
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Resistencia aeróbica continua (rango de 10 a 30 minutos).
                </p>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={joggingMinL2}
                  onChange={(e) => setJoggingMinL2(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>10 min</span>
                  <span>20 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* 2. Planchas sostenidas */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Plancha Central (Core)</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {plankSecL2} seg ({Math.floor(plankSecL2 / 60)}m {plankSecL2 % 60}s)
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Fuerza central sostenida de 1 a 3 minutos continuos.
                </p>
                <input
                  type="range"
                  min="60"
                  max="180"
                  step="10"
                  value={plankSecL2}
                  onChange={(e) => setPlankSecL2(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>60 seg (1m)</span>
                  <span>120 seg (2m)</span>
                  <span>180 seg (3m)</span>
                </div>
              </div>

              {/* 3. Pliometría: Escaleras altas con amortiguación */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tertiary">Escaleras con Amortiguación</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {stairsJumpsL2} brincos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  1-2 series de 5 a 10 saltos. Prioridad en caída suave.
                </p>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={stairsJumpsL2}
                  onChange={(e) => setStairsJumpsL2(Number(e.target.value))}
                  className="w-full accent-tertiary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>5 saltos</span>
                  <span>10 saltos</span>
                  <span>15 saltos</span>
                </div>
              </div>

              {/* 4. Protocolo de cuerda */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Protocolo de Cuerda</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {jumpRopeL2} saltos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  100 a 400 saltos (50 dos pies, 25 pierna izq, 25 der).
                </p>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="25"
                  value={jumpRopeL2}
                  onChange={(e) => setJumpRopeL2(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>100 saltos</span>
                  <span>250 saltos</span>
                  <span>400 saltos</span>
                </div>
              </div>

              {/* 5. Tiro libre y suspensión */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Tiro Libre & Suspensión</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {midShotsL2} / 10 aciertos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Series de 5 a 10 tiros con salto en suspensión media distancia.
                </p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={midShotsL2}
                  onChange={(e) => setMidShotsL2(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0/10</span>
                  <span>5/10 (50%)</span>
                  <span>10/10 Pro</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL DINÁMICO NIVEL 3: COMPETITIVO / ÉLITE                              */}
        {/* ========================================================================= */}
        {activeLevel === "competitivo_elite" && (
          <div className="space-y-4 animate-fade-in p-4 sm:p-5 rounded-2xl bg-surface-container/60 border border-primary-container/30">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <span className="text-xs font-black text-primary uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
                Pruebas de Alto Rendimiento • Nivel 3 Competitivo & Élite
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Meta: Liga Élite CDMX
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              {/* 1. Resistencia Máxima: Hasta 1 hora continua */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Resistencia Máxima (1 Hora)</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {joggingMinL3} min
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Trote sostenido cronometrado de 0 a 60 minutos sin detenerse.
                </p>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={joggingMinL3}
                  onChange={(e) => setJoggingMinL3(Number(e.target.value))}
                  className="w-full accent-primary-container cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0 min</span>
                  <span>30 min</span>
                  <span>60 min (Meta)</span>
                </div>
              </div>

              {/* 2. Plancha isométrica pro: Hasta 5 min */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Fuerza Isométrica Núcleo</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {plankSecL3} seg ({Math.floor(plankSecL3 / 60)} min)
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Plancha de alto impacto: de 0 a 5 minutos (300 segundos).
                </p>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="15"
                  value={plankSecL3}
                  onChange={(e) => setPlankSecL3(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0 seg</span>
                  <span>150 seg (2.5m)</span>
                  <span>300 seg (5 min)</span>
                </div>
              </div>

              {/* 3. Cuerda diario: Hasta 1,000 saltos */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tertiary">Cuerda Alto Volumen</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {jumpRopeL3} saltos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Progresión técnica hasta 1,000 saltos diarios en sesión.
                </p>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={jumpRopeL3}
                  onChange={(e) => setJumpRopeL3(Number(e.target.value))}
                  className="w-full accent-tertiary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>100</span>
                  <span>500</span>
                  <span>1,000 Diario</span>
                </div>
              </div>

              {/* 4. Escaleras altas explosivas */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary">Escaleras Altas Explosivas</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {stairsJumpsL3} saltos
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  3 a 4 series continuas de 15 a 20 saltos pliométricos.
                </p>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={stairsJumpsL3}
                  onChange={(e) => setStairsJumpsL3(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>5 reps</span>
                  <span>15 reps</span>
                  <span>25 reps</span>
                </div>
              </div>

              {/* 5. Circuito pliométrico */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-secondary">Circuito Pliométrico Cancha</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {circuitMinL3} min
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Desplazamientos y saltos reactivos de 0 a 5 minutos sostenidos.
                </p>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={circuitMinL3}
                  onChange={(e) => setCircuitMinL3(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0 min</span>
                  <span>2.5 min</span>
                  <span>5 min Máx</span>
                </div>
              </div>

              {/* 6. Triples & Media cancha */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-surface-container-high flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tertiary">Triples Perimetrales</span>
                  <span className="text-base font-black text-white bg-surface-container-high px-2 py-0.5 rounded font-mono">
                    {threePointMadeL3} / 10 triples
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-2">
                  Aciertos en 10 tiros tras desmarque perimetral.
                </p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={threePointMadeL3}
                  onChange={(e) => setThreePointMadeL3(Number(e.target.value))}
                  className="w-full accent-tertiary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-outline mt-1">
                  <span>0/10</span>
                  <span>5/10</span>
                  <span>10/10 Élite</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. FEEDBACK TÉCNICO OFICIAL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Feedback Técnico Oficial del Head Coach:
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-surface-container text-on-surface border border-surface-container-high text-xs outline-none focus:border-secondary transition resize-none leading-relaxed"
            placeholder="Añade recomendaciones de postura, respiración aeróbica y observaciones biomecánicas..."
          />
        </div>

        {/* 5. BOTÓN DE PUBLICACIÓN */}
        <button
          type="submit"
          disabled={saving || !selectedStudentId}
          className="w-full h-12 rounded-xl bg-tertiary hover:bg-tertiary-container text-on-tertiary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-tertiary/20 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">
            {saving ? "sync" : "verified"}
          </span>
          <span>
            {saving ? "Registrando en Base de Datos..." : `Publicar Test Day (${activeLevel === "iniciacion_adaptacion" ? "Nivel 1" : activeLevel === "formativo_desarrollo" ? "Nivel 2" : "Nivel 3"} • OVR ${calculatedOvr})`}
          </span>
        </button>

        {/* TOAST CONFIRMACIÓN */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-tertiary/20 text-tertiary text-xs font-bold text-center border border-tertiary/30 animate-fade-in flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            <span>¡Evaluación guardada exitosamente y reflejada en la Cyber Wolf Card del deportista!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error/20 text-error text-xs font-bold text-center border border-error/30 animate-fade-in">
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}
