// ======================================================
// ADVENATURE - KHO DỮ LIỆU LUẬT GAME TĨNH (MASTER CONFIG)
// Tách biệt hoàn toàn để giữ code app.js siêu nhẹ
// ======================================================

// 1. 30 BẢNG MÀU KHOÁNG THẠCH TINH QUANG (6 HỆ NGUYÊN TỐ)
export const CRYSTAL_PALETTES = [
    // 🔥 HỎA DIỆM & HUYẾT TINH
    { sys: "♦️", sysKey: "fire", sysIndex: 1, name: "Huyết Ngọc Ruby", color: 0xd90429, emissive: 0x9b001a },
    { sys: "💗", sysKey: "fire", sysIndex: 2, name: "Thạch Anh Hồng", color: 0xff758f, emissive: 0xc9184a },
    { sys: "🔥", sysKey: "fire", sysIndex: 3, name: "San Hô Lửa", color: 0xff4d6d, emissive: 0xa4133c },
    { sys: "🌋", sysKey: "fire", sysIndex: 4, name: "Nham Thạch Hỏa Diệm", color: 0xff2a00, emissive: 0x8a0000 },
    { sys: "🐲", sysKey: "fire", sysIndex: 5, name: "Máu Rồng Garnet", color: 0x800f2f, emissive: 0x4a0011 },
    // ☀️ THÁI DƯƠNG & HOÀNG KIM
    { sys: "☀️", sysKey: "sun", sysIndex: 1, name: "Hổ Phách Mặt Trời", color: 0xff8800, emissive: 0xcc5500 },
    { sys: "⚜️", sysKey: "sun", sysIndex: 2, name: "Hoàng Kim Đế Vương", color: 0xffb703, emissive: 0xd48b00 },
    { sys: "🌕", sysKey: "sun", sysIndex: 3, name: "Tinh Thể Thái Dương", color: 0xffd000, emissive: 0xe67e00 },
    { sys: "🔶", sysKey: "sun", sysIndex: 4, name: "Đồng Đỏ Cổ Đại", color: 0xcd6e4e, emissive: 0x8c3a1e },
    { sys: "🟡", sysKey: "sun", sysIndex: 5, name: "Hoàng Thạch Topaz", color: 0xffa200, emissive: 0xcc6600 },
    // 🌿 THẢO MỘC & PHONG MA
    { sys: "❇️", sysKey: "wood", sysIndex: 1, name: "Ngọc Lục Bảo Emerald", color: 0x10b981, emissive: 0x047857 },
    { sys: "🍃", sysKey: "wood", sysIndex: 2, name: "Băng Lục Bạc Hà", color: 0x2ec4b6, emissive: 0x008080 },
    { sys: "🌲", sysKey: "wood", sysIndex: 3, name: "Rừng Thần Malachite", color: 0x2d6a4f, emissive: 0x1b4332 },
    { sys: "🧪", sysKey: "wood", sysIndex: 4, name: "Dạ Quang Độc Dược", color: 0x70e000, emissive: 0x38b000 },
    { sys: "🟢", sysKey: "wood", sysIndex: 5, name: "Ngọc Bích Phong Ma", color: 0x52b788, emissive: 0x1b7a4e },
    // ❄️ BĂNG TINH & HẢI DƯƠNG
    { sys: "💠", sysKey: "ice", sysIndex: 1, name: "Hải Lam Ngọc Aquamarine", color: 0x4cc9f0, emissive: 0x0077b6 },
    { sys: "🧊", sysKey: "ice", sysIndex: 2, name: "Băng Tinh Bắc Cực", color: 0xa0c4ff, emissive: 0x0096c7 },
    { sys: "🧿", sysKey: "ice", sysIndex: 3, name: "Lam Tinh Thần Tú", color: 0x00f5d4, emissive: 0x00bbf9 },
    { sys: "🌫️", sysKey: "ice", sysIndex: 4, name: "Sương Lam Huyền Ảo", color: 0xbde0fe, emissive: 0x48cae4 },
    { sys: "🐳", sysKey: "ice", sysIndex: 5, name: "Vực Sâu Biển Cả", color: 0x006d77, emissive: 0x004953 },
    // ⚡ THIÊN HÀ & THẦN ĐIỆN
    { sys: "🔹", sysKey: "lightning", sysIndex: 1, name: "Lam Bảo Sapphire", color: 0x2b4c7e, emissive: 0x132a4a },
    { sys: "🟪", sysKey: "lightning", sysIndex: 2, name: "Dạ Khúc Indigo", color: 0x3a0ca3, emissive: 0x1e0363 },
    { sys: "⚡", sysKey: "lightning", sysIndex: 3, name: "Bão Điện Thiên Không", color: 0x4361ee, emissive: 0x1a33b0 },
    { sys: "🌀", sysKey: "lightning", sysIndex: 4, name: "Thanh Lam Cổ Thần", color: 0x1d3557, emissive: 0x457b9d },
    { sys: "🕳️", sysKey: "lightning", sysIndex: 5, name: "Tử Lam Hư Vô", color: 0x3f37c9, emissive: 0x241d99 },
    // 🔮 MA PHÁP & TINH VÂN
    { sys: "🔮", sysKey: "magic", sysIndex: 1, name: "Thạch Anh Tím Amethyst", color: 0x7209b7, emissive: 0x480ca8 },
    { sys: "🌌", sysKey: "magic", sysIndex: 2, name: "Tinh Vân Nebula", color: 0x9d4edd, emissive: 0x5a189a },
    { sys: "🌙", sysKey: "magic", sysIndex: 3, name: "Tử Đằng Nguyệt Tinh", color: 0xc77dff, emissive: 0x7b2cbf },
    { sys: "💫", sysKey: "magic", sysIndex: 4, name: "Cực Quang Tinh Linh", color: 0xf72585, emissive: 0x7209b7 },
    { sys: "✨", sysKey: "magic", sysIndex: 5, name: "Hồng Ma Pháp Opal", color: 0xff007f, emissive: 0x99004d }
];

