'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';
import { StudentRosterItem } from '@/components/CourtAttendanceCommand';
import { enqueueOfflineAction, getOfflineQueueCount } from '@/lib/offlineSync';
import { supabase } from '@/lib/supabaseClient';

interface TacticalGlassAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRosterItem[];
  selectedDate: string;
  shift: string;
  onUpdateStudents: (updatedStudents: StudentRosterItem[]) => void;
  onShowToast: (msg: string) => void;
}

export default function TacticalGlassAttendanceModal({
  isOpen,
  onClose,
  students,
  selectedDate,
  shift,
  onUpdateStudents,
  onShowToast
}: TacticalGlassAttendanceModalProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'present' | 'absent' | 'debt'>('all');
  const [defaultClassCost, setDefaultClassCost] = useState<number>(50);

  // Filtrado predictivo instantáneo
  const filteredList = useMemo(() => {
    return students.filter(st => {
      const q = search.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        st.full_name.toLowerCase().includes(q) || 
        (st.number || '').toLowerCase().includes(q) || 
        (st.category || '').toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      if (filterType === 'present') return st.attendance_status === 'presente';
      if (filterType === 'absent') return st.attendance_status === 'falta';
      if (filterType === 'debt') return st.financial_status === 'adeudo_pendiente' || (st.current_debt_amount || 0) > 0;

      return true;
    });
  }, [students, search, filterType]);

  if (!isOpen) return null;

  // Toggle instantáneo Asistió / Ausente
  const handleToggleAttendance = (st: StudentRosterItem) => {
    const isPresent = st.attendance_status === 'presente';
    const newStatus: "presente" | "falta" = isPresent ? 'falta' : 'presente';

    const updated: StudentRosterItem[] = students.map(s => {
      if (s.id !== st.id) return s;
      return { ...s, attendance_status: newStatus };
    });

    onUpdateStudents(updated);
    onShowToast(`🟢 ${st.full_name}: ${newStatus === 'presente' ? 'Asistió' : 'Ausente'}`);

    const payload = {
      student_id: st.id,
      date: selectedDate,
      status: newStatus
    };

    if (!navigator.onLine) {
      enqueueOfflineAction('ATTENDANCE', payload);
    } else {
      supabase.from('daily_attendance').upsert(payload, { onConflict: 'student_id,date' }).then();
    }
  };

  // Marcar Pagado ($0 adeudo)
  const handleMarkPaid = (st: StudentRosterItem) => {
    const cost = st.current_debt_amount > 0 ? st.current_debt_amount : (st.default_class_cost || defaultClassCost);

    const updated = students.map(s => {
      if (s.id !== st.id) return s;
      return {
        ...s,
        financial_status: 'al_corriente' as const,
        current_debt_amount: 0,
        last_payment_status: 'al_corriente' as const,
        last_payment_amount: cost,
        last_session_date: selectedDate
      };
    });

    onUpdateStudents(updated);
    onShowToast(`💵 ${st.full_name}: Pagado ($0 Adeudo)`);

    const transPayload = {
      student_id: st.id,
      amount_paid: cost,
      payment_method: 'efectivo',
      concept: `Pago de clase en cancha (${selectedDate})`,
      transaction_date: selectedDate,
      created_at: new Date().toISOString()
    };
    const profPayload = {
      id: st.id,
      current_debt_amount: 0,
      financial_status: 'al_corriente'
    };

    if (!navigator.onLine) {
      enqueueOfflineAction('PAYMENT_TRANSACTION', transPayload);
      enqueueOfflineAction('PROFILE_FINANCIAL_UPDATE', profPayload);
    } else {
      supabase.from('payment_transactions_history').insert(transPayload).then();
      supabase.from('profiles').update(profPayload).eq('id', st.id).then();
    }
  };

  // Dejar como Adeudo (! Sumar deuda)
  const handleMarkDebt = (st: StudentRosterItem) => {
    const cost = st.default_class_cost || defaultClassCost;
    const newDebt = (Number(st.current_debt_amount) || 0) + cost;

    const updated = students.map(s => {
      if (s.id !== st.id) return s;
      return {
        ...s,
        financial_status: 'adeudo_pendiente' as const,
        current_debt_amount: newDebt,
        last_payment_status: 'adeudo' as const
      };
    });

    onUpdateStudents(updated);
    onShowToast(`⚠️ ${st.full_name}: Registrado adeudo de +$${cost} MXN`);

    const profPayload = {
      id: st.id,
      current_debt_amount: newDebt,
      financial_status: 'adeudo_pendiente'
    };

    if (!navigator.onLine) {
      enqueueOfflineAction('PROFILE_FINANCIAL_UPDATE', profPayload);
    } else {
      supabase.from('profiles').update(profPayload).eq('id', st.id).then();
    }
  };

  // Guardar y Cerrar Sesión de Clase (Consolidación)
  const handleSaveAndClose = () => {
    onShowToast('🛡️ Sesión de cancha guardada y sincronizada localmente');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* VENTANA GLASSMORPHISM CON BORDE CIAN NEÓN */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#070A11]/85 backdrop-blur-2xl border-2 border-[#00F0FF]/60 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100 font-sans">
        
        {/* ENCABEZADO TÁCTICO BÚNKER */}
        <div className="p-4 sm:p-5 border-b border-[#1F2433] bg-[#0A0E1A]/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Activity className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-[#FF6B00] tracking-widest">
                  DEPORTIVO CARMEN SERDÁN
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  OFFLINE-READY
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                CONTROL TÁCTICO DE CANCHA — PASE DE LISTA Y COBROS
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#131620] hover:bg-[#1F2433] border border-[#1F2433] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BUSCADOR PREDICTIVO INTEGRADO & FILTROS */}
        <div className="p-4 bg-[#090C14]/90 border-b border-[#1F2433] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#00F0FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscador predictivo: escribe nombre, dorsal o categoría..."
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#101421] border border-[#1F2433] focus:border-[#00F0FF] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none transition"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-xl border transition ${
                  filterType === 'all'
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50 font-bold'
                    : 'bg-[#101421] text-slate-400 border-[#1F2433]'
                }`}
              >
                Todos ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('present')}
                className={`px-3 py-1 rounded-xl border transition ${
                  filterType === 'present'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-[#101421] text-slate-400 border-[#1F2433]'
                }`}
              >
                Asistieron ({students.filter(s => s.attendance_status === 'presente').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('debt')}
                className={`px-3 py-1 rounded-xl border transition ${
                  filterType === 'debt'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 font-bold'
                    : 'bg-[#101421] text-slate-400 border-[#1F2433]'
                }`}
              >
                Con Adeudo ({students.filter(s => s.current_debt_amount > 0).length})
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Cuota de clase: <strong className="text-white">${defaultClassCost} MXN</strong>
            </div>
          </div>
        </div>

        {/* LISTA DE ATLETAS TÁCTICA (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              No se encontraron atletas con los criterios seleccionados.
            </div>
          ) : (
            filteredList.map((st) => {
              const isPresent = st.attendance_status === 'presente';
              const isPaid = st.financial_status === 'al_corriente' && (st.current_debt_amount || 0) === 0;

              return (
                <div
                  key={st.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-[#0D121F]/80 backdrop-blur-md border border-[#1F2433] hover:border-[#00F0FF]/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Info del Atleta */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#131620] to-[#1F2433] border border-[#FF6B00]/50 flex items-center justify-center font-mono font-black text-sm text-[#FF6B00] shrink-0">
                      {st.number || '#11'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-none">
                        {st.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span>{st.category || 'U-17'}</span>
                        <span>•</span>
                        <span className={st.current_debt_amount > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {st.current_debt_amount > 0 ? `Adeudo: $${st.current_debt_amount} MXN` : 'Al corriente ($0)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Acción Rápida: Toggle Asistencia + Estado de Pago */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Toggle Asistió / Ausente */}
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(st)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                        isPresent
                          ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'bg-[#131620] text-slate-400 border border-[#1F2433] hover:text-white'
                      }`}
                    >
                      {isPresent ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{isPresent ? 'ASISTIÓ' : 'AUSENTE'}</span>
                    </button>

                    {/* Botón Marcar Pagado */}
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(st)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#131620] text-slate-300 hover:bg-emerald-500 hover:text-black border border-[#1F2433]'
                      }`}
                      title="Marcar clase liquidada ($0)"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{isPaid ? 'PAGADO' : 'COBRAR'}</span>
                    </button>

                    {/* Botón Dejar como Adeudo */}
                    <button
                      type="button"
                      onClick={() => handleMarkDebt(st)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Pasar a adeudo pendiente"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>ADEUDO</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PIE DEL MODAL: BOTÓN DESTACADO DE CIERRE */}
        <div className="p-4 border-t border-[#1F2433] bg-[#0A0E1A]/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
            <span>Los cambios se guardan localmente para operar sin internet.</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#0284C7] hover:brightness-110 active:scale-95 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>GUARDAR Y CERRAR SESIÓN DE CLASE</span>
          </button>
        </div>

      </div>
    </div>
  );
}
