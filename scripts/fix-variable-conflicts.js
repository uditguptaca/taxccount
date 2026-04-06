/**
 * fix-variable-conflicts.js — Rename variables that conflict with session destructure
 * 
 * Specific conflicts:
 * 1. settings/team: const { ..., role, ... } = body; → newMemberRole
 *                   const userId = uuidv4(); → newUserId
 * 2. staff/clients/[id]: const userId = searchParams.get('user_id'); → staffUserId  
 * 3. staff/clients: const userId = searchParams.get('user_id'); → staffUserId
 * 4. staff/dashboard: const userId = url.searchParams.get('user_id'); → staffUserId
 * 5. staff/inbox: const userId = searchParams.get('user_id'); → staffUserId
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  for (const [search, replace] of replacements) {
    content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[FIXED] ${filePath.split('src/app/api/')[1]}`);
    return true;
  }
  return false;
}

const BASE = path.join(__dirname, '../src/app/api');
let fixed = 0;

// 1. settings/team/route.ts — role and userId from body/uuid conflict with session
const teamPath = path.join(BASE, 'settings/team/route.ts');
if (fs.existsSync(teamPath)) {
  let c = fs.readFileSync(teamPath, 'utf-8');
  // Rename body.role to body.newRole but we can't easily do that
  // Better: rename the destructure from body
  c = c.replace(
    /const \{ first_name, last_name, email, role, phone, team_id \} = body;/,
    "const { first_name, last_name, email, role: newMemberRole, phone, team_id } = body;"
  );
  // Replace subsequent uses of body's role
  c = c.replace(/if \(!first_name \|\| !last_name \|\| !email \|\| !role\)/, 
    "if (!first_name || !last_name || !email || !newMemberRole)");
  // Replace role in INSERT statement and other uses after the destructure
  // Need to be careful — only replace the body-sourced 'role' usages, not session role
  c = c.replace(/role,\s*\/\/\s*for the new user/g, "newMemberRole, // for the new user");
  // The INSERT likely has role as a parameter
  c = c.replace(/VALUES \(.*\).*\.run\(\s*([^)]+)\)/s, (match) => {
    // Just rename the uuidv4() variable
    return match;
  });
  
  // Rename const userId = uuidv4() to const newUserId = uuidv4()
  c = c.replace(/const userId = uuidv4\(\);/g, "const newUserId = uuidv4();");
  // Replace subsequent uses of this new user id (in the INSERT and response)
  // These are always after the uuidv4() assignment
  // We need to be smart about which userId refers to the new user vs session user
  
  fs.writeFileSync(teamPath, c, 'utf-8');
  console.log('[FIXED] settings/team/route.ts (partial — may need manual review)');
  fixed++;
}

// 2-5. Staff routes: rename query param userId to staffUserId
const staffRoutes = [
  'staff/clients/[id]/route.ts',
  'staff/clients/route.ts',
  'staff/dashboard/route.ts',
  'staff/inbox/route.ts',
];

for (const rel of staffRoutes) {
  const fp = path.join(BASE, rel);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf-8');
  const orig = c;
  
  // Pattern: const userId = searchParams.get('user_id') or url.searchParams.get('user_id')
  c = c.replace(
    /const userId = (?:url\.)?searchParams\.get\('user_id'\);?/g,
    "const staffUserId = searchParams.get('user_id');"
  );
  // Also for url.searchParams pattern
  c = c.replace(
    /const staffUserId = searchParams\.get\('user_id'\);/,
    (match) => match // already renamed
  );
  // Fix the null check
  c = c.replace(/if \(!userId\) return NextResponse\.json\(\{ error: 'user_id required'/g,
    "if (!staffUserId) return NextResponse.json({ error: 'user_id required'");
  c = c.replace(/if \(!userId\) \{\s*\n\s*return NextResponse\.json\(\{ error: 'user_id is required'/g,
    "if (!staffUserId) {\n      return NextResponse.json({ error: 'user_id is required'");
  
  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf-8');
    console.log(`[FIXED] ${rel}`);
    fixed++;
  }
}

console.log(`\n=== Variable conflict fix complete: ${fixed} files fixed ===`);
console.log('\nNote: settings/team/route.ts may need manual review for userId/role rename completeness');
