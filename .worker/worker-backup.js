// ======================================================
// CLOUDFLARE WORKER: ADVENATURE BACKEND API (PRODUCTION)
// ======================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

// ======================================================
// 4 CHÚC PHÚC FREE TÂN THỦ CHUẨN XÁC THEO PRD.MD
// ======================================================
const FREE_BLESSINGS = [
  { id: "BLESS_FREE_THUY", name: "+1 CHÚC PHÚC THUỶ TINH LINH", tier: "rare", iconClass: "ico-item-suong", isBuff: false, desc: "GIỌT SƯƠNG ĐIỆU ĐÀ buff Dược Thủy Tăng Lực, mạo hiểm giả được refill không giới hạn Potion Thảo Mộc Hồi HP tại Quầy Bar Tavern Hội Mạo Hiểm." },
  { id: "BLESS_FREE_HOA", name: "+1 CHÚC PHÚC HOẢ TINH LINH", tier: "rare", iconClass: "ico-item-than", desc: "ĐỐM THAN TINH NGHỊCH thắp lên ngọn lửa niềm vui, mạo hiểm giả được 1 lần quay Gacha nhận vật phẩm tại Phiên Chợ Tinh Linh." },
  { id: "BLESS_FREE_QUANG", name: "+1 CHÚC PHÚC QUANG TINH LINH", tier: "rare", iconClass: "ico-item-thach", desc: "Thạch Yêu Lúc Lắc buff chỉ số may mắn cho mạo hiểm giả,\n ​X2 Tinh Thạch Thưởng khi làm các Quest Nguyên Tố." },
  { id: "BLESS_FREE_THO", name: "+1 CHÚC PHÚC THỔ TINH LINH", tier: "legendary", iconClass: "ico-item-mam", desc: "BÉ MẦM CHÚT CHÍT mở ra những góc khuất và truyền thuyết bị phong ấn, kích hoạt 01 Nhiệm vụ ẩn chỉ dành riêng cho người có Chúc Phúc này." }
];

// Danh mục 30 Chúc Phúc Tinh Linh chuẩn theo data.md
// worker.js: Cắt bỏ hoàn toàn desc và iconClass, code ngắn và sạch hơn rất nhiều
const MASTER_BLESSINGS = [
  // Common (62%: roll >= 38)
  { id: "BLESS_01", name: "1 ống tre", tier: "common" },
  { id: "BLESS_02", name: "Nhựa thông", tier: "common" },
  { id: "BLESS_03", name: "+1 Điểm Tinh Quang", tier: "common" },
  { id: "BLESS_04", name: "1 mảnh vải ngẫu nhiên", tier: "common" },
  { id: "BLESS_05", name: "1 Gậy gỗ", tier: "common" },
  { id: "BLESS_06", name: "2 quả trứng gà", tier: "common" },
  { id: "BLESS_07", name: "1 quả bắp", tier: "common" },
  { id: "BLESS_08", name: "+1 Điểm Cống Hiến", tier: "common" },
  { id: "BLESS_09", name: "+2 Điểm Cống Hiến", tier: "common" },
  { id: "BLESS_10", name: "1 Ly Trà Thảo Mộc", tier: "common" },
  { id: "BLESS_11", name: "1 Củ khoai lang", tier: "common" },
  { id: "BLESS_12", name: "Thẻ thêm thịt nướng", tier: "common" },

  // Uncommon (25%: 13 <= roll < 38)
  { id: "BLESS_13", name: "1 Bình Potion", tier: "uncommon" },
  { id: "BLESS_14", name: "1 Ly Cocktail Tavern", tier: "uncommon" },
  { id: "BLESS_15", name: "Thẻ X2 Tinh Thạch Quest", tier: "uncommon" },
  { id: "BLESS_16", name: "Thẻ Thuê Áo Choàng Free", tier: "uncommon" },
  { id: "BLESS_17", name: "Thẻ Trợ Thủ NPC", tier: "uncommon" },
  { id: "BLESS_18", name: "+1 Tinh Thạch", tier: "uncommon" },
  { id: "BLESS_19", name: "+2 Tinh Thạch", tier: "uncommon" },
  { id: "BLESS_20", name: "Thẻ mượn Đạo cụ Quest", tier: "uncommon" },
  { id: "BLESS_21", name: "Thẻ Mượn Đèn Bão Đêm", tier: "uncommon" },

  // Rare (12%: 1 <= roll < 13)
  { id: "BLESS_22", name: "Huy Hiệu Phiêu Lưu Xanh", tier: "rare" },
  { id: "BLESS_23", name: "Thẻ Dịch Chuyển", tier: "rare" },
  { id: "BLESS_24", name: "Thẻ Gacha Phiên Chợ", tier: "rare" },
  { id: "BLESS_25", name: "Dây chuyền Tinh Linh", tier: "rare" },
  { id: "BLESS_26", name: "Món Quà Bí Mật Tinh Linh", tier: "rare" },
  { id: "BLESS_27", name: "Thẻ bài Tinh Linh Rừng", tier: "rare" },

  // Legendary (1%: roll < 1)
  { id: "BLESS_28", name: "Thẻ Nâng Cấp Phòng Riêng", tier: "legendary" },
  { id: "BLESS_29", name: "Thẻ Lưu Trú Miễn Phí", tier: "legendary" },
  { id: "BLESS_30", name: "Trang Bị Nhà Phiêu Lưu", tier: "legendary" }
];

function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

// ======================================================
// MỐC SƯU TẦM QUANG THẠCH: MỖI 33 BIẾN THỂ → TẶNG 1 TINH THẠCH
// ======================================================
// Thưởng: 33 / 66 / 99 ... 990 biến thể, mỗi mốc tặng 1 vật phẩm "+1 Tinh Thạch".
const GEM_MILESTONE_STEP = 33;
const GEM_MILESTONE_REWARD = MASTER_BLESSINGS.find((b) => b.id === "BLESS_18");
// Category riêng cho "phiếu thu" đánh dấu mốc đã nhận.
// Phiếu thu luôn có is_used = 1 nên mọi query túi đồ (is_used = 0) đều bỏ qua -> an toàn, không cần migration DB.
const GEM_MILESTONE_RECEIPT_CATEGORY = "gem_milestone_receipt";

function gemMilestoneReceiptCode(milestone) {
  return `SYS_GEM_MILE_${milestone}`;
}

// Cộng dồn 1 vật phẩm vào túi đồ (tăng số lượng nếu đã có, tạo mới nếu chưa)
async function grantInventoryItem(env, userId, item) {
  const existing = await env.DB.prepare(`
    SELECT id, quantity FROM user_inventory
    WHERE user_id = ? AND item_code = ? AND is_used = 0 LIMIT 1
  `).bind(userId, item.id).first();

  if (existing) {
    await env.DB.prepare("UPDATE user_inventory SET quantity = quantity + 1 WHERE id = ?").bind(existing.id).run();
  } else {
    const qrToken = "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase();
    await env.DB.prepare(`
      INSERT INTO user_inventory (user_id, item_code, item_name, category, quantity, qr_token)
      VALUES (?, ?, ?, 'qr_offline', 1, ?)
    `).bind(userId, item.id, item.name, qrToken).run();
  }
}

// Trả về danh sách mốc MỚI được thưởng. Idempotent: phiếu thu được tạo bằng
// INSERT ... WHERE NOT EXISTS (atomic) nên gọi lại nhiều lần (polling 15s, mở nhiều tab,
// retry mạng) cũng không bao giờ nhận trùng.
async function claimGemMilestones(env, userId, gemCount) {
  if (!GEM_MILESTONE_REWARD) return [];

  const maxMilestone = Math.floor(gemCount / GEM_MILESTONE_STEP) * GEM_MILESTONE_STEP;
  if (maxMilestone < GEM_MILESTONE_STEP) return [];

  const claimed = await env.DB.prepare(`
    SELECT item_code FROM user_inventory
    WHERE user_id = ? AND category = ?
  `).bind(userId, GEM_MILESTONE_RECEIPT_CATEGORY).all();
  const claimedSet = new Set((claimed.results || []).map((r) => r.item_code));

  const granted = [];
  for (let m = GEM_MILESTONE_STEP; m <= maxMilestone; m += GEM_MILESTONE_STEP) {
    const receiptCode = gemMilestoneReceiptCode(m);
    if (claimedSet.has(receiptCode)) continue;

    // INSERT ... WHERE NOT EXISTS là atomic trong D1 nên an toàn kể cả khi
    // 2 request chạy song song (không phụ thuộc UNIQUE constraint của bảng).
    // qr_token sinh duy nhất để không bao giờ trùng với token quét thực địa.
    const receipt = await env.DB.prepare(`
      INSERT INTO user_inventory (user_id, item_code, item_name, category, quantity, qr_token, is_used)
      SELECT ?, ?, ?, ?, 1, ?, 1
      WHERE NOT EXISTS (
        SELECT 1 FROM user_inventory WHERE user_id = ? AND item_code = ?
      )
    `).bind(
      userId,
      receiptCode,
      `Mốc sưu tầm ${m} Quang Thạch`,
      GEM_MILESTONE_RECEIPT_CATEGORY,
      "SYS_MILE_" + receiptCode,
      userId,
      receiptCode
    ).run();

    // changes > 0 = phiếu thu vừa được tạo => chỉ request này được quyền nhận thưởng
    if (receipt.meta && receipt.meta.changes > 0) {
      await grantInventoryItem(env, userId, GEM_MILESTONE_REWARD);
      granted.push(m);
    }
  }

  return granted;
}

