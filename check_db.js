const { seedDatabase } = require('./src/lib/seed');
const Database = require('better-sqlite3');
const db = new Database('taxccount.db');

// Trigger seeding/migration
seedDatabase();

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

tables.forEach(table => {
    const rowCount = db.prepare(`SELECT count(*) as count FROM ${table.name}`).get();
    console.log(`${table.name}: ${rowCount.count} rows`);
});

db.close();
