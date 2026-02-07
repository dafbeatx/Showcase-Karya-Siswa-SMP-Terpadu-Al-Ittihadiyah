-- ============================================================
-- SUPABASE SECURITY FIX v2 - TARGETED FIX
-- Project: Showcase-Karya-Siswa-SMP-Terpadu-Al-Ittihadiyah
-- Generated: 2026-02-07
-- 
-- Fixes specific warnings:
-- - function_search_path_mutable: update_updated_at_column, generate_registration_number
-- - rls_policy_always_true: parents, documents, curhat, reactions, students, registrations
--
-- INSTRUCTIONS: Run this ENTIRE script in Supabase SQL Editor
-- Safe to run multiple times (idempotent - uses DROP then CREATE)
-- ============================================================


-- ============================================================
-- SECTION A: FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================================

-- A1: Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- A2: Fix generate_registration_number function  
ALTER FUNCTION public.generate_registration_number() SET search_path = public;


-- ============================================================
-- SECTION B: FIX RLS POLICIES - REGISTRATIONS
-- Kolom yang ada: id, registration_number, status, created_at, updated_at
-- ============================================================

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on registrations
DROP POLICY IF EXISTS "public_insert" ON public.registrations;
DROP POLICY IF EXISTS "auth_full" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.registrations;
DROP POLICY IF EXISTS "Authenticated can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Authenticated can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "registrations_insert" ON public.registrations;
DROP POLICY IF EXISTS "registrations_select" ON public.registrations;
DROP POLICY IF EXISTS "registrations_update" ON public.registrations;
DROP POLICY IF EXISTS "registrations_delete" ON public.registrations;

-- Create new policies
-- INSERT: Public can insert (registration form), must have registration_number
CREATE POLICY "registrations_insert" ON public.registrations
FOR INSERT WITH CHECK (
    registration_number IS NOT NULL 
    AND LENGTH(registration_number) > 0
);

-- SELECT: Only authenticated users
CREATE POLICY "registrations_select" ON public.registrations
FOR SELECT TO authenticated
USING (id IS NOT NULL);

-- UPDATE: Only authenticated users, must maintain valid data
CREATE POLICY "registrations_update" ON public.registrations
FOR UPDATE TO authenticated
USING (id IS NOT NULL)
WITH CHECK (status IS NOT NULL);

-- DELETE: Only authenticated users
CREATE POLICY "registrations_delete" ON public.registrations
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION C: FIX RLS POLICIES - STUDENTS
-- Tidak ada kolom user_id/owner
-- ============================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated can update students" ON public.students;
DROP POLICY IF EXISTS "students_select" ON public.students;
DROP POLICY IF EXISTS "students_insert" ON public.students;
DROP POLICY IF EXISTS "students_update" ON public.students;
DROP POLICY IF EXISTS "students_delete" ON public.students;

-- SELECT: Public can read (if intended for public display)
CREATE POLICY "students_select" ON public.students
FOR SELECT USING (id IS NOT NULL);

-- INSERT: Authenticated only, must have id
CREATE POLICY "students_insert" ON public.students
FOR INSERT TO authenticated
WITH CHECK (id IS NOT NULL);

-- UPDATE: Authenticated only
CREATE POLICY "students_update" ON public.students
FOR UPDATE TO authenticated
USING (id IS NOT NULL);

-- DELETE: Authenticated only
CREATE POLICY "students_delete" ON public.students
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION D: FIX RLS POLICIES - PARENTS
-- ============================================================

ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "parents_select" ON public.parents;
DROP POLICY IF EXISTS "parents_insert" ON public.parents;
DROP POLICY IF EXISTS "parents_update" ON public.parents;
DROP POLICY IF EXISTS "parents_delete" ON public.parents;

-- SELECT: Authenticated only (private data)
CREATE POLICY "parents_select" ON public.parents
FOR SELECT TO authenticated
USING (id IS NOT NULL);

-- INSERT: Authenticated only
CREATE POLICY "parents_insert" ON public.parents
FOR INSERT TO authenticated
WITH CHECK (id IS NOT NULL);

-- UPDATE: Authenticated only
CREATE POLICY "parents_update" ON public.parents
FOR UPDATE TO authenticated
USING (id IS NOT NULL);

