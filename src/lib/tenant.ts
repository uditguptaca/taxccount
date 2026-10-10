// Firm isolation for routes that take an id from the URL.
//
// A lookup like `SELECT ... WHERE id = ?` returns the row whichever firm owns it,
// so any signed-in user who has an id (from a link, an email, a log) can read or
// change another firm's client, payroll or documents. These guards answer "not
// found" unless the row belongs to the caller's firm; a client signed in to the
// portal is further limited to their own client record.
import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth-context';

const NOT_FOUND = () => NextResponse.json({ error: 'Not found' }, { status: 404 });
const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** Tables whose rows carry an org_id and that routes look up by id. Anything else is refused. */
const FIRM_TABLES = new Set([
  'clients', 'client_compliances', 'document_files', 'chat_threads', 'leads', 'reminders', 'invoices',
  'organizer_instances', 'smart_form_assignments', 'engagement_letters', 'teams', 'compliance_templates',
]);

/** Null when the caller may use this client; otherwise the response to return. */
export async function requireClientAccess(db: any, clientId: string): Promise<NextResponse | null> {
  const session = getSessionContext();
  if (!session || !session.orgId) return UNAUTHORIZED();
  const row = await db.prepare('SELECT id, portal_user_id FROM clients WHERE id = ? AND org_id = ?').get(clientId, session.orgId);
  if (!row) return NOT_FOUND();
  if ((session.role === 'client' || session.role === 'individual') && row.portal_user_id !== session.userId) return NOT_FOUND();
  return null;
}

/** Null when the row (by id) belongs to the caller's firm; otherwise the response to return. */
export async function requireRowInOrg(db: any, table: string, id: string): Promise<NextResponse | null> {
  if (!FIRM_TABLES.has(table)) throw new Error(`requireRowInOrg: ${table} is not a firm table`);
  const session = getSessionContext();
  if (!session || !session.orgId) return UNAUTHORIZED();
  const row = await db.prepare(`SELECT id FROM ${table} WHERE id = ? AND org_id = ?`).get(id, session.orgId);
  return row ? null : NOT_FOUND();
}
