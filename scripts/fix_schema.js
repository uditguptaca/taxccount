// Fix the schema and re-add migration 003 properly
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
let s = fs.readFileSync(schemaPath, 'utf8');

// Remove the bad escaped lines at end
s = s.replace(/\\n--.*$/s, '');

// Add migration 003 properly
s += `
-- Migration 003: Updated sm_questions with additional dependency columns
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS country_id TEXT REFERENCES sm_countries(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS state_id TEXT REFERENCES sm_states(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS entity_type_id TEXT REFERENCES sm_entity_types(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS department_id TEXT REFERENCES sm_departments(id);
ALTER TABLE sm_questions ADD COLUMN IF NOT EXISTS compliance_head_id TEXT REFERENCES sm_compliance_heads(id);

CREATE INDEX IF NOT EXISTS idx_sm_questions_country ON sm_questions(country_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_state ON sm_questions(state_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_entity ON sm_questions(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_sm_questions_dept ON sm_questions(department_id);
`;

fs.writeFileSync(schemaPath, s, 'utf8');
console.log('Schema fixed. Length:', s.length);
