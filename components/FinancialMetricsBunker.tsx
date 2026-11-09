'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface FinancialSummary {
  total_revenue: number;
  total_receivables: number;
  active_memberships: number;
}

export default function FinancialMetricsBunker() {
  const [metrics, setMetrics] = useState<FinancialSummary>({
    total_revenue: 0,
    total_receivables: 0,
    active_memberships: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const { data, error } = await supabase.rpc('get_academy_financial_summary');
        
        if (error) {
          console.error('Error al obtener resumen financiero:', error);
        } else if (data) {
          setMetrics({
            total_revenue: Number(data.total_revenue) || 0,
            total_receivables: Number(data.total_receivables ?? (data.total_debt || data.total_receivable)) || 0,
            active_memberships: Number(data.active_memberships ?? data.active_memberships_count) || 0,
          });
        }
      } catch (err) {
        console.error('Error de red al consultar finanzas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl h-32 p-5"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* Tarjeta 1: Ingresos Totales (Recaudación Real) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-emerald-500/20 text-4xl">💰</div>
        <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">
          Ingresos Totales (Mes)
        </span>
        <h2 className="text-3xl font-extrabold text-white">
          ${metrics.total_revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-neutral-400">MXN</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-2">
          Suma de folios Pro, Familiar y cuotas en duela.
        </p>
      </div>

      {/* Tarjeta 2: Cuentas por Cobrar (Adeudos Pendientes) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-orange-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-orange-500/20 text-4xl">📉</div>
        <span className="text-xs uppercase tracking-wider text-orange-400 font-bold block mb-1">
          Cuentas por Cobrar (Adeudos)
        </span>
        <h2 className="text-3xl font-extrabold text-white">
          ${metrics.total_receivables.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-neutral-400">MXN</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-2">
          Basado en la cuota estándar de $50 MXN por clase.
        </p>
      </div>

      {/* Tarjeta 3: Membresías Activas (Pro & Élite) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-purple-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-purple-500/20 text-4xl">👑</div>
        <span className="text-xs uppercase tracking-wider text-purple-400 font-bold block mb-1">
          Membresías Activas (30 Días)
        </span>
        <h2 className="text-3xl font-extrabold text-white">
          {metrics.active_memberships} <span className="text-sm font-normal text-neutral-400">folios vigentes</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-2">
          Atleta Pro ($99) y Pack Familiar Élite ($149).
        </p>
      </div>

    </div>
  );
}
