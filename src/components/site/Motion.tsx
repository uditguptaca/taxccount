'use client';
// Movement on the homepage (phase 21, owner: "add more artifacts, with movement, so people would like to stick to
// it"). Three small pieces, all of them optional: with scripts off, or with "reduce motion" switched on, the page
// is exactly the server-drawn page, fully visible.
// - WalletCycle: the hero's wallet cards take turns at the front.
// - RevealRoot: marks each [data-reveal] block that is below the fold as "not yet seen" and plays it in when it
//   scrolls into view (the CSS in site.css decides how each block plays).
// - CountUp: a number counts up when it comes into view.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { BookUser, Briefcase, Building2, CircleCheck, FileText, Paperclip } from 'lucide-react';
import { CC } from './Flags';
import { Avatar, type Who } from './Avatars';

const ICONS = { passport: BookUser, tax: FileText, payroll: Briefcase, company: Building2 } as const;
export type CycleCard = { who: string; avatar: Who; cc: string; name: string; verb: string; date: string; left: string; tone: string; icon: keyof typeof ICONS; skin: string };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function WalletCycle({ cards, caption }: { cards: CycleCard[]; caption: string }) {
  // order[position] = card index; the last position is the front
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const paused = useRef(false);
  useEffect(() => {
    if (reduced()) return;
    const t = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);   // the front card goes to the back
    }, 3600);
    return () => window.clearInterval(t);
  }, []);
  const pos = (i: number) => order.indexOf(i);
  return (
    <figure className="ab-wallet" aria-label="Example of a compliance wallet: a family, its company and three countries"
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <ol className="ab-stack" style={{ '--n': cards.length } as CSSProperties}>
        {cards.map((c, i) => {
          const I = ICONS[c.icon]; const p = pos(i); const front = p === cards.length - 1;
          return (
            <li key={c.who + c.name} className={`ab-pass is-${c.skin}${front ? ' is-front' : ''}`} style={{ '--i': i, '--pos': p, zIndex: p + 1 } as CSSProperties} aria-hidden={front ? undefined : true}>
              <div className="ab-pass-top">
                <Avatar who={c.avatar} size={36} />
                <span className="ab-pass-id"><b className="ab-pass-name">{c.name}</b><small>{c.who}<CC cc={c.cc} /><I className="ab-ico ab-pass-ico" strokeWidth={1.9} aria-hidden /></small></span>
                <span className={`ab-left ${c.tone}`}>{c.left}</span>
              </div>
              <div className="ab-pass-due"><span>{c.verb}</span><b>{c.date}</b></div>
              <div className="ab-pass-foot">
                <span className="ab-pass-act"><CircleCheck className="ab-ico" strokeWidth={2} aria-hidden />Mark as filed</span>
                <span className="ab-pass-clip"><Paperclip className="ab-ico" strokeWidth={2} aria-hidden />Papers</span>
              </div>
            </li>
          );
        })}
      </ol>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function RevealRoot() {
  useEffect(() => {
    if (reduced() || !('IntersectionObserver' in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = '1'; io.unobserve(e.target); }
    }, { threshold: 0.18 });
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.9) { el.dataset.in = '0'; io.observe(el); }   // only what has not been seen yet
    }
    return () => io.disconnect();
  }, []);
  return null;
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !('IntersectionObserver' in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setShown(Math.round(value * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
      setShown(0); raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <b ref={ref} className={className} data-total={value}>{shown}</b>;
}

/** A late fee growing day by day, on one real rule's own rate, minimum and maximum (phase 23). Plays when seen. */
export function LateMeter({ m }: { m: { rate: number; min: number | null; max: number | null; cur: string; name: string; text: string; url: string; cc: string } }) {
  const cap = m.max ? Math.ceil(m.max / m.rate) : 60;
  const [day, setDay] = useState(cap);              // drawn at the end state, so without scripts the full figure shows
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !('IntersectionObserver' in window)) return;
    let t = 0;
    const run = () => {
      let d = 0; setDay(0);
      const tick = () => { d += 1; setDay(d); t = window.setTimeout(d < cap ? tick : () => { t = window.setTimeout(run, 2600); }, d < 8 ? 260 : 70); };
      t = window.setTimeout(tick, 400);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [cap]);
  const owed = day === 0 ? 0 : Math.min(m.max ?? Infinity, Math.max(m.min ?? 0, m.rate * day));
  const pct = m.max ? Math.round((owed / m.max) * 100) : Math.min(100, Math.round((day / cap) * 100));
  const money = (n: number) => `${m.cur}${n.toLocaleString('en-US')}`;
  return (
    <div className="ab-meter" ref={ref}>
      <div className="ab-meter-face">
        <div className="ab-meter-day"><span>Days late</span><b>{day}</b></div>
        <div className="ab-meter-owed"><span>Late fee so far</span><b>{money(owed)}</b></div>
        <div className="ab-meter-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
        <p className="ab-meter-scale"><span>{m.min ? `Minimum ${money(m.min)}` : 'Day 1'}</span><span>{m.max ? `Maximum ${money(m.max)}` : 'and it keeps running'}</span></p>
      </div>
      <div className="ab-meter-why">
        <p className="ab-meter-rule">{money(m.rate)} for every day it is late.</p>
        <p className="ab-fear-text">“{m.text}”</p>
        <p className="ab-fear-src"><span>{m.name}<CC cc={m.cc} /></span><a className="ab-link" href={m.url} target="_blank" rel="noopener noreferrer nofollow">Read on the official page</a></p>
      </div>
    </div>
  );
}
