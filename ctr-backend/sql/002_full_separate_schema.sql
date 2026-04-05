-- Full separated schema for CTR
-- This is a standalone design script for production-style organization.
-- It does not replace 001_init.sql unless you choose to adopt it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS ctr_auth;
CREATE SCHEMA IF NOT EXISTS ctr_core;
CREATE SCHEMA IF NOT EXISTS ctr_ops;
CREATE SCHEMA IF NOT EXISTS ctr_audit;

-- =========================
-- ctr_auth
-- =========================

CREATE TABLE IF NOT EXISTS ctr_auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'user')),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_users_role ON ctr_auth.users(role);
CREATE INDEX IF NOT EXISTS idx_auth_users_active ON ctr_auth.users(is_active);

CREATE TABLE IF NOT EXISTS ctr_auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ctr_auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON ctr_auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON ctr_auth.sessions(expires_at);

-- =========================
-- ctr_core
-- =========================

CREATE TABLE IF NOT EXISTS ctr_core.trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ctr_auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES ctr_auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  reviewer_comment TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_core_trials_user ON ctr_core.trials(user_id);
CREATE INDEX IF NOT EXISTS idx_core_trials_status ON ctr_core.trials(status);
CREATE INDEX IF NOT EXISTS idx_core_trials_submitted ON ctr_core.trials(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_core_trials_data_gin ON ctr_core.trials USING GIN (data);

CREATE TABLE IF NOT EXISTS ctr_core.trial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES ctr_core.trials(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES ctr_auth.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_core_trial_reviews_trial ON ctr_core.trial_reviews(trial_id, created_at DESC);

-- =========================
-- ctr_ops
-- =========================

CREATE TABLE IF NOT EXISTS ctr_ops.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ctr_auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_notifications_user ON ctr_ops.notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ctr_ops.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retries INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ops_email_outbox_status ON ctr_ops.email_outbox(status, created_at);

-- =========================
-- ctr_audit
-- =========================

CREATE TABLE IF NOT EXISTS ctr_audit.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES ctr_auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,     -- e.g. 'trial', 'user'
  entity_id UUID,
  event_name TEXT NOT NULL,      -- e.g. 'trial.approved'
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON ctr_audit.events(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON ctr_audit.events(actor_user_id, created_at DESC);

-- =========================
-- Useful view
-- =========================

CREATE OR REPLACE VIEW ctr_core.public_approved_trials AS
SELECT
  t.id,
  t.status,
  t.approved_at,
  t.created_at,
  t.updated_at,
  t.data ->> 'title' AS title,
  t.data ->> 'briefSummary' AS brief_summary,
  t.data ->> 'trialDesign' AS trial_design,
  t.data ->> 'recruitmentCentreCity' AS recruitment_centre_city,
  t.data ->> 'contactEmail' AS contact_email
FROM ctr_core.trials t
WHERE t.status = 'approved';
