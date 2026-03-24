const db = require('better-sqlite3')('shopsizzle.db');
const tables = ['products', 'product_images', 'product_variants', 'product_specs', 'reviews', 'qa'];
for (const t of tables) {
  try {
    console.log(`--- ${t} ---`);
    console.log(db.prepare(`PRAGMA table_info(${t})`).all());
  } catch(e) { console.error(e.message); }
}
