'use client';

import React from 'react';
import { StudentProfile } from '@/lib/types';
import { 
  X, 
  ShieldAlert, 
  Heart, 
  PhoneCall, 
  MessageCircle, 
  ShieldCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  isCoach: boolean;
}

export function MedicalModal({ isOpen, onClose, student, isCoach }: MedicalModalProps) {
  if (!isOpen) return null;

  // Verificación estricta de RBAC: Ficha médica privada visible SOLO para Coach
  if (!isCoach) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#18181b] border border-rose-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center relative font-sans">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CONFIDENCIALIDAD MÉDICA</span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Acceso Exclusivo del Entrenador</h3>
          <p className="text-xs text-zinc-300 leading-relaxed mb-6 font-mono">
            Por protocolos de confidencialidad deportiva y privacidad de datos, la ficha clínica, historial de alergias y contactos de emergencia son accesibles únicamente para el cuerpo técnico de la academia.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-colors cursor-pointer"
          >
            Cerrar Ficha Médica
          </button>
        </div>
      </div>
    );
  }

  const med = student.medicalNotes;
  const cleanPhone = med.emergencyPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8 max-w-2xl w-full relative my-8 font-sans">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Uso Exclusivo del Entrenador
              </span>
              <span className="text-xs font-mono text-zinc-400">Atleta: {student.fullName} ({student.gender}, {student.age} años)</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Ficha Médica &amp; Contacto de Emergencia</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarjeta de Contacto de Emergencia 24/7 */}
        <div className="mt-5 space-y-4">
          <div className="bg-[#0a0e17] border border-rose-500/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">
                  Contacto de Emergencia 24/7
                </span>
                <div className="text-base font-bold text-white">{med.emergencyContact}</div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">{med.emergencyPhone}</div>
                {student.parentPhone && (
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Teléfono del Tutor Legal: <span className="text-zinc-300">{student.parentPhone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs border border-zinc-700 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Llamar</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=Estimado%20contacto%20de%20emergencia%20de%20${encodeURIComponent(student.fullName)}%2C%20le%20escribe%20el%20Entrenador%20desde%20la%20Academia%20Wild%20Wolves.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Grilla Médica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 uppercase block mb-1">Grupo Sanguíneo</span>
              <div className="text-base font-bold text-rose-400">{med.bloodType}</div>
            </div>

            <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a]">
              <span className="text-[10px] text-zinc-400 uppercase block mb-1">Último Chequeo Físico</span>
              <div className="text-sm font-bold text-white">{med.lastCheckup || 'Al corriente'}</div>
            </div>

            <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] sm:col-span-2">
              <span className="text-[10px] text-zinc-400 uppercase block mb-1">Alergias Conocidas</span>
              <div className="text-sm text-zinc-200">{med.allergies || 'Ninguna declarada'}</div>
            </div>

            <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] sm:col-span-2">
              <span className="text-[10px] text-zinc-400 uppercase block mb-1">Condiciones Médicas / Lesiones Previas</span>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {med.medicalConditions || 'Sin restricciones para actividad física de alta intensidad.'}
              </p>
            </div>

            {med.insurancePolicy && (
              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#27272a] sm:col-span-2 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 uppercase">Póliza de Seguro Médico:</span>
                <span className="text-orange-400 font-bold">{med.insurancePolicy}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cierre */}
        <div className="mt-6 pt-4 border-t border-[#27272a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
