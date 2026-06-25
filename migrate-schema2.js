const postgres = require('postgres');
const sql = postgres('postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true', { ssl: 'require' });

async function run() {
  try {
    const queries = [
      "ALTER TABLE engagement_doc_requirements ADD COLUMN document_code text",
      "ALTER TABLE engagement_doc_requirements ADD COLUMN description text",
      "ALTER TABLE engagement_doc_requirements ADD COLUMN upload_required integer",
      "ALTER TABLE engagement_doc_requirements ADD COLUMN client_visible integer",
      "ALTER TABLE engagement_doc_requirements ADD COLUMN staff_only integer",
      "ALTER TABLE engagement_doc_requirements ADD COLUMN updated_at timestamp with time zone"
    ];

    for (const q of queries) {
      try {
        await sql.unsafe(q);
        console.log("Success:", q);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log("Already exists:", q);
        } else {
          console.error("Failed:", q, err.message);
        }
      }
    }

    console.log("Done updating schema!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
