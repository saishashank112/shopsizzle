const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);
const info = db.prepare("PRAGMA table_info(products)").all();
console.log(info);
db.close();
