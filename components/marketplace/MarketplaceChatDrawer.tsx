'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Lock, 
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  MarketplaceItem, 
  MarketplaceThread, 
  MarketplaceMessage 
} from '@/lib/types/marketplace';
import { 
  getOrCreateMarketplaceThread, 
  getThreadMessages, 
  sendMarketplaceMessage,
  reserveMarketplaceItem,
  completeMarketplaceItem,
  submitMarketplaceReview
} from '@/app/actions/marketplace-actions';
import { supabase } from '@/lib/supabaseClient';

interface MarketplaceChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem | null;
  currentUserId: string;
  currentUserName?: string;
  onItemUpdated: () => void;
}

export default function MarketplaceChatDrawer({
  isOpen,
  onClose,
  item,
  currentUserId,
  currentUserName,
  onItemUpdated
}: MarketplaceChatDrawerProps) {
  const [thread, setThread] = useState<MarketplaceThread | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Modal de Reseña
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [punctualOnCourt, setPunctualOnCourt] = useState(true);
  const [gearAsDescribed, setGearAsDescribed] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar o cargar hilo
  useEffect(() => {
    if (!isOpen || !item) return;

    let isMounted = true;
    setLoading(true);
    setWarningNotice(null);

    async function initThread() {
      if (!item) return;
      const res = await getOrCreateMarketplaceThread({
        itemId: item.id,
        buyerId: currentUserId,
        sellerId: item.seller_id
      });

      if (!isMounted) return;

      if (res.success && res.thread) {
        setThread(res.thread);
        const msgsRes = await getThreadMessages(res.thread.id);
        if (isMounted && msgsRes.success) {
          setMessages(msgsRes.data);
        }
      } else {
        setWarningNotice(res.error || 'Error al conectar hilo seguro.');
      }
      setLoading(false);
    }

    initThread();

    return () => {
      isMounted = false;
    };
  }, [isOpen, item, currentUserId]);

  // Suscripción en tiempo real a Supabase Realtime
  useEffect(() => {
    if (!thread) return;

    const channel = supabase
      .channel(`marketplace-thread-${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_messages',
          filter: `thread_id=eq.${thread.id}`
        },
        (payload) => {
          const newMsg = payload.new as MarketplaceMessage;
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thread]);

  // Scroll automático hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !item) return null;

  const isSeller = currentUserId === item.seller_id;
  const otherPartyName = isSeller
    ? thread?.buyer?.full_name || 'Comprador'
    : item.seller?.full_name || 'Vendedor';

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputContent;
    if (!textToSend.trim() || !thread) return;

    setSending(true);
    setWarningNotice(null);

    const res = await sendMarketplaceMessage({
      threadId: thread.id,
      senderId: currentUserId,
      content: textToSend
    });

    setSending(false);

    if (res.success && res.message) {
      if (!customText) setInputContent('');
      if (res.flaggedNotice) {
        setWarningNotice('Nota de Seguridad: Se protegieron datos de contacto privados. Recuerda que los intercambios se realizan en la duela del Deportivo Carmen Serdán.');
      }
      setMessages(prev => [...prev, res.message!]);
    } else {
      setWarningNotice(res.error || 'No se pudo enviar el mensaje.');
    }
  };

  const handleReserveItem = async () => {
    if (!thread) return;
    const res = await reserveMarketplaceItem({
      itemId: item.id,
      sellerId: currentUserId,
      buyerId: thread.buyer_id
    });
    if (res.success) {
      onItemUpdated();
      handleSendMessage('🤝 He apartado este artículo para ti. Nos vemos en el turno acordado en Duela Carmen Serdán.');
    }
  };

  const handleCompleteItem = async () => {
    const res = await completeMarketplaceItem({
      itemId: item.id,
      sellerId: currentUserId
    });
    if (res.success) {
      onItemUpdated();
      setShowReviewModal(true);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    const targetUserId = isSeller ? thread?.buyer_id : item.seller_id;
    if (!targetUserId) return;

    const res = await submitMarketplaceReview({
      itemId: item.id,
      reviewerId: currentUserId,
      reviewedUserId: targetUserId,
      ratingScore,
      punctualOnCourt,
      gearAsDescribed,
      comment: reviewComment
    });

    setSubmittingReview(false);
    if (res.success) {
      setShowReviewModal(false);
      onItemUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-full flex flex-col bg-[#0c101a] border-l border-zinc-800 text-zinc-100 shadow-2xl">
        {/* Cabecera del chat */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-[#101524]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 font-bold">
              {otherPartyName[0]?.toUpperCase() || 'L'}
            </div>
            <div>
              <h2 className="text-sm font-black text-white">{otherPartyName}</h2>
              <p className="text-[11px] text-zinc-400">
                {isSeller ? 'Interesado en tu artículo' : 'Vendedor de la Manada'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tarjeta de contexto del artículo */}
        <div className="border-b border-zinc-800/80 bg-zinc-900/60 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={item.images_urls?.[0] || '/logo-official.png'}
              alt={item.title}
              className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{item.title}</p>
              <p className="text-[11px] font-black text-[#d1fe17]">
                {item.price_mxn > 0 ? `$${item.price_mxn} MXN` : 'Gratis / Donación'}
              </p>
            </div>
          </div>

          {/* Acciones de estado para el vendedor */}
          {isSeller && (
            <div className="shrink-0 flex items-center gap-1.5">
              {item.status === 'active' && (
                <button
                  type="button"
                  onClick={handleReserveItem}
                  className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-black uppercase text-amber-400 hover:bg-amber-500/20 transition"
                >
                  Apartar
                </button>
              )}
              {item.status === 'reserved' && (
                <button
                  type="button"
                  onClick={handleCompleteItem}
                  className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  Entregado
                </button>
              )}
            </div>
          )}
        </div>

        {/* Banner de Protección a Menores */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-3 py-2 flex items-center gap-2 text-[10px] text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Punto Seguro:</strong> Acuerden encontrarse en Duela Carmen Serdán en los horarios de entrenamiento.
          </span>
        </div>

        {warningNotice && (
          <div className="bg-amber-950/40 border-b border-amber-500/20 px-3 py-2 flex items-center gap-2 text-[10px] text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{warningNotice}</span>
          </div>
        )}

        {/* Feed de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500 animate-pulse">
              Cargando mensajes del intercambio...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-400">No hay mensajes previos.</p>
              <p className="text-[11px] text-zinc-500 mt-1">Usa los botones rápidos o escribe tu propuesta de intercambio.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-xs'
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-xs border border-zinc-700/60'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Botones de sugerencias rápidas */}
        <div className="p-2 border-t border-zinc-800/60 bg-[#0e1320] flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleSendMessage('¿Nos vemos en el turno vespertino (17:00 a 19:00)?')}
            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-orange-500 hover:text-white transition"
          >
            🏀 ¿Turno vespertino?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('¿Nos vemos en el turno matutino (09:00 a 11:00)?')}
            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-orange-500 hover:text-white transition"
          >
            ☀️ ¿Turno matutino?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('¿Sigue disponible para probarlo este sábado?')}
            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-300 hover:border-orange-500 hover:text-white transition"
          >
            📅 ¿Disponible sábado?
          </button>
        </div>

        {/* Input para redactar mensaje */}
        <div className="p-3 border-t border-zinc-800 bg-[#0a0d14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje para coordinar en duela..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              disabled={sending}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !inputContent.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md hover:from-orange-500 hover:to-amber-500 transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Modal de Calificación Lobo Trust */}
        {showReviewModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-orange-500/30 bg-[#0f1422] p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-black text-white">Calificar Intercambio</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Tu evaluación fortalece la reputación y confianza de la manada.
              </p>

              {/* Estrellas */}
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 transition hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Checklist */}
              <div className="mt-4 space-y-2 text-left text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={punctualOnCourt}
                    onChange={(e) => setPunctualOnCourt(e.target.checked)}
                    className="rounded text-orange-500"
                  />
                  <span>Puntual en la duela Carmen Serdán</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={gearAsDescribed}
                    onChange={(e) => setGearAsDescribed(e.target.checked)}
                    className="rounded text-orange-500"
                  />
                  <span>Artículo en el estado descrito</span>
                </label>
              </div>

              {/* Comentario opcional */}
              <textarea
                rows={2}
                placeholder="Comentario sobre el trato (opcional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none resize-none"
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800"
                >
                  Omitir
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="flex-1 rounded-xl bg-orange-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-orange-500 transition"
                >
                  {submittingReview ? 'Guardando...' : 'Enviar Calificación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
