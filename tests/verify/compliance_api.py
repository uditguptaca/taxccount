"""The free compliance checker's API: the public check gives away three compliances and no more, bad input is
refused, and a saved check belongs to one account only: it can be marked as filed, re-dated, re-answered and
removed by its owner and by nobody else. Runs against a running app."""
import sys, os, json
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows_core.py')).read().split("section('Clients')")[0]
exec(src)

class Anon(Sess):
    def __init__(s): s.cookie = ''; s.op = urllib.request.build_opener()
anon = Anon()
SEL = {'country': 'CA', 'state': 'ON', 'entity': 'corporation', 'depts': ['income', 'sales', 'payroll', 'registry']}
ANS = {'ca_ccpc': 'yes', 'ca_sbd': 'yes', 'ca_federal': 'no', 'ca_pe': ['none'], 'ca_foreign_prop': 'no', 'ca_foreign_aff': 'no', 'ca_nr_related': 'no', 'ca_nrtrust_c': 'no', 'ca_nrtrust_d': 'no',
       'ca_corp_instal': 'no', 'ca_gst_reg': 'yes', 'ca_gst_freq': 'q', 'ca_sell_prov': ['none'], 'ca_employees': 'yes', 'ca_remit': 'r', 'ca_payroll_size': 'p1', 'ca_closing': 'no',
       'ca_contractors': 'no', 'ca_construction': 'no', 'ca_dividends': 'no', 'ca_pay_nr': 'no', 'fye': '12-31', 'ca_inc_date': '2020-03-15'}

section('Public: no account needed')
st, j = anon.call('GET', '/api/public/compliance')
codes = [c['code'] for c in (j.get('countries') or [])] if st == 200 else []
step('the country list is public and has the four countries', st == 200 and set(['CA', 'US', 'IN', 'AE']) <= set(codes), (st, codes))
st, j = anon.call('GET', '/api/public/compliance?country=CA')
pack = j.get('pack') or {}
step('a country gives its provinces, entity types, departments and questions', st == 200 and len(pack.get('states', [])) == 13 and len(pack.get('questions', [])) >= 40, (st, list(pack.keys())))
step('but not the rules themselves (they stay on the server)', not pack.get('compliances') and not pack.get('sources'), (len(pack.get('compliances', [])), len(pack.get('sources', []))))
st, j = anon.call('GET', '/api/public/compliance?country=ZZ'); step('an unknown country is refused', st in (400, 404), st)

section('Public: the check')
st, j = anon.call('POST', '/api/public/compliance', {'sel': SEL, 'answers': {}})
step('a check with unanswered questions is refused, saying which', st == 422 and len(j.get('missing', j.get('unanswered', []))) > 5, (st, str(j)[:160]))
st, j = anon.call('POST', '/api/public/compliance', {'sel': {**SEL, 'entity': 'adgm'}, 'answers': ANS}); step('an entity type that does not exist in that province is refused', st == 400, st)
st, j = anon.call('POST', '/api/public/compliance', {'sel': {**SEL, 'depts': ['bogus']}, 'answers': ANS}); step('an unknown department is refused', st == 400, st)
st, j = anon.call('POST', '/api/public/compliance', {'sel': SEL, 'answers': {**ANS, 'ca_ccpc': 'maybe'}}); step('an answer that is not one of the choices is refused', st in (400, 422), (st, str(j)[:120]))
st, R = anon.call('POST', '/api/public/compliance', {'sel': SEL, 'answers': ANS})
step('a complete check answers', st == 200 and R.get('total', 0) >= 7, (st, str(R)[:200]))
shown = R.get('shown', []); locked = R.get('locked', [])
step('exactly three compliances come back in full', len(shown) == 3 and all(x.get('name') and x.get('dueText') and x.get('sourceUrl', '').startswith('https://') for x in shown), [x.get('id') for x in shown])
step('the most important one first: the T2 return, due 30 June 2027', shown and shown[0]['id'] == 'ca_t2' and shown[0]['next'][0]['date'] == '2027-06-30', shown[0] if shown else '')
step('the others are only counted', len(locked) == R['total'] - 3 and all(set(l.keys()) <= {'head', 'frequency', 'certainty', 'due'} for l in locked), locked[:2])
blob = json.dumps(R)
step('no name, form or exact date of a locked compliance leaves the server', 'T4 slips' not in blob and 'ca_t4' not in blob and 'Payroll deductions remittance' not in blob, '')
ticket = R.get('ticket')
st, j = anon.call('POST', '/api/public/compliance', {'sel': SEL, 'answers': {**ANS, 'ca_employees': 'unsure'}})
step('"not sure" keeps the filing and marks it to be checked', st == 200 and j['total'] >= R['total'], (st, j.get('total')))

