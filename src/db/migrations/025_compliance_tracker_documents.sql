-- "My compliances": the papers a person keeps with a compliance (the filed return, the receipt, a notice).
-- The bytes live in Neon like every other upload. A file is tied to the saved check and the compliance,
-- not to the row of one period, so it stays when the item rolls forward to its next due date.
CREATE TABLE IF NOT EXISTS compliance_tracker_documents (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES compliance_tracker_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  compliance_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  content BYTEA NOT NULL,
  created_at TEXT NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ctd_profile ON compliance_tracker_documents(profile_id, user_id);
