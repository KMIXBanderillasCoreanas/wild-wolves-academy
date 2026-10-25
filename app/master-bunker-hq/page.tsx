"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  Crown, 
  Check, 
  Trash2, 
  RefreshCw, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Wifi,
  WifiOff,
  CloudUpload,
  Activity,
  Sparkles,
  Edit3,
  MessageSquare,
  Settings
} from "lucide-react";
import AttendanceTracker from "@/components/AttendanceTracker";
import CourtAttendanceCommand from "@/components/CourtAttendanceCommand";
import TestDayEvaluator from "@/components/TestDayEvaluator";
import DualCoachCommand from "@/components/DualCoachCommand";
import SmartPlacementCRM from "@/components/SmartPlacementCRM";
import BunkerHomeTrainingMonitor from "@/components/BunkerHomeTrainingMonitor";
import GuardianDirectory from "@/components/GuardianDirectory";
import CombineExpressTable from "@/components/CombineExpressTable";
import AdminAttendanceFinanceModal, { AdminModalInitialData } from "@/components/AdminAttendanceFinanceModal";
import SuperAdminOmniManager from "@/components/SuperAdminOmniManager";
import { Home } from "lucide-react";
import { 
  syncOfflineQueueToSupabase, 
  getOfflineQueueCount,
  flushOfflineQueue 
} from "@/lib/offlineSync";

import BunkerSyncCommandBar from "@/components/BunkerSyncCommandBar";
import TacticalAIAssistant from "@/components/TacticalAIAssistant";
import MasterAICockpit from "@/components/MasterAICockpit";
import TacticalRadarAlerts from "@/components/TacticalRadarAlerts";
import WhatsAppHubCRM from "@/components/WhatsAppHubCRM";
import ExpensesManager from "@/components/ExpensesManager";

