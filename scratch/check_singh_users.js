const { getDb } = require('./src/lib/db');

async function check() {
  const db = getDb();
  const users = await db.prepare(`
    SELECT u.id, u.email, om.org_id, u.role
    FROM users u
    JOIN organization_memberships om ON u.id = om.user_id
    WHERE om.org_id = ?
  `).all('org_singh_cpa');
  console.log('Singh CPA Users:', JSON.stringify(users, null, 2));
}

check().catch(console.error);
