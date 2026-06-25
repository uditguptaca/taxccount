import { getDb } from './src/lib/db';

async function checkSchema() {
  const db = getDb();
  try {
    const res = await db.prepare(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients'
    `).all();
    console.log(res);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkSchema();
