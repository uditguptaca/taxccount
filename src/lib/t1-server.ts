// Server side of the T1 intake: reads the saved state into the shared engine's shape, saves answers with
// history, and keeps one review item per finding. Everything about WHAT is asked or required comes from
// src/lib/t1 (the same code the screens run).
import { randomUUID } from 'crypto';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { validate } from '@/lib/t1/validate';
import { provinceOf, progress } from '@/lib/t1/evaluate';
import { ak } from '@/lib/t1/types';
import type { Answer, AnswerMap, AnswerValue, Ctx, Finding, UploadedDoc } from '@/lib/t1/types';
import { PROVINCE_Q } from '@/lib/t1/evaluate';

const FLAGS = { unsure: 'unsure', later: 'later', ask: 'ask', ask_preparer: 'ask', provide_later: 'later' } as const;
export const normFlag = (f: unknown): 'unsure' | 'later' | 'ask' | undefined => (typeof f === 'string' && f in FLAGS ? (FLAGS as any)[f] : undefined);

export const encodeValue = (v: AnswerValue | undefined): string | null => (v === undefined || v === null ? null : JSON.stringify(v));
export function decodeValue(s: string | null): AnswerValue | undefined {
  if (s === null || s === undefined) return undefined;
  try { return JSON.parse(s); } catch { return s; }   // answers saved by the earlier, shorter form are plain text
}

export interface State {
  engagement: any;
  answers: AnswerMap;
  versions: Record<string, number>;
  records: Record<string, number[]>;
  documents: any[];
  legacy: { questionId: string; recordIndex: number; value: AnswerValue | undefined; flag?: string }[];
}

export async function loadState(db: any, engagement: any): Promise<State> {
  const rows = await db.prepare('SELECT question_id, record_index, value, flag, flag_note, row_version FROM tax_intake_responses WHERE engagement_id = ?').all(engagement.id);
  const answers: AnswerMap = {}, versions: Record<string, number> = {}, legacy: State['legacy'] = [];
  for (const r of rows) {
    const v = decodeValue(r.value);
    if (!CATALOGUE.q.has(r.question_id)) { legacy.push({ questionId: r.question_id, recordIndex: r.record_index, value: v, flag: r.flag ?? undefined }); continue; }
    const a: Answer = {};
    if (v !== undefined) a.v = v;
    const f = normFlag(r.flag); if (f) a.flag = f;
    if (r.flag_note) a.note = r.flag_note;
    answers[ak(r.question_id, r.record_index)] = a;
    versions[ak(r.question_id, r.record_index)] = r.row_version ?? 1;
  }
  const recRows = await db.prepare('SELECT section_id, record_index FROM tax_intake_repeat_records WHERE engagement_id = ? AND removed_at IS NULL ORDER BY record_index').all(engagement.id);
  const records: Record<string, number[]> = {};
  for (const r of recRows) (records[r.section_id] ??= []).push(r.record_index);
  const documents = await db.prepare(`SELECT id, document_file_id, question_id, section_id, record_index, file_name, file_type, file_size_bytes, upload_status, doc_key, issuer, tax_year, slip_status, content_hash, uploaded_by, created_at, verified_at, preparer_note FROM tax_intake_documents WHERE engagement_id = ? ORDER BY created_at`).all(engagement.id);
  return { engagement, answers, versions, records, documents, legacy };
}

export const ctxOf = (st: State): Ctx => ({
  year: Number(st.engagement.tax_year) || 2025, answers: st.answers, records: st.records,
  province: (st.engagement.province as any) || null, filingType: st.engagement.filing_type,
});
export const uploadsOf = (st: State): UploadedDoc[] => st.documents.map((d) => ({ id: d.id, docKey: d.doc_key, questionId: d.question_id, recordIndex: d.record_index ?? 0, fileName: d.file_name, taxYear: d.tax_year, slipStatus: d.slip_status, issuer: d.issuer, hash: d.content_hash }));
export const findingsOf = (st: State): Finding[] => validate(CATALOGUE, ctxOf(st), { uploads: uploadsOf(st) });

