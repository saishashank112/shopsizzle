const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

async function fix() {
  try {
    const adminHash = await bcrypt.hash('admin123', 12);
    // Add user as admin
    const email = 'asaishashank121@gmail.com';
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!existing) {
      db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
        'Sai Shashank', email, adminHash, 'admin'
      );
      console.log('User created as admin:', email);
    } else {
      db.prepare('UPDATE users SET password_hash = ?, role = "admin" WHERE id = ?').run(adminHash, existing.id);
      console.log('User updated to admin:', email);
    }
  } catch (e) {
    console.error(e);
  }
  db.close();
}

fix();
