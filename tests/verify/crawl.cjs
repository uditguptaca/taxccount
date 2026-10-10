// Visit every page as the right role in a real browser; record failed API calls, console errors, crashes.
const { chromium } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100';
const OUT = process.env.OUT || (process.env.TMPDIR || '/tmp') + '/verify-crawl.json';
const q = (sql) => { try { return execFileSync('psql', ['-tA','-c',sql]).toString().trim().split('\n').filter(Boolean); } catch { return []; } };
const first = (sql) => q(sql)[0] || 'x';

(async () => {
  const roles = {
    platform: ['platform@abidebylaw.com'], admin: ['admin@taxccount.ca'], staff: ['emily@taxccount.ca'],
    client: ['james@email.com'], individual: ['james.personal@email.com'],
  };
  // ids for dynamic segments
  const ids = {
    client: first("select id from clients order by created_at limit 1"),
    lead: first("select id from leads limit 1"),
    project: first("select id from client_compliances order by created_at limit 1"),
    template: first("select id from compliance_templates limit 1"),
    form: first("select id from smart_forms limit 1"),
    assignment: first("select id from smart_form_assignments limit 1"),
    payrun: first("select id from pay_run limit 1"),
    pci: first("select id from personal_compliance_items limit 1"),
    organizer: first("select id from organizer_templates limit 1"),
  };
  const cats = q("select distinct lower(replace(code,'_','-')) from template_categories limit 5").concat(['accounting','annual-return','payroll','corporate-secretary']);
  fs.writeFileSync(OUT + '.ids.json', JSON.stringify({ ids, cats }, null, 1));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  const ctxs = {};
  for (const [role, [email]] of Object.entries(roles)) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const res = await ctx.request.post(B + '/api/auth/login', { data: { email, password: 'password123' } });
    const j = await res.json().catch(() => ({}));
    if (!res.ok()) { console.log('LOGIN FAILED', role, res.status(), JSON.stringify(j).slice(0, 100)); continue; }
    await ctx.addInitScript((u) => { try { localStorage.setItem('user', JSON.stringify(u)); } catch {} }, j.user);
    ctxs[role] = ctx;
    if (role === 'admin') {  // an intake engagement so the T1 pages have something to open
      const r = await ctx.request.post(B + '/api/tax-intake', { data: { client_id: ids.client, client_name: 'Crawl Client', taxpayer_name: 'Crawl Client', tax_year: '2025', filing_type: 'original', province: 'ON' } });
      ids.intake = (await r.json().catch(() => ({}))).id || 'x';
    }
  }
  // page list
  const files = execFileSync('find', [require('path').join(process.cwd(), 'src/app'), '-name', 'page.tsx']).toString().trim().split('\n').sort();
  const jobs = [];
  for (const f of files) {
    let p = f.replace(require('path').join(process.cwd(), 'src/app'), '').replace('/page.tsx', '').replace(/\/\([^)]*\)/g, '') || '/';
    const roleList = p.startsWith('/platform') ? ['platform'] : p.startsWith('/staff') ? ['staff'] : p.startsWith('/portal') ? ['client', 'individual'] : p.startsWith('/dashboard') || p.startsWith('/client') || p.startsWith('/admin') ? ['admin'] : [];
    const urls = [];
    const sub = (map) => { let u = p; for (const [k, v] of Object.entries(map)) u = u.replace(k, v); return u; };
    if (/\[\[\.\.\.slug\]\]/.test(p)) urls.push(p.replace('/[[...slug]]', ''));
    else if (p.includes('/services/[category]')) for (const c of cats) urls.push(p.replace('[category]', c));
    else if (/\/clients\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.client));
    else if (/\/leads\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.lead));
    else if (/\/projects\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.project));
    else if (/\/templates\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.template));
    else if (/smart-forms\/builder\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.form));
    else if (/smart-forms\/responses\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.assignment));
    else if (/smart-forms\/fill\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.assignment));
    else if (/tax-intake\/\[engagementId\]/.test(p)) urls.push(p.replace('[engagementId]', ids.intake));
    else if (/payRunId/.test(p)) urls.push(p.replace('[payRunId]', ids.payrun));
    else if (/compliance\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.pci));
    else if (/organizers\/\[id\]/.test(p)) urls.push(p.replace('[id]', ids.organizer));
    else if (p.includes('[')) urls.push(p.replace(/\[[^\]]+\]/g, 'x'));
    else urls.push(p);
    for (const u of urls) for (const r of roleList) jobs.push({ url: u, role: r });
  }
  console.log('jobs', jobs.length);
  const results = [];
  for (const [i, job] of jobs.entries()) {
    const ctx = ctxs[job.role]; if (!ctx) continue;
    const page = await ctx.newPage();
    const rec = { ...job, final: '', apiFail: [], consoleErr: [], pageErr: [], crashed: false };
    page.on('response', (r) => { const u = r.url(); if (u.includes('/api/') && r.status() >= 400 && ![401, 403].includes(r.status())) rec.apiFail.push(`${r.request().method()} ${u.replace(B, '')} -> ${r.status()}`); });
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) rec.consoleErr.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => rec.pageErr.push(String(e.message || e).slice(0, 200)));
    try {
      await page.goto(B + job.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
      rec.final = page.url().replace(B, '');
      const txt = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 600) : '');
      rec.crashed = /Application error|client-side exception|Internal Server Error|This page could not be found/i.test(txt);
      rec.text = txt.replace(/\s+/g, ' ').slice(0, 120);
    } catch (e) { rec.pageErr.push('NAV ' + String(e.message).slice(0, 120)); }
    await page.close();
    results.push(rec);
    if ((i + 1) % 20 === 0) console.log(`${i + 1}/${jobs.length}`);
  }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  await browser.close();
  const bad = results.filter((r) => r.apiFail.length || r.pageErr.length || r.crashed || r.consoleErr.length);
  console.log(`DONE pages=${results.length} with-problems=${bad.length}`);
  // pages opened with a placeholder id ('x') or as a user type they are not meant for answer 404 by design; a 5xx never does
  const server5xx = results.filter((r) => r.apiFail.some((a) => / -> 5\d\d$/.test(a)));
  server5xx.forEach((r) => console.log(`  5xx on ${r.role} ${r.url}: ${r.apiFail.filter((a) => / -> 5\d\d$/.test(a)).join('; ')}`));
  process.exit(server5xx.length ? 1 : 0);
})().catch((e) => { console.error('CRAWL FAILED', e); process.exit(1); });
