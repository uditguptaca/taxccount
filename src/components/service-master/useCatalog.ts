'use client';
// Loads Service Master's data and sends changes. Every screen shares this.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogItem, Kind } from '@/lib/compliance/catalog';
import type { CountryPack } from '@/lib/compliance/types';

export interface CountryFigures { code: string; name: string; active: boolean; version: string | null; states: number; entityTypes: number; departments: number; heads: number; compliances: number; verified: number; questions: number; infoQuestions: number; penalties: number; sources: number; edited: number; off: number; problems: number }
export interface Change { id: string; country: string; kind: string; item_id: string; action: string; user_name: string; created_at: string; before_json: string | null; after_json: string | null }
export type SaveOutcome = { ok: true; refreshed?: number } | { ok: false; error: string; problems: string[] };

const API = '/api/platform/service-master/catalog';
const KEY = 'sm_country';

export function useCatalog() {
  const [countries, setCountries] = useState<CountryFigures[]>([]);
  const [use, setUse] = useState({ profiles: 0, items: 0 });
  const [changes, setChanges] = useState<Change[]>([]);
  const [country, setCountryState] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [pack, setPack] = useState<CountryPack | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    const r = await fetch(API, { cache: 'no-store' });
    const d = await r.json();
    if (!r.ok) { setError(d.error || 'Could not load Service Master'); return [] as CountryFigures[]; }
    setCountries(d.countries); setUse(d.use); setChanges(d.changes);
    return d.countries as CountryFigures[];
  }, []);
  const loadCountry = useCallback(async (code: string) => {
    if (!code) return;
    const r = await fetch(`${API}?country=${code}`, { cache: 'no-store' });
    const d = await r.json();
    if (!r.ok) { setError(d.error || 'Could not load the country'); return; }
    setItems(d.items); setPack(d.pack); setProblems(d.problems); setError('');
  }, []);

  useEffect(() => { (async () => {
    const list = await loadOverview();
    let c = ''; try { c = localStorage.getItem(KEY) || ''; } catch { /* private window */ }
    if (!list.some((x) => x.code === c)) c = list[0]?.code ?? '';
    setCountryState(c); await loadCountry(c); setLoading(false);
  })(); }, [loadOverview, loadCountry]);

  const setCountry = useCallback(async (c: string) => { setCountryState(c); try { localStorage.setItem(KEY, c); } catch { /* ignore */ } setLoading(true); await loadCountry(c); setLoading(false); }, [loadCountry]);
  const reload = useCallback(async () => { await Promise.all([loadOverview(), loadCountry(country)]); }, [loadOverview, loadCountry, country]);

  const send = useCallback(async (method: string, url: string, body?: object): Promise<SaveOutcome> => {
    try {
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, error: d.error || 'Could not save', problems: d.problems || [] };
      await reload();
      return { ok: true, refreshed: d.refreshed };
    } catch { return { ok: false, error: 'Could not reach the server', problems: [] }; }
  }, [reload]);

  const save = useCallback((kind: Kind, id: string, data: object, opts: { active?: boolean; sortOrder?: number; country?: string } = {}) => send('POST', API, { country: opts.country ?? country, kind, id, data, active: opts.active, sortOrder: opts.sortOrder }), [send, country]);
  const remove = useCallback((kind: Kind, id: string, c?: string) => send('DELETE', `${API}?country=${c ?? country}&kind=${kind}&id=${encodeURIComponent(id)}`), [send, country]);
  const undo = useCallback((historyId: string) => send('POST', API, { action: 'undo', historyId }), [send]);
  const restore = useCallback((kind: Kind, id: string) => send('POST', API, { action: 'restore', country, kind, id }), [send, country]);
  const addCountry = useCallback((code: string, name: string, currency: string, stateLabel: string) => send('POST', API, { action: 'add-country', code, name, currency, stateLabel }), [send]);

  const of = useCallback((kind: Kind) => items.filter((i) => i.kind === kind), [items]);
  const figures = useMemo(() => countries.find((c) => c.code === country), [countries, country]);
  return { countries, use, changes, country, setCountry, items, of, pack, problems, loading, error, reload, save, remove, undo, restore, addCountry, figures };
}
export type Catalog = ReturnType<typeof useCatalog>;
