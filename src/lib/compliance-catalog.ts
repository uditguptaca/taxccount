// The compliance checker's rules as kept in the database (Service Master). The homepage checker, the saved
// checks and Service Master all read the countries through getPack / getPacks here, never from the rule
// files directly. The rule files in src/lib/compliance/countries are the built-in starting content: they
// fill an empty database, and when a new version of them ships, rows the admin has not changed are updated.
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { PACKS as BUILTIN } from '@/lib/compliance/index';
import { checkPack } from '@/lib/compliance/integrity';
import { KINDS, packToRows, rowsToPack, type CatalogRow, type Kind } from '@/lib/compliance/catalog';
import type { CountryPack } from '@/lib/compliance/types';
import { shapeProblems } from '@/lib/compliance/shape';

const TTL_MS = 8000;                       // other server instances pick up a change within this time
let cache: { at: number; stamp: string; rows: CatalogRow[]; packs: CountryPack[] } | null = null;
let syncing: Promise<void> | null = null;
let synced = false;

const stampOf = async (db: any) => { const r = await db.prepare('SELECT COUNT(*) AS n, MAX(updated_at) AS m FROM compliance_catalog').get(); return `${r?.n ?? 0}|${r?.m ?? ''}`; };

/** Fills the database from the built-in rules, and brings unchanged rows up to date when the built-in rules change. */
async function syncBuiltin(db: any): Promise<void> {
  const have: any[] = await db.prepare("SELECT country, data FROM compliance_catalog WHERE kind = 'country'").all();
  const versions = new Map<string, string>(have.map((r) => { try { return [r.country, JSON.parse(r.data).builtinVersion ?? '']; } catch { return [r.country, '']; } }));
  const todo = BUILTIN.filter((p) => versions.get(p.code) !== p.version);
  if (todo.length === 0) return;
  await db.transaction(async (tx: any) => {
    await tx.prepare('SELECT pg_advisory_xact_lock(hashtext(?))').get('compliance-catalog-sync');
    const now = new Date().toISOString();
    for (const p of todo) {
      const cur: any[] = await tx.prepare('SELECT kind, id, edited, origin, data FROM compliance_catalog WHERE country = ?').all(p.code);
      const curMap = new Map(cur.map((r) => [`${r.kind}|${r.id}`, r]));
      const countryRow = curMap.get(`country|${p.code}`);
      if (countryRow) { try { if (JSON.parse(countryRow.data).builtinVersion === p.version) continue; } catch { /* rewrite it */ } }
      const rows = packToRows(p);
      const seen = new Set<string>();
      for (const r of rows) {
        const key = `${r.kind}|${r.id}`; seen.add(key);
        const old = curMap.get(key);
        if (!old) {
          await tx.prepare('INSERT INTO compliance_catalog (country, kind, id, data, sort_order, is_active, edited, origin, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?)').run(r.country, r.kind, r.id, r.data, r.sort_order, 'builtin', now, 'system');
        } else if (Number(old.edited) === 0) {
          await tx.prepare('UPDATE compliance_catalog SET data = ?, sort_order = ?, is_active = 1, updated_at = ? WHERE country = ? AND kind = ? AND id = ?').run(r.data, r.sort_order, now, r.country, r.kind, r.id);
        } else if (r.kind === 'country') {
          // the admin changed the country's settings: keep them, only note the new built-in version
          let d: any = {}; try { d = JSON.parse(old.data); } catch { /* keep empty */ }
          d.builtinVersion = p.version;
          await tx.prepare('UPDATE compliance_catalog SET data = ?, updated_at = ? WHERE country = ? AND kind = ? AND id = ?').run(JSON.stringify(d), now, r.country, r.kind, r.id);
        }
      }
      // a built-in item that no longer exists is switched off, unless the admin had changed it
      for (const old of cur) if (old.origin === 'builtin' && Number(old.edited) === 0 && !seen.has(`${old.kind}|${old.id}`)) {
        await tx.prepare('UPDATE compliance_catalog SET is_active = 0, updated_at = ? WHERE country = ? AND kind = ? AND id = ?').run(now, p.code, old.kind, old.id);
      }
    }
  })();
}

