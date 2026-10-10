import postgres from 'postgres';
import { installSchema, candidateDatabaseUrls, connectionOptions } from '@/db/setup';
import { SCHEMA_UNITS } from '@/db/migrations';

// ═══════════════════════════════════════════════════════════════════════════
// POSTGRESQL DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════
//
// Any PostgreSQL works. On Vercel, add a Postgres database from the project's
// Storage tab (Neon is the default); it sets DATABASE_URL (pooled) and
// DATABASE_URL_UNPOOLED on the project. The older Vercel Postgres names
// (POSTGRES_URL, POSTGRES_URL_NON_POOLING) and prefixed ones such as
// NEON_DATABASE_URL are accepted too — see candidateDatabaseUrls in
// src/db/setup.js. Every candidate is tried in order and the first one that
// answers is used, so an old, dead setting left behind in the project does
// not stop a new database from being found.
//
// The schema installs itself: the first query on a fresh database runs
// src/db/schema.sql and every migration in src/db/migrations (once each,
// recorded in schema_migrations), so a new database needs no manual SQL.
//
// The `postgres` npm package does the talking. A compatibility layer mimics
// the old better-sqlite3 API (db.prepare(sql).get/all/run) so the route code
// written against it keeps working.
// ═══════════════════════════════════════════════════════════════════════════

/** Thrown when the database cannot be used at all: not configured, not reachable, or its schema could not be installed. */
export class DatabaseUnavailableError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string, cause?: unknown) {
    super(userMessage);
    this.name = 'DatabaseUnavailableError';
    this.userMessage = userMessage;
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

const NO_DATABASE_MESSAGE =
  'No database is connected to this deployment. In Vercel, open the project, go to Storage, create a Postgres database, connect it to this project, then redeploy.';
const UNREACHABLE_MESSAGE =
  'The database could not be reached. Check the DATABASE_URL setting of this deployment and that the database is running.';

/** Driver and server codes that mean "could not connect", as opposed to a bad query. */
const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'EPIPE',
  'CONNECT_TIMEOUT', 'CONNECTION_CLOSED', 'CONNECTION_ENDED', 'CONNECTION_DESTROYED',
  '28P01', // invalid password
  '28000', // invalid authorization
  '3D000', // database does not exist
  '57P03', // cannot connect now (starting up)
  '08001', '08004', '08006', // connection exceptions
]);

export function isConnectionError(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return typeof code === 'string' && CONNECTION_ERROR_CODES.has(code);
}

/** A plain-language message a route can show for a database failure. */
export function describeDatabaseError(err: unknown): string {
  if (err instanceof DatabaseUnavailableError) return err.userMessage;
  if (isConnectionError(err)) return UNREACHABLE_MESSAGE;
  return 'Internal server error';
}

// ── Singleton connection ─────────────────────────────────────────────────

type Sql = ReturnType<typeof postgres>;

let sql: Sql | undefined;

/**
 * Open the first database setting that answers. Nothing runs at import time,
 * so `next build` succeeds on a project whose database is not connected yet;
 * a missing or dead setting is reported on the first query instead.
 */
async function connect(): Promise<Sql> {
  const candidates = candidateDatabaseUrls(process.env);
  if (candidates.length === 0) throw new DatabaseUnavailableError(NO_DATABASE_MESSAGE);

  const failures: string[] = [];
  for (const candidate of candidates) {
    const client = postgres(candidate.url, connectionOptions(candidate.url, { connect_timeout: 8 }));
    try {
      await client.unsafe('SELECT 1');
      console.log(`[DB] Connected using ${candidate.name}`);
      return client;
    } catch (err) {
      await client.end({ timeout: 1 }).catch(() => undefined);
      if (!isConnectionError(err)) throw err;
      const code = (err as { code?: string }).code || (err as Error).message;
      failures.push(`${candidate.name} (${code})`);
      console.warn(`[DB] ${candidate.name} did not answer: ${code}`);
    }
  }
  throw new DatabaseUnavailableError(`${UNREACHABLE_MESSAGE} Tried: ${failures.join(', ')}.`);
}

/** The live client. Only valid after dbReady() has resolved. */
function getSql(): Sql {
  if (!sql) throw new DatabaseUnavailableError(NO_DATABASE_MESSAGE);
  return sql;
}

// ── Schema bootstrap ─────────────────────────────────────────────────────

let ready: Promise<void> | undefined;

function asUnavailable(err: unknown): DatabaseUnavailableError {
  if (err instanceof DatabaseUnavailableError) return err;
  if (isConnectionError(err)) return new DatabaseUnavailableError(UNREACHABLE_MESSAGE, err);
  const message = err instanceof Error ? err.message : String(err);
  return new DatabaseUnavailableError(`The database schema could not be installed: ${message}`, err);
}

/**
 * Resolves once the schema is installed and up to date. Every query waits on
 * it, so the first request on a fresh database sets it up and later requests
 * cost one cheap check per process. A failure is not cached: the next query
 * tries again, so a database that comes up later is picked up.
 */
export function dbReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      if (!sql) sql = await connect();
      const log = await installSchema(sql, SCHEMA_UNITS);
      for (const line of log) console.log(`[DB] ${line}`);
    })().catch((err) => {
      ready = undefined;
      console.error('[DB] Schema setup failed:', err);
      throw asUnavailable(err);
    });
  }
  return ready;
}

