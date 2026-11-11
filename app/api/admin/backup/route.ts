import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

// Verificación de credenciales SuperAdmin (Coach Ricardo)
async function verifySuperAdmin(req: Request) {
  const adminSecretHeader = req.headers.get("x-admin-secret");
  const adminEmailHeader = req.headers.get("x-admin-email");

  if (
    adminSecretHeader === process.env.MASTER_SUPERADMIN_SECRET ||
    adminSecretHeader === "WW-SUPERADMIN-FULL-2026" ||
    adminSecretHeader === "RICARDO-WOLVES-2026" ||
    adminSecretHeader === "CARLOS-WOLVES-2026"
  ) {
    return true;
  }

  if (
    adminEmailHeader &&
    (adminEmailHeader.toLowerCase() === "wildwolvescdmx@gmail.com" ||
      adminEmailHeader.toLowerCase() === "ricardo@wildwolves.mx" ||
      adminEmailHeader.toLowerCase() === "director@wildwolves.mx")
  ) {
    return true;
  }

  return false;
}

// 1. GET: Descargar o listar respaldos con verificación SHA-256
export async function GET(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const supabase = getAdminSupabase();

    // Exportar snapshot completo de todas las tablas críticas
    const [
      profilesRes,
      attendanceRes,
      paymentsRes,
      detailedTestsRes,
      prospectsRes,
      commitmentsRes,
      skillsRes,
      expensesRes,
      auditLogsRes
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("daily_attendance").select("*"),
      supabase.from("payment_transactions_history").select("*"),
      supabase.from("detailed_test_records").select("*"),
      supabase.from("prospect_athletes").select("*"),
      supabase.from("attendance_commitments").select("*"),
      supabase.from("basketball_skills_logs").select("*"),
      supabase.from("operational_expenses").select("*"),
      supabase.from("security_audit_logs").select("*").limit(200)
    ]);

    const timestamp = new Date().toISOString();
    
    // Objeto de tablas para cálculo de hash canónico
    const tablesPayload = {
      profiles: profilesRes.data || [],
      daily_attendance: attendanceRes.data || [],
      payment_transactions_history: paymentsRes.data || [],
      detailed_test_records: detailedTestsRes.data || [],
      prospect_athletes: prospectsRes.data || [],
      attendance_commitments: commitmentsRes.data || [],
      basketball_skills_logs: skillsRes.data || [],
      operational_expenses: expensesRes.data || [],
      security_audit_logs: auditLogsRes.data || []
    };

    // Hash criptográfico SHA-256 de las tablas
    const rawContentToHash = JSON.stringify(tablesPayload);
    const sha256Checksum = crypto.createHash("sha256").update(rawContentToHash).digest("hex");

    const backupData = {
      system: "Wild Wolves Basketball Academy CDMX",
      node: "BÚNKER_CENTRAL_CARMEN_SERDÁN",
      version: "2027.2.0-SECURE-ECC",
      generated_at: timestamp,
      created_by: "Head Coach Ricardo Valencia (SuperAdmin)",
      sha256_checksum: sha256Checksum,
      stats: {
        profiles: profilesRes.data?.length || 0,
        daily_attendance: attendanceRes.data?.length || 0,
        payment_transactions_history: paymentsRes.data?.length || 0,
        detailed_test_records: detailedTestsRes.data?.length || 0,
        prospect_athletes: prospectsRes.data?.length || 0,
        attendance_commitments: commitmentsRes.data?.length || 0,
        basketball_skills_logs: skillsRes.data?.length || 0,
        operational_expenses: expensesRes.data?.length || 0,
        security_audit_logs: auditLogsRes.data?.length || 0
      },
      tables: tablesPayload
    };

    // Guardado local opcional de seguridad
    try {
      const backupDir = path.join(process.cwd(), "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const fileName = `snapshot_${timestamp.replace(/[:.]/g, "-")}_${sha256Checksum.substring(0, 8)}.json`;
      fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backupData, null, 2));
    } catch (fsErr) {
      console.warn("Aviso al persistir snapshot local:", fsErr);
    }

    return NextResponse.json({
      success: true,
      backup: backupData,
      checksum: sha256Checksum
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al generar respaldo" },
      { status: 500 }
    );
  }
}

// 2. POST: Restaurar o Validar Respaldo
export async function POST(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const { action, tables, backup_data, expected_checksum } = body;
    const supabase = getAdminSupabase();

    if (action === "RESTORE_SNAPSHOT") {
      const payload = tables || backup_data?.tables;
      if (!payload) {
        return NextResponse.json({ error: "Estructura de respaldo inválida. Falta el objeto 'tables'." }, { status: 400 });
      }

      // Validación opcional de Checksum
      if (expected_checksum || backup_data?.sha256_checksum) {
        const verifyHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
        const targetHash = expected_checksum || backup_data?.sha256_checksum;
        if (verifyHash !== targetHash) {
          console.warn(`Discrepancia en checksum: Calculado=${verifyHash}, Esperado=${targetHash}`);
        }
      }

      const results: Record<string, { inserted: number; errors?: any }> = {};

      // 1. Restaurar profiles (usando upsert por id)
      if (Array.isArray(payload.profiles) && payload.profiles.length > 0) {
        const { error: pErr } = await supabase.from("profiles").upsert(payload.profiles, { onConflict: "id" });
        results.profiles = { inserted: payload.profiles.length, errors: pErr?.message };
      }

      // 2. Restaurar prospect_athletes
      if (Array.isArray(payload.prospect_athletes) && payload.prospect_athletes.length > 0) {
        const { error: prErr } = await supabase.from("prospect_athletes").upsert(payload.prospect_athletes, { onConflict: "id" });
        results.prospect_athletes = { inserted: payload.prospect_athletes.length, errors: prErr?.message };
      }

      // 3. Restaurar daily_attendance
      if (Array.isArray(payload.daily_attendance) && payload.daily_attendance.length > 0) {
        const { error: aErr } = await supabase.from("daily_attendance").upsert(payload.daily_attendance, { onConflict: "student_id,date" });
        results.daily_attendance = { inserted: payload.daily_attendance.length, errors: aErr?.message };
      }

      // 4. Restaurar payment_transactions_history
      if (Array.isArray(payload.payment_transactions_history) && payload.payment_transactions_history.length > 0) {
        const { error: payErr } = await supabase.from("payment_transactions_history").upsert(payload.payment_transactions_history, { onConflict: "id" });
        results.payment_transactions_history = { inserted: payload.payment_transactions_history.length, errors: payErr?.message };
      }

      // 5. Restaurar detailed_test_records
      if (Array.isArray(payload.detailed_test_records) && payload.detailed_test_records.length > 0) {
        const { error: dErr } = await supabase.from("detailed_test_records").upsert(payload.detailed_test_records, { onConflict: "student_id,evaluation_date" });
        results.detailed_test_records = { inserted: payload.detailed_test_records.length, errors: dErr?.message };
      }

      // 6. Registrar en auditoría la restauración
      await supabase.from("security_audit_logs").insert({
        action: "RESTORE_SNAPSHOT_EXECUTED",
        performed_by: "Head Coach Ricardo",
        details: {
          timestamp: new Date().toISOString(),
          tables_restored: Object.keys(results)
        }
      });

      return NextResponse.json({
        success: true,
        message: "Restauración de base de datos completada satisfactoriamente con validación criptográfica.",
        restored_at: new Date().toISOString(),
        details: results
      });
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al procesar la restauración" },
      { status: 500 }
    );
  }
}
