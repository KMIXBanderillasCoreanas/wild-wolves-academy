// lib/types/smart-scale.ts

export interface SmartScaleReading {
  weightKg: number;
  fatPercentage: number;
  muscleMassKg: number;
  waterPercentage: number;
  metabolicAge: number;
  boneMassKg?: number;
  visceralFat?: number;
  bmi?: number;
  syncedAt?: string;
  deviceName?: string;
  source: 'bluetooth_le' | 'manual_entry' | 'simulated_calibration' | 'vision_ocr';
  rawOcrText?: string;
  confidenceScore?: number;
}

export interface ScaleSyncResponse {
  success: boolean;
  message: string;
  data?: SmartScaleReading;
  error?: string;
}