// 2. 11 BẬC SỐ MẶT & 3 PHOM DÁNG HÌNH THÁI
export const FACE_TIERS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

export const SHAPE_STYLES = [
    { id: 1, name: "Trụ Quang", rx: [0.8, 1.2], ry: [1.8, 2.5], rz: [0.8, 1.2] },
    { id: 2, name: "Cự Quang",     rx: [1.2, 1.6], ry: [1.2, 1.6], rz: [1.2, 1.6] },
    { id: 3, name: "Phiến Quang",  rx: [1.5, 2.0], ry: [1.2, 1.7], rz: [0.6, 0.9] }
];

// 3. DANH MỤC 30 CHÚC PHÚC TINH LINH
export const BLESSINGS_DATA = [
     // ✦ 4 Chúc Phúc Free Tân Thủ (Đồng bộ với worker.js)
    { id: "BLESS_FREE_TEA", name: "+1 CHÚC PHÚC TINH LINH: Trà Thảo Mộc", tier: "common", iconClass: "ico-item-10", isBuff: false, desc: "Nhận tách trà Thảo Mộc ấm trong không khí se lạnh của Rừng Tinh Linh." },
    { id: "BLESS_FREE_BREAKFAST", name: "+1 CHÚC PHÚC TINH LINH: Thẻ Bữa Sáng Bên Suối", tier: "common", iconClass: "ico-food", isBuff: false, desc: "Phiếu ăn sáng tiêu chuẩn bên suối tự nhiên Rừng Tinh Linh." },
    { id: "BLESS_FREE_BBQ", name: "+1 CHÚC PHÚC TINH LINH: Vé BBQ Đêm Tinh Nghịch", tier: "common", iconClass: "ico-item-12", isBuff: false, desc: "Thêm 01 phần thịt nướng cao cấp bên bếp lửa hồng Hội Ngọc Lục." },
    { id: "BLESS_FREE_GACHA", name: "+1 CHÚC PHÚC TINH LINH: Vé Gacha Phiên Chợ", tier: "rare", iconClass: "ico-item-24", isBuff: false, desc: "01 lượt quay may mắn 100% trúng quà độc bản tại Phiên Chợ Tinh Linh." },
    // Common (1-12)
    { id: "BLESS_01", name: "1 ống tre", tier: "common", iconClass: "ico-item-01", isBuff: false, desc: "Ống tre rừng nguyên sinh dùng trữ nước hoặc thủ công." },
    { id: "BLESS_02", name: "Nhựa thông", tier: "common", iconClass: "ico-item-02", isBuff: false, desc: "Nhựa thông khô nhóm lửa thắp sáng lều trại ban đêm." },
    { id: "BLESS_03", name: "+1 Điểm Tinh Quang", tier: "common", iconClass: "ico-item-03", isBuff: true, buff: { tq: 1 }, desc: "Hồi phục 1 lượt triệu hồi Gacha Tinh Quang." },
    { id: "BLESS_04", name: "1 mảnh vải ngẫu nhiên", tier: "common", iconClass: "ico-item-04", isBuff: false, desc: "Mảnh vải dệt thủ công mang hoa văn Rừng Tinh Linh." },
    { id: "BLESS_05", name: "1 Gậy gỗ", tier: "common", iconClass: "ico-item-05", isBuff: false, desc: "Gậy leo núi trợ lực cho hành trình thám hiểm rừng." },
    { id: "BLESS_06", name: "2 quả trứng gà", tier: "common", iconClass: "ico-item-06", isBuff: false, desc: "Bổ sung dinh dưỡng cho bữa ăn dã ngoại ngoài trời." },
    { id: "BLESS_07", name: "1 quả bắp", tier: "common", iconClass: "ico-item-07", isBuff: false, desc: "Nướng bên bếp than hồng cùng các nhà phiêu lưu." },
    { id: "BLESS_08", name: "+1 Điểm Cống Hiến", tier: "common", iconClass: "ico-item-08", isBuff: true, buff: { ch: 1 }, desc: "Tăng cống hiến để thăng bậc Căn Cước Phiêu Lưu." },
    { id: "BLESS_09", name: "+2 Điểm Cống Hiến", tier: "common", iconClass: "ico-item-09", isBuff: true, buff: { ch: 2 }, desc: "Tăng 2 điểm cống hiến cho Bang Hội." },
    { id: "BLESS_10", name: "1 Ly Trà Thảo Mộc", tier: "common", iconClass: "ico-item-10", isBuff: false, desc: "Ly trà thơm mát ngắm bình minh bên bờ suối." },
    { id: "BLESS_11", name: "1 Củ khoai lang", tier: "common", iconClass: "ico-item-11", isBuff: false, desc: "Khoai mật nướng tro bếp thưởng thức trong đêm lạnh." },
    { id: "BLESS_12", name: "Thẻ thêm thịt nướng", tier: "common", iconClass: "ico-item-12", isBuff: false, desc: "Thêm 1 phần thịt nướng tại bữa tiệc BBQ đêm." },
    // Uncommon (13-21)
    { id: "BLESS_13", name: "1 Bình Potion", tier: "uncommon", iconClass: "ico-item-13", isBuff: false, desc: "Nước tăng lực thảo mộc tiếp sức Ranger đi rừng." },
    { id: "BLESS_14", name: "1 Ly Cocktail Tavern", tier: "uncommon", iconClass: "ico-item-14", isBuff: false, desc: "Đổi đồ uống pha chế tại quầy Tavern Rừng Già." },
    { id: "BLESS_15", name: "Thẻ X2 Tinh Thạch Quest", tier: "uncommon", iconClass: "ico-item-15", isBuff: false, desc: "Nhân đôi phần thưởng Tinh Thạch từ Main Quest." },
    { id: "BLESS_16", name: "Thẻ Thuê Áo Choàng Free", tier: "uncommon", iconClass: "ico-item-16", isBuff: false, desc: "Mượn áo choàng pháp sư check-in miễn phí trong ngày." },
    { id: "BLESS_17", name: "Thẻ Trợ Thủ NPC", tier: "uncommon", iconClass: "ico-item-17", isBuff: false, desc: "Hỏi NPC Ranger 1 câu gợi ý giải mật mã Quest." },
    { id: "BLESS_18", name: "+1 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-18", isBuff: true, buff: { tt: 1 }, desc: "Cộng 1 Tinh Thạch mua dịch vụ hoặc tiện ích." },
    { id: "BLESS_19", name: "+2 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-19", isBuff: true, buff: { tt: 2 }, desc: "Cộng 2 Tinh Thạch vào tài khoản tiêu dùng." },
    { id: "BLESS_20", name: "Thẻ mượn Đạo cụ Quest", tier: "uncommon", iconClass: "ico-item-20", isBuff: false, desc: "Mượn la bàn hoặc ống nhòm khám phá rừng." },
    { id: "BLESS_21", name: "Thẻ Mượn Đèn Bão Đêm", tier: "uncommon", iconClass: "ico-item-21", isBuff: false, desc: "Trang bị đèn bão lung linh cho buổi dạo đêm." },
    // Rare (22-27)
    { id: "BLESS_22", name: "Huy Hiệu Phiêu Lưu Xanh", tier: "rare", iconClass: "ico-item-22", isBuff: false, desc: "Huy hiệu kim loại độc bản chứng nhận thành viên Hội." },
    { id: "BLESS_23", name: "Thẻ Dịch Chuyển", tier: "rare", iconClass: "ico-item-23", isBuff: false, desc: "Buff miễn phí chuyến xe đưa đón Bảo Lộc - Rừng Già." },
    { id: "BLESS_24", name: "Thẻ Gacha Phiên Chợ", tier: "rare", iconClass: "ico-item-24", isBuff: false, desc: "1 vé quay 100% trúng quà tại Phiên Chợ Tinh Linh." },
    { id: "BLESS_25", name: "Dây chuyền Tinh Linh", tier: "rare", iconClass: "ico-item-25", isBuff: false, desc: "Vật phẩm đính đá khoáng thạch thiên nhiên." },
    { id: "BLESS_26", name: "Món Quà Bí Mật Tinh Linh", tier: "rare", iconClass: "ico-item-26", isBuff: false, desc: "Hộp quà bất ngờ do Trưởng quán Hội Ngọc Lục trao tặng." },
    { id: "BLESS_27", name: "Thẻ bài Tinh Linh Rừng", tier: "rare", iconClass: "ico-item-27", isBuff: false, desc: "Thẻ bài ma thuật mở khóa đặc quyền thực địa." },
    // Legendary (28-30)
    { id: "BLESS_28", name: "Thẻ Nâng Cấp Phòng Riêng", tier: "legendary", iconClass: "ico-item-28", isBuff: false, desc: "Nâng cấp lều trại lên phòng riêng Glamping cao cấp." },
    { id: "BLESS_29", name: "Thẻ Lưu Trú Miễn Phí", tier: "legendary", iconClass: "ico-item-29", isBuff: false, desc: "01 đêm nghỉ dưỡng hoàn toàn miễn phí tại Rừng." },
    { id: "BLESS_30", name: "Trang Bị Nhà Phiêu Lưu", tier: "legendary", iconClass: "ico-item-30", isBuff: false, desc: "Bộ ba lô, áo khoác chuyên dụng dã ngoại cao cấp." }
];

