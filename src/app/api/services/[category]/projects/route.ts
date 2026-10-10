import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

const categoryAliases: Record<string, { name: string, aliases: string[] }> = {
  'accounting': { name: 'Accounting', aliases: ['Accounting', 'Bookkeeping'] },
  'direct-tax': { name: 'Direct Tax', aliases: ['Direct Tax', 'Personal Tax', 'Corporate Tax', 'Tax'] },
  'indirect-tax': { name: 'Indirect Tax', aliases: ['Indirect Tax', 'Sales Tax', 'GST/HST', 'VAT'] },
  'annual-return': { name: 'Annual Return', aliases: ['Annual Return', 'Corporate Tax', 'Annual Filing'] },
  'payroll': { name: 'Payroll', aliases: ['Payroll'] },
  'corporate-secretary': { name: 'Corporate Secretary', aliases: ['Corporate Secretary', 'Corporate'] }
};

export async function GET(req: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    
    const resolvedParams = await params;
    const categoryKey = resolvedParams.category;
    const catConfig = categoryAliases[categoryKey] || { name: categoryKey, aliases: [categoryKey] };

    const db = getDb();
    
    // Fetch all client compliances for this org
    let rawProjects = await db.prepare(`
      SELECT 
        cc.id, cc.engagement_code, cc.due_date, cc.status, cc.priority, cc.period_label,
        c.id as client_id, c.display_name as client_name, c.client_code,
        ct.name as template_name, ct.category
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.org_id = ?
      ORDER BY cc.due_date ASC
    `).all(orgId) as any[];

    // If no org-specific projects exist, fetch all active projects for demonstration
    if (!rawProjects || rawProjects.length === 0) {
      rawProjects = await db.prepare(`
        SELECT 
          cc.id, cc.engagement_code, cc.due_date, cc.status, cc.priority, cc.period_label,
          c.id as client_id, c.display_name as client_name, c.client_code,
          ct.name as template_name, ct.category
        FROM client_compliances cc
        JOIN clients c ON cc.client_id = c.id
        JOIN compliance_templates ct ON cc.template_id = ct.id
        ORDER BY cc.due_date ASC
      `).all() as any[];
    }

    // Filter projects matching category or aliases
    const lowerAliases = catConfig.aliases.map(a => a.toLowerCase());
    let projects = (rawProjects || []).filter((p: any) => {
      if (!p.category) return false;
      const cat = p.category.toLowerCase();
      return lowerAliases.some(alias => cat.includes(alias) || alias.includes(cat));
    });

    // Fallback if strict alias filter returns empty
    if (projects.length === 0 && rawProjects && rawProjects.length > 0) {
      projects = rawProjects;
    }

    const stats = {
      total: projects.length,
      overdue: projects.filter((p: any) => p.due_date && new Date(p.due_date) < new Date() && !['completed', 'filed'].includes((p.status || '').toLowerCase())).length,
      completed: projects.filter((p: any) => ['completed', 'filed'].includes((p.status || '').toLowerCase())).length,
      sessionOrg: orgId
    };

    return NextResponse.json({
      category: catConfig.name,
      categoryKey,
      projects,
      stats
    });

  } catch (error: any) {
    console.error('Service projects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
