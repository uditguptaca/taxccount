import fs from 'fs';
import Database from 'better-sqlite3';

const dbPath = './taxccount.db';
const db = new Database(dbPath);

const pendingDocInfo = db.prepare(`
  SELECT 
    cc.id as engagement_id,
    cc.client_id,
    ctd.id as template_doc_id,
    ctd.document_category,
    cc.financial_year
  FROM client_compliances cc
  JOIN compliance_template_documents ctd ON cc.template_id = ctd.template_id
  WHERE ctd.is_mandatory = 1 AND ctd.upload_by IN ('client', 'either') AND ctd.linked_stage_code = 'DATA_COLLECTION'
  AND NOT EXISTS (
    SELECT 1 FROM document_files df 
    WHERE df.engagement_id = cc.id AND df.template_doc_id = ctd.id
  )
  LIMIT 1
`).get();

if (!pendingDocInfo) {
  process.exit(1);
}

// FORCE states so we can see the console.log trigger
db.prepare("UPDATE client_compliance_stages SET status = 'in_progress' WHERE engagement_id = ? AND stage_code = 'DATA_COLLECTION'").run(pendingDocInfo.engagement_id);
db.prepare("UPDATE client_compliance_stages SET status = 'pending' WHERE engagement_id = ? AND stage_code = 'PREPARED'").run(pendingDocInfo.engagement_id);

const adminUser = db.prepare("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1").get();
const formData = new FormData();
const dummyFileContent = new Blob(['dummy content for pdf'], { type: 'application/pdf' });
formData.append('file', dummyFileContent, 'test_upload2.pdf');
formData.append('client_id', pendingDocInfo.client_id);
formData.append('engagement_id', pendingDocInfo.engagement_id);
formData.append('template_doc_id', pendingDocInfo.template_doc_id);
formData.append('document_category', pendingDocInfo.document_category);
formData.append('financial_year', pendingDocInfo.financial_year || '2025');
formData.append('uploaded_by', adminUser.id);

async function testUpload() {
  await fetch('http://localhost:3000/api/documents', {
    method: 'POST',
    body: formData
  });
}
testUpload();
