import { getDb } from './src/lib/db';

async function runMigration() {
  const db = getDb();
  try {
    // Add secretarial_data
    await db.prepare(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS secretarial_data JSONB
    `).run();
    console.log('Added secretarial_data column.');

    // Add enrolled_compliances
    await db.prepare(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS enrolled_compliances JSONB
    `).run();
    console.log('Added enrolled_compliances column.');
  } catch (e) {
    console.error(e);
  }
}

runMigration();
