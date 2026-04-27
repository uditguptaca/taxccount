// Run the PostgreSQL schema against Supabase
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.tuhblzlkjtryzwhpmkul:Taxccount%402025@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function main() {
  const sql = postgres(DATABASE_URL, { prepare: false, connect_timeout: 30 });
  
  const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Remove the ALTER COLUMN DROP NOT NULL since the column might not exist yet from original CREATE
  // Instead, the sm_questions table already has sub_compliance_id as nullable in migration 002
  
  console.log('Running schema against Supabase...');
  
  try {
    await sql.unsafe(schema);
    console.log('Schema applied successfully!');
    
    // Verify by listing tables
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log(`\nCreated ${tables.length} tables:`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
  } catch (err) {
    console.error('Schema error:', err.message);
    // Try to get more detail
    if (err.position) {
      const lines = schema.substring(0, parseInt(err.position)).split('\n');
      console.error(`  Near line ${lines.length}: ${lines[lines.length-1].trim()}`);
    }
  }
  
  await sql.end();
}

main();
