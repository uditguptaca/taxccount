const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function fix() {
  const sql = postgres(dbUrl);
  
  // The correct org_id is the one for 'Untitled Smart Form'
  const correctOrg = await sql`SELECT org_id FROM smart_forms WHERE name = 'Untitled Smart Form' LIMIT 1`;
  if (!correctOrg.length) {
    console.error("Couldn't find the correct org_id.");
    process.exit(1);
  }
  const orgId = correctOrg[0].org_id;
  
  const formsToUpdate = await sql`SELECT id FROM smart_forms WHERE name IN ('T1 Individual Tax Return', 'T2 Corporate Tax Return')`;
  
  for (const form of formsToUpdate) {
    await sql`UPDATE smart_forms SET org_id = ${orgId} WHERE id = ${form.id}`;
    await sql`UPDATE smart_form_versions SET org_id = ${orgId} WHERE form_id = ${form.id}`;
    await sql`UPDATE smart_form_sections SET org_id = ${orgId} WHERE version_id IN (SELECT id FROM smart_form_versions WHERE form_id = ${form.id})`;
    await sql`UPDATE smart_form_questions SET org_id = ${orgId} WHERE version_id IN (SELECT id FROM smart_form_versions WHERE form_id = ${form.id})`;
  }

  console.log('Fixed org_ids for T1 and T2 forms.');
  process.exit(0);
}

fix();
