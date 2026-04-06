/**
 * fix-routes-v3.js — Definitive route cleanup
 * 
 * For each route file, this script:
 * 1. Splits the file into function handler blocks
 * 2. In each handler, ensures exactly ONE complete auth block:
 *    - const session = getSessionContext();
 *    - if (!session || !session.orgId) return ... 401;
 *    - const { orgId, userId, role } = session;
 * 3. Removes all duplicates
 * 4. Special handling for platform/webhook/cron routes
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../src/app/api');

const findRoutes = (dir, list = []) => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) findRoutes(p, list);
    else if (f === 'route.ts') list.push(p);
  }
  return list;
};

// Lines that constitute the auth block
const SESSION_DECL = /^\s*const session = getSessionContext\(\);\s*$/;
const AUTH_CHECK = /^\s*if \(!session\s*\|\|\s*!session\.(orgId|isPlatformAdmin)\)\s*return\s+NextResponse\.json\(\s*\{\s*error:\s*['"]Unauthorized['"]\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*\);\s*$/;
const SESSION_DESTRUCTURE = /^\s*const \{[^}]*\}\s*=\s*session;\s*$/;

// Function declaration
const FUNC_DECL = /^export\s+async\s+function\s+(GET|POST|PATCH|DELETE|PUT)\s*\(/;

function processRoute(routePath) {
  const content = fs.readFileSync(routePath, 'utf-8');
  const rel = routePath.replace(/\\/g, '/').split('src/app/api/')[1];
  
  const isAuth = rel.startsWith('auth/');
  const isPlatform = rel.startsWith('platform/');
  const isWebhook = rel.includes('webhook');
  const isCron = rel.startsWith('cron/');
  const isScheduler = rel.startsWith('scheduler/');
  
  if (isAuth) return null; // Don't touch auth routes

  const lines = content.split('\n');
  const result = [];
  let currentMethod = null;
  let authBlockState = null; // null | 'need_check' | 'need_destructure' | 'done'
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect function handler start
    const funcMatch = line.match(FUNC_DECL);
    if (funcMatch) {
      currentMethod = funcMatch[1];
      authBlockState = null;
      result.push(line);
      continue;
    }

    // For webhook/cron/scheduler: remove all auth-related lines
    if (isWebhook || isCron || isScheduler) {
      if (SESSION_DECL.test(line) || AUTH_CHECK.test(line) || SESSION_DESTRUCTURE.test(line)) {
        modified = true;
        continue;
      }
      result.push(line);
      continue;
    }

    // For platform routes
    if (isPlatform) {
      if (SESSION_DECL.test(line)) {
        if (authBlockState === null) {
          // First session decl — keep it and inject platform auth block
          result.push(line);
          result.push(`    if (!session || !session.isPlatformAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`);
          authBlockState = 'done';
          modified = true;
        } else {
          modified = true; // skip duplicate
        }
        continue;
      }
      if (AUTH_CHECK.test(line) || SESSION_DESTRUCTURE.test(line)) {
        modified = true;
        continue; // Remove all auth checks and destructures from platform routes
      }
      result.push(line);
      continue;
    }

    // Normal tenant-scoped routes
    if (SESSION_DECL.test(line)) {
      if (authBlockState === null || authBlockState === undefined) {
        // First session decl in this function — keep it + inject full auth block
        result.push(line);
        result.push(`    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`);
        result.push(`    const { orgId, userId, role } = session;`);
        authBlockState = 'done';
      } else {
        // Duplicate — remove
        modified = true;
      }
      continue;
    }

    if (AUTH_CHECK.test(line)) {
      if (authBlockState === 'done') {
        modified = true; // already injected
        continue;
      }
      result.push(line);
      continue;
    }

    if (SESSION_DESTRUCTURE.test(line)) {
      if (authBlockState === 'done') {
        modified = true; // already injected
        continue;
      }
      result.push(line);
      continue;
    }

    result.push(line);
  }

  // Handle import
  let output = result.join('\n');
  
  // For webhook/cron/scheduler — remove import if no longer used
  if (isWebhook || isCron || isScheduler) {
    if (!output.includes('getSessionContext()')) {
      output = output.replace(/import \{ getSessionContext \} from ['"]@\/lib\/auth-context['"];?\n?/g, '');
    }
  }
  
  // For platform/tenant routes — ensure import exists
  if (!isWebhook && !isCron && !isScheduler) {
    if (output.includes('getSessionContext()') && !output.includes("import { getSessionContext }")) {
      // Add import after last import
      const importMatch = output.match(/^import .*$/gm);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        output = output.replace(lastImport, `${lastImport}\nimport { getSessionContext } from '@/lib/auth-context';`);
      }
    }
    // Remove duplicate imports 
    const importLine = "import { getSessionContext } from '@/lib/auth-context';";
    const escapedImport = importLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Also match variant with double quotes
    const importRegexStr = `import \\{ getSessionContext \\} from ['"]@/lib/auth-context['"];?`;
    const allImports = output.match(new RegExp(`^${importRegexStr}$`, 'gm'));
    if (allImports && allImports.length > 1) {
      let firstFound = false;
      output = output.replace(new RegExp(`^${importRegexStr}\\n?`, 'gm'), (match) => {
        if (!firstFound) { firstFound = true; return match; }
        modified = true;
        return '';
      });
    }
  }

  // Clean up excessive blank lines
  output = output.replace(/\n{3,}/g, '\n\n');

  if (output !== content) {
    return { path: routePath, rel, content: output };
  }
  return null;
}

const routes = findRoutes(API_DIR);
let fixedCount = 0;

for (const r of routes) {
  const result = processRoute(r);
  if (result) {
    fs.writeFileSync(result.path, result.content, 'utf-8');
    fixedCount++;
    console.log(`[FIXED] ${result.rel}`);
  }
}

console.log(`\n=== Fix v3 complete: ${fixedCount} files modified ===`);
