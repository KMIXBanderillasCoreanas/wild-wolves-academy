// lib/offline/sync.ts
import { supabase } from "@/lib/supabaseClient";
import { getPendingQueue, removeQueueItem, OfflineAction } from "./db";
import { getPendingOfflineTests, clearAllOfflineQueue } from "./indexedDbQueue";
import {
  DailyAttendanceRow,
  PaymentTransactionHistoryRow,
  StudentInitialBaselineRow,
  DetailedTestRecordRow,
  ProspectAthleteRow
} from "@/lib/types/database";

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
  let hasPaymentSynced = false;
  let hasAttendanceSynced = false;

  // 1. Sincronizar cola general de IndexedDB (asistencias, pagos, evaluaciones, perfiles)
  try {
    const queue = await getPendingQueue();
    // Excluir atletas de prueba no deseados
    const validQueue = queue.filter((item) => {
      const p = item.payload || {};
      const name = (p.athlete_name || p.athlete_full_name || p.full_name || p.name || "").toLowerCase();
      return !name.includes("bruno");
    });

    const totalQueue = validQueue.length;

    for (let i = 0; i < totalQueue; i++) {
      const item = validQueue[i];
      let itemSuccess = false;
      let errorMsg = "";

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
          const { error } = await supabase
            .from("daily_attendance")
            .upsert(cleanAttendance, { onConflict: "student_id,date,shift" });
          if (error) {
            // Reintento sin constraint estricto en caso de esquemas heredados
            const { error: fallbackErr } = await supabase
              .from("daily_attendance")
              .upsert(cleanAttendance, { onConflict: "student_id,date" });
            if (fallbackErr) errorMsg = error.message;
            else {
              itemSuccess = true;
              hasAttendanceSynced = true;
            }
          } else {
            itemSuccess = true;
            hasAttendanceSynced = true;
          }
        } else if (item.type === "PAYMENT" || item.type === "PAYMENT_TRANSACTION") {
          const payload = item.payload || {};
          const amountPaid = Number(payload.amount_paid !== undefined ? payload.amount_paid : (payload.amount || 0));
          const cleanTx: PaymentTransactionHistoryRow = {
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
          const { error } = await supabase
            .from("payment_transactions_history")
            .insert(cleanTx);
          if (error) errorMsg = error.message;
          else {
            itemSuccess = true;
            hasPaymentSynced = true;
          }
        } else if (item.type === "PROFILE_FINANCIAL_UPDATE") {
          const payload = item.payload || {};
          const { id, ...updateData } = payload;
          if (updateData.financial_status === "adeudo_pendiente") {
            updateData.financial_status = "adeudo";
          }
          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", id);
          if (error) errorMsg = error.message;
          else {
            itemSuccess = true;
            hasPaymentSynced = true;
          }
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
          const { error } = await supabase
            .from("student_initial_baseline")
            .upsert(cleanBaseline, { onConflict: "student_id" });
          if (error) errorMsg = error.message;
          else itemSuccess = true;
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
          const { error } = await supabase
            .from("detailed_test_records")
            .upsert(cleanTest, { onConflict: "student_id,evaluation_date" });
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "PROSPECT_STUDENT") {
          const payload = item.payload || {};
          const cleanProspect: ProspectAthleteRow = {
            id: payload.id,
            full_name: payload.full_name || payload.athlete_full_name || "Prospecto",
            category: payload.category || "U-15 FORMATIVO",
            training_days: payload.training_days || ["lunes", "miercoles", "viernes"],
            training_schedule: payload.training_schedule || "Vespertino: 17:00 - 19:00",
            guardian_name: payload.guardian_name || payload.tutor_name || "Tutor",
            parent_name: payload.parent_name || payload.tutor_name || "Tutor",
            financial_status: payload.financial_status === "adeudo" ? "adeudo" : "al_corriente",
            debt_amount: Number(payload.debt_amount || payload.current_debt_amount || 0),
            notes: payload.notes || "Pre-ficha registrada en cancha.",
          };
          const { error } = await supabase
            .from("prospect_athletes")
            .upsert(cleanProspect, { onConflict: "id" });
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "SPORTS_TEST" || item.type === "BASKETBALL_LOG") {
          const { error } = await supabase
            .from("basketball_skills_logs")
            .insert(item.payload);
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else if (item.type === "PHYSICAL_LOG") {
          const { error } = await supabase
            .from("physical_training_logs")
            .insert(item.payload);
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        } else {
          // Fallback por tabla explícita
          const targetTable = item.table || "daily_attendance";
          const { error } = await supabase.from(targetTable).upsert(item.payload);
          if (error) errorMsg = error.message;
          else itemSuccess = true;
        }
      } catch (err: any) {
        errorMsg = err?.message || "Excepción de red";
      }

      // Si Supabase aceptó el registro o el error es de conflicto/duplicado, se remueve con seguridad
      if (itemSuccess || (errorMsg && (errorMsg.includes("duplicate key") || errorMsg.includes("already exists")))) {
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

  // 2. Sincronización atómica por lote de pruebas deportivas completas vía API interna
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

  // 3. Emitir eventos globales para actualizar de inmediato banners o pills en Búnker y Coach
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
    if (hasPaymentSynced) {
      window.dispatchEvent(new Event("payment_recorded"));
    }
    if (hasAttendanceSynced) {
      window.dispatchEvent(new Event("attendance_updated"));
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    errors: errorLogs,
  };
}
