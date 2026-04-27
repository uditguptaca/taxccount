// Remove incorrectly-added async from client-side component .map() callbacks
const fs = require('fs');
const path = require('path');

const files = [
  'src/components/CalendarView.tsx',
  'src/components/VaultTabs.tsx',
  'src/components/portal/PortalSidebar.tsx',
];

const rootDir = path.join(__dirname, '..');

// Also scan all files in src/app/ that are client-side (contain 'use client')
function findClientFiles(dir) {
  const results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) results.push(...findClientFiles(fullPath));
      else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes("'use client'") || content.includes('"use client"')) {
          if (content.includes('.map(async')) {
            results.push(fullPath);
          }
        }
      }
    }
  } catch {}
  return results;
}

const clientFiles = [
  ...files.map(f => path.join(rootDir, f)),
  ...findClientFiles(path.join(rootDir, 'src/app')),
  ...findClientFiles(path.join(rootDir, 'src/components')),
];

// Deduplicate
const uniqueFiles = [...new Set(clientFiles)];

let totalFixed = 0;
for (const filePath of uniqueFiles) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Remove async from .map() callbacks in client components
  content = content.replace(/\.map\(async\s+/g, '.map(');
  // Also fix .forEach(async in client components
  content = content.replace(/\.forEach\(async\s+/g, '.forEach(');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const relPath = path.relative(rootDir, filePath);
    console.log(`  ✓ ${relPath}`);
    totalFixed++;
  }
}

console.log(`Fixed ${totalFixed} client-side files`);
