# Design: the public website

Written from the built site (2026-11-12, phase 19). It covers the public pages only (`src/app/site.css`,
`src/components/site`, the homepage, `/features`, `/compliance-guide`, the frame of `/compliance/*`). The app after
login has its own look and is not described here.

## Direction

**The page is a wallet** (owner, 2026-11-12: "a single compliance wallet that helps you minimise penalties for
non-compliance"; "it's all text, add some artifacts"). Every deadline a person or business carries is a card in one
stack, the soonest in front. The page explains itself in drawn pictures, not paragraphs, and is not about countries.
It replaced a text-and-table page ("the check is the page") that the owner rejected.

## Colour

Navy blue, red, white, black and their shades, and nothing else (owner, 2026-11-11; the family used by
showingtrail.com). Blue is the ground and every calm state; red is the one action and whatever is urgent.

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
  skins black, blue, wash, white and red in front; the whole stack tilted -2.2deg on a soft blue glow. Each pass: kind
  with icon, a time-left chip, the name; the front one adds the date large and two pill actions. Captioned "Example
  wallet". Its dates are today plus a fixed number of days, so the chips never go stale.
- **Shelf** `.ab-shelf > .ab-thing`: nine objects on a ruled shelf, each drawn as what it is (booklet with a spine,
  plastic card with a photo, page with a round stamp, folder with a tab, sheet with a folded corner, certificate with
  a seal, payslip with a torn edge, key tag, dashed empty slot for "your own"), each with a small red tab ("Renew",
  "File", "Pay"). Lifts and tilts on hover.
- **Year line** `.ab-year`: twelve months on a black line, dashed month grid, red "Today". Labels sit in four lanes
  (two above, two below) chosen so no two overlap and no stem crosses a label; items that fit nowhere are left off,
  except the two added by hand, which are always placed. Under 860px it becomes a list down a vertical line.
- **Receipts** `.ab-receipt`: white slips with a zigzag bottom (mask), a red "LATE" stamp, the compliance, the
  penalty in the authority's words and the page it was read on.
- **Phone** `.ab-phone`: a black handset tilted 2deg, the account inside (tiles, rows with "Mark as filed", one own
  item outlined in blue).

## Layout

- Full width; content in `.ab-wrap` (`min(1360px, 100% - 2 * gutter)`).
- First viewport: headline, one line of copy and two actions on the left; the wallet on the right.
- Order: wallet, shelf, the check (wash), the year, receipts (red wash), keeps watch with the phone (deep), who it is
  for (one line each), plans, questions, red close, footer.
- Breakpoints: 1080px (two columns become one), 860px (menu becomes `<details>`, plans and receipts stack, the year
  becomes a list), 620px (shelf in three columns, single column elsewhere).

## Components

- **Buttons** `.ab-btn`: pills, 46px. `-mark`/`-brand` the red action, `-line` secondary, `-ghost` secondary on colour.
- **Time-left chip** `.ab-left`: one chip everywhere (wallet, year, phone).
- **Plans** `Plans.tsx`: three columns in one bordered block, the middle one inverted. Prices are the owner's.
- **Questions**: `<details>`, a plus that turns.

## Motion

One authored moment: the wallet's passes are dealt into place on load, staggered 95ms, from 46px below (always
visible). Year labels fade up once. Everything stops under `prefers-reduced-motion`.

## Truth rules that shape the design

- The wallet passes and the "added by you" items (car insurance, passport) are illustrations and say so. Every other
  date, name, count and penalty is read from the rules at render time (`src/lib/site-data.ts`).
- No invented customers, counts or claims; reminders by email are not offered (the questions say so).
- External links to government pages open in a new tab and are underlined (`.ab-link`).
