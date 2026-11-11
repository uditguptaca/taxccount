// UNITED STATES, state level. Ten states were read in depth on their own official pages on 2026-11-10
// (Delaware, Wyoming, California, New York, Texas, Florida, Nevada, Washington, Illinois, New Jersey). For the
// other 41 jurisdictions only the annual report rule was read; their income, franchise and sales tax filings
// are generic entries with verified: false, shown to the person as "confirm on the official source".
// Which states tax wages, sales and corporate income comes from the US Census Bureau's state tax collections file.
import type { Compliance, Cond, DueRule, Frequency, Question, Source, State } from '../types.ts';
import { C, afterCalYear, afterFY, afterPeriod, all, anniversary, any, choice, date, etag, event, fixed, fixedIn, inYear, is, kind, not, opts, src, st, stag, yes, yn } from '../dsl.ts';
import { US_STATES } from './geo.ts';

const D = '2026-11-10';
const NO_WAGE_TAX = ['AK', 'FL', 'NV', 'SD', 'TX', 'WY', 'TN', 'NH', 'WA'];
const NO_SALES_TAX = ['AK', 'DE', 'MT', 'NH', 'OR'];
const NO_CORP_TAX = ['NV', 'TX', 'WA', 'WY', 'OH', 'SD'];
const DEEP = ['DE', 'WY', 'CA', 'NY', 'TX', 'FL', 'NV', 'WA', 'IL', 'NJ'];
const NAME: Record<string, string> = Object.fromEntries(US_STATES);

export const US_STATE_LIST: State[] = US_STATES.map(([code, name]) => ({
  code, name,
  tags: [NO_WAGE_TAX.includes(code) ? '' : 'pit', NO_SALES_TAX.includes(code) ? '' : 'sales', NO_CORP_TAX.includes(code) ? '' : 'cit', DEEP.includes(code) ? 'deep' : 'other'].filter(Boolean),
}));

const PERSON = kind('individual', 'sole_prop');
const BIZ = kind('sole_prop', 'partnership', 'corporation', 'llc', 'nonprofit', 'trust');
const TRADING = kind('sole_prop', 'partnership', 'corporation', 'llc');
const PSHIP = kind('partnership');
const NP = kind('nonprofit');
const CCORP = etag('ccorp'), SCORP = etag('scorp');
const LLC = any(kind('llc'), yes('us_is_llc'));                       // legally an LLC, however it is taxed
const CORP = all(kind('corporation'), not(yes('us_is_llc')));         // legally a corporation
const ENTITY = any(kind('corporation', 'llc'), yes('us_is_llc'));     // on the state's register
const PASS_LLC = all(LLC, not(kind('corporation')));                  // an LLC not taxed as a corporation
const OUT = is('us_st_formed', 'other'), HERE = not(OUT);
const SELLS = yes('us_sells');
const EMPLOYER = yes('us_employees');

// States whose yearly report is counted from the date of formation or registration.
const DATE_STATES = ['WY', 'CA', 'NY', 'NV', 'WA', 'IL', 'NJ', 'CO', 'CT', 'DC', 'HI', 'ID', 'IN', 'KS', 'LA', 'OR', 'VA', 'WI', 'AK', 'MA', 'OK', 'SD', 'UT'];
const FORMED_STATES = ['DE', 'ND', 'WI'];

export const US_STATE_QUESTIONS: Question[] = [
  yn('us_is_llc', 'state', 'Is it legally an LLC (limited liability company)?', { show: kind('sole_prop', 'partnership', 'corporation'), help: 'An LLC can be taxed as a sole proprietorship, a partnership or a corporation, but the state still treats it as an LLC for its yearly report and fees.' }),
  choice('us_st_formed', 'state', 'Where was it formed?', { show: all(ENTITY, st(...FORMED_STATES)), options: opts('here|In this state', 'other|In another state or country, and registered to do business here'), help: 'A company formed elsewhere and registered here is a "foreign" entity in this state, and some states give it a different report date.' }),
  date('us_st_date', 'state', 'On what date was it formed, or registered to do business, in this state?', { show: all(any(ENTITY, all(NP, st('WY', 'CA'))), st(...DATE_STATES)), help: 'This state counts its yearly or two-yearly report from this date.' }),
  yn('us_tx_rev', 'state', 'Was its total revenue for the year more than $2,650,000?', { show: all(st('TX'), any(ENTITY, PSHIP)), help: 'At or below this amount no Texas franchise tax is due for report years 2026 and 2027, but the information report is still filed every year.' }),
  yn('us_nv_rev', 'state', 'Was its Nevada gross revenue more than $4,000,000 in the year to June 30?', { show: all(st('NV'), TRADING), help: 'Above this amount the Nevada Commerce Tax return is due. Below it nothing is filed.' }),
  yn('us_ca_fee', 'state', 'Is the LLC\'s income from California more than $250,000?', { show: all(st('CA'), PASS_LLC), help: 'Above this amount an LLC fee is due on top of the $800 annual tax.' }),
  yn('us_nyc', 'state', 'Do you live in New York City or Yonkers?', { show: all(PERSON, st('NY')), help: 'Both add their own resident income tax, paid on the New York State return.' }),
  yn('us_st_other', 'state', 'Did you earn wages or business income in a state other than the one you live in?', { show: PERSON, help: 'Most states that tax income expect a nonresident return from people who earn income there.' }),
  yn('us_st_moved', 'state', 'Did you move to or from another state during the year?', { show: PERSON, help: 'You may then owe a part-year resident return in each state.' }),
  yn('us_st_est', 'state', 'Do you expect to owe state income tax that is not covered by withholding?', { show: all(PERSON, stag('pit')), help: 'Most states that tax income expect quarterly estimated payments, like the IRS.' }),
  yn('us_st_multi', 'state', 'Does it have an office, staff, property or regular business in any other state?', { show: kind('sole_prop', 'partnership', 'corporation', 'llc', 'nonprofit'), help: 'A business usually has to register ("qualify") in each state where it does business, and file that state\'s tax returns and yearly report too.' }),
  yn('us_np_solicit', 'state', 'Does it ask the public for donations?', { show: NP, help: 'Most states make charities register with the state, usually the attorney general, before they ask residents for donations, and renew every year.' }),
  yn('us_sells', 'state', 'Do you sell goods or taxable services to customers in this state?', { show: all(BIZ, any(stag('sales'), st('DE'))), help: 'Sellers register with the state, collect sales tax and file returns. Delaware has no sales tax but charges a gross receipts tax on sellers.' }),
  choice('us_sales_freq', 'state', 'How often does the state have you file sales (or excise) tax returns?', { show: all(BIZ, any(SELLS, all(st('WA'), TRADING))), options: opts('m|Every month', 'q|Every quarter', 'a|Once a year'), help: 'The state assigns it from how much tax you collect. New businesses usually start quarterly. If you have not registered yet, choose "Not sure".' }),
  yn('us_remote', 'state', 'Do you sell more than $100,000 a year to customers in any other state where you have no office or staff?', { show: BIZ, help: 'Since 2018 states can make out-of-state sellers register and collect sales tax once sales into the state pass a threshold, even with no physical presence.' }),
];

// ── annual reports: one line per state rule ──
interface ArX { formed?: 'here' | 'other'; np?: boolean; pship?: boolean; note?: string; penalty?: string; fee?: string; frequency?: Frequency; authority?: string; form?: string; passOnly?: boolean }
function ar(code: string, who: 'corp' | 'llc' | 'both', name: string, due: DueRule, dueText: string, source: string, verified: boolean, x: ArX = {}): Compliance {
  let whoC: Cond = who === 'corp' ? CORP : who === 'llc' ? LLC : ENTITY;
  if (x.np) whoC = any(whoC, NP);
  if (x.pship) whoC = any(whoC, PSHIP);
  const what = who === 'corp' ? 'corporations' : who === 'llc' ? 'LLCs' : 'corporations and LLCs';
  return C(`us_ar_${code.toLowerCase()}_${who}${x.formed ? '_' + x.formed : ''}`, {
    name: `${NAME[code]}: ${name}`, form: x.form ?? name, dept: 'state', head: 'Annual report', authority: x.authority ?? `${NAME[code]} business registry`, weight: 82,
    brief: `${NAME[code]} requires ${what} on its register to file this to stay in good standing.${x.fee ? ' ' + x.fee : ''}`,
    why: `It is ${who === 'both' ? 'a company' : who === 'corp' ? 'a corporation' : 'an LLC'} registered in ${NAME[code]}.`,
    applies: all(st(code), whoC, ...(x.formed === 'here' ? [HERE] : x.formed === 'other' ? [OUT] : [])),
    frequency: x.frequency ?? 'annual', due, dueText, penalty: x.penalty, source, verified, note: x.note, roll: false,
  });
}
const ANNIV = 'us_st_date';
const monthEnd = anniversary(ANNIV, { monthEnd: true });

