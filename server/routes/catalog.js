const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// ── BOOTSTRAP TABLES (run once on first import) ─────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_categories (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL UNIQUE,
        slug       TEXT    NOT NULL UNIQUE,
        parent_id  INTEGER REFERENCES catalog_categories(id) ON DELETE SET NULL,
        status     TEXT    NOT NULL DEFAULT 'active',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS filter_groups (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        type       TEXT    NOT NULL DEFAULT 'checkbox',
        is_enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS filter_values (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        filter_group_id INTEGER NOT NULL REFERENCES filter_groups(id) ON DELETE CASCADE,
        value           TEXT    NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS category_filter_maps (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id     INTEGER NOT NULL REFERENCES catalog_categories(id) ON DELETE CASCADE,
        filter_group_id INTEGER NOT NULL REFERENCES filter_groups(id) ON DELETE CASCADE,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        UNIQUE(category_id, filter_group_id)
    );
`);

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

// GET /api/catalog/categories
router.get('/categories', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT c.*, p.name AS parent_name
            FROM catalog_categories c
            LEFT JOIN catalog_categories p ON p.id = c.parent_id
            ORDER BY c.sort_order ASC, c.id ASC
        `).all();
        return ok(res, rows);
    } catch (e) { return err(res, 'Failed to fetch categories', 500, e.message); }
});

// POST /api/catalog/categories
router.post('/categories', authMiddleware, adminMiddleware, (req, res) => {
    const { name, slug, parent_id, status, sort_order } = req.body;
    if (!name || !slug) return err(res, 'name and slug are required', 400);
    try {
        const r = db.prepare(`
            INSERT INTO catalog_categories (name, slug, parent_id, status, sort_order)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, slug, parent_id || null, status || 'active', sort_order || 0);
        return ok(res, { id: r.lastInsertRowid }, 'Category created', 201);
    } catch (e) { return err(res, 'Failed to create category', 500, e.message); }
});

// PUT /api/catalog/categories/:id
router.put('/categories/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { name, slug, parent_id, status, sort_order } = req.body;
    try {
        db.prepare(`
            UPDATE catalog_categories SET name=?, slug=?, parent_id=?, status=?, sort_order=? WHERE id=?
        `).run(name, slug, parent_id || null, status, sort_order || 0, req.params.id);
        return ok(res, null, 'Category updated');
    } catch (e) { return err(res, 'Failed to update category', 500, e.message); }
});

// DELETE /api/catalog/categories/:id
router.delete('/categories/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM catalog_categories WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Category deleted');
    } catch (e) { return err(res, 'Failed to delete category', 500, e.message); }
});

// ─────────────────────────────────────────────────────────────────
// FILTER GROUPS
// ─────────────────────────────────────────────────────────────────

// GET /api/catalog/filters  — all groups with their values
router.get('/filters', (req, res) => {
    try {
        const groups = db.prepare(`
            SELECT * FROM filter_groups ORDER BY sort_order ASC, id ASC
        `).all();
        const values = db.prepare(`
            SELECT * FROM filter_values ORDER BY sort_order ASC, id ASC
        `).all();

        // attach values to each group
        const result = groups.map(g => ({
            ...g,
            values: values.filter(v => v.filter_group_id === g.id)
        }));
        return ok(res, result);
    } catch (e) { return err(res, 'Failed to fetch filters', 500, e.message); }
});

// POST /api/catalog/filters
router.post('/filters', authMiddleware, adminMiddleware, (req, res) => {
    const { name, type, is_enabled, sort_order } = req.body;
    if (!name) return err(res, 'name is required', 400);
    try {
        const r = db.prepare(`
            INSERT INTO filter_groups (name, type, is_enabled, sort_order)
            VALUES (?, ?, ?, ?)
        `).run(name, type || 'checkbox', is_enabled !== false ? 1 : 0, sort_order || 0);
        return ok(res, { id: r.lastInsertRowid }, 'Filter group created', 201);
    } catch (e) { return err(res, 'Failed to create filter group', 500, e.message); }
});

// PUT /api/catalog/filters/:id
router.put('/filters/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { name, type, is_enabled, sort_order } = req.body;
    try {
        db.prepare(`
            UPDATE filter_groups SET name=?, type=?, is_enabled=?, sort_order=? WHERE id=?
        `).run(name, type, is_enabled ? 1 : 0, sort_order || 0, req.params.id);
        return ok(res, null, 'Filter group updated');
    } catch (e) { return err(res, 'Failed to update filter group', 500, e.message); }
});

// DELETE /api/catalog/filters/:id
router.delete('/filters/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM filter_groups WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Filter group deleted');
    } catch (e) { return err(res, 'Failed to delete filter group', 500, e.message); }
});

// ─────────────────────────────────────────────────────────────────
// FILTER VALUES (within a group)
// ─────────────────────────────────────────────────────────────────

// POST /api/catalog/filters/:id/values  — add one or bulk add
router.post('/filters/:id/values', authMiddleware, adminMiddleware, (req, res) => {
    const { values } = req.body; // array of strings
    const groupId = req.params.id;
    if (!values || !values.length) return err(res, 'values array required', 400);
    try {
        // Get existing to prevent duplicates
        const existing = db.prepare('SELECT value FROM filter_values WHERE filter_group_id = ?').all(groupId).map(r => r.value.toLowerCase());
        const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM filter_values WHERE filter_group_id = ?').get(groupId)?.m || 0;

        const insert = db.prepare('INSERT INTO filter_values (filter_group_id, value, sort_order) VALUES (?, ?, ?)');
        const addMany = db.transaction((vals) => {
            let order = maxOrder + 1;
            vals.forEach(v => {
                const trimmed = v.trim();
                if (trimmed && !existing.includes(trimmed.toLowerCase())) {
                    insert.run(groupId, trimmed, order++);
                }
            });
        });
        addMany(values);
        return ok(res, null, 'Values added');
    } catch (e) { return err(res, 'Failed to add values', 500, e.message); }
});

// DELETE /api/catalog/filter-values/:id
router.delete('/filter-values/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM filter_values WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Value removed');
    } catch (e) { return err(res, 'Failed to delete value', 500, e.message); }
});

// PATCH /api/catalog/filter-values/:id  — rename a value
router.patch('/filter-values/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { value } = req.body;
    if (!value) return err(res, 'value required', 400);
    try {
        db.prepare('UPDATE filter_values SET value = ? WHERE id = ?').run(value.trim(), req.params.id);
        return ok(res, null, 'Value updated');
    } catch (e) { return err(res, 'Failed to update value', 500, e.message); }
});

// ─────────────────────────────────────────────────────────────────
// CATEGORY ↔ FILTER MAPPINGS
// ─────────────────────────────────────────────────────────────────

// GET /api/catalog/mappings/:categoryId
router.get('/mappings/:categoryId', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT cfm.*, fg.name AS filter_name, fg.type AS filter_type, fg.is_enabled
            FROM category_filter_maps cfm
            JOIN filter_groups fg ON fg.id = cfm.filter_group_id
            WHERE cfm.category_id = ?
            ORDER BY cfm.sort_order ASC
        `).all(req.params.categoryId);
        return ok(res, rows);
    } catch (e) { return err(res, 'Failed to fetch mappings', 500, e.message); }
});

