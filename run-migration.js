const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;
process.env.DATABASE_URL_DIRECT = dbUrl;

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  if (!DATABASE_URL) {
    console.error('No DATABASE_URL found');
    process.exit(1);
  }
  
  const sql = postgres(DATABASE_URL, { max: 1 });
  
  const migrationPath = join(process.cwd(), 'src', 'db', 'migrations', '003_checklist_library.sql');
  let migrationSql = readFileSync(migrationPath, 'utf-8');
  
  // Strip all comments
  migrationSql = migrationSql.replace(/--.*$/gm, '');
  
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  console.log(`Found ${statements.length} statements. Executing...`);
  
  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log(`✓ ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
    } catch (err) {
      if (err.message?.includes('already exists') || err.message?.includes('42701') || err.message?.includes('42P07')) {
        console.log(`⚠ SKIPPED (already exists): ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
      } else {
        console.error(`✗ ERROR: ${err.message} — ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
      }
    }
  }
  console.log('Migration complete.');
  process.exit(0);
}

run();
