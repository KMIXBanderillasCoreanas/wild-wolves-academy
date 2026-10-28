// lib/ai-gateway.ts

export const APINEX_BASE_URL = process.env.APINEX_BASE_URL || 'https://apinex.bond/v1';
export const APINEX_API_KEY = process.env.APINEX_API_KEY || 'sk-apxb1ecfd912c6eb91fc2e9808e75ae8d4110e56df12b0ba15';

// Diccionario de Modelos según sus fortalezas en Wild Wolves OS
export const AI_MODELS = {
  TACTICAL_DEEPSEEK: 'free/deepseek-v4.1-flash', // Para cálculos numéricos y biomecánica
  COACH_QWEN: 'free/qwen-3.8-max',               // Para análisis de datos y estadísticas generales
  VOICE_GEMINI: 'free/gemini-3.8-flash',         // Para asistencia multimodal y procesamiento rápido
  CRM_KIMI: 'free/kimi-k3',                      // Para redacción de reportes y WhatsApp a tutores
  GENERAL_GPT: 'free/gpt-6-luna'                 // Propósito general
};

export interface PromptOptions {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export async function callAIModel({ model, systemPrompt, userPrompt, temperature = 0.7 }: PromptOptions) {
  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    const response = await fetch(`${APINEX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APINEX_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Error en la API de Apinex (${response.status} ${response.statusText}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.';
  } catch (error) {
    console.error(`Falla al consultar el modelo ${model}:`, error);
    throw error;
  }
}

// Router centralizado por proveedor/modelo
export async function consultarMotorIA(modelo: 'deepseek' | 'gemini' | 'claude' | 'qwen', prompt: string) {
  const modelMap: Record<string, string> = {
    deepseek: AI_MODELS.TACTICAL_DEEPSEEK,
    gemini: AI_MODELS.VOICE_GEMINI,
    claude: 'free/claude-sonnet-4.6',
    qwen: AI_MODELS.COACH_QWEN
  };

  const selectedModel = modelMap[modelo] || AI_MODELS.VOICE_GEMINI;
  return callAIModel({
    model: selectedModel,
    userPrompt: prompt
  });
}

// A. Análisis Biomecánico y de Estadísticas con DeepSeek
export async function analizarPruebaTiroAtleta(metricasTiro: { tirosTotales: number; aciertos: number; anguloPiernas: number }) {
  const systemPrompt = "Eres un preparador físico de alto rendimiento FIBA/NBA experto en biomecánica de tiro.";
  const userPrompt = `Analiza el siguiente rendimiento: Tiros totales: ${metricasTiro.tirosTotales}, Aciertos: ${metricasTiro.aciertos}, Ángulo de piernas: ${metricasTiro.anguloPiernas}°. Dame un dictamen táctico breve y 2 recomendaciones de mejora.`;

  return callAIModel({
    model: AI_MODELS.TACTICAL_DEEPSEEK,
    systemPrompt,
    userPrompt
  });
}