// POST /api/catalog/mappings  — attach a filter to a category
router.post('/mappings', authMiddleware, adminMiddleware, (req, res) => {
    const { category_id, filter_group_id } = req.body;
    if (!category_id || !filter_group_id) return err(res, 'category_id and filter_group_id required', 400);
    try {
        const r = db.prepare(`
            INSERT OR IGNORE INTO category_filter_maps (category_id, filter_group_id, sort_order)
            VALUES (?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM category_filter_maps WHERE category_id = ?))
        `).run(category_id, filter_group_id, category_id);
        return ok(res, { id: r.lastInsertRowid }, 'Filter mapped to category', 201);
    } catch (e) { return err(res, 'Failed to map filter', 500, e.message); }
});

// DELETE /api/catalog/mappings/:id
router.delete('/mappings/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM category_filter_maps WHERE id = ?').run(req.params.id);
        return ok(res, null, 'Mapping removed');
    } catch (e) { return err(res, 'Failed to remove mapping', 500, e.message); }
});

// GET /api/catalog/preview/:categoryId  — what public sees
router.get('/preview/:categoryId', (req, res) => {
    try {
        const category = db.prepare('SELECT * FROM catalog_categories WHERE id = ?').get(req.params.categoryId);
        if (!category) return err(res, 'Category not found', 404);

        const filters = db.prepare(`
            SELECT fg.id, fg.name, fg.type
            FROM category_filter_maps cfm
            JOIN filter_groups fg ON fg.id = cfm.filter_group_id
            WHERE cfm.category_id = ? AND fg.is_enabled = 1
            ORDER BY cfm.sort_order ASC
        `).all(req.params.categoryId);

        for (const f of filters) {
            f.values = db.prepare(`
                SELECT id, value FROM filter_values WHERE filter_group_id = ? ORDER BY sort_order ASC
            `).all(f.id);
        }

        return ok(res, { category, filters });
    } catch (e) { return err(res, 'Preview failed', 500, e.message); }
});

module.exports = router;
