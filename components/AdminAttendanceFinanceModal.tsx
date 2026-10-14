"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Save,
  Search,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export interface AdminModalInitialData {
  type: "attendance" | "payment" | "both";
  attendance_id?: string;
  transaction_id?: string;
  student_id?: string;
  student_name?: string;
  date?: string;
  time?: string;
  status?: "presente" | "falta" | "retardo" | "justificado";
  amount?: number;
  payment_method?: string;
  concept?: string;
}

interface AdminAttendanceFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AdminModalInitialData | null;
}

interface AthleteProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  current_debt_amount: number;
}

export default function AdminAttendanceFinanceModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AdminAttendanceFinanceModalProps) {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modos de ajuste
  const [targetType, setTargetType] = useState<"attendance" | "payment" | "both">("both");

  // Campos de Asistencia
  const [attendanceId, setAttendanceId] = useState<string | undefined>(undefined);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<
    "presente" | "falta" | "retardo" | "justificado"
  >("presente");

  // Campos de Finanzas
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentTime, setPaymentTime] = useState("");
  const [amount, setAmount] = useState<number | string>(150);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [concept, setConcept] = useState("Entrenamiento / Cuota");

  // Obtener fecha de hoy en CDMX
  const getTodayCDMX = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());
  };

  const getNowTimeCDMX = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Cargar lista de atletas
  useEffect(() => {
    if (!isOpen) return;

    async function loadAthletes() {
      setLoadingAthletes(true);
      try {
        const adminSecret =
          localStorage.getItem("ww_superadmin_secret") ||
          localStorage.getItem("ww_user_role") ||
          "WW-SUPERADMIN-FULL-2026";
        const adminEmail = localStorage.getItem("ww_user_email") || "wildwolvescdmx@gmail.com";

        const res = await fetch("/api/admin/attendance-finance-manage", {
          headers: {
            "x-admin-secret": adminSecret,
            "x-admin-email": adminEmail,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.athletes) {
            setAthletes(data.athletes);
          }
        }
      } catch (err) {
        console.error("Error cargando atletas:", err);
      } finally {
        setLoadingAthletes(false);
      }
    }

    loadAthletes();
  }, [isOpen]);

  // Inicializar formulario con datos de entrada si existen
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");
    setSuccessMessage("");

    const today = getTodayCDMX();
    const timeNow = getNowTimeCDMX();

    if (initialData) {
      setTargetType(initialData.type || "both");
      setSelectedStudentId(initialData.student_id || "");
      if (initialData.student_name) setSearchQuery(initialData.student_name);

      setAttendanceId(initialData.attendance_id);
      setAttendanceDate(initialData.date || today);
      setAttendanceStatus(initialData.status || "presente");

      setTransactionId(initialData.transaction_id);
      setPaymentDate(initialData.date || today);
      setPaymentTime(initialData.time || timeNow);
      setAmount(initialData.amount !== undefined ? initialData.amount : 150);
      setPaymentMethod(initialData.payment_method || "efectivo");
      setConcept(initialData.concept || "Entrenamiento / Cuota");
    } else {
      setTargetType("both");
      setSelectedStudentId("");
      setSearchQuery("");
      setAttendanceId(undefined);
      setAttendanceDate(today);
      setAttendanceStatus("presente");
      setTransactionId(undefined);
      setPaymentDate(today);
      setPaymentTime(timeNow);
      setAmount(150);
      setPaymentMethod("efectivo");
      setConcept("Entrenamiento / Cuota");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const filteredAthletes = athletes.filter((a) =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAthlete = athletes.find((a) => a.id === selectedStudentId);

  const getHeaders = () => {
    const adminSecret =
      localStorage.getItem("ww_superadmin_secret") ||
      localStorage.getItem("ww_user_role") ||
      "WW-SUPERADMIN-FULL-2026";
    const adminEmail = localStorage.getItem("ww_user_email") || "wildwolvescdmx@gmail.com";
    return {
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
      "x-admin-email": adminEmail,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage("Por favor selecciona un atleta de la lista.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Guardar Asistencia si corresponde
      if (targetType === "attendance" || targetType === "both") {
        const attRes = await fetch("/api/admin/attendance-finance-manage", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            action: "UPSERT_ATTENDANCE",
            attendance_id: attendanceId,
            student_id: selectedStudentId,
            attendance_date: attendanceDate,
            status: attendanceStatus,
          }),
        });

        const attData = await attRes.json();
        if (!attRes.ok) {
          throw new Error(attData.error || "Fallo al guardar asistencia.");
        }
      }

      // 2. Guardar Pago si corresponde
      if (targetType === "payment" || targetType === "both") {
        const payRes = await fetch("/api/admin/attendance-finance-manage", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            action: "UPSERT_PAYMENT",
            transaction_id: transactionId,
            student_id: selectedStudentId,
            amount: Number(amount) || 0,
            payment_method: paymentMethod,
            transaction_date: paymentDate,
            concept: concept,
          }),
        });

        const payData = await payRes.json();
        if (!payRes.ok) {
          throw new Error(payData.error || "Fallo al guardar transacción de pago.");
        }
      }

      setSuccessMessage("✅ Ajuste registrado con éxito.");

      // Disparar sincronización inmediata en la interfaz
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("change-bunker-tab", { detail: "finanzas" }));
        window.dispatchEvent(new Event("payment_recorded"));
        window.dispatchEvent(new Event("attendance_updated"));
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error guardando ajuste:", err);
      setErrorMessage(err.message || "Error al procesar el ajuste.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar este registro del sistema? Esta acción es definitiva.")) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      if (targetType === "attendance" || (attendanceId && !transactionId)) {
        const res = await fetch("/api/admin/attendance-finance-manage", {
          method: "DELETE",
          headers: getHeaders(),
          body: JSON.stringify({
            action: "DELETE_ATTENDANCE",
            attendance_id: attendanceId,
            student_id: selectedStudentId,
            attendance_date: attendanceDate,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar asistencia.");
      }

      if (targetType === "payment" || transactionId) {
        if (!transactionId) {
          throw new Error("No hay identificador de transacción para eliminar.");
        }
        const res = await fetch("/api/admin/attendance-finance-manage", {
          method: "DELETE",
          headers: getHeaders(),
          body: JSON.stringify({
            action: "DELETE_PAYMENT",
            transaction_id: transactionId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar pago.");
      }

      setSuccessMessage("Registro eliminado exitosamente.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("change-bunker-tab", { detail: "finanzas" }));
        window.dispatchEvent(new Event("payment_recorded"));
        window.dispatchEvent(new Event("attendance_updated"));
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0d1017] border-2 border-orange-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-orange-950/40 max-h-[92vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Ajuste Retroactivo <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">SUPERADMIN</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Control total de asistencia, fechas y contabilidad para Head Coach Ricardo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Selector de Tipo de Registro */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 font-bold block mb-1.5">
              Tipo de Ajuste Retroactivo
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("both")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  targetType === "both"
                    ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30"
                    : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                ⚡ Asistencia + Pago
              </button>
              <button
                type="button"
                onClick={() => setTargetType("attendance")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  targetType === "attendance"
                    ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30"
                    : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                📋 Solo Asistencia
              </button>
              <button
                type="button"
                onClick={() => setTargetType("payment")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  targetType === "payment"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                    : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                💵 Solo Pago
              </button>
            </div>
          </div>

          {/* 2. Buscador y Selector de Atleta */}
          <div>
            <label className="text-[11px] font-mono uppercase text-zinc-400 font-bold block mb-1.5 flex items-center justify-between">
              <span>Atleta en Cancha</span>
              {selectedAthlete && (
                <span className="text-zinc-500 lowercase font-normal">
                  adeudo actual: ${selectedAthlete.current_debt_amount} MXN
                </span>
              )}
            </label>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Escribe para buscar: Jesús, Isaac, Catalina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Lista desplegable de coincidencias */}
            {searchQuery && !selectedStudentId && (
              <div className="mt-1.5 max-h-36 overflow-y-auto bg-[#121724] border border-zinc-800 rounded-xl divide-y divide-zinc-800/60">
                {filteredAthletes.length === 0 ? (
                  <p className="p-2.5 text-xs text-zinc-500 text-center">No se encontraron atletas</p>
                ) : (
                  filteredAthletes.map((ath) => (
                    <button
                      key={ath.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(ath.id);
                        setSearchQuery(ath.full_name);
                      }}
                      className="w-full text-left p-2.5 hover:bg-zinc-800/50 flex items-center justify-between transition cursor-pointer text-xs"
                    >
                      <span className="font-bold text-white">{ath.full_name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {ath.email} • Deuda: ${ath.current_debt_amount}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedAthlete && (
              <div className="mt-2 p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-300">{selectedAthlete.full_name}</p>
                  <p className="text-[10px] text-zinc-400">{selectedAthlete.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId("");
                    setSearchQuery("");
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* 3. SECCIÓN DE ASISTENCIA */}
          {(targetType === "attendance" || targetType === "both") && (
            <div className="p-4 rounded-2xl bg-[#121724]/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <UserCheck className="w-4 h-4" /> Parámetros de Asistencia
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Fecha de Asistencia
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                      className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Estatus
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus("presente")}
                      className={`py-2 text-[11px] font-bold rounded-lg transition border cursor-pointer ${
                        attendanceStatus === "presente"
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-[#0d1017] text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus("falta")}
                      className={`py-2 text-[11px] font-bold rounded-lg transition border cursor-pointer ${
                        attendanceStatus === "falta"
                          ? "bg-red-600 text-white border-red-500"
                          : "bg-[#0d1017] text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      Falta
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceStatus("justificado")}
                      className={`py-2 text-[11px] font-bold rounded-lg transition border cursor-pointer ${
                        attendanceStatus === "justificado"
                          ? "bg-amber-600 text-white border-amber-500"
                          : "bg-[#0d1017] text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      Justificado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SECCIÓN DE FINANZAS */}
          {(targetType === "payment" || targetType === "both") && (
            <div className="p-4 rounded-2xl bg-[#121724]/80 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <DollarSign className="w-4 h-4" /> Parámetros Financieros & Cobro
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Fecha del Pago
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                      className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Hora
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="time"
                      value={paymentTime}
                      onChange={(e) => setPaymentTime(e.target.value)}
                      className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Monto (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-500 text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 pl-7 pr-3 text-xs font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="efectivo">Efectivo en Cancha</option>
                    <option value="transferencia">Transferencia SPEI</option>
                    <option value="tarjeta">Tarjeta / Terminal</option>
                    <option value="condonacion">Condonación / Beca</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ej. Entrenamiento / Mensualidad"
                    className="w-full bg-[#0d1017] border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botonera de Acciones */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
            {(attendanceId || transactionId) ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-300 hover:bg-red-900/60 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Eliminar Registro</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting || !selectedStudentId}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-600/30 flex items-center gap-2 hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Guardar Ajuste</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
