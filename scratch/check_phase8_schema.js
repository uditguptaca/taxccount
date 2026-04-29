const postgres = require('postgres');
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function check() {
  try {
    const tables = ['document_files', 'organizer_instances', 'organizer_templates', 'engagement_letters'];
    for (const table of tables) {
      const rows = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${table}
      `;
      const cols = rows.map(r => r.column_name);
      console.log(`Table ${table}: has org_id? ${cols.includes('org_id')}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
