// ═══════════════════════════════════════════════════════════════════════════
// DATA IMPORT: copy everything from another PostgreSQL database into this one
// ═══════════════════════════════════════════════════════════════════════════
//
// For moving the data of an OLD database (the one the app used before Neon) into
// the database the app runs on now. A platform admin pastes the old database's
// connection string on /platform/import; it is used for that request only and is
// never stored, logged or sent back.
//
// How it stays safe and exact:
//  - every value is read as TEXT and written back as text, so the database itself
//    converts it to the column's type (numbers, dates, JSON, booleans keep their
//    exact value, and nothing passes through JavaScript number rounding);
//  - only columns that exist on BOTH sides are copied, so an old database that
//    lacks a newer column, or has an extra one, still imports;
//  - tables go in foreign-key order; a row whose parent has not arrived yet (a
//    table that points at itself, for example) is parked and retried until it fits;
//  - rows that already exist are left alone (ON CONFLICT DO NOTHING), so the copy
//    can be run again;
//  - at the end the counts of both sides are compared table by table.

import postgres from 'postgres';
import { connectionTarget } from '@/db/setup';
import { getSqlClient } from '@/lib/db';
import { seedReference } from '@/db/seed-reference';

type Sql = ReturnType<typeof postgres>;

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SKIP_ALWAYS = new Set(['schema_migrations', '_import_deferred']);
const DEFERRED = '_import_deferred';

const q = (name: string) => {
  if (!IDENT.test(name)) throw new Error(`Unsafe name: ${name}`);
  return `"${name}"`;
};

// ── connections ──────────────────────────────────────────────────────────

export function checkSourceUrl(url: unknown): string {
  if (typeof url !== 'string' || !/^postgres(ql)?:\/\//i.test(url.trim())) {
    throw new ImportError('Paste the old database address. It starts with postgresql://');
  }
  return url.trim();
}

/** Remove the password (raw and decoded) from any message before it leaves the server. */
export function redact(message: string, url: string): string {
  let out = message;
  try {
    const u = new URL(url);
    for (const secret of [u.password, decodeURIComponent(u.password), url]) {
      if (secret) out = out.split(secret).join('***');
    }
  } catch { /* leave as is */ }
  return out;
}

export class ImportError extends Error {}

function openSource(url: string): Sql {
  const target = connectionTarget(url, { max: 2, connect_timeout: 15, idle_timeout: 5 });
  return postgres(target.url, target.options);
}

