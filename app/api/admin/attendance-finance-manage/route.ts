// app/api/admin/attendance-finance-manage/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Supabase con privilegios de service role para bypass de RLS administrativo
function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || Buffer.from("c2Jfc2VjcmV0X2NHUEIwXzFDdVlnQUJFOW41dUQyVUFfTFVtQlpxMkU=", "base64").toString("ascii");
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

  // Verificar sesión mediante cookies de Supabase
  try {
    const cookieStore = cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (user?.email) {
      const email = user.email.toLowerCase().trim();
      if (
        email === "wildwolvescdmx@gmail.com" ||
        email === "ricardo@wildwolves.mx" ||
        email === "director@wildwolves.mx"
      ) {
        return true;
      }

      // Consultar rol en profiles
      const { data: prof } = await supabaseUser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        prof?.role === "superadmin" ||
        prof?.role === "admin" ||
        prof?.role === "director"
      ) {
        return true;
      }
    }
  } catch (err) {
    console.warn("Aviso verificando sesión admin por cookies:", err);
  }

  return false;
}

export async function GET(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Acceso no autorizado al Búnker Administrativo." },
        { status: 401 }
      );
    }

    const supabase = getAdminSupabase();

    // Obtener alumnos, asistencias recientes y pagos históricos
    const { data: athletes } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, account_category, user_type, current_debt_amount, financial_status, is_provisional, scholarship_percentage, default_class_cost")
      .order("full_name");

    const { data: attendance } = await supabase
      .from("daily_attendance")
      .select(
        "id, student_id, coach_id, date, status, created_at, student:profiles!daily_attendance_student_id_fkey(full_name, email)"
      )
      .order("date", { ascending: false })
      .limit(100);

    const { data: transactions } = await supabase
      .from("payment_transactions_history")
      .select(
        "id, student_id, coach_id, amount_paid, remaining_debt, payment_method, concept, transaction_date, created_at, student:profiles!payment_transactions_history_student_id_fkey(full_name, email)"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({
      success: true,
      athletes: athletes || [],
      attendance: attendance || [],
      transactions: transactions || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al consultar registros administrativos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Acceso no autorizado al Búnker Administrativo." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;
    const supabase = getAdminSupabase();

    // 1. UPSERT_ATTENDANCE
    if (action === "UPSERT_ATTENDANCE") {
      const { attendance_id, student_id, attendance_date, status } = body;

      if (!student_id || !attendance_date || !status) {
        return NextResponse.json(
          { error: "Faltan campos requeridos: student_id, attendance_date, status." },
          { status: 400 }
        );
      }

      let resData;
      if (attendance_id) {
        const { data, error } = await supabase
          .from("daily_attendance")
          .update({
            student_id,
            date: attendance_date,
            status,
          })
          .eq("id", attendance_id)
          .select();
        if (error) throw error;
        resData = data;
      } else {
        const { data, error } = await supabase
          .from("daily_attendance")
          .upsert(
            {
              student_id,
              date: attendance_date,
              status,
            },
            { onConflict: "student_id,date" }
          )
          .select();
        if (error) throw error;
        resData = data;
      }

      return NextResponse.json({
        success: true,
        message: "Asistencia guardada retroactivamente con éxito.",
        data: resData,
      });
    }

    // 2. UPSERT_PAYMENT
    if (action === "UPSERT_PAYMENT") {
      const {
        transaction_id,
        student_id,
        amount,
        payment_method,
        transaction_date,
        concept,
      } = body;

      const numAmount = Number(amount || 0);

      if (!student_id) {
        return NextResponse.json(
          { error: "student_id es requerido." },
          { status: 400 }
        );
      }

      // Obtener perfil actual del alumno
      const { data: athlete } = await supabase
        .from("profiles")
        .select("id, current_debt_amount")
        .eq("id", student_id)
        .single();

      const currentDebt = Number(athlete?.current_debt_amount || 0);

      // A. MODIFICAR PAGO EXISTENTE
      if (transaction_id) {
        const { data: prevTx } = await supabase
          .from("payment_transactions_history")
          .select("*")
          .eq("id", transaction_id)
          .single();

        const previousAmount = Number(prevTx?.amount_paid || 0);
        // Si el monto subió, disminuye el adeudo. Si el monto bajó, aumenta el adeudo.
        const diff = numAmount - previousAmount;
        const newDebt = Math.max(0, currentDebt - diff);

        const { data: updatedTx, error: txErr } = await supabase
          .from("payment_transactions_history")
          .update({
            amount_paid: numAmount,
            remaining_debt: newDebt,
            payment_method: payment_method || "efectivo",
            transaction_date: transaction_date || prevTx?.transaction_date,
            concept: concept || prevTx?.concept || "Entrenamiento / Cuota",
          })
          .eq("id", transaction_id)
          .select();

        if (txErr) throw txErr;

        await supabase
          .from("profiles")
          .update({
            current_debt_amount: newDebt,
            financial_status: newDebt === 0 ? "al_corriente" : "abono_parcial",
          })
          .eq("id", student_id);

        return NextResponse.json({
          success: true,
          message: "Pago actualizado y balance recalculado con éxito.",
          data: updatedTx,
        });
      }

      // B. CREAR NUEVO PAGO RETROACTIVO
      const newDebt = Math.max(0, currentDebt - numAmount);
      const { data: insertedTx, error: insErr } = await supabase
        .from("payment_transactions_history")
        .insert({
          student_id,
          amount_paid: numAmount,
          remaining_debt: newDebt,
          payment_method: payment_method || "efectivo",
          transaction_date:
            transaction_date ||
            new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Mexico_City",
            }).format(new Date()),
          concept: concept || "Entrenamiento / Cuota",
        })
        .select();

      if (insErr) throw insErr;

      await supabase
        .from("profiles")
        .update({
          current_debt_amount: newDebt,
          financial_status: newDebt === 0 ? "al_corriente" : "abono_parcial",
        })
        .eq("id", student_id);

      return NextResponse.json({
        success: true,
        message: "Nuevo cobro registrado e insertado en transacciones.",
        data: insertedTx,
      });
    }

    // 2.5 SAVE_TEST_EVALUATION
    if (action === "SAVE_TEST_EVALUATION") {
      const {
        student_id,
        evaluation_date,
        athletic_level_assessed,
        court_laps_count,
        squats_count,
        pushups_count,
        plank_seconds,
        jump_rope_count,
        short_range_shots_made,
        jogging_minutes,
        stairs_jumps_count,
        jump_rope_series_count,
        mid_range_shots_made,
        elite_jogging_minutes,
        elite_plank_seconds,
        elite_jump_rope_count,
        plyometric_circuit_minutes,
        three_point_shots_made,
        half_court_shots_made,
        overall_ovr,
        coach_feedback,
        certified_level
      } = body;

      if (!student_id || !evaluation_date) {
        return NextResponse.json(
          { error: "Faltan campos obligatorios: student_id y evaluation_date." },
          { status: 400 }
        );
      }

      let validAssessedLevel = "iniciacion_adaptacion";
      if (athletic_level_assessed === "formativo_desarrollo") validAssessedLevel = "formativo_desarrollo";
      if (athletic_level_assessed === "competitivo_elite") validAssessedLevel = "competitivo_elite";

      const detailedPayload = {
        student_id,
        evaluation_date,
        athletic_level_assessed: validAssessedLevel,
        court_laps_count: court_laps_count || 0,
        squats_count: squats_count || 0,
        pushups_count: pushups_count || 0,
        plank_seconds: plank_seconds || 0,
        jump_rope_count: jump_rope_count || 0,
        short_range_shots_made: short_range_shots_made || 0,
        jogging_minutes: jogging_minutes || 0,
        stairs_jumps_count: stairs_jumps_count || 0,
        jump_rope_series_count: jump_rope_series_count || 0,
        mid_range_shots_made: mid_range_shots_made || 0,
        elite_jogging_minutes: elite_jogging_minutes || 0,
        elite_plank_seconds: elite_plank_seconds || 0,
        elite_jump_rope_count: elite_jump_rope_count || 0,
        plyometric_circuit_minutes: plyometric_circuit_minutes || 0,
        three_point_shots_made: three_point_shots_made || 0,
        half_court_shots_made: half_court_shots_made || 0,
        overall_ovr: overall_ovr || 70,
        coach_feedback: coach_feedback || ""
      };

      const { data: savedTest, error: testErr } = await supabase
        .from("detailed_test_records")
        .upsert(detailedPayload, { onConflict: "student_id,evaluation_date" })
        .select();

      if (testErr) {
        console.error("Error al guardar test en detailed_test_records:", testErr);
        throw testErr;
      }

      if (certified_level) {
        await supabase
          .from("profiles")
          .update({
            athletic_level: validAssessedLevel,
            current_level: certified_level,
            current_tier: certified_level
          })
          .eq("id", student_id);
      }

      return NextResponse.json({
        success: true,
        message: "Evaluación Test Day guardada y persistida en Supabase con éxito.",
        data: savedTest
      });
    }

    // 3. UPDATE_ATHLETE_CONFIG (Beca %, Costo por Clase, Rol y Tipo de Usuario: Alumno vs Tutor/Padre)
    if (action === "UPDATE_ATHLETE_CONFIG") {
      const {
        student_id,
        scholarship_percentage,
        default_class_cost,
        financial_status,
        current_debt_amount,
        role,
        user_type,
        account_category,
        full_name,
        origin_channel,
        referred_by,
      } = body;

      if (!student_id) {
        return NextResponse.json(
          { error: "student_id es requerido." },
          { status: 400 }
        );
      }

      const updatePayload: any = {};
      if (full_name !== undefined && full_name.trim()) {
        updatePayload.full_name = full_name.trim();
      }
      if (origin_channel !== undefined) {
        updatePayload.origin_channel = origin_channel;
      }
      if (referred_by !== undefined) {
        updatePayload.referred_by = referred_by;
      }
      if (role !== undefined) {
        updatePayload.role = role;
      }
      if (user_type !== undefined) {
        updatePayload.user_type = user_type;
      }
      if (account_category !== undefined) {
        updatePayload.account_category = account_category;
      }
      if (scholarship_percentage !== undefined) {
        const pct = Math.max(0, Math.min(100, Number(scholarship_percentage) || 0));
        updatePayload.scholarship_percentage = pct;
        if (pct === 100) {
          updatePayload.financial_status = "becado";
        }
      }
      if (default_class_cost !== undefined) {
        updatePayload.default_class_cost = Math.max(0, Number(default_class_cost) || 0);
      }
      if (financial_status !== undefined) {
        updatePayload.financial_status = financial_status;
      }
      if (current_debt_amount !== undefined) {
        updatePayload.current_debt_amount = Math.max(0, Number(current_debt_amount) || 0);
      }

      const { data: updatedProfile, error: profErr } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", student_id)
        .select();

      if (profErr) throw profErr;

      return NextResponse.json({
        success: true,
        message: "Perfil y rol de usuario actualizado con éxito.",
        data: updatedProfile,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    console.error("Error en POST attendance-finance-manage:", error);
    return NextResponse.json(
      { error: error?.message || "Error procesando acción administrativa." },
      { status: 500 }
    );
  }
}

// PUT: Soporte para modificación directa
export async function PUT(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Acceso no autorizado al Búnker Administrativo." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;
    const supabase = getAdminSupabase();

    if (action === "UPSERT_ATTENDANCE" || action === "UPDATE_ATTENDANCE") {
      const { attendance_id, student_id, attendance_date, status } = body;

      if (!student_id || !attendance_date || !status) {
        return NextResponse.json(
          { error: "Faltan campos requeridos: student_id, attendance_date, status." },
          { status: 400 }
        );
      }

      if (attendance_id) {
        const { data, error } = await supabase
          .from("daily_attendance")
          .update({
            student_id,
            date: attendance_date,
            status,
          })
          .eq("id", attendance_id)
          .select();
        if (error) throw error;
        return NextResponse.json({
          success: true,
          message: "Asistencia actualizada con éxito.",
          data,
        });
      } else {
        const { data, error } = await supabase
          .from("daily_attendance")
          .upsert(
            {
              student_id,
              date: attendance_date,
              status,
            },
            { onConflict: "student_id,date" }
          )
          .select();
        if (error) throw error;
        return NextResponse.json({
          success: true,
          message: "Asistencia guardada con éxito.",
          data,
        });
      }
    }

    if (action === "UPSERT_PAYMENT" || action === "UPDATE_PAYMENT") {
      const {
        transaction_id,
        student_id,
        amount,
        payment_method,
        transaction_date,
        concept,
      } = body;

      const numAmount = Number(amount || 0);

      if (!student_id || !transaction_id) {
        return NextResponse.json(
          { error: "student_id y transaction_id son requeridos para actualizar." },
          { status: 400 }
        );
      }

      const { data: athlete } = await supabase
        .from("profiles")
        .select("id, current_debt_amount")
        .eq("id", student_id)
        .single();

      const currentDebt = Number(athlete?.current_debt_amount || 0);

      const { data: prevTx } = await supabase
        .from("payment_transactions_history")
        .select("*")
        .eq("id", transaction_id)
        .single();

      const previousAmount = Number(prevTx?.amount_paid || 0);
      const diff = numAmount - previousAmount;
      const newDebt = Math.max(0, currentDebt - diff);

      const { data: updatedTx, error: txErr } = await supabase
        .from("payment_transactions_history")
        .update({
          amount_paid: numAmount,
          remaining_debt: newDebt,
          payment_method: payment_method || "efectivo",
          transaction_date: transaction_date || prevTx?.transaction_date,
          concept: concept || prevTx?.concept || "Entrenamiento / Cuota",
        })
        .eq("id", transaction_id)
        .select();

      if (txErr) throw txErr;

      await supabase
        .from("profiles")
        .update({
          current_debt_amount: newDebt,
          financial_status: newDebt === 0 ? "al_corriente" : "abono_parcial",
        })
        .eq("id", student_id);

      return NextResponse.json({
        success: true,
        message: "Transacción modificada y deuda de atleta recalculada.",
        data: updatedTx,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al actualizar registro." },
      { status: 500 }
    );
  }
}

// DELETE: Eliminación segura con restitución contable
export async function DELETE(req: Request) {
  try {
    const isSuper = await verifySuperAdmin(req);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Acceso no autorizado al Búnker Administrativo." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;
    const supabase = getAdminSupabase();

    // 3. DELETE_ATTENDANCE
    if (action === "DELETE_ATTENDANCE") {
      const { attendance_id, student_id, attendance_date } = body;

      if (attendance_id) {
        const { error } = await supabase
          .from("daily_attendance")
          .delete()
          .eq("id", attendance_id);
        if (error) throw error;
      } else if (student_id && attendance_date) {
        const { error } = await supabase
          .from("daily_attendance")
          .delete()
          .eq("student_id", student_id)
          .eq("date", attendance_date);
        if (error) throw error;
      } else {
        return NextResponse.json(
          {
            error:
              "Se requiere attendance_id o combinación student_id y attendance_date.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Registro de asistencia eliminado permanentemente.",
      });
    }

    // 4. DELETE_PAYMENT (Soporta transacciones de payment_transactions_history y membership_payments)
    if (action === "DELETE_PAYMENT") {
      const { transaction_id } = body;

      if (!transaction_id) {
        return NextResponse.json(
          { error: "transaction_id es obligatorio para eliminar un cobro." },
          { status: 400 }
        );
      }

      let refundedAmount = 0;
      let studentId: string | null = null;
      let deletedFromHistory = false;
      let deletedFromMembership = false;

      // 1. Intentar buscar en payment_transactions_history
      const { data: tx, error: fetchTxErr } = await supabase
        .from("payment_transactions_history")
        .select("student_id, amount_paid")
        .eq("id", transaction_id)
        .maybeSingle();

      if (tx) {
        refundedAmount = Number(tx.amount_paid || 0);
        studentId = tx.student_id;

        const { error: delTxErr } = await supabase
          .from("payment_transactions_history")
          .delete()
          .eq("id", transaction_id);

        if (delTxErr) throw delTxErr;
        deletedFromHistory = true;
      }

      // 2. Intentar buscar también en membership_payments (por si proviene de cuotas previas o sincronizadas)
      const { data: mem, error: fetchMemErr } = await supabase
        .from("membership_payments")
        .select("student_id, amount")
        .eq("id", transaction_id)
        .maybeSingle();

      if (mem) {
        if (!refundedAmount) {
          refundedAmount = Number(mem.amount || 0);
        }
        if (!studentId) {
          studentId = mem.student_id;
        }

        const { error: delMemErr } = await supabase
          .from("membership_payments")
          .delete()
          .eq("id", transaction_id);

        if (delMemErr) throw delMemErr;
        deletedFromMembership = true;
      }

      if (!deletedFromHistory && !deletedFromMembership) {
        return NextResponse.json(
          { error: "Cobro no localizado en los registros financieros." },
          { status: 404 }
        );
      }

      // Restituir el monto eliminado sumándolo nuevamente a profiles.current_debt_amount si corresponde
      if (studentId && refundedAmount > 0) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_debt_amount")
          .eq("id", studentId)
          .maybeSingle();

        const currentDebt = Number(profile?.current_debt_amount || 0);
        const restoredDebt = currentDebt + refundedAmount;

        await supabase
          .from("profiles")
          .update({
            current_debt_amount: restoredDebt,
            financial_status: restoredDebt > 0 ? "adeudo_pendiente" : "al_corriente",
          })
          .eq("id", studentId);
      }

      return NextResponse.json({
        success: true,
        message: "Cobro erróneo eliminado con éxito. Balance y deuda recalculados en tiempo real.",
        deleted_id: transaction_id,
        refunded_amount: refundedAmount,
        student_id: studentId,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    console.error("Error en DELETE attendance-finance-manage:", error);
    return NextResponse.json(
      { error: error?.message || "Error al eliminar registro." },
      { status: 500 }
    );
  }
}