// ======================================================
// QUEST "NHẬP VAI VUI VẺ" (ROLL D20) - HẰNG SỐ & DỮ LIỆU
// ======================================================
// Số lượt được phép nhập vai mỗi ngày (giờ VN)
const ROLLQUEST_MAX_PER_DAY = 3;
// Key chứa danh sách tình huống trong KV (upload dạng JSON array) - KV giờ CHỈ ĐỌC
const ROLLQUEST_SCENARIOS_KV_KEY = "rollquest_scenarios";
// Bộ đếm lượt/ngày đã chuyển từ KV (key rollquest_daily:{userId}:{YYYY-MM-DD}) sang D1
// (cột last_rollquest_date / rollquest_* trong bảng users - đúng pattern của Quest Quiz).
// Lý do: KV Free chỉ 1.000 write/ngày (mỗi người tốn 6 write) và get() đọc cache 60s nên
// có thể bị vượt lượt / cộng điểm trùng. D1 ghi atomic nên hết cả 2 vấn đề.
// Đặt = true trong ~3 ngày sau khi deploy để nhập lại lượt đã chơi của ngày đó từ KV cũ,
// sau đó đặt = false để KV ngừng bị đụng tới hoàn toàn.
const ROLLQUEST_MIGRATE_LEGACY_KV = false;

// Dữ liệu dự phòng: dùng ngay khi KV chưa được upload (không deploy lại worker cũng chạy được)
const ROLLQUEST_FALLBACK_SCENARIOS = [
  {
    id: 1,
    title: "Hang Ổ Goblin Ma Quái",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60",
    desc: "Đột nhập vào sào huyệt goblin lấy lại bảo ngọc. Hãy né tránh các cạm bẫy và lính gác.",
    threshold: 10,
    speaker: "Thợ Săn Bram",
    dialogue: {
      success: [
        "Bạn lật tấm bia đá nhẹ nhàng — không một lính gác nào kịp nhận ra.",
        "Con goblin gục xuống trước khi kịp hú gọi. Bảo ngọc nằm ngay trên bàn thờ.",
        "Dây cạm bẫy đứt trong khoảnh khắc thần kỳ, bạn lọt qua khe hở mà không bị phát hiện.",
        "Ánh sáng từ bảo ngọc dẫn lối, cả đàn goblin vẫn đang ngủ say sau bức tường đá."
      ],
      fail: [
        "Tiếng rào lạnh sống lưng — bạn vấp phải dây bẫy! Cả ổ đánh thức trong một giây.",
        "Lính gác chỉ cần một tiếng kêu là mọi thứ đổi bên, bạn phải lùi lại liền mạt.",
        "Bạn để lộ dấu chân vào bùn. Một mũi tên đã kịp găm vào ba lô của ngươi.",
        "Gương mặt bạn phản chiếu trên mặt nước đọng — và con quái vật đã nhìn thấy nó."
      ],
      victory: "\"Bảo ngọc đã thuộc về ngươi. Sào huyệt này giờ chỉ còn là một căn nhà trống.\"",
      defeat: "\"Chưa xong đâu. Nhưng ngươi vẫn còn cơ hội — vận may thường quay về ở lần sau.\""
    }
  },
  {
    id: 2,
    title: "Giải Ấn Phong Tháp Cổ",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60",
    desc: "Thần chú phong ấn đòi hỏi sự tập trung pháp lực cao độ. Giải trừ cả 3 tầng kết giới.",
    threshold: 13,
    speaker: "Học Giả Vell",
    dialogue: {
      success: [
        "Vòng ma thuật vỡ tan! Bạn đã phá vỡ tầng ấn đầu tiên của phong tháp.",
        "Cổng đá khẽ rít rồi hé mở, ánh sáng xanh lạnh tràn ra từ bên trong.",
        "Răn chữ cổ phát sáng rồi tan thành bụi vàng. Tầng ấn tiếp theo đã lộ ra.",
        "Dòng chữ cổ đáp lại bằng giọng thì thầm: \"Đủ tư cách. Đi tiếp đi, kẻ xâm nhập.\""
      ],
      fail: [
        "Bạn đọc sai một vần ấn. Luồng ma lực phản phong thi triền đầu bạn.",
        "Phong tháp tự khép lại. Cánh cửa đá nghiến răng chặn đường ra của bạn.",
        "Áp lực ma lực dồn nặng lên vai, bạn phải dừng lại trước khi tổng thất.",
        "Bóng tối trong hành lang nhảy sang bên, nuốt chửng biển đèn của bạn."
      ],
      victory: "\"Ba tầng kết giới đã mở. Những gì chôn bên dưới phong tháp giờ thuộc về ngươi.\"",
      defeat: "\"Phong ấn vẫn nguyên vẹn, nhưng nó đã ghi nhớ hơi thở của ngươi. Hãy đi và suy nghĩ thêm.\""
    }
  },
  {
    id: 3,
    title: "Đánh Thức Rồng Lửa",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=60",
    desc: "Con rồng ngủ say trên kho vàng viễn cổ. Bạn cần 3 bước di chuyển khéo léo để rút lui an toàn.",
    threshold: 15,
    speaker: "Thủ Lĩnh Riven",
    dialogue: {
      success: [
        "Bạn trượt qua cơn thở nóng của con rồng mà nó vẫn chưa tỉnh giấc.",
        "Kho vàng tỏa sáng trước mắt. Tim bạn đập dồn dập, nhưng đôi tay vẫn vững.",
        "Vảy đỏ rực chỉ cách bạn vài bước chân — và thứ đáng sợ nhất vẫn đang ngủ.",
        "Con rồng trở mình, đá chạm nhau vang lên, nhưng ánh mắt vẫn nhắm nghiền."
      ],
      fail: [
        "Một vảy rơi trúng vai bạn. Rồng rít lên và cả kho cháy bừng.",
        "Bạn bước phải rương vàng, tiếng kim loại vang lên giữa tầng ức rồng.",
        "Hơi thở rồng thiêu rụi phần da thịt còn lại. Bạn phải lùi lại thật nhanh.",
        "Móng vuốt của nó lướt qua bên tai bạn. Chỉ một phẩy nữa là hết."
      ],
      victory: "\"Con rồng vẫn ngủ, kho vàng đã là của ngươi. Câu chuyện này sẽ được kể ở một quán rượu khác.\"",
      defeat: "\"Tiếng gầm vọng khắp sàn đá. Ngươi đã mất dấu trong đám khói đen — hãy quay lại khi còn kịp.\""
    }
  }
];

// Lấy ngày hiện tại theo giờ Việt Nam (UTC+7) dạng YYYY-MM-DD
function getTodayVN() {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().split("T")[0];
}

// Đọc kho tình huống "NHẬP VAI VUI VẺ" từ KV (JSON array)
async function readRollQuestScenarios(env) {
  if (!env.QUIZ_KV) return ROLLQUEST_FALLBACK_SCENARIOS;
  try {
    const raw = await env.QUIZ_KV.get(ROLLQUEST_SCENARIOS_KV_KEY);
    if (!raw) return ROLLQUEST_FALLBACK_SCENARIOS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return ROLLQUEST_FALLBACK_SCENARIOS;
  } catch (jsonErr) {
    console.error("Lỗi cú pháp JSON kịch bản NHẬP VAI VUI VẺ trong KV:", jsonErr.message);
    return ROLLQUEST_FALLBACK_SCENARIOS;
  }
}

// Định dạng key KV cũ (chỉ dùng để đọc lại dữ liệu trong lúc chuyển đổi)
function rollQuestDailyKey(userId, today) {
  return `rollquest_daily:${userId}:${today}`;
}

// "1,3" -> [1, 3]. Giữ cả giá trị 0 vì id tình huống trong KV có thể bắt đầu từ 0.
function parseCsvNumbers(raw) {
  if (raw === null || raw === undefined || raw === "") return [];
  return String(raw)
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n));
}

function toCsv(list) {
  return list.join(",");
}

// Đọc bộ đếm lượt/ngày từ D1.
// Dùng chung với các endpoint khác: nếu last_rollquest_date khác hôm nay -> freshDay = true
// (tự reset sang ngày mới, không cần dọn dữ liệu cũ như KV TTL).
async function readRollQuestDaily(env, userId, today) {
  const row = await env.DB.prepare(`
    SELECT last_rollquest_date AS d,
           rollquest_used AS used,
           rollquest_rewarded AS rewarded,
           rollquest_scenarios AS scen
    FROM users WHERE id = ?
  `).bind(userId).first();

  if (row && row.d === today) {
    return {
      exists: true,
      freshDay: false,
      used: Number(row.used) || 0,
      // rewardedSlots: các slot (1-based) đã cộng điểm. Dùng slot thay vì scenarioId để
      // chống thưởng trùng kể cả khi kịch bản bị lặp lại trong ngày.
      rewardedSlots: parseCsvNumbers(row.rewarded).filter((n) => n >= 1),
      // scenarioIds: id tình huống của từng lượt đã mở, theo thứ tự slot 1, 2, 3...
      scenarioIds: parseCsvNumbers(row.scen),
    };
  }

  // Chưa có dữ liệu của hôm nay -> thử lấy lại từ KV cũ (xem ROLLQUEST_MIGRATE_LEGACY_KV)
  const legacy = await readLegacyRollQuestDailyKV(env, userId, today);
  return {
    exists: !!row || legacy.found,
    freshDay: true,
    used: legacy.used,
    rewardedSlots: legacy.rewardedSlots,
    scenarioIds: legacy.scenarioIds,
  };
}

