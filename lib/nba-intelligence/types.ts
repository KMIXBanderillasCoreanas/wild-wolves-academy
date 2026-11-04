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

// ==============================================================================
// ENTIDADES DESACOPLADAS DE INTELIGENCIA PROFESIONAL NBA (FASE 3 - ARQUITECTURA RECTORA)
// ==============================================================================

export interface ProfessionalPlayers {
  id: string; // Universal Player Identifier (e.g. 'nba_201939')
  nbaOfficialId: number;
  fullName: string;
  birthDate?: string;
  country: string;
  heightCm?: number;
  weightKg?: number;
  draftYear?: number;
  draftRound?: number;
  draftPick?: number;
  primaryPosition: 'Guard' | 'Forward' | 'Center' | string;
  jerseyNumber: string;
  careerSpan: string; // e.g. "1984 - 2003"
  isHistoricalLegend: boolean;
  hasOpticalTracking: boolean; // SportVU / Second Spectrum tracking disponible
  hasSpatialCoordinates: boolean; // Coordenadas DunkAPI X, Y disponibles (post 2003-04)
}

export interface ProfessionalSeasons {
  id: string; // e.g. 'nba_201939_2015_16'
  playerId: string;
  seasonYear: string; // e.g. '2015-16'
  teamAbbreviation: string;
  gamesPlayed: number;
  minutesPerGame: number;
  pointsPerGame: number;
  fieldGoalPct: number;
  threePointPct?: number | null; // Nullable para eras previas o tiros inexistentes
  freeThrowPct: number;
  effectiveFgPct?: number | null;
  trueShootingPct?: number | null;
  pointsPerPossession?: number | null;
  usageRatePct?: number | null;
  offensiveRating?: number | null;
  defensiveRating?: number | null;
  isPlayoffs: boolean;
  dataSource: 'NBA Stats' | 'DunkAPI' | 'Sportradar' | 'Official Archive';
}

export interface ProfessionalShotEvents {
  id: string; // Event UUID
  playerId: string;
  gameId?: string;
  seasonYear: string;
  shotX?: number | null; // Coordenada X en pies o null si es era previa a 2003
  shotY?: number | null; // Coordenada Y en pies o null
  shotDistanceFeet?: number | null;
  shotType: 'catch_and_shoot' | 'pull_up' | 'floater' | 'dunk' | 'layup' | 'step_back' | string;
  isMade: boolean;
  pointsValue: 2 | 3;
  zoneArea: 'restricted_area' | 'paint' | 'midrange' | 'corner_3' | 'above_break_3';
  zoneAreaEs: string; // "El Callejón / La Pintura", "Carril central", etc.
  shotClockSecondsRemaining?: number | null;
  isTrackingVerified: boolean;
}

export const DATO_NO_DISPONIBLE = 'Dato no disponible';

/**
 * Formateador desacoplado con regla estricta de no invención:
 * Si el dato no existe para la era histórica, retorna explícitamente "Dato no disponible".
 */
export function formatOrUnavailable(
  val: number | string | null | undefined,
  suffix: string = '',
  decimals: number = 1
): string {
  if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
    return DATO_NO_DISPONIBLE;
  }
  if (typeof val === 'number') {
    return `${val.toFixed(decimals)}${suffix}`;
  }
  return `${val}${suffix}`;
}
