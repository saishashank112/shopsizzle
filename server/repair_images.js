const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

const repair = db.transaction(() => {
    const images = db.prepare('SELECT id, product_id, image_url FROM product_images ORDER BY product_id, id').all();
    
    // We group by product and merge fragments that don't start with http
    const products = {};
    for (const row of images) {
        if (!products[row.product_id]) products[row.product_id] = [];
        products[row.product_id].push(row);
    }

    for (const pid in products) {
        const rows = products[pid];
        const merged = [];
        let current = null;

        for (const r of rows) {
            if (r.image_url.startsWith('http') || r.image_url.startsWith('/') || r.image_url.startsWith('data:')) {
                current = { ...r };
                merged.push(current);
            } else if (current) {
                // Fragment found! Merge it back with a comma
                current.image_url += ',' + r.image_url;
                // Delete the fragment record
                db.prepare('DELETE FROM product_images WHERE id = ?').run(r.id);
                // Update the original record
                db.prepare('UPDATE product_images SET image_url = ? WHERE id = ?').run(current.image_url, current.id);
                console.log(`✅ Repaired fragment for Product ${pid}: Joined with ${r.image_url}`);
            }
        }
    }
});

try {
    repair();
    console.log('🎉 Image database repair completed.');
} catch (e) {
    console.error('❌ Repair failed', e);
} finally {
    db.close();
}
