const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
env.split('\n').forEach(line => {
  const parts = line.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  if (k === 'NEXT_PUBLIC_SUPABASE_URL') url = v;
  if (k === 'SUPABASE_SERVICE_ROLE_KEY') key = v;
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function injectOfficialTests() {
  console.log('--- 1. BUSCANDO ATLETAS JESÚS E ISAAC EN SUPABASE ---');
  const { data: athletes, error: aErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, current_tier')
    .in('full_name', ['Jesús', 'Isaac']);

  if (aErr) console.error('Error al buscar atletas:', aErr);
  console.log('Atletas encontrados:', athletes);

  const jesus = athletes?.find(a => a.full_name === 'Jesús');
  const isaac = athletes?.find(a => a.full_name === 'Isaac');

  if (!jesus || !isaac) {
    console.error('No se encontraron los perfiles requeridos.');
    return;
  }

  console.log('--- 2. ACTUALIZANDO ROLES/TIER ---');
  await supabase.from('profiles').update({
    current_tier: 'iniciacion_adaptacion'
  }).eq('id', jesus.id);

  await supabase.from('profiles').update({
    current_tier: 'iniciacion_adaptacion'
  }).eq('id', isaac.id);

  const todayStr = '2026-11-10';

  // 1. Inserción Jesús:
  // OVR 52, 24% efectividad, 1,000 saltos de cuerda, 11.03s en circuito, 40cm salto vertical
  console.log('--- 3. INSERTANDO EVALUACIÓN DE JESÚS ---');
  const jesusDtr = {
    student_id: jesus.id,
    evaluation_date: todayStr,
    athletic_level_assessed: 'iniciacion_adaptacion',
    court_laps_count: 10,
    squats_count: 50,
    pushups_count: 25,
    plank_seconds: 45,
    jump_rope_count: 1000,
    short_range_shots_made: 4,
    mid_range_shots_made: 5,
    three_point_shots_made: 3,
    half_court_shots_made: 0,
    overall_ovr: 52,
    coach_feedback: 'Evaluación Oficial Duela: OVR 52, 24% efectividad (12/50), 1000 saltos de cuerda, 11.03s circuito, 40cm salto vertical.'
  };

  const { error: jErr } = await supabase
    .from('detailed_test_records')
    .upsert(jesusDtr, { onConflict: 'student_id,evaluation_date' });
  if (jErr) console.error('Error guardando DTR Jesús:', jErr);
  else console.log('DTR Jesús guardado con éxito.');

  // Registro en basketball_skills_logs
  const { error: jSkillErr } = await supabase.from('basketball_skills_logs').upsert({
    student_id: jesus.id,
    test_date: todayStr,
    is_shooting_active: true,
    is_speed_lines_active: true,
    is_flight_active: true,
    shooting_base_attempts: 50,
    free_throws_made: 4,
    mid_range_made: 5,
    three_point_made: 3,
    jump_rope_count: 1000,
    sprint_100m_seconds: 11.03,
    lines_round_trip_seconds: 11.03,
    vertical_jump_cm: 40,
    three_corner_left: 1,
    three_wing_left: 1,
    three_top: 1,
    three_wing_right: 0,
    three_corner_right: 0
  });
  if (jSkillErr) console.error('Error basketball_skills_logs Jesús:', jSkillErr);
  else console.log('basketball_skills_logs Jesús guardado.');

  // 2. Inserción Isaac:
  // OVR 50, 16% efectividad, 200 saltos de cuerda, 12.92s en circuito, 18cm salto vertical
  console.log('--- 4. INSERTANDO EVALUACIÓN DE ISAAC ---');
  const isaacDtr = {
    student_id: isaac.id,
    evaluation_date: todayStr,
    athletic_level_assessed: 'iniciacion_adaptacion',
    court_laps_count: 10,
    squats_count: 35,
    pushups_count: 15,
    plank_seconds: 30,
    jump_rope_count: 200,
    short_range_shots_made: 3,
    mid_range_shots_made: 3,
    three_point_shots_made: 2,
    half_court_shots_made: 0,
    overall_ovr: 50,
    coach_feedback: 'Evaluación Oficial Duela: OVR 50, 16% efectividad (8/50), 200 saltos de cuerda, 12.92s circuito, 18cm salto vertical.'
  };

  const { error: iErr } = await supabase
    .from('detailed_test_records')
    .upsert(isaacDtr, { onConflict: 'student_id,evaluation_date' });
  if (iErr) console.error('Error guardando DTR Isaac:', iErr);
  else console.log('DTR Isaac guardado con éxito.');

  // Registro en basketball_skills_logs
  const { error: iSkillErr } = await supabase.from('basketball_skills_logs').upsert({
    student_id: isaac.id,
    test_date: todayStr,
    is_shooting_active: true,
    is_speed_lines_active: true,
    is_flight_active: true,
    shooting_base_attempts: 50,
    free_throws_made: 3,
    mid_range_made: 3,
    three_point_made: 2,
    jump_rope_count: 200,
    sprint_100m_seconds: 12.92,
    lines_round_trip_seconds: 12.92,
    vertical_jump_cm: 18,
    three_corner_left: 1,
    three_wing_left: 0,
    three_top: 1,
    three_wing_right: 0,
    three_corner_right: 0
  });
  if (iSkillErr) console.error('Error basketball_skills_logs Isaac:', iSkillErr);
  else console.log('basketball_skills_logs Isaac guardado.');

  // Limpieza total de Bruno
  console.log('--- 5. LIMPIEZA DE CUALQUIER REGISTRO DE BRUNO EN SUPABASE ---');
  const { data: brunoProfiles } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', '%bruno%');

  if (brunoProfiles && brunoProfiles.length > 0) {
    for (const bp of brunoProfiles) {
      await supabase.from('detailed_test_records').delete().eq('student_id', bp.id);
      await supabase.from('basketball_skills_logs').delete().eq('student_id', bp.id);
      await supabase.from('physical_training_logs').delete().eq('student_id', bp.id);
      await supabase.from('daily_attendance').delete().eq('student_id', bp.id);
      await supabase.from('profiles').delete().eq('id', bp.id);
      console.log('Perfil y registros de Bruno purgados con id:', bp.id);
    }
  } else {
    console.log('No se encontraron perfiles de Bruno en la BD Supabase.');
  }

  console.log('--- INYECCIÓN OFICIAL COMPLETADA EXITOSAMENTE ---');
}

injectOfficialTests();
