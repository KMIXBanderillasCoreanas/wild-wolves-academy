'use client';

import React, { useState } from 'react';
import { SOCIAL_LINKS } from '@/data/mockData';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  Check,
  Flame
} from 'lucide-react';

interface SocialBarProps {
  athleteName?: string;
}

export function SocialBar({ athleteName }: SocialBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />;
      case 'tiktok':
        return (
          <svg className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.37a6.34 6.34 0 0 0-1-.08 6.34 6.34 0 0 0-6.33 6.34 6.34 6.34 0 0 0 6.33 6.37 6.34 6.34 0 0 0 6.33-6.37V9.75a8.16 8.16 0 0 0 5.08 1.75V8.05a4.83 4.83 0 0 1-1.15-1.36z" />
          </svg>
        );
      default:
        return <ExternalLink className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left header / Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Comunidad Oficial</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Channels
              </span>
            </div>
            <p className="text-sm font-semibold text-white">Wild Wolves Academy Social Network</p>
          </div>
        </div>

        {/* Center: Social links grid */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all duration-200 text-slate-200 hover:text-white"
              title={`${link.label} (${link.handle})`}
            >
              {getIcon(link.platform)}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">{link.label}</span>
                <span className="text-[10px] text-slate-400 leading-none">{link.badge}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Right: Quick Scout Share */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/25 transition-all duration-200 cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Enlace Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartir Scouting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
