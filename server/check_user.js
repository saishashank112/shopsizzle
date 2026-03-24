const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

const user = db.prepare('SELECT * FROM users WHERE email = ?').get('asaishashank121@gmail.com');
console.log('User found:', user ? { id: user.id, name: user.name, email: user.email, role: user.role } : 'Not found');
