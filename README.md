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

1. In Vercel, open the project → **Settings → Environment Variables**. Delete
   any old `DATABASE_URL`, `DATABASE_URL_DIRECT` or `POSTGRES_*` entries that
   still point at the previous database.
2. Open the project's **Storage** tab → **Create Database** → choose
   **Neon** (Postgres) → pick the region closest to you → create it.
3. On the new database, click **Connect Project**, choose this project and
   all environments, and connect. Vercel adds `DATABASE_URL` (and
   `DATABASE_URL_UNPOOLED`) to the project for you.
4. Still under **Environment Variables**, add `JWT_SECRET` with a long random
   value (40+ characters). Without it, sessions are signed with a built-in
   development value that everyone who can read the source knows.
5. **Deployments → Redeploy** the latest deployment so it picks up the new
   variables.

Then open `/login`. The first login on a fresh database takes a few seconds:
the app creates every table (from `src/db/schema.sql` and the migrations in
`src/db/migrations`) and seeds the demo accounts, then signs you in.

## Accounts

The seed creates demo accounts; the login page lists them. Every seeded
account uses the password shown there. Change them (or remove the demo block
from `src/app/login/page.tsx`) before real client data goes in.

## Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. `POSTGRES_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING` and `DATABASE_URL_DIRECT` are accepted as fallbacks. |
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
