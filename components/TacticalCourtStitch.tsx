'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Filter, 
  Download, 
  Zap, 
  Activity, 
  Info, 
  ShieldCheck, 
  Flame,
  Layers,
  Eye,
  Compass,
  Crosshair
} from 'lucide-react';

export interface TacticalZoneData {
  title: string;
  cluster: string;
  tier: string;
  tierColor: string;
  percentage: string;
  ratio: string;
  points: string;
  shotType: string;
  percentile: string;
  releaseTime: string;
  notes: string;
  footPosition: { x: number; y: number; angle: number; label: string };
  laserTrajectory: { startX: number; startY: number; endX: number; endY: number };
  backboardTarget: { x: number; y: number; description: string; color: string };
  biomechanicsTips: string[];
}

export interface TacticalShotMapProps {
  athleteName?: string;
  jerseyNumber?: string | number;
  category?: string;
  overallOvr?: number;
  shootingPercentage?: number;
  initialZone?: string;
}

// Generador dinámico de datos de zona según el atleta seleccionado y su efectividad real
export function getZoneDataForAthlete(athleteName: string = '', overallPct?: number): Record<string, TacticalZoneData> {
  const nLow = athleteName.toLowerCase();
  const isJesus = nLow.includes('jesús') || nLow.includes('jesus');
  const isIsaac = nLow.includes('isaac');

  // Si se pasa una efectividad calculada en tiempo real o el atleta no tiene valores históricos congelados,
  // calcular las 6 zonas dinámicamente según la efectividad real auditada (permite 100%, 80%, etc.)
  const hasDynamicPct = overallPct !== undefined && overallPct !== null;

  if (isJesus && !hasDynamicPct) {
    // Jesús (OVR 52, 24% efectividad global, 12 de 50 totales)
    return {
      'paint': {
        title: 'Línea Libre / Pintura (Zona 1)',
        cluster: 'Zona de Definición Interior & Tiros Libres',
        tier: 'EN DESARROLLO',
        tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        percentage: '40%',
        ratio: '4 / 10',
        points: '8 PTS',
        shotType: 'Tiro Libre Directo / Flotadora',
        percentile: 'BÁSICO (Percentil 45)',
        releaseTime: '0.88 seg',
        notes: 'Consistencia en fase inicial. Apoyo en metatarsos y buen seguimiento tras la soltura. Requiere mayor arco de entrada.',
        footPosition: { x: 250, y: 220, angle: 0, label: 'Línea Libre 4.60m' },
        laserTrajectory: { startX: 250, startY: 215, endX: 250, endY: 72 },
        backboardTarget: { x: 50, y: 50, description: 'Directo al centro del aro (Swish limpio sin tocar tabla)', color: '#FF6B00' },
        biomechanicsTips: [
          'Pies paralelos a la anchura de hombros, pie derecho adelantado 4 cm.',
          'Codo a 90° alineado perpendicular con el centro del aro.',
          'Extensión total del brazo buscando un arco de entrada de 48°.'
        ]
      },
      'mid-left': {
        title: 'Media Distancia Codo Izquierdo',
        cluster: 'Salida de Bloqueo / Flanco Izquierdo',
        tier: 'REGULAR',
        tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        percentage: '30%',
        ratio: '3 / 10',
        points: '6 PTS',
        shotType: 'Pull-up Jumper en 2 tiempos',
        percentile: 'BÁSICO (Percentil 40)',
        releaseTime: '0.85 seg',
        notes: 'Alineación de pies correcta al recibir el balón. Ajustar la desaceleración frontal para no quedar corto.',
        footPosition: { x: 120, y: 150, angle: 35, label: 'Codo Izquierdo 45°' },
        laserTrajectory: { startX: 125, startY: 145, endX: 242, endY: 65 },
        backboardTarget: { x: 38, y: 35, description: 'Vértice superior izquierdo del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
        biomechanicsTips: [
          'Orientar hombros al tablero antes de iniciar la batida de salto.',
          'Apuntar al cuadrado superior izquierdo para rebote suave.',
          'Caída equilibrada sobre ambos pies para proteger articulaciones.'
        ]
      },
      'mid-right': {
        title: 'Media Distancia Codo Derecho',
        cluster: 'Flanco Fuerte / Tiro Tras Bote',
        tier: 'CALIBRANDO',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '2 / 10',
        points: '4 PTS',
        shotType: 'Catch & Shoot con parada',
        percentile: 'BÁSICO (Percentil 35)',
        releaseTime: '0.89 seg',
        notes: 'Tiende a soltar con velocidad variable. Mejorar la sincronía entre el salto y la palanca del brazo.',
        footPosition: { x: 380, y: 150, angle: -35, label: 'Codo Derecho 45°' },
        laserTrajectory: { startX: 375, startY: 145, endX: 258, endY: 65 },
        backboardTarget: { x: 62, y: 35, description: 'Vértice superior derecho del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
        biomechanicsTips: [
          'Frenado en dos tiempos: pie derecho clava y pie izquierdo equilibra.',
          'Impacto en la esquina superior derecha del recuadro para entrada efectiva.',
          'Mantener la mirada en el aro hasta que el balón toque la red.'
        ]
      },
      'top-key': {
        title: 'Triple 3P Cúspide Frontal',
        cluster: 'Perímetro 6.75m Central',
        tier: 'RANGO EN DESARROLLO',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '1 / 5',
        points: '3 PTS',
        shotType: 'Tiro de Larga Distancia',
        percentile: 'INICIAL (Percentil 30)',
        releaseTime: '0.94 seg',
        notes: 'Generación de impulso desde cadera y piernas. Faltan repeticiones de sobrecarga para fijar distancia.',
        footPosition: { x: 250, y: 410, angle: 0, label: 'Cúspide Central Triple 6.75m' },
        laserTrajectory: { startX: 250, startY: 400, endX: 250, endY: 72 },
        backboardTarget: { x: 50, y: 55, description: 'Entrada limpia directa sin tabla', color: '#10B981' },
        biomechanicsTips: [
          'Mayor flexión de rodillas a 110° para transferir fuerza al balón.',
          'Subir el balón continuo sin pausas intermedias frente al pecho.',
          'Muñeca quebrada en el punto más alto del salto.'
        ]
      },
      'wing-left': {
        title: 'Triple 3P Ala Izquierda',
        cluster: 'Perímetro 45° Izq',
        tier: 'INICIACIÓN',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '1 / 5',
        points: '3 PTS',
        shotType: 'Spot-up en esquina abierta',
        percentile: 'INICIAL (Percentil 28)',
        releaseTime: '0.92 seg',
        notes: 'Rotar hombros hacia el aro antes de soltar. Gran actitud y progreso continuo.',
        footPosition: { x: 85, y: 340, angle: 30, label: 'Ala Izq 45°' },
        laserTrajectory: { startX: 90, startY: 330, endX: 245, endY: 72 },
        backboardTarget: { x: 42, y: 52, description: 'Directo al cilindro con vista limpia', color: '#10B981' },
        biomechanicsTips: [
          'Alinear pie de apoyo con la bisectriz del tablero.',
          'Evitar inclinar el torso hacia atrás durante el despegue.',
          'Sostener el follow-through 1 segundo tras la soltura.'
        ]
      },
      'wing-right': {
        title: 'Triple 3P Ala Derecha',
        cluster: 'Perímetro 45° Der',
        tier: 'INICIACIÓN',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '1 / 5',
        points: '3 PTS',
        shotType: 'Catch & Shoot',
        percentile: 'INICIAL (Percentil 30)',
        releaseTime: '0.91 seg',
        notes: 'Mano de apoyo sale a tiempo. Calibrar altura del balón antes del tiro.',
        footPosition: { x: 415, y: 340, angle: -30, label: 'Ala Der 45°' },
        laserTrajectory: { startX: 410, startY: 330, endX: 255, endY: 72 },
        backboardTarget: { x: 58, y: 52, description: 'Entrada directa al aro', color: '#10B981' },
        biomechanicsTips: [
          'Pies firmes en el suelo antes de recibir el pase.',
          'No empujar con el pulgar de la mano izquierda.',
          'Caída equilibrada sobre ambos pies.'
        ]
      },
      'corner-left': {
        title: 'Triple 3P Esquina Izquierda',
        cluster: 'Línea de Fondo Corta',
        tier: 'EN PRÁCTICA',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '0%',
        ratio: '0 / 2',
        points: '0 PTS',
        shotType: 'Corner Spot-up',
        percentile: 'INICIAL (Percentil 25)',
        releaseTime: '0.95 seg',
        notes: 'Ángulo sin tablero requiere mayor curva y parábola de elevación.',
        footPosition: { x: 25, y: 90, angle: 90, label: 'Esquina 0° Izq' },
        laserTrajectory: { startX: 35, startY: 90, endX: 235, endY: 72 },
        backboardTarget: { x: 30, y: 55, description: 'Sin apoyo de tablero: entrada limpia vertical', color: '#06B6D4' },
        biomechanicsTips: [
          'Separarse 20 cm de la línea lateral.',
          'Arco alto a 52° de parábola.',
          'Foco visual en la pestaña delantera del aro.'
        ]
      },
      'corner-right': {
        title: 'Triple 3P Esquina Derecha',
        cluster: 'Línea de Fondo Corta',
        tier: 'EN PRÁCTICA',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '0%',
        ratio: '0 / 3',
        points: '0 PTS',
        shotType: 'Corner Spot-up',
        percentile: 'INICIAL (Percentil 25)',
        releaseTime: '0.96 seg',
        notes: 'Entrenar rutina de 20 tiros diarios en esta esquina.',
        footPosition: { x: 475, y: 90, angle: -90, label: 'Esquina 0° Der' },
        laserTrajectory: { startX: 465, startY: 90, endX: 265, endY: 72 },
        backboardTarget: { x: 70, y: 55, description: 'Sin apoyo de tablero: entrada limpia', color: '#06B6D4' },
        biomechanicsTips: [
          'Ajustar muñeca hacia el centro del cilindro.',
          'No precipitar el salto con la carrera previa.',
          'Respiración rítmica antes del tiro.'
        ]
      }
    };
  }

  if (isIsaac && !hasDynamicPct) {
    // Isaac (OVR 50, 16% efectividad global, 8 de 50 totales)
    return {
      'paint': {
        title: 'Línea Libre / Pintura (Zona 1)',
        cluster: 'Zona de Definición Interior & Tiros Libres',
        tier: 'EN ADAPTACIÓN',
        tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        percentage: '30%',
        ratio: '3 / 10',
        points: '6 PTS',
        shotType: 'Tiro Libre Directo / Media Pintura',
        percentile: 'INICIACIÓN (Percentil 35)',
        releaseTime: '0.92 seg',
        notes: 'Constancia motriz en evolución. Mecánica de tiro con buena base, requiere mayor repetición para consolidar memoria muscular.',
        footPosition: { x: 250, y: 220, angle: 0, label: 'Línea Libre 4.60m' },
        laserTrajectory: { startX: 250, startY: 215, endX: 250, endY: 72 },
        backboardTarget: { x: 50, y: 50, description: 'Directo al centro del aro (Swish limpio)', color: '#FF6B00' },
        biomechanicsTips: [
          'Apoyo simétrico en metatarsos sin cargar el talón.',
          'Pies alineados con el centro del aro.',
          'Seguimiento prolongado de muñeca para rotación óptima de balón.'
        ]
      },
      'mid-left': {
        title: 'Media Distancia Codo Izquierdo',
        cluster: 'Media Distancia / Flanco Izquierdo',
        tier: 'INICIACIÓN',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '2 / 10',
        points: '4 PTS',
        shotType: 'Jumper en 2 tiempos',
        percentile: 'BÁSICO (Percentil 30)',
        releaseTime: '0.90 seg',
        notes: 'Frenado controlado. Desarrollar mayor elevación vertical sin desplazamiento hacia el frente.',
        footPosition: { x: 120, y: 150, angle: 35, label: 'Codo Izquierdo 45°' },
        laserTrajectory: { startX: 125, startY: 145, endX: 242, endY: 65 },
        backboardTarget: { x: 38, y: 35, description: 'Vértice superior izquierdo del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
        biomechanicsTips: [
          'Girar cadera y hombros alineados al aro en el aire.',
          'Apuntar a la esquina superior del recuadro interior.',
          'Aterrizar suave absorbiendo impacto con rodillas flexionadas.'
        ]
      },
      'mid-right': {
        title: 'Media Distancia Codo Derecho',
        cluster: 'Media Distancia / Flanco Derecho',
        tier: 'INICIACIÓN',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '10%',
        ratio: '1 / 10',
        points: '2 PTS',
        shotType: 'Catch & Shoot corto',
        percentile: 'INICIACIÓN (Percentil 25)',
        releaseTime: '0.94 seg',
        notes: 'Trabajo específico de codo a 90 grados para evitar que el balón salga desbalanceado.',
        footPosition: { x: 380, y: 150, angle: -35, label: 'Codo Derecho 45°' },
        laserTrajectory: { startX: 375, startY: 145, endX: 258, endY: 65 },
        backboardTarget: { x: 62, y: 35, description: 'Vértice superior derecho del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
        biomechanicsTips: [
          'No empujar con la mano guía (mano izquierda quieta).',
          'Impulso sincronizado de tobillos y rodillas.',
          'Punto de impacto claro en el ángulo superior del tablero.'
        ]
      },
      'top-key': {
        title: 'Triple 3P Cúspide Frontal',
        cluster: 'Perímetro 6.75m Central',
        tier: 'EN DESARROLLO',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '1 / 5',
        points: '3 PTS',
        shotType: 'Tiro de Larga Distancia',
        percentile: 'INICIACIÓN (Percentil 28)',
        releaseTime: '0.95 seg',
        notes: 'Gran energía en duela. Ejercicios con balón medicinal aumentarán la potencia de tiro perimetral.',
        footPosition: { x: 250, y: 410, angle: 0, label: 'Cúspide Central Triple 6.75m' },
        laserTrajectory: { startX: 250, startY: 400, endX: 250, endY: 72 },
        backboardTarget: { x: 50, y: 55, description: 'Entrada limpia directa sin tabla', color: '#10B981' },
        biomechanicsTips: [
          'Mayor flexión de cadera y rodillas al recibir.',
          'Subir el tiro por la línea media del cuerpo.',
          'Dejar la mano arriba hasta que la pelota descienda.'
        ]
      },
      'wing-left': {
        title: 'Triple 3P Ala Izquierda',
        cluster: 'Perímetro 45° Izq',
        tier: 'CALIBRANDO',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '20%',
        ratio: '1 / 5',
        points: '3 PTS',
        shotType: 'Spot-up en transición',
        percentile: 'INICIACIÓN (Percentil 25)',
        releaseTime: '0.93 seg',
        notes: 'Parada previa al tiro bien plantada. Fortalecer muñeca para mayor arco.',
        footPosition: { x: 85, y: 340, angle: 30, label: 'Ala Izq 45°' },
        laserTrajectory: { startX: 90, startY: 330, endX: 245, endY: 72 },
        backboardTarget: { x: 42, y: 52, description: 'Directo al cilindro con vista limpia', color: '#10B981' },
        biomechanicsTips: [
          'Cargar el peso en el metatarso antes del salto.',
          'Orientar el torso hacia el aro en el punto cero.',
          'Evitar torsión del cuello al tirar.'
        ]
      },
      'wing-right': {
        title: 'Triple 3P Ala Derecha',
        cluster: 'Perímetro 45° Der',
        tier: 'EN PRÁCTICA',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '0%',
        ratio: '0 / 5',
        points: '0 PTS',
        shotType: 'Catch & Shoot',
        percentile: 'INICIAL (Percentil 20)',
        releaseTime: '0.97 seg',
        notes: 'Paciencia en la recepción. Trabajar en rutina guiada de 10 lanzamientos consecutivos.',
        footPosition: { x: 415, y: 340, angle: -30, label: 'Ala Der 45°' },
        laserTrajectory: { startX: 410, startY: 330, endX: 255, endY: 72 },
        backboardTarget: { x: 58, y: 52, description: 'Entrada limpia al aro', color: '#10B981' },
        biomechanicsTips: [
          'Concentración en el punto de contacto de los dedos.',
          'No acelerar el disparo sin plantar los pies.',
          'Mantener la línea visual fija.'
        ]
      },
      'corner-left': {
        title: 'Triple 3P Esquina Izquierda',
        cluster: 'Línea de Fondo Corta',
        tier: 'EN PRÁCTICA',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '0%',
        ratio: '0 / 2',
        points: '0 PTS',
        shotType: 'Corner Spot-up',
        percentile: 'INICIAL (Percentil 20)',
        releaseTime: '0.98 seg',
        notes: 'Ajuste del arco necesario.',
        footPosition: { x: 25, y: 90, angle: 90, label: 'Esquina 0° Izq' },
        laserTrajectory: { startX: 35, startY: 90, endX: 235, endY: 72 },
        backboardTarget: { x: 30, y: 55, description: 'Sin apoyo de tablero: entrada limpia', color: '#06B6D4' },
        biomechanicsTips: [
          'Arco de 50° obligatorio.',
          'Equilibrio sin pisar la línea.',
          'Pies a 90° respecto a la línea lateral.'
        ]
      },
      'corner-right': {
        title: 'Triple 3P Esquina Derecha',
        cluster: 'Línea de Fondo Corta',
        tier: 'EN PRÁCTICA',
        tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        percentage: '0%',
        ratio: '0 / 3',
        points: '0 PTS',
        shotType: 'Corner Spot-up',
        percentile: 'INICIAL (Percentil 20)',
        releaseTime: '0.99 seg',
        notes: 'Plan de mejora con 30 tiros por sesión en esta esquina.',
        footPosition: { x: 475, y: 90, angle: -90, label: 'Esquina 0° Der' },
        laserTrajectory: { startX: 465, startY: 90, endX: 265, endY: 72 },
        backboardTarget: { x: 70, y: 55, description: 'Sin apoyo de tablero: entrada limpia', color: '#06B6D4' },
        biomechanicsTips: [
          'Soltura suave con muñeca recta.',
          'Caída en el mismo sitio.',
          'Buen balance de hombros.'
        ]
      }
    };
  }

  // Plantilla general para demás atletas
  const basePct = overallPct || 60;
  return {
    'paint': {
      title: 'Línea Libre / Pintura (Zona 1)',
      cluster: 'Zona de Definición Interior & Tiros Libres',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'CONSISTENTE',
      tierColor: basePct >= 70 ? 'bg-red-950/80 text-red-400 border-red-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(10, Math.round((basePct / 100) * 10))} / 10`,
      points: `${Math.round((basePct / 100) * 20)} PTS`,
      shotType: 'Tiro Libre Directo / Flotadora',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 95)' : 'COMPETITIVO (Percentil 75)',
      releaseTime: '0.74 seg',
      notes: 'Buen ritmo y balance en la pintura en el Deportivo Carmen Serdán.',
      footPosition: { x: 250, y: 220, angle: 0, label: 'Línea Libre 4.60m' },
      laserTrajectory: { startX: 250, startY: 215, endX: 250, endY: 72 },
      backboardTarget: { x: 50, y: 50, description: 'Directo al centro del aro (Swish limpio)', color: '#FF6B00' },
      biomechanicsTips: [
        'Pies paralelos a la anchura de hombros.',
        'Codo a 90° alineado con la rodilla y el centro del aro.',
        'Parábola de entrada de 48° para maximizar área efectiva del aro.'
      ]
    },
    'mid-left': {
      title: 'Media Distancia Codo Izquierdo',
      cluster: 'Zona Media / Salida Pick & Roll',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'EFICAZ',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(10, Math.round((basePct / 100) * 10))} / 10`,
      points: `${Math.round((basePct / 100) * 20)} PTS`,
      shotType: 'Pull-up Jumper',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 94)' : 'COMPETITIVO (Percentil 70)',
      releaseTime: '0.76 seg',
      notes: 'Mecánica de codo a 90 grados estable.',
      footPosition: { x: 120, y: 150, angle: 35, label: 'Codo Izquierdo 45°' },
      laserTrajectory: { startX: 125, startY: 145, endX: 242, endY: 65 },
      backboardTarget: { x: 38, y: 35, description: 'Vértice superior izquierdo del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
      biomechanicsTips: [
        'Orientar pie izquierdo hacia el tablero antes de la batida.',
        'Apuntar al cuadrado superior izquierdo para rebote amortiguado.',
        'Extensión completa de la muñeca sin rotación lateral.'
      ]
    },
    'mid-right': {
      title: 'Media Distancia Codo Derecho',
      cluster: 'Zona Media / Aislamiento Directo',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'EFICAZ',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(10, Math.round((basePct / 100) * 10))} / 10`,
      points: `${Math.round((basePct / 100) * 20)} PTS`,
      shotType: 'Fadeaway corto / Step-back',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 95)' : 'COMPETITIVO (Percentil 72)',
      releaseTime: '0.75 seg',
      notes: 'Buena elevación superando defensores.',
      footPosition: { x: 380, y: 150, angle: -35, label: 'Codo Derecho 45°' },
      laserTrajectory: { startX: 375, startY: 145, endX: 258, endY: 65 },
      backboardTarget: { x: 62, y: 35, description: 'Vértice superior derecho del recuadro interior (Tiro con tabla)', color: '#06B6D4' },
      biomechanicsTips: [
        'Frenado en dos tiempos: pie derecho clava y pie izquierdo nivela.',
        'Impacto en la esquina superior derecha del recuadro interior.',
        'Rotación hacia atrás constante (Backspin continuo).'
      ]
    },
    'top-key': {
      title: 'Triple 3P Top Key',
      cluster: 'Perímetro Frontal',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'CONSISTENTE',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(5, Math.round((basePct / 100) * 5))} / 5`,
      points: `${Math.round((basePct / 100) * 15)} PTS`,
      shotType: 'Catch & Shoot',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 96)' : 'REGULAR (Percentil 65)',
      releaseTime: '0.78 seg',
      notes: 'Arco alto con más de 48 grados de entrada al aro.',
      footPosition: { x: 250, y: 410, angle: 0, label: 'Cúspide Central Triple 6.75m' },
      laserTrajectory: { startX: 250, startY: 400, endX: 250, endY: 72 },
      backboardTarget: { x: 50, y: 55, description: 'Centro de aro con entrada vertical', color: '#10B981' },
      biomechanicsTips: [
        'Generación de fuerza desde piernas y caderas.',
        'El balón sube en línea recta.',
        'Sostener el follow-through con la muñeca quebrada.'
      ]
    },
    'wing-left': {
      title: 'Triple 3P Ala Izquierda',
      cluster: 'Perímetro 45° Flanco Izquierdo',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'EN PROGRESO',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(5, Math.round((basePct / 100) * 5))} / 5`,
      points: `${Math.round((basePct / 100) * 15)} PTS`,
      shotType: 'Recepción abierta',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 95)' : 'REGULAR (Percentil 60)',
      releaseTime: '0.80 seg',
      notes: 'Mantener hombros orientados hacia la canasta.',
      footPosition: { x: 85, y: 340, angle: 30, label: 'Ala Perimetral 45° Izq' },
      laserTrajectory: { startX: 90, startY: 330, endX: 245, endY: 72 },
      backboardTarget: { x: 42, y: 52, description: 'Entrada directa con vista limpia del cilindro', color: '#10B981' },
      biomechanicsTips: [
        'Rotar hombros en el aire para encarar el aro perpendicular.',
        'Dedo índice en la válvula.',
        'Soltura limpia en la cúspide del salto.'
      ]
    },
    'wing-right': {
      title: 'Triple 3P Ala Derecha',
      cluster: 'Perímetro 45° Flanco Derecho',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'EN PROGRESO',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(5, Math.round((basePct / 100) * 5))} / 5`,
      points: `${Math.round((basePct / 100) * 15)} PTS`,
      shotType: 'Pick & Pop Perimetral',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 95)' : 'REGULAR (Percentil 62)',
      releaseTime: '0.79 seg',
      notes: 'Buena lectura de desmarque perimetral.',
      footPosition: { x: 415, y: 340, angle: -30, label: 'Ala Perimetral 45° Der' },
      laserTrajectory: { startX: 410, startY: 330, endX: 255, endY: 72 },
      backboardTarget: { x: 58, y: 52, description: 'Entrada directa al aro', color: '#10B981' },
      biomechanicsTips: [
        'Pie izquierdo como pivote de carga.',
        'Mano guía no presiona el tiro.',
        'Aterrizar con balance.'
      ]
    },
    'corner-left': {
      title: 'Triple 3P Esquina Izquierda',
      cluster: 'Esquina Corta / Baseline',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'CALIBRACIÓN',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(5, Math.round((basePct / 100) * 5))} / 5`,
      points: `${Math.round((basePct / 100) * 15)} PTS`,
      shotType: 'Corner Spot-up',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 93)' : 'REGULAR (Percentil 55)',
      releaseTime: '0.82 seg',
      notes: 'Cuidado con pisar la línea lateral en la esquina.',
      footPosition: { x: 25, y: 90, angle: 90, label: 'Esquina Corta 0° Izq' },
      laserTrajectory: { startX: 35, startY: 90, endX: 235, endY: 72 },
      backboardTarget: { x: 30, y: 55, description: 'Sin apoyo de tablero: swish estricto', color: '#06B6D4' },
      biomechanicsTips: [
        'Colocación del talón a 15 cm de la línea.',
        'Arco de 52° sin tablero.',
        'Foco visual en la pestaña delantera del aro.'
      ]
    },
    'corner-right': {
      title: 'Triple 3P Esquina Derecha',
      cluster: 'Esquina Corta / Baseline Débil',
      tier: basePct >= 70 ? 'MÁXIMA EFICACIA' : 'EN AJUSTE',
      tierColor: basePct >= 70 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60' : 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60',
      percentage: `${Math.min(100, Math.round(basePct))}%`,
      ratio: `${Math.min(5, Math.round((basePct / 100) * 5))} / 5`,
      points: `${Math.round((basePct / 100) * 15)} PTS`,
      shotType: 'Corner Jumper',
      percentile: basePct >= 80 ? 'ÉLITE (Percentil 92)' : 'REGULAR (Percentil 50)',
      releaseTime: '0.85 seg',
      notes: 'Fortalecer trayectoria recta hacia el aro.',
      footPosition: { x: 475, y: 90, angle: -90, label: 'Esquina Corta 0° Der' },
      laserTrajectory: { startX: 465, startY: 90, endX: 265, endY: 72 },
      backboardTarget: { x: 70, y: 55, description: 'Sin apoyo de tablero: entrada limpia', color: '#06B6D4' },
      biomechanicsTips: [
        'Ajustar el pulgar de apoyo.',
        'Mantener la espalda erguida en la caída.',
        'Ritmo continuo en la batida.'
      ]
    }
  };
}

