# Design: the public website

Written from the built site (2026-11-12, phase 19). It covers the public pages only (`src/app/site.css`,
`src/components/site`, the homepage, `/features`, `/compliance-guide`, the frame of `/compliance/*`). The app after
login has its own look and is not described here.

## Direction

**The page is a wallet** (owner, 2026-11-12: "a single compliance wallet that helps you minimise penalties for
non-compliance"; "it's all text, add some artifacts"). Every deadline a person or business carries is a card in one
stack, the soonest in front. The page explains itself in drawn pictures, not paragraphs, and is not about countries.
It replaced a text-and-table page ("the check is the page") that the owner rejected. Phase 20 (owner, 2026-11-12,
"I really like the theme"): statutory deadlines lead (corporation and income tax at the front), the free check is on
the first screen, and the page shows a family and several countries in one wallet.

## Colour

Navy blue, red, white, black and their shades, and nothing else (owner, 2026-11-11; the family used by
showingtrail.com), except country flags (owner, 2026-11-12). Blue is the ground and every calm state; red is the one action and whatever is urgent.

| Role | Token | Value | Used for |
|---|---|---|---|
| Ink | `--ink` | `#10192b` | text, the year line, the key tag, the main plan |
| Ink 2 / 3 | `--ink-2`, `--ink-3` | `#2b3648`, `#5a6577` | secondary and tertiary text on white |
| Paper | `--paper` | `#ffffff` | ground, the payroll card, receipts |
| Wash | `--wash` | `#eef3fa` | the check and plans sections |
| Lines | `--line`, `--line-2` | `#e2e7ef`, `#ccd3de` | rules, borders, the month grid |
| Navy field | `--brand` | `#0b1f3a` | the top field, the passport booklet |
| Deep | `--deep` | `#071527` | the "keeps watch" section, the footer |
| Blue | `--blue` | `#234b84` | the passport card, the insurance folder, own items (dashed), links in the check |
| Red | `--mark`, `--mark-hover` | `#da291c`, `#c62a1f` | the primary action, the front wallet card, object tabs, "Today", the closing band |
| Red, bright | `--mark-bright` | `#ec5a4c` | the second line of the headline on navy, the focus ring |
| Red, deep and wash | `--red-deep`, `--red-wash` | `#a3201d`, `#fdf1ef` | the receipts section, "not sure", "please confirm" |
| Time left | `.ab-left` with `--red`, `--amber`, `--green` pairs | see `site.css` | up to 7 days red; up to 30 the stronger blue; later the lighter blue |

Secondary text on a coloured field is tinted from that field (`--on-brand-2: #c9d6ea` on navy, `#c3d0e4` on deep,
`#fde3df` on red), never grey. The check panel keeps the app's utility classes, re-pointed to this palette under
`.ab .t1-scope`.

## Type

- Display: **Bricolage Grotesque** 700 to 800, tracking -0.028em, line height 1.04, balanced. h1 up to 4.9rem, the
  second line in red.
- Text: **Hanken Grotesk** 400 to 700, 17px (16px on phones), line height 1.55.
- No kickers above headings, no monospace. Headings are short sentences ("If it has a date, it goes in.").

## The pictures (`src/components/site/Wallet.tsx`)

All drawn in HTML and CSS with lucide icons; no stock images.

- **Wallet stack** `.ab-stack > .ab-pass`: five passes overlapped like a phone wallet (each shows a 72px strip),
  one family and its company across three countries (a small country code `.ab-cc` beside each name), corporation
  tax in red at the front, then payroll, two income tax returns and a passport; skins black, blue, wash, white, red; the whole stack tilted -2.2deg on a soft blue glow. Each pass: kind
  with icon, a time-left chip, the name; the front one adds the date large and two pill actions. Captioned "Example
  wallet". Its dates are today plus a fixed number of days, so the chips never go stale.
- **Family** `.ab-family`: one column per person (you, spouse, kids, parents, company), an avatar and their own
  small cards with country code and time left. Illustrative, captioned "Example family".
- **Countries** `.ab-globe`: one tile per country in the rules with a rotated seal of its code, its count and
  areas read from the rules, a guide link, and a dashed "More countries" slot.
- **Shelf** `.ab-shelf > .ab-thing`: nine objects on a ruled shelf, tax and company filings first, each drawn as what it is (booklet with a spine,
  plastic card with a photo, page with a round stamp, folder with a tab, sheet with a folded corner, certificate with
  a seal, payslip with a torn edge, key tag, dashed empty slot for "your own"), each with a small red tab ("Renew",
  "File", "Pay"). Lifts and tilts on hover.
- **Year line** `.ab-year`: twelve months on a black line, dashed month grid, red "Today". Labels sit in four lanes
  (two above, two below) chosen so no two overlap and no stem crosses a label; the line's height follows the lanes
  in use. The four items "added by you" (dashed) are always placed; official items that fit nowhere are left off.
  Names lose their place and bracketed sub-case (`plainName`), the office is said as a role (`plainRole`: tax
  authority, company registry, workers' insurance board). Captioned as an example. Under 860px it becomes a list.
- **Receipts** `.ab-receipt`: white slips with a zigzag bottom (mask), a red "Late fee" chip, the compliance, the
  penalty in the authority's words and "Read on the official page". The examples' own penalties first, topped up
  from the site's read penalties whose names carry no place.
- **Phone** `.ab-phone`: a black handset tilted 2deg, the account inside (tiles, rows with "Mark as filed", one own
  item outlined in blue), captioned "Example account".

## Movement and portraits (phase 21)

- **Wallet turns** (`WalletCycle` in `Motion.tsx`): every 3.6 s the front card slides to the back; hover pauses it.
  The server draws the cards in order, so without scripts the page is the same, still picture.
- **Plays in on scroll** (`RevealRoot`): blocks marked `data-reveal` that are below the fold get `data-in="0"` and
  play when seen: family columns rise, flags stamp down, shelf objects drop onto the shelf, the year line draws
  and its labels pop, receipts print, the phone slides in. Nothing is hidden without scripts.
- **Counting**: the deadline count counts up once (`CountUp`); the real figure is in `data-total`.
- **Moving strip** `.ab-ticker`: real compliance names from the rules (most central confirmed ones, interleaved by
  country, no place in the name), each with its flag; pauses on hover.
- **Three steps** `.ab-how`: three small screens that loop every 6 s: a Yes being picked, rows arriving, a card
  dropping into the wallet. Illustrations.
- **Portraits** (`Avatars.tsx`): flat drawings for you, spouse, daughter, kids, parents and the company building,
  on every wallet card and family column. **Flags** (`Flags.tsx`): the one place colours outside the palette are
  used, because a flag is only recognisable in its own; beside every country code and on the country tiles.
- **The check**: a five-step rail above the choices (done navy with a tick, current red and pulsing), a "Start
  here" / "Next" tag on the next choice, larger boxes, and the go button pulsing once it is ready.
- Under `prefers-reduced-motion` every animation and transition is off.

## Layout

- Full width; content in `.ab-wrap` (`min(1360px, 100% - 2 * gutter)`).
- First viewport: headline, copy and two actions on the left; the wallet on the right; the check panel straddles
  the field's lower edge so its first row is on screen at 1360x900.
- Order: wallet, the check, family, countries (wash), shelf, the year, receipts (red wash), keeps watch with the
  phone (deep), plans, questions, red close, footer.
- Breakpoints: 1080px (two columns become one), 860px (menu becomes `<details>`, plans and receipts stack, the year
  becomes a list), 620px (shelf in three columns, single column elsewhere).

## Components

- **Buttons** `.ab-btn`: pills, 46px. `-mark`/`-brand` the red action, `-line` secondary, `-ghost` secondary on colour.
- **Time-left chip** `.ab-left`: one chip everywhere (wallet, year, phone).
- **Plans** `Plans.tsx`: three columns in one bordered block, the middle one inverted, no label above a heading.
  Prices are the owner's.
- **One action word**: "Mark as filed", the app's own button, everywhere on the page.
- **Questions**: `<details>`, a plus that turns.

## Motion

One authored moment: the wallet's passes are dealt into place on load, staggered 95ms, from 46px below (always
visible). Year labels fade up once. Everything stops under `prefers-reduced-motion`.

## Truth rules that shape the design

- The wallet passes and the "added by you" items (car and home insurance, passport, driving licence) are
  illustrations and say so. Every other
  date, name, count and penalty is read from the rules at render time (`src/lib/site-data.ts`).
- No invented customers, counts or claims; reminders by email are not offered (the questions say so).
- External links to government pages open in a new tab and are underlined (`.ab-link`).