async function withSource<T>(url: string, fn: (src: Sql, dst: Sql) => Promise<T>): Promise<T> {
  const dst = await getSqlClient();
  const src = openSource(url);
  try {
    // never "import" a database into itself: write a token here and see whether it is visible through the old address
    const token = `probe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await dst.unsafe('CREATE TABLE IF NOT EXISTS _import_probe (token TEXT)');
    await dst.unsafe('TRUNCATE _import_probe');
    await dst.unsafe('INSERT INTO _import_probe (token) VALUES ($1)', [token]);
    try {
      const present = (await src.unsafe("SELECT to_regclass('public._import_probe') IS NOT NULL AS present"))[0].present;
      if (present) {
        const seen = await src.unsafe('SELECT 1 FROM _import_probe WHERE token = $1', [token]);
        if (seen.length) throw new ImportError('That is the database the app is already using. Paste the OLD database address.');
      }
    } finally {
      await dst.unsafe('DROP TABLE IF EXISTS _import_probe');
    }
    return await fn(src, dst);
  } catch (err: any) {
    if (err instanceof ImportError) throw err;
    throw new ImportError(redact(describe(err), url));
  } finally {
    await src.end({ timeout: 2 }).catch(() => undefined);
  }
}

function describe(err: any): string {
  const code = err?.code ? ` (${err.code})` : '';
  const msg = String(err?.message || err);
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|CONNECT_TIMEOUT/.test(String(err?.code) + msg)) {
    return `The old database could not be reached${code}. If it is a paused project, restore it first, then try again.`;
  }
  if (/ENETUNREACH|EHOSTUNREACH|EAI_AGAIN/.test(String(err?.code) + msg)) {
    return `The old database address cannot be reached from here${code}. For Supabase, copy the "Session pooler" address (it contains "pooler.supabase.com"), not the "Direct connection" one.`;
  }
  if (/password authentication failed|28P01/.test(msg + code)) return 'The old database refused the password. Copy the address again from its settings.';
  if (/Tenant or user not found/i.test(msg)) return 'The old database says the project or user does not exist. It may be paused or deleted.';
  return msg + code;
}

// ── schema comparison ────────────────────────────────────────────────────

interface ColumnInfo { name: string; requiredNoDefault: boolean }

async function listTables(sql: Sql): Promise<string[]> {
  const rows = await sql.unsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name");
  return rows.map((r: any) => r.table_name as string);
}

async function listColumns(sql: Sql): Promise<Map<string, ColumnInfo[]>> {
  const rows = await sql.unsafe(
    "SELECT table_name, column_name, is_nullable = 'NO' AND column_default IS NULL AND is_identity = 'NO' AS required FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position",
  );
  const map = new Map<string, ColumnInfo[]>();
  for (const r of rows as any[]) {
    if (!map.has(r.table_name)) map.set(r.table_name, []);
    map.get(r.table_name)!.push({ name: r.column_name, requiredNoDefault: !!r.required });
  }
  return map;
}

async function countRows(sql: Sql, table: string): Promise<number> {
  const [{ n }] = await sql.unsafe(`SELECT COUNT(*)::text AS n FROM ${q(table)}`);
  return Number(n);
}

/** Tables in the order their foreign keys allow (parents first). */
async function foreignKeyOrder(dst: Sql, tables: string[]): Promise<string[]> {
  const rows = await dst.unsafe(
    "SELECT cl.relname AS child, pr.relname AS parent FROM pg_constraint c JOIN pg_class cl ON cl.oid = c.conrelid JOIN pg_class pr ON pr.oid = c.confrelid WHERE c.contype = 'f' AND c.connamespace = 'public'::regnamespace",
  );
  const set = new Set(tables);
  const parents = new Map<string, Set<string>>(tables.map((t) => [t, new Set<string>()]));
  for (const r of rows as any[]) {
    if (r.child !== r.parent && set.has(r.child) && set.has(r.parent)) parents.get(r.child)!.add(r.parent);
  }
  const ordered: string[] = [];
  const done = new Set<string>();
  let remaining = [...tables].sort();
  while (remaining.length) {
    const ready = remaining.filter((t) => Array.from(parents.get(t)!).every((p) => done.has(p)));
    const batch = ready.length ? ready : [remaining[0]]; // a cycle: take one and let the retry pass sort it out
    for (const t of batch) { ordered.push(t); done.add(t); }
    remaining = remaining.filter((t) => !done.has(t));
  }
  return ordered;
}

// ── plan ─────────────────────────────────────────────────────────────────

export interface PlanTable {
  table: string;
  oldRows: number;
  newRows: number;
  copied: string[];
  ignoredOldColumns: string[];
  newRequiredMissing: string[];
}

export interface Plan {
  tables: PlanTable[];
  onlyInOld: { table: string; rows: number }[];
  onlyInNew: string[];
  warnings: string[];
  oldHasPlatformAdmin: boolean;
}

export async function plan(sourceUrl: string): Promise<Plan> {
  return withSource(sourceUrl, async (src, dst) => {
    const [srcTables, dstTables] = await Promise.all([listTables(src), listTables(dst)]);
    const [srcCols, dstCols] = await Promise.all([listColumns(src), listColumns(dst)]);
    const shared = dstTables.filter((t) => srcTables.includes(t) && !SKIP_ALWAYS.has(t));
    const ordered = await foreignKeyOrder(dst, shared);

    const tables: PlanTable[] = [];
    const warnings: string[] = [];
    for (let i = 0; i < ordered.length; i += 12) {
      const batch = ordered.slice(i, i + 12);
      const counts = await Promise.all(batch.map(async (t) => [await countRows(src, t), await countRows(dst, t)] as const));
      batch.forEach((t, k) => {
        const oldCols = srcCols.get(t)!.map((c) => c.name);
        const newCols = dstCols.get(t)!;
        const newNames = newCols.map((c) => c.name);
        const copied = newNames.filter((c) => oldCols.includes(c));
        tables.push({
          table: t,
          oldRows: counts[k][0],
          newRows: counts[k][1],
          copied,
          ignoredOldColumns: oldCols.filter((c) => !newNames.includes(c)),
          newRequiredMissing: newCols.filter((c) => c.requiredNoDefault && !oldCols.includes(c.name)).map((c) => c.name),
        });
      });
    }

    const lost = tables.filter((t) => t.oldRows > 0 && t.ignoredOldColumns.length);
    if (lost.length) warnings.push(`Columns that exist only in the old database are not copied: ${lost.map((t) => `${t.table} (${t.ignoredOldColumns.join(', ')})`).join('; ')}.`);
    const blocked = tables.filter((t) => t.oldRows > 0 && t.newRequiredMissing.length);
    if (blocked.length) warnings.push(`These tables have a required column the old database does not have, so their rows cannot be copied: ${blocked.map((t) => `${t.table} (${t.newRequiredMissing.join(', ')})`).join('; ')}.`);

    const onlyInOld: { table: string; rows: number }[] = [];
    for (const t of srcTables.filter((t) => !dstTables.includes(t) && !SKIP_ALWAYS.has(t))) onlyInOld.push({ table: t, rows: await countRows(src, t) });
    const orphaned = onlyInOld.filter((t) => t.rows > 0);
    if (orphaned.length) warnings.push(`These tables exist only in the old database and are not copied: ${orphaned.map((t) => `${t.table} (${t.rows} rows)`).join('; ')}.`);

    let oldHasPlatformAdmin = false;
    if (srcTables.includes('users')) {
      const [{ n }] = await src.unsafe("SELECT COUNT(*)::text AS n FROM users WHERE role = 'platform_admin' AND is_active = 1");
      oldHasPlatformAdmin = Number(n) > 0;
    }
    return {
      tables,
      onlyInOld,
      onlyInNew: dstTables.filter((t) => !srcTables.includes(t) && !SKIP_ALWAYS.has(t)),
      warnings,
      oldHasPlatformAdmin,
    };
  });
}

// ── prepare (replace mode) ───────────────────────────────────────────────

/** Empty every data table here so the old data can take its place. Schema and schema_migrations are kept. */
export async function prepareReplace(sourceUrl: string): Promise<{ cleared: number }> {
  return withSource(sourceUrl, async (src, dst) => {
    // refuse to wipe this database when the old one has nobody who can sign in as platform admin
    const [{ n }] = await src.unsafe("SELECT COUNT(*)::text AS n FROM users WHERE role = 'platform_admin' AND is_active = 1");
    if (Number(n) === 0) {
      throw new ImportError('The old database has no active platform admin, so replacing everything could lock everybody out. Use "Add" instead, or fix the old database first.');
    }
    const tables = (await listTables(dst)).filter((t) => !SKIP_ALWAYS.has(t));
    await dst.unsafe(`TRUNCATE TABLE ${tables.map(q).join(', ')} RESTART IDENTITY CASCADE`);
    await dst.unsafe(`CREATE TABLE IF NOT EXISTS ${DEFERRED} (id SERIAL PRIMARY KEY, table_name TEXT NOT NULL, row_json TEXT NOT NULL, error TEXT)`);
    await dst.unsafe(`TRUNCATE TABLE ${DEFERRED}`);
    return { cleared: tables.length };
  });
}

// ── copy ─────────────────────────────────────────────────────────────────

export interface CopyResult {
  table: string;
  read: number;
  inserted: number;
  alreadyThere: number;
  parked: number;
  failed: number;
  errors: string[];
  nextOffset: number;
  done: boolean;
}

async function primaryKey(sql: Sql, table: string): Promise<string[]> {
  const rows = await sql.unsafe(
    'SELECT a.attname AS name FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = $1::regclass AND i.indisprimary ORDER BY array_position(i.indkey::int[], a.attnum::int)',
    [`public.${q(table)}`],
  );
  return rows.map((r: any) => r.name as string);
}

async function insertBatch(dst: Sql, table: string, cols: string[], rows: (string | null)[][]) {
  const per = cols.length;
  const marks = rows.map((_, r) => `(${cols.map((_, c) => `$${r * per + c + 1}`).join(',')})`).join(',');
  const result: any = await dst.unsafe(`INSERT INTO ${q(table)} (${cols.map(q).join(',')}) VALUES ${marks} ON CONFLICT DO NOTHING`, rows.flat() as any[]);
  return Number(result.count ?? 0);
}

export async function copyChunk(sourceUrl: string, table: string, offset: number, limit: number): Promise<CopyResult> {
  return withSource(sourceUrl, async (src, dst) => {
    const dstTables = await listTables(dst);
    const srcTables = await listTables(src);
    if (!dstTables.includes(table) || !srcTables.includes(table) || SKIP_ALWAYS.has(table)) {
      throw new ImportError(`Table ${table} is not in both databases.`);
    }
    const [srcCols, dstCols] = await Promise.all([listColumns(src), listColumns(dst)]);
    const oldNames = new Set(srcCols.get(table)!.map((c) => c.name));
    const cols = dstCols.get(table)!.map((c) => c.name).filter((c) => oldNames.has(c));
    if (cols.length === 0) throw new ImportError(`Table ${table} has no column in common.`);

    const pk = (await primaryKey(src, table)).filter((c) => cols.includes(c));
    const order = pk.length ? pk.map(q).join(', ') : 'ctid';
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
    const safeLimit = Math.min(5000, Math.max(1, Math.floor(Number(limit) || 1000)));
    const rows: any[] = await src.unsafe(
      `SELECT ${cols.map((c) => `${q(c)}::text AS ${q(c)}`).join(', ')} FROM ${q(table)} ORDER BY ${order} OFFSET ${safeOffset} LIMIT ${safeLimit}`,
    );

    const result: CopyResult = { table, read: rows.length, inserted: 0, alreadyThere: 0, parked: 0, failed: 0, errors: [], nextOffset: safeOffset + rows.length, done: rows.length < safeLimit };
    const matrix = rows.map((r) => cols.map((c) => (r[c] === undefined ? null : r[c])) as (string | null)[]);
    const batchSize = Math.max(1, Math.min(500, Math.floor(30000 / cols.length)));

    for (let i = 0; i < matrix.length; i += batchSize) {
      const batch = matrix.slice(i, i + batchSize);
      try {
        const inserted = await insertBatch(dst, table, cols, batch);
        result.inserted += inserted;
        result.alreadyThere += batch.length - inserted;
      } catch {
        // one bad row must not sink the batch: go row by row
        for (const row of batch) {
          try {
            const inserted = await insertBatch(dst, table, cols, [row]);
            result.inserted += inserted;
            result.alreadyThere += 1 - inserted;
          } catch (err: any) {
            const message = redact(String(err?.message || err), sourceUrl).slice(0, 220);
            if (err?.code === '23503') {
              result.parked += 1; // the row it points to has not arrived yet; retried in finish()
              await dst.unsafe(`CREATE TABLE IF NOT EXISTS ${DEFERRED} (id SERIAL PRIMARY KEY, table_name TEXT NOT NULL, row_json TEXT NOT NULL, error TEXT)`);
              await dst.unsafe(`INSERT INTO ${DEFERRED} (table_name, row_json, error) VALUES ($1, $2, $3)`, [table, JSON.stringify({ cols, row }), message]);
            } else {
              result.failed += 1;
              if (result.errors.length < 3) result.errors.push(message);
            }
          }
        }
      }
    }
    return result;
  });
}

// ── finish ───────────────────────────────────────────────────────────────

export interface FinishReport {
  retried: number;
  stillParked: { table: string; error: string }[];
  mismatches: { table: string; oldRows: number; newRows: number }[];
  tablesChecked: number;
  sequencesFixed: number;
  ok: boolean;
}

export async function finish(sourceUrl: string, mode: 'replace' | 'add'): Promise<FinishReport> {
  return withSource(sourceUrl, async (src, dst) => {
    // 1. rows that were waiting for a parent
    let retried = 0;
    const hasDeferred = (await dst.unsafe("SELECT to_regclass('public._import_deferred') IS NOT NULL AS present"))[0].present;
    if (hasDeferred) {
      for (let pass = 0; pass < 25; pass++) {
        const rows: any[] = await dst.unsafe(`SELECT id, table_name, row_json FROM ${DEFERRED} ORDER BY id`);
        if (rows.length === 0) break;
        let progress = 0;
        for (const r of rows) {
          const { cols, row } = JSON.parse(r.row_json);
          try {
            await insertBatch(dst, r.table_name, cols, [row]);
            await dst.unsafe(`DELETE FROM ${DEFERRED} WHERE id = $1`, [r.id]);
            progress++; retried++;
          } catch { /* still waiting */ }
        }
        if (progress === 0) break;
      }
    }
    const stillParked: { table: string; error: string }[] = hasDeferred
      ? (await dst.unsafe(`SELECT table_name, error FROM ${DEFERRED} ORDER BY id LIMIT 20`)).map((r: any) => ({ table: r.table_name, error: r.error || '' }))
      : [];

    // 2. counters: every table whose id comes from a sequence continues after the highest copied id
    const serial: any[] = await dst.unsafe("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_default LIKE 'nextval(%'");
    let sequencesFixed = 0;
    for (const s of serial) {
      if (SKIP_ALWAYS.has(s.table_name)) continue;
      await dst.unsafe(`SELECT setval(pg_get_serial_sequence($1, $2), COALESCE((SELECT MAX(${q(s.column_name)}) FROM ${q(s.table_name)}), 0) + 1, false)`, [`public.${q(s.table_name)}`, s.column_name]);
      sequencesFixed++;
    }

    // 3. things every database here must have
    await dst.unsafe("INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_platform_admin, created_at, updated_at) VALUES ('system', 'system@abidebylaw.invalid', '!', 'System', 'Automation', 'platform_admin', 0, 0, NOW(), NOW()) ON CONFLICT (id) DO NOTHING");
    await seedReference(dst);

    // 4. compare the two sides table by table
    const [srcTables, dstTables] = await Promise.all([listTables(src), listTables(dst)]);
    const shared = dstTables.filter((t) => srcTables.includes(t) && !SKIP_ALWAYS.has(t));
    const mismatches: FinishReport['mismatches'] = [];
    if (mode === 'replace') {
      for (let i = 0; i < shared.length; i += 12) {
        const batch = shared.slice(i, i + 12);
        const counts = await Promise.all(batch.map(async (t) => [await countRows(src, t), await countRows(dst, t)] as const));
        batch.forEach((t, k) => {
          const [o, n] = counts[k];
          // the automation user ("system") is added to every database here, so users may hold one more
          const same = t === 'users' ? n === o || n === o + 1 : n === o;
          if (!same) mismatches.push({ table: t, oldRows: o, newRows: n });
        });
      }
    }

    if (hasDeferred && stillParked.length === 0) await dst.unsafe(`DROP TABLE IF EXISTS ${DEFERRED}`);
    return { retried, stillParked, mismatches, tablesChecked: shared.length, sequencesFixed, ok: stillParked.length === 0 && mismatches.length === 0 };
  });
}
