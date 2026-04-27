// More thorough conversion of seed.ts
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'src', 'lib', 'seed.ts');
let s = fs.readFileSync(seedPath, 'utf8');

// Fix: db.prepare(...).get() → await db.prepare(...).get()
// The pattern is: something.prepare(string).get/all/run(
s = s.replace(/(const\s+\w+\s*=\s*)db\.prepare\(([^)]+)\)\.get\(/g, '$1await db.prepare($2).get(');
s = s.replace(/(const\s+\w+\s*=\s*)db\.prepare\(([^)]+)\)\.all\(/g, '$1await db.prepare($2).all(');

// Also handle: if (count && count.c > 0) pattern in seedServiceMaster
s = s.replace(/(const\s+\w+\s*=\s*)db\.prepare\(([^)]*)\)\.get\(\)/g, '$1await db.prepare($2).get()');

// Handle any remaining non-awaited db.prepare patterns
// Look for lines starting with db.prepare or having = db.prepare
s = s.replace(/(?<!await\s)db\.prepare\(/g, 'db.prepare(');

// Now add await to all db.prepare chains that aren't already awaited
// Pattern: NOT preceded by 'await ' + db.prepare(...).<method>(
const lines = s.split('\n');
const fixedLines = lines.map(line => {
  // Skip if already has await for db.prepare
  if (line.includes('await db.prepare')) return line;
  
  // If line contains db.prepare(...).run/get/all, add await
  if (line.match(/db\.prepare\([^)]*\)\.(run|get|all)\(/)) {
    // Add await before db.prepare
    return line.replace(/db\.prepare\(/, 'await db.prepare(');
  }
  
  return line;
});

s = fixedLines.join('\n');

// Fix double-await
s = s.replace(/await\s+await/g, 'await');

fs.writeFileSync(seedPath, s, 'utf8');
console.log('seed.ts re-fixed. Length:', s.length);
