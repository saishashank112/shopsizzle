const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ── GET /api/products ──────────────────────────────────────────
router.get('/', (req, res) => {
    const { cat, brand, search, min, max } = req.query;

    // Helper: resolve a cat slug/name to a list of category names from the `categories` table
    // This bridges catalog_categories (nav) → categories (products)
    let catNames = [];
    if (cat) {
        try {
            // 1. Try direct name match (case-insensitive)
            const directMatch = db.prepare(
                `SELECT name FROM categories WHERE LOWER(name) = LOWER(?)`
            ).all(cat).map(r => r.name);
            catNames.push(...directMatch);

            // 2. Try matching via catalog_categories slug (leaf or parent)
            const catalogCat = db.prepare(
                `SELECT id, name, parent_id FROM catalog_categories WHERE LOWER(slug) = LOWER(?)`
            ).get(cat);

            if (catalogCat) {
                // Match category name in categories table
                const byName = db.prepare(
                    `SELECT name FROM categories WHERE LOWER(name) = LOWER(?)`
                ).all(catalogCat.name).map(r => r.name);
                catNames.push(...byName);

                // Also get all children of this catalog category
                const children = db.prepare(
                    `SELECT name FROM catalog_categories WHERE parent_id = ?`
                ).all(catalogCat.id);
                for (const child of children) {
                    const childMatch = db.prepare(
                        `SELECT name FROM categories WHERE LOWER(name) = LOWER(?)`
                    ).all(child.name).map(r => r.name);
                    catNames.push(...childMatch);
                }
            }

            // Deduplicate
            catNames = [...new Set(catNames)];
        } catch (e) {
            // fallback: just use the cat as name
            catNames = [cat];
        }
    }

    let sql = `
        SELECT p.*, c.name as category_name, 
               (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id ASC LIMIT 1) as image_url

        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1
    `;
    const params = [];

    if (cat) {
        if (catNames.length > 0) {
            const placeholders = catNames.map(() => '?').join(',');
            sql += ` AND c.name IN (${placeholders})`;
            params.push(...catNames);
        } else {
            // No match found — return empty rather than all products
            sql += ` AND 1=0`;
        }
    }
    if (brand)  { sql += ' AND p.brand = ?';  params.push(brand); }
    if (search) { 
        sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)'; 
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); 
    }
    if (min) { sql += ' AND p.price >= ?'; params.push(min); }
    if (max) { sql += ' AND p.price <= ?'; params.push(max); }

    sql += ' ORDER BY p.rating DESC, p.id DESC';

    try {
        const rows = db.prepare(sql).all(params);
        return ok(res, rows);
    } catch (e) {
        return err(res, 'Failed to fetch products', 500, e.message);
    }
});

// ── GET /api/products/categories ────────────────────────────────
router.get('/categories', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM categories').all();
        return ok(res, rows);
    } catch (e) {
        return err(res, 'Categories offline', 500, e.message);
    }
});

// ── GET /api/products/:id ──────────────────────────────────────
router.get('/:id', (req, res) => {
    try {
        const row = db.prepare(`
            SELECT p.*, c.name as category_name,
                   (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id ASC LIMIT 1) as image_url
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `).get(req.params.id);
        if (!row) return err(res, 'Product not found', 404);


        // Advanced PDP Data
        const variants = db.prepare('SELECT id, type, value, stock FROM product_variants WHERE product_id = ?').all(req.params.id);
        const specs = db.prepare('SELECT id, key, value FROM product_specs WHERE product_id = ?').all(req.params.id);
        const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = ?').all(req.params.id);
        
        const reviews = db.prepare(`
            SELECT r.*, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `).all(req.params.id);
        
        const qa = db.prepare(`
            SELECT q.*, u.name as user_name
            FROM qa q
            JOIN users u ON q.user_id = u.id
            WHERE q.product_id = ?
            ORDER BY q.created_at DESC
        `).all(req.params.id);

        row.variants = variants;
        row.specs = specs;
        
        row.images = images.map(img => img.image_url);
        // Ensure primary image is at least present
        if(row.image_url && !row.images.includes(row.image_url)) {
            row.images.unshift(row.image_url);
        }
        if(!row.images.length && row.image_url) {
            row.images = [row.image_url];
        }

        row.reviewsList = reviews;
        row.qaList = qa;

        return ok(res, row);
    } catch (e) {
        return err(res, 'Failed to fetch product', 500, e.message);
    }
});

