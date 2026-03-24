const Database = require('better-sqlite3');
const db = new Database('./server/shopsizzle.db');

try {
    db.prepare("ALTER TABLE returns ADD COLUMN product_pic TEXT").run();
    console.log("product_pic Added");
} catch (e) {
    console.log("product_pic probably exists");
}

try {
    db.prepare("ALTER TABLE returns ADD COLUMN admin_notes TEXT").run();
    console.log("admin_notes Added");
} catch (e) {
    console.log("admin_notes probably exists");
}

db.close();
