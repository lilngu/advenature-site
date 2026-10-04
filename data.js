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
    { id: "BLESS_FREE_THUY", name: "+1 CHÚC PHÚC THUỶ TINH LINH", tier: "rare", iconClass: "ico-item-suong", isBuff: false, desc: "GIỌT SƯƠNG ĐIỆU ĐÀ buff Dược Thủy Tăng Lực, mạo hiểm giả được refill không giới hạn Potion Thảo Mộc Hồi HP tại Quầy Bar Tavern Hội Mạo Hiểm." },
    { id: "BLESS_FREE_HOA", name: "+1 CHÚC PHÚC HOẢ TINH LINH", tier: "rare", iconClass: "ico-item-than", isBuff: false, desc: "ĐỐM THAN TINH NGHỊCH thắp lên ngọn lửa niềm vui, mạo hiểm giả được 1 lần quay Gacha nhận vật phẩm tại Phiên Chợ Tinh Linh." },
    { id: "BLESS_FREE_QUANG", name: "+1 CHÚC PHÚC QUANG TINH LINH", tier: "rare", iconClass: "ico-item-thach", isBuff: false, desc: "Thạch Yêu Lúc Lắc buff chỉ số may mắn cho mạo hiểm giả,\n ​X2 Tinh Thạch Thưởng khi làm các Quest Nguyên Tố." },
    { id: "BLESS_FREE_THO", name: "+1 CHÚC PHÚC THỔ TINH LINH", tier: "legendary", iconClass: "ico-item-mam", isBuff: false, desc: "BÉ MẦM CHÚT CHÍT mở ra những góc khuất và truyền thuyết bị phong ấn, kích hoạt 01 Nhiệm vụ ẩn chỉ dành riêng cho người có Chúc Phúc này." },
    // Common (1-12)
    { id: "BLESS_01", name: "1 ống tre", tier: "common", iconClass: "ico-item-01", isBuff: false, desc: "Ống tre rừng nguyên sinh dùng trữ nước hoặc thủ công." },
    { id: "BLESS_02", name: "Nhựa thông", tier: "common", iconClass: "ico-item-02", isBuff: false, desc: "Nhựa thông khô nhóm lửa thắp sáng lều trại ban đêm." },
    { id: "BLESS_03", name: "+1 Điểm Tinh Quang", tier: "common", iconClass: "ico-item-03", isBuff: true, buff: { tq: 1 }, desc: "Hồi phục 1 lượt triệu hồi Gacha Tinh Quang." },
    { id: "BLESS_04", name: "1 mảnh vải ngẫu nhiên", tier: "common", iconClass: "ico-item-04", isBuff: false, desc: "Mảnh vải  mang hoa văn Rừng Tinh Linh." },
    { id: "BLESS_05", name: "1 Gậy gỗ", tier: "common", iconClass: "ico-item-05", isBuff: false, desc: "Gậy gỗ dành cho Nhà Phiêu Lưu tuỳ ý sử dụng." },
    { id: "BLESS_06", name: "2 quả trứng gà", tier: "common", iconClass: "ico-item-06", isBuff: false, desc: "Bổ sung dinh dưỡng cho bữa ăn." },
    { id: "BLESS_07", name: "1 quả bắp", tier: "common", iconClass: "ico-item-07", isBuff: false, desc: "Nướng bên bếp than hồng cùng các nhà phiêu lưu." },
    { id: "BLESS_08", name: "+1 Điểm Cống Hiến", tier: "common", iconClass: "ico-item-08", isBuff: true, buff: { ch: 1 }, desc: "Tăng cống hiến để thăng bậc Thẻ Phiêu Lưu." },
    { id: "BLESS_09", name: "+2 Điểm Cống Hiến", tier: "common", iconClass: "ico-item-09", isBuff: true, buff: { ch: 2 }, desc: "Tăng 2 điểm cống hiến cho Nhà Phiêu Lưu." },
    { id: "BLESS_10", name: "1 Ly Trà Thảo Mộc", tier: "common", iconClass: "ico-item-10", isBuff: false, desc: "Ly trà thơm mát ngắm bình minh bên bờ suối." },
    { id: "BLESS_11", name: "1 Củ khoai lang", tier: "common", iconClass: "ico-item-11", isBuff: false, desc: "Khoai mật nướng tro bếp thưởng thức trong đêm lạnh." },
    { id: "BLESS_12", name: "Thẻ thêm thịt nướng", tier: "common", iconClass: "ico-item-12", isBuff: false, desc: "Thêm 1 phần thịt nướng tại bữa tiệc BBQ đêm." },
    // Uncommon (13-21)
    { id: "BLESS_13", name: "1 Bình Potion", tier: "uncommon", iconClass: "ico-item-13", isBuff: false, desc: "Nước tăng lực thảo mộc tiếp sức đi rừng." },
    { id: "BLESS_14", name: "1 Ly Cocktail Tavern", tier: "uncommon", iconClass: "ico-item-14", isBuff: false, desc: "Đổi đồ uống pha chế tại quầy Tavern Rừng Già." },
    { id: "BLESS_15", name: "Thẻ X2 Tinh Thạch Quest", tier: "uncommon", iconClass: "ico-item-15", isBuff: false, desc: "Nhân đôi phần thưởng Tinh Thạch từ Main Quest." },
    { id: "BLESS_16", name: "Thẻ Thuê Áo Choàng Free", tier: "uncommon", iconClass: "ico-item-16", isBuff: false, desc: "Mượn áo choàng pháp sư check-in miễn phí trong ngày." },
    { id: "BLESS_17", name: "Thẻ Trợ Thủ NPC", tier: "uncommon", iconClass: "ico-item-17", isBuff: false, desc: "Hỏi NPC Ranger 1 câu gợi ý giải mật mã Quest." },
    { id: "BLESS_18", name: "+1 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-18", isBuff: false, desc: "Phiếu Tinh Thạch của Hội Ngọc Lục. Đưa mã QR cho NPC quét để đổi lấy Tinh Thạch." },
    { id: "BLESS_19", name: "+2 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-19", isBuff: false, desc: "Phiếu 2 Viên Tinh Thạch. Đưa mã QR cho NPC quét để đổi lấy 2x Tinh Thạch." },
    { id: "BLESS_20", name: "Thẻ mượn Đạo cụ Quest", tier: "uncommon", iconClass: "ico-item-20", isBuff: false, desc: "Mượn 1 đạo cụ hỗ trợ Quest bất kì. Ví dụ Ống nhóm đêm, Kính lặn,..." },
    { id: "BLESS_21", name: "Thẻ Mượn Đèn Bão Đêm", tier: "uncommon", iconClass: "ico-item-21", isBuff: false, desc: "Trang bị đèn bão lung linh cho buổi dạo đêm." },
    // Rare (22-27)
    { id: "BLESS_22", name: "Huy Hiệu Phiêu Lưu Xanh", tier: "rare", iconClass: "ico-item-22", isBuff: false, desc: "Huy hiệu Gỗ độc bản chứng nhận thành viên Hội." },
    { id: "BLESS_23", name: "Thẻ Dịch Chuyển", tier: "rare", iconClass: "ico-item-23", isBuff: false, desc: "Buff miễn phí chuyến xe đưa đón." },
    { id: "BLESS_24", name: "Thẻ Gacha Phiên Chợ", tier: "rare", iconClass: "ico-item-24", isBuff: false, desc: "1 vé quay 100% trúng quà tại Phiên Chợ Tinh Linh." },
    { id: "BLESS_25", name: "Dây chuyền Tinh Linh", tier: "rare", iconClass: "ico-item-25", isBuff: false, desc: "Vật phẩm đính đá khoáng thạch thiên nhiên." },
    { id: "BLESS_26", name: "Món Quà Bí Mật Tinh Linh", tier: "rare", iconClass: "ico-item-26", isBuff: false, desc: "Hộp quà bất ngờ do Trưởng quán Hội Ngọc Lục trao tặng." },
    { id: "BLESS_27", name: "Thẻ bài Tinh Linh Rừng", tier: "rare", iconClass: "ico-item-27", isBuff: false, desc: "Thẻ bài Tinh Linh đặc biệt mở khóa đặc quyền thực địa." },
    // Legendary (28-30)
    { id: "BLESS_28", name: "Thẻ Nâng Cấp Phòng Riêng", tier: "legendary", iconClass: "ico-item-28", isBuff: false, desc: "Nâng cấp lều trại lên phòng riêng Lữ Quán cao cấp." },
    { id: "BLESS_29", name: "Thẻ Lưu Trú Miễn Phí", tier: "legendary", iconClass: "ico-item-29", isBuff: false, desc: "01 đêm nghỉ dưỡng hoàn toàn miễn phí tại Rừng." },
    { id: "BLESS_30", name: "Trang Bị Nhà Phiêu Lưu", tier: "legendary", iconClass: "ico-item-30", isBuff: false, desc: "Bộ ba lô, Hood chuyên dụng cho Nhà Phiêu Lưu." }
];

