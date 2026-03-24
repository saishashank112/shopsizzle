const db = require('better-sqlite3')('shopsizzle.db');
try {
  console.log("Testing variants...");
  db.prepare('SELECT id, type, value, stock FROM product_variants WHERE product_id = ?').all(193);
  console.log("Variants OK");
  
  console.log("Testing specs...");
  db.prepare('SELECT id, key, value FROM product_specs WHERE product_id = ?').all(193);
  console.log("Specs OK");
  
  console.log("Testing images...");
  db.prepare('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(193);
  console.log("Images OK");
  
  console.log("Testing reviews...");
  db.prepare(`
            SELECT r.*, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `).all(193);
  console.log("Reviews OK");
  
  console.log("Testing qa...");
  db.prepare(`
            SELECT q.*, u.name as user_name
            FROM qa q
            JOIN users u ON q.user_id = u.id
            WHERE q.product_id = ?
            ORDER BY q.created_at DESC
        `).all(193);
  console.log("QA OK");
} catch(e) {
  console.error("FAILED AT", e.message);
}
