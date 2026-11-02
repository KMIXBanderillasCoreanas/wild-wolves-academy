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

async function testAdminApiUpsert() {
  const testId = '4bcc9509-e51d-4372-a0d9-c304bc6c2845';
  const today = '2026-10-28';

  const res = await fetch('http://localhost:3000/api/admin/attendance-finance-manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': 'WW-SUPERADMIN-FULL-2026',
      'x-admin-email': 'wildwolvescdmx@gmail.com'
    },
    body: JSON.stringify({
      action: 'UPSERT_ATTENDANCE',
      student_id: testId,
      attendance_date: today,
      status: 'presente'
    })
  });
  const data = await res.json();
  console.log('Admin API UPSERT_ATTENDANCE result:', res.status, data);

  const payRes = await fetch('http://localhost:3000/api/admin/attendance-finance-manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': 'WW-SUPERADMIN-FULL-2026',
      'x-admin-email': 'wildwolvescdmx@gmail.com'
    },
    body: JSON.stringify({
      action: 'UPSERT_PAYMENT',
      student_id: testId,
      payment_date: today,
      amount: 50,
      payment_method: 'efectivo',
      concept: 'Prueba Admin API',
      status: 'completado'
    })
  });
  const payData = await payRes.json();
  console.log('Admin API UPSERT_PAYMENT result:', payRes.status, payData);
}

testAdminApiUpsert();
