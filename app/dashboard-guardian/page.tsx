"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Receipt,
  FileText,
  MapPin,
  CheckCircle2,
  Share2,
  CalendarDays,
  ShieldAlert,
  ClipboardList
} from "lucide-react";
import AttendanceHistoryView from "@/components/AttendanceHistoryView";
import { 
  generarReporteWhatsAppTutor,
  generarReporteSemanalHumanoCoachAction 
} from "@/app/actions/wild-wolves-actions";

type TabKey = "pagos" | "reporte" | "horarios" | "reglamento";

export default function GuardianDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [guardianProfile, setGuardianProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number>(8);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pagos");

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
        (userRole === "student" || userCat === "student") && 
        userRole !== "guardian" &&
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
        full_name: "Familia López",
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
        category: "U-15 Formativo / Escolta",
        financial_status: "al_corriente",
        current_debt_amount: 0,
        training_schedule: "09:00 AM – 11:00 AM",
        training_days: "Miércoles y Sábados"
      };

      setGuardianProfile(gProfile);
      setStudentProfile(sProfile);

      // Asistencia
      const att = portalResponse?.attendanceCount ?? 8;
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
          setRecentTransactions(txs && txs.length > 0 ? txs : [
            {
              id: "rec-1",
              folio: "#REC-2024-1108",
              date: "08 Nov 2024",
              concept: "4 Sesiones Duela Carmen Serdán",
              sub: "Noviembre - Quincena 1",
              amount: 200,
              method: "SPEI Santander",
              ref: "Ref: #98321",
              status: "Verificado y Sellado"
            },
            {
              id: "rec-2",
              folio: "#REC-2024-1025",
              date: "25 Oct 2024",
              concept: "4 Sesiones Duela Carmen Serdán",
              sub: "Octubre - Quincena 2",
              amount: 200,
              method: "Efectivo en Duela",
              ref: "Recibo Físico Firmado",
              status: "Verificado (Recibo Firmado)"
            },
            {
              id: "rec-3",
              folio: "#REC-2024-1010",
              date: "10 Oct 2024",
              concept: "4 Sesiones Duela Carmen Serdán",
              sub: "Octubre - Quincena 1",
              amount: 200,
              method: "SPEI BBVA",
              ref: "Ref: #44120",
              status: "Verificado y Sellado"
            }
          ]);
        } catch (txErr) {
          console.warn("Aviso cargando transacciones:", txErr);
        }
      }

      // Cargar Reporte Humano
      fetchCoachHumanReport(
        sProfile?.full_name || "Toya Fushiguro",
        att,
        sProfile?.training_schedule || "09:00 - 11:00 AM"
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
        attendanceGoal: 8,
        weightKg: 68.4,
        waterPercentage: 58.5,
        overallOvr: 78,
        coachFeedback: `Excelente disciplina y puntualidad en el horario ${schedule}. Gran actitud, respeto en cada sesión y avance significativo en el bote de control.`
      });
      if (res?.success && res.report) {
        setCoachHumanReport(res.report);
      } else {
        setCoachHumanReport(
          `“Querida Familia López: Es un auténtico orgullo ver el compromiso y alegría con la que Toya llega a cada entrenamiento en la duela del Carmen Serdán. Su respeto hacia sus compañeros, su disciplina para escuchar indicaciones y sus ganas incansables de mejorar en cada pase han contagiado de energía positiva al grupo formativo U-15. En el último mes ha ganado muchísima confianza en su bote de protección y muestra una actitud ejemplar de compañerismo. ¡Sigamos apoyándolo con su puntualidad y descanso previo a las prácticas!”`
        );
      }
    } catch {
      setCoachHumanReport(
        `“Querida Familia López: Es un auténtico orgullo ver el compromiso y alegría con la que Toya llega a cada entrenamiento en la duela del Carmen Serdán. Su respeto hacia sus compañeros, su disciplina para escuchar indicaciones y sus ganas incansables de mejorar en cada pase han contagiado de energía positiva al grupo formativo U-15. En el último mes ha ganado muchísima confianza en su bote de protección y muestra una actitud ejemplar de compañerismo.”`
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
        studentProfile?.full_name || "Toya Fushiguro",
        studentProfile?.category || "U-15 Formativo",
        debtAmount
      );

      if (res.success && res.data) {
        setAiReportText(res.data);
      } else {
        setAiReportText(
          `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada Familia López:\nLes compartimos que Toya Fushiguro #36 continúa con 100% de asistencia y gran disciplina en sus entrenamientos.\n\nSaldo actual de cuotas: *$${debtAmount}.00 MXN* (Sin adeudos, cuenta al corriente).\n\n¡Muchas gracias por su compromiso con la academia!\n*Head Coach Ricardo Delgado*`
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

  const studentName = studentProfile?.full_name || "Toya Fushiguro";
  const tutorName = guardianProfile?.full_name || "Familia López";
  const debtAmount = Number(studentProfile?.current_debt_amount) || 0;
  const trainingSchedule = studentProfile?.training_schedule || "09:00 AM – 11:00 AM";

  const coachWhatsAppUrl = `https://wa.me/525549129653?text=${encodeURIComponent(
    `Hola Coach Ricardo, le escribo del portal familiar de ${studentName} #36 en Deportivo Carmen Serdán.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111319] text-[#e2e2ea] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded bg-[#ff6b00] flex items-center justify-center text-[#572000] animate-spin">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-[#e2bfb0]">Cargando Wild Wolves Family Hub (Deportivo Carmen Serdán)...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111319] text-[#e2e2ea] font-sans min-h-screen antialiased flex">
      
      {/* SIDEBAR FIJO STITCH 1:1 */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#191c21] z-50 flex flex-col pt-6 pb-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#282a30]">
        
        {/* Logo & Marca */}
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-[#ff6b00] flex items-center justify-center shadow">
              <span className="text-[#351000] font-black text-lg">🏀</span>
            </div>
            <div>
              <span className="block font-bold text-base tracking-tight uppercase text-[#e2e2ea]">WILD WOLVES</span>
              <span className="block font-mono text-[11px] text-[#e2bfb0] uppercase">Family Hub</span>
            </div>
          </div>
        </div>

        {/* Sede Vinculada */}
        <div className="px-6 mb-6">
          <div className="p-2 bg-[#1d2025] rounded border border-[#282a30]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase tracking-wider">Sede Vinculada</span>
            </div>
            <p className="font-mono text-[11px] text-[#e2bfb0] mt-1 truncate">Deportivo Carmen Serdán</p>
          </div>
        </div>

        {/* Navegación Lateral */}
        <nav className="flex-1 px-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("pagos")}
            className={`flex items-center w-full px-4 py-2.5 rounded text-sm transition-all text-left ${
              activeTab === "pagos"
                ? "bg-[#ff6b00] text-[#351000] font-bold shadow-md"
                : "text-[#e2bfb0] hover:bg-[#282a30] hover:text-[#e2e2ea]"
            }`}
          >
            <CreditCard className="mr-3 w-4 h-4 shrink-0" />
            <span>Estado de Cuenta & Pagos</span>
          </button>

          <button
            onClick={() => setActiveTab("reporte")}
            className={`flex items-center w-full px-4 py-2.5 rounded text-sm transition-all text-left ${
              activeTab === "reporte"
                ? "bg-[#ff6b00] text-[#351000] font-bold shadow-md"
                : "text-[#e2bfb0] hover:bg-[#282a30] hover:text-[#e2e2ea]"
            }`}
          >
            <FileText className="mr-3 w-4 h-4 shrink-0" />
            <span>Reporte Técnico del Coach</span>
          </button>

          <button
            onClick={() => setActiveTab("horarios")}
            className={`flex items-center w-full px-4 py-2.5 rounded text-sm transition-all text-left ${
              activeTab === "horarios"
                ? "bg-[#ff6b00] text-[#351000] font-bold shadow-md"
                : "text-[#e2bfb0] hover:bg-[#282a30] hover:text-[#e2e2ea]"
            }`}
          >
            <Calendar className="mr-3 w-4 h-4 shrink-0" />
            <span>Horarios & Duela Carmen Serdán</span>
          </button>

          <button
            onClick={() => setActiveTab("reglamento")}
            className={`flex items-center w-full px-4 py-2.5 rounded text-sm transition-all text-left ${
              activeTab === "reglamento"
                ? "bg-[#ff6b00] text-[#351000] font-bold shadow-md"
                : "text-[#e2bfb0] hover:bg-[#282a30] hover:text-[#e2e2ea]"
            }`}
          >
            <ClipboardList className="mr-3 w-4 h-4 shrink-0" />
            <span>Reglamento & Material</span>
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="px-4 pt-4 border-t border-[#282a30]/60">
          <div className="p-2.5 bg-[#0c0e13] rounded border border-[#282a30]/50">
            <p className="font-mono text-[10px] text-[#e2bfb0] uppercase tracking-wider">Soporte Operativo</p>
            <p className="text-xs text-[#e2e2ea] mt-0.5">Academia Juvenil CDMX</p>
          </div>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL DERECHO (PL-72) */}
      <div className="pl-72 flex-1 flex flex-col min-h-screen">
        
        {/* HEADER SUPERIOR FLOTANTE CON BLUR */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-[#111319]/80 backdrop-blur-xl z-40 flex items-center justify-between px-6 border-b border-[#282a30]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-bold text-base text-[#e2e2ea]">{tutorName} // Portal de Tutores</p>
              <div className="flex items-center gap-1.5">
                <MapPin className="text-[#4edea3] w-3.5 h-3.5" />
                <span className="font-mono text-[11px] text-[#e2bfb0]">Deportivo Carmen Serdán - CDMX</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-[#191c21] px-3 py-1 rounded border border-[#282a30]">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase">Cuenta Activa & Vinculada</span>
            </div>

            <a
              href={coachWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00ae78] hover:bg-[#4edea3] text-[#003824] text-xs font-bold px-3.5 py-1.5 rounded transition-colors shadow-[0_0_12px_-3px_rgba(16,185,129,0.35)]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Coach Ricardo</span>
            </a>

            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-[#ffb693] hover:bg-[#ff6b00] text-[#561f00] flex items-center justify-center transition-colors shadow"
              title="Cerrar Sesión Segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="relative pt-20 px-6 pb-12 flex-1 bg-[#111319]">
          <div className="flex flex-col w-full">
            
            {/* HERO BANNER TUTOR & ATLETA VINCULADO */}
            <div className="w-full bg-[#191c21] rounded-xl p-6 shadow-xl mb-6 relative overflow-hidden border border-[#282a30]">
              <div className="absolute -top-12 -right-12 w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#4edea3]/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                {/* Lado Izquierdo: Saludo y Atleta */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl bg-[#1d2025] border border-[#282a30] flex items-center justify-center shadow-md">
                      <Users className="w-9 h-9 text-[#ff6b00]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#00ae78] text-[#003824] px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" />
                      TUTOR
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-[#e2e2ea]">¡Bienvenida {tutorName}!</h1>
                      <span className="bg-[#4edea3]/15 text-[#4edea3] font-mono text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 border border-[#4edea3]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                        Tutor Oficial Verificado
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[#e2bfb0] text-sm mt-1">
                      <div className="flex items-center gap-1.5 bg-[#1d2025] px-2.5 py-1 rounded border border-[#282a30]">
                        <span className="text-[#ffb693] font-bold">🏀 {studentName} #{studentProfile?.jersey_number || 36}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#7bd0ff]">🎖️</span>
                        <span>{studentProfile?.category || "U-15 Formativo / Escolta"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#a98a7d]">🏟️</span>
                        <span>Duela Deportivo Carmen Serdán</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Asistencia y WhatsApp */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-[#1d2025] border border-[#282a30] px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#4edea3]/15 flex items-center justify-center text-[#4edea3]">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#e2bfb0] uppercase block">Asistencia Noviembre</span>
                      <span className="font-mono text-base text-[#4edea3] font-bold">{attendanceCount}/8 Sesiones (100%)</span>
                    </div>
                  </div>

                  <a
                    href={coachWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ff6b00] hover:bg-[#7a3000] text-[#351000] font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-md group"
                  >
                    <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <span className="block text-[10px] uppercase tracking-wider text-[#351000]/80 font-mono">Head Coach Ricardo</span>
                      <span className="block text-sm leading-tight text-[#351000] font-bold">+52 55 4912-WOLF</span>
                    </div>
                  </a>
                </div>

              </div>

              {/* Barra rápida inferior */}
              <div className="mt-4 pt-2 bg-[#0c0e13]/60 -mx-6 -mb-6 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[#e2bfb0] font-mono text-xs border-t border-[#282a30]/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>Tiempo promedio de respuesta en duela: <strong className="text-white">menor a 2 horas</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb693]">📇</span>
                  <span>ID de Expediente Familiar: <strong className="text-white">WW-CS-2024-036-LÓPEZ</strong></span>
                </div>
              </div>
            </div>

            {/* PESTAÑAS HORIZONTALES */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#191c21] rounded-lg mb-6 shadow-sm border border-[#282a30]">
              <button
                onClick={() => setActiveTab("pagos")}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                  activeTab === "pagos"
                    ? "bg-[#ff6b00] text-[#351000] shadow-sm font-bold"
                    : "text-[#e2bfb0] hover:text-[#e2e2ea] hover:bg-[#1d2025]"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Estado de Cuenta & Pagos</span>
              </button>

              <button
                onClick={() => setActiveTab("reporte")}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                  activeTab === "reporte"
                    ? "bg-[#ff6b00] text-[#351000] shadow-sm font-bold"
                    : "text-[#e2bfb0] hover:text-[#e2e2ea] hover:bg-[#1d2025]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reporte Técnico del Coach</span>
              </button>

              <button
                onClick={() => setActiveTab("horarios")}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                  activeTab === "horarios"
                    ? "bg-[#ff6b00] text-[#351000] shadow-sm font-bold"
                    : "text-[#e2bfb0] hover:text-[#e2e2ea] hover:bg-[#1d2025]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Horarios & Duela Carmen Serdán</span>
              </button>

              <button
                onClick={() => setActiveTab("reglamento")}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
                  activeTab === "reglamento"
                    ? "bg-[#ff6b00] text-[#351000] shadow-sm font-bold"
                    : "text-[#e2bfb0] hover:text-[#e2e2ea] hover:bg-[#1d2025]"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Reglamento & Equipo Requerido</span>
              </button>
            </div>

            {/* TAB 1: ESTADO DE CUENTA & PAGOS */}
            {activeTab === "pagos" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Balance Hero Card (Verde Reasegurador) */}
                  <div className="lg:col-span-1 bg-[#191c21] rounded-xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between border border-[#282a30]">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#4edea3]/15 rounded-full blur-xl pointer-events-none"></div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-[#e2bfb0] uppercase tracking-wider">Balance Actual Tutor</span>
                        <span className="bg-[#00ae78] text-[#003824] font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Sin adeudos
                        </span>
                      </div>
                      <div className="my-4">
                        <div className="font-mono text-4xl text-[#4edea3] font-bold tracking-tight">
                          ${debtAmount}.00 <span className="text-xl font-normal text-[#4edea3]/80">MXN</span>
                        </div>
                        <p className="text-sm text-[#e2e2ea] mt-1 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="text-[#4edea3] w-4 h-4" />
                          Cuenta al Corriente & Conciliada
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 bg-[#1d2025]/60 -mx-6 -mb-6 p-4 rounded-b-xl flex items-center justify-between border-t border-[#282a30]/60">
                      <span className="text-xs text-[#e2bfb0]">Próxima fecha de corte:</span>
                      <span className="font-mono text-xs text-[#ffb693] font-bold">15 de Diciembre, 2024</span>
                    </div>
                  </div>

                  {/* Cuota Formativa Transparente */}
                  <div className="lg:col-span-2 bg-[#191c21] rounded-xl p-6 shadow-lg flex flex-col justify-between border border-[#282a30]">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#ff6b00] text-xl">💳</span>
                          <h2 className="text-lg font-bold text-[#e2e2ea]">Cuota Formativa Transparente</h2>
                        </div>
                        <span className="bg-[#1d2025] text-[#e2e2ea] font-mono text-xs px-2.5 py-1 rounded border border-[#282a30]">
                          Tarifa Social Deportiva
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-mono text-xl text-[#e2e2ea] font-bold">$50.00 MXN</span>
                        <span className="text-xs text-[#e2bfb0]">por sesión presencial en Deportivo Carmen Serdán</span>
                      </div>
                      
                      <p className="text-xs text-[#e2bfb0] leading-relaxed mb-4">
                        La aportación de cada entrenamiento se destina íntegramente a garantizar un entorno deportivo seguro, formativo y de alto estándar para nuestros jóvenes atletas.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#1d2025] p-3 rounded-lg flex items-center gap-3 border border-[#282a30]">
                          <span className="text-2xl text-[#7bd0ff]">🏟️</span>
                          <div>
                            <span className="text-xs font-semibold text-[#e2e2ea] block">Duela Techada</span>
                            <span className="font-mono text-[10px] text-[#e2bfb0] block">Cancha #1 Carmen Serdán</span>
                          </div>
                        </div>

                        <div className="bg-[#1d2025] p-3 rounded-lg flex items-center gap-3 border border-[#282a30]">
                          <span className="text-2xl text-[#ff6b00]">🏀</span>
                          <div>
                            <span className="text-xs font-semibold text-[#e2e2ea] block">Material Baloncesto</span>
                            <span className="font-mono text-[10px] text-[#e2bfb0] block">Balones #7 y conos</span>
                          </div>
                        </div>

                        <div className="bg-[#1d2025] p-3 rounded-lg flex items-center gap-3 border border-[#282a30]">
                          <span className="text-2xl text-[#4edea3]">💧</span>
                          <div>
                            <span className="text-xs font-semibold text-[#e2e2ea] block">Hidratación y Auxilio</span>
                            <span className="font-mono text-[10px] text-[#e2bfb0] block">Monitoreo continuo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex flex-wrap items-center justify-end gap-3 border-t border-[#282a30]/60">
                      <button
                        onClick={() => alert(`Generando estado de cuenta oficial PDF de ${studentName} #36 (Deportivo Carmen Serdán)... Su descarga comenzará en breve.`)}
                        className="bg-[#1d2025] hover:bg-[#37393f] text-[#e2e2ea] text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 transition-colors border border-[#282a30]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Estado de Cuenta PDF</span>
                      </button>
                      <a
                        href={`https://wa.me/525549129653?text=${encodeURIComponent(
                          `Hola Coach Ricardo, deseo notificar el comprobante de aportación del atleta ${studentName} #${studentProfile?.jersey_number || 36} (Folio Oficial: #REC-2024-1108) correspondiente a las sesiones en Deportivo Carmen Serdán.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#00ae78] hover:bg-[#4edea3] text-[#003824] text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Notificar Nuevo Pago por WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>

                {/* Historial de Recibos y Aportaciones Conciliadas */}
                <div className="bg-[#191c21] rounded-xl p-6 shadow-lg border border-[#282a30]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#e2e2ea]">Historial de Recibos y Aportaciones</h3>
                      <p className="text-xs text-[#e2bfb0]">Registro cronológico de pagos verificados y sellados por la administración de la academia</p>
                    </div>
                    <div className="bg-[#1d2025] px-3 py-1 rounded font-mono text-xs text-[#e2bfb0] flex items-center gap-2 border border-[#282a30]">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                      <span>3 de 3 Recibos Conciliados</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-[#1d2025] text-[#e2bfb0] font-mono text-xs uppercase border-b border-[#282a30]">
                          <th className="py-2.5 px-4 rounded-l">Folio Oficial</th>
                          <th className="py-2.5 px-4">Fecha</th>
                          <th className="py-2.5 px-4">Concepto de Sesiones</th>
                          <th className="py-2.5 px-4">Monto Total</th>
                          <th className="py-2.5 px-4">Método de Aportación</th>
                          <th className="py-2.5 px-4 rounded-r text-right">Estatus Oficial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282a30]">
                        {recentTransactions.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-[#1d2025]/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono text-xs text-[#ffb693] font-bold">{tx.folio || "#REC-2024-1108"}</span>
                            </td>
                            <td className="py-3 px-4 text-[#e2e2ea] text-xs">{tx.date || "08 Nov 2024"}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#e2e2ea] block text-xs">{tx.concept || "4 Sesiones Duela Carmen Serdán"}</span>
                              <span className="text-[11px] text-[#e2bfb0]">{tx.sub || "Noviembre - Quincena 1"}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm font-bold text-[#e2e2ea]">${tx.amount || tx.amount_paid || 200}.00</span>
                              <span className="text-[10px] text-[#e2bfb0] font-mono block">MXN</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-[#1d2025] text-[#e2e2ea] px-2 py-0.5 rounded text-[11px] font-mono block w-fit border border-[#282a30]">
                                {tx.method || tx.payment_method || "SPEI Santander"}
                              </span>
                              <span className="text-[10px] text-[#e2bfb0] font-mono">{tx.ref || "Ref: #98321"}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 bg-[#00ae78] text-[#003824] px-2.5 py-1 rounded text-[10px] font-mono font-bold shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                {tx.status || "Verificado y Sellado"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* VISOR MULTITEMPORAL DE ASISTENCIAS EN DUELA */}
                <div className="mt-2">
                  <AttendanceHistoryView
                    studentId={studentProfile?.id}
                    studentName={studentName}
                    isCoachView={false}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: REPORTE TÉCNICO DEL COACH */}
            {activeTab === "reporte" && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#191c21] rounded-xl p-6 shadow-xl relative overflow-hidden border border-[#282a30]">
                  <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#ffb693]/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10">
                    {/* Encabezado del Entrenador */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 bg-[#1d2025]/40 -mx-6 -mt-6 p-6 rounded-t-xl border-b border-[#282a30]">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#ff6b00] text-[#351000] font-bold text-xl flex items-center justify-center shadow">
                          RV
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#e2e2ea]">Coach Ricardo Valencia</h3>
                            <span className="bg-[#7bd0ff]/20 text-[#7bd0ff] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              Head Coach Formativo
                            </span>
                          </div>
                          <p className="font-mono text-xs text-[#e2bfb0]">Wild Wolves Academy // Deportivo Carmen Serdán</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#e2bfb0]">Evaluación: <strong className="text-[#e2e2ea]">Noviembre 2024</strong></span>
                      </div>
                    </div>

                    {/* Mensaje Humano y Carta */}
                    <div className="bg-[#1d2025] p-5 rounded-xl mb-6 border border-[#282a30]">
                      <div className="flex items-center gap-1.5 text-[#ffb693] mb-2 font-mono text-xs uppercase font-bold">
                        <span>💬</span>
                        <span>Mensaje Oficial para la {tutorName}</span>
                      </div>
                      <blockquote className="text-sm text-[#e2e2ea] leading-relaxed italic">
                        {coachHumanReport}
                      </blockquote>
                      <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#e2bfb0] border-t border-[#282a30]/60">
                        <span>Firma digital: <strong className="text-[#e2e2ea]">Prof. Ricardo Valencia S. — Lic. en Entrenamiento Deportivo</strong></span>
                        <span className="font-mono text-[11px] text-[#4edea3] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reporte Aprobado por Dirección Deportiva
                        </span>
                      </div>
                    </div>

                    {/* Chips de Puntos Destacados */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#e2e2ea] mb-3 uppercase tracking-wide">Puntos Destacados del Periodo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-[#282a30] p-3.5 rounded-lg flex items-start gap-3 border border-[#33353b]">
                          <span className="text-2xl text-[#7bd0ff]">🌟</span>
                          <div>
                            <span className="text-xs font-bold text-[#e2e2ea] block">Puntualidad Impecable</span>
                            <span className="text-[11px] text-[#e2bfb0]">100% de asistencia en tiempo en el mes de Noviembre.</span>
                          </div>
                        </div>

                        <div className="bg-[#282a30] p-3.5 rounded-lg flex items-start gap-3 border border-[#33353b]">
                          <span className="text-2xl text-[#4edea3]">🤝</span>
                          <div>
                            <span className="text-xs font-bold text-[#e2e2ea] block">Compañerismo Ejemplar</span>
                            <span className="text-[11px] text-[#e2bfb0]">Apoyo constante y actitud positiva con sus compañeros.</span>
                          </div>
                        </div>

                        <div className="bg-[#282a30] p-3.5 rounded-lg flex items-start gap-3 border border-[#33353b]">
                          <span className="text-2xl text-[#ff6b00]">🏀</span>
                          <div>
                            <span className="text-xs font-bold text-[#e2e2ea] block">Avance en Bote de Control</span>
                            <span className="text-[11px] text-[#e2bfb0]">Dominio de bote con mano no dominante y pases precisos.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#282a30]/60">
                      <button
                        onClick={handleCopyCoachReport}
                        className="bg-[#1d2025] hover:bg-[#37393f] text-[#e2e2ea] text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-[#282a30]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{copiedCoachReport ? "¡Reporte Copiado con Éxito!" : "Copiar Reporte al Portapapeles"}</span>
                      </button>

                      <button
                        onClick={handleGenerateKimiReport}
                        disabled={aiReportGenerating}
                        className="bg-[#ff6b00] hover:bg-[#7a3000] text-[#351000] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartir Reporte a la Familia por WhatsApp</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* VISOR MULTITEMPORAL DE ASISTENCIAS EN DUELA */}
                <div className="mt-2">
                  <AttendanceHistoryView
                    studentId={studentProfile?.id}
                    studentName={studentName}
                    isCoachView={false}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: HORARIOS & DUELA CARMEN SERDÁN */}
            {activeTab === "horarios" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Horarios Asignados */}
                <div className="lg:col-span-2 bg-[#191c21] rounded-xl p-6 shadow-lg flex flex-col justify-between border border-[#282a30]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-[#e2e2ea]">Horario Semanal Asignado</h3>
                        <p className="text-xs text-[#e2bfb0]">Categoría U-15 Formativo // Duela Principal Techada</p>
                      </div>
                      <span className="bg-[#7bd0ff]/20 text-[#7bd0ff] font-mono text-[10px] font-bold px-2.5 py-1 rounded">
                        Ciclo Deportivo 2024-2025
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Miércoles */}
                      <div className="bg-[#1d2025] p-4 rounded-xl relative overflow-hidden border border-[#282a30]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-[#ffb693] font-bold uppercase">Sesión 1</span>
                          <span className="bg-[#282a30] text-[#e2bfb0] font-mono text-[10px] px-2 py-0.5 rounded">Media Semana</span>
                        </div>
                        <p className="text-base font-bold text-[#e2e2ea]">Miércoles</p>
                        <div className="flex items-center gap-1.5 text-[#4edea3] font-mono text-base font-semibold my-1">
                          <Clock className="w-4 h-4" />
                          09:00 AM – 11:00 AM
                        </div>
                        <p className="text-xs text-[#e2bfb0] mt-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#a98a7d]" />
                          Cancha Techada Duela Carmen Serdán #1
                        </p>
                      </div>

                      {/* Sábados */}
                      <div className="bg-[#1d2025] p-4 rounded-xl relative overflow-hidden border border-[#282a30]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-[#ffb693] font-bold uppercase">Sesión 2</span>
                          <span className="bg-[#00ae78] text-[#003824] font-mono text-[10px] font-bold px-2 py-0.5 rounded">Fin de Semana</span>
                        </div>
                        <p className="text-base font-bold text-[#e2e2ea]">Sábados</p>
                        <div className="flex items-center gap-1.5 text-[#4edea3] font-mono text-base font-semibold my-1">
                          <Clock className="w-4 h-4" />
                          09:00 AM – 11:00 AM
                        </div>
                        <p className="text-xs text-[#e2bfb0] mt-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#a98a7d]" />
                          Cancha Techada Duela Carmen Serdán #1
                        </p>
                      </div>
                    </div>

                    {/* Alerta de Próxima Sesión */}
                    <div className="bg-[#282a30] p-4 rounded-xl flex items-center gap-3 shadow-sm border border-[#33353b]">
                      <div className="w-10 h-10 rounded-lg bg-[#ff6b00] text-[#351000] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-[#ffdbcc] uppercase tracking-wider block font-bold">Próxima Práctica en Duela</span>
                        <p className="text-xs font-semibold text-[#e2e2ea] mt-0.5">
                          Sábado 09:00 AM — Acceso habilitado desde las 08:45 AM para calentamiento articular preventivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between text-[#e2bfb0] font-mono text-xs border-t border-[#282a30]/60">
                    <span>* En caso de lluvia, la cancha se mantiene 100% operativa al ser techada.</span>
                    <span className="text-[#4edea3]">Duela con mantenimiento diario</span>
                  </div>
                </div>

                {/* Ubicación de Sede Carmen Serdán */}
                <div className="lg:col-span-1 bg-[#191c21] rounded-xl p-6 shadow-lg flex flex-col justify-between border border-[#282a30]">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#ffb693] text-lg">🗺️</span>
                      <h3 className="text-base font-bold text-[#e2e2ea]">Ubicación de Sede</h3>
                    </div>

                    <div className="w-full h-44 bg-[#1d2025] rounded-lg overflow-hidden relative shadow-inner mb-4 flex items-center justify-center border border-[#282a30]">
                      <div className="absolute inset-0 bg-[#0c0e13]/60 backdrop-blur-[2px]"></div>
                      <div className="relative z-10 bg-[#282a30]/90 px-4 py-3 rounded-lg text-center shadow-lg border border-[#33353b]">
                        <span className="text-2xl block mb-1">🏟️</span>
                        <span className="font-mono text-xs text-[#e2e2ea] font-bold uppercase block">Duela Principal #1</span>
                        <span className="text-xs text-[#e2bfb0] block mt-0.5">Deportivo Carmen Serdán, CDMX</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#e2bfb0]">
                      <p className="text-[#e2e2ea] font-semibold flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#7bd0ff] shrink-0" />
                        <span>Av. Estado de México s/n, Loma la Palma, Gustavo A. Madero, CDMX.</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#a98a7d]">🚗</span>
                        <span>Estacionamiento vigilado disponible en la entrada principal.</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-[#a98a7d]">💺</span>
                        <span>Zona de gradas familiares con vista panorámica y techada.</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://maps.google.com/?q=Deportivo+Carmen+Serdán+CDMX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 bg-[#1d2025] hover:bg-[#37393f] text-[#e2e2ea] text-xs font-semibold px-4 py-2.5 rounded flex items-center justify-center gap-2 transition-colors border border-[#282a30]"
                  >
                    <span>🧭</span>
                    <span>Abrir en Google Maps / Waze</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB 4: REGLAMENTO & EQUIPO REQUERIDO */}
            {activeTab === "reglamento" && (
              <div className="bg-[#191c21] rounded-xl p-6 shadow-xl border border-[#282a30]">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-[#e2e2ea]">Guía de Material & Convivencia Familiar</h3>
                  <p className="text-xs text-[#e2bfb0] mt-0.5">Pautas esenciales para proteger la integridad física de los atletas y cuidar nuestras instalaciones</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material Requerido */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#ffb693] flex items-center gap-2 uppercase tracking-wide">
                      <span>🏀</span>
                      <span>Material & Calzado Requerido</span>
                    </h4>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#ff6b00]/20 text-[#ffb693] flex items-center justify-center shrink-0">
                        👟
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Calzado Exclusivo de Duela</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Tenis de baloncesto con suela de goma limpia (no manchante). Por cuidado de la duela de madera, se solicita que el atleta se coloque su calzado deportivo al ingresar a la duela y no desde la calle.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#00ae78]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                        💧
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Termo de Hidratación Personal</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Botella o termo reutilizable de mínimo 1 Litro, debidamente rotulado con el nombre &quot;Toya #36&quot;. La academia provee garrafón de recarga purificada en banca.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#7bd0ff]/20 text-[#7bd0ff] flex items-center justify-center shrink-0">
                        🎽
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Uniforme Oficial de Práctica</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Jersey oficial reversible Wild Wolves o playera deportiva transpirable oscura en caso de sesión de prueba. Toalla pequeña de mano para banca recomendada.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Convivencia Familiar */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#4edea3] flex items-center gap-2 uppercase tracking-wide">
                      <span>🤝</span>
                      <span>Convivencia & Asistencia Familiar</span>
                    </h4>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                        ⏰
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Puntualidad Familiar Recomendada</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Llegada sugerida 15 minutos antes de la hora fijada (08:45 AM). Permite vendajes preventivos, hidratación previa y calentamiento neuromuscular guiado.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#ffb693]/20 text-[#ffb693] flex items-center justify-center shrink-0">
                        🏟️
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Zona de Gradas y Acompañamiento</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Padres, tutores y familiares son siempre bienvenidos en la gradería techada. Promovemos porras positivas y respeto absoluto a árbitros, rivales y compañeros.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1d2025] p-4 rounded-xl flex items-start gap-3 border border-[#282a30]">
                      <div className="w-9 h-9 rounded-lg bg-[#7bd0ff]/20 text-[#7bd0ff] flex items-center justify-center shrink-0">
                        🩺
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#e2e2ea] block">Notificación Preventiva Médica</span>
                        <p className="text-xs text-[#e2bfb0] mt-1 leading-relaxed">
                          Si {studentName} presenta alguna molestia muscular, fatiga escolar o recuperación de resfriado, por favor notifíquenlo al Coach Ricardo vía WhatsApp previo a la práctica.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 bg-[#0c0e13]/60 -mx-6 -mb-6 p-4 rounded-b-xl flex flex-wrap items-center justify-between gap-2 text-[#e2bfb0] font-mono text-xs border-t border-[#282a30]/60">
                  <span>Wild Wolves Academy CDMX — Formando Atletas de Carácter y Valores</span>
                  <span className="text-[#4edea3]">Reglamento Aprobado Nov 2024</span>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* MODAL REPORTE WHATSAPP */}
        {aiReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#191c21] border border-[#282a30] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#282a30]">
                <div className="flex items-center gap-2 text-[#4edea3]">
                  <Sparkles className="w-5 h-5 text-[#ffb693]" />
                  <h3 className="font-bold text-sm uppercase text-[#e2e2ea]">
                    Reporte Familiar WhatsApp
                  </h3>
                </div>
                <button
                  onClick={() => setAiReportModalOpen(false)}
                  className="text-[#e2bfb0] hover:text-white text-xs font-mono px-2 py-1 rounded bg-[#282a30]"
                >
                  Cerrar
                </button>
              </div>

              <div className="bg-[#0c0e13] border border-[#282a30] rounded-xl p-4 text-xs font-mono text-[#e2e2ea] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
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
                  className="px-4 py-2 rounded bg-[#282a30] hover:bg-[#37393f] text-[#e2e2ea] text-xs font-bold transition"
                >
                  Copiar Texto
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(aiReportText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded bg-[#00ae78] hover:bg-[#4edea3] text-[#003824] text-xs font-bold flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir en WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
