"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Activity
} from "lucide-react";
import AttendanceTracker from "@/components/AttendanceTracker";
import CourtAttendanceCommand from "@/components/CourtAttendanceCommand";
import TestDayEvaluator from "@/components/TestDayEvaluator";
import DualCoachCommand from "@/components/DualCoachCommand";
import { 
  syncOfflineQueueToSupabase, 
  getOfflineQueueCount 
} from "@/lib/offlineSync";

export default function MasterBunkerHQ() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [adminLabel, setAdminLabel] = useState("SUPER ADMINISTRADOR");
  const [activeTab, setActiveTab] = useState<"attendance" | "finance" | "test_day" | "coaches">("attendance");
  const [attendanceSubView, setAttendanceSubView] = useState<"command" | "historical">("command");
  const [testDaySubView, setTestDaySubView] = useState<"dual" | "ovr">("dual");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // Estado Offline-First
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") return navigator.onLine;
    return true;
  });
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Métricas financieras calculadas
  const [metrics, setMetrics] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
  });

  const checkSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = secretKey.trim().toUpperCase();
    if (
      normalized === "WW-SUPERADMIN-FULL-2026" ||
      normalized === "RICARDO-WOLVES-2026" ||
      normalized === "CARLOS-WOLVES-2026"
    ) {
      if (normalized === "RICARDO-WOLVES-2026") {
        setAdminLabel("COACH RICARDO (SUPERADMIN)");
      } else if (normalized === "CARLOS-WOLVES-2026") {
        setAdminLabel("COACH CARLOS (ADMIN)");
      } else {
        setAdminLabel("SUPER ADMINISTRADOR");
      }
      setAuthenticated(true);
      setAuthError("");
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

      // 2. Cargar pagos desde Supabase
      const { data: paymentsData } = await supabase
        .from("membership_payments")
        .select("*, profiles(full_name, email)")
        .order("payment_date", { ascending: false });

      // Cálculos de métricas financieras
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      // Inicio de la semana (Lunes)
      const dayOfWeek = now.getDay() || 7; 
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
      const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      let dayTotal = 0;
      let weekTotal = 0;
      let monthTotal = 0;
      let yearTotal = 0;

      if (paymentsData && paymentsData.length > 0) {
        setPayments(paymentsData);

        paymentsData.forEach((p) => {
          const amt = Number(p.amount) || 0;
          const pDate = p.payment_date || todayStr;
          const parts = pDate.split("-");
          const pY = Number(parts[0]) || currentYear;
          const pM = Number(parts[1]) || currentMonth;

          if (pDate === todayStr) dayTotal += amt;
          if (pDate >= startOfWeekStr) weekTotal += amt;
          if (pM === currentMonth && pY === currentYear) monthTotal += amt;
          if (pY === currentYear) yearTotal += amt;
        });

        setMetrics({
          day: dayTotal,
          week: weekTotal,
          month: monthTotal,
          year: yearTotal
        });
      } else {
        // Fallback a pagos de HoopStore local
        const localAnalytics = HoopStore.getFinancialAnalytics();
        setMetrics({
          day: localAnalytics.todayIncome,
          week: localAnalytics.weekIncome,
          month: localAnalytics.monthIncome,
          year: localAnalytics.yearIncome,
        });
        
        const formattedLocalPayments = localAnalytics.allPayments.map(p => ({
          id: p.id,
          payment_date: p.date,
          student_id: p.studentId,
          concept: (p as any).concept || p.notes || "Mensualidad deportiva",
          payment_method: p.method.toLowerCase(),
          amount: p.amount,
          status: p.status.toLowerCase(),
          profiles: {
            full_name: p.studentName,
            email: "atleta@wildwolves.mx"
          }
        }));
        setPayments(formattedLocalPayments);
      }

    } catch (err) {
      console.error("Error al cargar datos del Búnker:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    window.addEventListener("offline_queue_synced", handleRefresh);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated as EventListener);

    setQueueCount(getOfflineQueueCount());

    return () => {
      window.removeEventListener("payment_recorded", handleRefresh);
      window.removeEventListener("offline_queue_synced", handleRefresh);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-4">
        <form onSubmit={checkSecret} className="max-w-md w-full bg-[#0d1017] border border-amber-500/40 p-8 rounded-3xl text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-black uppercase mb-1 tracking-wide">Búnker Super Administrador</h2>
          <p className="text-xs text-zinc-400 mb-6 font-sans">
            Ingresa tu llave maestra para gestionar el club en producción.
          </p>

          {authError && (
            <div className="mb-4 bg-red-500/15 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-xl">
              {authError}
            </div>
          )}

          <div className="relative mb-4">
            <input
              type={showKey ? "text" : "password"}
              placeholder="Master SuperAdmin Secret"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-[#05070a] border border-zinc-700 rounded-xl py-3 px-4 pr-11 text-sm text-center text-white outline-none focus:border-amber-500 font-mono tracking-wider"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Desbloquear Consola Total
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* HEADER BÚNKER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
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
          <h1 className="text-3xl font-black uppercase text-white mt-2 tracking-tight">Panel Central de Dirección</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOnline && queueCount > 0 && (
            <button
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await syncOfflineQueueToSupabase();
                  fetchDashboardData();
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-black px-3.5 py-2.5 rounded-xl font-black transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? "animate-bounce" : ""}`} />
              Sincronizar ({queueCount})
            </button>
          )}
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
          onClick={() => setActiveTab("finance")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "finance"
              ? "bg-[#22c55e] text-black font-black shadow-lg shadow-emerald-500/20"
              : "bg-[#121724] text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Finanzas & Ingresos
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
            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
              {attendanceSubView === "command" 
                ? "Diseño auto-ajustable en tiempo real para móvil, tablet y monitor" 
                : "Consulta y reportes por fecha de calendario"}
            </span>
          </div>

          {attendanceSubView === "command" ? (
            <CourtAttendanceCommand />
          ) : (
            <AttendanceTracker />
          )}
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

          {/* TABLA DE ÚLTIMOS COBROS REGISTRADOS */}
          <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase text-zinc-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Registro Histórico de Cobros
            </h3>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No hay pagos registrados aún en el sistema.</div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "test_day" && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-selector de Vista Test Day */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="inline-flex p-1 rounded-xl bg-[#121724] border border-zinc-800">
              <button
                type="button"
                onClick={() => setTestDaySubView("dual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  testDaySubView === "dual"
                    ? "bg-[#8b5cf6] text-white shadow-md shadow-purple-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>⚡ Control Dual (Día 1, Físico y Baloncesto)</span>
              </button>
              <button
                type="button"
                onClick={() => setTestDaySubView("ovr")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  testDaySubView === "ovr"
                    ? "bg-[#ea580c] text-white shadow-md shadow-orange-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>📊 Evaluación Biomecánica por Nivel (OVR)</span>
              </button>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
              {testDaySubView === "dual" 
                ? "Línea base de llegada y entrenamiento modular con interruptores ON/OFF" 
                : "Calificación y cálculo de Overall Rating OVR por nivel"}
            </span>
          </div>

          {testDaySubView === "dual" ? (
            <DualCoachCommand />
          ) : (
            <TestDayEvaluator />
          )}
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
  );
}
