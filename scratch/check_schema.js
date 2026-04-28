const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const DATABASE_URL = envContent.split('\n').find(line => line.startsWith('DATABASE_URL=')).split('=')[1].trim();

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in .env.local');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function checkSchema() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('--- Tables ---');
    console.log(tables.map(t => t.table_name).join(', '));

    const clientsCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients'
    `;
    console.log('\n--- Clients Columns ---');
    console.log(clientsCols.map(c => c.column_name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
