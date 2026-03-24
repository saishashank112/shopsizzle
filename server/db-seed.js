/**
 * db-seed.js — Run once to create ALL tables and seed sample data
 * Usage: node server/db-seed.js
 */
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

/* ══════════════════════════════════════════════
   1. SCHEMA — Create all tables
══════════════════════════════════════════════ */
db.exec(`
-- ── USERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    phone      TEXT,
    role       TEXT    NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── AUTH TOKENS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT    NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── CATEGORIES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    slug       TEXT    NOT NULL UNIQUE,
    icon       TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── PRODUCTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    price       REAL    NOT NULL DEFAULT 0,
    old_price   REAL,
    discount    REAL    DEFAULT 0,
    stock       INTEGER DEFAULT 0,
    brand       TEXT,
    color       TEXT,
    material    TEXT,
    condition   TEXT    DEFAULT 'new',
    size        TEXT,
    weight      REAL,
    sku         TEXT    UNIQUE,
    rating      REAL    DEFAULT 4.0,
    reviews_count INTEGER DEFAULT 0,
    is_featured  INTEGER DEFAULT 0,
    is_bestseller INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── PRODUCT IMAGES ────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT    NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- ── CART ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- ── WISHLIST ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- ── ORDERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number     TEXT    UNIQUE,
    user_id          INTEGER NOT NULL REFERENCES users(id),
    total_amount     REAL    NOT NULL,
    discount_amount  REAL    DEFAULT 0,
    coupon_code      TEXT,
    shipping_address TEXT,
    status           TEXT    NOT NULL DEFAULT 'pending',
    payment_status   TEXT    NOT NULL DEFAULT 'pending',
    payment_method   TEXT    DEFAULT 'cod',
    delivery_partner TEXT,
    tracking_id      TEXT,
    notes            TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ORDER ITEMS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    name       TEXT,
    image_url  TEXT,
    quantity   INTEGER NOT NULL DEFAULT 1,
    price      REAL    NOT NULL
);

-- ── COUPONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    code               TEXT    NOT NULL UNIQUE,
    description        TEXT,
    discount_type      TEXT    NOT NULL DEFAULT 'percentage',
    discount_value     REAL    NOT NULL,
    min_order_amount   REAL    DEFAULT 0,
    max_discount_amount REAL,
    target_user_type   TEXT    DEFAULT 'all',
    usage_limit        INTEGER DEFAULT 999999,
    used_count         INTEGER DEFAULT 0,
    expiry_date        DATE,
    is_active          INTEGER DEFAULT 1,
    is_auto_apply      INTEGER DEFAULT 0,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── COUPON USAGES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_usages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id  INTEGER NOT NULL REFERENCES coupons(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    order_id   INTEGER REFERENCES orders(id),
    used_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── REVIEWS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id        INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating            INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    title             TEXT,
    comment           TEXT,
    images            TEXT    DEFAULT '[]',
    video_url         TEXT,
    is_verified_buyer INTEGER DEFAULT 0,
    is_approved       INTEGER DEFAULT 1,
    helpful_count     INTEGER DEFAULT 0,
    sentiment_tag     TEXT    DEFAULT 'neutral',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ADDRESSES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       TEXT    DEFAULT 'Home',
    full_name   TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    line1       TEXT    NOT NULL,
    line2       TEXT,
    city        TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    pincode     TEXT    NOT NULL,
    is_default  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── SETTINGS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── RETURNS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    reason     TEXT,
    status     TEXT    DEFAULT 'pending',
    refund_amt REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── NOTIFICATIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT    NOT NULL,
    body       TEXT,
    type       TEXT    DEFAULT 'info',
    is_read    INTEGER DEFAULT 0,
    link       TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── USER ACTIVITY LOG ─────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    action     TEXT    NOT NULL,
    entity_id  TEXT,
    metadata   TEXT    DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── CATALOG CATEGORIES ────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    slug       TEXT    NOT NULL UNIQUE,
    parent_id  INTEGER REFERENCES catalog_categories(id) ON DELETE SET NULL,
    icon       TEXT,
    status     TEXT    NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── FILTER GROUPS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS filter_groups (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    type       TEXT    NOT NULL DEFAULT 'checkbox',
    is_enabled INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── FILTER VALUES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS filter_values (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    filter_group_id INTEGER NOT NULL REFERENCES filter_groups(id) ON DELETE CASCADE,
    value           TEXT    NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ── CATEGORY FILTER MAPS ──────────────────────────
CREATE TABLE IF NOT EXISTS category_filter_maps (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL REFERENCES catalog_categories(id) ON DELETE CASCADE,
    filter_group_id INTEGER NOT NULL REFERENCES filter_groups(id) ON DELETE CASCADE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    UNIQUE(category_id, filter_group_id)
);
`);

console.log('✅ All tables created successfully');

