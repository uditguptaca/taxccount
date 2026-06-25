-- Migration: 005_smart_forms.sql
-- Description: Creates 15 tables for the Smart Forms module including versions, questions, conditions, responses, and settings.

-- 1. smart_form_categories (Taxonomy)
CREATE TABLE IF NOT EXISTS smart_form_categories (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    country TEXT NOT NULL,
    compliance_type TEXT NOT NULL,
    sub_compliance TEXT,
    category_name TEXT NOT NULL,
    parent_id TEXT, -- For nested categories
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. smart_forms
CREATE TABLE IF NOT EXISTS smart_forms (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    form_code TEXT,
    description TEXT,
    country TEXT,
    compliance_type TEXT,
    category_id TEXT,
    tags TEXT,
    current_version TEXT,
    status TEXT DEFAULT 'Active', -- Active, Draft, Archived
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 3. smart_form_versions
CREATE TABLE IF NOT EXISTS smart_form_versions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    form_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Published, Archived
    created_at TEXT NOT NULL,
    published_at TEXT,
    created_by TEXT,
    FOREIGN KEY (form_id) REFERENCES smart_forms(id) ON DELETE CASCADE
);

-- 4. smart_form_sections
CREATE TABLE IF NOT EXISTS smart_form_sections (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 1,
    is_conditional INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE
);

-- 5. smart_form_questions
CREATE TABLE IF NOT EXISTS smart_form_questions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    section_id TEXT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- text, currency, date, checkbox, file, signature, repeater
    description TEXT,
    is_required INTEGER DEFAULT 0,
    options TEXT, -- JSON array of options
    validation_rules TEXT, -- JSON object
    placeholder TEXT,
    help_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 1,
    is_ai_assisted INTEGER DEFAULT 0,
    ocr_mapping_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES smart_form_sections(id) ON DELETE CASCADE
);

-- 6. smart_form_conditions
CREATE TABLE IF NOT EXISTS smart_form_conditions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'question' or 'section'
    target_id TEXT NOT NULL,
    depends_on_question_id TEXT NOT NULL,
    operator TEXT NOT NULL, -- equals, not_equals, contains, greater_than, etc.
    value TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'show', -- show, hide
    created_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE
);

-- 7. smart_form_documents
CREATE TABLE IF NOT EXISTS smart_form_documents (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    document_name TEXT NOT NULL,
    description TEXT,
    is_mandatory INTEGER DEFAULT 1,
    accepted_types TEXT,
    sort_order INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE
);

-- 8. smart_form_ocr_maps
CREATE TABLE IF NOT EXISTS smart_form_ocr_maps (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    ocr_field_name TEXT NOT NULL, -- e.g., 'Box 14'
    confidence_threshold REAL DEFAULT 0.8,
    created_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES smart_form_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES smart_form_questions(id) ON DELETE CASCADE
);

-- 9. smart_form_ai_rules
CREATE TABLE IF NOT EXISTS smart_form_ai_rules (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- anomaly_detection, follow_up, missing_data
    configuration TEXT NOT NULL, -- JSON
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE
);

-- 10. smart_form_assignments
CREATE TABLE IF NOT EXISTS smart_form_assignments (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    form_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    project_id TEXT,
    template_id TEXT,
    assigned_by TEXT,
    status TEXT DEFAULT 'Not started', -- Not started, In progress, Awaiting docs, Under review, Needs revision, Completed
    assigned_at TEXT NOT NULL,
    due_date TEXT,
    completed_at TEXT,
    FOREIGN KEY (form_id) REFERENCES smart_forms(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES smart_form_versions(id) ON DELETE CASCADE
);

-- 11. smart_form_responses
CREATE TABLE IF NOT EXISTS smart_form_responses (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    assignment_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    status TEXT DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected
    submitted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (assignment_id) REFERENCES smart_form_assignments(id) ON DELETE CASCADE
);

-- 12. smart_form_response_items
CREATE TABLE IF NOT EXISTS smart_form_response_items (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    response_id TEXT NOT NULL,
    question_id TEXT, -- Null if document upload
    document_id TEXT, -- Null if question answer
    answer_value TEXT, -- The text, JSON string, or file URL
    ai_confidence REAL,
    is_flagged INTEGER DEFAULT 0,
    flag_reason TEXT,
    staff_status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (response_id) REFERENCES smart_form_responses(id) ON DELETE CASCADE
);

-- 13. smart_form_review_logs
CREATE TABLE IF NOT EXISTS smart_form_review_logs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    response_id TEXT NOT NULL,
    item_id TEXT, -- Optional, if logging a specific item
    reviewer_id TEXT NOT NULL,
    action TEXT NOT NULL, -- Approved, Rejected, Clarification Requested
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (response_id) REFERENCES smart_form_responses(id) ON DELETE CASCADE
);

-- 14. smart_form_question_bank
CREATE TABLE IF NOT EXISTS smart_form_question_bank (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options TEXT,
    validation_rules TEXT,
    ocr_mapping_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES smart_form_categories(id) ON DELETE CASCADE
);

-- 15. smart_form_analytics
CREATE TABLE IF NOT EXISTS smart_form_analytics (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    form_id TEXT NOT NULL,
    total_assigned INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    average_completion_time_seconds INTEGER DEFAULT 0,
    abandonment_count INTEGER DEFAULT 0,
    last_calculated_at TEXT NOT NULL,
    FOREIGN KEY (form_id) REFERENCES smart_forms(id) ON DELETE CASCADE
);
