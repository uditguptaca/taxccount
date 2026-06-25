const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function check() {
  const sql = postgres(dbUrl);
  const forms = await sql`SELECT * FROM smart_forms`;
  console.log('Forms:', forms);
  process.exit(0);
}

check();
