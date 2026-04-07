import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = await params;

    // 1. All documents for this client
    const documents = db.prepare(`
      SELECT df.*,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        cc.engagement_code, cc.financial_year as engagement_year,
        ct.name as template_name,
        cc.id as linked_engagement_id
      FROM document_files df
      LEFT JOIN users u ON df.uploaded_by = u.id
      LEFT JOIN client_compliances cc ON df.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE df.client_id = ?
      ORDER BY df.created_at DESC
    `).all(id) as any[];

    // 2. Distinct financial years from engagements and documents
    const engagementYears = db.prepare(`
      SELECT DISTINCT financial_year FROM client_compliances
      WHERE client_id = ? AND financial_year IS NOT NULL
      ORDER BY financial_year DESC
    `).all(id) as any[];

    const docYears = db.prepare(`
      SELECT DISTINCT financial_year FROM document_files
      WHERE client_id = ? AND financial_year IS NOT NULL AND financial_year != 'Permanent'
      ORDER BY financial_year DESC
    `).all(id) as any[];

    const allYearsSet = new Set<string>();
    engagementYears.forEach((r: any) => allYearsSet.add(r.financial_year));
    docYears.forEach((r: any) => allYearsSet.add(r.financial_year));
    const years = Array.from(allYearsSet).sort((a, b) => b.localeCompare(a));

    // 3. Permanent documents (financial_year = 'Permanent')
    const permanentDocs = documents.filter(d => d.financial_year === 'Permanent');

    // 4. Year-wise documents grouped by subfolder category
    const yearFolders = years.map(year => {
      const yearDocs = documents.filter(d => d.financial_year === year);

      const onboarding = yearDocs.filter(d =>
        d.document_category === 'onboarding' || d.document_category === 'Onboarding Documents'
      );
      const clientProvided = yearDocs.filter(d =>
        d.document_category === 'client_supporting' ||
        d.document_category === 'Client Supporting Documents' ||
        d.document_category === 'general'
      );
      const taxFiling = yearDocs.filter(d =>
        d.document_category === 'final_document' ||
        d.document_category === 'Final Documents' ||
        d.document_category === 'client_signed' ||
        d.document_category === 'Signed Documents' ||
        d.document_category === 'tax_filing'
      );

      // Audit trail: fetch audit_logs for documents of this client+year
      const docIds = yearDocs.map(d => d.id);
      let auditEntries: any[] = [];
      if (docIds.length > 0) {
        const placeholders = docIds.map(() => '?').join(',');
        auditEntries = db.prepare(`
          SELECT al.*, u.first_name || ' ' || u.last_name as actor_name
          FROM audit_logs al
          LEFT JOIN users u ON al.actor_id = u.id
          WHERE al.entity_type = 'document' AND al.entity_id IN (${placeholders})
          ORDER BY al.created_at DESC
        `).all(...docIds) as any[];
      }

      // Also get engagement-level audit logs for this year
      const engagementIds = db.prepare(`
        SELECT id FROM client_compliances WHERE client_id = ? AND financial_year = ?
      `).all(id, year) as any[];

      if (engagementIds.length > 0) {
        const ePlaceholders = engagementIds.map(() => '?').join(',');
        const engAudit = db.prepare(`
          SELECT al.*, u.first_name || ' ' || u.last_name as actor_name
          FROM audit_logs al
          LEFT JOIN users u ON al.actor_id = u.id
          WHERE al.entity_type IN ('document', 'engagement', 'compliance_stage')
            AND (al.entity_id IN (${ePlaceholders}) OR al.details LIKE '%"engagement_id":"' || ? || '"%')
          ORDER BY al.created_at DESC
        `).all(...engagementIds.map((e: any) => e.id), id) as any[];

        // Merge unique entries
        const existingIds = new Set(auditEntries.map(a => a.id));
        engAudit.forEach(a => {
          if (!existingIds.has(a.id)) auditEntries.push(a);
        });
        auditEntries.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
      }

      return {
        year,
        total: yearDocs.length,
        subfolders: {
          onboarding: { label: 'Onboarding Documents', docs: onboarding },
          client_provided: { label: 'Documents Received from Client', docs: clientProvided },
          tax_filing: { label: 'Tax Filing Documents', docs: taxFiling },
        },
        auditTrail: auditEntries,
      };
    });

    // 5. Summary stats
    const totalDocs = documents.length;
    const pendingApproval = documents.filter(d => d.approval_status === 'PENDING').length;
    const approved = documents.filter(d => d.approval_status === 'APPROVED').length;
    const rejected = documents.filter(d => d.approval_status === 'REJECTED').length;

    return NextResponse.json({
      permanentDocs,
      yearFolders,
      years,
      summary: { totalDocs, pendingApproval, approved, rejected, permanentCount: permanentDocs.length },
    });
  } catch (error: any) {
    console.error('Client documents structured error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
