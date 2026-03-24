const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// ── GET /api/wishlist ──────────────────────────────────────────
router.get('/', authMiddleware, (req, res) => {
    try {
        const rows = db.prepare(
            `SELECT w.id, w.added_at,
                    p.id AS product_id, p.name, p.price, p.brand,
                    (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
             FROM wishlist w
             JOIN products p ON p.id = w.product_id
             WHERE w.user_id = ?
             ORDER BY w.added_at DESC`
        ).all(req.user.id);
        return ok(res, rows);
    } catch (e) {
        return err(res, 'Failed to fetch wishlist', 500, e.message);
    }
});

// ── POST /api/wishlist/toggle ──────────────────────────────────
router.post('/toggle', authMiddleware, (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return err(res, 'product_id required', 400);

    try {
        const existing = db.prepare(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?'
        ).get(req.user.id, product_id);

        if (existing) {
            db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
            return ok(res, { wishlisted: false }, 'Removed from wishlist');
        } else {
            db.prepare(
                'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)'
            ).run(req.user.id, product_id);
            return ok(res, { wishlisted: true }, 'Added to wishlist', 201);
        }
    } catch (e) {
        return err(res, 'Wishlist toggle failed', 500, e.message);
    }
});

// ── DELETE /api/wishlist/remove/:id ───────────────────────────
router.delete('/remove/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM wishlist WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        return ok(res, null, 'Removed from wishlist');
    } catch (e) {
        return err(res, 'Failed to remove from wishlist', 500, e.message);
    }
});

module.exports = router;
