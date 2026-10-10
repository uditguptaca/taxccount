#!/usr/bin/env node
/**
 * Install the schema on a PostgreSQL database, or bring an older one up to
 * date. The app does this by itself on its first query; this script does the
 * same ahead of time, or lets you check a database by hand.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/db-setup.js
 *   node --env-file=.env.local scripts/db-setup.js
 */
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const {
  DATABASE_URL_VARS, resolveDatabaseUrl, connectionTarget,
  BASE_SCHEMA_NAME, isPostgresMigrationFile, installSchema,
} = require('../src/db/setup');

const url = resolveDatabaseUrl(process.env);
if (!url) {
  console.error(`No connection string found. Set one of: ${DATABASE_URL_VARS.join(', ')}`);
  process.exit(1);
}

const dbDir = path.join(__dirname, '..', 'src', 'db');
const migrationsDir = path.join(dbDir, 'migrations');
const units = [
  { name: BASE_SCHEMA_NAME, sql: fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8') },
  ...fs.readdirSync(migrationsDir)
    .filter(isPostgresMigrationFile)
    .sort()
    .map((name) => ({ name, sql: fs.readFileSync(path.join(migrationsDir, name), 'utf8') })),
];

(async () => {
  const target = connectionTarget(url, { max: 1 });
  const sql = postgres(target.url, target.options);
  try {
    console.log(`Connecting to ${new URL(url).hostname} …`);
    await installSchema(sql, units, { log: (line) => console.log(line) });
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(`Done. ${n} tables in the database.`);
  } catch (err) {
    console.error('Setup failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();
