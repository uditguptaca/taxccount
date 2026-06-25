const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.trim().split('=');
  if (key && !key.startsWith('#')) process.env[key] = rest.join('=');
});
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL);

async function main() {
  try {
    // Check which key tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'checklist_library', 'checklist_library_items', 
        'compliance_template_documents', 'engagement_doc_requirements',
        'compliance_templates', 'compliance_template_stages',
        'client_compliances', 'organizations', 'users'
      )
      ORDER BY table_name
    `;
    console.log('=== Existing tables ===');
    tables.forEach(t => console.log('  ✅', t.table_name));

    // Check for missing tables
    const expected = [
      'checklist_library', 'checklist_library_items',
      'compliance_template_documents', 'engagement_doc_requirements',
      'compliance_templates', 'compliance_template_stages',
      'client_compliances', 'organizations', 'users'
    ];
    const existing = tables.map(t => t.table_name);
    const missing = expected.filter(t => !existing.includes(t));
    
    if (missing.length > 0) {
      console.log('\n=== Missing tables ===');
      missing.forEach(t => console.log('  ❌', t));
    } else {
      console.log('\n✅ All required tables exist!');
    }

    // Check checklist_library columns
    if (existing.includes('checklist_library')) {
      const cols = await sql`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'checklist_library'
        ORDER BY ordinal_position
      `;
      console.log('\n=== checklist_library columns ===');
      cols.forEach(c => console.log('  ', c.column_name, '-', c.data_type));

      // Check for new columns we added
      const colNames = cols.map(c => c.column_name);
      const neededCols = ['checklist_code', 'category', 'country', 'status', 'is_default', 'deleted_at'];
      const missingCols = neededCols.filter(c => !colNames.includes(c));
      if (missingCols.length > 0) {
        console.log('\n=== Missing columns in checklist_library ===');
        missingCols.forEach(c => console.log('  ❌', c));
        console.log('\nRunning ALTER TABLE to add missing columns...');
        for (const col of missingCols) {
          try {
            if (col === 'is_default') {
              await sql.unsafe(`ALTER TABLE checklist_library ADD COLUMN ${col} INTEGER DEFAULT 0`);
            } else if (col === 'deleted_at') {
              await sql.unsafe(`ALTER TABLE checklist_library ADD COLUMN ${col} TIMESTAMPTZ`);
            } else {
              await sql.unsafe(`ALTER TABLE checklist_library ADD COLUMN ${col} TEXT`);
            }
            console.log('  ✅ Added', col);
          } catch (e) {
            if (e.message.includes('already exists')) {
              console.log('  ⏭️ ', col, 'already exists');
            } else {
              console.log('  ❌', col, ':', e.message);
            }
          }
        }
      } else {
        console.log('  ✅ All required columns present');
      }
    }

    // Check checklist_library_items columns
    if (existing.includes('checklist_library_items')) {
      const cols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'checklist_library_items'
        ORDER BY ordinal_position
      `;
      const colNames = cols.map(c => c.column_name);
      console.log('\n=== checklist_library_items columns ===');
      cols.forEach(c => console.log('  ', c.column_name));
      
      // Check for updated_at
      if (!colNames.includes('updated_at')) {
        console.log('  Adding updated_at...');
        await sql.unsafe(`ALTER TABLE checklist_library_items ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()`);
        console.log('  ✅ Added updated_at');
      }
    }

    // If tables are missing, create them
    if (missing.includes('checklist_library') || missing.includes('checklist_library_items')) {
      console.log('\n=== Creating missing checklist tables ===');
      const fs = require('fs');
      const migrationSQL = fs.readFileSync('src/db/migrations/003_checklist_library.sql', 'utf8');
      await sql.unsafe(migrationSQL);
      console.log('  ✅ Migration 003 applied successfully');
    }

    console.log('\n=== Done! ===');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sql.end();
  }
}

main();
