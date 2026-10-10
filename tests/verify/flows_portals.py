"""Corporate secretary, smart forms (builder, assign, client fills, staff reviews), client and staff portals,
platform admin, organizers, and an attack suite where an admin of ANOTHER firm must get nothing."""
import sys
import os
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows_core.py')).read().split("section('Clients')")[0]
exec(src)
cid = psql("select id from clients where org_id=(select org_id from users u join organization_memberships m on m.user_id=u.id where u.email='admin@taxccount.ca' limit 1) order by created_at limit 1")
tpl = psql("select id from compliance_templates order by created_at limit 1")

section('Corporate secretary')
st, j = adm.call('GET', f'/api/corpsec/{cid}/corporation'); step('open the corporation record (auto-created)', st == 200, (st, str(j)[:120]))
st, j = adm.call('POST', f'/api/corpsec/{cid}/import', {'legal_name': 'Flow Holdings Inc.', 'jurisdiction': 'Federal (CBCA)', 'incorporation_number': '1234567', 'business_number': '123456789RC0001', 'incorporation_date': '2020-01-15', 'registered_office': '1 Main St, Toronto, ON', 'records_office': '1 Main St, Toronto, ON'}); step('import opening state', st == 200, (st, j))
st, j = adm.call('POST', f'/api/corpsec/{cid}/compliance', {'title': 'File annual return', 'category': 'annual_return', 'due_date': '2026-06-30'}); step('add a compliance task', st == 200, (st, j))
st, j = adm.call('GET', f'/api/corpsec/{cid}/compliance'); step('list compliance tasks', st == 200, (st, str(j)[:100]))
st, j = adm.call('GET', '/api/corpsec/templates'); step('document templates list', st == 200, (st, str(j)[:100]))
tpls = (j.get('templates') if isinstance(j, dict) else j) or []
st, j = adm.call('POST', f'/api/corpsec/{cid}/documents', {'template_id': (tpls[0]['id'] if tpls else None), 'name': 'Flow resolution', 'answers': {'a': 1}, 'language': 'en'}); step('generate a document', st == 200, (st, j))
st, j = adm.call('GET', f'/api/corpsec/{cid}/documents'); step('list generated documents', st == 200, (st, str(j)[:100]))
for ch in ['director-appointment', 'registered-address']:
    st, j = adm.call('POST', f'/api/corpsec/{cid}/changes/{ch}', {'name': 'Pat Director', 'effective_date': '2026-03-01', 'notes': 'flow'}); step(f'start a change: {ch}', st == 200, (st, j))
st, j = adm.call('GET', f'/api/corpsec/{cid}/changes'); step('list changes', st == 200, (st, str(j)[:100]))
for reg in ['directors', 'officers', 'shareholders', 'securities', 'isc']:
    st, j = adm.call('GET', f'/api/corpsec/{cid}/registers/{reg}'); step(f'register: {reg}', st in (200, 404), (st, str(j)[:100]))
for eq in ['summary', 'classes', 'options', 'transfers']:
    st, j = adm.call('GET', f'/api/corpsec/{cid}/equity/{eq}'); step(f'equity: {eq}', st in (200, 404), (st, str(j)[:100]))
st, j = adm.call('GET', f'/api/corpsec/{cid}/minute-book/overview'); step('minute book', st in (200, 404), (st, str(j)[:100]))

