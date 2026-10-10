// Who may open which T1 intake.
//
// Firm users see the intakes of their own firm. A client signed in to the portal
// sees only the intakes of the client record(s) linked to their login: the routes
// used to check the firm alone, so every client of a firm could list and open
// every other client's tax answers.
import { getSessionContext } from '@/lib/auth-context';
import { clientIdsFor } from '@/lib/portal-client';

export interface IntakeAuth {
  orgId: string;
  userId: string;
  isClient: boolean;
  /** client records this login may see; null for firm users (everything in the firm) */
  clientIds: string[] | null;
}

/** Resolve the caller for a T1 intake route. Null means "not allowed" (answer 401). */
export async function authenticateIntake(_req: Request, db: any, engagementId?: string): Promise<IntakeAuth | null> {
  const session = getSessionContext();
  if (!session || !session.orgId) return null;
  const isClient = session.role === 'client' || session.role === 'individual';
  const clientIds = isClient ? await clientIdsFor(db, session.orgId, session.userId) : null;
  if (clientIds && engagementId) {
    const eng = await db.prepare('SELECT client_id FROM tax_intake_engagements WHERE id = ? AND org_id = ?').get(engagementId, session.orgId);
    if (eng && !clientIds.includes(eng.client_id)) return null;
  }
  return { orgId: session.orgId, userId: session.userId, isClient, clientIds };
}
