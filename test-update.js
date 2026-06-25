const db = require('./src/lib/db');

async function checkSchema() {
  const conn = db.getDb();
  try {
    const clients = await conn.prepare("SELECT id, display_name, has_secretarial FROM clients LIMIT 1").all();
    console.log('Initial state:', clients);
    
    if (clients.length > 0) {
      const clientId = clients[0].id;
      
      console.log('Updating to true...');
      await conn.prepare(`
        UPDATE clients SET has_secretarial = COALESCE($1::boolean, has_secretarial) WHERE id = $2
      `).run(true, clientId);
      
      const after1 = await conn.prepare("SELECT id, display_name, has_secretarial FROM clients WHERE id = $1").all(clientId);
      console.log('After update true:', after1);

      console.log('Updating to false...');
      await conn.prepare(`
        UPDATE clients SET has_secretarial = COALESCE($1::boolean, has_secretarial) WHERE id = $2
      `).run(false, clientId);
      
      const after2 = await conn.prepare("SELECT id, display_name, has_secretarial FROM clients WHERE id = $1").all(clientId);
      console.log('After update false:', after2);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkSchema();
