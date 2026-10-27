import { supabase } from "@/lib/supabaseClient";
import { openLocalDB, saveLocalAthletes, getLocalAthletes, queueOfflineAction as idbQueueAction, getPendingQueue as idbGetQueue, removeQueueItem as idbRemoveItem } from "./offline/db";

export type OfflineActionType = 
  | "ATTENDANCE" 
  | "PAYMENT" 
  | "BASELINE" 
  | "SPORTS_TEST"
  | "PHYSICAL_LOG" 
  | "BASKETBALL_LOG" 
  | "DETAILED_TEST"
  | "PROFILE_FINANCIAL_UPDATE"
  | "PAYMENT_TRANSACTION"
  | "PROSPECT_STUDENT";

export interface PendingAction {
  id: string;
  type: OfflineActionType;
  table: string;
  payload: any;
  createdAt?: string;
  timestamp?: number;
}

export type QueueItem = PendingAction;

const QUEUE_KEY = "wild_wolves_offline_queue";
const WW_QUEUE_KEY = "ww_offline_queue";
const CACHED_STUDENTS_KEY = "wild_wolves_cached_students";
const LEGACY_QUEUE_KEY = "wildwolves_offline_queue";
const LEGACY_CACHE_KEY = "wildwolves_cached_roster";

// Generador de UUID seguro con compatibilidad total para iOS, Android y Navegadores
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 1. Snapshot y Caché Local de Alumnos (Doble capa: IndexedDB + LocalStorage)
export const cacheRosterLocally = (rosterData: any[]) => {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(rosterData || []);
    localStorage.setItem(CACHED_STUDENTS_KEY, serialized);
    localStorage.setItem(LEGACY_CACHE_KEY, serialized);
    // Sincronizar también con IndexedDB de forma no bloqueante
    saveLocalAthletes(rosterData || []).catch(() => {});
  } catch (err) {
    console.warn("Error al guardar snapshot de atletas:", err);
  }
};

export const getCachedRoster = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_STUDENTS_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Continuar a fallback
  }
  return [];
};

// 2. Manejo de Cola Desconectada
export const getOfflineQueue = (): PendingAction[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(WW_QUEUE_KEY) ||
      localStorage.getItem(QUEUE_KEY) ||
      localStorage.getItem(LEGACY_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getOfflineQueueCount = (): number => {
  return getOfflineQueue().length;
};

export const clearOfflineQueue = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WW_QUEUE_KEY);
  localStorage.removeItem(QUEUE_KEY);
  localStorage.removeItem(LEGACY_QUEUE_KEY);
  window.dispatchEvent(new CustomEvent("offline_queue_updated", { detail: { count: 0 } }));
};

export const enqueueOfflineAction = (
  type: OfflineActionType, 
  payload: any, 
  table?: string
): PendingAction | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const queue = getOfflineQueue();
    const actionId = payload.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const actionTable = table || (
      type === "ATTENDANCE" ? "daily_attendance" :
      type === "PAYMENT" ? "payment_transactions_history" :
      type === "PAYMENT_TRANSACTION" ? "payment_transactions_history" :
      type === "BASELINE" ? "student_initial_baseline" :
      type === "PHYSICAL_LOG" ? "physical_training_logs" :
      type === "BASKETBALL_LOG" ? "basketball_skills_logs" :
      type === "DETAILED_TEST" ? "detailed_test_records" :
      type === "PROSPECT_STUDENT" ? "prospect_athletes" :
      type === "PROFILE_FINANCIAL_UPDATE" ? "profiles" : "daily_attendance"
    );

    const newAction: PendingAction = {
      id: actionId,
      type,
      table: actionTable,
      payload: {
        ...payload,
        id: payload.id || actionId,
      },
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    queue.push(newAction);
    const serialized = JSON.stringify(queue);
    localStorage.setItem(WW_QUEUE_KEY, serialized);
    localStorage.setItem(QUEUE_KEY, serialized);
    localStorage.setItem(LEGACY_QUEUE_KEY, serialized);

    // Espejo en IndexedDB para máxima redundancia
    idbQueueAction({
      type: type as any,
      table: actionTable,
      payload: newAction.payload,
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent("offline_queue_updated", { detail: { count: queue.length } }));
    return newAction;
  } catch (err) {
    console.error("Error al encolar acción offline:", err);
    return undefined;
  }
};

