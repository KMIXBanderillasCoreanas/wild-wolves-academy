"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  User, 
  Phone, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Activity, 
  Target, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Flame,
  Sparkles
} from "lucide-react";

export default function GuardianDashboardPage() {
  const [guardianProfile, setGuardianProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [latestTest, setLatestTest] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [homeLogs, setHomeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadGuardianData();
  }, []);

  async function loadGuardianData() {
    setLoading(true);
    try {
      // 1. Obtener sesión de Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;
      const effectiveId = user?.id;

      let gProfile: any = null;

      if (effectiveId) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", effectiveId)
          .maybeSingle();
        gProfile = data;
      }

      if (!gProfile && storedEmail) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", storedEmail)
          .maybeSingle();
        gProfile = data;
      }

      setGuardianProfile(gProfile || {
        full_name: "Tutor Familiar",
        relationship_type: "padre_madre",
        linked_student_name: "Alumno Representado"
      });

      // 2. Buscar al alumno vinculado (REGLA ESTRICTA DE AISLAMIENTO: solo su propio hijo)
      const targetStudentName = gProfile?.linked_student_name?.trim();
      let sProfile: any = null;

      if (targetStudentName) {
        const { data: matchedStudents } = await supabase
          .from("profiles")
          .select("*")
          .ilike("full_name", `%${targetStudentName}%`)
          .eq("role", "student")
          .limit(1);

        if (matchedStudents && matchedStudents.length > 0) {
          sProfile = matchedStudents[0];
        }
      }

      // Si no encontró por nombre, buscar si guardó parent_id o student_id
      if (!sProfile && gProfile?.student_id) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", gProfile.student_id)
          .maybeSingle();
        sProfile = data;
      }

      setStudentProfile(sProfile);

      // 3. Consultar datos de su alumno
      if (sProfile?.id) {
        // Asistencias
        const { count: att } = await supabase
          .from("daily_attendance")
          .select("*", { count: "exact", head: true })
          .eq("student_id", sProfile.id)
          .eq("status", "presente");
        setAttendanceCount(att || 0);

        // Test Day en cancha
        const { data: test } = await supabase
          .from("detailed_test_records")
          .select("*")
          .eq("student_id", sProfile.id)
          .order("evaluation_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        setLatestTest(test);

        // Medallas
        const { data: bData } = await supabase
          .from("student_earned_badges")
          .select("*")
          .eq("student_id", sProfile.id);
        setBadges(bData || []);

        // Sesiones en casa
        const { data: hLogs } = await supabase
          .from("home_training_logs")
          .select("*")
          .eq("student_id", sProfile.id)
          .order("training_date", { ascending: false })
          .limit(5);
        setHomeLogs(hLogs || []);
      }
    } catch (err) {
      console.warn("Error cargando dashboard de tutor:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.clear();
        document.cookie = "user_role=; path=/; max-age=0";
        document.cookie = "user_email=; path=/; max-age=0";
        window.location.href = "/";
      }
    } catch {
      if (typeof window !== "undefined") window.location.href = "/";
    }
  };

  const studentName = studentProfile?.full_name || guardianProfile?.linked_student_name || "Alumno Representado";
  const financialStatus = studentProfile?.financial_status || "al_corriente";
  const debtAmount = studentProfile?.current_debt_amount || 0;
  const trainingSchedule = studentProfile?.training_schedule || "Vespertino: 17:00 - 19:00";
  const trainingDays = studentProfile?.training_days || "Lun-Mié-Vie";

  // WhatsApp directo al Head Coach Ricardo
  const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    `Hola Coach Ricardo, le escribe el tutor de ${studentName} de la Academia Wild Wolves CDMX. Quisiera consultar sobre su proceso y entrenamientos en cancha.`
  )}`;

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans">
      
      {/* HEADER TÁCTICO */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                  Portal Exclusivo para Familias &amp; Tutores
                </span>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Wild Wolves CDMX
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Tutor: <b className="text-zinc-200">{guardianProfile?.full_name || "Tutor Familiar"}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={coachWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contactar Coach Ricardo</span>
            </a>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* BANNER DEL ALUMNO REPRESENTADO */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#121624] to-[#0d1017] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-950/50 shrink-0">
              {studentProfile?.jersey_number ? `#${studentProfile.jersey_number}` : "🐺"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {studentName}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                  {studentProfile?.category || "Categoría Formativa"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Sede: <b className="text-white">Deportivo Carmen Serdán</b> • Días: <b className="text-[#f66018]">{trainingDays}</b> ({trainingSchedule})
              </p>
            </div>
          </div>

          <a
            href={coachWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40 sm:hidden"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp con Head Coach</span>
          </a>
        </div>

        {/* GRID DE ESTADOS: FINANZAS, ASISTENCIA Y RENDIMIENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. CONTROL FINANCIERO */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Estatus Financiero
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                  financialStatus === "al_corriente"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : financialStatus === "abono_parcial"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : financialStatus === "becado"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}>
                  {financialStatus === "al_corriente" && "Al Corriente"}
                  {financialStatus === "abono_parcial" && "Abono Parcial"}
                  {financialStatus === "becado" && "Becado"}
                  {financialStatus === "adeudo_pendiente" && "Adeudo"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  ${debtAmount} <span className="text-xs font-normal text-zinc-500">MXN</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {financialStatus === "al_corriente" 
                    ? "Tu cuenta no tiene pagos pendientes en Deportivo Carmen Serdán." 
                    : `Saldo pendiente de liquidación: $${debtAmount} MXN.`}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400">
              Cuota regular: $50 MXN por sesión en duela
            </div>
          </div>

          {/* 2. REPORTE DE ASISTENCIAS */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" /> Asistencia en Cancha
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Meta: 16 / Mes
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {attendanceCount} <span className="text-xs font-normal text-zinc-500">sesiones</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Entrenamientos con asistencia oficial validada por el cuerpo técnico en Deportivo Carmen Serdán.
                </p>
              </div>
            </div>

            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#f66018] to-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (attendanceCount / 16) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. TEST DAY Y EVALUACIÓN BIOMECÁNICA */}
          <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Calificación OVR
                </span>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {latestTest ? "Evaluado Oficial" : "Pendiente"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {latestTest ? `${latestTest.overall_ovr} pts` : "--"}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {latestTest?.coach_feedback || "El Head Coach calibrará sus 6 ejes deportivos en el próximo Test Day."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400">
              Escala de rendimiento oficial Wild Wolves CDMX
            </div>
          </div>

        </div>

        {/* SECCIÓN DE MEDALLAS DESBLOQUEADAS */}
        <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wide">
                Medallas de Disciplina y Logros de {studentName}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {badges.length} desbloqueadas
            </span>
          </div>

          {badges.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              Tu hijo desbloqueará sus primeras insignias por constancia, tiros acertados y saltos de cuerda en cancha.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b, idx) => (
                <div key={idx} className="bg-[#121624] border border-zinc-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{b.badge_title || "Logro Conquistado"}</h4>
                    <span className="text-[9px] text-zinc-400 font-mono block">Validado por Coach</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROTOCOLO EN CASA RECIENTE */}
        {homeLogs.length > 0 && (
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#f66018]" />
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  Actividad Autónoma en Casa (Días sin Cancha)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Sobrecarga Progresiva
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {homeLogs.map((l, idx) => (
                <div key={idx} className="bg-[#121624] border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold block">{l.training_date}</span>
                    <span className="text-[10px] text-zinc-400">{l.cardio_minutes} min {l.cardio_type}</span>
                  </div>
                  <span className="text-xs font-black text-[#f66018]">{l.rope_jumps_completed} saltos</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-[10px] font-mono text-zinc-500">
        Wild Wolves Basketball Academy CDMX • Deportivo Carmen Serdán • Sistema Oficial de Acompañamiento Familiar
      </footer>

    </div>
  );
}
