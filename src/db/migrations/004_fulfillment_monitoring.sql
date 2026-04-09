-- ══════════════════════════════════════════════════════════════════
-- FULFILLMENT & MONITORING MODULE — Migration 004
-- Submission tracking, field-level data capture, and penalty logs
-- ══════════════════════════════════════════════════════════════════

-- ── User Compliance Submissions ─────────────────────────────────
-- Tracks aggregate submission for a compliance vault item
CREATE TABLE IF NOT EXISTS user_compliance_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  compliance_item_id TEXT NOT NULL REFERENCES personal_compliance_items(id),
  selected_compliance_id TEXT REFERENCES user_selected_compliances(id),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK(status IN ('pending_review','accepted','rejected','revision_requested')),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewer_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── User Submission Data ────────────────────────────────────────
-- Individual field-level data mapping back to sm_info_fields
CREATE TABLE IF NOT EXISTS user_submission_data (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES user_compliance_submissions(id) ON DELETE CASCADE,
  info_field_id TEXT NOT NULL REFERENCES sm_info_fields(id),
  value_text TEXT,
  value_file_url TEXT,
  value_file_name TEXT,
  value_file_size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Compliance Penalties Log ────────────────────────────────────
-- Chronological accumulation of late penalties against a vault item
CREATE TABLE IF NOT EXISTS compliance_penalties_log (
  id TEXT PRIMARY KEY,
  compliance_item_id TEXT NOT NULL REFERENCES personal_compliance_items(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  base_penalty_id TEXT REFERENCES sm_penalties(id),
  sub_compliance_id TEXT REFERENCES sm_sub_compliances(id),
  penalty_description TEXT,
  penalty_type TEXT NOT NULL DEFAULT 'fixed',
  days_late INTEGER NOT NULL DEFAULT 0,
  calculated_amount REAL NOT NULL DEFAULT 0,
  last_calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ucs_user ON user_compliance_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ucs_item ON user_compliance_submissions(compliance_item_id);
CREATE INDEX IF NOT EXISTS idx_usd_submission ON user_submission_data(submission_id);
CREATE INDEX IF NOT EXISTS idx_usd_field ON user_submission_data(info_field_id);
CREATE INDEX IF NOT EXISTS idx_cpl_item ON compliance_penalties_log(compliance_item_id);
CREATE INDEX IF NOT EXISTS idx_cpl_user ON compliance_penalties_log(user_id);
