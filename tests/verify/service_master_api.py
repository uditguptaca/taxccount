"""Service Master: the compliance checker's rules are kept in the database and changed from the platform
admin's screens. Only the platform admin gets in; a change made there is what the homepage checker gives
next; a change that would break the checker is refused; every change can be undone; and a person who
already saved a check gets the new dates without losing what they set themselves. Runs against a running app."""
import sys, os, json
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows_core.py')).read().split("section('Clients')")[0]
exec(src)

class Anon(Sess):
    def __init__(s): s.cookie = ''; s.op = urllib.request.build_opener()
anon = Anon()
API = '/api/platform/service-master/catalog'
SEL = {'country': 'CA', 'state': 'ON', 'entity': 'corporation', 'depts': ['income', 'sales', 'payroll', 'registry']}
ANS = {'ca_ccpc': 'yes', 'ca_sbd': 'yes', 'ca_federal': 'no', 'ca_pe': ['none'], 'ca_foreign_prop': 'no', 'ca_foreign_aff': 'no', 'ca_nr_related': 'no', 'ca_nrtrust_c': 'no', 'ca_nrtrust_d': 'no',
       'ca_corp_instal': 'no', 'ca_gst_reg': 'yes', 'ca_gst_freq': 'q', 'ca_sell_prov': ['none'], 'ca_employees': 'yes', 'ca_remit': 'r', 'ca_wsib_freq': 'q', 'ca_payroll_size': 'p1', 'ca_closing': 'no',
       'ca_contractors': 'no', 'ca_construction': 'no', 'ca_dividends': 'no', 'ca_pay_nr': 'no', 'fye': '12-31', 'ca_inc_date': '2020-03-15', 'ca_x_private': 'yes', 'ca_x_trademark': 'no'}
def check(answers=ANS, sel=SEL): return anon.call('POST', '/api/public/compliance', {'sel': sel, 'answers': answers})
def item(country, kind, id):
    st, j = plat.call('GET', f'{API}?country={country}')
    return next((i for i in j.get('items', []) if i['kind'] == kind and i['id'] == id), None)
def save(kind, id, data, country='CA', **kw): return plat.call('POST', API, {'country': country, 'kind': kind, 'id': id, 'data': data, **kw})
def due_of(R, cid='ca_t2'): return next((x['next'][0] for x in R.get('shown', []) if x['id'] == cid), {})

section('Who gets in')
st, j = anon.call('GET', API); step('a visitor cannot open Service Master', st in (401, 403), st)
st, j = adm.call('GET', API); step('a firm administrator cannot', st in (401, 403), st)
st, j = cli.call('GET', API); step('a client cannot', st in (401, 403), st)
st, j = adm.call('POST', API, {'country': 'CA', 'kind': 'state', 'id': 'ZZ', 'data': {'name': 'Nowhere'}}); step('and cannot change anything', st in (401, 403) and not item('CA', 'state', 'ZZ'), st)
st, O = plat.call('GET', API)
by = {c['code']: c for c in O.get('countries', [])} if st == 200 else {}
step('the platform administrator sees the four countries with their figures', st == 200 and set(by) >= {'CA', 'US', 'IN', 'AE'} and by['CA']['compliances'] >= 150 and by['CA']['states'] == 13 and by['US']['states'] == 51, (st, {k: v.get('compliances') for k, v in by.items()}))
N0, Q0 = by.get('CA', {}).get('compliances', 0), by.get('CA', {}).get('questions', 0)
step('nothing is at zero: every country has questions, departments, entity types, penalties and sources', all(c['questions'] > 20 and c['departments'] >= 4 and c['entityTypes'] >= 7 and c['penalties'] > 20 and c['sources'] > 20 and c['problems'] == 0 for c in by.values()), by)
st, C = plat.call('GET', f'{API}?country=CA')
step('a country opens with every item and no problems', st == 200 and len(C['items']) > 350 and C['problems'] == [] and len(C['pack']['compliances']) == N0, (st, len(C.get('items', []))))
st, j = plat.call('GET', f'{API}?country=QQ'); step('an unknown country is not found', st == 404, st)

