const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function init() {
  try {
    // Ensure reminders has org_id
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reminders' AND column_name='org_id') THEN
          ALTER TABLE reminders ADD COLUMN org_id TEXT;
        END IF;
      END $$;
    `;
    console.log('Checked reminders for org_id');

    // Update existing records based on client or user
    await sql`
      UPDATE reminders r
      SET org_id = c.org_id
      FROM clients c
      WHERE r.client_id = c.id AND r.org_id IS NULL
    `;
    console.log('Backfilled org_id for reminders from clients');

    await sql`
      UPDATE reminders r
      SET org_id = om.org_id
      FROM organization_memberships om
      WHERE r.user_id = om.user_id AND r.org_id IS NULL
    `;
    console.log('Backfilled org_id for reminders from users');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