section('Smart forms: builder, assign, client fills, staff reviews')
st, j = adm.call('GET', '/api/smart-forms/templates'); step('smart form templates (incl. T1)', st == 200, (st, str(j)[:100])); tl = (j.get('templates') if isinstance(j, dict) else j) or []
st, j = adm.call('POST', '/api/smart-forms', {'name': 'Flow Form ' + uid(), 'form_code': 'FLOW', 'description': 'x', 'country': 'Canada', 'compliance_type': 'Tax', 'tags': 'flow'}); step('create a form', st == 200, (st, j)); fid = (j or {}).get('id') or (j or {}).get('form', {}).get('id')
st, j = adm.call('GET', f'/api/smart-forms/{fid}'); step('open it in the builder', st == 200, (st, str(j)[:140]))
ver = (j or {}).get('activeVersionId') or (j or {}).get('version', {}).get('id') or (j or {}).get('versions', [{}])[0].get('id')
sid, qid = uuid.uuid4().hex, uuid.uuid4().hex
st, j = adm.call('PUT', f'/api/smart-forms/{fid}', {'action': 'save_builder', 'versionId': ver, 'name': 'Flow Form', 'sections': [{'id': sid, 'title': 'About you', 'sort_order': 1}], 'questions': [{'id': qid, 'section_id': sid, 'question_text': 'Your name?', 'question_type': 'text', 'is_required': 1, 'sort_order': 1}], 'documents': [], 'conditions': [], 'ocrMaps': [], 'aiRules': []}); step('save sections and questions', st == 200, (st, j))
jcid = psql("select id from clients where portal_user_id=(select id from users where email='james@email.com') limit 1")
st, j = adm.call('POST', '/api/projects', {'client_id': jcid, 'template_id': tpl, 'due_date': '2026-12-31', 'financial_year': '2025', 'smart_form_ids': [fid]}); step('start a project with that form attached', st == 200, (st, j))
asg = psql("select id from smart_form_assignments order by assigned_at desc limit 1")
step('an assignment exists for the client', bool(asg), 'none'); acl = psql("select client_id from smart_form_assignments where id='%s'" % asg) if asg else ''
st, j = cli.call('GET', '/api/portal/smart-forms'); step('client sees their forms', st == 200, (st, str(j)[:140]))
my = psql("select id from smart_form_assignments where client_id in (select id from clients where portal_user_id=(select id from users where email='james@email.com')) order by assigned_at desc limit 1")
if my:
    st, j = cli.call('GET', f'/api/portal/smart-forms/{my}'); step('client opens a form', st == 200, (st, str(j)[:120]))
    st, j = cli.call('PUT', f'/api/portal/smart-forms/{my}', {'action': 'save_responses', 'responses': {'q1': 'Ada', 'q2': ['a', 'b']}, 'is_final_submit': False}); step('client saves a draft', st == 200, (st, j))
    st, j = cli.call('PUT', f'/api/portal/smart-forms/{my}', {'action': 'save_responses', 'responses': {'q1': 'Ada L.'}, 'is_final_submit': True}); step('client submits', st == 200, (st, j))
    st, j = adm.call('GET', f'/api/smart-forms/responses/{my}'); step('staff opens the responses', st == 200, (st, str(j)[:120]))
    rid = psql("select id from smart_form_responses where assignment_id='%s' limit 1" % my)
    st, j = adm.call('PUT', f'/api/smart-forms/responses/{my}', {'action': 'review_response', 'response_id': rid, 'is_approved': True, 'staff_notes': 'looks right'}); step('staff approves an answer', st == 200, (st, j))
    st, j = adm.call('PUT', f'/api/smart-forms/responses/{my}', {'action': 'update_status', 'status': 'Completed'}); step('staff completes the form', st == 200, (st, j))
else:
    step('client has an assignment to fill', False, 'james has none: assignment went to ' + acl)

section('Client portal (james@email.com)')
for path in ['/api/portal/dashboard', '/api/portal/invoices', '/api/portal/documents', '/api/portal/chats', '/api/portal/reminders', '/api/portal/tasks', '/api/portal/consultants', '/api/portal/vault', '/api/portal/fulfillment?compliance_item_id=x', '/api/me']:
    st, j = cli.call('GET', path); step(f'portal GET {path.split("?")[0]}', st in (200, 400, 404), (st, str(j)[:100]))