section('A change here is what the homepage gives next')
st, R0 = check(); t2 = item('CA', 'compliance', 'ca_t2')
step('before: the T2 return is due 30 June 2027', st == 200 and due_of(R0).get('date') == '2027-06-30' and t2 and t2['data']['due'] == {'t': 'afterYearEnd', 'basis': 'fy', 'months': 6}, (st, due_of(R0), t2 and t2['data']['due']))
# a person saves the check first, sets one date by hand and marks one filing as done
st, j = cli.call('POST', '/api/compliance-tracker', {'ticket': R0['ticket'], 'label': 'Rules Test Inc.'}); PID = j.get('id')
st, j = cli.call('GET', '/api/compliance-tracker'); items = next(p for p in j['profiles'] if p['id'] == PID)['items']
t4 = next(i for i in items if i['complianceId'] == 'ca_t4'); gst = next(i for i in items if i['complianceId'].startswith('ca_gst'))
cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': t4['id'], 'action': 'set_date', 'date': '2027-02-20'})
cli.call('PATCH', '/api/compliance-tracker', {'profileId': PID, 'itemId': gst['id'], 'action': 'done'})
gst_after = psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{gst['id']}'")
step('a person has saved the check, set one date by hand and marked one filing as done', bool(PID) and len(items) >= 7 and gst_after > (gst.get('dueDate') or '')[:10], (PID, len(items), gst_after))

