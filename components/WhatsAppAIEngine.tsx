'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  User, 
  ExternalLink,
  Target,
  Flame,
  Zap,
  Activity,
  Award
} from 'lucide-react';

export interface AthleteRecord {
  athlete_name: string;
  jersey_number?: number;
  category?: string;
  overall_ovr: number;
  free_throws_made: number;
  three_point_made: number;
  vertical_jump_cm: number;
  coach_feedback: string;
  tutor_phone?: string;
  parent_name?: string;
  student_id?: string;
}

interface WhatsAppAIEngineProps {
  records?: AthleteRecord[];
  onMessageSent?: (athlete: AthleteRecord, message: string) => void;
}

export default function WhatsAppAIEngine({ 
  records = [],
  onMessageSent
}: WhatsAppAIEngineProps) {
  // Lista con respaldo de atletas oficiales si viene vacía
  const defaultRecords: AthleteRecord[] = records.length > 0 ? records : [
    {
      athlete_name: 'Bruno Díaz',
      jersey_number: 11,
      category: 'U-17 Competitivo',
      overall_ovr: 88,
      free_throws_made: 10,
      three_point_made: 15,
      vertical_jump_cm: 110,
      coach_feedback: 'Mecánica de codo y brazo alineada en tiros libres. Excelente velocidad de reacción en duela.',
      tutor_phone: '5522427769',
      parent_name: 'Familia Díaz'
    },
    {
      athlete_name: 'Jesús',
      jersey_number: 7,
      category: 'U-15 Formativo',
      overall_ovr: 78,
      free_throws_made: 8,
      three_point_made: 12,
      vertical_jump_cm: 60,
      coach_feedback: 'Gran intensidad defensiva y salto vertical en constante ascenso.',
      tutor_phone: '5522427769',
      parent_name: 'Familia Morales'
    }
  ];

  const [athleteList, setAthleteList] = useState<AthleteRecord[]>(defaultRecords);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRecord>(defaultRecords[0]);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (records.length > 0) {
      setAthleteList(records);
      setSelectedAthlete(records[0]);
      generateProReport(records[0]);
    } else {
      generateProReport(defaultRecords[0]);
    }
  }, [records]);

  // Generador de dictamen técnico profesional con IA
  const generateProReport = (athlete: AthleteRecord) => {
    setAiGenerating(true);
    setTimeout(() => {
      const portalUrl = 'https://wild-wolves-academy.vercel.app/dashboard-guardian';
      const guardianSalutation = athlete.parent_name ? `Estimado(a) ${athlete.parent_name}` : 'Estimada Familia Wild Wolves';
      
      const msg = 
        `🐺 *WILD WOLVES BASKETBALL ACADEMY CDMX* 🐺\n` +
        `📍 *Sede Oficial:* Deportivo Carmen Serdán\n` +
        `🏀 *Head Coach:* Ricardo\n\n` +
        `${guardianSalutation}, le compartimos el dictamen técnico y evaluación de duela de *${athlete.athlete_name}* (Jersey #${athlete.jersey_number || '11'}):\n\n` +
        `📊 *MÉTRICAS OFICIALES REGISTRADAS:*\n` +
        `• *Nivel General (OVR):* ${athlete.overall_ovr} / 99\n` +
        `• *Tiros Libres:* ${athlete.free_throws_made}/10 aciertos (${Math.round((athlete.free_throws_made / 10) * 100)}% efectividad)\n` +
        `• *Triples en 5 Spots:* ${athlete.three_point_made}/25 aciertos\n` +
        `• *Salto Vertical:* ${athlete.vertical_jump_cm} cm\n\n` +
        `💡 *DIAGNÓSTICO DEL HEAD COACH RICARDO:*\n` +
        `"${athlete.coach_feedback || 'Atleta con alto enfoque biomecánico y disciplina continua en cancha.'}"\n\n` +
        `🔗 *Consulta el Mapa de Calor y Análisis Shot Science en vivo:*\n` +
        `${portalUrl}\n\n` +
        `_Wild Wolves: Formando atletas de alto rendimiento con carácter y valores._`;

      setGeneratedMessage(msg);
      setAiGenerating(false);
    }, 450);
  };

  const sendToWhatsApp = (phone?: string) => {
    const targetPhone = phone || selectedAthlete?.tutor_phone || '';
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    const encoded = encodeURIComponent(generatedMessage);

    const url = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;

    if (onMessageSent && selectedAthlete) {
      onMessageSent(selectedAthlete, generatedMessage);
    }

    window.open(url, '_blank');
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#0b0e14] p-5 sm:p-7 text-zinc-100 shadow-2xl space-y-5">
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black font-mono uppercase tracking-wider text-emerald-400">
                Módulo IA & WhatsApp CRM
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Carmen Serdán CDMX
              </span>
            </div>
            <h3 className="mt-1 text-base sm:text-lg font-black uppercase text-white tracking-tight">
              Generador de Reportes Automatizados para Tutores
            </h3>
            <p className="text-xs text-zinc-400">
              Redacción automática del dictamen técnico oficial para enviar directamente al WhatsApp de las familias.
            </p>
          </div>
        </div>

        {/* CONTADOR DE ATLETAS */}
        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-center">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Atletas Listos</span>
          <span className="text-base font-black text-white font-mono">{athleteList.length}</span>
        </div>
      </div>

      {/* 2. GRID DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LISTA DE ATLETAS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-zinc-400">
            <span>Plantel Evaluado</span>
            <span className="text-orange-400">Seleccionar Atleta</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {athleteList.map((rec, idx) => {
              const isSelected = selectedAthlete?.athlete_name === rec.athlete_name;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAthlete(rec);
                    generateProReport(rec);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-md shadow-orange-950/30' 
                      : 'bg-[#0f131d] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{rec.athlete_name}</span>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      #{rec.jersey_number || '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-zinc-400">
                    <span className="text-amber-400 font-bold">{rec.overall_ovr} OVR</span>
                    <span>•</span>
                    <span>TL: {rec.free_throws_made}/10</span>
                    <span>•</span>
                    <span>3P: {rec.three_point_made}/25</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* EDITOR Y VISTA PREVIA DEL MENSAJE IA */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-[#07090e] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Mensaje Estructurado con IA
              </span>
              {aiGenerating && (
                <span className="text-[11px] font-mono text-orange-400 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Generando dictamen deportivo...
                </span>
              )}
            </div>

            <textarea
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              rows={11}
              className="w-full bg-[#0b0e14] border border-zinc-800 focus:border-emerald-500 rounded-xl p-3.5 text-xs text-zinc-200 font-mono leading-relaxed outline-none transition"
              placeholder="Selecciona un atleta para redactar el informe oficial..."
            />
          </div>

          {/* ACCIONES Y BOTONES DE DISPARO */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => selectedAthlete && generateProReport(selectedAthlete)}
              disabled={aiGenerating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerar Dictamen</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{isCopied ? '✓ Copiado al Portapapeles' : '📋 Copiar Texto'}</span>
            </button>

            <button
              onClick={() => sendToWhatsApp(selectedAthlete?.tutor_phone)}
              disabled={!generatedMessage || aiGenerating}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Enviar por WhatsApp al Tutor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
