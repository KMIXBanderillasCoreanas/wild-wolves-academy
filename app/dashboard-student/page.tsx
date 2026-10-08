"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Flame, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Activity,
  LogOut,
  MapPin,
  Sparkles
} from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [commitment, setCommitment] = useState<any>(null);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [metrics, setMetrics] = useState({
    shooting: 75,
    verticalJump: 82,
    ballHandling: 68
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Fallback a usuario local de HoopStore si existe
        const localUser = HoopStore.getCurrentUser();
        const localStudent = localUser?.studentId ? HoopStore.getStudent(localUser.studentId) : HoopStore.getStudents()[0];
        
        if (localStudent) {
          setProfile({
            full_name: localStudent.fullName,
            email: localStudent.email,
            avatar_url: localStudent.avatarUrl || null,
          });
          setCommitment({
            shift: localStudent.shift || "vespertino_5_7",
            days_selected: localStudent.trainingDays || ["Lunes", "Miércoles", "Viernes"],
            frequency_type: localStudent.finances?.frequency || "cada_3er_dia",
          });
          if (localStudent.finances && localStudent.finances.lastPaymentAmount) {
            setLastPayment({
              amount: localStudent.finances.lastPaymentAmount,
              concept: localStudent.finances.frequency === "mensual" ? "Mensualidad" : "Por Clase",
              payment_date: localStudent.finances.lastPaymentDate || new Date().toISOString().split("T")[0],
              status: localStudent.finances.status === "al_corriente" ? "pagado" : "pendiente",
            });
          }
          setAttendanceCount(localStudent.totalDaysTrained || 0);
          if (localStudent.metricsCurrent) {
            setMetrics({
              shooting: Math.round((localStudent.metricsCurrent.freeThrow + localStudent.metricsCurrent.midRange) / 2) || 75,
              verticalJump: localStudent.metricsCurrent.verticalJump || 82,
              ballHandling: localStudent.metricsCurrent.agilityTTest || 68
            });
          }
          setLoading(false);
          return;
        }

        // Si no hay sesión ni datos locales, redirigir a inicio
        window.location.href = "/";
        return;
      }

      // 1. Perfil del estudiante desde Supabase
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(prof || { full_name: user.user_metadata?.full_name || "Atleta Wild Wolves", email: user.email });

      // 2. Compromiso de días y turno
      const { data: comm } = await supabase
        .from("attendance_commitments")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setCommitment(comm || {
        shift: "vespertino_5_7",
        days_selected: ["Lunes", "Miércoles", "Viernes"],
        frequency_type: "cada_3er_dia"
      });

      // 3. Último pago en membership_payments
      const { data: pay } = await supabase
        .from("membership_payments")
        .select("*")
        .eq("student_id", user.id)
        .order("payment_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLastPayment(pay);

      // 4. Asistencias acumuladas en daily_attendance
      const { count } = await supabase
        .from("daily_attendance")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id)
        .eq("status", "presente");

      setAttendanceCount(count || 0);

    } catch (err) {
      console.error("Error cargando perfil del alumno:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorar error si no había sesión remota activa
    }
    HoopStore.logout();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-zinc-400 flex items-center justify-center font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
          <span>Cargando perfil de atleta Wild Wolves...</span>
        </div>
      </div>
    );
  }

  const isPaid = lastPayment && lastPayment.status === "pagado";

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 p-4 sm:p-8 font-sans selection:bg-[#ea580c] selection:text-white">
      {/* HEADER ALUMNO */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 px-3 py-1 rounded-full font-bold">
            PORTAL DEL ATLETA • CANCHA CARMEN SERDÁN
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2 tracking-tight">
            Panel de {profile?.full_name?.split(" ")[0] || "Atleta"}
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-[#121724] border border-zinc-800 hover:border-zinc-700 px-3.5 py-2.5 rounded-xl transition cursor-pointer font-bold"
        >
          <LogOut className="w-3.5 h-3.5" /> Salir
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: PLAYER CARD DIGITAL */}
        <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#0284c7] p-1 shadow-lg shadow-[#ea580c]/20 mb-4">
            <div className="w-full h-full bg-[#07090e] rounded-xl flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Trophy className="w-10 h-10 text-[#ea580c]" />
              )}
            </div>
          </div>

          <h2 className="text-lg font-black uppercase text-white tracking-wide">{profile?.full_name}</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{profile?.email}</p>

          <div className="mt-4 w-full pt-4 border-t border-zinc-800/80 space-y-2 text-left text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Categoría:</span>
              <span className="font-bold text-zinc-300">Formativo CDMX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Turno:</span>
              <span className="font-bold text-[#38bdf8]">
                {commitment?.shift === "matutino_9_11" ? "Mañana (09:00 - 11:00)" : "Tarde (17:00 - 19:00)"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Asistencias en Cancha:</span>
              <span className="font-bold text-emerald-400">{attendanceCount} sesiones</span>
            </div>
          </div>

          <div className="mt-6 w-full bg-[#121724] border border-zinc-800 p-3.5 rounded-2xl text-left">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5 font-bold">Días Comprometidos:</span>
            <div className="flex flex-wrap gap-1.5">
              {commitment?.days_selected && commitment.days_selected.length > 0 ? (
                commitment.days_selected.map((d: string) => (
                  <span key={d} className="text-[10px] bg-[#07090e] text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-md font-bold">
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">Sin días asignados</span>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA 2 & 3: ESTADO FINANCIERO Y RADAR */}
        <div className="md:col-span-2 space-y-6">
          
          {/* SEMÁFORO DE PAGO Y CUOTA */}
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">Estatus de Mensualidad / Cuota</span>
                <h3 className="text-lg font-black uppercase text-white mt-1">Estado de Pago</h3>
              </div>
              {isPaid ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Al Corriente
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3.5 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4" /> Pago Pendiente
                </span>
              )}
            </div>

            <div className="mt-4 p-4 bg-[#121724] border border-zinc-800 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {lastPayment ? (
                    <>Último registro: <b className="text-white">${lastPayment.amount} MXN</b> ({lastPayment.concept}) el {lastPayment.payment_date}</>
                  ) : (
                    "No se registran pagos previos. Paga tu primera clase o mensualidad en cancha."
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Tarifas oficiales: $50 por clase • $150 semanal • $600 mensualidad integral.
                </p>
              </div>

              <a
                href="https://wa.me/525522427769?text=Hola%20Administración%20Wild%20Wolves,%20deseo%20comprobar%20o%20realizar%20mi%20pago%20de%20entrenamiento."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-[#22c55e] hover:bg-[#16a34a] text-black px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Aclarar con Administración
              </a>
            </div>
          </div>

          {/* RADAR 360° Y EVALUACIÓN DEPORTIVA (SOLO LECTURA) */}
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-[#38bdf8] uppercase font-bold tracking-wider">Métricas Oficiales del Staff</span>
                <h3 className="text-lg font-black uppercase text-white mt-1">Radar Biomecánico & Baloncesto</h3>
              </div>
              <Activity className="w-5 h-5 text-[#ea580c]" />
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Las evaluaciones son aplicadas por los entrenadores durante los <b>Test Days</b> mensuales para medir tu salto vertical, efectividad de tiro y velocidad de reacción en cancha.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-400">Tiro Libre y Media Distancia</span>
                  <span className="text-[#38bdf8] font-mono">{metrics.shooting}%</span>
                </div>
                <div className="w-full bg-[#121724] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#38bdf8] h-full rounded-full transition-all duration-500" style={{ width: `${metrics.shooting}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-400">Salto Vertical & Potencia de Piernas</span>
                  <span className="text-[#ea580c] font-mono">{metrics.verticalJump}%</span>
                </div>
                <div className="w-full bg-[#121724] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#ea580c] h-full rounded-full transition-all duration-500" style={{ width: `${metrics.verticalJump}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-400">Control de Balón con Ambas Manos</span>
                  <span className="text-emerald-400 font-mono">{metrics.ballHandling}%</span>
                </div>
                <div className="w-full bg-[#121724] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.ballHandling}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
