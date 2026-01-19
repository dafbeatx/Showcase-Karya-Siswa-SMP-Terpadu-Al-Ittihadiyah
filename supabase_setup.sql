-- ==========================================
-- SUPABASE DATABASE SETUP (SQL Editor)
-- ==========================================

-- 1. Create news_posts table (Add is_featured)
CREATE TABLE IF NOT EXISTS public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_source TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add column safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_posts' AND column_name='is_featured') THEN
        ALTER TABLE public.news_posts ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Enable Row Level Security
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can view news (SELECT)
DROP POLICY IF EXISTS "Public can view news" ON public.news_posts;
CREATE POLICY "Public can view news" 
ON public.news_posts FOR SELECT 
USING (true);

-- 4. Policy: Anyone can insert news (INSERT)
DROP POLICY IF EXISTS "Anyone can insert news" ON public.news_posts;
CREATE POLICY "Anyone can insert news" 
ON public.news_posts FOR INSERT 
WITH CHECK (true);

-- 5. Policy: ONLY AUTHENTICATED can update news (UPDATE)
DROP POLICY IF EXISTS "Admins can update news" ON public.news_posts;
CREATE POLICY "Admins can update news" 
ON public.news_posts FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 6. Policy: ONLY AUTHENTICATED can delete news (DELETE)
DROP POLICY IF EXISTS "Admins can delete news" ON public.news_posts;
CREATE POLICY "Admins can delete news" 
ON public.news_posts FOR DELETE 
USING (auth.role() = 'authenticated');


-- ==========================================
-- SUPABASE STORAGE SETUP (SQL Editor)
-- ==========================================

-- 1. Create 'school-news' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-news', 'school-news', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policy: Allow public to view files
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'school-news' );

-- 3. Storage Policy: Allow anyone to upload files
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'school-news' );

-- 4. Storage Policy: Allow ONLY AUTHENTICATED to update/delete
DROP POLICY IF EXISTS "Admins can manage files" ON storage.objects;
CREATE POLICY "Admins can manage files"
ON storage.objects FOR ALL
USING ( bucket_id = 'school-news' AND auth.role() = 'authenticated' );
