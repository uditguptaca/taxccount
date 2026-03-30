/**
 * Recurrence Engine — RFC 5545 RRULE helpers using the `rrule` npm package.
 * Generates future occurrence dates for recurring compliance engagements.
 */
import { RRule, rrulestr } from 'rrule';

/**
 * Build an RRULE string from a structured UI form.
 */
export function buildRRule(params: {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  byDay?: string[];       // e.g. ['MO','WE','FR']
  byMonthDay?: number[];  // e.g. [15]
  until?: string;         // ISO date
  count?: number;
}): string {
  const freqMap: Record<string, number> = {
    daily: RRule.DAILY,
    weekly: RRule.WEEKLY,
    monthly: RRule.MONTHLY,
    yearly: RRule.YEARLY,
  };

  const options: any = {
    freq: freqMap[params.frequency] ?? RRule.YEARLY,
    interval: params.interval || 1,
  };

  if (params.until) {
    options.until = new Date(params.until);
  }
  if (params.count) {
    options.count = params.count;
  }

  const rule = new RRule(options);
  return rule.toString().replace('RRULE:', '');
}

/**
 * Compute next occurrence dates from an RRULE string and a start date.
 * Returns dates within the horizon window.
 */
export function getNextOccurrences(
  rruleString: string,
  dtstart: string,
  after: string,
  horizonDays: number = 90,
  maxCount: number = 5
): Date[] {
  const startDate = new Date(dtstart);
  const afterDate = new Date(after);
  const horizonDate = new Date(afterDate.getTime() + horizonDays * 86400000);

  try {
    const rule = rrulestr(`DTSTART:${formatRRuleDate(startDate)}\nRRULE:${rruleString}`);
    // Get occurrences between after and horizon
    const occurrences = rule.between(afterDate, horizonDate, true);
    return occurrences.slice(0, maxCount);
  } catch (e) {
    console.error('RRULE parse error:', e);
    return [];
  }
}

/**
 * Get the single next occurrence after a given date.
 */
export function getNextOccurrence(
  rruleString: string,
  dtstart: string,
  after: string
): Date | null {
  const results = getNextOccurrences(rruleString, dtstart, after, 400, 1);
  return results.length > 0 ? results[0] : null;
}

/**
 * Format a Date for RRULE DTSTART (YYYYMMDDTHHmmssZ)
 */
function formatRRuleDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate a human-readable description of an RRULE.
 */
export function describeRRule(rruleString: string): string {
  try {
    const rule = RRule.fromString(`RRULE:${rruleString}`);
    return rule.toText();
  } catch {
    return rruleString;
  }
}

/**
 * Compute a due date from an RRULE occurrence_date and an offset rule.
 */
export function computeDueDate(
  occurrenceDate: Date,
  dueRule: 'manual' | 'offset' | 'fixed',
  offsetDays?: number,
  originalDueDate?: string
): string {
  if (dueRule === 'offset' && offsetDays) {
    const d = new Date(occurrenceDate.getTime() + offsetDays * 86400000);
    return d.toISOString().split('T')[0];
  }
  if (dueRule === 'fixed' && originalDueDate) {
    // For fixed rules, use the same month/day but in the occurrence year
    const orig = new Date(originalDueDate);
    const d = new Date(occurrenceDate.getFullYear(), orig.getMonth(), orig.getDate());
    return d.toISOString().split('T')[0];
  }
  // Manual — keep the original due date pattern relative to the occurrence
  return occurrenceDate.toISOString().split('T')[0];
}

/**
 * Generate an occurrence key for idempotent schedule generation.
 */
export function makeOccurrenceKey(scheduleId: string, occurrenceDate: Date): string {
  return `${scheduleId}-${occurrenceDate.toISOString().split('T')[0]}`;
}
