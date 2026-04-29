const postgres = require('postgres');
const DATABASE_URL = "postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL);

async function clean() {
  try {
    console.log('Cleaning up duplicate clients...');
    
    // Delete duplicate clients (keeping the one with the latest created_at)
    await sql`
      DELETE FROM clients
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY org_id, primary_email ORDER BY created_at DESC) as rn
          FROM clients
          WHERE primary_email IS NOT NULL
        ) t
        WHERE t.rn > 1
      )
    `;
    console.log('Cleaned up duplicate emails');

    await sql`
      DELETE FROM clients
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
                 ROW_NUMBER() OVER (PARTITION BY org_id, tax_id ORDER BY created_at DESC) as rn
          FROM clients
          WHERE tax_id IS NOT NULL
        ) t
        WHERE t.rn > 1
      )
    `;
    console.log('Cleaned up duplicate tax_ids');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clean();
