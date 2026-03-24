const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// TRACK ACTIVITY (Public/User)
router.post('/activity', async (req, res) => {
    const { action, entity_id, session_id, metadata } = req.body;
    const user_id = (req.user && req.user.id) ? req.user.id : null;
    
    try {
        db.prepare(`
          INSERT INTO user_activity_log (user_id, session_id, action, entity_id, metadata)
          VALUES (?, ?, ?, ?, ?)
        `).run(user_id, session_id, action, entity_id, JSON.stringify(metadata || {}));
        
        if(user_id) db.prepare('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?').run(user_id);

        ok(res, null, 'Activity logged');
    } catch (e) { err(res, 'Track activity failed', 500, e.message); }
});

// GET DASHBOARD ANALYTICS (Admin)
router.get('/analytics', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const stats = {
            total_active_sessions: db.prepare(`SELECT COUNT(DISTINCT session_id) as count FROM user_activity_log WHERE created_at > datetime('now', '-1 hour')`).get().count,
            most_viewed_products: db.prepare(`
              SELECT entity_id as id, p.name, COUNT(*) as views 
              FROM user_activity_log log
              JOIN products p ON p.id = log.entity_id
              WHERE action = 'view_product'
              GROUP BY entity_id ORDER BY views DESC LIMIT 5
            `).all(),
            conversion_events: db.prepare(`
              SELECT action, COUNT(*) as count FROM user_activity_log 
              WHERE action IN ('add_to_cart', 'checkout_start', 'order_complete')
              GROUP BY action
            `).all()
        };
        ok(res, stats);
    } catch (e) { 
        console.error('Analytics Error:', e);
        err(res, 'Fetch analytics failed', 500, e.message); 
    }
});

module.exports = router;
