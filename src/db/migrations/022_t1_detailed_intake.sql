-- Detailed T1 intake: answer history, saved language and form version, uploaded documents that
-- carry their slip details, and review items that can be matched instead of repeated.
-- Nothing is dropped: answers given under the earlier, shorter form stay where they are.

ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS catalogue_version TEXT;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS row_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS current_step TEXT;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS last_saved_by TEXT;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS last_saved_at TEXT;
-- the list screen reads these instead of recomputing every form: they are refreshed on every save
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS progress_pct INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS open_blocking INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tax_intake_engagements ADD COLUMN IF NOT EXISTS open_flags INTEGER NOT NULL DEFAULT 0;

-- Each answer remembers how many times it was changed so two people editing at once cannot overwrite each other unseen.
ALTER TABLE tax_intake_responses ADD COLUMN IF NOT EXISTS row_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tax_intake_responses ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE tax_intake_responses ADD COLUMN IF NOT EXISTS catalogue_version TEXT;

-- Every change to an answer, kept for good: who, when, what it was, what it became.
CREATE TABLE IF NOT EXISTS tax_intake_response_history (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL REFERENCES tax_intake_engagements(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  record_index INTEGER NOT NULL DEFAULT 0,
  value TEXT,
  flag TEXT,
  flag_note TEXT,
  action TEXT NOT NULL DEFAULT 'set',          -- set | removed
  changed_by TEXT,
  changed_by_role TEXT,
  catalogue_version TEXT,
  changed_at TEXT NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ti_history_engagement ON tax_intake_response_history(engagement_id, question_id, record_index);

-- A record (one T4, one dependant, one property) that the client removed stays listed, marked removed.
ALTER TABLE tax_intake_repeat_records ADD COLUMN IF NOT EXISTS removed_at TEXT;
ALTER TABLE tax_intake_repeat_records ADD COLUMN IF NOT EXISTS removed_by TEXT;

-- Uploaded files: the bytes live in document_blobs through document_files; this row says what the file IS.
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS document_file_id TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS doc_key TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS issuer TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS tax_year TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS slip_status TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS uploaded_by TEXT;
ALTER TABLE tax_intake_documents ADD COLUMN IF NOT EXISTS preparer_note TEXT;
CREATE INDEX IF NOT EXISTS idx_ti_documents_hash ON tax_intake_documents(engagement_id, content_hash);

-- Review items: one per problem. The same finding never creates a second row.
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS severity TEXT;
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'preparer';   -- rule | client | preparer
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS module_code TEXT;
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS specialist TEXT;
ALTER TABLE tax_intake_review_items ADD COLUMN IF NOT EXISTS updated_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ti_review_dedupe ON tax_intake_review_items(engagement_id, dedupe_key) WHERE dedupe_key IS NOT NULL;

-- Frozen submissions say which questionnaire version and language the client saw.
ALTER TABLE tax_intake_submissions ADD COLUMN IF NOT EXISTS catalogue_version TEXT;
ALTER TABLE tax_intake_submissions ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE tax_intake_submissions ADD COLUMN IF NOT EXISTS findings_json TEXT;

-- The "T1 Personal Income Tax Return" template is now run by the detailed T1 engine: say so on its card.
UPDATE smart_forms SET description = 'Detailed Canadian T1 intake in English and French: adapts to each client, covers every income, deduction and credit area, all 13 provinces and territories and Québec, collects slips box by box with their documents, and gives the preparer an organized file with open items. It collects information only and never files a return.' WHERE form_code = 'CAN-T1-INTAKE';