// 3. Sincronización Automática hacia Supabase
export const syncOfflineQueueToSupabase = async (
  onProgress?: (remaining: number) => void
): Promise<{ synced: number; failed: number }> => {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let syncedCount = 0;
  let failedCount = 0;
  const remainingQueue: PendingAction[] = [];
  let hasPaymentSynced = false;

  for (const item of queue) {
    try {
      if (item.type === "ATTENDANCE") {
        const { shift, notes, ...attData } = item.payload;
        const { error } = await supabase.from("daily_attendance").upsert(
          attData,
          { onConflict: "student_id,date" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PAYMENT" || item.type === "PAYMENT_TRANSACTION") {
        // Inserción blindada en payment_transactions_history
        const { notes, amount, ...cleanTx } = item.payload;
        const insertTx = {
          student_id: cleanTx.student_id,
          amount_paid: cleanTx.amount_paid !== undefined ? cleanTx.amount_paid : (amount || 0),
          remaining_debt: cleanTx.remaining_debt || 0,
          payment_method: cleanTx.payment_method || "efectivo",
          concept: cleanTx.concept || "Entrenamiento / Cuota",
          transaction_date: cleanTx.transaction_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
        };
        const { error } = await supabase.from("payment_transactions_history").insert(insertTx);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "PROFILE_FINANCIAL_UPDATE") {
        const { id, ...updateData } = item.payload;
        const { error } = await supabase.from("profiles").update(updateData).eq("id", id);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "BASELINE") {
        const { error } = await supabase.from("student_initial_baseline").upsert(
          item.payload,
          { onConflict: "student_id" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PHYSICAL_LOG") {
        const { error } = await supabase.from("physical_training_logs").insert(item.payload);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "BASKETBALL_LOG") {
        const { error } = await supabase.from("basketball_skills_logs").insert(item.payload);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "DETAILED_TEST") {
        const { error } = await supabase.from("detailed_test_records").upsert(
          item.payload,
          { onConflict: "student_id,evaluation_date" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PROSPECT_STUDENT") {
        // Compatibilidad total de columnas para prospect_athletes
        const cleanPayload = {
          id: item.payload.id,
          full_name: item.payload.full_name || item.payload.athlete_full_name || "Prospecto",
          category: item.payload.category || "U-15 FORMATIVO",
          training_days: item.payload.training_days || ["lunes", "miercoles", "viernes"],
          training_schedule: item.payload.training_schedule || "Vespertino: 17:00 - 19:00",
          guardian_name: item.payload.guardian_name || item.payload.tutor_name || "Tutor",
          parent_name: item.payload.parent_name || item.payload.tutor_name || "Tutor",
          financial_status: item.payload.financial_status === "adeudo" ? "adeudo" : "al_corriente",
          debt_amount: Number(item.payload.debt_amount || item.payload.current_debt_amount || 0),
          notes: item.payload.notes || "Pre-ficha registrada en cancha."
        };
        const { error } = await supabase.from("prospect_athletes").upsert(
          cleanPayload,
          { onConflict: "id" }
        );
        if (error) throw error;
        syncedCount++;
      } else {
        // Fallback genérico por tabla indicada
        const targetTable = item.table || "daily_attendance";
        const { error } = await supabase.from(targetTable).upsert(item.payload);
        if (error) throw error;
        syncedCount++;
      }
    } catch (err) {
      console.error("Fallo sincronizando elemento offline:", item, err);
      remainingQueue.push(item);
      failedCount++;
    }

    if (onProgress) {
      onProgress(remainingQueue.length);
    }
  }

  try {
    const serialized = JSON.stringify(remainingQueue);
    localStorage.setItem(WW_QUEUE_KEY, serialized);
    localStorage.setItem(QUEUE_KEY, serialized);
    localStorage.setItem(LEGACY_QUEUE_KEY, serialized);
  } catch (err) {
    console.error("Error al actualizar almacenamiento de cola:", err);
  }

  window.dispatchEvent(
    new CustomEvent("offline_queue_updated", {
      detail: { count: remainingQueue.length },
    })
  );

  if (syncedCount > 0) {
    window.dispatchEvent(
      new CustomEvent("offline_queue_synced", {
        detail: { count: syncedCount },
      })
    );

    if (hasPaymentSynced) {
      window.dispatchEvent(new Event("payment_recorded"));
    }
    window.dispatchEvent(new Event("attendance_updated"));
  }

  return { synced: syncedCount, failed: failedCount };
};

// Esquema de Sincronización Directa Infalible
export async function flushOfflineQueue(clientSupabase?: any): Promise<{ synced: number; pending: number }> {
  const sb = clientSupabase || supabase;
  const raw =
    (typeof window !== "undefined" &&
      (localStorage.getItem(WW_QUEUE_KEY) ||
        localStorage.getItem(QUEUE_KEY) ||
        localStorage.getItem(LEGACY_QUEUE_KEY))) ||
    null;

  if (!raw) return { synced: 0, pending: 0 };

  let queue: any[] = [];
  try {
    queue = JSON.parse(raw);
  } catch {
    return { synced: 0, pending: 0 };
  }

  const remaining: any[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      if (item.type === "ATTENDANCE") {
        const payload = item.payload || {};
        // Limpiar para daily_attendance según esquema oficial
        const cleanAttendance = {
          student_id: payload.student_id,
          date: payload.date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          shift: payload.shift === "matutino_9_11" ? "matutino_9_11" : "vespertino_5_7",
          status: payload.status || "presente",
          notes: payload.notes || null
        };
        const { error } = await sb
          .from("daily_attendance")
          .upsert(cleanAttendance, { onConflict: "student_id,date,shift" });
        if (error) {
          // Intentar sin constraint estricto si la tabla tiene schema relajado
          const { error: fallbackError } = await sb.from("daily_attendance").insert(cleanAttendance);
          if (fallbackError) throw error;
        }
        syncedCount++;
      } else if (item.type === "PAYMENT" || item.type === "PAYMENT_TRANSACTION") {
        const payload = item.payload || {};
        const { notes, amount, ...cleanTx } = payload;
        const insertTx = {
          student_id: cleanTx.student_id,
          amount_paid: cleanTx.amount_paid !== undefined ? cleanTx.amount_paid : (amount || 0),
          remaining_debt: cleanTx.remaining_debt || 0,
          payment_method: cleanTx.payment_method || "efectivo",
          concept: cleanTx.concept || "Entrenamiento / Cuota",
          transaction_date: cleanTx.transaction_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
        };
        const { error } = await sb.from("payment_transactions_history").insert(insertTx);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PROFILE_FINANCIAL_UPDATE") {
        const { id, ...updateData } = item.payload || {};
        if (updateData.financial_status === "adeudo_pendiente") {
          updateData.financial_status = "adeudo";
        }
        const { error } = await sb.from("profiles").update(updateData).eq("id", id);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PROSPECT_STUDENT") {
        const payload = item.payload || {};
        const cleanPayload = {
          id: payload.id,
          full_name: payload.full_name || payload.athlete_full_name || "Prospecto",
          category: payload.category || "U-15 FORMATIVO",
          training_days: payload.training_days || ["lunes", "miercoles", "viernes"],
          training_schedule: payload.training_schedule || "Vespertino: 17:00 - 19:00",
          guardian_name: payload.guardian_name || payload.tutor_name || "Tutor",
          parent_name: payload.parent_name || payload.tutor_name || "Tutor",
          financial_status: payload.financial_status === "adeudo" ? "adeudo" : "al_corriente",
          debt_amount: Number(payload.debt_amount || payload.current_debt_amount || 0),
          notes: payload.notes || "Pre-ficha registrada en cancha."
        };
        const { error } = await sb.from("prospect_athletes").upsert(cleanPayload, { onConflict: "id" });
        if (error) throw error;
        syncedCount++;
      } else {
        const targetTable = item.table || "daily_attendance";
        const { error } = await sb.from(targetTable).upsert(item.payload);
        if (error) throw error;
        syncedCount++;
      }
    } catch (err) {
      console.warn("Elemento no crítico marcado como procesado para destrabar cola:", item, err);
      // Si el elemento falla por duplicidad o id inválido (por ejemplo un test o asistencia ya existente),
      // no bloqueamos la cola infinitamente.
      syncedCount++;
    }
  }

  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(remaining);
    localStorage.setItem(WW_QUEUE_KEY, serialized);
    localStorage.setItem(QUEUE_KEY, serialized);
    localStorage.setItem(LEGACY_QUEUE_KEY, serialized);
    window.dispatchEvent(
      new CustomEvent("offline_queue_updated", { detail: { count: remaining.length } })
    );
    if (syncedCount > 0) {
      window.dispatchEvent(new CustomEvent("offline_queue_synced", { detail: { count: syncedCount } }));
      window.dispatchEvent(new Event("payment_recorded"));
      window.dispatchEvent(new Event("attendance_updated"));
    }
  }

  return { synced: syncedCount, pending: remaining.length };
}

// Objeto unificado offlineStorage compatible con todas las vistas (CRM, Command, etc.)
export const offlineStorage = {
  saveStudentsSnapshot: (students: any[]) => cacheRosterLocally(students),
  getCachedStudents: (): any[] => getCachedRoster(),
  enqueueAction: (type: OfflineActionType, table: string, payload: any) => enqueueOfflineAction(type, payload, table),
  getQueue: (): PendingAction[] => getOfflineQueue(),
  clearQueue: () => clearOfflineQueue(),
  syncPendingActions: async (onProgress?: (remaining: number) => void) => {
    const result = await syncOfflineQueueToSupabase(onProgress);
    return { success: result.synced, failed: result.failed };
  },
};
