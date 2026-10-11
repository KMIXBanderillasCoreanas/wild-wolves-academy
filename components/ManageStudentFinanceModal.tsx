"use client";

import React, { useState } from "react";
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Landmark, 
  Trash2, 
  Calendar, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { enqueueOfflineAction, generateUUID, getOfflineQueueCount } from "@/lib/offlineSync";

export type FinancialStatus = "al_corriente" | "abono_parcial" | "adeudo_pendiente" | "becado";
export type UserType = "alumno" | "prospecto" | "tutor" | "visitante";

export interface StudentFinanceData {
  id: string;
  full_name: string;
  category?: string;
  tutor_phone?: string;
  financial_status: FinancialStatus;
  current_debt_amount: number;
  training_days: string;
  training_schedule: string;
  user_type: UserType;
}

interface ManageStudentFinanceModalProps {
  student: StudentFinanceData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedStudent: StudentFinanceData) => void;
}

const PRESET_DAYS = [
  "Lun-Mié-Vie",
  "Mar-Jue",
  "Sábados",
  "Diario",
];

const PRESET_SCHEDULES = [
  "Matutino: 09:00 - 11:00",
  "Vespertino: 17:00 - 19:00",
  "Personalizado",
];

const USER_TYPES: { type: UserType; label: string; desc: string }[] = [
  { type: "alumno", label: "Alumno Activo", desc: "Asistencia y cobro en cancha" },
  { type: "prospecto", label: "Prospecto / Clase Muestra", desc: "Sesión de prueba inicial" },
  { type: "tutor", label: "Tutor / Familiar", desc: "No entra en pase de lista" },
  { type: "visitante", label: "Visitante", desc: "Clase esporádica o invitado" },
];

