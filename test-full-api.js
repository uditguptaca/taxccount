const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;
process.env.DATABASE_URL_DIRECT = dbUrl;

async function runTests() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  const sql = postgres(DATABASE_URL);
  
  try {
    // 1. Get an existing org
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    if (orgs.length === 0) {
      console.log("No org found in DB. Cannot test.");
      process.exit(0);
    }
    const orgId = orgs[0].id;
    console.log('Testing with org_id:', orgId);
    
    // Test 1: firmSettings
    await sql`SELECT base_currency FROM firm_settings WHERE org_id = ${orgId}`;
    console.log("firmSettings OK");
    
    // Test 2: activeRates
    await sql`SELECT from_currency FROM currency_exchange_rates WHERE org_id = ${orgId} AND to_currency = 'CAD' AND status = 'active'`;
    console.log("activeRates OK");
    
    // Test 3: missingRatesWarning
    await sql`
      SELECT DISTINCT original_currency as currency FROM client_compliances WHERE org_id = ${orgId} AND status != 'completed' AND original_currency IS NOT NULL
      UNION
      SELECT DISTINCT original_currency as currency FROM invoices WHERE org_id = ${orgId} AND status != 'paid' AND original_currency IS NOT NULL
    `;
    console.log("missingRatesWarning OK");
    
    // Test 4: stats
    await sql`
      SELECT
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ${orgId} AND status != 'completed') as "totalProjects",
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ${orgId} AND due_date::date < CURRENT_DATE AND status != 'completed') as "overdueProjects",
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ${orgId} AND status = 'completed') as "completedProjects",
        (SELECT COUNT(*) FROM clients WHERE org_id = ${orgId} AND status = 'active') as "totalClients",
        (SELECT COALESCE(SUM(COALESCE(converted_amount, total_amount)), 0) FROM invoices WHERE org_id = ${orgId} AND status = 'paid') as "totalRevenue",
        (SELECT COALESCE(SUM(COALESCE(converted_amount, total_amount)), 0) FROM invoices WHERE org_id = ${orgId} AND status IN ('unpaid','sent','overdue')) as "pendingRevenue",
        (SELECT COALESCE(SUM(COALESCE(converted_amount, total_amount)), 0) FROM invoices WHERE org_id = ${orgId} AND status = 'paid' AND paid_date::date >= DATE_TRUNC('month', CURRENT_DATE)) as "monthRevenue",
        (SELECT COUNT(*) FROM invoices WHERE org_id = ${orgId} AND status IN ('unpaid','overdue','sent')) as "pendingInvoices",
        (SELECT COUNT(*) FROM document_files WHERE org_id = ${orgId} AND status = 'new') as "pendingDocuments",
        (SELECT COUNT(*) FROM proposals WHERE org_id = ${orgId} AND status = 'sent') as "pendingProposals",
        (SELECT COUNT(*) FROM reminders WHERE org_id = ${orgId} AND status = 'pending' AND trigger_date::date <= CURRENT_DATE + INTERVAL '3 days') as "pendingReminders"
    `;
    console.log("stats OK");
    
    // Test 5: projectsByStage
    await sql`
      SELECT
        ccs.stage_name,
        ccs.stage_code,
        COUNT(*) as count,
        SUM(CASE WHEN cc.due_date::date < CURRENT_DATE THEN 1 ELSE 0 END) as overdue_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - ccs.started_at::timestamp)) / 86400)::numeric, 1) as avg_days_in_stage
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON ccs.engagement_id = cc.id
      WHERE cc.org_id = ${orgId} AND ccs.status = 'in_progress' AND cc.status != 'completed'
      GROUP BY ccs.stage_name, ccs.stage_code
      ORDER BY count DESC
    `;
    console.log("projectsByStage OK");
    
    // Test 6: recentProjects
    await sql`
      SELECT cc.*, c.display_name as client_name, c.client_code,
        ct.code as template_code, ct.name as template_name,
        t.name as team_name,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage_name,
        (SELECT u.first_name || ' ' || u.last_name FROM client_compliance_stages ccs2 JOIN users u ON ccs2.assigned_user_id = u.id WHERE ccs2.engagement_id = cc.id AND ccs2.status = 'in_progress' LIMIT 1) as assigned_to
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      LEFT JOIN teams t ON cc.assigned_team_id = t.id
      WHERE cc.org_id = ${orgId} AND cc.status != 'completed'
      ORDER BY cc.due_date ASC
      LIMIT 10
    `;
    console.log("recentProjects OK");
    
    // Test 7: teamWorkload
    await sql`
      SELECT u.id, u.first_name || ' ' || u.last_name as name,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'in_progress' AND cc.org_id = ${orgId}) as active,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'pending' AND cc.org_id = ${orgId}) as pending,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'completed' AND cc.org_id = ${orgId}) as completed,
        (
          SELECT COALESCE(SUM(COALESCE(i.converted_amount, i.total_amount)), 0) 
          FROM invoices i 
          WHERE i.org_id = ${orgId} AND i.status = 'paid' AND i.engagement_id IN (
            SELECT DISTINCT engagement_id FROM client_compliance_stages WHERE assigned_user_id = u.id
          )
        ) as revenue_attributed
      FROM users u 
      JOIN organization_memberships om ON u.id = om.user_id
      WHERE om.org_id = ${orgId} AND u.is_active = 1
      ORDER BY revenue_attributed DESC, active DESC
    `;
    console.log("teamWorkload OK");
    
    console.log("ALL QUERIES PASSED!");

  } catch (error) {
    console.error("SQL Error:", error);
  } finally {
    await sql.end();
  }
}
runTests();
