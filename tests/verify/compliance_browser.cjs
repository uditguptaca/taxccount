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
  await page.getByLabel('All departments').check();
  await page.getByRole('button', { name: 'Check my compliances' }).click();
}
/** Answer every question on every step. `want` maps a question id to the answer to give; everything else is "No" or the first choice. */
let sawTickList = 0;
async function answerAll(page, want = {}) {
  const seen = new Set();   // count each question once: a tick list whose No opens a follow-up comes round twice (phase 26)
  let asked = 0;
  for (let stepNo = 0; stepNo < 40; stepNo++) {
    const done = new Set();
    for (let round = 0; round < 40; round++) {
      const ids = await page.locator('[id^="cq-"]').evaluateAll((els) => els.map((e) => e.id.slice(3)));
      const id = ids.find((x) => !done.has(x)); if (!id) break;
      done.add(id); if (!seen.has(id)) { seen.add(id); asked++; }
      const ctl = page.locator(`[aria-labelledby="cq-${id}"]`).first(); const w = want[id];
      const tag = await ctl.evaluate((e) => e.tagName + '|' + (e.getAttribute('role') || '') + '|' + (e.getAttribute('type') || ''));
      if (tag.startsWith('BUTTON|checkbox')) { if (w === 'yes') await ctl.click(); }                     // a tick list: no tick is No
      else if (tag.startsWith('SELECT')) { if (w) await ctl.selectOption(w); else await ctl.selectOption({ index: 1 }); }
      else if (tag.includes('|date')) await ctl.fill(w || '2020-03-15');
      else if (tag.includes('radiogroup')) {
        // a yes/no question has Yes and No; a short choice now has "Not sure" too, so that alone no longer tells them apart
        const yn = (await ctl.getByRole('radio', { name: 'Yes', exact: true }).count()) && (await ctl.getByRole('radio', { name: 'No', exact: true }).count());
        if (yn) await ctl.getByRole('radio', { name: w === 'yes' ? 'Yes' : w === 'unsure' ? 'Not sure' : 'No', exact: true }).click();
        else if (w) await ctl.getByRole('radio', { name: w === 'unsure' ? 'Not sure' : w }).click(); else await ctl.getByRole('radio').first().click();
      } else if (await ctl.getByRole('checkbox').count()) {
        if (w) for (const one of [].concat(w)) await ctl.getByRole('checkbox', { name: one }).click();
        else await ctl.getByRole('checkbox').last().click();                      // the last option is "None of these"
      } else { await ctl.getByLabel('Month').selectOption(w ? w.slice(0, 2) : '12'); await ctl.getByLabel('Day').selectOption(w ? w.slice(3) : '31'); }
    }
    if (await page.locator('[data-ticklist]').count()) sawTickList++;
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

  console.log('\n## The public website: the compliance wallet, real figures, real examples, nothing invented');
  const heroText = await page.locator('.ab-top').innerText();
  step('the first screen says what it is: a compliance wallet, with the free check as its action', /compliance wallet/i.test(heroText) && (await page.locator('.ab-top a[href="#check"]').count()) >= 1 && (await page.locator('.ab-wallet .ab-pass').count()) === 5 && /Example wallet/.test(heroText), heroText.slice(0, 160));
  step('countries are not the subject of the first screen', !/Canada|United States|India|United Arab Emirates/.test(heroText));
  const box = await page.locator('#compliance-checker').boundingBox();
  const countrySel = await page.getByLabel('Country').boundingBox();
  step('the check runs the width of the page and is on the first screen', box && box.width > 1100 && countrySel && countrySel.y + countrySel.height < 900, box && `${Math.round(box.width)} wide, country choice at y ${Math.round(countrySel.y)}`);
  const frontCard = await page.locator('.ab-pass').last().innerText();   // the page draws the front card last; the cards then take turns
  step('statutory deadlines lead: corporation tax is the front card, income tax and GST are in the stack, each with whose it is', /Corporation tax return/.test(frontCard) && (await page.locator('.ab-pass', { hasText: 'Income tax return' }).count()) >= 1 && (await page.locator('.ab-pass', { hasText: 'GST / Sales tax return' }).count()) === 1 && (await page.locator('.ab-pass .ab-avatar-svg').count()) === 5, frontCard.slice(0, 80));
  step('the check shows its steps, and the next choice is marked', (await page.locator('.ab-rail li').count()) === 5 && (await page.locator('.ab-rail li[data-state="current"]').count()) === 1 && (await page.locator('.ab-field[data-hint]').count()) === 1);
  step('a moving strip of real deadlines and the three steps are on the page', (await page.locator('.ab-ticker-row').first().locator('li').count()) >= 8 && (await page.locator('#how .ab-how-step').count()) === 3);
  const fam = await page.locator('#family').innerText();
  step('one wallet for the family: you, spouse, kids, parents and the company, labelled as an example', ['You', 'Your spouse', 'Your kids', 'Your parents', 'Your company'].every((w) => fam.includes(w)) && /Example family/.test(fam));
  step('every relation has its own picture, and every country its flag', (await page.locator('#family .ab-avatar-svg').count()) === 5 && (await page.locator('#global .ab-country-flag svg').count()) === 4);
  step('several countries: one tile per country in the rules, with its count read from the rules, and a slot for more', (await page.locator('#global .ab-country:not(.is-more)').count()) === 4 && (await page.locator('#global .ab-country.is-more').count()) === 1 && /\d+ official deadlines/.test(await page.locator('#global').innerText()));
  const inRules = q("select count(*) from compliance_catalog where kind='compliance' and is_active=1");
  const shownTotal = await page.locator('.ab-count').getAttribute('data-total');
  step('the number of deadlines on the page is read from the rules, not typed in', shownTotal === String(inRules), `${inRules} in the rules; page says ${shownTotal}`);
  step('the things that go in the wallet are drawn: passport, insurance, tax and your own', (await page.locator('.ab-shelf .ab-thing').count()) === 9 && /Passport/.test(await page.locator('.ab-shelf').innerText()) && /Insurance/.test(await page.locator('.ab-shelf').innerText()));
  const yearItems = await page.locator('.ab-year-items > li').count();
  const yearText = await page.locator('#year').innerText();
  step('the year line is worked out from the rules, with the items added by hand, and says it is an example', yearItems >= 6 && (await page.locator('.ab-year-items > li.is-own').count()) === 4 && /Tax authority/.test(yearText) && /Example: a small company/.test(yearText), `${yearItems} items`);
  const pictures = (await page.locator('#year').innerText()) + (await page.locator('#wallet').innerText());   // the cost section quotes official pages word for word
  step('the pictures name no country, province or state', !/Canada|Ontario|United States|India|Emirates|Revenue Agency|IRS\b/.test(pictures), pictures.match(/Canada|Ontario|United States|India|Emirates|Revenue Agency|IRS\b/)?.[0]);
  const hazard = await page.locator('#risk .ab-hazard-n').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-total'))));
  step('the price of missing is counted from the rules: four figures, the first out of the total', hazard.length === 4 && hazard.every((n) => n > 0) && hazard[0] <= Number(shownTotal), hazard.join(','));
  step('the late-fee meter runs on a real rule, linked to its official page', (await page.locator('.ab-meter').count()) === 1 && (await page.locator('.ab-meter a[href^="https://"]').count()) === 1 && /for every day it is late/.test(await page.locator('.ab-meter').innerText()));
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  step('search engines get the title, the canonical address and the questions as structured data', /compliance wallet/i.test(await page.title()) && (await page.locator('link[rel=canonical]').count()) === 1 && ld.some((t) => t.includes('FAQPage')));
  const fear = await page.locator('#costs').innerText();
  step('the cost of a miss is real and severe: dissolved, licence cancelled, daily fines, prison, each quoting and linking its official page', (await page.locator('.ab-fear-card').count()) === 4 && (await page.locator('.ab-fear-card a[href^="https://"]').count()) === 4 && /dissolved/i.test(fear) && /licence/i.test(fear) && /per day|a day|each day/i.test(fear) && /prison/i.test(fear), fear.slice(0, 160));
  step('plans show who each is for, prices unchanged', (await page.locator('.ab-plan-pic').count()) === 3);
  const faqText = await page.locator('#questions').innerText();
  const faqHtml = await page.locator('#questions').innerHTML();
  step('the countries that have official rules are named only if live (in their own section and the questions)', ['Canada', 'United States', 'India', 'United Arab Emirates'].every((c) => faqHtml.includes(c)) && !/United Kingdom|Australia|Singapore|Germany/.test(await page.locator('.ab').innerText()), faqText.slice(0, 120));
  const whole = await page.locator('.ab').innerText();
  step('no invented customers, no user counts, no promise the product cannot keep', !/Sarah Mitchell|Robert Williams|Maria Rodriguez|thousands of|Zero Penalty|guarantee/i.test(whole) && /Reminders by email are not available yet/.test(await page.locator('#questions').innerHTML()));
  step('plans and prices are the owner\'s, unchanged', /\$9/.test(await page.locator('[data-plan="Individual"]').innerText()) && /\$19/.test(await page.locator('[data-plan="Family"]').innerText()) && /\$49/.test(await page.locator('[data-plan="Consultant"]').innerText()));
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
  step('on a phone nothing scrolls sideways and the check is still there', (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0 && await page.getByLabel('Country').isVisible());
  await page.setViewportSize({ width: 1360, height: 900 });
  for (const [path, must] of [['/features', /does not send reminders by email yet/], ['/compliance-guide', /Read on /]]) {
    const pg = await ctx.newPage(); const res = await pg.goto(B + path, { waitUntil: 'networkidle' }); const txt = await pg.locator('.ab').innerText();
    step(`${path} opens in the new site and says only what is true`, res.status() === 200 && must.test(txt) && !/Zero Penalty|ultimate compliance engine|certified professional/i.test(txt), txt.slice(0, 120));
    await pg.close();
  }
  await page.goto(B + '/', { waitUntil: 'networkidle' });
  await page.getByLabel('Country').selectOption({ label: 'United Arab Emirates' }); await page.getByLabel('State').selectOption({ label: 'Sharjah' });
  await page.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
  const sharjah = await page.getByLabel('Entity type').locator('option').allInnerTexts();
  await page.getByLabel('State').selectOption({ label: 'Dubai' }); await page.waitForTimeout(200);
  const dubai = await page.getByLabel('Entity type').locator('option').allInnerTexts();
  step('entity types follow the place: a DIFC company is offered in Dubai, not in Sharjah', dubai.includes('DIFC company') && !sharjah.includes('DIFC company'), sharjah.join(','));

  await page.getByLabel('Country').selectOption({ label: 'Canada' }); await page.getByLabel('State').selectOption({ label: 'Ontario' });
  await page.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
  await page.getByLabel('Entity type').selectOption({ label: 'Individual' }); await page.waitForTimeout(600);
  const deptNames = () => page.locator('[data-depts] label').allInnerTexts();
  const indDepts = await deptNames();
  await page.getByLabel('Entity type').selectOption({ label: 'Corporation' }); await page.waitForTimeout(300);
  const corpDepts = await deptNames();
  step('the Department list only offers what can apply: no corporate annual return for an individual (sales tax is offered: a person with a side business charges GST/HST)', indDepts.includes('Income tax') && !indDepts.includes('Corporate annual return') && corpDepts.includes('Corporate annual return') && corpDepts.length > indDepts.length, indDepts.join(' | '));

  console.log('\n## Visitor: tick several types of compliance, not one or all');
  const go = page.getByRole('button', { name: 'Check my compliances' });
  step('with nothing ticked the button waits and the page says what is missing', await go.isDisabled() && await page.locator('[data-need-dept]').isVisible());
  await page.getByLabel('Income tax', { exact: true }).check(); await page.getByLabel('Corporate annual return', { exact: true }).check();
  step('two ticks are counted and the button is ready', /2 of \d+ ticked/.test(await page.locator('[data-depts] legend').innerText()) && await go.click({ trial: true, timeout: 5000 }).then(() => true, () => false));
  await page.getByLabel('All departments').check();
  step('"All departments" ticks every box', (await page.locator('[data-depts] input:checked').count()) === corpDepts.length);
  await page.getByLabel('Privacy and anti-spam', { exact: true }).uncheck();
  step('unticking one box unticks "All departments" and keeps the rest', !(await page.getByLabel('All departments').isChecked()) && (await page.locator('[data-depts] input:checked').count()) === corpDepts.length - 2);
  await page.getByLabel('All departments').check(); await page.getByLabel('All departments').uncheck();
  step('unticking "All departments" clears every box', (await page.locator('[data-depts] input:checked').count()) === 0);
  await page.getByLabel('Income tax', { exact: true }).check(); await page.getByLabel('Corporate annual return', { exact: true }).check();
  await go.click(); await page.waitForSelector('[id^="cq-"]');
  const picked = await page.locator('[data-picked]').innerText();
  step('the summary line names the two ticked types', /Income tax/.test(picked) && /Corporate annual return/.test(picked) && !/All departments|Sales tax|Payroll/.test(picked), picked);
  const twoAsked = await answerAll(page, {});
  const twoText = await page.locator('#compliance-checker').innerText();
  step('only the questions for the ticked types were asked, and the result has nothing from the others', twoAsked > 3 && twoAsked < 30 && !/GST\/HST return|Payroll deductions remittance|T4 slips/i.test(twoText), `${twoAsked} asked`);
  await page.goto(B + '/'); await page.waitForSelector('select[aria-label="Country"]');

  console.log('\n## Visitor: only the questions for what was ticked');
  await page.getByLabel('Country').selectOption({ label: 'Canada' }); await page.getByLabel('State').selectOption({ label: 'Ontario' });
  await page.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
  await page.getByLabel('Entity type').selectOption({ label: 'Corporation' }); await page.waitForTimeout(400);
  await page.getByLabel(/^Sales tax/).check();
  await page.getByRole('button', { name: 'Check my compliances' }).click(); await page.waitForSelector('[id^="cq-"]');
  const salesShown = await page.locator('[id^="cq-"]').evaluateAll((els) => els.map((e) => e.id.slice(3)));
  const salesAsked = await answerAll(page, { ca_gst_reg: 'yes' });
  const salesText = await page.locator('#compliance-checker').innerText();
  step('ticking only sales tax asks about sales tax, not about the small business deduction or where it was incorporated', salesShown.includes('ca_gst_reg') && !salesShown.some((id) => ['ca_ccpc', 'ca_sbd', 'ca_federal', 'ca_pe', 'ca_foreign_prop'].includes(id)) && salesAsked <= 8 && /GST\/HST return/i.test(salesText), `${salesAsked} asked; first screen ${salesShown.join(' ')}`);
  await page.goto(B + '/'); await page.waitForSelector('select[aria-label="Country"]');

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
  step(`the questions stay manageable with every department chosen (${asked}, the extra ones as a tick list)`, asked >= 18 && asked <= 50, asked);   // 50 since 2026-11-12: a No on a tick list that opens a follow-up now asks it on the spot
  step('the duties outside tax are asked as a tick list, where no tick is a No', sawTickList >= 1, sawTickList);
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
  console.log('\n## A date or the rule itself on every row');
  step('no row says "No fixed date"', !/No fixed date/i.test(await page.locator('main, body').first().innerText()));
  const ruleRows = await page.locator('[data-rule]').count();
  step('a duty with no calendar date shows its rule in words', ruleRows > 0 && /Within 15 days after the change takes place/.test(await page.locator('[data-item="ca_x_on_change"] [data-rule]').innerText()), ruleRows);
  step('a one-time deadline counted from the incorporation date says when it fell due', /Was due \d+ \w+ \d{4}/.test(await page.locator('[data-item="ca_x_on_initial"] [data-passed]').innerText().catch(() => '')));
  const chg = page.locator('[data-item="ca_x_on_change"]');
  await chg.getByRole('button', { name: 'It happened on…' }).click();
  await chg.getByRole('textbox', { name: 'It happened on' }).fill('2026-11-12');
  await chg.getByRole('button', { name: 'Work out the date' }).click(); await page.waitForTimeout(1200);
  step('entering the day it happened works out the deadline and shows what it was counted from', q(`select substr(due_date,1,10) from personal_entity_compliance where tracker_compliance_id='ca_x_on_change' and tracker_profile_id in (select id from compliance_tracker_profiles where user_id='${uid}')`) === '2026-11-27' && /counted from 12 November 2026/.test(await page.locator('[data-item="ca_x_on_change"]').innerText()), await page.locator('[data-item="ca_x_on_change"]').innerText().catch(() => ''));
  console.log('\n## One page to run everything: time left, their own items, notes and papers');
  const ov = await page.locator('[data-overview]').innerText();
  step('the top of the page counts what is overdue, due in 7 and 30 days, and filed', /Overdue/.test(ov) && /Due in 7 days/.test(ov) && /Due in 30 days/.test(ov) && /Filed so far/.test(ov) && (await page.locator('[data-tile="Filed so far"]').innerText()).startsWith('1'), ov.slice(0, 200));
  step('"Next up" lists the soonest five with the time left', (await page.getByLabel('Next up').locator('li').count()) >= 3 && /(days|weeks|months) left|due today|due tomorrow|overdue/.test(await page.getByLabel('Next up').innerText()), (await page.getByLabel('Next up').innerText()).slice(0, 200));
  step('"Next up" says what it costs to be late, where the rule states a penalty', (await page.getByLabel('Next up').locator('[data-cost]').count()) >= 1 && /If missed:/.test(await page.getByLabel('Next up').innerText()));
  const cal = await page.evaluate(async () => { const a = document.querySelector('a[href="/api/compliance-tracker/calendar"]'); if (!a) return null; const r = await fetch(a.getAttribute('href')); return { type: r.headers.get('content-type'), text: await r.text() }; });
  step('"Add to my calendar" gives a calendar file of the due dates with reminders', !!cal && /text\/calendar/.test(cal.type) && (cal.text.match(/BEGIN:VEVENT/g) || []).length >= 6 && /TRIGGER:-P1D/.test(cal.text), cal && cal.type);
  step('every dated compliance shows how long is left', (await page.locator('[data-left]').count()) >= 5 && /left|overdue|today|tomorrow/.test(await page.locator('[data-left]').first().innerText()), await page.locator('[data-left]').count());
  await page.getByRole('button', { name: 'Add a compliance' }).click();
  const addBox = page.getByRole('dialog', { name: 'Add a compliance' });
  // whichever filing the list offers first: since the independent review it offers only what can apply to this
  // business here, and the T1135 the test used to add may already be in the list from the answers
  await addBox.locator('[data-option]').first().waitFor({ timeout: 10000 });
  const addId = await addBox.locator('[data-option]').first().getAttribute('data-option');
  await addBox.locator(`[data-option="${addId}"]`).getByRole('button', { name: 'Add' }).click();
  await page.locator(`[data-item="${addId}"]`).waitFor({ timeout: 10000 });
  step('a compliance can be added from the country list by hand', /added by you/.test(await page.locator(`[data-item="${addId}"]`).innerText()), (await page.locator(`[data-item="${addId}"]`).innerText()).slice(0, 160));
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
    } catch (err) { step(`${c}, ${s}, ${e}`, false, err.message.split('\n')[0] + ' | the page shows: ' + (await p.locator('#compliance-checker').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 600)); }
    await v.close();
  }

  console.log('\n## A phone');
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pp = await phone.newPage(); watch(pp, 'phone');
  await pp.goto(B + '/', { waitUntil: 'networkidle' }); await pick(pp, 'Canada', 'Ontario', 'Individual');
  await answerAll(pp, { ca_resident: 'yes', ca_employment: 'yes' });
  const wide = await pp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  step('the whole check works on a phone with no sideways scrolling', wide <= 2 && /Personal income tax return/.test(await pp.locator('[data-outcome]').innerText()), wide);

  // found by the live-site review: answer buttons ran off a 390px screen and could not be tapped
  {
    const v = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p = await v.newPage(); watch(p, 'phone-wrap');
    await p.goto(B + '/', { waitUntil: 'networkidle' });
    await p.getByLabel('Country').selectOption({ label: 'Canada' }); await p.getByLabel('State').selectOption({ label: 'Ontario' });
    await p.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
    await p.getByLabel('Entity type').selectOption({ label: 'Corporation' }); await p.waitForTimeout(800);
    await p.locator('[data-depts] label').filter({ hasText: 'Sales tax' }).first().click();
    await p.getByRole('button', { name: 'Check my compliances' }).click(); await p.waitForSelector('[id^="cq-"]');
    const ctl = p.locator('[aria-labelledby="cq-ca_gst_reg"]').first(); if (await ctl.count()) await ctl.getByRole('radio', { name: 'Yes', exact: true }).click();
    await p.waitForTimeout(300);
    const off = await p.evaluate(() => Array.from(document.querySelectorAll('#compliance-checker [role="radio"], #compliance-checker [role="checkbox"]')).filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1); }).map((b) => b.textContent.trim()));
    step('on a phone every answer button is on the screen (none runs off the edge)', off.length === 0, off.join(', '));
    // a refresh keeps the choices and answers of the tab
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const kept = await p.locator('[id^="cq-"]').count();
    step('a refresh keeps the place in the questions (the answers were lost before)', kept > 0, kept);
    await v.close();
  }
  // found by the live-site review: a selection that needs no questions showed an empty panel
  {
    const v = await browser.newContext({ viewport: { width: 1360, height: 900 } }); const p = await v.newPage(); watch(p, 'no-questions');
    await p.goto(B + '/', { waitUntil: 'networkidle' });
    await p.getByLabel('Country').selectOption({ label: 'India' }); await p.getByLabel('State').selectOption({ label: 'Delhi' });
    await p.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
    await p.getByLabel('Entity type').selectOption({ label: 'Limited liability partnership (LLP)' }); await p.waitForTimeout(800);
    await p.locator('[data-depts] label').filter({ hasText: 'Company and LLP filings' }).first().click();
    await p.getByRole('button', { name: 'Check my compliances' }).click();
    const got = await p.locator('[data-outcome]').waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
    step('an Indian LLP that ticks only its registry filings gets its result straight away (it got an empty panel)', got && /compliances? appl/.test(await p.locator('[data-outcome]').innerText()), got);
    // a type that holds nothing in this emirate is not offered
    await p.evaluate(() => sessionStorage.clear()); await p.goto(B + '/', { waitUntil: 'networkidle' });
    await p.getByLabel('Country').selectOption({ label: 'United Arab Emirates' }); await p.getByLabel('State').selectOption({ label: 'Sharjah' });
    await p.waitForFunction(() => document.querySelector('select[aria-label="Entity type"]').options.length > 1);
    await p.getByLabel('Entity type').selectOption({ label: 'Mainland LLC' }); await p.waitForTimeout(1200);
    const offered = await p.locator('[data-depts] label').allInnerTexts();
    step('a type that holds nothing in the chosen emirate is not offered (UAE sector permits outside Dubai)', offered.length > 2 && !offered.some((t) => /sector permits/i.test(t)), offered.join(' | '));
    await v.close();
  }

  step('no page errors and no server errors anywhere', errs.length === 0, errs.slice(0, 4).join(' | '));
  await browser.close();
  console.log(`\ncompliance_browser: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
