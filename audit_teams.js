
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
console.log('Using URL:', url ? (url.substring(0, 20) + '...') : 'NULL');

const sql = postgres(url);

async function run() {
  const teams = await sql`SELECT id, name, org_id, is_active FROM teams ORDER BY name ASC`;
  console.log('Total teams in DB:', teams.length);
  console.log(JSON.stringify(teams, null, 2));
  
  const orgs = await sql`SELECT id, name FROM organizations`;
  console.log('Organizations:', JSON.stringify(orgs, null, 2));
}

run().catch(console.error).finally(() => process.exit());
