// lib/legendsBenchmark.ts
// Base de Datos de Leyendas de la NBA & Benchmarks Cinemáticos Oficiales
// 100% Localizado al Español Técnico de Duela de México

export interface LegendBenchmark {
  id: string;
  legend_name: string;
  archetype: string;
  team: string;
  era: string;
  jerseyNumber: string;
  description: string;
  isPremium: boolean; // false para Estándar Base NBA, true para Leyendas específicas
  badgeColor: string;
  iconTag: string;

  // Métricas de Rendimiento en Juego Oficial
  pointsPerGame: number;            // Puntos Por Partido (PPP)
  foulsPerGame: number;             // Promedio de Faltas Personales por Partido
  primaryZoneName: string;          // Zona de tiro prioritaria en duela
  primaryZoneEfficiencyPct: number; // Porcentaje de efectividad en dicha zona

  // Métricas Cinemáticas Oficiales (en milisegundos, grados y centímetros)
  reactionTimeMs: number;           // Tiempo de reacción neuromuscular y visual (ms)
  gatheringTimeMs: number;          // Paso cero y recogida del balón (ms)
  releaseTimeMs: number;            // Velocidad de liberación de tiro (ms)
  jumpApexHeightCm: number;         // Punto máximo de elevación en salto (Apex cm)
  defensiveStanceScore: number;     // Puntuación de postura defensiva y centro de gravedad
  hipTrackingAwareness: number;     // Estabilidad pélvica y lectura de cadera

  // Métrica Especial Destacada
  specialtyMetricName: string;
  specialtyMetricValue: string;
}

