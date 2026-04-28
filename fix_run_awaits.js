const fs = require('fs');
const path = require('path');

function fixRunAwaits(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixRunAwaits(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Split file into lines for sequential checking
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Match common patterns:
        // db.prepare(...).run(...)
        // insertStage.run(...)
        // query.run(...)
        // Make sure it doesn't already have await on the SAME line.
        // Wait, what if it's `await db.prepare(\` ... \`).run()` spanning multiple lines?
        // If the line has `.run(` and doesn't have `await `, we should check if `await ` is before the `.prepare(`.
        // Actually, replacing `.run(` with `.run(` and prefixing `await ` where missing is tricky with regex if spanning lines.

        // A safer regex over the full content:
        // Replace `[any whitespace]db.prepare(` with `[whitespace]await db.prepare(` IF it's not already awaited.
      }
      
      // Let's do a global replace on the content string
      // Match `db.prepare(` that is NOT preceded by `await `
      const origContent = content;
      
      // Case 1: `db.prepare(` -> `await db.prepare(`
      // Negative lookbehind is useful here
      content = content.replace(/(?<!await\s+)(getDb\(\)\.prepare\()/g, 'await $1');
      content = content.replace(/(?<!await\s+)(db\.prepare\()/g, 'await $1');
      
      // Case 2: Multi-line chaining like `insertStage.run(` where insertStage is a prepared statement
      content = content.replace(/(?<!await\s+)(\w+\.run\()/g, 'await $1');

      if (content !== origContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

fixRunAwaits(path.join(__dirname, 'src', 'app', 'api'));
