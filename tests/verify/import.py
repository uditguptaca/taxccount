"""Import from an old database. Builds an "old" database that is deliberately NOT shaped like the new one
(a column missing, an extra column, an extra table, a child row that sorts before its parent, a user with
their own password, text with quotes and unicode, enough rows to need several chunks), then moves it into the
running app with the platform admin's import API and proves that every table's content arrived unchanged."""
import sys, os, subprocess
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows_core.py')).read().split("section('Clients')")[0]
exec(src)

NEW = os.environ['PGDATABASE']; OLD = NEW + '_old'
PW = os.environ.get('PGPASSWORD', ''); HOST = os.environ.get('PGHOST', '127.0.0.1'); PORT = os.environ.get('PGPORT', '5432'); USER = os.environ.get('PGUSER', 'postgres')
def url(db): return f'postgresql://{USER}:{PW}@{HOST}:{PORT}/{db}?sslmode=disable'
def pg(sql, db):
    r = subprocess.run(['psql', '-tA', '-v', 'ON_ERROR_STOP=1', '-d', db, '-c', sql], capture_output=True, text=True, env=os.environ)
    if r.returncode: raise RuntimeError(r.stderr.strip()[:300])
    return r.stdout.strip()
def admin(sql): return subprocess.run(['psql', '-q', '-d', 'postgres', '-c', sql], capture_output=True, text=True, env=os.environ)

section('Build an old database that is shaped differently from the new one')
admin(f'DROP DATABASE IF EXISTS {OLD}'); admin(f'CREATE DATABASE {OLD}')
dump = subprocess.run(['pg_dump', '--no-owner', '-d', NEW], capture_output=True, text=True, env=os.environ)
load = subprocess.run(['psql', '-q', '-d', OLD], input=dump.stdout, capture_output=True, text=True, env=os.environ)
step('the old database was created from a real dump', pg('select count(*) from users', OLD) == pg('select count(*) from users', NEW), load.stderr[:200])

hash_ = subprocess.run(['node', '-e', "console.log(require('bcryptjs').hashSync('OldPass#123', 10))"], capture_output=True, text=True).stdout.strip()
sub = pg('select id from sm_sub_compliances limit 1', OLD)
org = pg("select id from organizations where org_type<>'platform' order by created_at limit 1", OLD) if pg("select count(*) from information_schema.columns where table_name='organizations' and column_name='org_type'", OLD) == '1' else pg('select id from organizations order by created_at limit 1', OLD)
mut = f"""
CREATE TEMP TABLE tu AS SELECT * FROM users WHERE email='emily@taxccount.ca';
UPDATE tu SET id='old-user-1', email='real.person@firm.test', password_hash='{hash_}', first_name='Réal', last_name='O''Brien';
INSERT INTO users SELECT * FROM tu;
CREATE TEMP TABLE tm AS SELECT * FROM organization_memberships WHERE user_id=(SELECT id FROM users WHERE email='emily@taxccount.ca') LIMIT 1;
UPDATE tm SET id='old-mem-1', user_id='old-user-1';
INSERT INTO organization_memberships SELECT * FROM tm;
CREATE TEMP TABLE tc AS SELECT * FROM clients LIMIT 1;
UPDATE tc SET id='old-client-1', client_code='OLD-0001', display_name='Les Éditions O''Brien & Fils "Ltée"', primary_email='old.client@firm.test', notes=E'Line one\\nLine "two" – 日本語 \\\\ backslash', portal_user_id=NULL;
INSERT INTO clients SELECT * FROM tc;
INSERT INTO sm_questions (id, sub_compliance_id, question_text, parent_question_id) VALUES ('q-parent', '{sub}', 'Parent question?', NULL);
INSERT INTO sm_questions (id, sub_compliance_id, question_text, parent_question_id) VALUES ('a-child', '{sub}', 'Child question?', 'q-parent');
INSERT INTO audit_logs (id, org_id, actor_id, action, entity_type, entity_id, details, created_at)
  SELECT 'bulk-' || g, '{org}', 'old-user-1', 'TEST', 'x', 'y', 'detail ' || g, NOW()::text FROM generate_series(1, 230) g;
ALTER TABLE clients DROP COLUMN tax_id;
ALTER TABLE clients ADD COLUMN legacy_flag TEXT DEFAULT 'x';
CREATE TABLE legacy_notes (id SERIAL PRIMARY KEY, note TEXT);
INSERT INTO legacy_notes (note) VALUES ('kept only in the old database'), ('second');
"""
try:
    pg(mut, OLD); step('old database mutated: dropped column, extra column, extra table, out-of-order child row, 230 log rows', True)
