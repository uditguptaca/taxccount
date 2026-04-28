const fs = require('fs');
const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT || (match ? match[1].trim().replace(/^"|"$/g, '') : null);

const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function testInsert() {
  try {
    const orgId = await sql`SELECT id FROM organizations LIMIT 1`;
    const adminId = await sql`SELECT id FROM users LIMIT 1`;
    const templateId = uuidv4();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO compliance_templates (id, org_id, name, code, description, category, default_price, assignee_type, created_by, created_at, updated_at)
      VALUES (${templateId}, ${orgId[0].id}, 'Q4 Review', 'Q4', 'test', 'General', 100, 'unassigned', ${adminId[0].id}, ${now}, ${now})
    `;
    console.log('Success!');

    console.log('Success!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}
testInsert();
