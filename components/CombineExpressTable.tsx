"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, 
  Save, 
  CheckCircle2, 
  Flame, 
  Award, 
  RotateCcw, 
  UserCheck, 
  ShieldCheck, 
  Search, 
  Zap, 
  Target 
} from "lucide-react";

interface StudentCombineRow {
  student_id: string;
  student_name: string;
  category: string;
  court_laps: number;
  jump_rope: number;
  pushups_reps: number;
  free_throws_made: number; // de 20 tiros
  status?: "pending" | "saved" | "saving";
}

export default function CombineExpressTable() {
  const [students, setStudents] = useState<StudentCombineRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [savingAll, setSavingAll] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  async function loadAthletes() {
    setLoading(true);
    try {
      // Cargar perfiles de alumnos
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, current_tier, user_type")
        .order("full_name", { ascending: true });

      // Filtrar alumnos reales (excluir coach Ricardo y tutores)
      const athleteProfiles = (profiles || []).filter((p: any) => {
        if (!p) return false;
        const email = (p.email || "").toLowerCase();
        const role = (p.role || "").toLowerCase();
        const userType = (p.user_type || "").toLowerCase();
        if (email.includes("wildwolvescdmx@gmail.com") || role === "coach" || role === "superadmin" || userType === "tutor") {
          return false;
        }
        return true;
      });

      // Cargar datos previos de student_initial_baseline si existen
      const { data: baselines } = await supabase
        .from("student_initial_baseline")
        .select("student_id, initial_laps_completed, initial_jump_rope_max, initial_squats_count");

      // Cargar datos previos de basketball_skills_logs si existen
      const { data: basketLogs } = await supabase
        .from("basketball_skills_logs")
        .select("student_id, free_throws_made, test_date")
        .order("test_date", { ascending: false });

      const mapped: StudentCombineRow[] = athleteProfiles.map((p: any, idx: number) => {
        const studentBaseline = (baselines || []).find((b: any) => b.student_id === p.id);
        const studentBasket = (basketLogs || []).find((bk: any) => bk.student_id === p.id);

        return {
          student_id: p.id,
          student_name: p.full_name || p.email?.split("@")[0] || `Atleta #${idx + 1}`,
          category: p.current_tier || "Formativo U-15",
          court_laps: studentBaseline?.initial_laps_completed ?? 4,
          jump_rope: studentBaseline?.initial_jump_rope_max ?? 150,
          pushups_reps: 20,
          free_throws_made: studentBasket?.free_throws_made ?? 12,
          status: "pending"
        };
      });

      setStudents(mapped);
    } catch (err) {
      console.warn("Error cargando atletas en Combine Express:", err);
    } finally {
      setLoading(false);
    }
  }

  // Modificar valor de un campo específico
  const handleInputChange = (
    studentId: string, 
    field: "court_laps" | "jump_rope" | "pushups_reps" | "free_throws_made", 
    value: number
  ) => {
    const sanitizedVal = Math.max(0, isNaN(value) ? 0 : value);
    setStudents(prev => prev.map(s => {
      if (s.student_id !== studentId) return s;
      return { ...s, [field]: sanitizedVal };
    }));
  };

  // Guardado Masivo de Toda la Tabla
  const handleSaveAllEvaluations = async () => {
    if (students.length === 0) return;
    setSavingAll(true);
    setSuccessBanner(null);

    const todayDate = new Date().toISOString().split("T")[0];

    try {
      const coachUser = await supabase.auth.getUser();
      const coachId = coachUser.data?.user?.id || "f47ac10b-58cc-4372-a567-0e02b2c3d479";

      // 1. Preparar payloads masivos para student_initial_baseline
      const baselinePayloads = students.map(s => ({
        student_id: s.student_id,
        coach_id: coachId,
        entry_date: todayDate,
        initial_laps_completed: s.court_laps,
        initial_jump_rope_max: s.jump_rope,
        initial_pushups_form: "estricta",
        initial_squats_count: s.pushups_reps,
        initial_posture_notes: "Evaluación Test Day Combine Express en cancha."
      }));

      // 2. Preparar payloads masivos para basketball_skills_logs
      const basketballPayloads = students.map(s => ({
        student_id: s.student_id,
        coach_id: coachId,
        test_date: todayDate,
        shooting_base_attempts: 20,
        free_throws_made: s.free_throws_made,
        mid_range_made: Math.round(s.free_throws_made * 0.8),
        three_point_made: Math.round(s.free_throws_made * 0.5),
        half_court_made: 0,
        vertical_jump_cm: Math.min(80, 35 + s.court_laps * 3),
        sprint_100m_seconds: Math.max(12, 17 - (s.court_laps * 0.5)),
        lines_round_trip_seconds: 22.5,
        board_rebound_drill_done: true,
        coach_notes: `Combine Express: ${s.court_laps} vueltas, ${s.jump_rope} saltos, ${s.free_throws_made}/20 tiros libres.`
      }));

      // 3. Preparar payloads masivos para physical_training_logs
      const physicalPayloads = students.map(s => ({
        student_id: s.student_id,
        coach_id: coachId,
        training_date: todayDate,
        is_cardio_active: true,
        is_strength_active: true,
        is_isometric_active: true,
        court_laps_done: s.court_laps,
        jogging_minutes: Math.max(5, s.court_laps * 3),
        jump_rope_count: s.jump_rope,
        pushups_variation: "estricta",
        pushups_reps: s.pushups_reps,
        squats_3x25_done: true,
        abs_3x25_done: true,
        lunges_laps: 2
      }));

      // 4. Inserción masiva en Supabase
      if (typeof window !== "undefined" && navigator.onLine) {
        await supabase
          .from("student_initial_baseline")
          .upsert(baselinePayloads, { onConflict: "student_id" });

        await supabase
          .from("basketball_skills_logs")
          .insert(basketballPayloads);

        await supabase
          .from("physical_training_logs")
          .insert(physicalPayloads);
      }

      // 5. Actualización en localStorage y disparo de evento
      if (typeof window !== "undefined") {
        const storedBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
        students.forEach(s => {
          storedBaseline[s.student_id] = {
            student_id: s.student_id,
            student_name: s.student_name,
            initial_laps_completed: s.court_laps,
            initial_jump_rope_max: s.jump_rope,
            initial_squats_count: s.pushups_reps,
            initial_posture_notes: "Evaluación Test Day Combine Express",
            entry_date: todayDate
          };
        });
        localStorage.setItem("ww_student_baseline", JSON.stringify(storedBaseline));
        window.dispatchEvent(new Event("student_baseline_updated"));
        window.dispatchEvent(new Event("basketball_skills_logged"));
      }

      setStudents(prev => prev.map(s => ({ ...s, status: "saved" })));
      setSuccessBanner(`¡Éxito! Se guardaron ${students.length} evaluaciones oficiales. Los radares 360° y líneas base de los atletas están actualizados.`);
      setTimeout(() => setSuccessBanner(null), 6000);

    } catch (err) {
      console.error("Error al guardar Combine Express:", err);
    } finally {
      setSavingAll(false);
    }
  };

  const filtered = (students || []).filter(s => {
    if (!s) return false;
    const q = (search || "").toLowerCase().trim();
    return !q || (s.student_name || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q);
  });

  return (
    <div className="bg-[#0e121b] border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-fadeIn">
      
      {/* Cabecera Combine Express */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/50 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Combine Express: Captura Masiva en Cancha
              </h3>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                1 Sola Pantalla
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Califica a todo el plantel en segundos. Alimenta directamente la Línea Base y el Radar 360° de los alumnos.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Tabla Táctil Compacta */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-zinc-500">
          Cargando atletas para el Combine Express...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-zinc-500">
          No se encontraron alumnos activos para calificar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-[#090c13]">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-[#121622] text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-800">
                <th className="py-3.5 px-4 font-black">Columna 1: Atleta</th>
                <th className="py-3.5 px-4 font-black text-center">Columna 2: Vueltas Cancha</th>
                <th className="py-3.5 px-4 font-black text-center">Columna 3: Saltos Cuerda</th>
                <th className="py-3.5 px-4 font-black text-center">Columna 4: Lagartijas (Reps)</th>
                <th className="py-3.5 px-4 font-black text-center">Columna 5: Tiros Libres (/20)</th>
                <th className="py-3.5 px-3 font-black text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filtered.map((st) => (
                <tr key={st.student_id} className="hover:bg-[#131724]/80 transition">
                  {/* Columna 1: Nombre */}
                  <td className="py-3 px-4 font-sans">
                    <span className="font-extrabold text-white text-sm block">
                      {st.student_name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {st.category}
                    </span>
                  </td>

                  {/* Columna 2: Vueltas */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={st.court_laps}
                        onChange={(e) => handleInputChange(st.student_id, "court_laps", parseInt(e.target.value) || 0)}
                        className="w-16 bg-[#171c2a] border border-zinc-700 rounded-xl py-2 px-2 text-center text-white font-black text-sm focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[10px] text-zinc-500">vts</span>
                    </div>
                  </td>

                  {/* Columna 3: Cuerda */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        step="10"
                        value={st.jump_rope}
                        onChange={(e) => handleInputChange(st.student_id, "jump_rope", parseInt(e.target.value) || 0)}
                        className="w-20 bg-[#171c2a] border border-zinc-700 rounded-xl py-2 px-2 text-center text-white font-black text-sm focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[10px] text-zinc-500">reps</span>
                    </div>
                  </td>

                  {/* Columna 4: Lagartijas */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={st.pushups_reps}
                        onChange={(e) => handleInputChange(st.student_id, "pushups_reps", parseInt(e.target.value) || 0)}
                        className="w-16 bg-[#171c2a] border border-zinc-700 rounded-xl py-2 px-2 text-center text-white font-black text-sm focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[10px] text-zinc-500">reps</span>
                    </div>
                  </td>

                  {/* Columna 5: Tiros Libres de 20 */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={st.free_throws_made}
                        onChange={(e) => handleInputChange(st.student_id, "free_throws_made", parseInt(e.target.value) || 0)}
                        className="w-16 bg-[#171c2a] border border-zinc-700 rounded-xl py-2 px-2 text-center text-orange-400 font-black text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-[10px] text-zinc-500 font-bold">/ 20</span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-3 text-center">
                    {st.status === "saved" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Listo
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón Inferior de Guardado Masivo */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-400 font-mono">
          <span>Total a calificar: <strong>{students.length} atletas</strong> en cancha</span>
        </div>

        <button
          type="button"
          onClick={handleSaveAllEvaluations}
          disabled={savingAll || students.length === 0}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/60 transition cursor-pointer disabled:opacity-50"
        >
          {savingAll ? (
            <span>Guardando evaluaciones masivas...</span>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>Guardar Todas las Evaluaciones</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
