import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    seedDatabase();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let where = '';
    const params: string[] = [];
    if (clientId) { where = 'WHERE df.client_id = ?'; params.push(clientId); }

    const documents = db.prepare(`
      SELECT df.*, c.display_name as client_name, c.client_code,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        cc.engagement_code, ct.name as template_name
      FROM document_files df
      JOIN clients c ON df.client_id = c.id
      JOIN users u ON df.uploaded_by = u.id
      LEFT JOIN client_compliances cc ON df.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      ${where}
      ORDER BY df.created_at DESC
    `).all(...params);

    const clientsWithDocs = db.prepare(`
      SELECT c.id, c.display_name, c.client_code, COUNT(df.id) as doc_count
      FROM clients c
      LEFT JOIN document_files df ON df.client_id = c.id
      GROUP BY c.id
      HAVING doc_count > 0
      ORDER BY c.display_name
    `).all();

    return NextResponse.json({ documents, clientsWithDocs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const client_id = formData.get('client_id') as string;
    const document_category = formData.get('document_category') as string;
    const financial_year = formData.get('financial_year') as string;
    const uploaded_by = formData.get('uploaded_by') as string;
    const engagement_id = formData.get('engagement_id') as string;
    const template_doc_id = formData.get('template_doc_id') as string;
    const is_internal_only = formData.get('is_internal_only') === '1' ? 1 : 0;

    if (!file || !client_id) {
      return NextResponse.json({ error: 'File and client_id are required' }, { status: 400 });
    }

    // 1. File Size Validation (20MB Limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds the 20MB limit. Provided size: ${(file.size / 1024 / 1024).toFixed(2)}MB` }, { status: 400 });
    }

    // 2. MIME Type Whitelist
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'text/plain'
    ];

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Only PDF, JPEG, PNG, CSV, DOCX, XLSX, and TXT are allowed.` }, { status: 400 });
    }

    // 3. Extension Validation Countermeasure
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const safeExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'csv', 'docx', 'xlsx', 'txt'];
    
    if (!safeExtensions.includes(fileExt)) {
      return NextResponse.json({ error: `Invalid file extension: .${fileExt}. Malicious payload risk flagged.` }, { status: 400 });
    }

    // In a real production app, upload to S3. For MVP, we save to local public directory.
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}.${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    fs.writeFileSync(filePath, buffer);

    const db = getDb();
    const docId = uuidv4();
    
    db.prepare(`
      INSERT INTO document_files (
        id, client_id, engagement_id, template_doc_id, uploaded_by, file_name, mime_type, file_size_bytes, 
        document_category, financial_year, status, storage_path, is_internal_only, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, datetime('now'), datetime('now'))
    `).run(
      docId, client_id, engagement_id || null, template_doc_id || null, uploaded_by || 'system', file.name, file.type, file.size,
      document_category || 'general', financial_year || null, fileUrl, is_internal_only
    );

    // [VERSION TRACKING: Create initial version entry]
    try {
      db.prepare(`
        INSERT INTO document_versions (id, document_id, version_number, file_name, storage_path, file_size_bytes, mime_type, uploaded_by, created_at)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, datetime('now'))
      `).run(uuidv4(), docId, file.name, fileUrl, file.size, file.type, uploaded_by || 'system');
    } catch (e) { /* table may not exist in older DBs, safe to skip */ }

    // [AUDIT TRAIL: Log document upload event]
    try {
      const cookieStore = cookies();
      const actorId = cookieStore.get('auth_user_id')?.value || uploaded_by || 'system';
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, 'DOCUMENT_UPLOADED', 'document', ?, ?, datetime('now'))
      `).run(uuidv4(), actorId, docId, JSON.stringify({
        file_name: file.name,
        client_id,
        engagement_id: engagement_id || null,
        document_category: document_category || 'general',
        financial_year: financial_year || null,
        file_size: file.size,
        mime_type: file.type,
      }));
    } catch (e) { /* audit log optional */ }

    // [OCR PROCESSING: Extract text for search indexing]
    try {
      const { processDocumentOcr } = require('@/lib/ocr');
      // Process async (non-blocking — runs after response)
      setTimeout(() => {
        try { processDocumentOcr(docId); } catch (e) { console.error('[OCR] Async processing error:', e); }
      }, 100);
    } catch (e) { /* OCR module may not be available */ }

    // [AUTO-TAGGING: Classify document based on filename patterns]
    try {
      const { classifyDocument } = require('@/lib/classifier');
      const tags = classifyDocument(file.name, file.type, document_category);
      if (tags && tags.length > 0) {
        try { db.exec(`ALTER TABLE document_files ADD COLUMN auto_tags TEXT;`); } catch { }
        db.prepare('UPDATE document_files SET auto_tags = ? WHERE id = ?').run(JSON.stringify(tags), docId);
      }
    } catch (e) { /* Classifier module may not be available */ }

    // [AUTOMATION TRIGGER: Checklist Saturation]
    if (engagement_id && template_doc_id) {
      // 1. Find which stage this uploaded document is tethered to
      const docDef = db.prepare(`
        SELECT linked_stage_code 
        FROM compliance_template_documents 
        WHERE id = ?
      `).get(template_doc_id) as any;

      if (docDef && docDef.linked_stage_code) {
        const stageCode = docDef.linked_stage_code;

        // 2. Count total mandatory documents for this specific stage in this project's template
        const mandatoryCountQuery = db.prepare(`
          SELECT COUNT(*) as mg
          FROM compliance_template_documents ctd
          JOIN client_compliances cc ON cc.template_id = ctd.template_id
          WHERE cc.id = ? AND ctd.linked_stage_code = ? AND ctd.is_mandatory = 1 AND ctd.upload_by IN ('client', 'either')
        `).get(engagement_id, stageCode) as any;
        
        const requiredCount = mandatoryCountQuery.mg || 0;

        // 3. Count unique mandatory documents uploaded for this exact stage so far
        const uploadedCountQuery = db.prepare(`
          SELECT COUNT(DISTINCT df.template_doc_id) as ug
          FROM document_files df
          JOIN compliance_template_documents ctd ON ctd.id = df.template_doc_id
          WHERE df.engagement_id = ? AND ctd.linked_stage_code = ? AND ctd.is_mandatory = 1 AND ctd.upload_by IN ('client', 'either')
        `).get(engagement_id, stageCode) as any;
        
        const fulfilledCount = uploadedCountQuery.ug || 0;

        // 4. Evaluate Checklist Saturation 
        if (requiredCount > 0 && fulfilledCount >= requiredCount) {
          // Find the active stage matching this code
          const currentStage = db.prepare(`
            SELECT * FROM client_compliance_stages 
            WHERE engagement_id = ? AND stage_code = ? AND status != 'completed'
          `).get(engagement_id, stageCode) as any;

          if (currentStage) {
            const now = new Date().toISOString();
            
            // Mark the active stage as completed
            db.prepare(`
              UPDATE client_compliance_stages 
              SET status = 'completed', completed_at = ?, updated_at = ? 
              WHERE id = ?
            `).run(now, now, currentStage.id);

            // Find the immediate next stage to advance to
            const nextStage = db.prepare(`
              SELECT * FROM client_compliance_stages 
              WHERE engagement_id = ? AND sequence_order > ? 
              ORDER BY sequence_order ASC LIMIT 1
            `).get(engagement_id, currentStage.sequence_order) as any;

            if (nextStage && nextStage.status === 'pending') {
              db.prepare(`
                UPDATE client_compliance_stages 
                SET status = 'in_progress', started_at = ?, updated_at = ? 
                WHERE id = ?
              `).run(now, now, nextStage.id);

              console.log(`[WORKFLOW] 100% Checklist complete for ${stageCode}. Advanced engagement ${engagement_id} to sequence ${nextStage.sequence_order}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, document_id: docId, file_url: fileUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