export default function ManageStudentFinanceModal({
  student,
  isOpen,
  onClose,
  onSuccess,
}: ManageStudentFinanceModalProps) {
  // Estados Financieros
  const [currentDebt, setCurrentDebt] = useState<number>(student.current_debt_amount || 0);
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus>(student.financial_status || "al_corriente");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "spei">("efectivo");
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);

  // Estados Horario y Rol
  const [trainingDays, setTrainingDays] = useState<string>(student.training_days || "Lun-Mié-Vie");
  const [trainingSchedule, setTrainingSchedule] = useState<string>(student.training_schedule || "Vespertino: 17:00 - 19:00");
  const [customSchedule, setCustomSchedule] = useState<string>("");
  const [userType, setUserType] = useState<UserType>(student.user_type || "alumno");

  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cálculo automático del saldo restante en base al input ingresado
  const numReceived = parseFloat(amountReceived) || 0;
  const calculatedRemaining = Math.max(0, currentDebt - numReceived);
  
  // Estatus proyectado según el abono
  const projectedStatus: FinancialStatus = 
    financialStatus === "becado"
      ? "becado"
      : calculatedRemaining === 0
      ? "al_corriente"
      : numReceived > 0 && calculatedRemaining > 0
      ? "abono_parcial"
      : currentDebt > 0
      ? "adeudo_pendiente"
      : "al_corriente";

  // Perdonar / Eliminar Adeudo
  const handleForgiveDebt = () => {
    setCurrentDebt(0);
    setAmountReceived("");
    setFinancialStatus("al_corriente");
    setActionNotice("Adeudo cancelado a $0 MXN (Al Corriente). Presiona Guardar para confirmar.");
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Toggle Becado / Exento
  const handleToggleBecado = () => {
    if (financialStatus === "becado") {
      setFinancialStatus("al_corriente");
      setCurrentDebt(0);
    } else {
      setFinancialStatus("becado");
      setCurrentDebt(0);
      setAmountReceived("");
    }
  };

  // Guardar Cambios y Transacción
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const finalSchedule = trainingSchedule === "Personalizado" 
        ? (customSchedule.trim() || "Horario Especial") 
        : trainingSchedule;

      let newDebt = currentDebt;
      let finalStatus: FinancialStatus = financialStatus;
      let paidAmt = numReceived;

      if (financialStatus === "becado") {
        newDebt = 0;
        finalStatus = "becado";
      } else if (currentDebt === 0 && numReceived === 0) {
        newDebt = 0;
        finalStatus = "al_corriente";
      } else if (paidAmt > 0) {
        newDebt = calculatedRemaining;
        finalStatus = newDebt === 0 ? "al_corriente" : "abono_parcial";
      } else {
        newDebt = currentDebt;
        finalStatus = newDebt > 0 ? (financialStatus === "abono_parcial" ? "abono_parcial" : "adeudo_pendiente") : "al_corriente";
      }

      const updatedStudent: StudentFinanceData = {
        ...student,
        current_debt_amount: newDebt,
        financial_status: finalStatus,
        training_days: trainingDays,
        training_schedule: finalSchedule,
        user_type: userType,
      };

      const profilePayload = {
        id: student.id,
        financial_status: finalStatus,
        current_debt_amount: newDebt,
        training_days: trainingDays,
        training_schedule: finalSchedule,
        user_type: userType,
      };

      const transactionPayload = paidAmt > 0 ? {
        id: generateUUID(),
        student_id: student.id,
        amount_paid: paidAmt,
        previous_debt: currentDebt,
        remaining_debt: newDebt,
        payment_method: paymentMethod,
        transaction_type: newDebt === 0 ? "pago_completo" : "abono",
        notes: `Cobro en Cancha: Sede Carmen Serdán. Recibido $${paidAmt} MXN`,
        venue: "Deportivo Carmen Serdán",
        created_at: new Date().toISOString(),
      } : null;

      // 1. Sincronización Local Store
      if (paidAmt > 0) {
        HoopStore.recordPayment(
          student.id,
          paidAmt,
          paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"
        );
      }

      // 2. Persistencia Supabase / Offline Sync
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (!isOnline) {
        // Encolar perfil y transacción offline
        enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profilePayload);
        if (transactionPayload) {
          enqueueOfflineAction("PAYMENT_TRANSACTION", transactionPayload);
        }
      } else {
        try {
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              financial_status: finalStatus,
              current_debt_amount: newDebt,
              training_days: trainingDays,
              training_schedule: finalSchedule,
              user_type: userType,
            })
            .eq("id", student.id);

          if (profileErr) {
            console.warn("Fallo update profiles, encolando offline:", profileErr);
            enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profilePayload);
          }

          if (transactionPayload) {
            const { error: transErr } = await supabase
              .from("payment_transactions_history")
              .insert(transactionPayload);

            if (transErr) {
              console.warn("Fallo trans history, encolando offline:", transErr);
              enqueueOfflineAction("PAYMENT_TRANSACTION", transactionPayload);
            }
          }
        } catch (netErr) {
          console.warn("Excepción de red en modal finanzas, encolando offline:", netErr);
          enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profilePayload);
          if (transactionPayload) {
            enqueueOfflineAction("PAYMENT_TRANSACTION", transactionPayload);
          }
        }
      }

      // 3. WhatsApp Comprobante al Tutor
      if (paidAmt > 0 && sendWhatsApp && student.tutor_phone) {
        const cleanPhone = student.tutor_phone.replace(/\D/g, "");
        const statusText = newDebt === 0 ? "Liquidado (Al Corriente)" : `Abonado (Saldo restante: $${newDebt} MXN)`;
        const msg = encodeURIComponent(
          `🐺 *WILD WOLVES CDMX - COMPROBANTE DE PAGO EN CANCHA*\n` +
          `Sede: Deportivo Carmen Serdán\n\n` +
          `• Atleta: ${student.full_name}\n` +
          `• Monto recibido: $${paidAmt} MXN\n` +
          `• Método: ${paymentMethod === "efectivo" ? "Efectivo en Cancha" : "Transferencia SPEI"}\n` +
          `• Estado: ${statusText}\n` +
          `• Días: ${trainingDays} (${finalSchedule})\n\n` +
          `¡Gracias por impulsar la disciplina y el básquetbol de alto rendimiento! 🏀`
        );
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("payment_recorded"));
      }

      onSuccess(updatedStudent);
      onClose();
    } catch (err) {
      console.error("Error al guardar gestión financiera:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#0a0d14] text-white rounded-t-3xl sm:rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER TÁCTICO */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-[#121622] to-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f66018]/15 border border-[#f66018]/30 flex items-center justify-center text-[#f66018]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm uppercase tracking-wide text-white">
                  Gestionar Finanzas & Horario
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Carmen Serdán
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {student.full_name} {student.category ? `• ${student.category}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {/* AVISO DE ACCIÓN RÁPIDA */}
          {actionNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* 1. TIPO DE USUARIO / ROL */}
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 block mb-2 tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#f66018]" />
              Identificación y Rol en Cancha
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USER_TYPES.map((item) => {
                const isSelected = userType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setUserType(item.type)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? item.type === "tutor"
                          ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50"
                          : item.type === "prospecto"
                          ? "bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50"
                          : item.type === "visitante"
                          ? "bg-sky-950/40 border-sky-500 text-sky-200 shadow-md ring-1 ring-sky-500/50"
                          : "bg-[#f66018]/15 border-[#f66018] text-white shadow-md ring-1 ring-[#f66018]/50"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-xs font-black uppercase">{item.label}</span>
                    <span className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
            {userType === "tutor" && (
              <p className="text-[11px] text-purple-400 mt-2 bg-purple-950/20 p-2 rounded-lg border border-purple-800/40 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Los usuarios marcados como Tutor/Familiar quedan exentos del pase de lista y cobro de cancha.
              </p>
            )}
          </div>

          {/* 2. ESTATUS FINANCIERO & ADEUDO ACTUAL */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                Control de Adeudo Actual
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleBecado}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    financialStatus === "becado"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400/40"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  {financialStatus === "becado" ? "★ Becado / Exento Activo" : "Marcar Becado"}
                </button>
              </div>
            </div>

            {/* Fila con Adeudo y Acciones Rápidas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Deuda Registrada</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-2xl font-black ${
                    financialStatus === "becado" ? "text-sky-400" : currentDebt > 0 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {financialStatus === "becado" ? "$0 MXN (Beca 100%)" : `$${currentDebt} MXN`}
                  </span>
                  {currentDebt > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      ({financialStatus === "abono_parcial" ? "Abono Parcial" : "Pendiente"})
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de Modificación Rápida de Deuda */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleForgiveDebt}
                  className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 text-xs font-black uppercase flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Poner deuda en $0 y marcar Al Corriente"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Perdonar Adeudo ($0)</span>
                </button>
              </div>
            </div>

            {/* Input para ajustar la deuda base manualmente */}
            <div className="pt-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                ¿Ajustar Monto de Deuda Base? (ej. fijar en $150, $300 o $600):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={currentDebt}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setCurrentDebt(val);
                    if (val === 0) setFinancialStatus("al_corriente");
                    else if (financialStatus !== "becado") setFinancialStatus("adeudo_pendiente");
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-[#f66018]"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => setCurrentDebt(150)}
                  className="px-2.5 h-10 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition shrink-0"
                >
                  $150
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentDebt(600)}
                  className="px-2.5 h-10 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition shrink-0"
                >
                  $600
                </button>
              </div>
            </div>
          </div>

          {/* 3. REGISTRAR ABONO O PAGO */}
          {financialStatus !== "becado" && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block flex items-center justify-between">
                <span>Registrar Abono o Pago Recibido</span>
                <span className="text-[10px] text-emerald-400 font-bold lowercase">saldo dinámico</span>
              </label>

              {/* Botones de sugerencia rápida */}
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 100, 150, currentDebt].filter(amt => amt > 0).slice(0, 4).map((amt, idx) => (
                  <button
                    key={`${amt}-${idx}`}
                    type="button"
                    onClick={() => setAmountReceived(amt.toString())}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      amountReceived === amt.toString()
                        ? "bg-[#f66018] text-white border-[#f66018]"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    ${amt} MXN
                  </button>
                ))}
              </div>

              {/* Input libre de monto recibido */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  max={currentDebt > 0 ? currentDebt : 10000}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Monto recibido en cancha (ej. 50, 100 o 150)"
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Desglose Automático de Saldo Restante */}
              {numReceived > 0 && (
                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Saldo Restante</span>
                    <span className={`text-base font-black ${calculatedRemaining === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      ${calculatedRemaining} MXN
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Nuevo Estatus</span>
                    <span className={`font-black uppercase text-[11px] ${
                      calculatedRemaining === 0 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {calculatedRemaining === 0 ? "Al Corriente ($0)" : `Abonó Parcial (Resta: $${calculatedRemaining})`}
                    </span>
                  </div>
                </div>
              )}

              {/* Selector de Método de Pago */}
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                  Método de Pago:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`h-10 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      paymentMethod === "efectivo"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Efectivo en Cancha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("spei")}
                    className={`h-10 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      paymentMethod === "spei"
                        ? "bg-sky-500/20 border-sky-500 text-sky-300 ring-1 ring-sky-500/40"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-sky-400" />
                    <span>Transferencia SPEI</span>
                  </button>
                </div>
              </div>

              {/* Checkbox WhatsApp */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 cursor-pointer text-xs">
                <span className="text-zinc-300 font-medium">Enviar recibo por WhatsApp al tutor</span>
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 accent-[#f66018] rounded cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* 4. DÍAS Y HORARIO DE ENTRENAMIENTO */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              Días y Horarios de Entrenamiento
            </label>

            {/* Días */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">
                Días de Práctica:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTrainingDays(d)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                      trainingDays === d
                        ? "bg-[#f66018] text-white border-[#f66018] shadow"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Horario de Sesión:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {PRESET_SCHEDULES.map((sched) => (
                  <button
                    key={sched}
                    type="button"
                    onClick={() => setTrainingSchedule(sched)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-black transition cursor-pointer border ${
                      trainingSchedule === sched
                        ? "bg-[#f66018] text-white border-[#f66018] shadow"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {sched}
                  </button>
                ))}
              </div>

              {trainingSchedule === "Personalizado" && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customSchedule}
                    onChange={(e) => setCustomSchedule(e.target.value)}
                    placeholder="Ej. Sábados 10:00 - 12:00 / Clínicas"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-[#f66018]"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-900/95 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#f66018] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>Sincronizando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
