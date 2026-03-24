const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// GET REVIEWS FOR PRODUCT
router.get('/product/:id', (req, res) => {
    try {
        const rows = db.prepare(`
          SELECT r.*, u.name as user_name, u.role as user_role
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          WHERE r.product_id = ? AND r.is_approved = 1
        `).all(req.params.id);
        ok(res, rows);
    } catch (e) { err(res, 'Fetch reviews failed', 500, e.message); }
});

// GET PENDING REVIEWS (Admin)
router.get('/pending', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const rows = db.prepare(`
          SELECT r.*, u.name as user_name, p.name as product_name
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          JOIN products p ON p.id = r.product_id
          WHERE r.is_approved = 0
        `).all();
        ok(res, rows);
    } catch (e) { err(res, 'Fetch pending reviews failed', 500, e.message); }
});

// POST REVIEW (User)
router.post('/', authMiddleware, (req, res) => {
    const { product_id, rating, comment, images, video_url } = req.body;
    try {
        // Check if verified buyer
        const hasOrder = db.prepare(`
          SELECT i.id 
          FROM order_items i
          JOIN orders o ON o.id = i.order_id
          WHERE i.product_id = ? AND o.user_id = ? AND o.status = "delivered"
        `).get(product_id, req.user.id);

        const sentiment = (rating && rating >= 4) ? 'positive' : (rating && rating <= 2) ? 'negative' : 'neutral';

        db.prepare(`
          INSERT INTO reviews (product_id, user_id, rating, comment, images, video_url, is_verified_buyer, sentiment_tag)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(product_id, req.user.id, rating, comment, JSON.stringify(images || []), video_url, hasOrder ? 1 : 0, sentiment);

        ok(res, null, 'Review submitted and awaiting moderation', 211);
    } catch (e) { err(res, 'Submit failed', 500, e.message); }
});

// APPROVE REVIEW (Admin)
router.patch('/approve/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        db.prepare('UPDATE reviews SET is_approved = 1 WHERE id = ?').run(req.params.id);
        ok(res, null, 'Review approved');
    } catch (e) { err(res, 'Approve failed', 500, e.message); }
});

module.exports = router;
