const Database = require('better-sqlite3');
const db = new Database('./server/shopsizzle.db');
const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='returns'").get();
console.log(row ? row.sql : 'NOT FOUND');
db.close();
