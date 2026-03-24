const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS product_variants (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        type       TEXT    NOT NULL, -- 'color', 'size', 'storage'
        value      TEXT    NOT NULL,
        stock      INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_specs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        key        TEXT    NOT NULL,
        value      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_images (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        review_id  INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        image_url  TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_likes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        review_id  INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(review_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS qa (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question   TEXT    NOT NULL,
        answer     TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);
console.log('✅ PDP Tables created');

try {
    const hasSpecs = db.prepare('SELECT count(*) as c FROM product_specs').get().c;
    if (hasSpecs === 0) {
        db.transaction(() => {
            const insertSpec = db.prepare('INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)');
            const insertVariant = db.prepare('INSERT INTO product_variants (product_id, type, value, stock) VALUES (?, ?, ?, ?)');
            const insertReview = db.prepare('INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, 1, ?, ?, ?)');
            const insertQA = db.prepare('INSERT INTO qa (product_id, user_id, question, answer) VALUES (?, 1, ?, ?)');

            // We seed product 1
            insertSpec.run(1, 'Processor', 'Snapdragon 8 Gen 2');
            insertSpec.run(1, 'Display', '6.8" Dynamic AMOLED 2X');
            insertSpec.run(1, 'Camera', '200MP Main / 12MP Ultra-wide');
            insertSpec.run(1, 'Battery', '5000mAh with 45W Fast Charging');
            insertSpec.run(1, 'Weight', '234g');

            insertVariant.run(1, 'color', 'Phantom Black', 15);
            insertVariant.run(1, 'color', 'Cream', 5);
            insertVariant.run(1, 'color', 'Green', 2);
            insertVariant.run(1, 'storage', '256GB', 20);
            insertVariant.run(1, 'storage', '512GB', 12);

            insertReview.run(1, 5, 'Amazing phone!', 'The best android device out there. Fast and fluid.');
            insertReview.run(1, 4, 'Very good, but big', 'Camera is insane but it is a bit heavy to hold.');
            insertReview.run(1, 5, 'Battery monster', 'Easily lasts 2 days of heavy use.');
            insertReview.run(1, 3, 'Too expensive', 'Great device but feels overpriced compared to last year.');
            insertReview.run(1, 5, 'Stylus is great', 'The S-Pen makes signing documents so much easier.');

            insertQA.run(1, 'Does it come with a charger?', 'No, the charger is sold separately.');
            insertQA.run(1, 'Is the display flat or curved?', 'The S23 Ultra features a very subtle curved display.');
            
            // Seed a product down the line with variants (e.g. ID 2, 3...)
            const prods = db.prepare('SELECT id, name FROM products LIMIT 10').all();
            for (let prod of prods) {
                if(prod.id === 1) continue;
                if(prod.name.includes('Shirt')) {
                    insertVariant.run(prod.id, 'size', 'M', 10);
                    insertVariant.run(prod.id, 'size', 'L', 15);
                    insertVariant.run(prod.id, 'size', 'XL', 5);
                    insertVariant.run(prod.id, 'color', 'Blue', 4);
                }
            }
        })();
        console.log('✅ Default PDP Seed data added');
    } else {
        console.log('Seed data already present');
    }
} catch (e) {
    console.error('Seed error:', e.message);
}

db.close();
