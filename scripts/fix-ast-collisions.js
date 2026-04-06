const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

for (const route of routes) {
  let content = fs.readFileSync(route, 'utf-8');
  
  // Replace the conflicting destructuring injected by AST
  let newContent = content.replace(
    /const \{ orgId, role, userId \} = session;/g,
    'const { orgId } = session;'
  );
  
  // Extra patch: if any route still fails build, Next.js output showed them
  if (content !== newContent) {
    fs.writeFileSync(route, newContent, 'utf-8');
  }
}
console.log("Reverted conflicting destructuring variables");
