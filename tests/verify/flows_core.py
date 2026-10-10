"""Module flows: clients, engagements, billing, accounting, payroll, leads, messages, settings, documents.
Runs against a running app on an EMPTY database (see tests/verify/README.md)."""
import json, sys, urllib.request, urllib.error, http.cookiejar, time, uuid, subprocess, os
B = os.environ.get('BASE_URL', 'http://127.0.0.1:3100')
def psql(sql):
    # connection comes from the standard PGHOST / PGUSER / PGPASSWORD / PGDATABASE environment
    return subprocess.run(['psql','-tA','-c',sql],capture_output=True,text=True).stdout.strip()
class Sess:
    def __init__(s, email):
        s.cookie = ''; s.op = urllib.request.build_opener()
        st, j = s.call('POST', '/api/auth/login', {'email': email, 'password': 'password123'}); s.user = (j or {}).get('user', {}); assert st == 200, (email, st, j)
    def call(s, method, path, body=None, raw=None, headers=None):
        data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
        h = {'Content-Type': 'application/json'} if raw is None else {}
        if s.cookie: h['Cookie'] = s.cookie
        h.update(headers or {})
        r = urllib.request.Request(B + path, data=data, method=method, headers=h)
        try:
            with s.op.open(r, timeout=60) as resp:
                t = resp.read().decode(); st = resp.status
                for c in resp.headers.get_all('Set-Cookie') or []:
                    if c.startswith('auth_session='): s.cookie = 'auth_session=' + c.split(';')[0].split('=', 1)[1]
        except urllib.error.HTTPError as e: t = e.read().decode(); st = e.code
        try: return st, json.loads(t)
        except Exception: return st, t
P = F = 0; fails = []
def step(name, ok, info=''):
    global P, F
    if ok: P += 1; print(f'  PASS {name}')
    else: F += 1; fails.append(name); print(f'  FAIL {name}  {str(info)[:230]}')
def section(n): print(f'\n## {n}')
adm = Sess('admin@taxccount.ca'); stf = Sess('emily@taxccount.ca'); cli = Sess('james@email.com'); plat = Sess('platform@abidebylaw.com')
uid = lambda: uuid.uuid4().hex[:6]

section('Clients')
st, j = adm.call('POST', '/api/clients', {'display_name': 'Flow Test Corp ' + uid(), 'primary_email': f'flow{uid()}@test.ca', 'client_type': 'business', 'province': 'ON', 'city': 'Toronto'})
step('create client', st == 200 and j.get('id'), (st, j)); cid = (j or {}).get('id')
st, j = adm.call('PUT', f'/api/clients/{cid}', {'display_name': 'Flow Test Corp Renamed', 'has_accounting': 1, 'has_payroll': 1, 'has_secretarial': True, 'status': 'active'})
step('update client incl. accounting/payroll/secretarial flags', st == 200, (st, j))
st, j = adm.call('GET', f'/api/clients/{cid}'); step('read client back', st == 200 and 'Renamed' in json.dumps(j), (st, str(j)[:120]))
st, j = adm.call('POST', f'/api/clients/{cid}/contacts', {'contact_name': 'Pat Contact', 'relationship': 'owner', 'email': 'pat@test.ca', 'phone': '416', 'is_primary': True}); step('add contact', st == 200, (st, j))
other = psql("select id from clients where id<>'%s' order by created_at limit 1" % cid)
st, j = adm.call('POST', f'/api/clients/{cid}/relationships', {'linked_client_id': other, 'role': 'shareholder'}); step('link two clients', st == 200, (st, j))
tpl = psql("select id from compliance_templates order by created_at limit 1")
st, j = adm.call('POST', f'/api/clients/{cid}/engagements', {'template_id': tpl, 'due_date': '2026-12-31', 'financial_year': '2025', 'price': 450})
step('create engagement (annual return / any service)', st == 200, (st, j)); eng = (j or {}).get('id') or (j or {}).get('engagement_id')
if not eng: eng = psql("select id from client_compliances where client_id='%s' order by created_at desc limit 1" % cid)
import re as _re
code = psql("select engagement_code from client_compliances where id='%s'" % eng)
prev = [int(c.split('-')[2]) for c in psql("select engagement_code from client_compliances where id<>'%s' and org_id=(select org_id from client_compliances where id='%s')" % (eng, eng)).split() if _re.match(r'^ENG-\d{4}-\d+$', c)]
step('engagement number is the next one for the firm (not "151")', bool(_re.match(r'^ENG-\d{4}-\d{4}$', code)) and int(code.split('-')[2]) == max(prev or [0]) + 1, (code, max(prev or [0])))
step('engagement has stages, documents, firm id', int(psql("select count(*) from client_compliance_stages where engagement_id='%s' and org_id is not null" % eng) or 0) > 0, 'no stages')

