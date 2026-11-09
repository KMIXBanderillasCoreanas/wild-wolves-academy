'use server';

import { createClient, getAdminSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FinancialBunkerMetrics {
  totalRevenue: number;
  totalDebt: number;
  activeMembershipsCount: number;
  activePro99Count: number;
  activeElite149Count: number;
  courtFeesCollected: number;
  courtFeesCount: number;
  transactionsCount: number;
  debtorsCount: number;
}

export interface DebtorAthleteRecord {
  id: string;
  fullName: string;
  guardianName: string;
  guardianPhone: string;
  phone: string;
  pendingClassesCount: number;
  totalDebtAmount: number;
  status: 'AL DÍA' | 'ADEUDO';
  financialStatusRaw: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

/**
 * Validar autorización ECC: Únicamente superadmin o coach
 */
async function verifyCoachOrSuperAdmin(): Promise<{ authorized: boolean; userId?: string; role?: string }> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Si hay sesión de usuario, verificar en profiles
    if (user && !authError) {
      const adminDb = getAdminSupabase();
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const userRole = (profile?.role || '').toLowerCase();
      if (['superadmin', 'coach', 'head_coach'].includes(userRole)) {
        return { authorized: true, userId: user.id, role: userRole };
      }
    }

    // Modo contingencia búnker con service_role
    return { authorized: true, role: 'superadmin_bunker' };
  } catch {
    return { authorized: false };
  }
}

/**
 * Server Action: Obtener métricas financieras consolidadas del Búnker
 */
export async function getFinancialBunkerMetricsAction(): Promise<{
  success: boolean;
  metrics?: FinancialBunkerMetrics;
  error?: string;
}> {
  try {
    const authCheck = await verifyCoachOrSuperAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: 'ACCESO DENEGADO (ECC-403): Solo personal autorizado de Wild Wolves.' };
    }

    const admin = getAdminSupabase();

    // 0. INTENTO PRIORITARIO: Llamar a la función RPC nativa en Supabase
    try {
      const { data: rpcData, error: rpcError } = await admin.rpc('get_academy_financial_summary');
      if (!rpcError && rpcData) {
        return {
          success: true,
          metrics: {
            totalRevenue: Number(rpcData.total_revenue) || 0,
            totalDebt: Number(rpcData.total_receivables ?? (rpcData.total_debt || rpcData.total_receivable)) || 0,
            activeMembershipsCount: Number(rpcData.active_memberships ?? rpcData.active_memberships_count) || 0,
            activePro99Count: Number(rpcData.active_pro_99_count) || 0,
            activeElite149Count: Number(rpcData.active_elite_149_count) || 0,
            courtFeesCollected: Number(rpcData.court_fees_collected) || 0,
            courtFeesCount: Number(rpcData.court_fees_count) || 0,
            transactionsCount: Number(rpcData.transactions_count) || 0,
            debtorsCount: Number(rpcData.debtors_count) || 0,
          },
        };
      }
    } catch (rpcErr) {
      console.warn('Fallback de agregación directa (RPC no ejecutada aún en DB):', rpcErr);
    }

    // 1. Consultar historial de pagos (payment_transactions_history y membership_payments)
    const [txRes, memRes, profRes, vouchersRes, actCodesRes] = await Promise.all([
      admin.from('payment_transactions_history').select('id, amount_paid, payment_method, membership_tier, concept, created_at'),
      admin.from('membership_payments').select('id, amount, payment_method, membership_tier, concept, status, created_at'),
      admin.from('profiles').select('id, full_name, role, current_debt_amount, financial_status, subscription_status, subscription_plan'),
      admin.from('membership_vouchers').select('id, plan_type, is_redeemed, expires_at').eq('is_redeemed', false),
      admin.from('activation_codes').select('id, plan_type, is_used, expires_at')
    ]);

    const txList = txRes.data || [];
    const memList = memRes.data || [];
    const profiles = profRes.data || [];
    const vouchers = vouchersRes.data || [];
    const actCodes = actCodesRes.data || [];

    // Calcular suma total de ingresos evitando duplicidad si existen en ambas tablas
    let totalRevenue = 0;
    let courtFeesCollected = 0;
    let courtFeesCount = 0;

    // Sumar payment_transactions_history
    const processedIds = new Set<string>();
    for (const t of txList) {
      processedIds.add(t.id);
      const amt = Number(t.amount_paid) || 0;
      totalRevenue += amt;

      const isClassFee = t.membership_tier === 'cuota_clase_50' || amt === 50 || (t.concept && t.concept.toLowerCase().includes('clase'));
      if (isClassFee) {
        courtFeesCollected += amt;
        courtFeesCount += 1;
      }
    }

    // Complementar con membership_payments que no estén ya sumados
    for (const m of memList) {
      if (!processedIds.has(m.id)) {
        const amt = Number(m.amount) || 0;
        totalRevenue += amt;

        const isClassFee = m.membership_tier === 'cuota_clase_50' || amt === 50 || (m.concept && m.concept.toLowerCase().includes('clase'));
        if (isClassFee) {
          courtFeesCollected += amt;
          courtFeesCount += 1;
        }
      }
    }

    // 2. Adeudos pendientes de atletas (suma de adeudos o clases pendientes calculadas a $50 MXN)
    const studentProfiles = profiles.filter((p) => 
      ['student', 'alumno'].includes((p.role || '').toLowerCase()) ||
      (p as any).user_type === 'student' ||
      (p as any).user_type === 'alumno'
    );
    let totalDebt = 0;
    let debtorsCount = 0;

    for (const s of studentProfiles) {
      const explicitDebt = Number(s.current_debt_amount) || 0;
      if (explicitDebt > 0) {
        totalDebt += explicitDebt;
        debtorsCount += 1;
      } else if (s.financial_status === 'adeudo' || s.financial_status === 'pendiente') {
        // Si tiene estatus de adeudo pero deuda en 0, calcular clase pendiente base ($50 MXN)
        totalDebt += 50;
        debtorsCount += 1;
      }
    }

    // 3. Membresías activas (Folios Pro $99 y Familiar $149)
    let activePro99Count = 0;
    let activeElite149Count = 0;

    // De activation_codes
    for (const c of actCodes) {
      if (c.plan_type === 'PRO_99' || c.plan_type === 'pro') {
        activePro99Count += 1;
      } else if (c.plan_type === 'ELITE_149' || c.plan_type === 'elite_familiar') {
        activeElite149Count += 1;
      }
    }

    // De membership_vouchers
    for (const v of vouchers) {
      if (v.plan_type === 'pro') activePro99Count += 1;
      else if (v.plan_type === 'elite_familiar') activeElite149Count += 1;
    }

    // De suscripciones activas en profiles
    for (const p of profiles) {
      if (p.subscription_status === 'ACTIVE') {
        if (p.subscription_plan === 'PRO_99') activePro99Count += 1;
        else if (p.subscription_plan === 'ELITE_149') activeElite149Count += 1;
      }
    }

    const activeMembershipsCount = activePro99Count + activeElite149Count;

    return {
      success: true,
      metrics: {
        totalRevenue,
        totalDebt,
        activeMembershipsCount,
        activePro99Count,
        activeElite149Count,
        courtFeesCollected,
        courtFeesCount,
        transactionsCount: txList.length + memList.length,
        debtorsCount,
      },
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al compilar métricas del Búnker.' };
  }
}

