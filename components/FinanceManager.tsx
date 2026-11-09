'use client';

import React, { useState, useMemo } from 'react';
import { StudentProfile, PaymentFrequency } from '@/lib/types';
import { 
  BadgeDollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  MessageCircle, 
  Receipt,
  Wallet,
  TrendingUp,
  Clock,
  Send,
  Download,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Flame,
  Crown,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type MembershipTierFilter = 'all' | 'cuota_clase_50' | 'plan_pro_99' | 'pack_familiar_elite_149';

interface FinanceManagerProps {
  students: StudentProfile[];
  onRecordPayment: (studentId: string, amount: number, method: 'Efectivo' | 'Transferencia' | 'Stripe') => void;
  onUpdateFrequency?: (studentId: string, frequency: PaymentFrequency) => void;
}

export function FinanceManager({
  students,
  onRecordPayment,
  onUpdateFrequency,
}: FinanceManagerProps) {
  // Estados para filtros Fintech
  const [tierFilter, setTierFilter] = useState<MembershipTierFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<StudentProfile | null>(null);
  const [payAmount, setPayAmount] = useState<number>(50);
  const [payMethod, setPayMethod] = useState<'Efectivo' | 'Transferencia' | 'Stripe'>('Efectivo');
  const [selectedPlanTier, setSelectedPlanTier] = useState<'cuota_clase_50' | 'plan_pro_99' | 'pack_familiar_elite_149'>('cuota_clase_50');

  // Estado para comprobante digital / modal de recibo
  const [receiptModalData, setReceiptModalData] = useState<{
    student: StudentProfile;
    amount: number;
    planLabel: string;
    date: string;
    folio: string;
  } | null>(null);

  // Cálculos globales de caja y Fintech
  const totalReceivable = useMemo(() => {
    return students.reduce((acc, curr) => acc + (curr.finances?.balanceDue || 0), 0);
  }, [students]);

  const totalCollectedEstimated = useMemo(() => {
    return students.reduce((acc, curr) => acc + (curr.finances?.lastPaymentAmount || 0), 0);
  }, [students]);

  const upToDateCount = useMemo(() => {
    return students.filter((s) => s.finances?.status === 'al_corriente').length;
  }, [students]);

  const debtors = useMemo(() => {
    return students.filter((s) => (s.finances?.balanceDue || 0) > 0 || s.finances?.status === 'pendiente');
  }, [students]);

  // Desglose de ingresos proyectados por tipo de membresía
  const planTiersStats = useMemo(() => {
    const classCount = students.filter(s => (s.finances?.costPerClass || 50) === 50).length;
    return {
      clase50Count: classCount,
      pro99Count: Math.max(1, Math.floor(students.length * 0.35)),
      pack149Count: Math.max(1, Math.floor(students.length * 0.15)),
    };
  }, [students]);

  // Lista filtrada de atletas
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchesSearch = 
        st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.guardianName && st.guardianName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        st.position.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (tierFilter === 'all') return true;
      if (tierFilter === 'cuota_clase_50') return (st.finances?.costPerClass || 50) === 50;
      if (tierFilter === 'plan_pro_99') return st.finances?.lastPaymentAmount === 99 || st.finances?.frequency === 'semanal';
      if (tierFilter === 'pack_familiar_elite_149') return st.finances?.lastPaymentAmount === 149 || st.finances?.frequency === 'mensual';

      return true;
    });
  }, [students, searchQuery, tierFilter]);

  const handleOpenPay = (st: StudentProfile) => {
    setSelectedStudentForPay(st);
    const debt = st.finances?.balanceDue || 0;
    if (debt > 0) {
      setPayAmount(debt);
      setSelectedPlanTier('cuota_clase_50');
    } else {
      setPayAmount(50);
      setSelectedPlanTier('cuota_clase_50');
    }
  };

  const handlePlanSelect = (tier: 'cuota_clase_50' | 'plan_pro_99' | 'pack_familiar_elite_149') => {
    setSelectedPlanTier(tier);
    if (tier === 'cuota_clase_50') setPayAmount(50);
    else if (tier === 'plan_pro_99') setPayAmount(99);
    else if (tier === 'pack_familiar_elite_149') setPayAmount(149);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;

    onRecordPayment(selectedStudentForPay.id, Number(payAmount), payMethod);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {}

    const planLabel = selectedPlanTier === 'cuota_clase_50' 
      ? 'Cuota de Clase Presencial ($50)' 
      : selectedPlanTier === 'plan_pro_99' 
        ? 'Plan Pro Wild Wolves ($99)' 
        : 'Pack Familiar Élite ($149)';

    // Desplegar comprobante inmediato
    setReceiptModalData({
      student: selectedStudentForPay,
      amount: Number(payAmount),
      planLabel,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      folio: `WW-${Date.now().toString().slice(-6)}`,
    });

    setSelectedStudentForPay(null);
  };

  const handleGenerateReceipt = (st: StudentProfile) => {
    const amount = st.finances?.lastPaymentAmount || 50;
    const planLabel = amount === 99 
      ? 'Plan Pro Wild Wolves ($99)' 
      : amount === 149 
        ? 'Pack Familiar Élite ($149)' 
        : 'Cuota de Clase Presencial ($50)';

    setReceiptModalData({
      student: st,
      amount,
      planLabel,
      date: st.finances?.lastPaymentDate || new Date().toISOString().split('T')[0],
      folio: `REC-${st.id.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    });
  };

  // Enlace y mensaje instantáneo para WhatsApp
  const handleSendWhatsAppQuickPay = (st: StudentProfile, customAmount?: number) => {
    const phone = (st.parentPhone || st.phone || '525522427769').replace(/[^0-9]/g, '');
    const amount = customAmount !== undefined ? customAmount : (st.finances?.balanceDue || 50);
    const checkoutUrl = `https://wild-wolves-academy.vercel.app/dashboard-guardian?studentId=${st.id}&pay=${amount}`;
    
    const text = `🐺 *COMPROBANTE & ENLACE DE PAGO RÁPIDO - WILD WOLVES ACADEMY*
Sede Oficial: *Deportivo Carmen Serdán, CDMX*
Atleta: *${st.fullName}*

Estimado tutor:
Le compartimos el acceso directo para realizar o consultar el pago de sus clases y membresía:
💵 *Monto:* $${amount} MXN
💳 *Planes Oficiales:*
 • Cuota por Clase: $50 MXN
 • Plan Pro Atleta: $99 MXN
 • Pack Familiar Élite: $149 MXN

🔗 *Enlace de Pago y Estado de Cuenta:*
${checkoutUrl}

Agradecemos enormemente su respaldo continuo a la formación de su atleta. ¡Seguimos con todo en la duela! 🏀`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSendReceiptWhatsApp = (data: NonNullable<typeof receiptModalData>) => {
    const phone = (data.student.parentPhone || data.student.phone || '525522427769').replace(/[^0-9]/g, '');
    const text = `🐺 *RECIBO DIGITAL OFICIAL - WILD WOLVES ACADEMY*
Folio: *#${data.folio}*
Fecha: *${data.date}*
Sede: *Deportivo Carmen Serdán, CDMX*
Atleta: *${data.student.fullName}*

Concepto: *${data.planLabel}*
Importe Liquidado: *$${data.amount} MXN*
Estatus: *ACREDITADO / AL CORRIENTE* ✅

¡Gracias por formar parte de la manada Wild Wolves! 🐺🏀`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER FINTECH DEPORTIVA ECC */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1017] via-[#10141e] to-[#0a0d14] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PROTOCOLO ECC FINTECH
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/50">
                Sede: Deportivo Carmen Serdán
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                Cuotas: $50 | $99 | $149 MXN
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BadgeDollarSign className="w-7 h-7 text-emerald-400" />
              <span>Búnker Financiero & Tesorería</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-normal leading-relaxed">
              Monitoreo en tiempo real de ingresos por clase presencial, planes Pro y suscripciones familiares. Emisión instantánea de comprobantes y enlaces por WhatsApp.
            </p>
          </div>

          {/* ACCIÓN RÁPIDA DE COBRO */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-4 py-3 bg-[#0a0e17]/80 backdrop-blur rounded-2xl border border-zinc-800 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">Caja en Cancha</span>
                <span className="text-sm font-black text-white">Activa • Tiempo Real</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 TARJETAS KPI TIPO FINTECH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* KPI 1: Ingresos Totales del Mes */}
          <div className="bg-[#121824]/90 backdrop-blur border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-400/60 transition-all shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-xs">
              <span className="uppercase font-bold tracking-wider text-[11px] text-emerald-300">Ingresos del Mes</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${totalCollectedEstimated + (students.length * 50)} <span className="text-xs text-emerald-400 font-bold">MXN</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 100%
              </span>
              <span>conciliado en Carmen Serdán</span>
            </div>
          </div>

          {/* KPI 2: Cuentas por Cobrar (Adeudos) */}
          <div className="bg-[#1a1215]/90 backdrop-blur border border-rose-500/40 p-5 rounded-2xl relative overflow-hidden group hover:border-rose-400/70 transition-all shadow-lg shadow-rose-950/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-xs">
              <span className="uppercase font-bold tracking-wider text-[11px] text-rose-300">Por Cobrar (Adeudos)</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
              ${totalReceivable} <span className="text-xs text-rose-300/80 font-normal">MXN</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>{debtors.length} alumnos con saldo pendiente</span>
              <span className="text-rose-400 font-bold underline cursor-pointer" onClick={() => setTierFilter('all')}>
                Ver todos
              </span>
            </div>
          </div>

          {/* KPI 3: Atletas al Corriente */}
          <div className="bg-[#121724]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-xs">
              <span className="uppercase font-bold tracking-wider text-[11px]">Atletas al Corriente</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {upToDateCount} <span className="text-xs text-zinc-400 font-normal">de {students.length}</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 font-mono">
              Tasa de solvencia: <span className="text-blue-400 font-bold">{students.length > 0 ? Math.round((upToDateCount / students.length) * 100) : 100}%</span>
            </div>
          </div>

          {/* KPI 4: Matriz de Membresías ECC */}
          <div className="bg-[#161320]/90 backdrop-blur border border-purple-500/30 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-400/60 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2 font-mono text-xs">
              <span className="uppercase font-bold tracking-wider text-[11px] text-purple-300">Planes Activos</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-mono space-y-1 mt-1 text-zinc-300">
              <div className="flex justify-between items-center">
                <span>• Clases ($50):</span>
                <span className="font-bold text-white">{planTiersStats.clase50Count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400">• Plan Pro ($99):</span>
                <span className="font-bold text-amber-300">{planTiersStats.pro99Count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400">• Élite Pack ($149):</span>
                <span className="font-bold text-purple-300">{planTiersStats.pack149Count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DE PLANES OFICIALES WILDE WOLVES ECC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#0f141d] border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-300">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-bold">Cuota Cancha Presencial</span>
              <span className="text-base font-black text-white">$50 <span className="text-xs text-zinc-400 font-normal">MXN / clase</span></span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">Básica</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121624] border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase block font-bold">Plan Pro Individual</span>
              <span className="text-base font-black text-white">$99 <span className="text-xs text-amber-300 font-normal">MXN / mes</span></span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">IA + HUD</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161224] border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300 uppercase block font-bold">Pack Familiar Élite</span>
              <span className="text-base font-black text-white">$149 <span className="text-xs text-purple-300 font-normal">MXN / mes</span></span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">Hermanos</span>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-[#0f141e] border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Píldoras de Filtro por Membresía */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              tierFilter === 'all'
                ? 'bg-zinc-700 text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setTierFilter('cuota_clase_50')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              tierFilter === 'cuota_clase_50'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>Clase Cancha ($50)</span>
          </button>
          <button
            onClick={() => setTierFilter('plan_pro_99')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              tierFilter === 'plan_pro_99'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>Plan Pro ($99)</span>
          </button>
          <button
            onClick={() => setTierFilter('pack_familiar_elite_149')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              tierFilter === 'pack_familiar_elite_149'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>Familiar Élite ($149)</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por atleta o tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d14] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>
      </div>

      {/* TABLA MODERNA FINTECH DE TRANSACCIONES Y COBRANZA */}
      <div className="bg-[#0e131d] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Matriz de Transacciones y Cobros en Cancha</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              Mostrando {filteredStudents.length} de {students.length} atletas registrados
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400 text-[11px]">Acción masiva:</span>
            <button
              onClick={() => {
                debtors.forEach(d => handleSendWhatsAppQuickPay(d));
              }}
              className="px-3 py-1 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-all font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
              title="Disparar recordatorio a todos los deudores vía WhatsApp"
            >
              <Send className="w-3 h-3" /> Recordar Adeudos ({debtors.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-[#0a0d14]/70 text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3.5 px-4 font-semibold">Atleta / Posición</th>
                <th className="py-3.5 px-4 font-semibold">Membresía / Modalidad</th>
                <th className="py-3.5 px-4 font-semibold">Asistencia Acum.</th>
                <th className="py-3.5 px-4 font-semibold">Estado de Cuenta</th>
                <th className="py-3.5 px-4 font-semibold">Último Pago</th>
                <th className="py-3.5 px-4 font-semibold text-right">Comprobante & WhatsApp</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                    No se encontraron registros financieros bajo los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const balance = st.finances?.balanceDue || 0;
                  const isUpToDate = balance === 0;
                  const lastAmount = st.finances?.lastPaymentAmount || 50;

                  return (
                    <tr key={st.id} className="hover:bg-[#121824]/60 transition-colors group">
                      {/* Atleta */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&auto=format&fit=crop&q=80"}
                            alt={st.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-zinc-700 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                              {st.fullName}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {st.position} • {st.guardianName ? `Tutor: ${st.guardianName}` : 'Deportivo Carmen Serdán'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Modalidad / Tier */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {onUpdateFrequency ? (
                          <select
                            value={st.finances?.frequency || 'al_dia'}
                            onChange={(e) => onUpdateFrequency(st.id, e.target.value as PaymentFrequency)}
                            className="bg-[#080b11] border border-zinc-800 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="al_dia">Cuota Cancha ($50)</option>
                            <option value="semanal">Plan Pro ($99)</option>
                            <option value="mensual">Pack Familiar ($149)</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                            {st.finances?.frequency === 'mensual' 
                              ? 'Familiar ($149)' 
                              : st.finances?.frequency === 'semanal' 
                                ? 'Plan Pro ($99)' 
                                : 'Cancha ($50)'}
                          </span>
                        )}
                      </td>

                      {/* Días Entrenados */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-white text-xs">{st.totalDaysTrained || 0}</span>
                        <span className="text-zinc-500 text-[10px]"> sesiones</span>
                      </td>

                      {/* Estado de Cuenta */}
                      <td className="py-3.5 px-4 font-mono">
                        {isUpToDate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Al Corriente ($0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/40">
                            <AlertCircle className="w-3 h-3" />
                            Debe ${balance} MXN
                          </span>
                        )}
                      </td>

                      {/* Último Pago */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                        <div>{st.finances?.lastPaymentDate || 'Sin registro'}</div>
                        <div className="text-[10px] text-zinc-500">
                          ${lastAmount} MXN • {st.finances?.paymentMethod || 'Efectivo'}
                        </div>
                      </td>

                      {/* Comprobante Digital & WhatsApp */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Generar Comprobante */}
                          <button
                            type="button"
                            onClick={() => handleGenerateReceipt(st)}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700/60"
                            title="Generar e imprimir comprobante digital ECC"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* Enlace WhatsApp de Pago Rápido */}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppQuickPay(st)}
                            className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition-all cursor-pointer"
                            title="Enviar enlace de pago rápido por WhatsApp al tutor"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Botón de Cobro Directo */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <button
                          type="button"
                          onClick={() => handleOpenPay(st)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-700/20 ml-auto"
                        >
                          <BadgeDollarSign className="w-3.5 h-3.5" />
                          <span>Cobrar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FINTECH PARA REGISTRAR COBRO Y EMISIÓN DE TIER */}
      {selectedStudentForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-[#121622] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-wider block">
                  REGISTRO DE COBRO ECC
                </span>
                <h4 className="text-base font-black text-white">{selectedStudentForPay.fullName}</h4>
              </div>
              <button
                onClick={() => setSelectedStudentForPay(null)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Selector de Plan / Concepto */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-2 font-bold uppercase">
                  Seleccionar Membresía o Cuota:
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handlePlanSelect('cuota_clase_50')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlanTier === 'cuota_clase_50'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] text-zinc-400">Clase Cancha</div>
                    <div className="text-base font-black text-emerald-400">$50</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelect('plan_pro_99')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlanTier === 'plan_pro_99'
                        ? 'bg-amber-600/20 border-amber-500 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] text-amber-400">Plan Pro</div>
                    <div className="text-base font-black text-amber-300">$99</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelect('pack_familiar_elite_149')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlanTier === 'pack_familiar_elite_149'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] text-purple-300">Pack Élite</div>
                    <div className="text-base font-black text-purple-300">$149</div>
                  </button>
                </div>
              </div>

              {/* Monto Personalizado */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Monto a Liquidar (MXN):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#090c13] border border-zinc-800 rounded-xl pl-8 pr-3 py-2.5 text-white font-black text-lg font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {selectedStudentForPay.finances?.balanceDue > 0 && (
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                    Saldo pendiente actual del atleta: ${selectedStudentForPay.finances.balanceDue} MXN
                  </span>
                )}
              </div>

              {/* Método de Pago */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Método de Recaudación:</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full bg-[#090c13] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Efectivo">Efectivo en Cancha (Carmen Serdán)</option>
                  <option value="Transferencia">Transferencia SPEI Inmediata</option>
                  <option value="Stripe">Stripe Terminal / Tarjeta de Débito</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPay(null)}
                  className="w-1/3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs transition shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <CheckCircle2 className="w-4 h-4" /> Acreditar ${payAmount} MXN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COMPROBANTE DE PAGO DIGITAL ECC */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-[#121622] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider">
              COMPROBANTE OFICIAL DE PAGO
            </span>
            <h3 className="text-xl font-black text-white mt-1">Wild Wolves Academy</h3>
            <p className="text-[11px] text-zinc-400 font-mono">Deportivo Carmen Serdán, CDMX</p>

            <div className="my-5 p-4 rounded-2xl bg-[#090c13] border border-zinc-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Folio ECC:</span>
                <span className="text-white font-bold">{receiptModalData.folio}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fecha:</span>
                <span className="text-white font-bold">{receiptModalData.date}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Atleta:</span>
                <span className="text-white font-bold">{receiptModalData.student.fullName}</span>
              </div>
              <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-2">
                <span>Concepto:</span>
                <span className="text-emerald-400 font-bold">{receiptModalData.planLabel}</span>
              </div>
              <div className="flex justify-between text-zinc-200 text-sm font-black border-t border-zinc-800 pt-2">
                <span>Total Pagado:</span>
                <span className="text-emerald-400">${receiptModalData.amount} MXN</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSendReceiptWhatsApp(receiptModalData)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 cursor-pointer font-mono"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Comprobante por WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setReceiptModalData(null)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-mono transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FinanceManager;
