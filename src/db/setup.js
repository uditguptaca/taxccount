'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// DATABASE SETUP — shared by the app and the command line
// ═══════════════════════════════════════════════════════════════════════════
//
// Installs the schema on any PostgreSQL database and brings an older one up
// to date. Two callers:
//   - src/lib/db.ts runs it automatically the first time the app touches the
//     database, so a brand-new database (for example one created from the
//     Vercel Storage tab) sets itself up on the first request.
//   - scripts/db-setup.js runs it by hand against DATABASE_URL.
//
// Plain CommonJS so both the Next.js bundle and a bare `node` script load it.

/** Environment variables that may carry the connection string, in the order they are tried. */
const DATABASE_URL_VARS = [
  'DATABASE_URL',              // Neon on Vercel (pooled), Supabase, or anything set by hand
  'POSTGRES_URL',              // the older Vercel Postgres name
  'DATABASE_URL_UNPOOLED',     // Neon on Vercel (direct)
  'POSTGRES_URL_NON_POOLING',  // the older Vercel Postgres name for the direct string
  'DATABASE_URL_DIRECT',       // this project's own older name
];

/** The first connection string found in `env`, or undefined when none is set. */
function resolveDatabaseUrl(env) {
  const [first] = candidateDatabaseUrls(env);
  return first ? first.url : undefined;
}

/**
 * Every environment variable that looks like a Postgres connection string,
 * as [{ name, url }], known names first and any other `*_DATABASE_URL` /
 * `*_POSTGRES_URL*` after them (a Vercel Marketplace database connected with
 * a prefix, for example `NEON_DATABASE_URL`). The app tries them in this
 * order and uses the first one that answers, so an old, dead setting left
 * behind does not stop a new database from being found.
 */
function candidateDatabaseUrls(env) {
  const seen = new Set();
  const out = [];
  const consider = (name) => {
    const value = env[name];
    if (typeof value !== 'string') return;
    const url = value.trim();
    if (!/^postgres(ql)?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    out.push({ name, url });
  };
  for (const name of DATABASE_URL_VARS) consider(name);
  Object.keys(env)
    .filter((name) => /(^|_)(DATABASE|POSTGRES)_URL(_[A-Z0-9_]+)?$/.test(name) && !DATABASE_URL_VARS.includes(name))
    .sort()
    .forEach(consider);
  return out;
}

/**
 * Hosted Postgres (Neon, Supabase, …) requires TLS. The driver already honours
 * `?sslmode=` in the URL; when the URL says nothing and the host is not local,
 * require TLS rather than sending credentials in the clear.
 */
function sslOption(url) {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('sslmode') || parsed.searchParams.has('ssl')) return undefined;
    const host = parsed.hostname;
    if (host === '' || host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') return undefined;
    return 'require';
  } catch {
    return undefined;
  }
}

/** Driver options that work for both direct and pooled (PgBouncer) connections. */
function connectionOptions(url, overrides) {
  const ssl = sslOption(url);
  return Object.assign(
    {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 15,
      prepare: false,        // required by PgBouncer in transaction mode (Neon pooled, Supabase pooler)
      onnotice: () => {},    // "already exists, skipping" notices are expected during setup
    },
    ssl ? { ssl } : {},
    overrides || {},
  );
}

/** The one schema file, applied before the migrations. */
const BASE_SCHEMA_NAME = 'schema.sql';

/**
 * Migration files written for SQLite that are NOT applied to Postgres:
 * 001 and 002_service_master are already folded into src/db/schema.sql
 * (scripts/convert_schema.js produced it), and 003_update_questions is the
 * SQLite "rebuild the table" dance whose effect is the ALTER TABLE block at
 * the end of schema.sql.
 */
const SQLITE_ONLY_MIGRATIONS = new Set([
  '001_initial_schema.sql',
  '002_service_master.sql',
  '003_update_questions.sql',
]);

/** True for a migration file in src/db/migrations that is applied to Postgres. */
function isPostgresMigrationFile(name) {
  return /^\d{3}_[A-Za-z0-9_-]+\.sql$/.test(name) && !SQLITE_ONLY_MIGRATIONS.has(name);
}

/** Postgres error codes that mean "this already exists" and are safe to skip. */
const ALREADY_EXISTS = new Set([
  '42P07', // duplicate_table
  '42701', // duplicate_column
  '42710', // duplicate_object (index, constraint, type)
  '42P06', // duplicate_schema
  '42723', // duplicate_function
]);

