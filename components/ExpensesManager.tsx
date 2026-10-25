"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  AlertCircle
} from "lucide-react";
import { ExpenseRecord, getStoredExpenses, saveExpense, deleteExpense } from "@/lib/expensesStorage";

interface ExpensesManagerProps {
  onExpenseChanged?: () => void;
}

export default function ExpensesManager({ onExpenseChanged }: ExpensesManagerProps) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [concept, setConcept] = useState<string>("");
  const [amount, setAmount] = useState<number>(100);
  const [category, setCategory] = useState<ExpenseRecord["category"]>("cancha_renta");
  const [paymentMethod, setPaymentMethod] = useState<ExpenseRecord["payment_method"]>("efectivo");
  const [expenseDate, setExpenseDate] = useState<string>(() => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
  });
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStoredExpenses();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("expenses_updated", handleUpdate);
    return () => window.removeEventListener("expenses_updated", handleUpdate);
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || amount <= 0) {
      alert("Por favor ingresa un concepto y un monto válido.");
      return;
    }
    setSaving(true);
    try {
      await saveExpense({
        concept: concept.trim(),
        amount: Number(amount),
        category,
        payment_method: paymentMethod,
        expense_date: expenseDate,
        notes: notes.trim(),
      });
      setShowAddModal(false);
      setConcept("");
      setAmount(100);
      setNotes("");
      await loadData();
      if (onExpenseChanged) onExpenseChanged();
    } catch (err: any) {
      alert("Error guardando gasto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string, name: string) => {
    if (!confirm(`⚠️ ¿Eliminar el gasto "${name}"?`)) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpense(id);
    await loadData();
    if (onExpenseChanged) onExpenseChanged();
  };

  const totalGastos = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-black uppercase text-rose-400 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Control de Egresos & Gastos Operativos
          </h3>
          <p className="text-xs text-zinc-400">
            Registra gastos de renta de cancha Carmen Serdán, balones, arbitrajes y botiquín
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121724] border border-rose-500/30 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-zinc-500 text-[10px] block">TOTAL EGRESOS:</span>
            <span className="font-black text-rose-400">${totalGastos} MXN</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-950/40"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs">
          No hay gastos registrados. Usa el botón "Registrar Gasto" para deducir costos operativos.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-zinc-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Monto</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-[#121724]/60 transition">
                  <td className="py-2.5 px-3 font-mono text-zinc-400">{e.expense_date}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{e.concept}</td>
                  <td className="py-2.5 px-3 text-zinc-400 uppercase text-[10px] font-mono">
                    {e.category.replace("_", " ")}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-zinc-300">{e.payment_method}</td>
                  <td className="py-2.5 px-3 font-black text-rose-400">-${e.amount} MXN</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      title="Eliminar Gasto"
                      onClick={() => handleDeleteExpense(e.id, e.concept)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Agregar Gasto */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0d1017] border-2 border-rose-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Registrar Gasto Operativo
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Concepto del Gasto:</label>
                <input
                  type="text"
                  placeholder="Ej. Renta duela Carmen Serdán, 2 balones Spalding..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Monto (MXN):</label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-rose-400 font-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Categoría:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value="cancha_renta">Renta de Cancha / Sede</option>
                    <option value="material_balones">Balones & Material</option>
                    <option value="arbitraje">Arbitraje & Torneos</option>
                    <option value="botiquin">Botiquín & Primeros Auxilios</option>
                    <option value="marketing">Marketing & Publicidad</option>
                    <option value="otro">Otro Gasto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Método de Pago:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia SPEI</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Notas / Factura (Opcional):</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-950/40 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
