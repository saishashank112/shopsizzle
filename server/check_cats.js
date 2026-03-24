const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('./shopsizzle.db');

let out = '';

out += '=== categories table ===\n';
const cats = db.prepare('SELECT * FROM categories ORDER BY id').all();
cats.forEach(c => {
    const cnt = db.prepare('SELECT count(*) as n FROM products WHERE category_id=?').get(c.id);
    out += `  ${c.id}: "${c.name}" -> ${cnt.n} products\n`;
});

out += '\n=== catalog_categories table ===\n';
const ccs = db.prepare('SELECT id,name,slug,parent_id FROM catalog_categories ORDER BY id').all();
ccs.forEach(c => {
    out += `  ${c.id}: "${c.name}" slug="${c.slug}" parent_id=${c.parent_id}\n`;
});

out += '\n=== Sample product fields ===\n';
const p = db.prepare('SELECT id, name, category_id, brand, color, material, price, discount, stock, rating FROM products LIMIT 1').get();
out += JSON.stringify(p, null, 2) + '\n';

fs.writeFileSync('./db_inspect_out.txt', out);
console.log('Done - check db_inspect_out.txt');
db.close();
