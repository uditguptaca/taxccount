// A registered person's saved compliance checks: one profile per person or business, its filings kept as
// items in their compliance vault. All reads and writes are limited to the signed-in user's own rows.
import { randomUUID } from 'crypto';
import { getPack } from '@/lib/compliance-catalog';
import { datesFor, evaluate, makeCtx } from '@/lib/compliance/engine';
import type { Answers, Result, Selection } from '@/lib/compliance/types';
import { today } from '@/lib/compliance-server';

export const tableFor = (kind: string) => (kind === 'individual' ? 'personal_compliance_items' : 'personal_entity_compliance');
const VAULT_ENTITY: Record<string, string> = { sole_prop: 'sole_proprietorship', partnership: 'partnership', trust: 'trust', corporation: 'business', llc: 'business', branch: 'business', nonprofit: 'other' };
const FREQ: Record<string, string> = { annual: 'Yearly', semiannual: 'Every 6 months', quarterly: 'Quarterly', monthly: 'Monthly', event: 'When it happens', once: 'One time' };

export function urgency(due: string | null, status: string): string {
  if (status === 'completed') return 'green';
  if (!due) return 'gray';
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  return days <= 7 ? 'red' : days <= 30 ? 'yellow' : 'green';
}
const meta = (r: Result) => JSON.stringify({ form: r.form ?? null, head: r.head, authority: r.authority, frequency: r.frequency, certainty: r.certainty, period: r.next[0]?.period ?? null });