section('Engagement lifecycle (annual return flow)')
st, j = adm.call('GET', f'/api/projects/{eng}'); step('open the project', st == 200, (st, str(j)[:150]))
stages = (j or {}).get('stages') or []
if stages:
    st, j2 = adm.call('PUT', f'/api/projects/{eng}', {'action': 'transition_stage', 'stage_id': stages[0]['id'], 'new_status': 'in_progress'}); step('start first stage', st == 200, (st, j2))
    st, j2 = adm.call('PUT', f'/api/projects/{eng}', {'action': 'transition_stage', 'stage_id': stages[0]['id'], 'new_status': 'completed', 'note': 'done'}); step('complete first stage', st == 200, (st, j2))
    if len(stages) > 1:
        st, j2 = adm.call('PUT', f'/api/projects/{eng}', {'action': 'transition_stage', 'stage_id': stages[1]['id'], 'new_status': 'pending', 'note': 'please fix'}); step('send a stage back with a note', st in (200, 400), (st, j2))
st, j = adm.call('PUT', f'/api/projects/{eng}', {'action': 'edit_metadata', 'priority': 'high', 'notes': 'updated', 'due_date': '2027-01-31'}); step('edit project details', st == 200, (st, j))
st, j = adm.call('GET', '/api/services/annual-return/projects'); step('annual-return service list', st == 200, (st, str(j)[:120]))
st, j = adm.call('GET', f'/api/projects/{eng}/documents'); step('project documents list', st == 200, (st, str(j)[:120]))

section('Billing')
st, j = adm.call('POST', '/api/billing', {'client_id': cid, 'engagement_id': eng, 'total_amount': 565, 'amount': 500, 'due_date': '2026-12-31', 'status': 'sent', 'notes': 'flow'})
step('create invoice', st == 200, (st, j)); inv = (j or {}).get('id') or psql("select id from invoices where client_id='%s' order by created_at desc limit 1" % cid)
st, j = adm.call('PUT', f'/api/billing/{inv}', {'payment_amount': 100, 'payment_method': 'etransfer', 'notes': 'part'}); step('record a part payment', st == 200, (st, j))
step('payment row stored with who took it', psql("select count(*) from payments where invoice_id='%s' and recorded_by is not null and status='completed'" % inv) == '1', 'no payment row')
st, j = adm.call('PUT', f'/api/billing/{inv}', {'payment_amount': 465, 'payment_method': 'etransfer'}); step('pay the rest', st == 200, (st, j))
step('invoice marked paid', psql("select status from invoices where id='%s'" % inv) == 'paid', psql("select status from invoices where id='%s'" % inv))

