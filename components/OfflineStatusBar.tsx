"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { offlineStorage } from "@/lib/offlineSync";

export default function OfflineStatusBar() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    setPendingCount(offlineStorage.getQueue().length);

    const handleOnline = async () => {
      setIsOnline(true);
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueUpdated = () => {
      setPendingCount(offlineStorage.getQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated);

    // Revisar cola periódicamente en segundo plano
    const interval = setInterval(() => {
      setPendingCount(offlineStorage.getQueue().length);
    }, 4000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);
    try {
      await offlineStorage.syncPendingActions((remaining) => setPendingCount(remaining));
      setPendingCount(offlineStorage.getQueue().length);
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) {
    return null; // Si todo está en línea y al día, no estorba
  }

  return (
    <div
      className={`w-full py-2 px-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono font-bold transition-all shadow-md z-40 gap-2 ${
        !isOnline
          ? "bg-amber-600/95 text-black border-b border-amber-400"
          : "bg-blue-600/95 text-white border-b border-blue-400"
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-black animate-pulse" />
            <span>MODO CANCHA SIN INTERNET • Guardando en tu teléfono localmente</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-300" />
            <span>CONEXIÓN DETECTADA • Listo para sincronizar con la nube</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {pendingCount > 0 && (
          <span className="bg-black/30 px-2.5 py-0.5 rounded text-[10px] tracking-wide">
            {pendingCount} {pendingCount === 1 ? "registro pendiente" : "registros pendientes"}
          </span>
        )}

        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-white text-blue-900 px-3 py-1 rounded-lg hover:bg-zinc-100 transition text-[11px] font-bold shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Sincronizando..." : "Subir Datos Ahora"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
