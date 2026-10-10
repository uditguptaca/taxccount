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
| `check_columns.py` | every column the code reads or writes exists in the schema, and every required column is supplied |
| `flows_core.py` | clients, engagements, billing, accounting, payroll, leads, messages, settings, checklists, documents |
| `flows_portals.py` | corporate secretary, smart forms builder to client fill to staff review, client and staff portals, platform admin, organizers, and **an admin of another firm who must get nothing** |
| `t1_api.sh`, `t1_browser.cjs` | the T1 intake, by API and in a real browser as the firm and as a client |
| `sweep.cjs` | every read endpoint answers without a server error |
| `crawl.cjs` | every page opens without a server error |
| app log | no database error was logged during any of it |

When you add a feature, add its flow to `flows_core.py` or `flows_portals.py` (a step is one line:
`step('what it should do', status == 200, info)`). When a check fails, fix the app, not the check.
