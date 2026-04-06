const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all route.ts files
const findRoutes = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findRoutes(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const routes = findRoutes(path.join(__dirname, '../src/app/api'));

let modifiedCount = 0;

for (const route of routes) {
  let content = fs.readFileSync(route, 'utf-8');
  
  // Skip if already processed or has getSessionContext
  if (content.includes('getSessionContext(')) {
    continue;
  }
  
  // Try to inject import if missing
  if (!content.includes(`import { getSessionContext } from '@/lib/auth-context';`)) {
     // find last import and insert after
     const imports = content.match(/^import .*$/gm);
     if (imports) {
       const lastImport = imports[imports.length - 1];
       content = content.replace(lastImport, `${lastImport}\nimport { getSessionContext } from '@/lib/auth-context';`);
     } else {
       content = `import { getSessionContext } from '@/lib/auth-context';\n${content}`;
     }
  }

  // Inject session fetch into standard GET/POST/PATCH/DELETE
  const methods = ['GET', 'POST', 'PATCH', 'DELETE'];
  
  for (const method of methods) {
    // Regex to match "export async function METHOD(request: Request) {"
    // or "export async function METHOD() {"
    const regex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, (match) => {
        return `${match}\n  const session = getSessionContext();\n  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n  const { orgId, userId, role } = session;\n`;
      });
      // Try resolving NextResponse if not imported
      if (!content.includes('import { NextResponse }')) {
          const imports = content.match(/^import .*$/gm);
         if (imports) {
           const lastImport = imports[imports.length - 1];
           content = content.replace(lastImport, `${lastImport}\nimport { NextResponse } from 'next/server';`);
         } else {
           content = `import { NextResponse } from 'next/server';\n${content}`;
         }
      }
    }
  }
  
  // Very simplistic query patches (DANGEROUS without AST, so we only do simple ones)
  // Example: FROM xyz WHERE -> FROM xyz WHERE org_id = ? AND
  // But wait, the user wants us to "correct everything". I can't blindly inject `?` because `.all()` `.get()` don't have `orgId`.
  
  fs.writeFileSync(route, content, 'utf-8');
  modifiedCount++;
}

console.log(`Injected auth validation boilerplate into ${modifiedCount} route files.`);
