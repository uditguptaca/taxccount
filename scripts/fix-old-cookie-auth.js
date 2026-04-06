/**
 * fix-old-cookie-auth.js — Remove old cookie-based auth patterns
 * that conflict with the new session-based auth (getSessionContext).
 * 
 * Pattern to remove:
 *   const cookieStore = await cookies();
 *   const userId = cookieStore.get('auth_user_id')?.value;
 *   [const role = cookieStore.get('auth_role')?.value;] (optional)
 *   if (!userId) return ...
 * 
 * Also removes unused `import { cookies } from 'next/headers'` if no other
 * references to `cookies` remain.
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

  // Skip auth routes (they use cookies legitimately, no session-based auth)
  if (rel.startsWith('auth/')) continue;

  // Only process files that have BOTH getSessionContext AND old cookie auth
  if (!content.includes('getSessionContext') || !content.includes("cookieStore.get('auth_user_id')")) {
    continue;
  }

  // Remove all old cookie-based auth patterns
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip: const cookieStore = await cookies();  
    if (trimmed === "const cookieStore = await cookies();" || trimmed === "const cookieStore = cookies();") {
      i++;
      continue;
    }

    // Skip: const userId = cookieStore.get('auth_user_id')?.value;
    if (trimmed === "const userId = cookieStore.get('auth_user_id')?.value;") {
      i++;
      continue;
    }

    // Skip: const role = cookieStore.get('auth_role')?.value;
    if (trimmed === "const role = cookieStore.get('auth_role')?.value;") {
      i++;
      continue;
    }

    // Skip: if (!userId) return NextResponse.json(...)  
    // BUT only if it immediately follows a removed cookie line
    // Check if previous line was removed AND this is a bare !userId check
    if (trimmed === "if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });") {
      // Check if the session auth already handles this
      const prevContent = newLines.join('\n');
      if (prevContent.includes('getSessionContext()') && prevContent.includes("!session.orgId")) {
        i++;
        continue;
      }
    }

    newLines.push(line);
    i++;
  }

  let result = newLines.join('\n');

  // Remove unused cookies import if no remaining references to `cookieStore` or `cookies()`
  if (!result.includes('cookieStore') && !result.includes('cookies()')) {
    result = result.replace(/import \{ cookies \} from ['"]next\/headers['"];?\n?/g, '');
  }

  // Clean up excessive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  if (result !== original) {
    fs.writeFileSync(routePath, result, 'utf-8');
    fixedCount++;
    console.log(`[FIXED] ${rel}`);
  }
}

console.log(`\n=== Old cookie auth cleanup complete: ${fixedCount} files fixed ===`);
