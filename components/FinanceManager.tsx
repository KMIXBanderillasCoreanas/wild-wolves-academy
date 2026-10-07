'use client';

import React, { useState } from 'react';
import { StudentProfile, PaymentFrequency } from '@/lib/types';
import { 
  BadgeDollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight,
  Receipt,
  Wallet,
  TrendingUp,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinanceManagerProps {
  students: StudentProfile[];
  onRecordPayment: (studentId: string, amount: number, method: 'Efectivo' | 'Transferencia' | 'Stripe') => void;
  onUpdateFrequency: (studentId: string, frequency: PaymentFrequency) => void;
}

export function FinanceManager({
  students,
  onRecordPayment,
  onUpdateFrequency,
}: FinanceManagerProps) {
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<StudentProfile | null>(null);
  const [payAmount, setPayAmount] = useState<number>(50);
  const [payMethod, setPayMethod] = useState<'Efectivo' | 'Transferencia' | 'Stripe'>('Efectivo');

  // Cálculos globales de caja
  const totalOwed = students.reduce((acc, curr) => acc + (curr.finances.balanceDue || 0), 0);
  const totalCollected = students.reduce((acc, curr) => acc + (curr.finances.lastPaymentAmount || 0), 0);
  const upToDateCount = students.filter((s) => s.finances.status === 'al_corriente').length;
  const pendingCount = students.filter((s) => s.finances.status === 'pendiente').length;

  const handleOpenPay = (st: StudentProfile) => {
    setSelectedStudentForPay(st);
    setPayAmount(st.finances.balanceDue > 0 ? st.finances.balanceDue : st.finances.costPerClass);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;

    onRecordPayment(selectedStudentForPay.id, Number(payAmount), payMethod);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f97316', '#fbbf24'],
      });
    } catch {}

    setSelectedStudentForPay(null);
  };

  const getFrequencyLabel = (freq: PaymentFrequency) => {
    switch (freq) {
      case 'al_dia':
        return 'Al Día ($50 / clase)';
      case 'semanal':
        return 'A la Semana ($150 / 3 clases)';
      case 'mensual':
        return 'Al Mes ($600 / 12 clases)';
      default:
        return 'Al Día';
    }
  };

  const handleWhatsAppReminder = (st: StudentProfile) => {
    const phone = (st.parentPhone || st.phone || '525522427769').replace(/[^0-9]/g, '');
    const text = `🏀 *RECORDATORIO DE PAGO - WILD WOLVES BASKETBALL ACADEMY*
Estimado(a) tutor de ${st.fullName}:
Le recordamos que el costo de la clase es de *$50 pesos*.
Su modalidad actual es: *${getFrequencyLabel(st.finances.frequency)}*.
Saldo pendiente a la fecha: *$${st.finances.balanceDue} MXN*.
Agradecemos regularizar su pago en la próxima sesión (Efectivo / Transferencia). ¡Muchas gracias por apoyar el desarrollo deportivo! 🐺`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none font-sans">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a] mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
              CONTROL FINANCIERO EXCLUSIVO ADMIN
            </span>
            <span className="text-zinc-400 text-xs font-mono">Costo Oficial: $50 Pesos / Clase</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5 text-orange-500" />
            <span>Cobranza y Modalidades de Pago de Alumnos</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Control de quién paga, quién no paga, cobro al día ($50), semanal ($150) y mensual ($600)
          </p>
        </div>

        {/* Resumen de Caja */}
        <div className="flex items-center gap-2.5 font-mono">
          <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
            <div className="text-[10px] text-zinc-400 uppercase">Costo Clase</div>
            <div className="text-xl font-black text-white">$50 <span className="text-xs text-zinc-500">MXN</span></div>
          </div>

          <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-rose-500/30 text-center">
            <div className="text-[10px] text-rose-400 uppercase">Por Cobrar</div>
            <div className="text-xl font-black text-rose-400">${totalOwed} <span className="text-xs">MXN</span></div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 font-mono text-xs">
        <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block">Alumnos al Corriente</span>
            <span className="text-lg font-bold text-emerald-400">{upToDateCount} de {students.length}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block">Alumnos con Adeudo</span>
            <span className="text-lg font-bold text-rose-400">{pendingCount} de {students.length}</span>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-400" />
        </div>

        <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block">Cobros Recientes</span>
            <span className="text-lg font-bold text-white">${totalCollected} MXN</span>
          </div>
          <Wallet className="w-5 h-5 text-orange-400" />
        </div>
      </div>

      {/* Tabla Detallada de Cobranza por Alumno */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#27272a] text-zinc-400 text-[10px] uppercase">
              <th className="pb-3 font-semibold">Atleta</th>
              <th className="pb-3 font-semibold">Modalidad de Pago</th>
              <th className="pb-3 font-semibold">Días Entrenados</th>
              <th className="pb-3 font-semibold">Estado de Cuenta</th>
              <th className="pb-3 font-semibold">Último Pago</th>
              <th className="pb-3 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {students.map((st) => {
              const isUpToDate = st.finances.status === 'al_corriente';
              return (
                <tr key={st.id} className="hover:bg-[#0a0e17]/50 transition-colors">
                  {/* Atleta */}
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.avatarUrl}
                        alt={st.fullName}
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-700"
                      />
                      <div>
                        <div className="font-bold text-white font-sans text-xs">{st.fullName}</div>
                        <div className="text-[10px] text-zinc-400">{st.position} • {st.gender === 'M' ? 'Var' : 'Fem'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Selector de Modalidad */}
                  <td className="py-3 pr-3">
                    <select
                      value={st.finances.frequency}
                      onChange={(e) => onUpdateFrequency(st.id, e.target.value as PaymentFrequency)}
                      className="bg-[#0a0e17] border border-[#27272a] rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="al_dia">Al Día ($50)</option>
                      <option value="semanal">A la Semana ($150)</option>
                      <option value="mensual">Al Mes ($600)</option>
                    </select>
                  </td>

                  {/* Días Entrenados */}
                  <td className="py-3 pr-3">
                    <span className="font-bold text-white">{st.totalDaysTrained}</span>
                    <span className="text-zinc-500 text-[10px]"> días</span>
                  </td>

                  {/* Estado de Cobro */}
                  <td className="py-3 pr-3">
                    {isUpToDate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Al Corriente ($0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        Debe ${st.finances.balanceDue} MXN
                      </span>
                    )}
                  </td>

                  {/* Último Pago */}
                  <td className="py-3 pr-3 text-[11px] text-zinc-400">
                    <div>{st.finances.lastPaymentDate || 'Sin registro'}</div>
                    <div className="text-[10px] text-zinc-500">
                      {st.finances.lastPaymentAmount ? `$${st.finances.lastPaymentAmount} (${st.finances.paymentMethod || 'Efectivo'})` : '—'}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenPay(st)}
                        className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Registrar cobro de clase"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Cobrar</span>
                      </button>

                      {!isUpToDate && (
                        <button
                          onClick={() => handleWhatsAppReminder(st)}
                          className="p-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                          title="Enviar recordatorio de pago por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA REGISTRAR PAGO RECIBIDO */}
      {selectedStudentForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 max-w-sm w-full font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Registrar Cobro de Clase</h4>
                <p className="text-[11px] font-mono text-zinc-400">{selectedStudentForPay.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForPay(null)}
                className="text-zinc-400 hover:text-white p-1 rounded bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Monto a Cobrar (Pesos MXN):</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 50)}
                  className="w-full bg-[#0a0e17] border border-[#27272a] rounded px-3 py-2 text-white font-bold text-base focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Costo unitario de clase: $50 MXN
                </span>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Método de Pago:</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-[#27272a] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Efectivo">Efectivo en Cancha</option>
                  <option value="Transferencia">Transferencia SPEI</option>
                  <option value="Stripe">Stripe Terminal / En Línea</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pago de ${payAmount} MXN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
