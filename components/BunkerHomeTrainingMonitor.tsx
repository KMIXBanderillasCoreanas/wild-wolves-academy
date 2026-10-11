"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Home, 
  Activity, 
  TrendingUp, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Search, 
  Award, 
  Zap,
  Target,
  BarChart3,
  Calendar
} from "lucide-react";

interface StudentMonthlyMetrics {
  student_id: string;
  full_name: string;
  email: string;
  current_tier: string;
  total_rope_month: number;
  total_cardio_minutes_month: number;
  total_isometric_sessions: number;
  last_home_session_date: string | null;
  court_test_day_ovr: number | null;
  court_evaluation_date: string | null;
}

export default function BunkerHomeTrainingMonitor() {
  const [students, setStudents] = useState<StudentMonthlyMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<StudentMonthlyMetrics | null>(null);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  async function loadMonthlyData() {
    setLoading(true);
    try {
      // 1. Obtener lista de alumnos
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, current_tier, role")
        .eq("role", "student")
        .order("full_name", { ascending: true });

      // 2. Obtener registros de entrenamiento en casa
      const { data: homeLogs } = await supabase
        .from("home_training_logs")
        .select("*")
        .order("training_date", { ascending: false });

      // 3. Obtener registros de Test Day en cancha
      const { data: testRecords } = await supabase
        .from("detailed_test_records")
        .select("student_id, overall_ovr, evaluation_date")
        .order("evaluation_date", { ascending: false });

      const athletes = profiles || [];
      const logs = homeLogs || [];
      const tests = testRecords || [];

      // Mapear métricas acumuladas por alumno
      const combined: StudentMonthlyMetrics[] = athletes.map((st: any) => {
        const studentHomeLogs = logs.filter((l: any) => l.student_id === st.id);
        const latestTest = tests.find((t: any) => t.student_id === st.id);

        const totalRope = studentHomeLogs.reduce((acc: number, curr: any) => acc + (curr.rope_jumps_completed || 0), 0);
        const totalCardio = studentHomeLogs.reduce((acc: number, curr: any) => acc + (curr.cardio_minutes || 0), 0);
        const isometricCount = studentHomeLogs.filter((l: any) => (l.isometric_level || 0) > 0).length;
        const lastSession = studentHomeLogs.length > 0 ? studentHomeLogs[0].training_date : null;

        return {
          student_id: st.id,
          full_name: st.full_name || "Atleta Wild Wolves",
          email: st.email || "",
          current_tier: st.current_tier || "Principiante",
          total_rope_month: totalRope,
          total_cardio_minutes_month: totalCardio,
          total_isometric_sessions: isometricCount,
          last_home_session_date: lastSession,
          court_test_day_ovr: latestTest?.overall_ovr || null,
          court_evaluation_date: latestTest?.evaluation_date || null,
        };
      });

      setStudents(combined);
      if (combined.length > 0) setSelectedStudent(combined[0]);
    } catch (err) {
      console.warn("Error en BunkerHomeTrainingMonitor:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Seguimiento Mensual: Autodisciplina en Casa
              </h3>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Coach HQ
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Telemetría de saltos acumulados, minutos de carrera e isometría vs. rendimiento real en Test Days
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
            placeholder="Filtrar atleta..."
            className="w-full pl-9 pr-3 py-2 bg-[#121724] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* GRID DE ATLETAS */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-mono">
          Cargando métricas de entrenamiento en casa...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-mono">
          No se encontraron atletas registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((st) => {
            // Comparativa de autodisciplina
            const isHighDiscipline = st.total_rope_month >= 1500 && st.total_cardio_minutes_month >= 60;
            const hasCourtTest = st.court_test_day_ovr !== null;

            return (
              <div
                key={st.student_id}
                onClick={() => setSelectedStudent(st)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedStudent?.student_id === st.student_id
                    ? "bg-[#151a28] border-amber-500/60 shadow-lg shadow-amber-950/20"
                    : "bg-[#10141f] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{st.full_name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400 block">{st.email}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                      {st.current_tier}
                    </span>
                  </div>

                  {/* KPIs Acumulados en Casa */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-zinc-800/60">
                    <div className="bg-[#0b0e16] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Cuerda Mes</span>
                      <span className="text-xs font-mono font-black text-[#f66018]">
                        {st.total_rope_month.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-[#0b0e16] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Cardio Mes</span>
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {st.total_cardio_minutes_month}m
                      </span>
                    </div>
                    <div className="bg-[#0b0e16] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Isometrías</span>
                      <span className="text-xs font-mono font-black text-sky-400">
                        {st.total_isometric_sessions} ses.
                      </span>
                    </div>
                  </div>
                </div>

                {/* COMPARATIVA VS TEST DAY EN CANCHA */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-zinc-400">Test Day OVR:</span>
                    <span className={`font-black ${hasCourtTest ? "text-white" : "text-zinc-600"}`}>
                      {hasCourtTest ? `${st.court_test_day_ovr} pts` : "Sin test"}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isHighDiscipline 
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" 
                      : st.total_rope_month > 0
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {isHighDiscipline ? "Alta Disciplina" : st.total_rope_month > 0 ? "Activo en Casa" : "Sin Registro"}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
