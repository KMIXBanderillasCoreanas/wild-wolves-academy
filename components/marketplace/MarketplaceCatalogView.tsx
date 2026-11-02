'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  Shirt, 
  Layers,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { 
  MarketplaceItem, 
  MarketplaceCategory, 
  MarketplaceCondition, 
  MarketplaceShift,
  CATEGORY_LABELS, 
  CONDITION_LABELS, 
  SHIFT_CHECKPOINTS 
} from '@/lib/types/marketplace';
import { getMarketplaceItems } from '@/app/actions/marketplace-actions';
import ItemPostingModal from './ItemPostingModal';
import ItemDetailModal from './ItemDetailModal';
import MarketplaceChatDrawer from './MarketplaceChatDrawer';

interface MarketplaceCatalogViewProps {
  currentUserId: string;
  currentUserName?: string;
  currentUserRole?: string;
}

export default function MarketplaceCatalogView({
  currentUserId,
  currentUserName,
  currentUserRole
}: MarketplaceCatalogViewProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'todas'>('todas');
  const [selectedCondition, setSelectedCondition] = useState<MarketplaceCondition | 'todas'>('todas');
  const [selectedShift, setSelectedShift] = useState<MarketplaceShift | 'todas'>('todas');

  // Modales
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MarketplaceItem | null>(null);
  const [selectedItemForChat, setSelectedItemForChat] = useState<MarketplaceItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const res = await getMarketplaceItems({
      category: selectedCategory,
      condition: selectedCondition,
      shift: selectedShift,
      searchQuery
    });
    if (res.success) {
      setItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedCondition, selectedShift]);

  // Búsqueda con debounce simple
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Banner Principal de la Comunidad */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-[#141a29] via-[#0f1422] to-[#1a130f] p-6 text-zinc-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-orange-400 border border-orange-500/30">
                <HeartHandshake className="h-3 w-3" />
                Intercambio Solidario
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/30">
                Deportivo Carmen Serdán
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white tracking-tight">
              Bazar Lobo: Trueque y Compraventa Deportiva
            </h1>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Intercambia tenis, uniformes oficiales y equipo de básquetbol directamente con familias de la academia. Entregas seguras en duela durante los turnos matutino y vespertino.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPostingModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/25 hover:from-orange-500 hover:to-amber-500 transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            Publicar Artículo / Donar
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-[#0d111c] p-4">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, modelo de tenis, talla o accesorio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Categorías (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('todas')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
              selectedCategory === 'todas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Todas
          </button>

          {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key as MarketplaceCategory)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                selectedCategory === key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <span>{val.icon}</span>
              <span>{val.label}</span>
            </button>
          ))}
        </div>

        {/* Filtros secundarios: Condición y Turno de Entrega */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Estado:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as any)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="todas">Todos los estados</option>
              <option value="nuevo_con_etiqueta">Nuevo con Etiqueta</option>
              <option value="como_nuevo">Como Nuevo</option>
              <option value="buen_estado">Buen Estado</option>
              <option value="donacion_gratuita">Donación Solidaria ($0 MXN)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Punto de Entrega:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as any)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="todas">Cualquier turno en Carmen Serdán</option>
              <option value="matutino_9_11">Turno Matutino (09:00 - 11:00)</option>
              <option value="vespertino_5_7">Turno Vespertino (17:00 - 19:00)</option>
              <option value="fin_de_semana">Sábados / Clínicas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Artículos */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500 animate-pulse">
          Cargando catálogo del Bazar Lobo...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#0d111c] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">No hay artículos publicados</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
            Sé el primero de la manada en publicar tenis, uniformes o equipo para apoyar a otros atletas.
          </p>
          <button
            type="button"
            onClick={() => setIsPostingModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-orange-500 transition"
          >
            <Plus className="h-4 w-4" />
            Publicar Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const conditionInfo = CONDITION_LABELS[item.condition] || { label: item.condition, badgeColor: 'bg-zinc-800 text-zinc-300' };
            const categoryInfo = CATEGORY_LABELS[item.category] || { label: item.category, icon: '🏀' };
            const shiftText = SHIFT_CHECKPOINTS[item.preferred_shift as keyof typeof SHIFT_CHECKPOINTS] || item.preferred_shift;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemForDetail(item)}
                className="group relative cursor-pointer rounded-2xl border border-zinc-800/80 bg-[#0e121e] hover:border-orange-500/50 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-orange-500/10"
              >
                {/* Imagen del Artículo */}
                <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                  <img
                    src={item.images_urls?.[0] || '/logo-official.png'}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badge de Precio o Donación */}
                  <div className="absolute top-3 left-3">
                    {item.price_mxn > 0 ? (
                      <span className="rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1 text-xs font-black text-[#d1fe17] border border-zinc-700 shadow">
                        ${item.price_mxn} MXN
                      </span>
                    ) : (
                      <span className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-black uppercase text-white shadow">
                        Donación
                      </span>
                    )}
                  </div>

                  {/* Estado si está apartado */}
                  {item.status === 'reserved' && (
                    <div className="absolute top-3 right-3 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-black shadow">
                      Apartado
                    </div>
                  )}

                  {/* Categoría en esquina inferior */}
                  <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                    {categoryInfo.icon} {categoryInfo.label}
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    {/* Talla y Condición */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {item.size_tag && (
                        <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-orange-400 border border-zinc-700">
                          {item.size_tag}
                        </span>
                      )}
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${conditionInfo.badgeColor}`}>
                        {conditionInfo.label}
                      </span>
                    </div>

                    {/* Turno de Entrega en Duela */}
                    <p className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1 line-clamp-1">
                      <Clock className="h-3 w-3 text-orange-400 shrink-0" />
                      <span>{shiftText}</span>
                    </p>
                  </div>

                  {/* Vendedor y Reputación */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="truncate font-semibold text-zinc-300">
                      {item.seller?.full_name || 'Vendedor Lobo'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {item.seller?.trust_score || '5.0'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales integrados */}
      <ItemPostingModal
        isOpen={isPostingModalOpen}
        onClose={() => setIsPostingModalOpen(false)}
        sellerId={currentUserId}
        onItemCreated={fetchItems}
      />

      <ItemDetailModal
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        currentUserId={currentUserId}
        userRole={currentUserRole}
        onOpenChat={(item) => setSelectedItemForChat(item)}
        onItemUpdated={fetchItems}
      />

      <MarketplaceChatDrawer
        item={selectedItemForChat}
        isOpen={Boolean(selectedItemForChat)}
        onClose={() => setSelectedItemForChat(null)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onItemUpdated={fetchItems}
      />
    </div>
  );
}
