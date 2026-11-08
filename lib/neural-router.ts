// lib/neural-router.ts — Enrutador Dinámico Multi-IA para Wild Wolves OS & 9Router Gateway
// Automatiza la selección de la IA óptima según la tarea táctica con failover automático

const ROUTER_GATEWAY_URL = (process.env.APINEX_BASE_URL || 'https://apinex.bond/v1').replace(/\/$/, '') + '/chat/completions';
const ROUTER_API_KEY = process.env.APINEX_API_KEY || process.env.AI_SECURITY_API_KEY || 'sk-623d95255f395c93-lqyvin-ab9beeb6';

export const TAREAS_IA = {
  BIOMECANICA: 'free/deepseek-v4.1-flash', // Para cálculos, números y física de tiro
  SEGURIDAD: 'free/gemini-3.8-flash-low',   // Para el Lobo Centinela y auditoría rápida
  CRM_TUTORES: 'free/kimi-k3',             // Para redactar mensajes humanos a padres
  LOGICA_GENERAL: 'free/qwen-3.8-max'      // Para procesamiento general de datos y consultas
} as const;

export type TipoTareaIA = keyof typeof TAREAS_IA;

// Jerarquía de modelos de respaldo en caso de agotamiento de cuotas (402 / 429)
const MODELOS_RESPALDO: Record<string, string> = {
  'free/deepseek-v4.1-flash': 'free/qwen-3.8-max',
  'free/gemini-3.8-flash-low': 'free/qwen-3.8-max',
  'free/kimi-k3': 'free/gemini-3.8-flash-low',
  'free/qwen-3.8-max': 'free/deepseek-v4.1-flash'
};

export interface EjecutarTareaParams {
  tareaTipo: TipoTareaIA;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EjecutarTareaResult {
  success: boolean;
  modelUsed?: string;
  resultado?: string;
  error?: string;
  isFailover?: boolean;
}

/**
 * Invoca el Gateway externo directamente para un modelo y prompt específicos
 */
export async function invocarIAExterna(modelo: string, prompt: string, systemPrompt?: string): Promise<any> {
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const respuesta = await fetch(ROUTER_GATEWAY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: modelo,
        messages,
        temperature: 0.7
      })
    });
    clearTimeout(timeoutId);
    return await respuesta.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Enrutador Dinámico Multi-IA con Conmutación por Falla (Auto-Failover)
 */
export async function ejecutarTareaConMejorIA({
  tareaTipo,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens = 800
}: EjecutarTareaParams): Promise<EjecutarTareaResult> {
  const modeloPrincipal = TAREAS_IA[tareaTipo] || TAREAS_IA.LOGICA_GENERAL;
  const modeloSecundario = MODELOS_RESPALDO[modeloPrincipal] || 'free/qwen-3.8-max';

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  // 1. Intento con el Modelo Principal
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(ROUTER_GATEWAY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: modeloPrincipal,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return {
        success: true,
        modelUsed: modeloPrincipal,
        resultado: content
      };
    }

    // Si falló por falta de créditos (402) o límite de tasa (429), registrar y conmutar a respaldo
    console.warn(`[NeuralRouter] Modelo principal (${modeloPrincipal}) respondió ${response.status}. Conmutando a ${modeloSecundario}...`);
  } catch (err: any) {
    console.warn(`[NeuralRouter] Error de conexión con ${modeloPrincipal}: ${err?.message}. Conmutando a ${modeloSecundario}...`);
  }

  // 2. Conmutación Automática por Falla (Failover al Modelo Secundario)
  try {
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 6000);

    const response2 = await fetch(ROUTER_GATEWAY_URL, {
      method: 'POST',
      signal: controller2.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: modeloSecundario,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });
    clearTimeout(timeout2);

    if (response2.ok) {
      const data2 = await response2.json();
      const content2 = data2.choices?.[0]?.message?.content || '';
      return {
        success: true,
        modelUsed: modeloSecundario,
        resultado: content2,
        isFailover: true
      };
    }

    throw new Error(`Fallback gateway error status: ${response2.status}`);
  } catch (failoverErr: any) {
    console.error(`[NeuralRouter] Fallaron ambos modelos para ${tareaTipo}:`, failoverErr?.message);
    return {
      success: false,
      error: failoverErr?.message || 'Error de procesamiento en clúster IA'
    };
  }
}
