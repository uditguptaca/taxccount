// Call every GET endpoint with real ids as the right role; report 5xx and 4xx that look like data/SQL errors.
const { execFileSync } = require('child_process'); const fs = require('fs');
const B = process.env.BASE_URL || 'http://127.0.0.1:3100';
const q = (sql) => { try { return execFileSync('psql', ['-tA','-c',sql]).toString().trim().split('\n').filter(Boolean); } catch { return []; } };
const logins = { platform: 'platform@abidebylaw.com', admin: 'admin@taxccount.ca', staff: 'emily@taxccount.ca', client: 'james@email.com' };
(async () => {
  const cookies = {};
  for (const [r, email] of Object.entries(logins)) {
    const res = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'password123' }) });
    cookies[r] = (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
    if (!res.ok) console.log('login failed', r, res.status);
  }
  const pool = [].concat(
    q("select id from clients order by created_at limit 2"), q("select id from client_compliances order by created_at limit 2"),
    q("select id from compliance_templates limit 2"), q("select id from leads limit 1"), q("select id from users where id<>'system' order by created_at limit 3"),
    q("select id from teams limit 1"), q("select id from document_files limit 1"), q("select id from invoices limit 1"), q("select id from chat_threads limit 1"),
    q("select id from organizations limit 1"), q("select id from smart_forms limit 1"), q("select id from smart_form_assignments limit 1"),
    q("select id from personal_compliance_items limit 1"), q("select id from ledger_accounts limit 1"), q("select id from cs_corporations limit 1"), q("select id from pay_group limit 1"), q("select id from pay_run limit 1"),
    q("select id from inbox_items limit 1"), q("select id from reminders limit 1"), q("select id from checklist_library limit 1"), q("select id from engagement_doc_requirements limit 1"), ['x']);
  const cats = ['accounting', 'annual-return', 'payroll', 'bookkeeping'];
  const files = execFileSync('find', [require('path').join(process.cwd(), 'src/app/api'), '-name', 'route.ts']).toString().trim().split('\n').sort();
  const out = []; let n = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8'); if (!/export async function GET/.test(src)) continue;
    let p = f.replace(require('path').join(process.cwd(), 'src/app'), '').replace('/route.ts', '');
    const role = p.startsWith('/api/platform') ? 'platform' : p.startsWith('/api/staff') ? 'staff' : p.startsWith('/api/portal') ? 'client' : 'admin';
    if (p.startsWith('/api/auth') || p.startsWith('/api/cron') || p.includes('/webhook')) continue;
    const dyn = /\[/.test(p);
    const cands = dyn ? (p.includes('[category]') ? cats : pool) : [null];
    const results = [];
    for (const c of cands) {
      let u = p; if (dyn) u = u.replace(/\[\.\.\.[^\]]+\]/g, 'x').replace(/\[[^\]]+\]/g, c);
      try {
        const r = await fetch(B + u + (u.includes('?') ? '' : ''), { headers: { cookie: cookies[role] }, redirect: 'manual' });
        const body = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
        results.push({ u, s: r.status, body });
        if (r.status === 200 && dyn) break;
      } catch (e) { results.push({ u, s: 0, body: String(e.message) }); }
    }
    n++;
    const worst = results.filter((x) => x.s >= 500 || x.s === 0)[0];
    const best = results.find((x) => x.s === 200) || results[0];
    out.push({ route: p, role, status: worst ? worst.s : best.s, ok: !worst, sample: (worst || best).u, body: (worst || best).body });
  }
  fs.writeFileSync(process.env.OUT || (process.env.TMPDIR || '/tmp') + '/verify-sweep.json', JSON.stringify(out, null, 1));
  const bad = out.filter((x) => !x.ok);
  console.log(`swept ${n} GET routes; 5xx: ${bad.length}; 200: ${out.filter((x) => x.status === 200).length}; other: ${out.filter((x) => x.ok && x.status !== 200).length}`);
  for (const b of bad) console.log(` 5xx ${b.role} ${b.sample} -> ${b.body}`);
  process.exit(bad.length ? 1 : 0);
})();
