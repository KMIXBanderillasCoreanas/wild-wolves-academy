'use client';
import React from 'react';
import { useAIModelRouter } from '@/hooks/useAIModelRouter';

export default function AIModelAdvisorBanner() {
  const rec = useAIModelRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-500/30 bg-[#0f131d] px-4 py-3 text-zinc-100 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-base">
          🤖
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-orange-400 border border-orange-500/30">
              {rec.actionTag}
            </span>
            <span className="text-xs font-black text-white">IA Sugerida en Antigravity: <strong className="text-[#d1fe17]">{rec.modelName}</strong></span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">{rec.reason}</p>
        </div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">Wild Wolves OS • Router v1.0</span>
    </div>
  );
}
