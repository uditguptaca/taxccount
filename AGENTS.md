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
  `src/db/seed-reference.ts`.
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
- The middleware verifies the session token's signature; do not add public API routes. Never add a route that
  deletes or reseeds data without a platform-admin check.
- The full list of queries that still lack a firm condition is in `docs/TENANT-ISOLATION.md`; fix them when
  you touch those routes.

## Pages and APIs must agree

- Read the page that calls an endpoint before you change its response. The T1 intake pages read
  `{ engagements }`, `{ engagement }`, `{ responses }`, `{ reviewItems }`, `{ documents }`, `{ notes }`; the API once
  returned bare arrays, so the whole module showed nothing.
- A button that sends a `POST` with no body needs a route that accepts no body.
- Open the feature in a browser (or run the checks in `tests/verify`) before saying it works.

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
