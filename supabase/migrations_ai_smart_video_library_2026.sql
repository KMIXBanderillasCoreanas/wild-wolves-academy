-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - AI SMART VIDEO LIBRARY MIGRATION
-- Archivo: supabase/migrations_ai_smart_video_library_2026.sql
-- ==============================================================================

-- 1. TABLA PRINCIPAL DE VIDEOS DE LA BIBLIOTECA (video_library_items)
CREATE TABLE IF NOT EXISTS public.video_library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    channel_title TEXT NOT NULL,
    channel_id TEXT,
    thumbnail_url TEXT,
    duration TEXT DEFAULT '00:00',
    theme TEXT NOT NULL CHECK (theme IN ('baloncesto', 'preparacion_fisica', 'educacion_deportiva')),
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'formativo' CHECK (difficulty IN ('iniciacion', 'formativo', 'avanzado', 'elite')),
    relevance_score NUMERIC(5,2) DEFAULT 85.00,
    educational_score NUMERIC(5,2) DEFAULT 90.00,
    ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'temporary' CHECK (status IN ('pending', 'approved', 'rejected', 'temporary')),
    is_official BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    view_count INT DEFAULT 0,
    allow_embedding BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE FAVORITOS (video_favorites)
CREATE TABLE IF NOT EXISTS public.video_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.video_library_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_video_favorite UNIQUE(user_id, video_id)
);

-- 3. TABLA DE HISTORIAL DE BÚSQUEDA Y AUDITORÍA INTELIGENTE (video_search_history)
CREATE TABLE IF NOT EXISTS public.video_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    detected_theme TEXT,
    detected_category TEXT,
    results_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE REGISTROS DE MODERACIÓN Y AUDITORÍA ADMIN (video_approval_logs)
CREATE TABLE IF NOT EXISTS public.video_approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.video_library_items(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 're_evaluated')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CANALES CURADOS Y VERIFICADOS (video_curated_channels)
CREATE TABLE IF NOT EXISTS public.video_curated_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    channel_id TEXT,
    theme TEXT NOT NULL CHECK (theme IN ('baloncesto', 'preparacion_fisica', 'educacion_deportiva')),
    default_category TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar fuentes oficiales verificadas
INSERT INTO public.video_curated_channels (name, handle, theme, default_category, description)
VALUES 
('ShotMechanics', '@ShotMechanics', 'baloncesto', 'baloncesto_tiro', 'Referente global en biomecánica de tiro, gather step y fluidez motriz.'),
('By Any Means Basketball', '@ByAnyMeansBasketball', 'baloncesto', 'baloncesto_drible', 'Especialista en desaceleración, cambios de ritmo en 45° y postura defensiva.'),
('Thinking Basketball', '@ThinkingBasketball', 'baloncesto', 'baloncesto_pick_roll', 'Análisis táctico élite NBA, lecturas de bloqueo directo y espaciado.'),
('Jeremy Ethier', '@jeremyethier', 'preparacion_fisica', 'preparacion_fisica_calistenia', 'Análisis kinesiológico y prevención de lesiones musculares con rigor científico.'),
('Will Tennyson', '@WillTennyson', 'educacion_deportiva', 'educacion_nutricion', 'Combustible deportivo, motivación y disciplina aplicada al entrenamiento.')
ON CONFLICT (handle) DO NOTHING;

-- 6. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_vli_youtube_id ON public.video_library_items(youtube_id);
CREATE INDEX IF NOT EXISTS idx_vli_theme_cat ON public.video_library_items(theme, category);
CREATE INDEX IF NOT EXISTS idx_vli_status_official ON public.video_library_items(status, is_official);
CREATE INDEX IF NOT EXISTS idx_vli_relevance ON public.video_library_items(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_vf_user_id ON public.video_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_vsh_user_id ON public.video_search_history(user_id);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.video_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_curated_channels ENABLE ROW LEVEL SECURITY;

-- Políticas video_library_items:
-- Lectura pública para videos aprobados, oficiales y temporales de búsqueda
DROP POLICY IF EXISTS "vli_select_policy" ON public.video_library_items;
CREATE POLICY "vli_select_policy" ON public.video_library_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "vli_insert_update_policy" ON public.video_library_items;
CREATE POLICY "vli_insert_update_policy" ON public.video_library_items
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas video_favorites:
DROP POLICY IF EXISTS "vf_all_policy" ON public.video_favorites;
CREATE POLICY "vf_all_policy" ON public.video_favorites
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas video_search_history:
DROP POLICY IF EXISTS "vsh_all_policy" ON public.video_search_history;
CREATE POLICY "vsh_all_policy" ON public.video_search_history
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas video_approval_logs:
DROP POLICY IF EXISTS "val_all_policy" ON public.video_approval_logs;
CREATE POLICY "val_all_policy" ON public.video_approval_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas video_curated_channels:
DROP POLICY IF EXISTS "vcc_all_policy" ON public.video_curated_channels;
CREATE POLICY "vcc_all_policy" ON public.video_curated_channels
    FOR ALL USING (true) WITH CHECK (true);
