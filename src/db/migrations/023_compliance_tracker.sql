-- The free compliance checker: what a person keeps once they register.
-- A "profile" is one person or business they checked (country, state, entity type, their answers).
-- Its filings are ordinary items in the person's compliance vault (so the dashboard, calendar and reminders
-- already show them), tagged with the profile and the filing they came from.

CREATE TABLE IF NOT EXISTS compliance_tracker_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  org_id TEXT,
  label TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  kind TEXT NOT NULL,
  depts TEXT NOT NULL,
  answers TEXT NOT NULL,
  pack_version TEXT,
  vault_entity_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ctp_user ON compliance_tracker_profiles(user_id);

ALTER TABLE personal_compliance_items ADD COLUMN IF NOT EXISTS tracker_profile_id TEXT;
ALTER TABLE personal_compliance_items ADD COLUMN IF NOT EXISTS tracker_compliance_id TEXT;
ALTER TABLE personal_compliance_items ADD COLUMN IF NOT EXISTS tracker_meta TEXT;
ALTER TABLE personal_entity_compliance ADD COLUMN IF NOT EXISTS tracker_profile_id TEXT;
ALTER TABLE personal_entity_compliance ADD COLUMN IF NOT EXISTS tracker_compliance_id TEXT;
ALTER TABLE personal_entity_compliance ADD COLUMN IF NOT EXISTS tracker_meta TEXT;
CREATE INDEX IF NOT EXISTS idx_pci_tracker ON personal_compliance_items(tracker_profile_id);
CREATE INDEX IF NOT EXISTS idx_pec_tracker ON personal_entity_compliance(tracker_profile_id);

-- Every filing a person marked as done, kept when the item rolls forward to its next due date.
CREATE TABLE IF NOT EXISTS compliance_tracker_history (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES compliance_tracker_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  compliance_id TEXT NOT NULL,
  title TEXT,
  period TEXT,
  due_date TEXT,
  completed_at TEXT NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cth_profile ON compliance_tracker_history(profile_id);
