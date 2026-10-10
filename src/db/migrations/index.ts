// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA UNITS — what the app installs on a fresh database, in order
// ═══════════════════════════════════════════════════════════════════════════
//
// src/db/schema.sql goes first, then every Postgres migration in this folder
// by file name. Add a migration by dropping a new NNN_name.sql here: it is
// picked up automatically, applied once, and recorded in schema_migrations.
// The three SQLite-only files are skipped (see SQLITE_ONLY_MIGRATIONS in
// ../setup.js for why).
//
// `require.context` is a webpack feature and each .sql file is bundled as a
// string (rule in next.config.mjs), so the SQL ships inside the serverless
// function. Reading the files from disk at runtime does not work on Vercel.

import baseSchema from '../schema.sql';
import { BASE_SCHEMA_NAME, isPostgresMigrationFile } from '../setup';

export interface SqlUnit {
  name: string;
  sql: string;
}

const context = require.context('./', false, /\.sql$/);

function asString(loaded: unknown): string {
  if (typeof loaded === 'string') return loaded;
  const maybe = loaded as { default?: unknown };
  if (maybe && typeof maybe.default === 'string') return maybe.default;
  throw new Error('A .sql file did not bundle as a string; check the webpack rule in next.config.mjs');
}

const migrations: SqlUnit[] = context
  .keys()
  .map((key) => key.replace(/^\.\//, ''))
  .filter(isPostgresMigrationFile)
  .sort()
  .map((name) => ({ name, sql: asString(context(`./${name}`)) }));

if (migrations.length === 0) {
  throw new Error('No Postgres migration files were bundled from src/db/migrations');
}

export const SCHEMA_UNITS: SqlUnit[] = [{ name: BASE_SCHEMA_NAME, sql: asString(baseSchema) }, ...migrations];
