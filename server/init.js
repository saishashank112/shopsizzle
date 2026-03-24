const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

async function init() {
    console.log('🔄 Re-initializing Database for ShopSizzle High Performance System (AMAZON-STYLE)...');

    db.exec(`
        PRAGMA foreign_keys = OFF;
        DROP TABLE IF EXISTS shipping_rules;
        DROP TABLE IF EXISTS shipping_zones;
        DROP TABLE IF EXISTS user_activity_log;
        DROP TABLE IF EXISTS settings;
        DROP TABLE IF EXISTS returns;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS coupon_usage;
        DROP TABLE IF EXISTS coupons;
        DROP TABLE IF EXISTS addresses;
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS wishlist;
        DROP TABLE IF EXISTS cart;
        DROP TABLE IF EXISTS product_images;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS auth_tokens;
        DROP TABLE IF EXISTS users;
        PRAGMA foreign_keys = ON;

        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          password_hash TEXT,
          phone TEXT,
          role TEXT DEFAULT 'user', -- 'user', 'admin', 'manager'
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE auth_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          token TEXT,
          expires_at DATETIME,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );

        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          description TEXT,
          price REAL,
          discount REAL,
          category_id INTEGER,
          brand TEXT,
          color TEXT,
          material TEXT,
          stock INTEGER,
          rating REAL DEFAULT 0,
          is_bestseller INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER,
          image_url TEXT,
          FOREIGN KEY(product_id) REFERENCES products(id)
        );

        CREATE TABLE cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_id INTEGER,
          quantity INTEGER,
          UNIQUE(user_id, product_id),
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        );

        CREATE TABLE wishlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_id INTEGER,
          UNIQUE(user_id, product_id)
        );

        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          total_amount REAL,
          discount_amount REAL DEFAULT 0,
          shipping_amount REAL DEFAULT 0,
          status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'
          payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'failed', 'refunded'
          shipping_address TEXT,
          payment_method TEXT,
          tracking_number TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          product_id INTEGER,
          quantity INTEGER,
          price REAL,
          FOREIGN KEY(order_id) REFERENCES orders(id)
        );

        CREATE TABLE transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          amount REAL,
          status TEXT,
          payment_method TEXT,
          transaction_ref TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          address_line TEXT,
          city TEXT,
          state TEXT,
          pincode TEXT,
          country TEXT DEFAULT 'India',
          is_default INTEGER DEFAULT 0
        );

        -- ADVANCED COUPON ENGINE
        CREATE TABLE coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE,
          description TEXT,
          discount_type TEXT, -- 'percentage', 'flat'
          discount_value REAL,
          min_order_amount REAL DEFAULT 0,
          max_discount_amount REAL,
          target_user_type TEXT DEFAULT 'all', -- 'all', 'first_time', 'high_value', 'abandoner'
          usage_limit INTEGER DEFAULT -1,
          used_count INTEGER DEFAULT 0,
          is_auto_apply INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          start_date DATETIME,
          expiry_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE coupon_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coupon_id INTEGER,
          user_id INTEGER,
          order_id INTEGER,
          discount_applied REAL,
          used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(coupon_id) REFERENCES coupons(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        );

        -- VERIFIED REVIEW SYSTEM
        CREATE TABLE reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER,
          user_id INTEGER,
          rating INTEGER,
          comment TEXT,
          images TEXT, -- JSON array of URLs
          video_url TEXT,
          is_verified_buyer INTEGER DEFAULT 0,
          is_approved INTEGER DEFAULT 0,
          sentiment_tag TEXT, -- 'positive', 'neutral', 'negative'
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(product_id) REFERENCES products(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        );

        -- RETURN WORKFLOW
        CREATE TABLE returns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          user_id INTEGER,
          reason TEXT,
          status TEXT DEFAULT 'requested', -- 'requested', 'approved', 'pickup_scheduled', 'received', 'refunded', 'rejected'
          refund_method TEXT DEFAULT 'store_credit', -- 'store_credit', 'bank_transfer'
          refund_amount REAL,
          pickup_date DATETIME,
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(order_id) REFERENCES orders(id)
        );

        -- SETTINGS & ENGINE CONFIG
        CREATE TABLE settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE,
          value TEXT,
          group_name TEXT, -- 'general', 'smtp', 'payment', 'shipping', 'ai'
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- REAL-TIME TRACKING
        CREATE TABLE user_activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          session_id TEXT,
          action TEXT, -- 'view_product', 'add_to_cart', 'search', 'checkout_start'
          entity_id INTEGER, -- e.g. product_id
          metadata TEXT, -- JSON extra data
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- SHIPPING RULES
        CREATE TABLE shipping_zones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          zone_name TEXT,
          pincodes TEXT -- comma separated or JSON
        );

        CREATE TABLE shipping_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          zone_id INTEGER,
          min_weight REAL,
          max_weight REAL,
          price REAL,
          FOREIGN KEY(zone_id) REFERENCES shipping_zones(id)
        );

        CREATE INDEX idx_products_category ON products(category_id);
        CREATE INDEX idx_products_price ON products(price);
        CREATE INDEX idx_orders_user ON orders(user_id);
    `);

    // Insert Admin
    const adminHash = await bcrypt.hash('admin123', 12);
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
        'Universe Admin', 'admin@shopsizzle.com', adminHash, 'admin'
    );
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
        'Sai Shashank', 'asaishashank121@gmail.com', adminHash, 'admin'
    );

    // Categories
    const categoriesNames = ['Mobiles', 'Watches', 'Dresses', 'Laptops', 'Sarees'];
    const catStmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    categoriesNames.forEach(c => catStmt.run(c));
    const catMap = {};
    db.prepare('SELECT id, name FROM categories').all().forEach(row => catMap[row.name] = row.id);

    // User arrays
    const fNames = ['Sai', 'Nage', 'Ravi', 'Priya', 'Anjali', 'Arjun', 'Vikram', 'Neha', 'Pooja', 'Karan'];
    const lNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Menon', 'Nair'];
    
    const userInsert = db.prepare("INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)");
    const userIds = [];
    const hash = await bcrypt.hash('hashed_pass', 12);
    
    // Create 30 normal users
    for(let i=1; i<=30; i++) {
        const fn = fNames[Math.floor(Math.random() * fNames.length)];
        const ln = lNames[Math.floor(Math.random() * lNames.length)];
        const name = `${fn} ${ln}`;
        const email = `${fn.toLowerCase()}${i}@gmail.com`;
        const phone = `9` + Math.floor(100000000 + Math.random() * 900000000).toString();
        const r = userInsert.run(name, email, hash, phone);
        userIds.push(r.lastInsertRowid);
    }
    
    // Product generation requested specs
    const brands = ['Apple', 'Samsung', 'OnePlus', 'Noise', 'Fossil', 'Diorne', 'Varanasi', 'HP', 'ASUS', 'Heritage'];
    const colors = ['Midnight Blue', 'Black', 'Emerald', 'White', 'Silver', 'Gold', 'Red', 'Crimson'];
    const materials = ['Glass', 'Aluminium', 'Silicon', 'Leather', 'Satin', 'Silk', 'Metal', 'Plastic'];
    const conditions = ['New', 'Refurbished', 'Premium', 'Signature', 'Elite'];
    
    const imageMap = {
        'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
        'Watches': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop',
        'Dresses': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1200&auto=format&fit=crop',
        'Laptops': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop',
        'Sarees': 'https://images.unsplash.com/photo-1610030469668-3f5f3e9a727c?q=80&w=1200&auto=format&fit=crop'
    };

    const prodInsert = db.prepare('INSERT INTO products (name, description, price, brand, category_id, stock, discount, rating, color, material, is_bestseller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const imgInsert = db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)');
    const productIds = [];

    let count = 0;
    for(let cat of categoriesNames) {
        for(let i=0; i<40; i++) { // 40 * 5 = 200 products
            count++;
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            
            const name = `${condition} ${material} ${cat.slice(0,-1)} in ${color.toLowerCase()} - Edition ${count}`;
            const desc = `Experience the ultimate luxury with this ${condition.toLowerCase()} ${cat.slice(0,-1)}. Crafted painstakingly by ${brand} using aerospace-grade ${material.toLowerCase()} and finished in gorgeous ${color.toLowerCase()}. This absolute marvel features next-generation integrations, unmatched durability, and a stunning aesthetic that commands attention everywhere you go. A hallmark of the Shopsizzle exclusive catalog.`;
            
            const price = Math.floor(Math.random() * 95000) + 1500;
            const stock = Math.random() > 0.85 ? 0 : Math.floor(Math.random() * 100);
            const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
            const isBest = Math.random() > 0.8 ? 1 : 0;
            
            const r = prodInsert.run(name, desc, price, brand, catMap[cat], stock, 0, rating, color, material, isBest);
            productIds.push({id: r.lastInsertRowid, price});
            imgInsert.run(r.lastInsertRowid, imageMap[cat]);
        }
    }

    // Orders Generation (To populate Customers, Delivery, Orders tabs)
    const orderInsert = db.prepare("INSERT INTO orders (user_id, total_amount, status, payment_status) VALUES (?, ?, ?, ?)");
    const orderItemInsert = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    const txInsert = db.prepare("INSERT INTO transactions (order_id, amount, status, payment_method, transaction_ref) VALUES (?, ?, ?, ?, ?)");

    const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    const pStatuses = ['pending', 'paid', 'failed'];
    const pMethods = ['UPI', 'Credit Card', 'COD'];

    for(let i=1; i<=150; i++) {
        const uId = userIds[Math.floor(Math.random() * userIds.length)];
        const itemsCount = Math.floor(Math.random() * 3) + 1;
        let total = 0;
        const oItems = [];
        
        for(let j=0; j<itemsCount; j++) {
            const prod = productIds[Math.floor(Math.random() * productIds.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            total += prod.price * qty;
            oItems.push({pid: prod.id, qty, price: prod.price});
        }
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const pStatus = status === 'delivered' ? 'paid' : pStatuses[Math.floor(Math.random() * pStatuses.length)];
        const method = pMethods[Math.floor(Math.random() * pMethods.length)];
        
        const r = orderInsert.run(uId, total, status, pStatus);
        const orderId = r.lastInsertRowid;
        
        oItems.forEach(item => {
            orderItemInsert.run(orderId, item.pid, item.qty, item.price);
        });

        txInsert.run(orderId, total, pStatus === 'paid' ? 'success' : 'pending', method, `TX-${Math.floor(Math.random()*10000000)}`);
    }

    // Advanced Coupons
    const couponStmt = db.prepare('INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, target_user_type, is_auto_apply, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    couponStmt.run('WELCOME10', '10% Off for search-first-time users', 'percentage', 10, 500, 'first_time', 0, '2027-01-01');
    couponStmt.run('CART500', '₹500 Flat discount for high value carts', 'flat', 500, 5000, 'all', 1, '2027-01-01');
    couponStmt.run('SIZZLE20', 'Mid-season mega sale', 'percentage', 20, 2000, 'all', 0, '2026-06-01');

    // Reviews
    const reviewStmt = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment, is_verified_buyer, is_approved, sentiment_tag) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for(let i=0; i<50; i++) {
        const pid = productIds[Math.floor(Math.random() * productIds.length)].id;
        const uid = userIds[Math.floor(Math.random() * userIds.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        reviewStmt.run(pid, uid, rating, 'Extremely impressed with the quality and delivery speed. Truly a premium experience!', 1, 1, 'positive');
    }

    // Returns
    const returnStmt = db.prepare('INSERT INTO returns (order_id, user_id, reason, status, refund_method, refund_amount) VALUES (?, ?, ?, ?, ?, ?)');
    const returnedOrders = db.prepare('SELECT id, user_id, total_amount FROM orders LIMIT 10').all();
    returnedOrders.forEach(o => {
        returnStmt.run(o.id, o.user_id, 'Material quality not as expected', 'requested', 'store_credit', o.total_amount);
    });

    // Settings
    const settingsStmt = db.prepare('INSERT INTO settings (key, value, group_name) VALUES (?, ?, ?)');
    settingsStmt.run('smtp_host', 'smtp.shopsizzle.io', 'smtp');
    settingsStmt.run('smtp_port', '587', 'smtp');
    settingsStmt.run('payment_gateway_active', 'RazorPay', 'payment');
    settingsStmt.run('ai_recommendations_enabled', '1', 'ai');
    settingsStmt.run('whatsapp_notifications', '1', 'general');

    console.log('✅ Success! Shopsizzle DB re-seeded with massive advanced components & 200 products & advanced features.');
}

init();
