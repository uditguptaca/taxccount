// Fix "await in non-async function" errors
// These occur when await was added inside .map(), .forEach(), or db.transaction() callbacks
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'src');

function findFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) results.push(...findFiles(fullPath));
    else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) results.push(fullPath);
  }
  return results;
}

const files = findFiles(rootDir);
let totalFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix 1: .map(x => { ... await ... }) → .map(async x => { ... await ... })
  // Then wrap the whole thing with Promise.all()
  // Actually, for .map with awaits inside, we need to convert to for-of loops or Promise.all
  
  // Simpler approach: find .map callbacks that contain await and make them async
  // Pattern: .map((params) => {
  content = content.replace(/\.map\((\([^)]*\))\s*=>\s*\{/g, (match, params) => {
    // Check if the following block contains 'await'
    return `.map(async ${params} => {`;
  });
  
  // Pattern: .map(param => {
  content = content.replace(/\.map\((\w+)\s*=>\s*\{/g, (match, param) => {
    return `.map(async ${param} => {`;
  });
  
  // Fix 2: db.transaction(() => { ... await ... }) → make callback async
  content = content.replace(/\.transaction\(\(\)\s*=>\s*\{/g, '.transaction(async () => {');
  content = content.replace(/\.transaction\((\w+)\s*=>\s*\{/g, '.transaction(async $1 => {');
  
  // Fix 3: .forEach((params) => { with await inside → make async
  // Already handled by convert_seed.js but let's be thorough
  content = content.replace(/\.forEach\((\([^)]*\))\s*=>\s*\{/g, '.forEach(async $1 => {');
  content = content.replace(/\.forEach\((\w+)\s*=>\s*\{/g, '.forEach(async $1 => {');
  
  // Fix double async
  content = content.replace(/async\s+async/g, 'async');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const relPath = path.relative(rootDir, filePath);
    console.log(`  ✓ ${relPath}`);
    totalFixed++;
  }
}

console.log(`Fixed ${totalFixed} files`);
