-- ============================================================
-- NEWS ENGAGEMENT FEATURES - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add view_count column to news_posts
ALTER TABLE public.news_posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Create news_comments table
CREATE TABLE IF NOT EXISTS public.news_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_comments_news_id ON public.news_comments(news_id);

-- 3. Create news_reactions table
CREATE TABLE IF NOT EXISTS public.news_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'sad', 'angry')),
    session_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(news_id, session_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_news_reactions_news_id ON public.news_reactions(news_id);

-- 4. Enable RLS
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_reactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any
DROP POLICY IF EXISTS "comments_select" ON public.news_comments;
DROP POLICY IF EXISTS "comments_insert" ON public.news_comments;
DROP POLICY IF EXISTS "comments_delete" ON public.news_comments;
DROP POLICY IF EXISTS "reactions_select" ON public.news_reactions;
DROP POLICY IF EXISTS "reactions_insert" ON public.news_reactions;

-- 6. Create secure RLS policies for comments
CREATE POLICY "comments_select" ON public.news_comments
FOR SELECT USING (id IS NOT NULL);

CREATE POLICY "comments_insert" ON public.news_comments
FOR INSERT WITH CHECK (
    author_name IS NOT NULL 
    AND LENGTH(author_name) >= 2
    AND content IS NOT NULL 
    AND LENGTH(content) >= 3
);

CREATE POLICY "comments_delete" ON public.news_comments
FOR DELETE TO authenticated USING (id IS NOT NULL);

-- 7. Create secure RLS policies for reactions
CREATE POLICY "reactions_select" ON public.news_reactions
FOR SELECT USING (id IS NOT NULL);

CREATE POLICY "reactions_insert" ON public.news_reactions
FOR INSERT WITH CHECK (
    news_id IS NOT NULL 
    AND reaction_type IS NOT NULL
);

-- 8. Verification
SELECT 'news_comments' AS table_name, COUNT(*) AS policy_count 
FROM pg_policies WHERE tablename = 'news_comments'
UNION ALL
SELECT 'news_reactions', COUNT(*) 
FROM pg_policies WHERE tablename = 'news_reactions';
