// Script to convert SQLite schema to PostgreSQL
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
const files = ['001_initial_schema.sql', '002_service_master.sql'];

let combined = '';
for (const f of files) {
  combined += fs.readFileSync(path.join(migrationsDir, f), 'utf8') + '\n';
}

// Apply conversions
let pg = combined;

// Remove PRAGMA statements
pg = pg.replace(/PRAGMA\s+[^;]+;/gi, '');

// datetime('now') → NOW()
pg = pg.replace(/\(datetime\('now'\)\)/gi, 'NOW()');
pg = pg.replace(/datetime\('now'\)/gi, 'NOW()');
pg = pg.replace(/DEFAULT\s+CURRENT_TIMESTAMP/gi, 'DEFAULT NOW()');

// INTEGER PRIMARY KEY AUTOINCREMENT → SERIAL PRIMARY KEY
pg = pg.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');

// REAL → DOUBLE PRECISION
pg = pg.replace(/\bREAL\b/g, 'DOUBLE PRECISION');

// Remove DROP TABLE IF EXISTS ... (from migration 003 which uses temp tables)
// We skip migration 003 entirely since it's a SQLite-specific ALTER pattern

// Write output
const outPath = path.join(__dirname, '..', 'supabase_schema.sql');
fs.writeFileSync(outPath, pg, 'utf8');
console.log('Written to', outPath);
console.log('Lines:', pg.split('\n').length);