// Bộ đếm cũ nằm trong KV (TTL 3 ngày) - chỉ ĐỌC 1 lần/ngày/người để không mất lượt của
// người chơi trong ngày đang chuyển đổi. Sau khi tắt cờ ROLLQUEST_MIGRATE_LEGACY_KV,
// toàn bộ luồng chỉ còn D1 và KV không bị ghi nữa.
async function readLegacyRollQuestDailyKV(env, userId, today) {
  const empty = { found: false, used: 0, rewardedSlots: [], scenarioIds: [] };
  if (!ROLLQUEST_MIGRATE_LEGACY_KV || !env.QUIZ_KV) return empty;

  try {
    const raw = await env.QUIZ_KV.get(rollQuestDailyKey(userId, today));
    if (!raw) return empty;

    const parsed = JSON.parse(raw);
    const used = Number(parsed.used) || 0;
    const scenarioIds = Array.isArray(parsed.scenarioIds)
      ? parsed.scenarioIds.map(Number).filter(Number.isInteger)
      : [];

    let rewardedSlots;
    if (Array.isArray(parsed.rewardedSlots)) {
      rewardedSlots = parsed.rewardedSlots.map(Number).filter((n) => Number.isInteger(n) && n >= 1);
    } else if (parsed.rewarded === true) {
      // Kỳ chuyển từ format cũ (boolean: 1 lần/ngày): đã cộng điểm 1 lần nhưng không lưu
      // lượt nào -> đánh dấu TOÀN BỘ các slot đã mở là đã thưởng để chắc chắn không
      // cộng thêm điểm cho người chơi trong ngày hôm đó.
      rewardedSlots = Array.from({ length: used }, (_, i) => i + 1);
    } else {
      rewardedSlots = [];
    }

    return { found: true, used, rewardedSlots, scenarioIds };
  } catch {
    return empty;
  }
}

// 1) Nạp trạng thái của hôm nay vào D1 (chỉ ghi 1 lần/ngày/người nên không tốn quota).
// Lưu ý: nạp ĐÚNG số lượt đã dùng / slot đã thưởng của hôm nay (dữ liệu lấy từ KV cũ khi
// đang migrate) — nếu ghi cứng 0 thì người chơi sẽ được thêm lượt miễn phí.
const SQL_ROLLQUEST_RESET_DAY = `
  UPDATE users SET
    last_rollquest_date = ?,
    rollquest_used = ?,
    rollquest_rewarded = ?,
    rollquest_scenarios = ?
  WHERE id = ? AND (last_rollquest_date IS NULL OR last_rollquest_date <> ?)
`;

// 2) Tiêu 1 lượt bằng CAS (compare-and-swap): chỉ ghi khi giá trị vừa đọc vẫn còn nguyên.
// Nhờ vậy double-click / mở nhiều tab / request song song KHÔNG BAO GIỜ vượt hạn mức
// (đây là lỗi tồn tại khi bộ đếm nằm trong KV vì get() đọc cache 60s).
// LƯU Ý: các tham số ghép vào CSV phải bind dạng CHUỖI (String(...)).
// Nếu bind số, SQLite đưa vào CASE theo kiểu REAL và lưu ra "1.0" -> CSV hỏng.
const SQL_ROLLQUEST_CONSUME_SLOT = `
  UPDATE users SET
    rollquest_used = rollquest_used + 1,
    rollquest_scenarios = CASE
      WHEN rollquest_scenarios IS NULL OR rollquest_scenarios = '' THEN ?
      ELSE rollquest_scenarios || ',' || ?
    END
  WHERE id = ? AND last_rollquest_date = ?
    AND COALESCE(rollquest_used, 0) = ? AND COALESCE(rollquest_used, 0) < ?
`;

