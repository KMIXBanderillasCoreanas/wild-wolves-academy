// lib/wild-wolves-neural-bus.ts
import { createClient } from '@supabase/supabase-js';
import { MASTER_TACTICAL_WOLF_SYSTEM_PROMPT } from './prompts/master-tactical-wolf';
import { checkAndConsumeAIQuota, AIPlanType } from './ai-quota-manager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  Buffer.from('c2Jfc2VjcmV0X2NHUEIwXzFDdVlnQUJFOW41dUQyVUFfTFVtQlpxMkU=', 'base64').toString('ascii');

const supabase = createClient(supabaseUrl, supabaseKey);

const APINEX_BASE_URL = process.env.APINEX_BASE_URL || 'https://api.apinex.bond/v1';
const APINEX_API_KEY = process.env.APINEX_API_KEY || 'sk-apxb1ecfd912c6eb91fc2e9808e75ae8d4110e56df12b0ba15';

export const NEURAL_MODELS = {
  BIOMECHANICS: 'gratis/deepseek-v4.1',     // Análisis físico y numérico
  PARSER_AI: 'flash gratuito/gemini-3.8', // Lectura de archivos y documentos
  STRATEGY: 'libre/claude-opus-4.6',      // Lógica y generación de código/reportes
  COMM_CRM: 'gratis/kimi-k3'              // Redacción de mensajes para tutores
};

/**
 * MOTOR DE SEÑALES NEURONALES (AI Gateway Unificado con Blindaje Reglamentario y Cuotas)
 */
