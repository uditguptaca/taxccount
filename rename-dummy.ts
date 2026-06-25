import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/uditg/OneDrive/Antigravity/taxccount/src/app/dashboard/services/corporate-secretary';

function replaceInDir(currentDir: string) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('dummyData')) {
        content = content.replace(/dummyData/g, 'secretarialData');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(dir);
