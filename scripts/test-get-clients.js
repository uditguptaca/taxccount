const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function check() {
  const sql = postgres(dbUrl, { max: 1 });
  try {
    const orgId = 'c2e0a6d7-d82e-4955-a33b-5582ef02db9a';
    const clients = await sql`
      SELECT c.*, ctc.name as client_type_name
      FROM clients c 
      LEFT JOIN client_types_config ctc ON ctc.id = c.client_type_id
      WHERE c.org_id = ${orgId}
    `;
    console.log(clients.map(c => ({ id: c.id, display_name: c.display_name, client_type: c.client_type, client_type_name: c.client_type_name })));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
