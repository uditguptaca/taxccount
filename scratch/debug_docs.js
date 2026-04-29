const { getDb } = require('./src/lib/db');

async function test() {
  const db = getDb();
  try {
    const orgId = 'c2e0a6d7-d82e-4955-a33b-5582ef02db9a'; // from logs
    const results = await db.prepare(`
      SELECT df.*, c.display_name as client_name, c.client_code,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        cc.engagement_code, ct.name as template_name
      FROM document_files df
      JOIN clients c ON df.client_id = c.id
      JOIN users u ON df.uploaded_by = u.id
      LEFT JOIN client_compliances cc ON df.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE df.org_id = ?
      ORDER BY df.created_at DESC
    `).all(orgId);
    console.log('Results:', results.length);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
