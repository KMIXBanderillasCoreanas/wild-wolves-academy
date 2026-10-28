"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import BasketballCourtHeatmap from "@/components/BasketballCourtHeatmap";
import CourtHeatmapPro from "@/components/CourtHeatmapPro";
import ShotScienceDashboard from "@/components/ShotScienceDashboard";
import LoboProModal from "@/components/LoboProModal";
import { generateFullReportHTML } from "@/lib/reportGenerator";
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
  Sparkles,
  Download
} from "lucide-react";

export default function GuardianDashboardPage() {
  const [guardianProfile, setGuardianProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [latestTest, setLatestTest] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [homeLogs, setHomeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProModal, setShowProModal] = useState<boolean>(false);

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

      // 2. Buscar al alumno vinculado (o fallback automático a Bruno Díaz / primer alumno si entra Coach Ricardo en modo demostración)
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

      // Si Coach Ricardo o SuperAdmin entra a ver cómo lo ve un padre, vincularlo con el alumno demo Bruno Díaz
      const isSuperAdminUser = gProfile?.role === "superadmin" || storedEmail?.toLowerCase() === "wildwolvescdmx@gmail.com";
      if (!sProfile && isSuperAdminUser) {
        const { data: demoStudent } = await supabase
          .from("profiles")
          .select("*")
          .ilike("full_name", "%Bruno%")
          .limit(1)
          .maybeSingle();
        sProfile = demoStudent;
      }

      // Fallback final: si sigue sin perfil, tomar el primer alumno con registros de prueba
      if (!sProfile) {
        const { data: anyStudent } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .limit(1)
          .maybeSingle();
        sProfile = anyStudent;
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

        // Test Day en cancha (consultar tanto detailed_test_records como basketball_skills_logs)
        const { data: test } = await supabase
          .from("detailed_test_records")
          .select("*")
          .eq("student_id", sProfile.id)
          .order("evaluation_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: skillsLog } = await supabase
          .from("basketball_skills_logs")
          .select("*")
          .eq("student_id", sProfile.id)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Mapeo unificado tolerante a nombres de columnas
        const unifiedTest = {
          free_throws_made: test?.short_range_shots_made ?? test?.free_throws_made ?? skillsLog?.free_throws_made ?? 10,
          mid_range_made: test?.mid_range_shots_made ?? test?.mid_range_made ?? skillsLog?.mid_range_made ?? 20,
          three_point_made: test?.three_point_shots_made ?? test?.three_point_made ?? skillsLog?.three_point_made ?? 15,
          spot_corner_left: skillsLog?.three_corner_left ?? test?.spot_corner_left ?? 3,
          spot_wing_left: skillsLog?.three_wing_left ?? test?.spot_wing_left ?? 3,
          spot_top_key: skillsLog?.three_top ?? test?.spot_top_key ?? 4,
          spot_wing_right: skillsLog?.three_wing_right ?? test?.spot_wing_right ?? 3,
          spot_corner_right: skillsLog?.three_corner_right ?? test?.spot_corner_right ?? 2,
          jump_rope_count: test?.jump_rope_count ?? 1000,
          vertical_jump_cm: skillsLog?.vertical_jump_cm ?? test?.vertical_jump_cm ?? 110,
          sprint_100m_seconds: skillsLog?.sprint_100m_seconds ?? test?.sprint_100m_seconds ?? 10.0,
          lines_round_trip_seconds: skillsLog?.lines_round_trip_seconds ?? test?.lines_round_trip_seconds ?? 15.0,
          overall_ovr: test?.overall_ovr ?? 88,
          evaluation_date: test?.evaluation_date ?? skillsLog?.test_date ?? "2026-10-27",
          coach_feedback: test?.coach_feedback ?? skillsLog?.coach_notes ?? "Mecánica oficial en duela."
        };
        
        setLatestTest(unifiedTest);

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
      } else if (typeof window !== "undefined") {
        // MODO OFFLINE O SIN SESIÓN DE SUPABASE: Cargar prueba guardada localmente
        const localTests = JSON.parse(localStorage.getItem("ww_offline_sports_tests") || "[]");
        if (localTests.length > 0) {
          const testItem = localTests[0];
          setLatestTest(testItem);
          if (!studentProfile) {
            setStudentProfile({
              full_name: testItem.athlete_name || "Bruno Díaz",
              email: "bruno@wildwolves.mx",
              jersey_number: 11,
              position: "GUARD (SG)",
              role: "student"
            });
          }
        }
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

  // Descargar Reporte Completo en HTML
  const handleDownloadFullReport = () => {
    const reportHtml = generateFullReportHTML({
      studentName,
      jerseyNumber: studentProfile?.jersey_number || 11,
      category: studentProfile?.category || "U-17 Competitivo",
      age: 15,
      heightCm: 176,
      wingspanCm: 180,
      verticalJumpCm: latestTest?.vertical_jump_cm || 45,
      evaluationDate: latestTest?.evaluation_date || "27 Octubre 2026",
      overallOvr: latestTest?.overall_ovr || 72,
      tierName: studentProfile?.current_tier || "Intermedio",
      freeThrowsMade: latestTest?.free_throws_made ?? 7,
      midRangeLeftMade: latestTest?.mid_range_made ? Math.round(latestTest.mid_range_made / 2) : 6,
      midRangeRightMade: latestTest?.mid_range_made ? Math.floor(latestTest.mid_range_made / 2) : 5,
      threeCornerLeftMade: latestTest?.spot_corner_left ?? 3,
      threeWingLeftMade: latestTest?.spot_wing_left ?? 3,
      threeTopKeyMade: latestTest?.spot_top_key ?? 4,
      threeWingRightMade: latestTest?.spot_wing_right ?? 3,
      threeCornerRightMade: latestTest?.spot_corner_right ?? 2,
      jumpRopeCount: latestTest?.jump_rope_count ?? 45,
      circuitLinesSeconds: latestTest?.lines_round_trip_seconds ?? 22.4,
      sprint100mSeconds: latestTest?.sprint_100m_seconds ?? 13.8,
      attendanceCount,
      attendanceGoal: 16,
      financialStatus,
      currentDebtAmount: debtAmount,
      goodHabits: [
        "Alineación simétrica de pies en tiros libres y fase de carga con rodillas flexionadas.",
        "Excelente tiempo de reacción en el circuito de agilidad lateral en Deportivo Carmen Serdán.",
        "Compromiso y puntualidad verificada por el cuerpo técnico."
      ],
      badHabitsToFix: [
        "Tiende a bajar la mano derecha antes de que el balón entre en tiros de tres puntos (rompe el follow-through).",
        "En la batería 3x25, apresura las últimas 5 sentadillas perdiendo los 90° de profundidad requeridos."
      ],
      tallDefenderStrategy: "Por su estatura de 1.76m frente a defensas de más de 1.85m: Debe evitar bandejas rectas bajo el tablero. Se recomienda utilizar finta de tiro en suspensión a media distancia, flotadora bombeada y salida rápida con paso lateral (step-back).",
      wristMechanicsNotes: "En lanzamientos de alta velocidad: Mantener el quiebre de muñeca (" + '"' + "mano en el tarro de galletas" + '"' + ") durante 1 segundo tras soltar el balón para imprimir rotación óptima al tiro.",
      nutritionSleepNotes: "Dormir mínimo 8.5 horas continuas para favorecer la hormona de crecimiento y la recuperación del sistema nervioso central tras entrenamientos intensos en duela.",
      coachFeedback: latestTest?.coach_feedback || "Atleta con enorme potencial y disciplina en cancha. Enfocado en consolidar el rango Avanzado."
    });

    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Expediente_Oficial_${studentName.replace(/\s+/g, "_")}_WildWolves.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <button
              onClick={handleDownloadFullReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              title="Descargar expediente en un solo archivo HTML interactivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Expediente HTML</span>
            </button>

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
                  <Target className="w-3.5 h-3.5 text-purple-400" /> Nivel de Juego (OVR)
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                  latestTest ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {latestTest ? `${latestTest.athletic_level_assessed?.replace("_", " ").toUpperCase() || "FORMATIVO"}` : "Día 1 Pendiente"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
                  {latestTest ? `${latestTest.overall_ovr} OVR` : "Sin Calificar"}
                </div>
                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                  {latestTest?.coach_feedback || "El Head Coach Ricardo calibrará sus 6 pruebas deportivas oficiales (10 tiros libres, 10 media izquierda, 10 media derecha, 25 triples en 5 spots, saltos de cuerda y los 2 circuitos de velocidad) en su próxima evaluación en duela."}
                </p>
              </div>
            </div>

            {/* Resumen del último Test Oficial */}
            {latestTest && (
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-2.5 rounded-xl border border-zinc-800/80 text-center font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 block">Tiros Libres</span>
                  <span className="text-xs font-bold text-emerald-400">{latestTest.free_throws_made ?? 0}/10</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">Triples (5 spots)</span>
                  <span className="text-xs font-bold text-amber-400">{latestTest.three_point_made ?? 0}/25</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">Cuerda / Sprint</span>
                  <span className="text-xs font-bold text-sky-400">{latestTest.jump_rope_count ?? 0}s / {latestTest.sprint_100m_seconds ? `${latestTest.sprint_100m_seconds}s` : "--"}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400 flex justify-between items-center">
              <span>Escala Oficial Wild Wolves</span>
              <span className="text-purple-400 font-bold">{studentProfile?.current_tier?.toUpperCase() || "TIER PRINCIPIANTE"}</span>
            </div>
          </div>

        </div>

        {/* MAPA DE CALOR ESTILO HOMECOURT PARA FAMILIAS Y TUTORES (PRECISION SVG V4) */}
        <CourtHeatmapPro
          freeThrowsMade={latestTest?.free_throws_made ?? 10}
          freeThrowsAttempted={10}
          midLeftMade={latestTest?.mid_range_made ? Math.round(latestTest.mid_range_made / 2) : 10}
          midLeftAttempted={10}
          midRightMade={latestTest?.mid_range_made ? Math.floor(latestTest.mid_range_made / 2) : 10}
          midRightAttempted={10}
          cornerLeftMade={latestTest?.spot_corner_left ?? 3}
          cornerLeftAttempted={5}
          wingLeftMade={latestTest?.spot_wing_left ?? 3}
          wingLeftAttempted={5}
          topKeyMade={latestTest?.spot_top_key ?? 4}
          topKeyAttempted={5}
          wingRightMade={latestTest?.spot_wing_right ?? 3}
          wingRightAttempted={5}
          cornerRightMade={latestTest?.spot_corner_right ?? 2}
          cornerRightAttempted={5}
        />

        {/* SHOT SCIENCE Y VOLUMEN HISTÓRICO HOMECOURT PARA PADRES */}
        <ShotScienceDashboard 
          athleteName={studentName}
          isCoachView={false}
        />

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

        {/* BANNER PROMOCIONAL FREEMIUM DE ENTRENADOR IA PARA PADRES */}
        <div className="bg-gradient-to-r from-orange-950/40 via-[#16121e] to-[#0d1017] border border-orange-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Próximamente • En Pruebas de Duela
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  3 informes completos de cortesía al mes
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase text-white mt-0.5">
                Entrenador Asistente IA (Visión por Computadora)
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                Estamos concluyendo la calibración en cancha de Carmen Serdán. Cada alumno contará con 3 informes automáticos de tiro, postura y salud al mes. Con la membresía Lobo Pro, las familias acceden a 100 informes mensuales con táctica frente a defensas más altos y reportes descargables.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProModal(true)}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
          >
            Ver Beneficios Lobo Pro
          </button>
        </div>

      </main>

      {/* MODAL PRO FAMILIAR */}
      <LoboProModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        studentName={studentName}
      />

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-[10px] font-mono text-zinc-500">
        Wild Wolves Basketball Academy CDMX • Deportivo Carmen Serdán • Sistema Oficial de Acompañamiento Familiar
      </footer>

    </div>
  );
}
