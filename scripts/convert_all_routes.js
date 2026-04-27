// Comprehensive conversion of ALL TypeScript files that use db.prepare()
// Adds 'await' before all db.prepare().get/all/run() calls
// Converts datetime('now') to NOW()
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..', 'src');

// Find all .ts files that contain 'db.prepare'
function findFiles(dir, pattern) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(pattern)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = findFiles(rootDir, 'db.prepare');
console.log(`Found ${files.length} files with db.prepare:`);

let totalChanges = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // 1. Replace datetime('now') with NOW()
  content = content.replace(/datetime\('now'\)/gi, 'NOW()');
  
  // 2. Add await before db.prepare(...).get/all/run( that aren't already awaited
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // Skip if already awaited
    if (line.match(/await\s+.*db\.prepare/)) return line;
    if (line.match(/await\s+.*\.prepare/)) return line;
    
    // Skip comment lines
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return line;
    
    // Match patterns like: db.prepare(sql).get/all/run(...)
    // Also match: const x = db.prepare(sql).get/all/run(...)
    if (line.match(/db\.prepare\([\s\S]*?\)\.(run|get|all)\(/)) {
      // Find the db.prepare and add await before it
      return line.replace(/([ \t]*)(.*)db\.prepare\(/, (match, indent, before) => {
        // Don't add await if this is inside a const assignment for the statement itself
        // e.g. const iOrg = db.prepare(sql) — this is creating a statement, not executing
        if (!match.includes('.get(') && !match.includes('.all(') && !match.includes('.run(')) {
          // Actually, let's check the full line
          if (!line.includes('.get(') && !line.includes('.all(') && !line.includes('.run(')) {
            return match; // Don't add await for prepare-only lines
          }
        }
        return `${indent}${before}await db.prepare(`;
      });
    }
    
    // Also handle variable-name statements: iOrg.run(...), iU.run(...) etc.
    // These are prepared statements stored in variables
    if (line.match(/\b(i[A-Z]\w*|iOM|iStg|iES|iEng|iInv|iInbox|iAF|iRem|iLead|iPCI|iPFM|iPFC|iPC|iPCA|iPE|iPEC|iIF|iSR|iSC|iCH|iET|iD|iS|iC|iQ|iP)\.(run|get|all)\(/)) {
      if (!line.match(/await\s/)) {
        return line.replace(/(\b(?:i[A-Z]\w*|iOM|iStg|iES|iEng|iInv|iInbox|iAF|iRem|iLead|iPCI|iPFM|iPFC|iPC|iPCA|iPE|iPEC|iIF|iSR|iSC|iCH|iET|iD|iS|iC|iQ|iP)\.(run|get|all)\()/, 'await $1');
      }
    }
    
    return line;
  });
  
  content = fixedLines.join('\n');
  
  // 3. Fix double-await
  content = content.replace(/await\s+await\s/g, 'await ');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const relPath = path.relative(rootDir, filePath);
    const changeCount = content.split('await').length - original.split('await').length;
    console.log(`  ✓ ${relPath} (+${changeCount} awaits)`);
    totalChanges += changeCount;
  } else {
    const relPath = path.relative(rootDir, filePath);
    console.log(`  - ${relPath} (no changes needed)`);
  }
}

console.log(`\nTotal: ${totalChanges} await additions across ${files.length} files`);
