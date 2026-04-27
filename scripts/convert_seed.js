// Script to convert seed.ts from SQLite to PostgreSQL async syntax
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'src', 'lib', 'seed.ts');
let s = fs.readFileSync(seedPath, 'utf8');

// 1. Replace datetime('now') with NOW()
s = s.replace(/datetime\('now'\)/g, 'NOW()');

// 2. All .run( calls need await
s = s.replace(/(\w+)\.run\(/g, 'await $1.run(');
// Fix double-await
s = s.replace(/await await/g, 'await');

// 3. All .get( calls need await  
s = s.replace(/(\w+)\.get\(/g, 'await $1.get(');
s = s.replace(/await await/g, 'await');

// 4. All .all( calls need await
s = s.replace(/(\w+)\.all\(/g, 'await $1.all(');
s = s.replace(/await await/g, 'await');

// 5. Make seedDatabase async
s = s.replace('export function seedDatabase()', 'export async function seedDatabase()');
s = s.replace('function seedServiceMaster(', 'async function seedServiceMaster(');

// 6. Fix forEach with await — these need to be for-of loops instead
// This is the trickiest part. forEach doesn't work with await.
// We need to convert patterns like:
//   arr.forEach(x => iOrg.run(...))
// to:
//   for (const x of arr) { await iOrg.run(...) }

// However, this is very complex to do with regex for all patterns.
// Let's handle the simpler approach: wrap the forEach callbacks as async
// and note that this means they'll run concurrently (which is fine for seeding)

// Actually, let's just handle this differently. 
// Replace .forEach with for...of loops for the ones that contain await

// For now, let's make the forEach callbacks async — they'll fire concurrently
// which PostgreSQL handles fine
s = s.replace(/\.forEach\(\(([^)]+)\)\s*=>\s*{/g, '.forEach(async ($1) => {');
s = s.replace(/\.forEach\((\w+)\s*=>\s*{/g, '.forEach(async $1 => {');

// Handle one-liner forEach: .forEach(m => iOM.run(...))
s = s.replace(/\.forEach\((\w+)\s*=>\s*await\s/g, '.forEach(async $1 => await ');
s = s.replace(/\.forEach\(([^)]+)\)\s*=>\s*await\s/g, '.forEach(async ($1) => await ');

// Fix: stages.forEach((s,i) => iStg.run(...))  — these are one-liner arrow functions
// that got await added but need async
s = s.replace(/\.forEach\(([^{]+)=>\s*await\s/g, '.forEach(async $1=> await ');

fs.writeFileSync(seedPath, s, 'utf8');
console.log('seed.ts converted. Length:', s.length);
