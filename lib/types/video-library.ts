// lib/types/video-library.ts
/**
 * WILD WOLVES BASKETBALL ACADEMY OS - AI SMART VIDEO LIBRARY
 * Enterprise Data Contracts & Interfaces
 */

export type VideoTheme = 'baloncesto' | 'preparacion_fisica' | 'educacion_deportiva';

export type VideoCategory =
  | 'baloncesto_tiro'
  | 'baloncesto_drible'
  | 'baloncesto_defensa'
  | 'baloncesto_pick_roll'
  | 'preparacion_fisica_calistenia'
  | 'preparacion_fisica_salto'
  | 'preparacion_fisica_core'
  | 'educacion_nutricion'
  | 'educacion_hidratacion'
  | 'educacion_psicologia';

export type VideoDifficulty = 'iniciacion' | 'formativo' | 'avanzado' | 'elite';

export type VideoApprovalStatus = 'pending' | 'approved' | 'rejected' | 'temporary';

export interface VideoAIAnalysis {
  summary: string;
  biomechanicalFocus: string;
  tacticalFocus: string;
  referenceBookAlignment: string; // Alineación con manuales Carmen Serdán
  safeForMinors: boolean; // Menores 14-16 años sin culturismo peligroso
  relevanceScore: number; // 0 a 100
  educationalScore: number; // 0 a 100
  cautions?: string[];
  keyTimestamps?: { time: string; label: string }[];
}

export interface VideoLibraryItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl: string;
  duration: string;
  theme: VideoTheme;
  category: VideoCategory;
  difficulty: VideoDifficulty;
  relevanceScore: number;
  educationalScore: number;
  aiAnalysis: VideoAIAnalysis;
  status: VideoApprovalStatus;
  isOfficial: boolean; // Curriculum permanente oficial de la academia
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  viewCount?: number;
  allowEmbedding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoFavorite {
  id: string;
  userId: string;
  videoId: string;
  video?: VideoLibraryItem;
  createdAt: string;
}

export interface VideoSearchHistory {
  id: string;
  userId: string;
  query: string;
  detectedTheme?: VideoTheme;
  detectedCategory?: VideoCategory;
  resultsCount: number;
  createdAt: string;
}

export interface VideoApprovalLog {
  id: string;
  videoId: string;
  adminId: string;
  action: 'approved' | 'rejected' | 're_evaluated';
  notes?: string;
  createdAt: string;
}

export interface SearchQueryInterpretation {
  originalQuery: string;
  intent: string;
  theme: VideoTheme;
  category: VideoCategory;
  difficulty: VideoDifficulty;
  safeForMinors: boolean;
  searchKeywords: string[];
  recommendedChannels: string[];
}

export interface ChannelWhitelistSource {
  id: string;
  name: string;
  handle: string;
  channelId?: string;
  theme: VideoTheme;
  defaultCategory: VideoCategory;
  isVerified: boolean;
  description: string;
}
