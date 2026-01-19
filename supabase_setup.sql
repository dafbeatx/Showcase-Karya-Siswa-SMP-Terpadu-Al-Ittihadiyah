-- SUPABASE SETUP SCRIPT FOR SCHOOL NEWS PORTAL
-- Run this in your Supabase SQL Editor

-- 1. Create the news_posts table if not exists
CREATE TABLE IF NOT EXISTS public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_source TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- 3. DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view news" ON public.news_posts;
DROP POLICY IF EXISTS "Anyone can insert news" ON public.news_posts;
DROP POLICY IF EXISTS "Admins can update news" ON public.news_posts;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news_posts;

-- 4. CREATE Policies
-- Anyone (Public) can read news
CREATE POLICY "Public can view news" 
ON public.news_posts FOR SELECT 
USING (true);

-- Anyone (Public) can post news (as per user request "All user boleh posting")
CREATE POLICY "Anyone can insert news" 
ON public.news_posts FOR INSERT 
WITH CHECK (true);

-- ONLY Authenticated Admins can update/edit news
CREATE POLICY "Admins can update news" 
ON public.news_posts FOR UPDATE 
USING (auth.role() = 'authenticated');

-- ONLY Authenticated Admins can delete news
CREATE POLICY "Admins can delete news" 
ON public.news_posts FOR DELETE 
USING (auth.role() = 'authenticated');

-- 5. STORAGE BUCKET SETUP
-- Ensure you have a bucket named 'school-news'
-- Run these in your SQL editor if you want to set policies via SQL

-- Allow public to read images
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'school-news');

-- Allow anyone to upload images (since anyone can post news)
CREATE POLICY "Anyone can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'school-news');

-- Only admins can delete/update images
CREATE POLICY "Admins can manage images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'school-news' AND auth.role() = 'authenticated');

/*
INSTRUCTIONS FOR ADMIN ACCOUNT:
1. Go to Supabase Dashboard -> Authentication -> Users.
2. Click "Add User" -> "Create new user".
3. Enter:
   Email: dafanakalbho75@gmail.com
   Password: senku.12345
4. Ensure "Auto-confirm user" is CHECKED or confirm it manually.
*/
