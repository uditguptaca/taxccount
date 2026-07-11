const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function check() {
  const sql = postgres(dbUrl, { max: 1 });
  try {
    const users = await sql`SELECT id, email, first_name, last_name, role FROM users LIMIT 10`;
    console.log('--- USERS ---');
    console.log(users);

    const clients = await sql`SELECT id, display_name, client_type, portal_user_id, org_id FROM clients LIMIT 10`;
    console.log('--- CLIENTS ---');
    console.log(clients);

    const orgs = await sql`SELECT id, slug, name FROM organizations`;
    console.log('--- ORGANIZATIONS ---');
    console.log(orgs);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
