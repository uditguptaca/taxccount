import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const form = await db.prepare("SELECT * FROM smart_forms WHERE id = ? AND is_super_template = 1").get(id);
    if (!form) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const activeVersionId = form.current_version;

    const sections = await db.prepare("SELECT * FROM smart_form_sections WHERE version_id = ? ORDER BY sort_order ASC").all(activeVersionId);
    const questions = await db.prepare("SELECT * FROM smart_form_questions WHERE version_id = ? ORDER BY sort_order ASC").all(activeVersionId);

    return NextResponse.json({
      form,
      sections,
      questions
    });
  } catch (err: any) {
    console.error('GET Super Form Template Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
