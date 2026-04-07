import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { orgId } = session;
    const { action } = await request.json();

    const db = getDb();
    
    if (action === 'connect') {
      // Mock OAuth flow completion
      const mockToken = `ya29.${Math.random().toString(36).substring(2)}_${Date.now()}`;
      db.prepare('UPDATE organizations SET google_drive_connected = 1, google_drive_token = ? WHERE id = ?').run(mockToken, orgId);
      return NextResponse.json({ success: true, status: 'connected' });
    } else if (action === 'disconnect') {
      db.prepare('UPDATE organizations SET google_drive_connected = 0, google_drive_token = NULL WHERE id = ?').run(orgId);
      return NextResponse.json({ success: true, status: 'disconnected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Google Drive Integration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
