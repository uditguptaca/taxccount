import { getDb } from './src/lib/db';
async function test() {
  const db = getDb();
  const users = await db.prepare('SELECT email FROM users LIMIT 10').all();
  console.log(users);
}
test().catch(console.error);