export async function sendNeuralSignal({
  model,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  userId = 'system-coach',
  planType = 'standard_99'
}: {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  userId?: string;
  planType?: AIPlanType;
}) {
  try {
    // Verificación de cuota previa (salvo para llamadas administrativas internas)
    if (userId !== 'system-coach') {
      const quota = await checkAndConsumeAIQuota(userId, planType);
      if (!quota.allowed) {
        return `⚠️ ${quota.message}`;
      }
    }

    const effectiveSystemPrompt = systemPrompt
      ? `${MASTER_TACTICAL_WOLF_SYSTEM_PROMPT}\n\n[CONTEXTO OPERATIVO]:\n${systemPrompt}`
      : MASTER_TACTICAL_WOLF_SYSTEM_PROMPT;

    const isClaude = model.toLowerCase().includes('claude');
    const endpoint = isClaude ? `${APINEX_BASE_URL}/mensajes` : `${APINEX_BASE_URL}/chat/completions`;

    const body = isClaude
      ? {
          model,
          max_tokens: 4000,
          system: effectiveSystemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature
        }
      : {
          model,
          messages: [
            { role: 'system', content: effectiveSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature
        };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APINEX_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Respuesta no-200 en Neural Signal (${res.status}):`, errText);
      return null;
    }

    const data = await res.json();
    return isClaude ? data.content?.[0]?.text : data.choices?.[0]?.message?.content;
  } catch (err) {
    console.error('Error en el Sistema Nervioso (Neural Bus):', err);
    return null;
  }
}

/**
 * ANÁLISIS BIOMECÁNICO Y CINEMÁTICO AVANZADO DEL "LOBO TÁCTICO"
 * Compara los parámetros reales del deportista con los estándares de la NBA
 */
export async function analizarMovimientoBiomecanico({
  athleteName,
  shotType = 'jump_shot_apex',
  reactionTimeMs,
  gatheringTimeMs,
  releaseTimeMs,
  jumpApexHeightCm,
  defensiveStanceScore,
  hipTrackingAwareness
}: {
  athleteName: string;
  shotType?: string;
  reactionTimeMs: number;
  gatheringTimeMs: number;
  releaseTimeMs: number;
  jumpApexHeightCm: number;
  defensiveStanceScore: number;
  hipTrackingAwareness: number;
}) {
  const userPrompt = `
AUDITORÍA CINEMÁTICA Y BIOMECÁNICA DEL ATLETA: ${athleteName}
- Tipo de mecánica evaluada: ${shotType}
- Tiempo de Reacción inicial: ${reactionTimeMs} ms (Estándar Pro NBA: 200 - 240 ms)
- Tiempo de Gathering (armado de tiro): ${gatheringTimeMs} ms (Estándar Pro NBA: 300 - 360 ms)
- Tiempo de Release (soltura del balón): ${releaseTimeMs} ms (Estándar Pro NBA: 300 - 360 ms)
- Altura en el Apex del Salto: ${jumpApexHeightCm} cm (Estándar Pro NBA: 65 - 85 cm)
- Puntuación de Postura Defensiva: ${defensiveStanceScore}/100 pts (Estándar Pro NBA: >85 pts)
- Nivel de Seguimiento de Cadera Ofensiva (Hip Tracking): ${hipTrackingAwareness}/100 pts (Estándar Pro NBA: >90 pts)

Proporciona el veredicto con la estructura exacta:
a) LO QUE HICISTE BIEN
b) FALLA TÉCNICA EXACTA EN LA DUELA (Con brecha milimétrica o de ms vs NBA)
c) RUTINA DE PESO CORPORAL CORRECTIVA (Ejercicios funcionales pre-hab con series y reps)
`;

  return await sendNeuralSignal({
    model: NEURAL_MODELS.BIOMECHANICS,
    systemPrompt: 'Genera el diagnóstico biomecánico oficial para el atleta de Wild Wolves Academy.',
    userPrompt,
    temperature: 0.4
  });
}

/**
 * CONSULTA QUIROPRÁCTICA Y DE SALUD ARTICULAR (Pre-hab & Cool-down)
 */
export async function consultarSaludArticular({
  athleteName,
  targetArea,
  symptom,
  bioimpedanceFatPercent,
  bioimpedanceWaterPercent
}: {
  athleteName: string;
  targetArea: 'tobillo' | 'rodilla' | 'isquiotibiales' | 'lumbar' | 'general';
  symptom: string;
  bioimpedanceFatPercent?: number;
  bioimpedanceWaterPercent?: number;
}) {
  const userPrompt = `
CONSULTA DE SALUD ARTICULAR Y RECUPERACIÓN - WILD WOLVES PRE-HAB:
- Atleta: ${athleteName}
- Zona corporal de atención: ${targetArea}
- Síntoma o reporte del atleta: "${symptom}"
- Datos de Báscula Bioimpedancia: Grasa: ${bioimpedanceFatPercent ?? 'N/A'}%, Agua Corporal: ${bioimpedanceWaterPercent ?? 'N/A'}%

Entrega la prescripción de quiropráctica deportiva:
1. Diagnóstico funcional y prevención de lesiones agudas (ej. esguince por inversión, tendinitis rotuliana, lumbalgia).
2. Protocolo de estiramiento pasivo/activo inmediato (Cool-down) con tiempos de tensión.
3. Indicación de hidratación e impacto según su bioimpedancia.
`;

  return await sendNeuralSignal({
    model: NEURAL_MODELS.BIOMECHANICS,
    systemPrompt: 'Actúa como el especialista quiropráctico de Wild Wolves Academy.',
    userPrompt,
    temperature: 0.3
  });
}

/**
 * REFLEJO AUTOMÁTICO: Evaluación y Promoción de Nivel (Trigger Lógico en Servidor)
 */
export async function procesarReflejoTestDuela(
  studentId: string,
  testData: { freeThrows: number; verticalJump: number; threePointMade?: number }
) {
  try {
    let nuevoTier = '🐺 Lobo Básico (Iniciación)';
    let badgeName = 'Iniciación en Duela';
    let badgeTier = 'Bronce';

    if (testData.freeThrows >= 15 && testData.verticalJump >= 60) {
      nuevoTier = '🐺 Lobo Alfa Competitivo';
      badgeName = 'Sniper de Duela';
      badgeTier = 'Gold';
    } else if (testData.freeThrows >= 8 || testData.verticalJump >= 45) {
      nuevoTier = '🐺 Lobo Cazador (Formativo)';
      badgeName = 'Francotirador de Media';
      badgeTier = 'Silver';
    }

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        certification_tier: nuevoTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (profileErr) {
      console.warn('Advertencia actualizando tier en profiles:', profileErr.message);
    }

    await supabase.from('student_earned_badges').upsert(
      {
        student_id: studentId,
        badge_code: badgeName.toLowerCase().replace(/\s+/g, '_'),
        badge_name: badgeName,
        badge_category: 'shooting',
        badge_tier: badgeTier,
        date_earned: new Date().toISOString()
      },
      { onConflict: 'student_id,badge_code' }
    );

    return { success: true, tier: nuevoTier, badge: badgeName };
  } catch (err) {
    console.error('Falla en procesarReflejoTestDuela:', err);
    return { success: false, error: err };
  }
}
