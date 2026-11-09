'use server';

import { createClient, getAdminSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registrarPagoEnEfectivoAction(studentId: string, montoPagado: number) {
  // Inicializamos el cliente Supabase del servidor y administrador
  const supabase = createClient();
  const adminDb = getAdminSupabase();

  try {
    // 1. Obtener el perfil y adeudo actual del alumno
    const { data: student, error: fetchError } = await adminDb
      .from('profiles')
      .select('current_debt_amount, full_name, financial_status')
      .eq('id', studentId)
      .maybeSingle();

    if (fetchError || !student) {
      throw new Error('No se encontró el perfil del alumno.');
    }

    const currentDebt = Number(student.current_debt_amount) || 0;
    const newDebt = Math.max(0, currentDebt - montoPagado);
    const newStatus = newDebt === 0 ? 'al_corriente' : 'abono_parcial';

    // 2. Actualizar el nuevo adeudo en la tabla profiles
    const { error: updateError } = await adminDb
      .from('profiles')
      .update({ 
        current_debt_amount: newDebt,
        financial_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (updateError) {
      throw updateError;
    }

    // 3. Registrar la transacción en el historial de pagos y conciliación híbrida
    const todayDate = new Date().toISOString().split('T')[0];
    const receiptFolio = `WW-EFECTIVO-${Date.now().toString().slice(-6)}`;
    const txConcept = `Pago en efectivo registrado en duela por $${montoPagado} MXN`;

    await adminDb.from('payment_transactions_history').insert({
      student_id: studentId,
      amount_paid: montoPagado,
      previous_debt: currentDebt,
      remaining_debt: newDebt,
      payment_method: 'efectivo_duela',
      transaction_type: newDebt === 0 ? 'pago_completo' : 'abono',
      concept: txConcept,
      receipt_folio: receiptFolio,
      transaction_date: todayDate,
      venue: 'Deportivo Carmen Serdán',
      notes: txConcept,
      created_at: new Date().toISOString()
    });

    // 4. Revalidar la ruta del Búnker Central para reflejar el cambio al instante
    try {
      revalidatePath('/master-bunker-hq');
      revalidatePath('/dashboard-coach');
      revalidatePath('/dashboard-guardian');
    } catch {}

    return { 
      success: true, 
      message: `Pago de $${montoPagado} MXN registrado con éxito en duela para ${student.full_name}. Nuevo adeudo: $${newDebt} MXN.` 
    };
  } catch (error: any) {
    console.error('Error al registrar pago en efectivo:', error);
    return { success: false, message: error.message || 'Error al procesar el pago.' };
  }
}
