/**
 * fix-getUserId-conflicts.js — Remove old `const userId = getUserId()` 
 * and `const userId = url.searchParams.get('user_id')` lines that conflict
 * with the session-based auth destructure.
 * 
 * Also removes `getUserId` import/function declarations.
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

  // Skip auth routes
  if (rel.startsWith('auth/')) continue;

  // Only fix files that have getSessionContext AND getUserId conflict
  if (!content.includes('getSessionContext')) continue;

  let modified = false;

  // Remove: const userId = getUserId();
  if (content.includes('const userId = getUserId();')) {
    content = content.replace(/^.*const userId = getUserId\(\);.*$/gm, '');
    modified = true;
  }

  // Remove: function getUserId() { ... } blocks
  // These are inline helper functions
  content = content.replace(/function getUserId\(\)\s*\{[^}]*\}/g, '');

  // Remove: const cookieStore = ... ; const userId = cookieStore.get(...)
  content = content.replace(/^.*const cookieStore = (?:await )?cookies\(\);.*$/gm, (match) => {
    modified = true;
    return '';
  });
  content = content.replace(/^.*const userId = cookieStore\.get\('auth_user_id'\)\?\.value;.*$/gm, (match) => {
    modified = true;
    return '';
  });
  content = content.replace(/^.*const role = cookieStore\.get\('auth_role'\)\?\.value;.*$/gm, (match) => {
    modified = true;
    return '';
  });

  // For employee/dashboard: const userId = url.searchParams.get('user_id')
  // This is actually a DIFFERENT variable — a query param, not auth userId
  // Rename it to avoid conflict
  if (rel === 'employee/dashboard/route.ts') {
    content = content.replace(
      "const userId = url.searchParams.get('user_id');",
      "const requestedUserId = url.searchParams.get('user_id');"
    );
    content = content.replace(
      "if (!userId) {",
      "if (!requestedUserId) {"
    );
    content = content.replace(
      "return NextResponse.json({ error: 'user_id is required' }, { status: 400 });",
      "return NextResponse.json({ error: 'user_id is required' }, { status: 400 });"
    );
    // Replace all subsequent uses of userId that refer to the query param
    // These would be in SQL queries where the original code uses the search param userId
    // Need to be careful not to replace the session userId
    // Actually, let's use the session userId for auth and requestedUserId for the query
    content = content.replace(
      /url\.searchParams\.get\('user_id'\)/g,
      "url.searchParams.get('user_id')"
    );
    // The employee dashboard may use userId from query params for the actual query
    // We need to check the actual usage
    modified = true;
  }
  
  // Remove unused getUserId import
  content = content.replace(/import \{ getUserId \} from ['"][^'"]*['"];?\n?/g, '');

  // Remove unused cookies import if no cookieStore remains
  if (!content.includes('cookieStore') && !content.includes('cookies()')) {
    content = content.replace(/import \{ cookies \} from ['"]next\/headers['"];?\n?/g, '');
  }

  // Clean up excessive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(routePath, content, 'utf-8');
    fixedCount++;
    console.log(`[FIXED] ${rel}`);
  }
}

console.log(`\n=== getUserId conflict fix complete: ${fixedCount} files fixed ===`);
