const postgres = require('postgres');
const sql = postgres('postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true', { ssl: 'require' });

async function run() {
  try {
    const tables = ['engagement_doc_requirements', 'compliance_template_documents'];
    for (const t of tables) {
      console.log("- " + t);
      const columns = await sql.unsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '" + t + "'");
      for (const c of columns) {
        console.log("  " + c.column_name + ": " + c.data_type);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