section('Accounting (ledger)')
st, j = adm.call('GET', f'/api/clients/{cid}/ledger'); step('open ledger (creates chart of accounts)', st == 200, (st, str(j)[:150]))
st, j = adm.call('GET', f'/api/clients/{cid}/ledger/accounts'); accs = (j.get('accounts') if isinstance(j, dict) else j) or []
step('chart of accounts has accounts', st == 200 and len(accs) >= 10, (st, str(j)[:120]))
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/accounts', {'name': 'Flow Test Account', 'type': 'asset', 'subtype': 'bank', 'account_code': '1999', 'description': 'x'}); step('add an account', st == 200, (st, j)); newacc = (j or {}).get('id')
st, j = adm.call('PUT', f'/api/clients/{cid}/ledger/accounts', {'account_id': newacc, 'name': 'Flow Account Renamed', 'type': 'asset'}); step('rename an account', st == 200, (st, j))
a1 = next((a['id'] for a in accs if a.get('type') == 'asset'), None); a2 = next((a['id'] for a in accs if a.get('type') == 'revenue'), None); a3 = next((a['id'] for a in accs if a.get('type') == 'expense'), None)
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/journal', {'date': '2026-01-15', 'description': 'Flow journal', 'entries': [{'account_id': a1, 'debit': 100, 'credit': 0}, {'account_id': a2, 'debit': 0, 'credit': 100}]})
step('post a balanced journal entry', st == 200, (st, j))
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/journal', {'date': '2026-01-15', 'description': 'Unbalanced', 'entries': [{'account_id': a1, 'debit': 100, 'credit': 0}, {'account_id': a2, 'debit': 0, 'credit': 90}]})
step('unbalanced journal entry is refused', st == 400, (st, j))
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/transactions', {'date': '2026-01-16', 'description': 'Bank deposit', 'type': 'deposit', 'status': 'posted', 'amount': 250, 'reference': 'D1', 'entries': [{'account_id': a1, 'debit': 250, 'credit': 0}, {'account_id': a2, 'debit': 0, 'credit': 250}]})
step('record a bank transaction', st == 200, (st, j)); tx = (j or {}).get('id') or (j or {}).get('transaction_id')
if tx: st, j = adm.call('PUT', f'/api/clients/{cid}/ledger/transactions/reconcile', {'transaction_id': tx, 'status': 'reconciled'}); step('reconcile it', st == 200, (st, j))
st, j = adm.call('GET', f'/api/clients/{cid}/ledger/transactions'); step('list transactions', st == 200, (st, str(j)[:100]))
for rep in ['trial-balance', 'profit-loss', 'balance-sheet', 'general-ledger']:
    st, j = adm.call('GET', f'/api/clients/{cid}/ledger/reports?type={rep}'); step(f'report: {rep}', st == 200, (st, str(j)[:140]))
    if rep == 'trial-balance':
        tb = j if isinstance(j, dict) else {}
        td, tc = tb.get('total_debit'), tb.get('total_credit')
        step('trial balance totals are numbers and balance', isinstance(td, (int, float)) and td == tc and td > 0, (td, tc, str(j)[:200]))
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/sales', {'type': 'customer', 'data': {'name': 'Cust Ltd', 'email': 'c@test.ca'}}); step('sales: add a customer', st == 200, (st, j)); cust = (j or {}).get('id')
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/sales', {'type': 'invoice', 'data': {'customer_id': cust, 'invoice_number': 'S-1', 'date': '2026-01-20', 'due_date': '2026-02-20', 'tax_rate': 13, 'lines': [{'description': 'Service', 'quantity': 1, 'unit_price': 100, 'account_id': a2}]}}); step('sales: create invoice', st == 200, (st, j)); sinv = (j or {}).get('id')
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/sales', {'type': 'invoice_payment', 'data': {'invoice_id': sinv, 'payment_amount': 50, 'date': '2026-01-25'}}); step('sales: record a payment on it', st == 200, (st, j))
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/purchases', {'type': 'vendor', 'data': {'name': 'Vend Inc', 'email': 'v@test.ca'}}); step('purchases: add a vendor', st == 200, (st, j)); vend = (j or {}).get('id')
st, j = adm.call('POST', f'/api/clients/{cid}/ledger/purchases', {'type': 'bill', 'data': {'vendor_id': vend, 'bill_number': 'P-1', 'date': '2026-01-21', 'due_date': '2026-02-21', 'tax_rate': 13, 'lines': [{'description': 'Supplies', 'quantity': 1, 'unit_price': 50, 'account_id': a3}]}}); step('purchases: create bill', st == 200, (st, j))
st, j = adm.call('GET', f'/api/clients/{cid}/ledger/sales'); step('sales list', st == 200, (st, str(j)[:100]))
st, j = adm.call('GET', f'/api/clients/{cid}/ledger/purchases'); step('purchases list', st == 200, (st, str(j)[:100]))
st, j = adm.call('DELETE', f'/api/clients/{cid}/ledger/accounts?account_id={newacc}'); step('delete the unused account', st == 200, (st, j))

