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
import DemoRoleSwitcher from "@/components/DemoRoleSwitcher";
import { Home } from "lucide-react";
import TacticalAIAssistant from "@/components/TacticalAIAssistant";
import MasterAICockpit from "@/components/MasterAICockpit";
import TacticalRadarAlerts from "@/components/TacticalRadarAlerts";
import WhatsAppHubCRM from "@/components/WhatsAppHubCRM";
import ExpensesManager from "@/components/ExpensesManager";
import SecurityBackupManager from "@/components/SecurityBackupManager";

export default function MasterBunkerHQ() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [adminLabel, setAdminLabel] = useState("COACH RICARDO • FUNDADOR & DIRECTOR GENERAL");
  const [activeTab, setActiveTab] = useState<"attendance" | "finance" | "roster_community" | "security_sentinel" | "smart_placement" | "roster_becas" | "retroactivo" | "test_day" | "home_training" | "guardians" | "coaches" | "whatsapp_crm">("attendance");
  const [rosterSubView, setRosterSubView] = useState<"all_roster" | "guardians" | "smart_placement" | "whatsapp" | "staff_coaches">("all_roster");

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

      const handleOpenTestDay = (e: any) => {
        const studentId = e?.detail?.studentId;
        if (studentId) {
          setSelectedAthleteForTestDay(studentId);
          setActiveTab("attendance");
          setAttendanceSubView("test_day_ovr");
        }
      };

      window.addEventListener("popstate", applyTabFromUrl);
      window.addEventListener("tab_changed", applyTabFromUrl);
      window.addEventListener("change-bunker-tab", handleCustomTab);
      window.addEventListener("open_test_day_evaluator", handleOpenTestDay);
      return () => {
        window.removeEventListener("popstate", applyTabFromUrl);
        window.removeEventListener("tab_changed", applyTabFromUrl);
        window.removeEventListener("change-bunker-tab", handleCustomTab);
        window.removeEventListener("open_test_day_evaluator", handleOpenTestDay);
      };
    }
  }, []);
  const [attendanceSubView, setAttendanceSubView] = useState<"command" | "historical" | "combine" | "test_day_ovr">("command");
  const [selectedAthleteForTestDay, setSelectedAthleteForTestDay] = useState<string>("");
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Métricas financieras calculadas
  const [metrics, setMetrics] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
    totalDebt: 0,
    debtCount: 0
  });
  const [debtorsList, setDebtorsList] = useState<any[]>([]);

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
        .select("*, profiles!membership_payments_student_id_fkey(full_name, email)")
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

      // FALLBACK SEGURO VÍA API SERVICE ROLE SI RLS SUPABASE BLOQUEA AL ANON
      if (combinedPayments.length === 0) {
        try {
          const res = await fetch("/api/admin/attendance-finance-manage", {
            headers: {
              "x-admin-secret": "WW-SUPERADMIN-FULL-2026",
              "x-admin-email": "wildwolvescdmx@gmail.com"
            }
          });
          if (res.ok) {
            const apiData = await res.json();
            if (apiData.transactions && apiData.transactions.length > 0) {
              combinedPayments = apiData.transactions.map((t: any) => ({
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
          }
        } catch (fetchErr) {
          console.warn("Fallback de finanzas vía API administrativo:", fetchErr);
        }
      }

      // 3. Consultar alumnos con adeudo en profiles
      let totalDebts = 0;
      let debtorsFound: any[] = [];
      try {
        const { data: dbAthletes } = await supabase
          .from("profiles")
          .select("id, full_name, current_debt_amount, financial_status, phone_number, parent_name, notes")
          .or("current_debt_amount.gt.0,financial_status.eq.adeudo");

        if (dbAthletes && dbAthletes.length > 0) {
          debtorsFound = dbAthletes.map((a: any) => ({
            id: a.id,
            name: a.full_name,
            debt: Number(a.current_debt_amount) || 50,
            status: a.financial_status,
            phone: a.phone_number || "+52 55 2242 7769",
            notes: a.notes || "Clase de entrenamiento pendiente",
          }));
          totalDebts = debtorsFound.reduce((acc, curr) => acc + curr.debt, 0);
        } else {
          // Fallback vía API service role para deudores
          try {
            const res = await fetch("/api/admin/attendance-finance-manage", {
              headers: {
                "x-admin-secret": "WW-SUPERADMIN-FULL-2026",
                "x-admin-email": "wildwolvescdmx@gmail.com"
              }
            });
            if (res.ok) {
              const apiData = await res.json();
              if (apiData.athletes && apiData.athletes.length > 0) {
                const apiDebtors = apiData.athletes.filter((a: any) => 
                  Number(a.current_debt_amount) > 0 || a.financial_status === "adeudo"
                );
                if (apiDebtors.length > 0) {
                  debtorsFound = apiDebtors.map((a: any) => ({
                    id: a.id,
                    name: a.full_name,
                    debt: Number(a.current_debt_amount) || 50,
                    status: a.financial_status,
                    phone: "+52 55 2242 7769",
                    notes: "Clase de entrenamiento pendiente",
                  }));
                  totalDebts = debtorsFound.reduce((acc: number, curr: any) => acc + curr.debt, 0);
                }
              }
            }
          } catch {}
        }
      } catch (errD) {
        console.warn("Aviso al consultar deudores:", errD);
      }
      setDebtorsList(debtorsFound);

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
          totalDebt: totalDebts,
          debtCount: debtorsFound.length,
        });
      } else {
        setPayments([]);
        setMetrics({
          day: 0,
          week: 0,
          month: 0,
          year: 0,
          totalDebt: totalDebts,
          debtCount: debtorsFound.length,
        });
      }
    } catch (err) {
      console.error("Error al cargar datos del Búnker:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchDashboardData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("payment_recorded", handleRefresh);
    window.addEventListener("payment_deleted", handleRefresh);
    window.addEventListener("attendance_updated", handleRefresh);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

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
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
          <DemoRoleSwitcher currentRole="superadmin" variant="header" />
          <button
            onClick={() => {
              setAdminAdjustInitialData(null);
              setAdminAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white px-4 py-2.5 rounded-xl font-black transition cursor-pointer shadow-lg shadow-orange-600/30"
          >
            <Settings className="w-3.5 h-3.5" /> Ajuste Manual de Registros
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

      {/* PESTAÑAS PRINCIPALES DE GESTIÓN: 4 GRANDES CENTROS DE MANDO TÁCTICOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-6 border-b border-zinc-800 pb-4">
        {/* HUB 1: DUELA & ASISTENCIA */}
        <button
          onClick={() => setActiveTab("attendance")}
          className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "attendance"
              ? "bg-[#ea580c] text-white border-orange-500 shadow-lg shadow-orange-600/30 font-black"
              : "bg-[#10141e] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <Calendar className="w-5 h-5 text-orange-400" />
          <span className="uppercase tracking-tight text-[11px] font-black">1. Duela & Cancha</span>
          <span className="text-[9px] text-zinc-300 font-normal">Pase 1-Tap • Asistencia</span>
        </button>

        {/* HUB 2: FINANZAS & CAJA */}
        <button
          onClick={() => setActiveTab("finance")}
          className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "finance"
              ? "bg-[#16a34a] text-white border-emerald-400 shadow-lg shadow-emerald-600/30 font-black"
              : "bg-[#10141e] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span className="uppercase tracking-tight text-[11px] font-black">2. Finanzas & Caja</span>
          <span className="text-[9px] text-zinc-300 font-normal">Cobros • Abonos • Deudores</span>
        </button>

        {/* HUB 3: ATLETAS & COMUNIDAD */}
        <button
          onClick={() => setActiveTab("roster_community")}
          className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "roster_community"
              ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 font-black"
              : "bg-[#10141e] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <Users className="w-5 h-5 text-purple-300" />
          <span className="uppercase tracking-tight text-[11px] font-black">3. Roster & Familias</span>
          <span className="text-[9px] text-zinc-300 font-normal">Atletas • WhatsApp • Tutores</span>
        </button>

        {/* HUB 4: SEGURIDAD, RESPALDOS & CENTINELA */}
        <button
          onClick={() => setActiveTab("security_sentinel")}
          className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "security_sentinel"
              ? "bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 font-black"
              : "bg-[#10141e] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="uppercase tracking-tight text-[11px] font-black">4. Respaldos & IA Sentinel</span>
          <span className="text-[9px] text-zinc-300 font-normal">Copias JSON • Anti-Hackeo</span>
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
              <button
                type="button"
                onClick={() => setAttendanceSubView("combine")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  attendanceSubView === "combine"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>🎯 Combine Express</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSubView("test_day_ovr")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  attendanceSubView === "test_day_ovr"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>⚡ Test Day Individual OVR</span>
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
          ) : attendanceSubView === "historical" ? (
            <AttendanceTracker />
          ) : attendanceSubView === "combine" ? (
            <div className="space-y-4">
              <CombineExpressTable />
            </div>
          ) : (
            <div className="space-y-4">
              <TestDayEvaluator preselectedStudentId={selectedAthleteForTestDay} />
            </div>
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
          {/* TARJETAS KPI DE INGRESOS Y SALDOS PENDIENTES */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-[#121724] border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Ingresos de Hoy</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">
                ${metrics.day} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Esta Semana</span>
              <p className="text-xl sm:text-2xl font-black text-[#38bdf8] mt-1">
                ${metrics.week} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Mes en Curso</span>
              <p className="text-xl sm:text-2xl font-black text-[#22c55e] mt-1">
                ${metrics.month} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#121724] border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Año Acumulado</span>
              <p className="text-xl sm:text-2xl font-black text-[#ea580c] mt-1">
                ${metrics.year} <span className="text-xs text-zinc-500 font-normal">MXN</span>
              </p>
            </div>
            <div className="bg-[#1f1217] border-2 border-red-500/40 p-4 sm:p-5 rounded-2xl col-span-2 md:col-span-1 shadow-lg shadow-red-950/40">
              <span className="text-[10px] font-mono text-red-400 uppercase font-black tracking-wider flex items-center justify-between">
                <span>Por Cobrar</span>
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-bold">{metrics.debtCount} al.</span>
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-400 mt-1 font-mono">
                ${metrics.totalDebt} <span className="text-xs text-red-300/70 font-normal">MXN</span>
              </p>
            </div>
          </div>

          {/* BANNER DESGLOSE DE DEUDORES: QUIÉN DEBE Y CUÁNTO */}
          {debtorsList.length > 0 && (
            <div className="bg-gradient-to-r from-red-950/40 via-[#181116] to-[#121724] border-2 border-red-500/30 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-300">
                    Alumnos con Saldo Pendiente por Liquidar ({debtorsList.length})
                  </h3>
                </div>
                <span className="text-xs font-black text-red-400 font-mono bg-red-900/40 px-3 py-1 rounded-xl border border-red-500/30">
                  Total Adeudado: ${metrics.totalDebt} MXN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {debtorsList.map((d) => (
                  <div key={d.id} className="bg-[#0b0e16] border border-red-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white block">{d.name}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        {d.notes || "Clase de entrenamiento"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-red-400 font-mono block">
                        ${d.debt} MXN
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminAdjustInitialData({
                            type: "payment",
                            student_id: d.id,
                            student_name: d.name,
                            amount: d.debt,
                            concept: "Liquidación de Clase",
                            payment_method: "efectivo",
                          });
                          setAdminAdjustModalOpen(true);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer mt-0.5 block"
                      >
                        Cobrar / Ajustar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* HUB 3: ROSTER, ATLETAS & COMUNIDAD (CONSOLIDA EXPEDIENTES, SMART CRM, FAMILIAS & WHATSAPP) */}
      {activeTab === "roster_community" && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-selector para Atletas & Familias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setRosterSubView("all_roster")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                rosterSubView === "all_roster"
                  ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Plantel Completo & Becas</span>
            </button>
            <button
              type="button"
              onClick={() => setRosterSubView("guardians")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                rosterSubView === "guardians"
                  ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Directorio Familiar (Tutores)</span>
            </button>
            <button
              type="button"
              onClick={() => setRosterSubView("smart_placement")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                rosterSubView === "smart_placement"
                  ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Diagnóstico Exprés CRM</span>
            </button>
            <button
              type="button"
              onClick={() => setRosterSubView("whatsapp")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                rosterSubView === "whatsapp"
                  ? "bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setRosterSubView("staff_coaches")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                rosterSubView === "staff_coaches"
                  ? "bg-sky-600 text-white font-black shadow-md shadow-sky-600/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-sky-300" />
              <span>Staff Técnico & Postulantes</span>
            </button>
          </div>

          {rosterSubView === "all_roster" && (
            <SuperAdminOmniManager initialSubTab="athletes" onDataChanged={fetchDashboardData} />
          )}

          {rosterSubView === "guardians" && (
            <GuardianDirectory />
          )}

          {rosterSubView === "smart_placement" && (
            <SmartPlacementCRM />
          )}

          {rosterSubView === "whatsapp" && (
            <WhatsAppHubCRM />
          )}

          {rosterSubView === "staff_coaches" && (
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
          )}
        </div>
      )}

      {/* HUB 4: SEGURIDAD, RESPALDOS & CENTINELA ANTI-HACKEO */}
      {activeTab === "security_sentinel" && (
        <div className="space-y-6 animate-fade-in">
          <SecurityBackupManager />
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
