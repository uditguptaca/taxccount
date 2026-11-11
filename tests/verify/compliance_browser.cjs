// The free compliance checker in a real browser, as a visitor with no account: pick country, province,
// entity type and department on the homepage, answer the questions, see only three compliances, register,
// and find every compliance in the new account, where each can be marked as filed, re-dated and removed.
// Also: every country and entity type can be walked to a result, and a phone-sized screen works.
const { chromium } = require('@playwright/test'); const { execFileSync } = require('child_process');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100';
const q = (sql) => execFileSync('psql', ['-tA', '-c', sql]).toString().trim();
let pass = 0, fail = 0; const step = (n, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? '  PASS' : '  FAIL'} ${n}${ok ? '' : '  ' + String(info).slice(0, 260)}`); };
const errs = [];
const watch = (page, tag) => { page.on('pageerror', (e) => errs.push(`${tag} pageerror: ${e.message.slice(0, 160)}`)); page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) errs.push(`${tag} ${r.status()} ${r.url().replace(B, '')}`); }); };

/** Choose the four selectors and press the button. */
async function pick(page, country, state, entity) {
  await page.getByLabel('Country').selectOption({ label: country });
  await page.getByLabel('State').selectOption({ label: state });
  await page.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
  await page.getByLabel('Entity type').selectOption({ label: entity });
  await page.getByLabel('Department').selectOption('all');
  await page.getByRole('button', { name: 'Check my compliances' }).click();
}
/** Answer every question on every step. `want` maps a question id to the answer to give; everything else is "No" or the first choice. */
async function answerAll(page, want = {}) {
  let asked = 0;
  for (let stepNo = 0; stepNo < 40; stepNo++) {
    const done = new Set();
    for (let round = 0; round < 40; round++) {
      const ids = await page.locator('[id^="cq-"]').evaluateAll((els) => els.map((e) => e.id.slice(3)));
      const id = ids.find((x) => !done.has(x)); if (!id) break;
      done.add(id); asked++;
      const ctl = page.locator(`[aria-labelledby="cq-${id}"]`).first(); const w = want[id];
      const tag = await ctl.evaluate((e) => e.tagName + '|' + (e.getAttribute('role') || '') + '|' + (e.getAttribute('type') || ''));
      if (tag.startsWith('SELECT')) { if (w) await ctl.selectOption(w); else await ctl.selectOption({ index: 1 }); }
      else if (tag.includes('|date')) await ctl.fill(w || '2020-03-15');
      else if (tag.includes('radiogroup')) {
        const yn = await ctl.getByRole('radio', { name: 'Not sure' }).count();
        if (yn) await ctl.getByRole('radio', { name: w === 'yes' ? 'Yes' : w === 'unsure' ? 'Not sure' : 'No', exact: true }).click();
        else if (w) await ctl.getByRole('radio', { name: w }).click(); else await ctl.getByRole('radio').first().click();
      } else if (await ctl.getByRole('checkbox').count()) {
        if (w) for (const one of [].concat(w)) await ctl.getByRole('checkbox', { name: one }).click();
        else await ctl.getByRole('checkbox').last().click();                      // the last option is "None of these"
      } else { await ctl.getByLabel('Month').selectOption(w ? w.slice(0, 2) : '12'); await ctl.getByLabel('Day').selectOption(w ? w.slice(3) : '31'); }
    }
    const nextBtn = page.getByRole('button', { name: /^(Next|Show my compliances)/ });
    const last = /Show my/.test(await nextBtn.innerText());
    await nextBtn.click();
    if (last) break;
    await page.waitForTimeout(250);
  }
  await page.locator('[data-outcome]').waitFor({ timeout: 15000 });
  return asked;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const page = await ctx.newPage(); watch(page, 'visitor');

  console.log('\n## Visitor: the checker is the first thing on the homepage');
  await page.goto(B + '/', { waitUntil: 'networkidle' });
  step('the homepage opens with the checker', await page.getByLabel('Country').isVisible() && await page.getByRole('button', { name: 'Check my compliances' }).isVisible());
  const countries = await page.getByLabel('Country').locator('option').allInnerTexts();
  step('Canada, the United States, India and the UAE can be chosen', ['Canada', 'United States', 'India', 'United Arab Emirates'].every((c) => countries.includes(c)), countries.join(','));
  step('the button waits until all four are chosen', await page.getByRole('button', { name: 'Check my compliances' }).isDisabled());
  await page.getByLabel('Country').selectOption({ label: 'United Arab Emirates' }); await page.getByLabel('State').selectOption({ label: 'Sharjah' });
  await page.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
  const sharjah = await page.getByLabel('Entity type').locator('option').allInnerTexts();
  await page.getByLabel('State').selectOption({ label: 'Dubai' }); await page.waitForTimeout(200);
  const dubai = await page.getByLabel('Entity type').locator('option').allInnerTexts();
  step('entity types follow the place: a DIFC company is offered in Dubai, not in Sharjah', dubai.includes('DIFC company') && !sharjah.includes('DIFC company'), sharjah.join(','));

  console.log('\n## Visitor: an Ontario corporation');
  await pick(page, 'Canada', 'Ontario', 'Corporation');
  step('the questions open in steps', await page.getByText(/Step 1 of \d/).isVisible());
  await page.getByRole('button', { name: /^Next/ }).click();
  step('a step cannot be skipped: unanswered questions are pointed out', await page.getByText(/Please answer the \d+ highlighted/).isVisible());
  step('what was picked is one short line, with a way to change it', /Canada/.test(await page.locator('[data-picked]').innerText()) && /Ontario/.test(await page.locator('[data-picked]').innerText()) && await page.locator('[data-picked]').getByRole('button', { name: 'Change' }).isVisible() && (await page.getByLabel('Country').count()) === 0);
  const rowsNow = await page.locator('[data-cq]').count();
  step('every question has a small information point', (await page.locator('[data-cq] button[aria-label="About this question"]').count()) === rowsNow && rowsNow > 0, rowsNow);
  await page.locator('[data-cq="ca_ccpc"] button[aria-label="About this question"]').hover();
  const tip = await page.locator('[data-cq="ca_ccpc"] [role="dialog"]').innerText().catch(() => '');
  step('resting on it says what the question means, how to answer and what the answer decides', /How to answer:/.test(tip) && /Why we ask:.*filings? under/.test(tip) && tip.length > 150, tip.slice(0, 300));
  await page.mouse.move(5, 5);
  step('a screen never shows more than five questions', (await page.locator('[data-cq]').count()) <= 5 && (await page.locator('[data-cq]').count()) >= 2, await page.locator('[data-cq]').count());
  step('a follow-up question is not shown before the question that opens it is answered', (await page.locator('[data-cq="ca_sbd"]').count()) === 0);
  await page.locator('[aria-labelledby="cq-ca_ccpc"]').getByRole('radio', { name: 'Yes', exact: true }).click();
  step('it appears right under it once the answer is Yes', (await page.locator('[data-followup] [data-cq="ca_sbd"]').count()) === 1);
  await page.locator('[aria-labelledby="cq-ca_ccpc"]').getByRole('radio', { name: 'No', exact: true }).click();
  step('and goes away again when the answer is No', (await page.locator('[data-cq="ca_sbd"]').count()) === 0);
  await page.locator('[aria-labelledby="cq-ca_ccpc"]').getByRole('radio', { name: 'Yes', exact: true }).click();
  const blankBefore = await page.locator('[role="radiogroup"]:not(:has([aria-checked="true"]))').count();
  await page.getByRole('button', { name: 'No to the rest' }).click();
  step('"No to the rest" answers the remaining yes/no questions on the screen in one tap', blankBefore >= 1 && (await page.locator('[role="radiogroup"]:has(button:text-is("Not sure")):not(:has([aria-checked="true"]))').count()) === 0, blankBefore);
  const asked = await answerAll(page, { ca_ccpc: 'yes', ca_sbd: 'yes', ca_gst_reg: 'yes', ca_gst_freq: 'q', ca_employees: 'yes', ca_remit: 'r', ca_foreign_prop: 'yes', ca_dividends: 'yes', fye: '12-31', ca_inc_date: '2020-03-15' });
  step(`about twenty questions were asked (${asked})`, asked >= 18 && asked <= 30, asked);
  const totalText = await page.locator('[data-outcome] h3').first().innerText(); const total = Number(totalText.match(/\d+/)[0]);
  step(`the result counts every compliance that applies (${total})`, total >= 8, totalText);
  const cards = await page.locator('[data-outcome] [data-result]').count();
  step('only three compliances are shown in full', cards === 3, cards);
  const shown = await page.locator('[data-outcome]').innerText();
  step('the corporation income tax return leads, with its due date and official source', /Corporation income tax return/i.test(shown) && /30 June 2027/.test(shown) && /Canada Revenue Agency/i.test(shown), shown.slice(200, 900));
  step('each compliance carries its government source, the date it was last checked and a disclaimer', /Official government source: Canada Revenue Agency/.test(shown) && /Last checked: \d+ \w+ 20\d\d/.test(shown) && /not legal or tax advice/.test(shown), shown.slice(600, 1300));
  const locked = await page.getByLabel('Locked compliances').locator('li').count();
  step(`the rest are locked: counted, but their names are not readable (${locked})`, locked >= 5 && locked === Math.min(12, total - 3) && !/T4 slips and summary|Foreign income verification/.test(shown), locked);
  step('the visitor is invited to register for the rest', await page.getByRole('link', { name: /Create my free account/ }).isVisible());
  const api = await page.evaluate(async () => { const r = await fetch('/api/compliance-tracker'); return r.status; });
  step('nothing is saved and the account API is closed to a visitor', api === 401 && q("select count(*) from compliance_tracker_profiles") === '0', api);

  console.log('\n## Visitor registers: everything lands in the new account');
  await page.getByRole('link', { name: /Create my free account/ }).click(); await page.waitForURL(/\/signup/);
  await page.getByText(/will be waiting in your account/).waitFor({ timeout: 8000 }).catch(() => {});
  step('the sign-up page knows about the check', await page.getByText(/will be waiting in your account/).isVisible());
  const email = `owner${Date.now()}@example.com`;
  await page.getByPlaceholder('e.g. Maple Trading Inc.').fill('Maple Trading Inc.');
  const inputs = page.locator('form input.form-input');
  await page.locator('label:has-text("First Name") + input, label:has-text("First Name") ~ input').first().fill('Olivia');
  await page.locator('label:has-text("Last Name") + input, label:has-text("Last Name") ~ input').first().fill('Owner');
  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('Min 8 characters').fill('checker-pass-1');
  void inputs;
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/portal\/compliance-check/, { timeout: 20000 }).catch(() => {});
  await page.getByRole('heading', { name: 'My compliances' }).waitFor({ timeout: 15000 }).catch(() => {});
  step('after registering the person is taken to "My compliances"', /\/portal\/compliance-check/.test(page.url()) && await page.getByRole('heading', { name: 'My compliances' }).isVisible(), page.url());
  await page.getByText('Corporation income tax return').first().waitFor({ timeout: 15000 }).catch(() => {});
  const mine = await page.locator('main, body').first().innerText();
  step('the business is there under its own name', /Maple Trading Inc\./.test(mine));
  step('every compliance is now readable, including the ones that were locked', /Corporation income tax return/.test(mine) && /T4 slips and summary/.test(mine) && /Foreign income verification statement/.test(mine), mine.slice(0, 200));
  const uid = q(`select id from users where email='${email}'`);
  const saved = Number(q(`select count(*) from personal_entity_compliance c join compliance_tracker_profiles p on p.id=c.tracker_profile_id where p.user_id='${uid}'`));
  step(`all ${total} are stored against the new account, none against anyone else`, saved === total && q('select count(*) from compliance_tracker_profiles') === '1', saved);
  step('the account is a standard (individual) user, not a firm', q(`select role from users where id='${uid}'`) === 'individual', q(`select role from users where id='${uid}'`));

  console.log('\n## In the account: track, mark as filed, change a date');
  const t2 = () => q(`select substr(c.due_date,1,10)||'|'||c.status from personal_entity_compliance c where c.tracker_compliance_id='ca_t2' and c.tracker_profile_id in (select id from compliance_tracker_profiles where user_id='${uid}')`);
  step('the T2 return is due 30 June 2027', t2() === '2027-06-30|pending' || t2().startsWith('2027-06-30'), t2());
  const row = page.locator('li, tr, div').filter({ hasText: /^.{0,40}Corporation income tax return/ }).filter({ has: page.getByRole('button', { name: /Mark as filed/ }) }).last();
  await row.getByRole('button', { name: /Mark as filed/ }).click(); await page.waitForTimeout(1200);
  step('marking it as filed records it and moves it to next year', t2().startsWith('2028-06-30') && Number(q(`select count(*) from compliance_tracker_history where compliance_id='ca_t2'`)) === 1, t2());
  const row2 = page.locator('li, tr, div').filter({ hasText: /^.{0,40}T4 slips and summary/ }).filter({ has: page.getByRole('button', { name: 'Change the due date' }) }).last();
  await row2.getByRole('button', { name: 'Change the due date' }).click();
  await page.getByRole('textbox', { name: 'Due date' }).fill('2027-02-20');
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1200);
  step('the person can set their own date for a compliance', q(`select substr(due_date,1,10) from personal_entity_compliance where tracker_compliance_id='ca_t4' and tracker_profile_id in (select id from compliance_tracker_profiles where user_id='${uid}')`) === '2027-02-20');
  console.log('\n## One page to run everything: time left, their own items, notes and papers');
  const ov = await page.locator('[data-overview]').innerText();
  step('the top of the page counts what is overdue, due in 7 and 30 days, and filed', /Overdue/.test(ov) && /Due in 7 days/.test(ov) && /Due in 30 days/.test(ov) && /Filed so far/.test(ov) && (await page.locator('[data-tile="Filed so far"]').innerText()).startsWith('1'), ov.slice(0, 200));
  step('"Next up" lists the soonest five with the time left', (await page.getByLabel('Next up').locator('li').count()) >= 3 && /(days|weeks|months) left|due today|due tomorrow|overdue/.test(await page.getByLabel('Next up').innerText()), (await page.getByLabel('Next up').innerText()).slice(0, 200));
  step('every dated compliance shows how long is left', (await page.locator('[data-left]').count()) >= 5 && /left|overdue|today|tomorrow/.test(await page.locator('[data-left]').first().innerText()), await page.locator('[data-left]').count());
  await page.getByRole('button', { name: 'Add a compliance' }).click();
  const addBox = page.getByRole('dialog', { name: 'Add a compliance' });
  await addBox.getByLabel('Search the list').fill('T1135');
  await addBox.locator('[data-option="ca_t1135"]').getByRole('button', { name: 'Add' }).click();
  await page.locator('[data-item="ca_t1135"]').waitFor({ timeout: 10000 });
  step('a compliance can be added from the country list by hand', /added by you/.test(await page.locator('[data-item="ca_t1135"]').innerText()), (await page.locator('[data-item="ca_t1135"]').innerText()).slice(0, 160));
  await page.getByRole('button', { name: 'Add a compliance' }).click();
  await addBox.getByRole('tab', { name: 'Something of my own' }).click();
  const soon = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  await addBox.getByLabel('What is it?').fill('City business licence renewal'); await addBox.getByLabel('Due on').fill(soon); await addBox.getByLabel('Does it repeat?').selectOption('annual');
  await addBox.getByRole('button', { name: 'Add to my list' }).click();
  const ownRow = page.locator('[data-item^="custom:"]'); await ownRow.waitFor({ timeout: 10000 });
  step('and so can something of their own, which then counts down like the rest', /City business licence renewal/.test(await ownRow.innerText()) && /(9|10|11) days left/.test(await ownRow.innerText()) && /City business licence renewal/.test(await page.getByLabel('Next up').innerText()), (await ownRow.innerText()).slice(0, 160));
  await ownRow.locator('button[aria-expanded]').click();
  await ownRow.getByLabel('My note').fill('Renewed online, receipt kept'); await ownRow.getByRole('button', { name: 'Save note' }).click(); await page.getByText('Note saved.').waitFor({ timeout: 8000 });
  step('a note is saved with it', q(`select notes from personal_entity_compliance where tracker_compliance_id like 'custom:%' and user_id='${uid}'`) === 'Renewed online, receipt kept');
  await page.locator('[data-item^="custom:"]').getByLabel('Add a file').setInputFiles({ name: 'licence receipt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 receipt') });
  await page.getByText(/Saved licence receipt\.pdf/).waitFor({ timeout: 10000 });
  step('a paper is kept with it and can be downloaded', /licence receipt\.pdf/.test(await page.locator('[data-item^="custom:"]').getByLabel('Papers').innerText()) && q(`select count(*) from compliance_tracker_documents where user_id='${uid}'`) === '1' && (await page.locator('[data-item^="custom:"] a[href*="/api/compliance-tracker/documents?id="]').count()) === 1);
  const body = await page.evaluate(async () => { const a = document.querySelector('[data-item^="custom:"] a[href*="/documents?id="]'); const r = await fetch(a.getAttribute('href')); return { status: r.status, text: await r.text() }; });
  step('the download is the file that was added', body.status === 200 && body.text === '%PDF-1.4 receipt', body);
  await page.locator('[data-item^="custom:"]').getByRole('button', { name: 'Remove this one' }).click(); await page.waitForTimeout(1200);
  step('removing their own item takes it and its paper away', (await page.locator('[data-item^="custom:"]').count()) === 0 && q(`select count(*) from compliance_tracker_documents where user_id='${uid}'`) === '0');
  await page.goto(B + '/portal', { waitUntil: 'networkidle' });
  step('the rest of the account opens for the new user', !/login/.test(page.url()), page.url());

  console.log('\n## A second check from inside the account, and privacy between accounts');
  await page.goto(B + '/portal/compliance-check', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Check another person or business/ }).first().click();
  await pick(page, 'India', 'Maharashtra', 'Private limited company');
  await answerAll(page, { in_employees: 'yes', in_gst_reg: 'yes', in_gst_scheme: 'Regular, monthly returns' });
  await page.getByPlaceholder('My company').fill('Maple India Pvt Ltd');
  await page.getByRole('button', { name: /^Save all \d+ to my account/ }).click(); await page.waitForTimeout(2500);
  step('a second business in another country is saved beside the first', q(`select count(*) from compliance_tracker_profiles where user_id='${uid}'`) === '2' && /Maple India Pvt Ltd/.test(await page.locator('body').innerText()));
  // through a page, not the request helper: in a production build the session cookie is Secure, which a page on 127.0.0.1 sends and the helper does not
  const other = await browser.newContext(); const r = await other.request.post(B + '/api/auth/login', { data: { email: 'james@email.com', password: 'password123' } });
  const op = await other.newPage(); await op.goto(B + '/login', { waitUntil: 'domcontentloaded' });
  const theirs = await op.evaluate(async () => { const x = await fetch('/api/compliance-tracker'); return { status: x.status, body: await x.text() }; });
  step('another signed-in user sees none of it', r.ok() && theirs.status === 200 && !theirs.body.includes('Maple'), theirs.body.slice(0, 120));
  const pid = q(`select id from compliance_tracker_profiles where user_id='${uid}' limit 1`);
  const del = await op.evaluate(async (id) => (await fetch('/api/compliance-tracker?profileId=' + id, { method: 'DELETE' })).status, pid);
  step('and cannot remove it', del === 404 && q(`select count(*) from compliance_tracker_profiles where id='${pid}'`) === '1', del);

  console.log('\n## Every country can be walked to an answer');
  const walks = [['United States', 'Delaware', 'C corporation'], ['United States', 'Texas', 'Individual'], ['India', 'Delhi', 'Individual'], ['India', 'Karnataka', 'Limited liability partnership (LLP)'], ['United Arab Emirates', 'Dubai', 'Free zone company (FZE, FZCO, FZ-LLC)'], ['United Arab Emirates', 'Abu Dhabi', 'Individual'], ['Canada', 'Québec', 'Self-employed / sole proprietor'], ['Canada', 'British Columbia', 'Trust or estate']];
  for (const [c, s, e] of walks) {
    const v = await browser.newContext({ viewport: { width: 1360, height: 900 } }); const p = await v.newPage(); watch(p, `${c}/${e}`);
    try {
      await p.goto(B + '/', { waitUntil: 'networkidle' }); await pick(p, c, s, e);
      const yes = c === 'United States' ? { us_status: 'yes', us_income_over: 'yes', us_employees: 'yes' } : c === 'India' ? { in_resident: 'yes', in_income: 'yes', in_employees: 'yes' } : c === 'Canada' ? { ca_resident: 'yes', ca_trust_express: 'yes', ca_gst_reg: 'yes' } : { ae_employed: 'yes', ae_ct_reg: 'yes', ae_vat_reg: 'yes' };
      const n = await answerAll(p, yes); const txt = await p.locator('[data-outcome] h3').first().innerText();
      step(`${c}, ${s}, ${e}: ${n} questions, ${txt}`, /\d+ compliances? appl/.test(txt) && (await p.locator('[data-outcome] [data-result]').count()) <= 3);
    } catch (err) { step(`${c}, ${s}, ${e}`, false, err.message); }
    await v.close();
  }

  console.log('\n## A phone');
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pp = await phone.newPage(); watch(pp, 'phone');
  await pp.goto(B + '/', { waitUntil: 'networkidle' }); await pick(pp, 'Canada', 'Ontario', 'Individual');
  await answerAll(pp, { ca_resident: 'yes', ca_employment: 'yes' });
  const wide = await pp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  step('the whole check works on a phone with no sideways scrolling', wide <= 2 && /Personal income tax return/.test(await pp.locator('[data-outcome]').innerText()), wide);

  step('no page errors and no server errors anywhere', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
  console.log(`\ncompliance_browser: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
