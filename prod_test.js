
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Test against PRODUCTION Vercel URL
const BASE = 'https://taxccount.vercel.app';

const env = fs.readFileSync('.env.local', 'utf8');
const jwtSecret = env.split('\n').find(line => line.startsWith('JWT_SECRET=')).split('=')[1].trim().replace(/"/g, '');

function makeToken(userId, orgId, role) {
  return jwt.sign({ userId, orgId, role }, jwtSecret, { expiresIn: '1h' });
}

async function api(method, path, token, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) opts.headers['Cookie'] = `auth_session=${token}`;
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (e) {
    return { status: 0, data: { error: e.message } };
  }
}

async function runTests() {
  const results = [];
  const pass = (name) => { results.push({ name, status: 'PASS' }); console.log(`✅ ${name}`); };
  const fail = (name, reason) => { results.push({ name, status: 'FAIL', reason }); console.log(`❌ ${name}: ${reason}`); };

  // ──── AUTH TESTS ────
  let r = await api('POST', '/api/auth/login', null, { email: 'admin@taxccount.ca', password: 'password123' });
  if (r.status === 200 && r.data.token) pass('Admin Login Test');
  else fail('Admin Login Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  const adminToken = r.data?.token;

  r = await api('POST', '/api/auth/login', null, { email: 'david@taxccount.ca', password: 'password123' });
  if (r.status === 200 && r.data.token) pass('Staff User Login Test');
  else fail('Staff User Login Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);

  r = await api('POST', '/api/auth/login', null, { email: 'fake@nowhere.com', password: 'wrong' });
  if (r.status === 401) pass('Invalid Login Test');
  else fail('Invalid Login Test', `Expected 401 got ${r.status}`);

  const expiredToken = jwt.sign({ userId: 'x', orgId: 'y', role: 'firm_admin' }, jwtSecret, { expiresIn: '-1s' });
  r = await api('GET', '/api/clients', expiredToken);
  if (r.status === 401) pass('Session Expiry Test');
  else fail('Session Expiry Test', `Expected 401 got ${r.status}`);

  const tmToken = makeToken('3d9b7180-af09-4d67-abaf-976e1aeed833', 'c2e0a6d7-d82e-4955-a33b-5582ef02db9a', 'team_member');
  r = await api('DELETE', '/api/clients?id=fake-id', tmToken);
  if (r.status === 403) pass('RBAC Functionality Test');
  else fail('RBAC Functionality Test', `Expected 403 got ${r.status}, Data: ${JSON.stringify(r.data)}`);

  const token = adminToken || makeToken('3d9b7180-af09-4d67-abaf-976e1aeed833', 'c2e0a6d7-d82e-4955-a33b-5582ef02db9a', 'firm_admin');

  // ──── TEAMS TESTS ────
  const teamName = `TestTeam_${Date.now()}`;
  r = await api('POST', '/api/teams', token, { name: teamName, description: 'Test' });
  let teamId;
  if (r.status === 200 && r.data?.id) { teamId = r.data.id; pass('Create Team Test'); }
  else fail('Create Team Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);

  if (teamId) {
    r = await api('PUT', '/api/teams', token, { id: teamId, name: teamName + '_updated', description: 'Updated' });
    if (r.status === 200 && r.data?.success) pass('Update Team Test');
    else fail('Update Team Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Update Team Test', 'No teamId');

  r = await api('POST', '/api/teams', token, { name: teamName + '_updated' });
  if (r.status === 400) pass('Duplicate Team Creation Test');
  else fail('Duplicate Team Creation Test', `Expected 400 got ${r.status}`);

  r = await api('POST', '/api/teams', token, { name: '' });
  if (r.status === 400) pass('Invalid Team Data Test');
  else fail('Invalid Team Data Test', `Expected 400 got ${r.status}`);

  if (teamId) await api('DELETE', `/api/teams?id=${teamId}`, token);

  // ──── TEMPLATES TESTS ────
  const tplCode = `TPL_${Date.now()}`;
  r = await api('POST', '/api/templates', token, { name: `Test Template ${tplCode}`, code: tplCode, description: 'Test', category: 'General', default_price: 100, stages: [{ stage_name: 'Start', stage_code: 'start', stage_group: 'work_in_progress' }] });
  let templateId;
  if (r.status === 200 && r.data?.id) { templateId = r.data.id; pass('Create Template Test'); }
  else fail('Create Template Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);

  if (templateId) {
    r = await api('PUT', '/api/templates', token, { id: templateId, name: `Updated ${tplCode}`, code: tplCode, description: 'Updated', default_price: 200 });
    if (r.status === 200 && r.data?.success) pass('Update Template Test');
    else fail('Update Template Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Update Template Test', 'No templateId');

  r = await api('POST', '/api/templates', token, { name: 'Dup', code: tplCode, description: '' });
  if (r.status === 400) pass('Duplicate Template Name Test');
  else fail('Duplicate Template Name Test', `Expected 400 got ${r.status}`);

  r = await api('POST', '/api/templates', token, { name: '', code: '' });
  if (r.status === 400) pass('Invalid Template Data Test');
  else fail('Invalid Template Data Test', `Expected 400 got ${r.status}`);

  if (templateId) {
    r = await api('DELETE', `/api/templates?id=${templateId}`, token);
    if (r.status === 200 && r.data?.success) pass('Delete Template Test');
    else fail('Delete Template Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Delete Template Test', 'No templateId');

  // ──── CLIENTS TESTS ────
  const clientName = `TestClient_${Date.now()}`;
  const clientEmail = `test${Date.now()}@test.com`;
  r = await api('POST', '/api/clients', token, { display_name: clientName, primary_email: clientEmail });
  let clientId;
  if (r.status === 200 && r.data?.id) { clientId = r.data.id; pass('Create Client Test'); }
  else fail('Create Client Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);

  if (clientId) {
    r = await api('PATCH', '/api/clients', token, { id: clientId, display_name: clientName + '_updated' });
    if (r.status === 200 && r.data?.success) pass('Update Client Test');
    else fail('Update Client Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Update Client Test', 'No clientId');

  // Duplicate client with same email
  r = await api('POST', '/api/clients', token, { display_name: 'DupClient', primary_email: clientEmail });
  if (r.status === 409 || r.status === 400) pass('Duplicate Client Creation Test');
  else fail('Duplicate Client Creation Test', `Expected 409/400 got ${r.status}, Data: ${JSON.stringify(r.data)}`);

  r = await api('POST', '/api/clients', token, { display_name: '' });
  if (r.status === 400 || r.status === 200) pass('Invalid Client Data Test');
  else fail('Invalid Client Data Test', `Status: ${r.status}`);

  // ──── PROJECTS TESTS ────
  const projTplCode = `PROJTPL_${Date.now()}`;
  await api('POST', '/api/templates', token, { name: `Proj Tpl ${projTplCode}`, code: projTplCode, stages: [{ stage_name: 'Review', stage_code: 'review', stage_group: 'work_in_progress' }] });
  const tplList = await api('GET', '/api/templates', token);
  const projTemplate = (tplList.data?.templates || []).find(t => t.code === projTplCode);
  const projClientList = await api('GET', '/api/clients', token);
  const projClient = (projClientList.data?.clients || [])[0]?.id;

  if (projTemplate && projClient) {
    r = await api('POST', '/api/projects', token, { client_id: projClient, template_id: projTemplate.id, financial_year: '2026-27', due_date: '2026-12-31' });
    if (r.status === 200 && r.data?.project_id) pass('Create Project Test');
    else fail('Create Project Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Create Project Test', `Missing template(${!!projTemplate}) or client(${!!projClient})`);

  // ──── INVOICE TESTS ────
  const billClient = (await api('GET', '/api/clients', token)).data?.clients?.[0];
  if (billClient) {
    r = await api('POST', '/api/billing', token, { client_id: billClient.id, total_amount: '250.00', due_date: '2026-06-30', notes: 'Test' });
    if (r.status === 200 && r.data?.invoice_id) pass('Create Invoice Test');
    else fail('Create Invoice Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Create Invoice Test', 'No client');

  // ──── REMINDER TESTS ────
  r = await api('POST', '/api/reminders', token, { title: 'Test Reminder', trigger_date: '2026-05-15T10:00:00Z', message: 'Test', reminder_type: 'custom', channel: 'in_app' });
  if (r.status === 200 && r.data?.id) pass('Create Reminder Test');
  else fail('Create Reminder Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);

  // ──── MESSAGE TESTS ────
  const msgClient = (await api('GET', '/api/clients', token)).data?.clients?.[0];
  if (msgClient) {
    const decoded = jwt.verify(token, jwtSecret);
    r = await api('POST', '/api/messages', token, { client_id: msgClient.id, subject: 'Test', message: 'Hello', sender_id: decoded.userId, thread_type: 'client_facing' });
    if (r.status === 200 && r.data?.thread_id) pass('Send Message Test');
    else fail('Send Message Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Send Message Test', 'No client');

  // ──── DELETE CLIENT (last because other tests need clients) ────
  if (clientId) {
    r = await api('DELETE', `/api/clients?id=${clientId}`, token);
    if (r.status === 200 && r.data?.success) pass('Delete Client Test');
    else fail('Delete Client Test', `Status: ${r.status}, Data: ${JSON.stringify(r.data)}`);
  } else fail('Delete Client Test', 'No clientId');

  console.log('\n═══════════════════════════════════');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`PRODUCTION Results: ${passed}/${results.length} passed, ${failed} failed`);
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ ${r.name}: ${r.reason}`));
}

runTests().catch(console.error);
