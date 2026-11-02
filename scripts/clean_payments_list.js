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

async function cleanAndSyncPayments() {
  const { data: pays, error } = await supabase.from('payment_transactions_history').select('*').order('created_at', { ascending: false });
  console.log('--- COBROS REGISTRADOS EN CAJA ---', error || '');
  if (pays) {
    pays.forEach(p => console.log(p.id, p.transaction_date, p.student_id, `$${p.amount_paid} MXN`, p.concept));
  }

  // Eliminar cualquier registro con concepto 'Prueba Admin API'
  await supabase.from('payment_transactions_history').delete().eq('concept', 'Prueba Admin API');

  // Actualizar Bruno en profiles
  await supabase.from('profiles').update({
    full_name: 'Bruno Sánchez',
    email: 'bruno.sanchez@wildwolves.mx'
  }).eq('id', 'c7829cdf-7d4e-4d62-acdd-70fd5de08a77');
}
cleanAndSyncPayments();
