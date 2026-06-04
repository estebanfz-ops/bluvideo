-- =============================================================================
-- BluVideo OS — Phase 1 Initial Schema
-- Migration: 20260603000000_initial_schema.sql
-- Internal use only. Single-team (Bluveo). No multi-tenant complexity.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Post status state machine:
-- draft → in_review → approved → scheduled → published | failed
CREATE TYPE post_status AS ENUM (
  'draft',
  'in_review',
  'approved',
  'scheduled',
  'published',
  'failed'
);

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. profiles — extends auth.users with display name and role
--    Created automatically when a user signs up via Supabase Auth trigger.
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  VARCHAR(255),
  role          user_role NOT NULL DEFAULT 'editor',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. posts — core unit of work: the content piece moving through the pipeline
CREATE TABLE posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Content
  body             TEXT NOT NULL,
  platforms        TEXT[] NOT NULL,              -- e.g. ['instagram', 'linkedin']
  media_urls       TEXT[],                       -- Supabase Storage public URLs
  -- Status machine
  status           post_status NOT NULL DEFAULT 'draft',
  scheduled_for    TIMESTAMPTZ,                  -- When to publish
  published_at     TIMESTAMPTZ,                  -- Set when status → published
  -- Approval (email token for future n8n approval flow)
  approval_token   UUID NOT NULL DEFAULT uuid_generate_v4(),
  approval_sent_at TIMESTAMPTZ,
  -- Authorship
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  -- Soft delete (forward-compat, not used in Phase 1 UI)
  deleted_at       TIMESTAMPTZ,
  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. content_briefs — monthly planning: goals, topics, tone notes
CREATE TABLE content_briefs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_year   VARCHAR(7) NOT NULL,              -- e.g. '2026-06' (YYYY-MM)
  goals        TEXT,                             -- What this month should achieve
  topics       TEXT[],                           -- Key topics / campaigns
  tone_notes   TEXT,                             -- Special tone guidance
  created_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (month_year)                            -- One brief per month
);

-- 4. analytics_logs — manual weekly metrics entry (no third-party API needed)
CREATE TABLE analytics_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_of         DATE NOT NULL,                 -- Monday of the measured week
  platform        VARCHAR(50) NOT NULL,          -- 'instagram', 'linkedin', 'facebook', etc.
  reach           INT NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- Percentage, e.g. 3.45 = 3.45%
  clicks          INT NOT NULL DEFAULT 0,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (week_of, platform)                     -- One entry per week per platform
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Posts: filter by status (kanban board queries) and scheduled date
CREATE INDEX idx_posts_status
  ON posts (status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_posts_status_scheduled
  ON posts (status, scheduled_for)
  WHERE deleted_at IS NULL;

-- Posts: approval token lookup (public n8n webhook, no auth)
CREATE INDEX idx_posts_approval_token
  ON posts (approval_token);

-- Posts: author lookup
CREATE INDEX idx_posts_created_by
  ON posts (created_by);

-- Analytics: lookup by week + platform
CREATE INDEX idx_analytics_week_platform
  ON analytics_logs (week_of DESC, platform);

-- Content briefs: month lookup
CREATE INDEX idx_briefs_month_year
  ON content_briefs (month_year);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at on any row modification.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_briefs_updated_at
  BEFORE UPDATE ON content_briefs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_analytics_updated_at
  BEFORE UPDATE ON analytics_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- When a new user registers via Supabase Auth, create a matching profile row.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'editor'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- Policy: any authenticated user (Bluveo team member) can read and write
-- all rows. No per-user isolation needed — this is a small internal team tool.
-- =============================================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_briefs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs  ENABLE ROW LEVEL SECURITY;

-- ---- profiles ---------------------------------------------------------------

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---- posts ------------------------------------------------------------------

CREATE POLICY "Authenticated users can read all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update any post"
  ON posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete any post"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- ---- content_briefs ---------------------------------------------------------

CREATE POLICY "Authenticated users can read all briefs"
  ON content_briefs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create briefs"
  ON content_briefs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update any brief"
  ON content_briefs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete any brief"
  ON content_briefs FOR DELETE
  TO authenticated
  USING (true);

-- ---- analytics_logs ---------------------------------------------------------

CREATE POLICY "Authenticated users can read all analytics logs"
  ON analytics_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create analytics logs"
  ON analytics_logs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update any analytics log"
  ON analytics_logs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete any analytics log"
  ON analytics_logs FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
