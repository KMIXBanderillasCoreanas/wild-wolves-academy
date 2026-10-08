'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Monitor, Smartphone, Apple, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está en modo Standalone (App ya instalada)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // 2. Registrar Service Worker para habilitar PWA en navegadores
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

    // 3. Detección de Plataforma
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(ua);
    const isWindowsDevice = /windows|win32/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsWindows(isWindowsDevice);

    // 4. Capturar evento de instalación nativo (Chrome, Edge, Android, Windows)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar banner después de 2 segundos de interacción
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si es iOS y no está instalado, mostrar banner sugerido tras 3 segundos
    if (isIOSDevice && !isStandaloneMode) {
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    // 5. Permitir apertura manual desde el botón del Navbar
    const handleManualOpen = () => {
      if (isIOSDevice) {
        setShowIOSModal(true);
      } else {
        setShowBanner(true);
      }
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualOpen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback para navegadores de escritorio que no lanzan el evento directo
      alert('Para instalar en tu dispositivo:\n- En Google Chrome / Edge: Haz clic en el ícono de instalación (computadora con flecha) en la barra de direcciones superior.');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } catch (e) {
      console.error('Error durante la instalación:', e);
    }
  };

  // Si ya está ejecutándose como aplicación instalada, no mostramos banners
  if (isStandalone) return null;

  return (
    <>
      {/* 1. BANNER FLOTANTE INFERIOR DE INSTALACIÓN (Responsive) */}
      {showBanner && !installedSuccess && (
        <aside 
          aria-label="Notificación para instalar aplicación"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#121824]/95 backdrop-blur-md border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-slideUp text-zinc-100 font-sans"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 flex-shrink-0">
                <Download className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-white text-sm tracking-tight">INSTALAR WILD WOLVES APP</h4>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {isIOS ? 'iOS / iPhone' : isAndroid ? 'Android' : isWindows ? 'Windows' : 'App'}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5 font-sans leading-snug">
                  Acceso rápido sin navegador, pantalla completa y modo fuera de línea para la academia.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-zinc-800 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/30 cursor-pointer active:scale-95"
            >
              {isIOS ? (
                <>
                  <Apple className="w-4 h-4" />
                  <span>Instalar en iPhone / iPad</span>
                </>
              ) : isAndroid ? (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar en Android</span>
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4" />
                  <span>Instalar en Windows / PC</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Más tarde
            </button>
          </div>
        </aside>
      )}

      {/* 2. MODAL GUIADO EXCLUSIVO PARA APPLE / iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-orange-500/30 rounded-3xl max-w-sm w-full p-6 text-zinc-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-600/40">
                <Apple className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Instalar en Apple iOS</h3>
                <p className="text-zinc-400 text-xs">Sigue estos 2 sencillos pasos en Safari:</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs bg-[#0a0e17] p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span>Toca el botón </span>
                  <strong className="text-white inline-flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                    <Share className="w-3.5 h-3.5 text-sky-400" /> Compartir
                  </strong>
                  <span> en la barra inferior de Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span>Desliza y selecciona </span>
                  <strong className="text-white inline-flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> Agregar a inicio
                  </strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-600/30"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* 3. MENSAJE DE ÉXITO TRAS INSTALACIÓN */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border border-emerald-500 rounded-2xl p-4 shadow-xl text-xs font-mono text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>¡Wild Wolves App instalada con éxito en tu dispositivo!</span>
        </div>
      )}
    </>
  );
}