async function load(force = false): Promise<{ rows: CatalogRow[]; packs: CountryPack[] }> {
  const db = getDb();
  if (!synced) { syncing ??= syncBuiltin(db).then(() => { synced = true; }).finally(() => { syncing = null; }); await syncing; }
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache;
  const stamp = await stampOf(db);
  if (!force && cache && cache.stamp === stamp) { cache.at = Date.now(); return cache; }
  const rows: CatalogRow[] = await db.prepare('SELECT country, kind, id, data, sort_order, is_active, edited, origin, updated_at, updated_by FROM compliance_catalog').all();
  const order: any[] = rows.filter((r) => r.kind === 'country' && Number(r.is_active) === 1).sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || a.country.localeCompare(b.country));
  const builtinOrder = new Map(BUILTIN.map((p, i) => [p.code, i]));
  order.sort((a, b) => (builtinOrder.get(a.country) ?? 99) - (builtinOrder.get(b.country) ?? 99) || a.country.localeCompare(b.country));
  const packs = order.map((c) => rowsToPack(c.country, rows)).filter((p): p is CountryPack => !!p);
  cache = { at: Date.now(), stamp, rows, packs };
  return cache;
}

/** The countries the checker offers, as they stand in Service Master now. Falls back to the built-in rules if the database cannot be read. */
export async function getPacks(): Promise<CountryPack[]> {
  try { return (await load()).packs; } catch (e) { console.error('compliance catalog: using the built-in rules', e); return BUILTIN; }
}
export async function getPack(code: string): Promise<CountryPack | undefined> { return (await getPacks()).find((p) => p.code === code); }
/** Every row, including items that are switched off (for Service Master). */
export async function getRows(): Promise<CatalogRow[]> { return (await load()).rows; }
export function invalidateCatalog() { cache = null; }
export const builtinPack = (code: string) => BUILTIN.find((p) => p.code === code);

// ── changes from Service Master ──
export interface Actor { userId: string; name: string }
const isKind = (k: unknown): k is Kind => typeof k === 'string' && (KINDS as readonly string[]).includes(k);
const ID_RE = /^[A-Za-z][A-Za-z0-9_-]{0,59}$/;

/** What is wrong with a country as it stands in these rows. An empty list means the checker can use it. */
export function problemsOf(rows: CatalogRow[], country: string): string[] {
  const pack = rowsToPack(country, rows, { evenIfOff: true });
  if (!pack) return ['The country itself is missing'];
  const out = checkPack(pack).map((p) => `${p.where} ${p.problem}`);
  if (pack.states.length === 0) out.push(`Add at least one ${pack.stateLabel.toLowerCase() || 'state'}`);
  if (pack.entityTypes.length === 0) out.push('Add at least one entity type');
  if (pack.departments.length === 0) out.push('Add at least one department');
  if (pack.compliances.length === 0) out.push('Add at least one sub-compliance');
  return out;
}
const countryOn = (rows: CatalogRow[], country: string) => rows.some((r) => r.country === country && r.kind === 'country' && Number(r.is_active) === 1);
/** A country that visitors can choose must stay sound. One that is still switched off may be built up piece by piece. */
function refusal(before: CatalogRow[], after: CatalogRow[], country: string): string[] | null {
  if (!countryOn(after, country)) return null;
  const now = problemsOf(after, country);
  if (now.length === 0) return null;
  return countryOn(before, country) && now.length < problemsOf(before, country).length ? null : now.slice(0, 12);
}

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; problems?: string[] };

/**
 * Add or change one item. The whole country is checked with the change in place first; a change that would
 * leave a question nobody can reach, a filing that points at a missing question or source, and so on, is refused.
 */