section('Payroll (new module)')
st, j = adm.call('POST', f'/api/payroll/{cid}/company', {'legal_name': 'Flow Test Corp', 'business_number': '123456789', 'payroll_program_account': 'RP0001', 'remitter_type': 'regular', 'default_province': 'ON'}); step('create payroll company', st == 200, (st, j))
st, j = adm.call('POST', f'/api/payroll/{cid}/pay-groups', {'name': 'Biweekly', 'frequency': 'Bi-weekly', 'cutoff_time': '12:00', 'cutoff_timezone': 'America/Toronto', 'auto_run': False}); step('create pay group', st == 200, (st, j)); pg = (j or {}).get('id') or (j or {}).get('payGroup', {}).get('id')
if not pg: pg = psql("select id from pay_group where client_id='%s' limit 1" % cid)
st, j = adm.call('POST', f'/api/payroll/{cid}/pay-groups/{pg}/generate-schedule', {'firstPayDate': '2026-01-16', 'firstPeriodStart': '2026-01-01', 'year': 2026}); step('generate pay schedule', st == 200, (st, str(j)[:160]))
st, j = adm.call('POST', f'/api/payroll/{cid}/people', {'first_name': 'Ada', 'last_name': 'Lovelace', 'email': 'ada@test.ca', 'type': 'Employee', 'pay_type': 'Salary', 'pay_rate': 78000, 'province_of_employment': 'ON', 'hire_date': '2024-01-01', 'pay_group_id': pg, 'federal_claim': 15705, 'provincial_claim': 12747, 'standard_hours': 40}); step('add an employee', st == 200, (st, j))
st, j = adm.call('GET', f'/api/payroll/{cid}/people'); step('list employees', st == 200 and len(j if isinstance(j, list) else j.get('people', [])) >= 1, (st, str(j)[:140]))
st, j = adm.call('POST', f'/api/payroll/{cid}/runs', {'pay_group_id': pg, 'period_start': '2026-01-01', 'period_end': '2026-01-14', 'pay_date': '2026-01-16'}); step('create a pay run', st == 200, (st, j)); run = (j or {}).get('id') or (j or {}).get('run', {}).get('id') or psql("select id from pay_run where client_id='%s' order by created_at desc limit 1" % cid)
st, j = adm.call('POST', f'/api/payroll/{cid}/runs/{run}/calculate'); step('calculate the run', st == 200, (st, str(j)[:160]))
print('   run totals (78000 a year, 26 pay periods, expect 3000.00 gross):', psql("select total_gross||' gross, '||total_net||' net' from pay_run where id='%s'" % run))
st, j = adm.call('GET', f'/api/payroll/{cid}/runs/{run}'); step('open the run with pay slips', st == 200, (st, str(j)[:120]))
slips = (j or {}).get('payslips') or []
st, j = adm.call('PATCH', f'/api/payroll/{cid}/runs/{run}', {'pay_date': '2026-01-16', 'direct_deposit': True, 'remit_taxes': True, 'notes': 'ok'}); step('edit run options', st == 200, (st, j))
st, j = adm.call('POST', f'/api/payroll/{cid}/runs/{run}/approve'); step('approve the run', st == 200, (st, j))
st, j = adm.call('GET', f'/api/payroll/{cid}/remittances'); step('remittances created', st == 200, (st, str(j)[:140]))
st, j = adm.call('POST', f'/api/payroll/{cid}/runs/{run}/reverse'); step('reverse the run', st in (200, 400), (st, j))
st, j = adm.call('GET', '/api/payroll/firm-dashboard'); step('firm payroll dashboard', st == 200, (st, str(j)[:120]))
st, j = adm.call('POST', f'/api/clients/{cid}/payroll/employees', {'first_name': 'Old', 'last_name': 'Prototype', 'sin': '046454286', 'pay_rate': 25, 'pay_frequency': 'biweekly'}); step('legacy payroll tab: add employee', st == 200, (st, j))
st, j = adm.call('POST', f'/api/clients/{cid}/payroll/run', {'run_date': '2026-01-16', 'period_start': '2026-01-01', 'period_end': '2026-01-14'}); step('legacy payroll tab: run payroll', st == 200, (st, j))

section('Leads')
st, j = adm.call('POST', '/api/leads', {'first_name': 'Lee', 'last_name': 'Lead', 'email': f'lee{uid()}@test.ca', 'phone': '416', 'lead_type': 'individual', 'source': 'website', 'expected_value': 500}); step('create lead', st == 200, (st, j)); lid = (j or {}).get('id')
st, j = adm.call('POST', f'/api/leads/{lid}/activities', {'activity_type': 'call', 'summary': 'spoke', 'outcome': 'ok', 'next_action': 'email', 'contact_date': '2026-01-10', 'duration_minutes': 10, 'created_by': adm.user.get('id')}); step('log a lead activity', st == 200, (st, j))
st, j = adm.call('POST', f'/api/leads/{lid}/tasks', {'title': 'Follow up', 'description': 'x', 'due_date': '2026-02-01', 'priority': 'high'}); step('add a lead task', st == 200, (st, j))
st, j = adm.call('POST', f'/api/leads/{lid}/convert', {'client_type': 'individual'}); step('convert lead to client', st == 200, (st, j))

section('Messages, reminders, inbox')
st, j = adm.call('POST', '/api/messages', {'client_id': cid, 'subject': 'Hello', 'thread_type': 'client', 'message': 'Hi there', 'sender_id': adm.user.get('id')}); step('start a thread', st == 200, (st, j)); th = (j or {}).get('thread_id') or (j or {}).get('id')
st, j = adm.call('POST', f'/api/messages/{th}', {'sender_id': adm.user.get('id'), 'content': 'Second message', 'is_internal': 0}); step('reply in the thread', st == 200, (st, j))
st, j = adm.call('POST', '/api/reminders', {'client_id': cid, 'engagement_id': eng, 'reminder_type': 'manual', 'channel': 'in_app', 'user_id': adm.user.get('id'), 'title': 'Call client', 'message': 'x', 'trigger_date': '2026-02-01'}); step('create a reminder', st == 200, (st, j))
st, j = adm.call('GET', '/api/inbox'); step('inbox list', st == 200, (st, str(j)[:100]))

