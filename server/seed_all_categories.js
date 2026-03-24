const Database = require('better-sqlite3');
const db = new Database('./shopsizzle.db');

console.log('Starting dummy data generation...');

// Get all unique names from catalog_categories
const catalogCats = db.prepare('SELECT name FROM catalog_categories').all().map(c => c.name);

// Insert any missing categories into the categories table
const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
for (const catName of catalogCats) {
    insertCat.run(catName);
}

// Ensure "Mobiles" vs "mobiles" case difference doesn't cause issues, just add them all.
// Because it's UNIQUE NOT NULL, the IGNORE handles duplicates.

// Get all categories mapped to their IDs
const allCats = db.prepare('SELECT id, name FROM categories').all();

// Brands and materials to randomize
const brands = ["Nike", "Adidas", "Apple", "Samsung", "Sony", "Dell", "BoAt", "Puma", "Casio", "Titan"];
const materials = ["Cotton", "Polyester", "Leather", "Metal", "Plastic", "Wood", "Glass"];
const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Silver", "Gold"];

const insertProd = db.prepare(`
    INSERT INTO products (name, description, price, discount, category_id, brand, color, material, stock, rating, is_bestseller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, image_url)
    VALUES (?, ?)
`);

// Insert 15 products for each category
let totalAdded = 0;

const seed = db.transaction(() => {
    for (const cat of allCats) {
        for (let i = 1; i <= 15; i++) {
            const randBrand = brands[Math.floor(Math.random() * brands.length)];
            const randColor = colors[Math.floor(Math.random() * colors.length)];
            const randMat = materials[Math.floor(Math.random() * materials.length)];
            
            const name = `Premium ${cat.name} Item ${i} by ${randBrand}`;
            const desc = `This is a high quality dummy product for ${cat.name} category. Made of ${randMat}. Very nice!`;
            const price = Math.floor(Math.random() * 5000) + 500;
            const discount = Math.floor(Math.random() * 20); // 0 to 20 percent
            const stock = Math.floor(Math.random() * 50) + 5;
            const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
            const isBestseller = Math.random() > 0.8 ? 1 : 0;
            
            const res = insertProd.run(
                name, desc, price, discount, cat.id, randBrand, randColor, randMat, stock, rating, isBestseller
            );
            
            const imgUrl = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop`;
            insertImage.run(res.lastInsertRowid, imgUrl);
            
            totalAdded++;
        }
    }
});
seed();

console.log(`Added ${totalAdded} dummy products across ${allCats.length} categories.`);
db.close();
