const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ok = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

// GET ALL SETTINGS
router.get('/', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM settings').all();
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        ok(res, settings);
    } catch (e) { err(res, 'Fetch settings failed', 500, e.message); }
});

// UPDATE SETTINGS (Admin)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
    const settings = req.body; // { key1: value1, key2: value2 }
    
    try {
        const upsert = db.prepare(`
          INSERT INTO settings (key, value, group_name) 
          VALUES (?, ?, ?) 
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `);
        
        const updateAll = db.transaction((data) => {
            for (const [key, value] of Object.entries(data)) {
                upsert.run(key, String(value), 'general');
            }
        });
        
        updateAll(settings);
        ok(res, null, 'Settings updated');
    } catch (e) { err(res, 'Update settings failed', 500, e.message); }
});

module.exports = router;
