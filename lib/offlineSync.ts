import { supabase } from "@/lib/supabaseClient";
import { 
  openLocalDB, 
  saveLocalAthletes, 
  getLocalAthletes, 
  queueOfflineAction as idbQueueAction, 
  getPendingQueue as idbGetQueue, 
  removeQueueItem as idbRemoveItem 
} from "./offline/db";
import {
  DailyAttendanceRow,
  PaymentTransactionHistoryRow,
  StudentInitialBaselineRow,
  DetailedTestRecordRow,
  ProspectAthleteRow
} from "@/lib/types/database";

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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item: any) => {
          const name = (item.full_name || item.name || item.athlete_name || "").toLowerCase();
          return !name.includes("bruno");
        });
      }
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
    if (!raw) return [];
    const parsed: PendingAction[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item: PendingAction) => {
      const p = item.payload || {};
      const name = (p.full_name || p.athlete_name || p.name || p.athlete_full_name || "").toLowerCase();
      const notes = (p.coach_feedback || p.notes || "").toLowerCase();
      return !name.includes("bruno") && !notes.includes("bruno");
    });
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
  let hasAttendanceSynced = false;

  for (const item of queue) {
    try {
      if (item.type === "ATTENDANCE") {
        const payload = item.payload || {};
        const cleanAttendance: DailyAttendanceRow = {
          student_id: payload.student_id,
          date: payload.date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          shift: payload.shift === "matutino_9_11" ? "matutino_9_11" : "vespertino_5_7",
          status: payload.status || "presente",
          notes: payload.notes || null,
        };

        const { error } = await supabase.from("daily_attendance").upsert(
          cleanAttendance,
          { onConflict: "student_id,date,shift" }
        );
        if (error) {
          const { error: fallbackErr } = await supabase.from("daily_attendance").upsert(
            cleanAttendance,
            { onConflict: "student_id,date" }
          );
          if (fallbackErr) throw error;
        }
        syncedCount++;
        hasAttendanceSynced = true;
      } else if (item.type === "PAYMENT" || item.type === "PAYMENT_TRANSACTION") {
        const payload = item.payload || {};
        const amountPaid = Number(payload.amount_paid !== undefined ? payload.amount_paid : (payload.amount || 0));
        const insertTx: PaymentTransactionHistoryRow = {
          student_id: payload.student_id,
          amount_paid: amountPaid,
          remaining_debt: Number(payload.remaining_debt || 0),
          payment_method: (payload.payment_method || "efectivo").toLowerCase(),
          transaction_type: payload.transaction_type || (amountPaid > 0 ? "abono" : "pago_completo"),
          concept: payload.concept || "Entrenamiento / Cuota",
          transaction_date: payload.transaction_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          notes: payload.notes || null,
          venue: payload.venue || "Deportivo Carmen Serdán",
        };
        const { error } = await supabase.from("payment_transactions_history").insert(insertTx);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "PROFILE_FINANCIAL_UPDATE") {
        const { id, ...updateData } = item.payload || {};
        if (updateData.financial_status === "adeudo_pendiente") {
          updateData.financial_status = "adeudo";
        }
        const { error } = await supabase.from("profiles").update(updateData).eq("id", id);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "BASELINE") {
        const payload = item.payload || {};
        const cleanBaseline: StudentInitialBaselineRow = {
          student_id: payload.student_id,
          coach_id: payload.coach_id || null,
          entry_date: payload.entry_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          initial_laps_completed: Number(payload.initial_laps_completed || 0),
          initial_jump_rope_max: Number(payload.initial_jump_rope_max || 0),
          initial_pushups_form: payload.initial_pushups_form || "estandar",
          initial_squats_count: Number(payload.initial_squats_count || 0),
          initial_posture_notes: payload.initial_posture_notes || null,
        };
        const { error } = await supabase.from("student_initial_baseline").upsert(
          cleanBaseline,
          { onConflict: "student_id" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PHYSICAL_LOG") {
        const { error } = await supabase.from("physical_training_logs").insert(item.payload);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "BASKETBALL_LOG" || item.type === "SPORTS_TEST") {
        const { error } = await supabase.from("basketball_skills_logs").insert(item.payload);
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "DETAILED_TEST") {
        const payload = item.payload || {};
        const ovr = Number(payload.overall_ovr || 75);
        const assessedLevel = ovr >= 70 ? "competitivo_elite" : ovr >= 55 ? "formativo_desarrollo" : "iniciacion_adaptacion";
        const cleanTest: DetailedTestRecordRow = {
          student_id: payload.student_id,
          coach_id: payload.coach_id || null,
          evaluation_date: payload.evaluation_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          athletic_level_assessed: assessedLevel,
          court_laps_count: Number(payload.court_laps_count || 20),
          squats_count: Number(payload.squats_count || 50),
          pushups_count: Number(payload.pushups_count || 35),
          plank_seconds: Number(payload.plank_seconds || 60),
          jump_rope_count: Number(payload.jump_rope_count || 0),
          short_range_shots_made: Number(payload.short_range_shots_made || payload.free_throws_made || 0),
          mid_range_shots_made: Number(payload.mid_range_shots_made || 0),
          three_point_shots_made: Number(payload.three_point_shots_made || 0),
          half_court_shots_made: Number(payload.half_court_shots_made || 0),
          overall_ovr: ovr,
          coach_feedback: payload.coach_feedback || "Sincronizado vía Motor Offline V2.",
        };
        const { error } = await supabase.from("detailed_test_records").upsert(
          cleanTest,
          { onConflict: "student_id,evaluation_date" }
        );
        if (error) throw error;
        syncedCount++;
      } else if (item.type === "PROSPECT_STUDENT") {
        const payload = item.payload || {};
        const cleanPayload: ProspectAthleteRow = {
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
        const { error } = await supabase.from("prospect_athletes").upsert(
          cleanPayload,
          { onConflict: "id" }
        );
        if (error) throw error;
        syncedCount++;
      } else {
        const targetTable = item.table || "daily_attendance";
        const { error } = await supabase.from(targetTable).upsert(item.payload);
        if (error) throw error;
        syncedCount++;
      }
    } catch (err: any) {
      console.error("Fallo sincronizando elemento offline:", item, err);
      // Si el error indica duplicidad ya confirmada en nube, no retenemos el elemento
      const errMsg = err?.message || "";
      if (errMsg.includes("duplicate key") || errMsg.includes("already exists")) {
        syncedCount++;
      } else {
        remainingQueue.push(item);
        failedCount++;
      }
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
    if (hasAttendanceSynced) {
      window.dispatchEvent(new Event("attendance_updated"));
    }
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
  let hasPaymentSynced = false;
  let hasAttendanceSynced = false;

  for (const item of queue) {
    try {
      if (item.type === "ATTENDANCE") {
        const payload = item.payload || {};
        const cleanAttendance: DailyAttendanceRow = {
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
          const { error: fallbackError } = await sb.from("daily_attendance").upsert(cleanAttendance, { onConflict: "student_id,date" });
          if (fallbackError) throw error;
        }
        syncedCount++;
        hasAttendanceSynced = true;
      } else if (item.type === "PAYMENT" || item.type === "PAYMENT_TRANSACTION") {
        const payload = item.payload || {};
        const amountPaid = Number(payload.amount_paid !== undefined ? payload.amount_paid : (payload.amount || 0));
        const insertTx: PaymentTransactionHistoryRow = {
          student_id: payload.student_id,
          amount_paid: amountPaid,
          remaining_debt: Number(payload.remaining_debt || 0),
          payment_method: (payload.payment_method || "efectivo").toLowerCase(),
          transaction_type: payload.transaction_type || (amountPaid > 0 ? "abono" : "pago_completo"),
          concept: payload.concept || "Entrenamiento / Cuota",
          transaction_date: payload.transaction_date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
          notes: payload.notes || null,
          venue: payload.venue || "Deportivo Carmen Serdán",
        };
        const { error } = await sb.from("payment_transactions_history").insert(insertTx);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "PROFILE_FINANCIAL_UPDATE") {
        const { id, ...updateData } = item.payload || {};
        if (updateData.financial_status === "adeudo_pendiente") {
          updateData.financial_status = "adeudo";
        }
        const { error } = await sb.from("profiles").update(updateData).eq("id", id);
        if (error) throw error;
        syncedCount++;
        hasPaymentSynced = true;
      } else if (item.type === "PROSPECT_STUDENT") {
        const payload = item.payload || {};
        const cleanPayload: ProspectAthleteRow = {
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
    } catch (err: any) {
      console.warn("Elemento no crítico evaluado durante sincronización:", item, err);
      const errMsg = err?.message || "";
      if (errMsg.includes("duplicate key") || errMsg.includes("already exists")) {
        syncedCount++;
      } else {
        remaining.push(item);
      }
    }
  }

  if (typeof window !== "undefined") {
    if (remaining.length === 0) {
      localStorage.removeItem(WW_QUEUE_KEY);
      localStorage.removeItem(QUEUE_KEY);
      localStorage.removeItem(LEGACY_QUEUE_KEY);
    } else {
      const serialized = JSON.stringify(remaining);
      localStorage.setItem(WW_QUEUE_KEY, serialized);
      localStorage.setItem(QUEUE_KEY, serialized);
      localStorage.setItem(LEGACY_QUEUE_KEY, serialized);
    }
    window.dispatchEvent(
      new CustomEvent("offline_queue_updated", { detail: { count: remaining.length } })
    );
    if (syncedCount > 0) {
      window.dispatchEvent(new CustomEvent("offline_queue_synced", { detail: { count: syncedCount } }));
      if (hasPaymentSynced) {
        window.dispatchEvent(new Event("payment_recorded"));
      }
      if (hasAttendanceSynced) {
        window.dispatchEvent(new Event("attendance_updated"));
      }
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
