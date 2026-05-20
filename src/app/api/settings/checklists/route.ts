import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();

    // Fetch checklists (hide soft-deleted)
    let checklists = await db.prepare(`SELECT * FROM checklist_library WHERE org_id = ? AND deleted_at IS NULL ORDER BY name ASC`).all(orgId);
    
    if (checklists.length === 0) {
      const defaultId = uuidv4();
      const now = new Date().toISOString();
      
      try {
        await db.prepare(`INSERT INTO checklist_library (id, org_id, name, checklist_code, category, country, status, is_default, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(defaultId, orgId, 'Generic Default Document Checklist', 'DEFAULT', 'General', 'Global', 'Active', 1, 'Standard compliance documents required for most templates', now, now);
        
        const defaultItems = [
          { name: 'Client Intake Form', category: 'client_supporting', stage: 'Onboarding', req: 1 },
          { name: 'Client Identification Document', category: 'client_supporting', stage: 'Onboarding', req: 1 },
          { name: 'Business / Personal Registration Details', category: 'client_supporting', stage: 'Onboarding', req: 1 },
          { name: 'Prior Year Filing / Return Copy', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Current Year Financial Summary', category: 'client_supporting', stage: 'Data Collection', req: 1 },
          { name: 'Bank Statements', category: 'client_supporting', stage: 'Data Collection', req: 1 },
          { name: 'Credit Card Statements', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Income Records', category: 'client_supporting', stage: 'Data Collection', req: 1 },
          { name: 'Expense Records', category: 'client_supporting', stage: 'Data Collection', req: 1 },
          { name: 'Receipts and Supporting Documents', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Tax Slips / Income Certificates', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Payroll Records', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Sales Tax / GST / HST / VAT Records', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Loan / Liability Statements', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Asset Purchase Details', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Investment / Interest / Dividend Statements', category: 'client_supporting', stage: 'Data Collection', req: 0 },
          { name: 'Government Notices / CRA / Tax Department Letters', category: 'client_supporting', stage: 'Review', req: 0 },
          { name: 'Authorization Form', category: 'firm_working_paper', stage: 'Sent to Client', req: 1 },
          { name: 'Engagement Letter', category: 'firm_working_paper', stage: 'Onboarding', req: 1 },
          { name: 'Signed Final Documents', category: 'firm_working_paper', stage: 'Completed', req: 1 },
        ];
        
        const insertItem = db.prepare(`INSERT INTO checklist_library_items (id, org_id, checklist_id, document_name, document_category, is_mandatory, upload_required, upload_by, suggested_stage, client_visible, staff_only, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        let sortOrder = 1;
        for (const item of defaultItems) {
          await insertItem.run(uuidv4(), orgId, defaultId, item.name, item.category, item.req, item.req, 'client', item.stage, 1, item.category === 'firm_working_paper' ? 1 : 0, sortOrder++, now, now);
        }
      } catch (err: any) {
        console.error('Checklist Seed Error:', err);
      }
      
      checklists = await db.prepare(`SELECT * FROM checklist_library WHERE org_id = ? ORDER BY name ASC`).all(orgId);
    }

    
    // Fetch items
    const items = await db.prepare(`SELECT * FROM checklist_library_items WHERE org_id = ? ORDER BY sort_order ASC`).all(orgId);

    // Group items by checklist
    const checklistsWithItems = checklists.map((c: any) => ({
      ...c,
      items: items.filter((i: any) => i.checklist_id === c.id)
    }));

    return NextResponse.json(checklistsWithItems);
  } catch (err: any) {
    console.error('GET Checklists Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    
    const body = await req.json();
    const { name, checklist_code, description, category, country, status, is_default, items } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const checklistId = uuidv4();
    const now = new Date().toISOString();

    if (is_default) {
      await db.prepare(`UPDATE checklist_library SET is_default = 0 WHERE org_id = ?`).run(orgId);
    }

    await db.prepare(`
      INSERT INTO checklist_library (id, org_id, name, checklist_code, description, category, country, status, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(checklistId, orgId, name, checklist_code || null, description || null, category || null, country || null, status || 'Active', is_default ? 1 : 0, now, now);

    if (items && Array.isArray(items)) {
      const insertItem = db.prepare(`
        INSERT INTO checklist_library_items (
          id, org_id, checklist_id, document_name, document_code, description,
          document_category, is_mandatory, upload_required, upload_by,
          suggested_stage, client_visible, staff_only, accepted_file_types, notes, sort_order,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let sortOrder = 1;
      for (const item of items) {
        await insertItem.run(
          uuidv4(), orgId, checklistId,
          item.document_name, item.document_code || null, item.description || null,
          item.document_category || 'client_supporting',
          item.is_mandatory ? 1 : 0, item.upload_required ? 1 : 0, item.upload_by || 'either',
          item.suggested_stage || null, item.client_visible === false ? 0 : 1, item.staff_only ? 1 : 0,
          item.accepted_file_types || null, item.notes || null, sortOrder++,
          now, now
        );
      }
    }

    return NextResponse.json({ success: true, id: checklistId });
  } catch (err: any) {
    console.error('POST Checklist Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