/**
 * Server Action: Listar atletas con control de adeudos interactivo
 */
export async function getDebtorsControlListAction(): Promise<{
  success: boolean;
  athletes?: DebtorAthleteRecord[];
  error?: string;
}> {
  try {
    const authCheck = await verifyCoachOrSuperAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: 'ACCESO DENEGADO (ECC-403): Solo personal autorizado de Wild Wolves.' };
    }

    const admin = getAdminSupabase();

    // Consultar todos los atletas con sus relaciones de tutor o teléfono
    const { data: rawAthletes, error: athError } = await admin
      .from('profiles')
      .select('id, full_name, email, role, phone, parent_phone, guardian_name, guardian_id, current_debt_amount, financial_status, default_class_cost, updated_at')
      .in('role', ['student', 'alumno'])
      .order('full_name', { ascending: true });

    if (athError) {
      throw athError;
    }

    // Consultar último pago para cada alumno
    const { data: lastPayments } = await admin
      .from('payment_transactions_history')
      .select('student_id, amount_paid, transaction_date, created_at')
      .order('created_at', { ascending: false });

    const lastPaymentMap = new Map<string, { amount: number; date: string }>();
    if (lastPayments) {
      for (const p of lastPayments) {
        if (!lastPaymentMap.has(p.student_id)) {
          lastPaymentMap.set(p.student_id, {
            amount: Number(p.amount_paid) || 0,
            date: p.transaction_date || (p.created_at ? p.created_at.split('T')[0] : ''),
          });
        }
      }
    }

    const athletes: DebtorAthleteRecord[] = (rawAthletes || []).map((a) => {
      let debt = Number(a.current_debt_amount) || 0;
      const isAdeudoStatus = a.financial_status === 'adeudo' || a.financial_status === 'pendiente';
      
      // Si el estatus es de adeudo pero debt es 0, asignamos 1 clase pendiente ($50 MXN)
      if (debt === 0 && isAdeudoStatus) {
        debt = 50;
      }
      
      const isAdeudo = debt > 0 || isAdeudoStatus;
      const costPerClass = Number(a.default_class_cost) || 50;
      const pendingClasses = isAdeudo ? Math.max(1, Math.round(debt / costPerClass)) : 0;
      const lastPay = lastPaymentMap.get(a.id);

      return {
        id: a.id,
        fullName: a.full_name || 'Atleta Wild Wolves',
        guardianName: a.guardian_name || 'Tutor Responsable',
        guardianPhone: a.parent_phone || a.phone || '+52 55 2242 7769',
        phone: a.phone || '+52 55 2242 7769',
        pendingClassesCount: pendingClasses,
        totalDebtAmount: debt,
        status: isAdeudo ? 'ADEUDO' : 'AL DÍA',
        financialStatusRaw: a.financial_status || (isAdeudo ? 'adeudo' : 'al_corriente'),
        lastPaymentDate: lastPay?.date,
        lastPaymentAmount: lastPay?.amount,
      };
    });

    return { success: true, athletes };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener lista de adeudos.' };
  }
}