export default function TacticalCourtStitch({
  athleteName = 'Jesús',
  jerseyNumber = '7',
  category = 'Base / Escolta · U-15 Formativo',
  overallOvr = 52,
  shootingPercentage = 24,
  initialZone = 'paint'
}: TacticalShotMapProps) {
  const [selectedZone, setSelectedZone] = useState<string>(initialZone);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'last_match' | 'practice'>('all');
  
  // SWITCH DUAL: MODO EFECTIVIDAD % vs MODO GUÍA BIOMECÁNICA 100%
  const [tacticalViewMode, setTacticalViewMode] = useState<'effectiveness' | 'biomechanics'>('effectiveness');

  const zoneDataMap = getZoneDataForAthlete(athleteName, shootingPercentage);
  const currentData = zoneDataMap[selectedZone] || zoneDataMap['paint'];

  return (
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Radial & Tactical Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 15%, rgba(6, 182, 212, 0.12) 0%, transparent 65%),
            linear-gradient(rgba(31, 36, 51, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 36, 51, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* TOP BAR / HEADER CON SWITCH DE MODOS 1 Y 2 */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#1F2433] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#131620] to-[#0B0E17] border border-[#FF6B00]/60 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.35)] shrink-0">
            <span className="text-[#FF6B00] text-lg font-black font-mono">🐺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-[#FF6B00] uppercase font-bold">
                WILD WOLVES ACADEMY OS
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] rounded font-bold">
                CARMEN SERDÁN · FIBA 28x15m
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              DUELA TÁCTICA 2 EN 1
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">TELEMETRÍA & BIOMECÁNICA</span>
            </h2>
          </div>
        </div>

        {/* SELECTOR DUAL DE MODO: 1. % DE EFECTIVIDAD | 2. GUÍA BIOMECÁNICA 100% */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="bg-[#101421] p-1 rounded-2xl border border-[#1F2433] flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setTacticalViewMode('effectiveness')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono transition flex items-center gap-1.5 cursor-pointer ${
                tacticalViewMode === 'effectiveness'
                  ? 'bg-gradient-to-r from-orange-600 to-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>1. % Efectividad de Tiro</span>
            </button>
            <button
              type="button"
              onClick={() => setTacticalViewMode('biomechanics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono transition flex items-center gap-1.5 cursor-pointer ${
                tacticalViewMode === 'biomechanics'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. Guía Biomecánica 100%</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#101421] border border-[#1F2433] rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span className="text-white font-bold">{overallOvr} OVR</span>
              <span className="text-slate-500">·</span>
              <span className="text-[#06B6D4] font-bold">{shootingPercentage}% Efec.</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTRO RÁPIDO DE SESIÓN & LEYENDA TÁCTICA */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0B0E17]/80 p-3 rounded-2xl border border-[#1F2433]">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#06B6D4]" />
          <span className="text-xs font-mono font-bold text-slate-300">SESIÓN:</span>
          <select 
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value as any)}
            className="bg-[#121623] text-xs font-mono border border-[#1F2433] rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-[#FF6B00] cursor-pointer"
          >
            <option value="all">Todos los Registros Oficiales (Duela CDMX)</option>
            <option value="last_match">Último Partido Oficial</option>
            <option value="practice">Entrenamiento Técnico</option>
          </select>
        </div>

        {/* LEYENDA TÉRMICA */}
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span className="text-slate-400">Fría (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-400">Regular (30-50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="text-slate-400">Favorable (50-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-slate-400">Caliente (≥70%)</span>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: DUELA Y TELEMETRÍA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* COLUMNA 1: CANCHA TÁCTICA FIBA CON RESPLANDOR NEÓN */}
        <section className="lg:col-span-8 bg-[#0B0E17] border border-[#1F2433] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
                {tacticalViewMode === 'effectiveness'
                  ? `VISTA: MAPA DE TIRO DE ${athleteName.toUpperCase()} (${shootingPercentage}% EFECTIVIDAD)`
                  : 'VISTA: GUÍA BIOMECÁNICA (HUELLAS, TRAYECTORIAS Y TABLERO)'}
              </span>
            </div>
            <span className="text-xs font-mono text-[#06B6D4] font-bold">
              {tacticalViewMode === 'effectiveness' ? 'MODO EFECTIVIDAD' : 'MODO BIOMECÁNICA 100%'}
            </span>
          </div>

          {/* Marco con borde neón cian exacto a la imagen oficial */}
          <div className="relative w-full max-w-[560px] mx-auto rounded-2xl border-2 border-[#06B6D4]/60 p-1.5 bg-[#090C14] shadow-[0_0_35px_rgba(6,182,212,0.25)] select-none">
            <svg
              id="basketball-court"
              viewBox="0 0 500 520"
              className="w-full h-auto block rounded-xl overflow-hidden transition-all duration-500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="stitch-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="zone-fluorescent-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="stitch-hoop-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id="stitch-hoop-radial" cx="50%" cy="14%" r="45%">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#090C14" stopOpacity="0" />
                </radialGradient>

                {/* Icono de Huella Biomecánica */}
                <g id="footprint-icon">
                  <ellipse cx="0" cy="0" rx="4.5" ry="8" fill="#10B981" stroke="#34D399" strokeWidth="1" />
                  <ellipse cx="0" cy="7.5" rx="3.5" ry="4" fill="#059669" stroke="#34D399" strokeWidth="0.8" />
                  <circle cx="-3" cy="-10" r="1.2" fill="#6EE7B7" />
                  <circle cx="-1" cy="-11" r="1.3" fill="#6EE7B7" />
                  <circle cx="1" cy="-11" r="1.3" fill="#6EE7B7" />
                  <circle cx="3" cy="-10" r="1.2" fill="#6EE7B7" />
                </g>
              </defs>

              {/* Fondo base de duela oscura */}
              <rect width="500" height="520" fill="#0B0E17" />
              <rect width="500" height="520" fill="url(#stitch-hoop-radial)" />

              {/* Líneas tenues de duela de madera */}
              <g opacity="0.6" stroke="#131826" strokeWidth="1">
                <line x1="0" y1="65" x2="500" y2="65" />
                <line x1="0" y1="130" x2="500" y2="130" />
                <line x1="0" y1="195" x2="500" y2="195" />
                <line x1="0" y1="260" x2="500" y2="260" />
                <line x1="0" y1="325" x2="500" y2="325" />
                <line x1="0" y1="390" x2="500" y2="390" />
                <line x1="0" y1="455" x2="500" y2="455" />
              </g>

              {/* ZONAS POLIGONALES CON COLORES FLORESCENTES EXACTOS */}
              {/* Esquina Izquierda */}
              <polygon
                points="0,0 45,0 45,170 0,170"
                fill="#06B6D4"
                fillOpacity={selectedZone === 'corner-left' ? 0.85 : 0.28}
                stroke="#06B6D4"
                strokeWidth={selectedZone === 'corner-left' ? "3" : "1.5"}
                filter={selectedZone === 'corner-left' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('corner-left')}
              />

              {/* Esquina Derecha */}
              <polygon
                points="455,0 500,0 500,170 455,170"
                fill="#06B6D4"
                fillOpacity={selectedZone === 'corner-right' ? 0.85 : 0.28}
                stroke="#06B6D4"
                strokeWidth={selectedZone === 'corner-right' ? "3" : "1.5"}
                filter={selectedZone === 'corner-right' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('corner-right')}
              />

              {/* Media Distancia Izquierda */}
              <path
                d="M 45,0 L 175,0 L 175,230 L 45,170 Z"
                fill="#10B981"
                fillOpacity={selectedZone === 'mid-left' ? 0.90 : 0.45}
                stroke="#34D399"
                strokeWidth={selectedZone === 'mid-left' ? "3.5" : "2"}
                filter={selectedZone === 'mid-left' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('mid-left')}
              />

              {/* Media Distancia Derecha */}
              <path
                d="M 325,0 L 455,0 L 455,170 L 325,230 Z"
                fill="#10B981"
                fillOpacity={selectedZone === 'mid-right' ? 0.90 : 0.45}
                stroke="#34D399"
                strokeWidth={selectedZone === 'mid-right' ? "3.5" : "2"}
                filter={selectedZone === 'mid-right' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('mid-right')}
              />

              {/* Pintura / Tiro Libre */}
              <polygon
                points="175,0 325,0 325,230 175,230"
                fill="#EA580C"
                fillOpacity={selectedZone === 'paint' ? 0.95 : 0.65}
                stroke="#FF6B00"
                strokeWidth={selectedZone === 'paint' ? "4" : "2.5"}
                filter={selectedZone === 'paint' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('paint')}
              />

              {/* Triple Ala Izquierda */}
              <path
                d="M 0,170 L 45,170 A 215,215 0 0,0 175,295 L 140,510 L 0,510 Z"
                fill="#06B6D4"
                fillOpacity={selectedZone === 'wing-left' ? 0.85 : 0.35}
                stroke="#06B6D4"
                strokeWidth={selectedZone === 'wing-left' ? "3" : "1.8"}
                filter={selectedZone === 'wing-left' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('wing-left')}
              />

              {/* Triple Ala Derecha */}
              <path
                d="M 500,170 L 455,170 A 215,215 0 0,1 325,295 L 360,510 L 500,510 Z"
                fill="#06B6D4"
                fillOpacity={selectedZone === 'wing-right' ? 0.85 : 0.35}
                stroke="#06B6D4"
                strokeWidth={selectedZone === 'wing-right' ? "3.5" : "2"}
                filter={selectedZone === 'wing-right' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('wing-right')}
              />

              {/* Triple Top Key */}
              <path
                d="M 175,295 A 215,215 0 0,0 325,295 L 360,510 L 140,510 Z"
                fill="#10B981"
                fillOpacity={selectedZone === 'top-key' ? 0.90 : 0.45}
                stroke="#34D399"
                strokeWidth={selectedZone === 'top-key' ? "3.5" : "2"}
                filter={selectedZone === 'top-key' ? "url(#zone-fluorescent-glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('top-key')}
              />

              {/* LÍNEAS REGLAMENTARIAS FIBA CON RESPLANDOR NEÓN CIAN */}
              <g fill="none" stroke="#06B6D4" strokeWidth="2.5" filter="url(#stitch-neon-glow)">
                <rect x="2" y="2" width="496" height="508" strokeWidth="3" />
                <line x1="0" y1="510" x2="500" y2="510" strokeDasharray="6,4" strokeWidth="3" />
                <rect x="175" y="2" width="150" height="225" />
                <line x1="175" y1="80" x2="167" y2="80" strokeWidth="3" />
                <line x1="325" y1="80" x2="333" y2="80" strokeWidth="3" />
                <line x1="175" y1="180" x2="167" y2="180" strokeWidth="3" />
                <line x1="325" y1="180" x2="333" y2="180" strokeWidth="3" />
                <path d="M 175,227 A 75,75 0 0,0 325,227" />
                <path d="M 175,227 A 75,75 0 0,1 325,227" strokeDasharray="6,6" />
                <path d="M 215,70 A 38,38 0 0,0 285,70" />
                <line x1="45" y1="2" x2="45" y2="170" />
                <line x1="455" y1="2" x2="455" y2="170" />
                <path d="M 45,170 A 215,215 0 0,0 455,170" />
                <path d="M 195,510 A 55,55 0 0,1 305,510" />
              </g>

              {/* ARO Y TABLERO NARANJA NEÓN EXACTO A LA IMAGEN 4 */}
              <g filter="url(#stitch-hoop-glow)">
                {/* Tablero suspended */}
                <line x1="210" y1="46" x2="290" y2="46" stroke="#FF6B00" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="250" y1="46" x2="250" y2="58" stroke="#FF6B00" strokeWidth="3" />
                {/* Aro y red */}
                <circle cx="250" cy="72" r="14" fill="#FF6B00" fillOpacity="0.25" stroke="#FF6B00" strokeWidth="3.5" />
                <circle cx="250" cy="72" r="6" fill="none" stroke="#FFFFFF" strokeDasharray="2,2" strokeWidth="1.5" />
              </g>

              {/* CAPA DE BIOMECÁNICA 100%: DIAGRAMA INTEGRADO DEL TABLERO, PROYECCIONES Y HUELLAS */}
              {tacticalViewMode === 'biomechanics' && (
                <g className="animate-fadeIn">
                  {/* DIAGRAMA FIJO DEL TABLERO SUSPENDIDO SUPERIOR FIEL A LA IMAGEN TÉCNICA */}
                  <g id="integrated-top-backboard" transform="translate(145, 12)">
                    {/* Cristal Exterior con Marco Naranja y Brillo Cian */}
                    <rect x="0" y="0" width="210" height="110" rx="4" fill="#0A1120" stroke="#FF6B00" strokeWidth="3" filter="url(#stitch-neon-glow)" />
                    {/* Retícula suave y reflejo diagonal de cristal */}
                    <line x1="0" y1="0" x2="110" y2="110" stroke="#00F0FF" strokeWidth="0.8" opacity="0.25" />
                    <line x1="100" y1="0" x2="210" y2="110" stroke="#00F0FF" strokeWidth="0.8" opacity="0.25" />

                    {/* Recuadro Interior Naranja FIBA (Inner Box) */}
                    <rect x="70" y="38" width="70" height="48" fill="none" stroke="#FF6B00" strokeWidth="2.5" />

                    {/* Aro con soporte y red de canasta detallada */}
                    <line x1="92" y1="86" x2="118" y2="86" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" />
                    <ellipse cx="105" cy="91" rx="18" ry="5.5" fill="#FF6B00" fillOpacity="0.3" stroke="#FF6B00" strokeWidth="2.5" />
                    {/* Red con entramado blanco */}
                    <path d="M 88,92 L 94,112 L 105,114 L 116,112 L 122,92" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
                    <line x1="96" y1="93" x2="113" y2="113" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
                    <line x1="114" y1="93" x2="97" y2="113" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />

                    {/* PUNTOS DE IMPACTO FIJOS DEL TABLERO:
                        - Esquina exterior derecha (Azul para impactos interiores)
                        - Esquina exterior (Verde para impactos en esquina) */}
                    {/* Punto Azul: Impactos interiores */}
                    <circle cx="136" cy="40" r="5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" className="animate-pulse" />
                    {/* Punto Verde: Impactos en esquinas */}
                    <circle cx="147" cy="40" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* Línea punteada que conecta desde los puntos de impacto al centro del aro */}
                    <line x1="140" y1="42" x2="105" y2="91" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
                  </g>

                  {/* PROYECCIONES FUNCIONALES OFICIALES SEGÚN IMAGEN:
                      - Líneas verdes punteadas hacia las esquinas (impactos en esquinas)
                      - Líneas azules punteadas hacia las posiciones interiores (media distancia y alas)
                      - CERO líneas verdes en la pintura/tiro libre */}
                  
                  {/* Proyección Azul hacia Media Distancia Derecha (Impacto interior) */}
                  <line x1="292" y1="52" x2="380" y2="150" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" filter="url(#stitch-neon-glow)" />

                  {/* Proyección Azul hacia Media Distancia Izquierda (Impacto interior) */}
                  <line x1="215" y1="52" x2="120" y2="150" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" filter="url(#stitch-neon-glow)" />

                  {/* Proyecciones Verdes hacia las Esquinas (Impactos en esquinas) */}
                  <line x1="292" y1="52" x2="475" y2="90" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
                  <line x1="215" y1="52" x2="25" y2="90" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />

                  {/* Línea Láser Dinámica de la Zona Seleccionada hacia el Aro */}
                  <line
                    x1={currentData.laserTrajectory.startX}
                    y1={currentData.laserTrajectory.startY}
                    x2={currentData.laserTrajectory.endX}
                    y2={currentData.laserTrajectory.endY}
                    stroke={selectedZone.includes('corner') ? '#10B981' : '#00F0FF'}
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    filter="url(#stitch-neon-glow)"
                  />

                  {/* Par de Huellas de Posición Exacta del Tirador */}
                  <g transform={`translate(${currentData.footPosition.x}, ${currentData.footPosition.y}) rotate(${currentData.footPosition.angle})`}>
                    <g transform="translate(-10, 0)">
                      <use href="#footprint-icon" />
                    </g>
                    <g transform="translate(10, -4)">
                      <use href="#footprint-icon" />
                    </g>
                    <circle cx="0" cy="0" r="24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '8s' }} />
                  </g>
                </g>
              )}
            </svg>

            {/* CAPA MODO 1: PÍLDORAS FLOTANTES DE EFECTIVIDAD CON DATOS REALES */}
            {tacticalViewMode === 'effectiveness' && (
              <>
                {/* Esquina Izquierda */}
                <div
                  onClick={() => setSelectedZone('corner-left')}
                  className={`absolute top-[12%] left-[2%] cursor-pointer backdrop-blur-md border rounded-lg px-2 py-0.5 text-center transition-all ${
                    selectedZone === 'corner-left'
                      ? 'bg-cyan-500/35 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.85)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-cyan-400/40 hover:border-cyan-400 z-10'
                  }`}
                >
                  <div className="text-[11px] sm:text-xs font-mono font-black text-white">{zoneDataMap['corner-left'].percentage}</div>
                  <div className="text-[9px] font-mono text-cyan-200/90 font-bold">{zoneDataMap['corner-left'].ratio}</div>
                </div>

                {/* Esquina Derecha */}
                <div
                  onClick={() => setSelectedZone('corner-right')}
                  className={`absolute top-[12%] right-[2%] cursor-pointer backdrop-blur-md border rounded-lg px-2 py-0.5 text-center transition-all ${
                    selectedZone === 'corner-right'
                      ? 'bg-cyan-500/35 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.85)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-cyan-400/40 hover:border-cyan-400 z-10'
                  }`}
                >
                  <div className="text-[11px] sm:text-xs font-mono font-black text-white">{zoneDataMap['corner-right'].percentage}</div>
                  <div className="text-[9px] font-mono text-cyan-200/90 font-bold">{zoneDataMap['corner-right'].ratio}</div>
                </div>

                {/* Media Izq */}
                <div
                  onClick={() => setSelectedZone('mid-left')}
                  className={`absolute top-[21%] left-[8%] sm:left-[11%] cursor-pointer backdrop-blur-md border rounded-xl px-2.5 sm:px-3 py-1 text-center transition-all ${
                    selectedZone === 'mid-left'
                      ? 'bg-emerald-500/35 border-[#10B981] shadow-[0_0_22px_rgba(16,185,129,0.9)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-emerald-500/40 hover:border-emerald-400 z-10'
                  }`}
                >
                  <div className="text-xs sm:text-base font-mono font-black text-white leading-tight">{zoneDataMap['mid-left'].percentage}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-200/90 font-medium whitespace-nowrap">Media Izq ({zoneDataMap['mid-left'].ratio})</div>
                </div>

                {/* Línea Libre / Pintura */}
                <div
                  onClick={() => setSelectedZone('paint')}
                  className={`absolute top-[25%] left-1/2 -translate-x-1/2 cursor-pointer backdrop-blur-md border-2 rounded-xl px-3 sm:px-4 py-1.5 text-center transition-all ${
                    selectedZone === 'paint'
                      ? 'bg-orange-500/35 border-[#FF6B00] shadow-[0_0_25px_rgba(255,107,0,0.95)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-orange-500/50 hover:border-[#FF6B00] z-10'
                  }`}
                >
                  <div className="text-sm sm:text-lg font-mono font-black text-white leading-tight">{zoneDataMap['paint'].percentage}</div>
                  <div className="text-[9px] sm:text-[11px] font-mono text-amber-200 font-bold whitespace-nowrap">Línea Libre ({zoneDataMap['paint'].ratio})</div>
                </div>

                {/* Media Der */}
                <div
                  onClick={() => setSelectedZone('mid-right')}
                  className={`absolute top-[21%] right-[8%] sm:right-[11%] cursor-pointer backdrop-blur-md border rounded-xl px-2.5 sm:px-3 py-1 text-center transition-all ${
                    selectedZone === 'mid-right'
                      ? 'bg-emerald-500/35 border-[#10B981] shadow-[0_0_22px_rgba(16,185,129,0.9)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-emerald-500/40 hover:border-emerald-400 z-10'
                  }`}
                >
                  <div className="text-xs sm:text-base font-mono font-black text-white leading-tight">{zoneDataMap['mid-right'].percentage}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-200/90 font-medium whitespace-nowrap">Media Der ({zoneDataMap['mid-right'].ratio})</div>
                </div>

                {/* 3P Ala Izq */}
                <div
                  onClick={() => setSelectedZone('wing-left')}
                  className={`absolute bottom-[24%] left-[5%] sm:left-[8%] cursor-pointer backdrop-blur-md border rounded-xl px-2.5 sm:px-3 py-1 text-center transition-all ${
                    selectedZone === 'wing-left'
                      ? 'bg-cyan-500/35 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.85)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-cyan-400/40 hover:border-cyan-400 z-10'
                  }`}
                >
                  <div className="text-xs sm:text-base font-mono font-black text-white leading-tight">{zoneDataMap['wing-left'].percentage}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-200/90 whitespace-nowrap">3P Ala Izq ({zoneDataMap['wing-left'].ratio})</div>
                </div>

                {/* 3P Ala Der */}
                <div
                  onClick={() => setSelectedZone('wing-right')}
                  className={`absolute bottom-[28%] right-[5%] sm:right-[8%] cursor-pointer backdrop-blur-md border rounded-xl px-2.5 sm:px-3 py-1 text-center transition-all ${
                    selectedZone === 'wing-right'
                      ? 'bg-cyan-500/35 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.85)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-cyan-400/40 hover:border-cyan-400 z-10'
                  }`}
                >
                  <div className="text-xs sm:text-base font-mono font-black text-white leading-tight">{zoneDataMap['wing-right'].percentage}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-200/90 whitespace-nowrap">3P Ala Der ({zoneDataMap['wing-right'].ratio})</div>
                </div>

                {/* 3P Top Key */}
                <div
                  onClick={() => setSelectedZone('top-key')}
                  className={`absolute bottom-[8%] left-1/2 -translate-x-1/2 cursor-pointer backdrop-blur-md border rounded-xl px-3 sm:px-4 py-1 text-center transition-all ${
                    selectedZone === 'top-key'
                      ? 'bg-emerald-500/35 border-[#10B981] shadow-[0_0_22px_rgba(16,185,129,0.9)] scale-110 z-20'
                      : 'bg-[#0B0E17]/70 border-emerald-500/40 hover:border-emerald-400 z-10'
                  }`}
                >
                  <div className="text-xs sm:text-base font-mono font-black text-white leading-tight">{zoneDataMap['top-key'].percentage}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-200/90 whitespace-nowrap">3P Top Key ({zoneDataMap['top-key'].ratio})</div>
                </div>
              </>
            )}

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1F2433] pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6B00] font-bold">INFO:</span>
              <span>
                {tacticalViewMode === 'effectiveness'
                  ? `Métricas reales de ${athleteName}: haz clic en cada zona para desglosar tiros.`
                  : 'Modo Biomecánica: tablero integrado superior con dianas fija y trayectoria de impacto al aro.'}
              </span>
            </div>
            <div className="text-[#00F0FF]">Duela Carmen Serdán · CDMX</div>
          </div>
        </section>

        {/* COLUMNA 2: PANEL TELEMÉTRICO LATERAL DE ANÁLISIS EN VIVO & BIOMECÁNICA */}
        <section className="lg:col-span-4 space-y-5">
          <div className="bg-[#0B0E17] border border-[#1F2433] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2433]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF6B00] font-bold">
                  {tacticalViewMode === 'effectiveness' ? 'ZONA EN ANÁLISIS' : 'POSICIONAMIENTO Y TIRO 100%'}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${currentData.tierColor}`}>
                {currentData.tier}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-black text-white tracking-tight">{currentData.title}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{currentData.cluster}</p>
            </div>

            {/* KPIs Métricos */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#101421] border border-[#1F2433] rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block">EFECTIVIDAD REAL</span>
                <span className="text-2xl font-black text-white font-mono">{currentData.percentage}</span>
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">{currentData.ratio} tiros</span>
              </div>
              <div className="bg-[#101421] border border-[#1F2433] rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 block">PUNTOS ZONA</span>
                <span className="text-2xl font-black text-[#FF6B00] font-mono">{currentData.points}</span>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{currentData.shotType.split(' ')[0]}</span>
              </div>
            </div>

            {/* SECCIÓN MODO BIOMECÁNICA: GUÍA PASO A PASO */}
            {tacticalViewMode === 'biomechanics' ? (
              <div className="mt-5 space-y-3 bg-[#101421] border border-emerald-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    Reglas de Oro Biomecánicas
                  </span>
                </div>
                <ul className="space-y-2 text-xs font-mono text-slate-300">
                  {currentData.biomechanicsTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-emerald-500/20 text-[11px] font-mono text-slate-400">
                  <strong className="text-white">Posición de Pies:</strong> {currentData.footPosition.label}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#1F2433]/60">
                  <span className="text-slate-400">Tipo de Lanzamiento:</span>
                  <span className="text-white font-medium text-right">{currentData.shotType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1F2433]/60">
                  <span className="text-slate-400">Percentil Academia:</span>
                  <span className="text-amber-400 font-bold">{currentData.percentile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1F2433]/60">
                  <span className="text-slate-400">Tiempo de Soltura:</span>
                  <span className="text-white font-medium">{currentData.releaseTime}</span>
                </div>
              </div>
            )}

            {/* Feedback del Coach */}
            <div className="mt-4 bg-[#101421] border border-[#1F2433] rounded-2xl p-3.5">
              <span className="text-[10px] font-mono text-[#FF6B00] font-bold block uppercase tracking-wider mb-1">
                OBSERVACIÓN TÉCNICA · COACH RICARDO:
              </span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                {currentData.notes}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
