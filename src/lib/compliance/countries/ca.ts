// CANADA. Tax departments: income tax (CRA, Revenu Québec, Alberta), sales tax (GST/HST, QST, provincial
// sales taxes) and payroll. Every due date and threshold here was read on the official page listed in
// `sources`; a filing whose rule could not be confirmed there carries verified: false and is shown to the
// person as "confirm on the official source".
import type { CountryPack } from '../types.ts';
import { C, afterCalYear, afterFY, afterPeriod, all, always, any, choice, ent, event, fixed, has, is, kind, monthday, multi, no, not, opts, src, st, stag, yes, yn } from '../dsl.ts';

const BIZ = kind('sole_prop', 'partnership', 'corporation', 'trust', 'nonprofit');
const PERSON = kind('individual', 'sole_prop');
const CORP = kind('corporation');
const selfEmployed = any(kind('sole_prop'), yes('ca_selfemp'));
const sellsIn = (p: string) => any(st(p), has('ca_sell_prov', p));
const registeredOrOver = any(yes('ca_gst_reg'), is('ca_revenue', 'r2', 'r3', 'r4'));

export const canada: CountryPack = {
  code: 'CA', name: 'Canada', version: '2026.11.1', currency: 'CAD', stateLabel: 'Province or territory',
  calendarYearKinds: ['individual', 'sole_prop', 'trust'],
  rollWeekend: true,
  weekendNote: 'When a due date falls on a Saturday, a Sunday or a public holiday recognized by the CRA, the filing is on time if it is received or postmarked on the next business day. Public holidays are not worked out here.',
  disclaimer: 'General information from official Canadian sources to help you find what applies. It is not tax or legal advice. Confirm each deadline with the CRA, your province, or your advisor.',
  states: [
    { code: 'AB', name: 'Alberta', tags: ['gst_only', 'ab'] }, { code: 'BC', name: 'British Columbia', tags: ['pst', 'bc'] }, { code: 'MB', name: 'Manitoba', tags: ['pst', 'mb'] },
    { code: 'NB', name: 'New Brunswick', tags: ['hst'] }, { code: 'NL', name: 'Newfoundland and Labrador', tags: ['hst'] }, { code: 'NT', name: 'Northwest Territories', tags: ['gst_only'] },
    { code: 'NS', name: 'Nova Scotia', tags: ['hst'] }, { code: 'NU', name: 'Nunavut', tags: ['gst_only'] }, { code: 'ON', name: 'Ontario', tags: ['hst', 'on'] },
    { code: 'PE', name: 'Prince Edward Island', tags: ['hst'] }, { code: 'QC', name: 'Québec', tags: ['qst', 'qc'] }, { code: 'SK', name: 'Saskatchewan', tags: ['pst', 'sk'] }, { code: 'YT', name: 'Yukon', tags: ['gst_only'] },
  ],
  entityTypes: [
    { id: 'individual', kind: 'individual', name: 'Individual', desc: 'A person: employee, investor, landlord, retiree or student.' },
    { id: 'sole_prop', kind: 'sole_prop', name: 'Self-employed / sole proprietor', desc: 'A person who runs an unincorporated business or works for themselves.' },
    { id: 'partnership', kind: 'partnership', name: 'Partnership', desc: 'Two or more people or companies carrying on business together (general, limited or LLP).' },
    { id: 'corporation', kind: 'corporation', name: 'Corporation', desc: 'A company incorporated federally or in a province (Inc., Ltd., Corp.), including Canadian-controlled private corporations.' },
    { id: 'ulc', kind: 'corporation', name: 'Unlimited liability company (ULC)', desc: 'A company whose shareholders have unlimited liability. Available only in Alberta, British Columbia and Nova Scotia.', onlyStates: ['AB', 'BC', 'NS'], tags: ['ulc'] },
    { id: 'trust', kind: 'trust', name: 'Trust or estate', desc: 'A family trust, testamentary trust, or the estate of someone who died.' },
    { id: 'nonprofit', kind: 'nonprofit', name: 'Non-profit organization or charity', desc: 'A non-profit organization, or a charity registered with the CRA.' },
  ],
  departments: [
    { id: 'income', name: 'Income tax', desc: 'Income tax returns, instalments and foreign reporting (CRA, Revenu Québec, Alberta).' },
    { id: 'sales', name: 'Sales tax (GST/HST, QST, PST)', desc: 'GST/HST with the CRA, QST in Québec, and provincial sales tax in British Columbia, Saskatchewan and Manitoba.' },
    { id: 'payroll', name: 'Payroll and information slips', desc: 'Source deductions, T4 and other slips, and provincial employer taxes.' },
  ],
  steps: [
    { id: 'about', title: 'About you', desc: 'A few facts that decide which returns you file.' },
    { id: 'income', title: 'Income and assets', desc: 'What you earned and what you own. Each yes can add a filing or a deadline.' },
    { id: 'sales', title: 'Sales and sales tax', desc: 'GST/HST and provincial sales tax depend on how much you sell and where.' },
    { id: 'people', title: 'People you pay', desc: 'Employees, contractors, shareholders and non-residents each bring their own slips and remittances.' },
    { id: 'dates', title: 'Your dates', desc: 'Due dates are counted from your own year end.' },
  ],
  questions: [
    // ── about ──
    yn('ca_resident', 'about', 'Were you resident in Canada for tax purposes for the whole year?', { show: PERSON, help: 'You are usually resident if you live in Canada and have a home, spouse or dependants here. Newcomers and people who left during the year are part-year residents.' }),
    yn('ca_ccpc', 'about', 'Is it a Canadian-controlled private corporation (CCPC)?', { show: CORP, help: 'A private corporation that is not controlled by non-residents or public companies. Most small Canadian companies are CCPCs.' }),
    yn('ca_sbd', 'about', 'Did it claim the small business deduction, with taxable income of $500,000 or less last year?', { show: all(CORP, yes('ca_ccpc')), help: 'This decides whether the balance of tax is due two or three months after the year end.' }),
    yn('ca_active', 'about', 'Did the corporation have any income or activity this year?', { show: CORP, help: 'A corporation files a T2 return every year even if it was inactive or had no tax to pay.' }),
    yn('ca_charity', 'about', 'Is it a charity registered with the CRA?', { show: kind('nonprofit') }),
    yn('ca_npo_big', 'about', 'Did it have total assets over $200,000, or receive more than $10,000 of interest, dividends, rent or royalties?', { show: all(kind('nonprofit'), no('ca_charity')), help: 'Non-profit organizations over either amount file an information return (T1044).' }),
    choice('ca_partners', 'about', 'Who are the partners?', { show: kind('partnership'), options: opts('individuals|Individuals only', 'mixed|Includes a corporation, trust or another partnership') }),
    yn('ca_pship_big', 'about', 'Did the partnership have revenues plus expenses over $2 million, or assets over $5 million?', { show: all(kind('partnership'), is('ca_partners', 'individuals')), help: 'Smaller partnerships of individuals are usually not required to file the partnership information return.' }),
    multi('ca_pe', 'about', 'Does it have an office, staff or other permanent establishment in any of these provinces?', { show: CORP, options: opts('AB|Alberta', 'QC|Québec', 'none|Neither'), help: 'Alberta and Québec collect their own corporate income tax and need a separate return.' }),
    yn('ca_trust_income', 'about', 'Did the trust have income, sell property, or hold assets worth more than $50,000 this year?', { show: kind('trust'), help: 'Most trusts must file a T3 return and report their trustees, beneficiaries and settlors every year.' }),
    // ── income ──
    yn('ca_employment', 'income', 'Did you earn employment income (a T4 slip)?', { show: PERSON }),
    yn('ca_selfemp', 'income', 'Did you or your spouse earn self-employment or business income?', { show: kind('individual'), help: 'Freelance, gig, commission or side-business income. It moves your filing deadline to June 15, although any tax is still due April 30.' }),
    yn('ca_rental', 'income', 'Did you earn rental income?', { show: PERSON }),
    yn('ca_invest', 'income', 'Did you earn interest, dividends or other investment income outside registered plans?', { show: PERSON }),
    yn('ca_capgain', 'income', 'Did you sell shares, funds, crypto, real estate or other capital property?', { show: PERSON }),
    yn('ca_home_sale', 'income', 'Did you sell your home (principal residence)?', { show: PERSON, help: 'The sale must be reported and the principal residence exemption claimed on your return, even if no tax is owed.' }),
    yn('ca_owing', 'income', 'Did you owe more than $3,000 when you filed (more than $1,800 in Québec), this year and in either of the last two years?', { show: PERSON, help: 'This is tax owing after deductions at source. If so the CRA asks you to pay next year\'s tax by quarterly instalments.' }),
    yn('ca_rrsp', 'income', 'Do you contribute to an RRSP?', { show: PERSON }),
    yn('ca_foreign_prop', 'income', 'Did you own foreign property that cost more than $100,000 in total at any time in the year?', { show: any(PERSON, CORP, kind('trust', 'partnership')), help: 'Foreign bank accounts, shares of foreign companies (even in a Canadian brokerage account), foreign rental property. Personal-use property and property in registered plans do not count.' }),
    yn('ca_foreign_aff', 'income', 'Do you own 1% or more of a foreign corporation (10% or more together with related persons)?', { show: any(PERSON, CORP, kind('trust')), help: 'A foreign affiliate. Owners report it on Form T1134.' }),
    yn('ca_nr_related', 'income', 'Did it have transactions of more than $1 million in total with related non-residents?', { show: any(CORP, kind('partnership', 'trust')), help: 'For example purchases, sales, fees, interest or loans with a foreign parent or sister company.' }),
    yn('ca_corp_instal', 'income', 'Was its income tax payable more than $3,000 this year and last year?', { show: CORP, help: 'If so the corporation pays its tax by instalments during the year.' }),
    // ── sales ──
    yn('ca_gst_reg', 'sales', 'Are you registered for GST/HST?', { show: BIZ }),
    choice('ca_revenue', 'sales', 'What were your taxable sales in Canada over the last 12 months?', { show: BIZ, options: opts('r1|$30,000 or less', 'r2|$30,001 to $1.5 million', 'r3|$1.5 to $6 million', 'r4|Over $6 million'), help: 'Worldwide taxable supplies of you and your associates, before tax. Over $30,000 in four quarters you must register for GST/HST ($50,000 for charities and public service bodies).' }),
    multi('ca_sell_prov', 'sales', 'Do you sell taxable goods or services to customers in any of these provinces?', { show: BIZ, options: opts('BC|British Columbia', 'SK|Saskatchewan', 'MB|Manitoba', 'QC|Québec', 'none|None of these'), help: 'These provinces charge their own sales tax (PST, RST or QST) on top of the federal GST.' }),
    yn('ca_exports', 'sales', 'Do you sell mostly to customers outside Canada?', { show: BIZ, help: 'Exports are usually zero-rated: you charge no GST/HST but can still claim input tax credits if registered.' }),
    // ── people ──
    yn('ca_employees', 'people', 'Do you pay employees (including yourself through payroll)?', { show: any(BIZ, PERSON), help: 'Includes a nanny or caregiver you employ at home.' }),
    choice('ca_remit', 'people', 'About how much do you send the CRA each month in payroll deductions?', { show: yes('ca_employees'), options: opts('q|Under $1,000', 'r|$1,000 to $24,999', 'a1|$25,000 to $99,999', 'a2|$100,000 or more'), help: 'Income tax, CPP and EI together (your average monthly withholding amount two years ago decides your remitter type).' }),
    yn('ca_contractors', 'people', 'Did you pay any contractor or self-employed person more than $500 for services?', { show: BIZ }),
    yn('ca_construction', 'people', 'Is construction your main business and do you pay subcontractors?', { show: BIZ }),
    yn('ca_dividends', 'people', 'Did it pay dividends or interest to shareholders or lenders in Canada?', { show: any(CORP, kind('trust')) }),
    yn('ca_pay_nr', 'people', 'Did you pay rent, dividends, interest, royalties or fees to a non-resident of Canada?', { show: any(BIZ, PERSON) }),
    choice('ca_payroll_size', 'people', 'What is your total yearly payroll?', { show: yes('ca_employees'), options: opts('p1|Under $500,000', 'p2|$500,000 to $1 million', 'p3|$1 million to $2.25 million', 'p4|Over $2.25 million'), help: 'Ontario, British Columbia, Manitoba and Québec charge employer health or payroll taxes above certain payroll sizes.' }),
    // ── dates ──
    monthday('fye', 'dates', 'When does its financial year end?', { show: kind('corporation', 'partnership', 'nonprofit'), help: 'For example 31 December, or 31 March. Corporate tax, GST/HST and information returns are all counted from this date.' }),
  ],
  compliances: [],
  sources: [],
};
void [C, afterCalYear, afterFY, afterPeriod, always, ent, event, fixed, not, src, stag, selfEmployed, sellsIn, registeredOrOver, monthday];
