const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;
process.env.DATABASE_URL_DIRECT = dbUrl;

async function check() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  const sql = postgres(DATABASE_URL, { max: 1 });
  const clients = await sql`SELECT id, display_name, client_type, org_id FROM clients`;
  console.log('Clients:', clients);
  const orgs = await sql`SELECT id, name, slug FROM organizations`;
  console.log('Orgs:', orgs);
  process.exit(0);
}

check();
