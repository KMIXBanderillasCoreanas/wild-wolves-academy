-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY - BAZAR LOBO (LOBOEXCHANGE) MIGRATION 2026
-- ==============================================================================

-- 1. EXTENSIÓN DE TABLA PROFILES PARA SISTEMA DE REPUTACIÓN Y CONFIANZA
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC(3, 2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS completed_exchanges_count INT DEFAULT 0;

-- 2. TIPOS ENUMERADOS DE BAZAR LOBO
DO $$ BEGIN
  CREATE TYPE marketplace_category_enum AS ENUM (
    'calzado', 'uniformes_ropa', 'balones', 'proteccion_rodilleras', 'accesorios_entrenamiento'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE marketplace_condition_enum AS ENUM (
    'nuevo_con_etiqueta', 'como_nuevo', 'buen_estado', 'donacion_gratuita'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE marketplace_item_status_enum AS ENUM (
    'active', 'reserved', 'completed', 'archived', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLA DE ARTÍCULOS EN VENTA / TRUEQUE (marketplace_items)
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category marketplace_category_enum NOT NULL,
  condition marketplace_condition_enum NOT NULL,
  price_mxn NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  size_tag VARCHAR(30),
  preferred_shift VARCHAR(30) NOT NULL DEFAULT 'vespertino_5_7',
  images_urls TEXT[] NOT NULL DEFAULT '{}',
  status marketplace_item_status_enum NOT NULL DEFAULT 'active',
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE HILOS DE CHAT SEGURO (marketplace_chat_threads)
CREATE TABLE IF NOT EXISTS public.marketplace_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_preview TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(item_id, buyer_id)
);

-- 5. TABLA DE MENSAJES (marketplace_messages)
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.marketplace_chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar replicación para Supabase Realtime
ALTER TABLE public.marketplace_messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. TABLA DE RESEÑAS Y REPUTACIÓN (marketplace_reviews)
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_score INT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
  punctual_on_court BOOLEAN NOT NULL DEFAULT true,
  gear_as_described BOOLEAN NOT NULL DEFAULT true,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(item_id, reviewer_id)
);

-- 7. TRIGGER AUTOMÁTICO DE REPUTACIÓN (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_user_trust_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_score NUMERIC(3, 2);
  v_count INT;
BEGIN
  SELECT COALESCE(AVG(rating_score), 5.00), COUNT(*)
  INTO v_avg_score, v_count
  FROM public.marketplace_reviews
  WHERE reviewed_user_id = NEW.reviewed_user_id;

  UPDATE public.profiles
  SET trust_score = ROUND(v_avg_score, 2),
      completed_exchanges_count = v_count
  WHERE id = NEW.reviewed_user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_trust_score ON public.marketplace_reviews;
CREATE TRIGGER trg_update_trust_score
AFTER INSERT ON public.marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_user_trust_rating();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para marketplace_items
DROP POLICY IF EXISTS "Active members can view items" ON public.marketplace_items;
CREATE POLICY "Active members can view items"
ON public.marketplace_items FOR SELECT
TO authenticated
USING (
  status IN ('active', 'reserved', 'completed')
  OR auth.uid() = seller_id
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
);

DROP POLICY IF EXISTS "Users can create their own listings" ON public.marketplace_items;
CREATE POLICY "Users can create their own listings"
ON public.marketplace_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers and Coaches can update listings" ON public.marketplace_items;
CREATE POLICY "Sellers and Coaches can update listings"
ON public.marketplace_items FOR UPDATE
TO authenticated
USING (
  auth.uid() = seller_id 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
);

-- Políticas para marketplace_chat_threads
DROP POLICY IF EXISTS "Thread participants can view thread" ON public.marketplace_chat_threads;
CREATE POLICY "Thread participants can view thread"
ON public.marketplace_chat_threads FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyer can initiate thread" ON public.marketplace_chat_threads;
CREATE POLICY "Buyer can initiate thread"
ON public.marketplace_chat_threads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Políticas para marketplace_messages
DROP POLICY IF EXISTS "Thread participants can view messages" ON public.marketplace_messages;
CREATE POLICY "Thread participants can view messages"
ON public.marketplace_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_chat_threads t
    WHERE t.id = thread_id AND (auth.uid() = t.buyer_id OR auth.uid() = t.seller_id)
  )
);

DROP POLICY IF EXISTS "Thread participants can send messages" ON public.marketplace_messages;
CREATE POLICY "Thread participants can send messages"
ON public.marketplace_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.marketplace_chat_threads t
    WHERE t.id = thread_id AND (auth.uid() = t.buyer_id OR auth.uid() = t.seller_id)
  )
);

-- Políticas para marketplace_reviews
DROP POLICY IF EXISTS "Anyone can view public marketplace reviews" ON public.marketplace_reviews;
CREATE POLICY "Anyone can view public marketplace reviews"
ON public.marketplace_reviews FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Verified item participants can submit review" ON public.marketplace_reviews;
CREATE POLICY "Verified item participants can submit review"
ON public.marketplace_reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.marketplace_items i
    WHERE i.id = item_id 
      AND i.status = 'completed'
      AND (auth.uid() = i.seller_id OR auth.uid() = i.buyer_id)
  )
);
