import postgres from 'postgres';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION (SUPABASE POSTGRESQL + LOCAL SQLITE FALLBACK)
// ═══════════════════════════════════════════════════════════════════════════

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;

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

let sql: ReturnType<typeof postgres> | null = null;
let sqliteDb: any = null;
let useSqliteFallback = false;

function getSqliteDb() {
  if (!sqliteDb) {
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'abidebylaw.db');
    sqliteDb = new Database(dbPath);
    console.log('[DB] Connected to local SQLite database (abidebylaw.db)');
  }
  return sqliteDb;
}

function getSql() {
  if (!sql && DATABASE_URL && !useSqliteFallback) {
    try {
      sql = postgres(DATABASE_URL, {
        max: 10,
        idle_timeout: 30,
        connect_timeout: 10,
        prepare: false,
      });
    } catch (err) {
      console.warn('[DB] Supabase connection setup failed, using SQLite fallback:', err);
      useSqliteFallback = true;
    }
  }
  return sql;
}

function convertQuery(sqlStr: string): string {
  let idx = 0;
  let converted = sqlStr.replace(/\?/g, () => `$${++idx}`);
  converted = converted.replace(/(?:datetime|date)\('now',\s*'(-?\d+)\s+(days?|hours?|minutes?|seconds?)'\)/gi,
    (_match, num, unit) => {
      const val = parseInt(num);
      const absNum = Math.abs(val);
      const sign = val < 0 ? '-' : '+';
      return `(NOW() ${sign} INTERVAL '${absNum} ${unit}')`;
    });
  converted = converted.replace(/(?:datetime|date)\('now'\)/gi, 'NOW()');
  return converted;
}

function flattenArgs(args: any[]): any[] {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

function toSqliteQuery(sqlStr: string): string {
  return sqlStr
    .replace(/\bNOW\(\)/gi, "datetime('now')");
}

function createDb(): DbConnection {
  return {
    prepare(sqlStr: string): DbStatement {
      const sqliteQuery = toSqliteQuery(sqlStr);
      return {
        get(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          const pgSql = getSql();
          if (pgSql && !useSqliteFallback) {
            const pgQuery = convertQuery(sqlStr);
            return pgSql.unsafe(pgQuery, params).then((rows: any[]) => {
              if (!rows || rows.length === 0) return undefined;
              return rows[0];
            }).catch((err: any) => {
              console.warn('[DB] Postgres get() error, falling back to SQLite:', err.message);
              useSqliteFallback = true;
              return getSqliteDb().prepare(sqliteQuery).get(...params);
            });
          }
          return Promise.resolve(getSqliteDb().prepare(sqliteQuery).get(...params));
        },

        all(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          const pgSql = getSql();
          if (pgSql && !useSqliteFallback) {
            const pgQuery = convertQuery(sqlStr);
            return pgSql.unsafe(pgQuery, params).then((rows: any[]) => {
              return rows || [];
            }).catch((err: any) => {
              console.warn('[DB] Postgres all() error, falling back to SQLite:', err.message);
              useSqliteFallback = true;
              return getSqliteDb().prepare(sqliteQuery).all(...params);
            });
          }
          return Promise.resolve(getSqliteDb().prepare(sqliteQuery).all(...params));
        },

        run(...args: any[]): any {
          const params = flattenArgs(args).map(p => p === undefined ? null : p);
          const pgSql = getSql();
          if (pgSql && !useSqliteFallback) {
            const pgQuery = convertQuery(sqlStr);
            return pgSql.unsafe(pgQuery, params).then((result: any) => {
              return {
                changes: result?.count ?? 0,
                lastInsertRowid: null,
              };
            }).catch((err: any) => {
              console.warn('[DB] Postgres run() error, falling back to SQLite:', err.message);
              useSqliteFallback = true;
              return getSqliteDb().prepare(sqliteQuery).run(...params);
            });
          }
          const res = getSqliteDb().prepare(sqliteQuery).run(...params);
          return Promise.resolve({ changes: res.changes, lastInsertRowid: res.lastInsertRowid });
        },
      };
    },

    exec(sqlStr: string): any {
      const pgSql = getSql();
      if (pgSql && !useSqliteFallback) {
        return pgSql.unsafe(sqlStr).catch(() => getSqliteDb().exec(sqlStr));
      }
      return getSqliteDb().exec(sqlStr);
    },

    transaction(fn: (...args: any[]) => any): (...args: any[]) => any {
      return async (...args: any[]) => {
        const pgSql = getSql();
        if (pgSql && !useSqliteFallback) {
          try {
            return await pgSql.begin(async (tx: any) => {
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
          } catch (err: any) {
            console.warn('[DB] Postgres transaction error, falling back to SQLite:', err.message);
            useSqliteFallback = true;
          }
        }
        return getSqliteDb().transaction(fn)(...args);
      };
    },
  };
}

let db: DbConnection;
let initialized = false;

export function getDb(): DbConnection {
  if (!db) {
    db = createDb();
  }

  if (!initialized) {
    initialized = true;
    initializeSchema().catch((err: any) => console.error('[DB] Schema init error:', err));
  }

  return db;
}

async function initializeSchema() {
  try {
    const pgSql = getSql();
    if (pgSql && !useSqliteFallback) {
      const result = await pgSql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'organizations'
        ) as exists
      `;
      if (result[0]?.exists) {
        console.log('[DB] Supabase Schema verified — tables exist');
        return;
      }
    }
  } catch (err: any) {
    console.warn('[DB] Supabase unavailable, switching to SQLite fallback:', err.message);
    useSqliteFallback = true;
  }
}
