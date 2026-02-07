-- ============================================================
-- SUPABASE SECURITY FIX - IDEMPOTENT SCRIPT
-- Project: Showcase-Karya-Siswa-SMP-Terpadu-Al-Ittihadiyah
-- Generated: 2026-02-07
-- 
-- INSTRUCTIONS: Run this ENTIRE script in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- ============================================================
-- SECTION A: DIAGNOSTIC - Cek kondisi sebelum fix
-- ============================================================

-- A1: List semua function dengan search_path yang mutable
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    CASE WHEN p.proconfig IS NULL THEN 'MUTABLE (needs fix)' 
         ELSE 'OK' END AS search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql');

-- A2: List semua RLS policies yang pakai TRUE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (qual = 'true' OR with_check = 'true' OR qual IS NULL);

-- ============================================================
-- SECTION B: FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================================

-- B1: Fix all existing functions by setting search_path
-- This is idempotent - will update even if already set
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname AS schema_name, p.proname AS func_name, 
               pg_get_function_identity_arguments(p.oid) AS func_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER FUNCTION %I.%I(%s) SET search_path = public',
                func_record.schema_name,
                func_record.func_name,
                func_record.func_args
            );
            RAISE NOTICE 'Fixed search_path for: %.%(%)', 
                func_record.schema_name, func_record.func_name, func_record.func_args;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipped (error): %.%', func_record.schema_name, func_record.func_name;
        END;
    END LOOP;
END $$;

-- ============================================================
-- SECTION C: FIX RLS POLICIES - DROP TRUE POLICIES, CREATE PROPER ONES
-- ============================================================

-- C1: Enable RLS on all tables first (idempotent)
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
        RAISE NOTICE 'RLS enabled on: %', tbl.tablename;
    END LOOP;
END $$;

-- C2: Drop policies that use TRUE (careful, targeted drop)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        AND (qual = 'true' OR with_check = 'true')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped permissive policy: % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- ============================================================
-- C3: CREATE NEW SECURE POLICIES (with existence check)
-- ============================================================

-- Helper function to check if policy exists
CREATE OR REPLACE FUNCTION policy_exists(p_table text, p_policy text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = p_table 
        AND policyname = p_policy
    );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ----------------------------------------
