# Verifying the app on an empty PostgreSQL

This is what "it works" means here. It runs the app against a brand-new empty database, the way a fresh Neon
database starts, and checks it end to end. It was written after an audit found that large parts of the app only
ever worked on SQLite (see `AGENTS.md`). **Run it before you push.**

```bash
PGHOST=127.0.0.1 PGUSER=postgres PGPASSWORD=... npm run verify
```

It needs node, python3, `psql`, Playwright's Chromium (`npx playwright install chromium`) and a PostgreSQL server
you may create databases on. A free Neon branch works; so does a local Postgres in Docker.
GitHub runs the same thing on every push and pull request (`.github/workflows/verify.yml`).

| Check | What it proves |
|---|---|
| type check, build | the code compiles and the build needs no database |
| `db_urls.cjs` | the app uses only a Neon (or local) address and never a Supabase one |
| `check_columns.py` | every column the code reads or writes exists in the schema, and every required column is supplied |
| `flows_core.py` | clients, engagements, billing, accounting, payroll, leads, messages, settings, checklists, documents (stored in Neon, 4 MB limit, permissions, deletion), scheduled jobs refuse strangers |
| `flows_portals.py` | corporate secretary, smart forms builder to client fill to staff review, client and staff portals, platform admin, organizers, and **an admin of another firm who must get nothing** |
| `import.py`, `import_browser.cjs` | the platform admin's import: an old database shaped differently (dropped column, extra column, extra table, child row before its parent, own-password user, 230 log rows) is copied, every shared table is compared row by row, imported accounts sign in, a second run adds nothing, strangers and bad addresses are refused, the old password is never echoed; and the same flow in a real browser |
| `t1_engine.ts` | the T1 questionnaire and rules engine with no server: structure checks, the rules of the engine (a blank is never "No"), 21 synthetic taxpayers, and a walk that completes every branch in all 13 provinces and territories |
| `t1_api.py` | the T1 intake API: versioned saves and history, one review item per problem, access for firm and client, records, document uploads kept in Neon, submission rules, frozen snapshots, reopening, exports |
| `t1_browser.cjs` | the T1 intake in a real browser: the client's detailed form, save and resume, French, upload, submit and lock; the preparer's workspace; the admin's preview of the T1 template; an assigned T1 smart form; a phone-sized screen |
| T1 documents | `docs/t1/*.md` are generated from the questionnaire (`node --experimental-strip-types scripts/t1-docs.ts`) and the build fails if they are out of date |
| `sweep.cjs` | every read endpoint answers without a server error |
| `crawl.cjs` | every page opens without a server error |
| app log | no database error was logged during any of it |

When you add a feature, add its flow to `flows_core.py` or `flows_portals.py` (a step is one line:
`step('what it should do', status == 200, info)`). When a check fails, fix the app, not the check.
