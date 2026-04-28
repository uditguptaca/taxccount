const fs = require('fs');
const postgres = require('postgres');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT || (match ? match[1].trim().replace(/^"|"$/g, '') : null);

const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function getCols() {
  const stageCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'compliance_template_stages'`;
  console.log('Columns for compliance_template_stages:', stageCols.map(c => c.column_name).join(', '));

  await sql.end();
}
getCols();