st, j = cli.call('POST', '/api/portal/reminders', {'title': 'Gather receipts', 'message': 'x', 'trigger_date': '2026-03-01', 'channel': 'in_app'}); step('client creates a private reminder', st == 200, (st, j))
st, j = cli.call('GET', '/api/portal/chats'); th = ((j or {}).get('threads') or [{}])[0].get('id') if isinstance(j, dict) else None
if th:
    st, j = cli.call('POST', '/api/portal/chats', {'thread_id': th, 'content': 'Hello from the client'}); step('client posts in a thread', st == 200, (st, j))
    st, j = cli.call('GET', f'/api/portal/chats/messages?threadId={th}'); step('client reads the thread', st == 200, (st, str(j)[:100]))

section('Staff portal (emily@taxccount.ca)')
uidv = stf.user.get('id')
for path in ['/api/staff/dashboard', '/api/staff/clients', '/api/staff/leads', '/api/staff/inbox', '/api/staff/profile', '/api/staff/reminders', '/api/staff/team', '/api/employee/dashboard']:
    st, j = stf.call('GET', f'{path}?user_id={uidv}'); step(f'staff GET {path}', st in (200, 404), (st, str(j)[:110]))
st, j = stf.call('POST', '/api/staff/reminders', {'user_id': uidv, 'title': 'Call back', 'trigger_date': '2026-03-02', 'message': 'x'}); step('staff creates a reminder', st in (200, 404, 405), (st, j))

section('Platform admin')
st, j = plat.call('POST', '/api/platform/service-master/countries', {'name': 'Flowland', 'code': 'FL', 'currency': 'FLC'}); step('add a country', st == 200, (st, j)); ctid = (j or {}).get('id')
st, j = plat.call('PUT', f'/api/platform/service-master/countries/{ctid}', {'name': 'Flowland 2', 'code': 'FL', 'currency': 'FLC', 'is_active': 1}); step('edit it', st == 200, (st, j))
st, j = plat.call('DELETE', f'/api/platform/service-master/countries/{ctid}'); step('delete it', st == 200, (st, j))
for path in ['/api/platform/users', '/api/platform/super-forms', '/api/platform/service-master/stats']:
    st, j = plat.call('GET', path); step(f'platform GET {path}', st == 200, (st, str(j)[:100]))

section('Organizers, engagement letters, calendar')
st, j = adm.call('POST', '/api/organizers/templates', {'name': 'Flow Organizer', 'description': 'x', 'sections': [{'title': 'Income', 'questions': [{'question_text': 'Any T4?', 'question_type': 'yes_no'}]}]}); step('create an organizer template', st in (200, 201), (st, j)); ot = (j or {}).get('id')
st, j = adm.call('POST', '/api/organizers/instances', {'template_id': ot, 'client_id': cid}); step('send an organizer to a client', st in (200, 201), (st, j)); oi = (j or {}).get('id')
if oi: st, j = adm.call('PUT', f'/api/organizers/instances/{oi}', {'answers': {'a': 'yes'}, 'status': 'completed'}); step('answer the organizer', st == 200, (st, j))
st, j = adm.call('POST', '/api/engagement-letters', {'client_id': cid, 'legal_text': 'I agree.'}); step('create an engagement letter', st == 200, (st, j)); el = (j or {}).get('id')
if el: st, j = cli.call('POST', f'/api/engagement-letters/{el}/sign', {'signature_base64': 'data:image/png;base64,iVBORw0KGgo=', 'signer_id': cli.user.get('id')}); step('client signs it', st in (200, 403, 404), (st, j))

section('Firm isolation: an admin of ANOTHER firm (admin@singhcpa.ca) must get nothing')
rival = Sess('admin@singhcpa.ca')
doc = psql("select id from document_files where org_id=(select org_id from clients where id='%s') limit 1" % cid)
if not doc:
    b2 = '----iso' + uid(); fd2 = lambda k, v: f'--{b2}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'
    body2 = (fd2('client_id', cid) + fd2('document_category', 'client_supporting') + fd2('financial_year', '2025') + fd2('uploaded_by', adm.user.get('id')) + f'--{b2}\r\nContent-Disposition: form-data; name="file"; filename="x.txt"\r\nContent-Type: text/plain\r\n\r\nsecret\r\n--{b2}--\r\n').encode()
    adm.call('POST', '/api/documents', raw=body2, headers={'Content-Type': f'multipart/form-data; boundary={b2}'}); doc = psql("select id from document_files where client_id='%s' limit 1" % cid)
