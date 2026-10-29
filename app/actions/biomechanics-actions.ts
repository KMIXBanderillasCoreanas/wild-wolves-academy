// app/actions/biomechanics-actions.ts
'use server';

import { analizarMovimientoBiomecanico, consultarSaludArticular } from '@/lib/wild-wolves-neural-bus';
import { checkAndConsumeAIQuota, AIPlanType } from '@/lib/ai-quota-manager';

export async function requestBiomechanicsAuditAction(formData: {
  userId: string;
  athleteName: string;
  shotType?: string;
  reactionTimeMs: number;
  gatheringTimeMs: number;
  releaseTimeMs: number;
  jumpApexHeightCm: number;
  defensiveStanceScore: number;
  hipTrackingAwareness: number;
  planType?: AIPlanType;
}) {
  try {
    const quota = await checkAndConsumeAIQuota(formData.userId, formData.planType || 'free');
    if (!quota.allowed) {
      return {
        success: false,
        error: quota.message || 'Límite de consultas mensuales excedido.',
        quota
      };
    }

    const aiOutput = await analizarMovimientoBiomecanico({
      athleteName: formData.athleteName,
      shotType: formData.shotType || 'jump_shot_apex',
      reactionTimeMs: formData.reactionTimeMs,
      gatheringTimeMs: formData.gatheringTimeMs,
      releaseTimeMs: formData.releaseTimeMs,
      jumpApexHeightCm: formData.jumpApexHeightCm,
      defensiveStanceScore: formData.defensiveStanceScore,
      hipTrackingAwareness: formData.hipTrackingAwareness
    });

    return {
      success: true,
      data: aiOutput || 'No se pudo generar el reporte del Lobo Táctico.',
      quota
    };
  } catch (error: any) {
    console.error('Error en requestBiomechanicsAuditAction:', error);
    return { success: false, error: error.message };
  }
}

export async function requestPrehabConsultationAction(params: {
  userId: string;
  athleteName: string;
  targetArea: 'tobillo' | 'rodilla' | 'isquiotibiales' | 'lumbar' | 'general';
  symptom: string;
  bioimpedanceFatPercent?: number;
  bioimpedanceWaterPercent?: number;
  planType?: AIPlanType;
}) {
  try {
    const quota = await checkAndConsumeAIQuota(params.userId, params.planType || 'free');
    if (!quota.allowed) {
      return {
        success: false,
        error: quota.message || 'Límite de consultas mensuales excedido.',
        quota
      };
    }

    const aiOutput = await consultarSaludArticular({
      athleteName: params.athleteName,
      targetArea: params.targetArea,
      symptom: params.symptom,
      bioimpedanceFatPercent: params.bioimpedanceFatPercent,
      bioimpedanceWaterPercent: params.bioimpedanceWaterPercent
    });

    return {
      success: true,
      data: aiOutput || 'No se pudo obtener respuesta del preparador físico.',
      quota
    };
  } catch (error: any) {
    console.error('Error en requestPrehabConsultationAction:', error);
    return { success: false, error: error.message };
  }
}
