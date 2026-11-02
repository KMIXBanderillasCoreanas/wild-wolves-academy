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

async function checkSampleRow() {
  const { data: bsl } = await supabase.from('basketball_skills_logs').select('*').limit(1);
  console.log('basketball_skills_logs cols:', bsl ? Object.keys(bsl[0]) : 'empty');
  const { data: ptl } = await supabase.from('physical_training_logs').select('*').limit(1);
  console.log('physical_training_logs cols:', ptl ? Object.keys(ptl[0]) : 'empty');
  const { data: dtr } = await supabase.from('detailed_test_records').select('*').limit(1);
  console.log('detailed_test_records cols:', dtr ? Object.keys(dtr[0]) : 'empty');
  const { data: prof } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles cols:', prof ? Object.keys(prof[0]) : 'empty');
}
checkSampleRow();
