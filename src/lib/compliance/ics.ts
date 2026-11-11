// A calendar file (.ics) of a person's due dates, so their phone or mail calendar reminds them too. Pure.

export interface CalItem { id: string; title: string; date: string; who?: string; penalty?: string | null; sourceUrl?: string | null; authority?: string | null }

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
/** Lines longer than 75 bytes are folded, as the calendar format requires. */
const fold = (line: string) => { const out: string[] = []; let cur = ''; for (const ch of line) { if (Buffer.byteLength(cur + ch, 'utf8') > (out.length ? 74 : 75)) { out.push(cur); cur = ''; } cur += ch; } out.push(cur); return out.join('\r\n '); };
const day = (iso: string) => iso.slice(0, 10).replace(/-/g, '');
const nextDay = (iso: string) => { const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); };

/** One all-day event per due date, with a reminder a week before and the day before. */
export function toIcs(items: CalItem[], stamp: string, site = 'abidebylaw.com'): string {
  const dt = stamp.replace(/[-:]/g, '').replace(/\.\d+/, '').slice(0, 15) + 'Z';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${site}//My compliances//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:My compliances'];
  for (const i of items) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(i.date)) continue;
    const desc = [i.who ? `For: ${i.who}` : '', i.authority ? `Filed with: ${i.authority}` : '', i.penalty ? `If missed: ${i.penalty}` : '', i.sourceUrl ? `Official source: ${i.sourceUrl}` : '', 'General information, not legal or tax advice. Confirm the date on the official source.'].filter(Boolean).join('\n');
    lines.push('BEGIN:VEVENT', `UID:${i.id}-${day(i.date)}@${site}`, `DTSTAMP:${dt}`, `DTSTART;VALUE=DATE:${day(i.date)}`, `DTEND;VALUE=DATE:${nextDay(i.date)}`,
      `SUMMARY:${esc(`Due: ${i.title}`)}`, `DESCRIPTION:${esc(desc)}`, 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Due in 7 days: ${i.title}`)}`, 'TRIGGER:-P7D', 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Due tomorrow: ${i.title}`)}`, 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
