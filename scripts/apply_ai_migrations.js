// scripts/apply_ai_migrations.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno de .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envMap = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/(^['"])|(['"]$)/g, '');
    envMap[key] = val;
  }
});

const supabaseUrl = envMap.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envMap.SUPABASE_SERVICE_ROLE_KEY || envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Verificando tablas e insertando datos de protocolos...');
  
  // 1. Probar acceso a injury_prevention_protocols
  const { data: proto, error: protoErr } = await supabase.from('injury_prevention_protocols').select('*').limit(1);
  if (protoErr) {
    console.log('Tabla injury_prevention_protocols aún no existe o requiere ejecución SQL manual en el dashboard.');
    console.log('Detalle error:', protoErr.message);
  } else {
    console.log('Tabla injury_prevention_protocols disponible:', proto);
  }

  // 2. Probar acceso a ai_usage_limits
  const { data: limits, error: limitsErr } = await supabase.from('ai_usage_limits').select('*').limit(1);
  if (limitsErr) {
    console.log('Tabla ai_usage_limits requiere ejecución SQL en Supabase Studio.');
    console.log('Detalle error:', limitsErr.message);
  } else {
    console.log('Tabla ai_usage_limits lista:', limits);
  }
}

run();
