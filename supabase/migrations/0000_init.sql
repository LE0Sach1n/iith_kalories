-- Migration: 0000_init.sql
-- Description: Core tables for Kalories Pivot

-- 1. Profiles Table (with Partner Monitor support)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  partner_id UUID REFERENCES auth.users(id) NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: In the future, partner_id allows two users to read each other's vitality scores.

-- 2. Daily Vitals Table
CREATE TABLE public.daily_vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  sleep_score NUMERIC DEFAULT 0,
  nutrition_pts NUMERIC DEFAULT 0,
  movement_pts NUMERIC DEFAULT 0,
  stress_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. User Actions Logging
CREATE TABLE public.user_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Users can only read/write their own data)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id OR auth.uid() = partner_id);

CREATE POLICY "Users can view own vitals" 
ON public.daily_vitals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals" 
ON public.daily_vitals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own actions" 
ON public.user_actions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" 
ON public.user_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