// 4. DANH MỤC 12 SẢN PHẨM SHOP LỮ HÀNH
export const SHOP_ITEMS = [
    { id: "PKG_1", name: "📜 PHIÊU LƯU TẬP SỰ", tt: 35, vnd: 850000, iconClass: "ico-pkg1", desc: " Bao gồm Lưu trú + Lương Thực 3 Bữa \n +1 Quest Quang Tinh \n + 🚙Buff dịch chuyển \n Áp dụng Chúc Phúc Tinh Linh 🍀 \n\n ⚠️ Lưu ý: Việc chỉ hoàn thành 1 Nhiệm Vụ Nguyên Tố sẽ khiến 60% bí mật còn lại tại Rừng Tinh Linh bị phong ấn. \n Nâng cấp Góp Phiêu Lưu Trọn Vẹn để mở khoá 100% cốt truyện hoặc để dành cho những kỳ phiêu lưu sau. " },
    { id: "PKG_2", name: "🍃 PHIÊU LƯU TRỌN VẸN", tt: 60, vnd: 1500000, iconClass: "ico-pkg2", desc: " Bao gồm Lưu trú + Lương Thực 3 Bữa \n + Tất cả 3 Quest Nguyên Tố \n +🚙 Buff dịch chuyển toàn hành trình \n + 1 Mystery Box Trang bị Cơ bản \n Áp dụng Chúc Phúc Tinh Linh🍀" },
    { id: "PKG_3", name: "👑 PHIÊU LƯU NÂNG CẤP", tt: 80, vnd: 2000000, iconClass: "ico-pkg3", desc: " Bao gồm Lưu trú + Lương Thực 3 Bữa \n + Tất cả 3 Quest Nguyên Tố \n +🚙 Buff dịch chuyển toàn hành trình \n + 1 Mystery Box Trang bị Cơ bản \n +1 Món quà từ Tinh Linh Rừng \n +1 Thẻ bài Tinh Linh ngẫu nhiên.\n +Túi 10 Tinh Thạch  \n Áp dụng Chúc Phúc Tinh Linh🍀" },
    { id: "PKG_4", name: "⛺ Lưu Trú 1 Đêm", tt: 12, vnd: 300000, iconClass: "ico-pkg4", desc: " 🚙 Buff dịch chuyển từ Điểm Tập Kết\n⛺ 01 Đêm Lưu Trú Lều Trại hoặc Dorm \n 🏚️ Sử dụng tự do Tavern Emerald Guild \n 🌿 Đã bao gồm bộ đệm ấm & túi ngủ." },
    { id: "Q_1", name: "🌬️ Quest 1: Phong Tinh", tt: 10, vnd: 250000, iconClass: "ico-quest2", desc: "🚙 Buff dịch chuyển đến Đồi Cỏ Lang Thang\n 📜 Nhiệm Vụ Lá Thư Rừng Tập Sự \🔮 Nhận thưởng Tinh Thạch" },
    { id: "Q_2", name: "✨ Quest 2: Quang Tinh", tt: 10, vnd: 250000, iconClass: "ico-quest1", desc: "🚙 Buff dịch chuyển đến Suối Thì Thầm Rì Rầm \n📜 Nhiệm Vụ Thạch Yêu Lúc Lắc.\n 🔮 Nhận thưởng Tinh Thạch " },
    { id: "Q_3", name: "🔥 Quest 3: Hỏa Tinh", tt: 10, vnd: 250000, iconClass: "ico-quest3", desc: "📜 Nhiệm Vụ Đốm Than Tinh Nghịch \n🔥 Nhận thưởng Tinh Thạch " },
    { id: "PKG_5", name: "🕋 Mystery Box", tt: 10, vnd: 250000, iconClass: "ico-pkg5", desc: "Hộp Vật Phẩm\n Trang bị cơ bản cho Nhà Phiêu Lưu" },
    { id: "PKG_6", name: "🔁 Buff Di Chuyển ", tt: 12, vnd: 300000, iconClass: "ico-pkg6", desc: "Buff Di chuyển Quảng Trường ⇄ Rừng Tinh Linh bằng xe chuyên dụng." },
    { id: "F_1", name: "🍢  Bữa Tối BBQ", tt: 6, vnd: 150000, iconClass: "ico-food1", desc: "Bữa thịt nướng thơm lừng bên ánh lửa trại ấm cúng." },
    { id: "F_2", name: "🥪Bữa Sáng Bên Suối", tt: 6, vnd: 150000, iconClass: "ico-food2", desc: "​🥪 Buff dịch chuyển đến Suối Thì Thầm. \n 01 Suất Bữa Sáng bên Bờ Suối.\n 🌿 Có thể ngâm mình trong suối lạnh giữa rừng" },
    { id: "F_3", name: "🍱 Bữa Trưa Tại Phiên Chợ ", tt: 2, vnd: 50000, iconClass: "ico-food3", desc: "​🍱 01 Suất Bữa Trưa tại Phiên Chợ Tinh Linh nhập vai vui vẻ." }
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
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016552/brochure/01_ezxnjr.png"
    },
    {
        id: 2,
        title: "Trang 2",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016556/brochure/02_qn5qou.png"
    },
    {
        id: 3,
        title: "Trang 3",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016551/brochure/03_b8qk0q.png"
    },
    {
        id: 4,
        title: "Trang 4",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016550/brochure/04_jyj6vq.png"
    },
    {
        id: 5,
        title: "Trang 5",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016549/brochure/05_rtnkwl.png"
    },
    {
        id: 6,
        title: "Trang 6",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016554/brochure/06_ixpf5w.png"
    },
    {
        id: 7,
        title: "Trang 7",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016553/brochure/07_orperc.png"
    },
    {
        id: 8,
        title: "Trang 8",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016551/brochure/08_pmblc3.png"
    },
    {
        id: 9,
        title: "Trang 9",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016550/brochure/09_qrmba1.png"
    },
    {
        id: 10,
        title: "Trang 10",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016549/brochure/10_t1wq9s.png"
    },
    {
        id: 11,
        title: "Trang 11",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016549/brochure/11_z2k7j7.png"
    },
    {
        id: 12,
        title: "Trang 12",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791016555/brochure/12_jhp1b5.png"
    },
    {
        id: 13,
        title: "Trang 13",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1790677740/d3l55mbk4c1cganfkipx.png"
    }
 ];