except Exception as e:
    step('old database mutated', False, e)

section('Who may import, and what an address must look like')
st, j = adm.call('POST', '/api/platform/import', {'action': 'plan', 'url': url(OLD)}); step('a firm admin is refused', st == 403, (st, j))
st, j = Sess('emily@taxccount.ca').call('POST', '/api/platform/import', {'action': 'plan', 'url': url(OLD)}); step('staff are refused', st == 403, (st, j))
st, j = plat.call('POST', '/api/platform/import', {'action': 'plan', 'url': 'not an address'}); step('an address that is not one is explained', st == 400 and 'postgresql://' in json.dumps(j), (st, j))
st, j = plat.call('POST', '/api/platform/import', {'action': 'plan', 'url': url(NEW)}); step('importing the database into itself is refused', st == 400 and 'already using' in json.dumps(j), (st, j))
st, j = plat.call('POST', '/api/platform/import', {'action': 'plan', 'url': f'postgresql://someone:secretpw123@127.0.0.1:1/none?sslmode=disable'}); step('an unreachable address gives a clear message and never echoes the password', st == 400 and 'secretpw123' not in json.dumps(j), (st, j))

section('Plan')
st, plan = plat.call('POST', '/api/platform/import', {'action': 'plan', 'url': url(OLD)}); step('the old database can be read', st == 200 and plan.get('tables'), (st, str(plan)[:200]))
by = {t['table']: t for t in plan.get('tables', [])}
step('it shows how many rows each table holds', by.get('clients', {}).get('oldRows', 0) >= 2 and by.get('audit_logs', {}).get('oldRows', 0) >= 230, {k: by.get(k) for k in ('clients', 'audit_logs')})
step('it warns about a column that exists only in the old database', any('legacy_flag' in w for w in plan.get('warnings', [])), plan.get('warnings'))
step('it warns about a table that exists only in the old database', any('legacy_notes' in w for w in plan.get('warnings', [])), plan.get('warnings'))
step('it knows the old database has a platform admin', plan.get('oldHasPlatformAdmin') is True, '')
step('the old password never appears in a response', PW not in json.dumps(plan) or PW == '', '')

section('Replace everything')
st, j = plat.call('POST', '/api/platform/import', {'action': 'prepare', 'url': url(OLD)}); step('replacing without typing REPLACE is refused', st == 400, (st, j))
pg("update users set is_active=0 where role='platform_admin'", OLD)
st, j = plat.call('POST', '/api/platform/import', {'action': 'prepare', 'url': url(OLD), 'confirm': 'REPLACE'}); step('replacing is refused when the old database would leave nobody able to sign in', st == 400 and 'platform admin' in json.dumps(j), (st, j))
pg("update users set is_active=1 where role='platform_admin'", OLD)
st, j = plat.call('POST', '/api/platform/import', {'action': 'prepare', 'url': url(OLD), 'confirm': 'REPLACE'}); step('replace is accepted once confirmed', st == 200 and j.get('cleared', 0) > 50, (st, j))
step('the current database is empty after that', pg('select count(*) from users', NEW) == '0' and pg('select count(*) from clients', NEW) == '0', '')

parked = failed = copied = 0; errors = []; paged = 0
for t in plan['tables']:
    if t['oldRows'] == 0: continue
    off = 0
    while True:
        st, r = plat.call('POST', '/api/platform/import', {'action': 'copy', 'url': url(OLD), 'table': t['table'], 'offset': off, 'limit': 100})
        if st != 200: failed += 1; errors.append((t['table'], st, str(r)[:150])); break
        parked += r['parked']; failed += r['failed']; copied += r['inserted']; errors += r['errors']
        if r['nextOffset'] != off + r['read']: errors.append(('offset', t['table']))
        off = r['nextOffset']; paged += 1
        if r['done']: break
