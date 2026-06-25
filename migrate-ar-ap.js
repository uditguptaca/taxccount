const { join } = require('path');
const postgres = require('postgres');
const fs = require('fs');

const envStr = fs.readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function runMigration() {
  const sql = postgres(dbUrl);
  try {
    const migrationFile = join(process.cwd(), 'src', 'db', 'migrations', '009_ledgerflow_ar_ap.sql');
    const queries = fs.readFileSync(migrationFile, 'utf8');
    
    // Simple split by ; and run. Not perfect but works for CREATE TABLE
    const statements = queries.split(';').filter(q => q.trim().length > 0);
    for (const stmt of statements) {
      console.log('Running:', stmt.substring(0, 50) + '...');
      await sql.unsafe(stmt);
    }
    console.log('Migration completed successfully.');
  } catch(e) {
    console.error('Migration failed:', e);
  } finally {
    process.exit(0);
  }
}

runMigration();
