// lib/nba-intelligence/types.ts
// Tipos para la Arquitectura Maestra NBA Player Intelligence y DunkAPI en Wild Wolves OS

export interface TraditionalPlayerStat {
  playerId: number;
  playerName: string;
  teamId: number;
  teamAbbreviation: string;
  age: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winPct: number;
  minutesPerGame: number;
  pointsPerGame: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPct: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointPct: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPct: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  turnoversPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  personalFouls: number;
  plusMinus: number;
  season: string;
  seasonType: 'Regular Season' | 'Playoffs';
  isOfficialData: boolean;
  sourceUrl: string;
}

export interface NbaApiSessionConfig {
  providerName: string;
  endpointUrl: string;
  startDate: string;        // 2026-11-02
  expirationDate: string;   // 2026-12-02 (30 días)
  daysRemaining: number;
  status: 'ACTIVE_TRIAL' | 'EXPIRED' | 'RENEWED';
  rateLimitPerMinute: number;
  userAgent: string;
}

// ==============================================================================
// 6 DIMENSIONES ESTADÍSTICAS RECOPILADAS (ARQUITECTURA RECTORA WILD WOLVES)
// ==============================================================================

// Dimensión A: Producción Ofensiva
export interface OffensiveProduction {
  pts: number;
  ppg: number;
  pointsPerMinute: number;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  effectiveFgPct: number; // eFG%
  trueShootingPct: number; // TS%
}

// Dimensión B: Mapa de Tiro y Zonas Espaciales
export interface ShotZoneMetric {
  zone: 'restricted_area' | 'paint' | 'midrange' | 'corner_3' | 'above_break_3' | 'free_throw';
  zoneLabelEs: string;
  attempts: number;
  made: number;
  pct: number;
  pointsPerShot: number;
  expectedPointsPerShot: number | null;
}

export interface ShotSpatialCoordinate {
  x: number;          // pies desde el aro / eje X
  y: number;          // pies desde la línea de fondo / eje Y
  made: boolean;
  pts: 2 | 3;
  zone?: string;
  distanceFt?: number;
  expectedPoints?: number;
}

export interface ShotMapData {
  playerId: string;
  playerName: string;
  season: string | number;
  zones: ShotZoneMetric[];
  shots: ShotSpatialCoordinate[];
  totalAttempts: number;
  totalMade: number;
  fieldGoalPct: number;
  isCoordinateDataAvailable: boolean; // false para eras sin tracking (Jordan 1984-2003)
  dataDisclaimer?: string;
}

// Dimensión C: Creación de Juego
export interface PlaymakingStats {
  assistsPerGame: number;
  turnoversPerGame: number;
  astToRatio: number;
  potentialAssists?: number;
  passesPerGame?: number;
  drivesPerGame?: number;
  ballControlRating?: number; // 0-100
}

// Dimensión D: Defensa
export interface DefensiveStats {
  stealsPerGame: number;
  blocksPerGame: number;
  defensiveRebounds: number;
  personalFouls: number;
  defensiveWinShares?: number;
  opponentFgPctAgainst?: number;
  defensiveRating?: number;
}

// Dimensión E: Rendimiento y Eficiencia
export interface EfficiencyMetrics {
  minutesPerGame: number;
  pointsPerPossession: number;
  usageRatePct: number; // USG%
  playerEfficiencyRating?: number; // PER
  pie?: number; // Player Impact Estimate
  pace?: number;
  clutchPointsPerGame?: number;
  per36Efficiency?: number;
  netRating?: number;
}

// Dimensión F: Juego Completo e Impacto
export interface CompleteGameImpact {
  offensiveRebounds: number;
  totalRebounds: number;
  plusMinus: number;
  careerTripleDoubles?: number;
  wins: number;
  losses: number;
  winPct: number;
  allDefensiveSelections?: number;
  allStarSelections?: number;
  mvpAwards?: number;
}

// Perfil Integral 6D
export interface ComprehensivePlayerIntelProfile {
  id: string;
  name: string;
  nickname?: string;
  team: string;
  jersey: string;
  position: string;
  height: string;
  weight: string;
  bioCareerSummary: string;
  offense: OffensiveProduction;
  shotMap: ShotMapData;
  playmaking: PlaymakingStats;
  defense: DefensiveStats;
  efficiency: EfficiencyMetrics;
  gameImpact: CompleteGameImpact;
  provider: 'DunkAPI' | 'NBA Stats' | 'Sportradar' | 'WildWolvesCache';
  creditsRemainingEstimate?: number;
}
