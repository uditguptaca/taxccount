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
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('password123', 10);
    const now = new Date().toISOString();

    await sql`
      INSERT INTO users (id, personal_org_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES (${uuidv4()}, ${orgId[0].id}, 'testclient@example.com', ${hash}, 'Test', 'Client', 'client', 1, ${now}, ${now})
      ON CONFLICT (email) DO NOTHING
    `;

    await sql`
      INSERT INTO users (id, personal_org_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES (${uuidv4()}, ${orgId[0].id}, 'ca.uditgupta@gmail.com', ${hash}, 'Udit', 'Gupta', 'client', 1, ${now}, ${now})
      ON CONFLICT (email) DO NOTHING
    `;
    
    console.log('Success! Users inserted.');

    console.log('Success!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}
testInsert();
