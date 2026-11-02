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
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Connecting to:', env.NEXT_PUBLIC_SUPABASE_URL);
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, full_name, role, current_debt_amount');
  if (pErr) console.error('Error fetching profiles:', pErr);
  else {
    console.log('Profiles found:', profiles.length);
    console.log(profiles.map(p => ({ id: p.id, name: p.full_name, role: p.role, debt: p.current_debt_amount })));
  }

  // Check attendance records for today
  const today = '2026-10-28';
  const yesterday = '2026-10-27';
  const { data: attendance, error: aErr } = await supabase.from('attendance_records').select('*').in('date', [yesterday, today]);
  console.log('Attendance:', attendance, aErr);

  // Check payments
  const { data: payments, error: payErr } = await supabase.from('payment_transactions_history').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('Recent payments:', payments, payErr);

  // Check detailed_test_records
  const { data: tests, error: tErr } = await supabase.from('detailed_test_records').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('Recent detailed_test_records:', tests, tErr);
}
check();
