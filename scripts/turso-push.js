#!/usr/bin/env node
/**
 * Push the local SQLite schema to a remote Turso database.
 * 
 * Usage:
 *   TURSO_DATABASE_URL=libsql://your-db.turso.io TURSO_AUTH_TOKEN=xxx node scripts/turso-push.js
 * 
 * This reads all migration SQL files and applies them to the remote Turso DB.
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables.');
    console.error('   Usage: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=xxx node scripts/turso-push.js');
    process.exit(1);
  }

  const { createClient } = require('@libsql/client');
  const client = createClient({ url, authToken: token });

  console.log(`🔌 Connected to Turso: ${url}`);

  // Create migrations table
  await client.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, executed_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

  // Read migration files
  const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  console.log(`📂 Found ${files.length} migration file(s)`);

  // Check what's already applied
  const result = await client.execute('SELECT name FROM schema_migrations');
  const applied = new Set(result.rows.map(r => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭  ${file} (already applied)`);
      continue;
    }

    console.log(`  ▶  Applying ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err) {
        // Ignore "already exists" errors for idempotent migrations
        if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
          continue;
        }
        console.error(`    ⚠ Statement error: ${err.message}`);
      }
    }

    await client.execute({ sql: 'INSERT INTO schema_migrations (name) VALUES (?)', args: [file] });
    console.log(`  ✅ ${file} applied`);
  }

  console.log('\n✅ All migrations applied to Turso!');
  console.log('💡 Now set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your Vercel project settings.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
