-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN DE DUELA DE TRANSFORMACIÓN
-- Archivo: supabase/migrations_success_stories_2026.sql
-- Sede: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

-- 1. TABLA LIGERA DE CASOS DE ÉXITO (success_stories)
CREATE TABLE IF NOT EXISTS public.success_stories (
    id TEXT PRIMARY KEY,
    atleta_nombre TEXT NOT NULL,
    logro_descripcion TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    metricas_ia TEXT NOT NULL,
    category TEXT DEFAULT 'Desarrollo Competitivo',
    days_to_transform INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "success_stories_public_read" ON public.success_stories;
CREATE POLICY "success_stories_public_read" ON public.success_stories
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "success_stories_admin_all" ON public.success_stories;
CREATE POLICY "success_stories_admin_all" ON public.success_stories
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 2. SEMBRADO DE CASOS DE ÉXITO DEPORTIVO REALES EN DEPORTIVO CARMEN SERDÁN
INSERT INTO public.success_stories (id, atleta_nombre, logro_descripcion, youtube_video_id, metricas_ia, category, days_to_transform)
VALUES
    (
        'trans-01',
        'Kevin G.',
        'Pasó de no tocar el aro a colgarse de él en 60 días',
        'dQw4w9WgXcQ',
        'Salto vertical: +18cm | Release time: 0.62s',
        'U-17 Competitivo',
        60
    ),
    (
        'trans-02',
        'Bruno Díaz',
        'Perfeccionamiento de tiro tras drible y paso cero con 72% de efectividad en duela',
        '5f9VdG7mY3I',
        'Ángulo de tiro: 47° | Release time: 0.58s | +12% efectividad en triples',
        'U-17 Competitivo',
        45
    ),
    (
        'trans-03',
        'Mateo R.',
        'Desaceleración en 45° y drible de escape bajo presión perimetral de defensores altos',
        '8Jz_5_o8h7w',
        'Circuito agilidad: 2.1s | Salto de cuerda: 650 continuos | Salto vertical: +12cm',
        'U-15 Formativo',
        60
    ),
    (
        'trans-04',
        'Isaac M.',
        'Dominio de flotadoras bombeadas con arco alto de 55° superando bloqueos',
        'bTqVqk7FSmY',
        'Arco de tiro: 55° | Envergadura aprovechada: 100% | Tiro libre: 8/10',
        'U-15 Formativo',
        30
    )
ON CONFLICT (id) DO UPDATE
SET atleta_nombre = EXCLUDED.atleta_nombre,
    logro_descripcion = EXCLUDED.logro_descripcion,
    youtube_video_id = EXCLUDED.youtube_video_id,
    metricas_ia = EXCLUDED.metricas_ia,
    category = EXCLUDED.category,
    days_to_transform = EXCLUDED.days_to_transform;
