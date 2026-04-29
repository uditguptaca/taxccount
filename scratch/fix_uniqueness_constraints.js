const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function init() {
  try {
    console.log('Fixing uniqueness constraints for multi-tenancy...');

    // 1. Clients: email and tax_id should be unique per organization
    await sql`ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_primary_email_key`;
    await sql`ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_tax_id_key`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_email ON clients (org_id, primary_email) WHERE primary_email IS NOT NULL`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_tax_id ON clients (org_id, tax_id) WHERE tax_id IS NOT NULL`;
    console.log('Fixed client constraints');

    // 2. Compliance Templates: code should be unique per organization
    await sql`ALTER TABLE compliance_templates DROP CONSTRAINT IF EXISTS compliance_templates_code_key`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_org_code ON compliance_templates (org_id, code)`;
    console.log('Fixed compliance_templates constraints');

    // 3. Teams: name should be unique per organization
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_org_name ON teams (org_id, name)`;
    console.log('Fixed team constraints');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

init();