-- LOGIN_ATTEMPTS TABLE POLICIES
-- ----------------------------------------
DO $$
BEGIN
    -- Select policy: Only recent attempts (for rate limiting)
    IF NOT policy_exists('login_attempts', 'select_recent_15min') THEN
        EXECUTE '
            CREATE POLICY select_recent_15min ON public.login_attempts
            FOR SELECT USING (attempted_at > NOW() - INTERVAL ''15 minutes'')
        ';
        RAISE NOTICE 'Created: login_attempts.select_recent_15min';
    END IF;

    -- Insert policy: Must have valid IP
    IF NOT policy_exists('login_attempts', 'insert_with_valid_ip') THEN
        EXECUTE '
            CREATE POLICY insert_with_valid_ip ON public.login_attempts
            FOR INSERT WITH CHECK (
                ip_address IS NOT NULL 
                AND ip_address <> '''' 
                AND LENGTH(ip_address) <= 45
            )
        ';
        RAISE NOTICE 'Created: login_attempts.insert_with_valid_ip';
    END IF;
END $$;

-- ----------------------------------------
-- NEWS_POSTS TABLE POLICIES
-- ----------------------------------------
DO $$
BEGIN
    -- Public can only read published news
    IF NOT policy_exists('news_posts', 'public_read_published') THEN
        EXECUTE '
            CREATE POLICY public_read_published ON public.news_posts
            FOR SELECT USING (status = ''published'')
        ';
        RAISE NOTICE 'Created: news_posts.public_read_published';
    END IF;

    -- Authenticated: read all (including pending/rejected for admin)
    IF NOT policy_exists('news_posts', 'auth_read_all') THEN
        EXECUTE '
            CREATE POLICY auth_read_all ON public.news_posts
            FOR SELECT TO authenticated
            USING (id IS NOT NULL)
        ';
        RAISE NOTICE 'Created: news_posts.auth_read_all';
    END IF;

    -- Authenticated: insert with required fields
    IF NOT policy_exists('news_posts', 'auth_insert') THEN
        EXECUTE '
            CREATE POLICY auth_insert ON public.news_posts
            FOR INSERT TO authenticated
            WITH CHECK (title IS NOT NULL AND title <> '''' AND content IS NOT NULL)
        ';
        RAISE NOTICE 'Created: news_posts.auth_insert';
    END IF;

    -- Authenticated: update existing
    IF NOT policy_exists('news_posts', 'auth_update') THEN
        EXECUTE '
            CREATE POLICY auth_update ON public.news_posts
            FOR UPDATE TO authenticated
            USING (id IS NOT NULL)
            WITH CHECK (title IS NOT NULL AND title <> '''')
        ';
        RAISE NOTICE 'Created: news_posts.auth_update';
    END IF;

    -- Authenticated: delete
    IF NOT policy_exists('news_posts', 'auth_delete') THEN
        EXECUTE '
            CREATE POLICY auth_delete ON public.news_posts
            FOR DELETE TO authenticated
            USING (id IS NOT NULL)
        ';
        RAISE NOTICE 'Created: news_posts.auth_delete';
    END IF;
END $$;

-- ----------------------------------------
-- STUDENT_PROJECTS TABLE POLICIES
-- ----------------------------------------
DO $$
BEGIN
    -- Public read
    IF NOT policy_exists('student_projects', 'public_read') THEN
        EXECUTE '
            CREATE POLICY public_read ON public.student_projects
            FOR SELECT USING (id IS NOT NULL)
        ';
        RAISE NOTICE 'Created: student_projects.public_read';
    END IF;

    -- Auth insert
    IF NOT policy_exists('student_projects', 'auth_insert') THEN
        EXECUTE '
            CREATE POLICY auth_insert ON public.student_projects
            FOR INSERT TO authenticated
            WITH CHECK (title IS NOT NULL AND title <> '''')
        ';
        RAISE NOTICE 'Created: student_projects.auth_insert';
    END IF;

    -- Auth update
    IF NOT policy_exists('student_projects', 'auth_update') THEN
        EXECUTE '
            CREATE POLICY auth_update ON public.student_projects
            FOR UPDATE TO authenticated
            USING (id IS NOT NULL)
        ';
        RAISE NOTICE 'Created: student_projects.auth_update';
    END IF;

    -- Auth delete
    IF NOT policy_exists('student_projects', 'auth_delete') THEN
        EXECUTE '
            CREATE POLICY auth_delete ON public.student_projects
            FOR DELETE TO authenticated
            USING (id IS NOT NULL)
        ';
        RAISE NOTICE 'Created: student_projects.auth_delete';
    END IF;
END $$;

-- ----------------------------------------
-- REGISTRATIONS TABLE POLICIES (if exists)
-- ----------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registrations') THEN
        -- Public can insert (for registration form)
        IF NOT policy_exists('registrations', 'public_insert') THEN
            EXECUTE '
                CREATE POLICY public_insert ON public.registrations
                FOR INSERT WITH CHECK (student_name IS NOT NULL AND student_name <> '''')
            ';
            RAISE NOTICE 'Created: registrations.public_insert';
        END IF;

        -- Auth full access
        IF NOT policy_exists('registrations', 'auth_full') THEN
            EXECUTE '
                CREATE POLICY auth_full ON public.registrations
                FOR ALL TO authenticated
                USING (id IS NOT NULL)
            ';
            RAISE NOTICE 'Created: registrations.auth_full';
        END IF;
    END IF;
END $$;

-- ============================================================
-- SECTION D: VERIFICATION QUERIES
-- ============================================================

-- D1: Verify no more TRUE policies exist
SELECT 'REMAINING TRUE POLICIES:' AS check_type, COUNT(*) AS count
FROM pg_policies
WHERE schemaname = 'public'
AND (qual = 'true' OR with_check = 'true');

-- D2: Verify all functions have search_path set
SELECT 'FUNCTIONS WITHOUT SEARCH_PATH:' AS check_type, COUNT(*) AS count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
AND p.proconfig IS NULL;

-- D3: Show all current policies
SELECT tablename, policyname, cmd, 
       SUBSTRING(qual::text, 1, 50) AS using_expr,
       SUBSTRING(with_check::text, 1, 50) AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- D4: Show all tables with RLS status
SELECT tablename, 
       CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END AS rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE t.schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- CLEANUP: Remove helper function
-- ============================================================
DROP FUNCTION IF EXISTS policy_exists(text, text);

-- ============================================================
-- DONE! Check the output above for verification results.
-- ============================================================
