'use client';

import { useState, useEffect, useCallback } from 'react';

export type SubscriptionTierMode = 'free' | 'pro' | 'auto';

export interface SubscriptionTierState {
  isPro: boolean;
  tier: 'free' | 'pro';
  mode: SubscriptionTierMode;
  isDemoActive: boolean;
  setMode: (mode: SubscriptionTierMode) => void;
  toggleDemo: () => void;
  resetToAuto: () => void;
}

const STORAGE_KEY = 'ww_demo_subscription_mode';
export const SUBSCRIPTION_EVENT = 'subscription_tier_changed';

/**
 * Hook reactivo para consultar y alternar el estado de suscripción y modo Demo en tiempo real.
 * Si el usuario no tiene override en localStorage, respeta el estado real de la base de datos (initialIsPro).
 */
export function useSubscriptionTier(initialIsPro: boolean = false): SubscriptionTierState {
  const [mounted, setMounted] = useState(false);
  const [demoMode, setDemoModeState] = useState<SubscriptionTierMode>('auto');

  // Cargar estado persistente en el montaje
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as SubscriptionTierMode | null;
        if (stored === 'free' || stored === 'pro') {
          setDemoModeState(stored);
        } else {
          setDemoModeState('auto');
        }
      } catch (e) {
        console.warn('Storage read warning in useSubscriptionTier:', e);
      }
    }
  }, []);

  // Escuchar cambios disparados en cualquier parte de la app
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTierChange = (e: any) => {
      const newMode = e?.detail?.mode as SubscriptionTierMode;
      if (newMode) {
        setDemoModeState(newMode);
      }
    };

    window.addEventListener(SUBSCRIPTION_EVENT, handleTierChange);
    return () => {
      window.removeEventListener(SUBSCRIPTION_EVENT, handleTierChange);
    };
  }, []);

  // Calcular si actualmente tiene privilegios Pro
  const isPro = mounted
    ? demoMode === 'pro'
      ? true
      : demoMode === 'free'
      ? false
      : Boolean(initialIsPro)
    : Boolean(initialIsPro);

  const tier: 'free' | 'pro' = isPro ? 'pro' : 'free';
  const isDemoActive = mounted && demoMode !== 'auto';

  const setMode = useCallback((newMode: SubscriptionTierMode) => {
    setDemoModeState(newMode);
    if (typeof window !== 'undefined') {
      try {
        if (newMode === 'auto') {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, newMode);
        }
        window.dispatchEvent(
          new CustomEvent(SUBSCRIPTION_EVENT, { detail: { mode: newMode } })
        );
      } catch (e) {
        console.warn('Storage write error in useSubscriptionTier:', e);
      }
    }
  }, []);

  const toggleDemo = useCallback(() => {
    // Alterna entre free y pro
    const nextMode: SubscriptionTierMode = isPro ? 'free' : 'pro';
    setMode(nextMode);
  }, [isPro, setMode]);

  const resetToAuto = useCallback(() => {
    setMode('auto');
  }, [setMode]);

  return {
    isPro,
    tier,
    mode: demoMode,
    isDemoActive,
    setMode,
    toggleDemo,
    resetToAuto
  };
}
