
const postgres = require('postgres');
const url = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(url, { prepare: false });

async function checkUser() {
  const user = await sql`SELECT * FROM users WHERE email = 'admin@taxccount.ca'`;
  console.log('User:', JSON.stringify(user[0], null, 2));

  if (user[0]) {
    const memberships = await sql`SELECT * FROM organization_memberships WHERE user_id = ${user[0].id}`;
    console.log('Memberships:', JSON.stringify(memberships, null, 2));
  }
  
  process.exit(0);
}

checkUser().catch(err => {
  console.error(err);
  process.exit(1);
});
