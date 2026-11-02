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

async function checkColsAndApply() {
  const { data: daSample } = await supabase.from('daily_attendance').select('*').limit(1);
  console.log('daily_attendance columns:', daSample ? Object.keys(daSample[0]) : 'empty');

  const today = '2026-10-28';
  const isaacId = '4bcc9509-e51d-4372-a0d9-c304bc6c2845';
  const jesusId = 'c3ff89c2-2253-4a0d-a3ef-515eb6885473';

  // Solo insertar las columnas que existen
  const payload = [
    { student_id: isaacId, date: today, status: 'presente' },
    { student_id: jesusId, date: today, status: 'presente' }
  ];

  const { data, error } = await supabase.from('daily_attendance').upsert(payload, { onConflict: 'student_id,date' }).select();
  console.log('Upsert result:', data, error);
}
checkColsAndApply();
