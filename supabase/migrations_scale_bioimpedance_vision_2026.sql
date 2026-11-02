-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN DE BÁSCULA Y BIOIMPEDANCIA POR VISIÓN
-- Archivo: supabase/migrations_scale_bioimpedance_vision_2026.sql
-- Sede: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

-- 1. Añadir columnas biométricas a public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS fat_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS muscle_mass_kg NUMERIC,
ADD COLUMN IF NOT EXISTS water_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS visceral_fat INTEGER,
ADD COLUMN IF NOT EXISTS bmi NUMERIC,
ADD COLUMN IF NOT EXISTS metabolic_age INTEGER,
ADD COLUMN IF NOT EXISTS bioimpedance_updated_at TIMESTAMPTZ;

-- 2. Añadir columnas biométricas a public.detailed_test_records para historial
ALTER TABLE public.detailed_test_records 
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS fat_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS muscle_mass_kg NUMERIC,
ADD COLUMN IF NOT EXISTS water_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS visceral_fat INTEGER,
ADD COLUMN IF NOT EXISTS bmi NUMERIC,
ADD COLUMN IF NOT EXISTS metabolic_age INTEGER;

-- 3. Notificar a PostgREST para recargar la caché de esquema
NOTIFY pgrst, 'reload schema';
