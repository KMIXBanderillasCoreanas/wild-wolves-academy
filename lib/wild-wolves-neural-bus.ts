// lib/wild-wolves-neural-bus.ts
import { createClient } from '@supabase/supabase-js';

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
 * MOTOR DE SEÑALES NEURONALES (AI Gateway Unificado: OpenAI + Anthropic Claude)
 */
export async function sendNeuralSignal({
  model,
  systemPrompt,
  userPrompt,
  temperature = 0.7
}: {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}) {
  try {
    const isClaude = model.toLowerCase().includes('claude');
    const endpoint = isClaude ? `${APINEX_BASE_URL}/mensajes` : `${APINEX_BASE_URL}/chat/completions`;

    const body = isClaude
      ? {
          model,
          max_tokens: 4000,
          system: systemPrompt || 'Eres un asistente de IA deportivo de alto rendimiento FIBA.',
          messages: [{ role: 'user', content: userPrompt }],
          temperature
        }
      : {
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
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
 * REFLEJO AUTOMÁTICO 1: Evaluación y Promoción de Nivel (Trigger Lógico en Servidor)
 * Se ejecuta al registrar un test de duela. Evalúa si el atleta asciende de tier y otorga insignias.
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

    // 1. Actualizar Supabase (profiles)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ current_tier: nuevoTier })
      .eq('id', studentId);

    if (profileError) {
      console.warn('Aviso actualizando tier en profiles:', profileError.message);
    }

    // 2. Registrar insignia automática si la tabla está disponible
    try {
      await supabase.from('student_earned_badges').insert({
        student_id: studentId,
        badge_name: badgeName,
        badge_tier: badgeTier
      });
    } catch (badgeErr) {
      console.warn('Aviso insertando insignia:', badgeErr);
    }

    return { success: true, nuevoTier, badgeName, badgeTier };
  } catch (err: any) {
    console.error('Falla en procesarReflejoTestDuela:', err);
    return { success: false, error: err.message };
  }
}

/**
 * REFLEJO AUTOMÁTICO 2: Sincronización Offline-First (Ingesta de Archivos / HTML / JSON)
 */
export async function procesarColaOfflineSync(registrosLocales: any[]) {
  try {
    if (!registrosLocales || registrosLocales.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    // Inserta masivamente los datos recolectados sin internet hacia Supabase
    const { error } = await supabase
      .from('detailed_test_records')
      .upsert(registrosLocales, { onConflict: 'student_id, evaluation_date' });

    if (error) throw error;
    return { success: true, syncedCount: registrosLocales.length };
  } catch (err: any) {
    console.error('Falla en procesarColaOfflineSync:', err);
    return { success: false, error: err.message };
  }
}
