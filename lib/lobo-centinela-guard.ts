// lib/lobo-centinela-guard.ts — Lobo Centinela (AI Security Guardian & WAF)
// Wild Wolves Basketball Academy OS
// Protection of Minor Athlete PII, Anti-SQLi, Anti-XSS, Anti-Spoofing & Deep AI Telemetry

import { createClient } from '@supabase/supabase-js';
import { checkBruteForceLimit, recordFailedLogin } from '@/lib/security/bruteForceShield';

// Server-side privileged Supabase client for security audit logging
function getCentinelaSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgzuttxfmrfcgsceczql.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(supabaseUrl, serviceKey);
}

export interface SecurityEvaluationInput {
  userId?: string;
  role?: string;
  ipAddress?: string;
  actionTarget?: string;
  payloadContent: string | Record<string, any>;
}

export interface SecurityEvaluationResult {
  seguro: boolean;
  razon?: string;
  nivelAmenaza?: 'BAJA' | 'MEDIA' | 'ELEVADA' | 'CRITICA';
  codigoBloqueo?: string;
}

/**
 * Heuristic signature patterns for instant, zero-latency edge WAF filtering
 */
const PATRONES_MALICIOSOS = {
  // SQL Injection patterns: stacked queries, comments, dangerous clauses
  sqlInjection: /(\b(union\s+all|union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|alter\s+table|delete\s+from|exec(\s|\+)+(s|x)p|xp_cmdshell|pg_sleep|waitfor\s+delay)\b|--\s*$|\/\*.*\*\/|;\s*(drop|delete|insert|update|create|exec)\b)/i,
  
  // Cross-Site Scripting (XSS) patterns
  xss: /(<script[\s\S]*?>[\s\S]*?<\/script>|javascript\s*:\s*|onload\s*=\s*|onerror\s*=\s*|<iframe|<embed|<object|document\.(cookie|location)|window\.location|eval\s*\(|new\s+Function\s*\()/i,
  
  // Prototype pollution & object poisoning
  prototypePollution: /(__proto__|constructor\s*\.\s*prototype|prototype\s*\[)/i,
  
  // Path traversal & sensitive file extraction
  pathTraversal: /(\.\.\/|\.\.\\|\/etc\/(passwd|shadow)|c:\\windows|windows\/system32)/i,

  // Role Elevation Forgery in raw payloads
  roleForging: /("role"\s*:\s*"(superadmin|admin|director)"|"is_admin"\s*:\s*true)/i
};

/**
 * Sanitizes payload string to remove sensitive PII (passwords, tokens) before any logging or AI inspection
 */
function sanitizarPayload(content: string): string {
  return content
    .replace(/"(password|secret|token|api_key|service_role)"\s*:\s*"[^"]+"/gi, '"$1":"[REDACTED]"')
    .slice(0, 2000); // Enforce max sample length to prevent log bloating
}

/**
 * Main Gatekeeper: Evaluates safety of an incoming Server Action or API Route request
 */
export async function evaluarSeguridadPeticion({
  userId = 'anon',
  role = 'guest',
  ipAddress = '127.0.0.1',
  actionTarget = 'general_api',
  payloadContent
}: SecurityEvaluationInput): Promise<SecurityEvaluationResult> {
  try {
    const rawString =
      typeof payloadContent === 'string'
        ? payloadContent
        : JSON.stringify(payloadContent ?? {});

    // 0. Comprobación de Brute Force / Rate Limit por IP o Usuario
    const rateCheck = checkBruteForceLimit(ipAddress);
    if (rateCheck.isLocked) {
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: `IP bloqueada temporalmente por exceso de intentos fallidos. Restan ${rateCheck.remainingSec}s`,
        nivel: 'CRITICA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: `Acceso restringido temporalmente por seguridad. Reintenta en ${rateCheck.remainingSec} segundos.`,
        nivelAmenaza: 'CRITICA',
        codigoBloqueo: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // 1. Verificación de Desbordamiento de Carga (DoS / Token Overflow)
    if (rawString.length > 500000) { // > 500KB payload limit for sports data
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Desbordamiento de tamaño de payload (> 500KB)',
        nivel: 'ELEVADA',
        actionTarget,
        sample: rawString.slice(0, 100) + '... [TRUNCADO]'
      });
      return {
        seguro: false,
        razon: 'Carga útil excede los límites operacionales seguros.',
        nivelAmenaza: 'ELEVADA',
        codigoBloqueo: 'PAYLOAD_TOO_LARGE'
      };
    }

    // 2. Detección Heurística Inmediata (< 1ms, Cero Latencia)
    if (PATRONES_MALICIOSOS.sqlInjection.test(rawString)) {
      recordFailedLogin(ipAddress);
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Firma de inyección SQL (SQLi) detectada en parámetros',
        nivel: 'CRITICA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: 'Petición bloqueada por reglas de integridad de base de datos.',
        nivelAmenaza: 'CRITICA',
        codigoBloqueo: 'SQLI_DETECTED'
      };
    }

    if (PATRONES_MALICIOSOS.xss.test(rawString)) {
      recordFailedLogin(ipAddress);
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Intento de Cross-Site Scripting (XSS) detectado',
        nivel: 'ELEVADA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: 'Contenido contiene etiquetas o scripts ejecutables no permitidos.',
        nivelAmenaza: 'ELEVADA',
        codigoBloqueo: 'XSS_DETECTED'
      };
    }

    if (PATRONES_MALICIOSOS.prototypePollution.test(rawString)) {
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Intento de contaminación de prototipo (Prototype Pollution)',
        nivel: 'CRITICA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: 'Estructura de objeto no permitida.',
        nivelAmenaza: 'CRITICA',
        codigoBloqueo: 'PROTOTYPE_POLLUTION'
      };
    }

    if (PATRONES_MALICIOSOS.pathTraversal.test(rawString)) {
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Intento de Path Traversal de sistema de archivos',
        nivel: 'CRITICA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: 'Ruta de archivo no autorizada.',
        nivelAmenaza: 'CRITICA',
        codigoBloqueo: 'PATH_TRAVERSAL'
      };
    }

    // Prevención de Elevación No Autorizada de Rol en el cuerpo de la petición
    if (role !== 'superadmin' && PATRONES_MALICIOSOS.roleForging.test(rawString)) {
      await registrarIntrusion({
        userId,
        role,
        ipAddress,
        motivo: 'Intento de forja o elevación de rol privilegiado en payload',
        nivel: 'CRITICA',
        actionTarget,
        sample: sanitizarPayload(rawString)
      });
      return {
        seguro: false,
        razon: 'Intento de elevación de privilegios no autorizada.',
        nivelAmenaza: 'CRITICA',
        codigoBloqueo: 'ROLE_ELEVATION_ATTEMPT'
      };
    }

    // 3. Auditoría Asistida por IA (Lobo Centinela Gateway / 9Router / Apinex)
    const aiGatewayUrl =
      process.env.APINEX_BASE_URL ||
      process.env.AI_SECURITY_GATEWAY_URL ||
      process.env.AI_GATEWAY_ENDPOINT ||
      'https://apinex.bond/v1';

    const aiApiKey =
      process.env.APINEX_API_KEY ||
      process.env.AI_SECURITY_API_KEY ||
      process.env.GROQ_API_KEY ||
      '';

    // Se invoca el Centinela IA si existe una clave de acceso o túnel configurado
    if (aiApiKey && rawString.length > 30 && rawString.length < 5000) {
      const aiCheck = await consultarCentinelaIA(sanitizarPayload(rawString), aiGatewayUrl, aiApiKey);
      if (!aiCheck.seguro) {
        await registrarIntrusion({
          userId,
          role,
          ipAddress,
          motivo: `IA Centinela (${aiCheck.razon || 'Firma sospechosa'})`,
          nivel: 'ELEVADA',
          actionTarget,
          sample: sanitizarPayload(rawString)
        });
        return {
          seguro: false,
          razon: aiCheck.razon || 'Bloqueado por análisis de comportamiento anómalo.',
          nivelAmenaza: 'ELEVADA',
          codigoBloqueo: 'AI_ANOMALY_DETECTED'
        };
      }
    }

    // Petición válida y limpia
    return { seguro: true, nivelAmenaza: 'BAJA' };

  } catch (err: any) {
    // Fail-open controlado: garantiza que fallos en el subsistema de seguridad
    // no interrumpan las operaciones de duela de la academia, pero reporta el error
    console.error('[LoboCentinela] Error no fatal en evaluación de seguridad:', err?.message);
    return { seguro: true, nivelAmenaza: 'BAJA' };
  }
}

