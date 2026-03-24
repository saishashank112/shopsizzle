const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// ── POST /api/orders/create ────────────────────────────────────
router.post('/create', authMiddleware, (req, res) => {
    const { total_amount, shipping_address, items, latitude, longitude, coupon_code, discount_amount } = req.body;
    if (!items || items.length === 0) return err(res, 'Order must have at least one item', 400);
    if (!total_amount)               return err(res, 'total_amount required', 400);


    const performTransaction = db.transaction((orderData) => {
        const { userId, total, address, lat, lng, orderItems } = orderData;

        // Create the order
        const orderResult = db.prepare(`
            INSERT INTO orders (user_id, total_amount, shipping_address, latitude, longitude, coupon_code, discount_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, total, address, lat || null, lng || null, coupon_code || null, discount_amount || 0);
        const order_id = orderResult.lastInsertRowid;

        // If coupon used, increment its count
        if (coupon_code) {
            db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(coupon_code);
        }


        // Insert items and decrement stock
        const insertItem = db.prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        );
        const updateStock = db.prepare(
            'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?'
        );

        for (const item of orderItems) {
            insertItem.run(order_id, item.product_id, item.quantity, item.price);
            updateStock.run(item.quantity, item.product_id);
        }

        // Clear user's cart
        db.prepare('DELETE FROM cart WHERE user_id = ?').run(userId);

        return order_id;
    });

    try {
        const order_id = performTransaction({
            userId: req.user.id,
            total: total_amount,
            address: shipping_address,
            lat: latitude,
            lng: longitude,
            orderItems: items,
            coupon_code,
            discount_amount
        });

        return ok(res, { order_id }, 'Order placed successfully', 201);
    } catch (e) {
        return err(res, 'Order creation failed', 500, e.message);
    }
});

// ── GET /api/orders  (user's own orders) ──────────────────────
router.get('/', authMiddleware, (req, res) => {
    try {
        const orders = db.prepare(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
        ).all(req.user.id);

        for (const order of orders) {
            const items = db.prepare(
                `SELECT oi.*, p.name, 
                        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
                 FROM order_items oi
                 JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = ?`
            ).all(order.id);
            order.items = items;
        }

        return ok(res, orders);
    } catch (e) {
        return err(res, 'Failed to fetch orders', 500, e.message);
    }
});

// ── GET /api/orders/all  (admin only) ───────────────────────
router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const rows = db.prepare(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC`
        ).all();

        // Fetch items for each order
        for (const order of rows) {
            const items = db.prepare(
                `SELECT oi.*, p.name, 
                        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
                 FROM order_items oi
                 JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = ?`
            ).all(order.id);
            order.items = items;
        }

        return ok(res, rows);
    } catch (e) {
        return err(res, 'Failed to fetch all orders', 500, e.message);
    }
});

// ── PATCH /api/orders/:id/status  (admin only) ────────────────
router.patch('/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const { status, payment_status } = req.body;
    try {
        db.prepare(
            'UPDATE orders SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status) WHERE id = ?'
        ).run(status, payment_status, req.params.id);
        return ok(res, null, 'Order status updated');
    } catch (e) {
        return err(res, 'Failed to update order status', 500, e.message);
    }
});

module.exports = router;
