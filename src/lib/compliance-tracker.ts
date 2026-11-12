// A registered person's saved compliance checks: one profile per person or business, its filings kept as
// items in their compliance vault. All reads and writes are limited to the signed-in user's own rows.
import { randomUUID } from 'crypto';
import { fromFallback, getPack } from '@/lib/compliance-catalog';
import { askableQuestions, datesFor, evalCond, evaluate, isRealDate, makeCtx, nextAfterFiled, toResult } from '@/lib/compliance/engine';
import { deadlineFrom, windowOf } from '@/lib/compliance/window';
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
/** An item the person wrote themselves (not from the rules): its id starts with "custom:". */
export const isOwn = (id: unknown) => String(id ?? '').startsWith('custom:');
const REPEAT_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 };
const pad2 = (n: number) => String(n).padStart(2, '0');
/** The same day N months later (the last day of the month when that month is shorter). */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(Math.min(d, last))}`;
}
/** N months on, on the given day of the month (the month's last day when it is shorter): 31 Jan + 1 = 28 or 29 Feb, + 2 = 31 Mar. */
export function addMonthsOn(iso: string, n: number, day: number): string {
  const [y, mo] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(day, last));
  return t.toISOString().slice(0, 10);
}
const parseMeta = (v: unknown) => { try { return JSON.parse(String(v || '{}')) || {}; } catch { return {}; } };
const meta = (r: Result, extra: object = {}) => JSON.stringify({ ...extra, form: r.form ?? null, head: r.head, authority: r.authority, frequency: r.frequency, certainty: r.certainty, period: r.next[0]?.period ?? null });

/** Creates a profile and puts every filing that applies into the person's vault. Returns the profile id. */
export async function createProfile(db: any, user: { userId: string; orgId: string }, sel: Selection, answers: Answers, label: string): Promise<{ id: string; created: number; existing?: boolean } | { error: string }> {
  const pack = await getPack(sel.country);
  const entity = pack?.entityTypes.find((e) => e.id === sel.entity);
  if (!pack || !entity) return { error: 'Unknown country or entity type' };
  const results = evaluate(pack, sel, answers, today(sel.country));
  const id = randomUUID(), now = new Date().toISOString();
  const name = (label || '').trim().slice(0, 120) || (entity.kind === 'individual' ? 'Me' : `My ${entity.name.toLowerCase()}`);
  let created = 0, existing = '', widened = false;
  await db.transaction(async (tx: any) => {
    // One save at a time per person: two requests arriving together (a double click, a page that loads twice)
    // must not both pass the "already saved" test and store the same check twice.
    await tx.prepare('SELECT pg_advisory_xact_lock(hashtext(?))').get('compliance-tracker:' + user.userId);
    const same = await tx.prepare("SELECT id, depts FROM compliance_tracker_profiles WHERE user_id = ? AND country = ? AND state = ? AND entity_type = ? AND answers = ? AND status = 'active'")
      .get(user.userId, sel.country, sel.state, sel.entity, JSON.stringify(answers));
    if (same) {
      existing = same.id;
      // the same person and answers, with more types ticked this time: those types are added to the saved check
      // (it used to answer "saved" and keep nothing of them)
      let had: string[] = []; try { had = JSON.parse(same.depts || '[]'); } catch { /* keep empty */ }
      const more = sel.depts.filter((d) => !had.includes(d));
      if (more.length) { await tx.prepare('UPDATE compliance_tracker_profiles SET depts = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(JSON.stringify(pack.departments.map((d) => d.id).filter((d) => had.includes(d) || more.includes(d))), now, same.id, user.userId); widened = true; }
      return;
    }
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
  if (existing) {
    if (widened) { const row = await db.prepare('SELECT * FROM compliance_tracker_profiles WHERE id = ? AND user_id = ?').get(existing, user.userId); if (row) await resync(db, row, answers, undefined, { keepOrphans: true }); }
    return { id: existing, created: 0, existing: true, ...(widened ? { widened: true } : {}) };
  }
  return { id, created };
}

async function insertItem(tx: any, user: { userId: string; orgId: string }, profileId: string, kind: string, vaultEntityId: string | null, r: Result, now: string, extra: object = {}) {
  const due = r.next[0]?.date ?? null;
  const title = r.form ? `${r.name} (${r.form})` : r.name;
  const notes = r.certainty === 'check' ? 'May apply: you were not sure about one of the questions. Confirm with your advisor.' : null;
  if (kind === 'individual') {
    await tx.prepare(`INSERT INTO personal_compliance_items (id, user_id, org_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, 'tax_filing', ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(randomUUID(), user.userId, user.orgId || null, title, r.brief, due, r.frequency, FREQ[r.frequency] ?? null, urgency(due, 'pending'), notes, now, now, profileId, r.id, meta(r, extra));
  } else {
    await tx.prepare(`INSERT INTO personal_entity_compliance (id, entity_id, user_id, org_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, ?, 'tax_filing', ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(randomUUID(), vaultEntityId, user.userId, user.orgId || null, title, r.brief, due, r.frequency, FREQ[r.frequency] ?? null, urgency(due, 'pending'), notes, now, now, profileId, r.id, meta(r, extra));
  }
}

export interface ProfileRow { id: string; user_id: string; label: string; country: string; state: string; entity_type: string; kind: string; depts: string; answers: string; vault_entity_id: string | null; pack_version: string | null; created_at: string }
export const selOf = (p: ProfileRow): Selection => ({ country: p.country, state: p.state, entity: p.entity_type, depts: JSON.parse(p.depts || '[]') });
export const answersOf = (p: ProfileRow): Answers => { try { return JSON.parse(p.answers || '{}'); } catch { return {}; } };

/** Everything the "My compliances" page shows for one profile: the saved items joined with today's rule text. */
export async function loadProfile(db: any, p: ProfileRow) {
  const pack = await getPack(p.country);
  const sel = selOf(p), answers = answersOf(p);
  const results = pack ? evaluate(pack, sel, answers, today(p.country)) : [];
  const byId = new Map(results.map((r) => [r.id, r]));
  const rows = await db.prepare(`SELECT id, title, description, due_date, status, urgency, notes, completed_at, tracker_compliance_id, tracker_meta FROM ${tableFor(p.kind)} WHERE tracker_profile_id = ? AND user_id = ? ORDER BY CASE WHEN status = 'completed' THEN 1 ELSE 0 END, due_date NULLS LAST, title`).all(p.id, p.user_id);
  const entity = pack?.entityTypes.find((e) => e.id === p.entity_type);
  const ctx = pack ? makeCtx(pack, sel, answers) : null;
  const docRows: any[] = await db.prepare('SELECT id, compliance_id, file_name, size_bytes, created_at FROM compliance_tracker_documents WHERE profile_id = ? AND user_id = ? ORDER BY created_at').all(p.id, p.user_id);
  const docsOf = (cid: string) => docRows.filter((d) => d.compliance_id === cid).map((d) => ({ id: d.id, name: d.file_name, size: Number(d.size_bytes), addedAt: d.created_at }));
  const items = rows.map((row: any) => {
    let r = byId.get(row.tracker_compliance_id);
    const m: any = parseMeta(row.tracker_meta);
    const own = isOwn(row.tracker_compliance_id);
    // a compliance the person added from the list themselves does not follow from their answers: read it from the rules directly
    if (!r && m.manual && pack && ctx) { const c = pack.compliances.find((k) => k.id === row.tracker_compliance_id); if (c) r = toResult(pack, c, ctx, 'applies', today(p.country)); }
    if (own) return {
      id: row.id, complianceId: row.tracker_compliance_id, title: row.title, dueDate: row.due_date, status: row.status, urgency: urgency(row.due_date, row.status), notes: row.notes, completedAt: row.completed_at,
      form: null, head: 'My own', authority: '', frequency: m.repeat && m.repeat !== 'none' ? m.repeat : 'once', certainty: 'applies', period: null, brief: '', why: '', dueText: '', penalty: null, note: null,
      sourcePublisher: '', sourceChecked: null, sourceUrl: '', sourceTitle: '', verified: false, upcoming: [], needs: null, stillApplies: true, own: true, manual: false, docs: docsOf(row.tracker_compliance_id),
    };
    return {
      id: row.id, complianceId: row.tracker_compliance_id, title: row.title, dueDate: row.due_date, status: row.status, urgency: urgency(row.due_date, row.status), notes: row.notes, completedAt: row.completed_at,
      form: r?.form ?? m.form ?? null, head: r?.head ?? m.head ?? 'Other', authority: r?.authority ?? m.authority ?? '', frequency: r?.frequency ?? m.frequency ?? 'annual', certainty: r?.certainty ?? m.certainty ?? 'applies',
      period: m.period ?? null, brief: r?.brief ?? '', why: r?.why ?? '', dueText: r?.dueText ?? '', penalty: r?.penalty ?? null, penaltySourceUrl: r?.penaltySourceUrl ?? null, note: r?.note ?? null, sourcePublisher: r?.sourcePublisher ?? '', sourceChecked: r?.sourceChecked ?? null, sourceUrl: r?.sourceUrl ?? '', sourceTitle: r?.sourceTitle ?? '', verified: r?.verified ?? false,
      upcoming: r?.next ?? [], needs: r?.needs ?? null, stillApplies: !!r, own: false, manual: !!m.manual, docs: docsOf(row.tracker_compliance_id),
      rule: r?.rule ?? null, window: r?.window ?? null, passed: r?.passed ?? null, countedFrom: m.countedFrom ?? null,
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
  const results = evaluate(pack, sel, answers, today(p.country));
  const table = tableFor(p.kind), now = new Date().toISOString();
  const rows = await db.prepare(`SELECT id, tracker_compliance_id, status, due_date, tracker_meta FROM ${table} WHERE tracker_profile_id = ? AND user_id = ?`).all(p.id, p.user_id);
  const have = new Map<string, any>(rows.map((r: any) => [r.tracker_compliance_id, r]));
  const want = new Map(results.map((r) => [r.id, r]));
  const ctx = makeCtx(pack, sel, answers);
  await db.transaction(async (tx: any) => {
    await tx.prepare('UPDATE compliance_tracker_profiles SET answers = ?, label = COALESCE(?, label), pack_version = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(JSON.stringify(answers), label?.trim().slice(0, 120) || null, pack.version, now, p.id, p.user_id);
    if (label?.trim() && p.vault_entity_id) await tx.prepare('UPDATE personal_entities SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(label.trim().slice(0, 120), now, p.vault_entity_id, p.user_id);
    const refresh = async (row: any, r: Result) => {
      const m: any = parseMeta(row.tracker_meta);
      // a date the person set by hand is kept; a date we worked out is refreshed
      if (row.status === 'completed' || m.custom) return;
      // An overdue item the person has not filed stays overdue. A refresh (a rename, a rule change) works out the NEXT
      // date on or after today, and writing that here would make a missed filing vanish from the list.
      if (row.due_date && String(row.due_date).slice(0, 10) < today(p.country)) return;
      let pick: { date: string; period: string } | undefined = r.next[0];
      // a period the person already marked as filed never comes back, whatever the rule now says its date is
      if (m.filed && ctx) {
        const c = pack.compliances.find((k) => k.id === r.id);
        const later = c ? nextAfterFiled(datesFor(c, ctx, today(p.country), 16).dates, m.filed) : undefined;
        if (!later) return;                          // nothing later can be worked out: leave the item as the person left it
        pick = later;
      }
      const due = pick?.date ?? null;
      const nextMeta = { ...JSON.parse(meta(r)), period: pick?.period ?? null, ...(m.filed ? { filed: m.filed } : {}), ...(m.manual ? { manual: true } : {}) };
      await tx.prepare(`UPDATE ${table} SET due_date = ?, urgency = ?, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(due, urgency(due, row.status), JSON.stringify(nextMeta), now, row.id, p.user_id);
    };
    for (const r of results) {
      const row = have.get(r.id);
      if (!row) { await insertItem(tx, { userId: p.user_id, orgId: '' }, p.id, p.kind, p.vault_entity_id, r, now); continue; }
      await refresh(row, r);
    }
    for (const row of rows) {
      if (want.has(row.tracker_compliance_id) || isOwn(row.tracker_compliance_id)) continue;
      const m: any = parseMeta(row.tracker_meta);
      // a compliance the person added from the list keeps following its rule; their own items are never touched
      if (m.manual) { const c = ctx ? pack.compliances.find((k) => k.id === row.tracker_compliance_id) : undefined; if (c && ctx) await refresh(row, toResult(pack, c, ctx, 'applies', today(p.country))); continue; }
      // When the person changed an answer, filings that no longer apply go. When the rules themselves changed, they stay and are
      // flagged on the page, so nothing disappears from an account without the person seeing why.
      if (!opts.keepOrphans && row.status !== 'completed') await tx.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(row.id, p.user_id);
    }
  })();
}

