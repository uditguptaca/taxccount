#!/bin/bash
# End-to-end T1 intake flow against a running app: $1 = base url, PG* env for verification queries
B="$1"; J2=${TMPDIR:-/tmp}/verify-jar-client.txt; rm -f $J2; S=${TMPDIR:-/tmp}; J=$S/jar.txt; rm -f $J
H='Content-Type: application/json'
pass=0; fail=0
check(){ if [ "$2" = "$3" ]; then echo "PASS  $1 ($2)"; pass=$((pass+1)); else echo "FAIL  $1 (got '$2', wanted '$3')"; fail=$((fail+1)); fi; }
code=$(curl -s -c $J -o /dev/null -w '%{http_code}' -X POST $B/api/auth/login -H "$H" -d '{"email":"admin@taxccount.ca","password":"password123"}'); check "firm admin login" "$code" 200
code=$(curl -s -c $J2 -o /dev/null -w '%{http_code}' -X POST $B/api/auth/login -H "$H" -d '{"email":"james@email.com","password":"password123"}'); check "client login" "$code" 200
cid=$(psql -tA -c "select id from clients where portal_user_id=(select id from users where email='james@email.com') limit 1")
[ -n "$cid" ] && echo "PASS  picked a client" && pass=$((pass+1)) || { echo "FAIL  no client"; fail=$((fail+1)); }
R=$(curl -s -b $J -X POST $B/api/tax-intake -H "$H" -d "{\"client_id\":\"$cid\",\"client_name\":\"Test Client\",\"taxpayer_name\":\"Test Client\",\"tax_year\":\"2025\",\"filing_type\":\"original\",\"province\":\"ON\"}")
EID=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))"); TOK=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin).get('portalToken',''))")
check "create engagement returns an id" "$([ -n "$EID" ] && echo yes)" yes
n=$(curl -s -b $J $B/api/tax-intake | python3 -c "import json,sys; d=json.load(sys.stdin)['engagements']; print(len(d))"); check "list shows the engagement" "$n" 1
st=$(curl -s -b $J $B/api/tax-intake/$EID | python3 -c "import json,sys; d=json.load(sys.stdin)['engagement']; print(d.get('status'))"); check "read engagement status" "$st" not_started
code=$(curl -s -b $J2 -o /dev/null -w '%{http_code}' -X PUT "$B/api/tax-intake/$EID/responses" -H "$H" -d '{"responses":[{"questionId":"q_first_name","recordIndex":0,"value":"Ada"},{"questionId":"q_sin","recordIndex":0,"value":"","flag":"unsure","flagNote":"cannot find SIN card"}]}'); check "client saves answers (logged in as the client)" "$code" 200
n=$(curl -s -b $J "$B/api/tax-intake/$EID/responses" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['responses']))"); check "two answers stored" "$n" 2
n=$(curl -s -b $J "$B/api/tax-intake/$EID/review" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['reviewItems']))"); check "flagged answer created a review item" "$n" 1
code=$(curl -s -b $J2 -o /dev/null -w '%{http_code}' -X PUT "$B/api/tax-intake/$EID/responses" -H "$H" -d '{"responses":[{"questionId":"q_first_name","recordIndex":0,"value":"Ada L."}]}'); check "saving again updates, not duplicates" "$code" 200
v=$(psql -tA -c "select value from tax_intake_responses where question_id='q_first_name'"); check "stored value updated" "$v" "Ada L."
code=$(curl -s -b $J2 -o /dev/null -w '%{http_code}' -X POST "$B/api/tax-intake/$EID/submit" -H "$H" -d '{"clientAcknowledgements":{"accurate":true}}'); check "client submits" "$code" 200
row=$(psql -tA -c "select e.status||'/v'||s.version_number from tax_intake_engagements e join tax_intake_submissions s on s.engagement_id=e.id"); check "status submitted, snapshot v1 saved" "$row" "submitted/v1"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B/api/tax-intake/$EID/submit?portal_token=wrong" -H "$H" -d '{}'); check "wrong portal token is refused" "$code" 401
code=$(curl -s -o /dev/null -w '%{http_code}' $B/api/tax-intake); check "list without login is refused" "$code" 401
echo "RESULT: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