export default function MasterBunkerHQ() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [adminLabel, setAdminLabel] = useState("COACH RICARDO • FUNDADOR & DIRECTOR GENERAL");
  const [activeTab, setActiveTab] = useState<"attendance" | "smart_placement" | "finance" | "roster_becas" | "retroactivo" | "test_day" | "home_training" | "guardians" | "coaches" | "whatsapp_crm">("attendance");

  // Sincronizar pestaña si viene en la URL (?tab=finanzas o ?tab=finance)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const applyTabFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam) {
          if (tabParam === "finanzas" || tabParam === "finance") setActiveTab("finance");
          else if (tabParam === "roster_becas" || tabParam === "becas") setActiveTab("roster_becas");
          else if (tabParam === "retroactivo" || tabParam === "correcciones") setActiveTab("retroactivo");
          else if (tabParam === "asistencia" || tabParam === "attendance") setActiveTab("attendance");
          else if (tabParam === "test_day" || tabParam === "evaluaciones") setActiveTab("test_day");
          else if (tabParam === "smart_placement" || tabParam === "crm") setActiveTab("smart_placement");
          else if (tabParam === "whatsapp" || tabParam === "whatsapp_crm") setActiveTab("whatsapp_crm");
        }
      };

      applyTabFromUrl();

      const handleCustomTab = (e: any) => {
        const targetTab = typeof e?.detail === "string" ? e.detail : e?.detail?.tab;
        if (targetTab) {
          if (targetTab === "finanzas" || targetTab === "finance") {
            setActiveTab("finance");
            fetchDashboardData();
          } else if (targetTab === "asistencia" || targetTab === "attendance") {
            setActiveTab("attendance");
          } else if (targetTab === "test_day" || targetTab === "evaluaciones") {
            setActiveTab("test_day");
          } else if (targetTab === "smart_placement" || targetTab === "crm") {
            setActiveTab("smart_placement");
          } else if (targetTab === "whatsapp" || targetTab === "whatsapp_crm") {
            setActiveTab("whatsapp_crm");
          }
        } else {
          applyTabFromUrl();
        }
      };

      window.addEventListener("popstate", applyTabFromUrl);
      window.addEventListener("tab_changed", applyTabFromUrl);
      window.addEventListener("change-bunker-tab", handleCustomTab);
      return () => {
        window.removeEventListener("popstate", applyTabFromUrl);
        window.removeEventListener("tab_changed", applyTabFromUrl);
        window.removeEventListener("change-bunker-tab", handleCustomTab);
      };
    }
  }, []);
  const [attendanceSubView, setAttendanceSubView] = useState<"command" | "historical">("command");
  const [testDaySubView, setTestDaySubView] = useState<"express" | "dual" | "ovr">("express");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Estado del Modal de Ajuste Retroactivo SuperAdmin
  const [adminAdjustModalOpen, setAdminAdjustModalOpen] = useState(false);
  const [adminAdjustInitialData, setAdminAdjustInitialData] = useState<AdminModalInitialData | null>(null);
  
  // Estado Offline-First
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") return navigator.onLine;
    return true;
  });
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Métricas financieras calculadas
  const [metrics, setMetrics] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?redirect=/master-bunker-hq`,
        },
      });
      if (error) {
        setAuthError("No se pudo iniciar sesión con Google: " + error.message);
      }
    } catch (err: any) {
      setAuthError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = secretKey.trim().toUpperCase();
    if (
      normalized === "WW-SUPERADMIN-FULL-2026" ||
      normalized === "WW-SUPERADMIN-KEY-99" ||
      normalized === "RICARDO-WOLVES-2026" ||
      normalized === "CARLOS-WOLVES-2026"
    ) {
      if (normalized === "CARLOS-WOLVES-2026") {
        setAdminLabel("COACH CARLOS (ADMIN)");
      } else {
        setAdminLabel("COACH RICARDO • FUNDADOR & DIRECTOR GENERAL");
      }
      setAuthenticated(true);
      setAuthError("");
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", "superadmin");
        localStorage.setItem("ww_user_email", "wildwolvescdmx@gmail.com");
        document.cookie = "user_role=superadmin; path=/; max-age=86400; SameSite=Lax";
        window.dispatchEvent(new Event("auth_changed"));
      }
      fetchDashboardData();
    } else {
      setAuthError("Clave Maestra Incorrecta. Acceso Denegado.");
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar coaches desde Supabase
      const { data: coachesData } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["coach_pending", "coach"]);

      if (coachesData && coachesData.length > 0) {
        setCoaches(coachesData);
      } else {
        setCoaches([]);
      }

      // Normalización de Fecha Local (CDMX)
      const todayMX = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Mexico_City",
      }).format(new Date());

      // Calcular inicio de semana (Lunes) y mes en curso según hora local CDMX
      const [yearStr, monthStr, dayStr] = todayMX.split("-");
      const currentYear = Number(yearStr);
      const currentMonth = Number(monthStr);
      const currentDay = Number(dayStr);

      const nowLocal = new Date(currentYear, currentMonth - 1, currentDay);
      const dayOfWeek = nowLocal.getDay() || 7; // 1 = Lunes, 7 = Domingo
      const startOfWeek = new Date(nowLocal);
      startOfWeek.setDate(nowLocal.getDate() - dayOfWeek + 1);
      const startOfWeekStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Mexico_City",
      }).format(startOfWeek);

      // 2. Cargar pagos desde payment_transactions_history con fallback a membership_payments
      const { data: txHistory, error: txErr } = await supabase
        .from("payment_transactions_history")
        .select("id, student_id, coach_id, amount_paid, remaining_debt, payment_method, concept, transaction_date, created_at, student:profiles!payment_transactions_history_student_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });

      let combinedPayments: any[] = [];

      if (!txErr && txHistory && txHistory.length > 0) {
        combinedPayments = txHistory.map((t: any) => ({
          id: t.id,
          student_id: t.student_id,
          student_name: t.student?.full_name || "Atleta",
          amount: Number(t.amount_paid) || 0,
          payment_date: t.transaction_date || (t.created_at ? t.created_at.split("T")[0] : todayMX),
          payment_method: t.payment_method || "efectivo",
          concept: t.concept || "Entrenamiento / Cuota",
          status: "completado",
          profiles: t.student,
        }));
      }

      // Complementar con membership_payments si existen
      const { data: memPayments } = await supabase
        .from("membership_payments")
        .select("*, profiles(full_name, email)")
        .order("payment_date", { ascending: false });

      if (memPayments && memPayments.length > 0) {
        memPayments.forEach((mp: any) => {
          combinedPayments.push({
            id: mp.id,
            student_id: mp.student_id,
            student_name: mp.profiles?.full_name || "Atleta",
            amount: Number(mp.amount) || 0,
            payment_date: mp.payment_date || todayMX,
            payment_method: mp.payment_method || "efectivo",
            concept: mp.concept || "Mensualidad",
            status: mp.status || "pagado",
            profiles: mp.profiles,
          });
        });
      }

      let dayTotal = 0;
      let weekTotal = 0;
      let monthTotal = 0;
      let yearTotal = 0;

      if (combinedPayments.length > 0) {
        setPayments(combinedPayments);

        combinedPayments.forEach((p) => {
          const amt = Number(p.amount) || 0;
          const pDate = p.payment_date || todayMX;
          const parts = pDate.split("-");
          const pY = Number(parts[0]) || currentYear;
          const pM = Number(parts[1]) || currentMonth;

          if (pDate === todayMX) dayTotal += amt;
          if (pDate >= startOfWeekStr) weekTotal += amt;
          if (pM === currentMonth && pY === currentYear) monthTotal += amt;
          if (pY === currentYear) yearTotal += amt;
        });

        setMetrics({
          day: dayTotal,
          week: weekTotal,
          month: monthTotal,
          year: yearTotal,
        });
      } else {
        setPayments([]);
        setMetrics({
          day: 0,
          week: 0,
          month: 0,
          year: 0,
        });
      }
    } catch (err) {
      console.error("Error al cargar datos del Búnker:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler directo infalible para el botón Sincronizar
  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      const res = await flushOfflineQueue(supabase);
      setQueueCount(res.pending);
      const msg = `Sincronización completada: ${res.synced} registros subidos a la nube`;
      setSyncToast(msg);
      setTimeout(() => setSyncToast(null), 4500);

      // Revalidación inmediata de métricas y finanzas
      await fetchDashboardData();
      window.dispatchEvent(new CustomEvent("change-bunker-tab", { detail: "finanzas" }));
      window.dispatchEvent(new Event("payment_recorded"));
      window.dispatchEvent(new Event("attendance_updated"));
    } catch (err: any) {
      console.error("Error en handleSyncClick:", err);
      setSyncToast("Aviso: Algunos registros se mantendrán en cola offline.");
      setTimeout(() => setSyncToast(null), 4500);
    } finally {
      setIsSyncing(false);
    }
  };

  // Verificación reactiva automática de sesión de SuperAdmin / Fundador
  useEffect(() => {
    async function verifySuperAdminSession() {
      try {
        setAuthChecking(true);

        // 1. Obtener usuario autenticado de Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Comprobar credenciales de sesión local
        const storedRole = typeof window !== "undefined" ? localStorage.getItem("ww_user_role") : null;
        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("ww_user_email") : null;

        const effectiveEmail = (user?.email || storedEmail || "").toLowerCase().trim();

        const isFounderDirector = 
          effectiveEmail === "wildwolvescdmx@gmail.com" ||
          effectiveEmail === "ricardo@wildwolves.mx" ||
          effectiveEmail === "director@wildwolves.mx" ||
          effectiveEmail === "carlos@wildwolves.mx";

        if (user) {
          // Consultar perfil de base de datos
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, email")
            .eq("id", user.id)
            .single();

          const isSuper = profile?.role === "superadmin" || storedRole === "superadmin" || isFounderDirector;

          if (isSuper) {
            setAdminLabel("COACH RICARDO • FUNDADOR & DIRECTOR GENERAL");
            setAuthenticated(true);
            setAuthChecking(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("ww_user_role", "superadmin");
              localStorage.setItem("ww_user_email", user.email || "wildwolvescdmx@gmail.com");
              document.cookie = "user_role=superadmin; path=/; max-age=86400; SameSite=Lax";
              window.dispatchEvent(new Event("auth_changed"));
            }
            fetchDashboardData();
            return;
          }

          if (profile?.role === "student") {
            router.replace("/dashboard-student");
            return;
          }

          if (profile?.role === "coach") {
            setAuthError("Acceso Restringido: Tu cuenta tiene asignado el rol de Coach. El Búnker Central es exclusivo de Dirección General.");
            setAuthChecking(false);
            return;
          }
        } else if (isFounderDirector || storedRole === "superadmin") {
          // Bypass directo autorizado por sesión local de Dirección
          setAdminLabel("COACH RICARDO • FUNDADOR & DIRECTOR GENERAL");
          setAuthenticated(true);
          setAuthChecking(false);
          fetchDashboardData();
          return;
        }

        // Si no hay sesión iniciada, mostrar vista de emergencia
        setAuthChecking(false);
      } catch (err) {
        console.error("Error al verificar sesión en Búnker:", err);
        setAuthChecking(false);
      }
    }

    verifySuperAdminSession();
  }, [fetchDashboardData, router]);

  // Escuchar eventos de cobros y sincronización offline en tiempo real
  useEffect(() => {
    if (!authenticated) return;

    const handleRefresh = () => {
      fetchDashboardData();
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await syncOfflineQueueToSupabase();
        fetchDashboardData();
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueUpdated = (e: any) => {
      setQueueCount(e.detail?.count ?? getOfflineQueueCount());
    };

    window.addEventListener("payment_recorded", handleRefresh);
    window.addEventListener("payment_deleted", handleRefresh);
    window.addEventListener("attendance_updated", handleRefresh);
    window.addEventListener("offline_queue_synced", handleRefresh);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated as EventListener);

    setQueueCount(getOfflineQueueCount());

    // Suscripción en tiempo real de Supabase a payment_transactions_history
    const financeChannel = supabase
      .channel("finance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_transactions_history" },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("payment_recorded", handleRefresh);
      window.removeEventListener("payment_deleted", handleRefresh);
      window.removeEventListener("attendance_updated", handleRefresh);
      window.removeEventListener("offline_queue_synced", handleRefresh);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
      supabase.removeChannel(financeChannel);
    };
  }, [authenticated, fetchDashboardData]);

  const approveCoach = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ role: "coach", status: "active" }).eq("id", userId);
      if (error) {
        console.warn("Supabase fallback:", error.message);
      }
      fetchDashboardData();
    } catch (err: any) {
      alert("Error al aprobar coach: " + err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de eliminar permanentemente a este usuario?")) {
      try {
        await supabase.from("profiles").delete().eq("id", userId);
        fetchDashboardData();
      } catch (err: any) {
        alert("Error al eliminar usuario: " + err.message);
      }
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
          Verificando Credenciales de Dirección General...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#0d1017] border border-amber-500/40 p-8 rounded-3xl text-center shadow-2xl animate-fade-in">
          {/* Emblema Oficial */}
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">
            <Crown className="w-3.5 h-3.5" /> DIRECCIÓN GENERAL • BÚNKER HQ
          </div>

          <h2 className="text-xl font-black uppercase mb-1 tracking-wide text-white">Comandancia Central</h2>
          <p className="text-xs text-zinc-400 mb-6">
            Acceso exclusivo para el Creador y Dirección General de Wild Wolves CDMX.
          </p>

          {authError && (
            <div className="mb-5 bg-red-500/15 border border-red-500/30 text-red-400 text-xs px-3.5 py-2.5 rounded-xl text-left flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Opción 1: Acceso Directo con Google para el Director */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-md cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
              </svg>
              <span>Acceder con Google (wildwolvescdmx@gmail.com)</span>
            </button>

            <Link
              href="/login?redirect=/master-bunker-hq"
              className="block w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition text-center"
            >
              Iniciar Sesión con Correo de Director
            </Link>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-mono">
              o Llave Maestra de Emergencia
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Opción 2: Formulario de Respaldo por Hardware */}
          <form onSubmit={checkSecret} className="space-y-3">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="WW-SUPERADMIN-FULL-2026"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-[#05070a] border border-zinc-700 rounded-xl py-2.5 px-4 pr-11 text-xs text-center text-white outline-none focus:border-amber-500 font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Desbloquear Consola Total
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
            <Link href="/" className="text-xs text-zinc-500 hover:text-white transition">
              &larr; Volver al Portal Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BunkerSyncCommandBar />
      <div className="min-h-screen bg-[#07090e] text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* HEADER BÚNKER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center gap-4">
          {/* Logotipo Oficial Original */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={52}
              height={52}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase font-bold">
                {adminLabel} • SEDE CARMEN SERDÁN
              </span>
              {isOnline ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Online
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Cancha Offline
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1 tracking-tight">Panel Central de Dirección</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {queueCount > 0 && (
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-black px-3.5 py-2.5 rounded-xl font-black transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              Sincronizar ({queueCount})
            </button>
          )}
          <button
            onClick={() => {
              setAdminAdjustInitialData(null);
              setAdminAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white px-4 py-2.5 rounded-xl font-black transition cursor-pointer shadow-lg shadow-orange-600/30"
          >
            <Settings className="w-3.5 h-3.5" /> ⚙️ Ajuste Manual de Registros
          </button>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-xs bg-[#161b26] border border-zinc-700 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </button>
          <a
            href="/"
            className="flex items-center gap-2 text-xs bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white transition font-bold"
          >
            Salir al Sitio
          </a>
        </div>
      </div>

      {/* TOAST DE SINCRONIZACIÓN INFALIBLE */}
      {syncToast && (
        <div className="mt-4 p-3.5 rounded-2xl bg-sky-950/50 border border-sky-500/50 text-sky-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{syncToast}</span>
          </div>
          <button
            onClick={() => setSyncToast(null)}
            className="text-zinc-400 hover:text-white p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* RADAR TÁCTICO DE NOVEDADES (AUDITORÍA EN VIVO) */}
      <div className="mt-6 mb-2">
        <TacticalRadarAlerts />
      </div>

      {/* CENTRO DE MANDO IA: LOBO CENTRAL (EXCLUSIVO HEAD COACH RICARDO) */}
      <div className="mb-6">
        <MasterAICockpit />
      </div>

      {/* PESTAÑAS PRINCIPALES DE GESTIÓN */}
      <div className="flex flex-wrap gap-2.5 my-6 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "attendance"
              ? "bg-[#ea580c] text-white shadow-lg shadow-[#ea580c]/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Calendar className="w-4 h-4" /> Control de Asistencia y Cancha
        </button>
        <button
          onClick={() => setActiveTab("smart_placement")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "smart_placement"
              ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" /> Diagnóstico Exprés & CRM
        </button>
        <button
          onClick={() => setActiveTab("whatsapp_crm")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "whatsapp_crm"
              ? "bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> WhatsApp Hub CRM
        </button>
        <button
          onClick={() => setActiveTab("finance")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "finance"
              ? "bg-[#22c55e] text-black font-black shadow-lg shadow-emerald-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Finanzas & Caja
        </button>
        <button
          onClick={() => setActiveTab("roster_becas")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "roster_becas"
              ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Users className="w-4 h-4" /> Roster, Horarios &amp; Becas
        </button>
        <button
          onClick={() => setActiveTab("retroactivo")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "retroactivo"
              ? "bg-sky-500 text-black font-black shadow-lg shadow-sky-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Edit3 className="w-4 h-4" /> Registro Retroactivo / Correcciones
        </button>
        <button
          onClick={() => setActiveTab("test_day")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "test_day"
              ? "bg-[#8b5cf6] text-white font-black shadow-lg shadow-purple-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Activity className="w-4 h-4" /> Test Day & Evaluaciones
        </button>
        <button
          onClick={() => setActiveTab("home_training")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "home_training"
              ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Home className="w-4 h-4" /> Entrenamiento en Casa
        </button>
        <button
          onClick={() => setActiveTab("guardians")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "guardians"
              ? "bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Users className="w-4 h-4 text-purple-300" /> Directorio Familiar &amp; Tutores
        </button>
        <button
          onClick={() => setActiveTab("coaches")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "coaches"
              ? "bg-[#0284c7] text-white shadow-lg shadow-sky-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Users className="w-4 h-4" /> Staff y Coaches ({coaches.filter((c) => c.role === "coach_pending" || c.status === "pending").length} pendientes)
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {activeTab === "attendance" && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-selector de Vista */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="inline-flex p-1 rounded-xl bg-[#121724] border border-zinc-800">
              <button
                type="button"
                onClick={() => setAttendanceSubView("command")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  attendanceSubView === "command"
                    ? "bg-[#ea580c] text-white shadow-md shadow-orange-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>⚡ Vista Táctica en Cancha (Live Grid)</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSubView("historical")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  attendanceSubView === "historical"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>📅 Registro Histórico por Fecha</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdminAdjustInitialData({
                    type: "attendance",
                    status: "presente",
                  });
                  setAdminAdjustModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" /> + Asistencia / Pase Manual
              </button>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                {attendanceSubView === "command" 
                  ? "Diseño auto-ajustable en tiempo real para móvil, tablet y monitor" 
                  : "Consulta y reportes por fecha de calendario"}
              </span>
            </div>
          </div>

          {attendanceSubView === "command" ? (
            <CourtAttendanceCommand />
          ) : (
            <AttendanceTracker />
          )}
        </div>
      )}

      {activeTab === "smart_placement" && (
        <div className="space-y-4 animate-fade-in">
          <SmartPlacementCRM />
        </div>
      )}

      {activeTab === "whatsapp_crm" && (
        <div className="space-y-4 animate-fade-in">
          <WhatsAppHubCRM />
        </div>
      )}

      {activeTab === "finance" && (
        <div className="space-y-6 animate-fade-in">
          {/* TARJETAS KPI DE INGRESOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121724] border border-zinc-800 p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Ingresos de Hoy</span>
              <p className="text-2xl font-black text-white mt-1">
                ${metrics.day} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Esta Semana</span>
              <p className="text-2xl font-black text-[#38bdf8] mt-1">
                ${metrics.week} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Mes en Curso</span>
              <p className="text-2xl font-black text-[#22c55e] mt-1">
                ${metrics.month} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Año Acumulado</span>
              <p className="text-2xl font-black text-[#ea580c] mt-1">
                ${metrics.year} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
          </div>

          {/* PANEL DE CONTROL TOTAL DEL DUEÑO (MOTOR OMNIPOTENTE) */}
          <SuperAdminOmniManager onDataChanged={fetchDashboardData} />

          {/* MÓDULO DE EGRESOS & GASTOS OPERATIVOS */}
          <ExpensesManager onExpenseChanged={fetchDashboardData} />

          {/* TABLA DE ÚLTIMOS COBROS REGISTRADOS */}
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-bold uppercase text-zinc-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Registro Histórico de Cobros
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAdminAdjustInitialData({
                    type: "payment",
                    amount: 150,
                    concept: "Entrenamiento / Cuota",
                    payment_method: "efectivo",
                  });
                  setAdminAdjustModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" /> + Registrar Cobro Manual
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="py-12 px-4 text-center bg-[#121724]/60 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
                <DollarSign className="w-8 h-8 text-zinc-500 mb-2" />
                <p className="text-sm font-bold text-zinc-300 uppercase">Sin movimientos registrados</p>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  No hay pagos registrados aún en el sistema. Los cobros de $50, $150 y $600 MXN registrados en cancha aparecerán aquí en tiempo real.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Estatus</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#121724]/60 transition">
                        <td className="py-3 px-4 font-mono text-zinc-400">{p.payment_date}</td>
                        <td className="py-3 px-4 font-bold text-white">{p.profiles?.full_name || p.student_name || p.student_id}</td>
                        <td className="py-3 px-4 uppercase text-zinc-400">{p.concept}</td>
                        <td className="py-3 px-4 capitalize text-zinc-300">{p.payment_method}</td>
                        <td className="py-3 px-4 font-black text-emerald-400">${p.amount} MXN</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="Modificar Pago"
                              onClick={() => {
                                setAdminAdjustInitialData({
                                  type: "payment",
                                  transaction_id: p.id,
                                  student_id: p.student_id,
                                  student_name: p.profiles?.full_name || p.student_name,
                                  date: p.payment_date,
                                  amount: p.amount,
                                  payment_method: p.payment_method,
                                  concept: p.concept,
                                });
                                setAdminAdjustModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Eliminar Pago Inmediato"
                              onClick={async () => {
                                if (!confirm(`⚠️ ¿Eliminar inmediatamente el pago de $${p.amount} de ${p.profiles?.full_name || p.student_name || "este alumno"}?`)) return;
                                // Optimista
                                setPayments(prev => prev.filter(item => item.id !== p.id));
                                try {
                                  const adminSecret = localStorage.getItem("ww_superadmin_secret") || localStorage.getItem("ww_user_role") || "WW-SUPERADMIN-FULL-2026";
                                  const adminEmail = localStorage.getItem("ww_user_email") || "wildwolvescdmx@gmail.com";
                                  const res = await fetch("/api/admin/attendance-finance-manage", {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "x-admin-secret": adminSecret,
                                      "x-admin-email": adminEmail,
                                    },
                                    body: JSON.stringify({
                                      action: "DELETE_PAYMENT",
                                      transaction_id: p.id,
                                    }),
                                  });
                                  if (!res.ok) {
                                    const errData = await res.json();
                                    throw new Error(errData.error || "Fallo al eliminar pago.");
                                  }
                                  fetchDashboardData();
                                } catch (err: any) {
                                  alert(err.message || "Error al eliminar pago.");
                                  fetchDashboardData();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN B: ROSTER, HORARIOS & BECAS */}
      {activeTab === "roster_becas" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Módulo Exclusivo:</strong> Gestión de Días de Entrenamiento, Cuota Base Personalizada ($50 MXN) y Nivel de Beca (0% a 100%).</span>
            </div>
          </div>
          <SuperAdminOmniManager initialSubTab="athletes" onDataChanged={fetchDashboardData} />
        </div>
      )}

      {/* SECCIÓN C: REGISTRO RETROACTIVO / CORRECCIONES */}
      {activeTab === "retroactivo" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-sky-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-400 shrink-0" />
              <span><strong>Control Total del Head Coach:</strong> Corrección y asentamiento retroactivo de asistencias pasadas o futuras y balance de pagos.</span>
            </div>
          </div>
          <SuperAdminOmniManager initialSubTab="inline_attendance" onDataChanged={fetchDashboardData} />
        </div>
      )}

      {activeTab === "test_day" && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-selector de Vista Test Day */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="inline-flex p-1 rounded-xl bg-[#121724] border border-zinc-800 flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setTestDaySubView("express")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                  testDaySubView === "express"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>⚡ Combine Express (Tabla Masiva de Toda la Cancha)</span>
              </button>
              <button
                type="button"
                onClick={() => setTestDaySubView("dual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                  testDaySubView === "dual"
                    ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>🎯 Control Dual (Día 1, Físico & Batería)</span>
              </button>
              <button
                type="button"
                onClick={() => setTestDaySubView("ovr")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                  testDaySubView === "ovr"
                    ? "bg-[#ea580c] text-white shadow-md shadow-orange-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>📊 Evaluación por Nivel (OVR)</span>
              </button>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
              {testDaySubView === "express" 
                ? "Califica a toda la lista de alumnos en una sola tabla táctil" 
                : testDaySubView === "dual"
                ? "Línea base de llegada y entrenamiento modular con interruptores ON/OFF" 
                : "Calificación y cálculo de Overall Rating OVR por nivel"}
            </span>
          </div>

          {testDaySubView === "express" ? (
            <CombineExpressTable />
          ) : testDaySubView === "dual" ? (
            <DualCoachCommand />
          ) : (
            <TestDayEvaluator />
          )}
        </div>
      )}

      {activeTab === "home_training" && (
        <div className="space-y-4 animate-fade-in">
          <BunkerHomeTrainingMonitor />
        </div>
      )}

      {activeTab === "guardians" && (
        <div className="space-y-4 animate-fade-in">
          <GuardianDirectory />
        </div>
      )}

      {activeTab === "coaches" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase text-zinc-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0284c7]" /> Entrenadores y Postulantes
            </h3>

            {coaches.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No hay registros de coaches.</div>
            ) : (
              <div className="space-y-3">
                {coaches.map((c) => {
                  const isPending = c.role === "coach_pending" || c.status === "pending";
                  return (
                    <div key={c.id} className="bg-[#121724] border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.full_name || "Sin nombre"}</h4>
                        <p className="text-xs text-zinc-400">{c.email}</p>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          !isPending
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {!isPending ? "COACH ACTIVO" : "PENDIENTE DE APROBACIÓN"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => approveCoach(c.id)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Check className="w-4 h-4" /> Aprobar Coach
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(c.id)}
                          className="p-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
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
        </div>
      )}
      </div>
      <AdminAttendanceFinanceModal
        isOpen={adminAdjustModalOpen}
        onClose={() => setAdminAdjustModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
        initialData={adminAdjustInitialData}
      />
      <TacticalAIAssistant />
    </>
  );
}
