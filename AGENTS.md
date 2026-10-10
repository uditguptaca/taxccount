# Rules for anyone changing this repository (people and AI agents)

Read this before you change anything. `main` is deployed to production on
Vercel the moment it is pushed.

## The database (read twice)

- The app runs on **one PostgreSQL database on Vercel** (Neon, created from the
  project's Storage tab). There is **no Supabase, no SQLite and no fallback
  database**. Do not add one. A fallback that quietly switches to a file
  database on a serverless host loses data and hides the real error.
- `src/lib/db.ts` is the only connection layer. It finds the database setting,
  installs the schema on first use and reports problems in plain words. **Do not
  rewrite or replace it.** If a route needs something it does not offer, change
  that one thing and say why in the commit.
- Schema changes go in a new file `src/db/migrations/NNN_name.sql` (next number
  after the highest). Write **PostgreSQL** (`NOW()`, not `datetime('now')`;
  `IF NOT EXISTS`; no `AUTOINCREMENT`, no `PRAGMA`). The app applies new files
  once, in order, on the next request, and records them in `schema_migrations`.
- **Never create tables from a route or a helper at request time.** Use a
  migration. Old SQLite-style files `001`, `002_service_master` and
  `003_update_questions` are skipped on purpose.
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
