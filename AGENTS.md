# Rules for anyone changing this repository (people and AI agents)

Read this before you change anything. `main` is deployed to production on
Vercel the moment it is pushed.

## The database (read twice)

- The app runs on **one PostgreSQL database on Vercel** (Neon, created from the
  project's Storage tab). There is **no Supabase, no SQLite and no fallback
  database**. Do not add one. A fallback that quietly switches to a file
  database on a serverless host loses data and hides the real error.
  `src/db/setup.js` (`hostKind`) refuses any Supabase address, so an old
  variable left in Vercel cannot be used by mistake.
- **Everything lives in Neon, including uploaded files** (`document_blobs`).
  Never write to the server's disk (`fs`, `public/uploads`): Vercel's disk is
  read-only. Never add one-off scripts to the repository root or `scripts/`
  that talk to a database; the schema comes from migrations, reference data from
  `src/db/seed-reference.ts`. The one exception is the platform admin's import tool
  (`src/lib/db-import.ts`, `/platform/import`): it reads an old database whose address the
  admin pastes at that moment, and nothing else in the code may open a second database.
- `src/lib/db.ts` is the only connection layer. It finds the database setting,
  installs the schema on first use and reports problems in plain words. **Do not
  rewrite or replace it.** If a route needs something it does not offer, change
  that one thing and say why in the commit.
- Schema changes go in a new file `src/db/migrations/NNN_name.sql` (next number
  after the highest). Write **PostgreSQL** (`NOW()`, not `datetime('now')`;
  `IF NOT EXISTS`; no `AUTOINCREMENT`, no `PRAGMA`). The app applies new files
  once, in order, on the next request, and records them in `schema_migrations`.
- **Never create tables from a route or a helper at request time.** Use a
  migration.
- Test a schema change on an empty local Postgres before pushing:
  `DATABASE_URL=postgresql://… node scripts/db-setup.js`

## Calling the database

- Every call returns a Promise. **Always `await` it:**
  `const row = await db.prepare('SELECT … WHERE id = ?').get(id)`. Without the
  `await` a list endpoint returns `{}` and a write reports success before the
  row exists. (36 calls in the tax-intake routes had this mistake.)
- A batch that must succeed or fail together uses the transaction handle for
  every statement: `await db.transaction(async (tx) => { await tx.prepare(…).run(…) })()`.
  Statements made on `db` inside it are not part of the transaction.
- A helper that queries must be `async`, and its callers must `await` it.
- A route that reads the database and takes no request or cookies needs
  `export const dynamic = 'force-dynamic'`, or it is run once at deploy time
  and serves the same answer forever.

## Written for SQLite, running on PostgreSQL: the usual mistakes

This code base was started on SQLite. These are the ones that already broke things; do not reintroduce them.

- **Numbers.** The connection returns `COUNT(*)`, `SUM()` and `NUMERIC` as JavaScript numbers (`src/db/setup.js`).
  Do not wrap them in `parseInt` or add them as strings.
- **SQLite-only SQL does not exist here:** `GROUP_CONCAT` (use `string_agg`), `strftime` (use `to_char`),
  `INSTR` (use `STRPOS`), `IFNULL` (use `COALESCE`), two-argument `MAX(a, b)` (use `GREATEST`), `INSERT OR REPLACE`
  (use `ON CONFLICT`), `datetime('now')` (use `NOW()`). `LIKE` is already case-insensitive in `db.ts`.
- **Foreign keys are enforced.** Never write the text `'system'`, `'user_1'` or any made-up id into a column
  that points at users (`created_by`, `actor_id`, `uploaded_by`, `assigned_to`, ...). Use the signed-in user
  (`session.userId`). Automated work (the scheduler) may use the real user `system` (migration 020).
- **`org_id` is required** on almost every table. Pass it explicitly on every insert. Migration 019 fills it from
  the parent row as a safety net for child tables; do not rely on it.
- **`undefined` is not `null`.** Convert before passing to the database.
- **A column used in code must exist in a migration.** Never add a column to the live database by hand.
- **Scheduled jobs** (`/api/cron/*`) accept only `CRON_SECRET` or a signed-in platform admin. Never add a
  default secret or a query-string bypass (`?test_cron=true` used to let anyone run them).

## Firm isolation (every firm's data is private to that firm)

- Every query on a firm-owned table includes `org_id = ?` with the session's firm.
- A route that takes an id from the URL must check that the row belongs to the caller's firm *before* using it:
  `requireClientAccess(db, clientId)` and `requireRowInOrg(db, 'document_files', id)` in `src/lib/tenant.ts`.
- A client signed in to the portal has a **firm** (`session.orgId`) and a **client record**
  (`clients.portal_user_id = session.userId`). They are different ids. Use `clientIdsFor()` in
  `src/lib/portal-client.ts`; never compare `session.orgId` with a client id.
- No "demo fallback" that returns other firms' rows when the caller has none.
- The middleware verifies the session token's signature; do not add public API routes (the one exception is
  `/api/public/compliance`, the free checker, which reads no database and returns no stored data). Never add a route that
  deletes or reseeds data without a platform-admin check.
