// The pictures on the homepage, drawn in the page (no stock images): the wallet itself, the things that go in it,
// a year on one line, the cost of a missed deadline, and the account on a phone. Server components, no state.
//
// Two kinds of content, never mixed without a label:
// - the wallet cards in the hero and the "added by you" items are ILLUSTRATIONS (a passport, a car insurance renewal),
//   dated relative to today and captioned "Example";
// - everything else (the year line, the phone's rows, the penalties) is read from the live rules by site-data.ts.
import type { ComponentType, CSSProperties } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  BookUser, Briefcase, Building2, CalendarPlus, Car, CircleCheck, Clock, FileText, House, IdCard, Landmark,
  Paperclip, Plane, Plus, ShieldCheck, Users,
} from 'lucide-react';
import { fmt } from '@/lib/compliance/engine';
import { timeLeft } from '@/lib/compliance/timeleft';
import type { SitePenalty, SiteRow } from '@/lib/site-data';

type Icon = ComponentType<LucideProps>;

const addDays = (today: string, n: number) => new Date(Date.parse(today + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

/** The illustrative wallet: one card per kind of deadline, soonest at the front. */
const CARDS: { kind: string; name: string; verb: string; days: number; icon: Icon; skin: string }[] = [
  { kind: 'Tax', name: 'Income tax return', verb: 'File by', days: 142, icon: FileText, skin: 'ink' },
  { kind: 'ID and travel', name: 'Passport renewal', verb: 'Expires', days: 118, icon: BookUser, skin: 'navy' },
  { kind: 'Company', name: 'Annual return', verb: 'File by', days: 68, icon: Building2, skin: 'blue' },
  { kind: 'Staff', name: 'Payroll remittance', verb: 'Pay by', days: 23, icon: Briefcase, skin: 'paper' },
  { kind: 'Insurance', name: 'Car insurance renewal', verb: 'Renews', days: 12, icon: Car, skin: 'red' },
];

export function WalletStack({ today }: { today: string }) {
  const front = CARDS[CARDS.length - 1];
  const frontDate = addDays(today, front.days);
  return (
    <figure className="ab-wallet" aria-label="Example of a compliance wallet: five deadlines, the soonest in front">
      <ol className="ab-stack">
        {CARDS.map((c, i) => {
          const date = addDays(today, c.days); const left = timeLeft(date, today);
          const I = c.icon; const isFront = i === CARDS.length - 1;
          return (
            <li key={c.name} className={`ab-pass is-${c.skin}${isFront ? ' is-front' : ''}`} style={{ '--i': i } as CSSProperties}>
              <div className="ab-pass-top">
                <span className="ab-pass-kind"><I className="ab-ico" strokeWidth={1.9} aria-hidden />{c.kind}</span>
                <span className={`ab-left ${left.tone}`}>{left.text}</span>
              </div>
              <p className="ab-pass-name">{c.name}</p>
              {isFront ? (
                <>
                  <div className="ab-pass-due"><span>{c.verb}</span><b>{fmt(frontDate)}</b></div>
                  <div className="ab-pass-foot">
                    <span className="ab-pass-act"><CircleCheck className="ab-ico" strokeWidth={2} aria-hidden />Mark as done</span>
                    <span className="ab-pass-clip"><Paperclip className="ab-ico" strokeWidth={2} aria-hidden />Policy, receipt</span>
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
      <figcaption>Example wallet. What is due first sits in front.</figcaption>
    </figure>
  );
}

/** The things that go in: each drawn as the object it is, not as an icon tile. */
const THINGS: { shape: string; name: string; tab: string; icon: Icon }[] = [
  { shape: 'booklet', name: 'Passport', tab: 'Renew', icon: Plane },
  { shape: 'card', name: 'Driving licence and ID', tab: 'Renew', icon: IdCard },
  { shape: 'stamp', name: 'Visa or residence permit', tab: 'Expires', icon: Landmark },
  { shape: 'folder', name: 'Insurance policies', tab: 'Renew', icon: ShieldCheck },
  { shape: 'sheet', name: 'Tax returns and instalments', tab: 'File', icon: FileText },
  { shape: 'cert', name: 'Company filings', tab: 'File', icon: Building2 },
  { shape: 'slip', name: 'Payroll and staff', tab: 'Pay', icon: Users },
  { shape: 'tag', name: 'Property, lease and vehicle', tab: 'Renew', icon: House },
];

export function Shelf() {
  return (
    <ul className="ab-shelf">
      {THINGS.map((t) => {
        const I = t.icon;
        return (
          <li key={t.name} className={`ab-thing is-${t.shape}`}>
            <div className="ab-thing-stage" aria-hidden="true">
              <div className="ab-obj">
                <I className="ab-obj-ico" strokeWidth={1.6} />
                <i className="ab-obj-l1" /><i className="ab-obj-l2" /><i className="ab-obj-l3" />
              </div>
              <span className="ab-obj-tab">{t.tab}</span>
            </div>
            <p>{t.name}</p>
          </li>
        );
      })}
      <li className="ab-thing is-own">
        <div className="ab-thing-stage" aria-hidden="true"><div className="ab-obj"><Plus className="ab-obj-ico" strokeWidth={1.8} /></div></div>
        <p>Anything of your own with a date</p>
      </li>
    </ul>
  );
}

/** Twelve months on one line: the real deadlines of one example, plus two of the illustrative own items. */
export function YearLine({ rows, today }: { rows: SiteRow[]; today: string }) {
  const own = [
    { id: 'own-car', name: 'Car insurance renewal', date: addDays(today, 12) },
    { id: 'own-pass', name: 'Passport renewal', date: addDays(today, 118) },
  ];
  const items = [
    ...rows.filter((r) => r.date).map((r) => ({ id: r.id, name: r.name, date: r.date as string, who: r.authority, own: false })),
    ...own.map((o) => ({ ...o, who: 'Added by you', own: true })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const start = Date.parse(today + 'T00:00:00Z');
  const pos = (d: string) => Math.min(100, Math.max(0, ((Date.parse(d + 'T00:00:00Z') - start) / 86400000 / 365) * 100));
  // four lanes (two above the line, two below); each label takes the first lane where it does not cover the one
  // before it. A label near the end of the year opens to the left. One that fits nowhere stays off the wide line
  // (the list on a phone shows the same ones, so both say the same thing).
  const W = 17;
  const shown: { it: (typeof items)[number]; x: number; late: boolean; lane: number; from: number; to: number }[] = [];
  // the items added by hand go on first, so the caption's "two items were added by hand" is always true
  for (const it of [...items.filter((i) => i.own), ...items.filter((i) => !i.own)]) {
    const x = pos(it.date), late = x > 72, from = late ? x - W : x, to = late ? x : x + W;
    // no two labels in a lane overlap; a far label's stem does not run through a near label on its side, and a
    // near label does not cover a far label's stem
    const lane = [0, 1, 2, 3].find((l) => !shown.some((o) => (o.lane === l && o.from < to + 0.8 && from < o.to + 0.8)
      || (l >= 2 && o.lane === l - 2 && o.from - 0.4 <= x && x <= o.to + 0.4)
      || (l < 2 && o.lane === l + 2 && from - 0.4 <= o.x && o.x <= to + 0.4)));
    if (lane === undefined || shown.length >= 9) continue;
    shown.push({ it, x, late, lane, from, to });
  }
  shown.sort((p, q) => p.x - q.x);
  const months: { label: string; at: number }[] = [];
  const t0 = new Date(start);
  for (let k = 1; k <= 12; k++) {
    const m = new Date(Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth() + k, 1));
    const at = pos(m.toISOString().slice(0, 10));
    if (at < 100) months.push({ label: m.toLocaleString('en', { month: 'short', timeZone: 'UTC' }) + (m.getUTCMonth() === 0 ? ` ${m.getUTCFullYear()}` : ''), at });
  }
  return (
    <figure className="ab-year" aria-label="Twelve months of deadlines on one line">
      <div className="ab-year-track">
        <span className="ab-year-now" style={{ left: '0%' }}>Today</span>
        {months.map((m) => <span key={m.label} className="ab-year-month" style={{ left: `${m.at}%` }}>{m.label}</span>)}
      </div>
      <ol className={`ab-year-items${shown.some((o) => o.lane >= 2) ? ' has-far' : ''}`}>
        {shown.map(({ it, x, late, lane }) => {
          const left = timeLeft(it.date, today);
          return (
            <li key={it.id} className={`lane-${lane}${it.own ? ' is-own' : ''}${late ? ' is-late' : ''}`} style={{ '--x': `${x}%` } as CSSProperties}>
              <span className={`ab-year-dot ${left.tone}`} aria-hidden="true" />
              <div className="ab-year-label">
                <b>{it.name}</b>
                <span>{fmt(it.date)} · <em className={`ab-left ${left.tone}`}>{left.text}</em></span>
                <small>{it.who}</small>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

/** Real penalties, each read on the page linked beneath it, drawn as receipts. */
export function Receipts({ penalties }: { penalties: SitePenalty[] }) {
  return (
    <ul className="ab-receipts">
      {penalties.map((p, k) => (
        <li key={p.name + k} className="ab-receipt" style={{ '--r': `${[-1.6, 1.1, -0.6][k % 3]}deg` } as CSSProperties}>
          <div className="ab-receipt-paper">
            <span className="ab-receipt-stamp" aria-hidden="true">Late</span>
            <h3>{p.name}</h3>
            <p className="ab-receipt-cost">{p.penalty}</p>
            <p className="ab-receipt-src">Read on <a className="ab-link" href={p.url} target="_blank" rel="noopener noreferrer nofollow">{p.publisher}</a></p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The account on a phone: tiles, the soonest rows (real, from an example), one item of your own. */
export function PhoneBoard({ rows, today, total }: { rows: SiteRow[]; today: string; total: number }) {
  const dated = rows.filter((r) => r.date).slice(0, 3);
  const own = { name: 'Passport renewal', date: addDays(today, 118) };
  const n = (lo: number, hi: number) => dated.filter((r) => { const d = timeLeft(r.date, today).days ?? 999; return d >= lo && d <= hi; }).length;
  return (
    <figure className="ab-phone" aria-label="Example of the account on a phone">
      <div className="ab-phone-screen">
        <p className="ab-phone-head"><b>My compliances</b><span>{total + 1} tracked</span></p>
        <ul className="ab-phone-tiles">
          <li><b>0</b><span>Overdue</span></li>
          <li className="red"><b>{n(0, 7)}</b><span>This week</span></li>
          <li className="blue"><b>{n(8, 30)}</b><span>This month</span></li>
          <li><b>3</b><span>Done</span></li>
        </ul>
        <ul className="ab-phone-rows">
          {dated.map((r) => {
            const left = timeLeft(r.date, today);
            return (
              <li key={r.id}>
                <span><b>{r.name}</b><small>{fmt(r.date as string)}</small></span>
                <span className={`ab-left ${left.tone}`}>{left.text}</span>
                <span className="ab-phone-btn">Mark as filed</span>
              </li>
            );
          })}
          <li className="is-own">
            <span><b>{own.name}</b><small>{fmt(own.date)} · your own item</small></span>
            <span className={`ab-left ${timeLeft(own.date, today).tone}`}>{timeLeft(own.date, today).text}</span>
            <span className="ab-phone-btn"><Paperclip className="ab-ico" strokeWidth={2} aria-hidden />1</span>
          </li>
        </ul>
      </div>
    </figure>
  );
}

export const WALLET_DOES: { icon: Icon; title: string; line: string }[] = [
  { icon: Clock, title: 'Time left on each one', line: 'Overdue, this week and this month, counted at the top.' },
  { icon: CircleCheck, title: 'Mark as done', line: 'A deadline that repeats moves to its next date.' },
  { icon: Paperclip, title: 'Papers with the deadline', line: 'The return, the receipt, the policy. Or in your own Google Drive.' },
  { icon: CalendarPlus, title: 'In your own calendar', line: 'One file puts every date into Google, Apple or Outlook.' },
  { icon: Users, title: 'Family and companies', line: 'Everyone and everything you are responsible for, in one account.' },
];