// 3) Đánh dấu slot đã thưởng + cộng 1 điểm Tinh Quang trong CÙNG một câu lệnh:
// không bao giờ cộng điểm mà mất cờ thưởng, và không bao giờ cộng điểm 2 lần cho 1 slot.
const SQL_ROLLQUEST_MARK_REWARDED = `
  UPDATE users SET
    rollquest_rewarded = CASE
      WHEN rollquest_rewarded IS NULL OR rollquest_rewarded = '' THEN ?
      ELSE rollquest_rewarded || ',' || ?
    END,
    tinh_quang_points = COALESCE(tinh_quang_points, 0) + 1
  WHERE id = ? AND last_rollquest_date = ?
    AND COALESCE(rollquest_used, 0) >= ?
    AND COALESCE(rollquest_rewarded, '') = ?
`;
// Escape chuỗi trước khi chèn vào tin nhắn Telegram (gửi với parse_mode: HTML).
// Tên người chơi / tiêu đề quest lấy từ DB hoặc từ trình duyệt nên có thể chứa ký tự HTML.
function tgEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ======================================================
// HELPER: GỬI TIN NHẮN VÀ NÚT BẤM VỀ TELEGRAM ADMIN
// ======================================================
async function sendTelegramMessage(env, text, inlineKeyboard = null) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };
  if (inlineKeyboard) {
    body.reply_markup = { inline_keyboard: inlineKeyboard };
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error("Lỗi gửi Telegram:", err);
  }
}
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    // Chuẩn hóa path loại bỏ lỗi double slash //
    const cleanPath = url.pathname.replace(/\/+/g, "/");

    try {
     // ===================================================
      // ===================================================
      // 1. ENDPOINT: ĐĂNG KÝ & KHÔI PHỤC TÀI KHOẢN (ONBOARDING)
      // ===================================================
      if (cleanPath === "/api/auth/register-first-gacha" && request.method === "POST") {
        const body = await request.json();
        // Nhận đầy đủ các thông tin cá nhân hóa từ Bước 2 Onboarding
        const { googleUser, adventurerName, birthYear, gender, className, tribe, avatarUrl, phoneNumber, gemData } = body;

        if (!googleUser || !gemData) {
          return new Response(JSON.stringify({ error: "Vui lòng đăng nhập Google trước!" }), { status: 400, headers: CORS_HEADERS });
        }

        const userId = googleUser.sub;
        const email = (googleUser.email).toLowerCase().trim();
        const fullName = adventurerName || googleUser.name || "Nhà Phiêu Lưu";
        const selectedAvatar = avatarUrl || googleUser.picture;
        const selectedRole = className || "Du Mục Rừng";
        
        // Đóng gói Bộ tộc, Năm sinh, Giới tính vào cột bio để không làm đổi cấu trúc D1
        const bioInfo = `Bộ tộc: ${tribe || 'Tự do'} • ${gender || 'Nam'} (${birthYear || '----'})`;

        // A. KIỂM TRA TÀI KHOẢN ĐÃ CÓ TRƯỚC ĐÓ CHƯA
        const existingUser = await env.DB.prepare(`
          SELECT * FROM users WHERE email = ? OR id = ? LIMIT 1
        `).bind(email, userId).first();

        if (existingUser) {
          const activeId = existingUser.id;
          await env.DB.prepare(`
            UPDATE users SET 
              full_name = ?, avatar_url = ?, class_name = ?, bio = ?,
              phone_number = COALESCE(?, phone_number)
            WHERE id = ?
          `).bind(fullName, selectedAvatar, selectedRole, bioInfo, phoneNumber || null, activeId).run();

          const gems = await env.DB.prepare("SELECT gem_code FROM user_gem_collection WHERE user_id = ?").bind(activeId).all();
          const items = await env.DB.prepare("SELECT * FROM user_inventory WHERE user_id = ? AND is_used = 0").bind(activeId).all();

          return new Response(JSON.stringify({ 
            success: true, 
            user: {
              ...existingUser,
              full_name: fullName,
              avatar_url: selectedAvatar,
              class_name: selectedRole,
              bio: bioInfo,
              unlocked_gems: (gems.results || []).map(g => g.gem_code),
              inventory: items.results || []
            }, 
            blessing: FREE_BLESSINGS[0], 
            isRestored: true 
          }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // B. TÀI KHOẢN MỚI HOÀN TOÀN: Sinh mã AWxxxx duy nhất chống trùng lặp
        let advenCode = "";
        let codeExists = true;
        while (codeExists) {
          advenCode = "AW" + Math.floor(1000 + Math.random() * 9000);
          const check = await env.DB.prepare("SELECT id FROM users WHERE adventurer_code = ?").bind(advenCode).first();
          if (!check) codeExists = false;
        }

        // Ghi nhận tài khoản vào bảng users
        await env.DB.prepare(`
          INSERT INTO users (id, email, full_name, adventurer_code, class_name, avatar_url, bio, phone_number, tinh_quang_points, cong_hien_points, gacha_counter)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
        `).bind(userId, email, fullName, advenCode, selectedRole, selectedAvatar, bioInfo, phoneNumber || '').run();

        // Ghi nhận viên đá đầu tiên vào bảng user_gem_collection
         await env.DB.prepare(`
          INSERT OR IGNORE INTO user_gem_collection (user_id, gem_code, gem_name, shape_name, face_count, gem_color_group, shape_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, gemData.code, gemData.name, gemData.shapeName || 'Tinh Thể', gemData.faceCount, gemData.sys, gemData.shapeId || 1).run();

        // Tặng ngẫu nhiên 1 trong 4 Chúc Phúc Free Tân Thủ
        const wonBlessing = FREE_BLESSINGS[Math.floor(Math.random() * FREE_BLESSINGS.length)];
        const qrToken = "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase();

        await env.DB.prepare(`
          INSERT INTO user_inventory (user_id, item_code, item_name, category, quantity, qr_token)
          VALUES (?, ?, ?, 'qr_offline', 1, ?)
        `).bind(userId, wonBlessing.id, wonBlessing.name, qrToken).run();

        const userRecord = {
          id: userId,
          email: email,
          full_name: fullName,
          adventurer_code: advenCode,
          class_name: selectedRole,
          avatar_url: selectedAvatar,
          birth_year: birthYear || '----',
          gender: gender || 'Nam',
          tribe: tribe || 'Tự do',
          phone_number: phoneNumber || '',
          bio: bioInfo,
          tinh_quang_points: 0,
          cong_hien_points: 0,
          gacha_counter: 1,
          unlocked_gems: [gemData.code],
          inventory: [{
            id: wonBlessing.id,
            name: wonBlessing.name,
            iconClass: wonBlessing.iconClass,
            tier: wonBlessing.tier,
            desc: wonBlessing.desc,
            quantity: 1,
            qr_token: qrToken
          }]
        };

        return new Response(JSON.stringify({ 
          success: true, 
          user: userRecord, 
          blessing: wonBlessing, 
          isRestored: false 
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }
      // ===================================================
      // 2. ENDPOINT: XỬ LÝ GACHA THƯỜNG (TỪ LẦN 2 TRỞ ĐI)
      // ===================================================
      if (cleanPath === "/api/gacha" && request.method === "POST") {
        const { userId, gemData } = await request.json();

        // 1. Kiểm tra điểm Tinh Quang của User
        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
          return new Response(JSON.stringify({ error: "Không tìm thấy tài khoản người chơi!" }), { status: 404, headers: CORS_HEADERS });
        }
        if (user.tinh_quang_points < 1) {
          return new Response(JSON.stringify({ error: "Bạn đã hết Điểm Tinh Quang!" }), { status: 400, headers: CORS_HEADERS });
        }

        const newCounter = user.gacha_counter + 1;
        const newPoints = user.tinh_quang_points - 1;

        // 2. Trừ 1 🔮 và tăng gacha_counter lên 1
        await env.DB.prepare(`
          UPDATE users SET tinh_quang_points = ?, gacha_counter = ? WHERE id = ?
        `).bind(newPoints, newCounter, userId).run();

        // 3. Ghi nhận đá vào Tủ Sưu Tầm
        await env.DB.prepare(`
          INSERT OR IGNORE INTO user_gem_collection (user_id, gem_code, gem_name, shape_name, face_count, gem_color_group, shape_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, gemData.code, gemData.name, gemData.shapeName || 'Tinh Thể', gemData.faceCount, gemData.sys, gemData.shapeId || 1).run();

        // 4. Kiểm tra Số Nguyên Tố & Quay thưởng Chúc Phúc
        let wonBlessing = null;
        if (isPrime(newCounter)) {
          const roll = Math.random() * 100;
          let pool = [];
          if (roll < 1) pool = MASTER_BLESSINGS.slice(27, 30);      // 1% Legendary
          else if (roll < 13) pool = MASTER_BLESSINGS.slice(21, 27); // 12% Rare
          else if (roll < 38) pool = MASTER_BLESSINGS.slice(12, 21); // 25% Uncommon
          else pool = MASTER_BLESSINGS.slice(0, 12);                 // 62% Common

          wonBlessing = pool[Math.floor(Math.random() * pool.length)];

          // Cơ chế Stacking: Kiểm tra nếu đã có món này thì cộng dồn số lượng
          const existingItem = await env.DB.prepare(`
            SELECT id, quantity FROM user_inventory 
            WHERE user_id = ? AND item_code = ? AND is_used = 0 LIMIT 1
          `).bind(userId, wonBlessing.id).first();

          if (existingItem) {
            await env.DB.prepare(`
              UPDATE user_inventory SET quantity = quantity + 1 WHERE id = ?
            `).bind(existingItem.id).run();
          } else {
            const qrToken = "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase();
            await env.DB.prepare(`
              INSERT INTO user_inventory (user_id, item_code, item_name, category, quantity, qr_token)
              VALUES (?, ?, ?, 'qr_offline', 1, ?)
            `).bind(userId, wonBlessing.id, wonBlessing.name, qrToken).run();
          }
        }

        // 5. Mốc sưu tầm Quang Thạch: mỗi 33 biến thể tặng 1 Tinh Thạch
        const gemCountRow = await env.DB.prepare(
          "SELECT COUNT(*) AS total FROM user_gem_collection WHERE user_id = ?"
        ).bind(userId).first();
        const gemCount = gemCountRow?.total || 0;
        const newMilestones = await claimGemMilestones(env, userId, gemCount);

        // Trả kèm túi đồ mới để client thấy ngay vật phẩm vừa nhận ở mốc sưu tầm
        let items = [];
        if (newMilestones.length > 0) {
          const inv = await env.DB.prepare(
            "SELECT * FROM user_inventory WHERE user_id = ? AND is_used = 0"
          ).bind(userId).all();
          items = inv.results || [];
        }

        return new Response(JSON.stringify({
          success: true,
          counter: newCounter,
          remainingPoints: newPoints,
          blessing: wonBlessing,
          gemCount: gemCount,
          newMilestones: newMilestones,
          rewardItem: GEM_MILESTONE_REWARD || null,
          inventory: items
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 2b. ENDPOINT: KIỂM TRA MỐC SƯU TẦM QUANG THẠCH
      // Gọi khi mở Túi Đồ / đồng bộ để nhận mốc bị bỏ lỡ (offline, tab đóng...)
      // ===================================================
      if (cleanPath === "/api/gem-milestone" && request.method === "POST") {
        const { userId } = await request.json();
        if (!userId) {
          return new Response(JSON.stringify({ error: "Thiếu userId!" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        const gemCountRow = await env.DB.prepare(
          "SELECT COUNT(*) AS total FROM user_gem_collection WHERE user_id = ?"
        ).bind(userId).first();
        const gemCount = gemCountRow?.total || 0;
        const newMilestones = await claimGemMilestones(env, userId, gemCount);

        // Trả kèm túi đồ mới để client đồng bộ ngay vật phẩm vừa nhận
        let items = [];
        if (newMilestones.length > 0) {
          const inv = await env.DB.prepare(
            "SELECT * FROM user_inventory WHERE user_id = ? AND is_used = 0"
          ).bind(userId).all();
          items = inv.results || [];
        }

        return new Response(JSON.stringify({
          success: true,
          gemCount: gemCount,
          newMilestones: newMilestones,
          rewardItem: GEM_MILESTONE_REWARD || null,
          inventory: items
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 3. ENDPOINT: ĐỒNG BỘ DỮ LIỆU USER (SYNC)
      // ===================================================
      if (cleanPath === "/api/user/sync" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        const gems = await env.DB.prepare("SELECT gem_code FROM user_gem_collection WHERE user_id = ?").bind(userId).all();
        const items = await env.DB.prepare("SELECT * FROM user_inventory WHERE user_id = ? AND is_used = 0").bind(userId).all();

        let tribe = "Tự do", gender = "Nam", birthYear = "----";
        if (user.bio) {
          const match = user.bio.match(/Bộ tộc:\s*([^•]+)•\s*([^\(]+)\(([^\)]+)\)/);
          if (match) {
            tribe = match[1].trim();
            gender = match[2].trim();
            birthYear = match[3].trim();
          }
        }

        return new Response(JSON.stringify({
          success: true,
          user: {
            ...user,
            unlocked_gems: (gems.results || []).map(g => g.gem_code),
            inventory: items.results || []
          }
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 4. ENDPOINT: ĐẶT MUA SHOP LỮ HÀNH (KÈM TELEGRAM PING)
      // ===================================================
      if (cleanPath === "/api/shop-order" && request.method === "POST") {
        const { userId, packageName, tinhThach, vnd, phone } = await request.json();
        
        // 1. Lưu đơn hàng vào D1 Database
        await env.DB.prepare(`
          INSERT INTO shop_orders (user_id, package_type, tinh_thach_total, vnd_estimate, selected_quest)
          VALUES (?, ?, ?, ?, ?)
        `).bind(userId, `${packageName} | SĐT: ${phone}`, tinhThach, vnd, "Pending").run();

        // 2. Lấy thông tin user để báo cáo chi tiết
        const u = await env.DB.prepare("SELECT full_name, adventurer_code FROM users WHERE id = ?").bind(userId).first();
        const userName = u ? u.full_name : "Nhà Phiêu Lưu";
        const userCode = u ? u.adventurer_code : "AW----";

        // 3. Bắn tin nhắn trực tiếp về Telegram Admin
        const msg = `🛒 <b>ĐƠN HÀNG MỚI TỪ SHOP LỮ HÀNH!</b>\n` +
                    `──────────────\n` +
                    `👤 <b>Khách hàng:</b> ${userName} (<code>${userCode}</code>)\n` +
                    `📞 <b>SĐT / Zalo:</b> <code>${phone}</code>\n` +
                    `📦 <b>Gói dịch vụ:</b>\n<i>${packageName}</i>\n` +
                    `💰 <b>Tổng tiền:</b> ${tinhThach} 💎 (~${Number(vnd).toLocaleString('vi-VN')} đ)\n` +
                    `──────────────\n` +
                    `⚡ <i>Trưởng đoàn hãy liên hệ xác nhận sớm nhất!</i>`;
        
        await sendTelegramMessage(env, msg);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // 4.B ENDPOINT: NỘP LINK BÀI VIẾT FACEBOOK
      // ===================================================
      if (cleanPath === "/api/quest/submit-fb" && request.method === "POST") {
        const { userId, postUrl } = await request.json();
        if (!userId || !postUrl) {
          return new Response(JSON.stringify({ error: "Thiếu dữ liệu!" }), { status: 400, headers: CORS_HEADERS });
        }

        const u = await env.DB.prepare("SELECT full_name, adventurer_code FROM users WHERE id = ?").bind(userId).first();
        const userName = u ? u.full_name : "Nhà Phiêu Lưu";
        const userCode = u ? u.adventurer_code : "AW----";

        // Gửi link về Telegram kèm 2 nút bấm Inline Callback
        const msg = `📜 <b>DUYỆT NHIỆM VỤ: TRUYỀN TIN BANG HỘI</b>\n` +
                    `──────────────\n` +
                    `👤 <b>Người chơi:</b> ${userName} (<code>${userCode}</code>)\n` +
                    `🔗 <b>Link bài viết:</b> ${postUrl}\n` +
                    `──────────────\n` +
                    `Bấm nút bên dưới để duyệt +1 🔮 Tinh Quang:`;

        const keyboard = [
          [
            { text: "✅ Duyệt (+1 🔮)", callback_data: `APPROVE_FB:${userId}` },
            { text: "❌ Từ chối", callback_data: `REJECT_FB:${userId}` }
          ]
        ];

        await sendTelegramMessage(env, msg, keyboard);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // 4.B2 ENDPOINT: ĐĂNG KÝ QUEST TẠI HỘI NGỌC LỤC (BẤM NÚT TRONG LIGHTBOX)
      // Nhận thông tin người chơi + thông tin tờ quest họ đang chọn, bắn về Telegram
      // kèm nút mở Messenger (link do admin khai báo trong data.js phía frontend).
      // ===================================================
      if (cleanPath === "/api/quest/register-guild-quest" && request.method === "POST") {
        const { userId, questId, questTitle, messenger, pageUrl } = await request.json();

        if (!userId || !questTitle) {
          return new Response(JSON.stringify({ error: "Thiếu dữ liệu đăng ký Quest!" }), { status: 400, headers: CORS_HEADERS });
        }

        // Cắt ngắn + ép kiểu chuỗi: payload tới từ trình duyệt, không tin tuyệt đối
        const cleanQuestTitle = String(questTitle).trim().slice(0, 120) || `Quest #${questId ?? "?"}`;
        const cleanMessenger = String(messenger || "").trim().slice(0, 300);
        const cleanPageUrl = String(pageUrl || "").trim().slice(0, 300);

        // Chỉ nhận link http/https — chặn javascript:/data: để không dính link độc hại
        const safeMessenger = /^https?:\/\//i.test(cleanMessenger) ? cleanMessenger : "";
        const safePageUrl = /^https?:\/\//i.test(cleanPageUrl) ? cleanPageUrl : "";

        const u = await env.DB.prepare(`
          SELECT full_name, adventurer_code, email, phone_number, class_name FROM users WHERE id = ?
        `).bind(userId).first();

        const userName = (u && u.full_name) || "Nhà Phiêu Lưu";
        const userCode = (u && u.adventurer_code) || "AW----";
        const userClass = (u && u.class_name) || "Chưa xác định";
        const userEmail = (u && u.email) || "—";
        const userPhone = (u && u.phone_number) || "—";

        const questLabel = `${tgEscape(cleanQuestTitle)} (ID: ${tgEscape(questId ?? "?")})`;

        const msg = `📜 <b>ĐĂNG KÝ QUEST TẠI HỘI NGỌC LỤC!</b>\n` +
                    `──────────────\n` +
                    `👤 <b>Nhà Phiêu Lưu:</b> ${tgEscape(userName)} (<code>${tgEscape(userCode)}</code>)\n` +
                    `🧝 <b>Lớp:</b> ${tgEscape(userClass)}\n` +
                    `📧 <b>Email:</b> <code>${tgEscape(userEmail)}</code>\n` +
                    `📞 <b>Liên hệ:</b> <code>${tgEscape(userPhone)}</code>\n` +
                    `──────────────\n` +
                    `📌 <b>Quest đã chọn:</b>\n<i>${questLabel}</i>\n` +
                    (safeMessenger ? `💬 <b>Messenger dẫn tới:</b> ${tgEscape(safeMessenger)}\n` : "") +
                    (safePageUrl ? `🌐 <b>Trang gửi từ:</b> ${tgEscape(safePageUrl)}\n` : "") +
                    `──────────────\n` +
                    `⚡ <i>Hội trưởng liên hệ người chơi qua Messenger để hoàn tất đăng ký.</i>`;

        // Nút mở Messenger ngay trong Telegram cho admin tiện xử lý
        const keyboard = [];
        if (safeMessenger) {
          keyboard.push([{ text: "💬 Mở Messenger người chơi", url: safeMessenger }]);
        }

        await sendTelegramMessage(env, msg, keyboard.length ? keyboard : null);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // 4.C ENDPOINT: TELEGRAM WEBHOOK (XỬ LÝ NÚT BẤM TRÊN TELEGRAM)
      // ===================================================
      if (cleanPath === "/api/telegram-webhook" && request.method === "POST") {
        const update = await request.json();
        // Xử lý khi Admin nhắn tin lệnh cho Bot Telegram
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          const chatId = update.message.chat.id;

          // Lệnh tra cứu: /user AWxxxx
          if (text.startsWith("/user ")) {
            const code = text.replace("/user ", "").trim().toUpperCase();
            const u = await env.DB.prepare("SELECT * FROM users WHERE adventurer_code = ?").bind(code).first();
            
            if (!u) {
              await sendTelegramMessage(env, `❌ Không tìm thấy người chơi có mã <code>${code}</code>.`);
            } else {
              const info = `👤 <b>HỒ SƠ: ${u.full_name}</b>\n` +
                           `Mã: <code>${u.adventurer_code}</code> | Role: <b>${u.role}</b>\n` +
                           `📞 SĐT: <code>${u.phone_number || 'Chưa có'}</code>\n` +
                           `📧 Email: ${u.email}\n` +
                           `🔮 Tinh Quang: <b>${u.tinh_quang_points}</b> | 🛡️ Cống Hiến: <b>${u.cong_hien_points}</b>`;
              
              const keyboard = [
                [{ text: "🗑️ Xóa tài khoản này", callback_data: `ADMIN_DEL:${u.id}` }]
              ];
              await sendTelegramMessage(env, info, keyboard);
            }
          }
        }
        // Khi Admin bấm nút trên Telegram
        if (update.callback_query) {
          const cb = update.callback_query;
          const data = cb.data; 
          // Khi Admin bấm nút xóa trên Telegram
          // ===================================================
          // XÓA TÀI KHOẢN TOÀN DIỆN (CHỐNG KẸT KHÓA NGOẠI D1)
          // ===================================================
          if (data.startsWith("ADMIN_DEL:")) {
            const targetId = data.split(":")[1];

            // 1. Báo cho Telegram tắt biểu tượng xoay vòng trên nút bấm
            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callback_query_id: cb.id,
                text: "Đang tiến hành dọn dẹp dữ liệu..."
              })
            });

            try {
              // 2. Dùng DB.batch để xóa sạch đồng loạt 5 bảng cùng lúc
              await env.DB.batch([
                // Xóa túi đồ
                env.DB.prepare("DELETE FROM user_inventory WHERE user_id = ?").bind(targetId),
                // Xóa tủ đá
                env.DB.prepare("DELETE FROM user_gem_collection WHERE user_id = ?").bind(targetId),
                // Xóa mọi quan hệ bạn bè (cả khi là người mời hoặc người được mời)
                env.DB.prepare("DELETE FROM user_connections WHERE user_a_id = ? OR user_b_id = ?").bind(targetId, targetId),
                // Xóa đơn hàng shop nếu có
                env.DB.prepare("DELETE FROM shop_orders WHERE user_id = ?").bind(targetId),
                // Cuối cùng: Xóa tài khoản người dùng
                env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetId)
              ]);

              // 3. Cập nhật tin nhắn thông báo thành công
              await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: cb.message.chat.id,
                  message_id: cb.message.message_id,
                  text: `${cb.message.text}\n\n✅ <b>ĐÃ XÓA SẠCH TÀI KHOẢN & MỐI QUAN HỆ BẠN BÈ KHỎI D1!</b>`,
                  parse_mode: "HTML"
                })
              });

            } catch (err) {
              console.error("Lỗi xóa tài khoản:", err);
              // Báo lỗi cụ thể nếu có sự cố
              await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: cb.message.chat.id,
                  text: `❌ Lỗi xóa tài khoản: ${err.message}`
                })
              });
            }
          }
          //XÁC NHẬN TỪ FACEBOOK.
          if (data.startsWith("APPROVE_FB:")) {
            const targetUserId = data.split(":")[1];

            // Cộng 1 điểm Tinh Quang vào D1
            await env.DB.prepare(`
              UPDATE users SET tinh_quang_points = tinh_quang_points + 1 WHERE id = ?
            `).bind(targetUserId).run();

            // Cập nhật lại tin nhắn trên Telegram thành đã duyệt
            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: cb.message.chat.id,
                message_id: cb.message.message_id,
                text: `${cb.message.text}\n\n🎉 <b>KẾT QUẢ: ĐÃ DUYỆT THÀNH CÔNG! (+1 🔮 ĐÃ CỘNG VÀO D1)</b>`,
                parse_mode: "HTML"
              })
            });
          } else if (data.startsWith("REJECT_FB:")) {
            // Cập nhật tin nhắn thành từ chối
            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: cb.message.chat.id,
                message_id: cb.message.message_id,
                text: `${cb.message.text}\n\n❌ <b>KẾT QUẢ: ĐÃ TỪ CHỐI BÀI VIẾT NÀY.</b>`,
                parse_mode: "HTML"
              })
            });
          }
          // XÁC NHẬN/TỪ CHỐI ĐỔI TÊN
          else if (data.startsWith("APPROVE_NAME:")) {
            const parts = data.split(":");
            const targetUserId = parts[1];
            const newNameEncoded = parts.slice(2).join(":");
            const newFullName = decodeURIComponent(newNameEncoded);

            await env.DB.prepare(`
              UPDATE users SET full_name = ? WHERE id = ?
            `).bind(newFullName, targetUserId).run();

            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: cb.message.chat.id,
                message_id: cb.message.message_id,
                text: `${cb.message.text}\n\n✅ <b>KẾT QUẢ: ĐÃ XÁC NHẬN ĐỔI TÊN!</b>\n🏷️ <b>Tên mới:</b> ${newFullName}`,
                parse_mode: "HTML"
              })
            });
          } else if (data.startsWith("REJECT_NAME:")) {
            const parts = data.split(":");
            const targetUserId = parts[1];

            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: cb.message.chat.id,
                message_id: cb.message.message_id,
                text: `${cb.message.text}\n\n❌ <b>KẾT QUẢ: ĐÃ TỪ CHỐI YÊU CẦU ĐỔI TÊN.</b>`,
                parse_mode: "HTML"
              })
            });
          }
        }
        return new Response("OK", { status: 200 });
      }

      // ===================================================
      // ENDPOINT: LẤY THÔNG TIN HỒ SƠ NGƯỜI CHƠI (PLAYER INFO)
      // ===================================================
      if (cleanPath === "/api/user/profile" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        // Đếm số biến thể gem unique
        const gemResult = await env.DB.prepare("SELECT COUNT(DISTINCT gem_code) as cnt FROM user_gem_collection WHERE user_id = ?").bind(userId).first();
        const gemCount = gemResult?.cnt || 0;

        // Trích xuất tribe, gender, birth_year từ bio nếu có
        let tribe = "Tự do", gender = "Nam", birthYear = "----";
        if (user.bio) {
          const match = user.bio.match(/Bộ tộc:\s*([^•]+)•\s*([^\(]+)\(([^\)]+)\)/);
          if (match) {
            tribe = match[1].trim();
            gender = match[2].trim();
            birthYear = match[3].trim();
          }
        }

        return new Response(JSON.stringify({
          success: true,
          user: {
            id: user.id,
            full_name: user.full_name,
            adventurer_code: user.adventurer_code,
            avatar_url: user.avatar_url,
            role: user.role,
            class_name: user.class_name || "—",
            tribe: tribe,
            gender: gender,
            birth_year: birthYear,
            cong_hien_points: user.cong_hien_points || 0,
            gem_count: gemCount,
            badge: user.badge || user.title || null
          }
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 5. ENDPOINT: CẬP NHẬT ẢNH ĐẠI DIỆN VÀO D1
      // ===================================================
      if (cleanPath === "/api/user/update-avatar" && request.method === "POST") {
        const { userId, avatarUrl } = await request.json();
        if (!userId || !avatarUrl) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin!" }), { status: 400, headers: CORS_HEADERS });
        }

        await env.DB.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").bind(avatarUrl, userId).run();

        return new Response(JSON.stringify({ success: true, avatarUrl }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // 4.D ENDPOINT: YÊU CẦU ĐỔI TÊN NHÀ PHIÊU LƯU
      // ===================================================
      if (cleanPath === "/api/user/request-change-name" && request.method === "POST") {
        const { userId, newName } = await request.json();
        if (!userId || !newName) {
          return new Response(JSON.stringify({ error: "Thiếu dữ liệu!" }), { status: 400, headers: CORS_HEADERS });
        }

        const cleanName = newName.trim();
        if (cleanName.length < 2 || cleanName.length > 30) {
          return new Response(JSON.stringify({ error: "Tên phải từ 2-30 ký tự!" }), { status: 400, headers: CORS_HEADERS });
        }

        const u = await env.DB.prepare("SELECT full_name, adventurer_code FROM users WHERE id = ?").bind(userId).first();
        const userName = u ? u.full_name : "Nhà Phiêu Lưu";
        const userCode = u ? u.adventurer_code : "AW----";

        const msg = `✍🏻 <b>YÊU CẦU ĐỔI TÊN NHÀ PHIÊU LƯU</b>\n` +
                    `──────────────\n` +
                    `👤 <b>Người chơi:</b> ${userName} (<code>${userCode}</code>)\n` +
                    `📝 <b>Tên hiện tại:</b> ${userName}\n` +
                    `🎯 <b>Tên mới đề xuất:</b> ${cleanName}\n` +
                    `──────────────\n` +
                    `Bấm nút bên dưới để xác nhận đổi tên cho Nhà Phiêu Lưu này:`;

        const keyboard = [
          [
            { text: "✅ Xác nhận đổi tên", callback_data: `APPROVE_NAME:${userId}:${encodeURIComponent(cleanName)}` },
            { text: "❌ Từ chối", callback_data: `REJECT_NAME:${userId}` }
          ]
        ];

        await sendTelegramMessage(env, msg, keyboard);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // ENDPOINT: ĐỒNG BỘ CỘNG ĐIỂM VÀO D1 (ADMIN & QUEST)
      // ===================================================
     // ===================================================
      // VÁ BẢO MẬT: CHỈ ADMIN THẬT TRONG D1 MỚI ĐƯỢC BƠM ĐIỂM
      // ===================================================
      if (cleanPath === "/api/user/add-points" && request.method === "POST") {
        const { userId, tinhQuang = 0, congHien = 0 } = await request.json();
        if (!userId) {
          return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });
        }

        // KIỂM TRA QUYỀN ADMIN TRONG D1 (CHỐNG HACK DEVTOOLS)
        const checkAdmin = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(userId).first();
        if (!checkAdmin || checkAdmin.role !== "admin") {
          return new Response(JSON.stringify({ error: "Từ chối truy cập: Bạn không có quyền Admin!" }), { 
            status: 403, 
            headers: CORS_HEADERS 
          });
        }

        await env.DB.prepare(`
          UPDATE users SET 
            tinh_quang_points = MAX(0, tinh_quang_points + ?),
            cong_hien_points = MAX(0, cong_hien_points + ?)
          WHERE id = ?
        `).bind(tinhQuang, congHien, userId).run();

        const updated = await env.DB.prepare(
          "SELECT tinh_quang_points, cong_hien_points FROM users WHERE id = ?"
        ).bind(userId).first();

        return new Response(JSON.stringify({ success: true, points: updated }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // 6. ENDPOINT PHASE 3: SỬ DỤNG VẬT PHẨM BUFF TRỰC TIẾP
      // ===================================================
      if (cleanPath === "/api/inventory/use-buff" && request.method === "POST") {
        const { userId, itemCode } = await request.json();
        if (!userId || !itemCode) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin!" }), { status: 400, headers: CORS_HEADERS });
        }

        // 1. Kiểm tra vật phẩm trong túi đồ D1
        const invItem = await env.DB.prepare(`
          SELECT * FROM user_inventory 
          WHERE user_id = ? AND item_code = ? AND is_used = 0 AND quantity > 0 
          LIMIT 1
        `).bind(userId, itemCode).first();

        if (!invItem) {
          return new Response(JSON.stringify({ error: "Vật phẩm không tồn tại hoặc đã hết!" }), { status: 400, headers: CORS_HEADERS });
        }

        // 2. Định nghĩa chỉ số buff theo itemCode
        // Lưu ý: BLESS_18 / BLESS_19 KHÔNG còn là buff (đã chuyển sang thẻ QR thực địa)
        // nên không được nhận diện ở đây — nếu gọi nhầm sẽ bị từ chối.
        let tq = 0, ch = 0;
        if (itemCode === "BLESS_03") tq = 1;      // +1 Tinh Quang
        if (itemCode === "BLESS_08") ch = 1;      // +1 Cống Hiến
        if (itemCode === "BLESS_09") ch = 2;      // +2 Cống Hiến

        if (tq === 0 && ch === 0) {
          return new Response(JSON.stringify({ error: "Vật phẩm này không phải Buff — hãy dùng mã QR tại thực địa!" }), 
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // 3. Trừ số lượng trong túi (hoặc xóa nếu quantity = 1)
        if (invItem.quantity > 1) {
          await env.DB.prepare(`
            UPDATE user_inventory SET quantity = quantity - 1 WHERE id = ?
          `).bind(invItem.id).run();
        } else {
          await env.DB.prepare(`
            DELETE FROM user_inventory WHERE id = ?
          `).bind(invItem.id).run();
        }

        // 4. Cộng điểm trực tiếp vào bảng users
        await env.DB.prepare(`
          UPDATE users SET 
            tinh_quang_points = tinh_quang_points + ?,
            cong_hien_points = cong_hien_points + ?
          WHERE id = ?
        `).bind(tq, ch, userId).run();

        // 5. Lấy lại số dư mới nhất
        const updatedUser = await env.DB.prepare(`
          SELECT tinh_quang_points, cong_hien_points FROM users WHERE id = ?
        `).bind(userId).first();

        return new Response(JSON.stringify({ 
          success: true, 
          points: updatedUser,
          buffApplied: { tq, ch }
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 7. ENDPOINT PHASE 3: KIỂM TRA TRẠNG THÁI QR OFFLINE
      // ===================================================
      if (cleanPath === "/api/inventory/check-qr" && request.method === "GET") {
        const qrToken = url.searchParams.get("token");
        if (!qrToken) return new Response(JSON.stringify({ error: "Missing token" }), { status: 400, headers: CORS_HEADERS });

        const item = await env.DB.prepare(`
          SELECT item_code, item_name, is_used, quantity FROM user_inventory WHERE qr_token = ?
        `).bind(qrToken).first();

        return new Response(JSON.stringify({ 
          success: true, 
          isUsed: item ? item.is_used === 1 : false,
          item: item
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // 1.B ENDPOINT: ĐĂNG NHẬP DÀNH CHO TÀI KHOẢN CŨ (LOGIN)
      // ===================================================
      if (cleanPath === "/api/auth/google-login" && request.method === "POST") {
        const { googleUser, gemData } = await request.json();
        if (!googleUser || !googleUser.email) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin Google!" }), { status: 400, headers: CORS_HEADERS });
        }

        const email = googleUser.email.toLowerCase().trim();
        const userId = googleUser.sub;

        // Tìm user theo Email hoặc Google Sub ID
        const user = await env.DB.prepare(`
          SELECT * FROM users WHERE email = ? OR id = ? LIMIT 1
        `).bind(email, userId).first();

        if (!user) {
          return new Response(JSON.stringify({ 
            success: false, 
            isNewUser: true, 
            message: "Tài khoản này chưa từng đăng ký. Vui lòng bấm Gacha Free để khởi tạo Căn Cước!" 
          }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // Lấy lại toàn bộ Tủ đá và Túi đồ của tài khoản cũ
        const gems = await env.DB.prepare("SELECT gem_code FROM user_gem_collection WHERE user_id = ?").bind(user.id).all();
        const items = await env.DB.prepare("SELECT * FROM user_inventory WHERE user_id = ? AND is_used = 0").bind(user.id).all();

        // Bóc tách thông tin bio
        let tribe = "Tự do", gender = "Nam", birthYear = "----";
        if (user.bio) {
          const match = user.bio.match(/Bộ tộc:\s*([^•]+)•\s*([^\(]+)\(([^\)]+)\)/);
          if (match) {
            tribe = match[1].trim();
            gender = match[2].trim();
            birthYear = match[3].trim();
          }
        }

        return new Response(JSON.stringify({
          success: true,
          isNewUser: false,
          user: {
            ...user,
            birth_year: birthYear,
            gender: gender,
            tribe: tribe,
            unlocked_gems: (gems.results || []).map(g => g.gem_code),
            inventory: items.results || []
          }
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

     // ===================================================
      // ENDPOINT: ĐIỂM DANH HẰNG NGÀY (STREAK 7 NGÀY)
      // ===================================================
      if (cleanPath === "/api/quest/checkin" && request.method === "POST") {
        const { userId } = await request.json();
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        // 1. Lấy ngày hôm nay và ngày hôm qua theo giờ VN (UTC+7)
        const nowMs = Date.now() + 7 * 3600 * 1000;
        const today = new Date(nowMs).toISOString().split("T")[0];
        const yesterday = new Date(nowMs - 24 * 3600 * 1000).toISOString().split("T")[0];

        // 2. Chặn nếu hôm nay đã điểm danh
        if (user.last_checkin_date === today) {
          return new Response(JSON.stringify({ error: "Hôm nay bạn đã điểm danh rồi! Hãy quay lại vào ngày mai." }), { status: 400, headers: CORS_HEADERS });
        }

        // 3. Tính chuỗi liên tiếp (ĐÃ SỬA: So sánh chuỗi ngày YYYY-MM-DD không còn lỗi TypeScript)
        let streak = 1;
        if (user.last_checkin_date === yesterday) {
          // Nếu ngày điểm danh trước là ngày hôm qua -> Tăng chuỗi
          streak = (user.checkin_streak || 0) + 1;
        } else {
          // Bỏ quên cách ngày -> Đứt chuỗi, đếm lại từ 1
          streak = 1;
        }

        // 4. Thưởng cơ bản: +1 Tinh Quang. Nếu đủ 7 ngày liên tục: thưởng thêm +1 (tổng +2)
        const isBonus = (streak % 7 === 0);
        const rewardPoints = isBonus ? 2 : 1;

        await env.DB.prepare(`
          UPDATE users SET 
            tinh_quang_points = tinh_quang_points + ?,
            last_checkin_date = ?,
            checkin_streak = ?
          WHERE id = ?
        `).bind(rewardPoints, today, streak, userId).run();

        const updated = await env.DB.prepare("SELECT tinh_quang_points, checkin_streak FROM users WHERE id = ?").bind(userId).first();

        return new Response(JSON.stringify({
          success: true,
          streak: streak,
          isBonus: isBonus,
          reward: rewardPoints,
          tinh_quang_points: updated.tinh_quang_points
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // ENDPOINT: LẤY BỘ 50 CÂU HỎI TỪ CLOUDFLARE KV
      // ===================================================
      if (cleanPath === "/api/quest/quiz-questions" && request.method === "GET") {
        let questions = null;
        if (env.QUIZ_KV)  {
          try {
            // Đọc dạng text trước để kiểm tra tính hợp lệ
            const raw = await env.QUIZ_KV.get("quiz_questions");
            if (raw) {
              questions = JSON.parse(raw);
            }
          } catch (jsonErr) {
            console.error("Lỗi cú pháp JSON trong KV:", jsonErr.message);
            // Báo lỗi rõ ràng nếu JSON trong KV bị sai cú pháp
            return new Response(JSON.stringify({ 
              error: `Nội dung JSON bị lỗi cú pháp: ${jsonErr.message}. Vui lòng kiểm tra lại trên jsonlint.com!` 
            }), { 
              status: 400, 
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
            });
          }
        }

        // Fallback câu hỏi nếu KV chưa kịp lưu
        if (!questions || !Array.isArray(questions)) {
          questions = [
            { id: 1, q: "Hội Ngọc Lục nằm ở vùng đất rừng nào?", a: ["Bảo Lộc", "Đà Lạt", "Sa Pa", "Cát Bà"], c: 0 },
            { id: 2, q: "Biến thể Tinh Quang Thạch có bao nhiêu bậc số mặt?", a: ["11 bậc", "6 bậc", "3 bậc", "30 bậc"], c: 0 },
            { id: 3, q: "Hệ đá nào đại diện cho Hỏa Diệm & Huyết Tinh?", a: ["🔥 Hệ 1", "☀️ Hệ 2", "❄️ Hệ 4", "⚡ Hệ 5"], c: 0 },
            { id: 4, q: "Vật phẩm nào nhóm lửa thắp sáng lều trại ban đêm?", a: ["Nhựa thông", "Ống tre", "Mảnh vải", "Khoai lang"], c: 0 },
            { id: 5, q: "Mỗi ngày Nhà Phiêu Lưu được điểm danh tối đa mấy lần?", a: ["1 lần", "2 lần", "3 lần", "Vô hạn"], c: 0 }
          ];
        }

        return new Response(JSON.stringify({ success: true, questions }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // ENDPOINT: HOÀN THÀNH QUIZ (THƯỞNG +1 TINH QUANG - MAX 1 LẦN/NGÀY)
      // ===================================================
      if (cleanPath === "/api/quest/quiz-complete" && request.method === "POST") {
        const { userId } = await request.json();
        const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
        const today = nowVN.toISOString().split("T")[0];

        let countToday = user.last_quiz_date === today ? (user.quiz_count_today || 0) : 0;
        if (countToday >= 1) { // 👈 SỐ GIỚI HẠN LÀM QUEST QUIZ
          return new Response(JSON.stringify({ error: "Nhà Phiêu Lưu đã hoàn thành Quest này hôm nay!" }), { status: 400, headers: CORS_HEADERS });
        }

        countToday += 1;
        // Thưởng 1 Tinh Quang 🔮 (đồng bộ với checkin / giới thiệu bạn bè / Nhập Vai Vui Vẻ)
        await env.DB.prepare(`
          UPDATE users SET 
            tinh_quang_points = tinh_quang_points + 1,
            last_quiz_date = ?,
            quiz_count_today = ?
          WHERE id = ?
        `).bind(today, countToday, userId).run();

        const updated = await env.DB.prepare("SELECT tinh_quang_points FROM users WHERE id = ?").bind(userId).first();

        return new Response(JSON.stringify({
          success: true,
          countToday: countToday,
          tinh_quang_points: updated.tinh_quang_points
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // QUEST MỚI: NHẬP VAI VUI VẺ (ROLL D20)
      // - Kịch bản tình huống lấy từ KV (key: rollquest_scenarios) - KV giờ CHỈ ĐỌC
      // - Bộ đếm lượt/ngày nằm trong D1 (cột last_rollquest_date + rollquest_* của users)
      // - Mỗi ngày tối đa 3 lượt, mỗi lượt 1 tình huống khác nhau
      // - Bắt đầu chơi = mất 1 lượt. Thắng lượt nào = +1 🔮 Tinh Quang (tối đa 3 điểm/ngày)
      // ===================================================

      // 1. Xem số lượt nhập vai còn lại hôm nay
      if (cleanPath === "/api/quest/rollquest-status" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const today = getTodayVN();
        const daily = await readRollQuestDaily(env, userId, today);
        if (!daily.exists) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        return new Response(JSON.stringify({
          success: true,
          used: daily.used,
          max: ROLLQUEST_MAX_PER_DAY,
          remaining: Math.max(0, ROLLQUEST_MAX_PER_DAY - daily.used),
          rewardedCount: daily.rewardedSlots.length
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // 2. Bắt đầu 1 lượt nhập vai: trừ 1 lượt ngày + trả về 1 tình huống chưa từng dùng hôm nay
      if (cleanPath === "/api/quest/rollquest-start" && request.method === "POST") {
        const { userId } = await request.json();
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const today = getTodayVN();
        const scenarios = await readRollQuestScenarios(env);

        // Thử tối đa 3 lần: nếu có request song song vừa chiếm lượt thì đọc lại trạng thái
        // mới rồi thử tiếp, thay vì báo nhầm "đã hết lượt".
        for (let attempt = 0; attempt < 3; attempt++) {
          const daily = await readRollQuestDaily(env, userId, today);
          if (!daily.exists) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

          if (daily.used >= ROLLQUEST_MAX_PER_DAY) {
            return new Response(JSON.stringify({
              error: `Nhà Phiêu Lưu đã nhập vai đủ ${ROLLQUEST_MAX_PER_DAY} lần trong ngày hôm nay! Hãy quay lại vào ngày mai nhé.`
            }), { status: 400, headers: CORS_HEADERS });
          }

          // Ưu tiên tình huống CHƯA dùng hôm nay để mỗi lượt là 1 kịch bản khác nhau
          let pool = scenarios.filter((s) => !daily.scenarioIds.includes(Number(s.id)));
          // Hết kịch bản chưa dùng (trường hợp hiếm) -> quay lại toàn bộ kho
          if (pool.length === 0) pool = scenarios;

          const scenario = pool[Math.floor(Math.random() * pool.length)];
          const scenarioIdCsv = String(Number(scenario.id));

          // Sang ngày mới (hoặc đang migrate từ KV): nạp trạng thái hôm nay vào D1
          if (daily.freshDay) {
            await env.DB.prepare(SQL_ROLLQUEST_RESET_DAY)
              .bind(today, daily.used, toCsv(daily.rewardedSlots), toCsv(daily.scenarioIds), userId, today).run();
          }

          // Tiêu 1 lượt bằng CAS: chỉ thành công khi giá trị vừa đọc vẫn còn nguyên
          const consumed = await env.DB.prepare(SQL_ROLLQUEST_CONSUME_SLOT)
            .bind(scenarioIdCsv, scenarioIdCsv, userId, today, daily.used, ROLLQUEST_MAX_PER_DAY).run();

          if (consumed.meta && consumed.meta.changes > 0) {
            const used = daily.used + 1;
            return new Response(JSON.stringify({
              success: true,
              scenario: scenario,
              attemptSlot: used, // slot 1-based của lượt vừa mở (dùng để chống thưởng trùng)
              used: used,
              remaining: Math.max(0, ROLLQUEST_MAX_PER_DAY - used)
            }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
          }
        }

        // 3 lần đều bị request khác chen vào -> báo tạm thời, client bấm lại sẽ thấy đúng số lượt
        return new Response(JSON.stringify({
          error: "Hệ thống đang bận, vui lòng thử mở lượt nhập vai lại!"
        }), { status: 409, headers: CORS_HEADERS });
      }

      // 3. Hoàn thành nhiệm vụ (người chơi thắng 2/3 lượt): thưởng +1 🔮 Tinh Quang
      // MỖI lượt thắng được thưởng 1 điểm -> tối đa ROLLQUEST_MAX_PER_DAY điểm/ngày.
      if (cleanPath === "/api/quest/rollquest-reward" && request.method === "POST") {
        const { userId, scenarioId, attemptSlot } = await request.json();
        if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: CORS_HEADERS });

        const today = getTodayVN();
        const daily = await readRollQuestDaily(env, userId, today);
        if (!daily.exists) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });

        // Chặn hack: phải đã mở lượt nhập vai hôm nay
        if (daily.used < 1) {
          return new Response(JSON.stringify({ error: "Chưa có lượt nhập vai nào được mở hôm nay!" }), { status: 400, headers: CORS_HEADERS });
        }

        const wantedId = (scenarioId === undefined || scenarioId === null) ? null : Number(scenarioId);

        // Xác định slot của lượt đang chơi (1-based).
        // Ưu tiên attemptSlot do client gửi; nếu không hợp lệ thì dò theo scenarioId (tương thích client cũ).
        let slot = Number.isInteger(attemptSlot) ? attemptSlot : 0;
        if (slot < 1 || slot > daily.used || daily.scenarioIds[slot - 1] === undefined) {
          const idx = (wantedId !== null && Number.isInteger(wantedId))
            ? daily.scenarioIds.indexOf(wantedId)
            : -1;
          if (idx < 0) {
            return new Response(JSON.stringify({ error: "Tình huống không hợp lệ với lượt nhập vai hiện tại!" }), { status: 400, headers: CORS_HEADERS });
          }
          slot = idx + 1;
        }

        // Chặn hack: scenarioId phải khớp đúng tình huống của slot này (nếu client có gửi)
        if (wantedId !== null && daily.scenarioIds[slot - 1] !== wantedId) {
          return new Response(JSON.stringify({ error: "Tình huống không hợp lệ với lượt nhập vai hiện tại!" }), { status: 400, headers: CORS_HEADERS });
        }

        const remaining = Math.max(0, ROLLQUEST_MAX_PER_DAY - daily.used);

        const readPoints = async () => {
          const row = await env.DB.prepare("SELECT tinh_quang_points FROM users WHERE id = ?").bind(userId).first();
          return row ? row.tinh_quang_points : 0;
        };

        // Lượt này đã được thưởng rồi -> vẫn coi là THẮNG, chỉ không cộng thêm điểm.
        // Trả success + reward:0 (không phải lỗi) để client không báo nhầm "nhận thưởng thất bại".
        if (daily.rewardedSlots.includes(slot)) {
          const current = await readPoints();
          return new Response(JSON.stringify({
            success: true,
            alreadyRewarded: true,
            reward: 0,
            used: daily.used,
            rewardedCount: daily.rewardedSlots.length,
            remaining: remaining,
            tinh_quang_points: current
          }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // CAS: đánh dấu slot đã thưởng + cộng 1 điểm Tinh Quang trong CÙNG một câu lệnh.
        // changes = 0 nghĩa là có request song song vừa thưởng chính slot này (hoặc ngày đã lật)
        // -> tuyệt đối KHÔNG cộng điểm lần nữa, trả alreadyRewarded cho client.
        const marked = await env.DB.prepare(SQL_ROLLQUEST_MARK_REWARDED)
          .bind(String(slot), String(slot), userId, today, slot, toCsv(daily.rewardedSlots)).run();

        const tinh_quang_points = await readPoints();

        if (!marked.meta || marked.meta.changes === 0) {
          return new Response(JSON.stringify({
            success: true,
            alreadyRewarded: true,
            reward: 0,
            used: daily.used,
            rewardedCount: daily.rewardedSlots.length,
            remaining: remaining,
            tinh_quang_points: tinh_quang_points
          }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({
          success: true,
          reward: 1,
          used: daily.used,
          rewardedCount: daily.rewardedSlots.length + 1,
          remaining: remaining,
          tinh_quang_points: tinh_quang_points
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // ENDPOINT: KẾT NỐI BẠN BÈ KHÔNG GIỚI HẠN (PAIRING 2 CHIỀU)
      // ===================================================
      if (cleanPath === "/api/quest/referral" && request.method === "POST") {
        const { userId, friendCode } = await request.json();
        if (!userId || !friendCode) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin kết nối!" }), { status: 400, headers: CORS_HEADERS });
        }

        // 1. Kiểm tra tài khoản của chính mình
        const me = await env.DB.prepare("SELECT id, adventurer_code FROM users WHERE id = ?").bind(userId).first();
        if (!me) {
          return new Response(JSON.stringify({ error: "Không tìm thấy tài khoản của bạn!" }), { status: 404, headers: CORS_HEADERS });
        }

        // Chống tự kết nối với chính mình
        if (me.adventurer_code === friendCode) {
          return new Response(JSON.stringify({ error: "Nhà Phiêu Lưu không thể tự kết nối với mã của chính mình!" }), { status: 400, headers: CORS_HEADERS });
        }

        // 2. Tìm người bạn qua mã AWxxxx
        const friend = await env.DB.prepare("SELECT id, full_name, adventurer_code FROM users WHERE adventurer_code = ?").bind(friendCode).first();
        if (!friend) {
          return new Response(JSON.stringify({ error: "Mã Nhà Phiêu Lưu không tồn tại trên hệ thống!" }), { status: 404, headers: CORS_HEADERS });
        }

        // 3. Chuẩn hóa cặp đôi (Sắp xếp ID theo thứ tự để A quét B hay B quét A đều là 1)
        const [userA, userB] = [me.id, friend.id].sort();

        // 4. Kiểm tra 2 người này đã từng kết nối với nhau chưa
        const existingPair = await env.DB.prepare(`
          SELECT id FROM user_connections WHERE user_a_id = ? AND user_b_id = ? LIMIT 1
        `).bind(userA, userB).first();

        if (existingPair) {
          return new Response(JSON.stringify({ 
            error: `Bạn và [${friend.full_name} - ${friend.adventurer_code}] đã kết nối với nhau trước đó rồi!` 
          }), { status: 400, headers: CORS_HEADERS });
        }

        // 5. Ghi nhận cặp đôi mới vào D1
        await env.DB.prepare(`
          INSERT INTO user_connections (user_a_id, user_b_id) VALUES (?, ?)
        `).bind(userA, userB).run();

        // 6. Cộng +1 Điểm Tinh Quang (🔮) cho CẢ HAI người chơi
        await env.DB.prepare("UPDATE users SET tinh_quang_points = tinh_quang_points + 1 WHERE id = ?").bind(me.id).run();
        await env.DB.prepare("UPDATE users SET tinh_quang_points = tinh_quang_points + 1 WHERE id = ?").bind(friend.id).run();

        // 7. Lấy lại số dư mới nhất của người quét
        const updatedMe = await env.DB.prepare("SELECT tinh_quang_points FROM users WHERE id = ?").bind(me.id).first();

        return new Response(JSON.stringify({
          success: true,
          friendName: friend.full_name,
          friendCode: friend.adventurer_code,
          tinh_quang_points: updatedMe.tinh_quang_points
        }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      // ===================================================
      // ADMIN TOOL: LẤY DANH SÁCH USER ĐỂ QUẢN LÝ AVATAR
      // ===================================================
      if (cleanPath === "/api/admin/users-list" && request.method === "GET") {
        const adminKey = request.headers.get("x-admin-key");
        // Mật khẩu bảo vệ tool cá nhân (bạn có thể đổi thành mật khẩu của riêng bạn)
        if (adminKey !== (env.ADMIN_SECRET_KEY || "AdvenatureAdmin2026@")) {
          return new Response(JSON.stringify({ error: "Sai mật mã Admin!" }), { status: 403, headers: CORS_HEADERS });
        }

        const list = await env.DB.prepare(`
          SELECT id, adventurer_code, full_name, email, avatar_url, class_name 
          FROM users 
          ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify({ success: true, users: list.results || [] }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // ADMIN TOOL: CẬP NHẬT AVATAR_URL TRỰC TIẾP CHO USER
      // ===================================================
      if (cleanPath === "/api/admin/update-user-avatar" && request.method === "POST") {
        const adminKey = request.headers.get("x-admin-key");
        if (adminKey !== (env.ADMIN_SECRET_KEY || "AdvenatureAdmin2026@")) {
          return new Response(JSON.stringify({ error: "Sai mật mã Admin!" }), { status: 403, headers: CORS_HEADERS });
        }

        const { targetUserId, newAvatarUrl } = await request.json();
        if (!targetUserId || !newAvatarUrl) {
          return new Response(JSON.stringify({ error: "Thiếu thông tin cập nhật!" }), { status: 400, headers: CORS_HEADERS });
        }

        await env.DB.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").bind(newAvatarUrl, targetUserId).run();

        return new Response(JSON.stringify({ success: true, newAvatarUrl }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // ===================================================
      // LEADERBOARD: QUANG THẠCH SƯU TẦM GIA (TOP 10, LOẠI TRỪ ADMIN)
      // Đếm số biến thể duy nhất (DISTINCT gem_code)
      // ===================================================
      if (cleanPath === "/api/leaderboard/gems" && request.method === "GET") {
        try {
          const rows = await env.DB.prepare(`
            SELECT 
              u.id,
              u.full_name,
              u.adventurer_code,
              u.avatar_url,
              u.role,
              COUNT(DISTINCT ug.gem_code) AS gem_count
            FROM users u
            JOIN user_gem_collection ug ON ug.user_id = u.id
            WHERE u.role NOT IN ('admin', 'manager')
            GROUP BY u.id, u.full_name, u.adventurer_code, u.avatar_url, u.role
            ORDER BY gem_count DESC, u.full_name ASC
            LIMIT 10
          `).all();

          return new Response(
            JSON.stringify({
              success: true,
              top: rows.results || [],
            }),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            {
              status: 500,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }
      }

      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
  }
};