-- ===================================================
-- MIGRATION 002: ADD AVATAR BONUS TRACKING
-- ===================================================
-- Created: 2026-10-15
-- Purpose: Track users who have received +1 Tinh Quang point for changing avatar
-- Impact: Ensures bonus is granted only once per user

-- 1. Add column to track avatar bonus grant status
ALTER TABLE users ADD COLUMN has_received_avatar_bonus INTEGER DEFAULT 0;

-- 2. Optional: Add index for faster lookups when checking bonus status
CREATE INDEX IF NOT EXISTS idx_users_avatar_bonus ON users(has_received_avatar_bonus);

-- 3. Verification query:
-- SELECT id, has_received_avatar_bonus FROM users WHERE has_received_avatar_bonus = 0 LIMIT 10;