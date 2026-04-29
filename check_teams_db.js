
const postgres = require('postgres');
const url = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(url, { prepare: false });

async function checkTeams() {
  const orgId = "c2e0a6d7-d82e-4955-a33b-5582ef02db9a";
  console.log('Checking Org ID:', orgId);

  const allTeams = await sql`SELECT * FROM teams WHERE org_id = ${orgId}`;
  console.log('All Teams in Org:', JSON.stringify(allTeams, null, 2));
  
  process.exit(0);
}

checkTeams().catch(err => {
  console.error(err);
  process.exit(1);
});
