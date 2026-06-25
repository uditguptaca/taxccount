import { getDb } from './src/lib/db';

async function migrate() {
  const db = getDb();
  try {
    await db.exec(`ALTER TABLE clients ADD COLUMN has_secretarial BOOLEAN DEFAULT FALSE`);
    console.log('Successfully added has_secretarial column');
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}

migrate();
