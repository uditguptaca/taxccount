const db = require('better-sqlite3')('taxccount.db');
const userId = db.prepare(`SELECT id FROM users WHERE email='james@email.com'`).get().id;
const accessibleAccounts = db.prepare('SELECT id, display_name, client_type FROM clients WHERE portal_user_id = ?').all(userId);
const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(accessibleAccounts[0].id);

const queries = [
  'SELECT * FROM client_personal_info WHERE client_id = ?',
  'SELECT * FROM client_contacts WHERE client_id = ?',
  'SELECT * FROM document_files WHERE client_id = ?',
  'SELECT * FROM client_relationships WHERE client_id = ?',
  'SELECT * FROM client_compliances WHERE client_id = ?',
  'SELECT * FROM client_tasks WHERE client_id = ?',
  'SELECT * FROM reminders WHERE client_id = ?',
  'SELECT af.*, u.first_name || " " || u.last_name as actor_name FROM activity_feed af JOIN users u ON af.actor_id = u.id WHERE af.client_id = ?'
];

for (let q of queries) {
  try { db.prepare(q).all(client.id); } catch(e) { console.error('ERROR ON:', q, '\nMSG:', e.message); }
}