/**
 * Consulta a la IA de Ciberseguridad Defensiva a través de un gateway o API sancionada
 */
async function consultarCentinelaIA(
  sanitizedContent: string,
  gatewayUrl: string,
  apiKey: string
): Promise<{ seguro: boolean; razon?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120); // 120ms max timeout para latencia cero

    const res = await fetch(gatewayUrl.endsWith('/chat/completions') ? gatewayUrl : `${gatewayUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.AI_SECURITY_MODEL || 'free/gemini-3.8-flash-low',
        messages: [
          {
            role: 'system',
            content:
              'Eres Lobo Centinela, el agente de ciberseguridad defensiva de Wild Wolves Academy. Analiza el payload y determina si contiene intenciones maliciosas, intentos de bypass o inyecciones. Responde estrictamente un JSON válido: {"seguro": true} o {"seguro": false, "razon": "breve motivo"}. Sin explicaciones adicionales.'
          },
          { role: 'user', content: sanitizedContent }
        ],
        temperature: 0.1,
        max_tokens: 60
      })
    });

    clearTimeout(timeout);

    if (!res.ok) return { seguro: true };

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim() || '{}';
    const parsed = JSON.parse(text);

    return {
      seguro: parsed.seguro !== false,
      razon: parsed.razon
    };
  } catch {
    // Si la llamada externa falla o excede el timeout de 120ms, el sistema continúa (fail-open resiliente)
    return { seguro: true };
  }
}

/**
 * Persiste los intentos de intrusión o anomalías en Supabase (public.security_audit_logs)
 */
async function registrarIntrusion({
  userId,
  role,
  ipAddress,
  motivo,
  nivel = 'ELEVADA',
  actionTarget = 'general',
  sample = ''
}: {
  userId?: string;
  role?: string;
  ipAddress?: string;
  motivo: string;
  nivel?: 'BAJA' | 'MEDIA' | 'ELEVADA' | 'CRITICA';
  actionTarget?: string;
  sample?: string;
}) {
  try {
    const supabase = getCentinelaSupabase();
    await supabase.from('security_audit_logs').insert({
      user_id: userId || 'anon',
      user_role: role || 'guest',
      ip_address: ipAddress || 'unknown',
      threat_reason: motivo,
      threat_level: nivel,
      action_target: actionTarget,
      payload_sample: sample,
      created_at: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('[LoboCentinela] No se pudo persistir log de intrusión en base de datos:', err?.message);
  }
}