const ANNUAL_REPORTS: Compliance[] = [
  // deep states
  ar('DE', 'corp', 'Annual report and franchise tax', fixed([[3, 1]], -1), 'Annual reports and franchise taxes for the prior year are due on or before March 1, and must be filed online.', 'de_corp', true, { formed: 'here', authority: 'Delaware Division of Corporations', penalty: '$200 plus 1.5% interest a month on the tax and penalty.', fee: 'The report fee is $50; the franchise tax is at least $175.', note: 'Corporations owing $5,000 or more pay the franchise tax in instalments on June 1, September 1 and December 1, with the balance on March 1.' }),
  ar('DE', 'corp', 'Annual report (foreign corporation)', fixed([[6, 30]]), 'A corporation formed outside Delaware and registered there files an annual report on or before June 30 each year.', 'de_corp', true, { formed: 'other', authority: 'Delaware Division of Corporations', penalty: 'A $250 penalty is added if it is late.', fee: 'The filing fee is $250.' }),
  ar('DE', 'llc', 'Annual tax for LLCs and partnerships', fixed([[6, 1]], -1), 'The annual tax for the prior year is due on or before June 1. There is no annual report.', 'de_alt', true, { pship: true, authority: 'Delaware Division of Corporations', penalty: '$200 plus 1.5% interest a month on the tax and penalty.', fee: 'The tax is $400 for LLCs, limited partnerships and general partnerships formed or registered in Delaware.', note: 'The official page states $400. The amount was $300 until recently; confirm which amount applies to the payment due on your next June 1.' }),
  ar('WY', 'both', 'Annual report and license tax', anniversary(ANNIV, { monthStart: true }), 'Due on the first day of the anniversary month of formation or registration. It can be filed up to 120 days early.', 'wy_sos', true, { np: true, authority: 'Wyoming Secretary of State', penalty: 'Delinquent on the second day of the following month; the company is dissolved if the report is not filed within 60 days after the due date.', fee: 'The license tax is the greater of $60 or $0.0002 per dollar of assets in Wyoming ($25 for nonprofits).' }),
  ar('CA', 'corp', 'Statement of Information', monthEnd, 'Every year, in the six-month window that ends on the last day of the anniversary month of registration. The first statement is due within 90 days of registration.', 'ca_sos', true, { authority: 'California Secretary of State', penalty: '$250, collected by the Franchise Tax Board; continued failure leads to suspension.', fee: 'The fee is $25.' }),
  ar('CA', 'llc', 'Statement of Information', anniversary(ANNIV, { monthEnd: true, every: 2 }), 'Every two years, in the six-month window that ends on the last day of the anniversary month of registration. The first statement is due within 90 days of registration.', 'ca_sos', true, { np: true, frequency: 'annual', authority: 'California Secretary of State', penalty: '$250, collected by the Franchise Tax Board; continued failure leads to suspension.', fee: 'The fee is $20 for an LLC. California nonprofit corporations also file every two years.' }),
  ar('NY', 'both', 'Biennial statement', anniversary(ANNIV, { monthEnd: true, every: 2 }), 'Every two years, during the calendar month in which the company was formed or authorized.', 'ny_dos', true, { authority: 'New York Department of State', fee: 'The fee is $9.' }),
  ar('FL', 'both', 'Annual report', fixed([[5, 1]]), 'Between January 1 and May 1 every year, starting the calendar year after the company was formed.', 'fl_ar', true, { np: true, authority: 'Florida Division of Corporations (Sunbiz)', penalty: 'A $400 late fee after May 1 (not for non-profits). Companies that have not filed by the third Friday of September are dissolved.', fee: 'Fees: $150 for a profit corporation, $138.75 for an LLC, $61.25 for a non-profit corporation.' }),
  ar('NV', 'both', 'Annual list and state business license', monthEnd, 'On or before the last day of the month in which the anniversary of formation falls. The state business license is renewed at the same time.', 'nv_nrs86', true, { authority: 'Nevada Secretary of State', penalty: '$75 on a late annual list and $100 on a late business license.', fee: 'The annual list is $150 or more; the business license is $500 for corporations and $200 for others.' }),
  ar('WA', 'both', 'Annual report', monthEnd, 'By the last day of the month in which the business was formed or registered. It can be filed up to 180 days early.', 'wa_sos', true, { authority: 'Washington Secretary of State', penalty: 'A $25 delinquency fee if late.', fee: 'The fee is $70 online.' }),
  ar('IL', 'both', 'Annual report', anniversary(ANNIV, { monthStart: true, days: -1 }), 'Before the first day of the anniversary month of formation (for a company from outside Illinois, of its authority to do business).', 'il_sos', false, { authority: 'Illinois Secretary of State', fee: 'The filing fee is $75; corporations also pay franchise tax with it.', note: 'The Illinois Secretary of State\'s site refused automated access, so this rule has not been read on the official page.' }),
  ar('NJ', 'both', 'Annual report', monthEnd, 'Every year by the last day of the month in which the business was formed.', 'nj_ar', true, { authority: 'New Jersey Division of Revenue and Enterprise Services', fee: 'The fee is $75.' }),
  // other states: verified on the state's own page
  ar('AR', 'both', 'Annual franchise tax report', fixed([[5, 1]]), 'Reports and taxes are due on or before May 1.', 'ar_ar', true, { fee: 'LLCs pay $150.' }),
  ar('AZ', 'corp', 'Annual report', event('Set for each corporation by the Arizona Corporation Commission'), 'Arizona corporations file an annual report on a date set for each corporation. LLCs do not file annual reports in Arizona.', 'ar_az', false),
  ar('CO', 'both', 'Periodic report', monthEnd, 'Every year in the company\'s periodic report month. It can be filed from two months before to two months after that month without penalty.', 'ar_co', false, { note: 'The date shown assumes the periodic report month is the month of formation. Confirm your month with the Colorado Secretary of State.' }),
  ar('CT', 'llc', 'Annual report', fixed([[3, 31]]), 'Filed online every year from January 1 to March 31.', 'ar_ct', true),
  ar('CT', 'corp', 'Annual report', monthEnd, 'By the last day of the anniversary month of incorporation.', 'ar_ct', false),
  ar('DC', 'llc', 'Two-year report', anniversary(ANNIV, { at: [4, 1], every: 2, offset: 1 }), 'The first report is due April 1 of the year after registration. Later reports are due April 1 every two years after that.', 'ar_dc', true),
  ar('DC', 'corp', 'Two-year report', anniversary(ANNIV, { at: [4, 1], every: 2, offset: 1 }), 'The first report is due April 1 of the year after registration. Later reports are due April 1 every two years after that.', 'ar_dc', false),
  ar('HI', 'both', 'Annual report', anniversary(ANNIV, { quarterEnd: true }), 'During the calendar quarter in which the anniversary of registration falls.', 'ar_hi', true),
  ar('ID', 'both', 'Annual report', monthEnd, 'Each year before the end of the month in which the company was formed.', 'ar_id', true),
  ar('IN', 'both', 'Business entity report', anniversary(ANNIV, { monthEnd: true, every: 2 }), 'For-profit entities file every other year, in the anniversary month in which the entity was created.', 'ar_in', true),
  ar('KS', 'both', 'Information report', anniversary(ANNIV, { at: [4, 15], every: 2 }), 'Every two years: businesses formed in an even year file in each later even year, and those formed in an odd year in odd years. For-profit businesses are due by April 15.', 'ar_ks', true),
  ar('KY', 'both', 'Annual report', fixed([[6, 30]]), 'By June 30 of each year. Reports can be filed any time between January 1 and June 30.', 'ar_ky', true),
  ar('LA', 'corp', 'Annual report', anniversary(ANNIV), 'On or before the anniversary date of the corporation each year.', 'ar_la', true, { fee: 'The fee is $35.' }),
  ar('LA', 'llc', 'Annual report', anniversary(ANNIV), 'On or before the anniversary date each year.', 'ar_la', false),
  ar('ME', 'both', 'Annual report', fixed([[6, 1]]), 'The legal filing deadline is June 1 every year.', 'ar_me', true),
  ar('MD', 'both', 'Annual report and personal property return (Form 1)', fixed([[4, 15]]), 'Due on or before April 15.', 'ar_md', true, { authority: 'Maryland Department of Assessments and Taxation' }),
  ar('MI', 'llc', 'Annual statement', fixed([[2, 15]]), 'February 15 each year after organization or qualification.', 'ar_mi', true),
  ar('MI', 'corp', 'Annual report', fixed([[5, 15]]), 'May 15 each year after incorporation or qualification.', 'ar_mi', true),
  ar('MN', 'both', 'Annual renewal', fixed([[12, 31]]), 'The deadline for renewals is December 31; you can renew at any time during the calendar year.', 'ar_mn', true),
  ar('MO', 'corp', 'Annual registration report', event('Set by the month of incorporation'), 'Missouri corporations file a registration report in a month fixed by their incorporation or renewal month. LLCs do not file an annual report in Missouri.', 'ar_mo', false),
  ar('MT', 'both', 'Annual report', fixed([[4, 15]]), 'Free if filed between January 1 and April 15; $35 after April 15.', 'ar_mt', true),
  ar('NE', 'corp', 'Biennial occupation tax report', fixedIn('even', [[3, 1]]), 'Due in even-numbered years by March 1; delinquent April 15.', 'ar_ne', true),
  ar('NE', 'llc', 'Biennial report', fixedIn('odd', [[4, 1]]), 'Due in odd-numbered years by April 1; delinquent June 16.', 'ar_ne', true),
  ar('NC', 'llc', 'Annual report', fixed([[4, 15]]), 'Due April 15 of each year after the year of creation.', 'ar_nc', true),
  ar('NC', 'corp', 'Annual report', afterFY(4, 15), 'Due the 15th day of the fourth month following the corporation\'s fiscal year end.', 'ar_nc', true),
  ar('ND', 'corp', 'Annual report', fixed([[8, 1]]), 'August 1 for a business corporation formed in North Dakota.', 'ar_nd', true, { formed: 'here' }),
  ar('ND', 'corp', 'Annual report (foreign corporation)', fixed([[5, 15]]), 'May 15 for a business corporation formed elsewhere and registered in North Dakota.', 'ar_nd', true, { formed: 'other' }),
  ar('ND', 'llc', 'Annual report', fixed([[11, 15]]), 'November 15 for limited liability companies.', 'ar_nd', true),
  ar('OR', 'both', 'Annual report (renewal)', anniversary(ANNIV), 'Due every year on the anniversary date of the original filing.', 'ar_or', true),
  ar('PA', 'corp', 'Annual report', fixed([[6, 30]]), 'June 30 of each year for all corporations, business and nonprofit, domestic and foreign.', 'ar_pa', true, { np: true, fee: 'The fee is $7. Pennsylvania introduced this report in 2025.' }),
  ar('PA', 'llc', 'Annual report', fixed([[9, 30]]), 'September 30 of each year for limited liability companies, domestic and foreign.', 'ar_pa', true, { fee: 'The fee is $7. Pennsylvania introduced this report in 2025.' }),
  ar('RI', 'both', 'Annual report', fixed([[5, 1]]), 'The filing period is February 1 to May 1, starting the calendar year after registration.', 'ar_ri', true),
  ar('VT', 'corp', 'Annual report', afterFY(3, 15), 'Within the first two and a half months following the fiscal year end on record.', 'ar_vt', true),
  ar('VT', 'llc', 'Annual report', afterFY(3), 'Within the first three months following the fiscal year end on record.', 'ar_vt', true),
  ar('VA', 'both', 'Annual report and registration fee', monthEnd, 'Each year by the last day of the month in which the company was incorporated or formed. LLCs pay the registration fee only; they file no report.', 'ar_va', true, { authority: 'Virginia State Corporation Commission' }),
  ar('WV', 'both', 'Annual report', fixed([[6, 30]]), 'Between January 1 and June 30 of each year following the calendar year in which the business was registered.', 'ar_wv', true, { fee: 'The fee is $25.' }),
  ar('WI', 'both', 'Annual report', anniversary(ANNIV, { quarterEnd: true }), 'During the calendar quarter in which the anniversary of registration falls.', 'ar_wi', true, { formed: 'here' }),
  ar('WI', 'both', 'Annual report (foreign entity)', fixed([[3, 31]]), 'Entities formed outside Wisconsin file by March 31.', 'ar_wi', true, { formed: 'other' }),
  // other states: the state's site refused automated access, so the rule comes from a search summary only
  ar('AK', 'both', 'Biennial report', anniversary(ANNIV, { at: [1, 2], every: 2 }), 'Every two years, due January 2, in even or odd years according to the year of formation.', 'ar_ak', false),
  ar('GA', 'both', 'Annual registration', fixed([[4, 1]]), 'Between January 1 and April 1 every year.', 'ar_ga', false),
  ar('IA', 'corp', 'Biennial report', fixedIn('even', [[4, 1]]), 'Between January 1 and April 1 of even-numbered years.', 'ar_ia', false),
  ar('IA', 'llc', 'Biennial report', fixedIn('odd', [[4, 1]]), 'Between January 1 and April 1 of odd-numbered years.', 'ar_ia', false),
  ar('MA', 'llc', 'Annual report', anniversary(ANNIV), 'On or before the anniversary date of formation each year.', 'ar_ma', false, { fee: 'The fee is reported as $500.' }),
  ar('MA', 'corp', 'Annual report', afterFY(3, 15), 'Within two and a half months after the fiscal year end.', 'ar_ma', false),
  ar('MS', 'both', 'Annual report', fixed([[4, 15]]), 'Between January 1 and April 15 every year.', 'ar_ms', false),
  ar('NH', 'both', 'Annual report', fixed([[4, 1]]), 'By April 1 every year.', 'ar_nh', false),
  ar('OK', 'llc', 'Annual certificate', anniversary(ANNIV), 'On the anniversary date of formation each year.', 'ar_ok', false),
  ar('SD', 'both', 'Annual report', monthEnd, 'In the anniversary month of formation each year.', 'ar_sd', false),
  ar('TN', 'both', 'Annual report', { t: 'afterYearEnd', basis: 'fy', months: 3, days: 1 }, 'The first day of the fourth month after the fiscal year end.', 'ar_tn', false, { fee: 'The fee is $20 for a corporation and at least $300 for an LLC.' }),
  ar('UT', 'both', 'Annual report (renewal)', anniversary(ANNIV), 'On the anniversary date of registration each year.', 'ar_ut', false),
];
const NO_REPORT_RULE = ['AL', 'NM', 'OH', 'SC'];

