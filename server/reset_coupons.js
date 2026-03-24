const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'shopsizzle.db');

const db = new Database(dbPath);

const reset = db.transaction(() => {
    db.prepare('UPDATE coupons SET used_count = 0, usage_limit = 999999, is_active = 1').run();
    console.log('✅ Coupons usage reset to 0 and limit set to 999,999.');
});

try {
    reset();
} catch (e) {
    console.error('❌ Reset failed', e);
} finally {
    db.close();
}
