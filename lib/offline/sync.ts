// lib/offline/sync.ts
import { supabase } from "@/lib/supabaseClient";
import { getPendingQueue, removeQueueItem } from "./db";
import { getPendingOfflineTests, clearAllOfflineQueue } from "./indexedDbQueue";

export interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

export async function syncOfflineDataWithCloud(
  onProgress?: (total: number, remaining: number) => void
): Promise<SyncResult> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { success: 0, failed: 0, errors: ["Dispositivo sin conexión a internet"] };
  }

  let successCount = 0;
  let failedCount = 0;
  const errorLogs: string[] = [];

  // 1. Sincronizar cola general (prospectos, asistencia, pagos y test rápido)
  try {
    const queue = await getPendingQueue();
    const totalQueue = queue.length;

    for (let i = 0; i < totalQueue; i++) {
      const item = queue[i];
      let itemSuccess = false;
      let errorMsg = "";

      try {
        if (item.type === "PROSPECT_STUDENT") {
          const { error } = await supabase
            .from("prospect_athletes")
            .upsert(item.payload, { onConflict: "athlete_full_name" });
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "ATTENDANCE") {
          const { error } = await supabase
            .from("daily_attendance")
            .upsert(item.payload, { onConflict: "student_id,date,shift" });
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "PAYMENT") {
          const { error } = await supabase
            .from("payment_transactions_history")
            .insert(item.payload);
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "SPORTS_TEST") {
          const { error } = await supabase
            .from("basketball_skills_logs")
            .insert(item.payload);
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        }
      } catch (err: any) {
        errorMsg = err?.message || "Excepción de red";
      }

      // Si Supabase aceptó el registro o el error es de conflicto ya existente, se elimina de la cola
      if (itemSuccess || (errorMsg && errorMsg.includes("duplicate key"))) {
        await removeQueueItem(item.id);
        successCount++;
      } else {
        failedCount++;
        errorLogs.push(`Elemento ${item.type} [${item.id}]: ${errorMsg}`);
      }

      if (onProgress) {
        onProgress(totalQueue, totalQueue - (i + 1));
      }
    }
  } catch (queueErr: any) {
    console.warn("Aviso procesando sync_queue:", queueErr);
    errorLogs.push(`sync_queue: ${queueErr?.message}`);
  }

  // 2. Sincronización atómica por lote de pruebas completas (35 tiros, cuerda y físico)
  try {
    const pendingTests = await getPendingOfflineTests();
    if (pendingTests.length > 0) {
      try {
        const response = await fetch("/api/sync-offline-tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingTests),
        });

        if (response.ok) {
          // Status 200/201: purgar físicamente la cola local
          await clearAllOfflineQueue();
          successCount += pendingTests.length;
        } else {
          const errText = await response.text();
          failedCount += pendingTests.length;
          errorLogs.push(`Endpoint /api/sync-offline-tests devolvió status ${response.status}: ${errText}`);
        }
      } catch (postErr: any) {
        failedCount += pendingTests.length;
        errorLogs.push(`Error al conectar con /api/sync-offline-tests: ${postErr?.message}`);
      }
    }
  } catch (testsErr: any) {
    console.warn("Aviso leyendo pruebas pendientes:", testsErr);
  }

  // 3. Emitir evento global para actualizar de inmediato banners o pills en Búnker y Coach
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("offline_sync_completed", {
        detail: {
          successCount,
          failedCount,
          timestamp: new Date().toISOString(),
        },
      })
    );
    window.dispatchEvent(new Event("offline_queue_updated"));
  }

  return {
    success: successCount,
    failed: failedCount,
    errors: errorLogs,
  };
}
