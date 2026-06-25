const postgres = require('postgres');
const sql = postgres('postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true', { ssl: 'require' });

async function run() {
  try {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'checklist_library_items'
    `;
    console.log(columns);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();