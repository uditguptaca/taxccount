const Database = require('better-sqlite3');
const db = new Database('./taxccount.db');

const stmt = db.prepare(`
  UPDATE document_files 
  SET document_category = 'Client Supporting Documents' 
  WHERE document_category NOT IN ('Onboarding Documents', 'Client Supporting Documents', 'Signed Documents', 'Final Documents')
`);
const info = stmt.run();
console.log(`Migrated ${info.changes} legacy documents to standard buckets.`);
