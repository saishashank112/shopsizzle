const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = 163').all();
console.log('COUNT:', images.length);
if (images.length > 0) {
  process.stdout.write('URL_START:' + images[0].image_url + ':URL_END\n');
}
db.close();
