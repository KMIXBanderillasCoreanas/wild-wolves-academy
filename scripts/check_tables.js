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
  const tables = [
    'daily_attendance',
    'payment_transactions_history',
    'profiles',
    'detailed_test_records',
    'basketball_skills_logs',
    'physical_training_logs',
    'student_earned_badges'
  ];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(5);
    console.log(`Table [${t}]:`, error ? `ERROR: ${error.message}` : `OK (${data ? data.length : 0} rows)`);
    if (data && data.length > 0 && t === 'daily_attendance') {
      console.log('Sample daily_attendance:', data);
    }
  }

  // Specifically check Isaac and Jesus in daily_attendance
  const { data: da, error: daErr } = await supabase.from('daily_attendance').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('Recent daily_attendance rows:', da);
}
check();
