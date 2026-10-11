-- ==============================================================================
-- WILD WOLVES CDMX - CONFIGURACIÓN TÁCTICA: MATRIZ DE DÍAS Y HORARIOS (7 DÍAS)
-- Sede Oficial: Deportivo Carmen Serdán
-- ==============================================================================

-- 1. AÑADIR MATRIZ DE DÍAS Y HORARIOS POR DÍA EN PROFILES
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS selected_days TEXT[] DEFAULT '{"lunes","miercoles","viernes"}',
ADD COLUMN IF NOT EXISTS schedules_by_day JSONB DEFAULT '{"lunes":"17:00 - 19:00","miercoles":"17:00 - 19:00","viernes":"17:00 - 19:00"}'::jsonb;

-- 2. ÍNDICE GIN PARA BÚSQUEDA RÁPIDA POR DÍAS EN CANCHA
CREATE INDEX IF NOT EXISTS idx_profiles_selected_days ON public.profiles USING GIN (selected_days);