// 4. DANH MỤC 12 SẢN PHẨM SHOP LỮ HÀNH
export const SHOP_ITEMS = [
    { id: "PKG_1", name: "📜 Tân Thủ Cày Chay", tt: 30, vnd: 750000, iconClass: "ico-pkg1", desc: " Đêm Lưu Trú Lều/ Dorm.\n 03 Bữa ăn tiêu chuẩn \n Áp dụng Chúc Phúc Tinh Linh \n 1 Nhiệm Vụ Quest tuỳ chọn \n\n ⚠️ Lưu ý: Việc chỉ hoàn thành 1 Nhiệm Vụ Nguyên Tố sẽ khiến 80% bí mật còn lại tại Rừng Tinh Linh bị phong ấn. \n Nâng cấp Góp Phiêu Lưu Trọn Vẹn để mở khoá 100% cốt truyện hoặc để dành cho những kỳ phiêu lưu sau. " },
    { id: "PKG_2", name: "🍃 Phiêu Lưu Trọn Vẹn", tt: 60, vnd: 1500000, iconClass: "ico-pkg2", desc: "01 Mystery Loot Box  (Trang bị cơ bản) \n 1 Đêm Lưu Trú Lều/ Dorm. \n 03 Bữa ăn Tối, Sáng, Trưa. \n Áp dụng Chúc Phúc Tinh Linh \n Tất cả 5 Nhiệm Vụ Quest Chính." },
    { id: "PKG_3", name: "👑 Tân Thủ Nạp Thẻ ", tt: 80, vnd: 2000000, iconClass: "ico-pkg3", desc: "📦 01 Mystery Loot Box  (Trang bị cơ bản) \n ⛺ 1 Đêm Lưu Trú Lều /  Dorm. \n 🥩 03 Bữa ăn Tối, Sáng, Trưa. \n 🎁 Áp dụng Chúc Phúc Tinh Linh \n Tất cả 5 Nhiệm Vụ Quest Chính. \n +1 Huy Hiệu NHÀ PHIÊU LƯU XANH \n +1 Thẻ bài Tinh Linh ngẫu nhiên.\n +Túi 4 Tinh Thạch  \n +1 Lần GACHA Tại Phiên Chợ Tinh Linh." },
    { id: "PKG_4", name: "⛺ Lưu Trú 1 Đêm", tt: 16, vnd: 400000, iconClass: "ico-pkg4", desc: "⛺ 01 Đêm Lưu Trú Lều Trại hoặc Dorm \n 🏚️ Sử dụng tự do Tavern Emerald Guild \n 🌿 Đã bao gồm bộ đệm ấm & túi ngủ." },
    { id: "Q_1", name: "🌬️ Quest Phong Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest2", desc: "📜 Nhiệm Vụ Lá Thư Rừng Tập Sự \n 🍵 Thưởng thức Trà Thảo Mộc trên đồi" },
    { id: "Q_2", name: "✨ Quest Quang Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest1", desc: "📜 Nhiệm Vụ Kích Hoạt Cổng Quang Thạch tại Phiên Chợ Tinh Linh.\n 🔮 Nhận thưởng +1 Tinh Thạch " },
    { id: "Q_3", name: "🔥 Quest Hỏa Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest3", desc: "📜 Nhiệm Vụ Truyền Đuốc Lửa Đêm \n🔥 Kích hoạt Ngọn Lửa Trại Nguyên Tố \nNhận thưởng +1 Tinh Thạch " },
    { id: "Q_4", name: "💧 Quest Thủy Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest4", desc: "​Nhiệm Vụ Thanh Lọc tại Suối Tinh Linh.\n Nhận thưởng +1 Tinh Thạch" },
    { id: "Q_5", name: "🗿 Quest Thổ Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest5", desc: "🪨 Nhiệm Vụ Thạch Yêu Lúc Lắc\n Nhận thưởng +1 Tinh Thạch" },
    { id: "F_1", name: "🍢  Bữa Tối BBQ", tt: 6, vnd: 150000, iconClass: "ico-food1", desc: "Tiệc nướng thịt thơm lừng bên ánh lửa trại ấm cúng." },
    { id: "F_2", name: "🥪Bữa Sáng Bên Suối", tt: 6, vnd: 150000, iconClass: "ico-food2", desc: "​🥪 01 Suất Bữa Sáng bên Bờ Suối Tinh Linh.\n 🌿 Có thể ngâm mình trong suối lạnh giữa rừng" },
    { id: "F_3", name: "🍱 Bữa Trưa Tại Phiên Chợ ", tt: 3, vnd: 75000, iconClass: "ico-food3", desc: "​🍱 01 Suất Bữa Trưa tại Phiên Chợ Tinh Linh nhập vai vui vẻ." }
];

