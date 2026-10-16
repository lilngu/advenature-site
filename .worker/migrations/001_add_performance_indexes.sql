-- ===================================================
-- MIGRATION 001: ADD PERFORMANCE INDEXES (P0 FIX)
-- ===================================================
-- Created: 2026-10-08
-- Purpose: Add missing critical indexes for query performance
-- Impact: Improves login, profile lookup, and inventory queries
-- Estimated time: < 1 second on small databases

-- 1. Email lookup (used in every login)
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);

-- 2. Adventurer code lookup (profile views, friend referral)
CREATE INDEX IF NOT EXISTS idx_users_adventurer_code 
  ON users(adventurer_code);

-- 3. Composite index for inventory queries (user_id + is_used)
-- Speeds up "get active inventory items" queries
CREATE INDEX IF NOT EXISTS idx_inventory_user_unused 
  ON user_inventory(user_id, is_used);

-- 4. Composite index for gem collection (user_id + gem_code)
-- Speeds up "check if user has this gem" queries
CREATE INDEX IF NOT EXISTS idx_gems_user_code 
  ON user_gem_collection(user_id, gem_code);

-- 5. Composite index for shop orders (user_id + status)
-- Speeds up "get user's pending orders" queries
CREATE INDEX IF NOT EXISTS idx_shop_orders_user_status 
  ON shop_orders(user_id, status);

-- 6. Index for QR token lookup (inventory scanning)
CREATE INDEX IF NOT EXISTS idx_inventory_category
  ON user_inventory(category, is_used);

-- 7. Index for last quiz/checkin dates (quest queries)
CREATE INDEX IF NOT EXISTS idx_users_quest_dates
  ON users(last_checkin_date, last_quiz_date, last_rollquest_date);

-- ===================================================
-- VERIFICATION QUERIES (run after migration)
-- ===================================================
-- Check if indexes were created successfully:
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='users';
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='user_inventory';
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='user_gem_collection';
