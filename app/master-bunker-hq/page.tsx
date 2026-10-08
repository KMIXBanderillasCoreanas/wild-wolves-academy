"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { PaymentRecord, StudentProfile, ShiftType } from "@/lib/types";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import confetti from "canvas-confetti";
import {
  Crown,
  Check,
  X,
  Trash2,
  RefreshCw,
  Users,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
  Activity,
  UserCheck,
  Eye,
  EyeOff,
  DollarSign,
  CreditCard,
  TrendingUp,
  Receipt,
  MessageCircle,
  PlusCircle,
  CalendarCheck,
  AlertCircle,
  Wallet
} from "lucide-react";

interface CoachProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at?: string;
}

interface StudentCommitment {
  id: string;
  user_id: string;
  days_selected: string[];
  shift: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function MasterBunkerHQ() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [adminName, setAdminName] = useState("Super Administrador");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Datos
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [financialStats, setFinancialStats] = useState({
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    yearIncome: 0,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"finances" | "attendance" | "coaches" | "students">("finances");

  // Modal para registrar pago manual
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [manualPayStudentId, setManualPayStudentId] = useState("");
  const [manualPayAmount, setManualPayAmount] = useState<number>(600);
  const [manualPayMethod, setManualPayMethod] = useState<"Efectivo" | "Transferencia" | "Stripe">("Efectivo");
  const [manualPayNotes, setManualPayNotes] = useState("Pago de mensualidad en cancha");

  const checkSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = secretKey.trim().toUpperCase();
    if (normalized === "RICARDO-WOLVES-2026") {
      setAdminName("Coach Ricardo");
      setAuthenticated(true);
      setErrorMessage("");
    } else if (normalized === "CARLOS-WOLVES-2026") {
      setAdminName("Carlos");
      setAuthenticated(true);
      setErrorMessage("");
    } else if (normalized === "WW-SUPERADMIN-FULL-2026") {
      setAdminName("Super Administrador");
      setAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Clave Maestra Incorrecta. Acceso Denegado.");
    }
  };

  const loadLocalFinancials = useCallback(() => {
    const list = HoopStore.getStudents();
    setStudents(list);
    const stats = HoopStore.getFinancialAnalytics();
    setFinancialStats({
      todayIncome: stats.todayIncome,
      weekIncome: stats.weekIncome,
      monthIncome: stats.monthIncome,
      yearIncome: stats.yearIncome,
    });
    setPayments(stats.allPayments);
    if (list.length > 0 && !manualPayStudentId) {
      setManualPayStudentId(list[0].id);
    }
  }, [manualPayStudentId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      loadLocalFinancials();

      // Intentar mediante API de administración con clave maestra
      const res = await fetch(`/api/master-bunker?secret=${encodeURIComponent(secretKey)}`);
      if (res.ok) {
        const json = await res.json();
        setCoaches(json.coaches || []);
        setCommitments(json.commitments || []);
      } else {
        // Fallback a cliente Supabase
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .in("role", ["coach_pending", "coach"])
          .order("created_at", { ascending: false });
        setCoaches(data || []);

        const { data: commitData } = await supabase
          .from("attendance_commitments")
          .select("*, profiles:user_id(email, full_name)");
        setCommitments(commitData || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [secretKey, loadLocalFinancials]);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
    const handlePaymentRecorded = () => {
      loadLocalFinancials();
    };
    window.addEventListener("payment_recorded", handlePaymentRecorded);
    return () => window.removeEventListener("payment_recorded", handlePaymentRecorded);
  }, [authenticated, fetchData, loadLocalFinancials]);

  const approveCoach = async (userId: string) => {
    try {
      const res = await fetch("/api/master-bunker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, action: "approve", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al aprobar");
      fetchData();
    } catch (err: any) {
      alert("Error al aprobar coach: " + err.message);
    }
  };

  const rejectOrDelete = async (userId: string) => {
    if (!confirm("¿Seguro que deseas eliminar a este usuario de la base de datos?")) return;
    try {
      const res = await fetch("/api/master-bunker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, action: "reject", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      fetchData();
    } catch (err: any) {
      alert("Error al eliminar usuario: " + err.message);
    }
  };

  // REGISTRAR PAGO MANUAL (Efectivo, Transferencia o Tarjeta)
  const handleRegisterManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === manualPayStudentId);
    if (!st) {
      alert("Por favor selecciona un alumno");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const newPayment = {
      studentId: st.id,
      studentName: st.fullName,
      guardianName: st.guardianName || st.medicalNotes?.emergencyContact || "Tutor de Atleta",
      guardianPhone: st.parentPhone || st.phone || "5522427769",
      amount: Number(manualPayAmount),
      date: todayStr,
      method: manualPayMethod,
      status: "Pagado" as const,
      notes: manualPayNotes,
      shift: st.shift || "matutino_9_11",
    };

    // 1. Guardar en store local / recalculador
    HoopStore.recordPaymentWithReceipt(newPayment);

    // 2. Intentar guardar en backend Supabase API
    try {
      await fetch("/api/master-bunker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: secretKey,
          action: "record_payment",
          payment: newPayment,
        }),
      });
    } catch (err) {
      console.warn("Backend payment sync notice:", err);
    }

