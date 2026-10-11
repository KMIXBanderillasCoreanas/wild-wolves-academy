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
  Calendar,
  Eye,
  Camera,
  Heart,
  UserCheck,
  ShieldAlert,
  Check,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X
} from "lucide-react";

interface HomeLogDetail {
  id: string;
  student_id: string;
  training_date: string;
  rope_jumps_completed: number;
  cardio_type: string;
  cardio_minutes: number;
  isometric_level: number;
  with_weights: boolean;
  weight_kg: number;
  timer_duration_seconds: number;
  post_workout_bpm: number | null;
  proof_file_url: string | null;
  guardian_signature: boolean;
  guardian_name: string | null;
  status: "completed" | "verified_coach" | "flagged_review";
  coach_review_notes: string | null;
  created_at?: string;
}

interface StudentMonthlyMetrics {
  student_id: string;
  full_name: string;
  email: string;
  current_tier: string;
  total_rope_month: number;
  total_cardio_minutes_month: number;
  total_isometric_sessions: number;
  total_timer_seconds_month: number;
  last_home_session_date: string | null;
  court_test_day_ovr: number | null;
  court_evaluation_date: string | null;
  proofs_count: number;
  logs: HomeLogDetail[];
}

export default function BunkerHomeTrainingMonitor() {
  const [students, setStudents] = useState<StudentMonthlyMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<StudentMonthlyMetrics | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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
        const totalTimerSecs = studentHomeLogs.reduce((acc: number, curr: any) => acc + (curr.timer_duration_seconds || curr.cardio_minutes * 60 || 0), 0);
        const isometricCount = studentHomeLogs.filter((l: any) => (l.isometric_level || 0) > 0).length;
        const proofsCount = studentHomeLogs.filter((l: any) => Boolean(l.proof_file_url)).length;
        const lastSession = studentHomeLogs.length > 0 ? studentHomeLogs[0].training_date : null;

        return {
          student_id: st.id,
          full_name: st.full_name || "Atleta Wild Wolves",
          email: st.email || "",
          current_tier: st.current_tier || "Principiante",
          total_rope_month: totalRope,
          total_cardio_minutes_month: totalCardio,
          total_isometric_sessions: isometricCount,
          total_timer_seconds_month: totalTimerSecs,
          last_home_session_date: lastSession,
          court_test_day_ovr: latestTest?.overall_ovr || null,
          court_evaluation_date: latestTest?.evaluation_date || null,
          proofs_count: proofsCount,
          logs: studentHomeLogs
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

  // Aprobación de semana por Coach Ricardo
  const handleApproveWeek = async (studentId: string) => {
    setActionLoading(true);
    try {
      // 1. Marcar logs recientes como validados
      const { error } = await supabase
        .from("home_training_logs")
        .update({ status: "verified_coach", coach_review_notes: "Aprobado por Head Coach Ricardo en Búnker HQ" })
        .eq("student_id", studentId);

      if (error) console.warn("Update status error:", error.message);

      // 2. Desbloquear Tier / Sumar puntos de constancia
      const tierProgression = ["Principiante", "Novato", "Intermedio", "Avanzado", "Militar", "Élite"];
      if (selectedStudent) {
        const currIdx = tierProgression.indexOf(selectedStudent.current_tier);
        const nextTier = currIdx >= 0 && currIdx < tierProgression.length - 1 ? tierProgression[currIdx + 1] : selectedStudent.current_tier;

        await supabase
          .from("profiles")
          .update({ current_tier: nextTier })
          .eq("id", studentId);
      }

      setActionSuccessMsg("¡Semana Aprobada! Puntos de constancia acreditados y Tier de evolución actualizado.");
      await loadMonthlyData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      console.warn("Error approving week:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Marcar para revisión en cancha
  const handleFlagForCourtReview = async (studentId: string) => {
    setActionLoading(true);
    try {
      await supabase
        .from("home_training_logs")
        .update({ status: "flagged_review", coach_review_notes: "Marcado para recalibración y test presencial en Deportivo Carmen Serdán" })
        .eq("student_id", studentId);

      setActionSuccessMsg("⚠️ Atleta marcado para revisión técnica y biométrica en cancha.");
      await loadMonthlyData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      console.warn("Error flagging for review:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = (students || []).filter(
    (s) => {
      if (!s) return false;
      const q = (search || "").toLowerCase().trim();
      const sName = (s.full_name || "").toLowerCase();
      const sEmail = (s.email || "").toLowerCase();
      return !q || sName.includes(q) || sEmail.includes(q);
    }
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
                Auditoría de Entrenamiento en Casa &amp; Evidencia
              </h3>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Coach Ricardo HQ
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspección de tiempos cronometrados, calibración cardiovascular (BPM) y pruebas visuales antes de validar Tier
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

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* GRID DE ATLETAS */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-mono">
          Cargando telemetría anti-fraude de entrenamientos en casa...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-mono">
          No se encontraron atletas registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((st) => {
            const isHighDiscipline = st.total_rope_month >= 1500 && st.total_cardio_minutes_month >= 60;
            const hasCourtTest = st.court_test_day_ovr !== null;
            const totalHours = (st.total_timer_seconds_month / 3600).toFixed(1);

            return (
              <div
                key={st.student_id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
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
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 shrink-0">
                      Tier: {st.current_tier}
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
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Tiempo Real</span>
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {totalHours} hrs
                      </span>
                    </div>
                    <div className="bg-[#0b0e16] p-2 rounded-xl text-center">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Pruebas / Fotos</span>
                      <span className="text-xs font-mono font-black text-sky-400">
                        {st.proofs_count} archivos
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÓN DE AUDITORÍA DETALLADA */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono gap-2">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Target className="w-3.5 h-3.5 text-orange-400" />
                    <span>OVR: {hasCourtTest ? `${st.court_test_day_ovr} pts` : "Sin test"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(st);
                      setIsAuditModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Auditar Evidencia</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. MODAL DE AUDITORÍA DE EVIDENCIA EN EL BÚNKER DEL COACH          */}
      {/* ================================================================= */}
      {isAuditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-[#10141f] border border-zinc-800 rounded-3xl w-full max-w-3xl p-5 sm:p-7 shadow-2xl relative my-8 font-sans space-y-6">
            
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    AUDITORÍA HEAD COACH • TIER EVOLUCIÓN
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {selectedStudent.email}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  Evidencia en Casa: {selectedStudent.full_name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Tier actual: <strong className="text-amber-400">{selectedStudent.current_tier}</strong> • Minutos totales: {selectedStudent.total_cardio_minutes_month}m • Saltos: {selectedStudent.total_rope_month}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen Semanal Rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#0b0e16] p-3 rounded-2xl border border-zinc-800/80 text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Minutos Registrados</span>
                <span className="text-lg font-black text-emerald-400">{selectedStudent.total_cardio_minutes_month} min</span>
              </div>
              <div className="bg-[#0b0e16] p-3 rounded-2xl border border-zinc-800/80 text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Cuerda Acumulada</span>
                <span className="text-lg font-black text-[#f66018]">{selectedStudent.total_rope_month} reps</span>
              </div>
              <div className="bg-[#0b0e16] p-3 rounded-2xl border border-zinc-800/80 text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Tiempo Cronómetro</span>
                <span className="text-lg font-black text-sky-400">{Math.floor(selectedStudent.total_timer_seconds_month / 60)} min</span>
              </div>
              <div className="bg-[#0b0e16] p-3 rounded-2xl border border-zinc-800/80 text-center">
                <span className="text-[10px] text-zinc-500 uppercase block">Pruebas / Avales</span>
                <span className="text-lg font-black text-purple-400">{selectedStudent.proofs_count} archivos</span>
              </div>
            </div>

            {/* Listado de Sesiones con Auditoría Biológica */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                Historial de Sesiones &amp; Verificación Anti-Fraude
              </h4>

              {selectedStudent.logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-[#0b0e16] rounded-2xl border border-zinc-800">
                  Sin sesiones registradas en casa todavía.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedStudent.logs.map((log, lIdx) => {
                    const timerMins = Math.floor((log.timer_duration_seconds || 0) / 60);
                    const timerSecs = (log.timer_duration_seconds || 0) % 60;
                    const hasBpm = log.post_workout_bpm !== null;
                    const isLowBpm = hasBpm && (log.post_workout_bpm || 0) < 100;

                    return (
                      <div 
                        key={log.id || lIdx}
                        className="p-3.5 rounded-2xl bg-[#0b0e16] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-white">{log.training_date}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold">
                              {log.rope_jumps_completed} saltos • {log.cardio_minutes}m {log.cardio_type}
                            </span>
                            {log.status === "verified_coach" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                Aprobado por Coach ✓
                              </span>
                            )}
                            {log.status === "flagged_review" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                                ⚠️ En Revisión de Cancha
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono flex-wrap">
                            <span>Cronómetro: <strong className="text-white">{timerMins}m {timerSecs}s</strong></span>
                            {hasBpm && (
                              <span className={`flex items-center gap-1 ${isLowBpm ? "text-amber-400 font-bold" : "text-rose-400"}`}>
                                <Heart className="w-3 h-3" />
                                {log.post_workout_bpm} BPM {isLowBpm && "(Bajo)"}
                              </span>
                            )}
                            {log.guardian_signature && (
                              <span className="text-purple-400 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                Aval Tutor: {log.guardian_name || "Catalina Lopez"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón para ver archivo / prueba */}
                        <div className="flex items-center gap-2 shrink-0">
                          {log.proof_file_url ? (
                            <a
                              href={log.proof_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black font-bold text-xs font-mono flex items-center gap-1.5 transition"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Ver Foto / Video</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono italic">Sin micro-prueba</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BOTONES DE DECISIÓN DEL COACH (1 TOQUE) */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleFlagForCourtReview(selectedStudent.student_id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>⚠️ Marcar para Revisión en Cancha</span>
              </button>

              <button
                type="button"
                onClick={() => handleApproveWeek(selectedStudent.student_id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprobar Semana &amp; Desbloquear Siguiente Tier</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
