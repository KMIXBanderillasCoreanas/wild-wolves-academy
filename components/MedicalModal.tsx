'use client';

import React from 'react';
import { MedicalRecord, StudentProfile } from '@/lib/types';
import { 
  X, 
  ShieldAlert, 
  Heart, 
  PhoneCall, 
  MessageCircle, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ShieldCheck,
  Lock
} from 'lucide-react';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  isCoach: boolean;
}

export function MedicalModal({ isOpen, onClose, student, isCoach }: MedicalModalProps) {
  if (!isOpen) return null;

  // Strict RBAC Guard: Medical record is confidential and visible ONLY to Coaches
  if (!isCoach) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>CONFIDENCIALIDAD MÉDICA</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Acceso Restringido al Personal Médico</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Por protocolos de privacidad deportiva y seguridad de datos, la ficha clínica, historial de lesiones y contactos de emergencia de los atletas son de acceso exclusivo para el cuerpo técnico (<strong className="text-orange-400">Head Coach</strong>).
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Cerrar Ficha Médica
          </button>
        </div>
      </div>
    );
  }

  const med = student.medicalRecord;
  const cleanPhone = med.emergencyContactPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                Uso Exclusivo del Coach
              </span>
              <span className="text-xs text-slate-400">Atleta: #{student.jerseyNumber} {student.name}</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
              <span>Ficha Médica &amp; Contacto de Emergencia</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5">
          {/* Emergency Contact Highlight Card */}
          <div className="bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/40 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">
                  Contacto de Emergencia 24/7
                </span>
                <div className="text-lg font-black text-white">{med.emergencyContactName}</div>
                <div className="text-xs text-slate-300">
                  Parentesco: <strong className="text-orange-400">{med.emergencyContactRelation}</strong>
                </div>
                <div className="text-sm font-bold text-slate-200 mt-1">{med.emergencyContactPhone}</div>
              </div>

              {/* Quick Action Dial / WhatsApp */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Llamar</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=Estimado%20contacto%20de%20emergencia%2C%20le%20contacto%20desde%20la%20Academia%20Wild%20Wolves%20respecto%20al%20atleta%20${encodeURIComponent(student.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Clinical Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Type */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Grupo Sanguíneo
              </span>
              <div className="text-xl font-black text-red-400">{med.bloodType}</div>
            </div>

            {/* Asthma / Cardio */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Condición Asma / Cardio
              </span>
              <div className="text-base font-bold text-white flex items-center gap-2">
                {med.asthmaOrCardio ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Requiere inhalador preventivo
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Sin anomalías cardiorrespiratorias
                  </span>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 sm:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Alergias Conocidas
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {med.allergies.map((all, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30"
                  >
                    {all}
                  </span>
                ))}
              </div>
            </div>

            {/* Injury History */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 sm:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Historial de Lesiones y Cirugías
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {med.injuriesHistory}
              </p>
            </div>

            {/* Insurance & Checkup */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">Póliza de Seguro Médico: </span>
                <span className="text-orange-400 font-mono font-bold">{med.insurancePolicyNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Último Chequeo: </span>
                <span className="text-white">{med.lastMedicalCheckup}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
