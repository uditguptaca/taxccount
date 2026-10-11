import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth-context';
import { checkSourceUrl, copyChunk, finish, ImportError, plan, prepareReplace, redact } from '@/lib/db-import';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Copy the data of an OLD database into the database the app runs on (Neon).
 * Platform admin only. The old address arrives in the request body, is used for
 * that one request, and is never stored, logged or returned.
 *
 *   { action: 'plan',    url }
 *   { action: 'prepare', url, confirm: 'REPLACE' }       replace mode only: empties this database first
 *   { action: 'copy',    url, table, offset, limit }
 *   { action: 'finish',  url, mode: 'replace' | 'add' }
 */
export async function POST(request: Request) {
  const session = getSessionContext();
  if (!session || session.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Only a platform admin can import data.' }, { status: 403 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }); }

  let url = '';
  try {
    url = checkSourceUrl(body?.url);
    switch (body?.action) {
      case 'plan':
        return NextResponse.json(await plan(url));
      case 'prepare':
        if (body.confirm !== 'REPLACE') throw new ImportError('Type REPLACE to confirm that everything in the current database will be replaced.');
        return NextResponse.json(await prepareReplace(url));
      case 'copy':
        if (typeof body.table !== 'string') throw new ImportError('Which table?');
        return NextResponse.json(await copyChunk(url, body.table, Number(body.offset) || 0, Number(body.limit) || 1000));
      case 'finish':
        return NextResponse.json(await finish(url, body.mode === 'replace' ? 'replace' : 'add'));
      default:
        throw new ImportError('Unknown action.');
    }
  } catch (err: any) {
    if (err instanceof ImportError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error('[import] failed:', redact(String(err?.message || err), url));
    return NextResponse.json({ error: redact(String(err?.message || 'The import failed.'), url) }, { status: 500 });
  }
}
