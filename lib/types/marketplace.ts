export type MarketplaceCategory =
  | 'calzado'
  | 'uniformes_ropa'
  | 'balones'
  | 'proteccion_rodilleras'
  | 'accesorios_entrenamiento';

export type MarketplaceCondition =
  | 'nuevo_con_etiqueta'
  | 'como_nuevo'
  | 'buen_estado'
  | 'donacion_gratuita';

export type MarketplaceItemStatus =
  | 'active'
  | 'reserved'
  | 'completed'
  | 'archived'
  | 'cancelled';

export type MarketplaceShift =
  | 'matutino_9_11'
  | 'vespertino_5_7'
  | 'fin_de_semana'
  | 'acuerdo_previo';

export interface MarketplaceSeller {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  trust_score?: number;
  completed_exchanges_count?: number;
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  condition: MarketplaceCondition;
  price_mxn: number;
  size_tag: string | null;
  preferred_shift: MarketplaceShift | string;
  images_urls: string[];
  status: MarketplaceItemStatus;
  buyer_id: string | null;
  created_at: string;
  updated_at: string;
  seller?: MarketplaceSeller;
}

export interface MarketplaceThread {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_preview: string | null;
  last_message_at: string;
  created_at: string;
  item?: MarketplaceItem;
  buyer?: MarketplaceSeller;
  seller?: MarketplaceSeller;
}

export interface MarketplaceMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: MarketplaceSeller;
}

export interface MarketplaceReview {
  id: string;
  item_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating_score: number;
  punctual_on_court: boolean;
  gear_as_described: boolean;
  comment: string | null;
  created_at: string;
}

export const CATEGORY_LABELS: Record<MarketplaceCategory, { label: string; icon: string }> = {
  calzado: { label: 'Tenis y Calzado', icon: '👟' },
  uniformes_ropa: { label: 'Uniformes y Ropa', icon: '🎽' },
  balones: { label: 'Balones de Básquetbol', icon: '🏀' },
  proteccion_rodilleras: { label: 'Protección y Rodilleras', icon: '🛡️' },
  accesorios_entrenamiento: { label: 'Accesorios de Entrenamiento', icon: '🎒' },
};

export const CONDITION_LABELS: Record<MarketplaceCondition, { label: string; badgeColor: string }> = {
  nuevo_con_etiqueta: { label: 'Nuevo con Etiqueta', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  como_nuevo: { label: 'Como Nuevo (Poco uso)', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  buen_estado: { label: 'Buen Estado / Funcional', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  donacion_gratuita: { label: 'Donación Solidaria ($0 MXN)', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
};

export const SHIFT_CHECKPOINTS: Record<MarketplaceShift, string> = {
  matutino_9_11: 'Duela Carmen Serdán - Matutino (09:00 - 11:00)',
  vespertino_5_7: 'Duela Carmen Serdán - Vespertino (17:00 - 19:00)',
  fin_de_semana: 'Duela Carmen Serdán - Sábados / Clínicas',
  acuerdo_previo: 'Entrega por Acuerdo Previo en Duela',
};
