'use client';

import React, { useState } from 'react';
import { 
  Clipboard, 
  UploadCloud, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Flame
} from 'lucide-react';

export default function OfflineCourtSyncBox({ onSyncSuccess }: { onSyncSuccess?: () => void }) {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const syncPayload = async (rawText: string) => {
    if (!rawText.trim()) return;
    setLoading(true);
    setStatusMsg('Sincronizando con las 5 tablas de Supabase...');
    try {
      const parsed = JSON.parse(rawText);
      const res = await fetch('/api/sync-offline-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al sincronizar');
      
      const athletes = data.summary?.athletes?.join(', ') || 'Atletas procesados';
      setStatusMsg(`✓ ${data.message} (${athletes})`);
      setJsonInput('');
      localStorage.removeItem('ww_offline_sports_tests');
      localStorage.removeItem('ww_offline_queue');
      localStorage.removeItem('wild_wolves_offline_queue');
      if (onSyncSuccess) onSyncSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'JSON inválido';
      setStatusMsg(`⚠️ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        setJsonInput(text);
        await syncPayload(text);
      } else {
        setStatusMsg('Por favor pega el texto manualmente en el recuadro inferior y presiona Actualizar.');
      }
    } catch {
      setStatusMsg('Por favor pega el texto manualmente en el recuadro inferior y presiona Actualizar.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonInput(text);
    await syncPayload(text);
    e.target.value = '';
  };

  return (
    <div className="rounded-3xl border border-[#262b3d] bg-[#0f131d] p-5 sm:p-6 text-zinc-100 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262b3d] pb-4">
        <div>
          <span className="rounded-full border border-[#f66018]/40 bg-[#f66018]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#f66018]">
            Sincronización Cancha → Búnker V2
          </span>
          <h3 className="mt-1 text-base sm:text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#f66018]" />
            <span>Receptor Automático de Pruebas de Cancha</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pega el JSON copiado desde tu celular o sube el archivo para actualizar las 5 tablas en 1 segundo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            disabled={loading}
            className="rounded-xl bg-[#f66018] hover:bg-orange-500 px-3.5 py-2 text-xs font-black uppercase text-white shadow-lg shadow-orange-600/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>📋 Pegar y Sincronizar 1-Clic</span>
          </button>
          
          <label className="cursor-pointer rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-3.5 py-2 text-xs font-black uppercase text-[#10b981] hover:bg-[#10b981]/20 transition flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>📂 Subir .JSON</span>
            <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={4}
        placeholder="Pega aquí el JSON copiado desde tu celular en duela (Carmen Serdán)..."
        className="w-full rounded-2xl border border-[#262b3d] bg-[#07090e] p-3.5 font-mono text-xs text-[#38bdf8] focus:border-[#f66018] focus:outline-none transition"
      />

      <button
        type="button"
        onClick={() => syncPayload(jsonInput)}
        disabled={loading || !jsonInput.trim()}
        className="w-full rounded-2xl bg-gradient-to-r from-[#10b981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 py-3.5 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-xl shadow-emerald-600/20 disabled:opacity-40 transition cursor-pointer flex items-center justify-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Actualizando 5 Tablas en Supabase...' : '⚡ Actualizar Base de Datos Ahora'}</span>
      </button>

      {statusMsg && (
        <div className={`rounded-xl border p-3 text-xs font-bold font-mono ${
          statusMsg.startsWith('✓') 
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
            : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        }`}>
          {statusMsg}
        </div>
      )}
    </div>
  );
}
