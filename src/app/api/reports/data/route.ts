import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'overview';

    let data = {};

    switch (tab) {
      case 'overview': {
        const activeClients = db.prepare(`SELECT COUNT(*) as c FROM clients WHERE status='active'`).get() as any;
        const missingDocs = db.prepare(`SELECT COUNT(*) as c FROM engagement_doc_requirements WHERE is_mandatory=1 AND status='pending'`).get() as any;
        const overdueTasks = db.prepare(`SELECT COUNT(*) as c FROM client_compliances WHERE status != 'completed' AND due_date < date('now')`).get() as any;
        const totalRevenue = db.prepare(`SELECT SUM(amount) as c FROM invoices WHERE status='paid'`).get() as any;
        
        data = {
          active_clients: activeClients.c || 0,
          missing_docs: missingDocs.c || 0,
          overdue_tasks: overdueTasks.c || 0,
          revenue: totalRevenue.c || 0
        };
        break;
      }
      case 'productivity': {
        const rows = db.prepare(`
          SELECT u.id, u.first_name || ' ' || u.last_name as employee_name,
            (SELECT COUNT(*) FROM client_compliance_stages s JOIN client_compliances cc ON s.engagement_id=cc.id WHERE cc.assignee_id=u.id AND s.status='completed') as tasks_completed,
            (SELECT COUNT(DISTINCT cc.client_id) FROM client_compliances cc WHERE cc.assignee_id=u.id AND cc.status != 'completed') as active_clients,
            (SELECT COUNT(*) FROM client_compliances cc WHERE cc.assignee_id=u.id AND cc.status != 'completed' AND cc.due_date < date('now')) as overdue_tasks,
            0 as communication_exchanges
          FROM users u
          WHERE u.role != 'client'
        `).all();
        // Since we don't have direct attribution for revenue per stage in the MVP schema, we stub communication_exchanges.
        data = rows;
        break;
      }
      case 'compliance': {
        // Client Compliance Status list
        const rows = db.prepare(`
          SELECT 
            c.id, c.display_name as client_name, c.client_code,
            cc.id as engagement_id, cc.engagement_code, ct.name as project_name, 
            cc.status, cc.due_date,
            (SELECT COUNT(*) FROM engagement_doc_requirements WHERE engagement_id = cc.id AND is_mandatory=1 AND status='pending') as missing_docs_count,
            (SELECT COUNT(*) FROM client_compliance_stages WHERE engagement_id = cc.id AND status='completed') * 100.0 / 
              MAX((SELECT COUNT(*) FROM client_compliance_stages WHERE engagement_id = cc.id), 1) as percent_complete
          FROM client_compliances cc
          JOIN clients c ON c.id = cc.client_id
          JOIN compliance_templates ct ON ct.id = cc.template_id
          ORDER BY cc.due_date ASC
        `).all();
        data = rows;
        break;
      }
      case 'revenue': {
        const rows = db.prepare(`
          SELECT 
            i.id, i.invoice_number, c.display_name as client_name, i.amount, i.due_date, i.status, i.created_at
          FROM invoices i
          JOIN clients c ON c.id = i.client_id
          ORDER BY i.created_at DESC
        `).all();
        
        const summary = db.prepare(`
          SELECT 
            SUM(amount) as total_revenue,
            SUM(CASE WHEN status='pending' OR status='overdue' THEN amount ELSE 0 END) as outstanding_revenue,
            COUNT(CASE WHEN status='paid' THEN 1 END) as paid_count,
            COUNT(CASE WHEN status!='paid' THEN 1 END) as pending_count
          FROM invoices
        `).get();
        
        data = { records: rows, summary };
        break;
      }
      case 'active-clients': {
        const rows = db.prepare(`
          SELECT 
            c.id, c.display_name as client_name, c.client_code, c.status, c.created_at as onboarded_date,
            (SELECT COUNT(*) FROM client_compliances WHERE client_id=c.id AND status!='completed') as active_projects
          FROM clients c
          WHERE c.status='active'
        `).all();
        data = rows;
        break;
      }
      case 'churn': {
        const safeRows = db.prepare(`
          SELECT 
            c.id, c.display_name as client_name, c.client_code, c.status,
            c.created_at as onboarded_date,
            MAX(df.created_at) as last_interaction_date,
            (SELECT COUNT(*) FROM client_compliances WHERE client_id=c.id AND status!='completed') as active_engagements
          FROM clients c
          LEFT JOIN document_files df ON df.client_id = c.id
          GROUP BY c.id
          HAVING active_engagements = 0
          ORDER BY last_interaction_date ASC
        `).all();

        data = safeRows;
        break;
      }
      case 'workflow': {
        const rows = db.prepare(`
          SELECT 
            stage_code, stage_name, 
            COUNT(*) as active_count,
            COUNT(CASE WHEN updated_at < date('now', '-7 days') THEN 1 END) as stale_count
          FROM client_compliance_stages
          WHERE status IN ('in_progress', 'pending')
          GROUP BY stage_code, stage_name
          ORDER BY active_count DESC
        `).all();
        data = rows;
        break;
      }
      case 'reminders': {
        const rows = db.prepare(`
          SELECT r.id, c.display_name as client_name, r.message, r.trigger_date as due_date, r.status, 
                 0 as is_read, r.created_at
          FROM reminders r
          LEFT JOIN clients c ON r.client_id = c.id
          ORDER BY r.created_at DESC
        `).all();
        
        const summary = db.prepare(`
          SELECT 
            COUNT(*) as total_sent,
            COUNT(CASE WHEN status='sent' THEN 1 END) as total_read,
            COUNT(CASE WHEN status='completed' THEN 1 END) as total_completed
          FROM reminders
        `).get();
        data = { records: rows, summary };
        break;
      }
      case 'missing-documents': {
        // Reuse the same query logically, but adapted for unified endpoint
        const rows = db.prepare(`
          SELECT 
            c.display_name as client_name, c.client_code,
            ct.name as template_name, cc.engagement_code, cc.due_date,
            ctd.document_name, ctd.description as document_description,
            'Pending' as document_status
          FROM client_compliances cc
          JOIN clients c ON cc.client_id = c.id
          JOIN compliance_templates ct ON cc.template_id = ct.id
          JOIN compliance_template_documents ctd ON ct.id = ctd.template_id
          LEFT JOIN document_files df 
            ON df.engagement_id = cc.id 
            AND df.template_doc_id = ctd.id
          WHERE cc.status NOT IN ('completed', 'cancelled')
            AND ctd.is_mandatory = 1
            AND df.id IS NULL
          ORDER BY cc.due_date ASC
        `).all();
        data = rows;
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid tab type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, tab, data });
  } catch (error: any) {
    console.error('Report execution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
