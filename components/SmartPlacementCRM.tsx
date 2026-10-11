"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Sparkles, 
  UserCheck, 
  RotateCcw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  Clock,
  Send,
  User,
  Activity,
  Layers,
  Award
} from "lucide-react";

// Motor de cálculo de Tier en cliente para fallback resiliente
export function calculateClientTier(laps: number, rope: number, pushups: number, form: string): string {
  if (laps >= 20 && rope >= 800 && pushups >= 50 && form === "pie_sobre_pie") return "ultra_instinto";
  if (laps >= 15 && rope >= 600 && pushups >= 40) return "titan_wolf";
  if (laps >= 12 && rope >= 400 && pushups >= 30) return "bestia_alfa";
  if (laps >= 10 && rope >= 300 && pushups >= 25) return "elite";
  if (laps >= 8 && rope >= 200 && pushups >= 20) return "militar";
  if (laps >= 6 && rope >= 100 && pushups >= 15) return "avanzado";
  if (laps >= 4 && rope >= 60 && pushups >= 12) return "intermedio";
  if (laps >= 3 || rope >= 40 || pushups >= 8) return "basico";
  return "principiante";
}

export default function SmartPlacementCRM() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [crmFilter, setCrmFilter] = useState<string>("todos");

  // Campos de la prueba exprés de colocación
  const [laps, setLaps] = useState<number>(3);
  const [rope, setRope] = useState<number>(40);
  const [pushups, setPushups] = useState<number>(12);
  const [pushupsForm, setPushupsForm] = useState<string>("brazos_cerrados");
  const [notes, setNotes] = useState<string>("");

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  async function loadAthletes() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setStudents(data);
        if (!selectedStudent) {
          selectStudent(data[0]);
        } else {
          const fresh = data.find((d: any) => d.id === selectedStudent.id);
          if (fresh) setSelectedStudent(fresh);
          else selectStudent(data[0]);
        }
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn("Error cargando atletas en SmartPlacementCRM:", err);
    }
  }

  function selectStudent(st: any) {
    setSelectedStudent(st);
    setAiVerdict(null);
  }

  // Simulación del motor analítico de colocación en cancha
  const handleRunSmartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Guardar en la tabla baseline (el trigger de Supabase hace la clasificación)
      const { error } = await supabase.from("student_initial_baseline").upsert({
        student_id: selectedStudent.id,
        coach_id: user?.id,
        initial_laps_completed: laps,
        initial_jump_rope_max: rope,
        initial_pushups_form: pushupsForm,
        initial_squats_count: pushups,
        initial_posture_notes: notes || "Evaluación inteligente aplicada en cancha."
      }, { onConflict: "student_id" });

      if (error) {
        console.warn("Fallo baseline upsert, aplicando fallback directo a profile:", error);
      }

      // Cálculo del tier
      const calculatedTier = calculateClientTier(laps, rope, pushups, pushupsForm);

      // Asegurar actualización en profiles
      await supabase
        .from("profiles")
        .update({
          current_tier: calculatedTier,
          crm_status: "activo",
          days_inactive: 0,
          last_attended_at: new Date().toISOString().split("T")[0]
        })
        .eq("id", selectedStudent.id);

      // Actualizar también caché local
      if (typeof window !== "undefined") {
        const localBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
        localBaseline[selectedStudent.id] = {
          initial_laps_completed: laps,
          initial_jump_rope_max: rope,
          initial_pushups_form: pushupsForm,
          initial_squats_count: pushups,
          current_tier: calculatedTier
        };
        localStorage.setItem("ww_student_baseline", JSON.stringify(localBaseline));
        window.dispatchEvent(new Event("payment_recorded"));
      }

      setAiVerdict(calculatedTier);
      await loadAthletes();
      alert(`✅ Diagnóstico completado. El atleta fue posicionado automáticamente en el nivel: ${calculatedTier.toUpperCase()}`);
    } catch (err: any) {
      alert("Error en diagnóstico: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickToggleRole = async (targetStudentId: string, toRole: "student" | "guardian_family") => {
    try {
      await supabase.from("profiles").update({
        account_category: toRole,
        role: toRole === "guardian_family" ? "parent" : "student",
        user_type: toRole === "guardian_family" ? "tutor" : "alumno"
      }).eq("id", targetStudentId);
      await loadAthletes();
    } catch (e) {
      console.warn("Error cambiando rol de usuario:", e);
    }
  };

  const filteredStudents = students.filter(s => {
    if (crmFilter === "todos") return true;
    if (crmFilter === "tutores") return s.account_category === "guardian_family" || s.user_type === "tutor" || s.role === "parent" || s.role === "guardian";
    if (crmFilter === "prospecto") return s.crm_status === "prospecto" || s.user_type === "prospecto";
    if (crmFilter === "activo") return (s.crm_status === "activo" || !s.crm_status) && s.account_category !== "guardian_family" && s.user_type !== "tutor";
    if (crmFilter === "inactivo_retorno") return s.crm_status === "inactivo_retorno" || (s.days_inactive && s.days_inactive > 45);
    if (crmFilter === "en_riesgo") return s.crm_status === "en_riesgo" || (s.days_inactive && s.days_inactive > 14 && s.days_inactive <= 45);
    return s.crm_status === crmFilter;
  });

  return (
    <div className="w-full bg-[#0a0d14] border border-zinc-800 rounded-3xl p-5 sm:p-8 text-zinc-100 shadow-2xl space-y-6">
      
      {/* HEADER: PIPELINE CRM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Motor Autónomo • Diagnóstico & CRM Deportivo
          </span>
          <h2 className="text-2xl font-black uppercase text-white mt-2">Nivelación Automática de Atletas</h2>
        </div>

        {/* FILTROS CRM */}
        <div className="flex flex-wrap gap-1.5 bg-[#121724] p-1.5 rounded-2xl border border-zinc-800 text-xs">
          {[
            { id: "todos", label: "Todos" },
            { id: "activo", label: "Alumnos" },
            { id: "prospecto", label: "Prospectos" },
            { id: "tutores", label: "Tutores / Fam." },
            { id: "inactivo_retorno", label: "Retorno (>45d)" },
            { id: "en_riesgo", label: "En Riesgo" }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCrmFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer ${
                crmFilter === f.id ? "bg-orange-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LISTA RÁPIDA DE ALUMNOS (SELECCIÓN DIRECTA) */}
        <div className="bg-[#121724] border border-zinc-800/80 rounded-2xl p-4 space-y-3 max-h-[500px] overflow-y-auto">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
            Atletas ({filteredStudents.length}):
          </span>

          {filteredStudents.length === 0 ? (
            <p className="text-xs text-zinc-500 p-3">No hay atletas con este estado en el CRM.</p>
          ) : (
            filteredStudents.map(s => {
              const isSelected = selectedStudent?.id === s.id;
              const isReturning = s.crm_status === "inactivo_retorno" || (s.days_inactive && s.days_inactive > 45);

              return (
                <div
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "bg-orange-600/20 border-orange-500 text-white shadow-md ring-1 ring-orange-500/40"
                      : "bg-[#0a0d14] border-zinc-800 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs truncate">{s.full_name || s.email}</h4>
                      {isReturning && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          Retorno Obligatorio
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                      Nivel Actual: <b className="text-zinc-300 uppercase">{s.current_tier ? s.current_tier.replace("_", " ") : "Sin nivel"}</b>
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* FORMULARIO DE EVALUACIÓN EXPRÉS DE COLOCACIÓN */}
        <div className="lg:col-span-2 bg-[#121724] border border-zinc-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Evaluando a:</span>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white uppercase">{selectedStudent?.full_name || "Selecciona un Atleta"}</h3>
                {selectedStudent && (
                  <button
                    type="button"
                    onClick={() => handleQuickToggleRole(selectedStudent.id, "guardian_family")}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition cursor-pointer"
                    title="Mover a Tutor/Familiar si este registro no es alumno"
                  >
                    Cambiar a Tutor Familiar
                  </button>
                )}
              </div>
            </div>

            {selectedStudent?.current_tier && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Nivel Guardado:</span>
                <span className="text-xs font-black text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {selectedStudent.current_tier.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleRunSmartAssessment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Vueltas a la cancha sin detenerse:</label>
                <input
                  type="number"
                  min="0"
                  value={laps}
                  onChange={(e) => setLaps(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Ej. 2 para principiante, 10 para intermedio"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Saltos de cuerda continuos logrados:</label>
                <input
                  type="number"
                  min="0"
                  value={rope}
                  onChange={(e) => setRope(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Ej. 30 saltos"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Repeticiones de lagartijas completadas:</label>
                <input
                  type="number"
                  min="0"
                  value={pushups}
                  onChange={(e) => setPushups(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Ej. 15 reps"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Forma / Técnica de Lagartija observada:</label>
                <select
                  value={pushupsForm}
                  onChange={(e) => setPushupsForm(e.target.value)}
                  className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="hincado">1. Rodillas / Hincado (Iniciación)</option>
                  <option value="brazos_cerrados">2. Brazos Cerrados estándar</option>
                  <option value="brazos_abiertos">3. Brazos Abiertos</option>
                  <option value="pie_sobre_pie">4. Pie sobre pie alternado (Avanzado)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 text-xs">Observaciones del Coach / Motivo de ausencia si aplica:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-[#0a0d14] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej. El alumno regresó tras 2 meses de inactividad por escuela. Buena memoria muscular pero requiere readaptación cardiovascular."
              />
            </div>

            <button
              type="submit"
              disabled={analyzing || !selectedStudent}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-orange-600 to-amber-500 text-white font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition shadow-xl cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? "Analizando y Posicionando Atleta..." : "Ejecutar Nivelación Inteligente y Asignar Nivel"}</span>
            </button>
          </form>

          {/* VEREDICTO VISUAL DE LA NIVELACIÓN */}
          {aiVerdict && (
            <div className="bg-[#0a0d14] border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Posicionamiento Exitoso
                </span>
                <p className="text-xs text-zinc-300 mt-0.5">
                  El atleta fue clasificado automáticamente en: <b className="text-white uppercase">{aiVerdict.replace("_", " ")}</b>.
                </p>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  El alumno ya tiene habilitadas las rutinas correspondientes a este nivel en su portal.
                </span>
              </div>
              <Zap className="w-6 h-6 text-amber-400 shrink-0" />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
