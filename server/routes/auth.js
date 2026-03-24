const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ── Utility ────────────────────────────────────────────────────
const ok  = (res, data, message = 'Success', code = 200) =>
    res.status(code).json({ success: true, data, message });
const err = (res, message = 'Server error', code = 500, details = null) =>
    res.status(code).json({ success: false, data: null, message, ...(details && { details }) });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/auth/signup ───────────────────────────────────────
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return err(res, 'Name, email, and password are required', 400);
    if (!EMAIL_RE.test(email))
        return err(res, 'Invalid email format', 400);
    if (password.length < 6)
        return err(res, 'Password must be at least 6 characters', 400);

    try {
        const emailLower = email.toLowerCase();
        
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailLower);
        if (existing) return err(res, 'Email already registered', 409);

        const password_hash = await bcrypt.hash(password, 12);
        const result = db.prepare(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
        ).run(name, emailLower, password_hash);

        const token = jwt.sign(
            { id: result.lastInsertRowid, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Store token in auth_tokens
        const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        db.prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
          .run(result.lastInsertRowid, token, expires_at);

        return ok(res, { token, user: { id: result.lastInsertRowid, name, email, role: 'user' } }, 'Account created', 201);
    } catch (e) {
        return err(res, 'Signup failed', 500, e.message);
    }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return err(res, 'Email and password are required', 400);

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        
        if (!user) return err(res, 'Invalid credentials', 401);

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return err(res, 'Invalid credentials', 401);

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Store token in auth_tokens
        const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        db.prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
          .run(user.id, token, expires_at);

        const { password_hash: _pw, ...safeUser } = user;
        return ok(res, { token, user: safeUser }, 'Login successful');
    } catch (e) {
        return err(res, 'Login failed', 500, e.message);
    }
});

// ── GET /api/auth/me  (protected) ──────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
    try {
        const user = db.prepare(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?'
        ).get(req.user.id);
        
        if (!user) return err(res, 'User not found', 404);
        return ok(res, user);
    } catch (e) {
        return err(res, 'Could not fetch profile', 500, e.message);
    }
});

// ── PATCH /api/auth/profile  (protected) ───────────────────────
router.patch('/profile', authMiddleware, (req, res) => {
    const { name, phone } = req.body;
    try {
        db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id);
        return ok(res, null, 'Profile updated');
    } catch (e) {
        return err(res, 'Profile update failed', 500, e.message);
    }
});

// ── PUT /api/auth/change-password (protected) ────────────────
router.put('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return err(res, 'Both current and new passwords are required', 400);
    if (newPassword.length < 6) return err(res, 'New password must be at least 6 characters', 400);

    try {
        const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) return err(res, 'Incorrect current password', 401);

        const newHash = await bcrypt.hash(newPassword, 12);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
        return ok(res, null, 'Password updated successfully');
    } catch (e) {
        return err(res, 'Failed to update password', 500, e.message);
    }
});

module.exports = router;
