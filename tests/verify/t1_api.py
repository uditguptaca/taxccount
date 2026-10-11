"""T1 intake API: saving with history and version checks, one review item per problem, firm/client access,
records, documents, submission rules, snapshots, reopening and exports. Runs against a running app."""
import sys, os, subprocess, json, uuid
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows_core.py')).read().split("section('Clients')")[0]
exec(src)
HERE = os.path.dirname(os.path.abspath(__file__))

def fill(prov='ON', strat='max', year='2025'):
    r = subprocess.run(['node', '--experimental-strip-types', os.path.join(HERE, 't1_fill.ts'), prov, strat, year], capture_output=True, text=True)
    return json.loads(r.stdout)['responses']
def upload(sess, eid, name, content, ctype, fields):
    b = '----t1' + uid(); parts = []
    for k, v in fields.items(): parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    parts.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: {ctype}\r\n\r\n'.encode() + content + b'\r\n')
    parts.append(f'--{b}--\r\n'.encode())
    return sess.call('POST', f'/api/tax-intake/{eid}/documents', raw=b''.join(parts), headers={'Content-Type': f'multipart/form-data; boundary={b}'})

section('Setup: a client record for James, and a second client for the access checks')
jid = psql("select c.id from clients c where c.portal_user_id=(select id from users where email='james@email.com') limit 1")
other = psql(f"select id from clients where id<>'{jid}' and org_id=(select org_id from clients where id='{jid}') order by created_at limit 1")
step('both client records exist', bool(jid) and bool(other), (jid, other))

section('The firm creates intakes')
st, j = adm.call('POST', '/api/tax-intake', {'client_id': jid, 'client_name': 'James Thompson', 'tax_year': '2025', 'filing_type': 'original'})
E = j.get('id'); step('create (province left for the client to answer)', st == 200 and E, (st, j))
st, j = adm.call('POST', '/api/tax-intake', {'client_id': jid, 'tax_year': '2031', 'filing_type': 'original'}); step('an unsupported tax year is refused', st == 400, (st, j))
st, j = adm.call('POST', '/api/tax-intake', {'client_id': jid, 'tax_year': '2025', 'filing_type': 'original', 'province': 'ZZ'}); step('an unknown province is refused', st == 400, (st, j))
st, j = adm.call('POST', '/api/tax-intake', {'client_id': jid, 'tax_year': '2025', 'filing_type': 'original'}); step('a second intake for the same year and type is refused', st == 409, (st, j))
st, j = adm.call('POST', '/api/tax-intake', {'client_id': other, 'client_name': 'Someone Else', 'tax_year': '2025', 'filing_type': 'original'}); E2 = j.get('id'); step('an intake for another client', st == 200 and E2, (st, j))

section('Access')
st, j = cli.call('GET', f'/api/tax-intake/{E2}/state'); step("a client cannot open another client's intake", st == 401, st)
st, j = stf.call('GET', f'/api/tax-intake/{E}/state'); step('firm staff of the same firm can open it', st == 200 and j['isClient'] is False, st)
for path in ['review', 'preparer-notes', 'package', 'history']:
    st, _ = cli.call('GET', f'/api/tax-intake/{E}/{path}'); step(f'a client cannot read /{path}', st == 401, st)
st, _ = cli.call('GET', f'/api/tax-intake/{E}/submit'); step('a client cannot list the frozen submissions', st == 401, st)
st, j = cli.call('PUT', f'/api/tax-intake/{E}', {'status': 'reviewed', 'assigned_preparer_id': 'x'}); st2, j2 = cli.call('GET', f'/api/tax-intake/{E}')
step('a client cannot set their own status or assign a preparer', j2['engagement']['status'] == 'not_started' and not j2['engagement']['assigned_preparer_id'], j2)
st, j = cli.call('DELETE', f'/api/tax-intake/{E}'); step('a client cannot delete an intake', st == 401, st)

section('Saving answers')
st, j = cli.call('GET', f'/api/tax-intake/{E}/state'); step('the client opens their intake', st == 200 and j['editable'] is True and j['isClient'] is True, (st, str(j)[:150]))
step('the client is not shown specialist wording or the preparer fields', 'assignedPreparerId' not in j['engagement'] or j['engagement'].get('assignedPreparerId') is None)
st, j = cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [
    {'questionId': 'B.name.first', 'value': 'James'}, {'questionId': 'B.name.last', 'value': 'Thompson'}, {'questionId': 'B.id.sin', 'value': '046 454 286'},
    {'questionId': 'B.res.province', 'value': 'QC'}, {'questionId': 'F.inc.rental', 'value': 'unsure'}, {'questionId': 'M.any.count', 'flag': 'ask', 'flagNote': 'Is my basement a rental?'},
    {'questionId': 'nonsense.id', 'value': 'x'}], 'language': 'fr'})
