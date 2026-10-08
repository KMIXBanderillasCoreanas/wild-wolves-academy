"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  enqueueOfflineAction, 
  getCachedRoster, 
  cacheRosterLocally, 
  syncOfflineQueueToSupabase,
  generateUUID,
  getOfflineQueueCount
} from "@/lib/offlineSync";

export interface StudentRosterItem {
  id: string;
  full_name: string;
  number?: string;
  category?: string;
  schedule_days?: string;
  attendance_rate?: number;
  last_payment_status: "al_corriente" | "adeudo";
  last_payment_amount?: number;
  last_session_date?: string;
  attendance_status?: "presente" | "retardo" | "falta";
  tutor_phone?: string;
  shift?: "matutino" | "vespertino" | string;
}

export default function CourtAttendanceCommand() {
  const [shift, setShift] = useState<"matutino" | "vespertino">("vespertino");
  const [filterMode, setFilterMode] = useState<"scheduled_today" | "all">("scheduled_today");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "al_corriente" | "adeudo">("all");
  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  // Estados de cobro rápido en cancha
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(150);
  const [payMethod, setPayMethod] = useState<"efectivo" | "spei">("efectivo");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Lista de atletas con carga resiliente (inicializada vacía, solo atletas reales de Supabase)
  const [students, setStudents] = useState<StudentRosterItem[]>([]);

  const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const currentDayName = daysMap[new Date().getDay()];
  const todayFormatted = new Intl.DateTimeFormat('es-MX', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short' 
  }).format(new Date());

  const loadRoster = useCallback(async () => {
    try {
      // 1. Intentar cargar desde Supabase si hay conexión
      if (typeof window !== "undefined" && navigator.onLine) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("role", "student");

        if (profiles && profiles.length > 0) {
          const { data: comms } = await supabase
            .from("attendance_commitments")
            .select("user_id, days_selected, shift");

          const { data: payments } = await supabase
            .from("membership_payments")
            .select("student_id, amount, status, payment_date")
            .order("payment_date", { ascending: false });

          const todayIso = new Date().toISOString().split("T")[0];
          const { data: todayAttendance } = await supabase
            .from("daily_attendance")
            .select("student_id, status, shift")
            .eq("date", todayIso);

          const mapped: StudentRosterItem[] = profiles.map((p, idx) => {
            const comm = comms?.find(c => c.user_id === p.id);
            const pay = payments?.find(pay => pay.student_id === p.id);
            const att = todayAttendance?.find(a => a.student_id === p.id);
            const isPaid = pay ? pay.status === "pagado" : false;

            return {
              id: p.id,
              full_name: p.full_name || "Atleta Wild Wolves",
              number: `#${(idx * 7 + 8) % 99 || 11}`,
              category: idx % 3 === 0 ? "U-15 FORMATIVO" : idx % 3 === 1 ? "U-17 COMPETITIVO" : "ADULTOS +20",
              schedule_days: comm?.days_selected?.join("-") || "Lun-Mié-Vie",
              shift: comm?.shift?.includes("matutino") ? "matutino" : "vespertino",
              attendance_rate: 85,
              last_payment_status: isPaid ? "al_corriente" : "adeudo",
              last_payment_amount: pay ? Number(pay.amount) : 150,
              attendance_status: (att?.status as any) || undefined,
              tutor_phone: "+525522427769",
            };
          });

          setStudents(mapped);
          cacheRosterLocally(mapped);
          return;
        } else {
          setStudents([]);
          return;
        }
      }

      // 2. Fallback offline solo si hay atletas reales cacheados previamente
      const cached = getCachedRoster();
      if (cached && cached.length > 0) {
        setStudents(cached);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn("Fallo cargando roster en CourtAttendanceCommand:", err);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setOfflineCount(getOfflineQueueCount());
    }
    loadRoster();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdated = (e: any) => {
      setOfflineCount(e.detail?.count ?? getOfflineQueueCount());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
    window.addEventListener("payment_recorded", loadRoster);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
      window.removeEventListener("payment_recorded", loadRoster);
    };
  }, [loadRoster]);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await syncOfflineQueueToSupabase();
      setOfflineCount(getOfflineQueueCount());
      await loadRoster();
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: "presente" | "retardo" | "falta") => {
    // Optimistic UI update
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance_status: status } : s));

    const todayDate = new Date().toISOString().split("T")[0];
    const shiftCode = shift === "matutino" ? "matutino_9_11" : "vespertino_5_7";
    const payload = {
      student_id: studentId,
      date: todayDate,
      shift: shiftCode,
      status
    };

    // Sincronizar en HoopStore
    HoopStore.recordDailyAttendance(
      studentId,
      todayDate,
      shiftCode,
      status,
      "Pase de lista Stitch Command"
    );

    if (!navigator.onLine) {
      enqueueOfflineAction("ATTENDANCE", payload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("daily_attendance").upsert(payload, { onConflict: "student_id,date,shift" });
      } catch {
        enqueueOfflineAction("ATTENDANCE", payload);
        setOfflineCount(getOfflineQueueCount());
      }
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedStudent) return;
    const todayDate = new Date().toISOString().split("T")[0];
    const paymentId = generateUUID();

    const paymentPayload = {
      id: paymentId,
      student_id: selectedStudent.id,
      amount: payAmount,
      payment_date: todayDate,
      payment_method: payMethod === "efectivo" ? "efectivo" : "transferencia",
      concept: payAmount === 50 ? "clase_individual" : payAmount === 150 ? "semanal" : "mensualidad",
      status: "pagado"
    };

    // Sincronizar en HoopStore local y disparar evento global
    HoopStore.recordPayment(
      selectedStudent.id,
      payAmount,
      payMethod === "efectivo" ? "Efectivo" : "Transferencia"
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("payment_recorded"));
    }

    if (!navigator.onLine) {
      enqueueOfflineAction("PAYMENT", paymentPayload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("membership_payments").upsert(paymentPayload, { onConflict: "id" });
      } catch {
        enqueueOfflineAction("PAYMENT", paymentPayload);
        setOfflineCount(getOfflineQueueCount());
      }
    }

    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { 
      ...s, 
      last_payment_status: "al_corriente", 
      last_payment_amount: payAmount 
    } : s));

    if (sendWhatsApp && selectedStudent.tutor_phone) {
      const msg = encodeURIComponent(`Hola, se confirmó el pago de $${payAmount} MXN (${paymentPayload.concept}) para el atleta ${selectedStudent.full_name} en Wild Wolves CDMX (Sede Deportivo Carmen Serdán). ¡Gracias por su confianza! 🐺🏀`);
      window.open(`https://wa.me/${selectedStudent.tutor_phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }

    setSelectedStudent(null);
  };

  // Filtrado reactivo de atletas
  const filtered = students.filter(st => {
    // 1. Búsqueda
    const matchesSearch = 
      st.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (st.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (st.number || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filtro de Turno / Día Programado
    if (filterMode === "scheduled_today") {
      // Si el alumno tiene turno asignado y no coincide con el turno activo
      if (st.shift && st.shift !== shift) return false;
    }

    // 3. Filtro Financiero
    if (paymentFilter === "al_corriente" && st.last_payment_status !== "al_corriente") return false;
    if (paymentFilter === "adeudo" && st.last_payment_status !== "adeudo") return false;

    return true;
  });

  // Métricas calculadas para la barra táctica
  const sessionStudents = students.filter(s => filterMode === "all" || (s.shift ? s.shift === shift : true));
  const totalInSession = sessionStudents.length;
  const presentCount = sessionStudents.filter(s => s.attendance_status === "presente").length;
  const lateCount = sessionStudents.filter(s => s.attendance_status === "retardo").length;
  const absentCount = sessionStudents.filter(s => s.attendance_status === "falta").length;
  const debtorCount = sessionStudents.filter(s => s.last_payment_status === "adeudo").length;
  const totalDebtAmount = sessionStudents
    .filter(s => s.last_payment_status === "adeudo")
    .reduce((acc, curr) => acc + (curr.last_payment_amount || 150), 0);
  const attendanceRatePct = totalInSession > 0 ? Math.round((presentCount / totalInSession) * 100) : 0;

  return (
    <div className="w-full bg-surface text-on-surface rounded-3xl border border-surface-container-high shadow-2xl p-4 sm:p-6 lg:p-7 space-y-5 transition-all duration-300">
      
      {/* 1. COURT SESSION CONTROL & SYNC STRIP (100% RESPONSIVE) */}
      <section className="bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-surface-container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sede y Título Táctico */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-container text-[24px]">stadium</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-on-surface uppercase tracking-tight text-base sm:text-lg">
                  On-Court Command
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-secondary border border-secondary/20">
                  Carmen Serdán Court
                </span>
              </div>
              <p className="text-xs text-on-surface-variant capitalize mt-0.5">
                {todayFormatted} • Sede Oficial Wild Wolves
              </p>
            </div>
          </div>

          {/* Turnos Selector + Sync Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Turno Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container border border-surface-container-high">
              <button
                type="button"
                onClick={() => setShift("matutino")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shift === "matutino" 
                    ? "bg-primary-container text-on-primary shadow-sm" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span>Matutino (09:00 - 11:00)</span>
              </button>
              <button
                type="button"
                onClick={() => setShift("vespertino")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shift === "vespertino" 
                    ? "bg-primary-container text-on-primary shadow-sm" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">sports_score</span>
                <span>Vespertino (17:00 - 19:00)</span>
              </button>
            </div>

            {/* Offline-First Sync Pill */}
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-tertiary animate-ping" : "bg-error"}`} />
                <span className={`text-[11px] font-bold uppercase ${isOnline ? "text-tertiary" : "text-error"}`}>
                  {isOnline ? (offlineCount > 0 ? `Subiendo (${offlineCount})...` : "En Línea • Sincronizado") : `Offline (${offlineCount} en cola)`}
                </span>
              </div>
              <button 
                onClick={triggerSync} 
                disabled={syncing}
                className={`text-tertiary hover:text-white transition cursor-pointer ml-1 p-0.5 rounded hover:bg-surface-variant ${syncing ? "animate-spin" : ""}`} 
                type="button"
                title="Sincronizar cambios ahora"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. QUICK KPI METRICS BANNER (RESPONSIVE 2X2 ON MOBILE, 4-COL ON DESKTOP) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Roster Hoy */}
        <div className="flex flex-col justify-between bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-surface-container hover:border-surface-container-high transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-on-surface-variant uppercase font-bold tracking-wider">
              Roster Sesión
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-on-surface">{totalInSession}</span>
            <span className="text-xs text-on-surface-variant font-medium">atletas</span>
          </div>
          <span className="text-[10px] text-secondary mt-1 font-semibold capitalize">Turno {shift}</span>
        </div>

        {/* Presentes */}
        <div className="flex flex-col justify-between bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-surface-container hover:border-surface-container-high transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-tertiary uppercase font-bold tracking-wider">
              Presentes
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-tertiary">{presentCount}</span>
            <span className="text-xs text-tertiary/70 font-bold">({attendanceRatePct}%)</span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1 font-medium">Asistencia en duela/cancha</span>
        </div>

        {/* Retardos / Faltas */}
        <div className="flex flex-col justify-between bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-surface-container hover:border-surface-container-high transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-primary uppercase font-bold tracking-wider">
              Retardos / Faltas
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-primary">{lateCount} <span className="text-xs font-normal text-on-surface-variant">ret.</span></span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-xl sm:text-2xl font-black text-error">{absentCount} <span className="text-xs font-normal text-on-surface-variant">falt.</span></span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1 font-medium">Incidencias hoy</span>
        </div>

        {/* Cobros Pendientes */}
        <div className="flex flex-col justify-between bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-surface-container hover:border-surface-container-high transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-error uppercase font-bold tracking-wider">
              Cobros Pendientes
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">payments</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-error">{debtorCount}</span>
            <span className="text-xs text-error/80 font-bold">(${totalDebtAmount} MXN)</span>
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1 font-medium">Cobro rápido disponible</span>
        </div>
      </section>

      {/* 3. TOOLBAR: SEARCH & RESPONSIVE FILTER TABS */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-surface-container text-on-surface text-xs placeholder:text-outline focus:outline-none border border-surface-container-high focus:border-secondary transition"
            placeholder="Buscar por atleta, categoría, dorsal o tutor..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Modalidad de Roster */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container border border-surface-container-high shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("scheduled_today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === "scheduled_today"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Hoy en Turno
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === "all"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Todo el Plantel
            </button>
          </div>

          {/* Filtro Estatus Pago */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container border border-surface-container-high shrink-0">
            <button
              type="button"
              onClick={() => setPaymentFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "all"
                  ? "bg-surface-variant text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter("adeudo")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "adeudo"
                  ? "bg-error-container text-on-error-container"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Adeudos ({debtorCount})
            </button>
          </div>
        </div>
      </section>

      {/* 4. ATHLETE ROSTER: AUTO-ADJUSTING RESPONSIVE GRID (1 COL ON MOBILE, 2 COLS ON TABLET, 3-4 COLS ON DESKTOP) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 px-6 text-center bg-surface-container-low/80 rounded-3xl border border-surface-container-high/80 shadow-2xl flex flex-col items-center justify-center max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary-container mb-4 border border-surface-container-highest shadow-inner">
              <span className="material-symbols-outlined text-3xl">sports_basketball</span>
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              {search ? "Sin resultados para tu búsqueda" : "No hay atletas registrados en este turno"}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mt-2 leading-relaxed">
              {search 
                ? `No se encontró ningún alumno con el criterio "${search}".` 
                : "Los alumnos aparecerán aquí automáticamente en cuanto completen su registro inicial con Google o correo en el Deportivo Carmen Serdán."}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-surface-container-high text-[11px] font-mono text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Turno: {shift === "matutino" ? "Matutino (09:00 - 11:00 hrs)" : "Vespertino (17:00 - 19:00 hrs)"}</span>
            </div>
          </div>
        ) : (
          filtered.map((st) => (
            <article 
              key={st.id} 
              className="flex flex-col justify-between bg-surface-container-low hover:bg-surface-container/70 p-4 rounded-2xl gap-3.5 border border-surface-container/80 hover:border-surface-container-high transition-all duration-200 shadow-md hover:shadow-xl group"
            >
              {/* Card Header: Dorsal, Nombre, Categoría & Semáforo */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-container/80 to-surface-variant flex items-center justify-center font-black text-sm text-on-primary shadow-sm shrink-0">
                      {st.number || "#"}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-on-surface block leading-tight">
                        {st.full_name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-variant text-secondary font-bold">
                          {st.category}
                        </span>
                        <span className="text-[10px] text-outline font-medium">
                          {st.schedule_days}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge de Estatus de Pago */}
                  {st.last_payment_status === "al_corriente" ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-[10px] font-bold border border-tertiary/20 shrink-0">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Al Corriente</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold animate-pulse shrink-0">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>Adeudo</span>
                    </div>
                  )}
                </div>

                {/* Subinfo si tiene adeudo */}
                {st.last_payment_status === "adeudo" && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => { 
                        setSelectedStudent(st); 
                        setPayAmount(st.last_payment_amount || 150); 
                      }}
                      className="flex items-center justify-between w-full h-10 px-3 rounded-xl bg-primary-container text-on-primary font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                        <span>Cobrar en Cancha</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] font-black">
                        ${st.last_payment_amount || 150} MXN
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: 3-State Attendance Selector */}
              <div className="pt-2 border-t border-surface-container/60">
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1.5 flex items-center justify-between">
                  <span>Asistencia Hoy</span>
                  {st.attendance_status && (
                    <span className="capitalize font-semibold text-secondary">
                      {st.attendance_status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "presente")}
                    className={`flex items-center justify-center gap-1 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "presente"
                        ? "bg-tertiary text-on-tertiary shadow-md"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="Marcar Presente"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span className="hidden sm:inline">Presente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "retardo")}
                    className={`flex items-center justify-center gap-1 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "retardo"
                        ? "bg-primary-container text-on-primary shadow-md"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="Marcar Retardo"
                  >
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="hidden sm:inline">Retardo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "falta")}
                    className={`flex items-center justify-center gap-1 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "falta"
                        ? "bg-error-container text-on-error-container shadow-md"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="Marcar Falta"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span className="hidden sm:inline">Falta</span>
                  </button>
                </div>
              </div>

            </article>
          ))
        )}
      </section>

      {/* 5. QUICK PAYMENT SHEET MODAL (RESPONSIVE) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-surface-container-high rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border border-surface-container animate-fade-in shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="font-black text-sm uppercase text-on-surface block tracking-wide">
                  Cobro Rápido en Cancha
                </span>
                <span className="text-xs text-secondary font-bold mt-0.5 block">
                  {selectedStudent.full_name} ({selectedStudent.category})
                </span>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-variant transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Selector de Monto */}
            <div>
              <label className="text-[11px] font-bold uppercase text-on-surface-variant block mb-2">
                Selecciona Concepto y Monto:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { amt: 50, label: "Por Clase", desc: "1 Sesión" },
                  { amt: 150, label: "Semanal", desc: "3 Sesiones" },
                  { amt: 600, label: "Mensual", desc: "Mes Completo" }
                ].map(item => (
                  <button
                    key={item.amt}
                    type="button"
                    onClick={() => setPayAmount(item.amt)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer border ${
                      payAmount === item.amt
                        ? "bg-primary-container border-primary-container text-on-primary shadow-md scale-102"
                        : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="text-base font-black">${item.amt}</span>
                    <span className="text-[10px] uppercase font-bold mt-0.5">{item.label}</span>
                    <span className="text-[9px] opacity-75">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="text-[11px] font-bold uppercase text-on-surface-variant block mb-2">
                Método de Cobro:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod("efectivo")}
                  className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    payMethod === "efectivo"
                      ? "bg-secondary-container text-on-secondary-container shadow font-extrabold"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Efectivo en Cancha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("spei")}
                  className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    payMethod === "spei"
                      ? "bg-secondary-container text-on-secondary-container shadow font-extrabold"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  <span>SPEI / Transferencia</span>
                </button>
              </div>
            </div>

            {/* Opción Comprobante WhatsApp */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container cursor-pointer text-xs border border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">chat</span>
                <span className="text-on-surface font-medium">Enviar comprobante por WhatsApp al tutor</span>
              </div>
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-primary-container cursor-pointer"
              />
            </label>

            {/* Botón de Confirmación */}
            <button
              type="button"
              onClick={handleConfirmPayment}
              className="h-12 w-full rounded-xl bg-tertiary hover:bg-[#3ecb65] text-on-tertiary font-extrabold text-sm uppercase flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Confirmar Cobro (${payAmount} MXN)</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