/** Creates a profile and puts every filing that applies into the person's vault. Returns the profile id. */
export async function createProfile(db: any, user: { userId: string; orgId: string }, sel: Selection, answers: Answers, label: string): Promise<{ id: string; created: number; existing?: boolean } | { error: string }> {
  const pack = await getPack(sel.country);
  const entity = pack?.entityTypes.find((e) => e.id === sel.entity);
  if (!pack || !entity) return { error: 'Unknown country or entity type' };
  const results = evaluate(pack, sel, answers, today());
  const id = randomUUID(), now = new Date().toISOString();
  const name = (label || '').trim().slice(0, 120) || (entity.kind === 'individual' ? 'Me' : `My ${entity.name.toLowerCase()}`);
  let created = 0, existing = '';
  await db.transaction(async (tx: any) => {
    // One save at a time per person: two requests arriving together (a double click, a page that loads twice)
    // must not both pass the "already saved" test and store the same check twice.
    await tx.prepare('SELECT pg_advisory_xact_lock(hashtext(?))').get('compliance-tracker:' + user.userId);
    const same = await tx.prepare("SELECT id FROM compliance_tracker_profiles WHERE user_id = ? AND country = ? AND state = ? AND entity_type = ? AND answers = ? AND status = 'active'")
      .get(user.userId, sel.country, sel.state, sel.entity, JSON.stringify(answers));
    if (same) { existing = same.id; return; }
    let vaultEntityId: string | null = null;
    if (entity.kind !== 'individual') {
      vaultEntityId = randomUUID();
      await tx.prepare('INSERT INTO personal_entities (id, user_id, org_id, name, entity_type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(vaultEntityId, user.userId, user.orgId || null, name, VAULT_ENTITY[entity.kind] ?? 'other', `${entity.name} · ${pack.name}`, 'active', now, now);
    }
    await tx.prepare('INSERT INTO compliance_tracker_profiles (id, user_id, org_id, label, country, state, entity_type, kind, depts, answers, pack_version, vault_entity_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, user.userId, user.orgId || null, name, sel.country, sel.state, sel.entity, entity.kind, JSON.stringify(sel.depts), JSON.stringify(answers), pack.version, vaultEntityId, now, now);
    for (const r of results) { await insertItem(tx, user, id, entity.kind, vaultEntityId, r, now); created++; }
  })();
  if (existing) return { id: existing, created: 0, existing: true };
  return { id, created };
}

async function insertItem(tx: any, user: { userId: string; orgId: string }, profileId: string, kind: string, vaultEntityId: string | null, r: Result, now: string) {
  const due = r.next[0]?.date ?? null;
  const title = r.form ? `${r.name} (${r.form})` : r.name;
  const notes = r.certainty === 'check' ? 'May apply: you were not sure about one of the questions. Confirm with your advisor.' : null;
  if (kind === 'individual') {
    await tx.prepare(`INSERT INTO personal_compliance_items (id, user_id, org_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, 'tax_filing', ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(randomUUID(), user.userId, user.orgId || null, title, r.brief, due, r.frequency, FREQ[r.frequency] ?? null, urgency(due, 'pending'), notes, now, now, profileId, r.id, meta(r));
  } else {
    await tx.prepare(`INSERT INTO personal_entity_compliance (id, entity_id, user_id, org_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, ?, 'tax_filing', ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(randomUUID(), vaultEntityId, user.userId, user.orgId || null, title, r.brief, due, r.frequency, FREQ[r.frequency] ?? null, urgency(due, 'pending'), notes, now, now, profileId, r.id, meta(r));
  }
}

export interface ProfileRow { id: string; user_id: string; label: string; country: string; state: string; entity_type: string; kind: string; depts: string; answers: string; vault_entity_id: string | null; pack_version: string | null; created_at: string }
export const selOf = (p: ProfileRow): Selection => ({ country: p.country, state: p.state, entity: p.entity_type, depts: JSON.parse(p.depts || '[]') });
export const answersOf = (p: ProfileRow): Answers => { try { return JSON.parse(p.answers || '{}'); } catch { return {}; } };

/** Everything the "My compliances" page shows for one profile: the saved items joined with today's rule text. */
export async function loadProfile(db: any, p: ProfileRow) {
  const pack = await getPack(p.country);
  const sel = selOf(p), answers = answersOf(p);
  const results = pack ? evaluate(pack, sel, answers, today()) : [];
  const byId = new Map(results.map((r) => [r.id, r]));
  const rows = await db.prepare(`SELECT id, title, due_date, status, urgency, notes, completed_at, tracker_compliance_id, tracker_meta FROM ${tableFor(p.kind)} WHERE tracker_profile_id = ? AND user_id = ? ORDER BY CASE WHEN status = 'completed' THEN 1 ELSE 0 END, due_date NULLS LAST, title`).all(p.id, p.user_id);
  const entity = pack?.entityTypes.find((e) => e.id === p.entity_type);
  const items = rows.map((row: any) => {
    const r = byId.get(row.tracker_compliance_id);
    let m: any = {}; try { m = JSON.parse(row.tracker_meta || '{}'); } catch { /* keep empty */ }
    return {
      id: row.id, complianceId: row.tracker_compliance_id, title: row.title, dueDate: row.due_date, status: row.status, urgency: urgency(row.due_date, row.status), notes: row.notes, completedAt: row.completed_at,
      form: r?.form ?? m.form ?? null, head: r?.head ?? m.head ?? 'Other', authority: r?.authority ?? m.authority ?? '', frequency: r?.frequency ?? m.frequency ?? 'annual', certainty: r?.certainty ?? m.certainty ?? 'applies',
      period: m.period ?? null, brief: r?.brief ?? '', why: r?.why ?? '', dueText: r?.dueText ?? '', penalty: r?.penalty ?? null, note: r?.note ?? null, sourceUrl: r?.sourceUrl ?? '', sourceTitle: r?.sourceTitle ?? '', verified: r?.verified ?? false,
      upcoming: r?.next ?? [], needs: r?.needs ?? null, stillApplies: !!r,
    };
  });
  const history = await db.prepare('SELECT compliance_id, title, period, due_date, completed_at FROM compliance_tracker_history WHERE profile_id = ? AND user_id = ? ORDER BY completed_at DESC LIMIT 100').all(p.id, p.user_id);
  return {
    id: p.id, label: p.label, country: p.country, countryName: pack?.name ?? p.country, state: p.state, stateName: pack?.states.find((s) => s.code === p.state)?.name ?? p.state,
    entityType: p.entity_type, entityName: entity?.name ?? p.entity_type, kind: p.kind, depts: sel.depts, answers, packVersion: p.pack_version, currentVersion: pack?.version ?? null,
    weekendNote: pack?.weekendNote ?? '', disclaimer: pack?.disclaimer ?? null, createdAt: p.created_at, items, history,
  };
}

/** After the person changes an answer or a date: add filings that now apply, refresh dates of untouched ones, drop pending ones that no longer apply. */
export async function resync(db: any, p: ProfileRow, answers: Answers, label?: string, opts: { keepOrphans?: boolean } = {}): Promise<void> {
  const pack = await getPack(p.country); if (!pack) return;
  const sel = selOf(p);
  const results = evaluate(pack, sel, answers, today());
  const table = tableFor(p.kind), now = new Date().toISOString();
  const rows = await db.prepare(`SELECT id, tracker_compliance_id, status, due_date, tracker_meta FROM ${table} WHERE tracker_profile_id = ? AND user_id = ?`).all(p.id, p.user_id);
  const have = new Map<string, any>(rows.map((r: any) => [r.tracker_compliance_id, r]));
  const want = new Map(results.map((r) => [r.id, r]));
  await db.transaction(async (tx: any) => {
    await tx.prepare('UPDATE compliance_tracker_profiles SET answers = ?, label = COALESCE(?, label), pack_version = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(JSON.stringify(answers), label?.trim().slice(0, 120) || null, pack.version, now, p.id, p.user_id);
    if (label?.trim() && p.vault_entity_id) await tx.prepare('UPDATE personal_entities SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(label.trim().slice(0, 120), now, p.vault_entity_id, p.user_id);
    for (const r of results) {
      const row = have.get(r.id);
      if (!row) { await insertItem(tx, { userId: p.user_id, orgId: '' }, p.id, p.kind, p.vault_entity_id, r, now); continue; }
      let m: any = {}; try { m = JSON.parse(row.tracker_meta || '{}'); } catch { /* keep empty */ }
      // a date the person set by hand is kept; a date we worked out is refreshed
      if (row.status !== 'completed' && !m.custom) {
        const due = r.next[0]?.date ?? null;
        await tx.prepare(`UPDATE ${table} SET due_date = ?, urgency = ?, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(due, urgency(due, row.status), meta(r), now, row.id, p.user_id);
      }
    }
    // When the person changed an answer, filings that no longer apply go. When the rules themselves changed, they stay and are
    // flagged on the page, so nothing disappears from an account without the person seeing why.
    if (!opts.keepOrphans) for (const row of rows) if (!want.has(row.tracker_compliance_id) && row.status !== 'completed') await tx.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(row.id, p.user_id);
  })();
}

/** Marking a filing done records it and moves the item to its next due date (for filings that repeat). */
export async function completeItem(db: any, p: ProfileRow, itemId: string): Promise<{ next: string | null } | { error: string }> {
  const table = tableFor(p.kind);
  const row = await db.prepare(`SELECT id, title, due_date, tracker_compliance_id, tracker_meta FROM ${table} WHERE id = ? AND tracker_profile_id = ? AND user_id = ?`).get(itemId, p.id, p.user_id);
  if (!row) return { error: 'Not found' };
  const pack = await getPack(p.country);
  const c = pack?.compliances.find((k) => k.id === row.tracker_compliance_id);
  let m: any = {}; try { m = JSON.parse(row.tracker_meta || '{}'); } catch { /* keep empty */ }
  const now = new Date().toISOString();
  let next: { date: string; period: string } | null = null;
  if (pack && c && c.frequency !== 'event' && c.frequency !== 'once') {
    const x = makeCtx(pack, selOf(p), answersOf(p));
    if (x) {
      // the first due date after the one just completed (or after today when the item had no date)
      const from = row.due_date && row.due_date >= today() ? row.due_date : today();
      const after = new Date(new Date(from + 'T00:00:00Z').getTime() + 86400000).toISOString().slice(0, 10);
      next = datesFor(c, x, after, 1).dates[0] ?? null;
    }
  }
  await db.transaction(async (tx: any) => {
    await tx.prepare('INSERT INTO compliance_tracker_history (id, profile_id, user_id, compliance_id, title, period, due_date, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(randomUUID(), p.id, p.user_id, row.tracker_compliance_id, row.title, m.period ?? null, row.due_date, now);
    if (next) {
      await tx.prepare(`UPDATE ${table} SET due_date = ?, status = 'pending', urgency = ?, completed_at = NULL, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(next.date, urgency(next.date, 'pending'), JSON.stringify({ ...m, period: next.period, custom: false }), now, row.id, p.user_id);
    } else {
      await tx.prepare(`UPDATE ${table} SET status = 'completed', urgency = 'green', completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(now, now, row.id, p.user_id);
    }
  })();
  return { next: next?.date ?? null };
}

/**
 * When Service Master changes a rule (a new date, a new filing, a filing switched off), saved checks made under the
 * old rules are brought up to date: new filings are added, dates we worked out are refreshed, dates the person set by
 * hand and anything already filed are left alone. Called when the person opens their page and after a change is saved.
 */
export async function refreshIfRulesChanged(db: any, p: ProfileRow): Promise<boolean> {
  const pack = await getPack(p.country);
  if (!pack || p.pack_version === pack.version) return false;
  await resync(db, p, answersOf(p), undefined, { keepOrphans: true });
  return true;
}
/** Brings up to `limit` saved checks of one country up to date after a rule change. The rest refresh when their owner next opens the page. */
export async function refreshCountry(db: any, country: string, limit = 150): Promise<number> {
  const pack = await getPack(country); if (!pack) return 0;
  const rows: ProfileRow[] = await db.prepare("SELECT * FROM compliance_tracker_profiles WHERE country = ? AND status = 'active' AND (pack_version IS NULL OR pack_version <> ?) ORDER BY updated_at DESC LIMIT ?").all(country, pack.version, limit);
  let n = 0;
  for (const p of rows) { try { if (await refreshIfRulesChanged(db, p)) n++; } catch (e) { console.error('refreshCountry', p.id, e); } }
  return n;
}
