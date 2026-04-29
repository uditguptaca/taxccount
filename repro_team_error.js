const { getDb } = require('./src/lib/db');
const { v4: uuidv4 } = require('uuid');

async function reproduce() {
  const db = getDb();
  const orgId = 'org_singh_cpa'; // Wait, what is the ID of Singh CPA?
  // I need to find the ID from the DB
  const org = await db.prepare("SELECT id FROM organizations WHERE slug = 'dynamic-audit'").get();
  if (!org) {
    console.log('Org not found');
    return;
  }
  const oid = org.id;
  console.log('Org ID:', oid);

  try {
    const teamId = uuidv4();
    await db.prepare(`
      INSERT INTO teams (id, org_id, name, description, manager_id, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    `).run(teamId, oid, 'Reproduction Team ' + Date.now(), 'Test', null);
    console.log('Success!');
  } catch (err) {
    console.error('Failed:', err);
  }
}

reproduce().catch(console.error);
