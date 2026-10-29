// lib/apinex-gateway.ts
import { checkAndConsumeAIQuota, AIPlanType, QuotaCheckResult } from './ai-quota-manager';
import { MASTER_TACTICAL_WOLF_SYSTEM_PROMPT } from './prompts/master-tactical-wolf';

export const APINEX_BASE_URL = process.env.APINEX_BASE_URL || 'https://api.apinex.bond/v1';
export const APINEX_API_KEY = process.env.APINEX_API_KEY || 'sk-apxb1ecfd912c6eb91fc2e9808e75ae8d4110e56df12b0ba15';

// Catálogo exacto extraído de la plataforma Apinex
export const APINEX_MODELS = {
  DEEPSEEK_V4: 'gratis/deepseek-v4.1',          // Ideal para cálculos de duela y biomecánica
  GEMINI_3_8: 'flash gratuito/gemini-3.8',     // Ideal para análisis de archivos y multimodal
  CLAUDE_OPUS: 'libre/claude-opus-4.6',        // Ideal para lógica compleja y generación de código
  QWEN_MAX: 'gratis/qwen-3.8-máx.',            // Ideal para estadísticas de equipo
  KIMI_K3: 'gratis/kimi-k3',                   // Ideal para redacción de WhatsApp a tutores
};

export interface ApinexRequest {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  userId?: string;
  planType?: AIPlanType;
}

export interface ApinexResponse {
  success: boolean;
  text?: string;
  error?: string;
  quota?: QuotaCheckResult;
}

/**
 * Enrutador inteligente con Middleware de Control de Cuota y Contexto Maestro del Lobo Táctico.
 */
export async function consultarApinexAI({
  model,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  userId = 'guest-student',
  planType = 'free'
}: ApinexRequest): Promise<ApinexResponse> {
  try {
    // 1. MIDDLEWARE DE CONTROL DE LÍMITES DE CONSULTA
    const quotaCheck = await checkAndConsumeAIQuota(userId, planType);
    if (!quotaCheck.allowed) {
      return {
        success: false,
        error: quotaCheck.message || 'Límite mensual de consultas excedido para tu plan.',
        quota: quotaCheck
      };
    }

    // 2. ENRIQUECIMIENTO CON PROMPT MAESTRO REGLAMENTARIO Y BIOMECÁNICO
    const effectiveSystemPrompt = systemPrompt
      ? `${MASTER_TACTICAL_WOLF_SYSTEM_PROMPT}\n\n[INSTRUCCIÓN ESPECÍFICA]:\n${systemPrompt}`
      : MASTER_TACTICAL_WOLF_SYSTEM_PROMPT;

    const isClaude = model.toLowerCase().includes('claude');
    const endpoint = isClaude ? `${APINEX_BASE_URL}/mensajes` : `${APINEX_BASE_URL}/chat/completions`;

    let bodyData: any = {};

    if (isClaude) {
      // Protocolo Anthropic (Claude nativo)
      bodyData = {
        model,
        max_tokens: 4000,
        system: effectiveSystemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature
      };
    } else {
      // Protocolo OpenAI (DeepSeek, Gemini, Qwen, Kimi)
      bodyData = {
        model,
        messages: [
          { role: 'system', content: effectiveSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APINEX_API_KEY}`
      },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Apinex (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extraer respuesta según el protocolo devuelto
    const textOutput = isClaude
      ? data.content?.[0]?.text || 'Sin respuesta generada por Claude.'
      : data.choices?.[0]?.message?.content || 'Sin respuesta generada por el modelo.';

    return {
      success: true,
      text: textOutput,
      quota: quotaCheck
    };
  } catch (error: any) {
    console.error('Falla en la consulta a Apinex AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
