"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, DollarSign, UserX, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function TacticalRadarAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    inspectAcademyStatus();
  }, []);

  const inspectAcademyStatus = async () => {
    setLoading(true);
    const newAlerts: any[] = [];

    try {
      // 1. Auditar Adeudos Pasados Confirmados
      const { data: debtors } = await supabase
        .from("profiles")
        .select("full_name, current_debt_amount")
        .gt("current_debt_amount", 0);

      if (debtors && debtors.length > 0) {
        newAlerts.push({
          type: "FINANCIAL",
          title: `${debtors.length} Adeudos por Cobrar`,
          desc: `Total pendiente en alumnos: ${debtors.map(d => d.full_name).slice(0, 3).join(", ")}...`,
          icon: <DollarSign className="w-4 h-4 text-amber-400" />,
        });
      }

      // 2. Auditar Atletas Sin Evaluación Deportiva (Radar en Cero)
      const { data: unranked } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("account_category", "student")
        .eq("current_tier", "principiante");

      if (unranked && unranked.length > 0) {
        newAlerts.push({
          type: "TEST_DAY",
          title: `${unranked.length} Atletas Pendientes de Test Day`,
          desc: `Requieren pruebas oficiales en cancha para calibrar Radar 360°.`,
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
        });
      }
    } catch (e) {
      console.warn("Fallo en radar pasivo:", e);
    } finally {
      setAlerts(newAlerts);
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="w-full bg-[#121622] border border-orange-500/20 rounded-2xl p-3.5 mb-4 text-xs font-mono shadow-md">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span className="font-bold text-orange-400 uppercase flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Radar Táctico de Novedades (Auditoría en Vivo)
        </span>
        <button
          type="button"
          onClick={inspectAcademyStatus}
          className="text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Actualizar
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        {alerts.length === 0 ? (
          <span className="text-emerald-400 flex items-center gap-1.5 py-1">
            <CheckCircle className="w-3.5 h-3.5" /> Todo al día: Finanzas cuadradas y cancha en orden.
          </span>
        ) : (
          alerts.map((al, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-[#181e2b] p-2.5 rounded-xl border border-zinc-800/60">
              <div className="mt-0.5">{al.icon}</div>
              <div>
                <b className="text-zinc-200 block">{al.title}</b>
                <span className="text-zinc-400 text-[11px] font-sans">{al.desc}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