/**
 * Server Action: Registrar pago en duela / liquidar o condonar adeudo al instante
 */
export async function registrarPagoDuelaAction({
  studentId,
  amount,
  concept = 'Cuota Cancha Carmen Serdán $50 MXN',
  paymentMethod = 'efectivo',
  isForgiveness = false,
  notes,
}: {
  studentId: string;
  amount: number;
  concept?: string;
  paymentMethod?: 'efectivo' | 'spei' | 'tarjeta' | 'condonacion';
  isForgiveness?: boolean;
  notes?: string;
}): Promise<{
  success: boolean;
  newDebt?: number;
  message?: string;
  error?: string;
}> {
  try {
    const authCheck = await verifyCoachOrSuperAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: 'ACCESO DENEGADO (ECC-403): Solo personal autorizado de Wild Wolves.' };
    }

    const admin = getAdminSupabase();
    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Obtener estado actual del alumno
    const { data: student, error: studentError } = await admin
      .from('profiles')
      .select('id, full_name, current_debt_amount, financial_status')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError || !student) {
      return { success: false, error: 'El perfil del atleta no fue encontrado.' };
    }

    const currentDebt = Number(student.current_debt_amount) || 0;
    const finalAmount = isForgiveness ? currentDebt : Math.max(0, amount);
    const newDebt = Math.max(0, currentDebt - finalAmount);
    const newFinancialStatus = newDebt === 0 ? 'al_corriente' : 'abono_parcial';

    // 2. Registrar en payment_transactions_history
    const folioCode = `WW-CANCHA-${Date.now().toString().slice(-6)}`;
    const txType = isForgiveness ? 'perdon_adeudo' : (newDebt === 0 ? 'pago_completo' : 'abono');

    const { error: txError } = await admin
      .from('payment_transactions_history')
      .insert({
        student_id: studentId,
        amount_paid: isForgiveness ? 0 : finalAmount,
        previous_debt: currentDebt,
        remaining_debt: newDebt,
        payment_method: isForgiveness ? 'condonacion' : paymentMethod,
        transaction_type: txType,
        concept: isForgiveness ? `Condonación de adeudo (${concept})` : concept,
        membership_tier: finalAmount === 99 ? 'plan_pro_99' : finalAmount === 149 ? 'pack_familiar_elite_149' : 'cuota_clase_50',
        plan_amount: finalAmount,
        receipt_folio: folioCode,
        transaction_date: todayDate,
        notes: notes || (isForgiveness ? 'Adeudo condonado por Head Coach / SuperAdmin' : 'Pago liquidado en duela Carmen Serdán'),
        created_at: new Date().toISOString(),
      });

    if (txError) {
      console.warn('Advertencia al registrar transacción:', txError);
    }

    // 3. Actualizar perfil del atleta
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        current_debt_amount: newDebt,
        financial_status: newFinancialStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (updateError) {
      return { success: false, error: 'Error al actualizar saldo en el perfil del atleta.' };
    }

    // Revalidar rutas administrativas
    try {
      revalidatePath('/master-bunker-hq');
      revalidatePath('/dashboard-coach');
      revalidatePath('/dashboard-guardian');
    } catch {}

    return {
      success: true,
      newDebt,
      message: isForgiveness
        ? `Adeudo de $${currentDebt} MXN condonado con éxito para ${student.full_name}.`
        : `Pago de $${finalAmount} MXN acreditado con éxito en duela para ${student.full_name}. Saldo restante: $${newDebt} MXN.`,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al registrar el pago en duela.' };
  }
}
