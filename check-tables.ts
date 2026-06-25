import { getDb } from './src/lib/db';

async function checkTables() {
  const db = getDb();
  try {
    const res = await db.prepare(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `).all();
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

checkTables();
