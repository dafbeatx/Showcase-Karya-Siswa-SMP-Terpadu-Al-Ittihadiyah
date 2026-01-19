-- SUPABASE SETUP SCRIPT FOR SCHOOL NEWS PORTAL
-- Run this in your Supabase SQL Editor

-- 1. Create the news_posts table if not exists
CREATE TABLE IF NOT EXISTS public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_source TEXT,
    category TEXT DEFAULT 'Kegiatan',
    status TEXT DEFAULT 'pending', -- pending, published, rejected
    author_name TEXT,
    author_role TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MIGRATION: Add columns if they don't exist (Fix for "already exists" tables)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'news_posts' AND COLUMN_NAME = 'category') THEN
        ALTER TABLE public.news_posts ADD COLUMN category TEXT DEFAULT 'Kegiatan';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'news_posts' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE public.news_posts ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'news_posts' AND COLUMN_NAME = 'author_name') THEN
        ALTER TABLE public.news_posts ADD COLUMN author_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'news_posts' AND COLUMN_NAME = 'author_role') THEN
        ALTER TABLE public.news_posts ADD COLUMN author_role TEXT;
    END IF;
END $$;

-- MIGRATION: Ensure all existing news has a status and category (Case consistency)
UPDATE public.news_posts SET status = 'published' WHERE status IS NULL;
UPDATE public.news_posts SET category = 'Kegiatan' WHERE category IS NULL;
-- Optional: Force title-case for existing categories if any were lowercase
UPDATE public.news_posts SET category = 'Kegiatan' WHERE LOWER(category) = 'kegiatan';
UPDATE public.news_posts SET category = 'Prestasi' WHERE LOWER(category) = 'prestasi';
UPDATE public.news_posts SET category = 'Pengumuman' WHERE LOWER(category) = 'pengumuman';
UPDATE public.news_posts SET category = 'PPDB' WHERE LOWER(category) = 'ppdb';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- 3. DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view news" ON public.news_posts;
DROP POLICY IF EXISTS "Public can view published news" ON public.news_posts;
DROP POLICY IF EXISTS "Anyone can insert news" ON public.news_posts;
DROP POLICY IF EXISTS "Admins can update news" ON public.news_posts;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news_posts;

-- 4. CREATE Policies
-- Anyone (Public) can read news, but ONLY if status is 'published'
-- Admins can read ALL news
CREATE POLICY "Public can view published news" 
ON public.news_posts FOR SELECT 
USING (
    status = 'published' OR 
    auth.role() = 'authenticated'
);

-- Anyone (Public) can post news, but it defaults to 'pending' via table DEFAULT
CREATE POLICY "Anyone can insert news" 
ON public.news_posts FOR INSERT 
WITH CHECK (
    status = 'pending' -- Force status to pending for public inserts
);

-- ONLY Authenticated Admins can update/edit news (Moderation)
CREATE POLICY "Admins can update news" 
ON public.news_posts FOR UPDATE 
USING (auth.role() = 'authenticated');

-- ONLY Authenticated Admins can delete news
CREATE POLICY "Admins can delete news" 
ON public.news_posts FOR DELETE 
USING (auth.role() = 'authenticated');

-- 5. STORAGE BUCKET SETUP
-- Ensure you have a bucket named 'school-news'

-- DROP existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage images" ON storage.objects;

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
