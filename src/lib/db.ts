import path from 'path';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════════
// DUAL-MODE DATABASE: better-sqlite3 (local dev) ↔ Turso @libsql (production)
// ═══════════════════════════════════════════════════════════════════════════
//
// Environment Variables for Turso mode:
//   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
//   TURSO_AUTH_TOKEN=your-token
//
// When these are set, the app uses Turso's cloud database (persistent).
// When absent, it falls back to local better-sqlite3 (dev/ephemeral on Vercel).
// ═══════════════════════════════════════════════════════════════════════════

const USE_TURSO = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
const LOCAL_DB_PATH = process.env.VERCEL ? '/tmp/abidebylaw.db' : path.join(process.cwd(), 'abidebylaw.db');

// ── Unified interface that both backends implement ───────────────────────

export interface DbStatement {
  get(...args: any[]): any;
  all(...args: any[]): any[];
  run(...args: any[]): any;
}

export interface DbConnection {
  prepare(sql: string): DbStatement;
  exec(sql: string): any; // void (Sync) or Promise<void> (Async)
  transaction(fn: (...args: any[]) => any): (...args: any[]) => any; 
}

// ── Local SQLite backend (better-sqlite3) ────────────────────────────────

function createLocalDb(): DbConnection {
  const Database = require('better-sqlite3');
  const db = new Database(LOCAL_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  // Wrap to match interface exactly if needed, but better-sqlite3 already matches mostly
  return db as any;
}

// ── Turso backend (@libsql/client) ───────────────────────────────────────
// Wraps the async @libsql/client in a synchronous-looking API by using
// a micro-cache pattern. Since Next.js API routes are async, callers
// should await getDb() when using Turso mode.

function createTursoDb(): DbConnection {
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  // Wrapper that adapts @libsql/client's async API to our interface.
  // Returns promises from get/all/run — callers use `await`.
  return {
    prepare(sql: string): DbStatement {
      return {
        get(...args: any[]) {
          const params = flattenArgs(args);
          return client.execute({ sql, args: params }).then((r: any) => r.rows[0] || undefined);
        },
        all(...args: any[]) {
          const params = flattenArgs(args);
          return client.execute({ sql, args: params }).then((r: any) => r.rows);
        },
        run(...args: any[]) {
          const params = flattenArgs(args);
          return client.execute({ sql, args: params }).then((r: any) => ({
            changes: r.rowsAffected,
            lastInsertRowid: r.lastInsertRowid,
          }));
        },
      };
    },
    exec(sql: string) {
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      return (async () => {
        for (const stmt of statements) {
          await client.execute(stmt);
        }
      })();
    },
    transaction(fn: (...args: any[]) => any) {
      // In Turso/Async mode, the transaction wrapper is also async
      return async (...args: any[]) => {
        // Simplified: Since our prepare/get/run are already async and use 'client.execute',
        // there isn't a trivial way to "bind" them to a transaction object 'tx'
        // without passing 'tx' down or using AsyncLocalStorage.
        // For now, we'll implement this as a logical block, but true atomicity
        // in Turso mode would require 'tx.execute'. 
        // NOTE: This implementation is just to satisfy types and basic flow for now.
        return await fn(...args);
      };
    }
  };
}

// Flatten better-sqlite3 style args (spread) into array for @libsql
function flattenArgs(args: any[]): any[] {
  if (args.length === 0) return [];
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

// ── Singleton + Initialization ───────────────────────────────────────────

let db: DbConnection;
let initialized = false;

export function getDb(): DbConnection {
  if (!db) {
    if (USE_TURSO) {
      console.log('[DB] Connecting to Turso:', process.env.TURSO_DATABASE_URL);
      db = createTursoDb();
    } else {
      console.log('[DB] Using local SQLite:', LOCAL_DB_PATH);
      db = createLocalDb();
    }
  }

  // Auto-apply migrations on first access
  if (!initialized) {
    initialized = true;
    applyMigrations(db);
  }

  return db;
}

// ── Migration Runner ─────────────────────────────────────────────────────

function applyMigrations(db: DbConnection) {
  try {
    // Ensure migrations table exists
    const migrationTableSql = "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'";
    
    if (USE_TURSO) {
      // Turso mode: async migration (runs at first request)
      (async () => {
        try {
          const result = (db.prepare(migrationTableSql).get() as any);
          const hasMigrations = await result;
          if (!hasMigrations) {
            await (db.exec as any)('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, executed_at TEXT DEFAULT CURRENT_TIMESTAMP)');
          }
          await runMigrationFiles(db, true);
        } catch (err) {
          console.error('[DB] Migration error:', err);
        }
      })();
    } else {
      // Local mode: synchronous migration
      const hasMigrations = db.prepare(migrationTableSql).get();
      if (!hasMigrations) {
        db.exec('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, executed_at TEXT DEFAULT CURRENT_TIMESTAMP)');
      }
      runMigrationFiles(db, false);
    }
  } catch (err) {
    console.error('[DB] Migration init error:', err);
  }
}

function runMigrationFiles(db: DbConnection, isAsync: boolean) {
  const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql')).sort();
  const executed = db.prepare('SELECT name FROM schema_migrations').all() as any;

  if (isAsync) {
    // Async path for Turso
    (async () => {
      const rows = await executed;
      const executedSet = new Set((rows || []).map((e: any) => e.name));
      for (const file of files) {
        if (!executedSet.has(file)) {
          console.log(`[DB] Applying migration: ${file}`);
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await (db.exec as any)(sql);
          await (db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file) as any);
        }
      }
    })();
  } else {
    // Sync path for local SQLite
    const executedSet = new Set((executed || []).map((e: any) => e.name));
    for (const file of files) {
      if (!executedSet.has(file)) {
        console.log(`[DB] Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(sql);
        db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
      }
    }
  }
}
