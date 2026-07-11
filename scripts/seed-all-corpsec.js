const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function seed() {
  const sql = postgres(dbUrl, { max: 1 });

  try {
    const orgs = await sql`SELECT id FROM organizations WHERE slug = 'taxccount' LIMIT 1`;
    if (orgs.length === 0) {
      console.error('No organization found');
      process.exit(1);
    }
    const orgId = orgs[0].id;
    console.log(`Using organization ID: ${orgId}`);

    const businessClients = await sql`
      SELECT id, display_name FROM clients 
      WHERE org_id = ${orgId} AND client_type = 'business'
    `;
    console.log(`Found ${businessClients.length} business clients to seed.`);

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

    // Seed global document templates
    await sql`
      INSERT INTO cs_document_templates (id, category, name, body_en, merge_fields_json)
      VALUES 
      ('tmpl-nda', 'Agreements', 'Mutual Non-Disclosure Agreement (NDA)', 'This Mutual NDA is entered into...', '[]'),
      ('tmpl-div', 'Resolutions & Minutes', 'Directors Resolution Declaring Dividend', 'Resolved that a dividend is declared...', '[]'),
      ('tmpl-bylaws', 'Constating', 'General Corporate By-laws (No. 1)', 'These By-laws regulate the business...', '[]')
    `;

    for (const client of businessClients) {
      const companyId = client.id;
      console.log(`Seeding ${client.display_name} (${companyId})...`);

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
          'active', 'Authorized share capital consists of an unlimited number of Class A Common shares.',
          'v1.0-Adopted-2024-01-15', 'en', 1, 1, 0, '[]'
        )
      `;

      // 2. Seed cs_persons
      const p1Id = `p-01-${companyId.substring(0,8)}`;
      const p2Id = `p-02-${companyId.substring(0,8)}`;
      const p3Id = `p-03-${companyId.substring(0,8)}`;
      
      await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity) VALUES (${p1Id}, ${orgId}, 'Robert Williams', 'contact@mapleleaf.ca', '123 Pinecrest Ave, Toronto, ON', 0)`;
      await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity) VALUES (${p2Id}, ${orgId}, 'Jane Thompson', 'jane.t@example.com', '456 Oakview Blvd, Toronto, ON', 0)`;
      await sql`INSERT INTO cs_persons (id, org_id, name, email, address, is_entity) VALUES (${p3Id}, ${orgId}, 'Alice Johnson', 'alice.j@example.com', '789 Maple Rd, Vancouver, BC', 0)`;

      // 3. Seed cs_directors
      await sql`INSERT INTO cs_directors (id, org_id, company_id, person_id, appointed_date, is_resident_canadian) VALUES (${'dir-' + p1Id}, ${orgId}, ${companyId}, ${p1Id}, '2024-01-15', 1)`;
      await sql`INSERT INTO cs_directors (id, org_id, company_id, person_id, appointed_date, is_resident_canadian) VALUES (${'dir-' + p2Id}, ${orgId}, ${companyId}, ${p2Id}, '2024-01-15', 1)`;

      // 4. Seed cs_officers
      await sql`INSERT INTO cs_officers (id, org_id, company_id, person_id, title, appointed_date) VALUES (${'off-' + p1Id}, ${orgId}, ${companyId}, ${p1Id}, 'President & CEO', '2024-01-15')`;
      await sql`INSERT INTO cs_officers (id, org_id, company_id, person_id, title, appointed_date) VALUES (${'off-' + p2Id}, ${orgId}, ${companyId}, ${p2Id}, 'Corporate Secretary', '2024-01-15')`;

      // 5. Seed cs_share_classes
      const c1Id = `sc-${companyId.substring(0,8)}`;
      await sql`INSERT INTO cs_share_classes (id, org_id, company_id, name, votes_per_share, is_voting, par_value) VALUES (${c1Id}, ${orgId}, ${companyId}, 'Class A Common', 1, 1, 1.00)`;

      // 6. Seed cs_share_issuances
      await sql`INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number) VALUES (${'iss-' + p1Id}, ${orgId}, ${companyId}, ${p1Id}, ${c1Id}, 600, 1.00, 'Cash', '2024-01-15', 'TX-A-001')`;
      await sql`INSERT INTO cs_share_issuances (id, org_id, company_id, holder_id, share_class_id, quantity, price_per_share, consideration, issue_date, certificate_number) VALUES (${'iss-' + p2Id}, ${orgId}, ${companyId}, ${p2Id}, ${c1Id}, 400, 1.00, 'Cash', '2024-01-15', 'TX-A-002')`;

      // 7. Seed cs_convertibles
      await sql`INSERT INTO cs_convertibles (id, org_id, company_id, holder_id, convertible_type, principal, valuation_cap, discount_rate, status) VALUES (${'con-' + p3Id}, ${orgId}, ${companyId}, ${p3Id}, 'SAFE', 50000, 2000000, 0.8, 'outstanding')`;

      // 8. Seed cs_option_plans
      const opId = `op-${companyId.substring(0,8)}`;
      await sql`INSERT INTO cs_option_plans (id, org_id, company_id, name, pool_size, share_class_id, board_approval_date) VALUES (${opId}, ${orgId}, ${companyId}, '2024 Stock Option Plan', 100000, ${c1Id}, '2024-02-01')`;

      // 9. Seed cs_option_grants
      await sql`INSERT INTO cs_option_grants (id, org_id, company_id, option_plan_id, grantee_id, quantity, exercise_price, grant_date, status) VALUES (${'og-' + p3Id}, ${orgId}, ${companyId}, ${opId}, ${p3Id}, 10000, 1.00, '2024-02-15', 'granted')`;

      // 10. Seed cs_compliance_tasks
      await sql`INSERT INTO cs_compliance_tasks (id, org_id, company_id, title, category, due_date, status) VALUES (${'t1-' + companyId.substring(0,8)}, ${orgId}, ${companyId}, 'File CBCA Annual Return', 'annual_return', '2026-08-30', 'pending')`;
      await sql`INSERT INTO cs_compliance_tasks (id, org_id, company_id, title, category, due_date, status) VALUES (${'t2-' + companyId.substring(0,8)}, ${orgId}, ${companyId}, 'Review ISC Register', 'isc_review', '2026-07-15', 'pending')`;

      // 11. Seed cs_isc_register_entries
      await sql`INSERT INTO cs_isc_register_entries (id, org_id, company_id, person_id, nature_of_control, start_date, last_reviewed_date) VALUES (${'isc-' + p1Id}, ${orgId}, ${companyId}, ${p1Id}, 'Direct owner of 60% of voting Class A Common shares.', '2024-01-15', '2025-01-15')`;
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await sql.end();
  }
}

seed();
