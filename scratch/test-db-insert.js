const { getDb } = require('../src/lib/db');
const { v4: uuidv4 } = require('uuid');

// Set env vars
const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  }
});

async function run() {
  try {
    const db = getDb();
    console.log("Connected to DB, checking tables...");

    // Get an org ID and client ID
    const client = await db.prepare('SELECT id, org_id FROM clients LIMIT 1').get();
    if (!client) {
      console.log("No clients found in DB!");
      return;
    }
    console.log("Found client:", client);

    const changeId = uuidv4();
    const payloadStr = JSON.stringify({ test: true });
    const signersStr = JSON.stringify([{ name: 'Jane' }]);

    console.log("Testing insert with ::jsonb cast...");
    try {
      await db.prepare(`
        INSERT INTO cs_corporate_changes (id, org_id, company_id, change_type, status, payload_json, progress_pct, signers_json)
        VALUES (?, ?, ?, ?, 'draft', ?::jsonb, 0, ?::jsonb)
      `).run(changeId, client.org_id, client.id, 'director-appoint', payloadStr, signersStr);
      console.log("Insert with ::jsonb succeeded!");
    } catch (e) {
      console.error("Insert with ::jsonb failed:", e.message);
    }

    console.log("Testing insert WITHOUT ::jsonb cast...");
    const changeId2 = uuidv4();
    try {
      await db.prepare(`
        INSERT INTO cs_corporate_changes (id, org_id, company_id, change_type, status, payload_json, progress_pct, signers_json)
        VALUES (?, ?, ?, ?, 'draft', ?, 0, ?)
      `).run(changeId2, client.org_id, client.id, 'director-appoint', payloadStr, signersStr);
      console.log("Insert WITHOUT ::jsonb succeeded!");
    } catch (e) {
      console.error("Insert WITHOUT ::jsonb failed:", e.message);
    }

  } catch (err) {
    console.error("Global error:", err);
  }
  process.exit(0);
}

run();
