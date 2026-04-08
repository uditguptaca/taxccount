// ══════════════════════════════════════════════════════════════════
// COMPLIANCE DATE CALCULATOR — Intelligence Engine
// Takes admin-defined formulas + user dates → calculates due dates
// ══════════════════════════════════════════════════════════════════

export interface DateCalcInput {
  dependencyType: string;
  userProvidedDate: string;       // ISO date string from user
  countryFYDefault?: string;      // MM-DD format
  countryFYFixed?: boolean;
  periodType: string;
  periodValue: number;
  graceValue: number;
  graceUnit: string;
}

export interface DateCalcResult {
  nextDueDate: string;
  recurrenceType: string;
  recurrenceLabel: string;
  formulaExplanation: string;
  futureDates: string[];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function addMonths(d: Date, n: number): Date {
  const r = new Date(d); r.setMonth(r.getMonth() + n);
  // Handle month overflow (e.g., Jan 31 + 1 month → Feb 28)
  if (r.getDate() < d.getDate()) r.setDate(0);
  return r;
}
function addYears(d: Date, n: number): Date {
  const r = new Date(d); r.setFullYear(r.getFullYear() + n); return r;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseDateFromMMDD(mmdd: string, year: number): Date {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(year, m - 1, d);
}

export function calculateComplianceDate(input: DateCalcInput): DateCalcResult {
  const now = new Date();
  const currentYear = now.getFullYear();

  // ── STEP 1: Resolve base date ──────────────────────────────────
  let baseDate: Date;

  switch (input.dependencyType) {
    case 'financial_year_corporate_tax':
    case 'financial_year_gst':
    case 'financial_year_payroll':
      if (input.countryFYFixed && input.countryFYDefault) {
        baseDate = parseDateFromMMDD(input.countryFYDefault, currentYear);
      } else {
        baseDate = new Date(input.userProvidedDate);
      }
      break;

    case 'incorporation_date_federal':
    case 'incorporation_date_provincial':
      baseDate = new Date(input.userProvidedDate);
      break;

    case 'calendar_year_fixed':
      // The user date IS the fixed date (e.g., 03-31 for Ontario Annual)
      baseDate = new Date(input.userProvidedDate);
      break;

    case 'specific_event':
      baseDate = new Date(input.userProvidedDate);
      break;

    case 'none':
      return {
        nextDueDate: '',
        recurrenceType: 'none',
        recurrenceLabel: 'No date',
        formulaExplanation: 'This compliance does not have a date requirement',
        futureDates: [],
      };

    default:
      baseDate = new Date(input.userProvidedDate);
  }

  // If somehow it's invalid, fallback to now
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const baseDateStr = formatDateShort(baseDate);

  // ── STEP 2: Add period ─────────────────────────────────────────
  let afterPeriod = new Date(baseDate);

  switch (input.periodType) {
    case 'yearly':
      afterPeriod = addYears(afterPeriod, input.periodValue);
      break;
    case 'semi_annual':
      afterPeriod = addMonths(afterPeriod, 6 * input.periodValue);
      break;
    case 'quarterly':
      afterPeriod = addMonths(afterPeriod, 3);
      break;
    case 'monthly':
      afterPeriod = addMonths(afterPeriod, 1);
      break;
    case 'custom_days':
    case 'custom_extended':
      afterPeriod = addDays(afterPeriod, input.periodValue);
      break;
    case 'renewal':
      afterPeriod = addYears(afterPeriod, input.periodValue);
      break;
    default:
      // No period shift, just grace
      break;
  }

  // ── STEP 3: Add grace period ───────────────────────────────────
  let dueDate = new Date(afterPeriod);

  if (input.graceValue > 0) {
    switch (input.graceUnit) {
      case 'days':
        dueDate = addDays(dueDate, input.graceValue);
        break;
      case 'months':
        dueDate = addMonths(dueDate, input.graceValue);
        break;
      case 'quarters':
        dueDate = addMonths(dueDate, input.graceValue * 3);
        break;
      case 'years':
        dueDate = addYears(dueDate, input.graceValue);
        break;
    }
  }

  // If dueDate is in the past, advance to next occurrence
  while (dueDate <= now) {
    switch (input.periodType) {
      case 'yearly':
      case 'renewal':
        dueDate = addYears(dueDate, input.periodValue || 1);
        break;
      case 'quarterly':
        dueDate = addMonths(dueDate, 3);
        break;
      case 'monthly':
        dueDate = addMonths(dueDate, 1);
        break;
      case 'semi_annual':
        dueDate = addMonths(dueDate, 6);
        break;
      default:
        dueDate = addYears(dueDate, 1);
        break;
    }
  }

  // ── STEP 4: Build formula explanation ──────────────────────────
  let formula = baseDateStr;
  if (input.periodType && input.periodType !== 'none') {
    const periodLabels: Record<string, string> = {
      yearly: `+ ${input.periodValue} Year`, quarterly: '+ 1 Quarter',
      monthly: '+ 1 Month', semi_annual: '+ 6 Months',
      renewal: `+ ${input.periodValue} Years (Renewal)`,
      custom_days: `+ ${input.periodValue} Days`,
    };
    formula += ` ${periodLabels[input.periodType] || ''}`;
  }
  if (input.graceValue > 0) {
    formula += ` + ${input.graceValue} ${input.graceUnit}`;
  }
  formula += ` = ${formatDateShort(dueDate)}`;

  // ── STEP 5: Generate future dates ─────────────────────────────
  const futureDates: string[] = [];
  let nextDate = new Date(dueDate);
  for (let i = 0; i < 5; i++) {
    switch (input.periodType) {
      case 'yearly': case 'renewal':
        nextDate = addYears(nextDate, input.periodValue || 1);
        break;
      case 'quarterly':
        nextDate = addMonths(nextDate, 3);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'semi_annual':
        nextDate = addMonths(nextDate, 6);
        break;
      default:
        nextDate = addYears(nextDate, 1);
    }
    futureDates.push(formatISO(nextDate));
  }

  // ── Recurrence label ──────────────────────────────────────────
  const recurrenceLabels: Record<string, string> = {
    yearly: 'Annually', quarterly: 'Quarterly', monthly: 'Monthly',
    semi_annual: 'Semi-annually', renewal: `Every ${input.periodValue} Years`,
    custom_days: `Every ${input.periodValue} Days`,
  };

  const rruleMap: Record<string, string> = {
    yearly: 'FREQ=YEARLY', quarterly: 'FREQ=QUARTERLY', monthly: 'FREQ=MONTHLY',
    semi_annual: 'FREQ=SEMIANNUAL', renewal: `FREQ=YEARLY;INTERVAL=${input.periodValue}`,
  };

  return {
    nextDueDate: formatISO(dueDate),
    recurrenceType: rruleMap[input.periodType] || 'FREQ=YEARLY',
    recurrenceLabel: recurrenceLabels[input.periodType] || 'Yearly',
    formulaExplanation: formula,
    futureDates,
  };
}

// ── Utility: Determine which base dates are needed ───────────────
export function getRequiredBaseDates(subCompliances: Array<{ dependency_type: string; dependency_label: string; name: string }>): Array<{
  dependencyType: string;
  label: string;
  usedBy: string[];
}> {
  const map = new Map<string, { label: string; usedBy: string[] }>();

  for (const sc of subCompliances) {
    if (!sc.dependency_type || sc.dependency_type === 'none') continue;
    const existing = map.get(sc.dependency_type);
    if (existing) {
      existing.usedBy.push(sc.name);
    } else {
      map.set(sc.dependency_type, {
        label: sc.dependency_label || sc.dependency_type,
        usedBy: [sc.name],
      });
    }
  }

  return Array.from(map.entries()).map(([dt, v]) => ({
    dependencyType: dt,
    label: v.label,
    usedBy: v.usedBy,
  }));
}
