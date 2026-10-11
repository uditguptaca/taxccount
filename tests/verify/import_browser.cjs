// The import page, driven in a real browser by a platform admin: paste the old address, check it,
// replace, watch it copy, read the report, sign out.
const { chromium } = require('@playwright/test'); const { execFileSync } = require('child_process');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100';
const NEW = process.env.PGDATABASE, OLD = NEW + '_oldui';
const sh = (cmd, args, input) => execFileSync(cmd, args, { input, encoding: 'utf8', env: process.env, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const q = (db, sql) => sh('psql', ['-tA', '-d', db, '-c', sql]);
let pass = 0, fail = 0; const step = (n, ok, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? '  PASS' : '  FAIL'} ${n}${ok ? '' : '  ' + String(info).slice(0, 200)}`); };
(async () => {
  sh('psql', ['-q', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${OLD}`]); sh('psql', ['-q', '-d', 'postgres', '-c', `CREATE DATABASE ${OLD}`]);
  sh('psql', ['-q', '-d', OLD], sh('pg_dump', ['--no-owner', '-d', NEW]));
  q(OLD, "update clients set display_name = display_name || ' (from old)' where id = (select id from clients order by id limit 1)");
  const oldUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || '5432'}/${OLD}?sslmode=disable`;

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const r = await ctx.request.post(B + '/api/auth/login', { data: { email: 'platform@abidebylaw.com', password: 'password123' } }); const j = await r.json();
  await ctx.addInitScript((u) => localStorage.setItem('user', JSON.stringify(u)), j.user);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));

  await page.goto(B + '/platform/import', { waitUntil: 'networkidle' });
  step('the page opens and says what it does', await page.getByText('Import from the old database').first().isVisible());
  step('the menu has an entry for it', await page.getByRole('link', { name: /Import data/ }).isVisible());
  await page.getByRole('button', { name: /Check the old database/ }).isDisabled().then((d) => step('the check button waits for an address', d));
  await page.locator('input[type=password]').fill('postgresql://nobody:wrong@127.0.0.1:1/none?sslmode=disable');
  await page.getByRole('button', { name: /Check the old database/ }).click();
  await page.getByText(/could not be reached|ECONNREFUSED|refused/i).first().waitFor({ timeout: 30000 }).then(() => step('a wrong address shows a plain message', true)).catch(async () => step('a wrong address shows a plain message', false, await page.innerText('body')));
  await page.locator('input[type=password]').fill(oldUrl);
  await page.getByRole('button', { name: /Check the old database/ }).click();
  await page.getByText(/The old database holds/).waitFor({ timeout: 60000 });
  step('checking shows how much the old database holds', true);
  step('Replace is the default choice', await page.getByRole('radio').first().isChecked());
  const start = page.getByRole('button', { name: 'Start copying' });
  step('Start stays disabled until REPLACE is typed', await start.isDisabled());
  await page.getByText('To confirm, type REPLACE').locator('..').locator('input').fill('replace');
  step('lower case does not count', await start.isDisabled());
  await page.getByText('To confirm, type REPLACE').locator('..').locator('input').fill('REPLACE');
  await start.click();
  await page.getByText('Everything was copied and checked').waitFor({ timeout: 240000 }).then(() => step('it copies and reports that everything was checked', true)).catch(async () => step('it copies and reports that everything was checked', false, (await page.innerText('body')).slice(-400)));
  step('the new database holds what the old one held', q(NEW, 'select count(*) from clients') === q(OLD, 'select count(*) from clients') && q(NEW, "select count(*) from clients where display_name like '% (from old)'") === '1', q(NEW, 'select count(*) from clients'));
  step('the address was never saved in the browser', !(await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage))).includes(OLD));
  await page.getByRole('button', { name: /Sign out and sign in again/ }).click();
  await page.waitForURL(/\/login/, { timeout: 30000 }).then(() => step('it signs the admin out so the imported accounts take over', true)).catch(() => step('it signs the admin out', false, page.url()));
  step('no script errors on the page', errs.length === 0, errs.join(' | '));
  await browser.close(); sh('psql', ['-q', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${OLD}`]);
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
