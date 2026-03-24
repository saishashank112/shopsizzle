const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// Optional auth middleware — attaches req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return next();
    try {
        const token = auth.split(' ')[1];
        const row = db.prepare('SELECT user_id FROM auth_tokens WHERE token = ?').get(token);
        if (row) {
            const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(row.user_id);
            req.user = user;
        }
    } catch (_) {}
    next();
};

// ── GET ALL COUPONS (Admin) ────────────────────────────────────────
router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
        ok(res, rows);
    } catch (e) { err(res, 'Failed to fetch coupons', 500, e.message); }
});

// ── VALIDATE COUPON (works logged-in or guest) ────────────────────
router.post('/validate', optionalAuth, (req, res) => {
    const { code, cart_total } = req.body;
    if (!code) return err(res, 'Coupon code is required', 400);

    try {
        const coupon = db.prepare(
            'SELECT * FROM coupons WHERE code = ? AND is_active = 1'
        ).get(code.trim().toUpperCase());

        if (!coupon) return err(res, 'Invalid or inactive coupon code', 404);

        // Expiry check (skip if no expiry set)
        if (coupon.expiry_date) {
            const expiry = new Date(coupon.expiry_date);
            expiry.setHours(23, 59, 59); // end of expiry day
            if (expiry < new Date()) return err(res, 'This coupon has expired', 400);
        }

        // Usage limit check
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return err(res, 'Coupon usage limit reached', 400);
        }

        // Min order amount check
        const cartTotal = parseFloat(cart_total) || 0;
        if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
            return err(res, `Minimum order of ₹${coupon.min_order_amount} required for this coupon`, 400);
        }

        // First-time buyer targeting
        if (coupon.target_user_type === 'first_time') {
            if (!req.user) return err(res, 'Please log in to use this coupon', 401);
            const hasOrders = db.prepare(
                'SELECT id FROM orders WHERE user_id = ? AND status != "cancelled" LIMIT 1'
            ).get(req.user.id);
            if (hasOrders) return err(res, 'This coupon is only valid for first-time buyers', 400);
        }

        ok(res, coupon, 'Coupon validated successfully');
    } catch (e) { err(res, 'Validation failed', 500, e.message); }
});

// ── CREATE COUPON (Admin) ──────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, target_user_type, usage_limit, expiry_date, is_auto_apply } = req.body;
    if (!code || !discount_value) return err(res, 'code and discount_value are required', 400);
    try {
        const r = db.prepare(`
            INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, target_user_type, usage_limit, expiry_date, is_auto_apply)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            code.toUpperCase().trim(),
            description || null,
            discount_type || 'percentage',
            parseFloat(discount_value),
            parseFloat(min_order_amount) || 0,
            max_discount_amount ? parseFloat(max_discount_amount) : null,
            target_user_type || 'all',
            parseInt(usage_limit) || 999999,
            expiry_date || null,
            is_auto_apply ? 1 : 0
        );
        ok(res, { id: r.lastInsertRowid }, 'Coupon created', 201);
    } catch (e) {
        if (e.message?.includes('UNIQUE')) return err(res, 'Coupon code already exists', 409);
        err(res, 'Create failed', 500, e.message);
    }
});

// ── UPDATE COUPON (Admin) ──────────────────────────────────────────
router.patch('/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { is_active, expiry_date, usage_limit, discount_value } = req.body;
    try {
        db.prepare(`
            UPDATE coupons SET
                is_active = COALESCE(?, is_active),
                expiry_date = COALESCE(?, expiry_date),
                usage_limit = COALESCE(?, usage_limit),
                discount_value = COALESCE(?, discount_value)
            WHERE id = ?
        `).run(
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            expiry_date || null,
            usage_limit || null,
            discount_value || null,
            req.params.id
        );
        ok(res, null, 'Coupon updated');
    } catch (e) { err(res, 'Update failed', 500, e.message); }
});

// ── DELETE COUPON (Admin) ──────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
        ok(res, null, 'Coupon deleted');
    } catch (e) { err(res, 'Delete failed', 500, e.message); }
});

module.exports = router;
