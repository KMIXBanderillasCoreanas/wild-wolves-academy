"use client";

import React, { useEffect, useState } from "react";
import { Download, Share, X, Smartphone, Monitor, Apple, CheckCircle2 } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está corriendo como app instalada (Standalone)
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(inStandalone);
    if (inStandalone) return;

    // 2. Registro de Service Worker para habilitar PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    }

    // 3. Detección de dispositivos Apple / iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capturar evento de instalación nativa en Android, Windows, Mac y Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // En iOS no existe beforeinstallprompt; mostramos banner para guiar al usuario
    if (isAppleDevice) {
      setShowBanner(true);
    }

    // 5. Soporte para el botón superior "Instalar App 📲" del Navbar
    const handleManualOpen = () => {
      if (isAppleDevice) {
        setShowIOSModal(true);
      } else {
        setShowBanner(true);
      }
    };
    window.addEventListener("open-pwa-install", handleManualOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-pwa-install", handleManualOpen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      alert(
        "Para instalar Wild Wolves App:\n\n• En Chrome / Edge (PC/Mac): Haz clic en el ícono de instalación en la barra de direcciones superior (ícono de pantalla o '+').\n• En Android: Abre el menú de 3 puntos y selecciona 'Instalar aplicación'."
      );
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowBanner(false);
        setInstalledSuccess(true);
      }
    } catch (err) {
      console.error("Error al procesar instalación PWA:", err);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* BANNER FLOTANTE DE INSTALACIÓN UNIVERSAL */}
      {showBanner && !installedSuccess && (
        <aside
          aria-label="Instalación de la aplicación"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-50 max-w-md bg-[#161b26]/95 backdrop-blur-md border border-[#ea580c]/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.25)] flex items-center justify-between gap-4 font-sans animate-slideUp"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#0284c7] flex items-center justify-center text-white font-black text-lg shadow-inner flex-shrink-0">
              WW
            </div>
            <div>
              <h4 className="text-white text-sm font-bold tracking-wide flex items-center gap-1.5">
                Instalar Wild Wolves OS
                <span className="text-[10px] bg-[#ea580c]/20 text-[#ea580c] px-2 py-0.5 rounded-full border border-[#ea580c]/30 font-semibold font-mono">
                  OFICIAL
                </span>
              </h4>
              <p className="text-zinc-400 text-xs mt-0.5 leading-snug">
                {isIOS
                  ? "Toca 'Compartir' (icono ⎋) y 'Añadir a pantalla de inicio'"
                  : "Instala en Android, Windows o Mac con 1 clic"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isIOS ? (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex items-center gap-1 bg-[#0284c7]/20 border border-[#0284c7]/40 px-3 py-1.5 rounded-xl text-[#38bdf8] text-xs font-bold hover:bg-[#0284c7]/30 transition cursor-pointer"
              >
                <Share className="w-4 h-4 animate-bounce" />
                <span>Compartir</span>
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-[#ea580c]/30 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" /> Instalar
              </button>
            )}
            <button
              onClick={() => setShowBanner(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition cursor-pointer"
              aria-label="Cerrar banner"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* MODAL PARA DISPOSITIVOS APPLE / SAFARI iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-[#161b26] border border-[#ea580c]/40 rounded-3xl max-w-sm w-full p-6 text-zinc-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#0284c7] flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
                WW
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Instalar en Apple iOS</h3>
                <p className="text-zinc-400 text-xs">Sigue estos 2 pasos en Safari:</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs bg-[#090d16] p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span>Toca el botón </span>
                  <strong className="text-white inline-flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                    <Share className="w-3.5 h-3.5 text-sky-400" /> Compartir (⎋)
                  </strong>
                  <span> en la barra inferior de Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span>Desliza hacia abajo y selecciona </span>
                  <strong className="text-white inline-flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                    ➕ Añadir a pantalla de inicio
                  </strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#ea580c]/30"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN DE INSTALACIÓN EXITOSA */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#161b26] border border-emerald-500 rounded-2xl p-4 shadow-xl text-xs font-mono text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>¡Wild Wolves App instalada con éxito en tu dispositivo!</span>
        </div>
      )}
    </>
  );
}
export { InstallPWA };
