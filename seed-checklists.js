const { join } = require('path');
const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

const GENERIC_CHECKLIST = [
  { document_name: 'Client Intake Form', is_mandatory: 1, suggested_stage: 'onboarding' },
  { document_name: 'Client Identification Document', is_mandatory: 1, suggested_stage: 'onboarding' },
  { document_name: 'Business / Personal Registration Details', is_mandatory: 1, suggested_stage: 'onboarding' },
  { document_name: 'Prior Year Filing / Return Copy', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Current Year Financial Summary', is_mandatory: 1, suggested_stage: 'data_collection' },
  { document_name: 'Bank Statements', is_mandatory: 1, suggested_stage: 'data_collection' },
  { document_name: 'Credit Card Statements', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Income Records', is_mandatory: 1, suggested_stage: 'data_collection' },
  { document_name: 'Expense Records', is_mandatory: 1, suggested_stage: 'data_collection' },
  { document_name: 'Receipts and Supporting Documents', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Tax Slips / Income Certificates', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Payroll Records', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Sales Tax / GST / HST / VAT Records', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Loan / Liability Statements', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Asset Purchase Details', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Investment / Interest / Dividend Statements', is_mandatory: 0, suggested_stage: 'data_collection' },
  { document_name: 'Government Notices / CRA / Tax Department Letters', is_mandatory: 0, suggested_stage: 'review' },
  { document_name: 'Authorization Form', is_mandatory: 1, suggested_stage: 'sent_to_client' },
  { document_name: 'Engagement Letter', is_mandatory: 1, suggested_stage: 'onboarding' },
  { document_name: 'Signed Final Documents', is_mandatory: 1, suggested_stage: 'completed' },
];

async function seed() {
  if (!dbUrl) {
    console.error('No DATABASE_URL found');
    process.exit(1);
  }
  const sql = postgres(dbUrl);
  
  try {
    // Get all orgs
    const orgs = await sql`SELECT id FROM organizations`;
    
    for (const org of orgs) {
      // Check if Generic Checklist already exists
      const existing = await sql`SELECT id FROM checklist_library WHERE org_id = ${org.id} AND name = 'Generic Default Document Checklist'`;
      if (existing.length > 0) {
        console.log(`Org ${org.id} already has the generic checklist. Skipping.`);
        continue;
      }
      
      const clId = uuidv4();
      await sql`
        INSERT INTO checklist_library (id, org_id, name, description)
        VALUES (${clId}, ${org.id}, 'Generic Default Document Checklist', 'A standard list of required documents suitable for most compliance projects.')
      `;
      
      for (let i = 0; i < GENERIC_CHECKLIST.length; i++) {
        const item = GENERIC_CHECKLIST[i];
        await sql`
          INSERT INTO checklist_library_items (
            id, org_id, checklist_id, document_name, document_category, 
            is_mandatory, upload_required, upload_by, suggested_stage, sort_order
          ) VALUES (
            ${uuidv4()}, ${org.id}, ${clId}, ${item.document_name}, 'client_supporting',
            ${item.is_mandatory}, ${item.is_mandatory}, 'either', ${item.suggested_stage}, ${i + 1}
          )
        `;
      }
      console.log(`Seeded generic checklist for Org ${org.id}`);
    }
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await sql.end();
  }
}

seed();
