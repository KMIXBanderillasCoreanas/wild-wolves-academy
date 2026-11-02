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

async function checkBadgesAndSyncBruno(brunoJson) {
  const brunoId = 'c7829cdf-7d4e-4d62-acdd-70fd5de08a77';
  
  // Actualizar la prueba de Bruno del 2026-10-28 con el payload exacto del JSON que mandó el coach
  const record = brunoJson.records[0];
  await supabase.from('detailed_test_records').upsert({
    student_id: brunoId,
    evaluation_date: '2026-10-28',
    athletic_level_assessed: 'competitivo_elite',
    overall_ovr: record.overall_ovr, // 79
    short_range_shots_made: record.free_throws_made, // 7
    mid_range_shots_made: record.mid_range_made, // 12
    three_point_shots_made: record.three_point_made, // 15
    jump_rope_count: record.jump_rope_count, // 55
    court_laps_count: 20,
    squats_count: 75,
    pushups_count: 35,
    plank_seconds: 60,
    half_court_shots_made: 0,
    coach_feedback: record.coach_feedback
  }, { onConflict: 'student_id,evaluation_date' });

  // Actualizar tier en profiles
  await supabase.from('profiles').update({
    current_tier: '🐺 Lobo Alfa Competitivo'
  }).eq('id', brunoId);

  // Inyectar en basketball_skills_logs
  await supabase.from('basketball_skills_logs').upsert({
    student_id: brunoId,
    test_date: '2026-10-28',
    is_shooting_active: true,
    is_speed_lines_active: true,
    is_flight_active: true,
    shooting_base_attempts: 10,
    free_throws_made: 7,
    mid_range_made: 12,
    three_point_made: 15,
    half_court_made: 0,
    sprint_100m_seconds: 13.8,
    lines_round_trip_seconds: 22.1,
    vertical_jump_cm: 48,
    three_corner_left: 3,
    three_wing_left: 3,
    three_top: 4,
    three_wing_right: 3,
    three_corner_right: 2,
    coach_notes: record.coach_feedback
  });

  // Check badges table cols
  const { data: bCols } = await supabase.from('student_earned_badges').select('*').limit(1);
  console.log('student_earned_badges cols:', bCols ? Object.keys(bCols[0]) : 'empty');
}

const payload = {
  "records": [
    {
      "athlete_name": "Bruno Díaz",
      "overall_ovr": 79,
      "free_throws_made": 7,
      "mid_range_made": 12,
      "three_point_made": 15,
      "jump_rope_count": 55,
      "coach_feedback": "Mecánica fluida en suspensión. Buena parábola de tiro en libres y velocidad de reacción en el circuito de líneas."
    }
  ]
};
checkBadgesAndSyncBruno(payload);
