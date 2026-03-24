const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'server', 'shopsizzle.db');
const db = new Database(dbPath);
const coupons = db.prepare('SELECT * FROM coupons').all();
console.log(JSON.stringify(coupons, null, 2));
db.close();
