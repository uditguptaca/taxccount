const fs = require('fs');
const postgres = require('postgres');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT || (match ? match[1].trim().replace(/^"|"$/g, '') : null);

const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function verify() {
  try {
    const teams = await sql`SELECT id, name FROM teams WHERE name LIKE '%Test%' OR name LIKE '%Alpha%'`;
    console.log('Teams:', teams);

    const templates = await sql`SELECT id, name, code FROM compliance_templates WHERE name LIKE '%Test%' OR name LIKE '%Q4%' OR name LIKE '%Fast%'`;
    console.log('Templates:', templates);

    const clients = await sql`SELECT id, display_name, primary_email FROM clients WHERE display_name LIKE '%Test%' OR display_name = 'udit'`;
    console.log('Clients:', clients);

    const projects = await sql`SELECT id, engagement_code, template_id, assigned_team_id FROM client_compliances ORDER BY created_at DESC LIMIT 3`;
    console.log('Recent Projects:', projects);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}
verify();
