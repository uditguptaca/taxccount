import { getDb } from '../src/lib/db';
import { v4 as uuidv4 } from 'uuid';

export function fillEmptyData() {
  const db = getDb();
  console.log('Filling empty spots with dummy data...');
  const now = new Date().toISOString();

  // 1. Find all personal consultants
  const consultants = db.prepare('SELECT * FROM personal_consultants').all();
  consultants.forEach((c: any) => {
    const assignedCount = db.prepare('SELECT COUNT(*) as count FROM personal_compliance_items WHERE assigned_consultant_id = ?').get(c.id) as any;
    if (assignedCount.count === 0) {
      console.log(`Adding dummy data for consultant: ${c.name}`);
      const itemId1 = uuidv4();
      const itemId2 = uuidv4();
      db.prepare(`
        INSERT INTO personal_compliance_items 
        (id, user_id, org_id, title, category, description, due_date, status, urgency, assigned_consultant_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(itemId1, c.user_id, c.org_id, 'Annual Strategy Review', 'financial', 'Review financial and compliance strategy with consultant', '2026-10-15', 'pending', 'green', c.id, now, now);
      
      db.prepare(`
        INSERT INTO personal_compliance_items 
        (id, user_id, org_id, title, category, description, due_date, status, urgency, assigned_consultant_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(itemId2, c.user_id, c.org_id, 'Document Handover', 'documents_ids', 'Provide requested identity documents securely', '2026-05-01', 'in_progress', 'yellow', c.id, now, now);
    }
  });

  // 2. Find all family members
  const family = db.prepare('SELECT * FROM personal_family_members').all();
  family.forEach((f: any) => {
    const assignedCount = db.prepare('SELECT COUNT(*) as count FROM personal_family_compliance WHERE family_member_id = ?').get(f.id) as any;
    if (assignedCount.count === 0) {
      console.log(`Adding dummy data for family member: ${f.name}`);
      db.prepare(`
        INSERT INTO personal_family_compliance 
        (id, family_member_id, user_id, org_id, title, category, description, due_date, status, urgency, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), f.id, f.user_id, f.org_id, 'Passport Check', 'documents_ids', 'Verify passport expiration date', '2026-07-20', 'pending', 'green', now, now);
      
      db.prepare(`
        INSERT INTO personal_family_compliance 
        (id, family_member_id, user_id, org_id, title, category, description, due_date, status, urgency, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), f.id, f.user_id, f.org_id, 'Medical Checkup', 'medical', 'Schedule annual general checkup', '2025-11-10', 'pending', 'red', now, now);
    }
  });

  // 3. Find all entities
  const entities = db.prepare('SELECT * FROM personal_entities').all();
  entities.forEach((e: any) => {
    const assignedCount = db.prepare('SELECT COUNT(*) as count FROM personal_entity_compliance WHERE entity_id = ?').get(e.id) as any;
    if (assignedCount.count === 0) {
      console.log(`Adding dummy data for entity: ${e.name}`);
      db.prepare(`
        INSERT INTO personal_entity_compliance 
        (id, entity_id, user_id, org_id, title, category, description, due_date, status, urgency, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), e.id, e.user_id, e.org_id, 'Annual Return Filing', 'tax_filing', 'Provincial annual return for the entity', '2026-04-30', 'in_progress', 'yellow', now, now);
      
      db.prepare(`
        INSERT INTO personal_entity_compliance 
        (id, entity_id, user_id, org_id, title, category, description, due_date, status, urgency, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), e.id, e.user_id, e.org_id, 'Board Minutes Preparation', 'documents_ids', 'Prepare and sign annual resolution', '2026-12-31', 'pending', 'green', now, now);
    }
  });

  console.log('Dummy data fill complete!');
}

fillEmptyData();
