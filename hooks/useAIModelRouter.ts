'use client';

import { usePathname } from 'next/navigation';

export interface AIModelRecommendation {
  modelName: string;
  reason: string;
  actionTag: string;
}

export function useAIModelRouter(): AIModelRecommendation {
  const pathname = usePathname() || '';

  if (pathname.includes('/api/') || pathname.includes('supabase') || pathname.includes('vision')) {
    return {
      modelName: 'Claude Sonnet 4.6 (Thinking)',
      reason: 'Sección de backend o visión artificial: Requiere razonamiento lógico avanzado y tipado estricto.',
      actionTag: 'LÓGICA Y ARQUITECTURA'
    };
  }

  if (pathname.includes('bunker') || pathname.includes('master')) {
    return {
      modelName: 'Claude Opus 4.6 (Thinking)',
      reason: 'Zona administrativa crítica: Se aconseja el modelo de máxima capacidad para seguridad y esquemas.',
      actionTag: 'SISTEMAS CRÍTICOS'
    };
  }

  if (pathname.includes('guardian') || pathname.includes('whatsapp') || pathname.includes('crm')) {
    return {
      modelName: 'GPT-OSS 120B (Medium)',
      reason: 'Módulo de comunicación: Ideal para redactar mensajes profesionales y cálidos a los tutores.',
      actionTag: 'COMUNICACIÓN Y CRM'
    };
  }

  return {
    modelName: 'Gemini 3.8 Flash',
    reason: 'Vista general o duela: Óptimo para velocidad, procesamiento de JSONs y componentes UI rápidos.',
    actionTag: 'VELOCIDAD Y DATOS'
  };
}

export default useAIModelRouter;
