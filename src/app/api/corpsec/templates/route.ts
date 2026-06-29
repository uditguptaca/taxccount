import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId } = session;
    const db = getDb();
    
    const templates = await db.prepare('SELECT * FROM cs_document_templates ORDER BY category, name').all();
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('[CorpSec Templates GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
