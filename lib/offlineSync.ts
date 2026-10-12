import { supabase } from "@/lib/supabaseClient";

export type OfflineActionType = 
  | "ATTENDANCE" 
  | "PAYMENT" 
  | "BASELINE" 
  | "SPORTS_TEST"
  | "PHYSICAL_LOG" 
  | "BASKETBALL_LOG" 
  | "DETAILED_TEST"
  | "PROFILE_FINANCIAL_UPDATE"
  | "PAYMENT_TRANSACTION";

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

// Generador de UUID seguro con compatibilidad para entornos móviles
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback si no está en contexto seguro
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 1. Snapshot y Caché Local de Alumnos (Dual Keys para compatibilidad)
export const cacheRosterLocally = (rosterData: any[]) => {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(rosterData || []);
    localStorage.setItem(CACHED_STUDENTS_KEY, serialized);
    localStorage.setItem(LEGACY_CACHE_KEY, serialized);
  } catch (err) {
    console.warn("Error al guardar snapshot de atletas:", err);
  }
};

export const getCachedRoster = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_STUDENTS_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
      type === "PAYMENT" ? "membership_payments" :
      type === "PAYMENT_TRANSACTION" ? "payment_transactions_history" :
      type === "BASELINE" ? "student_initial_baseline" :
      type === "PHYSICAL_LOG" ? "physical_training_logs" :
      type === "BASKETBALL_LOG" ? "basketball_skills_logs" :
      type === "DETAILED_TEST" ? "detailed_test_records" :
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
        const { error } = await supabase.from("daily_attendance").upsert(
          item.payload,
          { onConflict: "student_id,date,shift" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PAYMENT") {
        const { error } = await supabase.from("membership_payments").upsert(
          item.payload,
          { onConflict: "id" }
        );
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "PAYMENT_TRANSACTION") {
        const { error } = await supabase.from("payment_transactions_history").insert(item.payload);
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
  }

  return { synced: syncedCount, failed: failedCount };
};

// Objeto unificado offlineStorage compatible con ambas firmas
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
