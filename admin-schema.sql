-- =============================================
-- LBNK48 Sisaster Sites - Admin Schema
-- Run this AFTER supabase-schema.sql
-- =============================================

-- =============================================
-- ADMIN USERS TABLE
-- Stores admin credentials (password hashed with bcrypt)
-- =============================================
CREATE TABLE public.admin_users (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username              TEXT UNIQUE NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,          -- bcrypt hash (cost factor 12)
  display_name          TEXT,
  is_active             BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,      -- for account lockout
  locked_until          TIMESTAMPTZ,            -- null = not locked
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS: accessed exclusively via service-role key (server-side only)

-- =============================================
-- ADMIN SESSIONS TABLE
-- Stores session token hashes (SHA-256 of raw cookie token)
-- Raw token lives only in the HTTP-only cookie; DB stores the hash
-- =============================================
CREATE TABLE public.admin_sessions (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id     UUID REFERENCES public.admin_users(id) ON DELETE CASCADE NOT NULL,
  token_hash   TEXT UNIQUE NOT NULL,            -- SHA-256(raw_token)
  expires_at   TIMESTAMPTZ NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session lookup
CREATE INDEX idx_admin_sessions_token_hash ON public.admin_sessions(token_hash);
CREATE INDEX idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- No RLS: accessed exclusively via service-role key

-- =============================================
-- AUTO-CLEANUP: expire old sessions
-- Run periodically or via pg_cron if available
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED: Create first admin user
-- Password: Admin@LBNK48  (change immediately after first login!)
-- bcrypt hash generated with cost factor 12
-- =============================================
-- To generate a new hash, run in Node.js:
--   const bcrypt = require('bcryptjs');
--   console.log(await bcrypt.hash('your_password', 12));
--
-- Default password below: Admin@LBNK48
INSERT INTO public.admin_users (username, email, password_hash, display_name)
VALUES (
  'admin',
  'admin@sisastersites.com',
  '$2b$12$8ZzNrpxAY5fL8hx/z2p.m.VZafxtvvLjGDiy8EhJ5NmM6wxMP8b6y',
  'Super Admin'
);
-- NOTE: The hash above corresponds to password "Admin@LBNK48"
-- Change it after first login via the admin panel or by running:
--   UPDATE admin_users SET password_hash = '<new_bcrypt_hash>' WHERE username = 'admin';
