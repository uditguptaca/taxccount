
const fs = require('fs');
const path = require('path');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim().replace(/"/g, '');

const postgres = require('postgres');
const sql = postgres(dbUrl);

async function run() {
  const teams = await sql`SELECT name, org_id, is_active FROM teams ORDER BY name ASC`;
  console.log(JSON.stringify(teams, null, 2));
}

run().catch(console.error).finally(() => process.exit());
