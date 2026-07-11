const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;
process.env.DATABASE_URL_DIRECT = dbUrl;

async function check() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  const sql = postgres(DATABASE_URL, { max: 1 });
  const clients = await sql`SELECT id, display_name, client_type FROM clients WHERE org_id = 'c2e0a6d7-d82e-4955-a33b-5582ef02db9a'`;
  console.log('Clients for Taxccount:', clients);
  process.exit(0);
}

check();
