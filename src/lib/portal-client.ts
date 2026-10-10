// Which client record(s) a portal login belongs to.
//
// A signed-in client has a FIRM (session.orgId) and a CLIENT RECORD
// (clients.portal_user_id = their user id). They are different ids: one portal
// route used the firm id where it needed the client id, so no client could ever
// open a form assigned to them.
export async function clientIdsFor(db: any, orgId: string, userId: string): Promise<string[]> {
  const rows = await db.prepare('SELECT id FROM clients WHERE portal_user_id = ? AND org_id = ?').all(userId, orgId);
  return rows.map((r: any) => r.id);
}
