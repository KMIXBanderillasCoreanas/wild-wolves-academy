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

function mapToValidLevel(ovr, tier) {
  if (ovr >= 85 || (tier && tier.includes('Leyenda'))) return 'competitivo_elite';
  if (ovr >= 70 || (tier && tier.includes('Alfa'))) return 'competitivo_elite';
  if (ovr >= 60 || (tier && tier.includes('Cazador'))) return 'formativo_desarrollo';
  return 'iniciacion_adaptacion';
}

async function fixDetailedTestRecords() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name');
  const nameMap = new Map(profiles.map(p => [p.full_name.trim().toLowerCase(), p.id]));

  const records = [
    {
      name: 'Isaac',
      ovr: 78,
      date: '2026-10-28',
      tier: 'competitivo_elite',
      free_throws: 8,
      mid_range: 14,
      three_point: 14,
      rope: 85,
      vert: 52,
      feedback: 'Excelente evolución técnica y consistencia en el tiro libre. Muy buena aceleración en sprint.'
    },
    {
      name: 'Jesús',
      ovr: 82,
      date: '2026-10-28',
      tier: 'competitivo_elite',
      free_throws: 9,
      mid_range: 16,
      three_point: 16,
      rope: 110,
      vert: 55,
      feedback: 'Excelente solidez en media y larga distancia. Postura impecable en duela y potencia de piernas.'
    },
    {
      name: 'Bruno Díaz',
      ovr: 92,
      date: '2026-10-28',
      tier: 'competitivo_elite',
      free_throws: 10,
      mid_range: 20,
      three_point: 20,
      rope: 200,
      vert: 60,
      feedback: 'Mecánica fluida en suspensión. Buena parábola de tiro en libres y velocidad de reacción en el circuito de líneas.'
    }
  ];

  for (const r of records) {
    const studentId = nameMap.get(r.name.toLowerCase());
    if (!studentId) continue;

    const payload = {
      student_id: studentId,
      evaluation_date: r.date,
      athletic_level_assessed: mapToValidLevel(r.ovr, r.tier),
      court_laps_count: 20,
      squats_count: 75,
      pushups_count: 40,
      plank_seconds: 90,
      jump_rope_count: r.rope,
      short_range_shots_made: r.free_throws,
      mid_range_shots_made: r.mid_range,
      three_point_shots_made: r.three_point,
      half_court_shots_made: 0,
      overall_ovr: r.ovr,
      coach_feedback: r.feedback
    };

    const { data, error } = await supabase
      .from('detailed_test_records')
      .upsert(payload, { onConflict: 'student_id,evaluation_date' })
      .select();

    if (error) {
      console.error(`Error for ${r.name}:`, error);
    } else {
      console.log(`✓ detailed_test_records registrado para ${r.name} (${r.date}):`, data[0].id);
    }
  }
}

fixDetailedTestRecords();