// ── sales tax returns: one entry per filing frequency, so each shows its own dates ──
function salesReturns(code: string, authority: string, form: string, source: string, brief: string, rules: Partial<Record<'m' | 'q' | 'a', [DueRule, string]>>, x: { note?: string; penalty?: string; dept?: string; head?: string; who?: Cond; name?: string } = {}): Compliance[] {
  const label = { m: 'monthly', q: 'quarterly', a: 'yearly' } as const, freq = { m: 'monthly', q: 'quarterly', a: 'annual' } as const;
  return (Object.keys(rules) as ('m' | 'q' | 'a')[]).map((f) => C(`us_${code.toLowerCase()}_${x.dept === 'state' ? 'excise' : 'sales'}_${f}`, {
    name: `${NAME[code]} ${x.name ?? 'sales and use tax return'} (${label[f]})`, form, dept: x.dept ?? 'sales', head: x.head ?? 'Sales tax', authority, weight: 84,
    brief, why: `You sell in ${NAME[code]} and file ${label[f]}.`,
    applies: all(st(code), x.who ?? all(BIZ, SELLS), is('us_sales_freq', f)),
    frequency: freq[f], due: rules[f]![0], dueText: rules[f]![1], penalty: x.penalty, source, verified: true, note: x.note,
  }));
}
const m20 = afterPeriod('monthly', 'cal', { months: 1, day: 20 }), q20 = afterPeriod('quarterly', 'cal', { months: 1, day: 20 }), a20 = fixed([[1, 20]], -1);
const mEnd = afterPeriod('monthly', 'cal', { months: 1 }), qEnd = afterPeriod('quarterly', 'cal', { months: 1 }), aEnd = afterCalYear(1);
const T20 = 'the 20th of the month after the reporting period';

const once = (id: string, code: string, name: string, form: string, authority: string, brief: string, dueText: string, source: string, verified = true, applies: Cond = EMPLOYER): Compliance =>
  C(id, { name: `${NAME[code]}: ${name}`, form, dept: 'state', head: 'Employer accounts', authority, weight: 68, brief, why: `You pay employees in ${NAME[code]}.`, applies: all(st(code), applies), frequency: 'once', due: event('When you start paying employees'), dueText, source, verified });

const pit = (code: string, form: string, due: DueRule, dueText: string, source: string, authority: string): Compliance =>
  C(`us_${code.toLowerCase()}_pit`, { name: `${NAME[code]} personal income tax return`, form, dept: 'state', head: 'State income tax', authority, weight: 88,
    brief: `${NAME[code]} taxes the income of its residents, including wages. Business income of a sole proprietor is reported on the same return.`, why: `You live in ${NAME[code]}.`,
    applies: all(PERSON, st(code)), frequency: 'annual', due, dueText, source, verified: true });

