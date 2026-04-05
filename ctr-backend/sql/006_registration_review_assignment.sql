-- Run after 001_init (and any other applied migrations). Adds admin approval for self-registered users
-- and per-trial reviewer assignment.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (registration_status IN ('pending', 'approved', 'rejected'));

-- Existing rows keep default 'approved'.

ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS assigned_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trials_assigned_reviewer ON trials(assigned_reviewer_id);
