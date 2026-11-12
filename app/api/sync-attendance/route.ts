// app/api/sync-attendance/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { evaluarSeguridadPeticion } from "@/lib/lobo-centinela-guard";
import { DailyAttendanceRow } from "@/lib/types/database";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(url, serviceKey);
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await request.json();

    // Auditoría de Seguridad Lobo Centinela Guard
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "sync_attendance",
      payloadContent: body,
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon, code: sec.codigoBloqueo }, { status: 403 });
    }

    const records = Array.isArray(body) ? body : (body.records || [body]);
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron registros de asistencia válidos." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminSupabase();
    const results = {
      processed: 0,
      errors: [] as string[],
    };

    for (const rec of records) {
      if (!rec.student_id) {
        results.errors.push("Registro omitido: falta student_id");
        continue;
      }

      const cleanRow: DailyAttendanceRow = {
        student_id: rec.student_id,
        date: rec.date || new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()),
        shift: rec.shift === "matutino_9_11" ? "matutino_9_11" : "vespertino_5_7",
        status: rec.status || "presente",
        notes: rec.notes || null,
      };

      const { error } = await supabaseAdmin
        .from("daily_attendance")
        .upsert(cleanRow, { onConflict: "student_id,date,shift" });

      if (error) {
        // Fallback para esquemas con constraint unique(student_id, date)
        const { error: fallbackError } = await supabaseAdmin
          .from("daily_attendance")
          .upsert(cleanRow, { onConflict: "student_id,date" });

        if (fallbackError) {
          results.errors.push(`Error en asistencia ${cleanRow.student_id} (${cleanRow.date}): ${fallbackError.message}`);
          continue;
        }
      }

      results.processed += 1;
    }

    return NextResponse.json({
      ok: true,
      success: results.processed > 0,
      processed: results.processed,
      errors: results.errors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido procesando asistencia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