export interface Change { questionId: string; recordIndex?: number; value?: AnswerValue | null; flag?: string | null; flagNote?: string | null; rowVersion?: number }

/**
 * Saves a batch of answers. Each change is checked against the version the client last saw: if someone else
 * changed that answer in between, it is NOT overwritten and is returned as a conflict.
 * Answers for questions that no longer apply are kept (never deleted). Returns what happened to each.
 */
export async function saveAnswers(db: any, engagement: any, changes: Change[], by: { userId: string; role: string }): Promise<{ saved: number; conflicts: { questionId: string; recordIndex: number; current: { value: AnswerValue | undefined; flag?: string; version: number } }[]; unknown: string[] }> {
  const now = new Date().toISOString();
  const conflicts: any[] = [], unknown: string[] = [];
  let saved = 0;
  await db.transaction(async (tx: any) => {
    for (const c of changes) {
      if (!c || typeof c.questionId !== 'string') continue;
      const q = CATALOGUE.q.get(c.questionId);
      if (!q) { unknown.push(c.questionId); continue; }
      const rec = Number.isInteger(c.recordIndex) && (c.recordIndex as number) >= 0 ? (c.recordIndex as number) : 0;
      const cur = await tx.prepare('SELECT id, value, flag, flag_note, row_version FROM tax_intake_responses WHERE engagement_id = ? AND question_id = ? AND record_index = ?').get(engagement.id, c.questionId, rec);
      if (cur && c.rowVersion !== undefined && c.rowVersion !== cur.row_version) {
        conflicts.push({ questionId: c.questionId, recordIndex: rec, current: { value: decodeValue(cur.value), flag: cur.flag ?? undefined, version: cur.row_version } });
        continue;
      }
      let value: string | null = c.value === undefined ? (cur ? cur.value : null) : encodeValue(c.value as AnswerValue);
      if (typeof c.value === 'string' && c.value.trim() === '') value = null;
      const flag = c.flag === undefined ? (cur?.flag ?? null) : normFlag(c.flag) ?? null;
      const note = c.flagNote === undefined ? (cur?.flag_note ?? null) : (c.flagNote ? String(c.flagNote).slice(0, 2000) : null);
      if (cur && cur.value === value && (cur.flag ?? null) === flag && (cur.flag_note ?? null) === note) continue;   // nothing changed
      if (value !== null && value.length > 100000) continue;
      if (cur) {
        await tx.prepare('UPDATE tax_intake_responses SET value = ?, flag = ?, flag_note = ?, row_version = row_version + 1, updated_at = ?, updated_by = ?, catalogue_version = ? WHERE id = ?')
          .run(value, flag, note, now, by.userId, CATALOGUE.version, cur.id);
      } else {
        await tx.prepare('INSERT INTO tax_intake_responses (id, engagement_id, question_id, record_index, value, flag, flag_note, created_at, updated_at, updated_by, catalogue_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(randomUUID(), engagement.id, c.questionId, rec, value, flag, note, now, now, by.userId, CATALOGUE.version);
      }
      await tx.prepare('INSERT INTO tax_intake_response_history (id, engagement_id, question_id, record_index, value, flag, flag_note, action, changed_by, changed_by_role, catalogue_version, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), engagement.id, c.questionId, rec, value, flag, note, 'set', by.userId, by.role, CATALOGUE.version, now);
      if (q.sec && CATALOGUE.sec.get(q.sec)?.repeat) {
        await tx.prepare('INSERT INTO tax_intake_repeat_records (id, engagement_id, section_id, record_index, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (engagement_id, section_id, record_index) DO UPDATE SET removed_at = NULL, removed_by = NULL')
          .run(randomUUID(), engagement.id, q.sec, rec, now);
      }
      saved++;
    }
    // the province decides which provincial pages apply: keep the engagement row in step with the answer
    const prov = changes.find((c) => c.questionId === PROVINCE_Q && typeof c.value === 'string');
    const provValue = prov && typeof prov.value === 'string' && /^[A-Z]{2}$/.test(prov.value) ? prov.value : null;
    await tx.prepare(`UPDATE tax_intake_engagements SET updated_at = ?, last_saved_at = ?, last_saved_by = ?, row_version = row_version + 1, catalogue_version = COALESCE(catalogue_version, ?),
      province = COALESCE(?, province),
      status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END WHERE id = ?`).run(now, now, by.userId, CATALOGUE.version, provValue, engagement.id);
  })();
  return { saved, conflicts, unknown };
}

/**
 * One review item per finding, matched by its key. A finding that is gone closes its open item automatically;
 * an item the preparer already resolved or deferred is left as they set it.
 */
export async function syncFindings(db: any, engagementId: string, findings: Finding[]): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.prepare("SELECT id, dedupe_key, status, resolved_by FROM tax_intake_review_items WHERE engagement_id = ? AND dedupe_key IS NOT NULL").all(engagementId);
  const byKey = new Map<string, any>(existing.map((r: any) => [r.dedupe_key, r]));
  const live = new Set(findings.map((f) => f.key));
  await db.transaction(async (tx: any) => {
    for (const f of findings) {
      if (f.sev === 'info' && f.kind === 'later') continue;   // a document promised for later is shown in the checklist, not as an item
      const cur = byKey.get(f.key);
      const type = f.kind === 'ask' ? 'client_question' : f.kind === 'unsure' ? 'client_unsure' : f.kind === 'required' ? 'missing_required' : f.kind === 'duplicate' ? 'duplicate_slip' : f.kind === 'specialist' ? 'specialist_referral' : f.kind === 'mismatch' ? 'document_mismatch' : 'validation_warning';
      if (!cur) {
        await tx.prepare(`INSERT INTO tax_intake_review_items (id, engagement_id, question_id, record_index, type, title, description, status, created_at, updated_at, dedupe_key, severity, source, module_code, specialist)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, 'rule', ?, ?) ON CONFLICT DO NOTHING`)
          .run(randomUUID(), engagementId, f.questionId ?? null, f.rec ?? 0, type, f.title[0].slice(0, 400), f.detail ? f.detail[0].slice(0, 1000) : null, now, now, f.key, f.sev, f.mod ?? null, f.specialist ?? null);
      } else if (cur.status === 'resolved' && cur.resolved_by === 'system') {
        await tx.prepare("UPDATE tax_intake_review_items SET status = 'open', resolved_at = NULL, resolved_by = NULL, updated_at = ? WHERE id = ?").run(now, cur.id);
      }
    }
    for (const r of existing) {
      if (!live.has(r.dedupe_key) && (r.status === 'open' || r.status === 'in_progress')) {
        await tx.prepare("UPDATE tax_intake_review_items SET status = 'resolved', resolved_at = ?, resolved_by = 'system', updated_at = ? WHERE id = ?").run(now, now, r.id);
      }
    }
  })();
}

/** Re-run the rules after any change: one review item per finding, and the numbers the list screen shows. */
export async function refresh(db: any, engagementId: string): Promise<{ state: State; findings: Finding[] }> {
  const eng = await db.prepare('SELECT * FROM tax_intake_engagements WHERE id = ?').get(engagementId);
  const state = await loadState(db, eng);
  const findings = findingsOf(state);
  await syncFindings(db, engagementId, findings);
  const pct = progress(CATALOGUE, ctxOf(state)).overall.percent;
  const blocking = findings.filter((f) => f.sev === 'blocking').length;
  const flags = findings.filter((f) => f.kind === 'ask' || f.kind === 'unsure' || f.sev === 'specialist').length;
  await db.prepare('UPDATE tax_intake_engagements SET progress_pct = ?, open_blocking = ?, open_flags = ? WHERE id = ?').run(pct, blocking, flags, engagementId);
  return { state, findings };
}

export const lang = (e: any): 'en' | 'fr' => (e?.language === 'fr' ? 'fr' : 'en');
export { provinceOf };
