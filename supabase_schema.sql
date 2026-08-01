-- SUPABASE POSTGRESQL DATABASE SCHEMA (PER-USER DATA ISOLATION & ML PILLARS)
-- Project: Agentic Growth & Personal Wellbeing AI

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE DEFAULT auth.uid(),
  display_name TEXT DEFAULT 'Atharva Sur',
  current_role TEXT DEFAULT 'Growth Catalyst • Tier 3',
  streak_count INT DEFAULT 4,
  level_xp INT DEFAULT 3420,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Intent & Behavior Analysis Table (Goals & Aspirations)
CREATE TABLE IF NOT EXISTS public.user_aspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  primary_goal TEXT NOT NULL,
  current_mood TEXT DEFAULT 'neutral',
  fatigue_level TEXT DEFAULT 'medium',
  intent_vector JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Content Signal Evaluation Table (Signal-to-Noise Scoring)
CREATE TABLE IF NOT EXISTS public.content_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'video' | 'article' | 'tool'
  signal_score INT DEFAULT 95, -- 0 to 100% Signal Ratio
  noise_filtered_pct INT DEFAULT 88,
  cognitive_load TEXT DEFAULT 'low',
  ai_reasoning_badge TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Proactive Habit Steering Logs Table (Digital Guardian Intercepts)
CREATE TABLE IF NOT EXISTS public.habit_steering_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  intercept_trigger TEXT NOT NULL, -- 'doomscroll' | 'distraction' | 'fatigue'
  time_saved_minutes INT DEFAULT 15,
  redirected_sprint TEXT NOT NULL,
  user_accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  session_id TEXT DEFAULT 'default_session',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Reflections Table
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  mood TEXT NOT NULL,
  log_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Roadmap Items Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_steering_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- PER-USER ISOLATION POLICIES (Users can ONLY access their own rows)
CREATE POLICY "Per User Profiles" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Aspirations" ON public.user_aspirations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Content Evaluations" ON public.content_evaluations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Habit Steering Logs" ON public.habit_steering_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Chat Messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Reflections" ON public.reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Per User Roadmap Items" ON public.roadmap_items FOR ALL USING (auth.uid() = user_id);
