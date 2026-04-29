const fs = require('fs');
const postgres = require('postgres');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const dbUrl = env.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim().replace(/"/g, '');
  const sql = postgres(dbUrl);
  
  try {
    const user = await sql`SELECT id, email FROM users WHERE email = 'platform@abidebylaw.com'`;
    console.log('TestSprite User:', user);
    
    if (user.length > 0) {
      const orgs = await sql`SELECT * FROM organization_memberships WHERE user_id = ${user[0].id}`;
      console.log('Memberships:', orgs);
      
      // Let's also check if it has a personal_org_id
      const userFull = await sql`SELECT personal_org_id FROM users WHERE id = ${user[0].id}`;
      console.log('Personal Org ID:', userFull);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

test().catch(console.error);
