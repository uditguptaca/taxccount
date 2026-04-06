/**
 * fix-routes-v2.js — Proper route cleanup
 * 
 * Strategy: Read each file line-by-line, detect and remove ALL duplicate
 * session/auth/orgId lines that appear after the first valid auth block
 * in each function handler.
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

// Auth block lines to detect  
const AUTH_LINE_PATTERNS = [
  /^\s*const session = getSessionContext\(\);\s*$/,
  /^\s*if \(!session \|\| !session\.orgId\) return NextResponse\.json\(\{ error: ['"]Unauthorized['"] \}, \{ status: 401 \}\);\s*$/,
  /^\s*const \{ orgId(?:,\s*(?:userId|role))*\s*\} = session;\s*$/,
  /^\s*const \{ (?:userId|role|orgId)(?:,\s*(?:userId|role|orgId))*\s*\} = session;\s*$/,
];

function isAuthLine(line) {
  return AUTH_LINE_PATTERNS.some(p => p.test(line));
}

function isFunctionDeclLine(line) {
  return /export\s+async\s+function\s+(GET|POST|PATCH|DELETE|PUT)\s*\(/.test(line);
}

for (const routePath of routes) {
  const content = fs.readFileSync(routePath, 'utf-8');
  const rel = routePath.replace(/\\/g, '/').split('src/app/api/')[1];

  const isAuth = rel.startsWith('auth/');
  const isPlatform = rel.startsWith('platform/');
  const isWebhook = rel.includes('webhook');
  const isCron = rel.startsWith('cron/');
  const isScheduler = rel.startsWith('scheduler/');

  // Skip auth routes
  if (isAuth) continue;

  const lines = content.split('\n');
  const newLines = [];
  let inFunction = false;
  let hasAuthInThisFunction = false;
  let removedAny = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function boundaries
    if (isFunctionDeclLine(line)) {
      inFunction = true;
      hasAuthInThisFunction = false;
      newLines.push(line);
      continue;
    }

    // For webhook/cron/scheduler: remove ALL auth lines
    if (isWebhook || isCron || isScheduler) {
      if (isAuthLine(line)) {
        removedAny = true;
        continue; // skip this line
      }
      newLines.push(line);
      continue;
    }

    // For platform routes: remove orgId checks, replace with isPlatformAdmin
    if (isPlatform) {
      if (isAuthLine(line)) {
        if (!hasAuthInThisFunction) {
          // Keep first auth block but fix it for platform
          if (/const session = getSessionContext\(\);/.test(line)) {
            newLines.push(line);
            hasAuthInThisFunction = true;
          } else if (/!session\.orgId/.test(line)) {
            // Replace with isPlatformAdmin check
            newLines.push(line.replace('!session.orgId', '!session.isPlatformAdmin'));
            removedAny = true;
          } else if (/const \{.*orgId/.test(line)) {
            // Skip orgId destructure for platform routes — they don't need it
            removedAny = true;
          } else {
            newLines.push(line);
          }
        } else {
          // Duplicate auth line in this function — remove it
          removedAny = true;
        }
        continue;
      }
      newLines.push(line);
      continue;
    }

    // For normal tenant-scoped routes
    if (isAuthLine(line)) {
      if (!hasAuthInThisFunction) {
        // First auth block in this function — keep it
        if (/const session = getSessionContext\(\);/.test(line)) {
          newLines.push(line);
          hasAuthInThisFunction = true;
        } else if (/if \(!session/.test(line)) {
          newLines.push(line);
        } else if (/const \{.*\} = session;/.test(line)) {
          // Keep the first destructure only
          newLines.push(line);
        } else {
          newLines.push(line);
        }
      } else {
        // We already have auth in this function — this is a duplicate
        removedAny = true;
        // Skip the line
      }
      continue;
    }

    newLines.push(line);
  }

  // Remove auth import from webhook/cron/scheduler if we removed all auth
  if ((isWebhook || isCron || isScheduler) && removedAny) {
    const idx = newLines.findIndex(l => l.includes("import { getSessionContext }"));
    if (idx !== -1) {
      // Check if getSessionContext is still used anywhere
      const remaining = newLines.filter((_, j) => j !== idx).join('\n');
      if (!remaining.includes('getSessionContext')) {
        newLines.splice(idx, 1);
      }
    }
  }

  // Clean up excessive blank lines
  let result = newLines.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n');

  if (removedAny) {
    fs.writeFileSync(routePath, result, 'utf-8');
    fixedCount++;
    console.log(`[FIXED] ${rel}`);
  }
}

console.log(`\n=== Fix v2 complete: ${fixedCount} files modified ===`);
