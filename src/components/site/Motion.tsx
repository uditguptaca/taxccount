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
