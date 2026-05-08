-- =============================================
-- Migration v2 — Run in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- =============================================

-- ─────────────────────────────────────────────
-- 1. MEMBERS TABLE (fan club users)
--    Ensure all required columns exist
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
  id            UUID PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  email         TEXT,
  total_points  INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS username     TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS email        TEXT,
  ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────
-- 2. EVENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  points          INTEGER NOT NULL DEFAULT 0,
  icon            TEXT DEFAULT '⭐',
  category_id     UUID REFERENCES public.point_categories(id) ON DELETE SET NULL,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  max_per_user    INTEGER,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  condition_label TEXT,
  condition_value NUMERIC,
  condition_unit  TEXT,
  multiplier      NUMERIC NOT NULL DEFAULT 1,
  is_accumulation BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS multiplier      NUMERIC NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_accumulation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────
-- 3. POINT CATEGORIES — add is_active
-- ─────────────────────────────────────────────
ALTER TABLE public.point_categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ─────────────────────────────────────────────
-- 4. POINT TRANSACTIONS — add event_id + base_points
--    and fix FK to reference members (not profiles)
-- ─────────────────────────────────────────────
ALTER TABLE public.point_transactions
  ADD COLUMN IF NOT EXISTS event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS base_points INTEGER;

-- ─────────────────────────────────────────────
-- 5. Fix trigger: update members.total_points
--    (old schema updated profiles, which doesn't exist)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.members
  SET
    total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM public.point_transactions
      WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_point_transaction_insert ON public.point_transactions;
CREATE TRIGGER on_point_transaction_insert
  AFTER INSERT ON public.point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_total_points();

-- ─────────────────────────────────────────────
-- 6. DONATION ACCUMULATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donation_accumulations (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id            UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  event_id           UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  accumulated_amount NUMERIC NOT NULL DEFAULT 0,
  milestones_earned  INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- ─────────────────────────────────────────────
-- 7. REWARDS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rewards (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL DEFAULT 'merchandise',
  icon            TEXT NOT NULL DEFAULT '🎁',
  points_required INTEGER NOT NULL,
  stock           INTEGER,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_limited      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. REDEMPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.redemptions (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  reward_id    UUID REFERENCES public.rewards(id) ON DELETE RESTRICT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  points_spent INTEGER NOT NULL,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. ACCUMULATION LOGS — per-entry history
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accumulation_logs (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  event_id   UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  amount     NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accumulation_logs_user_event
  ON public.accumulation_logs(user_id, event_id);

-- ─────────────────────────────────────────────
-- 10. ADMIN USERS — add role + permissions columns
-- ─────────────────────────────────────────────
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role        TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';

-- Set the first admin as super_admin
UPDATE public.admin_users
SET role = 'super_admin'
WHERE username = 'admin' AND role = 'admin';
