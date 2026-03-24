const fs = require('fs');
const db = require('./config/db');
const res = db.prepare("PRAGMA table_info(notifications)").all();
fs.writeFileSync('schema.json', JSON.stringify(res, null, 2));
console.log('Done');
