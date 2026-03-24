const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────────
const allowedOrigins = [
    // Local development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:4173', // Vite preview
    // Production / Tunnel
    'https://bravara.crawlup.in',
    'http://bravara.crawlup.in',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, same-origin SSR, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── DB Connection Test ─────────────────────────────────────────
const db = require('./config/db');

app.get('/api/health', (req, res) => {
    try {
        const result = db.prepare('SELECT 1 + 1 AS result').get();
        res.json({ success: true, message: 'ShopSizzle API + SQLite healthy', db_result: result.result });
    } catch (e) {
        res.status(500).json({ success: false, message: 'SQLite connection failed', details: e.message });
    }
});

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/notifications', require('./routes/notifications'));

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Centralized Error Handler ─────────────────────────────────
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        data: null,
    });
});

// ─── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ ShopSizzle API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
