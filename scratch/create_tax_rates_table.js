const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function init() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tax_rates (
        id TEXT PRIMARY KEY,
        org_id TEXT NOT NULL,
        province TEXT NOT NULL,
        gst TEXT NOT NULL,
        pst TEXT NOT NULL,
        pst_label TEXT,
        is_system INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('tax_rates table created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
