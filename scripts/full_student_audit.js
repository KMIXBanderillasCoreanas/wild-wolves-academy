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

async function fullAudit() {
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, role, current_tier, current_debt_amount, financial_status')
    .eq('role', 'student');

  console.log('=== ALUMNOS EN PROFILES ===');
  for (const s of students) {
    const { data: dtr } = await supabase
      .from('detailed_test_records')
      .select('*')
      .eq('student_id', s.id)
      .order('evaluation_date', { ascending: false });

    const { data: bsl } = await supabase
      .from('basketball_skills_logs')
      .select('*')
      .eq('student_id', s.id)
      .order('test_date', { ascending: false });

    const { data: badges } = await supabase
      .from('student_earned_badges')
      .select('badge_name, badge_tier')
      .eq('student_id', s.id);

    console.log(`\n🐺 ATLETA: ${s.full_name} (ID: ${s.id})`);
    console.log(`   Tier: ${s.current_tier} | Estado Financiero: ${s.financial_status} ($${s.current_debt_amount})`);
    console.log(`   Insignias Ganadas (${badges ? badges.length : 0}):`, badges ? badges.map(b => `${b.badge_name} (${b.badge_tier})`).join(', ') : 'Ninguna');
    
    if (dtr && dtr.length > 0) {
      console.log(`   Pruebas en detailed_test_records (${dtr.length}):`);
      dtr.forEach(t => {
        console.log(`     - [${t.evaluation_date}] OVR: ${t.overall_ovr} | Libres: ${t.short_range_shots_made}/10 | Media: ${t.mid_range_shots_made}/20 | Triples: ${t.three_point_shots_made}/25 | Cuerda: ${t.jump_rope_count} | Feedback: "${t.coach_feedback}"`);
      });
    } else {
      console.log('   Sin pruebas en detailed_test_records.');
    }
  }
}

fullAudit();
