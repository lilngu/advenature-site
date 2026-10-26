-- 005: Mô tả shop nhiều dòng (xuống dòng bằng newline thật trong DB)
-- Frontend render .shop-modal-desc với white-space: pre-line → newline = xuống dòng.
-- LƯU Ý: data.js chỉ là fallback; site đang đọc /api/shop-products từ D1.
-- Chỉ UPDATE khi description vẫn đúng y như seed 003 cũ → không ghi đè nội dung
-- anh/chị đã sửa tay trong Admin. Hàng nào không khớp WHERE thì giữ nguyên.
-- Chạy: npm run d1:migrate:remote

UPDATE shop_products SET description =
'Bao gồm 1 lều gỗ lưu trú dành cho tối đa 2 mạo hiểm giả.
(có thể bày hàng trước lều)
Hỗ trợ vật liệu tự nhiên decor
Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.'
WHERE id = 'PKG_1' AND description = 'Bao gồm 1 lều gỗ lưu trú dành cho tối đa 2 mạo hiểm giả. (có thể bày hàng trước lều) Hỗ trợ vật liệu tự nhiên decor. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.';

UPDATE shop_products SET description =
'1 bộ nệm/chăn/gối tại phòng tập thể dành cho 1 mạo hiểm giả.
Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.'
WHERE id = 'PKG_2' AND description = '1 bộ nệm/chăn/gối tại phòng tập thể dành cho 1 mạo hiểm giả. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội.';

UPDATE shop_products SET description =
'1 phòng riêng dành cho 2 mạo hiểm giả.
Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội
Chỉ có 2 suất dành cho Mạo hiểm giả đăng ký trước.'
WHERE id = 'PKG_3' AND description = '1 phòng riêng dành cho 2 mạo hiểm giả. Tuỳ chọn tham gia Quest nhận thưởng tinh thạch tại Hội. Chỉ có 2 suất dành cho Mạo hiểm giả đăng ký trước.';

UPDATE shop_products SET description =
'🚙 Buff dịch chuyển đến nơi làm 📜 Quest Đồi Cỏ Lang Thang
🔮 Nhận thưởng Tinh Thạch'
WHERE id = 'Q_1' AND description = 'Buff dịch chuyển đến nơi làm Quest Đồi Cỏ Lang Thang. Nhận thưởng Tinh Thạch.';

UPDATE shop_products SET description =
'🚙 Buff dịch chuyển đến nơi làm 📜 Quest Suối Thì Thầm Rì Rầm
🔮 Nhận thưởng Tinh Thạch'
WHERE id = 'Q_2' AND description = 'Buff dịch chuyển đến nơi làm Quest Suối Thì Thầm Rì Rầm. Nhận thưởng Tinh Thạch.';

UPDATE shop_products SET description =
'Hộp Vật Phẩm
Trang bị cơ bản cho Nhà Phiêu Lưu'
WHERE id = 'PKG_5' AND description = 'Hộp Vật Phẩm. Trang bị cơ bản cho Nhà Phiêu Lưu.';

UPDATE shop_products SET description =
'🚙BUFF hỗ trợ dịch chuyển 2 chiều:
Quảng Trường Bảo Lộc ↔ Rừng Tinh Linh.'
WHERE id = 'PKG_6' AND description = 'Buff hỗ trợ dịch chuyển 2 chiều: Quảng Trường Bảo Lộc ↔ Rừng Tinh Linh.';

UPDATE shop_products SET description =
'🍖 THỊT NƯỚNG LỬA TRẠI HOẶC 🍛 NAI HẦM HIỆP SĨ
🍶 POTION THẢO MỘC
🥗 SALAD NHÂN PHẨM ❔'
WHERE id = 'F_1' AND description = 'Thịt nướng lửa trại hoặc Nai hầm hiệp sĩ. Potion thảo mộc. Salad nhân phẩm.';

-- PKG_4 vốn 1 câu ngắn, không cần xuống dòng → giữ nguyên.