export const US_STATE_COMPLIANCES: Compliance[] = [
  // ═══ individuals ═══
  pit('DE', 'Form PIT-RES', afterCalYear(4, 30), 'On or before April 30 for calendar-year filers (not April 15). An extension moves the filing date to October 15, not the payment.', 'de_pit', 'Delaware Division of Revenue'),
  pit('CA', 'Form 540', afterCalYear(4, 15), 'April 15. California gives an automatic extension to file (not to pay) until October 15, with no application.', 'ca_pit', 'California Franchise Tax Board'),
  pit('NY', 'Form IT-201', afterCalYear(4, 15), 'April 15.', 'ny_pit', 'New York State Department of Taxation and Finance'),
  pit('IL', 'Form IL-1040', afterCalYear(4, 15), 'April 15 for calendar-year filers. Illinois gives an automatic six-month extension to file, not to pay.', 'il_pit', 'Illinois Department of Revenue'),
  pit('NJ', 'Form NJ-1040', afterCalYear(4, 15), 'When the federal return is due: April 15 for calendar-year filers.', 'nj_pit', 'New Jersey Division of Taxation'),
  C('us_nyc_tax', { name: 'New York City or Yonkers resident income tax', form: 'On Form IT-201', dept: 'state', head: 'State income tax', authority: 'New York State Department of Taxation and Finance', weight: 60,
    brief: 'New York City and Yonkers add their own income tax on residents. It is worked out and paid on the New York State return, not on a separate return.', why: 'You live in New York City or Yonkers.',
    applies: all(PERSON, st('NY'), yes('us_nyc')), frequency: 'annual', due: afterCalYear(4, 15), dueText: 'With the New York State return: April 15.', source: 'ny_wt', verified: true }),
  C('us_st_pit', { name: 'State personal income tax return', form: 'Your state\'s resident return', dept: 'state', head: 'State income tax', authority: 'Your state tax agency', weight: 85,
    brief: 'Your state taxes personal income, so a state return is due as well as the federal one. Most states use the federal April 15 date, but several do not.', why: 'You live in a state that taxes personal income.',
    applies: all(PERSON, stag('pit'), stag('other')), frequency: 'annual', due: event('Set by your state, often April 15'), dueText: 'Set by your state. Many states follow the federal date of April 15; some use a later date.', source: 'irs_states', verified: false }),
  C('us_st_nonres', { name: 'Nonresident state income tax return', form: 'The other state\'s nonresident return', dept: 'state', head: 'State income tax', authority: 'The other state\'s tax agency', weight: 62,
    brief: 'A state that taxes income usually expects a nonresident return from people who earn wages or business income there. Your home state normally gives a credit for the tax paid.', why: 'You earned income in a state other than the one you live in.',
    applies: all(PERSON, yes('us_st_other')), frequency: 'annual', due: event('Set by the other state'), dueText: 'Set by the state where the income was earned, usually the same date as its resident return.', source: 'irs_states', verified: false,
    note: 'Some neighbouring states have agreements that exempt each other\'s residents on wages, for example New Jersey and Pennsylvania.' }),
  C('us_st_partyear', { name: 'Part-year resident state returns', form: 'Part-year resident return in each state', dept: 'state', head: 'State income tax', authority: 'Each state\'s tax agency', weight: 60,
    brief: 'When you move between states during the year, each state that taxes income usually expects a part-year resident return for the months you lived there.', why: 'You moved to or from another state during the year.',
    applies: all(PERSON, yes('us_st_moved')), frequency: 'annual', due: event('Set by each state'), dueText: 'Set by each state, usually the same date as its resident return.', source: 'irs_states', verified: false }),
  C('us_st_est_tax', { name: 'State estimated income tax', form: 'Your state\'s estimated tax payments', dept: 'state', head: 'Estimated tax', authority: 'Your state tax agency', weight: 60,
    brief: 'States that tax income generally expect quarterly estimated payments when not enough is withheld, in the same way as the IRS.', why: 'You expect to owe state income tax that is not covered by withholding.',
    applies: all(PERSON, stag('pit'), yes('us_st_est')), frequency: 'quarterly', due: event('Set by your state, usually the federal quarterly dates'), dueText: 'Set by your state. Most use the same four dates as the federal estimated tax.', source: 'irs_states', verified: false }),

  // ═══ Delaware ═══
  C('us_de_cit', { name: 'Delaware corporate income tax return', form: 'Form CIT-TAX', dept: 'state', head: 'State income tax', authority: 'Delaware Division of Revenue', weight: 88,
    brief: 'Every corporation doing business in Delaware files this return and pays 8.7% on the income apportioned to Delaware. There is no minimum tax.', why: 'It is a C corporation in Delaware.',
    applies: all(st('DE'), CCORP), frequency: 'annual', due: afterFY(4, 15), dueText: 'April 15 for a calendar-year taxpayer; otherwise the 15th day of the fourth month following the close of the fiscal year. A federal extension extends the filing date, not the payment.', source: 'de_cit', verified: true,
    note: 'A corporation that is only incorporated in Delaware and does no business there owes the franchise tax and annual report, not this return.' }),
  C('us_de_sct', { name: 'Delaware S corporation return', form: 'Form SCT-RTN', dept: 'state', head: 'State income tax', authority: 'Delaware Division of Revenue', weight: 80,
    brief: 'Every S corporation with income from Delaware sources files a reconciliation and shareholder information return. Delaware does not tax the pass-through income at the corporation.', why: 'It is an S corporation in Delaware.',
    applies: all(st('DE'), SCORP), frequency: 'annual', due: event('Confirm the date with the Delaware Division of Revenue'), dueText: 'The official page read states the requirement but not the due date.', source: 'de_cit', verified: false }),
  ...salesReturns('DE', 'Delaware Division of Revenue', 'Gross receipts tax return', 'de_grt', 'Delaware has no sales tax. Instead the seller of goods or the provider of services pays a gross receipts tax on its own receipts, whatever its legal form. New businesses start as quarterly filers.', {
    m: [m20, 'Monthly filers: on or before the 20th day of each month for the receipts of the month before.'],
    q: [qEnd, 'Quarterly filers: on or before the last day of the first month following the close of the quarter.'],
  }, { name: 'gross receipts tax return', head: 'Gross receipts tax', who: all(BIZ, any(is('us_sales_freq', 'm'), is('us_sales_freq', 'q')), SELLS) }),
  once('us_de_emp', 'DE', 'employer withholding and unemployment accounts', 'One Stop registration', 'Delaware Division of Revenue and Department of Labor', 'Employers open a withholding account with the Division of Revenue through the One Stop system, and report hiring to the Division of Unemployment Insurance.', 'Register online through Delaware One Stop when you start paying employees.', 'de_wh'),

  // ═══ Wyoming ═══
  ...salesReturns('WY', 'Wyoming Department of Revenue, Excise Tax Division', 'Sales and use tax return', 'wy_stat', 'Wyoming has a sales and use tax. Monthly filing is the default; quarterly or yearly filing is allowed when the tax is under $150 a month.', {
    m: [mEnd, 'The last day of the month following the reporting period.'], q: [qEnd, 'The last day of the month following the reporting period.'], a: [aEnd, 'The last day of the month following the reporting period.'],
  }),
  once('us_wy_emp', 'WY', 'unemployment insurance and workers\' compensation', 'Employer registration (WYUI)', 'Wyoming Department of Workforce Services', 'Wyoming has no income tax to withhold, but employers register for unemployment insurance and workers\' compensation with the Department of Workforce Services.', 'Register when you start paying employees in Wyoming.', 'wy_dws'),

  // ═══ California ═══
  C('us_ca_100', { name: 'California corporation franchise or income tax return', form: 'Form 100', dept: 'state', head: 'State income tax', authority: 'California Franchise Tax Board', weight: 90,
    brief: 'C corporations incorporated, registered or doing business in California file Form 100. The rate is 8.84%, with an $800 minimum franchise tax that is due even if the corporation is inactive or makes a loss (not in its first year).', why: 'It is a C corporation in California.',
    applies: all(st('CA'), CCORP), frequency: 'annual', due: afterFY(4, 15), dueText: 'The 15th day of the 4th month after the close of the tax year.', source: 'ca_ccorp', verified: true }),
  C('us_ca_100s', { name: 'California S corporation return', form: 'Form 100S', dept: 'state', head: 'State income tax', authority: 'California Franchise Tax Board', weight: 90,
    brief: 'S corporations pay a 1.5% tax on net income, with the $800 minimum franchise tax.', why: 'It is an S corporation in California.',
    applies: all(st('CA'), SCORP), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the close of the tax year.', source: 'ca_scorp', verified: true }),
  C('us_ca_llc_tax', { name: 'California LLC annual tax ($800)', form: 'FTB 3522, LLC Tax Voucher', dept: 'state', head: 'Franchise tax', authority: 'California Franchise Tax Board', weight: 92,
    brief: 'Every LLC organized or doing business in California pays $800 a year, even with no activity, until it is cancelled. The first-year exemption has ended: a new LLC owes it in its first year.', why: 'It is an LLC in California.',
    applies: all(st('CA'), PASS_LLC), frequency: 'annual', due: inYear([4], 15), dueText: 'The 15th day of the 4th month after the beginning of the tax year (April 15 for a calendar year). In the first year: the 15th day of the 4th month from the date the LLC was filed with the Secretary of State.', source: 'ca_llc', verified: true }),
  C('us_ca_llc_fee', { name: 'California LLC fee', form: 'FTB 3536', dept: 'state', head: 'Franchise tax', authority: 'California Franchise Tax Board', weight: 78,
    brief: 'An LLC whose California income is more than $250,000 pays a fee on top of the $800 tax. It is estimated and paid during the year.', why: 'The LLC\'s California income is over $250,000.',
    applies: all(st('CA'), PASS_LLC, yes('us_ca_fee')), frequency: 'annual', due: inYear([6], 15), dueText: 'The 15th day of the 6th month of the current tax year.', source: 'ca_llc', verified: true }),
  C('us_ca_568', { name: 'California LLC return of income', form: 'Form 568', dept: 'state', head: 'State income tax', authority: 'California Franchise Tax Board', weight: 88,
    brief: 'An LLC classified as a partnership files Form 568 every year.', why: 'It is a multi-member LLC in California.',
    applies: all(st('CA'), PSHIP, yes('us_is_llc')), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the close of the tax year (extended due date: the 15th day of the 10th month).', source: 'ca_due', verified: true }),
  C('us_ca_568_sm', { name: 'California LLC return of income (single-member LLC)', form: 'Form 568', dept: 'state', head: 'State income tax', authority: 'California Franchise Tax Board', weight: 88,
    brief: 'A single-member LLC also files Form 568 with the Franchise Tax Board, even though it is disregarded for income tax.', why: 'It is a single-member LLC in California.',
    applies: all(st('CA'), any(kind('llc'), all(kind('sole_prop'), yes('us_is_llc')))), frequency: 'annual', due: event('Confirm the date with the Franchise Tax Board'), dueText: 'The due date for a single-member LLC was not read on the official page. Confirm it with the Franchise Tax Board.', source: 'ca_due', verified: false }),
  C('us_ca_565', { name: 'California partnership return', form: 'Form 565', dept: 'state', head: 'State income tax', authority: 'California Franchise Tax Board', weight: 88,
    brief: 'Partnerships file Form 565. General partnerships pay no annual tax; limited partnerships and LLPs pay an $800 annual tax with it.', why: 'It is a partnership in California.',
    applies: all(st('CA'), PSHIP, not(yes('us_is_llc'))), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the close of the tax year.', source: 'ca_due', verified: true }),
  ...salesReturns('CA', 'California Department of Tax and Fee Administration', 'Sales and use tax return', 'ca_cdtfa', 'Retailers in California hold a seller\'s permit and file returns at the frequency CDTFA assigns. A return is required even with no sales.', {
    m: [mEnd, 'The last day of the month following the reporting period.'], q: [qEnd, 'The last day of the month following the reporting period.'], a: [aEnd, 'The last day of the month following the reporting period (January 31 for a calendar-year filer, July 31 for a fiscal-year filer).'],
  }),
  once('us_ca_edd', 'CA', 'payroll tax account', 'EDD employer registration', 'California Employment Development Department', 'One registration with the EDD covers unemployment insurance, employment training tax, state disability insurance and the withholding of California personal income tax.', 'Register within 15 days of paying more than $100 in wages in a calendar quarter.', 'ca_edd'),

  // ═══ New York ═══
  C('us_ny_ct3', { name: 'New York corporation franchise tax return', form: 'Form CT-3', dept: 'state', head: 'State income tax', authority: 'New York State Department of Taxation and Finance', weight: 90,
    brief: 'Corporations formed in New York, and others that do business, employ capital, own property or have an office there, pay the Article 9-A franchise tax. A fixed dollar minimum tax of $25 to $200,000 applies, by New York receipts.', why: 'It is a C corporation in New York.',
    applies: all(st('NY'), CCORP), frequency: 'annual', due: afterFY(4, 15), dueText: 'April 15 for calendar-year filers; otherwise within three and a half months after the end of the reporting period. Form CT-5 gives six more months.', source: 'ny_ct3', verified: true }),
  C('us_ny_ct3s', { name: 'New York S corporation franchise tax return', form: 'Form CT-3-S', dept: 'state', head: 'State income tax', authority: 'New York State Department of Taxation and Finance', weight: 90,
    brief: 'A New York S corporation pays only the fixed dollar minimum tax ($25 to $4,500) at the corporation.', why: 'It is an S corporation in New York.',
    applies: all(st('NY'), SCORP), frequency: 'annual', due: afterFY(3, 15), dueText: 'March 15 for calendar-year filers; otherwise within two and a half months after the end of the period.', source: 'ny_ct3s', verified: true,
    note: 'A federal S corporation is not automatically a New York S corporation: the shareholders must file Form CT-6 and be approved. Otherwise it files Form CT-3 as a C corporation.' }),
  C('us_ny_it204', { name: 'New York partnership return', form: 'Form IT-204', dept: 'state', head: 'State income tax', authority: 'New York State Department of Taxation and Finance', weight: 88,
    brief: 'Partnerships, and LLCs and LLPs taxed as partnerships, file a New York partnership return.', why: 'It is a partnership in New York.',
    applies: all(st('NY'), PSHIP), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the end of the tax year (March 15 for a calendar year).', source: 'ny_204ll', verified: true }),
  C('us_ny_204ll', { name: 'New York LLC filing fee', form: 'Form IT-204-LL', dept: 'state', head: 'Franchise tax', authority: 'New York State Department of Taxation and Finance', weight: 86,
    brief: 'An LLC or LLP with income, gain, loss or deduction from New York sources pays a yearly filing fee: $25 for a single-member LLC, and $25 to $4,500 for others by New York gross income. An LLC taxed as a corporation, or with no New York-source items, does not file it.', why: 'It is an LLC in New York that is not taxed as a corporation.',
    applies: all(st('NY'), PASS_LLC), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the end of the tax year (March 15 for a calendar year). There is no extension.', source: 'ny_204ll', verified: true }),
  ...salesReturns('NY', 'New York State Department of Taxation and Finance', 'Forms ST-100, ST-809/ST-810, ST-101', 'ny_st', 'Anyone making taxable sales in New York holds a Certificate of Authority and files sales tax returns. New vendors file quarterly. New York sales tax quarters are not calendar quarters: they end in May, August, November and February.', {
    m: [afterPeriod('monthly', 'cal', { days: 20 }), 'Part-quarterly (monthly) filers, with taxable receipts of $300,000 or more in a quarter: 20 days after the end of each month.'],
    q: [fixed([[3, 20], [6, 20], [9, 20], [12, 20]]), '20 days after the end of each sales tax quarter: June 20, September 20, December 20 and March 20.'],
    a: [fixed([[3, 20]]), 'The annual return covers March 1 to the end of February and is due March 20.'],
  }),
  once('us_ny_emp', 'NY', 'employer registration', 'Form NYS-100', 'New York State Department of Taxation and Finance and Department of Labor', 'One joint registration covers unemployment insurance, the withholding of New York income tax and wage reporting.', 'Register when you start paying employees in New York.', 'ny_nys100'),

  // ═══ Texas ═══
  C('us_tx_pir', { name: 'Texas franchise tax information report', form: 'Form 05-102 (Public Information Report) or 05-167 (Ownership Information Report)', dept: 'state', head: 'Franchise tax', authority: 'Texas Comptroller of Public Accounts', weight: 90,
    brief: 'Every taxable entity formed or doing business in Texas files this report every year, even when no franchise tax is due. Corporations, LLCs and limited partnerships file the Public Information Report; other entities the Ownership Information Report. It takes the place of a Secretary of State annual report.',
    why: 'It is a taxable entity in Texas.', applies: all(st('TX'), any(ENTITY, PSHIP)), frequency: 'annual', due: fixed([[5, 15]]), dueText: 'May 15 each year.', penalty: '$50 for each report filed late, even when no tax is due.', source: 'tx_fr_req', verified: true,
    note: 'Sole proprietorships are not taxable entities, but a single-member LLC is, even though it is disregarded for federal tax.' }),
  C('us_tx_fr', { name: 'Texas franchise tax report', form: 'Franchise tax report', dept: 'state', head: 'Franchise tax', authority: 'Texas Comptroller of Public Accounts', weight: 90,
    brief: 'Texas has no income tax. Entities with annualized total revenue above $2,650,000 (report years 2026 and 2027) pay franchise tax on their margin: 0.375% for retail or wholesale, 0.75% for others.', why: 'Its total revenue is above the no-tax-due threshold.',
    applies: all(st('TX'), any(ENTITY, PSHIP), yes('us_tx_rev')), frequency: 'annual', due: fixed([[5, 15]]), dueText: 'May 15 each year.', penalty: '$50 for each report filed late.', source: 'tx_fr', verified: true }),
  ...salesReturns('TX', 'Texas Comptroller of Public Accounts', 'Sales and use tax return', 'tx_sales', 'Anyone who sells or leases goods or sells taxable services in Texas holds a sales tax permit and files at the frequency the Comptroller assigns.', {
    m: [m20, `Monthly filers: ${T20}.`], q: [q20, 'Quarterly filers: April 20, July 20, October 20 and January 20.'], a: [a20, 'Yearly filers: January 20.'],
  }),
  C('us_tx_twc', { name: 'Texas: unemployment tax account', form: 'Texas Workforce Commission registration', dept: 'state', head: 'Employer accounts', authority: 'Texas Workforce Commission', weight: 68,
    brief: 'Texas has no income tax to withhold. Employers register for unemployment tax with the Texas Workforce Commission.', why: 'You pay employees in Texas.',
    applies: all(st('TX'), EMPLOYER), frequency: 'once', due: event('When you start paying employees'), dueText: 'The Commission\'s site refused automated access, so its registration rule has not been read. Confirm it there.', source: 'tx_twc', verified: false }),

  // ═══ Florida ═══
  C('us_fl_1120', { name: 'Florida corporate income tax return', form: 'Form F-1120', dept: 'state', head: 'State income tax', authority: 'Florida Department of Revenue', weight: 90,
    brief: 'Corporations, and entities taxed as corporations, that do business, earn income or exist in Florida file this return every year, even if no tax is due. The rate is 5.5% after a $50,000 exemption.', why: 'It is a C corporation in Florida.',
    applies: all(st('FL'), CCORP), frequency: 'annual', due: { t: 'afterYearEnd', basis: 'fy', months: 4, days: 1 }, dueText: 'The later of the 1st day of the 5th month after the tax year ends (May 1 for a calendar year) and the 15th day after the due date of the federal return.', source: 'fl_corp', verified: true,
    note: 'For a June 30 year end the first date is the 1st day of the 4th month. S corporations file only if they pay federal income tax. Estimated tax is due when the yearly Florida tax is over $2,500.' }),
  ...salesReturns('FL', 'Florida Department of Revenue', 'Sales and use tax return (DR-15)', 'fl_sales', 'Businesses whose sales are taxable register with the Department of Revenue for each location. A return is required even if no tax is due. Most new businesses start quarterly.', {
    m: [m20, 'Due on the 1st and late after the 20th of the month following each reporting period.'], q: [q20, 'Due on the 1st and late after the 20th of the month following each reporting period.'], a: [a20, 'Due on the 1st and late after the 20th of the month following the reporting period.'],
  }, { note: 'Electronic payments must be started by 5 p.m. Eastern time on the business day before the 20th.' }),
  C('us_fl_rt6', { name: 'Florida reemployment tax report', form: 'Form RT-6', dept: 'state', head: 'Employer accounts', authority: 'Florida Department of Revenue', weight: 75,
    brief: 'Florida\'s unemployment insurance is called reemployment tax. Employers with quarterly payroll of $1,500 or more, or an employee in any 20 weeks of the year, register and report wages every quarter. Florida has no income tax to withhold.', why: 'You pay employees in Florida.',
    applies: all(st('FL'), EMPLOYER), frequency: 'quarterly', due: qEnd, dueText: 'By the end of the month after each calendar quarter.', source: 'fl_rt', verified: true }),

  // ═══ Nevada ═══
  C('us_nv_commerce', { name: 'Nevada Commerce Tax return', form: 'Commerce Tax return', dept: 'state', head: 'Franchise tax', authority: 'Nevada Department of Taxation', weight: 85,
    brief: 'Nevada has no income tax. A business whose Nevada gross revenue is more than $4,000,000 in the year from July 1 to June 30 pays the Commerce Tax. Below that amount nothing is filed.', why: 'Its Nevada gross revenue is over $4,000,000.',
    applies: all(st('NV'), TRADING, yes('us_nv_rev')), frequency: 'annual', due: fixed([[8, 14]]), dueText: '45 days after the June 30 year end: generally August 14.', source: 'nv_ct', verified: true }),
  C('us_nv_mbt', { name: 'Nevada Modified Business Tax return', form: 'Modified Business Tax return', dept: 'state', head: 'Employer accounts', authority: 'Nevada Department of Taxation', weight: 78,
    brief: 'A payroll tax on every employer covered by Nevada unemployment insurance, charged on gross wages less employer-paid health benefits. Employers also report wages to the Employment Security Division.', why: 'You pay employees in Nevada.',
    applies: all(st('NV'), EMPLOYER), frequency: 'quarterly', due: qEnd, dueText: 'By the last day of the month following each calendar quarter.', source: 'nv_mbt', verified: true }),
  ...salesReturns('NV', 'Nevada Department of Taxation', 'Sales and use tax return', 'nv_sales', 'Nevada sellers file monthly when taxable sales are over $10,000 a month, quarterly below that, and yearly when taxable sales were under $1,500 in the previous year.', {
    m: [m20, `Since the January 2026 period: ${T20} (it used to be the last day of the month).`], q: [q20, `Since the January 2026 period: ${T20} (it used to be the last day of the month).`], a: [a20, `Since 2026: ${T20}.`],
  }),

  // ═══ Washington ═══
  ...salesReturns('WA', 'Washington Department of Revenue', 'Combined Excise Tax Return (My DOR)', 'wa_freq', 'Washington has no income tax. Almost every business pays the business and occupation (B&O) tax on its gross receipts, reported on the excise tax return, which also carries retail sales tax. A business with under $125,000 of yearly gross income and no sales tax to collect may be excused from filing.', {
    m: [afterPeriod('monthly', 'cal', { months: 1, day: 25 }), 'Monthly returns: the 25th of the following month.'], q: [qEnd, 'Quarterly returns: the end of the month after the quarter.'], a: [fixed([[4, 15]], -1), 'Annual returns: April 15.'],
  }, { dept: 'state', head: 'Gross receipts tax', name: 'excise tax return (B&O tax)', who: TRADING }),
  C('us_wa_sales', { name: 'Washington retail sales tax', form: 'On the Combined Excise Tax Return', dept: 'sales', head: 'Sales tax', authority: 'Washington Department of Revenue', weight: 84,
    brief: 'Retail sales tax (6.5% plus local tax) is collected by the seller and paid on the same excise tax return as the B&O tax. Some business services became taxable on October 1, 2025.', why: 'You sell goods or taxable services in Washington.',
    applies: all(st('WA'), BIZ, SELLS), frequency: 'monthly', due: event('With the excise tax return'), dueText: 'With the excise tax return: the 25th of the following month for monthly filers, the end of the month after the quarter for quarterly filers, April 15 for annual filers.', source: 'wa_freq', verified: true }),
  once('us_wa_emp', 'WA', 'employer accounts', 'Business License Application (hiring section)', 'Washington Department of Revenue, Employment Security Department and Department of Labor & Industries', 'Filing the Business License Application with the hiring section registers the employer for unemployment insurance and for workers\' compensation. Washington has no income tax to withhold.', 'File the Business License Application when you start hiring.', 'wa_hire'),

  // ═══ Illinois ═══
  C('us_il_1120', { name: 'Illinois corporation income and replacement tax return', form: 'Form IL-1120', dept: 'state', head: 'State income tax', authority: 'Illinois Department of Revenue', weight: 90,
    brief: 'Corporations pay Illinois income tax (7%) and the personal property replacement tax (2.5%). A corporation qualified to do business in Illinois that must file a federal return files this one too, whatever its income.', why: 'It is a C corporation in Illinois.',
    applies: all(st('IL'), CCORP), frequency: 'annual', due: afterFY(4, 15), dueText: 'The 15th day of the 4th month after the tax year ends (the 3rd month for a June 30 year end). Illinois gives an automatic extension to file, not to pay.', source: 'il_1120', verified: true }),
  C('us_il_1120st', { name: 'Illinois S corporation replacement tax return', form: 'Form IL-1120-ST', dept: 'state', head: 'State income tax', authority: 'Illinois Department of Revenue', weight: 90,
    brief: 'S corporations pay the 1.5% personal property replacement tax.', why: 'It is an S corporation in Illinois.',
    applies: all(st('IL'), SCORP), frequency: 'annual', due: afterFY(3, 15), dueText: 'The 15th day of the 3rd month after the tax year ends.', source: 'il_1120st', verified: true }),
  C('us_il_1065', { name: 'Illinois partnership replacement tax return', form: 'Form IL-1065', dept: 'state', head: 'State income tax', authority: 'Illinois Department of Revenue', weight: 88,
    brief: 'Partnerships, including LLCs taxed as partnerships, pay the 1.5% personal property replacement tax.', why: 'It is a partnership in Illinois.',
    applies: all(st('IL'), PSHIP), frequency: 'annual', due: afterFY(4, 15), dueText: 'The 15th day of the 4th month after the tax year ends, one month later than the federal partnership return.', source: 'il_1065', verified: true }),
  ...salesReturns('IL', 'Illinois Department of Revenue', 'Form ST-1', 'il_rot', 'Illinois sales tax is the Retailers\' Occupation Tax with a matching Use Tax. Sellers register on Form REG-1 and file Form ST-1.', {
    m: [m20, 'Monthly returns: the 20th of the following month.'], q: [q20, 'Quarterly returns: the 20th of the month after the quarter.'], a: [a20, 'Annual returns: January 20.'],
  }),
  once('us_il_emp', 'IL', 'withholding and unemployment accounts', 'Form REG-1 (MyTax Illinois)', 'Illinois Department of Revenue and Department of Employment Security', 'Employers register with the Department of Revenue to withhold Illinois income tax, and with the Department of Employment Security once they pay $1,500 in wages in a calendar quarter or employ someone in 20 weeks of a year.', 'Register through MyTax Illinois when you start paying employees.', 'il_reg'),

  // ═══ New Jersey ═══
  C('us_nj_cbt', { name: 'New Jersey corporation business tax return', form: 'Form CBT-100', dept: 'state', head: 'State income tax', authority: 'New Jersey Division of Taxation', weight: 90,
    brief: 'A franchise tax on corporations formed in New Jersey and on others doing business there, including LLCs taxed as corporations. The rate is 6.5% to 9%, with a minimum tax of $500 to $2,000 by New Jersey gross receipts.', why: 'It is a C corporation in New Jersey.',
    applies: all(st('NJ'), CCORP), frequency: 'annual', due: afterFY(5, 15), dueText: 'The 15th day of the month following the month the federal corporate return is originally due. For a December 31 year end that is May 15, not April 15.', source: 'nj_cbt', verified: true,
    note: 'Estimated tax instalments are due when the total tax is $500 or more.' }),
  C('us_nj_cbt_s', { name: 'New Jersey S corporation business tax return', form: 'Form CBT-100S', dept: 'state', head: 'State income tax', authority: 'New Jersey Division of Taxation', weight: 88,
    brief: 'New Jersey S corporations pay at least the minimum tax of $500 to $2,000 by New Jersey gross receipts.', why: 'It is an S corporation in New Jersey.',
    applies: all(st('NJ'), SCORP), frequency: 'annual', due: event('Confirm the date with the New Jersey Division of Taxation'), dueText: 'The S corporation instructions were not read. Confirm the form and its date with the Division of Taxation.', source: 'nj_cbt_over', verified: false }),
  C('us_nj_1065', { name: 'New Jersey partnership return', form: 'Form NJ-1065', dept: 'state', head: 'State income tax', authority: 'New Jersey Division of Taxation', weight: 88,
    brief: 'Partnerships, including LLCs taxed as partnerships, file a New Jersey partnership return. Partnerships with New Jersey income and more than two owners pay a filing fee of $150 for each owner.', why: 'It is a partnership in New Jersey.',
    applies: all(st('NJ'), PSHIP), frequency: 'annual', due: afterFY(4, 15), dueText: 'The 15th day of the 4th month after the tax year ends (April 15 for a calendar year).', source: 'nj_1065', verified: true }),
  C('us_nj_st50', { name: 'New Jersey sales and use tax return (quarterly)', form: 'Form ST-50', dept: 'sales', head: 'Sales tax', authority: 'New Jersey Division of Taxation', weight: 84,
    brief: 'Every New Jersey seller files a quarterly sales tax return.', why: 'You sell goods or taxable services in New Jersey.',
    applies: all(st('NJ'), BIZ, SELLS), frequency: 'quarterly', due: q20, dueText: 'The 20th of the month after the end of each quarter.', source: 'nj_su', verified: true }),
  C('us_nj_st51', { name: 'New Jersey monthly sales tax payments', form: 'Form ST-51', dept: 'sales', head: 'Sales tax', authority: 'New Jersey Division of Taxation', weight: 78,
    brief: 'Sellers that collected more than $30,000 in the prior year also pay monthly for the first and second month of each quarter, when the month\'s tax is more than $500.', why: 'You pay New Jersey sales tax monthly.',
    applies: all(st('NJ'), BIZ, SELLS, is('us_sales_freq', 'm')), frequency: 'monthly', due: m20, dueText: 'The 20th of the following month, for the first and second month of each quarter.', source: 'nj_su', verified: true }),
  once('us_nj_emp', 'NJ', 'business and employer registration', 'Form NJ-REG', 'New Jersey Division of Revenue and Enterprise Services', 'One combined registration, filed after the business is formed and has its federal EIN, covers the withholding of New Jersey payroll taxes.', 'File Form NJ-REG when you start paying employees.', 'nj_reg'),

  // ═══ every state ═══
  ...ANNUAL_REPORTS,
  C('us_st_ar', { name: 'State annual report or franchise filing', form: 'Your state\'s yearly business filing', dept: 'state', head: 'Annual report', authority: 'Your state\'s business registry', weight: 70,
    brief: 'Most states make registered corporations and LLCs file a yearly or two-yearly report, or a privilege or franchise tax return, to stay in good standing. This state\'s rule could not be read on its official page.', why: 'It is a company registered in this state.',
    applies: all(st(...NO_REPORT_RULE), ENTITY), frequency: 'annual', due: event('Confirm with your state\'s business registry'), dueText: 'Confirm whether a report is due, and when, with your state\'s business registry.', source: 'irs_states', verified: false }),
  C('us_st_np', { name: 'State nonprofit periodic report', form: 'Your state\'s nonprofit report', dept: 'state', head: 'Annual report', authority: 'Your state\'s business registry', weight: 70,
    brief: 'Nonprofit corporations usually file a yearly or two-yearly report with the state to stay in good standing. This state\'s rule for nonprofits was not read on its official page.', why: 'It is a tax-exempt organization.',
    applies: all(NP, not(st('WY', 'CA', 'FL', 'PA'))), frequency: 'annual', due: event('Confirm with your state'), dueText: 'Confirm whether a report is due, and when, with your state\'s business registry.', source: 'irs_states', verified: false }),
  C('us_st_charity', { name: 'State charitable solicitation registration', form: 'Charity registration and yearly renewal', dept: 'state', head: 'Registration', authority: 'Your state\'s attorney general or charity regulator', weight: 72,
    brief: 'Most states make an organization register before it asks the public for donations, and renew or report every year, in each state where it asks.', why: 'It asks the public for donations.',
    applies: all(NP, yes('us_np_solicit')), frequency: 'annual', due: event('Before you ask for donations, then yearly'), dueText: 'Set by each state where you ask for donations. Confirm with that state\'s charity regulator.', source: 'irs_states', verified: false }),
  C('us_st_cit', { name: 'State corporate income or franchise tax return', form: 'Your state\'s corporate return', dept: 'state', head: 'State income tax', authority: 'Your state tax agency', weight: 85,
    brief: 'This state taxes corporate income, so a state return is due as well as the federal one. The state\'s own form and date were not read on its official page.', why: 'It is a corporation in a state that taxes corporate income.',
    applies: all(stag('cit'), stag('other'), CCORP), frequency: 'annual', due: event('Set by your state, usually close to the federal date'), dueText: 'Set by your state. Many states follow the federal date or allow one more month.', source: 'census', verified: false }),
  C('us_st_pte', { name: 'State partnership or S corporation return', form: 'Your state\'s pass-through entity return', dept: 'state', head: 'State income tax', authority: 'Your state tax agency', weight: 80,
    brief: 'States that tax income generally expect an information return from partnerships and S corporations that do business there, and some charge a fee or an entity-level tax.', why: 'It is a partnership or S corporation in a state that taxes income.',
    applies: all(stag('other'), any(stag('pit'), stag('cit')), any(PSHIP, SCORP)), frequency: 'annual', due: event('Set by your state'), dueText: 'Set by your state, usually close to the federal date.', source: 'irs_states', verified: false }),
  C('us_oh_cat', { name: 'Ohio Commercial Activity Tax', form: 'CAT return', dept: 'state', head: 'Gross receipts tax', authority: 'Ohio Department of Taxation', weight: 80,
    brief: 'Ohio has no corporate income tax. Businesses of every legal form with more than $6 million a year of Ohio taxable gross receipts pay the Commercial Activity Tax (tax years 2025 and later).', why: 'It does business in Ohio.',
    applies: all(st('OH'), TRADING), frequency: 'annual', due: event('Confirm the filing dates with the Ohio Department of Taxation'), dueText: 'Applies only above $6 million of Ohio taxable gross receipts. The filing dates were not read; confirm them with the Ohio Department of Taxation.', source: 'oh_cat', verified: false }),
  C('us_st_multi', { name: 'Register and file in the other states where you do business', form: 'Foreign qualification, tax returns and annual report in each state', dept: 'state', head: 'Registration', authority: 'Each state\'s business registry and tax agency', weight: 72,
    brief: 'A business with an office, staff, property or regular business in another state usually has to register there as a foreign entity, then file that state\'s income or franchise tax return and its yearly report. Run this check again for each of those states.',
    why: 'It does business in more than one state.', applies: all(kind('sole_prop', 'partnership', 'corporation', 'llc', 'nonprofit'), yes('us_st_multi')), frequency: 'once', due: event('Before you start doing business in the state'), dueText: 'Each state sets its own rule on when a business must register. Check every state where you have an office, staff or property.', source: 'irs_states', verified: false }),
  C('us_st_fid', { name: 'State fiduciary income tax return', form: 'Your state\'s trust and estate return', dept: 'state', head: 'State income tax', authority: 'Your state tax agency', weight: 70,
    brief: 'States that tax personal income generally tax the income of trusts and estates too, on a state fiduciary return.', why: 'It is a trust or estate with income, in a state that taxes income.',
    applies: all(kind('trust'), stag('pit'), yes('us_trust_income')), frequency: 'annual', due: event('Set by your state, often April 15'), dueText: 'Set by your state, usually the same date as the federal Form 1041.', source: 'irs_states', verified: false }),
  C('us_st_emp', { name: 'State employer accounts', form: 'State withholding and unemployment insurance registration', dept: 'state', head: 'Employer accounts', authority: 'Your state tax and labor agencies', weight: 68,
    brief: 'Employers register with the state for unemployment insurance and, in states that tax wages, to withhold state income tax. Returns are usually quarterly.', why: 'You pay employees in this state.',
    applies: all(stag('other'), EMPLOYER), frequency: 'quarterly', due: event('Set by your state, usually after each quarter'), dueText: 'Register when you start paying employees. Wage reports are usually due the month after each calendar quarter.', source: 'irs_states', verified: false }),
  C('us_st_sales', { name: 'State sales and use tax return', form: 'Your state\'s sales tax return', dept: 'sales', head: 'Sales tax', authority: 'Your state tax agency', weight: 82,
    brief: 'This state has a sales tax. Sellers register for a permit, collect the tax and file returns monthly, quarterly or yearly as the state assigns.', why: 'You sell goods or taxable services in this state.',
    applies: all(stag('sales'), stag('other'), BIZ, SELLS), frequency: 'monthly', due: event('Set by your state'), dueText: 'Set by your state: commonly the 20th or the last day of the month after the reporting period.', source: 'census', verified: false }),
  C('us_remote_sales', { name: 'Sales tax registration in other states (economic nexus)', form: 'Sales tax permit in each state', dept: 'sales', head: 'Registration', authority: 'Each state\'s tax agency', weight: 80,
    brief: 'A seller with no office or staff in a state must still register and collect its sales tax once sales into the state pass that state\'s threshold. Thresholds read on the states\' own pages: $100,000 in Florida, Illinois, Washington, Wyoming and Nevada (Nevada also 200 sales) and New Jersey (or 200 sales); $500,000 in California and Texas; $500,000 and more than 100 sales in New York.',
    why: 'You sell more than $100,000 a year into another state.', applies: all(BIZ, yes('us_remote')), frequency: 'once', due: event('When your sales into a state pass its threshold'), dueText: 'Each state sets how soon you must register after passing its threshold. Check every state you sell into.', source: 'irs_states', verified: false }),
];

const S = (id: string, publisher: string, title: string, url: string) => src(id, publisher, title, url, D);
export const US_STATE_SOURCES: Source[] = [
  S('irs_states', 'IRS', 'State government websites', 'https://www.irs.gov/businesses/small-businesses-self-employed/state-government-websites'),
  S('census', 'US Census Bureau', 'Annual Survey of State Government Tax Collections, fiscal year 2024', 'https://www2.census.gov/programs-surveys/stc/datasets/2024/FY2024-Flat-File.txt'),
  S('oh_cat', 'Ohio Department of Taxation', 'Commercial Activity Tax', 'https://tax.ohio.gov/business/ohio-business-taxes/commercial-activities'),
  // Delaware
  S('de_corp', 'Delaware Division of Corporations', 'Annual report and tax instructions', 'https://corp.delaware.gov/paytaxes/'),
  S('de_alt', 'Delaware Division of Corporations', 'LLC, LP and GP franchise tax instructions', 'https://corp.delaware.gov/alt-entitytaxinstructions/'),
  S('de_cit', 'Delaware Division of Revenue', 'Corporate income tax FAQs', 'https://revenue.delaware.gov/corporate-income-tax-faqs/'),
  S('de_grt', 'Delaware Division of Revenue', 'Gross receipts tax FAQs', 'https://revenue.delaware.gov/frequently-asked-questions/gross-receipts-tax-faqs/'),
  S('de_pit', 'Delaware Division of Revenue', 'Resident individual income tax return instructions', 'https://revenuefiles.delaware.gov/2025/PITForms_Instructions/Instructions/PIT-RES_Instructions_2025-01.pdf'),
  S('de_wh', 'Delaware Division of Revenue', 'Withholding tax FAQs', 'https://revenue.delaware.gov/frequently-asked-questions/withholding-tax-faqs/'),
  // Wyoming
  S('wy_sos', 'Wyoming Secretary of State', 'Business FAQs', 'https://sos.wyo.gov/faqs.aspx?root=BUS'),
  S('wy_stat', 'Wyoming Legislature', 'Wyoming Statutes, Title 39 (sales and use tax)', 'https://wyoleg.gov/statutes/compress/title39.pdf'),
  S('wy_dws', 'Wyoming Department of Workforce Services', 'Unemployment insurance', 'https://dws.wyo.gov/dws-division/unemployment-insurance/'),
  // California
  S('ca_ccorp', 'California Franchise Tax Board', 'C corporations', 'https://www.ftb.ca.gov/file/business/types/corporations/c-corporations.html'),
  S('ca_scorp', 'California Franchise Tax Board', 'S corporations', 'https://www.ftb.ca.gov/file/business/types/corporations/s-corporations.html'),
  S('ca_llc', 'California Franchise Tax Board', 'Limited liability company', 'https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html'),
  S('ca_due', 'California Franchise Tax Board', 'Due dates: businesses', 'https://www.ftb.ca.gov/file/when-to-file/due-dates-business.html'),
  S('ca_pit', 'California Franchise Tax Board', 'Due dates: personal', 'https://www.ftb.ca.gov/file/when-to-file/due-dates-personal.html'),
  S('ca_sos', 'California Secretary of State', 'Statements of Information', 'https://www.sos.ca.gov/business-programs/business-entities/statements'),
  S('ca_cdtfa', 'California Department of Tax and Fee Administration', 'Sales and use tax returns: filing dates', 'https://cdtfa.ca.gov/taxes-and-fees/sales-use-tax-returns-filing-dates.htm'),
  S('ca_edd', 'California Employment Development Department', 'Register as an employer', 'https://edd.ca.gov/en/payroll_taxes/step-1-register-as-an-employer/'),
  // New York
  S('ny_ct3', 'New York State Department of Taxation and Finance', 'Instructions for Form CT-3', 'https://www.tax.ny.gov/forms/current-forms/ct/ct3i.htm'),
  S('ny_ct3s', 'New York State Department of Taxation and Finance', 'Instructions for Form CT-3-S', 'https://www.tax.ny.gov/forms/current-forms/ct/ct3si.htm'),
  S('ny_204ll', 'New York State Department of Taxation and Finance', 'Instructions for Form IT-204-LL', 'https://www.tax.ny.gov/forms/current-forms/it/it204lli.htm'),
  S('ny_pit', 'New York State Department of Taxation and Finance', 'Instructions for Form IT-201', 'https://www.tax.ny.gov/forms/current-forms/it/it201i.htm'),
  S('ny_wt', 'New York State Department of Taxation and Finance', 'Withholding tax', 'https://www.tax.ny.gov/bus/wt/wtidx.htm'),
  S('ny_dos', 'New York Department of State', 'Biennial statements for business corporations and LLCs', 'https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies'),
  S('ny_st', 'New York State Department of Taxation and Finance', 'Filing requirements for sales and use tax returns (TB-ST-275)', 'https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/filing_requirements_for_sales_and_use_tax_returns.htm'),
  S('ny_nys100', 'New York State Department of Labor', 'Form NYS-100, employer registration', 'https://forms.labor.ny.gov/UI/NYS100.pdf'),
  // Texas
  S('tx_fr', 'Texas Comptroller of Public Accounts', 'Franchise tax', 'https://comptroller.texas.gov/taxes/franchise/'),
  S('tx_fr_req', 'Texas Comptroller of Public Accounts', 'Franchise tax filing requirements', 'https://comptroller.texas.gov/taxes/franchise/filing-requirements.php'),
  S('tx_sales', 'Texas Comptroller of Public Accounts', 'Sales and use tax', 'https://comptroller.texas.gov/taxes/sales/'),
  S('tx_twc', 'Texas Workforce Commission', 'Register a new unemployment tax account', 'https://www.twc.texas.gov/programs/unemployment-tax/register-new-account'),
  // Florida
  S('fl_corp', 'Florida Department of Revenue', 'Corporate income tax', 'https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx'),
  S('fl_ar', 'Florida Division of Corporations', 'Annual report', 'https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/'),
  S('fl_sales', 'Florida Department of Revenue', 'Sales and use tax', 'https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx'),
  S('fl_rt', 'Florida Department of Revenue', 'Reemployment tax', 'https://floridarevenue.com/taxes/taxesfees/Pages/reemployment.aspx'),
  // Nevada
  S('nv_ct', 'Nevada Department of Taxation', 'Commerce Tax FAQs', 'https://tax.nv.gov/faqs/commerce-tax-faqs/'),
  S('nv_mbt', 'Nevada Department of Taxation', 'Modified Business Tax', 'https://tax.nv.gov/tax-types/modified-business-tax/'),
  S('nv_nrs86', 'Nevada Legislature', 'Nevada Revised Statutes, chapter 86 (limited-liability companies)', 'https://www.leg.state.nv.us/NRS/NRS-086.html'),
  S('nv_sales', 'Nevada Department of Taxation', 'New sales tax filing date', 'https://tax.nv.gov/wp-content/uploads/2026/01/Department-of-Taxation-New-Sales-Tax-filing-date.pdf'),
  // Washington
  S('wa_freq', 'Washington Department of Revenue', 'Filing frequencies and due dates', 'https://dor.wa.gov/file-pay-taxes/filing-frequencies-due-dates'),
  S('wa_sos', 'Washington Secretary of State', 'Annual reports', 'https://www.sos.wa.gov/corporations-charities/business-entities/maintain-business-compliance/annual-reports'),
  S('wa_hire', 'Washington Department of Revenue', 'Hiring employees', 'https://dor.wa.gov/manage-business/grow-business/hiring-employees'),
  // Illinois
  S('il_pit', 'Illinois Department of Revenue', 'Individual income tax', 'https://tax.illinois.gov/research/taxinformation/income/individual.html'),
  S('il_1120', 'Illinois Department of Revenue', 'Who must file Form IL-1120', 'https://tax.illinois.gov/questionsandanswers/answer.69.html'),
  S('il_1120st', 'Illinois Department of Revenue', 'Who must file Form IL-1120-ST', 'https://tax.illinois.gov/questionsandanswers/answer.93.html'),
  S('il_1065', 'Illinois Department of Revenue', 'Partnership replacement tax', 'https://tax.illinois.gov/research/taxinformation/income/partnership.html'),
  S('il_rot', 'Illinois Department of Revenue', 'Retailers\' Occupation Tax', 'https://tax.illinois.gov/research/taxinformation/sales/rot.html'),
  S('il_reg', 'Illinois Department of Revenue', 'Business registration', 'https://tax.illinois.gov/businesses/registration.html'),
  S('il_sos', 'Illinois Secretary of State', 'Limited liability companies', 'https://www.ilsos.gov/publications/business-services/llc.html'),
  // New Jersey
  S('nj_cbt', 'New Jersey Division of Taxation', 'CBT-100 instructions', 'https://www.nj.gov/treasury/taxation/pdf/current/cbt/cbt100ins.pdf'),
  S('nj_cbt_over', 'New Jersey Division of Taxation', 'Corporation Business Tax overview', 'https://www.nj.gov/treasury/taxation/corp_over.shtml'),
  S('nj_1065', 'New Jersey Division of Taxation', 'NJ-1065 instructions', 'https://www.nj.gov/treasury/taxation/pdf/current/part/1065i.pdf'),
  S('nj_pit', 'New Jersey Division of Taxation', 'NJ-1040 instructions', 'https://www.nj.gov/treasury/taxation/pdf/current/1040i.pdf'),
  S('nj_ar', 'State of New Jersey', 'Filings and accounting', 'https://business.nj.gov/pages/filings-and-accounting'),
  S('nj_su', 'New Jersey Division of Taxation', 'Sales and use tax: filing and payment', 'https://www.nj.gov/treasury/taxation/su_12.shtml'),
  S('nj_reg', 'New Jersey Division of Revenue and Enterprise Services', 'Getting registered', 'https://www.nj.gov/treasury/revenue/gettingregistered.shtml'),
  // annual report rules, other states
  S('ar_ak', 'Alaska Division of Corporations', 'Biennial reports FAQs', 'https://www.commerce.alaska.gov/web/cbpl/Corporations/BiennialReportsFAQs'),
  S('ar_az', 'Arizona Corporation Commission', 'Business services FAQs', 'https://azcc.gov/faqs/BusinessServicesFAQs'),
  S('ar_ar', 'Arkansas Secretary of State', 'LLC franchise tax report', 'https://www.sos.arkansas.gov/uploads/bcs/LLC1_FT_2026.pdf'),
  S('ar_co', 'Colorado Secretary of State', 'Periodic report FAQs', 'https://www.sos.state.co.us/pubs/business/FAQs/reports.html'),
  S('ar_ct', 'State of Connecticut', 'Domestic limited liability companies: forms and fees', 'https://business.ct.gov/knowledge-base/articles/domestic-limited-liability-companies-forms-and-fees'),
  S('ar_dc', 'DC Department of Licensing and Consumer Protection', 'Domestic limited liability company', 'https://dlcp.dc.gov/service/domestic-limited-liability-company'),
  S('ar_ga', 'Georgia Secretary of State', 'How to file annual registration', 'https://sos.ga.gov/how-to-guide/how-file-annual-registration'),
  S('ar_hi', 'Hawaii Business Registration Division', 'Annual business reports', 'https://cca.hawaii.gov/breg/third-quarter-hawaii-annual-business-reports-due-2026/'),
  S('ar_id', 'Idaho Legislature', 'Idaho Code 30-21-213, annual report', 'https://legislature.idaho.gov/statutesrules/idstat/title30/t30ch21/sect30-21-213/'),
  S('ar_in', 'Indiana Secretary of State', 'Business entity reports', 'https://www.in.gov/sos/business/business-entity-reports'),
  S('ar_ia', 'Iowa Secretary of State', 'Business entity forms and fees', 'https://sos.iowa.gov/businesses/business-entity-forms-and-fees'),
  S('ar_ks', 'Kansas Secretary of State', 'Information reports', 'https://sos.ks.gov/businesses/information-reports.html'),
  S('ar_ky', 'Kentucky Secretary of State', 'Annual reports', 'https://www.sos.ky.gov/bus/business-filings/Pages/Annual-Reports.aspx'),
  S('ar_la', 'Louisiana State Legislature', 'Annual report of corporations', 'https://www.legis.la.gov/legis/Law.aspx?d=76392'),
  S('ar_me', 'Maine Secretary of State', 'Filing an annual report', 'https://www.maine.gov/sos/corporations-commissions/filing-an-annual-report'),
  S('ar_md', 'Maryland Department of Assessments and Taxation', 'Form 1 instructions', 'https://dat.maryland.gov/SDAT%20Forms/PPR_Forms/2025_Form1_Instructions.pdf'),
  S('ar_ma', 'Massachusetts Secretary of the Commonwealth', 'Limited liability companies', 'https://www.sec.state.ma.us/divisions/corporations/filing-by-subject/limited-liability/corporations-limited-liability-company.htm'),
  S('ar_mi', 'Michigan Department of Licensing and Regulatory Affairs', 'Annual reports and annual statements', 'https://www.michigan.gov/lara/bureau-list/cscl/corps/michigan-business-roadmap/annual-reports-and-annual-statements'),
  S('ar_mn', 'Minnesota Secretary of State', 'Annual renewals', 'https://www.sos.mn.gov/business-liens/renewals/'),
  S('ar_ms', 'Mississippi Secretary of State', 'Annual reports', 'https://www.sos.ms.gov/business-services/annual-reports'),
  S('ar_mo', 'Missouri Secretary of State', 'Business FAQs', 'https://www.sos.mo.gov/business/faqs'),
  S('ar_mt', 'Montana Secretary of State', 'How do I file my annual report', 'https://help.sosmt.gov/en-us/article/how-do-i-file-my-annual-report-ywawrv/'),
  S('ar_ne', 'Nebraska Secretary of State', 'Annual and biennial reporting', 'https://sos.nebraska.gov/business-services/annualbiennial-reporting'),
  S('ar_nh', 'New Hampshire Secretary of State', 'Business FAQs', 'https://www.sos.nh.gov/corporations-0/business-faqs'),
  S('ar_nc', 'North Carolina Secretary of State', 'Annual report due dates', 'https://www.sosnc.gov/divisions/business_registration/annual_report_due_dates'),
  S('ar_nd', 'North Dakota Secretary of State', 'Maintain registration', 'https://www.sos.nd.gov/business/business-services/maintain-registration'),
  S('ar_ok', 'Oklahoma Secretary of State', 'LLC annual certificate', 'https://www.sos.ok.gov/forms/Llcannualcertificate.PDF'),
  S('ar_or', 'Oregon Secretary of State', 'Annual report and renewal', 'https://sos.oregon.gov/business/pages/obr-annual-report-renewal.aspx'),
  S('ar_pa', 'Pennsylvania Department of State', 'Annual reports', 'https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports'),
  S('ar_ri', 'Rhode Island Department of State', 'File your annual report', 'https://www.sos.ri.gov/divisions/business-services/ri-business/file-your-annual-report'),
  S('ar_sd', 'South Dakota Secretary of State', 'Domestic LLC annual report', 'https://sdsos.gov/docs/business/llc-domestic-annualreport.pdf'),
  S('ar_tn', 'Tennessee Secretary of State', 'Business FAQs', 'https://sos.tn.gov/businesses/faqs'),
  S('ar_ut', 'Utah Division of Corporations', 'Renewal process', 'https://commerce.utah.gov/corporations/renewal-process/'),
  S('ar_vt', 'Vermont Secretary of State', 'Annual and biennial reports', 'https://sos.vermont.gov/business-services/business-filings/annualbiennial-reports'),
  S('ar_va', 'Virginia State Corporation Commission', 'Maintaining your business', 'https://www.scc.virginia.gov/businesses/maintaining-your-business/'),
  S('ar_wv', 'West Virginia Secretary of State', 'Annual reports', 'https://sos.wv.gov/business/updates-and-changes/annual-reports'),
  S('ar_wi', 'Wisconsin Department of Financial Institutions', 'Business entities FAQ', 'https://dfi.wi.gov/Pages/BusinessServices/BusinessEntities/FAQ.aspx'),
];