- The full list of queries that still lack a firm condition is in `docs/TENANT-ISOLATION.md`; fix them when
  you touch those routes.

## Pages and APIs must agree

- Read the page that calls an endpoint before you change its response. The T1 intake pages read
  `{ engagements }`, `{ engagement }`, `{ responses }`, `{ reviewItems }`, `{ documents }`, `{ notes }`; the API once
  returned bare arrays, so the whole module showed nothing.
- A button that sends a `POST` with no body needs a route that accepts no body.
- Open the feature in a browser (or run the checks in `tests/verify`) before saying it works.

## The T1 intake (detailed Canadian personal tax form)

- **One engine, two sides.** Everything about WHAT is asked, WHEN, what is required and what looks wrong is in
  `src/lib/t1/` (plain TypeScript, no framework imports, `.ts` import endings). The client's screen, the preparer's
  workspace, the admin's preview, the API and the tests all run the same code. Do not copy a rule into a screen.
- **Questions live in `src/lib/t1/catalogue/*.ts`**, one file per part (A to AD). Each question has English and French
  text, a type, conditions (`show`, `req`), documents, review rules and, for slips, the box number read from the
  official page. Change a question, then bump `CATALOGUE_VERSION` in `catalogue/index.ts`, run
  `node --experimental-strip-types scripts/t1-docs.ts` and commit `docs/t1/`.
- **Blank is never "No" or zero.** `I'm not sure` opens a branch like "Yes". A rule that uses a figure (a limit, a date)
  reads it from `config/years.ts` and only when it is verified for exactly that tax year; otherwise it makes a
  review item. Never carry a figure from one year to the next, and never type a section number or amount from memory.
- **Answers are never deleted.** Every change goes to `tax_intake_response_history`; a removed record keeps its answers
  there; answers saved by an older form stay and are shown to the preparer as "from an earlier version".
- **Review items are matched by `dedupe_key`**, one per finding. Do not insert one per save.
- **Files go through `/api/tax-intake/<id>/documents`** (kept in Neon like every other document: 4 MB, type and
  signature checked).
- **Styling.** The app has no Tailwind. The T1 screens use Tailwind scoped to `.t1-scope` (see `tailwind.config.js`,
  `src/components/t1/t1.css`) with no global reset, so it cannot change any other page. Wrap every T1 screen in
  `<Scope>`. Other pages that use Tailwind class names are unstyled; do not assume they work.
- Verify: `node --experimental-strip-types tests/verify/t1_engine.ts`, then the API and browser suites.

## The free compliance checker (homepage)

A visitor picks country, state, entity type and department on the homepage, answers the questions, and sees
the three most important compliances; registering puts all of them in their account ("My compliances").

- **The rules the checker runs are in the database, and Service Master edits them** (next section). The
  files `src/lib/compliance/countries/{ca,us,us-states,in,ae}.ts` are the BUILT-IN rules: they fill an empty
  database and bring unchanged rows up to date when a file's `version` changes. They are written with the
  short forms in `src/lib/compliance/dsl.ts` and run by `src/lib/compliance/engine.ts`. No framework imports,
  `.ts` import endings: the tests run them with `node --experimental-strip-types`.
- **Never write a date, threshold or form number from memory.** Every filing names its official `source`.
  `verified: true` means the due date and the trigger were read on that official page on the date in the
  source's `checked` field; anything else stays `verified: false` and the person is told to confirm it. When a
  site refuses automated access, leave the item unverified; do not work around the refusal.
