-- ================================================================
--  ShopSizzle DB — Clean Production Schema
--  Run this on your MySQL server to set up everything fresh.
-- ================================================================
CREATE DATABASE IF NOT EXISTS shopsizzle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopsizzle_db;

-- Drop in safe order (FK deps first)
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS site_settings;

-- ── USERS ──────────────────────────────────────────────────────
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── CATEGORIES ─────────────────────────────────────────────────
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ── PRODUCTS ───────────────────────────────────────────────────
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    old_price DECIMAL(12, 2),
    image_url TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    material VARCHAR(100),
    stock INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    context_tag VARCHAR(100),
    story TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT idx_search (name, description, brand)
);

-- ── CART ───────────────────────────────────────────────────────
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- ── WISHLIST ───────────────────────────────────────────────────
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- ── ORDERS ─────────────────────────────────────────────────────
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── ORDER ITEMS ────────────────────────────────────────────────
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ── SITE SETTINGS ──────────────────────────────────────────────
CREATE TABLE site_settings (
    setting_key   VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── SEED: CATEGORIES ───────────────────────────────────────────
INSERT INTO categories (name, slug)
VALUES ('Watches', 'watches'),
    ('Dresses', 'dresses'),
    ('Leather', 'leather'),
    ('Jewelry', 'jewelry'),
    ('Shoes', 'shoes'),
    ('Accessories', 'accessories'),
    ('Fragrances', 'fragrances');

-- ── SEED: PRODUCTS ─────────────────────────────────────────────
INSERT INTO products (name, description, price, old_price, image_url, category, brand, material, stock, is_featured, context_tag, story)
VALUES 
('Midnight Royale Chronograph', 'A precision-engineered timepiece with an obsidian dial and sapphire crystal glass.', 14999.00, 18500.00, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop', 'Watches', 'Titan Heritage', 'Titanium', 25, TRUE, 'Signature Edition', 'Machined from aerospace-grade titanium with an obsidian dial.'),
('Banarasi Zari Drape', 'Handwoven in Varanasi using pure silk and 24k gold threading by master artisans.', 24999.00, NULL, 'https://images.unsplash.com/photo-1596455607563-ad6193f76b19?q=80&w=600&auto=format&fit=crop', 'Dresses', 'Royal Craft', 'Pure Silk', 40, TRUE, 'Heritage Loom', 'Handwoven Varanasi silk with 24k gold thread.'),
('Minimalist Titanium Edition', 'Weighing only 42 grams, featuring a sweeping automatic movement inside an ultra-thin case.', 8499.00, NULL, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop', 'Watches', 'Sizzle Gold', 'Titanium', 60, FALSE, 'Limited Atelier', '38mm ultra-light automatic movement.'),
('Onyx Solitaire Ring', 'Conflict-free stones seated within a hand-forged 18-karat white gold band.', 45000.00, NULL, 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=600&auto=format&fit=crop', 'Jewelry', 'Titan Heritage', '18k Gold', 15, TRUE, 'Craft Edition', '18k gold, conflict-free onyx stones.'),
('Artisan Tan Holdall', 'Full-grain calfskin leather vegetable-tanned over six careful weeks in an Italian tannery.', 12450.00, NULL, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop', 'Leather', 'Sizzle Gold', 'Calfskin Leather', 30, FALSE, 'Signature Drop', 'Full-grain Italian vegetable-tanned calfskin.'),
('Crimson Heritage Saree', 'A striking carmine red saree adorned with intricate floral zarokha motifs.', 32000.00, NULL, 'https://images.unsplash.com/photo-1583391733958-d15f0d32f1f5?q=80&w=600&auto=format&fit=crop', 'Dresses', 'Royal Craft', 'Pure Silk', 20, TRUE, 'Atelier Pick', 'Carmine red with intricate zarokha motifs.');

-- ── SEED: SITE SETTINGS ─────────────────────────────────────────
INSERT INTO site_settings (setting_key, setting_value) VALUES 
('hero_image_1',  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920'),
('hero_image_2',  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920'),
('featured_cat_1','https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800'),
('announcement',  'ELEVATE YOUR STYLE WITH SHOPSIZZLE PREMIERE CURATION');

-- ── SEED: ADMIN USER (password = "admin123") ───────────────────
INSERT INTO users (name, email, password, role)
VALUES ('ShopSizzle Admin', 'admin@shopsizzle.com', '$2b$12$8IKPAHkNkGd/P.4bAUREJO0u7MMOkXVwilJvJBCHT1XlygNdvdoCu', 'admin');