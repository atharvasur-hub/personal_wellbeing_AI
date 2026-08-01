-- SUPABASE POSTGRESQL DATABASE MIGRATION SCHEMA
-- Project: Agentic Growth & Personal Wellbeing AI

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT 'Atharva Sur',
  role_title TEXT DEFAULT 'Growth Catalyst • Tier 3',
  streak_count INT DEFAULT 4,
  level_xp INT DEFAULT 3420,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Chat Messages Table for AI Assistant Thread Persistence
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT DEFAULT 'default_session',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Identity Nodes Table
CREATE TABLE IF NOT EXISTS public.identity_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT UNIQUE NOT NULL,
  current_mastery INT DEFAULT 8,
  target_mastery INT DEFAULT 10,
  category TEXT DEFAULT 'Technical Systems',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Daily Reflections Table
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood TEXT NOT NULL,
  log_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Goal Roadmap Items Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Create Public Access Policies (Allow read/write for frontend demo)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Public Insert Chat" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Chat" ON public.chat_messages FOR DELETE USING (true);

CREATE POLICY "Public Read Reflections" ON public.reflections FOR SELECT USING (true);
CREATE POLICY "Public Insert Reflections" ON public.reflections FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Roadmap" ON public.roadmap_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Roadmap" ON public.roadmap_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Roadmap" ON public.roadmap_items FOR UPDATE USING (true);

-- 6. Create Media Evaluations Table
CREATE TABLE IF NOT EXISTS public.media_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  aspiration TEXT NOT NULL,
  duration_minutes NUMERIC,
  intentionality_score NUMERIC CHECK (intentionality_score >= 0 AND intentionality_score <= 100),
  vpm_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add public access policy for media evaluations
ALTER TABLE public.media_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Media Evaluations" ON public.media_evaluations FOR SELECT USING (true);
CREATE POLICY "Public Insert Media Evaluations" ON public.media_evaluations FOR INSERT WITH CHECK (true);
