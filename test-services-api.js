const { getDb } = require('./src/lib/db');

(async () => {
  const db = getDb();

  const categories = ['Accounting', 'Direct Tax', 'Indirect Tax', 'Annual Return', 'Payroll', 'Corporate Secretary'];

  for (const cat of categories) {
    const projects = await db.prepare(`
      SELECT 
        cc.id, cc.engagement_code, cc.due_date, cc.status, cc.priority, cc.period_label,
        c.id as client_id, c.display_name as client_name, c.client_code,
        ct.name as template_name, ct.category
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE ct.category = ?
      ORDER BY cc.due_date ASC
    `).all(cat);
    console.log(`Category [${cat}] projects count:`, projects.length);
  }

  // Check unique categories in compliance_templates table
  const tplCats = await db.prepare('SELECT DISTINCT category FROM compliance_templates').all();
  console.log('Distinct categories in compliance_templates:', tplCats);

  process.exit(0);
})();
