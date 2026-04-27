import postgres from 'postgres';

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE (PostgreSQL) DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════
//
// Uses the `postgres` npm package to connect directly to Supabase's PostgreSQL.
// Provides a compatibility layer that mimics the old better-sqlite3 API
// (db.prepare(sql).get/all/run) so existing route code works with minimal changes.
//
// Environment Variables:
//   DATABASE_URL=postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres
// ═══════════════════════════════════════════════════════════════════════════

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;

if (!DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL environment variable is not set!');
}

// ── Singleton connection ─────────────────────────────────────────────────

let sql: ReturnType<typeof postgres>;

function getSql() {
  if (!sql) {
    sql = postgres(DATABASE_URL!, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 15,
      prepare: false, // Required for pgbouncer transaction mode
    });
    console.log('[DB] Connected to Supabase PostgreSQL');
  }
  return sql;
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

  // Replace NOW() with NOW()
  converted = converted.replace(/datetime\('now'\)/gi, 'NOW()');

  // Replace CURRENT_TIMESTAMP default
  // (PostgreSQL supports CURRENT_TIMESTAMP natively, no change needed)

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

// ── Create the db connection object ──────────────────────────────────────

function createDb(): DbConnection {
  const pgSql = getSql();

  return {
    prepare(sqlStr: string): DbStatement {
      const pgQuery = convertQuery(sqlStr);

      return {
        // .get() returns the first row or undefined
        get(...args: any[]): any {
          const params = flattenArgs(args);
          return pgSql.unsafe(pgQuery, params).then((rows: any[]) => {
            if (!rows || rows.length === 0) return undefined;
            return rows[0];
          });
        },

        // .all() returns all rows as an array
        all(...args: any[]): any {
          const params = flattenArgs(args);
          return pgSql.unsafe(pgQuery, params).then((rows: any[]) => {
            return rows || [];
          });
        },

        // .run() executes the query (INSERT/UPDATE/DELETE)
        run(...args: any[]): any {
          const params = flattenArgs(args);
          return pgSql.unsafe(pgQuery, params).then((result: any) => {
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
      return pgSql.unsafe(sqlStr);
    },

    transaction(fn: (...args: any[]) => any): (...args: any[]) => any {
      return async (...args: any[]) => {
        return pgSql.begin(async (tx: any) => {
          // Create a transaction-scoped db object
          const txDb: DbConnection = {
            prepare(sqlStr: string): DbStatement {
              const pgQuery = convertQuery(sqlStr);
              return {
                get(...args2: any[]) {
                  const params = flattenArgs(args2);
                  return tx.unsafe(pgQuery, params).then((rows: any[]) => rows?.[0] || undefined);
                },
                all(...args2: any[]) {
                  const params = flattenArgs(args2);
                  return tx.unsafe(pgQuery, params).then((rows: any[]) => rows || []);
                },
                run(...args2: any[]) {
                  const params = flattenArgs(args2);
                  return tx.unsafe(pgQuery, params).then((result: any) => ({
                    changes: result?.count ?? 0,
                    lastInsertRowid: null,
                  }));
                },
              };
            },
            exec(s: string) { return tx.unsafe(s); },
            transaction(f: any) { return f; },
          };
          return fn.call(txDb, ...args);
        });
      };
    },
  };
}

// ── Singleton + Initialization ───────────────────────────────────────────

let db: DbConnection;
let initialized = false;

export function getDb(): DbConnection {
  if (!db) {
    db = createDb();
  }

  // Auto-apply migrations on first access
  if (!initialized) {
    initialized = true;
    initializeSchema().catch((err: any) => console.error('[DB] Schema init error:', err));
  }

  return db;
}

// ── Schema Initialization ────────────────────────────────────────────────
// Instead of running file-based migrations, we check if our core table exists
// and if not, we skip (schema should be applied via Supabase SQL Editor)

async function initializeSchema() {
  try {
    const pgSql = getSql();
    const result = await pgSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organizations'
      ) as exists
    `;
    if (result[0]?.exists) {
      console.log('[DB] Schema verified — tables exist');
    } else {
      console.warn('[DB] WARNING: Schema not found! Please run the schema SQL in Supabase SQL Editor.');
    }
  } catch (err) {
    console.error('[DB] Schema check error:', err);
  }
}