/**
 * Split a SQL file into statements. A plain split on ";" is wrong as soon as
 * a string literal or a comment holds one, so this walks the text and skips
 * quoted strings, `-- line` comments and `/* block * /` comments. Comments
 * are dropped, which also keeps a statement that follows a comment line.
 */
function splitSqlStatements(text) {
  const statements = [];
  let current = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const d = text[i + 1];
    if (c === "'") {
      let j = i + 1;
      while (j < n) {
        if (text[j] === "'") {
          if (text[j + 1] === "'") { j += 2; continue; }
          break;
        }
        j++;
      }
      current += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === '-' && d === '-') {
      let j = text.indexOf('\n', i);
      if (j < 0) j = n;
      i = j;
      continue;
    }
    if (c === '/' && d === '*') {
      const j = text.indexOf('*/', i + 2);
      i = j < 0 ? n : j + 2;
      continue;
    }
    if (c === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
      i++;
      continue;
    }
    current += c;
    i++;
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

/** The migration files still carry SQLite's datetime('now'); Postgres says NOW(). */
function toPostgres(statement) {
  return statement
    .replace(/\(datetime\('now'\)\)/gi, 'NOW()')
    .replace(/datetime\('now'\)/gi, 'NOW()');
}

/**
 * Apply one SQL file inside the current transaction. The whole file goes in
 * one round trip first; if that fails (typically because something in it
 * already exists on a database that was set up by hand), it is retried one
 * statement at a time, skipping "already exists" and failing on anything
 * else. Each attempt sits in a savepoint so a failure does not poison the
 * surrounding transaction.
 */
async function applyUnit(tx, unit) {
  const statements = splitSqlStatements(unit.sql).map(toPostgres);
  if (statements.length === 0) return { applied: 0, skipped: 0 };

  try {
    await tx.savepoint((sp) => sp.unsafe(statements.join(';\n') + ';'));
    return { applied: statements.length, skipped: 0 };
  } catch {
    // fall through to one statement at a time
  }

  let applied = 0;
  let skipped = 0;
  for (const statement of statements) {
    try {
      await tx.savepoint((sp) => sp.unsafe(statement));
      applied++;
    } catch (err) {
      if (err && ALREADY_EXISTS.has(err.code)) { skipped++; continue; }
      const head = statement.replace(/\s+/g, ' ').slice(0, 90);
      const error = new Error(`[${unit.name}] ${err && err.message ? err.message : err} — in: ${head}`);
      error.cause = err;
      throw error;
    }
  }
  return { applied, skipped };
}

const MIGRATIONS_TABLE =
  'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())';

/** Names of the units not yet recorded in schema_migrations (all of them on a database without that table). */
async function pendingUnits(sql, units) {
  const [row] = await sql.unsafe("SELECT to_regclass('public.schema_migrations') IS NOT NULL AS present");
  if (!row || !row.present) return units.slice();
  const rows = await sql.unsafe('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  return units.filter((u) => !applied.has(u.name));
}

/**
 * Install everything that is not installed yet, in order, and record each
 * unit in schema_migrations so it is never run twice. Everything happens in
 * one transaction under an advisory lock, so several app instances starting
 * at the same moment take turns instead of tripping over each other.
 *
 * `sql` is a postgres.js client. `units` is [{ name, sql }] in apply order.
 * Returns the lines of what was done.
 */
async function installSchema(sql, units, options) {
  const say = (options && options.log) || (() => {});
  const log = [];
  const note = (line) => { log.push(line); say(line); };

  if ((await pendingUnits(sql, units)).length === 0) {
    note('Database schema is up to date');
    return log;
  }

  await sql.begin(async (tx) => {
    await tx.unsafe('SELECT pg_advisory_xact_lock(7278377)');
    await tx.unsafe(MIGRATIONS_TABLE);
    const pending = await pendingUnits(tx, units); // re-read under the lock
    for (const unit of pending) {
      const result = await applyUnit(tx, unit);
      await tx.unsafe('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [unit.name]);
      note(`${unit.name}: ${result.applied} statements applied, ${result.skipped} already in place`);
    }
  });

  return log;
}

module.exports = {
  DATABASE_URL_VARS,
  resolveDatabaseUrl,
  candidateDatabaseUrls,
  sslOption,
  connectionOptions,
  BASE_SCHEMA_NAME,
  SQLITE_ONLY_MIGRATIONS,
  isPostgresMigrationFile,
  splitSqlStatements,
  toPostgres,
  installSchema,
};
