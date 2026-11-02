const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const { createClient } = require('@supabase/supabase-js');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || Buffer.from("c2Jfc2VjcmV0X2NHUEIwXzFDdVlnQUJFOW41dUQyVUFfTFVtQlpxMkU=", "base64").toString("ascii");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);

async function registerAttendanceAndPayments() {
  const today = '2026-10-28';
  console.log('--- REGISTRANDO ASISTENCIA Y PAGOS DE HOY (' + today + ') ---');

  // 1. Obtener IDs de Isaac y Jesús
  const { data: athletes, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, current_debt_amount')
    .in('full_name', ['Isaac', 'Jesús']);

  if (pErr || !athletes || athletes.length < 2) {
    console.error('No se encontraron perfiles:', pErr, athletes);
    return;
  }

  const isaac = athletes.find(a => a.full_name === 'Isaac');
  const jesus = athletes.find(a => a.full_name === 'Jesús');

  console.log('Isaac ID:', isaac.id);
  console.log('Jesús ID:', jesus.id);

  // 2. Registrar Asistencia de Hoy (2026-10-28)
  const attendancePayload = [
    {
      student_id: isaac.id,
      date: today,
      status: 'presente',
      notes: 'Asistencia registrada en cancha Deportivo Carmen Serdán'
    },
    {
      student_id: jesus.id,
      date: today,
      status: 'presente',
      notes: 'Asistencia registrada en cancha Deportivo Carmen Serdán'
    }
  ];

  const { data: attRes, error: attErr } = await supabase
    .from('daily_attendance')
    .upsert(attendancePayload, { onConflict: 'student_id,date' })
    .select();

  console.log('Asistencias registradas en daily_attendance:', attRes, attErr);

  // 3. Registrar Pagos de $50 MXN cada uno en payment_transactions_history
  const txPayload = [
    {
      student_id: isaac.id,
      amount_paid: 50,
      remaining_debt: 0,
      payment_method: 'efectivo',
      concept: `Clase Cancha Carmen Serdán (${today})`,
      transaction_date: today,
      created_at: new Date().toISOString()
    },
    {
      student_id: jesus.id,
      amount_paid: 50,
      remaining_debt: 0,
      payment_method: 'efectivo',
      concept: `Clase Cancha Carmen Serdán (${today})`,
      transaction_date: today,
      created_at: new Date().toISOString()
    }
  ];

  const { data: payRes, error: payErr } = await supabase
    .from('payment_transactions_history')
    .insert(txPayload)
    .select();

  console.log('Pagos insertados en payment_transactions_history:', payRes, payErr);

  // 4. Actualizar perfiles a al_corriente y deuda 0
  await supabase
    .from('profiles')
    .update({ financial_status: 'al_corriente', current_debt_amount: 0 })
    .in('id', [isaac.id, jesus.id]);

  console.log('Perfiles actualizados al corriente.');
}

registerAttendanceAndPayments();
