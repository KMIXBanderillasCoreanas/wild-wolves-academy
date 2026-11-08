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
  },
  {
    id: 'kobe_bryant',
    legend_name: 'Kobe Bryant (Mamba Mentality)',
    archetype: 'Tirador Implacable / Fadeaway & Aislamiento',
    team: 'Los Angeles Lakers',
    era: 'Era Moderna (1996-2016)',
    jerseyNumber: '#24 / #8',
    description: 'Mamba Mentality: precisión quirúrgica en el tiro con desmarque hacia atrás (fadeaway), resistencia extrema bajo dolor y trabajo de pies perfecto.',
    isPremium: true,
    badgeColor: 'from-purple-600 to-yellow-500',
    iconTag: '🐍',
    pointsPerGame: 25.0,
    foulsPerGame: 2.1,
    primaryZoneName: 'Media distancia y desmarque en poste bajo',
    primaryZoneEfficiencyPct: 47.8,
    reactionTimeMs: 200,
    gatheringTimeMs: 300,
    releaseTimeMs: 320,
    jumpApexHeightCm: 88.0,
    defensiveStanceScore: 96.0,
    hipTrackingAwareness: 97.0,
    specialtyMetricName: 'Fadeaway & Media Distancia',
    specialtyMetricValue: '81 Puntos en un Partido'
  },
  {
    id: 'kyrie_irving',
    legend_name: 'Kyrie Irving',
    archetype: 'El Mejor Manejo de Balón / Finalizador Acrobático',
    team: 'Dallas Mavericks / Brooklyn Nets / Cavaliers',
    era: 'Era Moderna (2011-2026)',
    jerseyNumber: '#11 / #2',
    description: 'El mejor control de drible en la historia del baloncesto: cambios de dirección a ras de suelo, giros en reversa y toque milimétrico con efecto inglés sobre el cristal.',
    isPremium: true,
    badgeColor: 'from-sky-600 to-blue-700',
    iconTag: '⚡',
    pointsPerGame: 23.6,
    foulsPerGame: 2.2,
    primaryZoneName: 'Bandeja acrobática con efecto y triples en drible',
    primaryZoneEfficiencyPct: 53.5,
    reactionTimeMs: 195,
    gatheringTimeMs: 275,
    releaseTimeMs: 305,
    jumpApexHeightCm: 70.0,
    defensiveStanceScore: 84.0,
    hipTrackingAwareness: 99.0,
    specialtyMetricName: 'Manejo de Balón & Efecto al Cristal',
    specialtyMetricValue: '91.2% Tiros Libres (Club 50-40-90)'
  },
  {
    id: 'luka_doncic',
    legend_name: 'Luka Dončić',
    archetype: 'Genio Táctico / Step-Back & Ritmo Desacelerado',
    team: 'Dallas Mavericks',
    era: 'Era Moderna (2018-2026)',
    jerseyNumber: '#77',
    description: 'Maestría en desaceleración, juego a su propio ritmo sin depender de salto vertical puro, fintas de tiro engañosas y visión periférica élite en el pick and roll.',
    isPremium: true,
    badgeColor: 'from-blue-500 to-cyan-600',
    iconTag: '🪄',
    pointsPerGame: 28.7,
    foulsPerGame: 2.4,
    primaryZoneName: 'Step-back de triple y flotadora en el callejón',
    primaryZoneEfficiencyPct: 49.2,
    reactionTimeMs: 225,
    gatheringTimeMs: 310,
    releaseTimeMs: 330,
    jumpApexHeightCm: 60.0,
    defensiveStanceScore: 82.0,
    hipTrackingAwareness: 98.0,
    specialtyMetricName: 'Triples Step-Back & Triples-Dobles',
    specialtyMetricValue: '33.9 PPP (Campeón de Anotación)'
  },
  {
    id: 'kevin_durant',
    legend_name: 'Kevin Durant',
    archetype: 'Tirador Inalcanzable / Envergadura de 2.25m & Elevación',
    team: 'Phoenix Suns / Golden State / Brooklyn Nets',
    era: 'Era Moderna (2007-2026)',
    jerseyNumber: '#35',
    description: 'Estatura de 2.11m con mecánica y agilidad de base: punto de liberación de tiro inalcanzable por encima de cualquier defensor con 90% en libres.',
    isPremium: true,
    badgeColor: 'from-orange-500 to-purple-600',
    iconTag: '🎯',
    pointsPerGame: 27.3,
    foulsPerGame: 1.9,
    primaryZoneName: 'Tiro en suspensión a 5 metros y triples pull-up',
    primaryZoneEfficiencyPct: 53.8,
    reactionTimeMs: 210,
    gatheringTimeMs: 300,
    releaseTimeMs: 310,
    jumpApexHeightCm: 80.0,
    defensiveStanceScore: 90.0,
    hipTrackingAwareness: 96.0,
    specialtyMetricName: 'Tiro Inalcanzable sobre la Marca',
    specialtyMetricValue: '4 Veces Máximo Anotador NBA'
  },
  {
    id: 'giannis_antetokounmpo',
    legend_name: 'Giannis Antetokounmpo (The Greek Freak)',
    archetype: 'Potencia Atlética Descomunal / Longitud de Zancada & Clavada',
    team: 'Milwaukee Bucks',
    era: 'Era Moderna (2013-2026)',
    jerseyNumber: '#34',
    description: 'Longitud de zancada descomunal que cruza la media cancha en dos pasos, poder de elevación de dos pies en la pintura y protección de aro dominante.',
    isPremium: true,
    badgeColor: 'from-emerald-700 to-amber-500',
    iconTag: '🦌',
    pointsPerGame: 30.4,
    foulsPerGame: 3.1,
    primaryZoneName: 'Transición, clavadas y penetración en el callejón',
    primaryZoneEfficiencyPct: 61.2,
    reactionTimeMs: 205,
    gatheringTimeMs: 285,
    releaseTimeMs: 360,
    jumpApexHeightCm: 90.0,
    defensiveStanceScore: 98.0,
    hipTrackingAwareness: 95.0,
    specialtyMetricName: 'Puntos en la Pintura & Euro-Step',
    specialtyMetricValue: '61.2% Efectividad de Campo'
  }
];
