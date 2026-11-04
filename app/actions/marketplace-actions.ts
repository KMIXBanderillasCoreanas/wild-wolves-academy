'use server';

import { createClient } from '@supabase/supabase-js';
import { 
  MarketplaceItem, 
  MarketplaceCategory, 
  MarketplaceCondition,
  MarketplaceShift,
  MarketplaceThread,
  MarketplaceMessage,
  MarketplaceReview
} from '@/lib/types/marketplace';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgzuttxfmrfcgsceczql.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Filtro de Protección de Menores: Sanitiza números telefónicos y enlaces externos
 */
function sanitizeMinorProtectionContent(text: string): { cleanContent: string; flagged: boolean } {
  // Regex para números telefónicos de 10 dígitos (formato México: 55-XXXX-XXXX, etc.)
  const phoneRegex = /(\+?52\s?)?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
  // Regex para enlaces de WhatsApp y redes sociales
  const linksRegex = /(wa\.me|whatsapp\.com|instagram\.com|facebook\.com|t\.me|bit\.ly|https?:\/\/[^\s]+)/gi;

  let flagged = false;
  let cleanContent = text;

  if (phoneRegex.test(cleanContent) || linksRegex.test(cleanContent)) {
    flagged = true;
    cleanContent = cleanContent
      .replace(phoneRegex, '[TELÉFONO PROTEGIDO]')
      .replace(linksRegex, '[ENLACE EXTERNO BLOQUEADO]');
  }

  return { cleanContent, flagged };
}

/**
 * 1. Obtener catálogo de artículos activos con filtro opcional
 */
export async function getMarketplaceItems(filters?: {
  category?: MarketplaceCategory | 'todas';
  condition?: MarketplaceCondition | 'todas';
  shift?: MarketplaceShift | 'todas';
  searchQuery?: string;
}): Promise<{ success: boolean; data: MarketplaceItem[]; error?: string }> {
  try {
    let query = supabase
      .from('marketplace_items')
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          full_name,
          role,
          avatar_url,
          trust_score,
          completed_exchanges_count
        )
      `)
      .in('status', ['active', 'reserved'])
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'todas') {
      query = query.eq('category', filters.category);
    }

    if (filters?.condition && filters.condition !== 'todas') {
      query = query.eq('condition', filters.condition);
    }

    if (filters?.shift && filters.shift !== 'todas') {
      query = query.eq('preferred_shift', filters.shift);
    }

    if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
      query = query.ilike('title', `%${filters.searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: (data as unknown as MarketplaceItem[]) || [] };
  } catch (err: any) {
    console.error('Error in getMarketplaceItems:', err);
    return { success: false, data: [], error: err.message || 'Error al cargar catálogo' };
  }
}

/**
 * 2. Publicar nuevo artículo en el Bazar Lobo
 */
