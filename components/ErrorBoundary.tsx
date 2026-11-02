'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled client exception:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 bg-[#090c14] border border-amber-500/30 rounded-3xl text-center shadow-2xl my-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest mb-2">
            Sesión y Duela Protegida • Wild Wolves CDMX
          </span>

          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
            {this.props.fallbackTitle || 'Sesión no detectada / Reintentar conexión'}
          </h3>

          <p className="text-xs text-zinc-400 max-w-md mt-1.5 leading-relaxed">
            {this.props.fallbackMessage ||
              'No se pudieron recuperar los registros en tiempo real o la sesión expiró. Puedes reintentar la conexión segura o recargar el panel de control.'}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-4 p-3 rounded-xl bg-black/60 border border-red-500/30 text-red-300 font-mono text-[11px] max-w-lg text-left overflow-x-auto">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recargar Vista</span>
            </button>

            <a
              href="/"
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Ir al Inicio</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
