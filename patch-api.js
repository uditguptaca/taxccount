const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, 'src', 'app', 'api', 'templates', 'route.ts');
let code = fs.readFileSync(routePath, 'utf8');

if (!code.includes("const { checklist_id } = body;")) {
  code = code.replace(
    `const { 
      name, code, description, category, default_price, stages, documents,`,
    `const { 
      name, code, description, category, default_price, stages, documents, checklist_id,`
  );

  const newBlock = `
    // If a checklist_id is provided, fetch its items and insert them into the template's documents
    if (checklist_id) {
      const clItems = await db.prepare('SELECT * FROM checklist_library_items WHERE org_id = ? AND checklist_id = ? ORDER BY sort_order ASC').all(orgId, checklist_id);
      if (clItems && clItems.length > 0) {
        for (let idx = 0; idx < clItems.length; idx++) {
          const doc = clItems[idx];
          await db.prepare(\`
            INSERT INTO compliance_template_documents (
              id, org_id, template_id, document_name, document_code, document_category, 
              is_mandatory, description, upload_by, linked_stage_code, sort_order, 
              accepted_file_types, client_visible, staff_only, notes, upload_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          \`).run(
            uuidv4(), orgId, templateId,
            doc.document_name, doc.document_code || null, doc.document_category || 'client_supporting',
            doc.is_mandatory ? 1 : 0, doc.description || null, doc.upload_by || 'either',
            doc.suggested_stage || null, doc.sort_order ?? idx + 1,
            doc.accepted_file_types || null, doc.client_visible !== false ? 1 : 0,
            doc.staff_only ? 1 : 0, doc.notes || null, doc.upload_required ? 1 : 0
          );
        }
      }
    }

    const newTpl =`;

  code = code.replace("    const newTpl =", newBlock);
  fs.writeFileSync(routePath, code, 'utf8');
  console.log("Patched API templates route");
} else {
  console.log("Already patched");
}
