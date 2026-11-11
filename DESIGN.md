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

Committed, flat, no gradients. Scene: a person at home in daylight, reading something that matters, so light ground.

| Role | Token | Value | Used for |
|---|---|---|---|
| Ink | `--ink` | `#15132e` | text, the selected example, the main plan |
| Ink 2 / 3 | `--ink-2`, `--ink-3` | `#47455f`, `#6a6883` | secondary and tertiary text on white |
| Paper | `--paper` | `#ffffff` | ground |
| Wash | `--wash` | `#f3f2fb` | every second light section, quiet panels |
| Brand field | `--brand` | `#3d34c4` | the top field and the closing band, buttons on white |
| Deep | `--deep` | `#17144d` | the account section, the footer |
| Mark | `--mark` | `#ffd23f` | the one primary action on a coloured field, the logo tile, "what missing one costs" |
| States | red / amber / green pairs | see `site.css` | time left: under 7 days, under 30, later; filed |

Secondary text on a coloured field is tinted from that field (`--on-brand-2: #d6d3ff`), never grey.

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

- **Buttons** `.ab-btn`: pills, 46px tall. `-mark` (primary on colour), `-brand` (primary on white), `-line`
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