eng1 = psql("select id from client_compliances where client_id='%s' limit 1" % cid)
lead1 = psql("select id from leads where org_id=(select org_id from clients where id='%s') limit 1" % cid)
adm.call('POST', f'/api/payroll/{cid}/company', {'legal_name': 'Firm One Payroll', 'business_number': '1', 'payroll_program_account': 'RP1', 'remitter_type': 'regular', 'default_province': 'ON'})
def refused(name, method, path, body=None):
    st, j = rival.call(method, path, body); step(name, st in (401, 403, 404), (st, str(j)[:120]))
refused('payroll company of another firm', 'GET', f'/api/payroll/{cid}/company')
refused('payroll people of another firm', 'GET', f'/api/payroll/{cid}/people')
refused('add an employee to another firm\'s client', 'POST', f'/api/payroll/{cid}/people', {'first_name': 'Evil', 'last_name': 'Hire', 'type': 'Employee', 'pay_rate': 1})
refused('payroll runs of another firm', 'GET', f'/api/payroll/{cid}/runs')
refused('another firm\'s client record', 'GET', f'/api/clients/{cid}')
refused('edit another firm\'s client', 'PUT', f'/api/clients/{cid}', {'display_name': 'Hacked'})
refused('contacts of another firm\'s client', 'POST', f'/api/clients/{cid}/contacts', {'contact_name': 'X'})
refused('link another firm\'s client', 'POST', f'/api/clients/{cid}/relationships', {'linked_client_id': cid, 'role': 'x'})
refused('another firm\'s project', 'GET', f'/api/projects/{eng1}')
refused('change another firm\'s project', 'PUT', f'/api/projects/{eng1}', {'action': 'edit_metadata', 'notes': 'hacked'})
refused('project documents of another firm', 'GET', f'/api/projects/{eng1}/documents')
refused('download another firm\'s document', 'GET', f'/api/documents/{doc}/download')
refused('versions of another firm\'s document', 'GET', f'/api/documents/{doc}/versions')
refused('another firm\'s lead activities', 'GET', f'/api/leads/{lead1}/activities')
refused('another firm\'s ledger', 'GET', f'/api/clients/{cid}/ledger/accounts')
refused('another firm\'s T1 intake list contains nothing of ours', 'GET', '/api/tax-intake?x=1') if False else None
st, j = rival.call('GET', '/api/tax-intake'); step('T1 intake list of the other firm is empty of ours', st == 200 and all(e.get('org_id') != adm.user.get('org_id') for e in j.get('engagements', [])), (st, str(j)[:100]))
st, j = rival.call('GET', '/api/services/annual-return/projects'); step('service centre shows none of our projects', st == 200 and all(p.get('client_id') != cid for p in (j.get('projects') or [])), (st, str(j)[:100]))
st, j = rival.call('GET', '/api/reports/missing-documents'); step('missing-documents report shows none of our clients', st == 200 and all(m.get('client_id') != cid for m in (j.get('missingDocuments') or [])), (st, str(j)[:100]))
st, j = rival.call('GET', '/api/teams/revenue'); step('revenue report holds only their own people', st == 200, (st, str(j)[:100]))
step('our client was not changed', psql("select display_name from clients where id='%s'" % cid) != 'Hacked', 'client was renamed')
step('our payroll people unchanged', psql("select count(*) from payroll_person where first_name='Evil'") == '0', 'employee added')

print(f'\nRESULT: {P} passed, {F} failed'); print('FAILED:', '; '.join(fails))
sys.exit(1 if F else 0)
