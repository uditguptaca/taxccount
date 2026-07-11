// Node.js scratch script to print active clients
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
}

const postgres = require('postgres');

async function runTest() {
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  const sql = postgres(connectionString, { max: 1 });
  try {
    const res = await sql`SELECT id, display_name, org_id FROM clients LIMIT 5`;
    console.log('Clients:');
    console.log(res);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

runTest();
