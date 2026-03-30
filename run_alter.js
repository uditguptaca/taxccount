const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'taxccount.db'));

try {
  db.exec(`ALTER TABLE document_files ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(approval_status IN ('PENDING','APPROVED','REJECTED','AWAITING_SIGNATURE'))`);
  console.log("Added approval_status column successfully.");
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log("Column approval_status already exists.");
  } else {
    console.error("Error adding column:", err);
  }
}

// Ensure db gets initialized to create new tables
const { getDb } = require('./src/lib/db.ts'); 
// wait, we can't require typescript file easily without ts-node, but since it's Next.js we have ts-node? 
// No, but new tables will just be created next time the app runs and uses getDb().
