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
  
  const migrationPath = join(process.cwd(), 'src', 'db', 'migrations', '005_smart_forms.sql');
  let migrationSql = readFileSync(migrationPath, 'utf-8');
  
  // Strip all comments
  migrationSql = migrationSql.replace(/--.*$/gm, '');
  
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  console.log(`Executing ${statements.length} statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await sql.unsafe(statements[i]);
      console.log(`✅ Statement ${i + 1} successful`);
    } catch (e) {
      console.error(`❌ Statement ${i + 1} failed:`, e.message);
      console.error(statements[i]);
      process.exit(1);
    }
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

run();
