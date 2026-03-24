const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success') => res.json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500) => res.status(code).json({ success: false, message });

// GET ALL NOTIFICATIONS (Authenticated User / Admin)
router.get('/', authMiddleware, (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM notifications 
            WHERE user_id IS NULL OR user_id = ? 
            ORDER BY created_at DESC
        `).all(req.user.id);
        return ok(res, rows);
    } catch (e) {
        return err(res, 'Fetch notifications failed', 500);
    }
});

// Broadcast notification (Admin Only)
router.post('/broadcast', authMiddleware, adminMiddleware, (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) return err(res, 'Title and Message are required', 400);

    try {
        db.prepare('INSERT INTO notifications (title, body) VALUES (?, ?)').run(title, message);
        return ok(res, null, 'Notification Broadcasted Successfully');
    } catch (e) {
        return err(res, 'Broadcast failed', 500);
    }
});

module.exports = router;