export const NBA_LEGENDS_BENCHMARKS: LegendBenchmark[] = [
  {
    id: 'nba_base',
    legend_name: 'Estándar Pro NBA (Base General)',
    archetype: 'Rotación Titular Pro NBA / FIBA',
    team: 'Promedio Oficial NBA',
    era: 'Era Moderna (2020-2026)',
    jerseyNumber: 'NBA',
    description: 'Parámetros cinemáticos y de tiempo de reacción del jugador titular promedio en duelas internacionales FIBA y postemporada de la NBA.',
    isPremium: false,
    badgeColor: 'from-blue-600 to-indigo-600',
    iconTag: '🌐',
    pointsPerGame: 16.4,
    foulsPerGame: 2.3,
    primaryZoneName: 'Cobertura térmica de tiro general',
    primaryZoneEfficiencyPct: 54.2,
    reactionTimeMs: 215,
    gatheringTimeMs: 320,
    releaseTimeMs: 310,
    jumpApexHeightCm: 72.0,
    defensiveStanceScore: 92.0,
    hipTrackingAwareness: 94.0,
    specialtyMetricName: 'Efectividad Global de Campo',
    specialtyMetricValue: '54.2% Eficiencia Real'
  },
  {
    id: 'steph_curry',
    legend_name: 'Stephen Curry',
    archetype: 'Francotirador de Élite / Triplista Histórico',
    team: 'Golden State Warriors',
    era: 'Dinastía 2015-2026',
    jerseyNumber: '#30',
    description: 'El estándar supremo de tiro en un solo movimiento fluido, velocidad de liberación de tiro instantánea y rango sin límites detrás del arco.',
    isPremium: true,
    badgeColor: 'from-amber-500 to-yellow-600',
    iconTag: '🎯',
    pointsPerGame: 24.8,
    foulsPerGame: 2.4,
    primaryZoneName: 'Tiro de tres puntos tras drible y recepción',
    primaryZoneEfficiencyPct: 42.8,
    reactionTimeMs: 220,
    gatheringTimeMs: 280, // Paso cero y subida ultrarrápida
    releaseTimeMs: 290, // La velocidad de liberación más rápida registrada (290ms)
    jumpApexHeightCm: 68.0,
    defensiveStanceScore: 86.0,
    hipTrackingAwareness: 95.0,
    specialtyMetricName: 'Tiro de Tres Puntos en Carrera',
    specialtyMetricValue: '42.8% Triples (3,700+ Encestados)'
  },
  {
    id: 'michael_jordan',
    legend_name: 'Michael Jordan',
    archetype: 'Competidor Supremo / Media Distancia & Tiro con Desmarque',
    team: 'Chicago Bulls',
    era: 'Dinastía 1991-1998',
    jerseyNumber: '#23',
    description: 'Maestría absoluta en suspensión aérea en el punto máximo de salto, aceleración implacable en el primer paso y tiro con desmarque hacia atrás bajo fatiga extrema.',
    isPremium: true,
    badgeColor: 'from-red-600 to-rose-700',
    iconTag: '👑',
    pointsPerGame: 30.1,
    foulsPerGame: 2.6,
    primaryZoneName: 'Media distancia y tiro en suspensión',
    primaryZoneEfficiencyPct: 51.8,
    reactionTimeMs: 198, // Reacción neuromuscular felina
    gatheringTimeMs: 305,
    releaseTimeMs: 335, // Disparo exactamente en el punto máximo de salto (Apex)
    jumpApexHeightCm: 92.0, // Elevación vertical élite
    defensiveStanceScore: 98.0, // Mejor Defensor del Año (DPOY)
    hipTrackingAwareness: 97.0,
    specialtyMetricName: 'Media Distancia y Desmarque',
    specialtyMetricValue: '51.8% en Tiros de 2 Puntos'
  },
  {
    id: 'lebron_james',
    legend_name: 'LeBron James',
    archetype: 'Atleta Total / Transición, Potencia & Visión de Cancha',
    team: 'Los Angeles Lakers / Miami Heat / Cavaliers',
    era: 'Longevidad Histórica (2003-2026)',
    jerseyNumber: '#6 / #23',
    description: 'Fuerza biomecánica descomunal, velocidad de locomoción a cancha abierta, rompimiento rápido fulminante y dominio físico en el callejón.',
    isPremium: true,
    badgeColor: 'from-purple-600 to-amber-600',
    iconTag: '⚡',
    pointsPerGame: 27.1,
    foulsPerGame: 1.8,
    primaryZoneName: 'Callejón / La pintura y rompimiento rápido',
    primaryZoneEfficiencyPct: 73.4,
    reactionTimeMs: 202,
    gatheringTimeMs: 295,
    releaseTimeMs: 345,
    jumpApexHeightCm: 84.0,
    defensiveStanceScore: 94.0,
    hipTrackingAwareness: 98.0, // Visión y orientación de duela
    specialtyMetricName: 'Conversión en el Callejón / La Pintura',
    specialtyMetricValue: '73.4% en Zona Restringida'
  },
  {
    id: 'larry_bird',
    legend_name: 'Larry Bird',
    archetype: 'Maestro de Inteligencia Táctica, Tiro & Triple Amenaza',
    team: 'Boston Celtics',
    era: 'Era Dorada (1980-1992)',
    jerseyNumber: '#33',
    description: 'Anticipación espacial sin desperdicio de energía, postura clásica de triple amenaza, tiro elevado sobre la frente con quiebre de muñeca y sangre fría en momentos decisivos.',
    isPremium: true,
    badgeColor: 'from-emerald-600 to-teal-700',
    iconTag: '🍀',
    pointsPerGame: 24.3,
    foulsPerGame: 2.5,
    primaryZoneName: 'Tiro tras drible y tiros libres clutch',
    primaryZoneEfficiencyPct: 49.6,
    reactionTimeMs: 210,
    gatheringTimeMs: 325,
    releaseTimeMs: 315,
    jumpApexHeightCm: 65.0,
    defensiveStanceScore: 91.0,
    hipTrackingAwareness: 99.0, // Lectura táctica inigualable
    specialtyMetricName: 'Tiros Libres y Definición Clutch',
    specialtyMetricValue: '88.6% Tiros Libres (49.6% Campo)'
  }
];
