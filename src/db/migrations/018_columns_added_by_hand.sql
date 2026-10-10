-- Columns the code reads and writes that no earlier schema file created. They
-- were added by hand to the old Supabase database, so a new database lacked
-- them. Types follow how the code uses each one (for example the clients
-- insert casts ?::jsonb and ?::boolean).
-- PostgreSQL. Applied once by the app (see src/db/setup.js).

-- Billing: recording a payment on an invoice.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TEXT;

-- Accounting / payroll prototype: a ledger carries a display name.
ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS name TEXT;

-- Clients: corporate secretary enrolment.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS has_secretarial BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS enrolled_compliances JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS secretarial_data JSONB;

-- Documents: automatic tags and text extraction.
ALTER TABLE document_files ADD COLUMN IF NOT EXISTS auto_tags TEXT;
ALTER TABLE document_files ADD COLUMN IF NOT EXISTS ocr_status TEXT;
ALTER TABLE document_files ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- Inbox, chat and notifications.
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived INTEGER DEFAULT 0;

-- Smart forms: the code keeps ONE ROW PER ANSWER in smart_form_responses and
-- records the staff review on that row (smart_form_response_items is unused).
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS question_id TEXT;
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS response_value TEXT;
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS responded_by TEXT;
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS is_approved INTEGER DEFAULT 0;
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS staff_notes TEXT;
ALTER TABLE smart_form_responses ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
-- the per-answer insert does not supply a client (the assignment already names it)
ALTER TABLE smart_form_responses ALTER COLUMN client_id DROP NOT NULL;

-- Project documents link back to the template document they came from.
ALTER TABLE engagement_doc_requirements ADD COLUMN IF NOT EXISTS template_doc_id TEXT;

-- Multi-currency: the date the conversion rate applied.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS conversion_date TEXT;
ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS conversion_date TEXT;

-- Settings > Checklists.
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS checklist_code TEXT;
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS is_default INTEGER DEFAULT 0;
ALTER TABLE checklist_library ADD COLUMN IF NOT EXISTS deleted_at TEXT;
