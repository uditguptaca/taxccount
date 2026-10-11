import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Seed list of professional templates designed by engineers
const SEED_TEMPLATES = [
  // CANADA - Accounting firm
  {
    name: 'T1 Personal Income Tax Return',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: 'Detailed Canadian T1 intake in English and French: adapts to each client, covers every income, deduction and credit area, all 13 provinces and territories and Québec, collects slips box by box with their documents, and gives the preparer an organized file with open items. It collects information only and never files a return.',
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

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || session.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    
    // Check if we already have templates
    let templates = await db.prepare('SELECT * FROM smart_forms WHERE is_super_template = 1 ORDER BY created_at DESC').all();

    if (templates.length === 0) {
      // Seed templates
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

        if (t.form_code === 'CAN-T1-INTAKE') {
          const t1Secs = [
            { title: 'Welcome & Tax Year', desc: 'Select tax year and taxpayer relationship', qs: [
              { text: 'Which tax year are you preparing?', type: 'select', opts: ['2025', '2024', '2023', '2022'], req: 1 },
              { text: 'Whose tax return are you preparing?', type: 'radio', opts: ['My own return', 'My spouse or partner\'s return', 'Another individual\'s return'], req: 1 }
            ]},
            { title: 'Personal Profile & Identification', desc: 'Legal name, SIN, DOB, and contact info', qs: [
              { text: 'First Name', type: 'text', req: 1 },
              { text: 'Last Name', type: 'text', req: 1 },
              { text: 'Social Insurance Number (SIN)', type: 'text', req: 1, ph: 'XXX-XXX-XXX' },
              { text: 'Date of Birth', type: 'date', req: 1 },
              { text: 'Marital Status on Dec 31', type: 'select', opts: ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'], req: 1 }
            ]},
            { title: 'Mailing Address & Residency', desc: 'Address and province of residence', qs: [
              { text: 'Street number and name', type: 'text', req: 1 },
              { text: 'City', type: 'text', req: 1 },
              { text: 'Province or territory on Dec 31', type: 'select', opts: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland', 'Territories'], req: 1 },
              { text: 'Postal code', type: 'text', req: 1, ph: 'A1A 1A1' }
            ]},
            { title: 'T4 Employment Income Slips', desc: 'Upload and enter your T4 slips', qs: [
              { text: 'Upload T4 Slip (Box 14 Income, Box 22 Tax Withheld)', type: 'file', req: 1, help: 'Upload PDF or photo of T4 slip' },
              { text: 'Employer Name', type: 'text', req: 0 },
              { text: 'Employment Income (Box 14)', type: 'currency', req: 1 },
              { text: 'Income Tax Deducted (Box 22)', type: 'currency', req: 0 }
            ]},
            { title: 'T5 Investment Income Slips', desc: 'Bank interest, dividends, mutual funds', qs: [
              { text: 'Upload T5 Slip', type: 'file', req: 0 },
              { text: 'Interest from Canadian sources', type: 'currency', req: 0 },
              { text: 'Actual amount of eligible dividends', type: 'currency', req: 0 }
            ]},
            { title: 'Self-Employment & Rental Income', desc: 'Business and rental property income', qs: [
              { text: 'Did you earn self-employment income (T2125)?', type: 'radio', opts: ['Yes', 'No'], req: 1 },
              { text: 'Gross business income', type: 'currency', req: 0 },
              { text: 'Did you own rental property (T776)?', type: 'radio', opts: ['Yes', 'No'], req: 1 },
              { text: 'Gross rental income', type: 'currency', req: 0 }
            ]},
            { title: 'Deductions, RRSP & Credits', desc: 'RRSP, FHSA, medical, donations, and moving expenses', qs: [
              { text: 'Total RRSP contributions made', type: 'currency', req: 0 },
              { text: 'Total FHSA contributions made', type: 'currency', req: 0 },
              { text: 'Total eligible medical expenses paid', type: 'currency', req: 0 },
              { text: 'Total eligible charitable donations made', type: 'currency', req: 0 }
            ]}
          ];

          let sIdx = 1;
          for (const s of t1Secs) {
            const secId = uuidv4();
            await db.prepare(`
              INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
              VALUES (?, 'platform', ?, ?, ?, ?, ?)
            `).run(secId, versionId, s.title, s.desc, sIdx++, now);

            let qIdx = 1;
            for (const q of s.qs) {
              const qId = uuidv4();
              await db.prepare(`
                INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, help_text, placeholder, is_required, options, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
                VALUES (?, 'platform', ?, ?, ?, ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                qId, versionId, secId, q.text, q.type, (q as any).help || null, (q as any).ph || null, q.req ? 1 : 0,
                (q as any).opts ? JSON.stringify((q as any).opts) : null, qIdx++,
                q.type === 'file' ? 1 : 0, q.text.includes('T4') ? 'T4' : q.text.includes('T5') ? 'T5' : null,
                now, now
              );
            }
          }
        } else {
          // Add a default section for other templates
          const sectionId = uuidv4();
          await db.prepare(`
            INSERT INTO smart_form_sections (id, org_id, version_id, title, sort_order, created_at)
            VALUES (?, 'platform', ?, 'Information Intake', 1, ?)
          `).run(sectionId, versionId, now);
        }
      }

      // Query again
      templates = await db.prepare('SELECT * FROM smart_forms WHERE is_super_template = 1 ORDER BY created_at DESC').all();
    }

    return NextResponse.json(templates);
  } catch (err: any) {
    console.error('GET Super Forms Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || session.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const body = await req.json();
    const { name, form_code, description, country, service_type, service_line } = body;

    if (!name || !country || !service_type || !service_line) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formId = uuidv4();
    const versionId = uuidv4();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, country, compliance_type, current_version, status, is_super_template, service_type, service_line, created_at, updated_at)
      VALUES (?, 'platform', ?, ?, ?, ?, 'Tax', ?, 'Active', 1, ?, ?, ?, ?)
    `).run(formId, name, form_code || null, description || null, country, versionId, service_type, service_line, now, now);

    await db.prepare(`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at, created_by)
      VALUES (?, 'platform', ?, 1, 'Published', ?, ?)
    `).run(versionId, formId, now, session.userId);

    // Add a default section
    const sectionId = uuidv4();
    await db.prepare(`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, sort_order, created_at)
      VALUES (?, 'platform', ?, 'General Questions', 1, ?)
    `).run(sectionId, versionId, now);

    return NextResponse.json({ success: true, id: formId });
  } catch (err: any) {
    console.error('POST Super Form Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
