# Design: the public website

Written from the built site (2026-11-11). It covers the public pages only (`src/app/site.css`, `src/components/site`,
the homepage, `/features`, `/compliance-guide`, the frame of `/compliance/*`). The app after login has its own look
and is not described here.

## Direction

The owner chose the familiar modern software-site form over three dealt directions, and left the references to
judgment: built to sit beside Wise and Wealthsimple (money and tax for individuals, across countries). The idea the
page owns: **the check is the page**. A visitor sets the filters and gets their list; every section below shows that
list at work on real cases. It refuses the dashboard-mock hero with three feature cards.

## Colour

Navy blue, red, white, black and their shades, and nothing else (owner, 2026-11-11: "only use red, blue, white and
black and their variants"; the family is the one used by showingtrail.com, read from its stylesheet). Flat, no
gradients. Blue is the ground and every calm state; red is the one action and whatever is urgent.

| Role | Token | Value | Used for |
|---|---|---|---|
| Ink | `--ink` | `#10192b` | text, the selected example, the main plan |
| Ink 2 / 3 | `--ink-2`, `--ink-3` | `#2b3648`, `#5a6577` | secondary and tertiary text on white |
| Paper | `--paper` | `#ffffff` | ground |
| Wash | `--wash` | `#eef3fa` | every second light section, quiet panels |
| Lines | `--line`, `--line-2` | `#e2e7ef`, `#ccd3de` | rules and borders |
| Navy field | `--brand` | `#0b1f3a` | the top field |
| Deep | `--deep` | `#071527` | the account section, the footer |
| Blue | `--blue` | `#234b84` | links and labels in the check and the guides, the progress bar |
| Red | `--mark`, `--mark-hover` | `#da291c`, `#c62a1f` | the primary action everywhere, the logo tile, the closing band |
| Red, bright | `--mark-bright` | `#ec5a4c` | the highlighted words in the headline on navy, the focus ring |
| Red, deep and wash | `--red-deep`, `--red-wash` | `#a3201d`, `#fdf1ef` | "what missing one costs", "not sure", "please confirm" |
| Time left | `--red`, `--amber`, `--green` pairs | see `site.css` | under 7 days is red; under 30 the stronger blue; later and filed the lighter blue |

Secondary text on a coloured field is tinted from that field (`--on-brand-2: #c9d6ea` on navy, `#fde3df` on red),
never grey. On the red closing band the action is white with red text.

The check panel and the guide pages are drawn with the app's own utility classes, which stay as they are after
login. `site.css` re-points those classes to this palette under `.ab .t1-scope` only: an action is red, a choice
that is switched on is navy, links are blue.

## Type

- Display: **Bricolage Grotesque** 700 to 800, tracking -0.028em, line height 1.04, balanced. h1 up to 4.6rem.
- Text: **Hanken Grotesk** 400 to 700, 17px, line height 1.55, measure capped at 62ch.
- Numbers in the coverage table and the plans use the display face with tabular figures.
- No kickers above headings. No monospace.

## Layout

- Full width. Every section spans the viewport; content sits in `.ab-wrap` (`min(1360px, 100% - 2 * gutter)`).
- The top field holds the header, the headline (left) and three plain facts (right). The check panel straddles the
  field's lower edge.
- Section headings pair with a lede on the right (`.ab-head`), collapsing to one column under 1080px.
- Structure comes from tables, lists and rule lines. There are no icon cards.
- Breakpoints: 1080px (two columns become one), 860px (nav becomes a `<details>` menu, plans stack, the table
  becomes labelled blocks), 620px (single column everywhere).

## Components

- **Buttons** `.ab-btn`: pills, 46px tall. `-mark` (primary on colour) and `-brand` (primary on white) are both the red action, `-line`
  (secondary), `-ghost` (secondary on colour).
- **Example switcher** `Cases.tsx`: a vertical tab list beside a panel of rows; a row is name, date with a time-left
  chip, then the cost of missing and the source.
- **Coverage table** `.ab-table`: a real `<table>`; area names are small pills with their count.
- **Specimen** `.ab-specimen`: one result as a definition list.
- **Board** `.ab-board`: an example of a saved list; labelled "Example".
- **Plans** `Plans.tsx`: three columns in one bordered block, the middle one inverted.
- **Questions**: `<details>`, a plus that turns.

## Motion

One authored moment: the rows of an example rise in, staggered, when the example changes. Buttons shift colour.
Everything stops under `prefers-reduced-motion`.

## Truth rules that shape the design

- Figures, the coverage table, the examples and the penalties are drawn from the rules at render time
  (`src/lib/site-data.ts`). The design leaves room for them to change.
- An example is labelled as an example. No invented customers.
- External links to government pages open in a new tab and are underlined (`.ab-link`).
