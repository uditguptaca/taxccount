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
