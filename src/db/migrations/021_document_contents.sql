-- Uploaded files live in Neon, next to the rows that describe them.
-- Before this, uploads were written to the web server's disk, which on Vercel
-- is read-only and wiped between requests, so no upload could survive.
-- One row per document: the bytes themselves. Deleting a document deletes its bytes.

CREATE TABLE IF NOT EXISTS document_blobs (
  document_id TEXT PRIMARY KEY REFERENCES document_files(id) ON DELETE CASCADE,
  content BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deleting a document must not be blocked by rows that point at it:
--   document_versions  -> goes away with the document
--   chat_messages.attachment_file_id and organizer_answers.document_file_id -> just forget the file
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname, rel.relname AS tbl, att.attname AS col
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_class ref ON ref.oid = con.confrelid
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f' AND ref.relname = 'document_files' AND rel.relname <> 'document_blobs'
      AND array_length(con.conkey, 1) = 1
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.tbl, r.conname);
    IF r.tbl = 'document_versions' THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES document_files(id) ON DELETE CASCADE', r.tbl, r.conname, r.col);
    ELSE
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES document_files(id) ON DELETE SET NULL', r.tbl, r.conname, r.col);
    END IF;
  END LOOP;
END $$;
