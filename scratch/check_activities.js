const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function check() {
  try {
    const rows = await sql`SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 10`;
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
