"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import confetti from "canvas-confetti";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Search, 
  Calendar, 
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Sparkles,
  X
} from "lucide-react";

export interface StudentItem {
  id: string;
  full_name: string;
  email: string;
  commitment?: {
    days_selected: string[];
    shift: string;
    frequency_type: string;
  };
  lastPayment?: {
    payment_date: string;
    status: string;
    concept: string;
    amount: number;
  };
  attendanceToday?: {
    id: string;
    status: "presente" | "falta" | "retardo" | "justificado";
  };
}

export interface AttendanceTrackerProps {
  student?: any;
  allStudents?: any[];
  readOnly?: boolean;
  onRecordAttendance?: any;
  onRecordDailyAttendance?: (studentId: string, date: string, shift: any, status: any, notes?: string) => void;
  onPaymentRecorded?: (payment?: any) => void;
}

export default function AttendanceTracker({
  readOnly = false,
  onRecordDailyAttendance,
  onPaymentRecorded,
}: AttendanceTrackerProps = {}) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"scheduled" | "all">("scheduled");
  const [selectedShift, setSelectedShift] = useState<"matutino_9_11" | "vespertino_5_7">("vespertino_5_7");
  const [paymentModalUser, setPaymentModalUser] = useState<StudentItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo");
  const [paymentConcept, setPaymentConcept] = useState<"clase_individual" | "semanal" | "mensualidad">("clase_individual");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const currentDayName = daysMap[new Date().getDay()];
  const todayDateString = new Date().toISOString().split("T")[0];

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener perfiles de estudiantes de Supabase
      const { data: profilesData, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "student");

      // Si Supabase aún no tiene perfiles en la nube o hay error de conexión, usamos fallback local de HoopStore
      if (profilesErr || !profilesData || profilesData.length === 0) {
        const localList = HoopStore.getStudents();
        if (localList.length > 0) {
          const formattedLocal: StudentItem[] = localList.map((st) => {
            const hasPaid = st.finances ? st.finances.balanceDue === 0 : false;
            return {
              id: st.id,
              full_name: st.fullName,
              email: st.email,
              commitment: {
                days_selected: st.trainingDays || ["Lunes", "Miércoles", "Viernes"],
                shift: st.shift === "matutino_9_11" ? "matutino_9_11" : "vespertino_5_7",
                frequency_type: st.finances?.frequency || "cada_3er_dia",
              },
              lastPayment: hasPaid ? {
                payment_date: todayDateString,
                status: "pagado",
                concept: "mensualidad",
                amount: st.finances?.lastPaymentAmount || 600,
              } : undefined,
              attendanceToday: undefined,
            };
          });
          setStudents(formattedLocal);
        } else {
          setStudents([]);
        }
        setLoading(false);
        return;
      }

      // 2. Obtener compromisos de asistencia
      const { data: commitmentsData } = await supabase
        .from("attendance_commitments")
        .select("user_id, days_selected, shift, frequency_type");

      // 3. Obtener asistencias de hoy
      const { data: attendanceData } = await supabase
        .from("daily_attendance")
        .select("id, student_id, status, shift")
        .eq("date", todayDateString);

      // 4. Obtener pagos históricos de membresía
      const { data: paymentsData } = await supabase
        .from("membership_payments")
        .select("student_id, payment_date, status, concept, amount")
        .order("payment_date", { ascending: false });

      const formatted: StudentItem[] = profilesData.map((p) => {
        const comm = commitmentsData?.find((c) => c.user_id === p.id);
        const att = attendanceData?.find((a) => a.student_id === p.id && a.shift === selectedShift);
        const pay = paymentsData?.find((pay) => pay.student_id === p.id);

        return {
          id: p.id,
          full_name: p.full_name || "Sin Nombre",
          email: p.email,
          commitment: comm ? {
            days_selected: comm.days_selected || [],
            shift: comm.shift,
            frequency_type: comm.frequency_type || "cada_3er_dia"
          } : undefined,
          attendanceToday: att ? { id: att.id, status: att.status } : undefined,
          lastPayment: pay ? {
            payment_date: pay.payment_date,
            status: pay.status,
            concept: pay.concept,
            amount: pay.amount
          } : undefined
        };
      });

      setStudents(formatted);
    } catch (err) {
      console.error("Error al cargar lista de atletas:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedShift, todayDateString]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  // Marcado rápido de asistencia
  const markAttendance = async (studentId: string, status: "presente" | "falta" | "retardo") => {
    if (readOnly) return;
    try {
      // Intentar persistencia en Supabase daily_attendance
      const { error } = await supabase
        .from("daily_attendance")
        .upsert(
          {
            student_id: studentId,
            date: todayDateString,
            shift: selectedShift,
            status: status
          },
          { onConflict: "student_id,date,shift" }
        );

      if (error) {
        console.warn("Supabase upsert daily_attendance fallback:", error.message);
      }

      // Sincronizar en HoopStore local para continuidad offline
      HoopStore.recordDailyAttendance(
        studentId,
        todayDateString,
        selectedShift,
        status,
        "Pase de lista oficial en cancha"
      );

      if (onRecordDailyAttendance) {
        onRecordDailyAttendance(
          studentId,
          todayDateString,
          selectedShift,
          status
        );
      }

      // Celebración visual si está presente
      if (status === "presente") {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#22c55e", "#ea580c", "#38bdf8"]
        });
      }

      showNotification(`Asistencia registrada: ${status.toUpperCase()}`);
      fetchRoster();
    } catch (err: any) {
      alert("Error al marcar asistencia: " + err.message);
    }
  };

  // Registro de cobro en cancha
  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalUser) return;
    setProcessingPayment(true);

    try {
      // 1. Inserción en Supabase membership_payments
      const { error } = await supabase.from("membership_payments").insert({
        student_id: paymentModalUser.id,
        amount: paymentAmount,
        payment_date: todayDateString,
        payment_method: paymentMethod,
        concept: paymentConcept,
        status: "pagado"
      });

      if (error) {
        console.warn("Supabase insert membership_payments fallback:", error.message);
      }

      // 2. Registrar en HoopStore local para actualizar semáforo y analíticas
      const studentName = paymentModalUser.full_name;
      const paymentRecord = {
        id: `pay-${Date.now()}`,
        studentId: paymentModalUser.id,
        studentName: studentName,
        guardianName: "Tutor de Atleta",
        amount: paymentAmount,
        date: todayDateString,
        method: (paymentMethod === "efectivo" ? "Efectivo" : "Transferencia") as "Efectivo" | "Transferencia",
        status: "Pagado" as const,
        concept: paymentConcept === "clase_individual" ? "Por Clase (Día)" : paymentConcept === "semanal" ? "Semanal (3 Clases)" : "Mensualidad Completa",
      };

      HoopStore.recordPayment(
        paymentModalUser.id,
        paymentAmount,
        paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"
      );

      // 3. Disparar evento global para sincronizar el Búnker y Dashboards sin recargar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("payment_recorded"));
      }

      if (onPaymentRecorded) {
        onPaymentRecorded(paymentRecord);
      }

      // 4. Confeti festivo
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#ea580c", "#22c55e", "#fbbf24"]
      });

      showNotification(`Pago de $${paymentAmount} MXN registrado correctamente`);
      setPaymentModalUser(null);
      fetchRoster();
    } catch (err: any) {
      alert("Error registrando cobro: " + err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const isScheduledToday = (s: StudentItem) => {
    if (!s.commitment) return false;
    return (
      (s.commitment.days_selected || []).includes(currentDayName) &&
      s.commitment.shift === selectedShift
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "scheduled") return isScheduledToday(s);
    return true;
  });

  return (
    <div className="w-full bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER DE CONTROL EN CANCHA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/30 px-3 py-1 rounded-full">
            Control de Cancha en Vivo
          </span>
          <h2 className="text-2xl font-black uppercase mt-2 tracking-wide flex items-center gap-2">
            Pase de Asistencia • <span className="text-[#38bdf8]">{currentDayName}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121724] p-1 rounded-xl border border-zinc-700 flex">
            <button
              onClick={() => setSelectedShift("matutino_9_11")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedShift === "matutino_9_11" ? "bg-[#0284c7] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Matutino (9-11)
            </button>
            <button
              onClick={() => setSelectedShift("vespertino_5_7")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedShift === "vespertino_5_7" ? "bg-[#0284c7] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Vespertino (5-7)
            </button>
          </div>

          <button
            onClick={fetchRoster}
            title="Refrescar lista desde Supabase"
            className="p-2.5 bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 rounded-xl text-zinc-300 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PESTAÑAS Y BUSCADOR UNIVERSAL */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              activeTab === "scheduled"
                ? "bg-[#ea580c] border-[#ea580c] text-white shadow-lg shadow-[#ea580c]/20"
                : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Programados Hoy ({students.filter(isScheduledToday).length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#ea580c] border-[#ea580c] text-white shadow-lg shadow-[#ea580c]/20"
                : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Todos los Alumnos ({students.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#07090e] border border-zinc-800 focus:border-[#38bdf8] rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* LISTADO DE ASISTENCIA Y COBRO */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-[#07090e] border border-zinc-800 rounded-2xl">
            Cargando atletas registrados...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-[#07090e] border border-zinc-800 rounded-2xl">
            No se encontraron atletas {activeTab === "scheduled" ? "programados para hoy en este turno." : "registrados."}
          </div>
        ) : (
          filteredStudents.map((st) => {
            const hasPaid = Boolean(st.lastPayment && st.lastPayment.status === "pagado");
            const attendanceStatus = st.attendanceToday?.status;

            return (
              <div
                key={st.id}
                className="bg-[#121724] border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">{st.full_name}</h3>
                    {hasPaid ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Al Corriente (${st.lastPayment?.amount || 0} MXN)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pago Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{st.email}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Plan: <span className="text-zinc-300 font-medium">{st.commitment?.frequency_type || "cada_3er_dia"}</span> • Días: <span className="text-zinc-300 font-medium">{st.commitment?.days_selected?.join(", ") || "Lun, Mié, Vie"}</span>
                  </p>
                </div>

                {/* BOTONES DE ASISTENCIA Y COBRO */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Selector Asistencia */}
                  <div className="flex items-center bg-[#07090e] p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => markAttendance(st.id, "presente")}
                      disabled={readOnly}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        attendanceStatus === "presente"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Presente
                    </button>
                    <button
                      onClick={() => markAttendance(st.id, "retardo")}
                      disabled={readOnly}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        attendanceStatus === "retardo"
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Retardo
                    </button>
                    <button
                      onClick={() => markAttendance(st.id, "falta")}
                      disabled={readOnly}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        attendanceStatus === "falta"
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Falta
                    </button>
                  </div>

                  {/* Botón Cobro Rápido */}
                  {!readOnly && (
                    <button
                      onClick={() => {
                        setPaymentModalUser(st);
                        setPaymentAmount(50);
                        setPaymentConcept("clase_individual");
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:brightness-110 transition cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Cobrar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL COBRO RÁPIDO EN CANCHA */}
      {paymentModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0d1017] border border-zinc-700 max-w-sm w-full p-6 rounded-3xl shadow-2xl text-white">
            <h3 className="text-lg font-black uppercase">Registrar Cobro en Cancha</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Atleta: <span className="text-[#38bdf8] font-bold">{paymentModalUser.full_name}</span>
            </p>

            <form onSubmit={handleRegisterPayment} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Concepto y Tarifa Oficial</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentAmount(50); setPaymentConcept("clase_individual"); }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      paymentAmount === 50 ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30" : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    $50 Día
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentAmount(150); setPaymentConcept("semanal"); }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      paymentAmount === 150 ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30" : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    $150 Sem
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentAmount(600); setPaymentConcept("mensualidad"); }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      paymentAmount === 600 ? "bg-[#ea580c] border-[#ea580c] text-white shadow-md shadow-[#ea580c]/30" : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    $600 Mes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      paymentMethod === "efectivo" ? "bg-[#0284c7] border-[#0284c7] text-white shadow-md shadow-[#0284c7]/30" : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      paymentMethod === "transferencia" ? "bg-[#0284c7] border-[#0284c7] text-white shadow-md shadow-[#0284c7]/30" : "bg-[#121724] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Transferencia SPEI
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalUser(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="flex-1 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-black font-black rounded-xl text-xs uppercase transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {processingPayment ? "Guardando..." : "Confirmar Cobro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { AttendanceTracker };
