const postgres = require('postgres');
const sql = postgres('postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true', { ssl: 'require' });

async function run() {
  try {
    console.log("Applying migrations to checklist_library...");
    // We add IF NOT EXISTS equivalents by just catching errors if they already exist
    
    const queries = [
      "ALTER TABLE checklist_library ADD COLUMN checklist_code text",
      "ALTER TABLE checklist_library ADD COLUMN category text",
      "ALTER TABLE checklist_library ADD COLUMN country text",
      "ALTER TABLE checklist_library ADD COLUMN status text DEFAULT 'Active'",
      "ALTER TABLE checklist_library ADD COLUMN is_default integer DEFAULT 0",
      "ALTER TABLE checklist_library ADD COLUMN deleted_at timestamp with time zone"
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