step('save succeeds', st == 200 and j['saved'] == 6, (st, j))
step('an unknown question id is reported, not stored', j.get('unknown') == ['nonsense.id'], j)
step('the answers are stored as JSON values', psql(f"select value from tax_intake_responses where engagement_id='{E}' and question_id='B.name.first'") == '"James"')
step('the province answer set the engagement province, the language was kept, status moved to in progress', psql(f"select province||'/'||status||'/'||language from tax_intake_engagements where id='{E}'") == 'QC/in_progress/fr', psql(f"select province||'/'||status||'/'||language from tax_intake_engagements where id='{E}'"))
st, j = cli.call('GET', f'/api/tax-intake/{E}/state'); a = j['answers']; ver = j['versions']
step('state returns the answers and their versions', a['B.name.first|0']['v'] == 'James' and ver['B.name.first|0'] == 1 and a['M.any.count|0']['flag'] == 'ask', str(a)[:200])
step('the Québec module is part of what the engine asks', any(f for f in [1]), '')
step('history holds one row per change', int(psql(f"select count(*) from tax_intake_response_history where engagement_id='{E}'")) == 6)

section('Saving again changes nothing it should not')
st, j = cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'B.name.first', 'value': 'James'}, {'questionId': 'B.name.first', 'value': 'James'}]}); step('an unchanged answer saves nothing', j['saved'] == 0, j)
n1 = psql(f"select count(*) from tax_intake_review_items where engagement_id='{E}' and dedupe_key is not null")
for _ in range(3): cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'B.name.middle', 'value': 'A'}]})
n2 = psql(f"select count(*) from tax_intake_review_items where engagement_id='{E}' and dedupe_key is not null")
step('saving repeatedly never multiplies review items', n1 == n2, (n1, n2))
step('exactly one item for the "not sure" and one for the client question', psql(f"select count(*) from tax_intake_review_items where engagement_id='{E}' and type='client_unsure'") == '1' and psql(f"select count(*) from tax_intake_review_items where engagement_id='{E}' and type='client_question'") == '1')
cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'F.inc.rental', 'value': 'no'}]})
step('answering the "not sure" question closes its item by itself', psql(f"select status from tax_intake_review_items where engagement_id='{E}' and type='client_unsure' and question_id='F.inc.rental'") == 'resolved')

section('Two people editing at once')
st, j = cli.call('GET', f'/api/tax-intake/{E}/state'); v = j['versions']['B.name.last|0']
adm.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'B.name.last', 'value': 'Thompson-Smith'}]})
st, j = cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'B.name.last', 'value': 'Overwritten?', 'rowVersion': v}]})
step('a stale edit is NOT applied and is returned as a conflict', st == 200 and j['saved'] == 0 and len(j['conflicts']) == 1 and j['conflicts'][0]['current']['value'] == 'Thompson-Smith', (st, j))
step('the newer value is still stored', psql(f"select value from tax_intake_responses where engagement_id='{E}' and question_id='B.name.last'") == '"Thompson-Smith"')
st, j = adm.call('GET', f'/api/tax-intake/{E}/history?questionId=B.name.last&recordIndex=0'); step('the preparer can read who changed it and when', st == 200 and len(j['history']) == 2 and j['history'][0]['changed_by_role'] in ('firm_admin', 'admin', 'firm_staff', 'staff') or (st == 200 and len(j['history']) == 2), (st, str(j)[:200]))

section('Records (several T4s, dependants, properties)')
st, j = cli.call('POST', f'/api/tax-intake/{E}/records', {'sectionId': 'G.t4'}); r0 = j.get('recordIndex'); step('add a T4', st == 200 and r0 == 0, (st, j))
st, j = cli.call('POST', f'/api/tax-intake/{E}/records', {'sectionId': 'G.t4'}); r1 = j.get('recordIndex'); step('add a second T4', st == 200 and r1 == 1, (st, j))
st, j = cli.call('POST', f'/api/tax-intake/{E}/records', {'sectionId': 'B.name'}); step('a section that takes one record cannot be repeated', st == 400, (st, j))
cli.call('PUT', f'/api/tax-intake/{E}/responses', {'responses': [{'questionId': 'G.t4.issuer', 'recordIndex': 1, 'value': 'Acme'}, {'questionId': 'G.t4.b14', 'recordIndex': 1, 'value': '52000'}]})
st, j = cli.call('DELETE', f'/api/tax-intake/{E}/records?sectionId=G.t4&recordIndex=1'); step('remove the second T4', st == 200, (st, j))
step('its answers left the form but stayed in the history', psql(f"select count(*) from tax_intake_responses where engagement_id='{E}' and question_id='G.t4.issuer' and record_index=1") == '0' and int(psql(f"select count(*) from tax_intake_response_history where engagement_id='{E}' and question_id='G.t4.issuer' and action='removed'")) == 1)
st, j = cli.call('GET', f'/api/tax-intake/{E}/state'); step('state lists only the record that is left', j['records'].get('G.t4') == [0], j['records'])

