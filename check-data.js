const { getDb } = require('./src/lib/db');
(async () => {
  const db = getDb();
  const templates = await db.prepare('SELECT category, count(*) as count FROM compliance_templates GROUP BY category').all();
  console.log("Templates:", templates);
  
  const projects = await db.prepare('SELECT count(*) as count FROM client_compliances').get();
  console.log("Projects:", projects);
  
  const sample = await db.prepare('SELECT ct.category, cc.engagement_code FROM client_compliances cc JOIN compliance_templates ct ON cc.template_id = ct.id LIMIT 5').all();
  console.log("Sample:", sample);
})();
