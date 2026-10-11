'use client';
import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

/** A small "?" that opens a note on demand, so explanations never take a line of their own. */
export default function InfoTip({ children, label, strong = false }: { children: React.ReactNode; label: string; strong?: boolean }) {
  const [open, setOpen] = useState(false);
  const [right, setRight] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  const toggle = () => { if (!open && ref.current) setRight(ref.current.getBoundingClientRect().left > window.innerWidth / 2); setOpen(!open); };
  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button type="button" aria-expanded={open} aria-label={label} title={label} onClick={toggle}
        className={`inline-flex items-center justify-center rounded-full p-0.5 ${open ? 'bg-indigo-100 text-indigo-800' : strong ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-700'}`}>
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && <span role="dialog" aria-label={label} className={`absolute top-full mt-1 z-30 w-80 max-w-[85vw] rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-700 shadow-lg ${right ? 'right-0' : 'left-0'}`}>{children}</span>}
    </span>
  );
}
