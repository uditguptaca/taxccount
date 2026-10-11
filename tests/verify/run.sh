#!/usr/bin/env bash
# Verify the whole app against an EMPTY PostgreSQL, the way a fresh Neon database starts.
#
#   PGHOST=127.0.0.1 PGUSER=postgres PGPASSWORD=... bash tests/verify/run.sh
#
# Needs node, python3, psql, and a PostgreSQL server you may create databases on.
# It builds the app, then for each suite creates a NEW empty database, starts the app on it,
# lets the first login install the schema and seed the demo accounts, and runs the suite.
# Exit code 0 only if everything passed. See tests/verify/README.md.
set -uo pipefail
cd "$(dirname "$0")/../.."
export PGHOST="${PGHOST:-127.0.0.1}" PGPORT="${PGPORT:-5432}" PGUSER="${PGUSER:-postgres}"
PORT="${PORT:-3100}"
export BASE_URL="http://127.0.0.1:$PORT"
DB="verify_$$"
LOG="${TMPDIR:-/tmp}/verify-app-$$.log"
APP_PID=""
fails=0

stop_app() {
  [ -n "$APP_PID" ] && kill "$APP_PID" 2>/dev/null
  pkill -f "next start -p $PORT" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
  APP_PID=""; sleep 1
}
cleanup() { stop_app; PGDATABASE=postgres psql -q -c "DROP DATABASE IF EXISTS $DB" 2>/dev/null; }
trap cleanup EXIT

fresh() {   # a new empty database and a freshly started app; the first login installs the schema and seeds
  stop_app
  PGDATABASE=postgres psql -q -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB" 2>&1 | grep -v NOTICE
  export PGDATABASE="$DB"
  DATABASE_URL="postgresql://$PGUSER:${PGPASSWORD:-}@$PGHOST:$PGPORT/$DB?sslmode=disable" JWT_SECRET="verify-secret" \
    npx next start -p "$PORT" > "$LOG" 2>&1 &
  APP_PID=$!
  for _ in $(seq 1 90); do curl -s -o /dev/null "$BASE_URL/login" && break; sleep 1; done
  curl -s -o /dev/null -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"admin@taxccount.ca","password":"password123"}'
}
suite() {  # a fresh database and app, then one suite; ONLY="regex" runs just the suites whose name matches
  local name="$1"; if [ -n "${ONLY:-}" ] && ! [[ "$name" =~ $ONLY ]]; then return; fi
  fresh; step "$@"
}
step() { local name="$1"; shift; echo; echo "=================== $name"; "$@" || { echo "*** FAILED: $name"; fails=$((fails + 1)); }; }

if [ -z "${SKIP_BUILD:-}" ]; then
  step "type check"           npx tsc --noEmit
  step "which database address the app uses (Neon only)"  node tests/verify/db_urls.cjs
  step "T1 questionnaire and rules engine (structure and 20+ synthetic taxpayers)"  node --experimental-strip-types tests/verify/t1_engine.ts
  step "T1 documents are in step with the questionnaire"  bash -c 'node --experimental-strip-types scripts/t1-docs.ts >/dev/null && git diff --exit-code -- docs/t1'
  step "production build"     npx next build
fi

suite "every column the code uses exists in the schema" python3 tests/verify/check_columns.py
suite "module flows" python3 tests/verify/flows_core.py
suite "portals, smart forms, corporate secretary, firm isolation" python3 tests/verify/flows_portals.py
suite "import from an old database (API)"                         python3 tests/verify/import.py
suite "import from an old database (real browser)"                 node tests/verify/import_browser.cjs
suite "T1 intake (API)" bash tests/verify/t1_api.sh "$BASE_URL"
suite "T1 intake (real browser, firm and client)" node tests/verify/t1_browser.cjs
suite "every read endpoint answers without a server error" node tests/verify/sweep.cjs
suite "every page opens without a server error" node tests/verify/crawl.cjs

echo; echo "=================== database errors in the app log"
if grep -qiE "does not exist|must appear in the GROUP BY|violates|invalid input syntax|operator does not exist|syntax error at|null value in column|could not determine data type|UNDEFINED_VALUE" "$LOG"; then
  grep -iE "does not exist|must appear in the GROUP BY|violates|invalid input syntax|operator does not exist|syntax error at|null value in column|could not determine data type|UNDEFINED_VALUE" "$LOG" | sort | uniq -c | sort -rn | head -10
  echo "*** FAILED: the app logged database errors"; fails=$((fails + 1))
else
  echo "none"
fi

echo; if [ "$fails" -eq 0 ]; then echo "ALL VERIFICATION PASSED"; else echo "$fails CHECK(S) FAILED"; fi
exit "$fails"
