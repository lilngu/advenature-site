-- Kích hoạt ràng buộc khóa ngoại (Foreign Keys) trong SQLite
PRAGMA foreign_keys = ON;

-- ===================================================
-- 1. BẢNG USERS
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    role TEXT,
    full_name TEXT,
    adventurer_code TEXT UNIQUE,
    class_name TEXT,
    phone_number TEXT,
    bio TEXT,
    avatar_url TEXT,
    tinh_quang_points INTEGER DEFAULT 0,
    cong_hien_points INTEGER DEFAULT 0,
    gacha_counter INTEGER DEFAULT 0,
    referred_by TEXT,
    last_checkin DATE,
    streak_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_checkin_date TEXT,
    checkin_streak INTEGER DEFAULT 0,
    last_quiz_date TEXT,
    quiz_count_today INTEGER DEFAULT 0,
    last_rollquest_date TEXT,
    rollquest_used INTEGER DEFAULT 0,
    rollquest_rewarded TEXT,
    rollquest_scenarios TEXT
);

-- ===================================================
-- 2. BẢNG USER_GEM_COLLECTION
-- ===================================================
CREATE TABLE IF NOT EXISTS user_gem_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    gem_code TEXT NOT NULL,
    gem_name TEXT,
    shape_name TEXT,
    face_count INTEGER,
    obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    gem_color_group TEXT,
    shape_type INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gem_user_id ON user_gem_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_code ON user_gem_collection(gem_code);

-- ===================================================
-- 3. BẢNG USER_INVENTORY
-- ===================================================
CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    item_code TEXT,
    item_name TEXT,
    category TEXT,
    quantity INTEGER DEFAULT 1,
    qr_token TEXT UNIQUE,
    is_used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_qr_token ON user_inventory(qr_token);

-- ===================================================
-- 4. BẢNG USER_CONNECTIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS user_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a_id TEXT NOT NULL,
    user_b_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conn_user_a ON user_connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_conn_user_b ON user_connections(user_b_id);

-- ===================================================
-- 5. BẢNG SHOP_ORDERS
-- ===================================================
CREATE TABLE IF NOT EXISTS shop_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    package_type TEXT,
    tinh_thach_total INTEGER DEFAULT 0,
    vnd_estimate INTEGER DEFAULT 0,
    selected_quest TEXT,
    status TEXT,
    telegram_notified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_user_id ON shop_orders(user_id);

-- ===================================================
-- 6. BẢNG ADMIN_AUDIT (nhật ký thao tác admin)
-- ===================================================
CREATE TABLE IF NOT EXISTS admin_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    target_id TEXT,
    detail TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit(action);