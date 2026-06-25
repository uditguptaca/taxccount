const { getDb } = require('./src/lib/db');
(async () => {
  const db = getDb();
  const templates = await db.prepare('SELECT id, name, category FROM compliance_templates LIMIT 10').all();
  console.log(templates);
})();
