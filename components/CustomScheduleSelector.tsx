"use client";

import React, { useState } from "react";
import { Calendar, Clock, Check, Sun, Moon, Sparkles } from "lucide-react";

export interface ScheduleConfigProps {
  initialDays?: string[];
  initialSchedules?: Record<string, string>;
  onSave?: (days: string[], schedules: Record<string, string>) => void;
}

export const AVAILABLE_DAYS = [
  { id: "lunes", label: "Lun", full: "Lunes", weekend: false },
  { id: "martes", label: "Mar", full: "Martes", weekend: false },
  { id: "miercoles", label: "Mié", full: "Miércoles", weekend: false },
  { id: "jueves", label: "Jue", full: "Jueves", weekend: false },
  { id: "viernes", label: "Vie", full: "Viernes", weekend: false },
  { id: "sabado", label: "Sáb", full: "Sábado", weekend: true },
  { id: "domingo", label: "Dom", full: "Domingo", weekend: true },
];

export default function CustomScheduleSelector({
  initialDays = ["lunes", "miercoles", "viernes"],
  initialSchedules = {},
  onSave,
}: ScheduleConfigProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [daySchedules, setDaySchedules] = useState<Record<string, string>>(initialSchedules);

  const toggleDay = (dayId: string) => {
    let nextDays: string[];
    let nextSchedules = { ...daySchedules };

    if (selectedDays.includes(dayId)) {
      nextDays = selectedDays.filter((d) => d !== dayId);
    } else {
      nextDays = [...selectedDays, dayId];
      // Asignar horario por defecto si no lo tiene
      if (!nextSchedules[dayId]) {
        nextSchedules[dayId] = dayId === "domingo" ? "16:00 - 18:00" : "17:00 - 19:00";
      }
    }
    setSelectedDays(nextDays);
    setDaySchedules(nextSchedules);
    if (onSave) {
      onSave(nextDays, nextSchedules);
    }
  };

  const setScheduleForDay = (dayId: string, schedule: string) => {
    const nextSchedules = {
      ...daySchedules,
      [dayId]: schedule,
    };
    setDaySchedules(nextSchedules);
    if (onSave) {
      onSave(selectedDays, nextSchedules);
    }
  };

  return (
    <div className="bg-[#10131a] border border-zinc-800 rounded-3xl p-4 sm:p-6 text-zinc-100 space-y-5">
      
      {/* CABECERA */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <Calendar className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-black uppercase tracking-wider text-white">
          Días y Horarios Personalizados de Entrenamiento
        </h3>
      </div>

      {/* SELECTOR DE DÍAS (LUNES A DOMINGO) */}
      <div>
        <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2 font-bold">
          1. Elige los días que asiste a cancha:
        </label>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {AVAILABLE_DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition border font-black cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-b from-orange-500 to-amber-600 border-orange-400 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                    : "bg-[#161b26] border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <span className="text-xs sm:text-sm">{day.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 mt-1 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALLE DE HORARIOS SEGÚN DÍAS ELEGIDOS */}
      {selectedDays.length > 0 && (
        <div className="space-y-3 pt-2">
          <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
            2. Horario para cada día seleccionado:
          </label>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {selectedDays.map((dayId) => {
              const dayMeta = AVAILABLE_DAYS.find((d) => d.id === dayId);
              const currentShift = daySchedules[dayId] || (dayId === "domingo" ? "16:00 - 18:00" : "17:00 - 19:00");
              const isSunday = dayId === "domingo";

              return (
                <div
                  key={dayId}
                  className="bg-[#161b26] border border-zinc-800/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="text-xs font-bold text-white uppercase">{dayMeta?.full}</span>
                  </div>

                  {/* OPCIONES DE TURNO */}
                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                    {!isSunday ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setScheduleForDay(dayId, "09:00 - 11:00")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            currentShift === "09:00 - 11:00"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                              : "bg-[#0d1017] text-zinc-400 border-zinc-800 hover:text-white"
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-400" /> Matutino (09:00 - 11:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleForDay(dayId, "17:00 - 19:00")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            currentShift === "17:00 - 19:00"
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                              : "bg-[#0d1017] text-zinc-400 border-zinc-800 hover:text-white"
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-orange-400" /> Vespertino (17:00 - 19:00)
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setScheduleForDay(dayId, "16:00 - 18:00")}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> Especial Domingo (16:00 - 18:00)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOTÓN DE GUARDAR SI SE DESEA BOTÓN EXPLÍCITO */}
      {onSave && (
        <button
          type="button"
          onClick={() => onSave(selectedDays, daySchedules)}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-black font-black uppercase text-xs tracking-wider transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Sparkles className="w-4 h-4 fill-black" /> Confirmar Horario Personalizado
        </button>
      )}

    </div>
  );
}
