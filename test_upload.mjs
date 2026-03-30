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

const adminUser = db.prepare("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1").get();

const formData = new FormData();
const dummyFileContent = new Blob(['dummy content for pdf'], { type: 'application/pdf' });
formData.append('file', dummyFileContent, 'test_upload.pdf');
formData.append('client_id', pendingDocInfo.client_id);
formData.append('engagement_id', pendingDocInfo.engagement_id);
formData.append('template_doc_id', pendingDocInfo.template_doc_id);
formData.append('document_category', pendingDocInfo.document_category);
formData.append('financial_year', pendingDocInfo.financial_year || '2025');
formData.append('uploaded_by', adminUser.id);

async function testUpload() {
  const res = await fetch('http://localhost:3000/api/documents', {
    method: 'POST',
    body: formData
  });
  
  const text = await res.text();
  console.log('API RESPONSE:', text);

  const currentStageCheck = db.prepare("SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND stage_code = 'DATA_COLLECTION'").get(pendingDocInfo.engagement_id);
  console.log('Current Data Collection Status:', currentStageCheck?.status);

  if (currentStageCheck) {
     const nextStageCheck = db.prepare("SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND sequence_order > ? ORDER BY sequence_order ASC LIMIT 1").get(pendingDocInfo.engagement_id, currentStageCheck.sequence_order);
     console.log('Next Stage Status:', nextStageCheck?.status);
  }
}

testUpload();
