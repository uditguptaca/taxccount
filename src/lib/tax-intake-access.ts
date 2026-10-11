// Who may open which T1 intake.
//
// Firm users see the intakes of their own firm. A client signed in to the portal
// sees only the intakes of the client record(s) linked to their login. When an
// intake is named, it must exist in the caller's firm for EVERYONE: a firm user
// from another firm gets the same answer as for an id that does not exist.
import { getSessionContext } from '@/lib/auth-context';
import { clientIdsFor } from '@/lib/portal-client';

export interface IntakeAuth {
  orgId: string;
  userId: string;
  role: string;
  isClient: boolean;
  /** client records this login may see; null for firm users (everything in the firm) */
  clientIds: string[] | null;
  /** the intake that was asked for, when an id was given */
  engagement?: any;
}

/** Resolve the caller for a T1 intake route. Null means "not allowed" (answer 401). */
export async function authenticateIntake(_req: Request, db: any, engagementId?: string): Promise<IntakeAuth | null> {
  const session = getSessionContext();
  if (!session || !session.orgId) return null;
  const isClient = session.role === 'client' || session.role === 'individual';
  const clientIds = isClient ? await clientIdsFor(db, session.orgId, session.userId) : null;
  const auth: IntakeAuth = { orgId: session.orgId, userId: session.userId, role: session.role, isClient, clientIds };
  if (engagementId) {
    const eng = await db.prepare('SELECT * FROM tax_intake_engagements WHERE id = ? AND org_id = ?').get(engagementId, session.orgId);
    if (!eng) return null;
    if (clientIds && !clientIds.includes(eng.client_id)) return null;
    auth.engagement = eng;
  }
  return auth;
}

/** The client may change their answers until they submit; after that only the firm can reopen the form. */
export const CLIENT_EDITABLE = ['not_started', 'in_progress', 'awaiting_documents', 'needs_clarification', 'returned_to_client'];
export const clientMayEdit = (status: string) => CLIENT_EDITABLE.includes(status);
