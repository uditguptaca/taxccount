// The pictures on the homepage, drawn in the page (no stock images): the wallet itself, the things that go in it,
// a year on one line, the cost of a missed deadline, and the account on a phone. Server components, no state.
//
// Two kinds of content, never mixed without a label:
// - the wallet cards in the hero, the family and the "added by you" items are ILLUSTRATIONS, dated relative to
//   today and captioned "Example";
// - everything else (the countries, the year line, the phone's rows, the penalties) is read from the live rules.
import type { ComponentType, CSSProperties } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Bell, Building2, CalendarPlus, CalendarX, CircleCheck, Clock, FileText, Gavel, Receipt, House, IdCard, Landmark,
  Paperclip, Plane, Plus, ShieldCheck, Users,
} from 'lucide-react';
import { fmt } from '@/lib/compliance/engine';
import { timeLeft } from '@/lib/compliance/timeleft';
import { plainName, plainRole, type SiteConsequence, type SiteRow } from '@/lib/site-data';
import { CC, Flag } from './Flags';
import { Avatar, type Who } from './Avatars';
import { CountUp, type CycleCard } from './Motion';

type Icon = ComponentType<LucideProps>;

const addDays = (today: string, n: number) => new Date(Date.parse(today + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

/** The illustrative wallet: one family, its company and three countries; statutory deadlines lead. The cards
 *  take turns at the front on the page (WalletCycle in Motion.tsx); the server draws them in this order. */
const CARDS: { who: Who; whoText: string; cc: string; name: string; verb: string; days: number; icon: CycleCard['icon']; skin: string }[] = [
  { who: 'daughter', whoText: 'Your daughter', cc: 'CA', name: 'Passport renewal', verb: 'Expires', days: 140, icon: 'passport', skin: 'ink' },
  { who: 'parents', whoText: 'Your parents', cc: 'IN', name: 'Income tax return', verb: 'File by', days: 96, icon: 'tax', skin: 'navy' },
  { who: 'you', whoText: 'You', cc: 'CA', name: 'GST / Sales tax return', verb: 'File by', days: 61, icon: 'tax', skin: 'blue' },   // owner, 2026-11-12
  { who: 'company', whoText: 'Your company', cc: 'CA', name: 'Payroll remittance', verb: 'Pay by', days: 23, icon: 'payroll', skin: 'paper' },
  { who: 'company', whoText: 'Your company', cc: 'CA', name: 'Corporation tax return', verb: 'File by', days: 12, icon: 'company', skin: 'red' },
];

export function walletCards(today: string): CycleCard[] {
  return CARDS.map((c) => {
    const date = addDays(today, c.days); const left = timeLeft(date, today);
    return { who: c.whoText, avatar: c.who, cc: c.cc, name: c.name, verb: c.verb, date: fmt(date), left: left.text, tone: left.tone, icon: c.icon, skin: c.skin };
  });
}

/** Everyone a person looks after, each with their own few deadlines (illustrations, labelled). */
const PEOPLE: { who: string; avatar: Who; tone: string; items: { name: string; cc: string; days: number }[] }[] = [
  { who: 'You', avatar: 'you', tone: 'red', items: [{ name: 'Income tax return', cc: 'CA', days: 158 }, { name: 'Income tax return', cc: 'US', days: 61 }, { name: 'Driving licence renewal', cc: 'CA', days: 262 }] },
  { who: 'Your spouse', avatar: 'spouse', tone: 'blue', items: [{ name: 'Income tax return', cc: 'CA', days: 158 }, { name: 'Passport renewal', cc: 'IN', days: 205 }] },
  { who: 'Your kids', avatar: 'kids', tone: 'navy', items: [{ name: 'Passport renewal', cc: 'CA', days: 140 }, { name: 'Health card renewal', cc: 'CA', days: 310 }] },
  { who: 'Your parents', avatar: 'parents', tone: 'ink', items: [{ name: 'Income tax return', cc: 'IN', days: 96 }, { name: 'Property tax', cc: 'IN', days: 44 }] },
  { who: 'Your company', avatar: 'company', tone: 'red', items: [{ name: 'Corporation tax return', cc: 'CA', days: 12 }, { name: 'Sales tax return', cc: 'CA', days: 18 }, { name: 'Payroll remittance', cc: 'CA', days: 23 }] },
];

export function Family({ today }: { today: string }) {
  return (
    <figure className="ab-family" aria-label="Example: one wallet for a whole family and its company">
      <ul>
        {PEOPLE.map((p, k) => {
          return (
            <li key={p.who} className={`ab-person is-${p.tone}`} style={{ '--k': k } as CSSProperties}>
              <div className="ab-person-head"><Avatar who={p.avatar} size={52} /><span><b>{p.who}</b><small>{p.items.length} deadlines · next in {timeLeft(addDays(today, Math.min(...p.items.map((x) => x.days))), today).text.replace(/ left$/, '')}</small></span></div>
              <ul className="ab-minis">
                {p.items.map((it) => {
                  const left = timeLeft(addDays(today, it.days), today);
                  return (
                    <li key={it.name + it.cc}>
                      <span className="ab-mini-name">{it.name}<CC cc={it.cc} /></span>
                      <span className={`ab-left ${left.tone}`}>{left.text}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <figcaption>Example family. Each person keeps their own deadlines; you see them all in one place.</figcaption>
    </figure>
  );
}

/** The countries whose official rules are in, read from the rules; and a slot for the ones being added. */
export function Countries({ countries }: { countries: { code: string; name: string; slug: string; total: number; places: number; placeLabel: string; departments: { name: string }[] }[] }) {
  return (
    <ul className="ab-globe">
      {countries.map((c, k) => (
        <li key={c.code} className="ab-country" style={{ '--k': k } as CSSProperties}>
          <span className="ab-country-flag"><Flag cc={c.code} width={84} /></span>
          <h3>{c.name}</h3>
          <p className="ab-country-n"><b>{c.total}</b> official deadlines · {c.places} {c.placeLabel}</p>
          <ul className="ab-country-areas">{c.departments.slice(0, 3).map((d) => <li key={d.name}>{d.name}</li>)}</ul>
          <a className="ab-link" href={`/compliance/${c.slug}`}>Read the guide</a>
        </li>
      ))}
      <li className="ab-country is-more">
        <span className="ab-country-seal" aria-hidden="true"><Plus className="ab-ico" strokeWidth={2} /></span>
        <h3>More countries</h3>
        <p className="ab-country-n">Being added. Anything elsewhere goes in as your own item today.</p>
      </li>
    </ul>
  );
}

/** The things that go in: each drawn as the object it is, not as an icon tile. */
const THINGS: { shape: string; name: string; tab: string; icon: Icon }[] = [
  { shape: 'sheet', name: 'Income tax and corporation tax', tab: 'File', icon: FileText },
  { shape: 'cert', name: 'Company filings', tab: 'File', icon: Building2 },
  { shape: 'slip', name: 'Payroll and sales tax', tab: 'Pay', icon: Users },
  { shape: 'booklet', name: 'Passport', tab: 'Renew', icon: Plane },
  { shape: 'card', name: 'Driving licence and ID', tab: 'Renew', icon: IdCard },
  { shape: 'stamp', name: 'Visa or residence permit', tab: 'Expires', icon: Landmark },
  { shape: 'folder', name: 'Insurance policies', tab: 'Renew', icon: ShieldCheck },
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

type Place = { place: string; country: string };

/** The illustrative items "added by you", dated from today so they never go stale. The hero's cards match them. */
const OWN = [
  { id: 'own-car', name: 'Car insurance renewal', days: 12 },
  { id: 'own-pass', name: 'Passport renewal', days: 118 },
  { id: 'own-dl', name: 'Driving licence renewal', days: 262 },
  { id: 'own-home', name: 'Home insurance renewal', days: 334 },
];

/** Twelve months on one line: the real deadlines of one example, plus the illustrative own items. */
export function YearLine({ rows, today, ex }: { rows: SiteRow[]; today: string; ex: Place }) {
  const own = OWN.map((o) => ({ id: o.id, name: o.name, date: addDays(today, o.days) }));
  const items = [
    ...rows.filter((r) => r.date).map((r) => ({ id: r.id, name: plainName(r.name, ex), date: r.date as string, who: plainRole(r.authority), own: false })),
    ...own.map((o) => ({ ...o, who: 'Added by you', own: true })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const start = Date.parse(today + 'T00:00:00Z');
  const pos = (d: string) => Math.min(100, Math.max(0, ((Date.parse(d + 'T00:00:00Z') - start) / 86400000 / 365) * 100));
  // four lanes (two above the line, two below); each label takes the first lane where it does not cover the one
  // before it. A label near the end of the year opens to the left. One that fits nowhere stays off the wide line
  // (the list on a phone shows the same ones, so both say the same thing).
  const W = 17;
  const shown: { it: (typeof items)[number]; x: number; late: boolean; lane: number; from: number; to: number }[] = [];
  // the items added by hand go on first, so every one the caption speaks of is on the line
  for (const it of [...items.filter((i) => i.own), ...items.filter((i) => !i.own)]) {
    const x = pos(it.date), late = x > 72, from = late ? x - W : x, to = late ? x : x + W;
    // no two labels in a lane overlap; a far label's stem does not run through a near label on its side, and a
    // near label does not cover a far label's stem
    const lane = [0, 1, 2, 3].find((l) => !shown.some((o) => (o.lane === l && o.from < to + 0.8 && from < o.to + 0.8)
      || (l >= 2 && o.lane === l - 2 && o.from - 0.4 <= x && x <= o.to + 0.4)
      || (l < 2 && o.lane === l + 2 && from - 0.4 <= o.x && o.x <= to + 0.4)));
    if (lane === undefined || shown.length >= 10) continue;
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
  // the line sits where the lanes in use need it: a far lane above or below adds its height only when used
  const up = shown.some((o) => o.lane === 2), down = shown.some((o) => o.lane === 3);
  const mid = 168 + (up ? 152 : 0), height = mid + 168 + (down ? 152 : 0);
  return (
    <figure className="ab-year" aria-label="Twelve months of deadlines on one line" style={{ '--mid': `${mid}px`, '--h': `${height}px` } as CSSProperties}>
      <div className="ab-year-track">
        <span className="ab-year-now" style={{ left: '0%' }}>Today</span>
        <span className="ab-year-scan" aria-hidden="true" />
        {months.map((m) => <span key={m.label} className="ab-year-month" style={{ left: `${m.at}%` }}>{m.label}</span>)}
      </div>
      <ol className="ab-year-items">
        {shown.map(({ it, x, late, lane }) => {
          const left = timeLeft(it.date, today);
          return (
            <li key={it.id} className={`lane-${lane}${it.own ? ' is-own' : ''}${late ? ' is-late' : ''}`} style={{ '--x': `${x}%`, '--xv': x } as CSSProperties}>
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

/** The worst real consequences of a missed deadline (owner, 2026-11-12: "fear of a big penalty, the company
 *  getting closed or the licence being revoked"). Each picture shows the consequence; the words beside it are the
 *  rule's own sentence, with the official page it was read on. */
export function Consequences({ items }: { items: SiteConsequence[] }) {
  return (
    <ul className="ab-fear" data-reveal>
      {items.map((c) => (
        <li key={c.kind} className={`ab-fear-card is-${c.kind}`}>
          <div className="ab-fear-art" aria-hidden="true">
            {c.kind === 'closed' && (<div className="ab-fear-cert"><Building2 className="ab-fear-ico" strokeWidth={1.5} /><i /><i /><i /><span className="ab-fear-stamp">Dissolved</span></div>)}
            {c.kind === 'licence' && (<div className="ab-fear-licence"><span className="ab-fear-photo"><IdCard className="ab-fear-ico" strokeWidth={1.5} /></span><i /><i /><span className="ab-fear-band">Cancelled</span></div>)}
            {c.kind === 'daily' && (<div className="ab-fear-cal">{Array.from({ length: 14 }, (_, k) => <span key={k} style={{ '--d': k } as CSSProperties}>{k + 1}</span>)}</div>)}
            {c.kind === 'jail' && (<div className="ab-fear-court"><Gavel className="ab-fear-gavel" strokeWidth={1.6} /></div>)}
          </div>
          <div className="ab-fear-body">
            <p className="ab-fear-big">{c.big}</p>
            <p className="ab-fear-text">“{c.text}”</p>
            <p className="ab-fear-src"><span>{c.name}<CC cc={c.cc} /></span><a className="ab-link" href={c.url} target="_blank" rel="noopener noreferrer nofollow">Read on the official page</a></p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The account on a phone: tiles, the soonest rows (real, from an example), one item of your own. */
export function PhoneBoard({ rows, today, total, ex }: { rows: SiteRow[]; today: string; total: number; ex: Place }) {
  const dated = rows.filter((r) => r.date).slice(0, 3);
  const own = { name: 'Passport renewal', date: addDays(today, 118) };
  const n = (lo: number, hi: number) => dated.filter((r) => { const d = timeLeft(r.date, today).days ?? 999; return d >= lo && d <= hi; }).length;
  return (
    <figure className="ab-phone" aria-label="Example of the account on a phone">
      <div className="ab-phone-screen">
        {dated[0] ? <p className="ab-toast" aria-hidden="true"><Bell className="ab-ico" strokeWidth={2} /><span><b>{plainName(dated[0].name, ex)}</b><small>{timeLeft(dated[0].date, today).text}</small></span></p> : null}
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
                <span><b>{plainName(r.name, ex)}</b><small>{fmt(r.date as string)}</small></span>
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
      <figcaption>Example account</figcaption>
    </figure>
  );
}

/** What the rules themselves say can happen, counted across every deadline in them (phase 23). */
export function FearStrip({ fear, total }: { fear: { penalty: number; closed: number; daily: number; prison: number }; total: number }) {
  const TAGS: { n: number; line: string; icon: Icon; tone: string }[] = [
    { n: fear.penalty, line: `of the ${total} deadlines carry a stated penalty if you miss them`, icon: Receipt, tone: 'red' },
    { n: fear.closed, line: 'can end with a company dissolved or its registration revoked', icon: Building2, tone: 'ink' },
    { n: fear.daily, line: 'charge a fine for every single day you are late', icon: CalendarX, tone: 'red' },
    { n: fear.prison, line: 'can lead to prosecution, and even prison', icon: Gavel, tone: 'ink' },
  ];
  return (
    <ul className="ab-hazard" data-reveal>
      {TAGS.map((t, k) => { const I = t.icon; return (
        <li key={k} className={`ab-hazard-tag is-${t.tone}`} style={{ '--k': k } as CSSProperties}>
          <span className="ab-hazard-ico"><I className="ab-ico" strokeWidth={2} aria-hidden /></span>
          <CountUp className="ab-hazard-n" value={t.n} />
          <p>{t.line}</p>
        </li>); })}
    </ul>
  );
}

/** A moving strip of real compliance names read from the rules (two copies, so the loop has no seam). */
export function Ticker({ items }: { items: { name: string; cc: string }[] }) {
  const row = (hidden: boolean) => (
    <ul className="ab-ticker-row" aria-hidden={hidden || undefined}>
      {items.map((t, k) => <li key={k}>{t.name}<CC cc={t.cc} /></li>)}
    </ul>
  );
  return (
    <div className="ab-ticker" aria-label="Some of the official deadlines in the rules">
      <div className="ab-ticker-track">{row(false)}{row(true)}</div>
    </div>
  );
}

/** How it works, as three small screens that play on their own: answer, see, keep. Illustrations. */
export function HowItWorks() {
  return (
    <ol className="ab-how" data-reveal>
      <li className="ab-how-step">
        <h3><span>1</span>Answer a few questions</h3>
        <p>Where you live, what you are, and plain yes or no. Only questions that change your list are asked.</p>
        <div className="ab-how-screen is-ask" aria-hidden="true">
          <p className="ab-how-q">Do you have employees?</p>
          <div className="ab-how-opts"><span className="is-yes">Yes</span><span>No</span><span>Not sure</span></div>
          <p className="ab-how-q is-2">Do you sell goods or services?</p>
          <div className="ab-how-opts is-2"><span className="is-yes">Yes</span><span>No</span><span>Not sure</span></div>
        </div>
      </li>
      <li className="ab-how-step">
        <h3><span>2</span>See what applies, and when</h3>
        <p>Each deadline with its date, the time left, what missing it costs and the government page it comes from.</p>
        <div className="ab-how-screen is-see" aria-hidden="true">
          <p className="ab-how-row"><b>Corporation tax return</b><em className="ab-left yellow">12 days left</em></p>
          <p className="ab-how-row"><b>Payroll remittance</b><em className="ab-left yellow">23 days left</em></p>
          <p className="ab-how-row"><b>GST / Sales tax return</b><em className="ab-left">8 weeks left</em></p>
        </div>
      </li>
      <li className="ab-how-step">
        <h3><span>3</span>Keep it in your wallet</h3>
        <p>Save the list, add your family and your own items, and mark each one filed as you go.</p>
        <div className="ab-how-screen is-keep" aria-hidden="true">
          <div className="ab-how-card">Corporation tax return</div>
          <div className="ab-how-pocket"><span>Your wallet</span><b className="ab-how-n"><i>5</i><i>6</i></b></div>
        </div>
      </li>
    </ol>
  );
}

/** The questions section's picture: questions people ask, rising as chat bubbles, and the answer. Illustration. */
export function AskBubbles() {
  return (
    <div className="ab-ask" aria-hidden="true">
      <p className="ab-bubble is-q" style={{ '--k': 0 } as CSSProperties}>What do I file this year?</p>
      <p className="ab-bubble is-q is-r" style={{ '--k': 1 } as CSSProperties}>When is my parents’ return due?</p>
      <p className="ab-bubble is-q" style={{ '--k': 2 } as CSSProperties}>What happens if I miss it?</p>
      <p className="ab-bubble is-a" style={{ '--k': 3 } as CSSProperties}><Avatar who="you" size={28} />It is all in your wallet, with the date.</p>
    </div>
  );
}

/** The closing band's picture: three wallet cards fanned out, gently floating. */
export function MiniFan({ cards }: { cards: CycleCard[] }) {
  return (
    <div className="ab-fan" aria-hidden="true">
      {cards.slice(-3).map((c, k) => (
        <div key={k} className={`ab-fan-card is-${c.skin}`} style={{ '--k': k } as CSSProperties}>
          <Avatar who={c.avatar} size={28} />
          <span><b>{c.name}</b><small>{c.left}</small></span>
        </div>
      ))}
    </div>
  );
}

export const WALLET_DOES: { icon: Icon; title: string; line: string }[] = [
  { icon: Clock, title: 'Time left on each one', line: 'Overdue, this week and this month, counted at the top.' },
  { icon: CircleCheck, title: 'Mark as filed', line: 'A deadline that repeats moves to its next date.' },
  { icon: Paperclip, title: 'Papers with the deadline', line: 'The return, the receipt, the policy. Or in your own Google Drive.' },
  { icon: CalendarPlus, title: 'In your own calendar', line: 'One file puts every date into Google, Apple or Outlook.' },
  { icon: Users, title: 'Family and companies', line: 'Everyone and everything you are responsible for, in one account.' },
];
