'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface DebtRecord {
  id: string;
  student_name: string;
  tutor_name: string;
  tutor_phone: string;
  pending_classes: number;
  total_debt: number;
  status: 'AL DÍA' | 'ADEUDO';
}

export default function DebtControlTable() {
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function fetchDebts() {
      try {
        // Consulta unificada directa a Supabase cruzando perfiles y adeudos
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, current_debt_amount, phone, parent_phone, guardian_name, role, financial_status')
          .in('role', ['student', 'alumno']);

        if (error) {
          console.error('Error al cargar adeudos:', error);
        } else if (data) {
          // Mapeo de datos para la tabla de control
          const formatted: DebtRecord[] = data.map((item: any) => {
            const rawDebt = Number(item.current_debt_amount) || 0;
            const isMarkedDebt = item.financial_status === 'adeudo' || item.financial_status === 'pendiente';
            const debt = (rawDebt === 0 && isMarkedDebt) ? 50 : rawDebt;
            const classes = Math.max(debt > 0 ? 1 : 0, Math.ceil(debt / 50)); // $50 MXN por clase

            return {
              id: item.id,
              student_name: item.full_name || 'Atleta Sin Nombre',
              tutor_name: item.guardian_name || item.tutor_name || 'Tutor / Familiar',
              tutor_phone: item.parent_phone || item.phone || '525500000000',
              pending_classes: classes,
              total_debt: debt,
              status: debt > 0 ? 'ADEUDO' : 'AL DÍA',
            };
          });
          setDebts(formatted);
        }
      } catch (err) {
        console.error('Error de red:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDebts();
  }, []);

  // Filtrar por nombre de alumno o tutor
  const filteredDebts = debts.filter((d) =>
    d.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tutor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsAppReminder = (record: DebtRecord) => {
    const rawPhone = (record.tutor_phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
    const phoneParam = cleanPhone && cleanPhone !== '525500000000' ? `${cleanPhone}` : '';
    const message = `¡Hola! 🐺 Le escribimos de Wild Wolves Basketball Academy OS (Deportivo Carmen Serdán). Le recordamos que el atleta ${record.student_name} tiene un adeudo pendiente de $${record.total_debt} MXN (${record.pending_classes} clases de duela). ¿Nos apoya con su regularización para mantener su acceso activo? Quedamos atentos. 🏀`;
    const url = phoneParam 
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="p-6 text-neutral-400 animate-pulse">Cargando control de adeudos en duela...</div>;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-orange-500 flex items-center gap-2">
          📋 Control de Adeudos & Duela ($50 MXN/clase)
        </h3>
        <input
          type="text"
          placeholder="Buscar atleta o tutor por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 w-full md:w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="py-3 px-4">Atleta</th>
              <th className="py-3 px-4">Tutor</th>
              <th className="py-3 px-4">Clases Pendientes</th>
              <th className="py-3 px-4">Deuda Total</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acción WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filteredDebts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  No se encontraron registros de adeudos.
                </td>
              </tr>
            ) : (
              filteredDebts.map((record) => (
                <tr key={record.id} className="border-b border-neutral-800/50 hover:bg-neutral-950/50 transition">
                  <td className="py-3 px-4 font-semibold text-white">{record.student_name}</td>
                  <td className="py-3 px-4 text-neutral-300">
                    <div>{record.tutor_name}</div>
                    <div className="text-[11px] text-neutral-500">{record.tutor_phone}</div>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">{record.pending_classes} clases</td>
                  <td className="py-3 px-4 font-bold text-orange-400">${record.total_debt} MXN</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        record.status === 'ADEUDO'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleWhatsAppReminder(record)}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-md"
                    >
                      <span>💬 Recordatorio WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