export async function createMarketplaceItem(params: {
  sellerId: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  condition: MarketplaceCondition;
  priceMxn: number;
  sizeTag?: string;
  preferredShift: MarketplaceShift | string;
  imagesUrls: string[];
}): Promise<{ success: boolean; item?: MarketplaceItem; error?: string }> {
  try {
    if (!params.sellerId || !params.title || !params.category) {
      return { success: false, error: 'Faltan campos obligatorios para publicar el artículo.' };
    }

    const { cleanContent } = sanitizeMinorProtectionContent(params.description);

    const { data, error } = await supabase
      .from('marketplace_items')
      .insert({
        seller_id: params.sellerId,
        title: params.title.trim(),
        description: cleanContent,
        category: params.category,
        condition: params.condition,
        price_mxn: Number(params.priceMxn) || 0,
        size_tag: params.sizeTag?.trim() || null,
        preferred_shift: params.preferredShift,
        images_urls: params.imagesUrls || [],
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, item: data as MarketplaceItem };
  } catch (err: any) {
    console.error('Error in createMarketplaceItem:', err);
    return { success: false, error: err.message || 'Error al publicar artículo' };
  }
}

/**
 * 3. Reservar artículo para un comprador específico
 */
export async function reserveMarketplaceItem(params: {
  itemId: string;
  sellerId: string;
  buyerId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('marketplace_items')
      .update({
        status: 'reserved',
        buyer_id: params.buyerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.itemId)
      .eq('seller_id', params.sellerId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in reserveMarketplaceItem:', err);
    return { success: false, error: err.message || 'Error al reservar artículo' };
  }
}

/**
 * 4. Marcar intercambio como completado en Duela Carmen Serdán
 */
export async function completeMarketplaceItem(params: {
  itemId: string;
  sellerId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('marketplace_items')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.itemId)
      .eq('seller_id', params.sellerId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in completeMarketplaceItem:', err);
    return { success: false, error: err.message || 'Error al completar artículo' };
  }
}

/**
 * 5. Archivar o remover artículo (vendedor o coach moderador)
 */
export async function archiveMarketplaceItem(params: {
  itemId: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('marketplace_items')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.itemId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in archiveMarketplaceItem:', err);
    return { success: false, error: err.message || 'Error al archivar artículo' };
  }
}

/**
 * 6. Crear u obtener hilo de chat seguro entre comprador y vendedor
 */
export async function getOrCreateMarketplaceThread(params: {
  itemId: string;
  buyerId: string;
  sellerId: string;
}): Promise<{ success: boolean; thread?: MarketplaceThread; error?: string }> {
  try {
    if (params.buyerId === params.sellerId) {
      return { success: false, error: 'No puedes iniciar un chat contigo mismo.' };
    }

    // Buscar si ya existe el hilo
    const { data: existing, error: findErr } = await supabase
      .from('marketplace_chat_threads')
      .select(`
        *,
        item:marketplace_items (*),
        seller:profiles!seller_id (id, full_name, avatar_url, role, trust_score),
        buyer:profiles!buyer_id (id, full_name, avatar_url, role, trust_score)
      `)
      .eq('item_id', params.itemId)
      .eq('buyer_id', params.buyerId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (existing) return { success: true, thread: existing as unknown as MarketplaceThread };

    // Crear nuevo hilo
    const { data: created, error: createErr } = await supabase
      .from('marketplace_chat_threads')
      .insert({
        item_id: params.itemId,
        buyer_id: params.buyerId,
        seller_id: params.sellerId,
        last_message_preview: 'Conversación iniciada'
      })
      .select(`
        *,
        item:marketplace_items (*),
        seller:profiles!seller_id (id, full_name, avatar_url, role, trust_score),
        buyer:profiles!buyer_id (id, full_name, avatar_url, role, trust_score)
      `)
      .single();

    if (createErr) throw createErr;
    return { success: true, thread: created as unknown as MarketplaceThread };
  } catch (err: any) {
    console.error('Error in getOrCreateMarketplaceThread:', err);
    return { success: false, error: err.message || 'Error al inicializar chat seguro' };
  }
}

/**
 * 7. Obtener mensajes de un hilo
 */
export async function getThreadMessages(threadId: string): Promise<{ success: boolean; data: MarketplaceMessage[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('marketplace_messages')
      .select(`
        *,
        sender:profiles!sender_id (id, full_name, avatar_url, role)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: (data as unknown as MarketplaceMessage[]) || [] };
  } catch (err: any) {
    console.error('Error in getThreadMessages:', err);
    return { success: false, data: [], error: err.message || 'Error al obtener mensajes' };
  }
}

/**
 * 8. Enviar mensaje dentro del hilo seguro con sanitización de PII
 */
export async function sendMarketplaceMessage(params: {
  threadId: string;
  senderId: string;
  content: string;
}): Promise<{ success: boolean; message?: MarketplaceMessage; flaggedNotice?: boolean; error?: string }> {
  try {
    const trimmed = params.content.trim();
    if (!trimmed) return { success: false, error: 'El mensaje no puede estar vacío.' };

    const { cleanContent, flagged } = sanitizeMinorProtectionContent(trimmed);

    const { data, error } = await supabase
      .from('marketplace_messages')
      .insert({
        thread_id: params.threadId,
        sender_id: params.senderId,
        content: cleanContent
      })
      .select(`
        *,
        sender:profiles!sender_id (id, full_name, avatar_url, role)
      `)
      .single();

    if (error) throw error;

    // Actualizar vista previa en el hilo
    await supabase
      .from('marketplace_chat_threads')
      .update({
        last_message_preview: cleanContent.slice(0, 80),
        last_message_at: new Date().toISOString()
      })
      .eq('id', params.threadId);

    return { 
      success: true, 
      message: data as unknown as MarketplaceMessage, 
      flaggedNotice: flagged 
    };
  } catch (err: any) {
    console.error('Error in sendMarketplaceMessage:', err);
    return { success: false, error: err.message || 'Error al enviar mensaje' };
  }
}

/**
 * 9. Enviar reseña de reputación Lobo Trust
 */
export async function submitMarketplaceReview(params: {
  itemId: string;
  reviewerId: string;
  reviewedUserId: string;
  ratingScore: number;
  punctualOnCourt: boolean;
  gearAsDescribed: boolean;
  comment?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('marketplace_reviews')
      .insert({
        item_id: params.itemId,
        reviewer_id: params.reviewerId,
        reviewed_user_id: params.reviewedUserId,
        rating_score: Math.min(5, Math.max(1, params.ratingScore)),
        punctual_on_court: params.punctualOnCourt,
        gear_as_described: params.gearAsDescribed,
        comment: params.comment?.trim() || null
      });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error in submitMarketplaceReview:', err);
    return { success: false, error: err.message || 'Error al emitir reseña Lobo Trust' };
  }
}