    // Efecto de celebración
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#f97316", "#fbbf24"],
      });
    } catch {}

    loadLocalFinancials();
    setIsPayModalOpen(false);
  };

  // ENLACE DIRECTO DE WHATSAPP PARA RECORDATORIO DESDE RECIBO
  const handleWhatsAppReminder = (payment: PaymentRecord) => {
    const rawPhone = payment.guardianPhone || "5522427769";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone = phone.startsWith("52") ? phone : `52${phone}`;
    const text = `Hola ${payment.guardianName}, recordatorio de pago de mensualidad Wild Wolves de ${payment.studentName}. Cuota: $${payment.amount} MXN. Sede: Deportivo Carmen Serdán (CDMX). Puedes regularizar mediante Efectivo en cancha o Transferencia SPEI. ¡Muchas gracias por el apoyo al atleta! 🐺🏀`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  // ENLACE DIRECTO DE WHATSAPP PARA COBRO DE ALUMNO MOROSO
  const handleWhatsAppCollectDebt = (st: StudentProfile) => {
    const guardian = st.guardianName || st.medicalNotes?.emergencyContact || "Tutor del Atleta";
    const rawPhone = st.parentPhone || st.phone || "5522427769";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone = phone.startsWith("52") ? phone : `52${phone}`;
    const amount = st.finances?.balanceDue || 50;
    const text = `Hola ${guardian}, recordatorio de pago de mensualidad Wild Wolves de ${st.fullName}. Cuota pendiente: $${amount} MXN. Sede: Deportivo Carmen Serdán (CDMX). Puedes regularizar directamente en la cancha (Efectivo) o vía SPEI. ¡Agradecemos tu compromiso con el crecimiento del atleta! 🐺🏀`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves CDMX"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <form
            onSubmit={checkSecret}
            className="bg-[#0d1017] border border-amber-500/30 p-8 rounded-3xl text-center shadow-2xl relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-500">
              <KeyRound className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
              ACCESO RESTRINGIDO NIVEL 0
            </span>

            <h2 className="text-2xl font-black uppercase mt-3 tracking-wide text-white">
              Búnker Super Administrador
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6">
              Ingresa la Clave Maestra de Ricardo o Carlos para acceder al motor financiero y directivo.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="relative mb-4">
              <input
                type={showKey ? "text" : "password"}
                placeholder="••••••••••••"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-[#05070a] border border-zinc-700 focus:border-amber-500 rounded-xl py-3 px-4 pr-11 text-sm text-center font-mono text-white outline-none transition tracking-widest"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                title={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Desbloquear Consola Total
            </button>

            <div className="mt-5">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
                ← Volver al sitio público
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = coaches.filter((c) => c.role === "coach_pending").length;
  const activeCount = coaches.filter((c) => c.role === "coach").length;
  const currentStudentForAttendance = students[0] || HoopStore.getStudents()[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase font-bold flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-amber-400" />
                  BÚNKER MASTER • {adminName.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-400">Deportivo Carmen Serdán</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white mt-1">
                Panel Central de Dirección &amp; Finanzas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 text-xs bg-[#161b26] border border-zinc-700 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs bg-[#121724] border border-zinc-800 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Salir al Sitio
            </Link>
          </div>
        </div>

        {/* Pestañas Principales */}
        <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("finances")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
              activeTab === "finances"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#ea580c]" />
            Finanzas &amp; Ingresos
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
              activeTab === "attendance"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            Asistencia en Cancha
          </button>
          <button
            onClick={() => setActiveTab("coaches")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
              activeTab === "coaches"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="w-4 h-4 text-[#ea580c]" />
            Gestión de Coaches ({coaches.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
              activeTab === "students"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#ea580c]" />
            Compromisos Alumnos ({commitments.length})
          </button>
        </div>

        {/* TAB 1: FINANZAS & INGRESOS */}
        {activeTab === "finances" && (
          <div className="space-y-6">
            {/* 1. MÉTRICAS EN TARJETAS DE ALTO IMPACTO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ingresos de Hoy */}
              <div className="bg-[#0d1017] border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Ingresos de Hoy
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    ${financialStats.todayIncome.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-400 font-sans">MXN</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    Cobros confirmados en la jornada
                  </p>
                </div>
              </div>

              {/* Ingresos de la Semana */}
              <div className="bg-[#0d1017] border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    Ingresos de la Semana
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    ${financialStats.weekIncome.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-400 font-sans">MXN</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    Acumulado últimos 7 días
                  </p>
                </div>
              </div>

              {/* Ingresos del Mes */}
              <div className="bg-[#0d1017] border border-[#ea580c]/40 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#f97316]">
                    Ingresos del Mes
                  </span>
                  <div className="p-2 rounded-xl bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/20">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    ${financialStats.monthIncome.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-400 font-sans">MXN</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    Recaudación del mes en curso
                  </p>
                </div>
              </div>

              {/* Ingresos del Año */}
              <div className="bg-[#0d1017] border border-sky-500/30 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                    Ingresos del Año
                  </span>
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    ${financialStats.yearIncome.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-400 font-sans">MXN</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1">
                    Balance anual acumulado
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DEDICADA: LISTA DE MOROSIDAD & GESTIÓN DE COBRANZA */}
            <div className="bg-[#0d1017] border border-rose-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Lista de Morosidad &amp; Alumnos con Adeudo</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {students.filter((s) => s.finances?.status !== "al_corriente" || (s.finances?.balanceDue || 0) > 0).length} Pendientes
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Atletas que adeudan cuota en el periodo actual. Envía mensaje de cobro directo a su tutor por WhatsApp o liquida en 1 clic.
                    </p>
                  </div>
                </div>
              </div>

              {students.filter((s) => s.finances?.status !== "al_corriente" || (s.finances?.balanceDue || 0) > 0).length === 0 ? (
                <div className="py-6 px-4 bg-[#121724]/60 rounded-xl border border-emerald-500/20 text-center font-mono text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Excelente! Todos los atletas registrados se encuentran al corriente de pago ($0 adeudo).</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students
                    .filter((s) => s.finances?.status !== "al_corriente" || (s.finances?.balanceDue || 0) > 0)
                    .map((st) => (
                      <div
                        key={st.id}
                        className="bg-[#121724] border border-rose-500/20 hover:border-rose-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatarUrl || "/logo-official.png"}
                              alt={st.fullName}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-700 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{st.fullName}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">
                                Tutor: {st.guardianName || "Tutor"}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                {st.parentPhone || st.phone || "5522427769"}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded block">
                              ${st.finances?.balanceDue || 50} MXN
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase block mt-0.5">
                              {st.finances?.frequency === "al_dia" ? "Por Clase" : st.finances?.frequency === "semanal" ? "Semanal" : "Mensual"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppCollectDebt(st)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Cobrar por WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setManualPayStudentId(st.id);
                              setManualPayAmount(st.finances?.balanceDue || 50);
                              setIsPayModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Registrar cobro manual"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cobrar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Acciones de Cobranza & Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#ea580c]" />
                  <span>Control de Cobranza &amp; Recibos de Alumnos</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Cuota oficial: $50 MXN por clase. Modalidades al día, semanal ($150) y mensual ($600).
                </p>
              </div>

              <button
                onClick={() => setIsPayModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-mono font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-orange-600/30 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Pago Manual (Cancha / SPEI)</span>
              </button>
            </div>

            {/* TABLA DE CONTROL DE COBRANZA */}
            <div className="bg-[#0d1017] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#121724] text-zinc-400 text-[10px] uppercase">
                      <th className="py-3 px-4 font-semibold">Alumno</th>
                      <th className="py-3 px-4 font-semibold">Tutor / Teléfono</th>
                      <th className="py-3 px-4 font-semibold">Monto</th>
                      <th className="py-3 px-4 font-semibold">Fecha de Pago</th>
                      <th className="py-3 px-4 font-semibold">Método</th>
                      <th className="py-3 px-4 font-semibold">Estatus</th>
                      <th className="py-3 px-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          No hay recibos registrados. Registra el primer pago con el botón superior.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => {
                        const isPaid = p.status === "Pagado";
                        return (
                          <tr key={p.id} className="hover:bg-[#161b26]/50 transition-colors">
                            {/* Alumno */}
                            <td className="py-3.5 px-4 font-bold text-white font-sans text-xs">
                              {p.studentName}
                            </td>

                            {/* Tutor */}
                            <td className="py-3.5 px-4 text-zinc-300">
                              <div>{p.guardianName}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">{p.guardianPhone}</div>
                            </td>

                            {/* Monto */}
                            <td className="py-3.5 px-4 font-black text-white text-sm">
                              ${p.amount}{" "}
                              <span className="text-[10px] font-normal text-zinc-500">MXN</span>
                            </td>

                            {/* Fecha */}
                            <td className="py-3.5 px-4 text-zinc-300">
                              {p.date}
                            </td>

                            {/* Método */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.method === "Efectivo"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : p.method === "Transferencia"
                                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                  : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              }`}>
                                {p.method}
                              </span>
                            </td>

                            {/* Estatus */}
                            <td className="py-3.5 px-4">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pagado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                  <AlertCircle className="w-3 h-3" />
                                  Adeudo
                                </span>
                              )}
                            </td>

                            {/* Acción */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppReminder(p)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                                  title="Enviar recordatorio por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASISTENCIA EN CANCHA */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <AttendanceTracker
              student={currentStudentForAttendance}
              allStudents={students}
              readOnly={false}
              onRecordAttendance={() => fetchData()}
              onPaymentRecorded={() => {
                fetchData();
                loadLocalFinancials();
              }}
            />
          </div>
        )}

        {/* TAB 3: COACHES */}
        {activeTab === "coaches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ea580c]" />
                Entrenadores Registrados &amp; Aspirantes
              </h3>
              <span className="text-xs text-zinc-500">
                Aprobación con 1 clic activa el acceso a /dashboard-coach
              </span>
            </div>

            {loading ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                Cargando registros desde la nube de Supabase...
              </div>
            ) : coaches.length === 0 ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                No hay solicitudes de Coach pendientes en este momento. Comparte el enlace privado{" "}
                <code className="text-[#ea580c] bg-[#161b26] px-2 py-0.5 rounded">
                  /apply-coach-ww
                </code>{" "}
                a los aspirantes.
              </div>
            ) : (
              <div className="space-y-3">
                {coaches.map((c) => {
                  const isPending = c.role === "coach_pending" || c.status === "pending";
                  return (
                    <div
                      key={c.id}
                      className="bg-[#0d1017] border border-zinc-800 hover:border-zinc-700 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {c.full_name || "Sin nombre registrado"}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isPending
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isPending ? "PENDIENTE DE APROBACIÓN" : "COACH ACTIVO"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{c.email}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">
                          ID: {c.id} {c.created_at && `• Registro: ${new Date(c.created_at).toLocaleDateString()}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => approveCoach(c.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Aprobar Rol Coach
                          </button>
                        )}
                        <button
                          onClick={() => rejectOrDelete(c.id)}
                          title="Eliminar de Supabase"
                          className="p-2.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMPROMISOS ALUMNOS */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ea580c]" />
              Compromisos de Asistencia Semanal Registrados
            </h3>

            {commitments.length === 0 ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                Aún no hay compromisos registrados en Supabase.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commitments.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {item.profiles?.full_name || item.profiles?.email || "Atleta Wild Wolves"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ea580c]/20 text-[#f97316]">
                        {item.shift === "matutino_9_11" ? "09:00 - 11:00 hrs" : "17:00 - 19:00 hrs"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.days_selected?.map((d: string) => (
                        <span
                          key={d}
                          className="text-[10px] bg-[#161b26] border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Sede: Deportivo Carmen Serdán (CDMX)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PARA REGISTRAR PAGO MANUAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18181b] border border-zinc-700 rounded-3xl p-6 sm:p-7 max-w-md w-full font-sans shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  REGISTRO DE INGRESO MANUAL
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Registrar Pago de Alumno</h3>
                <p className="text-xs text-zinc-400 font-mono">Actualiza el semáforo y balance de inmediato</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterManualPayment} className="space-y-4 font-mono text-xs">
              {/* Seleccionar Alumno */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">Seleccionar Alumno:</label>
                <select
                  value={manualPayStudentId}
                  onChange={(e) => setManualPayStudentId(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-zinc-700 rounded-xl px-3 py-2.5 text-white font-sans text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {students.length === 0 ? (
                    <option value="">No hay alumnos registrados</option>
                  ) : (
                    students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.position}) — Adeudo: ${s.finances?.balanceDue || 0} MXN
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">Monto Recibido ($ MXN):</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[50, 150, 600].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setManualPayAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        manualPayAmount === amt
                          ? "bg-[#ea580c] text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      ${amt} MXN
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={manualPayAmount}
                  onChange={(e) => setManualPayAmount(Number(e.target.value) || 0)}
                  className="w-full bg-[#0a0e17] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold text-base focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Método */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">Método de Pago:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualPayMethod("Efectivo")}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      manualPayMethod === "Efectivo"
                        ? "bg-amber-600 text-white ring-2 ring-amber-400"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPayMethod("Transferencia")}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      manualPayMethod === "Transferencia"
                        ? "bg-sky-600 text-white ring-2 ring-sky-400"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>SPEI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPayMethod("Stripe")}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      manualPayMethod === "Stripe"
                        ? "bg-purple-600 text-white ring-2 ring-purple-400"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>Stripe / Tarjeta</span>
                  </button>
                </div>
              </div>

              {/* Concepto / Notas */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1.5">Concepto o Notas:</label>
                <input
                  type="text"
                  value={manualPayNotes}
                  onChange={(e) => setManualPayNotes(e.target.value)}
                  placeholder="Ej. Mensualidad completa, pago 3 clases"
                  className="w-full bg-[#0a0e17] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 text-xs font-sans focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={students.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Ingresar ${manualPayAmount} MXN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
