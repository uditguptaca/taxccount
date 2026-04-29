const { getDb } = require('./src/lib/db');

async function check() {
  const db = getDb();
  const org = await db.prepare("SELECT id, name FROM organizations WHERE slug = 'dynamic-audit'").get();
  if (!org) { console.log('Org not found'); return; }
  console.log('Org:', org.name, '(', org.id, ')');

  const teams = await db.prepare("SELECT * FROM teams WHERE org_id = ?").all(org.id);
  console.log('Teams:', JSON.stringify(teams, null, 2));
}

check().catch(console.error);
