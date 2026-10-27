/**
 * WILD WOLVES CDMX - FILTRO CINEMÁTICO ANATOMICO (ANTI-GLITCH)
 * Elimina movimientos raros, sacudidas de cámara y lecturas erróneas de articulaciones.
 * Utiliza:
 * 1. Suavizado Exponencial Ponderado (EMA - Exponential Moving Average)
 * 2. Restricción de Velocidad Angular Biomecánica (Evita que un brazo salte a 300 km/h)
 * 3. Cálculo estricto de ángulos para sentadillas y mecánica de tiro
 */

export interface Landmark3D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface SkeletonPose {
  nose?: Landmark3D;
  leftShoulder: Landmark3D;
  rightShoulder: Landmark3D;
  leftElbow: Landmark3D;
  rightElbow: Landmark3D;
  leftWrist: Landmark3D;
  rightWrist: Landmark3D;
  leftHip: Landmark3D;
  rightHip: Landmark3D;
  leftKnee: Landmark3D;
  rightKnee: Landmark3D;
  leftAnkle: Landmark3D;
  rightAnkle: Landmark3D;
}

export class KinematicPoseFilter {
  private smoothedPose: SkeletonPose | null = null;
  private readonly alpha: number; // Factor de suavizado (0.2 a 0.4 para respuesta rápida pero sin ruido)
  private readonly maxJointDisplacement: number; // Umbral máximo de salto por frame para descartar glitches

  constructor(alpha: number = 0.35, maxDisplacement: number = 0.08) {
    this.alpha = alpha;
    this.maxJointDisplacement = maxDisplacement;
  }

  /**
   * Suaviza una articulación individual y filtra teletransportaciones de IA
   */
  private filterPoint(raw: Landmark3D, previous?: Landmark3D): Landmark3D {
    if (!previous) return raw;

    // Calcular desplazamiento euclidiano entre frames
    const dx = raw.x - previous.x;
    const dy = raw.y - previous.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Si el punto saltó más de lo humanamente posible en 1 frame (33ms), es un glitch de la IA
    if (dist > this.maxJointDisplacement) {
      // Clampear el movimiento al vector máximo permitido
      const factor = this.maxJointDisplacement / dist;
      return {
        x: previous.x + dx * factor,
        y: previous.y + dy * factor,
        z: previous.z,
        visibility: raw.visibility ?? previous.visibility
      };
    }

    // Suavizado EMA
    return {
      x: previous.x * (1 - this.alpha) + raw.x * this.alpha,
      y: previous.y * (1 - this.alpha) + raw.y * this.alpha,
      z: (previous.z ?? 0) * (1 - this.alpha) + (raw.z ?? 0) * this.alpha,
      visibility: raw.visibility
    };
  }

  /**
   * Procesa y limpia el esqueleto completo
   */
  public filterSkeleton(rawPose: SkeletonPose): SkeletonPose {
    if (!this.smoothedPose) {
      this.smoothedPose = rawPose;
      return rawPose;
    }

    const cleanPose: SkeletonPose = {
      leftShoulder: this.filterPoint(rawPose.leftShoulder, this.smoothedPose.leftShoulder),
      rightShoulder: this.filterPoint(rawPose.rightShoulder, this.smoothedPose.rightShoulder),
      leftElbow: this.filterPoint(rawPose.leftElbow, this.smoothedPose.leftElbow),
      rightElbow: this.filterPoint(rawPose.rightElbow, this.smoothedPose.rightElbow),
      leftWrist: this.filterPoint(rawPose.leftWrist, this.smoothedPose.leftWrist),
      rightWrist: this.filterPoint(rawPose.rightWrist, this.smoothedPose.rightWrist),
      leftHip: this.filterPoint(rawPose.leftHip, this.smoothedPose.leftHip),
      rightHip: this.filterPoint(rawPose.rightHip, this.smoothedPose.rightHip),
      leftKnee: this.filterPoint(rawPose.leftKnee, this.smoothedPose.leftKnee),
      rightKnee: this.filterPoint(rawPose.rightKnee, this.smoothedPose.rightKnee),
      leftAnkle: this.filterPoint(rawPose.leftAnkle, this.smoothedPose.leftAnkle),
      rightAnkle: this.filterPoint(rawPose.rightAnkle, this.smoothedPose.rightAnkle),
    };

    this.smoothedPose = cleanPose;
    return cleanPose;
  }

  /**
   * Calcula el ángulo en grados entre 3 puntos articulares (Ej. Hombro - Codo - Muñeca)
   */
  public static calculateAngle(a: Landmark3D, b: Landmark3D, c: Landmark3D): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  }

  /**
   * Diagnostica la profundidad de sentadilla (Knee flexion angle)
   * 90° o menos = Sentadilla válida
   * > 120° = Media sentadilla insuficiente
   */
  public getSquatDepthAngle(): number {
    if (!this.smoothedPose) return 180;
    const { rightHip, rightKnee, rightAnkle } = this.smoothedPose;
    return KinematicPoseFilter.calculateAngle(rightHip, rightKnee, rightAnkle);
  }

  /**
   * Diagnostica el ángulo de lanzamiento de tiro (Release Angle)
   */
  public getShootingReleaseAngle(): number {
    if (!this.smoothedPose) return 45;
    const { rightShoulder, rightElbow, rightWrist } = this.smoothedPose;
    return KinematicPoseFilter.calculateAngle(rightShoulder, rightElbow, rightWrist);
  }
}