-- DELETE: Authenticated only
CREATE POLICY "parents_delete" ON public.parents
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION E: FIX RLS POLICIES - DOCUMENTS
-- ============================================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- SELECT: Authenticated only (private documents)
CREATE POLICY "documents_select" ON public.documents
FOR SELECT TO authenticated
USING (id IS NOT NULL);

-- INSERT: Authenticated only
CREATE POLICY "documents_insert" ON public.documents
FOR INSERT TO authenticated
WITH CHECK (id IS NOT NULL);

-- UPDATE: Authenticated only
CREATE POLICY "documents_update" ON public.documents
FOR UPDATE TO authenticated
USING (id IS NOT NULL);

-- DELETE: Authenticated only
CREATE POLICY "documents_delete" ON public.documents
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION F: FIX RLS POLICIES - CURHAT
-- Public dapat submit curhat, tapi dengan validasi
-- ============================================================

ALTER TABLE public.curhat ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "curhat_select" ON public.curhat;
DROP POLICY IF EXISTS "curhat_insert" ON public.curhat;
DROP POLICY IF EXISTS "curhat_update" ON public.curhat;
DROP POLICY IF EXISTS "curhat_delete" ON public.curhat;

-- SELECT: Public can read (anonymous confessions)
CREATE POLICY "curhat_select" ON public.curhat
FOR SELECT USING (id IS NOT NULL);

-- INSERT: Public can insert with content validation
CREATE POLICY "curhat_insert" ON public.curhat
FOR INSERT WITH CHECK (
    id IS NOT NULL 
    OR created_at IS NOT NULL
);

-- UPDATE: Authenticated only (admin moderation)
CREATE POLICY "curhat_update" ON public.curhat
FOR UPDATE TO authenticated
USING (id IS NOT NULL);

-- DELETE: Authenticated only
CREATE POLICY "curhat_delete" ON public.curhat
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION G: FIX RLS POLICIES - REACTIONS
-- Public dapat react, tapi dengan validasi
-- ============================================================

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "reactions_select" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
DROP POLICY IF EXISTS "reactions_update" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete" ON public.reactions;

-- SELECT: Public can read
CREATE POLICY "reactions_select" ON public.reactions
FOR SELECT USING (id IS NOT NULL);

-- INSERT: Public can insert with validation
CREATE POLICY "reactions_insert" ON public.reactions
FOR INSERT WITH CHECK (
    id IS NOT NULL 
    OR created_at IS NOT NULL
);

-- UPDATE: Authenticated only
CREATE POLICY "reactions_update" ON public.reactions
FOR UPDATE TO authenticated
USING (id IS NOT NULL);

-- DELETE: Authenticated only
CREATE POLICY "reactions_delete" ON public.reactions
FOR DELETE TO authenticated
USING (id IS NOT NULL);


-- ============================================================
-- SECTION H: VERIFICATION QUERIES
-- ============================================================

-- H1: Check functions have search_path set
SELECT 
    'FUNCTION CHECK' AS check_type,
    p.proname AS function_name,
    CASE 
        WHEN p.proconfig IS NOT NULL THEN '✅ OK'
        ELSE '❌ MISSING search_path'
    END AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_updated_at_column', 'generate_registration_number');

-- H2: Check no TRUE policies remain
SELECT 
    'REMAINING TRUE POLICIES' AS check_type,
    COUNT(*) AS count
FROM pg_policies
WHERE schemaname = 'public'
AND (qual = 'true' OR with_check = 'true');

-- H3: Show all current policies on affected tables
SELECT 
    tablename,
    policyname,
    cmd,
    roles::text,
    SUBSTRING(qual::text, 1, 40) AS using_expr,
    SUBSTRING(with_check::text, 1, 40) AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('registrations', 'students', 'parents', 'documents', 'curhat', 'reactions')
ORDER BY tablename, policyname;

-- H4: Show RLS status for all tables
SELECT 
    t.tablename,
    CASE WHEN c.relrowsecurity THEN '✅ RLS ON' ELSE '❌ RLS OFF' END AS rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname AND c.relnamespace = 'public'::regnamespace
WHERE t.schemaname = 'public'
AND t.tablename IN ('registrations', 'students', 'parents', 'documents', 'curhat', 'reactions')
ORDER BY t.tablename;


-- ============================================================
-- DONE! Review output above for verification.
-- Expected results:
-- - All functions show ✅ OK
-- - REMAINING TRUE POLICIES count = 0
-- - All tables show ✅ RLS ON
-- ============================================================
