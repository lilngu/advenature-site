-- ======================================================
-- MIGRATION: Chuyển bộ đếm lượt "NHẬP VAI VUI VẺ" từ KV sang D1
-- ======================================================
-- Lý do: KV Free chỉ 1.000 write/ngày (mỗi người chơi tốn 6 write cho 3 lượt)
-- và get() của KV đọc cache 60s nên có thể bị vượt lượt / cộng điểm trùng.
-- D1 cho phép UPDATE ... WHERE atomic nên vá được cả 2 vấn đề.
--
-- CÁCH CHẠY (chạy 1 lần duy nhất):
--   wrangler d1 execute 7e0f3e06-b89c-4062-900b-53626c979601 --remote --file=.worker/migrate-rollquest.sql
--
-- Ghi chú:
-- - SQLite không cho ADD COLUMN hai lần với cùng tên -> nếu báo "duplicate column name"
--   thì cột đã tồn tại, bỏ qua dòng đó.
-- - Ngày ở đây là TEXT dạng YYYY-MM-DD giờ Việt Nam (UTC+7), khớp getTodayVN() trong worker.js.
-- ======================================================

ALTER TABLE users ADD COLUMN last_rollquest_date TEXT;
ALTER TABLE users ADD COLUMN rollquest_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN rollquest_rewarded TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN rollquest_scenarios TEXT DEFAULT '';

-- Kiểm tra kết quả (chạy riêng):
--   wrangler d1 execute 7e0f3e06-b89c-4062-900b-53626c979601 --remote \
--     --command "SELECT name FROM pragma_table_info('users') WHERE name LIKE 'rollquest%' OR name = 'last_rollquest_date'"