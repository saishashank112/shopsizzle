const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');
const db = new Database(dbPath);

console.log('🔄 Running Dynamic Schema Migration System...');

db.exec(`
    CREATE TABLE IF NOT EXISTS category_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        field_name TEXT,
        field_key TEXT,
        field_type TEXT, 
        options_json TEXT, 
        is_required INTEGER DEFAULT 0,
        is_filterable INTEGER DEFAULT 0,
        is_variant INTEGER DEFAULT 0,
        default_value TEXT,
        placeholder TEXT,
        display_order INTEGER,
        group_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        field_id INTEGER,
        value TEXT, 
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(field_id) REFERENCES category_fields(id)
    );

    CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        variant_combination_json TEXT, 
        price REAL,
        stock INTEGER,
        sku TEXT,
        image_url TEXT,
        type TEXT, 
        value TEXT, 
        FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS product_specs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        key TEXT,
        value TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
    );
    
    CREATE TABLE IF NOT EXISTS qa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id INTEGER,
        question TEXT,
        answer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log('✅ Dynamic Product Schemas Migration executed successfully.');
process.exit(0);
