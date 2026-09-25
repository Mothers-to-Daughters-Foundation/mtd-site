-- MTD Site — Test User Seed Script
-- ===================================
-- Run this in the Supabase SQL editor (https://app.supabase.com → your project → SQL editor).
--
-- This script creates three test accounts with pre-set passwords:
--
--   Role    | Email                      | Password
--   --------|----------------------------|------------------
--   Mentee  | test@mtd.org               | Test1234!
--   Mentor  | mentor@mtd.org             | Test1234!
--   Admin   | admin@mtd.org              | Admin1234!
--
-- ⚠️  IMPORTANT: Change these passwords immediately after your first login in production.
-- ⚠️  This script is safe to run multiple times — it uses ON CONFLICT DO NOTHING.

-- 1. Create auth users
-- Supabase stores auth users in the auth.users table.
-- We insert them with a bcrypt-hashed password and mark email as confirmed.
-- The password hash below corresponds to 'Test1234!' — generate a new one for production.

DO $$
DECLARE
  test_uid   uuid := gen_random_uuid();
  mentor_uid uuid := gen_random_uuid();
  admin_uid  uuid := gen_random_uuid();
BEGIN

  -- ── Mentee (test@mtd.org / Test1234!) ──────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token
  )
  SELECT
    test_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'test@mtd.org',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test Mentee"}'::jsonb,
    false, '', ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@mtd.org'
  );

  -- ── Mentor (mentor@mtd.org / Test1234!) ────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token
  )
  SELECT
    mentor_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'mentor@mtd.org',
    crypt('Test1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test Mentor"}'::jsonb,
    false, '', ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'mentor@mtd.org'
  );

  -- ── Admin (admin@mtd.org / Admin1234!) ─────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token
  )
  SELECT
    admin_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@mtd.org',
    crypt('Admin1234!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"MTD Admin"}'::jsonb,
    false, '', ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@mtd.org'
  );

  -- 2. Create user_profiles rows
  -- Link auth users to the public user_profiles table used by the dashboard.

  INSERT INTO public.user_profiles (id, full_name, role)
  SELECT id, 'Test Mentee', 'mentee'
  FROM auth.users WHERE email = 'test@mtd.org'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (id, full_name, role)
  SELECT id, 'Test Mentor', 'mentor'
  FROM auth.users WHERE email = 'mentor@mtd.org'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (id, full_name, role)
  SELECT id, 'MTD Admin', 'admin'
  FROM auth.users WHERE email = 'admin@mtd.org'
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Verify
SELECT u.email, p.full_name, p.role
FROM auth.users u
JOIN public.user_profiles p ON p.id = u.id
WHERE u.email IN ('test@mtd.org', 'mentor@mtd.org', 'admin@mtd.org');
