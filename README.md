# Taxccount / Abidebylaw

Compliance and practice-management platform for an accounting firm: client
portal, staff dashboard, service master, smart forms, ledger, payroll and
corporate secretary modules. Next.js 14 (App Router) on Vercel, PostgreSQL
behind it.

## Where things run

| Part | Where |
|---|---|
| The app | Vercel project, production on the `main` branch |
| The database | **Neon** (PostgreSQL), created from the Vercel project's **Storage** tab. It holds everything: firms, users, clients, forms, ledgers, payroll **and every uploaded file**. |
| Login sessions | Signed with `JWT_SECRET` from the project's environment variables |

Nothing else is needed. There is no Supabase, Turso or SQLite in the live
setup, and the app refuses to connect to a Supabase address even if one is
left in the environment variables (it logs which variable to delete).
Nothing is stored on the web server's disk: Vercel's disk is read-only.

## Setting up the database on Vercel (one time)

1. Open the project's **Storage** tab → **Create Database** → choose
   **Neon** (Postgres) → pick the region closest to you → create it.
2. On the new database, click **Connect Project**, choose this project and
   all environments, and connect. Vercel adds the connection variables
   (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, or the same names with a prefix
   you choose). If it says a `DATABASE_URL` already exists, delete the old
   one under **Settings → Environment Variables** first. The app only ever
   uses Neon addresses (pooled first) and ignores any other cloud database.
3. **Deployments → Redeploy** the latest deployment so it picks up the new
   variables.
4. Recommended, any time: under **Settings → Environment Variables** add
   `JWT_SECRET` with a long random value (40+ characters), then redeploy.
   Without it, sessions are signed with a built-in development value that
   everyone who can read the source knows.

Then open `/login`. The first login on a fresh database takes a few seconds:
the app creates every table (from `src/db/schema.sql` and the migrations in
`src/db/migrations`) and seeds the demo accounts, then signs you in.

## Accounts

The seed creates demo accounts; the login page lists them. Every seeded
account uses the password shown there. Change them (or remove the demo block
from `src/app/login/page.tsx`) before real client data goes in.

## About the database (Neon)

- **What it is.** A PostgreSQL database hosted by Neon and managed from the
  Vercel project (Storage tab). It is the only database this app uses. Free
  plan at the time of setup: 1 GB of storage per project and 100 compute-hours
  a month, region Washington D.C. (East), next to Vercel's servers.
- **Looking at the data.** Vercel project → **Storage** → the Neon database →
  **Open in Neon**. In Neon use **Tables** to browse and **SQL Editor** to
  query. Or from a computer with `psql`: copy `DATABASE_URL` from Vercel →
  Settings → Environment Variables and run `psql "<that value>"`. Treat that
  value like a password.
- **What is in it.** 175 tables after setup: firms, users and memberships,
  clients and engagements, the service master, smart forms, the T1 tax intake
  (`tax_intake_*`), accounting ledgers, payroll, corporate secretary
  (`cs_*`), settings, and `schema_migrations` (which migration files have
  been applied).
- **First request.** The app creates all of the above and the demo accounts
  the first time anyone signs in on an empty database, which takes a few
  seconds.
- **Quiet periods.** A free Neon database goes to sleep when idle, so the
  first request after a quiet spell can take a second or two longer.
- **Backups.** The free plan keeps only a short window of history for
  restoring (see the plan in Neon). Export anything you cannot lose
  (`pg_dump "<DATABASE_URL>" > backup.sql`) before relying on it.
- **Reference data.** The corporate secretary document templates load by themselves into an empty
  table (`src/db/seed-reference.ts`, data in `src/db/reference/`). Sample content that earlier one-off
  scripts created (sample corporations, sample ledger entries, sample forms) is demo data and is not
  created. Real data from a previous database is brought over with **Platform → Import data** (below).
- **Uploaded files.** Documents clients and staff upload are stored in the `document_blobs` table, next
  to the row that describes them, and are served by `/api/documents/<id>/download` after a permission
  check. The limit is **4 MB per file** because Vercel rejects larger request bodies.

## Moving data from an old database into Neon

Signed in as a **platform admin**, open **Platform → Import data**. Paste the old database's address (for a
Supabase project use the *Session pooler* address from **Connect**, with the database password filled in), press
**Check the old database**, choose **Replace** (empties this database first; you must type `REPLACE`) or **Add**
(keeps what is here, skips rows that already exist), and press **Start copying**. The page copies table by table
with a progress bar and finishes with a report comparing the row counts of both sides. After a Replace, sign in
again: the accounts now come from the old database.

How it stays exact (`src/lib/db-import.ts`): values are copied as text so the database converts them to the
column's own type; only columns that exist on both sides are copied (an old database that lacks a newer column,
or has an extra one, still imports and the page warns about what is not copied); tables go in foreign-key order
and a row whose parent has not arrived yet is parked and placed at the end; counters for new records are moved
past the highest copied id. The address is used for the one request, never stored, logged or sent back. It refuses
to import a database into itself and refuses a Replace when the old database has no active platform admin.
Uploaded files are not in the old database (they were on a disk); only their records are copied.
Tested by `tests/verify/import.py` and `tests/verify/import_browser.cjs`.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | The Neon connection string, added by Vercel when Neon is connected. Prefixed variants (`DATABASE_POSTGRES_URL`, `*_URL_UNPOOLED`, ...) are tried too, pooled Neon addresses first. A Supabase address is never used. A local PostgreSQL address also works for development and tests. |
| `JWT_SECRET` | Signs login sessions. Required in production. |
| `CRON_SECRET` | Lets Vercel's scheduler run the daily jobs (`/api/cron/*`). Any long random value; Vercel sends it automatically once it exists. Without it only a signed-in platform admin can run those jobs. |

See `.env.example`.

## Running locally

```bash
cp .env.example .env.local     # then point DATABASE_URL at a local Postgres
npm install
npm run dev                    # http://localhost:3000
```

The schema installs itself on the first request. To install it ahead of
time, or to check a database by hand:

```bash
node --env-file=.env.local scripts/db-setup.js
```

## How the schema is managed

- `src/db/schema.sql` is the base schema.
- `src/db/migrations/NNN_name.sql` are applied after it, in file-name order,
  each exactly once; applied names are recorded in the `schema_migrations`
  table.
- To change the schema, add the next numbered file in `src/db/migrations/`. It is bundled
  automatically (`src/db/migrations/index.ts`) and runs on the next deploy's
  first request, or on demand with `POST /api/migrate`.
- `src/lib/db.ts` waits for the schema before every query, so no route needs
  to think about it.

## Other commands

- `npm run build` / `npm start` — production build and server
- `npm run lint`
- `npm test` — Playwright tests (`tests/`)
