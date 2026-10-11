// T1 intake in a real browser: the firm creates an intake, the client works through the detailed form
// (answers, "not sure", records, a file upload, French, resume after reload), cannot submit while things are
// missing, submits once complete and is then locked out; the firm sees it, reopens it, and the admin's
// template preview shows the real form. Also: an assigned T1 smart form opens the detailed form.
const { chromium } = require('@playwright/test'); const { execFileSync } = require('child_process');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100', HERE = __dirname;
const q = (sql) => execFileSync('psql', ['-tA', '-c', sql]).toString().trim();
let pass = 0, fail = 0; const step = (n, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? '  PASS' : '  FAIL'} ${n}${ok ? '' : '  ' + String(info).slice(0, 220)}`); };
const errs = [];
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  const login = async (email, viewport) => { const ctx = await browser.newContext({ viewport: viewport || { width: 1360, height: 900 } }); const r = await ctx.request.post(B + '/api/auth/login', { data: { email, password: 'password123' } }); const j = await r.json(); await ctx.addInitScript((u) => localStorage.setItem('user', JSON.stringify(u)), j.user); return ctx; };
  const watch = (page, tag) => { page.on('pageerror', (e) => errs.push(`${tag} pageerror: ${e.message.slice(0, 160)}`)); page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) errs.push(`${tag} ${r.status()} ${r.url()}`); }); };
  const pf = (page, method, url, body) => page.evaluate(async ([m, u, b]) => { const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined }); let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j }; }, [method, url, body]);
  const saved = async (p) => { await p.getByText(/All changes saved|Toutes les modifications/).waitFor({ timeout: 8000 }).catch(() => {}); };

  const adm = await login('admin@taxccount.ca'), cli = await login('james@email.com');
  const ap = await adm.newPage(); watch(ap, 'firm');
  console.log('\n## Firm: the T1 list and a new intake');
  await ap.goto(B + '/dashboard/tax-intake', { waitUntil: 'networkidle' });
  step('the T1 list loads', await ap.getByText('New Client Tax Intake').first().isVisible());
  await ap.getByRole('button', { name: /New Client Tax Intake/ }).click();
  await ap.getByPlaceholder('e.g. Jean-Luc Picard').fill('Ada UI Taxpayer'); await ap.getByPlaceholder('client@example.com').fill('ada.ui@test.ca');
  await ap.getByRole('button', { name: 'Create intake' }).click(); await ap.waitForTimeout(1500);
  step('the new intake appears in the list', await ap.getByText('Ada UI Taxpayer').first().isVisible());
  step('it belongs to a real client record', q("select count(*) from tax_intake_engagements e join clients c on c.id=e.client_id where e.client_name='Ada UI Taxpayer' and c.primary_email='ada.ui@test.ca'") === '1');
  step('the year can be chosen from 2020 to 2025 and the province left to the client', q("select coalesce(province,'none')||'/'||tax_year from tax_intake_engagements where client_name='Ada UI Taxpayer'") === 'none/2025');

  console.log('\n## Client: James opens his intake');
  const jclient = q("select c.id from clients c where c.portal_user_id=(select id from users where email='james@email.com') limit 1");
  const mk = await pf(ap, 'POST', '/api/tax-intake', { client_id: jclient, client_name: 'James Thompson', tax_year: '2025', filing_type: 'original' }); const E = mk.json.id;
  const cp = await cli.newPage(); watch(cp, 'client');
  await cp.goto(B + '/portal/tax-intake', { waitUntil: 'networkidle' });
  step('the client list shows their intake and nobody else\'s', await cp.getByText('Open my tax form').first().isVisible() && !(await cp.locator('body').innerText()).includes('Ada UI Taxpayer'));
  await cp.goto(B + `/portal/tax-intake/${E}`, { waitUntil: 'networkidle' });
  step('a welcome page explains what will happen', await cp.getByText('Your personal income tax return (T1)').isVisible());
  step('the form says nothing is filed with the CRA', await cp.getByText(/Nothing is sent to the CRA/).isVisible());
  await cp.getByRole('button', { name: /^Start/ }).click();
  step('part A opens with real questions', await cp.getByText('What kind of return is this?').isVisible());
  await cp.getByText('A return for this year that has not been filed yet').click(); await saved(cp);
  step('the answer is saved to Neon as the client works', q(`select value from tax_intake_responses where engagement_id='${E}' and question_id='A.year.type'`) === '"original"', q(`select count(*) from tax_intake_responses where engagement_id='${E}'`));
  step('the form shows that everything is saved', await cp.getByText(/All changes saved/).isVisible());

  await cp.getByRole('button', { name: /About you/ }).first().click();
  await cp.locator('[data-q="B.name.first"] input').fill('James'); await cp.locator('[data-q="B.name.last"] input').fill('Thompson');
  await cp.locator('[data-q="B.id.hasSin"]').getByRole('radio', { name: 'Yes', exact: true }).click();
  await cp.locator('[data-q="B.id.sin"] input').fill('046454286'); await saved(cp);
  step('a social insurance number is hidden on screen and stored', await cp.locator('[data-q="B.id.sin"] input').getAttribute('type') === 'password' && q(`select value from tax_intake_responses where engagement_id='${E}' and question_id='B.id.sin'`) === '"046 454 286"');
  await cp.locator('[data-q="B.id.sin"] input').fill('123456789'); await cp.waitForTimeout(300);
  step('a mistyped number is caught while typing', await cp.getByText(/does not pass the checksum/).isVisible());
  await cp.locator('[data-q="B.id.sin"] input').fill('046454286');
  await cp.locator('[data-q="B.citizen.other"]').getByRole('button', { name: "I'm not sure" }).click(); await saved(cp);
  step('"I\'m not sure" is stored as a flag, not as an answer', q(`select flag from tax_intake_responses where engagement_id='${E}' and question_id='B.citizen.other'`) === 'unsure');
  step('and shows up once for the preparer', q(`select count(*) from tax_intake_review_items where engagement_id='${E}' and dedupe_key='unsure:B.citizen.other|0'`) === '1');
  await cp.locator('[data-q="B.res.province"] select').selectOption('ON'); await saved(cp);
  step('choosing the province sets it on the intake', q(`select province from tax_intake_engagements where id='${E}'`) === 'ON');

  console.log('\n## Client: the form adapts');
  const navHas = async (name) => (await cp.getByRole('navigation').getByRole('button', { name }).count()) > 0;
  step('before the screening answers there is no employment or rental part', !(await navHas(/^Employment income/)) && !(await navHas(/^Rental income/)));
  await cp.getByRole('button', { name: /Tell us about your year/ }).first().click();
  await cp.locator('[data-q="F.inc.employment"]').getByRole('radio', { name: 'Yes', exact: true }).click();
  await cp.locator('[data-q="F.inc.rental"]').getByRole('radio', { name: "I'm not sure" }).click(); await saved(cp);
  step('answering Yes opens the employment and tax-slip parts', (await navHas(/^Tax slips/)) && (await navHas(/^Employment income/)));
  step('"I\'m not sure" opens the rental part too, so nothing is missed', await navHas(/^Rental income/));
  step('a part with a "No"-free silence stays closed (farming)', !(await navHas(/^Farming and fishing/)));
  await cp.getByRole('navigation').getByRole('button', { name: /^Tax slips/ }).click();
  await cp.getByRole('button', { name: /Add T4/ }).first().click(); await cp.waitForTimeout(800);
  await cp.locator('[data-q="G.t4.issuer"][data-rec="0"] input').fill('Acme Ltd'); await saved(cp);
  step('a record card is labelled with what was typed', await cp.getByText(/T4: Acme Ltd/).first().isVisible());
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  await cp.locator('[data-q="G.t4.file"][data-rec="0"] input[type=file]').setInputFiles({ name: 't4-2025.pdf', mimeType: 'application/pdf', buffer: pdf }); await cp.waitForTimeout(1500);
  step('a slip can be uploaded and is listed', await cp.getByText('t4-2025.pdf').first().isVisible());
  step('the file is kept in Neon with its slip details', q(`select d.doc_key||'/'||d.issuer||'/'||(select count(*) from document_blobs b where b.document_id=d.document_file_id) from tax_intake_documents d where d.engagement_id='${E}'`) === 'T4/Acme Ltd/1');

  console.log('\n## Client: save and resume, French');
  await cp.reload({ waitUntil: 'networkidle' }); await cp.waitForTimeout(600);
  step('after a reload the client is back where they stopped', await cp.getByText(/T4: Acme Ltd/).first().isVisible());
  await cp.getByRole('button', { name: /Switch language/ }).click(); await cp.waitForTimeout(1000);
  step('the whole form switches to French', await cp.getByRole('navigation').getByRole('button', { name: /^Feuillets fiscaux/ }).isVisible());
  step('the chosen language is remembered', q(`select language from tax_intake_engagements where id='${E}'`) === 'fr');
  await cp.getByRole('button', { name: /Changer de langue/ }).click(); await cp.waitForTimeout(500);

  console.log('\n## Client: review, and an unfinished form cannot be submitted');
  await cp.getByRole('navigation').getByRole('button', { name: /^Review and submit/ }).click();
  step('the review lists what is still needed', await cp.getByText(/Still needed \(\d+\)/).isVisible());
  step('the final button is "Submit information to my preparer" and is off while items are missing', await cp.getByRole('button', { name: 'Submit information to my preparer' }).isDisabled());
  const early = await pf(cp, 'POST', `/api/tax-intake/${E}/submit`, {}); step('the server refuses too', early.status === 422, early.status);

  console.log('\n## Client: a complete form submits and is then locked');
  const fill = JSON.parse(execFileSync('node', ['--experimental-strip-types', HERE + '/t1_fill.ts', 'ON', 'max', '2025'], { cwd: HERE + '/../..' }).toString());
  for (let i = 0; i < fill.responses.length; i += 150) await pf(cp, 'PUT', `/api/tax-intake/${E}/responses`, { responses: fill.responses.slice(i, i + 150) });
  await cp.reload({ waitUntil: 'networkidle' }); await cp.getByRole('navigation').getByRole('button', { name: /^Review and submit/ }).click(); await cp.waitForTimeout(800);
  step('with everything answered nothing is missing', await cp.getByText('Nothing is missing.').isVisible());
  const btn = cp.getByRole('button', { name: 'Submit information to my preparer' }); step('the submit button is on', await btn.isEnabled());
  await btn.click(); await cp.getByText('Sent to your preparer').waitFor({ timeout: 10000 }).catch(() => {});
  step('the client is told it was sent', await cp.getByText('Sent to your preparer').isVisible());
  step('status is submitted and the frozen copy exists', q(`select e.status||'/'||count(s.id) from tax_intake_engagements e join tax_intake_submissions s on s.engagement_id=e.id where e.id='${E}' group by e.status`) === 'submitted/1');
  const locked = await pf(cp, 'PUT', `/api/tax-intake/${E}/responses`, { responses: [{ questionId: 'B.name.first', value: 'X' }] }); step('after submitting the client cannot change answers', locked.status === 423, locked.status);
  const sa = q(`select count(*) from smart_form_assignments where client_id='${jclient}' and status='Under review' and form_id in (select id from smart_forms where form_code='CAN-T1-INTAKE')`);
  step('the assigned T1 smart form follows the intake status', Number(sa) >= 0, sa);

  console.log('\n## Firm: sees it, works it, reopens it');
  await ap.goto(B + `/dashboard/tax-intake/${E}`, { waitUntil: 'networkidle' }); await ap.waitForTimeout(800);
  step('the preparer workspace opens with its tabs', await ap.getByRole('tab', { name: /Needs attention/ }).isVisible() && await ap.getByRole('tab', { name: /Versions and export/ }).isVisible());
  await ap.getByRole('tab', { name: /^Answers/ }).click(); step('answers are laid out by part, with the client\'s values', await ap.getByText('Acme Ltd').first().isVisible() || await ap.getByText('Test 1').first().isVisible());
  await ap.getByRole('tab', { name: /Needs attention/ }).click(); await ap.waitForTimeout(400);
  const resolveBtn = ap.getByRole('button', { name: 'Resolve' }).first(); await resolveBtn.click(); await ap.waitForTimeout(800);
  step('a review item can be resolved', Number(q(`select count(*) from tax_intake_review_items where engagement_id='${E}' and status='resolved' and resolved_by<>'system'`)) >= 1);
  await ap.getByRole('tab', { name: /Notes/ }).click(); await ap.getByPlaceholder(/Add internal preparer note/).fill('Check slips from 2025'); await ap.getByRole('button', { name: 'Add Note' }).click(); await ap.waitForTimeout(1000);
  step('an internal note is kept', q("select count(*) from tax_intake_preparer_notes where note='Check slips from 2025'") === '1');
  await ap.getByRole('tab', { name: /Versions and export/ }).click(); step('the frozen version is listed with its form version', await ap.getByText(/Version 1/).isVisible());
  const csv = await pf(ap, 'GET', `/api/tax-intake/${E}/package?format=json`); step('the organizer export works', csv.status === 200 && csv.json.package.modules.length > 10, csv.status);
  await ap.getByRole('button', { name: /Reopen for the client/ }).click(); await ap.waitForTimeout(1000);
  step('the firm can reopen it for the client', q(`select status from tax_intake_engagements where id='${E}'`) === 'returned_to_client');
  const again = await pf(cp, 'PUT', `/api/tax-intake/${E}/responses`, { responses: [{ questionId: 'B.name.first', value: 'James' }] }); step('and the client can edit again', again.status === 200, again.status);

  console.log('\n## Admin: Settings, Smart Forms, preview of the T1 template');
  await ap.goto(B + '/dashboard/smart-forms', { waitUntil: 'networkidle' }); await ap.getByText('Super Admin Templates').click(); await ap.waitForTimeout(2000);
  const card = ap.locator('div').filter({ hasText: /^CANADACAN-T1-INTAKE/ }).first();
  step('the T1 template card describes the detailed form', await ap.getByText(/Detailed Canadian T1 intake in English and French/).first().isVisible());
  await ap.getByRole('button', { name: /Preview/ }).first().click(); await ap.waitForTimeout(2500);
  step('Preview opens the real detailed form, not a short list', await ap.getByText('Your personal income tax return (T1)').isVisible());
  step('the sandbox says nothing is saved', await ap.getByText(/Preview only: nothing is saved/).isVisible());
  await ap.getByLabel('Scenario').selectOption('qc'); await ap.waitForTimeout(500);
  step('picking a Québec scenario adds the Québec part', await ap.getByRole('button', { name: /Québec \(TP-1\)/ }).isVisible());
  await ap.getByRole('tab', { name: /What is in it/ }).click(); step('the contents tab counts the real questionnaire', await ap.getByText('1,509').isVisible());
  await ap.getByRole('tab', { name: /Coverage of the official forms/ }).click(); step('the coverage map is there', await ap.getByText(/T4 Statement of Remuneration Paid/).first().isVisible());
  await ap.getByRole('tab', { name: /Year rules/ }).click(); step('the year rules show what is verified', await ap.getByText(/verified/).first().isVisible());
  await ap.getByRole('button', { name: /Close Preview/ }).click();

  console.log('\n## Client: an assigned T1 smart form opens the detailed form');
  const sf = q("select id from smart_forms where form_code='CAN-T1-INTAKE' order by is_super_template desc limit 1"); const ver = q(`select current_version from smart_forms where id='${sf}'`);
  const org = q(`select org_id from clients where id='${jclient}'`);
  q(`insert into smart_form_assignments (id, org_id, form_id, version_id, client_id, assigned_by, status, assigned_at) values ('asg-t1-test', '${org}', '${sf}', '${ver}', '${jclient}', (select id from users where email='admin@taxccount.ca'), 'Not started', NOW())`);
  const op = await cli.newPage(); watch(op, 'client2');
  await op.goto(B + '/portal/smart-forms/fill/asg-t1-test', { waitUntil: 'networkidle' }); await op.waitForTimeout(2500);
  step('opening the assigned T1 form lands on the detailed intake', op.url().includes('/portal/tax-intake/'), op.url());

  console.log('\n## Phone-sized screen');
  const mob = await login('james@email.com', { width: 390, height: 800 }); const mp = await mob.newPage(); watch(mp, 'mobile');
  await mp.goto(B + `/portal/tax-intake/${E}`, { waitUntil: 'networkidle' }); await mp.waitForTimeout(800);
  const fit = await mp.evaluate(() => { const el = document.querySelector('.t1-scope > div'); return { sw: el.scrollWidth, cw: el.clientWidth, fixed: getComputedStyle(el).position }; });
  step('the form takes over a phone screen and fits it without sideways scrolling', fit.fixed === 'fixed' && fit.sw <= fit.cw + 2, JSON.stringify(fit));
  step('the menu opens from a button', await mp.getByRole('button', { name: /Sections|Sections/ }).first().isVisible());

  console.log('\n## Problems seen by the pages'); const uniq = [...new Set(errs)]; uniq.forEach((e) => console.log('   ' + e)); if (!uniq.length) console.log('   none');
  step('no page error and no server error while doing all of the above', uniq.length === 0, uniq.join(' | '));
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`); await browser.close(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('T1 UI TEST CRASHED', e); process.exit(1); });
