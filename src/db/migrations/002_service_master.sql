-- ══════════════════════════════════════════════════════════════════
-- SERVICE MASTER MODULE — Migration 002
-- Platform-level compliance catalog + user selection tables
-- ══════════════════════════════════════════════════════════════════

-- ── Reference Tables (Steps 1-4) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS sm_countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iso_code TEXT UNIQUE,
  financial_year_end_default TEXT,
  fy_is_fixed INTEGER NOT NULL DEFAULT 0,
  calendar_year_end TEXT DEFAULT '12-31',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sm_states (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES sm_countries(id),
  name TEXT NOT NULL,
  code TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS sm_entity_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sm_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Service Master Core Tables (Steps 5-9) ──────────────────────

CREATE TABLE IF NOT EXISTS sm_compliance_heads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  icon TEXT,
  color_code TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sm_sub_compliances (
  id TEXT PRIMARY KEY,
  compliance_head_id TEXT NOT NULL REFERENCES sm_compliance_heads(id),
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  brief TEXT,
  has_compliance_date INTEGER NOT NULL DEFAULT 1,
  dependency_type TEXT,
  dependency_label TEXT,
  period_type TEXT,
  period_value INTEGER DEFAULT 1,
  grace_value INTEGER DEFAULT 0,
  grace_unit TEXT,
  is_compulsory INTEGER NOT NULL DEFAULT 0,
  undertaking_required INTEGER NOT NULL DEFAULT 0,
  undertaking_text TEXT,
  quick_create_enabled INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sm_service_rules (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  country_id TEXT REFERENCES sm_countries(id),
  state_id TEXT REFERENCES sm_states(id),
  entity_type_id TEXT REFERENCES sm_entity_types(id),
  department_id TEXT REFERENCES sm_departments(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Step 12: Applicability Questions ─────────────────────────────

CREATE TABLE IF NOT EXISTS sm_questions (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'yes_no' CHECK(question_type IN ('yes_no','text','number','select','date')),
  description TEXT,
  is_compulsory_trigger INTEGER NOT NULL DEFAULT 0,
  trigger_value TEXT,
  triggers_sub_compliance_id TEXT REFERENCES sm_sub_compliances(id),
  threshold_context TEXT,
  parent_question_id TEXT REFERENCES sm_questions(id),
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Step 10: Information Requisition Form Fields ─────────────────

CREATE TABLE IF NOT EXISTS sm_info_fields (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK(field_type IN ('text','number','date','date_month','attachment','checkbox','textarea','select','undertaking')),
  is_required INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Step 13: Penalties ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sm_penalties (
  id TEXT PRIMARY KEY,
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  description TEXT NOT NULL,
  penalty_type TEXT NOT NULL DEFAULT 'fixed' CHECK(penalty_type IN ('fixed','percentage','per_day','progressive','custom')),
  amount REAL,
  rate REAL,
  max_amount REAL,
  details TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── User-Facing Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_compliance_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  country_id TEXT REFERENCES sm_countries(id),
  state_id TEXT REFERENCES sm_states(id),
  entity_type_id TEXT REFERENCES sm_entity_types(id),
  company_name TEXT,
  business_number TEXT,
  gst_number TEXT,
  payroll_number TEXT,
  directors TEXT,
  contact_person TEXT,
  address TEXT,
  financial_year_end_income_tax TEXT,
  incorporation_date_federal TEXT,
  incorporation_date_provincial TEXT,
  financial_year_end_gst TEXT,
  financial_year_end_payroll TEXT,
  additional_dates TEXT,
  discovery_method TEXT CHECK(discovery_method IN ('auto_discovery','manual_selection')),
  undertaking_accepted INTEGER NOT NULL DEFAULT 0,
  undertaking_accepted_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_selected_compliances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT NOT NULL REFERENCES user_compliance_profiles(id),
  sub_compliance_id TEXT NOT NULL REFERENCES sm_sub_compliances(id),
  service_rule_id TEXT REFERENCES sm_service_rules(id),
  selection_method TEXT NOT NULL DEFAULT 'manual' CHECK(selection_method IN ('compulsory','auto_suggested','manual')),
  base_date TEXT,
  calculated_due_date TEXT,
  confirmed_due_date TEXT,
  recurrence_type TEXT,
  calculation_formula TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','completed')),
  personal_compliance_item_id TEXT REFERENCES personal_compliance_items(id),
  undertaking_accepted INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_question_answers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT NOT NULL REFERENCES user_compliance_profiles(id),
  question_id TEXT NOT NULL REFERENCES sm_questions(id),
  answer_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_info_responses (
  id TEXT PRIMARY KEY,
  selected_compliance_id TEXT NOT NULL REFERENCES user_selected_compliances(id),
  info_field_id TEXT NOT NULL REFERENCES sm_info_fields(id),
  response_text TEXT,
  response_file_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sm_states_country ON sm_states(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_sub_comp_head ON sm_sub_compliances(compliance_head_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_sub ON sm_service_rules(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_country ON sm_service_rules(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_state ON sm_service_rules(state_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_entity ON sm_service_rules(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_sm_rules_dept ON sm_service_rules(department_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_sub ON sm_questions(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_parent ON sm_questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_sm_info_fields_sub ON sm_info_fields(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_sm_penalties_sub ON sm_penalties(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_user_comp_profiles_user ON user_compliance_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_user ON user_selected_compliances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_sub ON user_selected_compliances(sub_compliance_id);
CREATE INDEX IF NOT EXISTS idx_user_sel_comp_profile ON user_selected_compliances(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_q_answers_profile ON user_question_answers(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_info_resp_sel ON user_info_responses(selected_compliance_id);
