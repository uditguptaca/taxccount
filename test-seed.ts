import { v4 as uuidv4 } from 'uuid';
import { getDb } from './src/lib/db';

async function test() {
  const db = getDb();
  const orgId = 'test-org-123'; // Assuming a test org
  
  db.exec('BEGIN');
  try {
    const defaultId = uuidv4();
    const now = new Date().toISOString();
    
    console.log('Inserting into checklist_library...');
    db.prepare(`INSERT INTO checklist_library (id, org_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`).run(defaultId, orgId, 'Generic Default Document Checklist', 'Standard compliance documents required for most templates', now, now);
    
    const defaultItems = [
      { name: 'Incorporation Documents', category: 'client_supporting' },
      { name: 'Previous Year Tax Returns', category: 'client_supporting' },
      { name: 'Notice of Assessment', category: 'client_supporting' },
      { name: 'Financial Statements', category: 'client_supporting' },
      { name: 'Bank Statements', category: 'client_supporting' },
      { name: 'Payroll Summary', category: 'client_supporting' },
      { name: 'Signed Engagement Letter', category: 'firm_working_paper' },
      { name: 'Signed Authorization Form', category: 'firm_working_paper' },
    ];
    
    const insertItem = db.prepare(`INSERT INTO checklist_library_items (id, org_id, checklist_id, document_name, document_category, is_mandatory, upload_required, upload_by, client_visible, staff_only, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    let sortOrder = 1;
    for (const item of defaultItems) {
      console.log('Inserting item...', item.name);
      insertItem.run(uuidv4(), orgId, defaultId, item.name, item.category, 1, 1, 'client', 1, item.category === 'firm_working_paper' ? 1 : 0, sortOrder++, now, now);
    }
    db.exec('COMMIT');
    console.log('Successfully committed!');
  } catch (err) {
    if (db.inTransaction) db.exec('ROLLBACK');
    console.error('Error occurred:', err);
  }
}
test();
