// Country flags, drawn as small SVGs (owner, 2026-11-12: "put proper flags in there"). These are the one place on
// the site that uses colours outside navy, red, white and black, because a flag is only recognisable in its own
// colours. Simplified for small sizes; 3:2 frame for all, so they line up.
const W = 30, H = 20;

function Canada() {
  return (<>
    <rect width={W} height={H} fill="#ffffff" />
    <rect width="7.5" height={H} fill="#d52b1e" /><rect x="22.5" width="7.5" height={H} fill="#d52b1e" />
    <path transform="translate(15 10.4) scale(0.62)" fill="#d52b1e"
      d="M0-9L1.5-6L3-7L2.5-3L5.5-5L5-3.5L8-3L6.5-1.5L7.5 0L3 .5L3.5 2L.5 1.2L.5 5L-.5 5L-.5 1.2L-3.5 2L-3 .5L-7.5 0L-6.5-1.5L-8-3L-5-3.5L-5.5-5L-2.5-3L-3-7L-1.5-6Z" />
  </>);
}

function UnitedStates() {
  const stripes = Array.from({ length: 13 }, (_, i) => i);
  return (<>
    {stripes.map((i) => <rect key={i} y={(i * H) / 13} width={W} height={H / 13 + 0.02} fill={i % 2 ? '#ffffff' : '#b22234'} />)}
    <rect width="12" height={(H * 7) / 13} fill="#3c3b6e" />
    {Array.from({ length: 20 }, (_, k) => <circle key={k} cx={1.3 + (k % 5) * 2.35} cy={1.3 + Math.floor(k / 5) * 2.55} r="0.45" fill="#ffffff" />)}
  </>);
}

function India() {
  return (<>
    <rect width={W} height={H / 3} fill="#ff9933" />
    <rect y={H / 3} width={W} height={H / 3} fill="#ffffff" />
    <rect y={(2 * H) / 3} width={W} height={H / 3} fill="#138808" />
    <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.45" />
    {Array.from({ length: 24 }, (_, k) => { const a = (k * Math.PI) / 12; return <line key={k} x1="15" y1="10" x2={15 + 2.5 * Math.cos(a)} y2={10 + 2.5 * Math.sin(a)} stroke="#000080" strokeWidth="0.18" />; })}
    <circle cx="15" cy="10" r="0.5" fill="#000080" />
  </>);
}

function Emirates() {
  return (<>
    <rect width={W} height={H / 3} fill="#00732f" />
    <rect y={H / 3} width={W} height={H / 3} fill="#ffffff" />
    <rect y={(2 * H) / 3} width={W} height={H / 3} fill="#000000" />
    <rect width="7.5" height={H} fill="#ff0000" />
  </>);
}

const DRAW: Record<string, () => JSX.Element> = { CA: Canada, US: UnitedStates, IN: India, AE: Emirates };

export function Flag({ cc, width = 30, className }: { cc: string; width?: number; className?: string }) {
  const D = DRAW[cc];
  if (!D) return null;
  return (
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} className={`ab-flag${className ? ' ' + className : ''}`} aria-hidden="true">
      <D />
    </svg>
  );
}

/** The country a deadline belongs to: its flag and its two-letter code. */
export function CC({ cc }: { cc: string }) {
  return <span className="ab-cc" title={cc}><Flag cc={cc} width={15} />{cc}</span>;
}
