// "How long is left": the time to a due date the way a person says it. Pure, so the page and the tests share it.

/** Whole days from today to a date (negative when it has passed). Both are YYYY-MM-DD. */
export const daysTo = (iso: string, today: string) => Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);

export function timeLeft(iso: string | null | undefined, today: string): { text: string; tone: 'red' | 'yellow' | 'green' | 'gray'; days: number | null } {
  if (!iso) return { text: 'no date', tone: 'gray', days: null };
  const n = daysTo(iso, today);
  if (n < 0) return { text: `${-n} ${n === -1 ? 'day' : 'days'} overdue`, tone: 'red', days: n };
  if (n === 0) return { text: 'due today', tone: 'red', days: n };
  if (n === 1) return { text: 'due tomorrow', tone: 'red', days: n };
  if (n <= 7) return { text: `${n} days left`, tone: 'red', days: n };
  if (n <= 30) return { text: `${n} days left`, tone: 'yellow', days: n };
  // rounded DOWN: a deadline tool must never promise more time than there is (33 days is "4 weeks", not "5 weeks")
  if (n <= 90) return { text: `${Math.floor(n / 7)} weeks left`, tone: 'green', days: n };
  const months = Math.floor(n / 30.44);
  return { text: `${months} ${months === 1 ? 'month' : 'months'} left`, tone: 'green', days: n };
}
