const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;
process.env.DATABASE_URL_DIRECT = dbUrl;

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  if (!DATABASE_URL) {
    console.error('No DATABASE_URL found');
    process.exit(1);
  }
  
  const sql = postgres(DATABASE_URL, { max: 1 });

  // Get the Taxccount organization
  const orgs = await sql`SELECT id FROM organizations WHERE slug = 'taxccount' LIMIT 1`;
  if (orgs.length === 0) {
    console.error('No organization found');
    process.exit(1);
  }
  const orgId = orgs[0].id;
  console.log(`Using organization ID: ${orgId}`);

  // Query specifically for Maple Leaf Consulting first, fallback to any business
  let clients = await sql`SELECT id, display_name FROM clients WHERE org_id = ${orgId} AND display_name LIKE '%Maple Leaf%' LIMIT 1`;
  if (clients.length === 0) {
    clients = await sql`SELECT id, display_name FROM clients WHERE org_id = ${orgId} AND client_type = 'business' LIMIT 1`;
  }
  
  if (clients.length === 0) {
    console.error('No business client found to attach corpsec data to');
    process.exit(1);
  }
  const client = clients[0];
  const companyId = client.id;
  console.log(`Using client/company ID: ${companyId} (${client.display_name})`);

  // Clear existing seeded data to ensure clean run
  await sql`DELETE FROM cs_audit_entries WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_generated_documents WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_document_templates`;
  await sql`DELETE FROM cs_compliance_tasks WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_filings WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_meetings WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_resolutions WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_corporate_events WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_option_exercises WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_option_grants WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_option_plans WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_vesting_schedules WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_convertibles WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_share_repurchases WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_share_transfers WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_share_issuances WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_share_classes WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_officers WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_directors WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_isc_register_entries WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_persons WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_corporations WHERE org_id = ${orgId}`;
  await sql`DELETE FROM cs_corporate_changes WHERE org_id = ${orgId}`;

  // 1. Seed cs_corporations
  await sql`
    INSERT INTO cs_corporations (
      id, org_id, legal_name, jurisdiction, incorporation_number, business_number, 
      incorporation_date, fiscal_year_end, corp_type, registered_office, records_office,
      status, articles_summary, bylaws_version, language, gst_hst_registered, payroll_registered,
      import_export_registered, extra_provincial_registrations
    ) VALUES (
      ${companyId}, ${orgId}, ${client.display_name}, 'Federal (CBCA)', '1234567-8', '876543210RC0001',
      '2024-01-15', '12-31', 'named', '123 Business Bay, Toronto, ON, M5H 2N2', '123 Business Bay, Toronto, ON, M5H 2N2',
      'active', 'Authorized share capital consists of an unlimited number of Class A Common shares and Class B Preferred shares.',
      'v1.0-Adopted-2024-01-15', 'en', 1, 1, 0, '[]'
    )
  `;
  console.log('Seeded cs_corporations');

  // 2. Seed cs_persons
  const p1Id = 'p-001';
  const p2Id = 'p-002';
  const p3Id = 'p-003';
  const p4Id = 'p-004';
  
  await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity, date_of_birth, tax_id) VALUES (${p1Id}, ${orgId}, 'Jane Thompson', 'jane.thompson@example.com', '123 Pinecrest Ave, Toronto, ON', 0, '1985-06-12', '123-456-789')`;
  await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity, date_of_birth, tax_id) VALUES (${p2Id}, ${orgId}, 'Priya Sharma', 'priya.sharma@example.com', '456 Oakview Blvd, Toronto, ON', 0, '1988-11-23', '987-654-321')`;
  await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity, date_of_birth, tax_id) VALUES (${p3Id}, ${orgId}, 'Alice Johnson', 'alice.j@example.com', '789 Maple Rd, Vancouver, BC', 0, '1990-03-05', '456-123-789')`;
  await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity, date_of_birth, tax_id) VALUES (${p4Id}, ${orgId}, 'Robert Lee', 'robert.lee@example.com', '101 Birch St, Calgary, AB', 0, '1992-09-15', '321-654-987')`;
  console.log('Seeded cs_persons');

  // 3. Seed cs_directors
  const d1Id = 'd-001';
  const d2Id = 'd-002';
  await sql`INSERT INTO cs_directors (id, org_id, company_id, person_id, appointed_date, is_resident_canadian) VALUES (${d1Id}, ${orgId}, ${companyId}, ${p1Id}, '2024-01-15', 1)`;
  await sql`INSERT INTO cs_directors (id, org_id, company_id, person_id, appointed_date, is_resident_canadian) VALUES (${d2Id}, ${orgId}, ${companyId}, ${p2Id}, '2024-01-15', 1)`;
  console.log('Seeded cs_directors');

  // 4. Seed cs_officers
  const o1Id = 'o-001';
  const o2Id = 'o-002';
  await sql`INSERT INTO cs_officers (id, org_id, company_id, person_id, title, appointed_date) VALUES (${o1Id}, ${orgId}, ${companyId}, ${p1Id}, 'President & CEO', '2024-01-15')`;
  await sql`INSERT INTO cs_officers (id, org_id, company_id, person_id, title, appointed_date) VALUES (${o2Id}, ${orgId}, ${companyId}, ${p2Id}, 'Corporate Secretary', '2024-01-15')`;
  console.log('Seeded cs_officers');

  // 5. Seed cs_share_classes
  const c1Id = 'c-001';
  const c2Id = 'c-002';
  await sql`INSERT INTO cs_share_classes (id, org_id, company_id, name, series, votes_per_share, is_voting, par_value) VALUES (${c1Id}, ${orgId}, ${companyId}, 'Class A Common', NULL, 1, 1, 1.00)`;
  await sql`INSERT INTO cs_share_classes (id, org_id, company_id, name, series, votes_per_share, is_voting, par_value) VALUES (${c2Id}, ${orgId}, ${companyId}, 'Class B Preferred', 'Series 1', 0, 0, 10.00)`;
  console.log('Seeded cs_share_classes');

  // 6. Seed cs_share_issuances
  const i1Id = 'i-001';
  const i2Id = 'i-002';
  await sql`INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number) VALUES (${i1Id}, ${orgId}, ${companyId}, ${p1Id}, ${c1Id}, 600, 1.00, 'Cash', '2024-01-15', 'TX-A-001')`;
  await sql`INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number) VALUES (${i2Id}, ${orgId}, ${companyId}, ${p2Id}, ${c1Id}, 400, 1.00, 'Cash', '2024-01-15', 'TX-A-002')`;
  console.log('Seeded cs_share_issuances');

  // 7. Seed cs_convertibles
  const con1Id = 'con-001';
  await sql`INSERT INTO cs_convertibles (id, org_id, company_id, holder_id, convertible_type, principal, valuation_cap, discount_rate, status) VALUES (${con1Id}, ${orgId}, ${companyId}, ${p3Id}, 'SAFE', 100000, 5000000, 0.8, 'outstanding')`;
  console.log('Seeded cs_convertibles');

  // 8. Seed cs_vesting_schedules
  const v1Id = 'v-001';
  await sql`INSERT INTO cs_vesting_schedules (id, org_id, company_id, name, vesting_type, cliff_months, total_months, frequency) VALUES (${v1Id}, ${orgId}, ${companyId}, 'Standard 4-Year (12m cliff)', 'time-based', 12, 48, 'monthly')`;
  console.log('Seeded cs_vesting_schedules');

  // 9. Seed cs_option_plans
  const op1Id = 'op-001';
  await sql`INSERT INTO cs_option_plans (id, org_id, company_id, name, pool_size, share_class_id, board_approval_date) VALUES (${op1Id}, ${orgId}, ${companyId}, '2024 Stock Option Plan', 100000, ${c1Id}, '2024-02-01')`;
  console.log('Seeded cs_option_plans');

  // 10. Seed cs_option_grants
  const og1Id = 'og-001';
  await sql`INSERT INTO cs_option_grants (id, org_id, company_id, option_plan_id, grantee_id, quantity, exercise_price, grant_date, vesting_schedule_id, expiry_date, status) VALUES (${og1Id}, ${orgId}, ${companyId}, ${op1Id}, ${p4Id}, 10000, 1.00, '2024-02-15', ${v1Id}, '2034-02-15', 'granted')`;
  console.log('Seeded cs_option_grants');

  // 11. Seed cs_isc_register_entries
  const isc1Id = 'isc-001';
  await sql`INSERT INTO cs_isc_register_entries (id, org_id, company_id, person_id, nature_of_control, start_date, last_reviewed_date) VALUES (${isc1Id}, ${orgId}, ${companyId}, ${p1Id}, 'Direct owner of 60% of voting Class A Common shares.', '2024-01-15', '2025-01-15')`;
  console.log('Seeded cs_isc_register_entries');

  // 12. Seed cs_compliance_tasks
  const t1Id = 't-001';
  const t2Id = 't-002';
  await sql`INSERT INTO cs_compliance_tasks (id, org_id, company_id, title, category, due_date, status) VALUES (${t1Id}, ${orgId}, ${companyId}, 'File CBCA Annual Return', 'annual_return', '2026-08-30', 'pending')`;
  await sql`INSERT INTO cs_compliance_tasks (id, org_id, company_id, title, category, due_date, status) VALUES (${t2Id}, ${orgId}, ${companyId}, 'Review ISC Register', 'isc_review', '2026-07-15', 'pending')`;
  console.log('Seeded cs_compliance_tasks');

  // 13. Seed cs_corporate_changes (In-flight pending change)
  const cc1Id = 'cc-001';
  await sql`
    INSERT INTO cs_corporate_changes (
      id, org_id, company_id, change_type, status, effective_date, payload_json, progress_pct, signers_json
    ) VALUES (
      ${cc1Id}, ${orgId}, ${companyId}, 'Issue Shares', 'draft', '2026-07-01',
      '{"holder_id":"p-003","share_class_id":"c-001","quantity":200,"price_per_share":1.50,"consideration":"Cash"}',
      75,
      '[{"name":"Jane Thompson","email":"jane.thompson@example.com","role":"Director","status":"signed"},{"name":"Priya Sharma","email":"priya.sharma@example.com","role":"Director","status":"pending"}]'
    )
  `;
  console.log('Seeded cs_corporate_changes');

  // 14. Seed cs_document_templates
  const templates = [
    {
      id: 'tmpl-nda',
      category: 'Contracts & Agreements',
      name: 'Non-Disclosure Agreement (Mutual)',
      scope: 'all',
      body_en: '<h1>Mutual Non-Disclosure Agreement</h1><p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between {{partyA}} and {{partyB}}.</p><p>1. Purpose. The parties wish to explore a business relationship...</p>',
      body_fr: '<h1>Accord de Confidentialité Mutuel</h1><p>Cet accord de confidentialité mutuel est conclu entre {{partyA}} et {{partyB}}.</p><p>1. Objet. Les parties souhaitent explorer une relation commerciale...</p>',
      merge_fields_json: '["partyA", "partyB"]'
    },
    {
      id: 'tmpl-div',
      category: 'Shares & Equity',
      name: 'Dividend Declaration Resolution',
      scope: 'all',
      body_en: '<h1>Resolution of Directors</h1><p>RESOLVED that a dividend of {{amountPerShare}} per share on the issued and outstanding Class A Common shares of the Corporation is hereby declared, payable on {{paymentDate}} to shareholders of record on {{recordDate}}.</p>',
      body_fr: '<h1>Résolution des Administrateurs</h1><p>RÉSOLU qu\'un dividende de {{amountPerShare}} par action sur les actions ordinaires de catégorie A émises et en circulation de la Société soit déclaré, payable le {{paymentDate}} aux actionnaires inscrits le {{recordDate}}.</p>',
      merge_fields_json: '["amountPerShare", "paymentDate", "recordDate"]'
    },
    {
      id: 'tmpl-bylaws',
      category: 'Organizational / Governance',
      name: 'Corporate By-Laws',
      scope: 'all',
      body_en: '<h1>By-Laws of {{companyName}}</h1><p>A by-law relating generally to the transaction of the business and affairs of the Corporation.</p>',
      body_fr: '<h1>Règlements de {{companyName}}</h1><p>Règlement régissant de manière générale la conduite des affaires de la Société.</p>',
      merge_fields_json: '["companyName"]'
    }
  ];

  for (const t of templates) {
    await sql`
      INSERT INTO cs_document_templates (id, category, name, jurisdiction_scope, body_en, body_fr, merge_fields_json)
      VALUES (${t.id}, ${t.category}, ${t.name}, ${t.scope}, ${t.body_en}, ${t.body_fr}, ${t.merge_fields_json})
    `;
  }
  console.log('Seeded cs_document_templates');

  // 15. Seed cs_generated_documents (NDA drafts)
  const doc1Id = 'doc-001';
  const doc2Id = 'doc-002';
  const answers = JSON.stringify({ partyA: client.display_name, partyB: 'Acme Corp' });
  await sql`
    INSERT INTO cs_generated_documents (id, org_id, company_id, template_id, name, answers_json, language, status, minute_book_section)
    VALUES (${doc1Id}, ${orgId}, ${companyId}, 'tmpl-nda', 'Mutual NDA - Maple Leaf & Acme Corp', ${answers}, 'en', 'draft', 'Agreements')
  `;
  await sql`
    INSERT INTO cs_generated_documents (id, org_id, company_id, template_id, name, answers_json, language, status, minute_book_section)
    VALUES (${doc2Id}, ${orgId}, ${companyId}, 'tmpl-nda', 'Accord de Confidentialité - Maple Leaf & Acme Corp', ${answers}, 'fr', 'draft', 'Agreements')
  `;
  console.log('Seeded cs_generated_documents');

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