section('Settings')
st, j = adm.call('POST', '/api/settings/exchange-rates', {'from_currency': 'EUR', 'to_currency': 'CAD', 'exchange_rate': 1.5, 'effective_date': '2026-01-01', 'notes': 'x'}); step('add exchange rate', st == 200, (st, j))
st, j = adm.call('PUT', '/api/settings/currency', {'base_currency': 'CAD', 'currency_display_style': 'code', 'default_template_currency': 'CAD'}); step('set currency', st == 200, (st, j))
st, j = adm.call('POST', '/api/settings/client-types', {'name': 'Flow Type'}); step('add client type', st == 200, (st, j))
st, j = adm.call('PUT', '/api/settings/profile', {'name': 'Taxccount Professional Services', 'city': 'Toronto', 'province': 'Ontario', 'phone': '416', 'email': 'admin@taxccount.ca'}); step('firm profile', st == 200, (st, j))
st, j = adm.call('PUT', '/api/settings/notifications', {'preferences': {'email': True}}); step('notification settings', st == 200, (st, j))
st, j = adm.call('POST', '/api/settings/tax-rates', {'province': 'ON', 'gst': '5', 'pst': '8', 'pst_label': 'HST'}); step('tax rate', st == 200, (st, j))
st, j = adm.call('POST', '/api/settings/team', {'first_name': 'New', 'last_name': 'Member', 'email': f'new{uid()}@taxccount.ca', 'role': 'team_member', 'phone': '416'}); step('invite a team member', st == 200, (st, j))
st, j = adm.call('POST', '/api/teams', {'name': 'Flow Team ' + uid(), 'description': 'x', 'manager_id': adm.user.get('id')}); step('create a team', st == 200, (st, j))
st, j = adm.call('POST', '/api/settings/checklists', {'name': 'Flow Checklist ' + uid(), 'checklist_code': 'FLOW', 'description': 'x', 'category': 'client_supporting', 'country': 'Canada', 'status': 'Active', 'is_default': False, 'items': [{'document_name': 'Item 1', 'document_category': 'client_supporting', 'is_mandatory': 1, 'upload_required': 1, 'upload_by': 'client', 'suggested_stage': 'Onboarding'}]}); step('create a checklist with items', st == 200, (st, j))
st, j = adm.call('GET', '/api/settings/checklists'); step('list checklists', st == 200, (st, str(j)[:100]))
st, j = adm.call('POST', '/api/categories', {'name': 'Flow Cat ' + uid(), 'category_code': 'FLOW', 'description': 'x', 'country': 'Canada', 'colour': '#111111', 'status': 'Active'}); step('create a service category', st == 200, (st, j))
st, j = adm.call('POST', '/api/templates', {'name': 'Flow Template ' + uid(), 'code': 'FLOW' + uid(), 'description': 'x', 'category': 'Tax', 'default_price': 100, 'stages': [{'stage_name': 'Intake', 'stage_code': 'INTAKE', 'sequence_order': 1}, {'stage_name': 'Review', 'stage_code': 'REVIEW', 'sequence_order': 2}]}); step('create a service template', st == 200, (st, j))

section('Documents')
boundary = '----flow' + uid(); fd = lambda k, v: f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'
body = (fd('client_id', cid) + fd('engagement_id', eng) + fd('document_category', 'client_supporting') + fd('financial_year', '2025') + fd('uploaded_by', adm.user.get('id')) +
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="t4.txt"\r\nContent-Type: text/plain\r\n\r\nT4 slip employer box 14 123.45\r\n--{boundary}--\r\n').encode()
st, j = adm.call('POST', '/api/documents', raw=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}); step('upload a document', st == 200, (st, j)); did = (j or {}).get('id') or (j or {}).get('document', {}).get('id')
if not did: did = psql("select id from document_files order by created_at desc limit 1")
st, j = adm.call('PATCH', f'/api/documents/{did}', {'approval_status': 'APPROVED'}); step('approve the document', st == 200, (st, j))
st, j = adm.call('GET', f'/api/documents/{did}/versions'); step('document versions', st == 200, (st, str(j)[:100]))
st, j = adm.call('GET', '/api/documents/search?q=slip'); step('search documents', st == 200, (st, str(j)[:100]))

print(f'\nRESULT: {P} passed, {F} failed'); print('FAILED:', '; '.join(fails))
sys.exit(1 if F else 0)
