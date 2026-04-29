const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function init() {
  try {
    // Ensure chat_threads has org_id
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_threads' AND column_name='org_id') THEN
          ALTER TABLE chat_threads ADD COLUMN org_id TEXT;
        END IF;
      END $$;
    `;
    console.log('Checked chat_threads for org_id');

    // Ensure chat_messages has org_id (optional but good for speed)
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='org_id') THEN
          ALTER TABLE chat_messages ADD COLUMN org_id TEXT;
        END IF;
      END $$;
    `;
    console.log('Checked chat_messages for org_id');

    // Update existing records if any
    await sql`
      UPDATE chat_threads ct
      SET org_id = c.org_id
      FROM clients c
      WHERE ct.client_id = c.id AND ct.org_id IS NULL
    `;
    console.log('Backfilled org_id for chat_threads');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
