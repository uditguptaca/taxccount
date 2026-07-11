import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const SEED_TEMPLATES = [
  // CANADA - Accounting firm
  {
    name: 'T1 Personal Income Tax Return',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: 'CRA Auto-fill ready intake stepper featuring 36 structured boxes, personal profiles, and historical carryforwards.',
    form_code: 'CAN-T1-INTAKE'
  },
  {
    name: 'T2 Corporate Income Tax Return',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: 'Detailed corporate tax reconciliation containing Schedules 1, 8 (CCA), and provincial tax allocations.',
    form_code: 'CAN-T2-CORP'
  },
  {
    name: 'GST/HST Return (GST34)',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Indirect tax',
    description: 'GST34 net tax payable sheet with Line 101 sales, Line 105 GST collected, and Line 108 Input Tax Credits (ITCs).',
    form_code: 'CAN-GST-34'
  },
  {
    name: 'T4/T4A Payroll Summary Return',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Payroll',
    description: 'Employer payroll information return with CPP, EI, and tax deduction allocations.',
    form_code: 'CAN-T4-PAYROLL'
  },
  {
    name: 'CRA Annual Corporate Information Return',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Annual Return',
    description: 'Annual registry validation containing directors, share structures, and compliance filings.',
    form_code: 'CAN-CORP-ANNUAL'
  },
  // USA - Accounting firm
  {
    name: 'Form 1040 U.S. Individual Income Tax',
    country: 'USA',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: 'U.S. federal individual tax organizer supporting W-2 income, itemized deductions, and Schedules A-D.',
    form_code: 'USA-1040-INDIV'
  },
  {
    name: 'State Sales & Use Tax Return',
    country: 'USA',
    service_type: 'Accounting firm',
    service_line: 'Indirect tax',
    description: 'State-level local surcharges, gross exempt transactions, and sales tax distributions.',
    form_code: 'USA-SALES-TAX'
  },
  {
    name: 'Form 940/941 Employer Payroll Return',
    country: 'USA',
    service_type: 'Accounting firm',
    service_line: 'Payroll',
    description: 'Federal quarterly returns matching employer FICA holdings, withholdings, and UI tax calculations.',
    form_code: 'USA-940-941'
  },
  {
    name: 'Delaware Corporate Annual Report',
    country: 'USA',
    service_type: 'Accounting firm',
    service_line: 'Annual Return',
    description: 'Annual information filing calculating Delaware franchise tax liability based on par-value allocation.',
    form_code: 'USA-DE-ANNUAL'
  },
  // INDIA - Accounting firm
  {
    name: 'ITR-1/ITR-2 Individual Income Tax Return',
    country: 'India',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: 'India individual income tax intake supporting salary, house property, other sources, and deductions.',
    form_code: 'IND-ITR-1'
  },
  {
    name: 'GST GSTR-3B Tax Filing',
    country: 'India',
    service_type: 'Accounting firm',
    service_line: 'Indirect tax',
    description: 'Monthly self-declaration return for outward supplies, input tax credits, and payment of GST.',
    form_code: 'IND-GST-3B'
  },
  {
    name: 'PF & ESIC Employee Deductions Return',
    country: 'India',
    service_type: 'Accounting firm',
    service_line: 'Payroll',
    description: 'Provident Fund and Employee State Insurance monthly contribution filing and challan reconciliation.',
    form_code: 'IND-PF-ESIC'
  },
  {
    name: 'MCA Form AOC-4 Financial Statement Return',
    country: 'India',
    service_type: 'Accounting firm',
    service_line: 'Annual Return',
    description: 'MCA e-form filing for balance sheets, profit & loss accounts, and directors disclosures.',
    form_code: 'IND-MCA-AOC4'
  },
  // INVESTMENT FIRM templates
  {
    name: 'Investment Portfolio Disclosure (Form T1135)',
    country: 'Canada',
    service_type: 'Investment firm',
    service_line: 'Direct tax',
    description: 'Canadian Foreign Income Verification Statement detailing specified foreign property holdings exceed $100k.',
    form_code: 'CAN-T1135-PORTFOLIO'
  },
  {
    name: 'SEC Form 13F Holdings Report',
    country: 'USA',
    service_type: 'Investment firm',
    service_line: 'Direct tax',
    description: 'U.S. SEC quarterly report filed by institutional investment managers managing over $100M assets.',
    form_code: 'USA-SEC-13F'
  },
  {
    name: 'SEBI Investment Advisor Annual Declaration',
    country: 'India',
    service_type: 'Investment firm',
    service_line: 'Direct tax',
    description: 'Annual compliance certificate reporting assets under advice, client counts, and SEBI fee payouts.',
    form_code: 'IND-SEBI-ADVISOR'
  },
  // ISO templates
  {
    name: 'ISO 27001 Security Self-Assessment',
    country: 'Canada',
    service_type: 'ISO',
    service_line: 'Direct tax',
    description: 'Information security management self-assessment questionnaire auditing controls A.5 to A.18.',
    form_code: 'CAN-ISO-27001'
  },
  {
    name: 'SOC 2 Type II Readiness Audit Intake',
    country: 'USA',
    service_type: 'ISO',
    service_line: 'Direct tax',
    description: 'System and Organization Controls readiness intake mapping security, availability, and confidentiality.',
    form_code: 'USA-SOC2-READINESS'
  },
  {
    name: 'ISO 9001 Quality Management Assessment',
    country: 'India',
    service_type: 'ISO',
    service_line: 'Direct tax',
    description: 'Quality management system gap analysis auditing leadership, planning, support, and operation controls.',
    form_code: 'IND-ISO-9001'
  }
];

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    // Get all Super Admin templates
    let templates = await db.prepare('SELECT * FROM smart_forms WHERE is_super_template = 1 ORDER BY created_at DESC').all();

    if (templates.length === 0) {
      // Seed templates on the fly
      const now = new Date().toISOString();
      for (const t of SEED_TEMPLATES) {
        const formId = uuidv4();
        const versionId = uuidv4();
        await db.prepare(`
          INSERT INTO smart_forms (id, org_id, name, form_code, description, country, compliance_type, current_version, status, is_super_template, service_type, service_line, created_at, updated_at)
          VALUES (?, 'platform', ?, ?, ?, ?, 'Tax', ?, 'Active', 1, ?, ?, ?, ?)
        `).run(formId, t.name, t.form_code, t.description, t.country, versionId, t.service_type, t.service_line, now, now);

        await db.prepare(`
          INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at, created_by)
          VALUES (?, 'platform', ?, 1, 'Published', ?, ?)
        `).run(versionId, formId, now, session.userId);

        // Add a default section
        const sectionId = uuidv4();
        await db.prepare(`
          INSERT INTO smart_form_sections (id, org_id, version_id, title, sort_order, created_at)
          VALUES (?, 'platform', ?, 'Information Intake', 1, ?)
        `).run(sectionId, versionId, now);
      }

      // Query again
      templates = await db.prepare('SELECT * FROM smart_forms WHERE is_super_template = 1 ORDER BY created_at DESC').all();
    }

    return NextResponse.json(templates);
  } catch (err: any) {
    console.error('GET Super Templates Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;
    const db = getDb();

    const body = await req.json();
    const { templateId } = body;

    if (!templateId) return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });

    // Retrieve the super template
    const template = await db.prepare('SELECT * FROM smart_forms WHERE id = ? AND is_super_template = 1').get(templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    // Check if the organization already has this template activated
    const existing = await db.prepare('SELECT * FROM smart_forms WHERE org_id = ? AND parent_template_id = ? AND status != \'Archived\'').get(orgId, templateId);
    if (existing) {
      return NextResponse.json({ success: true, alreadyActivated: true, id: existing.id });
    }

    const formId = uuidv4();
    const versionId = uuidv4();
    const now = new Date().toISOString();

    // 1. Clone the smart_forms metadata
    await db.prepare(`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, country, compliance_type, category_id, tags, current_version, status, is_super_template, service_type, service_line, parent_template_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 0, ?, ?, ?, ?, ?)
    `).run(
      formId, orgId, template.name, template.form_code, template.description,
      template.country, template.compliance_type, template.category_id || null, template.tags || null,
      versionId, template.service_type, template.service_line, templateId, now, now
    );

    // 2. Clone the active version
    await db.prepare(`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at, created_by)
      VALUES (?, ?, ?, 1, 'Published', ?, ?)
    `).run(versionId, orgId, formId, now, userId);

    // 3. Clone sections from the template's active version
    const sections = await db.prepare('SELECT * FROM smart_form_sections WHERE version_id = ?').all(template.current_version);
    const sectionMap = new Map<string, string>(); // maps old section ID to new section ID

    for (const s of sections) {
      const newSecId = uuidv4();
      sectionMap.set(s.id, newSecId);
      await db.prepare(`
        INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, is_conditional, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newSecId, orgId, versionId, s.title, s.description || null, s.sort_order, s.is_conditional || 0, now);
    }

    // 4. Clone questions from the template's active version
    const questions = await db.prepare('SELECT * FROM smart_form_questions WHERE version_id = ?').all(template.current_version);
    for (const q of questions) {
      const newQId = uuidv4();
      const newSecId = q.section_id ? sectionMap.get(q.section_id) : null;
      await db.prepare(`
        INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, options, validation_rules, placeholder, help_text, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newQId, orgId, versionId, newSecId || null, q.question_text, q.question_type, q.description || null,
        q.is_required || 0, q.options || null, q.validation_rules || null, q.placeholder || null, q.help_text || null,
        q.sort_order, q.is_ai_assisted || 0, q.ocr_mapping_key || null, now, now
      );
    }

    // 5. If it is a T1 Intake form, seed our specific T1 questions so it works out-of-the-box!
    if (template.form_code === 'CAN-T1-INTAKE') {
      const t1Questions = [
        { text: 'Tax year being filed', type: 'select', opts: ['2024', '2023', '2022'], req: 1, ph: 'Select year...' },
        { text: 'Are you importing data from a prior-year return?', type: 'checkbox', req: 0, opts: null, ph: null },
        { text: 'Is this your first time filing a Canadian tax return?', type: 'checkbox', req: 0, opts: null, ph: null },
        { text: 'First Name', type: 'text', req: 1, opts: null, ph: 'First Name' },
        { text: 'Last Name', type: 'text', req: 1, opts: null, ph: 'Last Name' },
        { text: 'Social Insurance Number (SIN)', type: 'text', req: 1, opts: null, ph: '555-xxx-xxx' },
        { text: 'Date of Birth', type: 'date', req: 1, opts: null, ph: null },
        { text: 'Marital Status', type: 'select', opts: ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'], req: 1, ph: 'Select marital status...' },
        { text: 'Do you earn employment income from a T4 slip?', type: 'checkbox', req: 0, opts: null, ph: null },
        { text: 'Did you earn investment income?', type: 'checkbox', req: 0, opts: null, ph: null },
        { text: 'Did you make contributions to an RRSP?', type: 'checkbox', req: 0, opts: null, ph: null },
        { text: 'Employment Income (Box 14)', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'Income Tax Deducted (Box 22)', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'CPP Contributions (Box 16)', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'EI Premiums (Box 18)', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'Actual amount of eligible dividends', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'Interest from Canadian sources', type: 'currency', req: 0, opts: null, ph: '0.00' },
        { text: 'Total RRSP contributions made', type: 'currency', req: 0, opts: null, ph: '0.00' }
      ];

      // Add a section if not present or use the first section
      const activeSec = await db.prepare('SELECT id FROM smart_form_sections WHERE version_id = ?').get(versionId);
      const targetSecId = activeSec ? activeSec.id : uuidv4();
      if (!activeSec) {
        await db.prepare(`INSERT INTO smart_form_sections (id, org_id, version_id, title, sort_order, created_at) VALUES (?, ?, ?, 'Intake Questions', 1, ?)`).run(targetSecId, orgId, versionId, now);
      }

      let order = 10;
      for (const q of t1Questions) {
        const qId = uuidv4();
        await db.prepare(`
          INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, options, validation_rules, placeholder, help_text, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, null, ?, ?, null, ?, null, ?, 1, ?, ?, ?)
        `).run(
          qId, orgId, versionId, targetSecId, q.text, q.type, q.req,
          q.opts ? JSON.stringify(q.opts) : null, q.ph || null, order++,
          q.text.toLowerCase().includes('box 14') ? 'T4-Box14' : q.text.toLowerCase().includes('box 22') ? 'T4-Box22' : q.text.toLowerCase().includes('dividends') ? 'T5-EligibleDividends' : null,
          now, now
        );
      }
    }

    return NextResponse.json({ success: true, id: formId });
  } catch (err: any) {
    console.error('POST Activate Template Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
