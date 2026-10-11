import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authenticateIntake as authenticate, clientMayEdit } from '@/lib/tax-intake-access';
import { loadState, findingsOf } from '@/lib/t1-server';
import { CATALOGUE } from '@/lib/t1/catalogue/index';

export const dynamic = 'force-dynamic';

/** Everything the screens need in one call: the engagement, the answers (with their versions), records, files and findings. */
export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const st = await loadState(db, auth.engagement);
    const e = st.engagement;
    // the client never sees the firm's private fields
    const engagement = { id: e.id, clientId: e.client_id, clientName: e.client_name, taxpayerName: e.taxpayer_name, taxYear: e.tax_year, filingType: e.filing_type, province: e.province, status: e.status, language: e.language, currentStep: e.current_step, version: e.row_version, submittedAt: e.submitted_at, dueDate: e.due_date, catalogueVersion: e.catalogue_version, assignedPreparerId: auth.isClient ? undefined : e.assigned_preparer_id, updatedAt: e.updated_at };
    const documents = st.documents.map((d) => auth.isClient ? { ...d, preparer_note: undefined } : d);
    const findings = findingsOf(st);
    return NextResponse.json({
      engagement, catalogueVersion: CATALOGUE.version, formVersionChanged: !!e.catalogue_version && e.catalogue_version !== CATALOGUE.version,
      answers: st.answers, versions: st.versions, records: st.records, documents, legacy: auth.isClient ? [] : st.legacy,
      // clients see what is missing or inconsistent; specialist and internal wording stays with the firm
      findings: auth.isClient ? findings.filter((f) => f.sev === 'blocking' || f.kind === 'required' || f.kind === 'invalid' || f.kind === 'mismatch' || f.kind === 'duplicate').map(({ specialist, ...rest }) => rest) : findings,
      editable: auth.isClient ? clientMayEdit(e.status) : true, isClient: auth.isClient,
    });
  } catch (err: any) {
    console.error('GET Tax Intake State Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
