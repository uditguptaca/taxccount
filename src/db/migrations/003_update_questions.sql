PRAGMA foreign_keys=off;

DROP TABLE IF EXISTS sm_questions_new;

CREATE TABLE sm_questions_new (
  id TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'yes_no' CHECK(question_type IN ('yes_no','text','number','select','date')),
  description TEXT,
  
  -- The dependency fields
  country_id TEXT REFERENCES sm_countries(id),
  state_id TEXT REFERENCES sm_states(id),
  entity_type_id TEXT REFERENCES sm_entity_types(id),
  department_id TEXT REFERENCES sm_departments(id),
  compliance_head_id TEXT REFERENCES sm_compliance_heads(id),
  sub_compliance_id TEXT REFERENCES sm_sub_compliances(id), -- made nullable
  
  is_compulsory_trigger INTEGER NOT NULL DEFAULT 0,
  trigger_value TEXT,
  triggers_sub_compliance_id TEXT REFERENCES sm_sub_compliances(id),
  threshold_context TEXT,
  parent_question_id TEXT REFERENCES sm_questions_new(id),
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO sm_questions_new (
  id, question_text, question_type, description, sub_compliance_id,
  is_compulsory_trigger, trigger_value, triggers_sub_compliance_id,
  threshold_context, parent_question_id, options, sort_order, is_active, created_at
)
SELECT 
  id, question_text, question_type, description, sub_compliance_id,
  is_compulsory_trigger, trigger_value, triggers_sub_compliance_id,
  threshold_context, parent_question_id, options, sort_order, is_active, created_at
FROM sm_questions;

DROP TABLE sm_questions;

ALTER TABLE sm_questions_new RENAME TO sm_questions;

CREATE INDEX idx_sm_questions_sub ON sm_questions(sub_compliance_id);
CREATE INDEX idx_sm_questions_parent ON sm_questions(parent_question_id);
CREATE INDEX idx_sm_questions_country ON sm_questions(country_id);
CREATE INDEX idx_sm_questions_state ON sm_questions(state_id);
CREATE INDEX idx_sm_questions_entity ON sm_questions(entity_type_id);
CREATE INDEX idx_sm_questions_dept ON sm_questions(department_id);

PRAGMA foreign_keys=on;
