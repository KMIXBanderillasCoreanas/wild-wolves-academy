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

async function inspectStudents() {
  const { data: athletes, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, current_tier, current_debt_amount, financial_status')
    .in('full_name', ['Isaac', 'Jesús', 'Bruno Díaz', 'Osmar']);
  console.log('Athletes in DB:', athletes, error);

  // Check their tests
  if (athletes && athletes.length > 0) {
    for (const a of athletes) {
      const { data: dtr } = await supabase.from('detailed_test_records').select('*').eq('student_id', a.id);
      const { data: bsl } = await supabase.from('basketball_skills_logs').select('*').eq('student_id', a.id);
      const { data: ptl } = await supabase.from('physical_training_logs').select('*').eq('student_id', a.id);
      console.log(`=== ${a.full_name} (${a.id}) ===`);
      console.log('  detailed_test_records:', dtr ? dtr.length : 0);
      console.log('  basketball_skills_logs:', bsl ? bsl.length : 0);
      console.log('  physical_training_logs:', ptl ? ptl.length : 0);
    }
  }
}
inspectStudents();
