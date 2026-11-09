'use client';

import React, { useState, useMemo } from 'react';
import { 
  DebtorAthleteRecord, 
  registrarPagoDuelaAction 
} from '@/lib/actions/finance-bunker-actions';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  MessageCircle, 
  DollarSign, 
  Send, 
  RefreshCw,
  Receipt,
  Sparkles,
  ShieldAlert,
  Loader2,
  ChevronRight,
  HandCoins
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DebtControlTableProps {
  athletes: DebtorAthleteRecord[];
  onDataChanged?: () => void;
}

export function DebtControlTable({ athletes, onDataChanged }: DebtControlTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ADEUDO' | 'AL DÍA'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [payModalAthlete, setPayModalAthlete] = useState<DebtorAthleteRecord | null>(null);
  const [payAmount, setPayAmount] = useState<number>(50);
  const [payMethod, setPayMethod] = useState<'efectivo' | 'spei' | 'tarjeta' | 'condonacion'>('efectivo');
  const [payConcept, setPayConcept] = useState<string>('Cuota Cancha Carmen Serdán $50 MXN');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtrado de atletas
  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchesSearch = 
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.guardianName.toLowerCase().includes(search.toLowerCase()) ||
        a.guardianPhone.includes(search);

      if (!matchesSearch) return false;
      if (statusFilter === 'ADEUDO') return a.status === 'ADEUDO';
      if (statusFilter === 'AL DÍA') return a.status === 'AL DÍA';
      return true;
    });
  }, [athletes, search, statusFilter]);

  // Conteo rápido
  const debtorsCount = useMemo(() => {
    return athletes.filter((a) => a.status === 'ADEUDO').length;
  }, [athletes]);

  const upToDateCount = useMemo(() => {
    return athletes.filter((a) => a.status === 'AL DÍA').length;
  }, [athletes]);

  // Disparar mensaje por WhatsApp parametrizado
  const handleSendWhatsAppReminder = (a: DebtorAthleteRecord) => {
    const rawPhone = (a.guardianPhone || a.phone || '525522427769').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
    const classesText = a.pendingClassesCount === 1 ? '1 clase' : `${a.pendingClassesCount} clases`;
    const debtText = `$${a.totalDebtAmount} MXN`;

    const message = `🐺 *WILD WOLVES BASKETBALL ACADEMY CDMX*
Sede Oficial: *Deportivo Carmen Serdán*
Estimado(a) tutor(a) de *${a.fullName}*:

Esperamos que se encuentre muy bien. Le enviamos un cordial saludo del cuerpo técnico.
A continuación le compartimos el estado de cuenta y desglose de su atleta en duela:

📋 *Desglose de Entrenamientos:*
 • Clases pendientes de liquidación: *${classesText}*
 • Cuota oficial por clase: *$50 MXN*
 • Total adeudado a la fecha: *${debtText}*

💳 *Métodos de Pago Aceptados:*
 • Efectivo directo en cancha con el Coach Ricardo
 • Transferencia SPEI (favor de enviar comprobante por este medio)

Agradecemos enormemente su respaldo para mantener la excelencia deportiva y disciplina de la manada. ¡Nos vemos en el próximo entrenamiento! 🐺🏀`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  // Abrir modal de cobro rápido
  const handleOpenPayModal = (a: DebtorAthleteRecord) => {
    setPayModalAthlete(a);
    setPayAmount(a.totalDebtAmount > 0 ? a.totalDebtAmount : 50);
    setPayMethod('efectivo');
    setPayConcept(`Cuota Cancha Carmen Serdán (${a.pendingClassesCount > 0 ? `${a.pendingClassesCount} clases` : '$50 MXN'})`);
  };

  // Confirmar registro de pago / condonación en Supabase Server Action
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalAthlete) return;

    setActionLoadingId(payModalAthlete.id);
    setFeedback(null);

    const isForgiveness = payMethod === 'condonacion';
    const res = await registrarPagoDuelaAction({
      studentId: payModalAthlete.id,
      amount: Number(payAmount),
      concept: payConcept,
      paymentMethod: payMethod,
      isForgiveness,
    });

    setActionLoadingId(null);

    if (res.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {}

      setFeedback({ type: 'success', message: res.message || 'Pago registrado con éxito en duela.' });
      setPayModalAthlete(null);
      if (onDataChanged) onDataChanged();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al procesar la operación en duela.' });
    }
  };

  return (
    <div className="bg-[#0c1017] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl font-sans">
      {/* HEADER DE LA TABLA */}
      <div className="p-5 border-b border-zinc-800/80 bg-[#0f141f]/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <HandCoins className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              Control Interactivo de Adeudos & Cuotas de Duela
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Registro inmediato de pagos en efectivo/SPEI, liquidación de adeudos y recordatorios WhatsApp.
          </p>
        </div>

        {/* FEEDBACK PILL */}
        {feedback && (
          <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
      <div className="p-4 border-b border-zinc-800/60 bg-[#090d14] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* FILTROS DE ESTADO */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
            <Filter className="w-3 h-3" /> Estado:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-zinc-700 text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todos ({athletes.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ADEUDO')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'ADEUDO'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-zinc-900 text-rose-400 hover:text-rose-300 border border-zinc-800'
            }`}
          >
            <span>Con Adeudo ({debtorsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('AL DÍA')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'AL DÍA'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-900 text-emerald-400 hover:text-emerald-300 border border-zinc-800'
            }`}
          >
            <span>Al Día ({upToDateCount})</span>
          </button>
        </div>

        {/* INPUT DE BÚSQUEDA */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar atleta, tutor o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121722] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>
      </div>

      {/* TABLA DE ATLETAS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-[#090d14]/90 text-zinc-400 font-mono text-[10px] uppercase">
              <th className="py-3.5 px-4 font-semibold">Nombre del Atleta</th>
              <th className="py-3.5 px-4 font-semibold">Tutor Responsable</th>
              <th className="py-3.5 px-4 font-semibold text-center">Clases Pendientes</th>
              <th className="py-3.5 px-4 font-semibold">Monto Total ($50/clase)</th>
              <th className="py-3.5 px-4 font-semibold">Estado</th>
              <th className="py-3.5 px-4 font-semibold text-right">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No se encontraron atletas bajo el filtro seleccionado.
                </td>
              </tr>
            ) : (
              filteredAthletes.map((a) => {
                const isAdeudo = a.status === 'ADEUDO';
                const isLoading = actionLoadingId === a.id;

                return (
                  <tr key={a.id} className="hover:bg-[#121824]/60 transition-colors">
                    {/* Atleta */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{a.fullName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{a.phone}</div>
                    </td>

                    {/* Tutor Responsable */}
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200 font-medium text-xs">{a.guardianName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <span>Tel:</span>
                        <span className="text-zinc-300 font-bold">{a.guardianPhone}</span>
                      </div>
                    </td>

                    {/* Clases Pendientes */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      {isAdeudo ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {a.pendingClassesCount} {a.pendingClassesCount === 1 ? 'clase' : 'clases'}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">0 pendientes</span>
                      )}
                    </td>

                    {/* Monto Total ($50 MXN por clase) */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className={`text-sm font-black ${isAdeudo ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ${a.totalDebtAmount} <span className="text-[10px] text-zinc-400 font-normal">MXN</span>
                      </div>
                      <div className="text-[9px] text-zinc-500">
                        {isAdeudo ? 'Cuota oficial $50/sesión' : 'Sin saldo adeudado'}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 font-mono">
                      {isAdeudo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          <AlertTriangle className="w-3 h-3" /> ADEUDO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> AL DÍA
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* BOTÓN: ENVIAR RECORDATORIO WHATSAPP */}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReminder(a)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                          title="Enviar recordatorio y desglose exacto por WhatsApp al tutor"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        {/* BOTÓN: REGISTRAR PAGO EN DUELA */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleOpenPayModal(a)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-mono text-[11px] font-black transition-all shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Registrar pago inmediato en duela o condonación"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <DollarSign className="w-3.5 h-3.5" />
                          )}
                          <span>Registrar Pago en Duela</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO RÁPIDO EN DUELA */}
      {payModalAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-[#121622] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-wider block">
                  REGISTRAR PAGO EN DUELA • CARMEN SERDÁN
                </span>
                <h4 className="text-base font-black text-white">{payModalAthlete.fullName}</h4>
                <p className="text-[11px] text-zinc-400 font-mono">Tutor: {payModalAthlete.guardianName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayModalAthlete(null)}
                className="text-zinc-400 hover:text-white p-1 rounded bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                  Monto a Registrar / Saldar (MXN):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0a0e16] border border-zinc-800 rounded-xl pl-8 pr-3 py-2.5 text-white font-black text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {payModalAthlete.totalDebtAmount > 0 && (
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-rose-400">Adeudo actual: ${payModalAthlete.totalDebtAmount} MXN</span>
                    <button
                      type="button"
                      onClick={() => setPayAmount(payModalAthlete.totalDebtAmount)}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Liquidar Total
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                  Método de Pago:
                </label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="efectivo">Efectivo en Duela ($50 / sesión)</option>
                  <option value="spei">Transferencia Bancaria SPEI</option>
                  <option value="tarjeta">Terminal / Tarjeta de Débito</option>
                  <option value="condonacion">Condonación de Adeudo (Beca / Acuerdo)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">
                  Concepto de Cancha:
                </label>
                <input
                  type="text"
                  value={payConcept}
                  onChange={(e) => setPayConcept(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalAthlete(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId !== null}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black transition shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {actionLoadingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Acreditar en Duela</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default DebtControlTable;