/* ══════════════════════════════════════════════
   2. SEED COUPONS (insert or ignore if exists)
══════════════════════════════════════════════ */
const insertCoupon = db.prepare(`
    INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, target_user_type, expiry_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const coupons = [
    ['WELCOME10', '10% off for all users', 'percentage', 10, 0, 500, 'all', '2027-12-31'],
    ['SAVE20', '20% off on orders above ₹2000', 'percentage', 20, 2000, 1000, 'all', '2027-12-31'],
    ['FLAT500', 'Flat ₹500 off on orders above ₹3000', 'flat', 500, 3000, null, 'all', '2027-12-31'],
    ['NEWUSER25', '25% off for first time buyers', 'percentage', 25, 0, 750, 'first_time', '2027-12-31'],
    ['SUPER50', '50% off on orders above ₹10000', 'percentage', 50, 10000, 2000, 'all', '2027-12-31'],
    ['DIWALI30', '30% Diwali special discount', 'percentage', 30, 500, 1500, 'all', '2027-12-31'],
    ['FREESHIP', 'Free Shipping coupon', 'flat', 500, 0, 500, 'all', '2027-12-31'],
];

const seedCoupons = db.transaction(() => {
    for (const c of coupons) insertCoupon.run(...c);
});
seedCoupons();
console.log('✅ Coupons seeded:', coupons.map(c => c[0]).join(', '));

/* ══════════════════════════════════════════════
   3. SEED CATALOG CATEGORIES
══════════════════════════════════════════════ */
const insertCatalogCat = db.prepare(`
    INSERT OR IGNORE INTO catalog_categories (name, slug, parent_id, status, sort_order)
    VALUES (?, ?, ?, 'active', ?)
`);

const seedCatalogCats = db.transaction(() => {
    // Root categories
    insertCatalogCat.run('Electronics', 'electronics', null, 1);
    insertCatalogCat.run('Fashion', 'fashion', null, 2);
    insertCatalogCat.run('Watches', 'watches', null, 3);
    insertCatalogCat.run('Home & Living', 'home', null, 4);
    insertCatalogCat.run('Beauty', 'beauty', null, 5);
    insertCatalogCat.run('Sports & Fitness', 'sports', null, 6);
    insertCatalogCat.run('Books', 'books', null, 7);

    // Electronics sub-categories
    const elec = db.prepare("SELECT id FROM catalog_categories WHERE slug = 'electronics'").get();
    if (elec) {
        insertCatalogCat.run('Smartphones', 'smartphones', elec.id, 1);
        insertCatalogCat.run('Laptops', 'laptops', elec.id, 2);
        insertCatalogCat.run('Audio', 'audio', elec.id, 3);
        insertCatalogCat.run('Cameras', 'cameras', elec.id, 4);
        insertCatalogCat.run('Smart Home', 'smart-home', elec.id, 5);
    }

    // Fashion sub-categories
    const fash = db.prepare("SELECT id FROM catalog_categories WHERE slug = 'fashion'").get();
    if (fash) {
        insertCatalogCat.run('Men\'s Clothing', 'mens-clothing', fash.id, 1);
        insertCatalogCat.run('Women\'s Clothing', 'womens-clothing', fash.id, 2);
        insertCatalogCat.run('Footwear', 'footwear', fash.id, 3);
        insertCatalogCat.run('Accessories', 'accessories', fash.id, 4);
    }
});
seedCatalogCats();
console.log('✅ Catalog categories seeded');

/* ══════════════════════════════════════════════
   4. SEED FILTER GROUPS
══════════════════════════════════════════════ */
const insertFilter = db.prepare(`
    INSERT OR IGNORE INTO filter_groups (name, type, is_enabled, sort_order) VALUES (?, ?, 1, ?)
`);
const insertFilterValue = db.prepare(`
    INSERT OR IGNORE INTO filter_values (filter_group_id, value, sort_order) VALUES (?, ?, ?)
`);

const seedFilters = db.transaction(() => {
    const filters = [
        { name: 'Brand', type: 'checkbox', order: 1, values: ['Apple', 'Samsung', 'OnePlus', 'Sony', 'Nike', 'Adidas', 'Zara', 'H&M'] },
        { name: 'Color', type: 'checkbox', order: 2, values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Gold', 'Silver', 'Pink'] },
        { name: 'Size', type: 'radio', order: 3, values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { name: 'Availability', type: 'toggle', order: 4, values: ['In Stock', 'Out of Stock'] },
        { name: 'Condition', type: 'checkbox', order: 5, values: ['New', 'Refurbished', 'Open Box'] },
        { name: 'Material', type: 'checkbox', order: 6, values: ['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool', 'Denim', 'Linen'] },
        { name: 'Rating', type: 'radio', order: 7, values: ['4 & above', '3 & above', '2 & above'] },
        { name: 'Discount', type: 'checkbox', order: 8, values: ['10% or more', '20% or more', '30% or more', '50% or more'] },
    ];

    for (const f of filters) {
        insertFilter.run(f.name, f.type, f.order);
        const group = db.prepare("SELECT id FROM filter_groups WHERE name = ?").get(f.name);
        if (group) {
            f.values.forEach((v, i) => insertFilterValue.run(group.id, v, i + 1));
        }
    }
});
seedFilters();
console.log('✅ Filter groups seeded');

/* ══════════════════════════════════════════════
   5. SEED SETTINGS
══════════════════════════════════════════════ */
const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
const settings = [
    ['store_name', 'ShopSizzle'],
    ['store_email', 'support@shopsizzle.com'],
    ['store_phone', '+91 98765 43210'],
    ['currency', 'INR'],
    ['tax_rate', '18'],
    ['free_shipping_above', '20000'],
    ['shipping_charge', '500'],
    ['maintenance_mode', '0'],
    ['low_stock_threshold', '10'],
];
const seedSettings = db.transaction(() => {
    for (const [k, v] of settings) insertSetting.run(k, v);
});
seedSettings();
console.log('✅ Settings seeded');

console.log('\n🎉 Database fully initialized! All tables created and seeded.\n');
console.log('Available coupons to test:');
console.log('  WELCOME10  — 10% off any order');
console.log('  SAVE20     — 20% off orders ₹2000+');
console.log('  FLAT500    — ₹500 off orders ₹3000+');
console.log('  NEWUSER25  — 25% off first order');
console.log('  SUPER50    — 50% off orders ₹10000+');
db.close();
