// Engagement numbers (ENG-2025-0016). The next number is one above the highest
// number this firm already uses. The routes used to take "count of every
// engagement of every firm, plus one", which repeats a number as soon as one is
// deleted, mixes firms, and (before numbers came back as numbers) produced
// "151" for 15.

/** The next ENG-YYYY-NNNN number for a firm. */
export async function nextEngagementCode(db: any, orgId: string, year: string | number): Promise<string> {
  const row = await db
    .prepare(
      `SELECT COALESCE(MAX(CAST(SPLIT_PART(engagement_code, '-', 3) AS INTEGER)), 0) AS n
       FROM client_compliances
       WHERE org_id = ? AND engagement_code ~ '^ENG-[0-9]{4}-[0-9]+$'`,
    )
    .get(orgId);
  const next = (Number(row?.n) || 0) + 1;
  return `ENG-${year}-${String(next).padStart(4, '0')}`;
}

/** `base`, or `base-2`, `base-3`, … if this firm already has an engagement with that code. */
export async function uniqueEngagementCode(db: any, orgId: string, base: string): Promise<string> {
  let code = base;
  for (let n = 2; n < 1000; n++) {
    const taken = await db.prepare('SELECT 1 AS x FROM client_compliances WHERE org_id = ? AND engagement_code = ?').get(orgId, code);
    if (!taken) return code;
    code = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}