- **"Not sure" never hides a filing**: it is shown as "check". A question that was never asked counts as "no".
- **Dates**: `afterFY`, `afterPeriod`, `fixed`, `inYear`, `anniversary`, `on`, `event` (see `types.ts`). A
  one-off extension goes in `except` (India's audit-case return for FY 2025-26). Dates move off weekends only
  where the country's pack says so, and a filing whose authority's weekend rule was not confirmed sets
  `roll: false`.
- **To add a country**: add `countries/xx.ts` exporting a `CountryPack`, add it to `PACKS` in
  `src/lib/compliance/index.ts`, and add named situations to `tests/verify/compliance_scenarios.ts`. The
  structure test then requires 7+ states, 5+ entity types, 20+ filings, 20+ questions on the fullest path of
  every entity type, and an official https source for every filing. No page or API changes are needed.
- **The public API gives away three results only.** `/api/public/compliance` returns three compliances in full
  and, for the rest, only the heading, frequency and month. The full list is built on the server again when
  the person saves, from a signed ticket (`src/lib/compliance-server.ts`); the public route writes nothing.
- **Saved checks** are `compliance_tracker_profiles` plus ordinary rows in the person's vault
  (`personal_compliance_items` for a person, `personal_entities` + `personal_entity_compliance` for a business),
  tagged with `tracker_profile_id`. Every read and write is limited to `session.userId`. Saving takes a
  per-user lock so the same check cannot be stored twice.
- **"My compliances" (`/portal/compliance-check`) is the one page a person runs everything from**: tiles
  (overdue, due in 7 and 30 days, filed), "Next up" across every saved check with the time left
  (`src/lib/compliance/timeleft.ts`), and per item: mark as filed, change the date, a note, and papers.
  A person can add a compliance from the country's list by hand (`tracker_meta.manual`, it keeps following its
  rule) or something of their own (`tracker_compliance_id` starts with `custom:`, optional repeat). Neither is
  ever removed or re-dated by a change of answers or of the rules. Papers are rows in
  `compliance_tracker_documents` (bytes in Neon, 4 MB each, documents and images only), tied to the saved check
  and the compliance, read and written only with the owner's user id (`/api/compliance-tracker/documents`).
- **The questions are shown a few at a time** (`PER_SCREEN` in `Checker.tsx`), a follow-up only after the
  question that opens it is answered, and every question has an information point: its `help`, how to answer,
  and what the answer decides (`about`, worked out in `lightPack()` from the same links Service Master shows;
  headings only, never filing names).
- **Public guide pages** (`/compliance`, `/compliance/<country>`, `/compliance/<country>/<entity>`): server-rendered
  from the same rules (`src/lib/compliance/guide.ts`), for visitors and search engines. An entity page shows six
  filings in full with their government source and counts the rest by area: the personal list stays behind the
  check. `src/app/sitemap.ts` and `src/app/robots.ts` list them; each page sets its own title, description,
  canonical address and breadcrumb structured data.
- Its screens use the scoped Tailwind (`<Scope>`), like the T1 form.

## Service Master (platform admin): where the checker's rules are kept and changed

`/platform/service-master/*` is the owner's control panel for the compliance checker. Everything the homepage
asks and answers is read from here; nothing about the checker is decided anywhere else.

- **One table, one row per item**: `compliance_catalog (country, kind, id, data JSON, sort_order, is_active,
  edited, origin)`, kinds `country | state | entity | department | step | question | compliance | source`.
  `src/lib/compliance/catalog.ts` turns a `CountryPack` into rows and back (`packToRows`, `rowsToPack`); a test
  proves the round trip changes nothing. Compliance heads and penalties are fields of a compliance, not tables.
  The old `sm_*` tables are NOT used by Service Master any more (the old "Browse compliances" pages still read them).
- **Read through `src/lib/compliance-catalog.ts` only** (`getPack`, `getPacks`): the public API, the saved
  checks and Service Master all use it. It seeds from the built-in files, caches for a few seconds, and never
  overwrites a row the admin changed (`edited = 1`). A built-in item can be switched off, not deleted (so a
  later built-in update cannot bring it back by surprise); "Restore built-in" puts the shipped version back.
- **One API**: `/api/platform/service-master/catalog` (GET overview, GET `?country=`, POST save / undo /
  restore / add-country, DELETE). It checks `role === 'platform_admin'` itself as well as the middleware.
