"use client";

import React, { useState, useEffect } from "react";
import { syncOfflineDataWithCloud } from "@/lib/offline/sync";
import { getPendingQueue } from "@/lib/offline/db";
import { Wifi, WifiOff, UploadCloud, CheckCircle2, RefreshCw } from "lucide-react";

export default function BunkerSyncCommandBar() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string>("");

  const refreshCount = async () => {
    if (typeof window === "undefined") return;
    try {
      const queue = await getPendingQueue();
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    refreshCount();

    const handleOnline = async () => {
      setIsOnline(true);
      handleManualSync(); // Sincronización automática al detectar red
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdated = () => refreshCount();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated);

    const interval = setInterval(refreshCount, 4000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (typeof window === "undefined") return;
    if (!navigator.onLine) {
      alert("Sigues sin internet. Los datos se mantienen seguros en tu teléfono.");
      return;
    }
    setIsSyncing(true);
    const { success, failed } = await syncOfflineDataWithCloud();
    await refreshCount();
    setIsSyncing(false);

    if (success > 0) {
      setLastSyncMsg(` Subidos ${success} registros exitosamente.`);
      setTimeout(() => setLastSyncMsg(""), 6000);
    }
  };

  return (
    <div className="w-full bg-[#121622] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between text-xs font-mono shadow-md">
      <div className="flex items-center gap-2 flex-wrap">
        {isOnline ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Wifi className="w-4 h-4" /> EN LÍNEA
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <WifiOff className="w-4 h-4" /> MODO CANCHA OFFLINE (SEGURO)
          </span>
        )}
        {pendingCount > 0 && (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {pendingCount} por sincronizar
          </span>
        )}
        {lastSyncMsg && <span className="text-emerald-400 font-bold">{lastSyncMsg}</span>}
      </div>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && isOnline && (
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl transition shadow active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>{isSyncing ? "Subiendo a la Nube..." : "Sincronizar Manualmente"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
