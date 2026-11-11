'use client';
// "See it on a real case": the visitor picks a kind of person and sees what the rules return for them today.
// The rows are worked out on the server from the live rules (site-data.ts); this only switches between them.
import { useState } from 'react';
import type { SiteExample } from '@/lib/site-data';
import { Arrow } from './Chrome';

const day = (iso: string | null) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`; };

export default function Cases({ examples }: { examples: SiteExample[] }) {
  const [at, setAt] = useState(0);
  const ex = examples[at];
  if (!ex) return null;
  return (
    <div className="ab-cases">
      <div className="ab-case-tabs" role="tablist" aria-label="Examples">
        {examples.map((e, i) => (
          <button key={e.id} type="button" role="tab" id={`case-tab-${e.id}`} aria-selected={i === at} aria-controls="case-panel" className="ab-case-tab" onClick={() => setAt(i)}>
            <b>{e.who}</b><span>{e.detail}</span>
          </button>
        ))}
      </div>
      <div className="ab-case-panel" role="tabpanel" id="case-panel" aria-labelledby={`case-tab-${ex.id}`} data-case={ex.id}>
        <p className="ab-case-top"><span><b>{ex.total} compliances apply</b> to this person in {ex.place}, {ex.country}. The first {ex.rows.length}:</span><span>Worked out today from the live rules</span></p>
        <ul className="ab-rows" key={ex.id}>
          {ex.rows.map((r) => (
            <li key={r.id}>
              <div className="ab-row-name"><b>{r.name}</b><span>{r.form ? `${r.form} · ` : ''}{r.authority}</span></div>
              <div>
                <p className={`ab-row-when${r.left ? '' : ' is-rule'}`}>{r.when}</p>
                {r.left ? <span className={`ab-chip ${r.tone}`}>{r.left}</span> : null}
              </div>
              <div className="ab-row-more">
                {r.penalty ? <p><b>If missed:</b> {r.penalty}{r.penaltyUrl ? <> (<a className="ab-link" href={r.penaltyUrl} target="_blank" rel="noopener noreferrer nofollow">official page</a>)</> : null}</p> : null}
                <p className="ab-src">Source: <a className="ab-link" href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{r.sourcePublisher}</a>{r.checked ? `, read ${day(r.checked)}` : ''}{r.verified ? '' : '. Please confirm on the official page'}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="ab-case-foot"><span>{ex.total > ex.rows.length ? `${ex.total - ex.rows.length} more apply to this person. ` : ''}Your own answers give your own list.</span><a href="#compliance-checker" className="ab-btn ab-btn-brand">Run it for yourself<Arrow /></a></p>
      </div>
    </div>
  );
}
