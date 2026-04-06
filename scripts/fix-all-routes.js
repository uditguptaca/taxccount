/**
 * fix-all-routes.js — Comprehensive route cleanup script
 * 
 * Fixes:
 * 1. Removes duplicate session/auth blocks injected by bulk scripts
 * 2. Fixes platform routes (check isPlatformAdmin, not orgId)
 * 3. Removes auth from webhook/cron routes
 * 4. Ensures every handler function has exactly ONE auth block at the top
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

const routes = findRoutes(API_DIR);
let fixedCount = 0;

for (const routePath of routes) {
  let content = fs.readFileSync(routePath, 'utf-8');
  const rel = routePath.replace(/\\/g, '/').split('src/app/api/')[1];
  const original = content;

  const isPlatform = rel.startsWith('platform/');
  const isAuth = rel.startsWith('auth/');
  const isWebhook = rel.includes('webhook');
  const isCron = rel.startsWith('cron/');
  const isScheduler = rel.startsWith('scheduler/');

  // =============================================
  // STEP A: Remove auth from webhook/cron/scheduler routes
  // =============================================
  if (isWebhook || isCron || isScheduler) {
    // Remove the import
    content = content.replace(/import { getSessionContext } from ['"]@\/lib\/auth-context['"];?\n?/g, '');
    // Remove all session blocks in each function
    content = content.replace(/\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*const \{ orgId(?:, userId, role)? \} = session;\s*\n?/g, '\n');
    content = content.replace(/\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*const \{ orgId \} = session;\s*\n?/g, '\n');
    // Clean any leftover references
    content = content.replace(/\s*const session = getSessionContext\(\);\n/g, '\n');

    if (content !== original) {
      fs.writeFileSync(routePath, content, 'utf-8');
      fixedCount++;
      console.log(`[FIXED: removed auth] ${rel}`);
    }
    continue;
  }

  // Skip auth routes — they handle their own auth
  if (isAuth) continue;

  // =============================================
  // STEP B: Fix platform routes — use isPlatformAdmin check
  // =============================================
  if (isPlatform) {
    // Remove all duplicate session/auth blocks
    // First, remove ALL session blocks
    content = content.replace(/\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*const \{ orgId(?:, userId, role)? \} = session;\s*\n?/g, '\n');
    
    // Ensure import exists
    if (!content.includes("import { getSessionContext }")) {
      const lastImportMatch = content.match(/^import .*$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        content = content.replace(lastImport, `${lastImport}\nimport { getSessionContext } from '@/lib/auth-context';`);
      }
    }

    // Add platform admin auth check after each function opener (GET, POST, etc.)
    const methods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];
    for (const method of methods) {
      const funcRegex = new RegExp(
        `(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{\\s*\\n\\s*try\\s*\\{)`,
        'g'
      );
      if (funcRegex.test(content)) {
        // Only add if not already present
        if (!content.includes('isPlatformAdmin')) {
          content = content.replace(funcRegex, (match) => {
            return `${match}\n    const session = getSessionContext();\n    if (!session || !session.isPlatformAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`;
          });
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(routePath, content, 'utf-8');
      fixedCount++;
      console.log(`[FIXED: platform auth] ${rel}`);
    }
    continue;
  }

  // =============================================
  // STEP C: Fix tenant-scoped routes — remove duplicate auth blocks
  // =============================================
  
  // Strategy: For each exported handler function (GET, POST, PATCH, DELETE, PUT),
  // we need exactly ONE auth block right after the try { opener.
  // The bulk injector may have added 2-4 duplicate blocks.
  
  // First, count how many duplicate blocks exist
  const sessionDeclCount = (content.match(/const session = getSessionContext\(\);/g) || []).length;
  
  if (sessionDeclCount <= 1) {
    // No duplicates, skip
    continue;
  }

  // We need to rebuild the file properly.
  // Approach: Remove ALL injected auth blocks, then re-inject exactly one per handler.
  
  // Remove ALL injected auth blocks (the 3-line pattern)
  let cleaned = content;
  
  // Pattern 1: with orgId, userId, role destructure
  cleaned = cleaned.replace(
    /\n?\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*const \{ orgId, userId, role \} = session;\s*\n?/g,
    '\n'
  );
  
  // Pattern 2: with just orgId destructure
  cleaned = cleaned.replace(
    /\n?\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*const \{ orgId \} = session;\s*\n?/g,
    '\n'
  );

  // Pattern 3: standalone session without destructure that was already part of original code 
  // (be careful not to remove pre-existing ones that are correctly used)
  // Only remove if it's followed by the auth check
  cleaned = cleaned.replace(
    /\n?\s*const session = getSessionContext\(\);\s*\n\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n?/g,
    '\n'
  );

  // Now re-inject exactly one auth block per handler function
  const methods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];
  for (const method of methods) {
    // Match function opener: export async function METHOD(...) { try {
    const funcWithTry = new RegExp(
      `(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{\\s*\\n\\s*try\\s*\\{)`,
      'g'
    );
    // Match function opener without try: export async function METHOD(...) {
    const funcWithoutTry = new RegExp(
      `(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{)`,
      'g'
    );

    const AUTH_BLOCK = `\n    const session = getSessionContext();\n    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n    const { orgId, userId, role } = session;\n`;

    if (funcWithTry.test(cleaned)) {
      funcWithTry.lastIndex = 0;  // Reset regex
      cleaned = cleaned.replace(funcWithTry, (match) => {
        return `${match}${AUTH_BLOCK}`;
      });
    } else if (funcWithoutTry.test(cleaned)) {
      funcWithoutTry.lastIndex = 0;
      cleaned = cleaned.replace(funcWithoutTry, (match) => {
        return `${match}${AUTH_BLOCK}`;
      });
    }
  }

  // Ensure the import is present (exactly once)
  if (!cleaned.includes("import { getSessionContext }")) {
    const lastImportMatch = cleaned.match(/^import .*$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      cleaned = cleaned.replace(lastImport, `${lastImport}\nimport { getSessionContext } from '@/lib/auth-context';`);
    }
  }
  
  // Remove duplicate imports  
  const importLine = "import { getSessionContext } from '@/lib/auth-context';";
  const importCount = (cleaned.match(new RegExp(importLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (importCount > 1) {
    // Remove all but the first
    let found = false;
    cleaned = cleaned.replace(new RegExp(importLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\n?', 'g'), (match) => {
      if (!found) { found = true; return match; }
      return '';
    });
  }

  // Clean up any excessive blank lines (3+ in a row → 2)
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

  if (cleaned !== original) {
    fs.writeFileSync(routePath, cleaned, 'utf-8');
    fixedCount++;
    console.log(`[FIXED: dedup auth] ${rel}`);
  }
}

console.log(`\n=== Fix complete: ${fixedCount} files modified ===`);
