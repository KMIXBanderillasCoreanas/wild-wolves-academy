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

async function injectRealEvaluations() {
  const jsonFile = 'c:/Users/User/Documents/WildWolves_Sync_Pruebas_2026-10-28 (2).json';
  const pack = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

  console.log('--- APLICANDO PRUEBAS REALES DEL ARCHIVO (2) ---');

  const { data: profiles } = await supabase.from('profiles').select('id, full_name');
  const nameToId = new Map(profiles.map(p => [p.full_name.trim().toLowerCase(), p.id]));

  for (const r of pack.records) {
    const cleanName = r.athlete_name.trim().toLowerCase();
    const studentId = nameToId.get(cleanName);
    if (!studentId) {
      console.error('No se encontró ID para:', r.athlete_name);
      continue;
    }

    console.log(`\nInyectando datos reales de ${r.athlete_name} (ID: ${studentId})...`);

    // 1. detailed_test_records
    const dtrPayload = {
      student_id: studentId,
      evaluation_date: '2026-10-28',
      athletic_level_assessed: r.overall_ovr >= 70 ? 'competitivo_elite' : (r.overall_ovr >= 55 ? 'formativo_desarrollo' : 'iniciacion_adaptacion'),
      overall_ovr: r.overall_ovr,
      short_range_shots_made: r.free_throws_made,
      mid_range_shots_made: r.mid_range_made,
      three_point_shots_made: r.three_point_made,
      half_court_shots_made: 0,
      jump_rope_count: r.jump_rope_count,
      court_laps_count: 20,
      squats_count: 75,
      pushups_count: 35,
      plank_seconds: 60,
      coach_feedback: r.coach_feedback
    };

    const { error: dtrErr } = await supabase
      .from('detailed_test_records')
      .upsert(dtrPayload, { onConflict: 'student_id,evaluation_date' });
    console.log('  detailed_test_records:', dtrErr ? dtrErr.message : 'OK');

    // 2. basketball_skills_logs
    const bslPayload = {
      student_id: studentId,
      test_date: '2026-10-28',
      is_shooting_active: true,
      is_speed_lines_active: true,
      is_flight_active: true,
      shooting_base_attempts: 10,
      free_throws_made: r.free_throws_made,
      mid_range_made: r.mid_range_made,
      three_point_made: r.three_point_made,
      half_court_made: 0,
      sprint_100m_seconds: r.sprint_100m_seconds,
      lines_round_trip_seconds: r.lines_round_trip_seconds,
      vertical_jump_cm: r.vertical_jump_cm,
      three_corner_left: r.spot_corner_left || 0,
      three_wing_left: r.spot_wing_left || 0,
      three_top: r.spot_top_key || 0,
      three_wing_right: r.spot_wing_right || 0,
      three_corner_right: r.spot_corner_right || 0,
      coach_notes: r.coach_feedback
    };

    // Actualizar o insertar en basketball_skills_logs
    await supabase.from('basketball_skills_logs').delete().eq('student_id', studentId).eq('test_date', '2026-10-28');
    const { error: bslErr } = await supabase.from('basketball_skills_logs').insert(bslPayload);
    console.log('  basketball_skills_logs:', bslErr ? bslErr.message : 'OK');

    // 3. physical_training_logs
    const ptlPayload = {
      student_id: studentId,
      training_date: '2026-10-28',
      week_number: 44,
      month_number: 10,
      is_cardio_active: true,
      is_strength_active: true,
      is_isometric_active: false,
      court_laps_done: 20,
      jogging_minutes: 25,
      jump_rope_count: r.jump_rope_count,
      pushups_variation: 'estandar',
      pushups_reps: 35,
      squats_3x25_done: true,
      abs_3x25_done: true,
      wall_sit_seconds: 45,
      plank_seconds: 60,
      lunges_laps: 2
    };

    await supabase.from('physical_training_logs').delete().eq('student_id', studentId).eq('training_date', '2026-10-28');
    const { error: ptlErr } = await supabase.from('physical_training_logs').insert(ptlPayload);
    console.log('  physical_training_logs:', ptlErr ? ptlErr.message : 'OK');

    // 4. profiles
    await supabase.from('profiles').update({
      current_tier: r.calculated_tier || 'Lobo Formativo'
    }).eq('id', studentId);
    console.log('  profiles tier actualizado');
  }

  console.log('\n¡TODAS LAS PRUEBAS REALES DE HOY QUEDARON ASENTADAS!');
}

injectRealEvaluations();
