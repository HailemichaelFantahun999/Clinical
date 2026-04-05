-- Align legacy databases with the schema expected by the current backend.
-- Safe to run multiple times.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (registration_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trials_assigned_reviewer ON trials(assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_trials_reviewed_by ON trials(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);
