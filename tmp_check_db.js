const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'shopsizzle.db');
const db = new Database(dbPath);

const rows = db.prepare('SELECT id, name, image_url FROM products LIMIT 5').all();
console.log(JSON.stringify(rows, null, 2));
db.close();
