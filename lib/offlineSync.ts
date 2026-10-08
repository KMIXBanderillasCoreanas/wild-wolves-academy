import { supabase } from "@/lib/supabaseClient";

export interface QueueItem {
  id: string;
  type: "ATTENDANCE" | "PAYMENT";
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = "wildwolves_offline_queue";
const CACHE_ROSTER_KEY = "wildwolves_cached_roster";

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

// 1. Guardar la lista de alumnos en caché local para que cargue aun sin señal en cancha
export const cacheRosterLocally = (rosterData: any[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_ROSTER_KEY, JSON.stringify(rosterData));
  } catch (err) {
    console.warn("Error al guardar caché de roster:", err);
  }
};

export const getCachedRoster = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_ROSTER_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

// 2. Encolar acción cuando no hay internet o falla la petición
export const enqueueOfflineAction = (type: "ATTENDANCE" | "PAYMENT", payload: any) => {
  if (typeof window === "undefined") return;
  try {
    const queue: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    const item: QueueItem = {
      id: payload.id || generateUUID(),
      type,
      payload: {
        ...payload,
        id: payload.id || generateUUID(),
      },
      timestamp: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Notificar cambio de estado en la cola a componentes suscritos
    window.dispatchEvent(new CustomEvent("offline_queue_updated", { detail: { count: queue.length } }));
  } catch (err) {
    console.error("Error al encolar acción offline:", err);
  }
};

export const getOfflineQueueCount = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const queue: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return queue.length;
  } catch {
    return 0;
  }
};

export const getOfflineQueue = (): QueueItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const clearOfflineQueue = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new CustomEvent("offline_queue_updated", { detail: { count: 0 } }));
};

// 3. Vaciar y sincronizar la cola hacia Supabase con idempotencia
export const syncOfflineQueueToSupabase = async (
  onSyncComplete?: (count: number) => void
): Promise<{ synced: number; failed: number }> => {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return { synced: 0, failed: 0 };

  let queue: QueueItem[] = [];
  try {
    queue = JSON.parse(raw);
  } catch {
    return { synced: 0, failed: 0 };
  }

  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remainingQueue: QueueItem[] = [];
  let syncedCount = 0;
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
      }
    } catch (err) {
      console.error("Fallo al sincronizar elemento de cola:", item, err);
      remainingQueue.push(item); // Conservar para el siguiente reintento automático
    }
  }

  // Guardar elementos que hayan fallado (si hubo cortes intermitentes)
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch (err) {
    console.error("Error al actualizar cola de sincronización:", err);
  }

  // Notificar a la app
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

    if (onSyncComplete) {
      onSyncComplete(syncedCount);
    }
  }

  return { synced: syncedCount, failed: remainingQueue.length };
};
