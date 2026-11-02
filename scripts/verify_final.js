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

async function checkFinal() {
  const { data: dtr, error: dtrErr } = await supabase.from('detailed_test_records').select('*').order('created_at', { ascending: false }).limit(6);
  console.log('--- RECENT DETAILED TEST RECORDS ---', dtrErr || '');
  if (dtr) dtr.forEach(r => console.log(r.student_id, r.evaluation_date, 'OVR:', r.overall_ovr, 'TL:', r.short_range_shots_made, '3PT:', r.three_point_shots_made, r.athletic_level_assessed));

  const { data: bsl, error: bslErr } = await supabase.from('basketball_skills_logs').select('*').order('created_at', { ascending: false }).limit(6);
  console.log('--- RECENT BASKETBALL SKILLS LOGS ---', bslErr || '');
  if (bsl) bsl.forEach(r => console.log(r.student_id, r.test_date, 'TL:', r.free_throws_made, '3PT:', r.three_point_made));

  const { data: att, error: attErr } = await supabase.from('daily_attendance').select('*').eq('date', '2026-10-28');
  console.log('--- TODAY ATTENDANCE (2026-10-28) ---', attErr || '');
  if (att) att.forEach(r => console.log(r.student_id, r.date, r.status));

  const { data: pay, error: payErr } = await supabase.from('payment_transactions_history').select('*').eq('transaction_date', '2026-10-28');
  console.log('--- TODAY PAYMENTS (2026-10-28) ---', payErr || '');
  if (pay) pay.forEach(r => console.log(r.student_id, r.amount_paid, r.payment_method, r.concept));
}
checkFinal();