// ── POST /api/products  (admin only) ──────────────────────────
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
    const { name, category_id, description, price, discount, stock, image_url, brand, rating, attributes, color, material, more_details } = req.body;
    if (!name || !price || !category_id) return err(res, 'Name, Price and Category are required', 400);

    try {
        const result = db.prepare(
            `INSERT INTO products 
              (name, category_id, description, price, discount, stock, brand, rating, attributes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(name, category_id, description, price, discount || 0, stock || 0, brand, rating || 0, attributes ? JSON.stringify(attributes) : null);

        
        const productId = result.lastInsertRowid;

        if (image_url) {
            // Split by comma only if it's followed by http (to avoid breaking URLs that contain commas, like Amazon URLs)
            const urls = String(image_url).split(/,\s*(?=http)/).map(s => s.trim()).filter(Boolean);
            const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)');
            urls.forEach(u => insertImg.run(productId, u));
        }


        const insertSpec = db.prepare('INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)');
        if (color) insertSpec.run(productId, 'Color', color);
        if (material) insertSpec.run(productId, 'Material', material);
        if (more_details) insertSpec.run(productId, 'Features', more_details);

        return ok(res, { id: productId, name }, 'Product created', 201);
    } catch (e) {
        return err(res, 'Failed to create product', 500, e.message);
    }
});

// ── PUT /api/products/:id  (admin only) ────────────────────────
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { name, category_id, description, price, discount, stock, image_url, brand, rating, attributes, color, material, more_details } = req.body;
    try {
        db.prepare(
            `UPDATE products SET name=?, category_id=?, description=?, price=?, discount=?, stock=?,
             brand=?, rating=?, attributes=? WHERE id=?`
        ).run(name, category_id, description, price, discount || 0, stock || 0, brand, rating || 0, attributes ? JSON.stringify(attributes) : null, req.params.id);

        
        if (image_url !== undefined) {
            db.prepare('DELETE FROM product_images WHERE product_id = ?').run(req.params.id);
            if (image_url) {
                // Split by comma only if it's followed by http
                const urls = String(image_url).split(/,\s*(?=http)/).map(s => s.trim()).filter(Boolean);
                const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)');
                urls.forEach(u => insertImg.run(req.params.id, u));
            }
        }



        db.prepare('DELETE FROM product_specs WHERE product_id = ?').run(req.params.id);
        const insertSpec = db.prepare('INSERT INTO product_specs (product_id, key, value) VALUES (?, ?, ?)');
        if (color) insertSpec.run(req.params.id, 'Color', color);
        if (material) insertSpec.run(req.params.id, 'Material', material);
        if (more_details) insertSpec.run(req.params.id, 'Features', more_details);

        return ok(res, null, 'Product updated');
    } catch (e) {
        return err(res, 'Failed to update product', 500, e.message);
    }
});

// ── DELETE /api/products/:id  (admin only) ─────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM product_images WHERE product_id = ?').run(req.params.id);
        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Product deleted');
    } catch (e) {
        return err(res, 'Failed to delete product', 500, e.message);
    }
});

// ── QUICK EDIT STOCK /api/products/quick-edit/:id (admin only) ──
router.patch('/quick-edit/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { stock } = req.body;
    try {
        db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, req.params.id);
        return ok(res, null, 'Stock updated');
    } catch (e) {
        return err(res, 'Quick edit failed', 500, e.message);
    }
});

// ── GET /api/products/categories/:id/fields ────────────────────
router.get('/categories/:id/fields', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM category_fields WHERE category_id = ? ORDER BY display_order ASC').all(req.params.id);
        
        // Parse options_json
        const fields = rows.map(r => ({
            ...r,
            options_json: r.options_json ? JSON.parse(r.options_json) : []
        }));

        return ok(res, fields);
    } catch (e) {
        return err(res, 'Fields lookup offline', 500, e.message);
    }
});

// ── POST /api/category-fields (admin only) ──────────────────────
router.post('/category-fields', authMiddleware, adminMiddleware, (req, res) => {
    const { category_id, field_name, field_key, field_type, options_json, is_required, is_filterable, is_variant, group_name } = req.body;
    
    if (!category_id || !field_name || !field_key || !field_type) {
        return err(res, 'category_id, name, key, & type are required', 400);
    }

    try {
        const result = db.prepare(`
            INSERT INTO category_fields 
            (category_id, field_name, field_key, field_type, options_json, is_required, is_filterable, is_variant, group_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            category_id, 
            field_name, 
            field_key, 
            field_type, 
            options_json ? JSON.stringify(options_json) : null,
            is_required ? 1 : 0, 
            is_filterable ? 1 : 0, 
            is_variant ? 1 : 0, 
            group_name || 'Basic Details'
        );

        return ok(res, { id: result.lastInsertRowid }, 'Field definition saved', 201);
    } catch (e) {
        return err(res, 'Field creation failed', 500, e.message);
    }
});

module.exports = router;
