// lib/offline/sync.ts
import { supabase } from "@/lib/supabaseClient";
import { getPendingQueue, removeQueueItem } from "./db";

export async function syncOfflineDataWithCloud(
  onProgress?: (total: number, remaining: number) => void
): Promise<{ success: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  const queue = await getPendingQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

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
        console.error("Fallo al sincronizar elemento:", item, resError);
        failed++;
      }
    } catch (err) {
      console.error("Error en conexión:", err);
      failed++;
    }

    if (onProgress) onProgress(total, total - (i + 1));
  }

  return { success, failed };
}
