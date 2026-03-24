const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// SQLite database file path
const dbPath = path.resolve(__dirname, '../shopsizzle.db');

// Initialize database with logging enabled for development
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints in SQLite
db.pragma('foreign_keys = ON');

module.exports = db;
