import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { triggerWorkflowEvent } from '@/lib/workflow-engine';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await req.json();
    const { signature_base64, signer_id } = body;

    if (!signature_base64 || !signer_id) {
      return NextResponse.json({ error: 'Signature and Signer ID required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = new Date().toISOString();

    db.transaction(() => {
      // 1. Insert E-Signature Record
      db.prepare(`
        INSERT INTO e_signatures (id, entity_type, entity_id, signer_id, signature_image_url, ip_address, signed_at)
        VALUES (?, 'engagement_letter', ?, ?, ?, ?, ?)
      `).run(uuidv4(), params.id, signer_id, signature_base64, ipAddress, now);

      // 2. Update Engagement Letter Status
      db.prepare(`
        UPDATE engagement_letters 
        SET status = 'signed', signed_at = ?, signed_by_ip = ?, updated_at = ?
        WHERE id = ?
      `).run(now, ipAddress, now, params.id);

      // 3. Trigger Workflow (e.g. Move Job Stage to "In Progress")
      const letter = db.prepare(`SELECT client_id, engagement_id FROM engagement_letters WHERE id = ?`).get(params.id) as any;
      if (letter) {
         triggerWorkflowEvent('SIGNATURE_COLLECTED', {
           client_id: letter.client_id,
           engagement_id: letter.engagement_id,
           entity_id: params.id
         });
      }
    })();

    return NextResponse.json({ message: 'Engagement signed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
