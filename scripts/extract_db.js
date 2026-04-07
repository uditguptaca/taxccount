const fs = require('fs');
const code = fs.readFileSync('src/lib/db.ts', 'utf-8');
const execMatches = [...code.matchAll(/db\.exec\(\`([\s\S]*?)\`\);/g)];
const fullSql = execMatches.map(m => m[1]).join('\n\n');
fs.mkdirSync('src/db/migrations', { recursive: true });
fs.writeFileSync('src/db/migrations/001_initial_schema.sql', fullSql);
console.log('Extracted ' + execMatches.length + ' exec blocks to 001_initial_schema.sql');
