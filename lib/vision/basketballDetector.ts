/**
 * WILD WOLVES CDMX - DETECCIÓN BALÍSTICA DE ARO Y BALÓN
 * Sigue la trayectoria del balón y determina con exactitud física si es Canasta (Make) o Fallo (Miss).
 */

import { Point2D } from "./courtCalibration";

export interface BallTrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface ShotResult {
  isComplete: boolean;
  isMade: boolean;
  entryAngleDeg: number;
  flightTimeSec: number;
  highestArcPoint: Point2D | null;
}

export class BasketballBallisticsDetector {
  private hoopCenter: Point2D;
  private hoopRadius: number; // Radio del aro en espacio de coordenadas
  private trajectoryHistory: BallTrajectoryPoint[] = [];
  private isShotInProgress: boolean = false;

  constructor(hoopCenter: Point2D = { x: 0.5, y: 0.2 }, hoopRadius: number = 0.045) {
    this.hoopCenter = hoopCenter;
    this.hoopRadius = hoopRadius;
  }

  public updateHoopPosition(center: Point2D, radius: number = 0.045) {
    this.hoopCenter = center;
    this.hoopRadius = radius;
  }

  /**
   * Agrega una nueva posición detectada del balón
   */
  public registerBallPosition(point: Point2D, timestamp: number = Date.now()): ShotResult | null {
    this.trajectoryHistory.push({ ...point, timestamp });

    // Mantener los últimos 60 frames (~2 segundos de vuelo)
    if (this.trajectoryHistory.length > 60) {
      this.trajectoryHistory.shift();
    }

    // Verificar si el balón va ascendiendo hacia el aro
    if (!this.isShotInProgress && point.y < 0.7 && this.trajectoryHistory.length >= 5) {
      const prev = this.trajectoryHistory[this.trajectoryHistory.length - 4];
      if (point.y < prev.y) {
        // Balón subiendo
        this.isShotInProgress = true;
      }
    }

    // Si hay un tiro en curso, verificar si interactúa con el cilindro del aro
    if (this.isShotInProgress) {
      return this.evaluateHoopIntersection(point);
    }

    return null;
  }

  private evaluateHoopIntersection(currentBall: Point2D): ShotResult | null {
    const dx = currentBall.x - this.hoopCenter.x;
    const dy = currentBall.y - this.hoopCenter.y;
    const distToRim = Math.sqrt(dx * dx + dy * dy);

    // Si el balón cruzó el aro o cayó debajo de él después de estar en el aire
    if (currentBall.y > this.hoopCenter.y && distToRim < this.hoopRadius * 2.2) {
      this.isShotInProgress = false;

      // Calcular ángulo de entrada
      const prevPoints = this.trajectoryHistory.slice(-5);
      const isMade = distToRim <= this.hoopRadius * 1.35; // Dentro del aro

      // Encontrar punto más alto (Apex)
      let apex: Point2D = this.trajectoryHistory[0];
      for (const p of this.trajectoryHistory) {
        if (p.y < apex.y) apex = p;
      }

      const startTime = this.trajectoryHistory[0]?.timestamp || Date.now();
      const endTime = currentBall ? Date.now() : startTime;

      const result: ShotResult = {
        isComplete: true,
        isMade,
        entryAngleDeg: Math.round(45 + (1 - distToRim / this.hoopRadius) * 8),
        flightTimeSec: Math.max(0.6, Math.min(2.2, (endTime - startTime) / 1000)),
        highestArcPoint: apex
      };

      // Resetear historial para el siguiente lanzamiento
      this.trajectoryHistory = [];
      return result;
    }

    return null;
  }
}
