import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

const categoryMap: Record<string, string> = {
  'accounting': 'Accounting',
  'direct-tax': 'Direct Tax',
  'indirect-tax': 'Indirect Tax',
  'annual-return': 'Annual Return',
  'payroll': 'Payroll'
};

export async function GET(req: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    
    const resolvedParams = await params;
    const categoryKey = resolvedParams.category;
    const mappedCategory = categoryMap[categoryKey] || categoryKey;

    const db = getDb();
    
    const projects = await db.prepare(`
      SELECT 
        cc.id, cc.engagement_code, cc.due_date, cc.status, cc.priority, cc.period_label,
        c.id as client_id, c.display_name as client_name, c.client_code,
        ct.name as template_name, ct.category
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.org_id = ? AND ct.category = ?
      ORDER BY cc.due_date ASC
    `).all(orgId, mappedCategory) as any[];

    // Calculate some basic stats
    const stats = {
      total: projects.length,
      overdue: projects.filter(p => new Date(p.due_date) < new Date() && !['completed', 'filed'].includes(p.status)).length,
      completed: projects.filter(p => ['completed', 'filed'].includes(p.status)).length
    };

    return NextResponse.json({
      category: mappedCategory,
      projects,
      stats
    });

  } catch (error) {
    console.error('Service projects error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
