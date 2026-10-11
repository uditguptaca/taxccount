'use client';
// The same questionnaire with nothing behind it: answers live in the browser only. Used by the admin's
// preview of the T1 template so an administrator can try the REAL form (every rule, branch and language).
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { applicable, checklist, progress, provinceOf } from '@/lib/t1/evaluate';
import { validate } from '@/lib/t1/validate';
import { ak } from '@/lib/t1/types';
import type { Answer, AnswerMap, AnswerValue, Ctx, Lang, Province } from '@/lib/t1/types';
import type { Intake } from './useIntake';

export function useSandboxIntake(year: number, province: Province | '', seed: AnswerMap, resetKey: string): Intake {
  const [lang, setLang] = useState<Lang>('en');
  const [state, setState] = useState<{ key: string; answers: AnswerMap; records: Record<string, number[]> }>({ key: '', answers: {}, records: {} });
  // switching the scenario starts from its answers
  if (state.key !== resetKey) {
    const answers: AnswerMap = { ...seed };
    if (province) answers[ak('B.res.province')] = { v: province };
    const records: Record<string, number[]> = {};
    for (const k of Object.keys(answers)) { const i = k.lastIndexOf('|'); const q = CATALOGUE.q.get(k.slice(0, i)); const rec = Number(k.slice(i + 1)); if (q && CATALOGUE.sec.get(q.sec)?.repeat) { const l = (records[q.sec] ??= []); if (!l.includes(rec)) l.push(rec); } }
    setState({ key: resetKey, answers, records });
  }
  const { answers, records } = state;
  const engagement = useMemo(() => ({ id: 'preview', taxYear: String(year), province: province || null, status: 'not_started', taxpayerName: lang === 'fr' ? 'Contribuable (aperçu)' : 'Preview taxpayer', filingType: 'original', currentStep: 'welcome' }), [year, province, lang]);

  const setValue = useCallback((questionId: string, recordIndex: number, value: AnswerValue | null) => {
    setState((s) => { const key = ak(questionId, recordIndex), cur = s.answers[key] ?? {}; const next: Answer = { ...cur, v: value === null ? undefined : value }; if (next.flag === 'later') delete next.flag; return { ...s, answers: { ...s.answers, [key]: next } }; });
  }, []);
  const setFlag = useCallback((questionId: string, recordIndex: number, flag: 'unsure' | 'later' | 'ask' | null, note?: string) => {
    setState((s) => { const key = ak(questionId, recordIndex), cur = { ...(s.answers[key] ?? {}) }; if (flag) { cur.flag = flag; if (note !== undefined) cur.note = note; } else { delete cur.flag; delete cur.note; } return { ...s, answers: { ...s.answers, [key]: cur } }; });
  }, []);
  const addRecord = useCallback(async (sectionId: string) => {
    let idx = 0;
    setState((s) => { const l = s.records[sectionId] ?? []; idx = l.length ? Math.max(...l) + 1 : 0; return { ...s, records: { ...s.records, [sectionId]: [...l, idx] } }; });
    return idx;
  }, []);
  const removeRecord = useCallback(async (sectionId: string, recordIndex: number) => {
    setState((s) => { const sec = CATALOGUE.sec.get(sectionId); const a = { ...s.answers }; if (sec) for (const q of sec.qs) delete a[ak(q.id, recordIndex)]; return { ...s, answers: a, records: { ...s.records, [sectionId]: (s.records[sectionId] ?? []).filter((x) => x !== recordIndex) } }; });
    return true;
  }, []);

  const ctx: Ctx = useMemo(() => ({ year, answers, records, province: province || null, filingType: 'original' }), [year, answers, records, province]);
  const slots = useMemo(() => applicable(CATALOGUE, ctx), [ctx]);
  const prog = useMemo(() => progress(CATALOGUE, ctx, slots), [ctx, slots]);
  const dctx = useDeferredValue(ctx);
  const findings = useMemo(() => validate(CATALOGUE, dctx, { uploads: [] }), [dctx]);
  const docs = useMemo(() => checklist(CATALOGUE, dctx, [], slots), [dctx, slots]);
  const noop = useCallback(async () => {}, []);

  return {
    loading: false, loadError: '', engagement, answers, records, documents: [], legacy: [], serverFindings: [], editable: true, isClient: true, formVersionChanged: false,
    lang, setLang, saveState: 'saved', saveMessage: '', conflictCount: 0, flushNow: noop, retry: noop,
    setValue, setFlag, addRecord, removeRecord,
    upload: async () => (lang === 'fr' ? "Le téléversement est désactivé dans l'aperçu." : 'Uploads are turned off in the preview.'), removeDoc: async () => false,
    submit: async () => ({ ok: false, error: lang === 'fr' ? "La soumission est désactivée dans l'aperçu." : 'Submitting is turned off in the preview.' }),
    setStep: () => {}, reload: noop, reloadFindings: noop, ctx, slots, prog, findings, docs, uploads: [], province: provinceOf(ctx), year,
  } as unknown as Intake;
}
