'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  MessageCircle, 
  CheckCircle2, 
  User, 
  Tag, 
  DollarSign,
  Share2,
  Trash2
} from 'lucide-react';
import { 
  MarketplaceItem, 
  CATEGORY_LABELS, 
  CONDITION_LABELS, 
  SHIFT_CHECKPOINTS 
} from '@/lib/types/marketplace';
import { archiveMarketplaceItem } from '@/app/actions/marketplace-actions';

interface ItemDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  userRole?: string;
  onOpenChat: (item: MarketplaceItem) => void;
  onItemUpdated: () => void;
}

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  currentUserId,
  userRole,
  onOpenChat,
  onItemUpdated
}: ItemDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !item) return null;

  const isSeller = currentUserId === item.seller_id;
  const isCoachOrAdmin = userRole === 'coach' || userRole === 'superadmin';
  const canModerate = isSeller || isCoachOrAdmin;

  const handleArchive = async () => {
    if (!confirm('¿Estás seguro de archivar este artículo? Ya no aparecerá en el catálogo activo.')) return;
    setLoadingAction(true);
    await archiveMarketplaceItem({ itemId: item.id, userId: currentUserId });
    setLoadingAction(false);
    onItemUpdated();
    onClose();
  };

  const images = item.images_urls && item.images_urls.length > 0 
    ? item.images_urls 
    : ['/logo-official.png'];

  const categoryInfo = CATEGORY_LABELS[item.category] || { label: item.category, icon: '🏀' };
  const conditionInfo = CONDITION_LABELS[item.condition] || { label: item.condition, badgeColor: 'bg-zinc-800 text-zinc-300' };
  const shiftText = SHIFT_CHECKPOINTS[item.preferred_shift as keyof typeof SHIFT_CHECKPOINTS] || item.preferred_shift;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-[#0e131f] text-zinc-100 shadow-2xl overflow-hidden my-6">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2 text-zinc-300 hover:bg-black/90 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Galería de imágenes */}
          <div className="bg-black/40 p-4 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img
                src={images[activeImageIndex]}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              {item.status === 'reserved' && (
                <div className="absolute top-3 left-3 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-black uppercase text-black shadow">
                  Apartado / En Trato
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      activeImageIndex === idx ? 'border-orange-500 scale-105' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={imgUrl} alt={`Foto ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información y detalles */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Badges de Categoría y Condición */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200">
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </span>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold border ${conditionInfo.badgeColor}`}>
                  {conditionInfo.label}
                </span>
              </div>

              {/* Título y Precio */}
              <h1 className="mt-3 text-xl font-black text-white leading-tight">
                {item.title}
              </h1>

              <div className="mt-2 flex items-baseline gap-2">
                {item.price_mxn > 0 ? (
                  <span className="text-2xl font-black text-[#d1fe17]">
                    ${item.price_mxn} <span className="text-sm font-semibold text-zinc-400">MXN</span>
                  </span>
                ) : (
                  <span className="text-2xl font-black text-purple-400">
                    Gratis / Donación
                  </span>
                )}
                {item.size_tag && (
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-bold text-orange-400 border border-zinc-700">
                    Talla: {item.size_tag}
                  </span>
                )}
              </div>

              {/* Punto de Entrega en Duela Carmen Serdán */}
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  Punto de Intercambio
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-200">
                  {shiftText}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  Entrega en mano durante los horarios oficiales de entrenamiento.
                </p>
              </div>

              {/* Descripción */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Detalles del Producto
                </h3>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Vendedor y Reputación Lobo Trust */}
              <div className="mt-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 font-black text-sm">
                    {item.seller?.full_name ? item.seller.full_name[0].toUpperCase() : 'L'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {item.seller?.full_name || 'Miembro de la Manada'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {item.seller?.trust_score || '5.0'} Lobo Trust
                      </span>
                      <span>•</span>
                      <span>{item.seller?.completed_exchanges_count || 0} intercambios</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
              {canModerate && (
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={loadingAction}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Archivar
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition"
                >
                  Cerrar
                </button>

                {!isSeller ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat(item);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-500 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contactar / Intercambiar
                  </button>
                ) : (
                  <span className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-400">
                    Tu Artículo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
