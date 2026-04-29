const { getDb } = require('./src/lib/db');
const db = getDb();

async function check() {
  try {
    const row = await db.prepare('SELECT * FROM chat_threads LIMIT 1').get();
    console.log('Columns:', Object.keys(row || {}));
  } catch (err) {
    console.error(err);
  }
}
check();
