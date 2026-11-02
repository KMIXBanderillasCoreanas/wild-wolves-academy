// lib/legendsBenchmark.ts
// Base de Datos de Leyendas de la NBA & Benchmarks Cinemáticos Oficiales

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
  // Métricas Cinemáticas Oficiales (en milisegundos, grados y centímetros)
  reactionTimeMs: number;     // Tiempo de reacción visual/neuromuscular
  gatheringTimeMs: number;    // Subida del balón y paso cero
  releaseTimeMs: number;      // Tiempo de liberación de muñeca
  jumpApexHeightCm: number;   // Elevación vertical en apex
  defensiveStanceScore: number; // Puntuación de postura defensiva
  hipTrackingAwareness: number; // Estabilidad y lectura de cadera
  // Métricas Especiales Destacadas
  specialtyMetricName: string;
  specialtyMetricValue: string;
  iconTag: string;
}

export const NBA_LEGENDS_BENCHMARKS: LegendBenchmark[] = [
  {
    id: 'nba_base',
    legend_name: 'Estándar Pro NBA (Base General)',
    archetype: 'Rotación Titular Pro NBA / FIBA',
    team: 'Promedio Oficial NBA',
    era: 'Era Moderna (2020-2026)',
    jerseyNumber: 'NBA',
    description: 'Parámetros cinemáticos y de tiempo de reacción del jugador titular promedio en playoffs de la NBA y mundiales FIBA.',
    isPremium: false,
    badgeColor: 'from-blue-600 to-indigo-600',
    reactionTimeMs: 215,
    gatheringTimeMs: 320,
    releaseTimeMs: 310,
    jumpApexHeightCm: 72.0,
    defensiveStanceScore: 92.0,
    hipTrackingAwareness: 94.0,
    specialtyMetricName: 'Eficiencia de Tiro Global',
    specialtyMetricValue: '54.2% EFG',
    iconTag: '🌐'
  },
  {
    id: 'steph_curry',
    legend_name: 'Stephen Curry',
    archetype: 'Francotirador de Élite / Triplista Histórico',
    team: 'Golden State Warriors',
    era: 'Dinastía 2015-2026',
    jerseyNumber: '#30',
    description: 'El estándar supremo de mecánica "One-Motion", disparo ultrarrápido en catch-and-shoot y rango ilimitado detrás del arco.',
    isPremium: true,
    badgeColor: 'from-amber-500 to-yellow-600',
    reactionTimeMs: 220,
    gatheringTimeMs: 280, // Subida extremadamente fluida
    releaseTimeMs: 290, // El release más veloz registrado (280-300ms)
    jumpApexHeightCm: 68.0,
    defensiveStanceScore: 86.0,
    hipTrackingAwareness: 95.0,
    specialtyMetricName: 'Efectividad Triples de Carrera',
    specialtyMetricValue: '42.8% 3PT (3,700+ Triples)',
    iconTag: '🎯'
  },
  {
    id: 'michael_jordan',
    legend_name: 'Michael Jordan',
    archetype: 'Competidor Supremo / Media Distancia & Fadeaway',
    team: 'Chicago Bulls',
    era: 'Dinastía 1991-1998',
    jerseyNumber: '#23',
    description: 'Maestría absoluta en suspensión aérea (hang time), aceleración en primer paso explosivo y tiro fadeaway bajo máxima fatiga.',
    isPremium: true,
    badgeColor: 'from-red-600 to-rose-700',
    reactionTimeMs: 198, // Reacción neuromuscular felina
    gatheringTimeMs: 305,
    releaseTimeMs: 335, // Disparo en el punto muerto del apex de salto
    jumpApexHeightCm: 92.0, // Salto vertical élite
    defensiveStanceScore: 98.0, // DPOY
    hipTrackingAwareness: 97.0,
    specialtyMetricName: 'Efectividad en Media Distancia',
    specialtyMetricValue: '51.8% Mid-Range',
    iconTag: '👑'
  },
  {
    id: 'lebron_james',
    legend_name: 'LeBron James',
    archetype: 'Atleta Total / Transición, Potencia & Visión',
    team: 'Los Angeles Lakers / Miami Heat / Cavaliers',
    era: 'Longevidad Histórica (2003-2026)',
    jerseyNumber: '#6 / #23',
    description: 'Fuerza biomecánica descomunal, velocidad de locomoción a campo abierto, aceleración en rompimiento y visión de juego 360°.',
    isPremium: true,
    badgeColor: 'from-purple-600 to-amber-600',
    reactionTimeMs: 202,
    gatheringTimeMs: 295,
    releaseTimeMs: 345,
    jumpApexHeightCm: 84.0,
    defensiveStanceScore: 94.0,
    hipTrackingAwareness: 98.0,
    specialtyMetricName: 'Conversión en Pintura & Transición',
    specialtyMetricValue: '73.4% en la Pintura',
    iconTag: '⚡'
  },
  {
    id: 'larry_bird',
    legend_name: 'Larry Bird',
    archetype: 'Maestro de IQ Táctico, Tiro & Triple Amenaza',
    team: 'Boston Celtics',
    era: 'Era Dorada (1980-1992)',
    jerseyNumber: '#33',
    description: 'Anticipación espacial sin desperdicio de energía, mecánica de tiro sobre la cabeza con muñeca letal y toma de decisiones clutch.',
    isPremium: true,
    badgeColor: 'from-emerald-600 to-teal-700',
    reactionTimeMs: 210,
    gatheringTimeMs: 325,
    releaseTimeMs: 315,
    jumpApexHeightCm: 65.0,
    defensiveStanceScore: 91.0,
    hipTrackingAwareness: 99.0, // Lectura táctica inigualable
    specialtyMetricName: 'Efectividad en Tiros Libres & Clutch',
    specialtyMetricValue: '88.6% FT & 49.6% FG',
    iconTag: '🍀'
  }
];
