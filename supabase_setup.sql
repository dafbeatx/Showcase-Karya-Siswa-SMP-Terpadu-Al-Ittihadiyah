-- 1. Create the student_projects table
CREATE TABLE IF NOT EXISTS student_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class TEXT,
    category TEXT, -- Added category
    description TEXT,
    image_url TEXT,
    drive_link TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Policy: Allow anyone to read the data
CREATE POLICY "Allow public read access" 
ON student_projects 
FOR SELECT 
USING (true);

-- Policy: Allow inserts (currently public for simplicity in this task, but can be restricted)
CREATE POLICY "Allow public insert" 
ON student_projects 
FOR INSERT 
WITH CHECK (true);

-- Policy: Allow deletion (currently public for simplicity, restricted by password in app)
CREATE POLICY "Allow public delete" 
ON student_projects 
FOR DELETE 
USING (true);

-- 4. Storage Bucket Setup (Create manually or via API)
-- Bucket name: showcase-projects
-- Make sure the bucket is public or has appropriate policies.
-- storage.objects policies:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'showcase-projects');
-- CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'showcase-projects');
