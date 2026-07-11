const { join } = require('path');
const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');

const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

// Helper to build a question row
function q(secId, text, type, required, opts) {
  return {
    secId,
    text,
    type: type || 'text',
    required: required ? 1 : 0,
    options: opts?.options ? JSON.stringify(opts.options) : null,
    placeholder: opts?.placeholder || null,
    helpText: opts?.helpText || null,
    description: opts?.description || null,
  };
}

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL || dbUrl;
  if (!DATABASE_URL) { console.error('No DATABASE_URL found'); process.exit(1); }

  const sql = postgres(DATABASE_URL);

  try {
    const rows = await sql`SELECT id, current_version, org_id, form_code FROM smart_forms WHERE form_code IN ('T1-CAN', 'CAN-T1-INTAKE')`;
    if (rows.length === 0) { console.error('No T1 forms found.'); process.exit(1); }

    for (const row of rows) {
      const formId = row.id;
      const versionId = row.current_version;
      const orgId = row.org_id;
      const now = new Date().toISOString();

      console.log(`Seeding T1 form: ${formId} (${row.form_code}), version: ${versionId}, org: ${orgId}`);

      await sql`DELETE FROM smart_form_questions WHERE version_id = ${versionId}`;
      await sql`DELETE FROM smart_form_sections WHERE version_id = ${versionId}`;
      console.log('Cleared existing sections and questions.');

      const sections = [];
      const questions = [];

      function addSection(title, description, isConditional = false) {
        const id = uuidv4();
        sections.push({ id, title, description, isConditional: isConditional ? 1 : 0 });
        return id;
      }

      function addQ(secId, text, type, required, opts) {
        questions.push(q(secId, text, type, required, opts));
      }

      // ══════════════════════════════════════════════════════════════
      // PHASE 1: GET STARTED (Screens 1-6)
      // ══════════════════════════════════════════════════════════════

      // Screen 1: Welcome
      const s1 = addSection('Welcome', 'Let\'s prepare your Canadian income tax return. This guided interview walks you through personal information, income, deductions, credits, and provincial questions.');
      addQ(s1, 'Are you starting a new return or continuing an existing one?', 'radio', true, { options: ['Start My Return', 'Continue an Existing Return'] });

      // Screen 2: Select Tax Year
      const s2 = addSection('Select Tax Year', 'Choose the tax year you are preparing.');
      addQ(s2, 'Which tax year are you preparing?', 'select', true, { options: ['2025', '2024', '2023', '2022', '2021', '2020'], helpText: 'Select the tax year for this return.' });
      addQ(s2, 'Are you filing a prior-year return?', 'checkbox', false, { helpText: 'If you need to file more than one outstanding return, complete the oldest year first.' });

      // Screen 3: Who Is This Return For?
      const s3 = addSection('Who Is This Return For?', 'Tell us whose tax return you are preparing.');
      addQ(s3, 'Whose tax return are you preparing?', 'radio', true, { options: ['My own return', 'My spouse or common-law partner\'s return', 'Another individual\'s return', 'A deceased individual\'s return'] });
      addQ(s3, 'What is your relationship to the taxpayer?', 'text', false, { helpText: 'Only required if preparing for another individual.' });
      addQ(s3, 'Are you authorized to prepare and file this return?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s3, 'Date of death (if deceased)', 'date', false, { helpText: 'Only applicable for a deceased taxpayer.' });
      addQ(s3, 'Legal representative name', 'text', false);

      // Screen 4: Spouse Filing Option
      const s4 = addSection('Spouse Filing Option', 'Canada does not have a joint personal income tax return. Each spouse or common-law partner files a separate T1 return. Preparing both returns together allows the system to coordinate certain deductions, credits and transfers.');
      addQ(s4, 'Would you like to prepare your spouse or common-law partner\'s return at the same time?', 'radio', true, { options: ['Yes, prepare both returns together', 'No, prepare only this taxpayer\'s return', 'Not applicable'] });

      // Screen 5: Documents Checklist
      const s5 = addSection('Documents Checklist', 'Confirm which documents and records you have available. Documents are normally not submitted with an electronically filed return, but CRA may request them later.');
      addQ(s5, 'I have my previous Notice of Assessment or Notice of Reassessment', 'checkbox', false);
      addQ(s5, 'I have my RRSP deduction limit and unused contribution information', 'checkbox', false);
      addQ(s5, 'I have my capital-loss and non-capital-loss carryforward amounts', 'checkbox', false);
      addQ(s5, 'I have my Home Buyers\' Plan and Lifelong Learning Plan balances', 'checkbox', false);
      addQ(s5, 'I have my T4 employment income slips', 'checkbox', false);
      addQ(s5, 'I have my T4A, T4A(P), T4A(OAS), T4E pension and benefit slips', 'checkbox', false);
      addQ(s5, 'I have my T5, T3 investment income slips', 'checkbox', false);
      addQ(s5, 'I have my T5008 securities transaction statements', 'checkbox', false);
      addQ(s5, 'I have my T5013 partnership income slips', 'checkbox', false);
      addQ(s5, 'I have my self-employment income and expense records', 'checkbox', false);
      addQ(s5, 'I have my rental income and expense records', 'checkbox', false);
      addQ(s5, 'I have my RRSP, FHSA contribution receipts', 'checkbox', false);
      addQ(s5, 'I have my medical expense receipts', 'checkbox', false);
      addQ(s5, 'I have my charitable donation receipts', 'checkbox', false);
      addQ(s5, 'I have my child-care receipts', 'checkbox', false);
      addQ(s5, 'I have my tuition certificate (T2202)', 'checkbox', false);
      addQ(s5, 'I have my T2200 or T2200S signed by my employer', 'checkbox', false);
      addQ(s5, 'I have my foreign income statements', 'checkbox', false);
      addQ(s5, 'I have my cryptocurrency transaction records', 'checkbox', false);

      // Screen 6: Prior Notice of Assessment
      const s6 = addSection('Prior Notice of Assessment', 'Enter carryforward amounts from your most recent Notice of Assessment. These amounts affect your RRSP room, tuition credits, and loss balances.');
      addQ(s6, 'Did the taxpayer file a Canadian tax return for the previous year?', 'radio', true, { options: ['Yes', 'No', 'Not sure'] });
      addQ(s6, 'Previous tax year filed', 'select', false, { options: ['2024', '2023', '2022', '2021', '2020'] });
      addQ(s6, 'RRSP deduction limit for 2025', 'currency', false, { helpText: 'Found on line A of your Notice of Assessment.' });
      addQ(s6, 'Unused RRSP contributions available', 'currency', false);
      addQ(s6, 'Unused federal tuition amount', 'currency', false);
      addQ(s6, 'Unused provincial tuition amount', 'currency', false);
      addQ(s6, 'Net capital-loss balance', 'currency', false, { helpText: 'Carryforward of capital losses from prior years.' });
      addQ(s6, 'Non-capital-loss balance', 'currency', false);
      addQ(s6, 'Home Buyers\' Plan repayment balance', 'currency', false);
      addQ(s6, 'Lifelong Learning Plan repayment balance', 'currency', false);
      addQ(s6, 'Canada Training Credit limit', 'currency', false);
      // NETFILE access code question removed

      // ══════════════════════════════════════════════════════════════
      // PHASE 2: PERSONAL INFORMATION (Screens 7-13)
      // ══════════════════════════════════════════════════════════════

      // Screen 7: Legal Name
      const s7 = addSection('Legal Name', 'Enter the name exactly as it appears on the SIN record.');
      addQ(s7, 'First name', 'text', true);
      addQ(s7, 'Middle name', 'text', false);
      addQ(s7, 'Last name', 'text', true);
      addQ(s7, 'Was the taxpayer\'s name changed during the year?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s7, 'Previous legal name', 'text', false);

      // Screen 8: Social Insurance Number
      const s8 = addSection('Social Insurance Number', 'Your SIN is required by CRA for identification. Enter exactly 9 digits.');
      addQ(s8, 'Social Insurance Number (SIN)', 'text', true, { placeholder: 'XXX-XXX-XXX', helpText: '9-digit number on your SIN card or CRA correspondence.' });
      addQ(s8, 'Confirm Social Insurance Number', 'text', true);
      addQ(s8, 'Did the taxpayer\'s SIN change during or after the tax year?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s8, 'Previous SIN', 'text', false);
      addQ(s8, 'Date the new SIN became effective', 'date', false);

      // Screen 9: Date of Birth
      const s9 = addSection('Date of Birth', 'Your date of birth is used for age-dependent credits and benefits.');
      addQ(s9, 'Date of birth', 'date', true);

      // Screen 10: Contact Information
      const s10 = addSection('Contact Information', 'How can CRA reach the taxpayer?');
      addQ(s10, 'Telephone number', 'text', false);
      addQ(s10, 'Alternate telephone number', 'text', false);
      addQ(s10, 'Email address', 'text', false);
      addQ(s10, 'Preferred language of correspondence', 'radio', false, { options: ['English', 'French'] });
      addQ(s10, 'Would the taxpayer like CRA correspondence electronically where available?', 'radio', false, { options: ['Yes', 'No', 'Already registered', 'Not sure'] });

      // Screen 11: Mailing Address
      const s11 = addSection('Mailing Address', 'Enter the taxpayer\'s mailing address for CRA correspondence.');
      addQ(s11, 'Apartment or unit number', 'text', false);
      addQ(s11, 'Street number', 'text', true);
      addQ(s11, 'Street name', 'text', true);
      addQ(s11, 'PO Box', 'text', false);
      addQ(s11, 'City', 'text', true);
      addQ(s11, 'Province or territory', 'select', true, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'] });
      addQ(s11, 'Postal code', 'text', true, { placeholder: 'A1A 1A1' });
      addQ(s11, 'Country', 'text', false, { placeholder: 'Canada' });
      addQ(s11, 'Is the taxpayer\'s home address the same as the mailing address?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 12: Province on December 31
      const s12 = addSection('Province of Residence on December 31', 'Your province of residence on December 31 determines your provincial tax rate and applicable credits.');
      addQ(s12, 'Province or territory on December 31, 2025', 'select', true, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon','Outside Canada'], helpText: 'This determines your provincial tax calculations.' });

      // Screen 13: Province Movement
      const s13 = addSection('Movement Between Provinces', 'If the taxpayer moved between provinces during the year.');
      addQ(s13, 'Did the taxpayer move from one province or territory to another during 2025?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s13, 'Previous province or territory', 'select', false, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'] });
      addQ(s13, 'New province or territory', 'select', false, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'] });
      addQ(s13, 'Date of move', 'date', false);
      addQ(s13, 'Reason for move', 'select', false, { options: ['Employment', 'Business', 'Education', 'Family', 'Other'] });

      // ══════════════════════════════════════════════════════════════
      // PHASE 3: RESIDENCY & CITIZENSHIP (Screens 14-17)
      // ══════════════════════════════════════════════════════════════

      // Screen 14: Residency Status
      const s14 = addSection('Canadian Tax Residency', 'Residency for Canadian income tax purposes is not the same as citizenship or immigration status.');
      addQ(s14, 'What was the taxpayer\'s Canadian tax residency during 2025?', 'select', true, { options: ['Resident of Canada for the full year','Became a resident during the year','Ceased to be a resident during the year','Non-resident of Canada','Deemed resident of Canada','Not sure'] });
      addQ(s14, 'Does the taxpayer have a home available in Canada?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s14, 'Does the taxpayer have a spouse or dependants in Canada?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s14, 'Does the taxpayer hold Canadian health coverage?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s14, 'Does the taxpayer have a Canadian driver\'s licence?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s14, 'Immigration status', 'select', false, { options: ['Citizen', 'Permanent Resident', 'Work Permit', 'Study Permit', 'Visitor', 'Other'] });

      // Screen 15: Newcomer to Canada (conditional)
      const s15 = addSection('Newcomer to Canada', 'For taxpayers who became Canadian tax residents during 2025.', true);
      addQ(s15, 'Date the taxpayer entered Canada', 'date', true);
      addQ(s15, 'Date Canadian tax residency began (if different)', 'date', false);
      addQ(s15, 'Country of residence before entering Canada', 'text', true);
      addQ(s15, 'Immigration status at entry', 'select', false, { options: ['Permanent Resident', 'Work Permit', 'Study Permit', 'Refugee', 'Other'] });
      addQ(s15, 'Income earned before Canadian residency (CAD)', 'currency', false);
      addQ(s15, 'Canadian-source income earned before residency began (CAD)', 'currency', false);
      addQ(s15, 'Income earned after Canadian residency began (CAD)', 'currency', false);
      addQ(s15, 'Did the taxpayer own foreign property when becoming resident?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 16: Emigrant (conditional)
      const s16 = addSection('Emigrant from Canada', 'For taxpayers who ceased Canadian residency during 2025.', true);
      addQ(s16, 'Date of departure from Canada', 'date', true);
      addQ(s16, 'Destination country', 'text', true);
      addQ(s16, 'Residential ties maintained in Canada', 'long_text', false);
      addQ(s16, 'Canadian property retained after departure', 'long_text', false);
      addQ(s16, 'Canadian-source income after departure (CAD)', 'currency', false);
      addQ(s16, 'Mailing address after departure', 'long_text', false);

      // Screen 17: Citizenship & Elections Canada
      const s17 = addSection('Canadian Citizenship & Elections Canada', 'Authorize CRA to share information with Elections Canada.');
      addQ(s17, 'Was the taxpayer a Canadian citizen during 2025?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s17, 'Does the taxpayer authorize CRA to provide information to Elections Canada?', 'radio', false, { options: ['Yes', 'No'] });

      // ══════════════════════════════════════════════════════════════
      // PHASE 4: MARITAL & DEPENDANTS (Screens 18-20)
      // ══════════════════════════════════════════════════════════════

      // Screen 18: Marital Status
      const s18 = addSection('Marital Status', 'Your marital status on December 31 affects tax credits, benefit payments, and filing requirements.');
      addQ(s18, 'Marital status on December 31, 2025', 'select', true, { options: ['Married','Living common-law','Widowed','Divorced','Separated','Single'] });
      addQ(s18, 'Did the taxpayer\'s marital status change during 2025?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s18, 'Previous marital status', 'select', false, { options: ['Married','Living common-law','Widowed','Divorced','Separated','Single'] });
      addQ(s18, 'Effective date of change', 'date', false);

      // Screen 19: Spouse Info (conditional on married/common-law)
      const s19 = addSection('Spouse / Common-Law Partner Information', 'Information about your spouse or common-law partner.', true);
      addQ(s19, 'Spouse\'s first name', 'text', true);
      addQ(s19, 'Spouse\'s last name', 'text', true);
      addQ(s19, 'Spouse\'s SIN', 'text', true, { placeholder: 'XXX-XXX-XXX' });
      addQ(s19, 'Spouse\'s date of birth', 'date', true);
      addQ(s19, 'Spouse\'s net income for the year', 'currency', true, { helpText: 'Enter the total net income from all sources.' });
      addQ(s19, 'Spouse\'s province of residence', 'select', false, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'] });
      addQ(s19, 'Was the spouse self-employed?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s19, 'Is the spouse filing a Canadian tax return?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s19, 'Does the spouse have a disability?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s19, 'Did the taxpayer support the spouse?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 20: Dependants
      const s20 = addSection('Dependants', 'Did the taxpayer support any children or other dependants during 2025?');
      addQ(s20, 'Did the taxpayer support any children or other dependants?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s20, 'Dependant 1 — First name', 'text', false);
      addQ(s20, 'Dependant 1 — Last name', 'text', false);
      addQ(s20, 'Dependant 1 — SIN (if available)', 'text', false);
      addQ(s20, 'Dependant 1 — Date of birth', 'date', false);
      addQ(s20, 'Dependant 1 — Relationship', 'select', false, { options: ['Child','Stepchild','Grandchild','Parent','Grandparent','Brother','Sister','Other relative'] });
      addQ(s20, 'Dependant 1 — Net income', 'currency', false);
      addQ(s20, 'Dependant 1 — Did the dependant live with the taxpayer?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s20, 'Dependant 1 — Months living with taxpayer', 'number', false);
      addQ(s20, 'Dependant 1 — Does the dependant have a disability?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s20, 'Dependant 1 — Was custody shared?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s20, 'Dependant 1 — Is the dependant attending college or university?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s20, 'Number of additional dependants', 'number', false, { helpText: 'Enter 0 if only one dependant.' });
      addQ(s20, 'Additional dependant details', 'long_text', false, { helpText: 'For each additional dependant: name, DOB, SIN, relationship, income.' });

      // ══════════════════════════════════════════════════════════════
      // PHASE 5: TAX PROFILE (Screens 21-25)
      // ══════════════════════════════════════════════════════════════

      // Screen 21: How Was Your Year? (master triage)
      const s21 = addSection('How Was Your Year?', 'Select everything that applied during 2025. Based on your selections, the system creates your personalized filing checklist.');

      // Employment
      addQ(s21, 'Worked for one or more employers (received T4 slips)', 'checkbox', false);
      addQ(s21, 'Received tips or gratuities not on a T4', 'checkbox', false);
      addQ(s21, 'Had employment expenses (T2200 signed)', 'checkbox', false);
      addQ(s21, 'Worked from home', 'checkbox', false);
      addQ(s21, 'Received Employment Insurance (T4E)', 'checkbox', false);
      addQ(s21, 'Received workers\' compensation (T5007)', 'checkbox', false);
      // Retirement
      addQ(s21, 'Received CPP or QPP benefits', 'checkbox', false);
      addQ(s21, 'Received Old Age Security benefits', 'checkbox', false);
      addQ(s21, 'Received pension or annuity income (T4A)', 'checkbox', false);
      addQ(s21, 'Received RRSP or RRIF income', 'checkbox', false);
      addQ(s21, 'Received social assistance or disability benefits', 'checkbox', false);
      // Investments
      addQ(s21, 'Earned interest income', 'checkbox', false);
      addQ(s21, 'Received dividends from Canadian corporations', 'checkbox', false);
      addQ(s21, 'Received trust income (T3)', 'checkbox', false);
      addQ(s21, 'Received partnership income (T5013)', 'checkbox', false);
      addQ(s21, 'Sold stocks, bonds or mutual funds', 'checkbox', false);
      addQ(s21, 'Had cryptocurrency transactions', 'checkbox', false);
      addQ(s21, 'Had foreign investments or income', 'checkbox', false);
      addQ(s21, 'Owned specified foreign property costing more than CAD 100,000', 'checkbox', false);
      // Property
      addQ(s21, 'Owned a rental property', 'checkbox', false);
      addQ(s21, 'Sold real estate or a principal residence', 'checkbox', false);
      // Business
      addQ(s21, 'Had self-employment, sole proprietorship, or professional income', 'checkbox', false);
      addQ(s21, 'Earned farming or fishing income', 'checkbox', false);
      addQ(s21, 'Earned platform, gig, or online income', 'checkbox', false);
      // Education
      addQ(s21, 'Attended college or university (received T2202)', 'checkbox', false);
      addQ(s21, 'Paid student-loan interest', 'checkbox', false);
      addQ(s21, 'Received a scholarship, bursary or research grant', 'checkbox', false);
      // Family & Life
      addQ(s21, 'Paid child-care expenses', 'checkbox', false);
      addQ(s21, 'Paid or received support payments', 'checkbox', false);
      addQ(s21, 'Adopted a child', 'checkbox', false);
      addQ(s21, 'Became disabled or supported a disabled person', 'checkbox', false);
      addQ(s21, 'Purchased a qualifying home', 'checkbox', false);
      addQ(s21, 'Made home-accessibility renovations', 'checkbox', false);
      addQ(s21, 'Moved for work, business or education', 'checkbox', false);
      // Tax-Saving
      addQ(s21, 'Contributed to an RRSP', 'checkbox', false);
      addQ(s21, 'Repaid or withdrew under the Home Buyers\' Plan', 'checkbox', false);
      addQ(s21, 'Repaid or withdrew under the Lifelong Learning Plan', 'checkbox', false);
      addQ(s21, 'Opened, contributed to, or withdrew from an FHSA', 'checkbox', false);
      addQ(s21, 'Made charitable donations', 'checkbox', false);
      addQ(s21, 'Paid medical expenses', 'checkbox', false);
      addQ(s21, 'Paid union or professional dues', 'checkbox', false);
      addQ(s21, 'Paid investment-management fees or carrying charges', 'checkbox', false);
      addQ(s21, 'Made political contributions', 'checkbox', false);

      // Screen 22: First-Time Filer
      const s22 = addSection('First-Time Filer', 'Additional information for taxpayers filing their first Canadian return.');
      addQ(s22, 'Is this the first Canadian income tax return the taxpayer has ever filed?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s22, 'Has the taxpayer previously received Canadian benefits (e.g. GST/HST credit)?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 23: Specified Foreign Property (conditional)
      const s23 = addSection('Specified Foreign Property', 'At any time during 2025, did the taxpayer own specified foreign property exceeding CAD 100,000?', true);
      addQ(s23, 'Did the taxpayer own specified foreign property exceeding CAD 100,000?', 'radio', true, { options: ['Yes', 'No', 'Not sure'] });
      addQ(s23, 'Types of foreign property held', 'long_text', false);
      addQ(s23, 'Countries where property was located', 'text', false);
      addQ(s23, 'Maximum cost amount during the year (CAD)', 'currency', false);
      addQ(s23, 'Cost amount at year-end (CAD)', 'currency', false);
      addQ(s23, 'Gross income from foreign property (CAD)', 'currency', false);
      addQ(s23, 'Gain or loss from disposition (CAD)', 'currency', false);

      // Screen 24: Property Disposition (conditional)
      const s24 = addSection('Property Disposition', 'Report the sale, transfer, or disposal of real estate during 2025.', true);
      addQ(s24, 'Did the taxpayer sell, transfer, or dispose of real estate?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s24, 'Type of property', 'select', false, { options: ['Principal residence', 'Rental property', 'Vacation property', 'Land', 'Commercial property', 'Other'] });
      addQ(s24, 'Address of property', 'text', false);
      addQ(s24, 'Date acquired', 'date', false);
      addQ(s24, 'Date disposed', 'date', false);
      addQ(s24, 'Proceeds of disposition (CAD)', 'currency', false);
      addQ(s24, 'Adjusted cost base (CAD)', 'currency', false);
      addQ(s24, 'Selling expenses (CAD)', 'currency', false);
      addQ(s24, 'Was it the taxpayer\'s principal residence?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s24, 'Years designated as a principal residence', 'number', false);
      addQ(s24, 'Was any part rented or used for business?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 25: Other Mandatory Questions
      const s25 = addSection('Other Mandatory Questions', 'CRA requires answers to these questions for every return.');
      addQ(s25, 'Did the taxpayer receive a qualifying retroactive lump-sum payment?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Did the taxpayer have split income subject to TOSI?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Did the taxpayer have income exempt under section 87 of the Indian Act?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Was the taxpayer confined to a prison or institution for 90+ days?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Did the taxpayer declare bankruptcy during the year?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Did the taxpayer have instalment payments to CRA?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s25, 'Instalment payments made (CAD)', 'currency', false);
      addQ(s25, 'Is the return being filed after the normal deadline?', 'radio', false, { options: ['Yes', 'No'] });

      // ══════════════════════════════════════════════════════════════
      // PHASE 6: INCOME (Screens 26-44)
      // ══════════════════════════════════════════════════════════════

      // Screen 26: Income Dashboard
      const s26 = addSection('Income Dashboard', 'Enter your income from all sources. Based on your tax profile, only relevant sections are shown.');

      // Screen 27: T4 Employment Income (conditional)
      const s27 = addSection('T4 Employment Income', 'Enter information from each T4 slip received.', true);
      addQ(s27, 'Employer name', 'text', true);
      addQ(s27, 'Province of employment', 'select', false, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'] });
      addQ(s27, 'Box 14 — Employment income', 'currency', true);
      addQ(s27, 'Box 16 — Employee CPP contributions', 'currency', false);
      addQ(s27, 'Box 17 — Employee QPP contributions', 'currency', false);
      addQ(s27, 'Box 18 — Employee EI premiums', 'currency', false);
      addQ(s27, 'Box 20 — RPP contributions', 'currency', false);
      addQ(s27, 'Box 22 — Income tax deducted', 'currency', true);
      addQ(s27, 'Box 24 — EI insurable earnings', 'currency', false);
      addQ(s27, 'Box 26 — CPP/QPP pensionable earnings', 'currency', false);
      addQ(s27, 'Box 44 — Union dues', 'currency', false);
      addQ(s27, 'Box 46 — Charitable donations through payroll', 'currency', false);
      addQ(s27, 'Box 52 — Pension adjustment', 'currency', false);
      addQ(s27, 'Box 55 — PPIP premiums', 'currency', false);
      addQ(s27, 'Other information boxes', 'long_text', false, { helpText: 'Format: Box XX = $XXX.XX, one per line.' });
      addQ(s27, 'Tips not on T4 (CAD)', 'currency', false);
      addQ(s27, 'Security-option benefit reported?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s27, 'Retiring allowance / severance (CAD)', 'currency', false);

      // Screen 28: Tips & Other Employment (conditional)
      const s28 = addSection('Tips & Other Employment Income', 'Report employment income not shown on a T4.', true);
      addQ(s28, 'Type of income', 'select', false, { options: ['Tips and gratuities','Occasional earnings','Wage-loss replacement','Foreign employment income','Clergy housing allowance','Retiring allowance','Other'] });
      addQ(s28, 'Employer or payer', 'text', false);
      addQ(s28, 'Gross amount (CAD)', 'currency', true);
      addQ(s28, 'Tax deducted (CAD)', 'currency', false);

      // Screen 29: T4E Employment Insurance (conditional)
      const s29 = addSection('T4E Employment Insurance', 'Enter details from your T4E slip.', true);
      addQ(s29, 'Total benefits paid (CAD)', 'currency', true);
      addQ(s29, 'Income tax deducted (CAD)', 'currency', false);
      addQ(s29, 'Benefits repaid (CAD)', 'currency', false);
      addQ(s29, 'Type of benefits', 'select', false, { options: ['Regular','Maternity','Parental','Sickness','Compassionate care','Other'] });

      // Screen 30: CPP/QPP and OAS (conditional)
      const s30 = addSection('CPP, QPP and OAS Benefits', 'Enter government pension benefits.', true);
      addQ(s30, 'CPP or QPP benefits received (CAD)', 'currency', false);
      addQ(s30, 'Income tax deducted from CPP/QPP (CAD)', 'currency', false);
      addQ(s30, 'OAS benefits received (CAD)', 'currency', false);
      addQ(s30, 'Income tax deducted from OAS (CAD)', 'currency', false);
      addQ(s30, 'Was OAS subject to recovery tax?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s30, 'CPP/QPP disability benefit received?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s30, 'CPP/QPP death benefit received (CAD)', 'currency', false);

      // Screen 31: T4A Pension (conditional)
      const s31 = addSection('T4A Pension and Other Income', 'Enter details from T4A slips.', true);
      addQ(s31, 'Payer name', 'text', false);
      addQ(s31, 'Pension or superannuation (CAD)', 'currency', false);
      addQ(s31, 'Annuity payments (CAD)', 'currency', false);
      addQ(s31, 'Lump-sum payments (CAD)', 'currency', false);
      addQ(s31, 'Fees for services (CAD)', 'currency', false);
      addQ(s31, 'Scholarships and bursaries (CAD)', 'currency', false);
      addQ(s31, 'RESP accumulated income payments (CAD)', 'currency', false);
      addQ(s31, 'Income tax deducted (CAD)', 'currency', false);
      addQ(s31, 'Is pension splitting available?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 32: RRSP/RRIF Income (conditional)
      const s32 = addSection('RRSP/RRIF Income', 'Enter RRSP or RRIF withdrawals.', true);
      addQ(s32, 'Type of withdrawal', 'select', true, { options: ['Normal RRSP withdrawal','HBP withdrawal','LLP withdrawal','RRIF minimum payment','RRIF excess payment','Other'] });
      addQ(s32, 'Withdrawal amount (CAD)', 'currency', true);
      addQ(s32, 'Income tax deducted (CAD)', 'currency', false);

      // Screen 33: T5007 Social Benefits (conditional)
      const s33 = addSection('T5007 Social Benefits', 'Workers\' compensation and social assistance.', true);
      addQ(s33, 'Workers\' compensation benefits (CAD)', 'currency', false);
      addQ(s33, 'Social assistance payments (CAD)', 'currency', false);
      addQ(s33, 'Provincial or territorial supplements (CAD)', 'currency', false);

      // Screen 34: T5 Investment Income (conditional)
      const s34 = addSection('T5 Investment Income', 'Enter details from each T5 slip.', true);
      addQ(s34, 'Financial institution name', 'text', true);
      addQ(s34, 'Box 13 — Interest from Canadian sources (CAD)', 'currency', false);
      addQ(s34, 'Box 24 — Eligible dividends (CAD)', 'currency', false);
      addQ(s34, 'Box 25 — Taxable amount of eligible dividends (CAD)', 'currency', false);
      addQ(s34, 'Box 10 — Other-than-eligible dividends (CAD)', 'currency', false);
      addQ(s34, 'Box 11 — Taxable amount of other dividends (CAD)', 'currency', false);
      addQ(s34, 'Box 15 — Foreign income (CAD)', 'currency', false);
      addQ(s34, 'Box 16 — Foreign tax paid (CAD)', 'currency', false);
      addQ(s34, 'Box 18 — Capital gains dividends (CAD)', 'currency', false);
      addQ(s34, 'Is the slip jointly owned with a spouse?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 35: T3 Trust Income (conditional)
      const s35 = addSection('T3 Trust Income', 'Enter details from T3 slips.', true);
      addQ(s35, 'Trust name', 'text', false);
      addQ(s35, 'Interest income (CAD)', 'currency', false);
      addQ(s35, 'Capital gains (CAD)', 'currency', false);
      addQ(s35, 'Eligible dividends (CAD)', 'currency', false);
      addQ(s35, 'Other-than-eligible dividends (CAD)', 'currency', false);
      addQ(s35, 'Foreign income (CAD)', 'currency', false);
      addQ(s35, 'Foreign tax paid (CAD)', 'currency', false);
      addQ(s35, 'Return of capital (CAD)', 'currency', false);

      // Screen 36: T5013 Partnership Income (conditional)
      const s36 = addSection('T5013 Partnership Income', 'Enter details from T5013 slips.', true);
      addQ(s36, 'Partnership name', 'text', true);
      addQ(s36, 'Partnership account number', 'text', false);
      addQ(s36, 'Partnership income or loss (CAD)', 'currency', false);
      addQ(s36, 'Capital gains allocated (CAD)', 'currency', false);
      addQ(s36, 'Investment income allocated (CAD)', 'currency', false);
      addQ(s36, 'Foreign income (CAD)', 'currency', false);
      addQ(s36, 'Foreign tax paid (CAD)', 'currency', false);
      addQ(s36, 'Is this a limited partnership?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 37: T5008 Securities (conditional)
      const s37 = addSection('T5008 Securities Transactions', 'Enter securities transactions.', true);
      addQ(s37, 'Security description', 'text', true);
      addQ(s37, 'Date acquired', 'date', false);
      addQ(s37, 'Date disposed', 'date', true);
      addQ(s37, 'Quantity', 'number', false);
      addQ(s37, 'Proceeds of disposition (CAD)', 'currency', true);
      addQ(s37, 'Adjusted cost base (CAD)', 'currency', true);
      addQ(s37, 'Commissions and expenses (CAD)', 'currency', false);

      // Screen 38: Capital Gains (conditional)
      const s38 = addSection('Capital Gains and Losses', 'Report gains and losses from dispositions of capital property.', true);
      addQ(s38, 'Type of property', 'select', true, { options: ['Publicly traded shares','Mutual funds','Bonds','Real estate','Personal-use property','Cryptocurrency','Other'] });
      addQ(s38, 'Description of property', 'text', true);
      addQ(s38, 'Date acquired', 'date', false);
      addQ(s38, 'Date disposed', 'date', true);
      addQ(s38, 'Proceeds of disposition (CAD)', 'currency', true);
      addQ(s38, 'Adjusted cost base (CAD)', 'currency', true);
      addQ(s38, 'Outlays and expenses (CAD)', 'currency', false);
      addQ(s38, 'Prior-year capital loss to apply (CAD)', 'currency', false);

      // Screen 39: Cryptocurrency (conditional)
      const s39 = addSection('Cryptocurrency and Digital Assets', 'Report all cryptocurrency transactions.', true);
      addQ(s39, 'Did the taxpayer sell cryptocurrency?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s39, 'Did the taxpayer trade one cryptocurrency for another?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s39, 'Did the taxpayer receive cryptocurrency from mining or staking?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s39, 'Is the taxpayer treated as a trader or investor?', 'radio', false, { options: ['Investor (capital gains)', 'Trader (business income)'] });
      addQ(s39, 'Asset name / symbol', 'text', false);
      addQ(s39, 'Canadian-dollar proceeds (CAD)', 'currency', false);
      addQ(s39, 'Canadian-dollar cost (CAD)', 'currency', false);
      addQ(s39, 'Transaction fees (CAD)', 'currency', false);

      // Screen 40: Rental Income (conditional)
      const s40 = addSection('Rental Income', 'Report income and expenses for each rental property.', true);
      addQ(s40, 'Property address', 'text', true);
      addQ(s40, 'Type of property', 'select', false, { options: ['Residential house','Condominium','Apartment building','Commercial property','Vacation rental','Other'] });
      addQ(s40, 'Ownership percentage', 'number', false);
      addQ(s40, 'Gross rental income (CAD)', 'currency', true);
      addQ(s40, 'Insurance (CAD)', 'currency', false);
      addQ(s40, 'Interest and bank charges (CAD)', 'currency', false);
      addQ(s40, 'Repairs and maintenance (CAD)', 'currency', false);
      addQ(s40, 'Property taxes (CAD)', 'currency', false);
      addQ(s40, 'Utilities (CAD)', 'currency', false);
      addQ(s40, 'Condominium fees (CAD)', 'currency', false);
      addQ(s40, 'Management fees (CAD)', 'currency', false);
      addQ(s40, 'Professional fees (CAD)', 'currency', false);
      addQ(s40, 'Advertising (CAD)', 'currency', false);
      addQ(s40, 'Other expenses (CAD)', 'currency', false);
      addQ(s40, 'Capital cost allowance (CAD)', 'currency', false);
      addQ(s40, 'Was the property a short-term rental (Airbnb etc.)?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 41: Self-Employment (conditional)
      const s41 = addSection('Self-Employment / Business Income', 'Report business income and expenses (T2125).', true);
      addQ(s41, 'Business name', 'text', true);
      addQ(s41, 'Business number (BN)', 'text', false);
      addQ(s41, 'Industry code', 'text', false);
      addQ(s41, 'Fiscal period start', 'date', false);
      addQ(s41, 'Fiscal period end', 'date', false);
      addQ(s41, 'Accounting method', 'select', false, { options: ['Cash', 'Accrual'] });
      addQ(s41, 'GST/HST registration status', 'select', false, { options: ['Registered', 'Not registered', 'Small supplier exemption'] });
      addQ(s41, 'Gross sales / revenue (CAD)', 'currency', true);
      addQ(s41, 'Fees and commissions (CAD)', 'currency', false);
      addQ(s41, 'Platform / gig income (CAD)', 'currency', false);
      addQ(s41, 'Advertising expenses (CAD)', 'currency', false);
      addQ(s41, 'Meals and entertainment (CAD)', 'currency', false);
      addQ(s41, 'Insurance (CAD)', 'currency', false);
      addQ(s41, 'Interest and bank charges (CAD)', 'currency', false);
      addQ(s41, 'Office expenses (CAD)', 'currency', false);
      addQ(s41, 'Supplies (CAD)', 'currency', false);
      addQ(s41, 'Professional fees (CAD)', 'currency', false);
      addQ(s41, 'Rent (CAD)', 'currency', false);
      addQ(s41, 'Telephone and utilities (CAD)', 'currency', false);
      addQ(s41, 'Travel (CAD)', 'currency', false);
      addQ(s41, 'Motor-vehicle expenses (CAD)', 'currency', false);
      addQ(s41, 'Subcontractor payments (CAD)', 'currency', false);
      addQ(s41, 'Business-use-of-home expenses (CAD)', 'currency', false);
      addQ(s41, 'Capital cost allowance (CAD)', 'currency', false);
      addQ(s41, 'Other expenses (CAD)', 'currency', false);
      addQ(s41, 'Was a home office used?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s41, 'Was a vehicle used for business?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 42: Foreign Income (conditional)
      const s42 = addSection('Foreign Income', 'Report income earned from sources outside Canada.', true);
      addQ(s42, 'Type of foreign income', 'select', true, { options: ['Foreign employment','Foreign pension','Foreign interest','Foreign dividends','Foreign rental','Foreign business','Foreign capital gains','Other'] });
      addQ(s42, 'Country of source', 'text', true);
      addQ(s42, 'Foreign currency amount', 'text', false);
      addQ(s42, 'Exchange rate used', 'text', false);
      addQ(s42, 'Canadian-dollar equivalent (CAD)', 'currency', true);
      addQ(s42, 'Foreign tax paid (CAD)', 'currency', false);
      addQ(s42, 'Is a foreign tax credit being claimed?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 43: Support Payments Received (conditional)
      const s43 = addSection('Support Payments Received', 'Report support payments received during the year.', true);
      addQ(s43, 'Type of support received', 'select', false, { options: ['Spousal support', 'Child support', 'Both'] });
      addQ(s43, 'Name of payer', 'text', false);
      addQ(s43, 'Total amount received (CAD)', 'currency', true);
      addQ(s43, 'Taxable amount (CAD)', 'currency', false);
      addQ(s43, 'Date of court order or agreement', 'date', false);

      // Screen 44: Other Income
      const s44 = addSection('Other Income', 'Report any other taxable income not covered by previous sections.');
      addQ(s44, 'Type of other income', 'select', false, { options: ['Scholarships','Research grants','Death benefits','Retiring allowances','Royalties','Estate distributions','Crowdfunding income','Other taxable income'] });
      addQ(s44, 'Description', 'text', false);
      addQ(s44, 'Payer name', 'text', false);
      addQ(s44, 'Amount (CAD)', 'currency', false);
      addQ(s44, 'Tax deducted (CAD)', 'currency', false);

      // ══════════════════════════════════════════════════════════════
      // PHASE 7: RRSP & PLANS (Screens 45-49)
      // ══════════════════════════════════════════════════════════════

      // Screen 45: RRSP Deduction (conditional)
      const s45 = addSection('RRSP Deduction Limit', 'Enter your RRSP deduction limit and contribution details.', true);
      addQ(s45, 'RRSP deduction limit for 2025 (CAD)', 'currency', true);
      addQ(s45, 'Unused RRSP contributions from prior years (CAD)', 'currency', false);
      addQ(s45, 'Pension adjustment from employer (CAD)', 'currency', false);
      addQ(s45, 'Contributions made March 2 to December 31, 2025 (CAD)', 'currency', false);
      addQ(s45, 'Contributions made in first 60 days of 2026 (CAD)', 'currency', false);
      addQ(s45, 'Contributions to own RRSP (CAD)', 'currency', false);
      addQ(s45, 'Contributions to spousal RRSP (CAD)', 'currency', false);
      addQ(s45, 'Financial institution name', 'text', false);

      // Screen 46: RRSP Deduction Choice
      const s46 = addSection('RRSP Deduction Choice', 'Choose how much of your RRSP contributions to deduct.', true);
      addQ(s46, 'How much RRSP contribution to deduct for 2025?', 'radio', false, { options: ['Deduct the maximum available', 'Enter a specific amount', 'Carry all contributions forward'] });
      addQ(s46, 'Specific deduction amount (CAD)', 'currency', false);

      // Screen 47: Home Buyers' Plan
      const s47 = addSection('Home Buyers\' Plan', 'HBP repayment and withdrawal details.', true);
      addQ(s47, 'HBP balance at the beginning of 2025 (CAD)', 'currency', false);
      addQ(s47, 'Required HBP repayment for 2025 (CAD)', 'currency', false);
      addQ(s47, 'Amount designated as HBP repayment (CAD)', 'currency', false);
      addQ(s47, 'Was a new HBP withdrawal made in 2025?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s47, 'New HBP withdrawal amount (CAD)', 'currency', false);
      addQ(s47, 'Date of qualifying home purchase', 'date', false);

      // Screen 48: Lifelong Learning Plan
      const s48 = addSection('Lifelong Learning Plan', 'LLP repayment and withdrawal details.', true);
      addQ(s48, 'LLP balance at the beginning of 2025 (CAD)', 'currency', false);
      addQ(s48, 'Required LLP repayment for 2025 (CAD)', 'currency', false);
      addQ(s48, 'Amount designated as LLP repayment (CAD)', 'currency', false);
      addQ(s48, 'Were new LLP withdrawals made?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s48, 'New LLP withdrawal amount (CAD)', 'currency', false);

      // Screen 49: FHSA
      const s49 = addSection('First Home Savings Account (FHSA)', 'Report FHSA contributions, transfers and withdrawals.', true);
      addQ(s49, 'Did the taxpayer open an FHSA in 2025?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s49, 'FHSA contributions made in 2025 (CAD)', 'currency', false);
      addQ(s49, 'Was an amount transferred from an RRSP to the FHSA?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s49, 'Transfer amount from RRSP (CAD)', 'currency', false);
      addQ(s49, 'Was a qualifying withdrawal made?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s49, 'Qualifying withdrawal amount (CAD)', 'currency', false);
      addQ(s49, 'Was a non-qualifying withdrawal made?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s49, 'Non-qualifying withdrawal amount (CAD)', 'currency', false);

      // ══════════════════════════════════════════════════════════════
      // PHASE 8: EMPLOYMENT EXPENSES (Screens 50-52)
      // ══════════════════════════════════════════════════════════════

      // Screen 50: Employment Expense Eligibility
      const s50 = addSection('Employment Expense Eligibility', 'Determine eligibility to claim employment expenses.', true);
      addQ(s50, 'Did the taxpayer incur unreimbursed expenses required by employment?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s50, 'Was a signed T2200 or T2200S received from the employer?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s50, 'Was the taxpayer a salaried or commission employee?', 'radio', false, { options: ['Salaried', 'Commission', 'Both'] });
      addQ(s50, 'Was a motor vehicle used for work?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s50, 'Was travel required?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s50, 'Were supplies purchased?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 51: Work-from-Home
      const s51 = addSection('Work-from-Home Expenses', 'Detailed method for claiming home-office expenses.', true);
      addQ(s51, 'Total area of the home (sq ft)', 'number', false);
      addQ(s51, 'Area of the workspace (sq ft)', 'number', false);
      addQ(s51, 'Hours per week the workspace was used', 'number', false);
      addQ(s51, 'Number of weeks worked from home', 'number', false);
      addQ(s51, 'Electricity expenses (CAD)', 'currency', false);
      addQ(s51, 'Heat expenses (CAD)', 'currency', false);
      addQ(s51, 'Water expenses (CAD)', 'currency', false);
      addQ(s51, 'Internet access (CAD)', 'currency', false);
      addQ(s51, 'Minor repairs and maintenance (CAD)', 'currency', false);
      addQ(s51, 'Rent (if applicable) (CAD)', 'currency', false);
      addQ(s51, 'Office supplies (CAD)', 'currency', false);
      addQ(s51, 'Cellphone use for employment (CAD)', 'currency', false);

      // Screen 52: Other T777 Expenses
      const s52 = addSection('Other T777 Employment Expenses', 'Other eligible employment expenses.', true);
      addQ(s52, 'Accounting and legal fees (CAD)', 'currency', false);
      addQ(s52, 'Advertising and promotion (CAD)', 'currency', false);
      addQ(s52, 'Meals and entertainment (CAD)', 'currency', false);
      addQ(s52, 'Lodging (CAD)', 'currency', false);
      addQ(s52, 'Parking (CAD)', 'currency', false);
      addQ(s52, 'Motor-vehicle expenses (CAD)', 'currency', false);
      addQ(s52, 'Supplies (CAD)', 'currency', false);
      addQ(s52, 'Travel expenses (CAD)', 'currency', false);
      addQ(s52, 'Other eligible expenses (CAD)', 'currency', false);

      // ══════════════════════════════════════════════════════════════
      // PHASE 9: DEDUCTIONS & CREDITS (Screens 53-67)
      // ══════════════════════════════════════════════════════════════

      // Screen 53: Deductions Dashboard
      const s53 = addSection('Deductions & Credits Dashboard', 'Claim deductions and credits. Only sections matching your tax profile are shown.');

      // Screen 54: Child-Care Expenses
      const s54 = addSection('Child-Care Expenses', 'Claim child-care expenses paid during the year.', true);
      addQ(s54, 'Child\'s name', 'text', true);
      addQ(s54, 'Child\'s date of birth', 'date', true);
      addQ(s54, 'Child-care provider name', 'text', true);
      addQ(s54, 'Provider SIN or business number', 'text', false);
      addQ(s54, 'Amount paid (CAD)', 'currency', true);
      addQ(s54, 'Type of care', 'select', false, { options: ['Daycare centre','In-home caregiver','Day camp','Overnight camp','Boarding school','Before/after school care','Other'] });
      addQ(s54, 'Period of care (months)', 'number', false);
      addQ(s54, 'Is the lower-income spouse claiming?', 'radio', false, { options: ['Yes', 'No', 'Exception applies'] });

      // Screen 55: Moving Expenses
      const s55 = addSection('Moving Expenses', 'Claim if the taxpayer moved at least 40 km closer to a new work location.', true);
      addQ(s55, 'Date of move', 'date', true);
      addQ(s55, 'Previous address', 'text', true);
      addQ(s55, 'New address', 'text', true);
      addQ(s55, 'Reason for move', 'select', false, { options: ['Employment', 'Business', 'Education'] });
      addQ(s55, 'Transportation and travel (CAD)', 'currency', false);
      addQ(s55, 'Meals during the move (CAD)', 'currency', false);
      addQ(s55, 'Temporary accommodation (CAD)', 'currency', false);
      addQ(s55, 'Lease cancellation costs (CAD)', 'currency', false);
      addQ(s55, 'Legal fees and real estate commission (CAD)', 'currency', false);
      addQ(s55, 'Utility disconnections and reconnections (CAD)', 'currency', false);
      addQ(s55, 'Income earned at the new location (CAD)', 'currency', false);
      addQ(s55, 'Reimbursements received (CAD)', 'currency', false);

      // Screen 56: Union and Professional Dues
      const s56 = addSection('Union and Professional Dues', 'Claim dues required to maintain professional status or union membership.', true);
      addQ(s56, 'Organization name', 'text', true);
      addQ(s56, 'Type of dues', 'select', false, { options: ['Union dues', 'Professional membership', 'Regulatory fees', 'Other'] });
      addQ(s56, 'Amount paid (CAD)', 'currency', true);
      addQ(s56, 'Amount reimbursed (CAD)', 'currency', false);
      addQ(s56, 'Is this already included on a T4 (Box 44)?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 57: Support Payments Paid
      const s57 = addSection('Support Payments Paid', 'Claim deductible support payments made.', true);
      addQ(s57, 'Recipient name', 'text', true);
      addQ(s57, 'Recipient SIN', 'text', false);
      addQ(s57, 'Court order or agreement date', 'date', true);
      addQ(s57, 'Total amount paid (CAD)', 'currency', true);
      addQ(s57, 'Deductible spousal support portion (CAD)', 'currency', false);
      addQ(s57, 'Non-deductible child support portion (CAD)', 'currency', false);

      // Screen 58: Carrying Charges
      const s58 = addSection('Carrying Charges and Interest Expenses', 'Claim investment-related expenses.', true);
      addQ(s58, 'Investment counsel fees (CAD)', 'currency', false);
      addQ(s58, 'Accounting fees for investment income (CAD)', 'currency', false);
      addQ(s58, 'Interest on money borrowed to earn investment income (CAD)', 'currency', false);
      addQ(s58, 'Other eligible carrying charges (CAD)', 'currency', false);

      // Screen 59: Medical Expenses
      const s59 = addSection('Medical Expenses', 'Claim eligible medical expenses for any 12-month period ending in 2025.', true);
      addQ(s59, 'Start date of 12-month claim period', 'date', false);
      addQ(s59, 'End date of 12-month claim period', 'date', false);
      addQ(s59, 'Patient name', 'text', true);
      addQ(s59, 'Relationship to taxpayer', 'select', false, { options: ['Self','Spouse','Child','Dependant','Other'] });
      addQ(s59, 'Prescription drugs (CAD)', 'currency', false);
      addQ(s59, 'Dental services (CAD)', 'currency', false);
      addQ(s59, 'Eyeglasses and contact lenses (CAD)', 'currency', false);
      addQ(s59, 'Medical devices and equipment (CAD)', 'currency', false);
      addQ(s59, 'Therapy and counselling (CAD)', 'currency', false);
      addQ(s59, 'Travel for medical services (CAD)', 'currency', false);
      addQ(s59, 'Private health-plan premiums (CAD)', 'currency', false);
      addQ(s59, 'Other eligible medical expenses (CAD)', 'currency', false);
      addQ(s59, 'Total insurance reimbursements received (CAD)', 'currency', false);

      // Screen 60: Charitable Donations
      const s60 = addSection('Charitable Donations', 'Claim donations to registered Canadian charities.', true);
      addQ(s60, 'Charity name', 'text', true);
      addQ(s60, 'Registration number', 'text', false);
      addQ(s60, 'Date of donation', 'date', false);
      addQ(s60, 'Amount donated (CAD)', 'currency', true);
      addQ(s60, 'Type of donation', 'select', false, { options: ['Cash','Publicly traded securities','Cultural property','Ecological gift','Other'] });
      addQ(s60, 'Prior-year donation carryforward (CAD)', 'currency', false);

      // Screen 61: Tuition & Education
      const s61 = addSection('Tuition & Education', 'Claim tuition fees from T2202 certificates.', true);
      addQ(s61, 'Educational institution name', 'text', true);
      addQ(s61, 'Student number', 'text', false);
      addQ(s61, 'Full-time months', 'number', false);
      addQ(s61, 'Part-time months', 'number', false);
      addQ(s61, 'Eligible tuition fees paid (CAD)', 'currency', true);
      addQ(s61, 'Province of institution', 'select', false, { options: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon','Outside Canada'] });
      addQ(s61, 'Unused federal tuition from prior years (CAD)', 'currency', false);
      addQ(s61, 'Amount to transfer to parent, grandparent or spouse (CAD)', 'currency', false);
      addQ(s61, 'Recipient of transfer', 'text', false);
      addQ(s61, 'Canada Training Credit limit available (CAD)', 'currency', false);

      // Screen 62: Student-Loan Interest
      const s62 = addSection('Student-Loan Interest', 'Claim interest paid on eligible student loans.', true);
      addQ(s62, 'Lender', 'text', false);
      addQ(s62, 'Type of loan', 'select', false, { options: ['Federal student loan','Provincial student loan','Both','Other'] });
      addQ(s62, 'Interest paid in 2025 (CAD)', 'currency', true);
      addQ(s62, 'Unused eligible interest from prior years (CAD)', 'currency', false);

      // Screen 63: Disability Tax Credit
      const s63 = addSection('Disability Tax Credit', 'Claim the disability amount with an approved T2201.', true);
      addQ(s63, 'Does the taxpayer have an approved T2201?', 'radio', true, { options: ['Yes', 'No', 'Pending'] });
      addQ(s63, 'Is the claim for the taxpayer or a dependant?', 'radio', false, { options: ['Taxpayer', 'Dependant'] });
      addQ(s63, 'Name of the person with the disability', 'text', false);
      addQ(s63, 'Does the person require attendant care?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s63, 'Was the person under 18 during the year?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s63, 'Disability support expenses (CAD)', 'currency', false);

      // Screen 64: Caregiver Amounts
      const s64 = addSection('Caregiver and Eligible Dependant Amounts', 'Claim amounts for supporting eligible dependants.', true);
      addQ(s64, 'Name of person supported', 'text', true);
      addQ(s64, 'Relationship', 'select', false, { options: ['Parent','Grandparent','Child','Brother','Sister','Other relative'] });
      addQ(s64, 'Net income of person supported (CAD)', 'currency', false);
      addQ(s64, 'Age of person supported', 'number', false);
      addQ(s64, 'Does the person have a physical or mental impairment?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s64, 'Number of months supported', 'number', false);

      // Screen 65: Home Buyers' Amount
      const s65 = addSection('Home Buyers\' Amount', 'Claim the home buyers\' amount for a qualifying purchase.', true);
      addQ(s65, 'Did the taxpayer purchase a qualifying home?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s65, 'Closing date of purchase', 'date', false);
      addQ(s65, 'Address of the home', 'text', false);
      addQ(s65, 'Ownership percentage', 'number', false);
      addQ(s65, 'Did the taxpayer occupy the home as a principal residence?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s65, 'Did the taxpayer own another home in the previous 4 years?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 66: Home Accessibility
      const s66 = addSection('Home Accessibility Expenses', 'Claim qualifying renovation expenses.', true);
      addQ(s66, 'Qualifying individual name', 'text', true);
      addQ(s66, 'Relationship to taxpayer', 'select', false, { options: ['Self','Spouse','Dependant','Other'] });
      addQ(s66, 'Description of renovation', 'text', false);
      addQ(s66, 'Date paid', 'date', false);
      addQ(s66, 'Amount paid (CAD)', 'currency', true);
      addQ(s66, 'Reimbursement received (CAD)', 'currency', false);

      // Screen 67: Pension Splitting
      const s67 = addSection('Pension Splitting', 'Split eligible pension income with your spouse.', true);
      addQ(s67, 'Does the taxpayer have eligible pension income?', 'radio', true, { options: ['Yes', 'No'] });
      addQ(s67, 'Amount of eligible pension income (CAD)', 'currency', false);
      addQ(s67, 'Proposed split amount (CAD)', 'currency', false);
      addQ(s67, 'Spouse\'s net income before split (CAD)', 'currency', false);
      addQ(s67, 'Is a joint election form T1032 available?', 'radio', false, { options: ['Yes', 'No'] });

      // ══════════════════════════════════════════════════════════════
      // PHASE 10: PROVINCIAL (Screens 68-71)
      // ══════════════════════════════════════════════════════════════

      // Screen 68: Provincial Interview
      const s68 = addSection('Provincial & Territorial Questions', 'Answer province-specific questions based on your December 31 residence.');
      addQ(s68, 'Rent paid for principal residence (CAD)', 'currency', false);
      addQ(s68, 'Property taxes paid (CAD)', 'currency', false);
      addQ(s68, 'Address of principal residence', 'text', false);
      addQ(s68, 'Number of months at this address', 'number', false);
      addQ(s68, 'Did the taxpayer live in a designated northern zone?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s68, 'Provincial political contributions (CAD)', 'currency', false);
      addQ(s68, 'Volunteer firefighter or search-and-rescue hours', 'number', false);

      // Screen 69: Ontario Questions
      const s69 = addSection('Ontario Tax Questions', 'Additional questions for Ontario residents.', true);
      addQ(s69, 'Did the taxpayer rent or own a principal residence in Ontario?', 'radio', false, { options: ['Rented', 'Owned', 'Neither'] });
      addQ(s69, 'Rent paid in Ontario (CAD)', 'currency', false);
      addQ(s69, 'Ontario property tax paid (CAD)', 'currency', false);
      addQ(s69, 'Number of months lived at the Ontario address', 'number', false);
      addQ(s69, 'Is the taxpayer applying for the Ontario Trillium Benefit?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s69, 'Payment preference for Ontario Trillium Benefit', 'radio', false, { options: ['Monthly payments', 'Single annual payment'] });
      addQ(s69, 'Ontario political contribution (CAD)', 'currency', false);

      // Screen 70: Carbon Rebate
      const s70 = addSection('Carbon Rebate / Rural Supplement', 'Determine eligibility for the carbon rebate rural supplement.', true);
      addQ(s70, 'Did the taxpayer reside outside a census metropolitan area?', 'radio', false, { options: ['Yes', 'No', 'Not sure'] });
      addQ(s70, 'Number of months at the principal residence', 'number', false);

      // Screen 71: Quebec
      const s71 = addSection('Quebec Resident — TP-1 Coordination', 'Quebec residents file both federal and provincial returns.', true);
      addQ(s71, 'Has the taxpayer filed or will file a Quebec TP-1?', 'radio', false, { options: ['Yes', 'No', 'Not sure'] });
      addQ(s71, 'QPP contributions (CAD)', 'currency', false);
      addQ(s71, 'QPIP premiums (CAD)', 'currency', false);
      addQ(s71, 'Quebec prescription drug insurance status', 'radio', false, { options: ['Private plan', 'Public plan (RAMQ)', 'No coverage'] });
      addQ(s71, 'Solidarity tax credit — applying?', 'radio', false, { options: ['Yes', 'No'] });

      // ══════════════════════════════════════════════════════════════
      // PHASE 11: REVIEW & FILE (Screens 72-77)
      // ══════════════════════════════════════════════════════════════

      // Screen 72: Completeness Review
      const s72 = addSection('Completeness Review', 'Check that all required information has been entered.');
      addQ(s72, 'Have all selected tax topics been completed?', 'checkbox', true);
      addQ(s72, 'Have all required personal information fields been entered?', 'checkbox', true);
      addQ(s72, 'Have all income slips been entered?', 'checkbox', true);
      addQ(s72, 'Have foreign income amounts been converted to CAD?', 'checkbox', false);
      addQ(s72, 'Have RRSP contribution limits been entered?', 'checkbox', false);

      // Screen 73: Error Review
      const s73 = addSection('Error and Warning Review', 'Review and correct any issues before filing.');
      addQ(s73, 'I have reviewed and corrected all errors', 'checkbox', true);
      addQ(s73, 'I have reviewed all warnings', 'checkbox', false);
      addQ(s73, 'Notes for outstanding warnings', 'long_text', false);

      // Screen 74: Tax Summary
      const s74 = addSection('Tax Summary Dashboard', 'Review the calculated tax results.');
      addQ(s74, 'Total income (line 15000)', 'currency', false);
      addQ(s74, 'Net income (line 23600)', 'currency', false);
      addQ(s74, 'Taxable income (line 26000)', 'currency', false);
      addQ(s74, 'Total federal tax', 'currency', false);
      addQ(s74, 'Total provincial tax', 'currency', false);
      addQ(s74, 'Total tax payable', 'currency', false);
      addQ(s74, 'Total credits and deductions', 'currency', false);
      addQ(s74, 'Balance owing or refund amount', 'currency', false);

      // Screen 75: Optimization
      const s75 = addSection('Optimization Suggestions', 'Review suggestions that may reduce your tax.');
      addQ(s75, 'Review suggestions and confirm', 'checkbox', false);

      // Screen 76: E-Filing Consent
      const s76 = addSection('E-Filing Consent & Authorization', 'Authorize electronic filing of this return with CRA.');
      addQ(s76, 'I certify the information in this return is correct and complete', 'checkbox', true);
      addQ(s76, 'I authorize the electronic filing of this return with CRA', 'checkbox', true);
      addQ(s76, 'Taxpayer\'s full legal name (for authorization)', 'text', true);
      addQ(s76, 'Date of authorization', 'date', true);
      addQ(s76, 'Is a third-party preparer filing this return?', 'radio', false, { options: ['Yes', 'No'] });
      addQ(s76, 'Preparer\'s name (if applicable)', 'text', false);

      // Screen 77: Filing Confirmation
      const s77 = addSection('Filing Confirmation', 'Your return has been prepared. Review the confirmation details.');
      addQ(s77, 'Filing method preference', 'radio', false, { options: ['Paper filing (print and mail)', 'EFILE through a tax professional'] });
      addQ(s77, 'CRA direct deposit — Is the taxpayer registered?', 'radio', false, { options: ['Yes', 'No', 'Not sure'] });
      addQ(s77, 'Would the taxpayer like to set up CRA direct deposit?', 'radio', false, { options: ['Yes', 'No'] });

      // Screen 78: Review All Your Answers
      const s78 = addSection('Review All Your Answers', 'Review everything you have entered across all sections. You can click any section to go back and edit. Once satisfied, proceed to the final submission step.');
      addQ(s78, 'I have reviewed all my answers and they are accurate', 'checkbox', true);
      addQ(s78, 'I would like to download a copy of my answers', 'checkbox', false);

      // Screen 79: Disclaimer & Submission
      const s79 = addSection('Disclaimer & Submission', 'Please read and acknowledge the following before submitting your tax return information.');
      addQ(s79, 'I understand this return is prepared based solely on the information I have provided', 'checkbox', true, { helpText: 'Taxccount relies entirely on the data you enter. Verify all amounts against your original documents.' });
      addQ(s79, 'I confirm all information is complete and accurate to the best of my knowledge', 'checkbox', true, { helpText: 'You are responsible for the accuracy of the information provided.' });
      addQ(s79, 'I understand that Taxccount does not guarantee the accuracy of tax calculations or CRA acceptance of this return', 'checkbox', true, { helpText: 'Tax calculations are estimates. CRA may reassess your return.' });
      addQ(s79, 'I acknowledge I am responsible for retaining all supporting documents for the period required by CRA', 'checkbox', true, { helpText: 'CRA may request documents at any time during the retention period.' });
      addQ(s79, 'I consent to the electronic filing of this return based on the information I have entered', 'checkbox', true);
      addQ(s79, 'Taxpayer signature (type full legal name)', 'text', true, { placeholder: 'Enter your full legal name as your electronic signature' });
      addQ(s79, 'Date of submission', 'date', true);

      // ═══════════════════════════════════════════════════════════════
      // INSERT ALL SECTIONS AND QUESTIONS INTO DATABASE
      // ═══════════════════════════════════════════════════════════════

      console.log(`Inserting ${sections.length} sections...`);
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        await sql`INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, is_conditional, created_at) VALUES (${s.id}, ${orgId}, ${versionId}, ${s.title}, ${s.description}, ${i + 1}, ${s.isConditional}, ${now})`;
      }

      console.log(`Inserting ${questions.length} questions...`);
      for (let i = 0; i < questions.length; i++) {
        const qItem = questions[i];
        await sql`INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, options, validation_rules, placeholder, help_text, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at) VALUES (${uuidv4()}, ${orgId}, ${versionId}, ${qItem.secId}, ${qItem.text}, ${qItem.type}, ${qItem.description}, ${qItem.required}, ${qItem.options}, ${null}, ${qItem.placeholder}, ${qItem.helpText}, ${i + 1}, 0, ${null}, ${now}, ${now})`;
      }

      // Update form description
      await sql`UPDATE smart_forms SET description = 'TurboTax-style Canadian T1 Individual Income Tax guided interview with 79 screens and 550+ detailed questions. OCR upload, review & download, and disclaimer included.' WHERE id = ${formId}`;

      console.log(`\n✅ T1 form seeded successfully!`);
      console.log(`   Sections: ${sections.length}`);
      console.log(`   Questions: ${questions.length}`);
    }

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await sql.end();
  }
}

seed().catch(console.error);