// 5. CÂU HỎI MẬT MÃ RỪNG TINH LINH
export const QUIZ_LIST = [
    { q: "Hội Ngọc Lục nằm ở vùng đất rừng nào?", a: ["Bảo Lộc", "Đà Lạt", "Sa Pa", "Cát Bà"], c: 0 },
    { q: "Biến thể Tinh Quang Thạch có bao nhiêu bậc số mặt?", a: ["11 bậc", "6 bậc", "3 bậc", "30 bậc"], c: 0 },
    { q: "Hệ đá nào đại diện cho Hỏa Diệm & Huyết Tinh?", a: ["🔥 Hệ 1", "☀️ Hệ 2", "❄️ Hệ 4", "⚡ Hệ 5"], c: 0 }
];

// 6. CỔ THƯ LINH THỦ - DANH SÁCH TRANG (LORE READER)
export const LORE_PAGES_DATA = [
    {
        id: 1,
        title: "Trang 1",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_WebP/f_auto/q_auto/2026-09-28_04-00-49_ihqc1e.png"
    },
    {
        id: 2,
        title: "Trang 2",
        url: "https://www.square-enix.com/ffvii/assets/revelation/images/common/KV-mobile_1x.webp"
    }
];

// 7. HƯỚNG DẪN TINH THỦ - DANH SÁCH TRANG (GUIDE READER - 2 trang lật)
export const GUIDE_PAGES_DATA = [
    {
        id: 1,
        title: "Trang 1: Chào Mừng Tinh Thủ",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1790667812/tp7lecfdywmw13mhgr7f.png"
    },
    {
        id: 2,
        title: "Trang 2: Cơ Chế Gacha",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1790669761/mfrd4ibq5xardaop7z8e.png"
    }
];