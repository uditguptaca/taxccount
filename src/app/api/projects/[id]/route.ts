import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = await params;

    const project = db.prepare(`
      SELECT cc.*, c.display_name as client_name, c.client_code, c.id as client_id, ct.name as template_name, ct.code as template_code,
        t.name as team_name
      FROM client_compliances cc
      JOIN clients c ON c.id = cc.client_id
      JOIN compliance_templates ct ON ct.id = cc.template_id
      LEFT JOIN teams t ON t.id = cc.assigned_team_id
      WHERE cc.id = ?
    `).get(id);
    
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const stages = db.prepare(`
      SELECT ccs.*, u.first_name || ' ' || u.last_name as assigned_name
      FROM client_compliance_stages ccs
      LEFT JOIN users u ON u.id = ccs.assigned_user_id
      WHERE ccs.engagement_id = ?
      ORDER BY ccs.sequence_order ASC
    `).all(id);

    const documents = db.prepare(`
      SELECT df.*, u.first_name || ' ' || u.last_name as uploader_name
      FROM document_files df
      LEFT JOIN users u ON u.id = df.uploaded_by
      WHERE df.engagement_id = ?
      ORDER BY df.created_at DESC
    `).all(id);

    const checklist = db.prepare(`
      SELECT ctd.*
      FROM compliance_template_documents ctd
      WHERE ctd.template_id = (SELECT template_id FROM client_compliances WHERE id = ?)
    `).all(id);

    return NextResponse.json({ project, stages, documents, checklist });
  } catch (error) {
    console.error('Project detail error:', error);
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'transition_stage') {
      const { stage_id, new_status } = body;
      const now = new Date().toISOString();

      // Update stage
      if (new_status === 'in_progress') {
        db.prepare(`UPDATE client_compliance_stages SET status = ?, started_at = ?, updated_at = ? WHERE id = ?`).run(new_status, now, now, stage_id);

        // Feature 8.1: Automated Draft Invoices
        const currentStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE id = ?`).get(stage_id) as any;
        if (currentStage && (currentStage.stage_name.toLowerCase().includes('billing') || currentStage.stage_name.toLowerCase().includes('invoic'))) {
          const engagement = db.prepare(`
            SELECT cc.client_id, ct.default_price, ct.name as template_name
            FROM client_compliances cc
            JOIN compliance_templates ct ON cc.template_id = ct.id
            WHERE cc.id = ?
          `).get(id) as any;
          if (engagement) {
            const existing = db.prepare(`SELECT id FROM invoices WHERE engagement_id = ?`).get(id);
            if (!existing) {
              const amount = engagement.default_price || 0;
              const v4 = require('uuid').v4;
              const invId = v4();
              const invNumber = 'INV-' + Math.floor(1000 + Math.random() * 9000);
              db.prepare(`
                INSERT INTO invoices (id, invoice_number, engagement_id, client_id, amount, tax_amount, total_amount, status, description, created_by, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 0, ?, 'draft', ?, 'system', ?, ?)
              `).run(invId, invNumber, id, engagement.client_id, amount, amount, `Draft Invoice for ${engagement.template_name}`, now, now);
              console.log('[WORKFLOW] Automated draft invoice generated for project entering Billing stage:', id);
            }
          }
        }
      } else if (new_status === 'completed') {
        db.prepare(`UPDATE client_compliance_stages SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?`).run(new_status, now, now, stage_id);
        
        // Auto-start next stage ONLY IF this current stage is configured for auto_advance
        const currentStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE id = ?`).get(stage_id) as any;
        const templateStage = db.prepare(`SELECT auto_advance FROM compliance_template_stages WHERE id = ?`).get(currentStage.template_stage_id) as any;
        
        const nextStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND sequence_order = ?`).get(id, currentStage.sequence_order + 1) as any;
        
        if (nextStage && templateStage && templateStage.auto_advance === 1) {
          db.prepare(`UPDATE client_compliance_stages SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ?`).run(now, now, nextStage.id);
        }

        // Check if all stages complete
        const pending = db.prepare(`SELECT COUNT(*) as count FROM client_compliance_stages WHERE engagement_id = ? AND status NOT IN ('completed','skipped')`).get(id) as any;
        if (pending.count === 0) {
          db.prepare(`UPDATE client_compliances SET status = 'completed', client_facing_status = 'past', completed_at = ?, updated_at = ? WHERE id = ?`).run(now, now, id);
        } else {
          db.prepare(`UPDATE client_compliances SET status = 'in_progress', updated_at = ? WHERE id = ?`).run(now, id);
        }
      } else if (new_status === 'send_back') {
        // Revert current stage to pending
        db.prepare(`UPDATE client_compliance_stages SET status = 'pending', started_at = NULL, updated_at = ? WHERE id = ?`).run(now, stage_id);
        
        // Find previous stage to reactivate
        const currentStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE id = ?`).get(stage_id) as any;
        if (currentStage && currentStage.sequence_order > 1) {
          const prevStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND sequence_order = ?`).get(id, currentStage.sequence_order - 1) as any;
          if (prevStage) {
            db.prepare(`UPDATE client_compliance_stages SET status = 'in_progress', completed_at = NULL, updated_at = ? WHERE id = ?`).run(now, prevStage.id);
          }
        }
        
        // Ensure Project status is not completed
        db.prepare(`UPDATE client_compliances SET status = 'in_progress', completed_at = NULL, updated_at = ? WHERE id = ?`).run(now, id);
        
        // Log mandatory note if provided (assume user id 'admin' if not from session for now)
        if (body.note) {
          const v4 = require('uuid').v4;
          db.prepare(`
            INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(v4(), 'user_1', 'stage_bounced', 'project_stage', stage_id, currentStage.stage_name, currentStage.engagement_id, 'Sent back with note: ' + body.note, now);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
