'use client';

import React, { useState, useEffect } from 'react';
import { 
  VideoLibraryItem, 
  VideoTheme, 
  VideoCategory, 
  SearchQueryInterpretation 
} from '@/lib/types/video-library';
import { 
  searchVideosAction, 
  getOfficialCurriculumAction, 
  toggleVideoFavoriteAction, 
  getUserFavoritesAction 
} from '@/app/actions/video-library-actions';
import VideoSearchBar from './VideoSearchBar';
import VideoFilters from './VideoFilters';
import VideoGrid from './VideoGrid';
import VideoPlayer from './VideoPlayer';
import AIExplanation from './AIExplanation';
import VideoApprovalPanel from './VideoApprovalPanel';
import VideoIngestionForm from './VideoIngestionForm';
import { 
  Film, 
  Brain, 
  Sparkles, 
  Award, 
  Bookmark, 
  ShieldAlert,
  Flame,
  PlusCircle
} from 'lucide-react';

interface SmartVideoLibraryProps {
  userId?: string;
  athleteName?: string;
  isCoachOrAdmin?: boolean;
}

export default function SmartVideoLibrary({
  userId = 'demo-student',
  athleteName = 'Alumno Demo',
  isCoachOrAdmin = false
}: SmartVideoLibraryProps) {
  // Estado de videos y carga
  const [videos, setVideos] = useState<VideoLibraryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<VideoLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados de filtros
  const [activeTheme, setActiveTheme] = useState<'todos' | VideoTheme>('todos');
  const [activeCategory, setActiveCategory] = useState<'todas' | VideoCategory>('todas');
  const [officialOnly, setOfficialOnly] = useState<boolean>(false);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [showIngestionForm, setShowIngestionForm] = useState<boolean>(false);

  // Estados de búsqueda IA
  const [lastQuery, setLastQuery] = useState<string>('');
  const [detectedIntent, setDetectedIntent] = useState<string | undefined>();

  // Modales interactivos
  const [activeVideoModal, setActiveVideoModal] = useState<VideoLibraryItem | null>(null);
  const [activeExplainModal, setActiveExplainModal] = useState<VideoLibraryItem | null>(null);

  // Carga inicial de curriculum oficial y favoritos
  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [curriculumRes, favsRes] = await Promise.all([
        getOfficialCurriculumAction(),
        getUserFavoritesAction(userId)
      ]);

      if (curriculumRes.success && curriculumRes.items) {
        setVideos(curriculumRes.items);
      }

      if (favsRes.success && favsRes.items) {
        setFavoriteItems(favsRes.items);
        setFavorites(favsRes.items.map((v) => v.id));
      }
    } catch (e) {
      console.error('Error al cargar datos iniciales de biblioteca:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador de Búsqueda IA
  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLastQuery(query);
    setFavoritesOnly(false);

    try {
      const res = await searchVideosAction(
        query,
        {
          theme: activeTheme !== 'todos' ? activeTheme : undefined,
          category: activeCategory !== 'todas' ? activeCategory : undefined,
          officialOnly
        },
        userId
      );

      if (res.success && res.items) {
        setVideos(res.items);
        if (res.interpretation) {
          setDetectedIntent(res.interpretation.intent);
          if (res.interpretation.theme && activeTheme === 'todos') {
            setActiveTheme(res.interpretation.theme);
          }
        }
      }
    } catch (err) {
      console.error('Error en búsqueda de videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador de Favoritos
  const handleToggleFavorite = async (videoId: string) => {
    // Actualización optimista
    setFavorites((prev) => {
      const exists = prev.includes(videoId);
      if (exists) {
        return prev.filter((id) => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });

    try {
      const res = await toggleVideoFavoriteAction(userId, videoId);
      if (res.success) {
        // Refrescar favoritos en segundo plano
        const favs = await getUserFavoritesAction(userId);
        if (favs.success && favs.items) {
          setFavoriteItems(favs.items);
          setFavorites(favs.items.map((v) => v.id));
        }
      }
    } catch (err) {
      console.error('Error al alternar favorito:', err);
    }
  };

  // Filtrado reactivo en memoria
  const displayedVideos = React.useMemo(() => {
    if (favoritesOnly) {
      return favoriteItems;
    }

    return videos.filter((v) => {
      if (officialOnly && !v.isOfficial) return false;
      if (activeTheme !== 'todos' && v.theme !== activeTheme) return false;
      if (activeCategory !== 'todas' && v.category !== activeCategory) return false;
      return true;
    });
  }, [videos, favoriteItems, favoritesOnly, officialOnly, activeTheme, activeCategory]);

  return (
    <div className="w-full space-y-6">
      {/* Banner Principal Tecnológico Neón */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-[#090e1a] via-[#0f172a] to-[#1a1226] p-6 text-zinc-100 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-cyan-400 border border-cyan-500/30">
                <Brain className="h-3.5 w-3.5 text-cyan-400" />
                AI Smart Video Library
              </span>
              <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                Carmen Serdán • FIBA & NBA Pro
              </span>
              <span className="rounded-lg bg-purple-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-purple-300 border border-purple-500/30">
                Protección Menores 14-16 Años
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Videoteca Táctica & Motor Inteligente de Aprendizaje
            </h2>

            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Explora lecciones de fundamentos y variantes pro curadas con inteligencia artificial. Busca por intención motriz o estudia el curriculum permanente oficial de Wild Wolves.
            </p>
          </div>

          {/* Toggle de Administración e Ingesta si es Coach/Admin */}
          {isCoachOrAdmin && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowIngestionForm(!showIngestionForm)}
                className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg ${
                  showIngestionForm
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-cyan-500/20'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <PlusCircle className="h-4 w-4 text-cyan-400" />
                {showIngestionForm ? 'Cerrar Ingesta' : '+ Ingesta Directa'}
              </button>

              <button
                type="button"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg ${
                  showAdminPanel
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-red-500/20'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-red-400" />
                {showAdminPanel ? 'Ocultar Búnker' : 'Búnker Moderación'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FORMULARIO DE INGESTA DIRECTA ASISTIDA POR IA */}
      {isCoachOrAdmin && showIngestionForm && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-300">
          <VideoIngestionForm
            userId={userId}
            isAdmin={isCoachOrAdmin}
            onVideoIngested={(newVideo) => {
              setVideos((prev) => [newVideo, ...prev]);
            }}
          />
        </section>
      )}

      {/* PANEL ADMIN (SOLO VISIBLE SI SE ACTIVA Y TIENE PRIVILEGIOS) */}
      {isCoachOrAdmin && showAdminPanel && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-300">
          <VideoApprovalPanel adminId={userId} adminName={athleteName} />
        </section>
      )}

      {/* BARRA DE BÚSQUEDA INTELIGENTE IA */}
      <section className="space-y-4">
        <VideoSearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          initialQuery={lastQuery}
          detectedIntent={detectedIntent}
        />
      </section>

      {/* FILTROS DE TEMÁTICAS, CATEGORÍAS Y FAVORITOS */}
      <section className="space-y-4">
        <VideoFilters
          activeTheme={activeTheme}
          activeCategory={activeCategory}
          officialOnly={officialOnly}
          favoritesOnly={favoritesOnly}
          onThemeChange={(theme) => setActiveTheme(theme)}
          onCategoryChange={(cat) => setActiveCategory(cat)}
          onOfficialToggle={() => {
            setOfficialOnly(!officialOnly);
            setFavoritesOnly(false);
          }}
          onFavoritesToggle={() => {
            setFavoritesOnly(!favoritesOnly);
            setOfficialOnly(false);
          }}
          favoritesCount={favorites.length}
        />
      </section>

      {/* GRID DE RESULTADOS Y VIDEOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">
            Mostrando <strong>{displayedVideos.length}</strong> {favoritesOnly ? 'favoritos' : 'lecciones disponibles'}
          </span>
          {officialOnly && (
            <span className="text-amber-400 font-mono text-[11px] font-bold">
              ★ Modo Curriculum Oficial Activo
            </span>
          )}
        </div>

        <VideoGrid
          videos={displayedVideos}
          favorites={favorites}
          isLoading={isLoading}
          onPlay={(v) => setActiveVideoModal(v)}
          onExplainAI={(v) => setActiveExplainModal(v)}
          onToggleFavorite={handleToggleFavorite}
          onResetFilters={() => {
            setActiveTheme('todos');
            setActiveCategory('todas');
            setOfficialOnly(false);
            setFavoritesOnly(false);
            loadInitialData();
          }}
        />
      </section>

      {/* MODALES REPRODUCTOR Y ANÁLISIS IA */}
      {activeVideoModal && (
        <VideoPlayer
          video={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          onOpenAIExplain={(v) => {
            setActiveVideoModal(null);
            setActiveExplainModal(v);
          }}
        />
      )}

      {activeExplainModal && (
        <AIExplanation
          video={activeExplainModal}
          onClose={() => setActiveExplainModal(null)}
          onPlayVideo={(v) => {
            setActiveExplainModal(null);
            setActiveVideoModal(v);
          }}
        />
      )}
    </div>
  );
}
