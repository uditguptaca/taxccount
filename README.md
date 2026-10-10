# Taxccount / Abidebylaw

Compliance and practice-management platform for an accounting firm: client
portal, staff dashboard, service master, smart forms, ledger, payroll and
corporate secretary modules. Next.js 14 (App Router) on Vercel, PostgreSQL
behind it.

## Where things run

| Part | Where |
|---|---|
| The app | Vercel project, production on the `main` branch |
| The database | A Postgres database created from the Vercel project's **Storage** tab (Neon is the default there). Any PostgreSQL works. |
| Login sessions | Signed with `JWT_SECRET` from the project's environment variables |

Nothing else is needed. There is no Supabase, Turso or SQLite in the live
setup any more.

## Setting up the database on Vercel (one time)

1. Open the project's **Storage** tab → **Create Database** → choose
   **Neon** (Postgres) → pick the region closest to you → create it.
2. On the new database, click **Connect Project**, choose this project and
   all environments, and connect. Vercel adds `DATABASE_URL` (and
   `DATABASE_URL_UNPOOLED`) to the project for you. If it says a
   `DATABASE_URL` already exists, either delete the old one under
   **Settings → Environment Variables** or accept a prefix such as `NEON_`:
   the app tries every database setting it finds and uses the first one
   that answers.
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
  table (`src/db/seed-reference.ts`, data in `src/db/reference/`). Sample content that the old one-off
  scripts put into Supabase (sample corporations, sample ledger entries, sample forms) is demo data and is
  not created; neither is anything real people typed into the old database. To bring that over, copy it
  from the old database into Neon; do not recreate it by hand.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. `POSTGRES_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL_DIRECT` and any prefixed `*_DATABASE_URL` are tried after it, first one that answers wins. |
| `JWT_SECRET` | Signs login sessions. Required in production. |

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

- `src/db/schema.sql` is the base schema (the first two migrations, already
  converted to Postgres).
- `src/db/migrations/NNN_name.sql` are applied after it, in file-name order,
  each exactly once; applied names are recorded in the `schema_migrations`
  table. Three early files are SQLite-only and skipped (see
  `SQLITE_ONLY_MIGRATIONS` in `src/db/setup.js`).
- To change the schema, add a new `src/db/migrations/016_….sql`. It is bundled
  automatically (`src/db/migrations/index.ts`) and runs on the next deploy's
  first request, or on demand with `POST /api/migrate`.
- `src/lib/db.ts` waits for the schema before every query, so no route needs
  to think about it.

## Other commands

- `npm run build` / `npm start` — production build and server
- `npm run lint`
- `npm test` — Playwright tests (`tests/`)