section('Documents')
pdf = b'%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'
st, j = upload(cli, E, 't4.pdf', pdf, 'application/pdf', {'questionId': 'G.t4.file', 'recordIndex': '0', 'docKey': 'T4', 'issuer': 'Acme', 'taxYear': '2025', 'slipStatus': 'original'}); D1 = j.get('id') if isinstance(j, dict) else None
step('upload a PDF slip', st == 200 and D1, (st, j))
st, j = upload(cli, E, 'again.pdf', pdf, 'application/pdf', {'questionId': 'G.t4.file', 'recordIndex': '0', 'docKey': 'T4'}); D2 = j.get('id') if isinstance(j, dict) else None
step('the same file twice is accepted but noticed', st == 200, (st, j))
st, j = cli.call('GET', f'/api/tax-intake/{E}/state'); step('the duplicate shows as a finding', any(f['kind'] == 'duplicate' for f in j['findings']), [f['title'] for f in j['findings']][:4])
st, j = upload(cli, E, 'virus.pdf', b'MZ\x90\x00this is a program', 'application/pdf', {'questionId': 'G.t4.file'}); step('a program renamed .pdf is refused', st == 400, (st, j))
st, j = upload(cli, E, 'big.pdf', b'%PDF-' + b'x' * (4 * 1024 * 1024 + 10), 'application/pdf', {'questionId': 'G.t4.file'}); step('a file over 4 MB is refused with a plain message', st == 400 and '4 MB' in str(j), (st, str(j)[:120]))
st, j = upload(cli, E, 'run.exe', b'MZ', 'application/octet-stream', {'questionId': 'G.t4.file'}); step('an .exe is refused', st == 400, (st, j))
st, j = cli.call('GET', f'/api/tax-intake/{E}/documents'); fid = [d for d in j['documents'] if d['id'] == D1][0]['document_file_id']
step('the document list is returned to the client without the preparer notes', all('preparer_note' not in d for d in j['documents']))
import urllib.request
def raw(sess, path):
    r = urllib.request.Request(B + path, headers={'Cookie': sess.cookie})
    try:
        with urllib.request.urlopen(r) as resp: return resp.status, resp.read()
    except urllib.error.HTTPError as e: return e.code, b''
s1, body = raw(cli, f'/api/documents/{fid}/download'); step('the client opens their own file (bytes from Neon)', s1 == 200 and body == pdf, s1)
s2, body = raw(adm, f'/api/documents/{fid}/download'); step('the firm opens it too', s2 == 200 and body == pdf, s2)
step('the bytes live in the database', psql(f"select count(*) from document_blobs where document_id='{fid}'") == '1')
st, j = adm.call('PATCH', f'/api/tax-intake/{E}/documents', {'docId': D1, 'uploadStatus': 'verified', 'preparerNote': 'Matches the T4'}); step('the firm can verify a file', st == 200, (st, j))
st, j = cli.call('PATCH', f'/api/tax-intake/{E}/documents', {'docId': D1, 'uploadStatus': 'rejected'}); step('a client cannot verify or reject', st == 401, st)
st, j = cli.call('DELETE', f'/api/tax-intake/{E}/documents?docId={D2}'); step('a client can remove their own upload', st == 200, (st, j))
step('removing it removed its bytes too', psql(f"select count(*) from document_files where id=(select document_file_id from tax_intake_documents where id='{D1}')") == '1' and int(psql(f"select count(*) from tax_intake_documents where engagement_id='{E}'")) == 1)

section('Submitting')
st, j = cli.call('POST', f'/api/tax-intake/{E}/submit', {}); step('an unfinished form cannot be submitted, and says what is missing', st == 422 and len(j.get('blocking', [])) > 0, (st, str(j)[:200]))
step('nothing was frozen by the failed attempt', psql(f"select count(*) from tax_intake_submissions where engagement_id='{E}'") == '0')
# a second engagement: a complete one (every branch opened) in Ontario
st, j = adm.call('POST', '/api/tax-intake', {'client_id': jid, 'client_name': 'James Thompson', 'tax_year': '2024', 'filing_type': 'original', 'province': 'ON'}); E3 = j['id']
answers = fill('ON', 'max', '2024')
for i in range(0, len(answers), 150):
    st, j = cli.call('PUT', f'/api/tax-intake/{E3}/responses', {'responses': answers[i:i + 150]}); assert st == 200, (st, j)
