const { join } = require('path');
const postgres = require('postgres');
const fs = require('fs');
const envStr = fs.readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function migrate() {
  const sql = postgres(dbUrl);
  try {
    await sql.unsafe(fs.readFileSync('src/db/migrations/008_ledgerflow.sql', 'utf8'));
    console.log('Migration 008 applied');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

migrate();
