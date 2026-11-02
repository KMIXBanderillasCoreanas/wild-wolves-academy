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

async function checkAnonPermissions() {
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const testId = '4bcc9509-e51d-4372-a0d9-c304bc6c2845';
  
  console.log('--- PROBANDO PERMISOS ANÓNIMOS (CLIENTE REACT SIN TOKEN SERVICE ROLE) ---');
  
  const { data: bslData, error: bslError } = await anonClient.from('basketball_skills_logs').insert({
    student_id: testId,
    test_date: '2026-10-28',
    shooting_base_attempts: 10,
    free_throws_made: 5
  }).select();
  console.log('Insert basketball_skills_logs (Anon):', bslData, bslError);

  const { data: baseData, error: baseError } = await anonClient.from('student_initial_baseline').upsert({
    student_id: testId,
    entry_date: '2026-10-28',
    initial_jump_rope_max: 50
  }, { onConflict: 'student_id' }).select();
  console.log('Upsert student_initial_baseline (Anon):', baseData, baseError);

  const { data: dtrData, error: dtrError } = await anonClient.from('detailed_test_records').insert({
    student_id: testId,
    evaluation_date: '2026-10-28',
    athletic_level_assessed: 'competitivo_elite',
    overall_ovr: 75
  }).select();
  console.log('Insert detailed_test_records (Anon):', dtrData, dtrError);
}

checkAnonPermissions();
