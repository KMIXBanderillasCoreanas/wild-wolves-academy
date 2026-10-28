// lib/apinex-gateway.ts

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
}

/**
 * Enrutador inteligente que detecta si el modelo es de Anthropic (Claude) o estándar (OpenAI)
 * y utiliza el endpoint correcto (/v1/mensajes o /v1/chat/completions).
 */
export async function consultarApinexAI({ model, systemPrompt, userPrompt, temperature = 0.7 }: ApinexRequest) {
  try {
    const isClaude = model.toLowerCase().includes('claude');
    const endpoint = isClaude ? `${APINEX_BASE_URL}/mensajes` : `${APINEX_BASE_URL}/chat/completions`;

    let bodyData: any = {};

    if (isClaude) {
      // Protocolo 02: Mensajes Antrópicos (Claude nativo)
      bodyData = {
        model,
        max_tokens: 4000,
        system: systemPrompt || 'Eres un asistente de IA experto en gestión deportiva.',
        messages: [{ role: 'user', content: userPrompt }],
        temperature
      };
    } else {
      // Protocolo 01: SDK de OpenAI (DeepSeek, Gemini, Qwen, Kimi)
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userPrompt });

      bodyData = {
        model,
        messages,
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

    // Extraer la respuesta según el protocolo devuelto
    if (isClaude) {
      return { success: true, text: data.content?.[0]?.text || 'Sin respuesta de Claude.' };
    } else {
      return { success: true, text: data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.' };
    }
  } catch (error: any) {
    console.error('Falla en la consulta a Apinex AI:', error);
    return { success: false, error: error.message };
  }
}
