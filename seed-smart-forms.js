const { join } = require('path');
const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');

const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL || dbUrl;
  if (!DATABASE_URL) {
    console.error('No DATABASE_URL found');
    process.exit(1);
  }
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Get an org
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    if (orgs.length === 0) {
        console.error("No organizations found");
        process.exit(1);
    }
    const orgId = orgs[0].id;
    const now = new Date().toISOString();

    // ==========================================
    // FORM 1: T1 Individual Tax Return (Canada)
    // ==========================================
    const t1FormId = uuidv4();
    const t1VersionId = uuidv4();

    await sql`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, current_version, country, compliance_type, status, created_at, updated_at)
      VALUES (${t1FormId}, ${orgId}, 'T1 Individual Tax Return', 'T1-CAN', 'Data collection for Canadian T1 Personal Income Tax Return.', ${t1VersionId}, 'Canada', 'Tax', 'Active', ${now}, ${now})
    `;

    await sql`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at)
      VALUES (${t1VersionId}, ${orgId}, ${t1FormId}, 1, 'Published', ${now})
    `;

    const t1Sec1 = uuidv4();
    await sql`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
      VALUES (${t1Sec1}, ${orgId}, ${t1VersionId}, 'Personal Information', 'Basic details for the taxpayer.', 1, ${now})
    `;

    await sql`
      INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, is_required, sort_order, created_at, updated_at)
      VALUES 
      (${uuidv4()}, ${orgId}, ${t1VersionId}, ${t1Sec1}, 'Social Insurance Number (SIN)', 'text', 1, 1, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t1VersionId}, ${t1Sec1}, 'Date of Birth', 'date', 1, 2, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t1VersionId}, ${t1Sec1}, 'Did your marital status change in the year?', 'checkbox', 0, 3, ${now}, ${now})
    `;

    const t1Sec2 = uuidv4();
    await sql`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
      VALUES (${t1Sec2}, ${orgId}, ${t1VersionId}, 'Income Slips', 'Please upload your income slips (T4, T5, etc.)', 2, ${now})
    `;

    await sql`
      INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, sort_order, is_ai_assisted, ocr_mapping_key, created_at, updated_at)
      VALUES 
      (${uuidv4()}, ${orgId}, ${t1VersionId}, ${t1Sec2}, 'Upload T4 Slip (Employment Income)', 'file', 'Upload all T4 slips provided by your employer(s).', 1, 1, 1, 'T4', ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t1VersionId}, ${t1Sec2}, 'Upload T5 Slip (Investment Income)', 'file', 'Upload if you earned interest or dividends.', 0, 2, 1, 'T5', ${now}, ${now})
    `;


    // ==========================================
    // FORM 2: T2 Corporate Tax Return (Canada)
    // ==========================================
    const t2FormId = uuidv4();
    const t2VersionId = uuidv4();

    await sql`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, current_version, country, compliance_type, status, created_at, updated_at)
      VALUES (${t2FormId}, ${orgId}, 'T2 Corporate Tax Return', 'T2-CAN', 'Data collection for Canadian T2 Corporate Income Tax Return.', ${t2VersionId}, 'Canada', 'Tax', 'Active', ${now}, ${now})
    `;

    await sql`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at)
      VALUES (${t2VersionId}, ${orgId}, ${t2FormId}, 1, 'Published', ${now})
    `;

    const t2Sec1 = uuidv4();
    await sql`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
      VALUES (${t2Sec1}, ${orgId}, ${t2VersionId}, 'Corporate Information', 'Basic details for the corporation.', 1, ${now})
    `;

    await sql`
      INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, is_required, sort_order, created_at, updated_at)
      VALUES 
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec1}, 'Business Number (BN)', 'text', 1, 1, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec1}, 'Fiscal Year End Date', 'date', 1, 2, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec1}, 'Is this the first year of incorporation?', 'checkbox', 0, 3, ${now}, ${now})
    `;

    const t2Sec2 = uuidv4();
    await sql`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, description, sort_order, created_at)
      VALUES (${t2Sec2}, ${orgId}, ${t2VersionId}, 'Financial Statements', 'Please provide year-end financial documents.', 2, ${now})
    `;

    await sql`
      INSERT INTO smart_form_questions (id, org_id, version_id, section_id, question_text, question_type, description, is_required, sort_order, created_at, updated_at)
      VALUES 
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec2}, 'Upload Trial Balance', 'file', 'Excel or CSV format preferred.', 1, 1, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec2}, 'Upload Bank Statements', 'file', 'Last month of the fiscal year.', 1, 2, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec2}, 'Did the corporation declare dividends?', 'checkbox', '', 0, 3, ${now}, ${now}),
      (${uuidv4()}, ${orgId}, ${t2VersionId}, ${t2Sec2}, 'Amount of dividends declared', 'number', 'Leave blank if none.', 0, 4, ${now}, ${now})
    `;

    console.log("Successfully seeded T1 and T2 sample forms.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