export async function saveItem(actor: Actor, input: { country: string; kind: string; id: string; data: any; sortOrder?: number; active?: boolean }): Promise<SaveResult> {
  const { country, kind, id } = input;
  if (!isKind(kind)) return { ok: false, error: 'Unknown kind of item' };
  if (!/^[A-Z]{2}$/.test(country)) return { ok: false, error: 'The country code is two capital letters, for example CA' };
  if (!ID_RE.test(id)) return { ok: false, error: 'The short code may use letters, numbers, _ and -, and must start with a letter' };
  if (kind === 'country' && id !== country) return { ok: false, error: 'A country is saved under its own code' };
  if (!input.data || typeof input.data !== 'object' || Array.isArray(input.data)) return { ok: false, error: 'Nothing to save' };
  if (JSON.stringify(input.data).length > 60000) return { ok: false, error: 'This is too long to save' };
  const shape = shapeProblems(kind, input.data);
  if (shape.length) return { ok: false, error: 'This is not filled in completely', problems: shape };
  const db = getDb();
  const { rows } = await load(true);
  const old = rows.find((r) => r.country === country && r.kind === kind && r.id === id);
  if (kind !== 'country' && !rows.some((r) => r.country === country && r.kind === 'country')) return { ok: false, error: 'Add the country first' };
  const now = new Date().toISOString();
  const next: CatalogRow = {
    country, kind, id, data: JSON.stringify(input.data),
    sort_order: input.sortOrder ?? (old ? Number(old.sort_order) : Math.max(0, ...rows.filter((r) => r.country === country && r.kind === kind).map((r) => Number(r.sort_order))) + 10),
    is_active: input.active === undefined ? (old && Number(old.is_active) !== -1 ? Number(old.is_active) : 1) : input.active ? 1 : 0,
    edited: 1, origin: old?.origin ?? 'custom', updated_at: now, updated_by: actor.userId,
  };
  const after = [...rows.filter((r) => r !== old), next];
  const bad = refusal(rows, after, country);
  if (bad) return { ok: false, error: kind === 'country' ? 'This country is not ready to be switched on yet' : 'This change would break the checker', problems: bad };
  await db.transaction(async (tx: any) => {
    await tx.prepare(`INSERT INTO compliance_catalog (country, kind, id, data, sort_order, is_active, edited, origin, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT (country, kind, id) DO UPDATE SET data = EXCLUDED.data, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active, edited = 1, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by`)
      .run(country, kind, id, next.data, next.sort_order, next.is_active, next.origin, now, actor.userId);
    await tx.prepare('INSERT INTO compliance_catalog_history (id, country, kind, item_id, action, before_json, after_json, user_id, user_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), country, kind, id, old ? (next.is_active !== Number(old.is_active) ? (next.is_active ? 'switched on' : 'switched off') : 'changed') : 'added', old ? JSON.stringify(old) : null, JSON.stringify(next), actor.userId, actor.name, now);
  })();
  invalidateCatalog();
  return { ok: true, id };
}

/** Delete an item. One the admin added is removed; a built-in one is marked as deleted (is_active = -1). Either can be brought back with Undo. */
export async function deleteItem(actor: Actor, country: string, kind: string, id: string): Promise<SaveResult> {
  if (!isKind(kind)) return { ok: false, error: 'Unknown kind of item' };
  const db = getDb();
  const { rows } = await load(true);
  const old = rows.find((r) => r.country === country && r.kind === kind && r.id === id);
  if (!old) return { ok: false, error: 'Not found' };
  if (Number(old.is_active) === -1) return { ok: false, error: 'Not found' };
  // A built-in item is not removed from the table: it is marked as deleted, so that a later update of the built-in
  // rules does not bring it back, and so that Undo in the history can.
  const builtin = old.origin === 'builtin';
  if (builtin && kind === 'country') return { ok: false, error: 'A built-in country cannot be deleted. Switch it off instead: it then disappears from the homepage and can be switched on again.' };
  const after = kind === 'country' ? rows.filter((r) => r.country !== country) : builtin ? rows.map((r) => (r === old ? { ...old, is_active: -1 } : r)) : rows.filter((r) => r !== old);
  if (kind !== 'country') { const bad = refusal(rows, after, country); if (bad) return { ok: false, error: 'Something else still uses this', problems: bad }; }
  const now = new Date().toISOString();
  await db.transaction(async (tx: any) => {
    if (kind === 'country') await tx.prepare('DELETE FROM compliance_catalog WHERE country = ?').run(country);
    else if (builtin) await tx.prepare('UPDATE compliance_catalog SET is_active = -1, edited = 1, updated_at = ?, updated_by = ? WHERE country = ? AND kind = ? AND id = ?').run(now, actor.userId, country, kind, id);
    else await tx.prepare('DELETE FROM compliance_catalog WHERE country = ? AND kind = ? AND id = ?').run(country, kind, id);
    await tx.prepare('INSERT INTO compliance_catalog_history (id, country, kind, item_id, action, before_json, after_json, user_id, user_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), country, kind, id, 'deleted', JSON.stringify(old), null, actor.userId, actor.name, now);
  })();
  invalidateCatalog();
  return { ok: true, id };
}

/** Put an item back to how it was before a recorded change. */
export async function undoChange(actor: Actor, historyId: string): Promise<SaveResult> {
  const db = getDb();
  const h: any = await db.prepare('SELECT * FROM compliance_catalog_history WHERE id = ?').get(historyId);
  if (!h) return { ok: false, error: 'Not found' };
  const before: CatalogRow | null = h.before_json ? JSON.parse(h.before_json) : null;
  if (!before) return deleteItem(actor, h.country, h.kind, h.item_id);            // it was added: undoing removes it
  const { rows } = await load(true);
  const cur = rows.find((r) => r.country === h.country && r.kind === h.kind && r.id === h.item_id);
  const after = [...rows.filter((r) => r !== cur), before];
  const bad = refusal(rows, after, h.country);
  if (bad) return { ok: false, error: 'Undoing this would break the checker', problems: bad };
  const now = new Date().toISOString();
  await db.transaction(async (tx: any) => {
    await tx.prepare(`INSERT INTO compliance_catalog (country, kind, id, data, sort_order, is_active, edited, origin, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (country, kind, id) DO UPDATE SET data = EXCLUDED.data, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active, edited = EXCLUDED.edited, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by`)
      .run(before.country, before.kind, before.id, before.data, Number(before.sort_order), Number(before.is_active), Number(before.edited), before.origin, now, actor.userId);
    await tx.prepare('INSERT INTO compliance_catalog_history (id, country, kind, item_id, action, before_json, after_json, user_id, user_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), h.country, h.kind, h.item_id, 'undone', cur ? JSON.stringify(cur) : null, JSON.stringify(before), actor.userId, actor.name, now);
  })();
  invalidateCatalog();
  return { ok: true, id: h.item_id };
}

/** Put a built-in item back to the shipped version. */
export async function restoreBuiltin(actor: Actor, country: string, kind: string, id: string): Promise<SaveResult> {
  const p = builtinPack(country);
  const r = p ? packToRows(p).find((x) => x.kind === kind && x.id === id) : undefined;
  if (!r) return { ok: false, error: 'This item is not part of the built-in rules' };
  const res = await saveItem(actor, { country, kind, id, data: JSON.parse(r.data), sortOrder: r.sort_order, active: true });
  if (res.ok) { await getDb().prepare('UPDATE compliance_catalog SET edited = 0 WHERE country = ? AND kind = ? AND id = ?').run(country, kind, id); invalidateCatalog(); }
  return res;
}

export async function recentChanges(limit = 50): Promise<any[]> {
  return getDb().prepare('SELECT id, country, kind, item_id, action, user_name, created_at, before_json, after_json FROM compliance_catalog_history ORDER BY created_at DESC LIMIT ?').all(Math.min(200, Math.max(1, limit)));
}
