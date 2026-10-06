'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/lib/types';
import { MessageCircle, Check, Share2, Copy } from 'lucide-react';

interface WhatsAppReportButtonProps {
  student: StudentProfile;
  phoneNumber?: string; // e.g. Coach phone or Parent phone
  label?: string;
  className?: string;
}

export function WhatsAppReportButton({
  student,
  phoneNumber = '5215500000000',
  label = 'Compartir Reporte por WhatsApp',
  className = '',
}: WhatsAppReportButtonProps) {
  const [copied, setCopied] = useState(false);

  const overallRating = Math.round(
    Object.values(student.currentMetrics).reduce((a, b) => a + b, 0) / 6
  );

  const completedRope = student.trainingPlan.ropeTracker.filter((r) => r.completed).length;
  const totalRopeJumps = student.trainingPlan.ropeTracker
    .filter((r) => r.completed)
    .reduce((acc, curr) => acc + curr.targetJumps, 0);

  const completedEnduranceMin = student.trainingPlan.enduranceCalendar
    .filter((e) => e.completed)
    .reduce((acc, curr) => acc + curr.minutesEstimated, 0);

  const latestEval = student.evaluations[0];

  const buildReportMessage = (): string => {
    return `🏀 *REPORTE DE RENDIMIENTO - HOOPPERFORMANCE OS v0.3*
🐺 *Wild Wolves Basketball Academy*
━━━━━━━━━━━━━━━━━━━━
👤 *Atleta:* #${student.jerseyNumber} ${student.name}
📍 *Posición:* ${student.position} | *Categoría:* ${student.category}
📏 *Físico:* ${student.height} | ${student.weight} | ${student.age} años

📊 *ÍNDICE GENERAL BIOMÉTRICO (OAR):* ${overallRating}/100 pts
• 🎯 Tiro Perimetral & Libres: ${student.currentMetrics.shooting}/100
• 🏀 Manejo & Drible: ${student.currentMetrics.ballHandling}/100
• ⚡ Salto Vertical Explosivo: ${student.currentMetrics.verticalJump}/100 (${latestEval?.rawStats.verticalJumpInches ?? 30}" pulgadas)
• 🏃 Agilidad & Sprint: ${student.currentMetrics.agilitySpeed}/100 (${latestEval?.rawStats.laneAgilitySeconds ?? 10.5}s)
• 🛡️ Defensa & IQ: ${student.currentMetrics.defensiveIQ}/100
• 🫀 Resistencia Cardiovascular: ${student.currentMetrics.staminaFitness}/100

📈 *PLAN DE SOBRECARGA & CARDIO:*
• 🪢 Salto de Cuerda: ${completedRope}/30 días (${totalRopeJumps.toLocaleString()} saltos acumulados)
• ⏱️ Resistencia Aeróbica: ${completedEnduranceMin} min acumulados (Progresión 30s ➔ 60m)

📝 *Feedback del Coach:*
"${latestEval?.coachNotes || 'Entrenamiento regular completado satisfactoriamente.'}"
━━━━━━━━━━━━━━━━━━━━
🔗 _Generado por HoopPerformance OS v0.3.0_`;
  };

  const handleOpenWhatsApp = () => {
    const text = buildReportMessage();
    const encoded = encodeURIComponent(text);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildReportMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleOpenWhatsApp}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{label}</span>
      </button>

      <button
        onClick={handleCopy}
        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        title="Copiar texto formateado"
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
