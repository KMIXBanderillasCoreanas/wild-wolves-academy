// Gestor Nativo de IndexedDB sin dependencias externas para Wild Wolves OS
export interface OfflineSportsTestRecord {
  id: string; // client_record_id único
  student_id?: string;
  athlete_name: string;
  evaluation_date: string;
  overall_ovr: number;
  free_throws_made: number;
  mid_range_made: number;
  three_point_made: number;
  spot_corner_left?: number;
  spot_wing_left?: number;
  spot_top_key?: number;
  spot_wing_right?: number;
  spot_corner_right?: number;
  jump_rope_count: number;
  lines_round_trip_seconds?: number;
  sprint_100m_seconds?: number;
  vertical_jump_cm: number;
  coach_feedback: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

const DB_NAME = 'WildWolvesOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'sports_tests_queue';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sync_status', 'sync_status', { unique: false });
        store.createIndex('evaluation_date', 'evaluation_date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 1. Guardar en IndexedDB y respaldo en LocalStorage
export async function queueOfflineSportsTest(
  record: Omit<OfflineSportsTestRecord, 'id' | 'created_at' | 'sync_status'>
): Promise<OfflineSportsTestRecord> {
  const fullRecord: OfflineSportsTestRecord = {
    ...record,
    id: `ww-offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    created_at: new Date().toISOString(),
    sync_status: 'pending',
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback a LocalStorage por advertencia de IndexedDB:', err);
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('ww_offline_sports_tests') || '[]');
    existing.unshift(fullRecord);
    localStorage.setItem('ww_offline_sports_tests', JSON.stringify(existing.slice(0, 50)));
  }

  return fullRecord;
}

// 2. Obtener todas las pruebas pendientes
export async function getPendingOfflineTests(): Promise<OfflineSportsTestRecord[]> {
  try {
    const db = await openDatabase();
    const items = await new Promise<OfflineSportsTestRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const pending = (req.result || []).filter((r: OfflineSportsTestRecord) => r.sync_status === 'pending');
        resolve(pending);
      };
      req.onerror = () => reject(req.error);
    });

    if (items.length > 0) return items;
  } catch {}

  // Fallback a LocalStorage
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('ww_offline_sports_tests') || '[]');
  }
  return [];
}

// 3. Marcar prueba individual como sincronizada
export async function markOfflineTestSynced(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('ww_offline_sports_tests') || '[]');
    const filtered = existing.filter((item: any) => item.id !== id);
    localStorage.setItem('ww_offline_sports_tests', JSON.stringify(filtered));
  }
}

// 4. Limpiar todas las colas locales tras sincronización masiva exitosa
export async function clearAllOfflineQueue(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  if (typeof window !== 'undefined') {
    localStorage.removeItem('ww_offline_sports_tests');
    localStorage.removeItem('wild_wolves_offline_queue');
  }
}
