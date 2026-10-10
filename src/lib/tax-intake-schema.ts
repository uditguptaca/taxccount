// ═══════════════════════════════════════════════════════════════════════════
// TAX INTAKE SYSTEM — Database Schema
// The tables for the Canadian T1 Tax Intake Module live in
// src/db/migrations/016_tax_intake.sql (PostgreSQL). The text below is the
// original SQLite-style draft, kept for reference only; nothing runs it.
// ═══════════════════════════════════════════════════════════════════════════

export const TAX_INTAKE_SCHEMA = `
-- ─── Engagements (one per client × tax year) ──────────────────────────
CREATE TABLE IF NOT EXISTS tax_intake_engagements (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT,
  taxpayer_name TEXT,
  tax_year TEXT NOT NULL DEFAULT '2025',
  filing_type TEXT NOT NULL DEFAULT 'original',
  province TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  assigned_preparer_id TEXT,
  assigned_reviewer_id TEXT,
  active_modules TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  submitted_at TEXT,
  reviewed_at TEXT,
  due_date TEXT,
  portal_token TEXT UNIQUE,
  UNIQUE(org_id, client_id, tax_year, filing_type)
);

-- ─── Responses (per engagement × question × record index) ──────────
CREATE TABLE IF NOT EXISTS tax_intake_responses (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  record_index INTEGER NOT NULL DEFAULT 0,
  value TEXT,
  flag TEXT,
  flag_note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(engagement_id, question_id, record_index),
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Documents (uploaded files linked to questions) ──────────────────
CREATE TABLE IF NOT EXISTS tax_intake_documents (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  question_id TEXT,
  section_id TEXT,
  record_index INTEGER NOT NULL DEFAULT 0,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER DEFAULT 0,
  storage_key TEXT,
  upload_status TEXT DEFAULT 'pending',
  ocr_status TEXT DEFAULT 'none',
  ocr_data TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  verified_at TEXT,
  verified_by TEXT,
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Repeat Records (e.g., multiple T4s, dependants, properties) ────
CREATE TABLE IF NOT EXISTS tax_intake_repeat_records (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  record_index INTEGER NOT NULL,
  label TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(engagement_id, section_id, record_index),
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Review Items (preparer flags, client questions, issues) ─────────
CREATE TABLE IF NOT EXISTS tax_intake_review_items (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  question_id TEXT,
  record_index INTEGER DEFAULT 0,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  client_note TEXT,
  preparer_note TEXT,
  resolved_at TEXT,
  resolved_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Preparer Notes (internal, not visible to client) ─────────────────
CREATE TABLE IF NOT EXISTS tax_intake_preparer_notes (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  question_id TEXT,
  section_id TEXT,
  note TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Submission Snapshots (frozen copies of client submissions) ──────
CREATE TABLE IF NOT EXISTS tax_intake_submissions (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  snapshot_data TEXT NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now')),
  submitted_by TEXT,
  client_acknowledgements TEXT,
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Module Activation Log (which modules are active per engagement) ─
CREATE TABLE IF NOT EXISTS tax_intake_module_state (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  module_code TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  activated_at TEXT DEFAULT (datetime('now')),
  activated_by TEXT,
  UNIQUE(engagement_id, module_code),
  FOREIGN KEY (engagement_id) REFERENCES tax_intake_engagements(id)
);

-- ─── Indexes for performance ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ti_responses_engagement ON tax_intake_responses(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ti_responses_question ON tax_intake_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_ti_documents_engagement ON tax_intake_documents(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ti_review_engagement ON tax_intake_review_items(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ti_repeat_engagement ON tax_intake_repeat_records(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ti_submissions_engagement ON tax_intake_submissions(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ti_engagements_org ON tax_intake_engagements(org_id);
CREATE INDEX IF NOT EXISTS idx_ti_engagements_client ON tax_intake_engagements(client_id);
CREATE INDEX IF NOT EXISTS idx_ti_engagements_token ON tax_intake_engagements(portal_token);
`;

/**
 * Kept so existing callers still compile. The tables are created by
 * src/db/migrations/016_tax_intake.sql, which the app applies once on the
 * first request (see src/db/setup.js). Nothing is created here any more: this
 * file used to run SQLite-style SQL on every request, which PostgreSQL rejects.
 */
export function initTaxIntakeSchema(_db?: unknown): void {
  // intentionally empty
}
