const fs = require('fs');
const postgres = require('postgres');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT || (match ? match[1].trim().replace(/^"|"$/g, '') : null);

const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function getCols() {
  const users = await sql`SELECT email, role FROM users`;
  console.log('Users in DB:', users);

  await sql.end();
}
getCols();
