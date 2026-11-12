// Small drawn portraits for the homepage (owner, 2026-11-12: "for the parents put a parent picture, for the
// daughter a daughter picture"). Flat SVG in the site's own colours, so every card and every family column says
// whose deadline it is at a glance. Illustrations only; no photo of a real person. Drawn square and cut to a
// circle by CSS (`.ab-avatar-svg { clip-path: circle(50%) }`), so no SVG ids repeat across the page.
export type Who = 'you' | 'spouse' | 'daughter' | 'kids' | 'parents' | 'company';

const FACE = '#f8dccf';
const INK = '#10192b';

export function Avatar({ who, size = 32, className }: { who: Who; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', className: `ab-avatar-svg${className ? ' ' + className : ''}`, 'aria-hidden': true as const };
  if (who === 'company') return (
    <svg {...common}>
      <circle cx="24" cy="24" r="24" fill={INK} />
      <rect x="13" y="13" width="15" height="25" rx="1.5" fill="#ffffff" />
      <rect x="28" y="20" width="8" height="18" rx="1.5" fill="#dfe8f5" />
      {[17, 22, 27, 32].map((y) => [16, 22].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.6" fill="#234b84" />))}
      <rect x="30.5" y="24" width="3" height="3" rx="0.6" fill="#234b84" /><rect x="30.5" y="30" width="3" height="3" rx="0.6" fill="#234b84" />
      <rect x="19" y="34" width="4" height="4" fill="#da291c" />
    </svg>
  );
  if (who === 'kids') return (
    <svg {...common}>
      <g>
        <rect width="48" height="48" fill="#dfe8f5" />
        {/* girl, left: pigtails and a bow */}
        <circle cx="9.2" cy="24" r="3" fill={INK} /><circle cx="22.8" cy="24" r="3" fill={INK} />
        <path d="M5 48c0-6.5 4.6-11 11-11s11 4.5 11 11z" fill="#da291c" />
        <circle cx="16" cy="25.5" r="6" fill={FACE} />
        <path d="M10 25c0-4.6 2.7-7.6 6-7.6s6 3 6 7.6c-1.6-2.3-3.7-3.4-6-3.4s-4.4 1.1-6 3.4z" fill={INK} />
        <path d="M16 17.6l-2.8-1.9v3.8zM16 17.6l2.8-1.9v3.8z" fill="#da291c" />
        {/* boy, right: short hair */}
        <path d="M23 48c0-6 4.2-10 10-10s10 4 10 10z" fill="#234b84" />
        <circle cx="33" cy="28" r="5.6" fill={FACE} />
        <path d="M27.4 27.6c0-4.3 2.5-7 5.6-7s5.6 2.5 5.6 6.5c-1.5-2-3.4-2.9-5.6-2.9s-4.1 1.1-5.6 3.4z" fill={INK} />
      </g>
    </svg>
  );
  if (who === 'parents') return (
    <svg {...common}>
      <g>
        <rect width="48" height="48" fill="#0b1f3a" />
        {/* mother, left: grey hair in a bun */}
        <circle cx="15" cy="13.5" r="3" fill="#ccd3de" />
        <path d="M3 48c0-7 5-12 12-12s12 5 12 12z" fill="#da291c" />
        <circle cx="15" cy="23" r="6.5" fill={FACE} />
        <path d="M8.6 22.5c0-4.5 2.9-7.5 6.4-7.5s6.4 3 6.4 7.5c-1.6-2.4-3.8-3.5-6.4-3.5s-4.8 1.1-6.4 3.5z" fill="#ccd3de" />
        {/* father, right: white hair, glasses */}
        <path d="M21 48c0-7 5-12 12-12s12 5 12 12z" fill="#ffffff" />
        <circle cx="33" cy="24" r="6.5" fill={FACE} />
        <path d="M26.6 23c0-4.3 2.9-7 6.4-7s6.4 2.7 6.4 7c-1-1.2-2-1.8-3.2-1.8h-6.4c-1.2 0-2.2.6-3.2 1.8z" fill="#ffffff" />
        <circle cx="30.7" cy="24.6" r="1.9" fill="none" stroke={INK} strokeWidth="0.9" /><circle cx="35.3" cy="24.6" r="1.9" fill="none" stroke={INK} strokeWidth="0.9" />
        <path d="M32.6 24.6h0.8" stroke={INK} strokeWidth="0.9" />
      </g>
    </svg>
  );
  const look = {
    you: { bg: '#234b84', top: '#0b1f3a', hairBack: null, hair: 'M15.5 19.5c0-6.2 3.8-10 8.5-10s8.5 3.6 8.5 9.4c-2.3-3-5.3-4.2-8.5-4.2s-6.2 1.3-8.5 4.8z', r: 8.5, cy: 21, extra: null },
    spouse: { bg: '#da291c', top: '#ffffff', hairBack: 'M14.2 23c0-8.4 4.3-13.6 9.8-13.6s9.8 5.2 9.8 13.6v9.5c-3.4 2.2-16.2 2.2-19.6 0z', hair: 'M15.6 21.5c0-6.3 3.8-10.6 8.4-10.6s8.4 4.3 8.4 10.6c-2.8-3.8-5.6-5.4-8.4-5.4-2.4 1.9-5.3 3.6-8.4 5.4z', r: 8.2, cy: 21.5, extra: null },
    daughter: { bg: '#dfe8f5', top: '#da291c', hairBack: null, hair: 'M17 23c0-5.6 3.2-9.2 7-9.2s7 3.6 7 9.2c-1.9-2.8-4.3-4.1-7-4.1s-5.1 1.3-7 4.1z', r: 7.2, cy: 24, extra: 'pigtails' },
  }[who];
  return (
    <svg {...common}>
      <g>
        <rect width="48" height="48" fill={look.bg} />
        {look.hairBack ? <path d={look.hairBack} fill={INK} /> : null}
        {look.extra === 'pigtails' ? (<><circle cx="15.2" cy="22" r="3.6" fill={INK} /><circle cx="32.8" cy="22" r="3.6" fill={INK} /></>) : null}
        <path d={`M${who === 'daughter' ? 12 : 8} 48c0-${who === 'daughter' ? 7.5 : 9}${who === 'daughter' ? ' 5.4-13 12-13s12 5.5 12 13' : ' 7.2-15.5 16-15.5s16 6.5 16 15.5'}z`} fill={look.top} />
        {who === 'you' ? <path d="M20.5 33.2l3.5 4.3 3.5-4.3" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" /> : null}
        <circle cx="24" cy={look.cy} r={look.r} fill={FACE} />
        <path d={look.hair} fill={INK} />
        {who === 'daughter' ? <path d="M24 14.2l-3.2-2.2v4.4zM24 14.2l3.2-2.2v4.4z" fill="#da291c" /> : null}
      </g>
    </svg>
  );
}
