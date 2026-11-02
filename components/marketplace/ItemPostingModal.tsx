'use client';

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Shirt,
  DollarSign
} from 'lucide-react';
import { 
  MarketplaceCategory, 
  MarketplaceCondition, 
  MarketplaceShift,
  CATEGORY_LABELS,
  CONDITION_LABELS,
  SHIFT_CHECKPOINTS
} from '@/lib/types/marketplace';
import { createMarketplaceItem } from '@/app/actions/marketplace-actions';
import { supabase } from '@/lib/supabaseClient';

interface ItemPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  onItemCreated: () => void;
}

export default function ItemPostingModal({
  isOpen,
  onClose,
  sellerId,
  onItemCreated
}: ItemPostingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('calzado');
  const [condition, setCondition] = useState<MarketplaceCondition>('como_nuevo');
  const [priceMxn, setPriceMxn] = useState<number>(150);
  const [isDonation, setIsDonation] = useState(false);
  const [sizeTag, setSizeTag] = useState('');
  const [preferredShift, setPreferredShift] = useState<MarketplaceShift>('vespertino_5_7');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compresión en cliente a WebP (< 500KB)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      setErrorMsg('Máximo 3 fotografías por artículo para optimizar almacenamiento.');
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImageToWebP(file, 800, 800, 0.75);

        // Subir a Supabase Storage bucket 'marketplace_media'
        const fileName = `${sellerId}/${Date.now()}_${i}.webp`;
        const blob = await (await fetch(compressedBase64)).blob();

        const { error: uploadErr } = await supabase.storage
          .from('marketplace_media')
          .upload(fileName, blob, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadErr) {
          // Fallback a Base64 si el bucket de storage no está configurado en local
          newUrls.push(compressedBase64);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('marketplace_media')
            .getPublicUrl(fileName);
          newUrls.push(publicUrlData.publicUrl);
        }
      }

      setImages(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Error al procesar imágenes:', err);
      setErrorMsg('Error al procesar imágenes. Asegúrate de subir fotos válidas.');
    } finally {
      setUploadingImage(false);
    }
  };

  const compressImageToWebP = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No canvas context');

          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Indica el nombre o título del artículo.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Agrega una breve descripción del estado o talla.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const effectivePrice = isDonation ? 0 : Math.max(0, Number(priceMxn));
    const effectiveCondition = isDonation ? 'donacion_gratuita' : condition;

    const res = await createMarketplaceItem({
      sellerId,
      title,
      description,
      category,
      condition: effectiveCondition,
      priceMxn: effectivePrice,
      sizeTag: sizeTag.trim() || undefined,
      preferredShift,
      imagesUrls: images.length > 0 ? images : ['/logo-official.png']
    });

    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Error al publicar artículo.');
    } else {
      onItemCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-orange-500/30 bg-[#0c1019] p-6 text-zinc-100 shadow-2xl my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
              <Shirt className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">Publicar en Bazar Lobo</h2>
              <p className="text-xs text-zinc-400">Intercambio y venta deportiva segura en Deportivo Carmen Serdán</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Nombre del Artículo <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Tenis Nike Kyrie 7, Jersey Oficial Lobo Alfa Talla 12..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          {/* Categoría y Talla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Categoría Deportiva
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Talla / Medida
              </label>
              <input
                type="text"
                placeholder="Ej. 24.5 MX, Talla 14, Balón #6..."
                value={sizeTag}
                onChange={(e) => setSizeTag(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Precio y Donación */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Modalidad de Intercambio
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-400">
                <input
                  type="checkbox"
                  checked={isDonation}
                  onChange={(e) => setIsDonation(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-400"
                />
                Donación Solidaria ($0 MXN)
              </label>
            </div>

            {!isDonation ? (
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 text-sm font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={priceMxn}
                  onChange={(e) => setPriceMxn(Number(e.target.value))}
                  placeholder="Precio en pesos MXN"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm font-bold text-white focus:border-orange-500 focus:outline-none"
                />
                <span className="text-xs text-zinc-400 font-bold shrink-0">MXN</span>
              </div>
            ) : (
              <p className="text-xs text-purple-300 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                ❤️ Gracias por apoyar a los atletas de la academia. Este artículo se listará con precio $0 MXN para beneficio de la manada.
              </p>
            )}
          </div>

          {/* Estado del Producto */}
          {!isDonation && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Condición del Equipo
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MarketplaceCondition)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="nuevo_con_etiqueta">Nuevo con Etiqueta (Sin estrenar)</option>
                <option value="como_nuevo">Como Nuevo (Poco uso / Excelente)</option>
                <option value="buen_estado">Buen Estado / 100% Funcional</option>
              </select>
            </div>
          )}

          {/* Turno de Entrega en Carmen Serdán */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              Punto y Turno de Entrega en Duela
            </label>
            <select
              value={preferredShift}
              onChange={(e) => setPreferredShift(e.target.value as MarketplaceShift)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
            >
              {Object.entries(SHIFT_CHECKPOINTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Descripción y Detalles
            </label>
            <textarea
              rows={2}
              placeholder="Indica meses de uso, detalles estéticos o si incluye caja/agujetas originales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* Fotografías (Compresión WebP) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Fotografías (Máx. 3)
              </label>
              <span className="text-[10px] text-zinc-400">Compresión WebP automática</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
                  <img src={imgUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 rounded-full bg-red-600/90 p-1 text-white hover:bg-red-700 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 hover:border-orange-500/50 bg-zinc-900/50 hover:bg-zinc-900 transition">
                  <Upload className="h-5 w-5 text-zinc-400" />
                  <span className="mt-1 text-[10px] text-zinc-400">Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {uploadingImage && (
              <p className="mt-1 text-[11px] text-orange-400 animate-pulse">Optimizando y subiendo imagen...</p>
            )}
          </div>

          {/* Aviso de Seguridad de Menores */}
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Comunidad Protegida:</strong> Por seguridad de los alumnos, las entregas se coordinan exclusivamente en los horarios de entrenamiento del Deportivo Carmen Serdán.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-500 transition disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
