const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// GET ALL RETURNS (Admin)
router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const rows = db.prepare(`
          SELECT r.*, u.name as user_name, o.id as order_ref
          FROM returns r
          JOIN users u ON u.id = r.user_id
          JOIN orders o ON o.id = r.order_id
          ORDER BY r.created_at DESC
        `).all();
        ok(res, rows);
    } catch (e) { err(res, 'Fetch returns failed', 500, e.message); }
});

// REQUEST RETURN (User)
router.post('/request', authMiddleware, (req, res) => {
    try {
        const { order_id, reason, refund_method, product_pic } = req.body;
        const order = db.prepare('SELECT user_id, total_amount, status FROM orders WHERE id = ?').get(order_id);
        if(!order || order.user_id !== req.user.id) return err(res, 'Order not found or invalid user', 404);
        if(order.status !== 'delivered') return err(res, 'Only delivered orders can be returned', 400);

        db.prepare('INSERT INTO returns (order_id, user_id, reason, refund_amount, refund_method, product_pic) VALUES (?, ?, ?, ?, ?, ?)')
          .run(order_id, req.user.id, reason, order.total_amount, refund_method || 'store_credit', product_pic || null);
        
        db.prepare('UPDATE orders SET status = "returned" WHERE id = ?').run(order_id);

        ok(res, null, 'Return request submitted', 211);
    } catch (e) { err(res, 'Request return failed', 500, e.message); }
});

// UPDATE RETURN STATUS (Admin)
router.patch('/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { status, admin_notes } = req.body;
    try {
        db.prepare('UPDATE returns SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(status, admin_notes, req.params.id);
        
        if(status === 'refunded') {
            db.prepare('UPDATE orders SET payment_status = "refunded" WHERE id = (SELECT order_id FROM returns WHERE id = ?)')
              .run(req.params.id);
        }
        
        ok(res, null, 'Return status updated');
    } catch (e) { err(res, 'Update status failed', 500, e.message); }
});

module.exports = router;
