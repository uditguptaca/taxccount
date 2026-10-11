import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authenticateIntake as authenticate } from '@/lib/tax-intake-access';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { buildPackage, toCsv, toText } from '@/lib/t1/package';
import { loadState, findingsOf, ctxOf, uploadsOf } from '@/lib/t1-server';

export const dynamic = 'force-dynamic';

/** The preparer's organizer: ?format=json|csv|text, ?lang=en|fr, ?mask=0 to show social insurance numbers in full. Firm only. */
export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const sp = new URL(req.url).searchParams;
    const st = await loadState(db, auth.engagement);
    const lang = sp.get('lang') === 'fr' ? 'fr' : 'en';
    const pkg = buildPackage(CATALOGUE, ctxOf(st), { lang, uploads: uploadsOf(st), findings: findingsOf(st), taxpayer: st.engagement.taxpayer_name });
    const maskSin = sp.get('mask') !== '0';
    const name = `T1-${st.engagement.tax_year}-${String(st.engagement.taxpayer_name || 'client').replace(/[^\w]+/g, '_')}`;
    const fmt = sp.get('format') || 'json';
    if (fmt === 'csv') return new NextResponse(toCsv(pkg, { maskSin }), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}.csv"`, 'Cache-Control': 'private, no-store' } });
    if (fmt === 'text') return new NextResponse(toText(pkg, { maskSin }), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}.txt"`, 'Cache-Control': 'private, no-store' } });
    return NextResponse.json({ package: pkg, legacy: st.legacy }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err: any) {
    console.error('GET Package Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
