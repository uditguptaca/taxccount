import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;


    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const score = searchParams.get('score') || '';
    const assigned = searchParams.get('assigned') || '';
    const stage = searchParams.get('stage') || '';

    let where = 'WHERE l.org_id = ?';
    const params: any[] = [orgId];

    if (search) {
      where += ` AND (l.first_name || ' ' || COALESCE(l.last_name,'') LIKE ? OR l.company_name LIKE ? OR l.email LIKE ? OR l.lead_code LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) { where += ` AND l.status = ?`; params.push(status); }
    if (source) { where += ` AND l.source = ?`; params.push(source); }
    if (score) { where += ` AND l.lead_score = ?`; params.push(score); }
    if (assigned) { where += ` AND l.assigned_to = ?`; params.push(assigned); }
    if (stage) { where += ` AND l.pipeline_stage = ?`; params.push(stage); }

    const leads = db.prepare(`
      SELECT l.*,
        u.first_name || ' ' || u.last_name as assigned_name,
        (SELECT COUNT(*) FROM lead_activities WHERE lead_id = l.id) as activity_count,
        (SELECT COUNT(*) FROM lead_tasks WHERE lead_id = l.id AND status != 'completed' AND status != 'cancelled') as pending_tasks
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      ${where}
      ORDER BY
        CASE l.lead_score WHEN 'hot' THEN 1 WHEN 'warm' THEN 2 WHEN 'cold' THEN 3 END,
        l.updated_at DESC
    `).all(...params);

    // Pipeline counts
    const pipelineCounts = db.prepare(`
      SELECT pipeline_stage, COUNT(*) as count
      FROM leads WHERE status = 'active' AND org_id = ?
      GROUP BY pipeline_stage
    `).all(orgId);

    const teamMembers = db.prepare(`
      SELECT u.id, u.first_name || ' ' || u.last_name as name
      FROM users u 
      JOIN organization_memberships om ON u.id = om.user_id
      WHERE om.org_id = ? AND u.is_active = 1
      ORDER BY u.first_name
    `).all(orgId);

    return NextResponse.json({ leads, pipelineCounts, teamMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;


    const db = getDb();
    const body = await request.json();
    const id = uuidv4();

    const count = (db.prepare('SELECT COUNT(*) as c FROM leads WHERE org_id = ?').get(orgId) as any).c;
    const leadCode = `LEAD-${String(count + 1).padStart(4, '0')}`;

    db.prepare(`
      INSERT INTO leads (id, org_id, lead_code, first_name, last_name, company_name, email, phone, lead_type, source, pipeline_stage, lead_score, expected_value, status, assigned_to, tags, notes, city, province, postal_code, next_followup_date, referral_source, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_inquiry', ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id, orgId, leadCode,
      body.first_name, body.last_name || null, body.company_name || null,
      body.email || null, body.phone || null,
      body.lead_type || 'individual', body.source || 'website',
      body.lead_score || 'warm', body.expected_value || 0,
      body.assigned_to || null, body.tags || null, body.notes || null,
      body.city || null, body.province || null, body.postal_code || null,
      body.next_followup_date || null, body.referral_source || null,
      userId
    );

    // Log creation activity
    db.prepare(`
      INSERT INTO lead_activities (id, lead_id, activity_type, summary, contact_date, created_by, created_at)
      VALUES (?, ?, 'note', 'Lead created.', datetime('now'), ?, datetime('now'))
    `).run(uuidv4(), id, userId);

    // Log in activity feed
    db.prepare(`
      INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, entity_name, details, created_at)
      VALUES (?, ?, ?, 'created_lead', 'lead', ?, ?, 'Created new lead', datetime('now'))
    `).run(uuidv4(), orgId, userId, id, `${body.first_name} ${body.last_name || ''}`.trim());

    return NextResponse.json({ id, lead_code: leadCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;


    const db = getDb();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const oldLead = db.prepare('SELECT * FROM leads WHERE id = ? AND org_id = ?').get(id, orgId) as any;
    if (!oldLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Build dynamic update
    const setClauses: string[] = ['updated_at = datetime(\'now\')'];
    const vals: any[] = [];
    const allowed = ['first_name','last_name','company_name','email','phone','lead_type','source','pipeline_stage','lead_score','expected_value','status','assigned_to','tags','notes','city','province','postal_code','next_followup_date','last_contact_date','lost_reason','referral_source'];

    for (const key of allowed) {
      if (key in updates) {
        setClauses.push(`${key} = ?`);
        vals.push(updates[key]);
      }
    }

    vals.push(id, orgId);
    db.prepare(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = ? AND org_id = ?`).run(...vals);

    // Log stage change activity
    if (updates.pipeline_stage && updates.pipeline_stage !== oldLead.pipeline_stage) {
      const stageLabels: Record<string, string> = {
        new_inquiry: 'New Inquiry', contacted: 'Contacted', meeting_scheduled: 'Meeting Scheduled',
        proposal_sent: 'Proposal Sent', negotiation: 'Negotiation', qualified: 'Qualified',
        converted: 'Converted', lost: 'Lost'
      };
      db.prepare(`
        INSERT INTO lead_activities (id, lead_id, activity_type, summary, contact_date, created_by, created_at)
        VALUES (?, ?, 'stage_change', ?, datetime('now'), ?, datetime('now'))
      `).run(uuidv4(), id, `Pipeline stage changed: ${stageLabels[oldLead.pipeline_stage] || oldLead.pipeline_stage} → ${stageLabels[updates.pipeline_stage] || updates.pipeline_stage}`, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    
    if (role === 'team_member') {
      return NextResponse.json({ error: 'Unauthorized: Team members cannot delete records' }, { status: 403 });
    }

    const db = getDb();
    const { id } = await request.json();
    db.prepare('DELETE FROM leads WHERE id = ? AND org_id = ?').run(id, orgId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
