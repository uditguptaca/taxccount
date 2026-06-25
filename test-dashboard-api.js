const { readFileSync } = require('fs');
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
    const orgId = 'some-org-id'; // Use a dummy org ID just to check syntax
    await sql`
      SELECT
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ${orgId} AND status != 'completed') as "totalProjects",
        (SELECT COALESCE(SUM(COALESCE(converted_amount, total_amount)), 0) FROM invoices WHERE org_id = ${orgId} AND status = 'paid') as "totalRevenue"
    `;
    console.log("SQL syntax is OK!");
    
    // Test the usedCurrencies query
    await sql`
      SELECT DISTINCT original_currency as currency FROM client_compliances WHERE org_id = ${orgId} AND status != 'completed' AND original_currency IS NOT NULL
      UNION
      SELECT DISTINCT original_currency as currency FROM invoices WHERE org_id = ${orgId} AND status != 'paid' AND original_currency IS NOT NULL
    `;
    console.log("usedCurrencies SQL syntax is OK!");

  } catch (error) {
    console.error("SQL Error:", error);
  } finally {
    await sql.end();
  }
}
runTests();
