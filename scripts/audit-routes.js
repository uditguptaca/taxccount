const fs = require('fs');
const path = require('path');

const findRoutes = (dir, list = []) => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) findRoutes(p, list);
    else if (f === 'route.ts') list.push(p);
  }
  return list;
};

const routes = findRoutes(path.join(__dirname, '../src/app/api'));
const issues = [];

for (const r of routes) {
  const c = fs.readFileSync(r, 'utf-8');
  const rel = r.replace(/\\/g, '/').split('src/app/api/')[1];

  const hasSessionImport = c.includes('getSessionContext');
  const hasOrgIdCheck = c.includes('!session.orgId');
  const isPlatform = rel.startsWith('platform/');
  const isAuth = rel.startsWith('auth/');
  const isWebhook = rel.includes('webhook');
  const isCron = rel.startsWith('cron/');

  // Platform routes should check isPlatformAdmin, not orgId
  if (isPlatform && hasOrgIdCheck) {
    issues.push({ file: rel, issue: 'PLATFORM route wrongly checks orgId' });
  }

  // Webhooks should not require auth
  if (isWebhook && hasSessionImport) {
    issues.push({ file: rel, issue: 'WEBHOOK should not require auth' });
  }

  // Cron routes should not require auth
  if (isCron && hasSessionImport) {
    issues.push({ file: rel, issue: 'CRON should not require auth' });
  }

  // Duplicate session declarations (bulk injector artifact)
  const dups = c.match(/const session = getSessionContext\(\);/g);
  if (dups && dups.length > 1) {
    issues.push({ file: rel, issue: `DUPLICATE session declarations (${dups.length}x)` });
  }

  // Duplicate orgId destructure
  const dupOrgId = c.match(/const \{ orgId/g);
  if (dupOrgId && dupOrgId.length > 1) {
    issues.push({ file: rel, issue: `DUPLICATE orgId destructure (${dupOrgId.length}x)` });
  }

  // Check for doubled auth blocks (the bulk injector may have run twice)
  const authBlocks = c.match(/if \(!session \|\| !session\.orgId\)/g);
  if (authBlocks && authBlocks.length > 1) {
    issues.push({ file: rel, issue: `DUPLICATE auth check blocks (${authBlocks.length}x)` });
  }

  // Check if orgId is used in SQL but not passed as parameter
  const sqlWithOrgId = c.match(/org_id = \?/g);
  const orgIdParams = c.match(/orgId/g);
  if (sqlWithOrgId && (!orgIdParams || orgIdParams.length < sqlWithOrgId.length)) {
    issues.push({ file: rel, issue: `SQL org_id=? placeholders (${sqlWithOrgId.length}) may exceed orgId params` });
  }
}

console.log('\n=== ROUTE AUDIT RESULTS ===\n');
for (const i of issues) {
  console.log(`[${i.issue}] ${i.file}`);
}
console.log(`\nTotal issues found: ${issues.length}`);
