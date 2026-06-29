-- Migration 014: Corporate Secretary Tables

CREATE TABLE IF NOT EXISTS cs_corporations (
  id TEXT PRIMARY KEY, -- Same as company_id / client_id
  org_id TEXT NOT NULL REFERENCES organizations(id),
  legal_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  incorporation_number TEXT,
  business_number TEXT,
  incorporation_date TEXT,
  fiscal_year_end TEXT,
  corp_type TEXT NOT NULL,
  registered_office TEXT,
  records_office TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  articles_summary TEXT,
  bylaws_version TEXT,
  language TEXT DEFAULT 'en',
  gst_hst_registered INTEGER DEFAULT 0,
  payroll_registered INTEGER DEFAULT 0,
  import_export_registered INTEGER DEFAULT 0,
  extra_provincial_registrations TEXT,
  created_at TEXT NOT NULL DEFAULT NOW(),
  updated_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_persons (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_entity INTEGER NOT NULL DEFAULT 0,
  date_of_birth TEXT,
  tax_id TEXT,
  linked_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_directors (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  person_id TEXT NOT NULL REFERENCES cs_persons(id),
  appointed_date TEXT NOT NULL,
  ceased_date TEXT,
  consent_doc_id TEXT,
  is_resident_canadian INTEGER NOT NULL DEFAULT 1,
  term_notes TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_officers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  person_id TEXT NOT NULL REFERENCES cs_persons(id),
  title TEXT NOT NULL,
  appointed_date TEXT NOT NULL,
  ceased_date TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_share_classes (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  series TEXT,
  authorized_count TEXT NOT NULL DEFAULT 'unlimited',
  votes_per_share INTEGER DEFAULT 1,
  dividend_rights TEXT,
  liquidation_preference DOUBLE PRECISION DEFAULT 0.0,
  liquidation_multiple DOUBLE PRECISION DEFAULT 1.0,
  participating INTEGER DEFAULT 0,
  conversion_terms TEXT,
  redemption_terms TEXT,
  is_voting INTEGER NOT NULL DEFAULT 1,
  par_value DOUBLE PRECISION,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_share_issuances (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  holder_id TEXT NOT NULL REFERENCES cs_persons(id),
  share_class_id TEXT NOT NULL REFERENCES cs_share_classes(id),
  quantity BIGINT NOT NULL,
  price_per_share DOUBLE PRECISION NOT NULL,
  consideration TEXT,
  issue_date TEXT NOT NULL,
  certificate_number TEXT,
  is_uncertificated INTEGER DEFAULT 0,
  vesting_schedule_id TEXT,
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_share_transfers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  transferor_id TEXT NOT NULL REFERENCES cs_persons(id),
  transferee_id TEXT NOT NULL REFERENCES cs_persons(id),
  share_class_id TEXT NOT NULL REFERENCES cs_share_classes(id),
  quantity BIGINT NOT NULL,
  price_per_share DOUBLE PRECISION NOT NULL,
  consideration TEXT,
  transfer_date TEXT NOT NULL,
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_share_repurchases (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  holder_id TEXT NOT NULL REFERENCES cs_persons(id),
  share_class_id TEXT NOT NULL REFERENCES cs_share_classes(id),
  quantity BIGINT NOT NULL,
  price_per_share DOUBLE PRECISION NOT NULL,
  repurchase_date TEXT NOT NULL,
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_convertibles (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  holder_id TEXT NOT NULL REFERENCES cs_persons(id),
  convertible_type TEXT NOT NULL,
  principal DOUBLE PRECISION NOT NULL,
  valuation_cap DOUBLE PRECISION,
  discount_rate DOUBLE PRECISION,
  interest_rate DOUBLE PRECISION,
  maturity_date TEXT,
  conversion_trigger TEXT,
  status TEXT NOT NULL DEFAULT 'outstanding',
  resulting_issuance_id TEXT,
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_vesting_schedules (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  vesting_type TEXT NOT NULL,
  cliff_months INTEGER DEFAULT 0,
  total_months INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  acceleration_terms TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_option_plans (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  pool_size BIGINT NOT NULL,
  share_class_id TEXT NOT NULL REFERENCES cs_share_classes(id),
  board_approval_date TEXT,
  plan_doc_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_option_grants (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  option_plan_id TEXT NOT NULL REFERENCES cs_option_plans(id),
  grantee_id TEXT NOT NULL REFERENCES cs_persons(id),
  quantity BIGINT NOT NULL,
  exercise_price DOUBLE PRECISION NOT NULL,
  grant_date TEXT NOT NULL,
  vesting_schedule_id TEXT REFERENCES cs_vesting_schedules(id),
  expiry_date TEXT,
  early_exercise INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'granted',
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_option_exercises (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  option_grant_id TEXT NOT NULL REFERENCES cs_option_grants(id),
  quantity BIGINT NOT NULL,
  exercise_date TEXT NOT NULL,
  amount_paid DOUBLE PRECISION NOT NULL,
  resulting_issuance_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_corporate_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  event_type TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT NOW(),
  reverses_event_id TEXT
);

CREATE TABLE IF NOT EXISTS cs_resolutions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  resolution_type TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  signatures_json TEXT,
  source_event_id TEXT REFERENCES cs_corporate_events(id),
  minute_book_section TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_meetings (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  meeting_type TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  notice_doc_id TEXT,
  quorum_details TEXT,
  attendees_json TEXT,
  minutes_doc_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_filings (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  jurisdiction TEXT NOT NULL,
  filing_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  period TEXT,
  due_date TEXT,
  submitted_date TEXT,
  confirmation_ref TEXT,
  package_doc_id TEXT,
  source_event_id TEXT REFERENCES cs_corporate_events(id),
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_compliance_tasks (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assignee_id TEXT REFERENCES users(id),
  related_filing_id TEXT,
  recurring_rule TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_document_templates (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  jurisdiction_scope TEXT,
  body_en TEXT NOT NULL,
  body_fr TEXT,
  merge_fields_json TEXT,
  is_addon INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_generated_documents (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  template_id TEXT REFERENCES cs_document_templates(id),
  name TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  pdf_doc_id TEXT,
  language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'draft',
  minute_book_section TEXT,
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_isc_register_entries (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  person_id TEXT NOT NULL REFERENCES cs_persons(id),
  nature_of_control TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  last_reviewed_date TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_audit_entries (
  id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES organizations(id),
  actor_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cs_corporate_changes (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  company_id TEXT NOT NULL REFERENCES clients(id),
  change_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  effective_date TEXT,
  payload_json TEXT NOT NULL,
  progress_pct INTEGER DEFAULT 0,
  signers_json TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()
);
