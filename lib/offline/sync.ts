// lib/offline/sync.ts
import { supabase } from "@/lib/supabaseClient";
import { getPendingQueue, removeQueueItem } from "./db";
import { getPendingOfflineTests, markOfflineTestSynced, clearAllOfflineQueue } from "./indexedDbQueue";

export async function syncOfflineDataWithCloud(
  onProgress?: (total: number, remaining: number) => void
): Promise<{ success: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  // 1. Sincronizar cola general de eventos (prospectos, asistencia general, pagos)
  const queue = await getPendingQueue();
  let success = 0;
  let failed = 0;
  const total = queue.length;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      let resError = null;

      if (item.type === "PROSPECT_STUDENT") {
        const { error } = await supabase.from("prospect_athletes").upsert(item.payload, { onConflict: "athlete_full_name" });
        resError = error;
      } else if (item.type === "ATTENDANCE") {
        const { error } = await supabase.from("daily_attendance").upsert(item.payload, { onConflict: "student_id,date,shift" });
        resError = error;
      } else if (item.type === "PAYMENT") {
        const { error } = await supabase.from("payment_transactions_history").insert(item.payload);
        resError = error;
      } else if (item.type === "SPORTS_TEST") {
        const { error } = await supabase.from("basketball_skills_logs").insert(item.payload);
        resError = error;
      }

      if (!resError) {
        await removeQueueItem(item.id);
        success++;
      } else {
        console.error("Fallo al sincronizar elemento general:", item, resError);
        failed++;
      }
    } catch (err) {
      console.error("Error en conexión de cola general:", err);
      failed++;
    }

    if (onProgress) onProgress(total, total - (i + 1));
  }

  // 2. Sincronización Atómica de Test Days (35 Tiros, Cuerda, Físico) vía Endpoint Seguro
  try {
    const pendingTests = await getPendingOfflineTests();
    if (pendingTests.length > 0) {
      const response = await fetch("/api/sync-offline-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingTests)
      });

      if (response.ok) {
        // Limpiar atómicamente la cola local tras status 200 de Supabase
        await clearAllOfflineQueue();
        success += pendingTests.length;
        window.dispatchEvent(new Event("offline_tests_synced"));
      } else {
        console.warn("Respuesta no exitosa al sincronizar tests offline:", await response.text());
        failed += pendingTests.length;
      }
    }
  } catch (syncTestsErr) {
    console.error("Error en sincronización atómica de tests:", syncTestsErr);
  }

  return { success, failed };
}