section('Saving needs an account')
st, j = anon.call('GET', '/api/compliance-tracker'); step('a visitor cannot read saved checks', st == 401, st)
st, j = anon.call('POST', '/api/compliance-tracker', {'ticket': ticket}); step('a visitor cannot save one', st == 401, st)
st, j = cli.call('POST', '/api/compliance-tracker', {'ticket': ticket + 'x'}); step('a tampered ticket is refused', st == 400, (st, j))
st, j = cli.call('POST', '/api/compliance-tracker', {'ticket': ticket, 'label': 'James Holdings Inc.'})
PID = j.get('id'); step('a signed-in person saves the check with its ticket', st == 200 and PID and j.get('created') == R['total'], (st, j))
st, j = cli.call('POST', '/api/compliance-tracker', {'ticket': ticket, 'label': 'again'}); step('saving the same check again does not duplicate it', st == 200 and j.get('id') == PID and j.get('existing'), (st, j))
n = psql(f"select count(*) from personal_entity_compliance where tracker_profile_id='{PID}'")
step('every compliance is in the person\'s vault, tied to the business', int(n) == R['total'] and psql(f"select name from personal_entities where id=(select vault_entity_id from compliance_tracker_profiles where id='{PID}')") == 'James Holdings Inc.', n)
st, j = cli.call('GET', '/api/compliance-tracker'); prof = (j.get('profiles') or [{}])[0]; items = prof.get('items', [])
step('the account lists them all, readable, with dates', st == 200 and len(items) == R['total'] and any(str(i.get('title', '')).startswith('T4 slips and summary') for i in items), (st, len(items)))

section('Tracking')
t2 = next(i for i in items if i['complianceId'] == 'ca_t2'); t4 = next(i for i in items if i['complianceId'] == 'ca_t4')
st, j = cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': t2['id'], 'action': 'done'})
step('marking the T2 as filed rolls it to 30 June 2028 and keeps a history line', st == 200 and psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{t2['id']}'") == '2028-06-30' and psql(f"select count(*) from compliance_tracker_history where profile_id='{PID}'") == '1', (st, j))
st, j = cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': t4['id'], 'action': 'set_date', 'date': '2027-02-20'})
step('the owner can set their own date', st == 200 and psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{t4['id']}'") == '2027-02-20', (st, j))
st, j = cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': t4['id'], 'action': 'set_date', 'date': 'next week'}); step('a date that is not a date is refused', st == 400, (st, j))
st, j = cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'answers': {**ANS, 'ca_employees': 'no', 'ca_remit': None, 'ca_payroll_size': None, 'ca_closing': None}})
gone = psql(f"select count(*) from personal_entity_compliance where tracker_profile_id='{PID}' and tracker_compliance_id='ca_remit_r' and status<>'completed'")
st2, j2 = cli.call('GET', '/api/compliance-tracker'); items2 = (j2.get('profiles') or [{}])[0].get('items', [])
step('changing an answer re-works the list (no employees: the payroll filings no longer apply)', st == 200 and not any(i['complianceId'] == 'ca_remit_r' and i.get('stillApplies', True) for i in items2), (st, gone, [i['complianceId'] for i in items2][:12]))
step('and the T2 they already marked as filed does not come back: it stays on 30 June 2028', psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{t2['id']}'") == '2028-06-30', psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{t2['id']}'"))

section('One account cannot touch another\'s')
st, j = adm.call('GET', '/api/compliance-tracker'); step('another user sees nothing of it', st == 200 and not any(p.get('id') == PID for p in j.get('profiles', [])), (st, str(j)[:120]))
st, j = adm.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': t2['id'], 'action': 'done'}); step('cannot mark its filings', st == 404, st)
st, j = adm.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'answers': ANS}); step('cannot change its answers', st == 404, st)
st, j = adm.call('DELETE', f'/api/compliance-tracker?profileId={PID}'); step('cannot remove it', st == 404 and psql(f"select count(*) from compliance_tracker_profiles where id='{PID}' and status='active'") == '1', st)
st, j = plat.call('GET', '/api/compliance-tracker'); step('the platform administrator does not see a person\'s saved checks here either', st == 200 and not any(p.get('id') == PID for p in j.get('profiles', [])), st)
st, j = cli.call('DELETE', f'/api/compliance-tracker?profileId={PID}')
left = psql(f"select count(*) from personal_entity_compliance where tracker_profile_id='{PID}' and status<>'completed'")
step('the owner can remove the check; its open filings go with it', st == 200 and left == '0', (st, left))

print(f'\ncompliance_api: {P} passed, {F} failed'); sys.exit(1 if F else 0)
