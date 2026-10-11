import { timingSafeEqual } from 'crypto';
import { getSessionContext } from '@/lib/auth-context';

/**
 * Who may run a scheduled job.
 *
 * - Vercel's own scheduler, which sends `Authorization: Bearer <CRON_SECRET>`
 *   once a CRON_SECRET variable exists in Vercel.
 * - A signed-in platform admin pressing it by hand.
 *
 * There is deliberately no default secret and no "?test_cron=true" shortcut:
 * both used to let anyone on the internet run these jobs.
 */
export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') || '';
  if (secret) {
    const expected = Buffer.from(`Bearer ${secret}`);
    const given = Buffer.from(header);
    if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
  }
  const session = getSessionContext();
  return !!session && session.role === 'platform_admin';
}
