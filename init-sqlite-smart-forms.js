const Database = require('better-sqlite3');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(join(process.cwd(), 'abidebylaw.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS smart_form_categories (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'file-text',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_forms (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  form_code TEXT,
  description TEXT,
  current_version TEXT,
  country TEXT,
  compliance_type TEXT,
  category_id TEXT,
  tags TEXT,
  status TEXT DEFAULT 'Active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_form_versions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'Draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  published_at TEXT,
  changelog TEXT
);

CREATE TABLE IF NOT EXISTS smart_form_sections (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 1,
  is_conditional INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_form_questions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  description TEXT,
  help_text TEXT,
  placeholder TEXT,
  is_required INTEGER DEFAULT 0,
  options TEXT,
  validation_rules TEXT,
  sort_order INTEGER DEFAULT 1,
  is_ai_assisted INTEGER DEFAULT 0,
  ocr_mapping_key TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_form_documents (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  section_id TEXT,
  document_name TEXT NOT NULL,
  description TEXT,
  is_mandatory INTEGER DEFAULT 0,
  file_types_allowed TEXT,
  max_size_mb INTEGER DEFAULT 10,
  ocr_template_key TEXT,
  ocr_confidence_threshold REAL DEFAULT 0.8,
  sort_order INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_form_analytics (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  total_assigned INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  avg_completion_minutes REAL DEFAULT 0,
  dropoff_question_id TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smart_form_assignments (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  engagement_id TEXT,
  status TEXT DEFAULT 'Pending',
  assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  due_date TEXT,
  completed_at TEXT,
  portal_token TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS smart_form_responses (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  response_value TEXT,
  ai_confidence_score REAL,
  verified_by_user INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

console.log('✅ Created SQLite Smart Form tables in abidebylaw.db');

// Check if org exists
const org = db.prepare('SELECT id FROM organizations LIMIT 1').get();
if (!org) {
  console.log('No org found in abidebylaw.db');
  process.exit(0);
}
const orgId = org.id;
const now = new Date().toISOString();

// Check if T1 form exists
const existingForm = db.prepare("SELECT id FROM smart_forms WHERE form_code = 'CAN-T1-INTAKE'").get();
if (!existingForm) {
  const formId = uuidv4();
  const versionId = uuidv4();
  
  db.prepare(`
    INSERT INTO smart_forms (id, org_id, name, form_code, description, current_version, country, compliance_type, status, created_at, updated_at)
    VALUES (?, ?, 'T1 Individual Tax Return', 'CAN-T1-INTAKE', 'CRA Auto-fill ready intake stepper featuring 36 structured boxes, personal profiles, and historical carryforwards.', ?, 'Canada', 'Direct Tax', 'Active', ?, ?)
  `).run(formId, orgId, versionId, now, now);

  db.prepare(`
    INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at)
    VALUES (?, ?, ?, 1, 'Published', ?)
  `).run(versionId, orgId, formId, now);

  const sec1 = uuidv4();
  db.prepare(`
    INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
    VALUES (?, ?, ?, 'Personal Profile & Identification', 'Basic taxpayer details for CRA identification', 1, ?)
  `).run(sec1, orgId, versionId, now);

  db.prepare(`
    INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, is_required, sort_order, created_at, updated_at)
    VALUES 
    (?, ?, ?, ?, 'Social Insurance Number (SIN)', 'text', 1, 1, ?, ?),
    (?, ?, ?, ?, 'Date of Birth', 'date', 1, 2, ?, ?),
    (?, ?, ?, ?, 'Marital Status on Dec 31', 'select', 1, 3, ?, ?)
  `).run(uuidv4(), orgId, versionId, sec1, now, now, uuidv4(), orgId, versionId, sec1, now, now, uuidv4(), orgId, versionId, sec1, now, now);

  const sec2 = uuidv4();
  db.prepare(`
    INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
    VALUES (?, ?, ?, 'T4 Employment Income Slips', 'Upload your employment T4 slips', 2, ?)
  `).run(sec2, orgId, versionId, now);

  db.prepare(`
    INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
    VALUES 
    (?, ?, ?, ?, 'Upload T4 Slip (Box 14 Income, Box 22 Tax Withheld)', 'file', 'Upload PDF/image of your T4 slip from employer', 1, 1, 1, 'T4', ?, ?),
    (?, ?, ?, ?, 'Upload T5 Slip (Investment Income & Dividends)', 'file', 'Upload T5 slip if you earned bank interest or dividends', 0, 2, 1, 'T5', ?, ?)
  `).run(uuidv4(), orgId, versionId, sec2, now, now, uuidv4(), orgId, versionId, sec2, now, now);

  console.log('✅ Seeded T1 Form in abidebylaw.db');
} else {
  console.log('T1 Form already present in abidebylaw.db');
}

process.exit(0);
