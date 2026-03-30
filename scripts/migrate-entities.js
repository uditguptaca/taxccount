const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const db = new Database('./taxccount.db');

try {
  // 1. Create client_types_config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_types_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default types
  const defaults = ['Individual', 'Corporation', 'NGO', 'Partnership', 'LLC', 'Trust', 'Sole Proprietor'];
  const insertType = db.prepare('INSERT OR IGNORE INTO client_types_config (id, name, is_system) VALUES (?, ?, ?)');
  const mappedIds = {};

  defaults.forEach(t => {
    const id = uuidv4();
    insertType.run(id, t, 1);
    mappedIds[t.toLowerCase()] = id;
  });

  // Since 'business' is legacy, map it to 'Corporation' for MVP.
  mappedIds['business'] = mappedIds['corporation'];

  // 2. Add client_type_id to clients table
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN client_type_id TEXT REFERENCES client_types_config(id);`);
  } catch(e) { /* Column might exist */ }

  // 3. Migrate existing string types to their respective UUIDs
  const clients = db.prepare('SELECT id, client_type FROM clients').all();
  const updateClientType = db.prepare('UPDATE clients SET client_type_id = ? WHERE id = ?');
  
  let migratedCount = 0;
  clients.forEach(c => {
    if (!c.client_type) return;
    const lType = c.client_type.toLowerCase();
    const newId = mappedIds[lType] || mappedIds['individual'];
    updateClientType.run(newId, c.id);
    migratedCount++;
  });

  // 4. Create relationships table
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_relationships (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id),
      linked_client_id TEXT NOT NULL REFERENCES clients(id),
      role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(client_id, linked_client_id, role)
    );
  `);

  console.log(`Migration Complete: Added client_types_config and client_relationships. Migrated ${migratedCount} clients.`);
} catch (error) {
  console.error('Migration failed:', error);
}
