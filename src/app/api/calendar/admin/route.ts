import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.role === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let query = `
      SELECT cc.id, cc.engagement_code, cc.due_date, cc.status,
             c.id as client_id, c.display_name as client_name, c.client_type,
             t.name as template_name, t.color_code,
             u.first_name || ' ' || u.last_name as assignee_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates t ON cc.template_id = t.id
      LEFT JOIN users u ON cc.assignee_id = u.id
      WHERE cc.due_date IS NOT NULL
    `;
    
    // Simplistic date filtering if provided
    const queryParams: any[] = [];
    if (startDate) {
      query += ` AND cc.due_date >= ?`;
      queryParams.push(startDate);
    }
    if (endDate) {
      query += ` AND cc.due_date <= ?`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY cc.due_date ASC`;

    const tasks = db.prepare(query).all(...queryParams);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Calendar Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
