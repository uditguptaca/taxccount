
const fs = require('fs');
const postgres = require('postgres');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim().replace(/"/g, '');
  const sql = postgres(dbUrl);
  
  // Check if platform@abidebylaw.com exists
  const user = await sql`SELECT id, email, role, is_active, is_platform_admin FROM users WHERE email = 'platform@abidebylaw.com'`;
  console.log('platform@abidebylaw.com:', JSON.stringify(user, null, 2));
  
  // Also check admin@taxccount.ca
  const admin = await sql`SELECT id, email, role, is_active FROM users WHERE email = 'admin@taxccount.ca'`;
  console.log('admin@taxccount.ca:', JSON.stringify(admin, null, 2));

  // Check all platform admins
  const admins = await sql`SELECT id, email, role, is_platform_admin FROM users WHERE is_platform_admin = true OR role = 'platform_admin'`;
  console.log('Platform admins:', JSON.stringify(admins, null, 2));

  await sql.end();
}

test().catch(console.error);
