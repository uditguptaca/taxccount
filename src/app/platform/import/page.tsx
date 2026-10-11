'use client';
import { useRef, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

type Step = 'address' | 'review' | 'copying' | 'done';
interface PlanTable { table: string; oldRows: number; newRows: number; ignoredOldColumns: string[]; newRequiredMissing: string[] }
interface Plan { tables: PlanTable[]; onlyInOld: { table: string; rows: number }[]; warnings: string[]; oldHasPlatformAdmin: boolean }
interface Row { table: string; total: number; read: number; inserted: number; alreadyThere: number; parked: number; failed: number; errors: string[]; state: 'waiting' | 'running' | 'done' | 'error' }

const CHUNK = 1000;

export default function ImportPage() {
  const [step, setStep] = useState<Step>('address');
  const [url, setUrl] = useState('');           // lives in this page's memory only; never saved
  const [mode, setMode] = useState<'replace' | 'add'>('replace');
  const [confirm, setConfirm] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  const [prepared, setPrepared] = useState(false);
  const stop = useRef(false);

  async function call(body: any) {
    const res = await fetch('/api/platform/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, ...body }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `The server answered ${res.status}.`);
    return data;
  }

  async function check() {
    setBusy(true); setError('');
    try {
      const p: Plan = await call({ action: 'plan' });
      setPlan(p);
      if (!p.oldHasPlatformAdmin) setMode('add');
      setStep('review');
    } catch (e: any) { setError(e.message); }
    setBusy(false);
  }

  const update = (table: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.table === table ? { ...r, ...patch } : r)));

  async function run() {
    if (!plan) return;
    setBusy(true); setError(''); stop.current = false; setStep('copying');
    try {
      if (mode === 'replace' && !prepared) { await call({ action: 'prepare', confirm }); setPrepared(true); }
      const todo = rows.length ? rows : plan.tables.filter((t) => t.oldRows > 0).map((t): Row => ({ table: t.table, total: t.oldRows, read: 0, inserted: 0, alreadyThere: 0, parked: 0, failed: 0, errors: [], state: 'waiting' }));
      if (!rows.length) setRows(todo);
      for (const t of todo) {
        if (t.state === 'done') continue;
        if (stop.current) throw new Error('Stopped. Press Continue to carry on from where it stopped.');
        update(t.table, { state: 'running' });
        let offset = t.read, acc = { ...t };
        for (;;) {
          const r = await call({ action: 'copy', table: t.table, offset, limit: CHUNK });
          offset = r.nextOffset;
          acc = { ...acc, read: offset, inserted: acc.inserted + r.inserted, alreadyThere: acc.alreadyThere + r.alreadyThere, parked: acc.parked + r.parked, failed: acc.failed + r.failed, errors: [...acc.errors, ...r.errors].slice(0, 3) };
          update(t.table, { read: acc.read, inserted: acc.inserted, alreadyThere: acc.alreadyThere, parked: acc.parked, failed: acc.failed, errors: acc.errors });
          if (r.done) break;
        }
        update(t.table, { state: 'done' });
      }
      const rep = await call({ action: 'finish', mode });
      setReport(rep); setStep('done');
    } catch (e: any) {
      setError(e.message);
      setRows((rs) => rs.map((r) => (r.state === 'running' ? { ...r, state: 'error' } : r)));
    }
    setBusy(false);
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    try { localStorage.removeItem('user'); } catch { /* ignore */ }
    window.location.href = '/login';
  }

  const withData = plan?.tables.filter((t) => t.oldRows > 0) ?? [];
  const totalOld = withData.reduce((n, t) => n + t.oldRows, 0);
  const copiedRows = rows.reduce((n, r) => n + r.read, 0);
  const canStart = !!plan && withData.length > 0 && (mode === 'add' || (plan.oldHasPlatformAdmin && confirm === 'REPLACE'));

  return (
    <div style={{ maxWidth: 980 }}>
      <div className="page-header"><h1><Database size={22} style={{ verticalAlign: -3, marginRight: 8 }} />Import from the old database</h1></div>
      <p style={{ color: '#4b5563', marginTop: 4 }}>
        Copies the data from the old database into the database this app runs on now. The address you paste is used only while this page is open: it is not saved or shown again.
      </p>

      {error && <div className="card" style={{ padding: 14, margin: '16px 0', borderLeft: '4px solid #dc2626', color: '#991b1b' }}><AlertTriangle size={16} style={{ verticalAlign: -3 }} /> {error}</div>}

      {step === 'address' && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <div className="form-group">
            <label className="form-label">Old database address</label>
            <input className="form-input" type="password" autoComplete="off" spellCheck={false} placeholder="postgresql://postgres.xxxx:your-password@aws-0-…pooler.supabase.com:5432/postgres" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <ol style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7, paddingLeft: 20 }}>
            <li>Open the old project in Supabase. If it says it is paused, press <b>Restore project</b> and wait until it finishes.</li>
            <li>Press <b>Connect</b> at the top, choose <b>Session pooler</b>, and copy the address that starts with <code>postgresql://</code>.</li>
            <li>In that address replace <code>[YOUR-PASSWORD]</code> with the database password (Project Settings → Database → Reset password if you do not have it), then paste it above.</li>
          </ol>
          <button className="btn btn-primary" disabled={busy || !url.trim()} onClick={check}>{busy ? 'Checking…' : 'Check the old database'}</button>
        </div>
      )}

      {step === 'review' && plan && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>The old database holds {totalOld.toLocaleString()} rows in {withData.length} tables</h3>
          {plan.warnings.map((w, i) => <p key={i} style={{ color: '#92400e', fontSize: 14 }}><AlertTriangle size={14} style={{ verticalAlign: -2 }} /> {w}</p>)}
          {withData.length === 0 && <p style={{ color: '#991b1b' }}>The old database has no data in any table the app uses, so there is nothing to copy.</p>}
          <div style={{ maxHeight: 260, overflow: 'auto', margin: '12px 0' }}>
            <table className="data-table"><thead><tr><th>Table</th><th style={{ textAlign: 'right' }}>In old database</th><th style={{ textAlign: 'right' }}>Here now</th></tr></thead>
              <tbody>{withData.map((t) => <tr key={t.table}><td>{t.table}</td><td style={{ textAlign: 'right' }}>{t.oldRows.toLocaleString()}</td><td style={{ textAlign: 'right' }}>{t.newRows.toLocaleString()}</td></tr>)}</tbody></table>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
              <input type="radio" checked={mode === 'replace'} disabled={!plan.oldHasPlatformAdmin} onChange={() => setMode('replace')} />
              <span><b>Replace</b> everything here with the old data (recommended when the app only holds demo data). Everything currently in this database is deleted first.
                {!plan.oldHasPlatformAdmin && <span style={{ color: '#991b1b' }}> Not available: the old database has no active platform admin, so nobody could sign in afterwards.</span>}</span>
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input type="radio" checked={mode === 'add'} onChange={() => setMode('add')} />
              <span><b>Add</b> the old data to what is here. Nothing is deleted; rows that already exist are skipped.</span>
            </label>
          </div>
          {mode === 'replace' && (
            <div className="form-group">
              <label className="form-label">To confirm, type REPLACE</label>
              <input className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ maxWidth: 220 }} autoComplete="off" />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={!canStart || busy} onClick={run}>Start copying</button>
            <button className="btn btn-secondary" onClick={() => { setStep('address'); setPlan(null); }}>Back</button>
          </div>
        </div>
      )}

      {(step === 'copying' || step === 'done') && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4b5563' }}>
            <span>{step === 'done' ? 'Finished' : busy ? <><Loader2 size={14} style={{ verticalAlign: -2 }} /> Copying…</> : 'Paused'}</span>
            <span>{copiedRows.toLocaleString()} of {totalOld.toLocaleString()} rows</span>
          </div>
          <div className="progress-bar-bg" style={{ margin: '8px 0 14px' }}><div className="progress-bar-fill" style={{ background: '#4f46e5', width: `${totalOld ? Math.min(100, (copiedRows / totalOld) * 100) : 0}%` }} /></div>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            <table className="data-table"><thead><tr><th>Table</th><th style={{ textAlign: 'right' }}>Copied</th><th style={{ textAlign: 'right' }}>Already there</th><th style={{ textAlign: 'right' }}>Problems</th><th></th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.table}><td>{r.table}</td><td style={{ textAlign: 'right' }}>{r.inserted.toLocaleString()}</td><td style={{ textAlign: 'right' }}>{r.alreadyThere.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: r.failed ? '#991b1b' : undefined }} title={r.errors.join('\n')}>{r.failed + r.parked || ''}</td>
                  <td>{r.state === 'done' ? <CheckCircle2 size={14} color="#16a34a" /> : r.state === 'running' ? <Loader2 size={14} /> : r.state === 'error' ? <AlertTriangle size={14} color="#dc2626" /> : ''}</td></tr>))}</tbody></table>
          </div>
          {step === 'copying' && !busy && <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={run}>Continue</button>}
          {busy && <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => { stop.current = true; }}>Pause</button>}
        </div>
      )}

      {step === 'done' && report && (
        <div className="card" style={{ padding: 20, marginTop: 16, borderLeft: `4px solid ${report.ok ? '#16a34a' : '#d97706'}` }}>
          <h3 style={{ marginTop: 0 }}>{report.ok ? 'Everything was copied and checked' : 'Copied, with things to look at'}</h3>
          <p style={{ fontSize: 14, color: '#4b5563' }}>{report.tablesChecked} tables checked. {report.retried ? `${report.retried} rows that arrived before the row they point to were added at the end. ` : ''}Counters for new records were moved past the highest copied number.</p>
          {report.mismatches.length > 0 && <p style={{ color: '#92400e' }}>Row counts that differ: {report.mismatches.map((m: any) => `${m.table} (old ${m.oldRows}, now ${m.newRows})`).join('; ')}</p>}
          {report.stillParked.length > 0 && <p style={{ color: '#92400e' }}>Rows that could not be placed: {report.stillParked.map((m: any) => `${m.table}: ${m.error}`).join('; ')}</p>}
          {mode === 'replace'
            ? <><p style={{ fontSize: 14 }}>The accounts now come from the old database, so sign in again.</p><button className="btn btn-primary" onClick={signOut}>Sign out and sign in again</button></>
            : <p style={{ fontSize: 14 }}>Done. Nothing was deleted.</p>}
        </div>
      )}
    </div>
  );
}
