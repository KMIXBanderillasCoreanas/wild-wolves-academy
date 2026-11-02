// app/actions/video-library-actions.ts
'use server';

import { videoLibraryService } from '@/lib/services/video-library.service';
import { 
  VideoTheme, 
  VideoCategory, 
  VideoDifficulty, 
  VideoLibraryItem, 
  SearchQueryInterpretation 
} from '@/lib/types/video-library';

export async function searchVideosAction(
  query: string,
  filters?: {
    theme?: VideoTheme;
    category?: VideoCategory;
    difficulty?: VideoDifficulty;
    officialOnly?: boolean;
  },
  userId?: string
): Promise<{
  success: boolean;
  items: VideoLibraryItem[];
  interpretation?: SearchQueryInterpretation;
  error?: string;
}> {
  try {
    const results = await videoLibraryService.searchVideos(query, filters, userId);
    return { 
      success: true, 
      items: results.items, 
      interpretation: results.interpretation 
    };
  } catch (err: any) {
    console.error('Error en searchVideosAction:', err);
    return {
      success: false,
      error: err?.message || 'Error al procesar la búsqueda en la biblioteca de video.',
      items: []
    };
  }
}

export async function getOfficialCurriculumAction(theme?: VideoTheme, category?: VideoCategory) {
  try {
    const items = await videoLibraryService.getOfficialCurriculum(theme, category);
    return { success: true, items };
  } catch (err: any) {
    console.error('Error en getOfficialCurriculumAction:', err);
    return { success: false, error: err?.message || 'Error al obtener curriculum.', items: [] };
  }
}

export async function toggleVideoFavoriteAction(userId: string, videoId: string) {
  try {
    const res = await videoLibraryService.toggleFavorite(userId, videoId);
    return { success: true, isFavorite: res.isFavorite };
  } catch (err: any) {
    console.error('Error en toggleVideoFavoriteAction:', err);
    return { success: false, error: err?.message || 'Error al actualizar favoritos.' };
  }
}

export async function getUserFavoritesAction(userId: string) {
  try {
    const items = await videoLibraryService.getUserFavorites(userId);
    return { success: true, items };
  } catch (err: any) {
    console.error('Error en getUserFavoritesAction:', err);
    return { success: false, error: err?.message || 'Error al obtener favoritos.', items: [] };
  }
}

export async function approveVideoAction(adminId: string, videoId: string, notes?: string) {
  try {
    const res = await videoLibraryService.approveVideo(adminId, videoId, notes);
    return res;
  } catch (err: any) {
    console.error('Error en approveVideoAction:', err);
    return { success: false, message: err?.message || 'Error al aprobar video.' };
  }
}

export async function rejectVideoAction(adminId: string, videoId: string, reason: string) {
  try {
    const res = await videoLibraryService.rejectVideo(adminId, videoId, reason);
    return res;
  } catch (err: any) {
    console.error('Error en rejectVideoAction:', err);
    return { success: false, message: err?.message || 'Error al rechazar video.' };
  }
}

export async function getPendingApprovalsAction() {
  try {
    const items = await videoLibraryService.getPendingApprovals();
    return { success: true, items };
  } catch (err: any) {
    console.error('Error en getPendingApprovalsAction:', err);
    return { success: false, error: err?.message || 'Error al obtener pendientes.', items: [] };
  }
}

export async function ingestVideoManualAction({
  videoUrl,
  coachNotes,
  userId = 'admin',
  isAdmin = false,
  autoApprove = false
}: {
  videoUrl: string;
  coachNotes?: string;
  userId?: string;
  isAdmin?: boolean;
  autoApprove?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  item?: VideoLibraryItem;
  error?: string;
}> {
  try {
    const res = await videoLibraryService.ingestManualVideo({
      videoUrl,
      coachNotes,
      userId,
      isAdmin,
      autoApprove
    });
    return res;
  } catch (err: any) {
    console.error('Error en ingestVideoManualAction:', err);
    return {
      success: false,
      message: 'Error al registrar video con el Bus Neural.',
      error: err?.message || String(err)
    };
  }
}