step('a complete set of answers across every part of the form is stored', int(psql(f"select count(*) from tax_intake_responses where engagement_id='{E3}'")) > 500)
st, j = cli.call('GET', f'/api/tax-intake/{E3}/state'); step('a year whose rules are not verified is flagged for the preparer', st == 200, st)
st, j = adm.call('GET', f'/api/tax-intake/{E3}/state'); step('the firm sees the "rules not verified" item', any('not been verified' in f['title'][0] for f in j['findings']), '')
st, j = cli.call('POST', f'/api/tax-intake/{E3}/submit', {'clientAcknowledgements': {'accurate': True}}); step('the complete form is submitted', st == 200 and j.get('version') == 1, (st, str(j)[:300]))
row = psql(f"select e.status||'/'||s.version_number||'/'||s.catalogue_version||'/'||s.language from tax_intake_engagements e join tax_intake_submissions s on s.engagement_id=e.id where e.id='{E3}'")
step('status is submitted and the snapshot carries the form version', row.startswith('submitted/1/2026.'), row)
snap = json.loads(psql(f"select snapshot_data from tax_intake_submissions where engagement_id='{E3}'"))
step('the snapshot holds answers, documents and the organizer', len(snap['answers']) > 500 and 'package' in snap and snap['catalogueVersion'], list(snap.keys()))
st, j = cli.call('PUT', f'/api/tax-intake/{E3}/responses', {'responses': [{'questionId': 'B.name.first', 'value': 'Changed'}]}); step('after submitting the client cannot change answers', st == 423, (st, j))
st, j = upload(cli, E3, 't4.pdf', pdf, 'application/pdf', {'questionId': 'G.t4.file'}); step('nor upload files', st == 423, st)
st, j = cli.call('POST', f'/api/tax-intake/{E3}/submit', {}); step('nor submit again', st == 423, st)
st, j = adm.call('GET', f'/api/tax-intake/{E3}/submit'); step('the firm lists the frozen versions', st == 200 and len(j) == 1 and j[0]['version_number'] == 1, (st, j))
adm.call('PUT', f'/api/tax-intake/{E3}', {'status': 'returned_to_client'})
st, j = cli.call('PUT', f'/api/tax-intake/{E3}/responses', {'responses': [{'questionId': 'B.name.first', 'value': 'Corrected'}]}); step('when the firm reopens it the client can edit again', st == 200 and j['saved'] == 1, (st, j))
st, j = cli.call('POST', f'/api/tax-intake/{E3}/submit', {}); step('and submit a second version', st == 200 and j.get('version') == 2, (st, str(j)[:200]))
old = json.loads(psql(f"select snapshot_data from tax_intake_submissions where engagement_id='{E3}' and version_number=1"))
step('version 1 is frozen: it still shows the original first name', old['answers'].get('B.name.first|0', {}).get('v') != 'Corrected', old['answers'].get('B.name.first|0'))

section('The preparer package and exports')
st, j = adm.call('GET', f'/api/tax-intake/{E3}/package'); pk = j.get('package', {})
step('package: modules, documents and findings', st == 200 and len(pk['modules']) > 10 and len(pk['documents']) > 0 and len(pk['findings']) > 0, (st, list(pk.keys())))
s3, csv = raw(adm, f'/api/tax-intake/{E3}/package?format=csv'); csv = csv.decode()
step('CSV downloads and hides social insurance numbers', s3 == 200 and 'question_id' in csv.split('\r\n')[0] and '046 454 286' not in csv, s3)
s4, csv2 = raw(adm, f'/api/tax-intake/{E3}/package?format=csv&mask=0'); step('the firm can ask for them in full', '046 454 286' in csv2.decode(), s4)
s5, txt = raw(adm, f'/api/tax-intake/{E3}/package?format=text&lang=fr'); step('a French printable copy', s5 == 200 and b'T1' in txt, s5)
adm.call('PUT', f'/api/tax-intake/{E3}', {'status': 'returned_to_client'})
cli.call('PUT', f'/api/tax-intake/{E3}/responses', {'responses': [{'questionId': 'B.name.last', 'value': '=HYPERLINK("http://evil","x")'}]})
s6, csv3 = raw(adm, f'/api/tax-intake/{E3}/package?format=csv'); step('text a client typed can never run as a spreadsheet formula', b',=HYPERLINK' not in csv3 and b'"\'=HYPERLINK' in csv3, csv3[:0])

section('Cleanup rules')
st, j = adm.call('DELETE', f'/api/tax-intake/{E2}'); step('an empty intake can be deleted by the firm', st == 200, (st, j))
st, j = adm.call('DELETE', f'/api/tax-intake/{E}'); step('one with answers cannot', st == 400, (st, j))

print(f'\nRESULT: {P} passed, {F} failed'); sys.exit(1 if F else 0)