- **A save is checked three ways before it is stored**: the item's own fields (`shape.ts`: a half-filled rule,
  an impossible date, an empty "any of" group), the whole country with the change in place (`integrity.ts`: a
  rule that points at a question, state, source or department that does not exist or is switched off), and the
  country must still have states, entity types, departments and compliances. A live country must stay sound; a
  country that is still switched off can be built up piece by piece. Messages are written for the owner, in
  plain words, with names and never internal ids.
- **Every change is in `compliance_catalog_history`** with who made it and the row before and after; Undo puts
  the row back.
- **People who already saved a check follow the rules**: after every save `refreshCountry()` re-works the saved
  checks of that country, and `refreshIfRulesChanged()` does the same when a person opens "My compliances".
  A date the person set by hand, anything marked as filed (the period filed is remembered in `tracker_meta.filed`
  and never comes back), and items that no longer apply are kept, the last flagged on the page. The pack
  `version` carries the time of the latest change, so two edits to the same item are two versions.
- **Dates the government moves**: a one-period extension is recorded on the compliance as
  `moved: [{ from, to, note }]` (the rule itself is left alone); a permanent change is a change to the rule.
  Both are in the compliance form, with the real next dates previewed before saving.
- **The year-end question has the fixed short code `fye`**: the date rules read its answer.
- **Screens**: `src/components/service-master/` (`ServiceMaster.tsx` shell and the list screens, `Views.tsx`,
  `Editors.tsx` the add/change window, `CondBuilder.tsx` "who it applies to", `DueBuilder.tsx` "when it is
  due"). `src/lib/compliance/describe.ts` says any rule in plain words and works out what each question is
  linked to; `health.ts` lists what has gone stale (a source not read for a year, a one-off date that passed,
  a question nothing depends on). "Service Rules" runs the real engine on any combination, in the browser.
- **The non-tax duties** (company registry upkeep, employment, workplace safety, privacy, anti-money-laundering,
  import/export, licences) come from research files in `docs/compliance-research/<cc>.json`: each item was read on
  the government's own page and keeps a quotation (`evidence`) and the page address. `scripts/compliance-import.ts`
  checks every item the way Service Master checks a save and writes `src/lib/compliance/countries/<cc>-more.ts`;
  `withMore()` (`more.ts`) joins it to the tax rules in `index.ts`. Never edit a `-more.ts` by hand and never add
  an item to a research file from memory. The importer also asks no more than needed: a new question is only
  asked when a department that uses it was chosen and after the earlier Yes it depends on, and the new yes/no
  questions sit in one group shown as a tick list (`Step.checklist`: a tick is Yes, no tick is No).
- **Corrections to rules that already exist** go in `docs/compliance-research/<cc>-fixes.json` (the United
  States has several: `us-fed-fixes.json`, `us-st1-fixes.json`, `us-st2-fixes.json`), never in the base country
  file. A fix can add a penalty (needs the quotation `penaltyEvidence` and the page `penaltySource`), confirm an
  item (`confirmed: true` with `confirmEvidence` and `confirmSource`), correct a deadline (`dueText`/`due`, only
  with that same confirmation quotation), set an item back to "to confirm" (`unverify: true`) or replace its note
  (`replaceNote: true`). The importer turns them into `patches` in the `-more.ts`, and `withMore()` lays them over
  the base rule (a `null` removes a field). New pages a fix cites have ids `<cc>_y_...`; new duties `<cc>_x_...`.
- **US state duties outside tax** (new-hire reporting, unemployment report, unclaimed property, breach notice)
  are in `us-states-g1..g5.json`, with the two questions they share in `us-shared.json`; ids are
  `us_x_<state>_...`. Every state and DC has at least three, and a test holds that.
- **Gap research** (2026-11-11) is in `docs/compliance-research/<cc>-gaps.json`, ids `<cc>_x_g_...`: personal documents
  and status (department `personal`; the UAE's existing `residency`), import and export, anti-money-laundering,
  environment, intellectual property, unclaimed amounts. Pass each country's gaps file to the importer with its
  other files. The tick-list group these questions sit in is called "What else applies to you".
- **The importer takes every file of one country in one run** and rewrites that country's `-more.ts` whole, so
  always pass them all (for the US: `us.json us-shared.json us-states-g1..g5.json us-fed-fixes.json
  us-st1-fixes.json us-st2-fixes.json`); leaving one out drops its items. `docs/compliance-research/README.md`
  lists every change made by hand to a researcher's file and why.
- **The live database only reloads the built-in rules when a country's version changes.** A fresh database
  (every test run) hides a forgotten version, so two checks in `compliance_engine.ts` hold it: the version of a
  `-more.ts` ends in a fingerprint of its content, stamped by the importer; and `tests/verify/pack-versions.json`
  remembers the fingerprint each hand-written country file had at its version. Change a country file → raise
  its `version` → run `compliance_engine.ts --record-versions` → commit the ledger. (2026-11-11: a second round
  of research read on the same day as the first shipped under the same date-only version, and the live site
  kept serving the first round until this was added.)
- **Only relevant questions are asked** (owner, 2026-11-11, after being asked about the small business deduction
  with only sales tax ticked). `relevantQuestions()` in `engine.ts` keeps a question only when a compliance of a
  ticked type, possible for this entity type and place, depends on it (who it applies to, or the date it counts
  from), or when it decides whether such a question is asked. `visibleQuestions()` filters by it, so the page, the
  "missing answers" check and the saved list all follow. A test holds two things for every country: no question
  is asked without need, and a single-type check returns exactly what the same type returns inside a full check.
- **A row never says only "no fixed date"** (owner, 2026-11-11). A duty with no calendar date (`due: { t: 'event',
  text }`) shows its rule in words. `src/lib/compliance/window.ts` reads the period out of those words ("Within 15
  days after ...", "At least once a year") only when they open with it; hours within a day, a period counted
  backwards ("30 days before") and anything unquantified give no window. With a window the saved-list row offers
  "It happened on…" / "Last done on…" (`count_from` in `/api/compliance-tracker`) and works out the deadline; it is
  kept like a hand-set date. An event rule may also name the date question it counts from (`from`), and then the
  deadline is worked out with no extra step; one that has gone by comes back as `passed` and the row says "Was due
  …". Worked-out deadlines are never pushed later off a weekend. Link `from` only when the question's wording is
  what the rule counts from. A duty that repeats must have a real date rule or be on the list
  `REPEATS_WITHOUT_A_DATE` in `compliance_engine.ts`, with the reason.
- **Where a penalty was read**: `Compliance.penaltySource` names a source; results carry `penaltySourceUrl` and
  every screen that shows a penalty links "(official page)" to it. A penalty with no page it was read on is not
  added; the item simply shows none.
- **To add a country now**: either add a built-in file as before, or add it in Service Master (it starts
  switched off) and switch it on when its problems list is empty.

## The public website (rebuilt 2026-11-11)

- **Scope**: `src/app/page.tsx` (homepage), `/features`, `/compliance-guide`, the frame of `/compliance/*`, and
  `src/components/site/*`. Styles are in `src/app/site.css`, every class starts with `ab-` under `.ab`; its resets
  use `:where()` so they never outrank a class. The login page and everything after login are not part of it.
- **Nothing on it is typed in as a figure or an invented person.** `src/lib/site-data.ts` reads the counts, the
  coverage table, the worked examples and the penalties from the rules at the moment the page is drawn. The
  examples are fixed sets of answers run through the real engine; keep each example's description in step with the
  questions its answers belong to.
- **Never claim**: reminders by email (none is sent), a number of users, customers' quotes, a Privacy Policy or
  Terms page (not written; the owner's lawyer supplies them), coverage of a country that is not in the rules. The site may say it is built for every country and that more
  are being added (owner, 2026-11-11), never which country or when. `PRODUCT.md`
  holds the full list and the owner's decisions; `DESIGN.md` describes the look.
- **Plans and prices** in `src/components/site/Plans.tsx` are the owner's. Change them only on the owner's word.
- The checker on the homepage is `<Checker wide />`: same component as in the account, laid out full width.

## Before you push

1. `git pull` first. Someone else may have pushed (a replaced `db.ts` once went
   unnoticed this way).
2. `npx tsc --noEmit` shows 0 errors and `npx next build` succeeds.
3. Do not commit `test-results/`, `playwright-report/`, `*.db` files, `.env*`
   files, or any password or connection string.
4. The login page's demo accounts, their emails and the shared password are
   deliberate. Do not change them without being asked.

## Where things are

- Setup steps for Vercel and local use: `README.md`
- Environment variables: `.env.example` (`DATABASE_URL`, `JWT_SECRET`)
- The database in plain words (where to look at the data, limits, backups): `README.md`, section "About the database (Neon)"
