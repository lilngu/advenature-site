-- 003: Shop products (DB động cho SHOP_ITEMS) + stock theo dõi
-- stock = -1  → không giới hạn; stock >= 0 → số lượng còn lại
CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tt INTEGER DEFAULT 0,
  vnd INTEGER DEFAULT 0,
  icon_class TEXT DEFAULT '',
  description TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  stock INTEGER DEFAULT -1,
  sort_order INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed từ data.js hiện tại (giữ nguyên id để tương thích package_type cũ)
INSERT OR IGNORE INTO shop_products (id, name, tt, vnd, icon_class, description, active, stock, sort_order) VALUES
('PKG_1', '🎪VÉ THAM GIA LARP - CAMP', 14, 350000, 'ico-pkg1', 'Bao gồm 1 lều gỗ lưu trú dành cho tối đa 2 mạo hiểm giả. (có thể bày hàng trước lều) Hỗ trợ vật liệu tự nhiên decor. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.', 1, -1, 1),
('PKG_2', '🛏️VÉ THAM GIA LARP - DORM', 8, 200000, 'ico-pkg2', '1 bộ nệm/chăn/gối tại phòng tập thể dành cho 1 mạo hiểm giả. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.', 1, -1, 2),
('PKG_3', '🏡VÉ THAM GIA LARP - LỮ QUÁN', 16, 450000, 'ico-pkg3', '1 phòng riêng dành cho 2 mạo hiểm giả. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội. Chỉ có 2 suất dành cho Mạo hiểm giả đăng ký trước.', 1, 2, 3),
('PKG_4', '🎫VÉ THUÊ KIOSK', 6, 150000, 'ico-pkg4', 'Dành cho thương nhân chỉ tham gia Phiên Chợ sáng Chủ Nhật, không lưu trú ngày thứ 7.', 1, -1, 4),
('Q_1', '🌬️ Quest Viễn Chinh Phong Tinh', 10, 250000, 'ico-quest2', 'Buff dịch chuyển đến nơi làm Quest Đồi Cỏ Lang Thang. Nhận thưởng Tinh Thạch.', 1, -1, 5),
('Q_2', '✨ Quest Viễn Chinh Quang Tinh', 10, 250000, 'ico-quest1', 'Buff dịch chuyển đến nơi làm Quest Suối Thì Thầm Rì Rầm. Nhận thưởng Tinh Thạch.', 1, -1, 6),
('PKG_5', '🕋 Mystery Box', 10, 250000, 'ico-pkg5', 'Hộp Vật Phẩm. Trang bị cơ bản cho Nhà Phiêu Lưu.', 1, -1, 7),
('PKG_6', '🚙BUFF XE DỊCH CHUYỂN', 12, 300000, 'ico-pkg6', 'Buff hỗ trợ dịch chuyển 2 chiều: Quảng Trường Bảo Lộc ↔ Rừng Tinh Linh.', 1, -1, 8),
('F_1', '🧙🏾THỰC ĐƠN TỐI TAVERN', 6, 150000, 'ico-food1', 'Thịt nướng lửa trại hoặc Nai hầm hiệp sĩ. Potion thảo mộc. Salad nhân phẩm.', 1, -1, 9);
