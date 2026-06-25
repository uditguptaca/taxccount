const { join } = require('path');
const postgres = require('postgres');
const envStr = require('fs').readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const match = envStr.match(/DATABASE_URL_DIRECT=([^\s]+)/) || envStr.match(/DATABASE_URL=([^\s]+)/);
const dbUrl = match ? match[1].replace(/["']/g, '') : null;

async function run() {
  const sql = postgres(dbUrl);
  try {
    const tables = ['client_compliances', 'client_compliance_stages', 'engagement_doc_requirements', 'engagement_reminder_rules', 'reminders', 'engagement_questions', 'engagement_recurrence_schedules', 'activity_feed'];
    for (const t of tables) {
      const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${t}`;
      console.log(t, cols.map(c => c.column_name).includes('org_id'));
    }
  } finally {
    await sql.end();
  }
}
run();
