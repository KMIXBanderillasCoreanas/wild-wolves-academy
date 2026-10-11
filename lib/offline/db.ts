// lib/offline/db.ts
const DB_NAME = "WildWolves_Bunker_DB";
const DB_VERSION = 1;

export interface OfflineAction {
  id: string;
  type: "ATTENDANCE" | "PAYMENT" | "SPORTS_TEST" | "PROSPECT_STUDENT";
  table: string;
  payload: any;
  createdAt: string;
  status: "pending" | "synced" | "error";
}

export function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("IndexedDB is not available in SSR"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("athletes_cache")) {
        db.createObjectStore("athletes_cache", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Guardar y consultar atletas localmente
export async function saveLocalAthletes(athletes: any[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openLocalDB();
    const tx = db.transaction("athletes_cache", "readwrite");
    const store = tx.objectStore("athletes_cache");
    athletes.forEach((ath) => {
      if (ath && ath.id) {
        store.put(ath);
      }
    });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn("IndexedDB saveLocalAthletes fallback:", err);
  }
}

export async function getLocalAthletes(): Promise<any[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openLocalDB();
    const tx = db.transaction("athletes_cache", "readonly");
    const store = tx.objectStore("athletes_cache");
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn("IndexedDB getLocalAthletes fallback:", err);
    return [];
  }
}

// Encolar acciones offline
export async function queueOfflineAction(action: Omit<OfflineAction, "id" | "status" | "createdAt">): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openLocalDB();
    const tx = db.transaction("sync_queue", "readwrite");
    const store = tx.objectStore("sync_queue");
    const item: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    store.put(item);
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("offline_queue_updated"));
        }
        resolve();
      };
    });
  } catch (err) {
    console.warn("IndexedDB queueOfflineAction fallback:", err);
  }
}

export async function getPendingQueue(): Promise<OfflineAction[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openLocalDB();
    const tx = db.transaction("sync_queue", "readonly");
    const store = tx.objectStore("sync_queue");
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn("IndexedDB getPendingQueue fallback:", err);
    return [];
  }
}

export async function removeQueueItem(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openLocalDB();
    const tx = db.transaction("sync_queue", "readwrite");
    tx.objectStore("sync_queue").delete(id);
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("offline_queue_updated"));
        }
        resolve();
      };
    });
  } catch (err) {
    console.warn("IndexedDB removeQueueItem fallback:", err);
  }
}
