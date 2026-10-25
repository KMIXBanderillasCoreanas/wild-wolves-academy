"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  Percent,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Sliders,
  X,
  Plus
} from "lucide-react";

interface Athlete {
  id: string;
  full_name: string;
  email: string;
  role: string;
  account_category?: string;
  user_type?: string;
  current_debt_amount: number;
  financial_status: string;
  is_provisional?: boolean;
  scholarship_percentage?: number;
  default_class_cost?: number;
  origin_channel?: string;
  referred_by?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
  student?: { full_name: string; email: string };
}

interface TransactionRecord {
  id: string;
  student_id: string;
  amount_paid: number;
  remaining_debt: number;
  payment_method: string;
  concept: string;
  transaction_date: string;
  student?: { full_name: string; email: string };
}

interface SuperAdminOmniManagerProps {
  onDataChanged: () => void;
  initialSubTab?: "athletes" | "inline_payments" | "inline_attendance";
}

export default function SuperAdminOmniManager({ onDataChanged, initialSubTab = "inline_payments" }: SuperAdminOmniManagerProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"athletes" | "inline_payments" | "inline_attendance">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal para configuración de atleta individual
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [athleteFullName, setAthleteFullName] = useState<string>("");
  const [athleteRole, setAthleteRole] = useState<string>("student");
  const [athleteUserType, setAthleteUserType] = useState<string>("alumno");
  const [athleteAccountCategory, setAthleteAccountCategory] = useState<string>("student");
  const [athleteOrigin, setAthleteOrigin] = useState<string>("redes_sociales");
  const [athleteReferredBy, setAthleteReferredBy] = useState<string>("");
  const [athleteScholarship, setAthleteScholarship] = useState<number>(0);
  const [athleteCost, setAthleteCost] = useState<number>(50);
  const [athleteDebt, setAthleteDebt] = useState<number>(0);
  const [athleteStatus, setAthleteStatus] = useState<string>("al_corriente");
  const [savingConfig, setSavingConfig] = useState(false);

  // Estados de edición en línea
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxAmount, setEditTxAmount] = useState<number>(0);
  const [editTxDate, setEditTxDate] = useState<string>("");
  const [editTxMethod, setEditTxMethod] = useState<string>("efectivo");
  const [editTxConcept, setEditTxConcept] = useState<string>("");

  const [editingAttId, setEditingAttId] = useState<string | null>(null);
  const [editAttDate, setEditAttDate] = useState<string>("");
  const [editAttStatus, setEditAttStatus] = useState<string>("presente");

  const getHeaders = () => {
    const adminSecret =
      typeof window !== "undefined"
        ? localStorage.getItem("ww_superadmin_secret") ||
          localStorage.getItem("ww_user_role") ||
          "WW-SUPERADMIN-FULL-2026"
        : "WW-SUPERADMIN-FULL-2026";
    const adminEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("ww_user_email") || "wildwolvescdmx@gmail.com"
        : "wildwolvescdmx@gmail.com";
    return {
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
      "x-admin-email": adminEmail,
    };
  };

  const showToast = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadOmniData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAthletes(data.athletes || []);
        setAttendance(data.attendance || []);
        setTransactions(data.transactions || []);
      }
    } catch (err: any) {
      console.error("Error cargando omni data:", err);
      showToast("error", "Error cargando datos del motor omnipotente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOmniData();
  }, [loadOmniData]);

  // Guardar Edición Inline de Pago
  const handleSaveInlineTx = async (tx: TransactionRecord) => {
    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "UPSERT_PAYMENT",
          transaction_id: tx.id,
          student_id: tx.student_id,
          amount: editTxAmount,
          transaction_date: editTxDate,
          payment_method: editTxMethod,
          concept: editTxConcept,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al guardar pago.");

      showToast("success", "✅ Pago actualizado y balance recalculado.");
      setEditingTxId(null);
      await loadOmniData();
      onDataChanged();
      window.dispatchEvent(new Event("payment_recorded"));
      window.dispatchEvent(new CustomEvent("change-bunker-tab", { detail: "finanzas" }));
    } catch (err: any) {
      showToast("error", err.message || "Error al actualizar pago.");
    }
  };

  // Eliminar Pago Inline con Optimismo Inmediato
  const handleDeleteTx = async (txId: string) => {
    if (!confirm("⚠️ ¿Eliminar este pago y restituir el monto al adeudo del alumno?")) return;

    // Actualización optimista inmediata en UI
    const txToDelete = transactions.find((t) => t.id === txId);
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    if (txToDelete) {
      setAthletes((prev) =>
        prev.map((a) => {
          if (a.id === txToDelete.student_id) {
            const newDebt = (a.current_debt_amount || 0) + (txToDelete.amount_paid || 0);
            return {
              ...a,
              current_debt_amount: newDebt,
              financial_status: newDebt > 0 ? "adeudo_pendiente" : "al_corriente",
            };
          }
          return a;
        })
      );
    }

    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "DELETE_PAYMENT",
          transaction_id: txId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al eliminar pago.");

      showToast("success", "Pago eliminado y adeudo recalculado al instante.");
      await loadOmniData();
      onDataChanged();
      window.dispatchEvent(new Event("payment_recorded"));
      window.dispatchEvent(new Event("payment_deleted"));
      window.dispatchEvent(new CustomEvent("change-bunker-tab", { detail: "finanzas" }));
    } catch (err: any) {
      showToast("error", err.message || "Error al eliminar pago.");
      await loadOmniData(); // Revertir si falló
    }
  };

  // Guardar Edición Inline de Asistencia
  const handleSaveInlineAtt = async (att: AttendanceRecord) => {
    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "UPSERT_ATTENDANCE",
          attendance_id: att.id,
          student_id: att.student_id,
          attendance_date: editAttDate,
          status: editAttStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al guardar asistencia.");

      showToast("success", "✅ Asistencia actualizada con éxito.");
      setEditingAttId(null);
      await loadOmniData();
      onDataChanged();
      window.dispatchEvent(new Event("attendance_updated"));
    } catch (err: any) {
      showToast("error", err.message || "Error al guardar asistencia.");
    }
  };

  // Eliminar Asistencia Inline
  const handleDeleteAtt = async (attId: string) => {
    if (!confirm("⚠️ ¿Eliminar este registro de asistencia?")) return;

    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "DELETE_ATTENDANCE",
          attendance_id: attId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al eliminar asistencia.");

      showToast("success", "Asistencia eliminada.");
      await loadOmniData();
      onDataChanged();
      window.dispatchEvent(new Event("attendance_updated"));
    } catch (err: any) {
      showToast("error", err.message || "Error al eliminar asistencia.");
    }
  };

  // Guardar Configuración de Atleta (Beca, Costo por Clase y Rol: Alumno vs Tutor)
  const handleSaveAthleteConfig = async () => {
    if (!editingAthlete) return;
    setSavingConfig(true);

    try {
      const res = await fetch("/api/admin/attendance-finance-manage", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "UPDATE_ATHLETE_CONFIG",
          student_id: editingAthlete.id,
          full_name: athleteFullName,
          role: athleteRole,
          user_type: athleteUserType,
          account_category: athleteAccountCategory,
          origin_channel: athleteOrigin,
          referred_by: athleteReferredBy,
          scholarship_percentage: athleteScholarship,
          default_class_cost: athleteCost,
          current_debt_amount: athleteDebt,
          financial_status: athleteStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo al actualizar atleta.");

      showToast("success", `✅ Configuración y rol guardados para ${athleteFullName || editingAthlete.full_name}`);
      setEditingAthlete(null);
      await loadOmniData();
      onDataChanged();
      window.dispatchEvent(new Event("attendance_updated"));
    } catch (err: any) {
      showToast("error", err.message || "Error al guardar configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredAthletes = athletes.filter(a =>
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0b0e14] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/30 text-white space-y-6">
      {/* Cabecera Omnipotente */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                Motor Omnipotente de Dirección
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                HEAD COACH EXCLUSIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Edición en tiempo real, control de becas, costos personalizados y ajustes retroactivos totales.
            </p>
          </div>
        </div>

        <button
          onClick={loadOmniData}
          disabled={loading}
          className="px-4 py-2 bg-[#121724] border border-zinc-700 hover:border-amber-500 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Recargar Motor
        </button>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
              : "bg-red-950/40 border-red-500/50 text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Sub-selector de Módulos */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("inline_payments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === "inline_payments"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
              : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Pagos (Edición en Vivo)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("inline_attendance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === "inline_attendance"
              ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30"
              : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Asistencias (Fechas Libres)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("athletes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeSubTab === "athletes"
              ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
              : "bg-[#121724] text-zinc-400 border-zinc-800 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" /> Control de Becas & Costos por Atleta
        </button>
      </div>

      {/* 1. PAGOS CON EDICIÓN EN LÍNEA */}
      {activeSubTab === "inline_payments" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Cobros Registrados en Caja
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              Haz clic en el lápiz para editar monto, fecha o concepto al instante
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0d1017]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Monto Cobrado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => {
                  const isEditing = editingTxId === tx.id;
                  return (
                    <tr key={tx.id} className="hover:bg-[#121724]/60 transition">
                      {/* Fecha */}
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editTxDate}
                            onChange={(e) => setEditTxDate(e.target.value)}
                            className="bg-black border border-amber-500 rounded px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          tx.transaction_date
                        )}
                      </td>

                      {/* Atleta */}
                      <td className="py-3 px-4 font-bold text-white">
                        {tx.student?.full_name || "Atleta Wild Wolves"}
                      </td>

                      {/* Concepto */}
                      <td className="py-3 px-4 text-zinc-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTxConcept}
                            onChange={(e) => setEditTxConcept(e.target.value)}
                            className="bg-black border border-amber-500 rounded px-2 py-1 text-xs text-white w-full"
                          />
                        ) : (
                          tx.concept
                        )}
                      </td>

                      {/* Método */}
                      <td className="py-3 px-4 capitalize text-zinc-300">
                        {isEditing ? (
                          <select
                            value={editTxMethod}
                            onChange={(e) => setEditTxMethod(e.target.value)}
                            className="bg-black border border-amber-500 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">SPEI</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="condonacion">Beca/Cortesía</option>
                          </select>
                        ) : (
                          tx.payment_method
                        )}
                      </td>

                      {/* Monto */}
                      <td className="py-3 px-4 font-black text-emerald-400">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500">$</span>
                            <input
                              type="number"
                              step="5"
                              value={editTxAmount}
                              onChange={(e) => setEditTxAmount(Number(e.target.value))}
                              className="w-20 bg-black border border-amber-500 rounded px-2 py-1 text-xs text-emerald-400 font-black"
                            />
                          </div>
                        ) : (
                          `$${tx.amount_paid} MXN`
                        )}
                      </td>

                      {/* Botones de acción */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveInlineTx(tx)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" /> Guardar
                            </button>
                            <button
                              onClick={() => setEditingTxId(null)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="Editar monto y fecha"
                              onClick={() => {
                                setEditingTxId(tx.id);
                                setEditTxAmount(Number(tx.amount_paid) || 0);
                                setEditTxDate(tx.transaction_date);
                                setEditTxMethod(tx.payment_method);
                                setEditTxConcept(tx.concept);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Eliminar y restituir adeudo"
                              onClick={() => handleDeleteTx(tx.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ASISTENCIAS CON FECHA Y ESTATUS LIBRES */}
      {activeSubTab === "inline_attendance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Registro de Asistencia Retroactivo
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              Modifica asistencias pasadas o futuras libremente
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0d1017]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Estatus</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {attendance.map((att) => {
                  const isEditing = editingAttId === att.id;
                  return (
                    <tr key={att.id} className="hover:bg-[#121724]/60 transition">
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editAttDate}
                            onChange={(e) => setEditAttDate(e.target.value)}
                            className="bg-black border border-amber-500 rounded px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          att.date
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {att.student?.full_name || "Atleta Wild Wolves"}
                      </td>

                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={editAttStatus}
                            onChange={(e) => setEditAttStatus(e.target.value)}
                            className="bg-black border border-amber-500 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="presente">Presente</option>
                            <option value="falta">Falta</option>
                            <option value="retardo">Retardo</option>
                            <option value="justificado">Justificado</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              att.status === "presente"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : att.status === "justificado"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {att.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveInlineAtt(att)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" /> Guardar
                            </button>
                            <button
                              onClick={() => setEditingAttId(null)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="Editar fecha y estatus"
                              onClick={() => {
                                setEditingAttId(att.id);
                                setEditAttDate(att.date);
                                setEditAttStatus(att.status);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Eliminar asistencia"
                              onClick={() => handleDeleteAtt(att.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CONTROL DE BECAS Y COSTOS POR ATLETA */}
      {activeSubTab === "athletes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Configuración Financiera Individual por Alumno
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAthletes.map((ath) => {
              const scholarship = ath.scholarship_percentage || 0;
              const cost = ath.default_class_cost ?? 50;
              return (
                <div
                  key={ath.id}
                  className="bg-[#121724] border border-zinc-800 hover:border-amber-500/50 p-4 rounded-2xl space-y-3 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{ath.full_name}</h4>
                        {ath.is_provisional && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            PROVISIONAL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">{ath.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAthlete(ath);
                        setAthleteFullName(ath.full_name || "");
                        setAthleteRole(ath.role || "student");
                        setAthleteUserType(ath.user_type || (ath.role === "guardian" || ath.role === "parent" ? "tutor" : "alumno"));
                        setAthleteAccountCategory(ath.account_category || (ath.role === "guardian" || ath.role === "parent" ? "guardian_family" : "student"));
                        setAthleteOrigin(ath.origin_channel || "redes_sociales");
                        setAthleteReferredBy(ath.referred_by || "");
                        setAthleteScholarship(scholarship);
                        setAthleteCost(cost);
                        setAthleteDebt(ath.current_debt_amount || 0);
                        setAthleteStatus(ath.financial_status || "al_corriente");
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" /> Ajustar Rol & Beca
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                    <div className="bg-[#0b0e14] p-2 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">Beca</span>
                      <span className="text-xs font-black text-amber-400">{scholarship}%</span>
                    </div>
                    <div className="bg-[#0b0e14] p-2 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">Costo Clase</span>
                      <span className="text-xs font-black text-emerald-400">${cost}</span>
                    </div>
                    <div className="bg-[#0b0e14] p-2 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">Adeudo</span>
                      <span className={`text-xs font-black ${ath.current_debt_amount > 0 ? "text-red-400" : "text-zinc-400"}`}>
                        ${ath.current_debt_amount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN INDIVIDUAL DE ATLETA */}
      {editingAthlete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0d1017] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" /> Ajuste Financiero
                </h3>
                <p className="text-xs text-amber-300 font-bold">{editingAthlete.full_name}</p>
              </div>
              <button
                onClick={() => setEditingAthlete(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Nombre Completo */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={athleteFullName}
                  onChange={(e) => setAthleteFullName(e.target.value)}
                  className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white font-bold"
                />
              </div>

              {/* TIPO DE CUENTA: ALUMNO VS PADRE/TUTOR */}
              <div className="p-3 rounded-2xl bg-[#121724] border border-amber-500/30 space-y-2">
                <label className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Rol y Clasificación de Usuario
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAthleteRole("student");
                      setAthleteUserType("alumno");
                      setAthleteAccountCategory("student");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      athleteRole === "student" && athleteUserType !== "tutor"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                        : "bg-[#0b0e14] text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    🏀 Alumno / Atleta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAthleteRole("guardian");
                      setAthleteUserType("tutor");
                      setAthleteAccountCategory("guardian_family");
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      athleteRole === "guardian" || athleteRole === "parent" || athleteUserType === "tutor"
                        ? "bg-purple-600 text-white border-purple-500 shadow-md"
                        : "bg-[#0b0e14] text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    👨‍👩‍👧 Padre / Tutor
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {athleteRole === "guardian" || athleteUserType === "tutor"
                    ? "✓ Marcado como Tutor legal. No aparecerá en el pase de lista de cancha ni en métricas de atletas."
                    : "✓ Marcado como Atleta. Aparece en el Roster de duela, pase de lista y Combine."}
                </p>
              </div>

              {/* ORIGEN & RECOMENDACIÓN (ATRIBUCIÓN DE MARKETING) */}
              <div className="p-3 rounded-2xl bg-[#121724] border border-zinc-800 space-y-2.5">
                <label className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">
                  🎯 Origen & Atribución del Alumno
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">¿Cómo se enteró de la academia?</label>
                    <select
                      value={athleteOrigin}
                      onChange={(e) => setAthleteOrigin(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-1.5 px-2.5 text-xs text-white"
                    >
                      <option value="redes_sociales">Redes Sociales (FB, IG, TikTok)</option>
                      <option value="cancha_carmen_serdan">Lona / Vio clase en Carmen Serdán</option>
                      <option value="recomendacion_alumno">Recomendado por otro alumno</option>
                      <option value="torneo_partido">Vio a Wild Wolves en Torneo</option>
                      <option value="escuela_externa">Escuela / Colegio</option>
                      <option value="otro">Otro medio</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">¿Quién lo recomendó? (Nombre o Atleta)</label>
                    <input
                      type="text"
                      placeholder="Ej. Isaac, Osmar, Primo..."
                      value={athleteReferredBy}
                      onChange={(e) => setAthleteReferredBy(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-1.5 px-2.5 text-xs text-amber-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Beca % */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                    Porcentaje de Beca (%)
                  </label>
                  <span className="text-xs font-black text-amber-400">{athleteScholarship}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={athleteScholarship}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAthleteScholarship(val);
                    if (val === 100) setAthleteStatus("becado");
                  }}
                  className="w-full accent-amber-500"
                />
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  100% de beca marca clases automáticamente a $0 sin generar deuda.
                </p>
              </div>

              {/* Costo Personalizado por Clase */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                  Costo Personalizado por Clase (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={athleteCost}
                    onChange={(e) => setAthleteCost(Number(e.target.value))}
                    className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2 pl-7 pr-3 text-xs text-emerald-400 font-bold"
                  />
                </div>
              </div>

              {/* Saldo / Adeudo Actual */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                  Adeudo Pendiente Forzado (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={athleteDebt}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAthleteDebt(val);
                      if (val === 0 && athleteScholarship < 100) setAthleteStatus("al_corriente");
                      else if (val > 0) setAthleteStatus("adeudo_pendiente");
                    }}
                    className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2 pl-7 pr-3 text-xs text-red-400 font-bold"
                  />
                </div>
              </div>

              {/* Estatus Financiero */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                  Estatus Financiero
                </label>
                <select
                  value={athleteStatus}
                  onChange={(e) => setAthleteStatus(e.target.value)}
                  className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white"
                >
                  <option value="al_corriente">Al Corriente</option>
                  <option value="abono_parcial">Abono Parcial</option>
                  <option value="adeudo_pendiente">Adeudo Pendiente</option>
                  <option value="becado">Becado (100%)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingConfig}
                onClick={handleSaveAthleteConfig}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black rounded-xl text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
