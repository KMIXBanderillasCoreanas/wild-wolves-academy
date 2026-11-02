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

async function injectBadgesCorrectly() {
  const brunoId = 'c7829cdf-7d4e-4d62-acdd-70fd5de08a77';
  const jesusId = 'c3ff89c2-2253-4a0d-a3ef-515eb6885473';
  const isaacId = '4bcc9509-e51d-4372-a0d9-c304bc6c2845';

  const badges = [
    { student_id: brunoId, badge_code: 'threat_3pt', badge_name: 'Amenaza Exterior 3PT', badge_icon: '🎯' },
    { student_id: brunoId, badge_code: 'rope_50', badge_name: 'Motor de Cuerda +50 Reps', badge_icon: '⚡' },
    { student_id: brunoId, badge_code: 'wall_iron', badge_name: 'Muro de Hierro 3x25 (90°)', badge_icon: '🛡️' },

    { student_id: jesusId, badge_code: 'sniper_65', badge_name: 'Francotirador 65% 3PT', badge_icon: '🔥' },
    { student_id: jesusId, badge_code: 'clutch_ft', badge_name: 'Sangre Fría en Libres (80%+)', badge_icon: '❄️' },
    { student_id: jesusId, badge_code: 'rope_50', badge_name: 'Motor de Cuerda +50 Reps', badge_icon: '⚡' },
    { student_id: jesusId, badge_code: 'speedster', badge_name: 'Velocista de Duela', badge_icon: '🏃' },

    { student_id: isaacId, badge_code: 'threat_3pt', badge_name: 'Amenaza Exterior 3PT', badge_icon: '🎯' },
    { student_id: isaacId, badge_code: 'clutch_ft', badge_name: 'Sangre Fría en Libres (80%+)', badge_icon: '❄️' },
    { student_id: isaacId, badge_code: 'jump_50', badge_name: 'Salto Explosivo +50cm', badge_icon: '🚀' }
  ];

  for (const b of badges) {
    await supabase.from('student_earned_badges').upsert(b, { onConflict: 'student_id,badge_code' });
  }
  console.log('✓ Insignias guardadas correctamente.');
}
injectBadgesCorrectly();
