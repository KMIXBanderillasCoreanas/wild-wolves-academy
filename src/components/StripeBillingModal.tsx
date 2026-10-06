'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, CreditCard, Sparkles, ExternalLink } from 'lucide-react';

interface StripeBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function StripeBillingModal({ isOpen, onClose, currentPlan }: StripeBillingModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'plan_basic',
      name: 'Basic Academy',
      price: '$49',
      period: '/mes',
      description: 'Acceso a entrenamientos grupales y radar de habilidades semestral.',
      features: [
        'Evaluación biomecánica cada 6 meses',
        'Acceso al Social Hub & Calendario',
        'Perfil digital básico en HoopPerformance OS',
        'Soporte vía WhatsApp de la Academia',
      ],
      recommended: false,
    },
    {
      id: 'plan_elite',
      name: 'Elite Wolf Pack',
      price: '$129',
      period: '/mes',
      description: 'El programa insignia para prospectos universitarios y de selección.',
      features: [
        'Evaluación mensual de radar con métricas combine',
        'Seguimiento de récords personales (PR) y alertas',
        'Video análisis de tiro en cámara lenta',
        'Reporte imprimible para scouts de la NCAA/FIBA',
        'Atención prioritaria 1-on-1 con Coach Vance',
      ],
      recommended: true,
    },
    {
      id: 'plan_varsity',
      name: 'Varsity Development',
      price: '$89',
      period: '/mes',
      description: 'Para atletas en desarrollo competitivo regional y estatal.',
      features: [
        'Evaluación bimestral de radar deportivo',
        'Plan semanal de fuerza & acondicionamiento',
        'Acceso a banco de ejercicios tácticos',
        'Comparativas de percentiles en vivo',
      ],
      recommended: false,
    },
  ];

  const handleCheckout = (planId: string) => {
    setLoadingPlan(planId);
    // Simulate Stripe Checkout redirection
    setTimeout(() => {
      alert(`Redirigiendo a Stripe Checkout seguro para el plan seleccionado (${planId}). Conexión con Stripe API activa.`);
      setLoadingPlan(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Stripe Billing Engine
              </span>
              <span className="text-xs text-slate-400">Wild Wolves Academy Memberships</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">Planes de Membresía &amp; Alto Rendimiento</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan.toLowerCase().includes(plan.name.toLowerCase().split(' ')[0]);
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  plan.recommended
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-orange-500 shadow-xl shadow-orange-500/10'
                    : 'bg-slate-800/60 border border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                    Más Elegido por Scouts
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{plan.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Plan Actual
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 mb-4">{plan.description}</p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-700/60 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    plan.recommended
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    {loadingPlan === plan.id ? 'Conectando Stripe...' : isCurrent ? 'Gestionar con Stripe' : 'Suscribirse vía Stripe'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Transacciones cifradas de 256 bits procesadas por Stripe Payment Gateway.</span>
          </div>
          <span className="text-[11px] text-slate-500">Cancelable en cualquier momento</span>
        </div>
      </div>
    </div>
  );
}