step('every table copied without a failed row', failed == 0 and not errors, errors[:3])
step('large tables were copied in several chunks', paged > len([t for t in plan['tables'] if t['oldRows'] > 0]), paged)
step('a child row that arrived before its parent was parked, not lost', parked >= 1, parked)
st, fin = plat.call('POST', '/api/platform/import', {'action': 'finish', 'url': url(OLD), 'mode': 'replace'}); step('finish reports success', st == 200 and fin.get('ok') is True, (st, str(fin)[:300]))
step('the parked row was placed afterwards', fin.get('retried', 0) >= 1 and not fin.get('stillParked'), fin)
step('no row counts differ', fin.get('mismatches') == [], fin.get('mismatches'))
step('helper tables were cleaned up', pg("select count(*) from information_schema.tables where table_name in ('_import_deferred','_import_probe')", NEW) == '0', '')

section('The content is identical, table by table')
tables = pg("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1", NEW).split('\n')
old_tables = set(pg("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'", OLD).split('\n'))
bad = []; checked = 0
for t in tables:
    if t in ('schema_migrations',) or t not in old_tables: continue
    cols = [c for c in pg(f"select column_name from information_schema.columns where table_schema='public' and table_name='{t}' order by ordinal_position", NEW).split('\n')
            if c in set(pg(f"select column_name from information_schema.columns where table_schema='public' and table_name='{t}'", OLD).split('\n'))]
    if not cols: continue
    q = f"select count(*) || ':' || coalesce(md5(string_agg(x::text, '|' order by x::text)), '') from (select {','.join(chr(34)+c+chr(34) for c in cols)} from {t}) x"
    a, b = pg(q, OLD), pg(q, NEW); checked += 1
    if a != b: bad.append((t, a[:20], b[:20]))
step(f'all {checked} shared tables hold exactly the same rows and values', not bad and checked > 100, bad[:5])
step('text with quotes, accents, line breaks and backslashes survived', pg("select notes from clients where id='old-client-1'", NEW) == pg("select notes from clients where id='old-client-1'", OLD), pg("select notes from clients where id='old-client-1'", NEW))
step('the column that does not exist in the old database stayed empty, not broken', pg("select count(*) from clients where tax_id is not null and id='old-client-1'", NEW) == '0', '')
step('the table that exists only in the old database was not invented here', pg("select to_regclass('public.legacy_notes') is null", NEW) == 't', '')

section('Signing in with the imported accounts')
import urllib.request
def login(email, pw):
    req = urllib.request.Request(B + '/api/auth/login', data=json.dumps({'email': email, 'password': pw}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status
    except urllib.error.HTTPError as e: return e.code
step('a user who only existed in the old database signs in with their own password', login('real.person@firm.test', 'OldPass#123') == 200, '')
step('and not with a wrong one', login('real.person@firm.test', 'password123') in (400, 401), '')
step('the demo accounts that the old database also had still work', login('platform@abidebylaw.com', 'password123') == 200 and login('admin@taxccount.ca', 'password123') == 200, '')

section('Counters and re-running')
serials = [r.split('|') for r in pg("select table_name || '|' || column_name from information_schema.columns where table_schema='public' and column_default like 'nextval(%'", NEW).split('\n') if r]
late = []
for t, c in serials:
    seq = pg(f"select pg_get_serial_sequence('public.\"{t}\"', '{c}')", NEW)
    nxt = pg(f"select case when is_called then last_value + 1 else last_value end from {seq}", NEW); mx = pg(f'select coalesce(max("{c}"), 0) from "{t}"', NEW)
    if int(nxt) <= int(mx): late.append((t, nxt, mx))
step(f'counters for new records continue after the copied ids ({len(serials)} checked)', not late, late[:3])
again = failed2 = 0
for t in plan['tables']:
    if t['oldRows'] == 0: continue
    off = 0
    while True:
        st, r = plat.call('POST', '/api/platform/import', {'action': 'copy', 'url': url(OLD), 'table': t['table'], 'offset': off, 'limit': 500})
        again += r.get('inserted', 0) if st == 200 else 0; failed2 += r.get('failed', 0) if st == 200 else 1
        if st != 200 or r['done']: break
        off = r['nextOffset']
st, fin2 = plat.call('POST', '/api/platform/import', {'action': 'finish', 'url': url(OLD), 'mode': 'add'}); step('running the copy a second time adds nothing and duplicates nothing', again == 0 and failed2 == 0 and fin2.get('ok') is True and pg('select count(*) from clients', NEW) == pg('select count(*) from clients', OLD), (again, failed2, fin2))

admin(f'DROP DATABASE IF EXISTS {OLD}')
print(f'\nRESULT: {P} passed, {F} failed'); print('FAILED:', '; '.join(fails))
sys.exit(1 if F else 0)
