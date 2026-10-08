'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/lib/types';
import { MessageCircle, Check, Copy } from 'lucide-react';

interface WhatsAppReportButtonProps {
  student?: StudentProfile | null;
  label?: string;
  className?: string;
}

export function WhatsAppReportButton({
  student,
  label = 'Reporte WhatsApp',
  className = '',
}: WhatsAppReportButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!student) {
    return (
      <button
        disabled
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-500 border border-zinc-700 text-xs font-mono font-bold opacity-50 cursor-not-allowed ${className}`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  // WhatsApp oficial: 01 55 2242 7769 -> 525522427769
  const defaultAcademyWhatsApp = '525522427769';
  const targetPhone = (student.parentPhone || student.phone || defaultAcademyWhatsApp).replace(/[^0-9]/g, '');

  const latestEval = student.evaluations[0];
  const cur = student.metricsCurrent;
  const prev = student.metricsPrevious;

  const currentAvg = Math.round(
    (cur.freeThrow + cur.midRange + cur.threePoint + cur.verticalJump + cur.sprint100m + cur.agilityTTest) / 6
  );

  const buildMessage = (): string => {
    return `🏀 *REPORTE DE RENDIMIENTO & ASISTENCIA - WILD WOLVES CDMX*
🐺 *HoopPerformance OS v0.3.0*
━━━━━━━━━━━━━━━━━━━━
👤 *Atleta:* ${student.fullName}
📍 *Posición:* ${student.position} | *Género:* ${student.gender === 'M' ? 'Varonil' : 'Femenil'} | *Edad:* ${student.age} años

📅 *CONTROL DE ASISTENCIA:*
• 🏆 *Total de Días Entrenados:* ${student.totalDaysTrained} sesiones completadas
• 📆 *Días de Entrenamiento:* ${(student.trainingDays || ['Lunes', 'Miércoles', 'Viernes']).join(', ')}

💵 *ESTADO DE CUENTA ($50 PESOS / CLASE):*
• 💳 Modalidad: ${student.finances.frequency === 'al_dia' ? 'Al Día ($50 MXN)' : student.finances.frequency === 'semanal' ? 'Semanal ($150 MXN)' : 'Mensual ($600 MXN)'}
• 📌 Estado: ${student.finances.status === 'al_corriente' ? '✅ Al Corriente ($0 adeudo)' : `⚠️ Adeudo Pendiente de $${student.finances.balanceDue} MXN`}

📊 *EVALUACIÓN DE COMBINE (Mes Actual vs Anterior):*
• 🎯 Tiros Libres (20T): ${cur.freeThrow}% (ant: ${prev.freeThrow}%)
• 🏹 Media Distancia: ${cur.midRange}% (ant: ${prev.midRange}%)
• 🔥 Tiro de 3 Puntos: ${cur.threePoint}% (ant: ${prev.threePoint}%)
• ⚡ Salto Vertical: ${cur.verticalJump}/100 (ant: ${prev.verticalJump}/100)
• 🏃 Velocidad 100m: ${cur.sprint100m}/100 (ant: ${prev.sprint100m}/100)
• 🛡️ Agilidad T-Test: ${cur.agilityTTest}/100 (ant: ${prev.agilityTTest}/100)
👉 *Promedio General de Rendimiento:* ${currentAvg}/100 pts

📝 *Observaciones del Entrenador:*
"${latestEval?.coachNotes || 'Entrenamiento regular completado con disciplina técnica.'}"
━━━━━━━━━━━━━━━━━━━━
🐺 _Wild Wolves Basketball Academy CDMX_
📲 WhatsApp Directo: 01 55 2242 7769`;
  };

  const handleOpenWhatsApp = () => {
    const text = buildMessage();
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleOpenWhatsApp}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer ${className}`}
        title={`Enviar WhatsApp a: ${targetPhone}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{label}</span>
      </button>

      <button
        onClick={handleCopy}
        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
        title="Copiar reporte al portapapeles"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
