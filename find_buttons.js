const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        fileList = walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk(path.join(__dirname, 'src/app/dashboard'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // find buttons without onClick or type="submit"
    if (line.includes('<button') && !line.includes('onClick') && !line.includes('type="submit"')) {
      console.log(`${file}:${i+1} - Missing onClick: ${line.trim()}`);
    }
    // find links with href="#" or href=""
    if (line.includes('<a') && (line.includes('href="#"') || line.includes('href=""'))) {
      console.log(`${file}:${i+1} - Dummy link: ${line.trim()}`);
    }
    // find hardcoded undefined handlers or console.log
    if (line.includes('={() => {}}') || line.includes('console.log(')) {
      console.log(`${file}:${i+1} - Dummy handler: ${line.trim()}`);
    }
  });
});
