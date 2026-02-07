# 🔒 Supabase Production Security Hardening Guide

## Part 1: SQL Fixes for Security Advisor Warnings

### Fix 1: Function Search Path Mutable

```sql
-- Fix all functions with mutable search path
-- Run this to find affected functions first:
SELECT n.nspname as schema, p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true;

-- Then fix each function by adding search_path:
ALTER FUNCTION public.your_function_name() SET search_path = public;

-- Or recreate with SECURITY INVOKER instead of SECURITY DEFINER:
CREATE OR REPLACE FUNCTION public.your_function_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- function body
  RETURN NEW;
END;
$$;
```

### Fix 2: RLS Always True (Replace Permissive Policies)

```sql
-- ========================================
-- STEP 1: Enable RLS on all tables
-- ========================================
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: Drop all existing permissive policies
-- ========================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ========================================
-- STEP 3: Create non-permissive policies
-- ========================================

-- LOGIN_ATTEMPTS (rate limiting table)
CREATE POLICY "select_recent_attempts" ON public.login_attempts
FOR SELECT USING (attempted_at > NOW() - INTERVAL '15 minutes');

CREATE POLICY "insert_with_ip" ON public.login_attempts
FOR INSERT WITH CHECK (ip_address IS NOT NULL AND ip_address <> '');

-- NEWS_POSTS
CREATE POLICY "public_read_published" ON public.news_posts
FOR SELECT USING (status = 'published');

CREATE POLICY "auth_full_access" ON public.news_posts
FOR ALL TO authenticated
USING (id IS NOT NULL)
WITH CHECK (title IS NOT NULL AND title <> '');

-- STUDENT_PROJECTS
CREATE POLICY "public_read" ON public.student_projects
FOR SELECT USING (id IS NOT NULL);

CREATE POLICY "auth_manage" ON public.student_projects
FOR ALL TO authenticated
USING (id IS NOT NULL)
WITH CHECK (title IS NOT NULL);

-- REGISTRATIONS
CREATE POLICY "public_insert_only" ON public.registrations
FOR INSERT WITH CHECK (student_name IS NOT NULL AND student_name <> '');

CREATE POLICY "auth_full_access" ON public.registrations
FOR ALL TO authenticated
USING (id IS NOT NULL);
```

---

## Part 2: RLS Policy Templates

### Template A: Private Table (User owns their data)

```sql
-- Users can only access their own data
-- Requires: user_id column that references auth.users(id)

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Only own data
CREATE POLICY "Users can view own data"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Only for themselves
CREATE POLICY "Users can insert own data"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only own data
CREATE POLICY "Users can update own data"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Only own data
CREATE POLICY "Users can delete own data"
ON public.user_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Template B: Public Table (Read-only for public)

```sql
-- Public can read, only authenticated can write

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can read published
CREATE POLICY "Public read access"
ON public.articles FOR SELECT
USING (status = 'published' OR auth.uid() IS NOT NULL);

-- INSERT: Authenticated only
CREATE POLICY "Auth insert"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- UPDATE: Only author can update
CREATE POLICY "Author update"
ON public.articles FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

-- DELETE: Only author can delete
CREATE POLICY "Author delete"
ON public.articles FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

### Template C: Admin-Only Table

```sql
-- Only users with admin role can access
-- Requires: is_admin column in user profile or custom claim

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access"
ON public.admin_logs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);
```

---

## Part 3: Production Security Checklist

### ✅ Authentication Security

| Item                                | Status | Action                                     |
| ----------------------------------- | ------ | ------------------------------------------ |
| Disable email confirmations for dev | ⬜     | Dashboard → Auth → Email → Disable confirm |
| Enable email confirmations for prod | ⬜     | Dashboard → Auth → Email → Enable confirm  |
| Set strong password policy          | ⬜     | Min 8 chars, require numbers/symbols       |
| Configure auth rate limiting        | ⬜     | Dashboard → Auth → Rate Limits             |
| Set up custom SMTP                  | ⬜     | Use Resend/SendGrid for production         |
| Enable MFA (optional)               | ⬜     | Dashboard → Auth → Multi-Factor Auth       |

### ✅ API Keys Security

| Item                                        | Status | Action                         |
| ------------------------------------------- | ------ | ------------------------------ |
| Never expose `service_role` key in frontend | ⬜     | Only use in server-side code   |
| Use `anon` key for client-side              | ⬜     | This is safe for public        |
| Rotate keys periodically                    | ⬜     | Dashboard → Settings → API     |
| Set up API key restrictions                 | ⬜     | Limit by domain/IP if possible |

### ✅ Row Level Security (RLS)

| Item                        | Status | Action                                    |
| --------------------------- | ------ | ----------------------------------------- |
| Enable RLS on ALL tables    | ⬜     | `ALTER TABLE x ENABLE ROW LEVEL SECURITY` |
| No `true` or `1=1` policies | ⬜     | Use specific conditions                   |
| Test policies as anon user  | ⬜     | Use Supabase SQL Editor with role         |
| Audit policies quarterly    | ⬜     | Review Security Advisor                   |

### ✅ Storage Security

| Item                              | Status | Action                           |
| --------------------------------- | ------ | -------------------------------- |
| Enable RLS on storage buckets     | ⬜     | Dashboard → Storage → Policies   |
| Set file size limits              | ⬜     | Limit uploads to reasonable size |
| Restrict file types               | ⬜     | Only allow needed MIME types     |
| Use signed URLs for private files | ⬜     | `createSignedUrl()` method       |

### ✅ Database Security

| Item                             | Status | Action                            |
| -------------------------------- | ------ | --------------------------------- |
| Remove unused extensions         | ⬜     | `DROP EXTENSION IF EXISTS x`      |
| Disable `pg_graphql` if not used | ⬜     | Dashboard → Database → Extensions |
| Set up connection pooling        | ⬜     | Use Supavisor for production      |
| Enable SSL enforcement           | ⬜     | Dashboard → Database → SSL        |

### ✅ Next.js Integration

| Item                                | Status | Action                       |
| ----------------------------------- | ------ | ---------------------------- |
| Use Server Actions for mutations    | ⬜     | 'use server' directive       |
| Never import service_role in client | ⬜     | Keep in server-only files    |
| Validate all user inputs            | ⬜     | Zod/Yup validation           |
| Implement CSRF protection           | ⬜     | Built-in with Server Actions |
| Add rate limiting                   | ⬜     | Track attempts in database   |

---

## Quick Copy: Essential Security SQL

```sql
-- Run this once to secure your database
-- =====================================

-- 1. Enable RLS on all public tables
DO $$
DECLARE t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2. Revoke public access to functions
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 3. Only grant specific function access as needed
-- GRANT EXECUTE ON FUNCTION public.specific_function TO authenticated;

-- 4. Secure auth schema
REVOKE ALL ON ALL TABLES IN SCHEMA auth FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA auth FROM anon;
```