/** Marking a filing done records it and moves the item to its next due date (for filings that repeat). */
export async function completeItem(db: any, p: ProfileRow, itemId: string): Promise<{ next: string | null; open?: boolean } | { error: string }> {
  const table = tableFor(p.kind);
  const row = await db.prepare(`SELECT id, title, due_date, tracker_compliance_id, tracker_meta FROM ${table} WHERE id = ? AND tracker_profile_id = ? AND user_id = ?`).get(itemId, p.id, p.user_id);
  if (!row) return { error: 'Not found' };
  const pack = await getPack(p.country);
  const c = pack?.compliances.find((k) => k.id === row.tracker_compliance_id);
  let m: any = {}; try { m = JSON.parse(row.tracker_meta || '{}'); } catch { /* keep empty */ }
  const now = new Date().toISOString();
  let next: { date: string; period: string } | null = null;
  if (isOwn(row.tracker_compliance_id)) {
    const n = REPEAT_MONTHS[m.repeat];
    // the next one after the date just filed, keeping the day the person chose (a monthly item due on the 31st falls on
    // each month's last day, never drifting to the 28th), and not skipping the months in between that are still owed
    if (n && row.due_date) { const day = m.anchorDay ?? Number(String(row.due_date).slice(8, 10)); next = { date: addMonthsOn(String(row.due_date).slice(0, 10), n, day), period: '' }; m.anchorDay = day; }
  } else if (pack && c && c.frequency !== 'event' && c.frequency !== 'once') {
    const x = makeCtx(pack, selOf(p), answersOf(p));
    if (x) {
      // The date that follows the one just filed, counted from the filed one and not from today: filing July when
      // August and September are also late must show August next, not skip to the next date still ahead.
      // a date the person set by hand (filing early) stands for the period whose rule date was ruleDate: what follows is
      // the period after THAT one, not the same instalment again
      const base0 = row.due_date ? String(row.due_date).slice(0, 10) : today(p.country);
      const base = m.ruleDate && m.ruleDate > base0 ? m.ruleDate : base0;
      const start = base < today(p.country) ? base : today(p.country);
      const from = new Date(new Date(start + 'T00:00:00Z').getTime() - 400 * 86400000).toISOString().slice(0, 10);
      next = nextAfterFiled(datesFor(c, x, from, 60).dates, { date: base, period: m.period ?? null }) ?? null;
    }
  }
  const w = !next && c && c.due.t === 'event' && !c.due.from ? windowOf(c.due) : null;
  // "at least once a year", "every 365 days": done today, so the next one is that long from today
  if (w?.kind === 'every') next = { date: deadlineFrom(today(p.country), w), period: '' };
  // A duty that comes round again and has no date we can work out stays OPEN after it is filed: a renewal that falls
  // due on the date printed on the new document (the person enters that date when they have it), or a yearly,
  // quarterly or monthly duty whose date is a rule in words. It used to be closed for good by the first filing.
  const repeats = !isOwn(row.tracker_compliance_id) && !!c && (w?.kind === 'until' || (c.due.t === 'event' && ['annual', 'semiannual', 'quarterly', 'monthly'].includes(c.frequency)));
  const open = !next && repeats;
  await db.transaction(async (tx: any) => {
    await tx.prepare('INSERT INTO compliance_tracker_history (id, profile_id, user_id, compliance_id, title, period, due_date, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(randomUUID(), p.id, p.user_id, row.tracker_compliance_id, row.title, m.period ?? null, row.due_date, now);
    if (next) {
      await tx.prepare(`UPDATE ${table} SET due_date = ?, status = 'pending', urgency = ?, completed_at = NULL, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(next.date, urgency(next.date, 'pending'), JSON.stringify({ ...m, ruleDate: undefined, period: next.period, custom: w?.kind === 'every', ...(w?.kind === 'every' ? { countedFrom: today(p.country) } : { countedFrom: undefined }), filed: { date: row.due_date, period: m.period ?? null } }), now, row.id, p.user_id);
    } else if (open) {
      await tx.prepare(`UPDATE ${table} SET due_date = NULL, status = 'pending', urgency = 'green', completed_at = NULL, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(JSON.stringify({ ...m, period: null, custom: false, countedFrom: undefined, lastFiled: now.slice(0, 10) }), now, row.id, p.user_id);
    } else {
      await tx.prepare(`UPDATE ${table} SET status = 'completed', urgency = 'green', completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(now, now, row.id, p.user_id);
    }
  })();
  if (open) return { next: null, open: true };
  return { next: next?.date ?? null };
}

/**
 * A duty with no calendar date ("within 15 days after the change"): the person says the day it happened (or the day it
 * was last done) and the deadline is worked out from the period the rule states. Kept like a date set by hand.
 */
export async function countFrom(db: any, p: ProfileRow, itemId: string, date: unknown): Promise<{ due: string } | { error: string }> {
  if (!isRealDate(date)) return { error: 'Enter a date' };
  const table = tableFor(p.kind);
  const row = await db.prepare(`SELECT id, status, tracker_compliance_id, tracker_meta FROM ${table} WHERE id = ? AND tracker_profile_id = ? AND user_id = ?`).get(itemId, p.id, p.user_id);
  if (!row) return { error: 'Not found' };
  const pack = await getPack(p.country);
  const c = pack?.compliances.find((k) => k.id === row.tracker_compliance_id);
  const w = c ? windowOf(c.due) : null;
  if (!w) return { error: 'This one states no period to count from. Set its date by hand instead.' };
  // `until`: the date on the document (its expiry, the birthday, the anniversary) is the deadline itself
  const due = w.kind === 'until' ? date : deadlineFrom(date, w), now = new Date().toISOString();
  const m: any = parseMeta(row.tracker_meta);
  await db.prepare(`UPDATE ${table} SET due_date = ?, status = 'pending', completed_at = NULL, urgency = ?, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(due, urgency(due, 'pending'), JSON.stringify({ ...m, custom: true, countedFrom: date }), now, row.id, p.user_id);
  return { due };
}

/**
 * When Service Master changes a rule (a new date, a new filing, a filing switched off), saved checks made under the
 * old rules are brought up to date: new filings are added, dates we worked out are refreshed, dates the person set by
 * hand and anything already filed are left alone. Called when the person opens their page and after a change is saved.
 */
export async function refreshIfRulesChanged(db: any, p: ProfileRow): Promise<boolean> {
  const pack = await getPack(p.country);
  // never re-work a saved list from rules that were not read from the database this time
  if (!pack || p.pack_version === pack.version || fromFallback()) return false;
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

// ── the person's own changes to the list ──
const FREQ_OWN: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', semiannual: 'Every 6 months', annual: 'Yearly' };

/** The compliances of this country that are not in the person's list yet, for "Add a compliance". */
export async function addable(db: any, p: ProfileRow) {
  const pack = await getPack(p.country); if (!pack) return [];
  const rows: any[] = await db.prepare(`SELECT tracker_compliance_id FROM ${tableFor(p.kind)} WHERE tracker_profile_id = ? AND user_id = ?`).all(p.id, p.user_id);
  const have = new Set(rows.map((r) => r.tracker_compliance_id));
  const dept = new Map(pack.departments.map((d) => [d.id, d.name]));
  // only what can apply to this kind of person or business in this place, whatever the answers: a person was offered
  // the corporation income tax return, other provinces' items and trust filings (190 entries for an Ontario individual)
  const x = makeCtx(pack, { ...selOf(p), depts: pack.departments.map((d) => d.id) }, {}, true);
  if (!x) return [];
  const can = { ...x, asked: askableQuestions(pack, x) };
  return pack.compliances.filter((c) => !have.has(c.id) && evalCond(c.applies, can)).map((c) => ({ id: c.id, name: c.name, form: c.form ?? null, head: c.head, dept: dept.get(c.dept) ?? c.dept, authority: c.authority, dueText: c.dueText }));
}

/** Add a compliance from the rules by hand: the person knows it applies even though their answers did not lead to it. */
export async function addFromList(db: any, p: ProfileRow, complianceId: string): Promise<{ id: string } | { error: string }> {
  const pack = await getPack(p.country);
  const c = pack?.compliances.find((k) => k.id === complianceId);
  const ctx = pack ? makeCtx(pack, selOf(p), answersOf(p)) : null;
  if (!pack || !c || !ctx) return { error: 'That compliance is not in the list' };
  // the same test as the list offered: something that cannot apply to this kind of person or business here is refused
  const open = makeCtx(pack, { ...selOf(p), depts: pack.departments.map((d) => d.id) }, {}, true)!;
  if (!evalCond(c.applies, { ...open, asked: askableQuestions(pack, open) })) return { error: 'That compliance cannot apply here' };
  const table = tableFor(p.kind);
  const dup = await db.prepare(`SELECT id FROM ${table} WHERE tracker_profile_id = ? AND user_id = ? AND tracker_compliance_id = ?`).get(p.id, p.user_id, c.id);
  if (dup) return { error: 'It is already in your list' };
  const now = new Date().toISOString();
  await db.transaction(async (tx: any) => { await insertItem(tx, { userId: p.user_id, orgId: '' }, p.id, p.kind, p.vault_entity_id, toResult(pack, c, ctx, 'applies', today(p.country)), now, { manual: true }); })();
  const row = await db.prepare(`SELECT id FROM ${table} WHERE tracker_profile_id = ? AND user_id = ? AND tracker_compliance_id = ?`).get(p.id, p.user_id, c.id);
  return { id: row.id };
}

/** Add something of the person's own to the list: a licence to renew, a filing we do not cover, anything with a date. */
export async function addOwn(db: any, p: ProfileRow, input: { title?: unknown; date?: unknown; repeat?: unknown; note?: unknown }): Promise<{ id: string } | { error: string }> {
  const title = String(input.title ?? '').trim().slice(0, 160);
  if (!title) return { error: 'Give it a name' };
  const date = input.date ? String(input.date) : null;
  if (date && !isRealDate(date)) return { error: 'Enter a date' };
  const repeat = ['monthly', 'quarterly', 'semiannual', 'annual'].includes(String(input.repeat)) ? String(input.repeat) : 'none';
  if (repeat !== 'none' && !date) return { error: 'Something that repeats needs its first date' };
  const note = String(input.note ?? '').trim().slice(0, 1000) || null;
  const table = tableFor(p.kind);
  const n = await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE tracker_profile_id = ? AND user_id = ? AND tracker_compliance_id LIKE 'custom:%'`).get(p.id, p.user_id);
  if (Number(n.n) >= 100) return { error: 'You can keep up to 100 items of your own in one list' };
  const id = randomUUID(), now = new Date().toISOString(), cid = `custom:${randomUUID()}`;
  const m = JSON.stringify({ own: true, repeat, head: 'My own' });
  if (p.kind === 'individual') {
    await db.prepare(`INSERT INTO personal_compliance_items (id, user_id, org_id, title, category, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, 'custom', ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(id, p.user_id, null, title, date, repeat === 'none' ? null : repeat, FREQ_OWN[repeat] ?? 'One time', urgency(date, 'pending'), note, now, now, p.id, cid, m);
  } else {
    await db.prepare(`INSERT INTO personal_entity_compliance (id, entity_id, user_id, org_id, title, category, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at, tracker_profile_id, tracker_compliance_id, tracker_meta)
      VALUES (?, ?, ?, ?, ?, 'custom', ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`).run(id, p.vault_entity_id, p.user_id, null, title, date, repeat === 'none' ? null : repeat, FREQ_OWN[repeat] ?? 'One time', urgency(date, 'pending'), note, now, now, p.id, cid, m);
  }
  return { id };
}

/** Change the person's note on any item, and the name and repeat of an item of their own. */
export async function editItem(db: any, p: ProfileRow, itemId: string, input: { title?: unknown; note?: unknown; repeat?: unknown }): Promise<{ ok: true } | { error: string }> {
  const table = tableFor(p.kind);
  const row = await db.prepare(`SELECT id, title, notes, tracker_compliance_id, tracker_meta FROM ${table} WHERE id = ? AND tracker_profile_id = ? AND user_id = ?`).get(itemId, p.id, p.user_id);
  if (!row) return { error: 'Not found' };
  const own = isOwn(row.tracker_compliance_id);
  let title = row.title; const m: any = parseMeta(row.tracker_meta);
  if (input.title !== undefined) { if (!own) return { error: 'Only the name of your own items can be changed' }; title = String(input.title).trim().slice(0, 160); if (!title) return { error: 'Give it a name' }; }
  if (input.repeat !== undefined && own) m.repeat = ['monthly', 'quarterly', 'semiannual', 'annual'].includes(String(input.repeat)) ? String(input.repeat) : 'none';
  const note = input.note === undefined ? row.notes : (String(input.note).trim().slice(0, 1000) || null);
  const now = new Date().toISOString();
  if (own) await db.prepare(`UPDATE ${table} SET title = ?, notes = ?, tracker_meta = ?, recurrence_rule = ?, recurrence_label = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
    .run(title, note, JSON.stringify(m), m.repeat && m.repeat !== 'none' ? m.repeat : null, FREQ_OWN[m.repeat] ?? 'One time', now, row.id, p.user_id);
  else await db.prepare(`UPDATE ${table} SET notes = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(note, now, row.id, p.user_id);
  return { ok: true };
}
