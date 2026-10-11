'use client';
// The intake's working state in the browser: loads everything once, applies edits instantly, saves them in
// the background in batches, and says honestly whether the latest edit is saved. It never throws an edit away:
// a failed save keeps the edit queued and retries.
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { applicable, checklist, progress, provinceOf } from '@/lib/t1/evaluate';
import { validate } from '@/lib/t1/validate';
import { ak } from '@/lib/t1/types';
import type { Answer, AnswerMap, AnswerValue, Ctx, Finding, Lang, UploadedDoc } from '@/lib/t1/types';

export type SaveState = 'saved' | 'saving' | 'pending' | 'error' | 'locked';
export interface Pending { questionId: string; recordIndex: number; value?: AnswerValue | null; flag?: string | null; flagNote?: string | null; rowVersion?: number }

export function useIntake(engagementId: string) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [engagement, setEngagement] = useState<any>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [records, setRecords] = useState<Record<string, number[]>>({});
  const [documents, setDocuments] = useState<any[]>([]);
  const [legacy, setLegacy] = useState<any[]>([]);
  const [serverFindings, setServerFindings] = useState<Finding[]>([]);
  const [editable, setEditable] = useState(true);
  const [isClient, setIsClient] = useState(true);
  const [formVersionChanged, setFormVersionChanged] = useState(false);
  const [lang, setLangState] = useState<Lang>('en');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [saveMessage, setSaveMessage] = useState('');
  const [conflictCount, setConflictCount] = useState(0);
  const versions = useRef<Record<string, number>>({});
  const queue = useRef<Map<string, Pending>>(new Map());
  const timer = useRef<any>(null);
  const inflight = useRef(false);
  const step = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tax-intake/${engagementId}/state`, { cache: 'no-store' });
    if (!res.ok) { setLoadError(res.status === 401 ? 'We could not open this form. Please sign in again.' : 'We could not load this form.'); setLoading(false); return; }
    const d = await res.json();
    setEngagement(d.engagement); setAnswers(d.answers || {}); setRecords(d.records || {}); setDocuments(d.documents || []); setLegacy(d.legacy || []);
    setServerFindings(d.findings || []); setEditable(!!d.editable); setIsClient(!!d.isClient); setFormVersionChanged(!!d.formVersionChanged);
    versions.current = d.versions || {};
    setLangState(d.engagement?.language === 'fr' ? 'fr' : 'en');
    setSaveState(d.editable ? 'saved' : 'locked');
    setLoading(false);
  }, [engagementId]);
  useEffect(() => { load().catch(() => { setLoadError('We could not load this form.'); setLoading(false); }); }, [load]);

  // ── saving ──
  const flush = useCallback(async () => {
    if (inflight.current || queue.current.size === 0) return;
    inflight.current = true; setSaveState('saving');
    const batch = Array.from(queue.current.values()).slice(0, 200);
    batch.forEach((b) => queue.current.delete(ak(b.questionId, b.recordIndex)));
    try {
      const res = await fetch(`/api/tax-intake/${engagementId}/responses`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responses: batch.map((b) => ({ ...b, rowVersion: versions.current[ak(b.questionId, b.recordIndex)] })), language: lang, currentStep: step.current }) });
      if (res.status === 423) { setSaveState('locked'); setEditable(false); inflight.current = false; return; }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'save failed');
      const out = await res.json();
      // the server's newer values win over a collision; tell the person
      if (out.conflicts?.length) {
        setConflictCount((c) => c + out.conflicts.length);
        setAnswers((prev) => { const next = { ...prev }; for (const c of out.conflicts) { next[ak(c.questionId, c.recordIndex)] = { ...(c.current.value !== undefined ? { v: c.current.value } : {}), ...(c.current.flag ? { flag: c.current.flag } : {}) }; versions.current[ak(c.questionId, c.recordIndex)] = c.current.version; } return next; });
      }
      // learn the new row versions with one light read so the next save is checked against them
      const fresh = await fetch(`/api/tax-intake/${engagementId}/state`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
      if (fresh) { versions.current = { ...fresh.versions }; setServerFindings(fresh.findings || []); setDocuments(fresh.documents || []); }
      inflight.current = false;
      if (queue.current.size) { setSaveState('pending'); timer.current = setTimeout(flush, 300); } else { setSaveState('saved'); setSaveMessage(''); }
    } catch (e: any) {
      for (const b of batch) if (!queue.current.has(ak(b.questionId, b.recordIndex))) queue.current.set(ak(b.questionId, b.recordIndex), b);
      inflight.current = false; setSaveState('error'); setSaveMessage(e?.message || 'save failed');
      timer.current = setTimeout(flush, 6000);   // keep trying; the edits stay on screen
    }
  }, [engagementId, lang]);

  const queueChange = useCallback((c: Pending) => {
    queue.current.set(ak(c.questionId, c.recordIndex), c);
    setSaveState('pending');
    clearTimeout(timer.current); timer.current = setTimeout(flush, 700);
  }, [flush]);

  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (queue.current.size || inflight.current) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  // ── edits ──
  const answersRef = useRef<AnswerMap>({}); useEffect(() => { answersRef.current = answers; }, [answers]);

  const setValue = useCallback((questionId: string, recordIndex: number, value: AnswerValue | null) => {
    const hadLater = answersRef.current[ak(questionId, recordIndex)]?.flag === 'later';
    setAnswers((prev) => {
      const key = ak(questionId, recordIndex), cur = prev[key] ?? {};
      const next: Answer = { ...cur, v: value === null ? undefined : value };
      if (next.flag === 'later') delete next.flag;   // an answer settles "I'll provide it later"
      return { ...prev, [key]: next };
    });
    queueChange(hadLater ? { questionId, recordIndex, value, flag: null, flagNote: null } : { questionId, recordIndex, value });
  }, [queueChange]);

  const setFlag = useCallback((questionId: string, recordIndex: number, flag: 'unsure' | 'later' | 'ask' | null, note?: string) => {
    setAnswers((prev) => {
      const key = ak(questionId, recordIndex), cur = { ...(prev[key] ?? {}) };
      if (flag) { cur.flag = flag; if (note !== undefined) cur.note = note; } else { delete cur.flag; delete cur.note; }
      return { ...prev, [key]: cur };
    });
    queueChange({ questionId, recordIndex, flag: flag ?? null, flagNote: flag ? note ?? undefined : null });
  }, [queueChange]);

  const addRecord = useCallback(async (sectionId: string): Promise<number | null> => {
    const res = await fetch(`/api/tax-intake/${engagementId}/records`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sectionId }) });
    if (!res.ok) { setSaveMessage((await res.json().catch(() => ({}))).error || 'Could not add'); return null; }
    const d = await res.json();
    setRecords((r) => ({ ...r, [sectionId]: [...(r[sectionId] ?? []), d.recordIndex] }));
    return d.recordIndex;
  }, [engagementId]);

  const removeRecord = useCallback(async (sectionId: string, recordIndex: number) => {
    await flushNow();
    const res = await fetch(`/api/tax-intake/${engagementId}/records?sectionId=${encodeURIComponent(sectionId)}&recordIndex=${recordIndex}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setRecords((r) => ({ ...r, [sectionId]: (r[sectionId] ?? []).filter((x) => x !== recordIndex) }));
    setAnswers((prev) => { const sec = CATALOGUE.sec.get(sectionId); const next = { ...prev }; if (sec) for (const q of sec.qs) delete next[ak(q.id, recordIndex)]; return next; });
    await reloadFindings();
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagementId]);

  const flushNow = useCallback(async () => { clearTimeout(timer.current); for (let i = 0; i < 5 && (queue.current.size || inflight.current); i++) { await flush(); await new Promise((r) => setTimeout(r, 120)); } }, [flush]);
  const reloadFindings = useCallback(async () => { const d = await fetch(`/api/tax-intake/${engagementId}/state`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null); if (d) { setServerFindings(d.findings || []); versions.current = { ...d.versions }; setDocuments(d.documents || []); } }, [engagementId]);

  const upload = useCallback(async (file: File, meta: { questionId: string; recordIndex: number; docKey?: string; issuer?: string; taxYear?: string; slipStatus?: string }): Promise<string | null> => {
    const fd = new FormData(); fd.append('file', file);
    for (const [k, v] of Object.entries(meta)) if (v !== undefined && v !== '') fd.append(k, String(v));
    const res = await fetch(`/api/tax-intake/${engagementId}/documents`, { method: 'POST', body: fd });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return d.error || 'The upload failed';
    setAnswers((prev) => { const key = ak(meta.questionId, meta.recordIndex); const cur = { ...(prev[key] ?? {}) }; if (cur.flag === 'later') delete cur.flag; return { ...prev, [key]: cur }; });
    await reloadFindings();
    return null;
  }, [engagementId, reloadFindings]);

  const removeDoc = useCallback(async (docId: string) => {
    const res = await fetch(`/api/tax-intake/${engagementId}/documents?docId=${encodeURIComponent(docId)}`, { method: 'DELETE' });
    if (res.ok) await reloadFindings();
    return res.ok;
  }, [engagementId, reloadFindings]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    fetch(`/api/tax-intake/${engagementId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: l }) }).catch(() => {});
  }, [engagementId]);

  const setStep = useCallback((s: string) => { step.current = s; fetch(`/api/tax-intake/${engagementId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentStep: s }) }).catch(() => {}); }, [engagementId]);

  const submit = useCallback(async (acks: any): Promise<{ ok: boolean; error?: string; blocking?: Finding[] }> => {
    await flushNow();
    if (queue.current.size) return { ok: false, error: 'Some answers are not saved yet. Please check your connection and try again.' };
    const res = await fetch(`/api/tax-intake/${engagementId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientAcknowledgements: acks }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: d.error, blocking: d.blocking };
    await load();
    return { ok: true };
  }, [engagementId, flushNow, load]);

  // ── derived from the shared rules ──
  const year = Number(engagement?.taxYear) || 2025;
  const ctx: Ctx = useMemo(() => ({ year, answers, records, province: engagement?.province || null, filingType: engagement?.filingType }), [year, answers, records, engagement?.province, engagement?.filingType]);
  const uploads: UploadedDoc[] = useMemo(() => documents.map((d) => ({ id: d.id, docKey: d.doc_key, questionId: d.question_id, recordIndex: d.record_index ?? 0, fileName: d.file_name, taxYear: d.tax_year, slipStatus: d.slip_status, issuer: d.issuer, hash: d.content_hash })), [documents]);
  const slots = useMemo(() => applicable(CATALOGUE, ctx), [ctx]);
  const prog = useMemo(() => progress(CATALOGUE, ctx, slots), [ctx, slots]);
  const deferredCtx = useDeferredValue(ctx);
  const findings = useMemo(() => validate(CATALOGUE, deferredCtx, { uploads }), [deferredCtx, uploads]);
  const docs = useMemo(() => checklist(CATALOGUE, deferredCtx, uploads), [deferredCtx, uploads]);
  const province = provinceOf(ctx);

  return { loading, loadError, engagement, answers, records, documents, legacy, serverFindings, editable, isClient, formVersionChanged, lang, setLang, saveState, saveMessage, conflictCount, flushNow, retry: flush,
    setValue, setFlag, addRecord, removeRecord, upload, removeDoc, submit, setStep, reload: load, reloadFindings, ctx, slots, prog, findings, docs, uploads, province, year };
}
export type Intake = ReturnType<typeof useIntake>;
