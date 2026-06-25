const postgres = require('postgres');
const { join } = require('path');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function fix() {
  const sql = postgres(dbUrl);
  try {
    await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS original_currency TEXT`;
    console.log('Added original_currency to invoices');
    await sql`ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS original_currency TEXT`;
    console.log('Added original_currency to client_compliances');
    await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ`;
    console.log('Added conversion_date to invoices');
    await sql`ALTER TABLE client_compliances ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ`;
    console.log('Added conversion_date to client_compliances');
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
fix();
