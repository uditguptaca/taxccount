import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    
    // Determine which clients this user has access to
    const accessibleAccounts = db.prepare('SELECT id FROM clients WHERE portal_user_id = ?').all(userId) as any[];
    if (accessibleAccounts.length === 0) return NextResponse.json({ error: 'No client accounts found' }, { status: 404 });

    const clientIds = accessibleAccounts.map(a => a.id);
    const placeholders = clientIds.map(() => '?').join(',');

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let query = `
      SELECT cc.id, cc.engagement_code, cc.due_date, cc.client_facing_status as status,
             c.id as client_id, c.display_name as client_name, c.client_type,
             t.name as template_name, t.color_code,
             u.first_name || ' ' || u.last_name as assignee_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates t ON cc.template_id = t.id
      LEFT JOIN users u ON cc.assignee_id = u.id
      WHERE cc.client_id IN (${placeholders}) AND cc.due_date IS NOT NULL
    `;
    
    const queryParams: any[] = [...clientIds];
    
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
    console.error('Calendar Client API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
