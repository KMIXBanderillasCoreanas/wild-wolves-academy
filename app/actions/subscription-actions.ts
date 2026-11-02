'use server';

import { createClient, getAdminSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CanjearFolioResult {
  success: boolean;
  message?: string;
  error?: string;
  plan?: 'PRO_99' | 'ELITE_149' | 'FREE_15';
  maxQueries?: number;
  expiresAt?: string;
}

/**
 * Server Action: Canjear Folio de Activación Oficial (30 Días)
 * Valida la existencia y disponibilidad del folio en public.activation_codes,
 * calcula el periodo exacto de 30 días y actualiza ai_usage_limits y profiles.
 */
export async function canjearFolioActivacion(
  codeString: string,
  userId?: string,
  userEmail?: string
): Promise<CanjearFolioResult> {
  const supabase = getAdminSupabase();
  const code = (codeString || '').trim().toUpperCase();

  if (!code) {
    return { success: false, error: 'Por favor, ingresa un código o folio válido.' };
  }

  // 1. Buscar el código en la base de datos (activation_codes)
  const { data: codeData, error: fetchError } = await supabase
    .from('activation_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  // Si no está en activation_codes, verificar si es uno de los códigos canónicos preaprobados de duela
  let resolvedPlanType: 'PRO_99' | 'ELITE_149' | 'FREE_15' = 'PRO_99';
  let isCanonicalBackup = false;

  if (fetchError || !codeData) {
    if (code.startsWith('WW-FAM-') || code.startsWith('WW-ELITE-') || code === 'CARMEN-SERDAN-ELITE') {
      resolvedPlanType = 'ELITE_149';
      isCanonicalBackup = true;
    } else if (code.startsWith('WW-PRO-') || code === 'CARMEN-SERDAN-PRO' || code === 'MANADA-2026') {
      resolvedPlanType = 'PRO_99';
      isCanonicalBackup = true;
    } else if (code.startsWith('WW-BONO-') || code.startsWith('BONO-') || code === 'BIENVENIDA-15' || code === 'BONO-BIENVENIDA' || code === 'WW-BIENVENIDA') {
      resolvedPlanType = 'FREE_15';
      isCanonicalBackup = true;
    } else if (code === 'WOLVES2026' || code.startsWith('FOLIO-')) {
      resolvedPlanType = 'PRO_99';
      isCanonicalBackup = true;
    } else {
      return { success: false, error: 'El código ingresado no existe o es inválido. Solicita tu folio oficial en duela.' };
    }
  } else {
    if (codeData.is_used) {
      return { success: false, error: 'Este código ya ha sido canjeado anteriormente en Wild Wolves CDMX.' };
    }
    if (
      codeData.plan_type === 'FREE_15' || 
      codeData.code?.startsWith('WW-BONO-') || 
      codeData.code?.startsWith('BONO-') || 
      codeData.notes?.includes('[PLAN:FREE_15]')
    ) {
      resolvedPlanType = 'FREE_15';
    } else {
      resolvedPlanType = codeData.plan_type || 'PRO_99';
    }
  }

  // 2. Determinar el usuario objetivo (por userId o por userEmail)
  let targetUserId = userId;
  let targetName = 'Atleta Lobo';

  if (!targetUserId && userEmail) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', userEmail.toLowerCase().trim())
      .maybeSingle();
    if (prof?.id) {
      targetUserId = prof.id;
      targetName = prof.full_name || targetName;
    }
  }

  // 3. Calcular las fechas de los 30 días exactos (temporizador)
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + 30);

  const maxQueries = resolvedPlanType === 'ELITE_149' ? 100 : resolvedPlanType === 'PRO_99' ? 50 : 15;
  const aiPlanSlug = resolvedPlanType === 'ELITE_149' ? 'elite_familiar' : resolvedPlanType === 'PRO_99' ? 'pro' : 'welcome_15';

  // 4. Actualizar el estado del usuario en ai_usage_limits y profiles si hay usuario identificado
  if (targetUserId) {
    // 4.1 Actualizar ai_usage_limits
    const { error: updateLimitsError } = await supabase
      .from('ai_usage_limits')
      .upsert(
        {
          user_id: targetUserId,
          plan_type: aiPlanSlug,
          subscription_plan: resolvedPlanType,
          subscription_status: 'ACTIVE',
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          reset_date: expiresAt.toISOString(),
          max_consultations: maxQueries,
          consultations_used: 0,
          last_consultation_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (updateLimitsError) {
      console.warn('Error al actualizar ai_usage_limits:', updateLimitsError.message);
    }

    // 4.2 Actualizar profiles
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'ACTIVE',
        subscription_plan: resolvedPlanType,
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        ai_plan: aiPlanSlug,
        ai_queries_used: 0,
        ai_plan_status: 'active',
        ai_plan_activated_at: now.toISOString(),
        ai_plan_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', targetUserId);
  }

  // 5. Marcar el código como utilizado en activation_codes
  if (codeData?.id) {
    await supabase
      .from('activation_codes')
      .update({
        is_used: true,
        used_by: targetUserId || null,
        used_by_email: userEmail || null,
        used_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', codeData.id);
  } else if (isCanonicalBackup) {
    // Registrar el código canónico como usado de forma segura
    const canonicalPayload: Record<string, any> = {
      code: code,
      plan_type: resolvedPlanType,
      is_used: true,
      used_by: targetUserId || null,
      used_by_email: userEmail || null,
      used_at: now.toISOString()
    };
    
    // Intento con upsert base
    await supabase
      .from('activation_codes')
      .upsert(canonicalPayload, { onConflict: 'code' });
  }

  // Revalidar rutas principales
  try {
    revalidatePath('/dashboard-student');
    revalidatePath('/dashboard-guardian');
    revalidatePath('/master-bunker-hq');
  } catch {}

  const planTitle = resolvedPlanType === 'ELITE_149' 
    ? 'Pack Familiar Élite ($149 MXN)' 
    : resolvedPlanType === 'PRO_99' 
    ? 'Atleta Lobo Pro ($99 MXN)' 
    : 'Bono de Bienvenida Wild Wolves (15 Consultas IA)';

  return {
    success: true,
    plan: resolvedPlanType,
    maxQueries,
    expiresAt: expiresAt.toISOString(),
    message: `¡${planTitle} activado con éxito por 30 días (${maxQueries} consultas de IA)!`
  };
}

/**
 * Server Action: Generar Nuevo Código de Duela para el SuperAdmin Bunker
 * Resuelve problemas de sincronización de esquema validando si la propiedad 'notes' viene presente
 */
export async function generarNuevoCodigoFolioAction({
  planType = 'PRO_99',
  notes,
  customCode
}: {
  planType: 'PRO_99' | 'ELITE_149' | 'FREE_15';
  notes?: string;
  customCode?: string;
}) {
  const supabase = getAdminSupabase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const prefix = planType === 'ELITE_149' ? 'WW-FAM' : planType === 'FREE_15' ? 'WW-BONO' : 'WW-PRO';
  const generatedCode = customCode ? customCode.trim().toUpperCase() : `${prefix}-${randomSuffix}`;

  // 1. Construir payload base garantizado
  const insertPayload: Record<string, any> = {
    code: generatedCode,
    plan_type: planType,
    is_used: false
  };

  // 2. Validar si la propiedad notes viene presente con contenido antes de enviarla
  const cleanNotes = typeof notes === 'string' ? notes.trim() : '';
  if (cleanNotes.length > 0) {
    insertPayload.notes = cleanNotes;
  }

  // 3. Intento primario de inserción
  let { data, error } = await supabase
    .from('activation_codes')
    .insert(insertPayload)
    .select()
    .single();

  // 4. Si falla por restricción de plan_type en la BD (ej. check constraint previo sin FREE_15)
  if (error && (error.message?.includes('activation_codes_plan_type_check') || error.message?.includes('check constraint'))) {
    console.warn('[ActivationCodes] Constraint plan_type detectado en BD, guardando FREE_15 de forma compatible...');
    const taggedNotes = (cleanNotes ? cleanNotes + ' | ' : '') + '[PLAN:FREE_15] Bono Bienvenida 15 IA';
    const fallbackPayload: Record<string, any> = {
      code: generatedCode,
      plan_type: 'PRO_99',
      is_used: false,
      notes: taggedNotes
    };
    const retry = await supabase
      .from('activation_codes')
      .insert(fallbackPayload)
      .select()
      .single();

    if (retry.data) {
      data = { ...retry.data, plan_type: 'FREE_15' };
      error = null;
    } else {
      error = retry.error;
    }
  }

  // 5. Si falla por desincronización de caché del esquema en la columna 'notes', reintentar sin ella
  if (error && (error.message?.toLowerCase().includes('notes') || error.code === 'PGRST204')) {
    console.warn('[ActivationCodes] Reintentando inserción sin campo notes debido a caché de esquema PostgREST:', error.message);
    const resilientPayload = {
      code: generatedCode,
      plan_type: planType === 'FREE_15' ? 'PRO_99' : planType,
      is_used: false
    };
    const retry = await supabase
      .from('activation_codes')
      .insert(resilientPayload)
      .select()
      .single();
    
    if (retry.data) {
      data = { ...retry.data, plan_type: planType };
      error = null;
    } else {
      error = retry.error;
    }
  }

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    revalidatePath('/master-bunker-hq');
  } catch {}

  // Normalizar plan_type si fue FREE_15
  if (data && planType === 'FREE_15') {
    data.plan_type = 'FREE_15';
  }

  return { success: true, code: data };
}

/**
 * Server Action: Listar Códigos de Activación para el Búnker
 */
export async function listarCodigosActivacionAction() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('activation_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, codes: [], error: error.message };
  }

  // Normalizar códigos de cortesía FREE_15 para visualización limpia
  const normalizedCodes = (data || []).map((item) => {
    const isFreeBonus = 
      item.plan_type === 'FREE_15' || 
      item.code?.startsWith('WW-BONO-') || 
      item.code?.startsWith('BONO-') || 
      item.code === 'BIENVENIDA-15' || 
      item.notes?.includes('[PLAN:FREE_15]');

    let displayNotes = item.notes || '';
    if (displayNotes.includes('[PLAN:FREE_15]')) {
      displayNotes = displayNotes
        .replace(/\|\s*\[PLAN:FREE_15\][^\n]*/g, '')
        .replace(/\[PLAN:FREE_15\][^\n]*/g, '')
        .trim();
    }

    return {
      ...item,
      plan_type: isFreeBonus ? 'FREE_15' : item.plan_type,
      notes: displayNotes || (isFreeBonus ? 'Bono Bienvenida (15 Consultas IA)' : item.notes)
    };
  });

  return { success: true, codes: normalizedCodes };
}

/**
 * Server Action: Limpiar Todos los Códigos de Activación (SuperAdmin Wipe)
 * Vacía la tabla public.activation_codes para reiniciar la auditoría a 0.
 */
export async function vaciarTodosLosCodigosAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  const supabase = getAdminSupabase();

  try {
    const { data, error } = await supabase
      .from('activation_codes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');

    if (error) {
      console.error('[vaciarTodosLosCodigosAction] Error al limpiar folios:', error.message);
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/master-bunker-hq');
    } catch {}

    return {
      success: true,
      count: data?.length ?? 0
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error inesperado al vaciar folios de activación.'
    };
  }
}
