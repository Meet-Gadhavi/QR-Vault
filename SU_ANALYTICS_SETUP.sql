-- =============================================================================
-- QR VAULT — VISITOR & REGIONAL ANALYTICS DATABASE TABLES
-- Run this script in the Supabase SQL Editor to support analytics tracking
-- =============================================================================

-- 1. DAILY TRAFFIC TABLE
-- Tracks unique, total, and average page interaction metrics daily.
CREATE TABLE IF NOT EXISTS public.visitor_traffic (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  unique_visitors INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  avg_page_visits NUMERIC(4, 2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REGIONAL ANALYTICS TABLE
-- Stores geo-location visits by country code to build live regional maps.
CREATE TABLE IF NOT EXISTS public.regional_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,          -- IN, US, GB, DE, etc.
  country_name VARCHAR(100) NOT NULL,
  visitor_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_country UNIQUE (country_code)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.visitor_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_analytics ENABLE ROW LEVEL SECURITY;

-- 4. OPEN ACCESS DEVELOPMENT POLICIES
CREATE POLICY "Public visitor traffic access" ON public.visitor_traffic FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public regional analytics access" ON public.regional_analytics FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 5. INITIAL SEED DATA (To match current dashboard stats)
-- =============================================================================

INSERT INTO public.visitor_traffic (date, unique_visitors, total_visits, avg_page_visits)
VALUES (CURRENT_DATE, 260, 1500, 4.3)
ON CONFLICT (date) DO UPDATE 
SET unique_visitors = EXCLUDED.unique_visitors,
    total_visits = EXCLUDED.total_visits,
    avg_page_visits = EXCLUDED.avg_page_visits;

INSERT INTO public.regional_analytics (country_code, country_name, visitor_count)
VALUES 
  ('IN', 'India', 975),
  ('US', 'United States', 270),
  ('GB', 'United Kingdom', 120),
  ('DE', 'Germany', 75),
  ('CA', 'Canada', 60)
ON CONFLICT (country_code) DO UPDATE
SET visitor_count = EXCLUDED.visitor_count;
