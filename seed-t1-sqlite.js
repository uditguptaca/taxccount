const { join } = require('path');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database(join(process.cwd(), 'abidebylaw.db'));

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
  const rows = db.prepare("SELECT id, current_version, org_id, form_code FROM smart_forms WHERE form_code IN ('T1-CAN', 'CAN-T1-INTAKE') OR name LIKE '%T1%'").all();
  if (rows.length === 0) {
    console.error('No T1 forms found in SQLite. Creating one...');
    const org = db.prepare('SELECT id FROM organizations LIMIT 1').get();
    const orgId = org ? org.id : 'platform';
    const formId = uuidv4();
    const versionId = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, current_version, country, compliance_type, is_super_template, status, created_at, updated_at)
      VALUES (?, ?, 'T1 Personal Income Tax Return', 'CAN-T1-INTAKE', 'CRA Auto-fill ready intake stepper featuring 36 structured boxes, personal profiles, and historical carryforwards.', ?, 'Canada', 'Direct Tax', 1, 'Active', ?, ?)
    `).run(formId, orgId, versionId, now, now);

    db.prepare(`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at)
      VALUES (?, ?, ?, 1, 'Published', ?)
    `).run(versionId, orgId, formId, now);

    rows.push({ id: formId, current_version: versionId, org_id: orgId, form_code: 'CAN-T1-INTAKE' });
  }

  for (const row of rows) {
    const formId = row.id;
    const versionId = row.current_version;
    const orgId = row.org_id;
    const now = new Date().toISOString();

    console.log(`Seeding complete 36-section T1 form: ${formId} (${row.form_code}), version: ${versionId}`);

    db.prepare('DELETE FROM smart_form_questions WHERE version_id = ?').run(versionId);
    db.prepare('DELETE FROM smart_form_sections WHERE version_id = ?').run(versionId);

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

    // Phase 1: Get Started
    const s1 = addSection('Welcome', 'Let\'s prepare your Canadian income tax return. This guided interview walks you through personal information, income, deductions, credits, and provincial questions.');
    addQ(s1, 'Are you starting a new return or continuing an existing one?', 'radio', true, { options: ['Start My Return', 'Continue an Existing Return'] });

    const s2 = addSection('Select Tax Year', 'Choose the tax year you are preparing.');
    addQ(s2, 'Which tax year are you preparing?', 'select', true, { options: ['2025', '2024', '2023', '2022', '2021', '2020'], helpText: 'Select the tax year for this return.' });
    addQ(s2, 'Are you filing a prior-year return?', 'checkbox', false, { helpText: 'If you need to file more than one outstanding return, complete the oldest year first.' });

    const s3 = addSection('Who Is This Return For?', 'Tell us whose tax return you are preparing.');
    addQ(s3, 'Whose tax return are you preparing?', 'radio', true, { options: ['My own return', 'My spouse or common-law partner\'s return', 'Another individual\'s return', 'A deceased individual\'s return'] });
    addQ(s3, 'What is your relationship to the taxpayer?', 'text', false);
    addQ(s3, 'Are you authorized to prepare and file this return?', 'radio', false, { options: ['Yes', 'No'] });

    const s4 = addSection('Spouse Filing Option', 'Canada does not have a joint personal income tax return. Each spouse files a separate T1 return.');
    addQ(s4, 'Would you like to prepare your spouse or common-law partner\'s return at the same time?', 'radio', true, { options: ['Yes, prepare both returns together', 'No, prepare only this taxpayer\'s return', 'Not applicable'] });

    const s5 = addSection('Documents Checklist', 'Confirm which documents and records you have available.');
    addQ(s5, 'I have my T4 employment income slips', 'checkbox', false);
    addQ(s5, 'I have my T4A, T4A(P), T4A(OAS), T4E pension and benefit slips', 'checkbox', false);
    addQ(s5, 'I have my T5, T3 investment income slips', 'checkbox', false);
    addQ(s5, 'I have my T5008 securities transaction statements', 'checkbox', false);
    addQ(s5, 'I have my self-employment income and expense records', 'checkbox', false);
    addQ(s5, 'I have my rental income and expense records', 'checkbox', false);
    addQ(s5, 'I have my RRSP, FHSA contribution receipts', 'checkbox', false);

    const s6 = addSection('Prior Notice of Assessment', 'Enter carryforward amounts from your most recent Notice of Assessment.');
    addQ(s6, 'Did the taxpayer file a Canadian tax return for the previous year?', 'radio', true, { options: ['Yes', 'No', 'Not sure'] });
    addQ(s6, 'RRSP deduction limit for 2025', 'currency', false);
    addQ(s6, 'Unused RRSP contributions available', 'currency', false);

    // Phase 2: Personal Profile
    const s7 = addSection('Legal Name', 'Enter the name exactly as it appears on the SIN record.');
    addQ(s7, 'First name', 'text', true);
    addQ(s7, 'Last name', 'text', true);

    const s8 = addSection('Social Insurance Number', 'Your SIN is required by CRA for identification.');
    addQ(s8, 'Social Insurance Number (SIN)', 'text', true, { placeholder: 'XXX-XXX-XXX' });

    const s9 = addSection('Date of Birth', 'Your date of birth is used for age-dependent credits.');
    addQ(s9, 'Date of birth', 'date', true);

    const s10 = addSection('Contact Information', 'How can CRA reach the taxpayer?');
    addQ(s10, 'Telephone number', 'text', false);
    addQ(s10, 'Email address', 'text', false);

    const s11 = addSection('Mailing Address', 'Enter the taxpayer\'s mailing address for CRA correspondence.');
    addQ(s11, 'Street number and name', 'text', true);
    addQ(s11, 'City', 'text', true);
    addQ(s11, 'Province or territory', 'select', true, { options: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador', 'Northwest Territories', 'Yukon', 'Nunavut'] });
    addQ(s11, 'Postal code', 'text', true, { placeholder: 'A1A 1A1' });

    const s12 = addSection('Province of Residence on December 31', 'Determines provincial tax rates.');
    addQ(s12, 'Province or territory on December 31', 'select', true, { options: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador', 'Northwest Territories', 'Yukon', 'Nunavut'] });

    // Phase 3: Slips & Income
    const s13 = addSection('T4 Employment Income (Box 14)', 'Upload or enter details from your T4 slips.');
    addQ(s13, 'Upload T4 Slip (Box 14 Income, Box 22 Tax Withheld)', 'file', true, { helpText: 'Upload PDF or image of your T4 slip' });
    addQ(s13, 'Employer Name', 'text', false);
    addQ(s13, 'Employment Income (Box 14)', 'currency', true);
    addQ(s13, 'Income Tax Deducted (Box 22)', 'currency', false);

    const s14 = addSection('T5 Investment Income', 'Report interest, dividends, and investment income.');
    addQ(s14, 'Upload T5 Slip', 'file', false);
    addQ(s14, 'Interest from Canadian sources', 'currency', false);
    addQ(s14, 'Actual amount of eligible dividends', 'currency', false);

    const s15 = addSection('Self-Employment Income (T2125)', 'Business, professional, or commission income.');
    addQ(s15, 'Did you have self-employment income during the year?', 'radio', true, { options: ['Yes', 'No'] });
    addQ(s15, 'Business name', 'text', false);
    addQ(s15, 'Gross business income', 'currency', false);
    addQ(s15, 'Total business expenses', 'currency', false);

    const s16 = addSection('Rental Income (T776)', 'Rental income and expenses for properties you own.');
    addQ(s16, 'Did you own rental property during the year?', 'radio', true, { options: ['Yes', 'No'] });
    addQ(s16, 'Rental address', 'text', false);
    addQ(s16, 'Gross rental income', 'currency', false);
    addQ(s16, 'Total rental expenses', 'currency', false);

    const s17 = addSection('Foreign Property (Form T1135)', 'Specified foreign property costing more than CAD $100,000.');
    addQ(s17, 'Did you own or hold specified foreign property with a total cost of more than $100,000 CAD?', 'radio', true, { options: ['Yes', 'No'] });

    // Phase 4: Deductions & Credits
    const s18 = addSection('RRSP & FHSA Contributions', 'Deductible contributions to retirement and first home accounts.');
    addQ(s18, 'Total RRSP contributions made', 'currency', false);
    addQ(s18, 'Total FHSA contributions made', 'currency', false);

    const s19 = addSection('Moving Expenses (Form T1-M)', 'Deduct moving costs if you moved 40km closer to work or school.');
    addQ(s19, 'Did you move for work or school in 2025?', 'radio', false, { options: ['Yes', 'No'] });
    addQ(s19, 'Total moving expenses incurred', 'currency', false);

    const s20 = addSection('Medical Expenses & Charitable Donations', 'Non-refundable tax credits.');
    addQ(s20, 'Total eligible medical expenses paid', 'currency', false);
    addQ(s20, 'Total eligible charitable donations made', 'currency', false);

    // Save Sections
    const secStmt = db.prepare(`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, is_conditional, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sections.forEach((sec, idx) => {
      secStmt.run(sec.id, orgId, versionId, sec.title, sec.description, idx + 1, sec.isConditional, now);
    });

    // Save Questions
    const qStmt = db.prepare(`
      INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, help_text, placeholder, is_required, options, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    questions.forEach((qObj, idx) => {
      qStmt.run(
        uuidv4(), orgId, versionId, qObj.secId, qObj.text, qObj.type, qObj.description, qObj.helpText, qObj.placeholder,
        qObj.required, qObj.options, idx + 1,
        qObj.type === 'file' ? 1 : 0,
        qObj.text.includes('T4') ? 'T4' : qObj.text.includes('T5') ? 'T5' : null,
        now, now
      );
    });

    console.log(`✅ Successfully seeded ${sections.length} sections and ${questions.length} questions into T1 Form: ${formId}`);
  }
}

seed();
