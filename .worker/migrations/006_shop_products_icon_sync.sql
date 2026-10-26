-- 006: Đồng bộ icon class mới từ CSS (style.css lines 126-177) vào D1 shop_products
-- Thêm sản phẩm mới cho các icon class CSS chưa có trong bảng shop_products:
--   ico-quest3, ico-food2, ico-food3, ico-food4, ico-ticket1, ico-ticket2, ico-ticket3
--
-- LƯU Ý QUAN TRỌNG:
--   • Tên, giá (tt/vnd), mô tả dưới đây là PLACEHOLDER (giá trị mặc định an toàn).
--   • Dùng INSERT OR IGNORE → KHÔNG ghi đè nếu sản phẩm đã tồn tại (bảo vệ dữ liệu admin đã sửa tay).
--   • Sau khi migrate, hãy vào /admin.html → Shop để cập nhật tên/giá/mô tả thực tế cho từng sản phẩm.
--   • Áp dụng: wrangler d1 migrations apply advenature-db --remote --file=.worker/migrations/006_shop_products_icon_sync.sql
--     hoặc: npm run d1:migrate:remote (nếu script đã có sẵn).

INSERT OR IGNORE INTO shop_products (id, name, tt, vnd, icon_class, description, active, stock, sort_order) VALUES
('Q_3', '🌟 Quest Mới (ico-quest3)', 0, 0, 'ico-quest3', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 10),
('F_2', '🍽️ Thực đơn mới (ico-food2)', 0, 0, 'ico-food2', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 11),
('F_3', '🍽️ Thực đơn mới (ico-food3)', 0, 0, 'ico-food3', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 12),
('F_4', '🍽️ Thực đơn mới (ico-food4)', 0, 0, 'ico-food4', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 13),
('T_1', '🎫 Vé mới (ico-ticket1)', 0, 0, 'ico-ticket1', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 14),
('T_2', '🎫 Vé mới (ico-ticket2)', 0, 0, 'ico-ticket2', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 15),
('T_3', '🎫 Vé mới (ico-ticket3)', 0, 0, 'ico-ticket3', 'Sản phẩm mới — vui lòng cập nhật tên, giá và mô tả qua Admin UI.', 1, -1, 16);