st, j = save('compliance', 'ca_t2', {**t2['data'], 'name': 'Corporation income tax return (T2)', 'due': {'t': 'afterYearEnd', 'basis': 'fy', 'months': 5}, 'dueText': 'Five months after the end of the tax year (test).'})
step('the administrator changes the T2 rule to five months', st == 200 and j.get('success'), (st, j))
st, R1 = check()
step('the homepage now gives 31 May 2027 and the new name', due_of(R1).get('date') == '2027-05-31' and any(x['name'] == 'Corporation income tax return (T2)' for x in R1['shown']), (due_of(R1), [x['name'] for x in R1.get('shown', [])]))
st, j = cli.call('GET', '/api/compliance-tracker'); items = next(p for p in j['profiles'] if p['id'] == PID)['items']
mine = {i['complianceId']: i for i in items}
step('the person\'s saved T2 moved to 31 May 2027 by itself', (mine['ca_t2'].get('dueDate') or '')[:10] == '2027-05-31', mine['ca_t2'])
step('the date they set by hand is untouched', psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{t4['id']}'") == '2027-02-20', '')
step('what they marked as filed stays filed and keeps its next date', psql(f"select substr(due_date,1,10) from personal_entity_compliance where id='{gst['id']}'") == gst_after and psql(f"select count(*) from compliance_tracker_history where profile_id='{PID}'") == '1', '')
t2 = item('CA', 'compliance', 'ca_t2'); step('the item is marked as changed by the administrator', t2['edited'] is True and t2['origin'] == 'builtin', t2 and (t2['edited'], t2['origin']))

section('The government moves a deadline')
st, j = save('compliance', 'ca_t2', {**t2['data'], 'moved': [{'from': '2027-05-31', 'to': '2027-06-15', 'note': 'Extended (test)'}]})
st, R2 = check(); d = due_of(R2)
step('recording a moved deadline changes that one date and says what it was', st == 200 and d.get('date') == '2027-06-15' and d.get('was') == '2027-05-31', d)
st, j = cli.call('GET', '/api/compliance-tracker'); items = next(p for p in j['profiles'] if p['id'] == PID)['items']
step('and the person tracking it gets the new date', next((i.get('dueDate') or '')[:10] for i in items if i['complianceId'] == 'ca_t2') == '2027-06-15', '')
st, j = save('compliance', 'ca_t2', {**t2['data'], 'moved': [{'from': '2027-05-31', 'to': 'later'}]}); step('a moved deadline without a real date is refused', st == 400 and any('moved deadline' in p for p in j.get('problems', [])), (st, j))

section('A change that would break the checker is refused')
st, j = save('compliance', 'ca_t2', {**t2['data'], 'applies': {'q': 'no_such_question', 'yes': True}}); step('a rule that depends on a question that does not exist', st == 400 and j.get('problems'), (st, j))
st, j = save('compliance', 'ca_t2', {**t2['data'], 'due': {'t': 'afterYearEnd', 'basis': 'fy', 'months': 900}}); step('a due date rule out of range', st == 400 and j.get('problems'), (st, j))
st, j = save('compliance', 'ca_t2', {k: v for k, v in t2['data'].items() if k != 'due'}); step('a compliance with no due date rule', st == 400, (st, j))
st, j = save('compliance', 'ca_t2', {**t2['data'], 'source': 'no_such_source'}); step('a compliance pointing at a source that does not exist', st == 400, (st, j))
q = item('CA', 'question', 'ca_ccpc')
st, j = save('question', 'ca_ccpc', q['data'], active=False); step('switching off a question that compliances depend on', st == 400 and j.get('problems'), (st, j))
fq = item('CA', 'question', 'fye')
st, j = save('question', 'fye', fq['data'], active=False); step('switching off the year-end question that due dates are counted from', st == 400 and any('financial year end' in p for p in j.get('problems', [])), (st, j))
st, j = plat.call('DELETE', f'{API}?country=CA&kind=question&id=ca_ccpc'); step('deleting a question that compliances depend on', st == 400 and j.get('problems'), (st, j))
st, j = save('question', 'bad id!', {'step': q['data']['step'], 'text': 'x', 'type': 'yn'}); step('a short code with spaces or symbols', st == 400, (st, j))
st, j = save('source', 'ca_test_src', {'title': 'x', 'publisher': 'y', 'url': 'http://not-secure.example', 'checked': '2026-11-01'}); step('a source that is not an https link', st == 400, (st, j))
st, R3 = check(); step('after all those refusals the checker still answers as before', st == 200 and due_of(R3).get('date') == '2027-06-15' and R3['total'] == R0['total'], (st, R3.get('total')))

section('Adding a question and a compliance that hangs on it')
st, j = save('question', 'ca_test_q', {'step': q['data']['step'], 'text': 'Does it hold a test licence?', 'help': 'Only for the test.', 'type': 'yn', 'show': {'kind': ['corporation']}})
step('add a question for corporations', st == 200, (st, j))
st, j = anon.call('GET', '/api/public/compliance?country=CA'); step('the question is in the rules the homepage reads', any(x['id'] == 'ca_test_q' for x in j['pack']['questions']), '')
st, j = check(); step('but nobody is asked it yet: no compliance depends on it', st == 200, (st, str(j)[:160]))
st, j = save('compliance', 'ca_test_c', {'name': 'Test licence renewal', 'form': 'TL-1', 'dept': 'registry', 'head': 'Licences', 'authority': 'Test authority', 'brief': 'Renew the test licence.', 'why': 'It holds a test licence.',
    'applies': {'all': [{'kind': ['corporation']}, {'q': 'ca_test_q', 'yes': True}]}, 'frequency': 'annual', 'due': {'t': 'fixed', 'dates': [[9, 30]]}, 'dueText': '30 September each year.', 'penalty': 'A late fee (test).', 'weight': 100, 'source': t2['data']['source'], 'verified': False})
step('add a compliance that applies when the answer is Yes', st == 200, (st, j))
st, j = check(); step('now a check that has not answered it is told so', st == 422 and 'ca_test_q' in json.dumps(j), (st, str(j)[:160]))
st, j = anon.call('GET', '/api/public/compliance?country=CA&state=ON&entity=corporation&depts=registry'); step('and the homepage is told to ask it when the registry is ticked', st == 200 and 'ca_test_q' in j.get('relevant', []), (st, str(j)[:160]))
st, j = anon.call('GET', '/api/public/compliance?country=CA&state=ON&entity=corporation&depts=sales'); step('but not when only sales tax is ticked', st == 200 and 'ca_test_q' not in j.get('relevant', []), (st, str(j)[:160]))
st, RY = check({**ANS, 'ca_test_q': 'yes'}); top = next((x for x in RY.get('shown', []) if x['id'] == 'ca_test_c'), {})
step('answer Yes: it is among the three on the homepage, due 30 September 2027, with its penalty', st == 200 and top.get('id') == 'ca_test_c' and top['next'][0]['date'] == '2027-09-30' and top.get('penalty') == 'A late fee (test).' and RY['total'] == R0['total'] + 1, (st, [x['id'] for x in RY.get('shown', [])]))
st, RN = check({**ANS, 'ca_test_q': 'no'}); step('answer No: it does not appear', st == 200 and RN['total'] == R0['total'] and all(x['id'] != 'ca_test_c' for x in RN['shown']), (st, RN.get('total')))
st, RU = check({**ANS, 'ca_test_q': 'unsure'}); step('answer Not sure: it is kept, marked to be checked', st == 200 and RU['total'] == R0['total'] + 1, (st, RU.get('total')))
st, j = plat.call('DELETE', f'{API}?country=CA&kind=question&id=ca_test_q'); step('the question cannot be deleted while the compliance uses it', st == 400 and j.get('problems'), (st, j))
st, O = plat.call('GET', API); by = {c['code']: c for c in O['countries']}
step('the overview counts them', by['CA']['compliances'] == N0 + 1 and by['CA']['questions'] == Q0 + 1 and by['CA']['edited'] >= 3, (by['CA']['compliances'], by['CA']['questions'], by['CA']['edited']))

section('History and undo')
ch = O['changes']
step('every change is in the history with who made it', len(ch) >= 4 and ch[0]['action'] == 'added' and ch[0]['item_id'] == 'ca_test_c' and ch[0]['user_name'], ch[:1])
st, j = plat.call('POST', API, {'action': 'undo', 'historyId': ch[0]['id']}); step('undo the last change: the new compliance is gone', st == 200 and not item('CA', 'compliance', 'ca_test_c'), (st, j))
st, j = plat.call('DELETE', f'{API}?country=CA&kind=question&id=ca_test_q'); step('now the added question can be deleted', st == 200 and not item('CA', 'question', 'ca_test_q'), (st, j))
st, j = plat.call('POST', API, {'action': 'restore', 'country': 'CA', 'kind': 'compliance', 'id': 'ca_t2'})
st2, R4 = check(); t2 = item('CA', 'compliance', 'ca_t2')
step('restore the built-in T2: back to 30 June 2027, no longer marked as changed', st == 200 and due_of(R4).get('date') == '2027-06-30' and t2['edited'] is False and 'moved' not in t2['data'] and R4['total'] == R0['total'], (st, due_of(R4), t2['edited']))
st, j = cli.call('GET', '/api/compliance-tracker'); items = next(p for p in j['profiles'] if p['id'] == PID)['items']
step('and the person\'s T2 is back on 30 June 2027', next((i.get('dueDate') or '')[:10] for i in items if i['complianceId'] == 'ca_t2') == '2027-06-30', '')

section('Delete works on built-in items too, and Undo brings them back')
st, j = plat.call('DELETE', f'{API}?country=CA&kind=compliance&id=ca_t4'); st2, R5 = check()
step('delete the built-in T4 compliance: it is gone from Service Master and from the checker', st == 200 and not item('CA', 'compliance', 'ca_t4') and R5['total'] == R0['total'] - 1, (st, j, R5.get('total')))
st, O = plat.call('GET', API); by = {c['code']: c for c in O['countries']}; h = O['changes'][0]
step('the overview counts one fewer and the history has the deletion', by['CA']['compliances'] == N0 - 1 and h['action'] == 'deleted' and h['item_id'] == 'ca_t4', (by['CA']['compliances'], h['action'], h['item_id']))
st, j = plat.call('POST', API, {'action': 'undo', 'historyId': h['id']}); st2, R6 = check()
step('Undo brings it back exactly as it was', st == 200 and item('CA', 'compliance', 'ca_t4') and R6['total'] == R0['total'] and item('CA', 'compliance', 'ca_t4')['edited'] is False, (st, j, R6.get('total')))

section('States, entity types and a new country')
nu = item('CA', 'state', 'NU')
st, j = save('state', 'NU', nu['data'], active=False)
step('a territory that compliances are written for cannot be switched off, and the reason is in plain words', st == 400 and any('Nunavut' in p or 'NU' in p for p in j.get('problems', [])) and all('ca_' not in p for p in j.get('problems', [])), (st, j))
st, j = save('state', 'ZT', {'name': 'Test Territory'}); st2, j2 = anon.call('GET', '/api/public/compliance?country=CA')
step('add a territory: the homepage offers 14', st == 200 and len(j2['pack']['states']) == 14, (st, j, len(j2['pack']['states'])))
st, j = check(sel={**SEL, 'state': 'ZT'}); step('a check there answers with the country-wide compliances', st == 200 and j['total'] >= 5 and due_of(j).get('date') == '2027-06-30', (st, str(j)[:120]))
zt = item('CA', 'state', 'ZT')
st, j = save('state', 'ZT', zt['data'], active=False); st2, j2 = anon.call('GET', '/api/public/compliance?country=CA')
step('switch it off: back to 13, and a check for it is refused', st == 200 and len(j2['pack']['states']) == 13 and check(sel={**SEL, 'state': 'ZT'})[0] == 400, (st, len(j2['pack']['states'])))
st, j = plat.call('DELETE', f'{API}?country=CA&kind=state&id=ZT'); step('and remove it', st == 200 and not item('CA', 'state', 'ZT'), (st, j))
st, j = plat.call('POST', API, {'action': 'add-country', 'code': 'XK', 'name': 'Testland', 'currency': 'TLD', 'stateLabel': 'Region'}); step('add a country', st == 200, (st, j))
st, j = anon.call('GET', '/api/public/compliance'); step('it starts switched off: the homepage does not offer it', all(c['code'] != 'XK' for c in j['countries']), [c['code'] for c in j['countries']])
st, j = save('state', 'R1', {'name': 'Region One'}, country='XK'); step('it can be built up piece by piece', st == 200, (st, j))
xk = item('XK', 'country', 'XK')
st, j = save('country', 'XK', xk['data'], country='XK', active=True); step('it cannot be switched on until it is complete, and says what is missing', st == 400 and len(j.get('problems', [])) >= 2, (st, j))
st, j = plat.call('POST', API, {'action': 'add-country', 'code': 'XK', 'name': 'Again'}); step('the same country cannot be added twice', st == 409, st)
st, j = plat.call('DELETE', f'{API}?country=XK&kind=country&id=XK'); st2, O = plat.call('GET', API)
step('a country the administrator added can be removed', st == 200 and all(c['code'] != 'XK' for c in O['countries']), (st, j))
st, j = plat.call('DELETE', f'{API}?country=CA&kind=country&id=CA'); step('a built-in country cannot', st == 400, (st, j))

cli.call('DELETE', f'/api/compliance-tracker?profileId={PID}')
st, j = check(); step('at the end the checker answers exactly as at the start', st == 200 and j['total'] == R0['total'] and [x['id'] for x in j['shown']] == [x['id'] for x in R0['shown']] and due_of(j) == due_of(R0), (st, j.get('total')))
print(f'\nservice_master_api: {P} passed, {F} failed'); sys.exit(1 if F else 0)
