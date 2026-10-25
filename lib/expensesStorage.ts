// lib/expensesStorage.ts
import { supabase } from "@/lib/supabaseClient";

export interface ExpenseRecord {
  id: string;
  concept: string;
  amount: number;
  category: "cancha_renta" | "material_balones" | "arbitraje" | "botiquin" | "marketing" | "otro";
  expense_date: string; // YYYY-MM-DD (America/Mexico_City)
  payment_method: "efectivo" | "transferencia" | "tarjeta";
  notes?: string;
  created_at: string;
}

const LOCAL_EXPENSES_KEY = "ww_expenses_records";
const STORAGE_BUCKET = "workout-proofs";
const STORAGE_FILE_PATH = "expenses_ledger.json";

export async function getStoredExpenses(): Promise<ExpenseRecord[]> {
  let localExp: ExpenseRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
      if (raw) localExp = JSON.parse(raw);
    } catch {}
  }

  try {
    const { data: file, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_FILE_PATH);

    if (file && !error) {
      const text = await file.text();
      if (text && text.trim()) {
        const cloudExp: ExpenseRecord[] = JSON.parse(text);
        const map = new Map<string, ExpenseRecord>();
        localExp.forEach((e) => map.set(e.id, e));
        cloudExp.forEach((e) => map.set(e.id, e));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch {}

  return localExp;
}

export async function saveExpense(
  exp: Omit<ExpenseRecord, "id" | "created_at"> & { id?: string; created_at?: string }
): Promise<ExpenseRecord> {
  const newExp: ExpenseRecord = {
    id: exp.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    concept: exp.concept,
    amount: Number(exp.amount) || 0,
    category: exp.category || "otro",
    expense_date: exp.expense_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
    payment_method: exp.payment_method || "efectivo",
    notes: exp.notes || "",
    created_at: exp.created_at || new Date().toISOString(),
  };

  let allExp: ExpenseRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
      if (raw) allExp = JSON.parse(raw);
      allExp.unshift(newExp);
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(allExp));
      window.dispatchEvent(new CustomEvent("expenses_updated", { detail: { newExp } }));
    } catch {}
  }

  try {
    const serialized = JSON.stringify(allExp, null, 2);
    const blob = new Blob([serialized], { type: "application/json" });
    await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE_PATH, blob, { upsert: true });
  } catch (err) {
    console.warn("Aviso guardando gasto en nube:", err);
  }

  return newExp;
}

export async function deleteExpense(expenseId: string): Promise<boolean> {
  let allExp: ExpenseRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
      if (raw) allExp = JSON.parse(raw);
      allExp = allExp.filter((e) => e.id !== expenseId);
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(allExp));
      window.dispatchEvent(new Event("expenses_updated"));
    } catch {}
  }

  try {
    const serialized = JSON.stringify(allExp, null, 2);
    const blob = new Blob([serialized], { type: "application/json" });
    await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE_PATH, blob, { upsert: true });
  } catch {}

  return true;
}
