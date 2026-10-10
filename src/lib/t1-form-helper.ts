import { v4 as uuidv4 } from 'uuid';

export const T1_INTAKE_SECTIONS = [
  {
    title: 'Welcome & Tax Year',
    desc: 'Select tax year and taxpayer relationship',
    qs: [
      { text: 'Which tax year are you preparing?', type: 'select', opts: ['2025', '2024', '2023', '2022'], req: 1 },
      { text: 'Whose tax return are you preparing?', type: 'radio', opts: ['My own return', 'My spouse or partner\'s return', 'Another individual\'s return'], req: 1 },
      { text: 'Would you like to prepare your spouse\'s return together?', type: 'radio', opts: ['Yes, prepare both together', 'No, prepare only this return', 'Not applicable'], req: 0 }
    ]
  },
  {
    title: 'Personal Profile & Identification',
    desc: 'Legal name, SIN, DOB, and contact info',
    qs: [
      { text: 'First Name', type: 'text', req: 1 },
      { text: 'Middle Name', type: 'text', req: 0 },
      { text: 'Last Name', type: 'text', req: 1 },
      { text: 'Social Insurance Number (SIN)', type: 'text', req: 1, ph: 'XXX-XXX-XXX' },
      { text: 'Date of Birth', type: 'date', req: 1 },
      { text: 'Marital Status on Dec 31', type: 'select', opts: ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'], req: 1 }
    ]
  },
  {
    title: 'Mailing Address & Residency',
    desc: 'Address and province of residence',
    qs: [
      { text: 'Street number and name', type: 'text', req: 1 },
      { text: 'City', type: 'text', req: 1 },
      { text: 'Province or territory on Dec 31', type: 'select', opts: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador', 'Northwest Territories', 'Yukon', 'Nunavut'], req: 1 },
      { text: 'Postal code', type: 'text', req: 1, ph: 'A1A 1A1' },
      { text: 'Telephone Number', type: 'text', req: 0 }
    ]
  },
  {
    title: 'T4 Employment Income Slips',
    desc: 'Upload and enter your T4 slips',
    qs: [
      { text: 'Upload T4 Slip (Box 14 Income, Box 22 Tax Withheld)', type: 'file', req: 1, help: 'Upload PDF or photo of your T4 slip' },
      { text: 'Employer Name', type: 'text', req: 0 },
      { text: 'Employment Income (Box 14)', type: 'currency', req: 1 },
      { text: 'Income Tax Deducted (Box 22)', type: 'currency', req: 0 },
      { text: 'CPP Contributions (Box 16)', type: 'currency', req: 0 },
      { text: 'EI Premiums (Box 18)', type: 'currency', req: 0 }
    ]
  },
  {
    title: 'T5 Investment Income Slips',
    desc: 'Bank interest, dividends, and investment income',
    qs: [
      { text: 'Upload T5 Slip', type: 'file', req: 0 },
      { text: 'Interest from Canadian sources', type: 'currency', req: 0 },
      { text: 'Actual amount of eligible dividends', type: 'currency', req: 0 }
    ]
  },
  {
    title: 'Self-Employment & Rental Income',
    desc: 'Business and rental property income',
    qs: [
      { text: 'Did you earn self-employment income (T2125)?', type: 'radio', opts: ['Yes', 'No'], req: 1 },
      { text: 'Gross business income', type: 'currency', req: 0 },
      { text: 'Total business expenses', type: 'currency', req: 0 },
      { text: 'Did you own rental property (T776)?', type: 'radio', opts: ['Yes', 'No'], req: 1 },
      { text: 'Gross rental income', type: 'currency', req: 0 },
      { text: 'Total rental expenses', type: 'currency', req: 0 }
    ]
  },
  {
    title: 'Deductions, Foreign Property & Credits',
    desc: 'RRSP, FHSA, Form T1135, medical, donations, and moving expenses',
    qs: [
      { text: 'Did you hold specified foreign property with cost > $100,000 CAD (Form T1135)?', type: 'radio', opts: ['Yes', 'No'], req: 1 },
      { text: 'Total RRSP contributions made', type: 'currency', req: 0 },
      { text: 'Total FHSA contributions made', type: 'currency', req: 0 },
      { text: 'Total eligible medical expenses paid', type: 'currency', req: 0 },
      { text: 'Total eligible charitable donations made', type: 'currency', req: 0 },
      { text: 'Did you move for work or school in 2025?', type: 'radio', opts: ['Yes', 'No'], req: 0 }
    ]
  }
];

export async function ensureT1Questions(db: any, form: any, versionId: string, orgId: string) {
  if (!form || !versionId) return;

  const isT1 = form.form_code === 'CAN-T1-INTAKE' || form.form_code === 'T1-CAN' || (form.name && form.name.toLowerCase().includes('t1'));
  if (!isT1) return;

  const questions = await db.prepare('SELECT COUNT(*) as count FROM smart_form_questions WHERE version_id = ?').get(versionId);
  const qCount = questions?.count ? parseInt(questions.count, 10) : 0;

  if (qCount > 1) return; // Already populated

  // Clear existing placeholders
  await db.prepare('DELETE FROM smart_form_questions WHERE version_id = ?').run(versionId);
  await db.prepare('DELETE FROM smart_form_sections WHERE version_id = ?').run(versionId);

  const now = new Date().toISOString();
  let sIdx = 1;

  for (const s of T1_INTAKE_SECTIONS) {
    const secId = uuidv4();
    await db.prepare(`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(secId, orgId || 'platform', versionId, s.title, s.desc, sIdx++, now);

    let qIdx = 1;
    for (const q of s.qs) {
      const qId = uuidv4();
      await db.prepare(`
        INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, help_text, placeholder, is_required, options, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        qId, orgId || 'platform', versionId, secId, q.text, q.type, (q as any).help || null, (q as any).ph || null, q.req ? 1 : 0,
        (q as any).opts ? JSON.stringify((q as any).opts) : null, qIdx++,
        q.type === 'file' ? 1 : 0, q.text.includes('T4') ? 'T4' : q.text.includes('T5') ? 'T5' : null,
        now, now
      );
    }
  }

  console.log(`[T1 Helper] Populated ${T1_INTAKE_SECTIONS.length} sections for version ${versionId}`);
}
