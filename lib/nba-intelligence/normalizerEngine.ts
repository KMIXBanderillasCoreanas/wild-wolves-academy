// lib/nba-intelligence/normalizerEngine.ts
// Motor de Normalización y Comparativa Científica (Capa 4 - Wild Wolves OS)
// Adapta métricas profesionales y formativas por 36 min, 100 posesiones, edad, categoría y nivel.

export type AgeCategory = 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'U21' | 'Pro';
export type PlayerPositionRole = 'Point Guard' | 'Shooting Guard' | 'Small Forward' | 'Power Forward' | 'Center';
export type CompetitionLevel = 'Formativo Local (Carmen Serdán)' | 'Estatal CDMX' | 'Nacional ADEMEBA/FMB' | 'Colegial/NCAA' | 'FIBA' | 'NBA';

export interface NormalizationContext {
  ageCategory: AgeCategory;
  position: PlayerPositionRole;
  competitionLevel: CompetitionLevel;
  minutesPerGame: number;
  estimatedPace?: number; // Posesiones por 48 min (default formativo: 75, NBA: 100)
}

export interface NormalizedRadarMetric {
  key: string;
  label: string;
  labelEs: string;
  studentRaw: number;
  studentNormalized: number;  // 0 - 100 escala para el radar
  curryNormalized: number;    // 0 - 100
  lebronNormalized: number;   // 0 - 100
  jordanNormalized: number;   // 0 - 100
  unit: string;
  benchmarkBenchmarkValue: number;
}

export interface StudentComparisonBenchmark {
  studentName: string;
  context: NormalizationContext;
  radarPillars: NormalizedRadarMetric[];
  overallCompatibilityScore: number; // 0 - 100%
  primaryArchetypeMatch: 'Stephen Curry' | 'LeBron James' | 'Michael Jordan';
  technicalGapReport: {
    strengths: string[];
    priorityImprovements: string[];
    drillsRecommendation: string[];
  };
}

/**
 * Coeficiente de ajuste por categoría formativa para nivelar físicamente contra adultos Pro NBA.
 * Un niño U-12 tirando 40% en triples con balón #5 a 6.75m es extraordinario.
 */
const AGE_SCALING_FACTORS: Record<AgeCategory, number> = {
  U10: 1.65,
  U12: 1.45,
  U14: 1.30,
  U16: 1.18,
  U18: 1.08,
  U21: 1.03,
  Pro: 1.00
};

/**
 * Normaliza métricas a 36 minutos de juego.
 */
export function normalizePer36(stat: number, minutesPlayed: number): number {
  if (!minutesPlayed || minutesPlayed <= 0) return 0;
  return Number(((stat / minutesPlayed) * 36).toFixed(2));
}

/**
 * Normaliza métricas a 100 posesiones de equipo.
 */
export function normalizePer100Possessions(stat: number, teamPace: number = 75): number {
  if (!teamPace || teamPace <= 0) return 0;
  return Number(((stat / teamPace) * 100).toFixed(2));
}

/**
 * Calcula True Shooting Percentage (TS%):
 * TS% = PTS / (2 * (FGA + 0.44 * FTA))
 */
export function calculateTrueShootingPct(pts: number, fga: number, fta: number): number {
  const denominator = 2 * (fga + 0.44 * fta);
  if (denominator <= 0) return 0;
  return Number(((pts / denominator) * 100).toFixed(1));
}

/**
 * Calcula Effective Field Goal Percentage (eFG%):
 * eFG% = (FGM + 0.5 * FG3M) / FGA
 */
export function calculateEffectiveFgPct(fgm: number, fg3m: number, fga: number): number {
  if (!fga || fga <= 0) return 0;
  return Number((((fgm + 0.5 * fg3m) / fga) * 100).toFixed(1));
}

/**
 * Genera el paquete comparativo de Radar para la visualización D (Student vs NBA Comparison)
 * con los 8 pilares rectores: FG3_PCT, FG_PCT, PTS, BLK, STL, AST, REB, FT_PCT.
 */
