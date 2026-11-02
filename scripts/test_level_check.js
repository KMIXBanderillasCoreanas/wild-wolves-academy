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

async function testLevelCheck() {
  const levels = [
    'iniciacion_adaptacion',
    'formativo_desarrollo',
    'competitivo_elite',
    'intermedio',
    'avanzado',
    'principiante',
    'elite'
  ];
  const { data: bruno } = await supabase.from('profiles').select('id').eq('full_name', 'Bruno Díaz').single();

  for (const lvl of levels) {
    const { error } = await supabase.from('detailed_test_records').insert({
      student_id: bruno.id,
      evaluation_date: '2026-10-01',
      athletic_level_assessed: lvl,
      overall_ovr: 70
    });
    console.log(`Testing level '${lvl}':`, error ? error.message : 'ACCEPTED!');
    if (!error) {
      await supabase.from('detailed_test_records').delete().eq('student_id', bruno.id).eq('evaluation_date', '2026-10-01');
    }
  }
}
testLevelCheck();