// 7. HƯỚNG DẪN TINH THỦ - DANH SÁCH TRANG (GUIDE READER - 2 trang lật)
export const GUIDE_PAGES_DATA = [
    {
        id: 1,
        title: "Trang 1: Chào Mừng NHÀ PHIÊU LƯU",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1790719275/u0nu9m4xfcnee1s8xrc0.png"
    },
    {
        id: 2,
        title: "Trang 2: Cơ Chế Gacha",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1790669761/mfrd4ibq5xardaop7z8e.png"
    }
];

// 8. ẢNH MINH HOẠ TRONG MODAL (dễ thay thế link ảnh, không cần sửa index.html)
// Key khớp với thuộc tính data-modal-img của thẻ <img> trong index.html
export const MODAL_IMAGES = {
    guild: "https://res.cloudinary.com/aurorawoods/image/upload/t_mediumWebP/v1790827628/w5dozhrgqqckohqmkcyl.png",
    ranger: "https://res.cloudinary.com/aurorawoods/image/upload/t_mediumWebP/v1790827630/zggrd1qbokfgyar2gt8x.png"
};

// 9. MANIFEST AUDIO (BGM NỀN + SFX) - NGUỒN KHAI BÁO DUY NHẤT
// Toàn bộ thẻ <audio> đã được dựng động từ manifest này (xem sfx.js -> mountAudioElements),
// nên index.html không còn thẻ <audio> nào. Đổi/thêm file âm thanh chỉ sửa tại đây.
// - key: tên dùng trong sfx.js (playSfx('gacha'), playQuestBGM()...)
// - id : DOM id của <audio>, giữ nguyên tên cũ để không phá code đang truy vấn theo id
// - src: link file trên Cloudinary
// - type / loop / preload: thuộc tính phát của phần tử audio
export const AUDIO_SOURCES = [
    // Nhạc nền chính của trang (loop) - app.js điều khiển qua #bgmAudio
    { key: "bgm", id: "bgmAudio", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790791766/audio/bgm1_fxdgnd.mp3", type: "audio/mpeg", loop: true, preload: "auto" },
    // 1. Gacha chạy
    { key: "gacha", id: "sfxGacha", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790856083/audio/gacha-c_awgxcd.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 2. Guest helper xuất hiện
    { key: "teleport", id: "sfxTeleport", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949228/audio/teleport_y4pthd.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 3. Mở túi vật phẩm
    { key: "blanket", id: "sfxBlanket", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790854823/audio/blanket_uew73u.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 4. Click tab Quang Thạch trong Túi vật phẩm
    { key: "blink", id: "sfxBlink", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790854823/audio/blink_avuroa.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 5. Mở Guild Modal
    { key: "guild", id: "sfxGuild", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790856555/audio/guild-c_r9rgy1.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 6. Nhạc nền nhiệm vụ Roll Quest (loop riêng, tắt khi thoát quest)
    { key: "questBgm", id: "sfxQuestBGM", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790855653/audio/game-bgm-c_re26za.mp3", type: "audio/mpeg", loop: true, preload: "auto" },
    // 7. Nhận được vật phẩm / chúc phúc
    { key: "blessing", id: "sfxBlessing", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949230/audio/blessing_mctoas.mp3", type: "audio/webm", loop: false, preload: "auto" },
    // 8. Click tab "Vật Phẩm" trong Túi vật phẩm (tiếng mở hòm gỗ)
    { key: "woodbox", id: "sfxWoodbox", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949232/audio/woodbox_vtde46.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 9. Click Tinh Linh hướng dẫn / Cổ thư / nút Nhiệm vụ / Hồ Sơ (tiếng lật giấy)
    { key: "paper", id: "sfxPaper", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949228/audio/paper-turn_cxfu5m.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 10. Click Ranger / nút Cửa hàng Phiên Chợ (tiếng chuông)
    { key: "bell", id: "sfxBell", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949230/audio/bell_nqzh7k.mp3", type: "audio/mpeg", loop: false, preload: "auto" },
    // 11. Click nút Thanh Toán trong giỏ hàng Phiên Chợ (tiếng xu)
    { key: "coin", id: "sfxCoin", src: "https://res.cloudinary.com/aurorawoods/video/upload/v1790949231/audio/coin_bt2mid.mp3", type: "audio/mpeg", loop: false, preload: "auto" }
];

// Tra cứu nhanh: key -> cấu hình audio (dựng 1 lần lúc load module)
export const AUDIO_MAP = Object.fromEntries(AUDIO_SOURCES.map((a) => [a.key, a]));

// 10. BẢNG QUEST TẠI HỘI NGỌC LỤC (mở bằng cách click vào #loreHelper)
// Modal #guildQuestModal tự bố trí ảnh thành lưới 2 cột rời rạc, mỗi tờ nghiêng
// ngẫu nhiên (tối đa GUILD_QUEST_META.maxTiltDeg độ) và click vào để xem lightbox.
//
// ➜ THÊM / BỎ ẢNH: chỉ cần thêm hoặc xoá một dòng { url, title } bên dưới.
//   app.js tự layout lại, không cần sửa bất kỳ file nào khác.
//   Các mục đánh dấu [placeholder] đang dùng lại ảnh sẵn có của dự án để dựng
//   lưới thử — thay bằng ảnh quest thật của Hội Ngọc Lục khi được bàn giao.
export const GUILD_QUEST_DATA = [
    {
        id: 1,
        title: "NGÀY HỘI TRIỆU HỒI",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791123365/opcjvaqecr1z1lsxgigc.png"
    },
    {
        id: 2,
        title: "Quest I · Thương Hội",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791046797/ukoqthjxzapum1snkxwg.png"
    },
    // --- [placeholder] Ảnh dựng lưới, thay bằng quest thật khi có ---
     {
        id: 3,
        title: "Quest II · Hội Ngọc Lục",
        url: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791043557/l2gwcmzyz050izqlfye3.png"
    }
];

// Cấu hình bảng Quest: tiêu đề, ảnh nền modal và giới hạn độ nghiêng tối đa (độ).
// maxTiltDeg là con số quyết định độ nghiêng tối đa của mỗi tờ ảnh (hiện 30 độ).
// Tăng/giảm ở đây là đủ, app.js tự đọc. Trần an toàn cứng ở app.js vẫn là 70 độ.
export const GUILD_QUEST_META = {
    title: "BẢNG NHIỆM VỤ HỘI NGỌC LỤC",
    background: "https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791043559/rgaguy1x4tqh7atwi663.png",
    maxTiltDeg: 30,
    emptyText: "Hội Ngọc Lục đang sắp xếp các tờ Quest…"
};

// 11. MODAL "CHỜ MỞ KHOÁ" - DANH SÁCH KHU VỰC ĐANG PHÁT TRIỂN
// Thêm / sửa / bỏ mục ngay tại đây, giao diện tự động cập nhật theo.
// - icon: emoji hiển thị bên trái (bỏ trống nếu không muốn dùng)
// - name: tên khu vực (IN HOA)
// - desc: mô tả ngắn
export const UPCOMING_FEATURES_DATA = {
    title: "CHỜ MỞ KHOÁ",
    subtitle: "Các khu vực mới đang được Rừng Tinh Linh gia cố, sắp xuất hiện!",
    note: "✧ Hãy cùng chờ nhé! ✧",
    items: [
        { icon: "🏰", name: "GUILD HALL", desc: "nơi Nhà phiêu lưu họp hội giao lưu." },
        { icon: "🏆", name: "LEADERBOARD", desc: "Bảng danh sách top những Nhà phiêu lưu TOP Cống Hiến." },
        { icon: "💎", name: "QUANG THẠCH RANK", desc: "Bảng danh sách top Nhà Phiêu Lưu sưu tầm Quang Thạch." },
        { icon: "🌿", name: "KHU VƯỜN TINH LINH", desc: "nơi nhà phiêu lưu chill chăm sóc Tinh Linh và trồng Linh Thảo." }
    ]
};