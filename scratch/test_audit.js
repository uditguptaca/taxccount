require('dotenv').config({ path: '.env.local' });
const { logActivity } = require('./src/lib/audit');
const { getDb } = require('./src/lib/db');

async function test() {
  try {
    const db = getDb();
    const org = await db.prepare('SELECT id FROM organizations LIMIT 1').get();
    const user = await db.prepare('SELECT id FROM users LIMIT 1').get();

    if (!org || !user) {
      console.log('No org or user found');
      return;
    }

    console.log('Testing logActivity with Org:', org.id, 'User:', user.id);
    
    await logActivity({
      orgId: org.id,
      actorId: user.id,
      action: 'test_audit_log',
      entityType: 'system',
      entityId: 'system',
      entityName: 'Test Verification',
      details: 'This is a test audit log entry.'
    });

    const recentActivities = await db.prepare('SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 1').all();
    console.log('Latest Activity:', recentActivities);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