export function generateStudentVsNbaBenchmark(
  student: {
    name: string;
    minutesPerGame: number;
    pts: number;
    fgPct: number;
    fg3Pct: number;
    ftPct: number;
    ast: number;
    reb: number;
    stl: number;
    blk: number;
  },
  context: NormalizationContext
): StudentComparisonBenchmark {
  const scale = AGE_SCALING_FACTORS[context.ageCategory] || 1.0;
  const mins = student.minutesPerGame || 20;

  // Normalizar los valores del alumno por 36 minutos y aplicar ponderación por edad
  const studentPtsPer36 = normalizePer36(student.pts, mins) * scale;
  const studentAstPer36 = normalizePer36(student.ast, mins) * scale;
  const studentRebPer36 = normalizePer36(student.reb, mins) * scale;
  const studentStlPer36 = normalizePer36(student.stl, mins) * scale;
  const studentBlkPer36 = normalizePer36(student.blk, mins) * scale;

  // Escalas de 0 a 100 para graficación en el Spider Radar
  const pillars: NormalizedRadarMetric[] = [
    {
      key: 'FG3_PCT',
      label: '3PT %',
      labelEs: 'Porcentaje de Triples',
      studentRaw: student.fg3Pct,
      studentNormalized: Math.min(100, Math.round((student.fg3Pct / 45) * 100 * (scale * 0.9))),
      curryNormalized: 96,  // Curry ~43%
      lebronNormalized: 78, // LeBron ~36-41%
      jordanNormalized: 72, // Jordan ~33-35%
      unit: '%',
      benchmarkBenchmarkValue: 40.0
    },
    {
      key: 'FG_PCT',
      label: 'FG %',
      labelEs: 'Efectividad en Tiros de Campo',
      studentRaw: student.fgPct,
      studentNormalized: Math.min(100, Math.round((student.fgPct / 55) * 100)),
      curryNormalized: 85,
      lebronNormalized: 96, // LeBron 54%
      jordanNormalized: 90, // Jordan 49.5%
      unit: '%',
      benchmarkBenchmarkValue: 50.0
    },
    {
      key: 'PTS',
      label: 'PTS (Per 36m)',
      labelEs: 'Capacidad Anotadora P/36m',
      studentRaw: studentPtsPer36,
      studentNormalized: Math.min(100, Math.round((studentPtsPer36 / 32) * 100)),
      curryNormalized: 91,
      lebronNormalized: 89,
      jordanNormalized: 100, // Jordan 30+ PPG
      unit: 'pts',
      benchmarkBenchmarkValue: 28.0
    },
    {
      key: 'BLK',
      label: 'BLK (Per 36m)',
      labelEs: 'Tapones / Protección del Aro',
      studentRaw: studentBlkPer36,
      studentNormalized: Math.min(100, Math.round((studentBlkPer36 / 1.5) * 100)),
      curryNormalized: 30,
      lebronNormalized: 65,
      jordanNormalized: 75, // Jordan excelente taponador para escolta
      unit: 'tap',
      benchmarkBenchmarkValue: 1.0
    },
    {
      key: 'STL',
      label: 'STL (Per 36m)',
      labelEs: 'Robos / Anticipación Defensiva',
      studentRaw: studentStlPer36,
      studentNormalized: Math.min(100, Math.round((studentStlPer36 / 2.5) * 100)),
      curryNormalized: 60,
      lebronNormalized: 75,
      jordanNormalized: 98, // Jordan líder histórico en robos
      unit: 'rob',
      benchmarkBenchmarkValue: 2.0
    },
    {
      key: 'AST',
      label: 'AST (Per 36m)',
      labelEs: 'Visión de Campo y Asistencias',
      studentRaw: studentAstPer36,
      studentNormalized: Math.min(100, Math.round((studentAstPer36 / 9) * 100)),
      curryNormalized: 78,
      lebronNormalized: 95, // LeBron pasador de élite
      jordanNormalized: 68,
      unit: 'ast',
      benchmarkBenchmarkValue: 7.0
    },
    {
      key: 'REB',
      label: 'REB (Per 36m)',
      labelEs: 'Presencia en Rebotes',
      studentRaw: studentRebPer36,
      studentNormalized: Math.min(100, Math.round((studentRebPer36 / 10) * 100)),
      curryNormalized: 52,
      lebronNormalized: 88,
      jordanNormalized: 76,
      unit: 'reb',
      benchmarkBenchmarkValue: 7.5
    },
    {
      key: 'FT_PCT',
      label: 'FT %',
      labelEs: 'Efectividad en Tiros Libres',
      studentRaw: student.ftPct,
      studentNormalized: Math.min(100, Math.round((student.ftPct / 90) * 100)),
      curryNormalized: 100, // Curry 91-92%
      lebronNormalized: 76,  // LeBron ~75%
      jordanNormalized: 88,  // Jordan 83.5%
      unit: '%',
      benchmarkBenchmarkValue: 85.0
    }
  ];

  // Determinar afinidad de arquetipo
  const avgShooting = (pillars[0].studentNormalized + pillars[7].studentNormalized) / 2;
  const avgAthleticismPlaymaking = (pillars[5].studentNormalized + pillars[6].studentNormalized + pillars[2].studentNormalized) / 3;
  const avgDefenseMidRange = (pillars[1].studentNormalized + pillars[4].studentNormalized + pillars[3].studentNormalized) / 3;

  let primaryArchetypeMatch: 'Stephen Curry' | 'LeBron James' | 'Michael Jordan' = 'Stephen Curry';
  if (avgAthleticismPlaymaking > avgShooting && avgAthleticismPlaymaking > avgDefenseMidRange) {
    primaryArchetypeMatch = 'LeBron James';
  } else if (avgDefenseMidRange > avgShooting) {
    primaryArchetypeMatch = 'Michael Jordan';
  }

  const overallCompatibilityScore = Math.round(
    pillars.reduce((acc, p) => acc + p.studentNormalized, 0) / pillars.length
  );

  return {
    studentName: student.name,
    context,
    radarPillars: pillars,
    overallCompatibilityScore,
    primaryArchetypeMatch,
    technicalGapReport: {
      strengths: [
        `Mecánica perimetral y porcentaje en tiros libres (${student.ftPct}% FT) alineado a hábitos de Stephen Curry.`,
        `Buen ratio de anticipación defensiva ajustado a la categoría ${context.ageCategory}.`
      ],
      priorityImprovements: [
        'Aumentar la consistencia en el lanzamiento de media distancia en fatiga (estándar Jordan).',
        'Fortalecer el pase de salida en transición y lectura de bloqueos indirectos (estándar LeBron).'
      ],
      drillsRecommendation: [
        'Drill de 100 Tiros con cronómetro de liberación (Catch & Shoot en <0.4 segundos).',
        'Penetración y descarga (Drive & Kick) con toma de decisión bajo presión.',
        'Desplazamiento defensivo en zigzag con cambio de dirección de paso cero.'
      ]
    }
  };
}
