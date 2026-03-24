const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// ── GET /api/cart  ─────────────────────────────────────────────
router.get('/', authMiddleware, (req, res) => {
    try {
        const rows = db.prepare(
            `SELECT c.id, c.quantity,
                    p.id AS product_id, p.name, p.price, p.brand, cat.name AS category,
                    (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
             FROM cart c
             JOIN products p ON p.id = c.product_id
             LEFT JOIN categories cat ON cat.id = p.category_id
             WHERE c.user_id = ?`
        ).all(req.user.id);
        return ok(res, rows);
    } catch (e) {
        return err(res, 'Failed to fetch cart', 500, e.message);
    }
});

// ── POST /api/cart/add ─────────────────────────────────────────
router.post('/add', authMiddleware, (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return err(res, 'product_id required', 400);

    try {
        db.prepare(
            `INSERT INTO cart (user_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`
        ).run(req.user.id, product_id, quantity);
        return ok(res, null, 'Added to cart', 201);
    } catch (e) {
        return err(res, 'Failed to add to cart', 500, e.message);
    }
});

// ── PATCH /api/cart/:id  (update quantity) ─────────────────────
router.patch('/:id', authMiddleware, (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return err(res, 'Valid quantity required', 400);

    try {
        db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id);
        return ok(res, null, 'Cart updated');
    } catch (e) {
        return err(res, 'Failed to update cart', 500, e.message);
    }
});

// ── DELETE /api/cart/remove/:id ────────────────────────────────
router.delete('/remove/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        return ok(res, null, 'Removed from cart');
    } catch (e) {
        return err(res, 'Failed to remove from cart', 500, e.message);
    }
});

// ── DELETE /api/cart/clear  (nuke entire cart) ─────────────────
router.delete('/clear', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
        return ok(res, null, 'Cart cleared');
    } catch (e) {
        return err(res, 'Failed to clear cart', 500, e.message);
    }
});

module.exports = router;