/** Install anything pending right now and return what was done (used by /api/migrate). */
export async function runMigrations(): Promise<string[]> {
  if (!sql) sql = await connect();
  const log = await installSchema(sql, SCHEMA_UNITS);
  ready = Promise.resolve();
  return log;
}

// ── Unified interface that mimics better-sqlite3 ─────────────────────────

export interface DbStatement {
  get(...args: any[]): any;
  all(...args: any[]): any[];
  run(...args: any[]): any;
}

export interface DbConnection {
  prepare(sql: string): DbStatement;
  exec(sql: string): any;
  transaction(fn: (...args: any[]) => any): (...args: any[]) => any;
}

/**
 * Convert SQLite-style `?` placeholders to PostgreSQL-style `$1, $2, ...`
 * Also handles some common SQLite → PostgreSQL syntax conversions.
 */
function convertQuery(sqlStr: string): string {
  // Replace ? placeholders with $1, $2, etc.
  let idx = 0;
  let converted = sqlStr.replace(/\?/g, () => `$${++idx}`);

  // Replace datetime/date('now', [+/-] 'N unit') → (NOW() [+/-] INTERVAL 'N unit')
  // Supported formats:
  // date('now', '-7 days') -> (NOW() - INTERVAL '7 days')
  // datetime('now', '+1 hour') -> (NOW() + INTERVAL '1 hour')
  converted = converted.replace(/(?:datetime|date)\('now',\s*'(-?\d+)\s+(days?|hours?|minutes?|seconds?)'\)/gi,
    (_match, num, unit) => {
      const val = parseInt(num);
      const absNum = Math.abs(val);
      const sign = val < 0 ? '-' : '+';
      return `(NOW() ${sign} INTERVAL '${absNum} ${unit}')`;
    });

  // Replace simple datetime/date('now') → NOW()
  converted = converted.replace(/(?:datetime|date)\('now'\)/gi, 'NOW()');

  // Replace SQLite specific date functions if used as bare words
  // (Note: we use CURRENT_DATE and CURRENT_TIMESTAMP which are standard)

  return converted;
}

/**
 * Flatten args from various calling styles:
 * - db.prepare(sql).run(a, b, c) → [a, b, c]
 * - db.prepare(sql).run(...[a, b, c]) → [a, b, c]
 */
function flattenArgs(args: any[]): any[] {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

/** Wait for the schema, then run `fn` against the live client. */
function withDb<T>(fn: (pgSql: ReturnType<typeof postgres>) => Promise<T>): Promise<T> {
  return dbReady().then(() => fn(getSql()));
}

// ── Create the db connection object ──────────────────────────────────────

function createDb(): DbConnection {
  return {
    prepare(sqlStr: string): DbStatement {
      const pgQuery = convertQuery(sqlStr);

      return {
        // .get() returns the first row or undefined
        get(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          return withDb(pgSql => pgSql.unsafe(pgQuery, params)).then((rows: any[]) => {
            if (!rows || rows.length === 0) return undefined;
            return rows[0];
          });
        },

        // .all() returns all rows as an array
        all(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          return withDb(pgSql => pgSql.unsafe(pgQuery, params)).then((rows: any[]) => {
            return rows || [];
          });
        },

        // .run() executes the query (INSERT/UPDATE/DELETE)
        run(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          return withDb(pgSql => pgSql.unsafe(pgQuery, params)).then((result: any) => {
            return {
              changes: result?.count ?? 0,
              lastInsertRowid: null,
            };
          });
        },
      };
    },

    exec(sqlStr: string): any {
      // For executing raw multi-statement SQL (like migrations)
      return withDb(pgSql => pgSql.unsafe(sqlStr));
    },

    transaction(fn: (...args: any[]) => any): (...args: any[]) => any {
      return async (...args: any[]) => {
        await dbReady();
        return getSql().begin(async (tx: any) => {
          // Create a transaction-scoped db object
          const txDb: DbConnection = {
            prepare(sqlStr: string): DbStatement {
              const pgQuery = convertQuery(sqlStr);
              return {
                get(...args2: any[]) {
                  const params = flattenArgs(args2);
                  const placeholderCount = (pgQuery.match(/\$\d+/g) || []).length;
                  const actualParams = params.slice(0, placeholderCount);
                  return tx.unsafe(pgQuery, actualParams).then((rows: any[]) => rows?.[0] || undefined);
                },
                all(...args2: any[]) {
                  const params = flattenArgs(args2);
                  const placeholderCount = (pgQuery.match(/\$\d+/g) || []).length;
                  const actualParams = params.slice(0, placeholderCount);
                  return tx.unsafe(pgQuery, actualParams).then((rows: any[]) => rows || []);
                },
                run(...args2: any[]) {
                  const params = flattenArgs(args2);
                  const placeholderCount = (pgQuery.match(/\$\d+/g) || []).length;
                  const actualParams = params.slice(0, placeholderCount);
                  return tx.unsafe(pgQuery, actualParams).then((result: any) => ({
                    changes: result?.count ?? 0,
                    lastInsertRowid: null,
                  }));
                },
              };
            },
            exec(s: string) { return tx.unsafe(s); },
            transaction(f: any) { return f; },
          };
          return fn.call(txDb, txDb, ...args);
        });
      };
    },
  };
}

// ── Singleton ────────────────────────────────────────────────────────────

let db: DbConnection;

/**
 * The shared connection object. Safe to call at module load: it allocates
 * nothing and connects to nothing until the first query runs.
 */
export function getDb(): DbConnection {
  if (!db) {
    db = createDb();
  }
  return db;
}
