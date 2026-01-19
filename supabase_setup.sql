-- ==========================================
-- SUPABASE DATABASE SETUP (SQL Editor)
-- ==========================================

-- 1. Create news_posts table
CREATE TABLE IF NOT EXISTS public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can view news (SELECT)
CREATE POLICY "Public can view news" 
ON public.news_posts FOR SELECT 
USING (true);

-- 4. Policy: Anyone can insert news (INSERT) - (Adjust as needed later)
CREATE POLICY "Anyone can insert news" 
ON public.news_posts FOR INSERT 
WITH CHECK (true);

-- 5. Policy: Anyone can delete news (DELETE) - (OPTIONAL: Keep disabled for security if no Auth)
-- CREATE POLICY "Anyone can delete news" 
-- ON public.news_posts FOR DELETE 
-- USING (true);


-- ==========================================
-- SUPABASE STORAGE SETUP (SQL Editor)
-- ==========================================

-- 1. Create 'school-news' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('school-news', 'school-news', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policy: Allow public to view files
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'school-news' );

-- 3. Storage Policy: Allow anyone to upload files (Adjust for Auth later)
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'school-news' );

-- 4. Storage Policy: Allow anyone to update/delete (Optional)
CREATE POLICY "Public Update/Delete Access"
ON storage.objects FOR ALL
USING ( bucket_id = 'school-news' );
