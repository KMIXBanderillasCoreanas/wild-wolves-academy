"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  enqueueOfflineAction, 
  getCachedRoster, 
  cacheRosterLocally, 
  syncOfflineQueueToSupabase,
  generateUUID 
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
}

export default function CourtAttendanceCommand() {
  const [shift, setShift] = useState<"matutino" | "vespertino">("vespertino");
  const [tab, setTab] = useState<"today" | "all">("today");
  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Estados de cobro rápido
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(150);
  const [payMethod, setPayMethod] = useState<"efectivo" | "spei">("efectivo");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Lista de atletas con carga resiliente
  const [students, setStudents] = useState<StudentRosterItem[]>([
    {
      id: "mateo-1",
      full_name: "Mateo Hernández",
      number: "#8",
      category: "U-15 FORMATIVO",
      schedule_days: "Lun-Mié-Vie",
      attendance_rate: 92,
      last_payment_status: "al_corriente",
      last_payment_amount: 600,
      attendance_status: "presente",
      tutor_phone: "+525549128810",
    },
    {
      id: "diego-2",
      full_name: "Diego Ramírez",
      number: "#23",
      category: "U-17 COMPETITIVO",
      schedule_days: "Mar-Jue",
      attendance_rate: 74,
      last_payment_status: "adeudo",
      last_payment_amount: 150,
      last_session_date: "18 Oct",
      attendance_status: "falta",
      tutor_phone: "+525549128810",
    },
    {
      id: "santiago-3",
      full_name: "Santiago Morales",
      number: "#11",
      category: "U-15 FORMATIVO",
      schedule_days: "Lun-Mié-Vie",
      attendance_rate: 88,
      last_payment_status: "al_corriente",
      last_payment_amount: 600,
      attendance_status: "retardo",
      tutor_phone: "+525549128810",
    }
  ]);

  const loadRoster = useCallback(async () => {
    try {
      // 1. Intentar cargar desde Supabase si hay conexión
      if (navigator.onLine) {
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

          const mapped: StudentRosterItem[] = profiles.map((p, idx) => {
            const comm = comms?.find(c => c.user_id === p.id);
            const pay = payments?.find(pay => pay.student_id === p.id);
            const isPaid = pay ? pay.status === "pagado" : false;

            return {
              id: p.id,
              full_name: p.full_name || "Atleta Wild Wolves",
              number: `#${(idx * 7 + 8) % 99 || 11}`,
              category: "U-15 FORMATIVO",
              schedule_days: comm?.days_selected?.join("-") || "Lun-Mié-Vie",
              attendance_rate: 85,
              last_payment_status: isPaid ? "al_corriente" : "adeudo",
              last_payment_amount: pay ? Number(pay.amount) : 150,
              attendance_status: undefined,
              tutor_phone: "+525522427769",
            };
          });

          setStudents(mapped);
          cacheRosterLocally(mapped);
          return;
        }
      }

      // 2. Fallback a caché local o HoopStore
      const cached = getCachedRoster();
      if (cached && cached.length > 0) {
        setStudents(cached);
      } else {
        const storeStudents = HoopStore.getStudents();
        if (storeStudents.length > 0) {
          const localMapped: StudentRosterItem[] = storeStudents.map(s => ({
            id: s.id,
            full_name: s.fullName,
            number: `#${s.jerseyNumber || 11}`,
            category: "U-15 FORMATIVO",
            schedule_days: s.trainingDays?.join("-") || "Lun-Mié-Vie",
            attendance_rate: 90,
            last_payment_status: s.finances?.balanceDue === 0 ? "al_corriente" : "adeudo",
            last_payment_amount: s.finances?.lastPaymentAmount || 600,
            attendance_status: undefined,
            tutor_phone: s.parentPhone || "+525522427769",
          }));
          setStudents(localMapped);
        }
      }
    } catch (err) {
      console.warn("Fallo cargando roster en CourtAttendanceCommand:", err);
    }
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadRoster();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadRoster]);

  const triggerSync = async () => {
    setSyncing(true);
    await syncOfflineQueueToSupabase();
    setTimeout(() => {
      setSyncing(false);
      loadRoster();
    }, 800);
  };

  const handleMarkAttendance = async (studentId: string, status: "presente" | "retardo" | "falta") => {
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
    } else {
      try {
        await supabase.from("daily_attendance").upsert(payload, { onConflict: "student_id,date,shift" });
      } catch {
        enqueueOfflineAction("ATTENDANCE", payload);
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
    } else {
      try {
        await supabase.from("membership_payments").upsert(paymentPayload, { onConflict: "id" });
      } catch {
        enqueueOfflineAction("PAYMENT", paymentPayload);
      }
    }

    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, last_payment_status: "al_corriente", last_payment_amount: payAmount } : s));

    if (sendWhatsApp && selectedStudent.tutor_phone) {
      const msg = encodeURIComponent(`Hola, se confirmó el pago de $${payAmount} MXN (${paymentPayload.concept}) para el atleta ${selectedStudent.full_name} en Wild Wolves CDMX (Sede Deportivo Carmen Serdán).`);
      window.open(`https://wa.me/${selectedStudent.tutor_phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }

    setSelectedStudent(null);
  };

  const filtered = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col w-full gap-4 p-4 max-w-lg mx-auto bg-surface text-on-surface rounded-3xl border border-surface-container-high shadow-2xl">
      
      {/* COURT SESSION CONTROL & SYNC STRIP */}
      <section className="flex flex-col gap-2 bg-surface-container-low p-4 rounded-2xl border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">stadium</span>
            <div className="flex flex-col">
              <span className="font-bold text-on-surface uppercase tracking-tight text-sm">On-Court Command</span>
              <span className="text-[10px] text-secondary">Carmen Serdán Court • Turno Activo</span>
            </div>
          </div>

          {/* Sync Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/20">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-tertiary animate-ping" : "bg-error"}`}></span>
            <span className="text-[10px] font-semibold text-tertiary uppercase">
              {isOnline ? "100% Sincronizado" : "Modo Offline"}
            </span>
            <button 
              onClick={triggerSync} 
              className={`text-tertiary transition cursor-pointer ${syncing ? "rotate-180" : ""}`} 
              type="button"
              title="Sincronizar ahora"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
            </button>
          </div>
        </div>

        {/* Turno Pills */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => setShift("matutino")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              shift === "matutino" ? "bg-primary-container text-on-primary shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            <span>Matutino (09:00 - 11:00)</span>
          </button>
          <button
            onClick={() => setShift("vespertino")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              shift === "vespertino" ? "bg-primary-container text-on-primary shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sports_score</span>
            <span>Vespertino (17:00 - 19:00)</span>
          </button>
        </div>
      </section>

      {/* QUICK KPI METRICS BANNER */}
      <section className="grid grid-cols-3 gap-2">
        <div className="flex flex-col bg-surface-container p-2.5 rounded-xl text-center border border-surface-container-high/50">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold">Roster Hoy</span>
          <span className="text-lg font-bold text-on-surface">{students.length} <span className="text-secondary text-xs">/22</span></span>
        </div>
        <div className="flex flex-col bg-surface-container p-2.5 rounded-xl text-center border border-surface-container-high/50">
          <span className="text-[10px] text-tertiary uppercase font-bold">Presentes</span>
          <span className="text-lg font-bold text-tertiary">{students.filter(s => s.attendance_status === "presente").length}</span>
        </div>
        <div className="flex flex-col bg-surface-container p-2.5 rounded-xl text-center border border-surface-container-high/50">
          <span className="text-[10px] text-error uppercase font-bold">Cobros Pend.</span>
          <span className="text-lg font-bold text-error">{students.filter(s => s.last_payment_status === "adeudo").length}</span>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px]">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container text-on-surface text-xs placeholder:text-outline focus:outline-none border border-surface-container-high focus:border-secondary transition"
          placeholder="Buscar por nombre, matrícula o tutor..."
        />
      </div>

      {/* ATHLETE ROSTER CARDS */}
      <section className="flex flex-col gap-3">
        {filtered.map(st => (
          <article key={st.id} className="flex flex-col bg-surface-container-low p-3.5 rounded-2xl gap-2.5 border border-surface-container/60 hover:border-surface-container-high transition">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container/80 to-surface-variant flex items-center justify-center font-extrabold text-sm text-on-primary">
                  {st.number || "#"}
                </div>
                <div>
                  <span className="font-bold text-sm text-on-surface block">{st.full_name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-variant text-secondary font-bold">{st.category}</span>
                    <span className="text-[10px] text-outline">{st.schedule_days}</span>
                  </div>
                </div>
              </div>

              {st.last_payment_status === "al_corriente" ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-[10px] font-bold border border-tertiary/20">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Al Corriente</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>Adeudo • ${st.last_payment_amount || 150}</span>
                </div>
              )}
            </div>

            {/* Quick Collect Trigger if Debtor */}
            {st.last_payment_status === "adeudo" && (
              <button
                onClick={() => { setSelectedStudent(st); setPayAmount(150); }}
                className="flex items-center justify-between w-full h-11 px-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Cobrar en Cancha</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] font-black">${st.last_payment_amount || 150} MXN</span>
              </button>
            )}

            {/* 3-State Attendance Selector */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => handleMarkAttendance(st.id, "presente")}
                className={`flex items-center justify-center gap-1 h-10 rounded-xl text-xs font-bold transition cursor-pointer ${
                  st.attendance_status === "presente" ? "bg-tertiary text-on-tertiary shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Presente</span>
              </button>
              <button
                onClick={() => handleMarkAttendance(st.id, "retardo")}
                className={`flex items-center justify-center gap-1 h-10 rounded-xl text-xs font-bold transition cursor-pointer ${
                  st.attendance_status === "retardo" ? "bg-primary-container text-on-primary shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>Retardo</span>
              </button>
              <button
                onClick={() => handleMarkAttendance(st.id, "falta")}
                className={`flex items-center justify-center gap-1 h-10 rounded-xl text-xs font-bold transition cursor-pointer ${
                  st.attendance_status === "falta" ? "bg-error-container text-on-error-container shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Falta</span>
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* QUICK PAYMENT SHEET MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-surface-container-high rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 border border-surface-container animate-fade-in shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-sm uppercase text-on-surface block">Cobro Rápido en Cancha</span>
                <span className="text-xs text-secondary font-bold">{selectedStudent.full_name}</span>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-outline hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Amount Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { amt: 50, label: "Día" },
                { amt: 150, label: "Semanal" },
                { amt: 600, label: "Mensual" }
              ].map(item => (
                <button
                  key={item.amt}
                  onClick={() => setPayAmount(item.amt)}
                  className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition cursor-pointer border ${
                    payAmount === item.amt ? "bg-primary-container border-primary-container text-on-primary shadow-md" : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="text-sm font-black">${item.amt}</span>
                  <span className="text-[10px] uppercase">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Payment Method Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPayMethod("efectivo")}
                className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  payMethod === "efectivo" ? "bg-secondary-container text-on-secondary-container shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>Efectivo</span>
              </button>
              <button
                onClick={() => setPayMethod("spei")}
                className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  payMethod === "spei" ? "bg-secondary-container text-on-secondary-container shadow" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
                <span>SPEI / Transf.</span>
              </button>
            </div>

            {/* WhatsApp receipt option */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container cursor-pointer text-xs border border-surface-container-high/60">
              <span className="text-on-surface font-medium">Enviar comprobante por WhatsApp</span>
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-primary-container cursor-pointer"
              />
            </label>

            {/* CTA */}
            <button
              onClick={handleConfirmPayment}
              className="h-12 w-full rounded-xl bg-tertiary hover:bg-[#3ecb65] text-on-tertiary font-extrabold text-sm uppercase flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
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
