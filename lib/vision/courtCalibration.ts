/**
 * WILD WOLVES CDMX - MOTOR DE CALIBRACIÓN GEOMÉTRICA DE CANCHA (HOMOGRAFÍA)
 * Traduce coordenadas 2D de cámara (pixels x, y) a posición real de duela en metros (X, Y)
 * Permite identificar si el tiro se ejecutó desde:
 * 1. Tiros Libres (4.57m del tablero)
 * 2. Media Distancia Izquierda / Derecha
 * 3. 5 Spots de Triple (6.75m FIBA / 7.24m NBA)
 */

export interface Point2D {
  x: number;
  y: number;
}

export type ShotZoneType =
  | "free_throw"
  | "mid_range_left"
  | "mid_range_right"
  | "three_corner_left"
  | "three_wing_left"
  | "three_top_key"
  | "three_wing_right"
  | "three_corner_right"
  | "paint_restricted";

export interface CourtCalibrationConfig {
  // 4 Puntos de referencia fijados en el video:
  // p0: Esquina Fondo Izquierda
  // p1: Esquina Fondo Derecha
  // p2: Esquina Tiro Libre Derecha
  // p3: Esquina Tiro Libre Izquierda
  baselineLeft: Point2D;
  baselineRight: Point2D;
  freeThrowRight: Point2D;
  freeThrowLeft: Point2D;
  hoopCenter: Point2D;
}

export class CourtCalibrationEngine {
  private config: CourtCalibrationConfig;

  constructor(customConfig?: Partial<CourtCalibrationConfig>) {
    // Configuración por defecto normalizada (0.0 a 1.0) para video 16:9
    this.config = {
      baselineLeft: { x: 0.1, y: 0.85 },
      baselineRight: { x: 0.9, y: 0.85 },
      freeThrowRight: { x: 0.65, y: 0.45 },
      freeThrowLeft: { x: 0.35, y: 0.45 },
      hoopCenter: { x: 0.5, y: 0.2 },
      ...customConfig
    };
  }

  /**
   * Identifica la zona reglamentaria de la cancha según la posición de los pies del jugador
   * @param feetPoint Coordenada normalizada (0.0 a 1.0) donde están parados los pies
   */
  public classifyShotZone(feetPoint: Point2D): ShotZoneType {
    const { x, y } = feetPoint;
    const { hoopCenter } = this.config;

    // Distancia Euclidiana estimada respecto al aro
    const dx = x - hoopCenter.x;
    const dy = y - hoopCenter.y;
    const distToHoop = Math.sqrt(dx * dx + dy * dy);

    // Ángulo en grados respecto a la vertical del aro (-90° a +90°)
    const angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;

    // 1. Zona de Pintura / Restringida (Muy cerca del aro)
    if (distToHoop < 0.22 && Math.abs(angleDeg) < 25) {
      return "paint_restricted";
    }

    // 2. Línea de Tiros Libres (Eje central entre 0.28 y 0.38 de distancia)
    if (distToHoop >= 0.22 && distToHoop <= 0.36 && Math.abs(angleDeg) <= 18) {
      return "free_throw";
    }

    // 3. Media Distancia (Entre 0.22 y 0.45 de distancia)
    if (distToHoop < 0.46) {
      if (angleDeg < 0) {
        return "mid_range_left";
      } else {
        return "mid_range_right";
      }
    }

    // 4. Perímetro de 3 Puntos (5 Spots Oficiales)
    // Esquina Izquierda
    if (angleDeg < -55 && y > 0.4) {
      return "three_corner_left";
    }
    // Ala Izquierda (45°)
    if (angleDeg >= -55 && angleDeg < -18) {
      return "three_wing_left";
    }
    // Centro (Top of the Key)
    if (Math.abs(angleDeg) <= 18) {
      return "three_top_key";
    }
    // Ala Derecha (45°)
    if (angleDeg > 18 && angleDeg <= 55) {
      return "three_wing_right";
    }
    // Esquina Derecha
    return "three_corner_right";
  }

  public getHoopPosition(): Point2D {
    return this.config.hoopCenter;
  }
}
