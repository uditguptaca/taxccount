// Service Master in a real browser, as the platform administrator: every screen shows the real rules,
// a rule is changed with the form and the homepage checker follows, a deadline the government moved is
// recorded, a compliance and a question are added and removed, an unfinished form cannot be saved,
// the "Try it" screen works out the same answer a visitor gets, and a change is undone.
const { chromium } = require('@playwright/test');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100';
let pass = 0, fail = 0; const step = (n, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? '  PASS' : '  FAIL'} ${n}${ok ? '' : '  ' + String(info).slice(0, 300)}`); };
const errs = [];
const SM = B + '/platform/service-master';
const SEL = { country: 'CA', state: 'ON', entity: 'corporation', depts: ['income', 'sales', 'payroll', 'registry'] };
const ANS = { ca_ccpc: 'yes', ca_sbd: 'yes', ca_federal: 'no', ca_pe: ['none'], ca_foreign_prop: 'no', ca_foreign_aff: 'no', ca_nr_related: 'no', ca_nrtrust_c: 'no', ca_nrtrust_d: 'no', ca_corp_instal: 'no', ca_gst_reg: 'yes', ca_gst_freq: 'q', ca_sell_prov: ['none'],
  ca_employees: 'yes', ca_remit: 'r', ca_wsib_freq: 'q', ca_payroll_size: 'p1', ca_closing: 'no', ca_contractors: 'no', ca_construction: 'no', ca_dividends: 'no', ca_pay_nr: 'no', fye: '12-31', ca_inc_date: '2020-03-15', ca_x_private: 'yes', ca_x_trademark: 'no', ca_x_nr_services: 'no', ca_x_slips5: 'no' };

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const login = async (email) => { const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } }); const r = await ctx.request.post(B + '/api/auth/login', { data: { email, password: 'password123' } }); const j = await r.json(); await ctx.addInitScript((u) => localStorage.setItem('user', JSON.stringify(u)), j.user); return ctx; };
  const ctx = await login('platform@abidebylaw.com');
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) errs.push(`${r.status()} ${r.url()}`); });
  page.on('dialog', (d) => d.accept());
  const go = async (v) => { await page.goto(`${SM}${v ? '/' + v : ''}`, { waitUntil: 'networkidle' }); await page.getByRole('heading', { level: 1 }).waitFor(); await page.getByText('Loading…').waitFor({ state: 'detached', timeout: 30000 }).catch(() => {}); };
  const t2due = () => page.evaluate(async ([sel, answers]) => { const r = await fetch('/api/public/compliance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sel, answers }) }); const j = await r.json(); const x = (j.shown || []).find((s) => s.id === 'ca_t2'); return x ? x.next[0] : null; }, [SEL, ANS]);
  const dialog = page.getByRole('dialog');
  const saveAndClose = async () => { await dialog.getByRole('button', { name: 'Save', exact: true }).click(); await dialog.waitFor({ state: 'detached', timeout: 20000 }); };
  const row = (id) => page.locator(`[data-item="${id}"]`);

  console.log('\n## The overview has the real figures');
  await go('');
  const fig = async (k) => Number((await page.locator(`[data-figure="${k}"]`).innerText()).replace(/,/g, ''));
  step('sub-compliances, questions, entity types, departments and penalties are all counted (none at zero)', (await fig('sub-compliances')) >= 400 && (await fig('questions')) >= 180 && (await fig('entity-types')) >= 30 && (await fig('departments')) >= 16 && (await fig('penalties')) >= 150 && (await fig('countries')) >= 100, [await fig('sub-compliances'), await fig('questions'), await fig('penalties')]);
  step('the four countries are listed as live', (await page.locator('[data-country]').count()) === 4 && (await page.locator('[data-country]').filter({ hasText: 'live' }).count()) === 4);
  step('the page says how the homepage is linked to it', await page.getByText('How it is linked').isVisible() && await page.getByText('No changes yet').isVisible());

  console.log('\n## Every screen in the menu shows its content');
  for (const [v, title, min] of [['countries', 'Countries & States', 13], ['entity-types', 'Entity Types', 7], ['departments', 'Departments', 4], ['sub-compliances', 'Sub-Compliances', 100], ['questions', 'Questions', 50], ['penalties', 'Penalties', 50], ['sources', 'Official Sources', 40]]) {
    await go(v); const n = await page.locator('[data-item]').count();
    step(`${title}: ${n} rows for Canada`, (await page.getByRole('heading', { level: 1 }).innerText()) === title && n >= min, n);
  }
  await go('compliance-heads'); step('Compliance Heads: grouped under their departments', (await page.locator('[data-head]').count()) >= 10, await page.locator('[data-head]').count());
  await go('info-forms'); step('Info Forms: the year end and the date questions, with the due dates counted from each', await page.getByRole('heading', { name: 'When does its financial year end?' }).isVisible() && (await page.getByText('due dates counted from it').count()) >= 2);
  await go('wizard'); step('Wizard Builder: the guided jobs', await page.getByRole('heading', { name: 'Add a compliance' }).isVisible() && await page.getByRole('heading', { name: 'The government moved a deadline' }).isVisible());
  await go('sub-compliances');
  await page.getByRole('tab', { name: /United States/ }).click(); await row('us_1040').waitFor();
  step('switching country shows that country\'s rules', (await page.locator('[data-item]').count()) >= 190, await page.locator('[data-item]').count());
  await page.getByRole('tab', { name: /Canada/ }).click(); await row('ca_t2').waitFor();
  step('each compliance reads in plain words: who, when, penalty, source', /corporation or company/.test(await row('ca_t2').innerText()) && /6 months after the financial year ends/.test(await row('ca_t2').innerText()) && /checked/.test(await row('ca_t2').innerText()), (await row('ca_t2').innerText()).slice(0, 300));
  await page.getByLabel('Search').fill('T4 slips'); step('search narrows the list', (await page.locator('[data-item]').count()) <= 5 && await row('ca_t4').isVisible(), await page.locator('[data-item]').count());
  await page.getByLabel('Search').fill('');

  console.log('\n## Change a rule with the form');
  step('before: the homepage gives 30 June 2027 for the T2', (await t2due())?.date === '2027-06-30', await t2due());
  await row('ca_t2').getByRole('button', { name: 'Edit' }).click();
  step('the form opens with its five parts', (await dialog.getByRole('heading', { level: 3 }).allInnerTexts()).join('|') === 'What it is|Who it applies to|When it is due|If it is missed|Where it comes from');
  step('"who it applies to" is shown in words', /In words:.*corporation or company/.test(await dialog.innerText()));
  await dialog.getByLabel('Months after', { exact: true }).fill('5');
  step('the form shows the dates the new rule gives before saving', /5 months after the financial year ends/.test(await dialog.innerText()) && /31 May 2027/.test(await dialog.innerText()), (await dialog.innerText()).match(/Next dates[^\n]*/)?.[0]);
  await saveAndClose();
  step('the list shows the new rule, marked as changed by you', /5 months after the financial year ends/.test(await row('ca_t2').innerText()) && /changed by you/.test(await row('ca_t2').innerText()));
  step('and the homepage checker gives 31 May 2027', (await t2due())?.date === '2027-05-31', await t2due());

  console.log('\n## The government moves a deadline');
  await row('ca_t2').getByRole('button', { name: 'Edit' }).click();
  await dialog.getByRole('button', { name: 'Record a moved deadline' }).click();
  step('half a moved deadline cannot be saved', await dialog.getByRole('button', { name: 'Save', exact: true }).isDisabled() && /A moved deadline needs both dates/.test(await dialog.innerText()));
  await dialog.getByLabel('Usual date').fill('2027-05-31'); await dialog.getByLabel('New date').fill('2027-06-14'); await dialog.getByLabel('Note', { exact: true }).fill('Extended by the CRA (test)');
  await saveAndClose();
  const d = await t2due();
  step('the homepage gives the new date and says what the usual one was', d?.date === '2027-06-14' && d?.was === '2027-05-31', d);
  step('the list flags it', /deadline moved/.test(await row('ca_t2').innerText()));

  console.log('\n## Add a compliance, then remove it');
  await page.getByRole('button', { name: 'Add a sub-compliance' }).click();
  step('an empty form cannot be saved and says what is missing', await dialog.getByRole('button', { name: 'Save', exact: true }).isDisabled() && /Give it a name/.test(await dialog.innerText()));
  await dialog.getByLabel('Name', { exact: true }).fill('Browser test filing');
  await dialog.getByLabel(/^Compliance head/).fill('Test head');
  await dialog.getByLabel('Authority it is filed with').fill('Test authority');
  await dialog.getByLabel('What it is, in plain words').fill('A filing made by the browser test.');
  await dialog.getByLabel(/^Why it applies/).fill('It is a test.');
  await dialog.getByLabel(/^The due date in the official words/).fill('Six months after the year end.');
  await dialog.getByLabel(/^Penalty/).fill('A test penalty.');
  step('once filled in it can be saved', await dialog.getByRole('button', { name: 'Save', exact: true }).isEnabled(), (await dialog.innerText()).slice(-300));
  await saveAndClose();
  await row('ca_browser_test_filing').waitFor();
  step('it is in the list, marked as added by you', /added by you/.test(await row('ca_browser_test_filing').innerText()) && /Test head/.test(await row('ca_browser_test_filing').innerText()));
  await go('penalties'); step('its penalty is on the Penalties screen', /A test penalty/.test(await row('ca_browser_test_filing').innerText()));
  await go('sub-compliances');
  await row('ca_browser_test_filing').getByRole('button', { name: 'Edit' }).click();
  await dialog.getByRole('button', { name: 'Delete' }).click(); await dialog.waitFor({ state: 'detached' });
  step('and it can be deleted', (await row('ca_browser_test_filing').count()) === 0);

  console.log('\n## Questions');
  await go('questions');
  step('each question says what it is linked to', /Linked to: decides \d+ compliances?/.test(await row('ca_ccpc').innerText()) && /Asked when: it is a corporation or company/.test(await row('ca_ccpc').innerText()), (await row('ca_ccpc').innerText()).slice(0, 300));
  await page.getByRole('button', { name: 'Add a question', exact: true }).click();
  await dialog.getByLabel('Question, as the person reads it').fill('Is this a browser test question?');
  await saveAndClose();
  await row('ca_is_this_a_browser_test_question').waitFor();
  step('a new question is flagged until something depends on it', /Linked to nothing/.test(await row('ca_is_this_a_browser_test_question').innerText()));
  const asked = await page.evaluate(async () => (await (await fetch('/api/public/compliance?country=CA')).json()).pack.questions.some((q) => q.id === 'ca_is_this_a_browser_test_question'));
  step('and the homepage asks it', asked === true);
  await row('ca_is_this_a_browser_test_question').getByRole('button', { name: 'Edit' }).click();
  await dialog.getByRole('button', { name: 'Delete' }).click(); await dialog.waitFor({ state: 'detached' });
  step('it can be deleted again', (await row('ca_is_this_a_browser_test_question').count()) === 0);

  console.log('\n## Service Rules: try it');
  await go('rules');
  await page.getByLabel('Try: state').selectOption('ON'); await page.getByLabel('Try: entity type').selectOption('corporation');
  const total = async () => Number(await page.locator('[data-try-total]').getAttribute('data-try-total'));
  const before = await total();
  step('with nothing answered every possible compliance is listed as "may apply"', before >= 20 && (await page.locator('[data-try]').count()) >= 15, before);
  for (const id of await page.locator('[data-try]').evaluateAll((els) => els.map((e) => e.getAttribute('data-try')))) { const no = page.locator(`[data-try="${id}"]`).getByRole('checkbox', { name: 'No', exact: true }); if (await no.count()) await no.click(); }
  const after = await total();
  step('answering No narrows it down, the T2 stays', after < before && after >= 2 && (await page.locator('[data-try-result="ca_t2"]').count()) === 1, [before, after]);
  step('each result says why it applies', /Because it is a corporation or company/.test(await page.locator('[data-try-result="ca_t2"]').innerText()));

  console.log('\n## History, undo, restore');
  await go('');
  const hist = page.locator('section', { hasText: 'Latest changes' }).last();
  step('every change is listed with who made it', (await hist.getByRole('button', { name: 'Undo' }).count()) >= 6 && /Platform/.test(await hist.innerText()), await hist.getByRole('button', { name: 'Undo' }).count());
  await go('sub-compliances');
  await row('ca_t2').getByRole('button', { name: 'Edit' }).click();
  await dialog.getByRole('button', { name: 'Restore built-in' }).click(); await dialog.waitFor({ state: 'detached' });
  step('restoring the built-in T2 puts the rule back', /6 months after the financial year ends/.test(await row('ca_t2').innerText()) && !/changed by you|deadline moved/.test(await row('ca_t2').innerText()), (await row('ca_t2').innerText()).slice(0, 200));
  step('and the homepage is back on 30 June 2027', (await t2due())?.date === '2027-06-30', await t2due());

  console.log('\n## Nobody else gets in');
  const firm = await login('admin@taxccount.ca'); const fp = await firm.newPage();
  await fp.goto(SM, { waitUntil: 'networkidle' });
  step('a firm administrator is sent away from Service Master', !fp.url().includes('/platform'), fp.url());
  const st = await fp.evaluate(async () => (await fetch('/api/platform/service-master/catalog')).status);
  step('and its data is refused', st === 401 || st === 403, st);

  step('no page errors and no server errors along the way', errs.length === 0, errs.slice(0, 4).join(' | '));
  console.log(`\nservice_master_browser: ${pass} passed, ${fail} failed`);
  await browser.close(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
