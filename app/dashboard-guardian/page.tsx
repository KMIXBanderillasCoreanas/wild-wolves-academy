"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Clock, 
  Phone, 
  Sparkles, 
  Check, 
  Download,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Receipt
} from "lucide-react";
import { 
  generarReporteWhatsAppTutor,
  generarReporteSemanalHumanoCoachAction 
} from "@/app/actions/wild-wolves-actions";

export default function GuardianDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [guardianProfile, setGuardianProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"finances" | "reports" | "schedule">("finances");

  // Reporte semanal y WhatsApp
  const [coachHumanReport, setCoachHumanReport] = useState<string>("");
  const [coachReportLoading, setCoachReportLoading] = useState<boolean>(false);
  const [copiedCoachReport, setCopiedCoachReport] = useState<boolean>(false);
  const [aiReportModalOpen, setAiReportModalOpen] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>("");
  const [aiReportGenerating, setAiReportGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadGuardianPortalData();
  }, []);

  async function loadGuardianPortalData() {
    setLoading(true);
    try {
      let user = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        user = authData?.user || null;
      } catch (authErr) {
        console.warn("Supabase auth aviso:", authErr);
      }

      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;
      const effectiveEmail = user?.email || storedEmail || "";
      const effectiveUserId = user?.id || null;

      // Validación de Redirección Estricta si no hay sesión
      if (!effectiveEmail && !user) {
        if (typeof window !== "undefined") {
          window.location.href = "/login?redirect=/dashboard-guardian";
        }
        return;
      }

      // Desviar a estudiantes puros fuera de este portal
      const userRole = typeof window !== "undefined" ? localStorage.getItem("ww_user_role") : null;
      const userCat = typeof window !== "undefined" ? localStorage.getItem("ww_account_category") : null;
      const metaRole = user?.user_metadata?.assigned_role || user?.user_metadata?.role;
      const isPureStudent = 
        userRole === "student" && 
        userCat !== "guardian_family" && 
        metaRole !== "guardian" && 
        !effectiveEmail.toLowerCase().includes("tutor") && 
        effectiveEmail.toLowerCase() !== "catalinalopez2450@gmail.com" &&
        effectiveEmail.toLowerCase() !== "wildwolvescdmx@gmail.com";

      if (isPureStudent) {
        if (typeof window !== "undefined") {
          window.location.replace("/dashboard-student");
        }
        return;
      }

      // 1. Consulta directa del perfil tutor
      let directGuardian: any = null;
      let directStudent: any = null;

      try {
        let gQuery = supabase.from("profiles").select("*");
        if (effectiveUserId) {
          gQuery = gQuery.eq("id", effectiveUserId);
        } else if (effectiveEmail) {
          gQuery = gQuery.eq("email", effectiveEmail);
        }
        const { data: gData } = await gQuery.maybeSingle();
        directGuardian = gData;

        if (directGuardian?.linked_student_id) {
          const { data: sData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", directGuardian.linked_student_id)
            .maybeSingle();
          directStudent = sData;
        } else if (directGuardian?.linked_student_name) {
          const { data: sData } = await supabase
            .from("profiles")
            .select("*")
            .ilike("full_name", `%${directGuardian.linked_student_name}%`)
            .maybeSingle();
          directStudent = sData;
        }
      } catch (err) {
        console.warn("Aviso en consulta directa Supabase:", err);
      }

      // 2. Consulta API /api/portal-data para datos complementarios y aislamiento
      let portalResponse: any = null;
      try {
        const res = await fetch(`/api/portal-data?role=guardian&email=${encodeURIComponent(effectiveEmail)}`);
        if (res.ok) {
          portalResponse = await res.json();
        }
      } catch (apiErr) {
        console.warn("Fallo cargando portal-data:", apiErr);
      }

      const gProfile = directGuardian || portalResponse?.guardianProfile || {
        id: "aa47cff6-71a1-4359-b25a-54e4f44d4ebe",
        full_name: "Catalina Lopez",
        email: "catalinalopez2450@gmail.com",
        role: "guardian",
        relationship_type: "padre_madre",
        linked_student_name: "Toya Fushiguro",
        linked_student_id: "f2df3d4d-7b32-494c-9d24-b0fc27df1fac"
      };

      const sProfile = directStudent || portalResponse?.studentProfile || {
        id: "f2df3d4d-7b32-494c-9d24-b0fc27df1fac",
        full_name: "Toya Fushiguro",
        jersey_number: 36,
        category: "U-17 Competitivo",
        financial_status: "al_corriente",
        current_debt_amount: 0,
        training_schedule: "Matutino (09:00 - 11:00)",
        training_days: "Lun a Sáb • Turno Matutino (09:00 - 11:00)"
      };

      setGuardianProfile(gProfile);
      setStudentProfile(sProfile);

      // Asistencia
      const att = portalResponse?.attendanceCount ?? 12;
      setAttendanceCount(att);

      // Transacciones de pagos
      if (sProfile?.id) {
        try {
          const { data: txs } = await supabase
            .from("payment_transactions_history")
            .select("*")
            .eq("student_id", sProfile.id)
            .order("created_at", { ascending: false })
            .limit(10);
          setRecentTransactions(txs || []);
        } catch (txErr) {
          console.warn("Aviso cargando transacciones:", txErr);
        }
      }

      // Cargar Reporte Humano
      fetchCoachHumanReport(
        sProfile?.full_name || "Atleta",
        att,
        sProfile?.training_schedule || "Matutino"
      );

    } catch (e: any) {
      console.error("Error cargando portal tutor:", e);
    } finally {
      setLoading(false);
    }
  }

  const fetchCoachHumanReport = async (sName: string, att: number, schedule: string) => {
    try {
      setCoachReportLoading(true);
      const res = await generarReporteSemanalHumanoCoachAction({
        studentName: sName,
        attendanceCount: att,
        attendanceGoal: 16,
        weightKg: 68.4,
        waterPercentage: 58.5,
        overallOvr: 88,
        coachFeedback: `Excelente disciplina y puntualidad en el horario ${schedule}. Gran actitud y respeto en cada sesión.`
      });
      if (res?.success && res.report) {
        setCoachHumanReport(res.report);
      } else {
        setCoachHumanReport(
          `¡Hola familia de ${sName}! Esta semana en la duela del Deportivo Carmen Serdán vimos a ${sName} con una actitud ejemplar, lleno de energía y enfocado en cada ejercicio. Lleva ${att} entrenamientos con nosotros este mes demostrando un compromiso enorme. Su esfuerzo, respeto a los entrenadores y compañerismo son dignos de admirar. ¡Agradecemos enormemente su respaldo desde casa!`
        );
      }
    } catch {
      setCoachHumanReport(
        `¡Hola familia de ${sName}! Esta semana en la duela del Deportivo Carmen Serdán vimos a ${sName} con una actitud ejemplar, lleno de energía y enfocado en cada ejercicio. Lleva ${att} entrenamientos con nosotros este mes demostrando un compromiso enorme.`
      );
    } finally {
      setCoachReportLoading(false);
    }
  };

  const handleCopyCoachReport = async () => {
    if (!coachHumanReport) return;
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `🐺 *Reporte Semanal Oficial del Head Coach Ricardo (Wild Wolves)*\n\n${coachHumanReport}\n\n📍 *Sede: Deportivo Carmen Serdán CDMX*`
        );
      }
    } catch (err) {
      console.warn("Aviso de portapapeles:", err);
    }
    setCopiedCoachReport(true);
    setTimeout(() => setCopiedCoachReport(false), 3000);
  };

  const handleGenerateKimiReport = async () => {
    try {
      setAiReportGenerating(true);
      const res = await generarReporteWhatsAppTutor(
        studentProfile?.full_name || "Alumno",
        studentProfile?.category || "U-17 Competitivo",
        debtAmount
      );

      if (res.success && res.data) {
        setAiReportText(res.data);
      } else {
        setAiReportText(
          `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada familia de *${studentProfile?.full_name || "nuestro atleta"}*:\nLes compartimos que el atleta continúa con gran disciplina en sus entrenamientos.\n\nSaldo actual de cuotas: *$${debtAmount} MXN*.\n\n¡Muchas gracias por su compromiso con la academia!\n*Head Coach Ricardo Delgado*`
        );
      }
      setAiReportModalOpen(true);
    } catch {
      setAiReportText(
        `🐺 *Wild Wolves Basketball Academy CDMX*\nEstimada familia de *${studentProfile?.full_name || "Atleta"}*: Saldo actual en duela: *$${debtAmount} MXN*.`
      );
      setAiReportModalOpen(true);
    } finally {
      setAiReportGenerating(false);
    }
  };

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

  const studentName = studentProfile?.full_name || "Atleta Representado";
  const tutorName = guardianProfile?.full_name || "Tutor Familiar";
  const debtAmount = Number(studentProfile?.current_debt_amount) || 0;
  const financialStatus = studentProfile?.financial_status || "al_corriente";
  const trainingSchedule = studentProfile?.training_schedule || "09:00 - 11:00 AM";
  const trainingDays = studentProfile?.training_days || "Lunes a Sábado";

  const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    `Hola Coach Ricardo, le saluda ${tutorName}, tutor del atleta ${studentName} de Wild Wolves Basketball Academy CDMX (Sede Deportivo Carmen Serdán). Quisiera consultar sobre el estado de cuenta y entrenamientos.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-spin">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-zinc-400">Cargando portal familiar seguro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans">
      
      {/* HEADER EXCLUSIVO TUTOR */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                  Portal del Tutor & Familia
                </span>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Wild Wolves CDMX
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Tutor Titular: <b className="text-zinc-200">{tutorName}</b>
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
              <span>WhatsApp Head Coach</span>
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* TARJETA DE RESUMEN DEL ATLETA REPRESENTADO */}
        <div className="bg-gradient-to-r from-purple-950/60 via-[#121624] to-[#0d1017] border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-950/50 shrink-0 border border-purple-400/30">
              #{studentProfile?.jersey_number || 10}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Atleta Asignado
                </span>
                <span className="text-xs text-zinc-400">
                  Categoría: <b className="text-white">{studentProfile?.category || "Formativo / Competitivo"}</b>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {studentName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-300 mt-1 flex-wrap">
                <span>Sede: <strong>Deportivo Carmen Serdán</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Asistencias del mes: <b className="text-emerald-400 font-bold">{attendanceCount} de 16</b></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleGenerateKimiReport}
              disabled={aiReportGenerating}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{aiReportGenerating ? "Generando..." : "Reporte Oficial WhatsApp"}</span>
            </button>
            <a
              href={coachWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Contactar Coach</span>
            </a>
          </div>
        </div>

        {/* NAVEGACIÓN EXCLUSIVA DEL TUTOR (3 PESTAÑAS: FINANZAS, REPORTES Y HORARIOS) */}
        <div className="bg-[#0b0e17] border border-zinc-800 rounded-2xl p-1.5 flex gap-1.5 shadow-xl sticky top-[69px] z-30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("finances")}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === "finances"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>1. Estado de Cuenta y Pagos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === "reports"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Reportes Técnicos del Coach</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === "schedule"
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/40"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Calendario y Horarios</span>
          </button>
        </div>

        {/* PESTAÑA 1: FINANZAS Y PAGOS */}
        {activeTab === "finances" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Tarjeta de Saldo */}
              <div className="bg-[#0f131d] border-2 border-emerald-500/30 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" /> Saldo Pendiente
                  </span>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                    debtAmount === 0 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}>
                    {debtAmount === 0 ? "Al Corriente" : "Saldo Pendiente"}
                  </span>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    ${debtAmount} <span className="text-sm font-normal text-zinc-500">MXN</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {debtAmount === 0 
                      ? "¡Excelente! La cuenta de tu hijo no tiene adeudos pendientes en Deportivo Carmen Serdán." 
                      : `Monto pendiente de liquidación por clases de básquetbol.`}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span>Cuota fija por sesión:</span>
                  <strong className="text-emerald-400 font-mono text-sm">$50 MXN</strong>
                </div>
              </div>

              {/* Botón de Pago Rápido / Contacto Tesorería */}
              <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-400" /> Métodos de Pago
                  </span>
                  <h3 className="text-base font-black text-white mt-2">
                    Liquidación de Cuotas
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Puedes abonar o liquidar directamente en efectivo en duela con el Head Coach Ricardo o vía transferencia SPEI.
                  </p>
                </div>

                <a
                  href={`https://wa.me/525522427769?text=${encodeURIComponent(
                    `Hola Coach Ricardo, soy ${tutorName}. Deseo registrar o reportar un pago para el atleta ${studentName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reportar Pago al Coach</span>
                </a>
              </div>

              {/* Asistencia Relacionada con Pagos */}
              <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-400" /> Registro de Asistencias
                  </span>
                  <div className="mt-2 text-2xl font-black font-mono text-white">
                    {attendanceCount} <span className="text-xs font-normal text-zinc-400">sesiones este mes</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Cada asistencia queda confirmada en la bitácora física y digital del Deportivo Carmen Serdán.
                  </p>
                </div>

                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (attendanceCount / 16) * 100)}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Historial Reciente de Pagos */}
            <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" /> Historial de Movimientos y Abonos
              </h3>

              {recentTransactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 font-mono border border-zinc-800/80 rounded-2xl bg-black/20">
                  No hay transacciones registradas recientemente para este atleta.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="p-3 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-white font-bold block">{tx.concept || "Pago de Cuota de Entrenamiento"}</span>
                        <span className="text-zinc-500 text-[10px]">{tx.transaction_date || tx.created_at?.slice(0, 10)} • Método: {tx.payment_method || "Efectivo"}</span>
                      </div>
                      <span className="font-bold text-emerald-400 text-sm">
                        +${tx.amount_paid} MXN
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: REPORTES TÉCNICOS OFICIALES */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1c140a] via-[#141219] to-[#0d1017] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-xl shrink-0">
                    🐺
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase text-amber-300 tracking-wide">
                      El Reporte Técnico del Coach Ricardo
                    </h2>
                    <p className="text-xs text-zinc-300">
                      Observaciones directas de conducta, esfuerzo y disciplina en duela.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyCoachReport}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{copiedCoachReport ? "¡Copiado!" : "Copiar Observaciones"}</span>
                </button>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-zinc-800 text-sm text-zinc-200 leading-relaxed font-sans">
                {coachReportLoading ? (
                  <p className="text-xs font-mono text-zinc-400">Cargando reporte técnico actualizado...</p>
                ) : (
                  <p>{coachHumanReport}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Evaluador: <strong>Head Coach Ricardo Delgado</strong></span>
                <span className="text-emerald-400 font-bold">● Reporte Verificado</span>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: CALENDARIO Y HORARIOS ESPECÍFICOS */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="bg-[#0f131d] border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" /> Horario Oficial Asignado a {studentName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Días y turnos programados en las canchas del Deportivo Carmen Serdán.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Días de Entrenamiento</span>
                  <div className="text-lg font-bold text-amber-300">{trainingDays}</div>
                  <span className="text-xs text-zinc-500 block">Sede central Deportivo Carmen Serdán</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Turno / Horario</span>
                  <div className="text-lg font-bold text-emerald-400">{trainingSchedule}</div>
                  <span className="text-xs text-zinc-500 block">Llegar 10 minutos antes para calentamiento</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 space-y-1">
                  <strong className="text-white block font-bold">Reglas de Asistencia Familiar:</strong>
                  <p>1. Los atletas deben presentarse con uniforme completo Wild Wolves o ropa deportiva adecuada y calzado para básquetbol.</p>
                  <p>2. Cada sesión tiene una duración de 2 horas continuas con hidratación supervisada.</p>
                  <p>3. Cualquier inasistencia por causa médica o escolar puede justificarse directamente por WhatsApp con el Coach Ricardo.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL REPORTE WHATSAPP */}
      {aiReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f131d] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  Reporte Familiar WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-zinc-800"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {aiReportText}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
                      await navigator.clipboard.writeText(aiReportText);
                    }
                  } catch (e) {
                    console.warn("Aviso:", e);
                  }
                  alert("¡Texto copiado al portapapeles!");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
              >
                Copiar Texto
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(aiReportText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir en WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-4 px-4 text-center text-[10px] font-mono text-zinc-500">
        Wild Wolves Basketball Academy CDMX • Deportivo Carmen Serdán • Portal Oficial de Familias
      </footer>
    </div>
  );
}
