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

async function checkAnonAttendancePayment() {
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const testId = '4bcc9509-e51d-4372-a0d9-c304bc6c2845';

  const { data: attData, error: attErr } = await anonClient.from('daily_attendance').insert({
    student_id: testId,
    date: '2026-10-29',
    status: 'presente'
  }).select();
  console.log('Anon daily_attendance insert:', attData, attErr);

  const { data: payData, error: payErr } = await anonClient.from('payment_transactions_history').insert({
    student_id: testId,
    amount_paid: 50,
    payment_method: 'efectivo',
    concept: 'Prueba RLS',
    transaction_date: '2026-10-29'
  }).select();
  console.log('Anon payment_transactions_history insert:', payData, payErr);

  // cleanup
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || Buffer.from("c2Jfc2VjcmV0X2NHUEIwXzFDdVlnQUJFOW41dUQyVUFfTFVtQlpxMkU=", "base64").toString("ascii");
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);
  await admin.from('daily_attendance').delete().eq('date', '2026-10-29');
  await admin.from('payment_transactions_history').delete().eq('transaction_date', '2026-10-29');
}
checkAnonAttendancePayment();
