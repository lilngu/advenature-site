import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
// IMPORT TOÀN BỘ DATA TĨNH TỪ DATA.JS (RÚT GỌN APP.JS) — dùng importmap @data (cache-busting v=20261001)
import { 
    CRYSTAL_PALETTES, 
    FACE_TIERS, 
    SHAPE_STYLES, 
    BLESSINGS_DATA, 
    SHOP_ITEMS, 
    QUIZ_LIST,
    LORE_PAGES_DATA,
    GUIDE_PAGES_DATA,
    MODAL_IMAGES,
    UPCOMING_FEATURES_DATA,
    GUILD_QUEST_DATA,
    GUILD_QUEST_META,
    GUILD_QUEST_MESSENGER_DEFAULT
} from '@data';
// TOAST NOTIFICATION SYSTEM — dùng importmap @toast
import { toast } from '@toast';
// QUEST "NHẬP VAI VUI VẺ" - MODULE RPG ROLL D20 — dùng importmap @rollquest
import { initRollQuest, openRollQuest, refreshRollQuestBadge } from '@rollquest';
// BUTTON VFX PARTICLE SYSTEM — dùng importmap @vfx
import { initButtonVFX } from '@vfx';
// I18N SYSTEM — dùng importmap @i18n
import { applyI18n, applyI18nToElement } from '@i18n';
// MODULE 3D "CỔNG MA THUẬT" — dùng importmap @portal (dùng chung scene/camera của app.js)
import { createPortalScene } from '@portal';
// SFX MODULE — hệ thống hiệu ứng âm thanh — dùng importmap @sfx
// mountAudioElements dựng toàn bộ <audio> từ manifest AUDIO_SOURCES trong data.js
import { mountAudioElements, initSfx, setMainBgm, setMainBgmResumeHandler, isSfxDucking, isQuestBgmActive, sfxGacha, sfxTeleport, sfxBlanket, sfxBlink, sfxGuild, sfxBlessing, sfxWoodbox, sfxPaper, sfxBell, sfxCoin } from '@sfx';

// Hằng số toán học dùng chung (Golden Angle cho phân bố đều trên cầu)
const GOLDEN_ANGLE = Math.PI * (Math.sqrt(5) - 1);

// ======================================================
// 1. CONFIG & DATA SYNC (BỎ DẤU / Ở CUỐI TRÁNH LỖI 404)
// ======================================================
const API_URL = "https://advenature-api.lilnguyen-dcr.workers.dev";
const GOOGLE_CLIENT_ID = "581456693359-uuhqadehjdotrjr37mo8iei02pvilthf.apps.googleusercontent.com";
const CLOUDINARY_CLOUD_NAME = "aurorawoods"; 
const CLOUDINARY_UPLOAD_PRESET = "advenature";

let tempGoogleProfile = null;
let selectedClass = "Ranger";
window.isFastGachaEnabled = false;

let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || null;

// MIGRATION: Hệ thống Tinh Thạch đã bị gỡ khỏi dữ liệu người chơi.
// Người chơi chỉ còn 3 nguồn tích lũy: Tinh Quang, bộ sưu tầm Quang Thạch, Cống Hiến.
// Dọn sạch trường cũ trong localStorage để không còn dữ liệu rác.
if (currentUser && "tinh_thach_points" in currentUser) {
    delete currentUser.tinh_thach_points;
    saveUserData();
}

if (!currentUser) {
    currentUser = {
        id: "AW_USER_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        full_name: "Nhà Phiêu Lưu",
        adventurer_code: "AW----",
        role: "Tân Thủ Rừng Già",
        tinh_quang_points: 1, // Lần đầu Free
        cong_hien_points: 0,
        gacha_counter: 0,
        unlocked_gems: [],
        inventory: []
    };
    saveUserData();
}

// app.js: Đặt ngay bên dưới đoạn khai báo currentUser
const isFirstTimeGuest = !currentUser || !currentUser.adventurer_code || currentUser.adventurer_code === "AW----";

const scrollBanner = document.getElementById("welcomeScrollBanner");
const guestHelper = document.getElementById("guestHelper");
const guideHelper = document.getElementById("guideHelper");
const guideReaderModal = document.getElementById("guideReaderModal");
const loreHelper = document.getElementById("loreHelper");
const loreReaderModal = document.getElementById("loreReaderModal");
// Bảng Quest tại Hội Ngọc Lục (mở từ #loreHelper). Khai báo ở đây vì khối guest-mode
// bên dưới cần tới trước khi phần module phía dưới chạy (tránh temporal dead zone).
const guildQuestModal = document.getElementById("guildQuestModal");
const guildQuestBox = document.getElementById("guildQuestBox");
const guildQuestGrid = document.getElementById("guildQuestGrid");
const guildQuestTitle = document.getElementById("guildQuestTitle");
// Cổng 3D góc màn hình (góc phải 10px, cách top 10%) — điều kiện hiện/ẩn giống loreHelper
const cornerPortal3D = document.getElementById("cornerPortal3D");
const CORNER_PORTAL_LINK = "https://www.facebook.com/groups/nhaphieuluuxanh";
// Khai báo ở đầu file vì initLoreHelper() được gọi ngay khi load trang (tránh temporal dead zone)
let cornerPortal = null;
const dockGachaTrigger = document.getElementById("dockGachaTrigger");
const gachaReadyTooltip = document.getElementById("gachaReadyTooltip");
let guestHelperShown = false;
let guideHelperShown = false;
let guideReaderOpen = false;
let loreHelperShown = false;
let gachaReadyTooltipShown = false;

// Click Tinh Linh hướng dẫn / Cổ thư -> SFX lật giấy + mở modal.
// Bind 1 lần ở top-level (openGuideReaderModal/openLoreReaderModal là function
// declaration nên đã hoisted) vì initGuideHelper()/initLoreHelper() có thể chạy
// lại nhiều lần trong 1 phiên (đăng nhập / đăng ký) — bind bên trong sẽ nhân bản listener.
guideHelper?.addEventListener("click", () => {
    sfxPaper();
    openGuideReaderModal();
});
// #loreHelper mở BẢNG QUEST TẠI HỘI NGỌC LỤC (#guildQuestModal).
// openLoreReaderModal() vẫn được dùng bởi nút Brochure (btnOpenBrochureModal).
loreHelper?.addEventListener("click", () => {
    sfxPaper();
    openGuildQuestModal();
});

// Timeout IDs để cancel khi Gacha bắt đầu
let guideHelperInitTimeout = null;
let loreHelperInitTimeout = null;

// State machine - MUST be declared early for helpers to access
const STATE = { IDLE: "idle", GACHA: "gacha", CORE: "core", LOOT: "loot", CLAIMED: "claimed" };
let state = STATE.IDLE;
let stateStart = performance.now();

// Lore Reader state - MUST be declared early for event handlers
let loreReaderOpen = false;

// Keyboard navigation for readers (added once)
document.addEventListener("keydown", (e) => {
    if (guideReaderOpen) handleGuideReaderKeydown(e);
    if (loreReaderOpen) handleLoreReaderKeydown(e);
});

if (isFirstTimeGuest) {
    // Bật chế độ khách: Ẩn menu đáy, đưa nút Gacha ra giữa màn hình
    document.body.classList.add("guest-mode");
    if (guideHelper) guideHelper.classList.add("hidden");
    if (guideReaderModal) guideReaderModal.classList.add("hidden");
    if (loreHelper) loreHelper.classList.add("hidden");
    if (loreReaderModal) loreReaderModal.classList.add("hidden");
    if (guildQuestModal) guildQuestModal.classList.add("hidden");

    // Bắt sự kiện click vào Cuộn giấy cổ: trượt xuống dưới rồi biến mất
    if (scrollBanner) {
        scrollBanner.addEventListener("click", () => {
            scrollBanner.classList.add("slide-down-exit");
            setTimeout(() => {
                scrollBanner.style.display = "none";
                // Show Guest Helper sau khi banner ẩn xong
                setTimeout(showGuestHelper, 300);
            }, 600); // Ẩn hoàn toàn sau khi chạy xong animation 0.6s
        });
    }
} else {
    // Người dùng đã có tài khoản: ẩn banner cuộn giấy ngay từ đầu
    if (scrollBanner) scrollBanner.style.display = "none";
    if (guestHelper) guestHelper.classList.add("hidden");
    // Khởi tạo Guide Helper cho user đã login
    initGuideHelper();
    // Khởi tạo Lore Helper cho user đã login
    initLoreHelper();
    // Initialize Gacha Ready Tooltip check
    updateGachaReadyTooltip();
}

// ======================================================
// I18N: Apply translations ngay sau khi DOM elements đã có
// ======================================================
applyI18n();

// ======================================================
// MODAL IMAGES: nạp link ảnh từ data.js vào các thẻ <img data-modal-img>
// ======================================================
document.querySelectorAll("[data-modal-img]").forEach((img) => {
    const url = MODAL_IMAGES?.[img.dataset.modalImg];
    if (url) img.src = url;
});

// ======================================================
// BACKGROUND MUSIC (BGM) - phát sau tương tác thật của người dùng
// ======================================================
// Autoplay policy chặn play() khi chưa có user activation. Nguyên tắc:
//   1. Chỉ đánh dấu "đang phát" SAU khi promise play() resolve thành công.
//   2. play() bị reject thì GIỮ listener để thử lại ở lượt tương tác kế tiếp.
//   3. Bỏ qua event tổng hợp (element.click(), dispatchEvent) vì chúng không
//      cấp user activation.
//   4. bgmUserEnabled = ý chí của user. Tự pause khi đổi tab KHÔNG được coi
//      là user tắt nhạc, nên quay lại tab sẽ phát tiếp.
const BGM_DEFAULT_VOLUME = 0.3;
const BGM_VOLUME_KEY = 'advenature_bgm_volume';
const BGM_ENABLED_KEY = 'advenature_bgm_enabled';

// BGM nền lấy từ manifest audio (data.js -> AUDIO_SOURCES), không khai báo thẻ <audio> trong HTML
const bgmAudio = mountAudioElements().bgm;
const bgmToggleBtn = document.getElementById('btnToggleBGM');
const bgmToggleIco = document.getElementById('bgmToggleIco');

// Nguồn sự thật xem BGM có đang phát là bgmAudio.paused của chính phần tử <audio>.
// KHÔNG dùng cờ bool phụ (bgmPlaying): sau khi pause() theo trạng thái tab, listener
// 'pause' cố tình bỏ qua nên cờ đó giữ giá trị cũ -> quay lại tab bị chặn ở guard,
// khiến BGM không phát lại được.
let bgmPending = false;             // đang chờ play() settle, chống gọi chồng
let bgmUserEnabled = localStorage.getItem(BGM_ENABLED_KEY) !== 'false';
let bgmPausedByVisibility = false;  // đang tạm dừng do đổi tab

function getBGMVolume() {
    const saved = parseFloat(localStorage.getItem(BGM_VOLUME_KEY));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : BGM_DEFAULT_VOLUME;
}

// Đồng bộ icon + tooltip của nút theo trạng thái
function syncBGMToggleUI() {
    if (!bgmToggleBtn) return;
    const label = bgmUserEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền';
    bgmToggleBtn.classList.toggle('is-off', !bgmUserEnabled);
    bgmToggleBtn.setAttribute('aria-pressed', String(bgmUserEnabled));
    bgmToggleBtn.setAttribute('aria-label', label);
    bgmToggleBtn.title = label;
    if (bgmToggleIco) bgmToggleIco.textContent = bgmUserEnabled ? '♫♪' : '❚❚';
}

function attachBgmListeners() {
    // Capture phase: bắt được gesture trước khi handler khác stopPropagation
    document.addEventListener('pointerdown', tryPlayBGM, true);
    document.addEventListener('touchend', tryPlayBGM, true);
    document.addEventListener('keydown', tryPlayBGM, true);
}

function detachBgmListeners() {
    document.removeEventListener('pointerdown', tryPlayBGM, true);
    document.removeEventListener('touchend', tryPlayBGM, true);
    document.removeEventListener('keydown', tryPlayBGM, true);
}

async function tryPlayBGM(event) {
    if (!bgmAudio || bgmPending || !bgmUserEnabled) return;
    // Đã phát rồi -> không cần làm gì. Dùng paused của <audio> làm chuẩn để luôn khớp
    // thực tế, kể cả sau khi bị chính trình duyệt/OS tạm dừng (resource saver).
    if (!bgmAudio.paused) return;
    // Quest BGM đang chiếm sân khấu -> giữ nguyên BGM nền ở trạng thái tạm dừng
    if (isQuestBgmActive()) return;
    // event === undefined nghĩa là gọi thủ công (không qua gesture)
    if (event && event.isTrusted === false) return;

    bgmPending = true;
    // Không ghi đè volume khi SFX đang duck BGM
    if (!isSfxDucking()) bgmAudio.volume = getBGMVolume();

    try {
        await bgmAudio.play();
        bgmPausedByVisibility = false;
        detachBgmListeners();   // chỉ gỡ khi thực sự phát được
    } catch (err) {
        // Giữ/re-arm listener để lần tương tác thật kế tiếp thử lại
        attachBgmListeners();
        console.warn(`BGM chưa phát được (${err?.name}), sẽ thử lại khi bạn tương tác.`);
    } finally {
        bgmPending = false;
    }
}

// === TỰ PAUSE KHI RỜI TAB / THOÁT BROWSER ===

// Đổi tab hoặc minimize cửa sổ -> dừng nhạc cho đỡ tốn tài nguyên.
// Quay lại tab -> phát lại (user chưa chủ động tắt nhạc).
document.addEventListener('visibilitychange', () => {
    if (!bgmAudio) return;

    if (document.hidden) {
        if (!bgmAudio.paused) {
            bgmPausedByVisibility = true;
            bgmAudio.pause();
        }
        return;
    }

    // Quay lại tab: luôn thử phát lại nếu user chưa tắt nhạc.
    // tryPlayBGM tự no-op nếu đang phát rồi, đang chờ play() settle,
    // hoặc quest BGM đang chiếm sân khấu.
    bgmPausedByVisibility = false;
    if (bgmUserEnabled) tryPlayBGM();
});

// Đóng tab / chuyển trang -> pagehide đáng tin hơn beforeunload trên mobile
window.addEventListener('pagehide', () => {
    if (!bgmAudio || bgmAudio.paused) return;
    bgmPausedByVisibility = true;
    bgmAudio.pause();
});
// Bfcache: quay lại qua nút Back cần resume
window.addEventListener('pageshow', (e) => {
    if (!e.persisted || !bgmUserEnabled) return;
    bgmPausedByVisibility = false;
    tryPlayBGM();
});

// Thử phát ngay khi tải trang (một số cấu hình browser cho phép)
attachBgmListeners();
if (bgmUserEnabled) tryPlayBGM();

// Tự phục hồi nếu OS/trình duyệt suspend nhạc giữa chừng
bgmAudio?.addEventListener('pause', () => {
    // Bỏ qua nếu do đổi tab: visibilitychange/pageshow sẽ tự phát lại,
    // không cần re-arm listener thừa ở đây.
    if (bgmPausedByVisibility) return;
    attachBgmListeners();
});

// Bật/tắt nhạc (dùng chung cho nút UI và console)
async function setBGMEnabled(enabled) {
    if (!bgmAudio) return;
    bgmUserEnabled = !!enabled;
    localStorage.setItem(BGM_ENABLED_KEY, String(bgmUserEnabled));
    syncBGMToggleUI();

    if (bgmUserEnabled) {
        // Nút bấm là user activation thật nên play() chắc chắn được.
        // Nếu quest đang mở thì chỉ ghi nhớ ý chí, BGM nền sẽ phát lại khi thoát quest.
        bgmPausedByVisibility = false;
        await tryPlayBGM();
    } else {
        bgmPausedByVisibility = false;
        bgmAudio.pause();
    }
}

// Nút toggle: user chủ động bật/tắt
bgmToggleBtn?.addEventListener('click', () => {
    setBGMEnabled(!bgmUserEnabled);
});

syncBGMToggleUI();

// Điều khiển thủ công (console hoặc UI sau này)
window.setBGMVolume = (vol) => {
    const v = Math.min(1, Math.max(0, Number(vol) || 0));
    localStorage.setItem(BGM_VOLUME_KEY, String(v));
    if (bgmAudio) {
        bgmAudio.volume = v;
        setMainBgm(bgmAudio); // cập nhật mốc để SFX duck về đúng volume
    }
};
window.toggleBGM = () => setBGMEnabled(!bgmUserEnabled);

// ======================================================
// SFX: khởi tạo sau khi BGM sẵn sàng để lấy volume làm mốc duck
// ======================================================
initSfx(bgmAudio);
// Quest BGM cần nhường chỗ cho BGM nền của trang. app.js giữ quyền quyết định
// phát lại (vì còn phụ thuộc bgmUserEnabled + autoplay policy), nên đăng ký callback.
setMainBgmResumeHandler(() => {
    bgmPausedByVisibility = false;
    tryPlayBGM();
});

// ======================================================
// PHASE 3: ĐỒNG BỘ DỮ LIỆU TỪ D1 KHI MỞ TRANG HOẶC VÀO TÚI ĐỒ
// ======================================================
// app.js: Cập nhật hàm syncUserDataFromBackend để phát hiện điểm mới từ bạn bè
async function syncUserDataFromBackend() {
    if (!currentUser || !currentUser.id || currentUser.id.startsWith("AW_USER_")) return;

    try {
        const res = await fetch(`${API_URL}/api/user/sync?userId=${currentUser.id}`);
        const data = await res.json();
        if (data.success && data.user) {
            // Kiểm tra nếu điểm Tinh Quang từ D1 cao hơn số điểm hiện tại ở máy
            const oldTQ = currentUser.tinh_quang_points || 0;
            const newTQ = data.user.tinh_quang_points || 0;

            if (newTQ > oldTQ) {
                const gained = newTQ - oldTQ;
                // Bật thông báo nhẹ nhàng cho người chơi
                console.log(`🎉 Bạn nhận được +${gained} 🔮 Tinh Quang mới từ hệ thống hoặc bạn bè!`);
            }

            currentUser.tinh_quang_points = newTQ;
            currentUser.cong_hien_points = data.user.cong_hien_points;
            currentUser.gacha_counter = data.user.gacha_counter;
            currentUser.role = data.user.role || currentUser.role;
            currentUser.unlocked_gems = data.user.unlocked_gems || [];

            if (data.user.inventory) {
                currentUser.inventory = mapInventoryFromBackend(data.user.inventory);
            }

            saveUserData();
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();
        }
    } catch (e) {
        console.warn("Chưa đồng bộ được với D1:", e);
    }
}

function saveUserData() {
    localStorage.setItem("advenature_user", JSON.stringify(currentUser));
}

// ======================================================
// GUEST HELPER FAIRY LOGIC
// ======================================================
function getGuestHelperTargetPosition() {
    const gachaBtn = dockGachaTrigger;
    if (!gachaBtn) return { top: '20vh', right: '10vw' };
    
    const orbRect = gachaBtn.querySelector('.gold-ring')?.getBoundingClientRect() || gachaBtn.getBoundingClientRect();
    
    // Góc top-right của orb (trừ kích thước fairy ~90px)
    return {
        top: (orbRect.top - 20) + 'px',      
        right: (window.innerWidth - orbRect.right - 10) + 'px'
    };
}

function showGuestHelper() {
    if (guestHelperShown || !document.body.classList.contains('guest-mode') || !guestHelper) return;
    guestHelperShown = true;
    
    // SFX: tiếng teleport khi Guest Helper xuất hiện
    sfxTeleport();
    
    const pos = getGuestHelperTargetPosition();
    
    // Reset classes
    guestHelper.classList.remove('hidden', 'exit-to-right');
    guestHelper.classList.add('enter-from-top-right');
    
    // Force reflow
    guestHelper.offsetHeight;
    
    // Bắt đầu animation vào
    requestAnimationFrame(() => {
        guestHelper.classList.remove('enter-from-top-right');
        guestHelper.classList.add('active');
        guestHelper.style.top = pos.top;
        guestHelper.style.right = pos.right;
    });
}

function hideGuestHelper() {
    if (!guestHelperShown || !guestHelper) return;
    guestHelper.classList.remove('active', 'enter-from-top-right');
    guestHelper.classList.add('exit-to-right');
    
    setTimeout(() => {
        guestHelper.classList.add('hidden');
        guestHelper.classList.remove('exit-to-right');
    }, 800);
}

// ======================================================
// GUIDE HELPER FAIRY LOGIC (Cho user đã login)
// ======================================================
function getGuideHelperTargetPosition() {
    const gachaBtn = dockGachaTrigger;
    if (!gachaBtn) return { top: '20vh', left: '10vw' };
    
    const orbRect = gachaBtn.querySelector('.gold-ring')?.getBoundingClientRect() || gachaBtn.getBoundingClientRect();
    
    // Góc top-left của orb (trừ kích thước fairy ~90px)
    return {
        top: (orbRect.top - 50) + 'px',
        left: (orbRect.left - 100) + 'px'
    };
}

function initGuideHelper() {
    if (!guideHelper || !guideReaderModal || document.body.classList.contains('guest-mode')) return;
    
    // Hiện guide helper sau 2s khi ở gacha-view
    const checkAndShowGuideHelper = () => {
        const gachaView = document.getElementById("gacha-view");
        if (gachaView && gachaView.classList.contains("active") && !gachaView.classList.contains("hidden")) {
            if (!guideHelperShown) {
                return setTimeout(showGuideHelper, 2000);
            }
        }
        return null;
    };
    
    // Kiểm tra ngay lập tức
    checkAndShowGuideHelper();
    
    // Theo dõi khi chuyển view về gacha-view
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.dataset.target === "gacha-view") {
                setTimeout(() => {
                    guideHelperInitTimeout = checkAndShowGuideHelper();
                    updateGachaReadyTooltip();
                }, 100);
            }
        });
    });
    
    // Click guide helper -> mở guide reader modal (đã bind + SFX ở top-level)
    
    // Close guide reader modal
    const closeGuideReader = document.getElementById("closeGuideReader");
    closeGuideReader?.addEventListener("click", () => {
        closeGuideReaderModal();
    });
    
    // Click outside modal để đóng
    guideReaderModal.addEventListener("click", (e) => {
        if (e.target === guideReaderModal) {
            closeGuideReaderModal();
        }
    });
}

function showGuideHelper() {
    // Không show nếu Gacha đang chạy
    if (state !== STATE.IDLE) return;
    if (guideHelperShown || document.body.classList.contains('guest-mode') || !guideHelper) return;
    guideHelperShown = true;
    
    const pos = getGuideHelperTargetPosition();
    
    // Reset classes
    guideHelper.classList.remove('hidden', 'exit-to-right');
    guideHelper.classList.add('enter-from-bottom-left');
    
    // Force reflow
    guideHelper.offsetHeight;
    
    // Bắt đầu animation vào
    requestAnimationFrame(() => {
        guideHelper.classList.remove('enter-from-bottom-left');
        guideHelper.classList.add('active');
        guideHelper.style.top = pos.top;
        guideHelper.style.left = pos.left;
    });
}

// ======================================================
// HIDE HELPER FUNCTIONS (Khi Gacha triggered)
// ======================================================
function hideGuideHelper() {
    if (!guideHelperShown || !guideHelper) return;
    guideHelperShown = false;  // Reset flag để có thể show lại sau
    guideHelper.classList.remove('active', 'enter-from-bottom-left');
    guideHelper.classList.add('exit-to-left');  // Bay sang trái
    
    setTimeout(() => {
        guideHelper.classList.add('hidden');
        guideHelper.classList.remove('exit-to-left');
    }, 800);
}

function hideLoreHelper() {
    hideCornerPortal();  // Cổng 3D đi kèm lore helper
    if (!loreHelperShown || !loreHelper) return;
    loreHelperShown = false;  // Reset flag để có thể show lại sau
    loreHelper.classList.remove('active', 'enter-from-top-right-far');
    loreHelper.classList.add('exit-to-right');  // Bay sang phải
    
    setTimeout(() => {
        loreHelper.classList.add('hidden');
        loreHelper.classList.remove('exit-to-right');
    }, 800);
}

// ======================================================
// CORNER PORTAL 3D (Cổng ma thuật góc màn hình)
// Dùng chung điều kiện hiển thị với loreHelper:
//   - Chỉ cho user đã đăng nhập (không guest-mode)
//   - Chỉ ở gacha-view và state IDLE
// Click vào cổng -> mở https://rungtinhlinh.pages.dev/
// ======================================================
function initCornerPortal() {
    if (cornerPortal || !cornerPortal3D) return;

    // Module dựng scene riêng trong khung #cornerPortal3D (nền trong suốt, không bloom).
    // Khung nhỏ (132x178) nên camera phải gần hơn bản portal.html rất nhiều.
    cornerPortal = createPortalScene({
        container: '#cornerPortal3D',
        exposure: 1.45,            // Không có bloom -> nâng exposure để cổng vẫn rõ
        pixelRatio: 1.5,            // Khung nhỏ -> không cần DPR 2
        fitOptions: {
            distance: 4.9,
            mobileDistance: 5.2,
            mobileAspectFactor: 3.2,
            mobileLift: 0.15
        },
        portals: [{
            id: 'corner-rtl',
            position: [0, 0, 0],
            size: { width: 3.0, height: 3.8 },
            strokeCount: 14,
            colors: { primary: 0xff007f, secondary: 0x00f0ff, core: 0x5379b5 },
            // Chuyển trang trực tiếp (không mở tab mới như bản portal.html)
            onSelect: () => { window.location.href = CORNER_PORTAL_LINK; }
        }]
    });

    // Tạo xong thì chưa render cho tới khi được hiện (tiết kiệm GPU)
    cornerPortal?.setActive(false);
}

function showCornerPortal() {
    // Điều kiện hiển thị y hệt loreHelper
    if (document.body.classList.contains('guest-mode') || !cornerPortal3D) return;
    if (state !== STATE.IDLE) return;

    const gachaView = document.getElementById("gacha-view");
    if (!gachaView || !gachaView.classList.contains("active") || gachaView.classList.contains("hidden")) return;

    // Bỏ 'hidden' TRƯỚC khi dựng scene để renderer đo đúng kích thước khung ngay lập tức
    cornerPortal3D.classList.remove('hidden', 'exit-to-right');
    initCornerPortal();
    if (!cornerPortal) return;

    // Force reflow để transition chạy từ vị trí ẩn
    cornerPortal3D.offsetHeight;
    cornerPortal3D.classList.add('active');
    cornerPortal.setActive(true);
    cornerPortal.resize();  // Khung vừa từ display:none -> tràn ra, đo lại cho chắc
}

function hideCornerPortal() {
    if (!cornerPortal || !cornerPortal3D) return;
    cornerPortal.setActive(false);
    cornerPortal3D.classList.remove('active');
    cornerPortal3D.classList.add('exit-to-right');

    setTimeout(() => {
        if (cornerPortal3D.classList.contains('active')) return;  // Đã show lại trong lúc chờ
        cornerPortal3D.classList.add('hidden');
        cornerPortal3D.classList.remove('exit-to-right');
    }, 800);
}

// ======================================================
// GACHA READY TOOLTIP LOGIC
// ======================================================
function getTinhQuangValue() {
    const valElement = document.getElementById('valTinhQuang');
    return valElement ? parseInt(valElement.textContent.replace(/,/g, '')) || 0 : 0;
}

function updateGachaReadyTooltip() {
    if (!gachaReadyTooltip) return;
    
    // Không show tooltip ở guest mode
    if (document.body.classList.contains('guest-mode')) {
        hideGachaReadyTooltip();
        return;
    }
    
    const tinhQuangValue = getTinhQuangValue();
    const gachaView = document.getElementById("gacha-view");
    const isGachaViewActive = gachaView && gachaView.classList.contains("active") && !gachaView.classList.contains("hidden");
    const isIdle = state === STATE.IDLE;
    
    // Show tooltip when: in gacha-view, IDLE state, and valTinhQuang > 0
    const shouldShow = isGachaViewActive && isIdle && tinhQuangValue > 0;
    
    if (shouldShow && !gachaReadyTooltipShown) {
        showGachaReadyTooltip();
    } else if (!shouldShow && gachaReadyTooltipShown) {
        hideGachaReadyTooltip();
    }
}

function showGachaReadyTooltip() {
    if (gachaReadyTooltipShown || !gachaReadyTooltip) return;
    // Không show nếu Gacha đang chạy
    if (state !== STATE.IDLE) return;
    
    const tinhQuangValue = getTinhQuangValue();
    if (tinhQuangValue <= 0) return;
    
    const gachaView = document.getElementById("gacha-view");
    if (!gachaView || !gachaView.classList.contains("active") || gachaView.classList.contains("hidden")) return;
    
    gachaReadyTooltipShown = true;
    gachaReadyTooltip.classList.remove('hidden');
    // Force reflow
    gachaReadyTooltip.offsetHeight;
    // Trigger animation
    requestAnimationFrame(() => {
        gachaReadyTooltip.classList.add('show');
    });
}

function hideGachaReadyTooltip() {
    if (!gachaReadyTooltipShown || !gachaReadyTooltip) return;
    gachaReadyTooltipShown = false;
    gachaReadyTooltip.classList.remove('show');
    // Add exit animation
    gachaReadyTooltip.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    gachaReadyTooltip.style.opacity = '0';
    gachaReadyTooltip.style.transform = 'translateY(-50%) scale(0.8)';
    gachaReadyTooltip.style.right = '-120px';
    
    setTimeout(() => {
        gachaReadyTooltip.classList.add('hidden');
        // Reset inline styles
        gachaReadyTooltip.style.transition = '';
        gachaReadyTooltip.style.opacity = '';
        gachaReadyTooltip.style.transform = '';
        gachaReadyTooltip.style.right = '';
    }, 300);
}

// ======================================================
// HELPER: Trigger Guide & Lore Helpers sau khi login xong
// ======================================================
function triggerHelpersAfterLogin() {
    // Chỉ trigger nếu đang ở gacha-view và state IDLE
    const gachaView = document.getElementById("gacha-view");
    if (gachaView && gachaView.classList.contains("active") && !gachaView.classList.contains("hidden") && state === STATE.IDLE) {
        // Clear any existing init timeouts
        if (guideHelperInitTimeout) clearTimeout(guideHelperInitTimeout);
        if (loreHelperInitTimeout) clearTimeout(loreHelperInitTimeout);
        
        // Reset flags
        guideHelperShown = false;
        loreHelperShown = false;
        
        // Show both after 3 seconds
        guideHelperInitTimeout = setTimeout(showGuideHelper, 3000);
        loreHelperInitTimeout = setTimeout(showLoreHelper, 3000);
        
        // Update Gacha Ready Tooltip
        updateGachaReadyTooltip();
    }
}

// ======================================================
// LORE HELPER FAIRY LOGIC (Cổ thư lật trang - Cho user đã login)
// ======================================================
function getLoreHelperTargetPosition() {
    const gachaBtn = dockGachaTrigger;
    if (!gachaBtn) return { top: '20vh', right: '10vw' };
    
    const orbRect = gachaBtn.querySelector('.gold-ring')?.getBoundingClientRect() || gachaBtn.getBoundingClientRect();
    
    // Vị trí cách top-right Gacha Orb 150px bên phải
    return {
        top: (orbRect.top - 150) + 'px',
        right: (window.innerWidth - orbRect.right + -100) + 'px'
    };
}

function initLoreHelper() {
    if (!loreHelper || !loreReaderModal || document.body.classList.contains('guest-mode')) return;
    
    // Hiện lore helper sau 5s khi ở gacha-view
    const checkAndShowLoreHelper = () => {
        const gachaView = document.getElementById("gacha-view");
        if (gachaView && gachaView.classList.contains("active") && !gachaView.classList.contains("hidden")) {
            if (!loreHelperShown) {
                return setTimeout(showLoreHelper, 5000);
            }
        }
        return null;
    };
    
    // Cổng 3D được dựng lazily trong showCornerPortal() để không tốn WebGL context khi chưa cần

    // Kiểm tra ngay lập tức
    loreHelperInitTimeout = checkAndShowLoreHelper();
    
    // Theo dõi khi chuyển view về gacha-view
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.dataset.target === "gacha-view") {
                setTimeout(() => {
                    loreHelperInitTimeout = checkAndShowLoreHelper();
                    updateGachaReadyTooltip();
                }, 100);
            }
        });
    });
    
    // Click lore helper -> mở lore reader modal (đã bind + SFX ở top-level)
    
    // Close lore reader modal
    const closeLoreReader = document.getElementById("closeLoreReader");
    closeLoreReader?.addEventListener("click", () => {
        closeLoreReaderModal();
    });
    
    // Click outside modal để đóng
    loreReaderModal.addEventListener("click", (e) => {
        if (e.target === loreReaderModal) {
            closeLoreReaderModal();
        }
    });
}

function showLoreHelper() {
    // Không show nếu Gacha đang chạy
    if (state !== STATE.IDLE) return;
    if (document.body.classList.contains('guest-mode')) return;
    // Cổng 3D đi kèm: show trước để không bị bỏ sót khi lore helper đã hiện từ lần trước
    showCornerPortal();
    if (loreHelperShown || !loreHelper) return;
    loreHelperShown = true;
    
    const pos = getLoreHelperTargetPosition();
    
    // Reset classes
    loreHelper.classList.remove('hidden', 'exit-to-right');
    loreHelper.classList.add('enter-from-top-right-far');
    
    // Force reflow
    loreHelper.offsetHeight;
    
    // Bắt đầu animation vào
    requestAnimationFrame(() => {
        loreHelper.classList.remove('enter-from-top-right-far');
        loreHelper.classList.add('active');
        loreHelper.style.top = pos.top;
        loreHelper.style.right = pos.right;
    });
}

// ======================================================
// BẢNG QUEST TẠI HỘI NGỌC LỤC (#guildQuestModal)
// Mở bằng cách click #loreHelper. Ảnh lấy từ data.js -> GUILD_QUEST_DATA.
// Layout 2 cột rời rạc tự động: thêm/bớt ảnh trong data.js là xong, không cần sửa file này.
// Click vào tờ ảnh -> xem lightbox toàn màn hình.
// ======================================================
// Độ nghiêng tối đa lấy từ GUILD_QUEST_META.maxTiltDeg (đang là 30 độ - con số quyết định).
// Math.min(70, ...) chỉ là TRẦN AN TOÀN chống cấu hình sai trong data.js, không phải giới hạn thực tế.
const GUILD_QUEST_MAX_TILT = Math.min(70, Math.abs(Number(GUILD_QUEST_META?.maxTiltDeg) || 30));
// guildQuestModal / guildQuestBox / guildQuestGrid / guildQuestTitle đã khai báo ở đầu file.
const guildQuestLightbox = document.getElementById("guildQuestLightbox");
const guildQuestLbImg = document.getElementById("guildQuestLightboxImg");
const guildQuestLbStage = document.getElementById("guildQuestLbStage");
const guildQuestLbCaption = document.getElementById("guildQuestLightboxCaption");
const guildQuestLbCounter = document.getElementById("guildQuestLightboxCounter");
const guildQuestLbPrev = document.getElementById("guildQuestLightboxPrev");
const guildQuestLbNext = document.getElementById("guildQuestLightboxNext");
const guildQuestLbRegister = document.getElementById("guildQuestRegisterBtn");
const guildQuestLbRegisterText = guildQuestLbRegister?.querySelector(".gql-register-text");

let guildQuestOpen = false;
let guildQuestLbOpen = false;
let guildQuestLbIndex = 0;
let guildQuestItems = [];
// Messenger link của tờ quest đang mở trong lightbox (đọc từ data.js mỗi lần chuyển ảnh)
let guildQuestLbMessengerUrl = "";
// Khoá chống spam: sau khi bấm sẽ tạm khoá nút trong GUILD_QUEST_REGISTER_COOLDOWN_MS
let guildQuestRegisterLocked = false;
// Đang có request gửi đi -> không đổi nhãn nút giữa chừng
let guildQuestRegisterPending = false;
// Tên quest mà nút đang hiển thị trạng thái "đã gửi" (để chuyển ảnh là biết reset nhãn)
let guildQuestRegisterQuestKey = "";
// Hẹn giờ mở lại nút sau khi gửi xong (dùng để huỷ nếu người chơi đóng lightbox rất nhanh)
let guildQuestRegisterTimer = 0;
// Nhãn nút gốc trong HTML — dùng lại sau mỗi lần đổi trạng thái
const GUILD_QUEST_REGISTER_LABEL = guildQuestLbRegisterText?.textContent?.trim() || "Gửi Thông tin đăng ký Quest";
const GUILD_QUEST_REGISTER_SENDING = "Đang gửi...";
const GUILD_QUEST_REGISTER_DONE = "✦ Đã Gửi — Mở Messenger ✦";
const GUILD_QUEST_REGISTER_COOLDOWN_MS = 4000;

/**
 * Escape chuỗi trước khi nhét vào innerHTML / thuộc tính.
 * data.js là file tĩnh nên rủi ro thấp, nhưng tên quest có thể chứa dấu & hoặc ".
 */
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
}

/**
 * Chuẩn hoá link Messenger do admin khai báo trong data.js.
 * Cho phép viết ngắn ("m.me/463539600777112") hoặc đầy đủ ("https://m.me/...").
 * Chỉ nhận http/https — chặn javascript: / data: để không bị chèn link độc hại.
 * Trả về chuỗi rỗng nếu link không hợp lệ.
 */
function normalizeMessengerUrl(rawUrl) {
    const value = String(rawUrl ?? "").trim();
    if (!value) return "";

    const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;

    try {
        const parsed = new URL(withProtocol);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
        return parsed.href;
    } catch {
        return "";
    }
}

/**
 * Lấy link Messenger của một tờ quest.
 * Ưu tiên trường `messenger` của chính tờ đó, không có thì dùng GUILD_QUEST_MESSENGER_DEFAULT
 * (link mặc định admin chỉnh trong data.js).
 */
function getGuildQuestMessengerUrl(item) {
    return normalizeMessengerUrl(item?.messenger || GUILD_QUEST_MESSENGER_DEFAULT)
        || normalizeMessengerUrl(GUILD_QUEST_MESSENGER_DEFAULT);
}

/**
 * Sinh độ nghiêng ngẫu nhiên trong khoảng [-maxDeg, +maxDeg].
 * Dùng phân phối tam giác (tổng 2 số ngẫu nhiên - 1) nên phần lớn tờ nghiêng nhẹ,
 * vài tờ nghiêng mạnh — nhìn rời rạc tự nhiên nhưng không loạn. Không bao giờ vượt maxDeg.
 */
function randomTiltDeg(maxDeg) {
    return (Math.random() + Math.random() - 1) * maxDeg;
}

/**
 * Dựng lại lưới tờ ảnh từ GUILD_QUEST_DATA.
 * Mỗi lần gọi sẽ bốc lại góc nghiêng + khoảng lệch để bảng trông rời rạc mới mỗi lượt.
 */
function renderGuildQuestGrid() {
    if (!guildQuestGrid) return;

    guildQuestItems = Array.isArray(GUILD_QUEST_DATA)
        ? GUILD_QUEST_DATA.filter((item) => item && item.url)
        : [];

    if (guildQuestItems.length === 0) {
        guildQuestGrid.innerHTML = `<p class="guild-quest-empty">${escapeHtml(
            GUILD_QUEST_META?.emptyText || "Chưa có Quest nào."
        )}</p>`;
        return;
    }

    guildQuestGrid.innerHTML = guildQuestItems.map((item, index) => {
        const tilt = randomTiltDeg(GUILD_QUEST_MAX_TILT).toFixed(2);
        const dx = (Math.random() * 20 - 10).toFixed(1);   // lệch ngang -> rời rạc
        const dy = (Math.random() * 14 - 7).toFixed(1);    // lệch dọc
        const zIndex = 1 + (index % 5);                   // chồng nhẹ cho đỡ đều tăm tắp
        const title = item.title || `Quest ${index + 1}`;
        return `
            <button type="button" class="gq-card" data-idx="${index}"
                    style="--gq-tilt:${tilt}deg; --gq-dx:${dx}px; --gq-dy:${dy}px; z-index:${zIndex}"
                    title="${escapeHtml(title)}">
                <img class="gq-card-img" src="${escapeHtml(item.url)}" alt="${escapeHtml(title)}"
                     loading="lazy" decoding="async">
                <span class="gq-card-caption">${escapeHtml(title)}</span>
            </button>`;
    }).join("");

    guildQuestGrid.querySelectorAll(".gq-card").forEach((card) => {
        card.addEventListener("click", () => {
            openGuildQuestLightbox(parseInt(card.dataset.idx, 10));
        });
    });
}

/** Mở bảng Quest tại Hội Ngọc Lục. */
function openGuildQuestModal() {
    if (!guildQuestModal) return;

    // Tiêu đề + ảnh nền lấy từ data.js để đổi nội dung không phải đụng HTML
    if (guildQuestTitle && GUILD_QUEST_META?.title) {
        guildQuestTitle.textContent = GUILD_QUEST_META.title;
    }
    if (guildQuestBox && GUILD_QUEST_META?.background) {
        guildQuestBox.style.backgroundImage = `url("${GUILD_QUEST_META.background}")`;
    }

    renderGuildQuestGrid();
    if (guildQuestGrid) guildQuestGrid.scrollTop = 0;

    guildQuestModal.classList.remove("hidden");
    guildQuestOpen = true;

    // Ép reflow để transition chạy từ trạng thái ẩn
    guildQuestModal.offsetHeight;
    requestAnimationFrame(() => guildQuestModal.classList.add("show"));

    document.body.style.overflow = "hidden";
}

/** Đóng bảng Quest (kéo theo đóng lightbox nếu đang mở). */
function closeGuildQuestModal() {
    if (!guildQuestModal) return;

    closeGuildQuestLightbox();
    guildQuestModal.classList.remove("show");
    guildQuestOpen = false;

    setTimeout(() => {
        guildQuestModal.classList.add("hidden");
        // Chỉ mở lại cuộn trang khi modal này thực sự đang là modal trên cùng,
        // tránh mở sớm khi người chơi đang xem lightbox.
        if (!guildQuestOpen && !guildQuestLbOpen) document.body.style.overflow = "";
    }, 380);
}

/** Nạp ảnh kề (trước/sau) để chuyển ảnh trong lightbox không bị giật. */
function preloadGuildQuestNeighbors(index) {
    [-1, 1].forEach((offset) => {
        const item = guildQuestItems[(index + offset + guildQuestItems.length) % guildQuestItems.length];
        if (!item) return;
        const preloader = new Image();
        preloader.decoding = "async";
        preloader.src = item.url;
    });
}

/** Vẽ nội dung lightbox theo index hiện tại. */
function paintGuildQuestLightbox() {
    const item = guildQuestItems[guildQuestLbIndex];
    if (!item || !guildQuestLbImg) return;

    const title = item.title || `Quest ${guildQuestLbIndex + 1}`;
    guildQuestLbImg.src = item.url;
    guildQuestLbImg.alt = title;

    // Link Messenger riêng của tờ đang xem — đổi theo từng quest, admin sửa trong data.js
    guildQuestLbMessengerUrl = getGuildQuestMessengerUrl(item);

    if (guildQuestLbCaption) guildQuestLbCaption.textContent = title;
    if (guildQuestLbCounter) {
        guildQuestLbCounter.textContent = `${guildQuestLbIndex + 1} / ${guildQuestItems.length}`;
    }

    // Chỉ có 1 tờ thì ẩn nút chuyển ảnh
    const single = guildQuestItems.length < 2;
    guildQuestLbPrev?.classList.toggle("is-off", single);
    guildQuestLbNext?.classList.toggle("is-off", single);

    // Sang tờ quest khác -> trả nút "Gửi thông tin" về trạng thái ban đầu
    // (nhãn "đã gửi" chỉ đúng với đúng tờ người chơi vừa bấm).
    // Đang gửi dở thì giữ nguyên, tránh nhãn nhảy loạn giữa hai tờ.
    if (!guildQuestRegisterPending && guildQuestRegisterQuestKey && guildQuestRegisterQuestKey !== title) {
        resetGuildQuestRegister();
    }

    preloadGuildQuestNeighbors(guildQuestLbIndex);
}

/** Mở lightbox cho tờ ảnh tại index. */
function openGuildQuestLightbox(index) {
    if (!guildQuestLightbox || guildQuestItems.length === 0) return;

    const safeIndex = Number.isFinite(index) ? index : 0;
    guildQuestLbIndex = Math.min(Math.max(safeIndex, 0), guildQuestItems.length - 1);
    paintGuildQuestLightbox();

    guildQuestLightbox.classList.remove("hidden");
    guildQuestLbOpen = true;
    guildQuestLightbox.offsetHeight;
    requestAnimationFrame(() => guildQuestLightbox.classList.add("show"));

    sfxBlink();
}

/** Lướt qua bảng quest (có vòng lặp). */
function stepGuildQuestLightbox(step) {
    if (!guildQuestLbOpen || guildQuestItems.length === 0) return;
    const total = guildQuestItems.length;
    guildQuestLbIndex = (guildQuestLbIndex + step + total) % total;
    paintGuildQuestLightbox();
}

/** Đặt trạng thái + nhãn cho nút "Gửi Thông tin đăng ký Quest". */
function setGuildQuestRegisterState(state) {
    if (!guildQuestLbRegister) return;

    const labels = {
        idle: GUILD_QUEST_REGISTER_LABEL,
        sending: GUILD_QUEST_REGISTER_SENDING,
        done: GUILD_QUEST_REGISTER_DONE
    };

    if (guildQuestLbRegisterText) {
        guildQuestLbRegisterText.textContent = labels[state] || GUILD_QUEST_REGISTER_LABEL;
    }
    // Chỉ khoá nút khi đang gửi — trạng thái "done" vẫn cho bấm lại (khoá riêng bằng timer)
    guildQuestLbRegister.disabled = state === "sending";
    guildQuestLbRegister.classList.toggle("is-sending", state === "sending");
    guildQuestLbRegister.classList.toggle("is-done", state === "done");
}

/** Đưa nút về trạng thái ban đầu + nhả khoá chống spam. */
function resetGuildQuestRegister() {
    clearTimeout(guildQuestRegisterTimer);
    guildQuestRegisterTimer = 0;
    guildQuestRegisterLocked = false;
    guildQuestRegisterPending = false;
    guildQuestRegisterQuestKey = "";
    setGuildQuestRegisterState("idle");
}

/**
 * Gửi thông tin người chơi + thông tin tờ quest đang chọn tới bot Telegram (qua Worker),
 * rồi dẫn người chơi tới link Messenger gắn kèm trong data.js.
 *
 * Tab Messenger được mở ĐỒNG BỘ ngay khi bấm (không await trước) vì trình duyệt chặn
 * window.open sau khi đã có await -> tab Messenger sẽ không mở được.
 */
async function handleGuildQuestRegister() {
    if (!guildQuestLbRegister || guildQuestRegisterLocked) return;

    const item = guildQuestItems[guildQuestLbIndex];
    if (!item) return;

    // Chưa có tài khoản thật -> chặn sớm, khỏi gửi tin rác lên Telegram
    if (isFirstTimeGuest || !currentUser?.id) {
        toast.warning('CHƯA THỂ ĐĂNG KÝ QUEST', 'Vui lòng hoàn tất đăng ký Nhà Phiêu Lưu trước khi gửi thông tin nhé!');
        sfxBlink();
        return;
    }

    const questTitle = item.title || `Quest ${guildQuestLbIndex + 1}`;
    const rawQuestId = Number(item.id);
    const questId = Number.isFinite(rawQuestId) ? rawQuestId : guildQuestLbIndex + 1;
    const messengerUrl = guildQuestLbMessengerUrl || getGuildQuestMessengerUrl(item);

    if (!messengerUrl) {
        toast.error('LINK MESSENGER KHÔNG HỢP LỆ', 'Hội Ngọc Lục đang sửa lại đường dẫn, vui lòng thử lại sau!');
        return;
    }

    // Mở Messenger trước khi await để không bị trình duyệt chặn popup.
    // Không dùng feature "noopener" vì chuẩn quy định khi đó window.open trả về null
    // (không phân biệt được với popup bị chặn) — ta chặn opener thủ công bên dưới.
    const messengerTab = window.open(messengerUrl, "_blank");
    if (messengerTab) {
        messengerTab.opener = null;
    } else {
        toast.warning('HÃY CHO PHÉP MỞ TAB MỚI', 'Trình duyệt đang chặn popup — hãy cho phép để mở Messenger!');
    }
    sfxBell();

    guildQuestRegisterLocked = true;
    guildQuestRegisterPending = true;
    guildQuestRegisterQuestKey = questTitle;
    setGuildQuestRegisterState("sending");

    try {
        const res = await fetch(`${API_URL}/api/quest/register-guild-quest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                questId: questId,
                questTitle: questTitle,
                messenger: messengerUrl,
                pageUrl: window.location.href
            })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
            throw new Error(data?.error || `HTTP ${res.status}`);
        }

        // Người chơi có thể đã chuyển sang tờ khác lúc chờ -> chỉ đổi nhãn khi vẫn ở đúng tờ
        if (guildQuestRegisterQuestKey === questTitle) setGuildQuestRegisterState("done");
        toast.success(
            'ĐÃ GỬI THÔNG TIN ĐĂNG KÝ QUEST',
            `✧ Hội Ngọc Lục đã nhận thông tin "${questTitle}". Hãy liên hệ Hội trưởng qua Messenger để hoàn tất đăng ký!`
        );
    } catch (err) {
        console.error("[guild-quest] Gửi thông tin đăng ký Quest thất bại:", err);
        if (guildQuestRegisterQuestKey === questTitle) setGuildQuestRegisterState("idle");
        toast.error(
            'GỬI THÔNG TIN THẤT BẠI',
            'Không thể gửi tới Hội Ngọc Lục — bạn vẫn có thể liên hệ trực tiếp qua Messenger!'
        );
    } finally {
        guildQuestRegisterPending = false;
        // Nhả khoá sau cooldown để tránh spam Telegram, nhãn "đã gửi" vẫn giữ lại
        clearTimeout(guildQuestRegisterTimer);
        guildQuestRegisterTimer = setTimeout(() => {
            guildQuestRegisterTimer = 0;
            guildQuestRegisterLocked = false;
        }, GUILD_QUEST_REGISTER_COOLDOWN_MS);
    }
}

/** Đóng lightbox, quay lại bảng Quest. */
function closeGuildQuestLightbox() {
    if (!guildQuestLightbox || !guildQuestLbOpen) return;

    guildQuestLightbox.classList.remove("show");
    guildQuestLbOpen = false;

    setTimeout(() => {
        // Người chơi có thể đã mở lại lightbox trong lúc chờ -> không được ẩn
        if (guildQuestLbOpen) return;
        guildQuestLightbox.classList.add("hidden");
        if (guildQuestLbImg) guildQuestLbImg.removeAttribute("src");
        guildQuestLbMessengerUrl = "";
        resetGuildQuestRegister();
        if (!guildQuestOpen) document.body.style.overflow = "";
    }, 300);
}

// Nút đóng + bấm ra ngoài khung để đóng
document.getElementById("closeGuildQuest")?.addEventListener("click", closeGuildQuestModal);
guildQuestModal?.addEventListener("click", (e) => {
    if (e.target === guildQuestModal) closeGuildQuestModal();
});
document.getElementById("guildQuestLightboxClose")?.addEventListener("click", closeGuildQuestLightbox);
guildQuestLbPrev?.addEventListener("click", () => stepGuildQuestLightbox(-1));
guildQuestLbNext?.addEventListener("click", () => stepGuildQuestLightbox(1));
// Nút "Gửi Thông tin đăng ký Quest": bắn thông tin lên Telegram + mở Messenger
guildQuestLbRegister?.addEventListener("click", handleGuildQuestRegister);
// Click nền đen của lightbox -> đóng (bấm trực tiếp lên ảnh / khung .gql-stage thì không)
guildQuestLightbox?.addEventListener("click", (e) => {
    if (e.target === guildQuestLightbox || e.target === guildQuestLbStage) closeGuildQuestLightbox();
});

// Bàn phím cho bảng Quest + lightbox. Ưu tiên đóng lightbox trước, rồi mới đóng modal.
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (guildQuestLbOpen) { closeGuildQuestLightbox(); return; }
        if (guildQuestOpen) closeGuildQuestModal();
        return;
    }
    if (!guildQuestLbOpen) return;
    if (e.key === "ArrowRight") { stepGuildQuestLightbox(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { stepGuildQuestLightbox(-1); e.preventDefault(); }
});

// ======================================================
// LORE READER MODAL LOGIC (Cổ thư lật trang - Swiper Flip Effect)
// ======================================================
// Dùng LORE_PAGES_DATA từ data.js
const lorePagesData = LORE_PAGES_DATA;
let loreSwiper = null;

function openLoreReaderModal() {
    if (!loreReaderModal) return;
    loreReaderModal.classList.remove("hidden");
    loreReaderOpen = true;
    
    // Initialize Swiper if not already initialized
    if (!loreSwiper) {
        initLoreSwiper();
    } else {
        // Reset to first page
        loreSwiper.slideTo(0, 0);
    }
    updateLorePageIndicator(0);
    
    // Force reflow then show
    loreReaderModal.offsetHeight;
    requestAnimationFrame(() => {
        loreReaderModal.classList.add("show");
    });
    
    // Disable body scroll
    document.body.style.overflow = "hidden";
}

function closeLoreReaderModal() {
    if (!loreReaderModal) return;
    loreReaderModal.classList.remove("show");
    loreReaderOpen = false;
    
    // Destroy Swiper to release grabCursor styles
    if (loreSwiper) {
        loreSwiper.destroy(true, true);
        loreSwiper = null;
    }
    
    setTimeout(() => {
        loreReaderModal.classList.add("hidden");
        // Re-enable body scroll
        document.body.style.overflow = "";
        // Ensure cursor resets on body
        document.body.style.cursor = "";
    }, 400);
}

function initLoreSwiper() {
    const wrapper = document.getElementById("loreSwiperWrapper");
    if (!wrapper) return;
    
    // Render slides
    wrapper.innerHTML = "";
    lorePagesData.forEach((page, index) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = `
            <img src="${page.url}" alt="${page.title}" class="lore-comic-img" crossorigin="anonymous" onerror="this.src='https://placehold.co/600x900/2a1b12/d4af37?text=Lỗi+tải+ảnh'"/>
        `;
        wrapper.appendChild(slide);
    });
    
    // Initialize Swiper with flip effect
    loreSwiper = new Swiper(".loreSwiper", {
        effect: "flip",
        grabCursor: true,
        speed: 500,
        flipEffect: {
            slideShadows: true,
            limitRotation: true
        },
        navigation: {
            nextEl: ".lore-swiper-btn.swiper-button-next",
            prevEl: ".lore-swiper-btn.swiper-button-prev",
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        on: {
            slideChange: () => {
                updateLorePageIndicator(loreSwiper.activeIndex);
            }
        }
    });
    
    // Also handle footer button clicks
    const btnPrev = document.getElementById("loreBtnPrev");
    const btnNext = document.getElementById("loreBtnNext");
    btnPrev?.addEventListener("click", () => loreSwiper?.slidePrev());
    btnNext?.addEventListener("click", () => loreSwiper?.slideNext());
}

function updateLorePageIndicator(index) {
    const pageIndicator = document.getElementById("lorePageIndicator");
    const btnPrev = document.getElementById("loreBtnPrev");
    const btnNext = document.getElementById("loreBtnNext");
    
    if (pageIndicator) {
        pageIndicator.innerText = `${index + 1} / ${lorePagesData.length}`;
    }
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === lorePagesData.length - 1;
}

function handleLoreReaderKeydown(e) {
    if (!loreReaderOpen) return;
    if (e.key === "ArrowRight" || e.key === " ") {
        loreSwiper?.slideNext();
    } else if (e.key === "ArrowLeft") {
        loreSwiper?.slidePrev();
    } else if (e.key === "Escape") {
        closeLoreReaderModal();
    }
}

// ======================================================
// GUIDE READER MODAL LOGIC (Hướng dẫn Tinh Thủ - Swiper Flip Effect)
// ======================================================
// Dùng GUIDE_PAGES_DATA từ data.js
const guidePagesData = GUIDE_PAGES_DATA;
let guideSwiper = null;

function openGuideReaderModal() {
    if (!guideReaderModal) return;
    guideReaderModal.classList.remove("hidden");
    guideReaderOpen = true;
    
    // Initialize Swiper if not already initialized
    if (!guideSwiper) {
        initGuideSwiper();
    } else {
        // Reset to first page
        guideSwiper.slideTo(0, 0);
    }
    updateGuidePageIndicator(0);
    
    // Force reflow then show
    guideReaderModal.offsetHeight;
    requestAnimationFrame(() => {
        guideReaderModal.classList.add("show");
    });
    
    // Disable body scroll
    document.body.style.overflow = "hidden";
}

function closeGuideReaderModal() {
    if (!guideReaderModal) return;
    guideReaderModal.classList.remove("show");
    guideReaderOpen = false;
    
    // Destroy Swiper to release grabCursor styles
    if (guideSwiper) {
        guideSwiper.destroy(true, true);
        guideSwiper = null;
    }
    
    setTimeout(() => {
        guideReaderModal.classList.add("hidden");
        // Re-enable body scroll
        document.body.style.overflow = "";
        // Ensure cursor resets on body
        document.body.style.cursor = "";
    }, 400);
}

function initGuideSwiper() {
    const wrapper = document.getElementById("guideSwiperWrapper");
    if (!wrapper) return;
    
    // Render slides
    wrapper.innerHTML = "";
    guidePagesData.forEach((page, index) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = `
            <img src="${page.url}" alt="${page.title}" class="lore-comic-img" crossorigin="anonymous" onerror="this.src='https://placehold.co/600x900/2a1b12/d4af37?text=Lỗi+tải+ảnh'"/>
        `;
        wrapper.appendChild(slide);
    });
    
    // Initialize Swiper with flip effect
    guideSwiper = new Swiper(".guideSwiper", {
        effect: "flip",
        grabCursor: true,
        speed: 500,
        flipEffect: {
            slideShadows: true,
            limitRotation: true
        },
        navigation: {
            nextEl: ".guide-swiper-btn.swiper-button-next",
            prevEl: ".guide-swiper-btn.swiper-button-prev",
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        on: {
            slideChange: () => {
                updateGuidePageIndicator(guideSwiper.activeIndex);
            }
        }
    });
    
    // Also handle footer button clicks
    const btnPrev = document.getElementById("guideBtnPrev");
    const btnNext = document.getElementById("guideBtnNext");
    btnPrev?.addEventListener("click", () => guideSwiper?.slidePrev());
    btnNext?.addEventListener("click", () => guideSwiper?.slideNext());
}

function updateGuidePageIndicator(index) {
    const pageIndicator = document.getElementById("guidePageIndicator");
    const btnPrev = document.getElementById("guideBtnPrev");
    const btnNext = document.getElementById("guideBtnNext");
    
    if (pageIndicator) {
        pageIndicator.innerText = `${index + 1} / ${guidePagesData.length}`;
    }
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === guidePagesData.length - 1;
}

function handleGuideReaderKeydown(e) {
    if (!guideReaderOpen) return;
    if (e.key === "ArrowRight" || e.key === " ") {
        guideSwiper?.slideNext();
    } else if (e.key === "ArrowLeft") {
        guideSwiper?.slidePrev();
    } else if (e.key === "Escape") {
        closeGuideReaderModal();
    }
}

// ======================================================
// HÀM CẬP NHẬT GIAO DIỆN TOPBAR & PROFILE (AN TOÀN TUYỆT ĐỐI)
// ======================================================
function updateTopBarUI() {
    if (!currentUser) return;

    const setSafeText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setSafeHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

    // 1. Top Status Bar
    setSafeText("valTinhQuang", (currentUser.tinh_quang_points || 0).toLocaleString());
    setSafeText("valCongHien", (currentUser.cong_hien_points || 0).toLocaleString());
    setSafeText("userAdvenCode", currentUser.adventurer_code || "AW----");

    // 3. Thẻ Căn Cước
    setSafeText("profName", currentUser.full_name || "Nhà Phiêu Lưu");
    setSafeText("profCode", currentUser.adventurer_code || "AW----");
    setSafeText("profEmail", currentUser.email || "chua_lien_ket@advenature.local");
    setSafeText("profClass", currentUser.class_name || "Chưa thiết lập");
    setSafeText("profTribe", currentUser.tribe || "Tự do");
    setSafeText("profGender", currentUser.gender || "Nam");
    setSafeText("profBirth", currentUser.birth_year || "----");

    // 4. Phân quyền
    const roleTitles = { admin: "Trưởng Quán (Admin)", manager: "Quản Lý (Manager)", user: "Tân Thủ" };
    setSafeText("profRole", roleTitles[currentUser.role] || (currentUser.role || "Tân Thủ Rừng Già"));

    // 5. Tài nguyên
    setSafeHtml("profStatTQ", `<i class="rpg-ico ico-tq"></i> ${currentUser.tinh_quang_points || 0}`);
    setSafeHtml("profStatCH", `<i class="rpg-ico ico-ch"></i> ${currentUser.cong_hien_points || 0} CP`);
    setSafeText("myRefCodeDisplay", currentUser.adventurer_code || "AW----");

    // 6. Cấp bậc
    setSafeText("profRankTitle", currentUser.guild_rank_title || "Tân Thủ");
    const needPoints = Math.max(0, 100 - (currentUser.cong_hien_points || 0));
    setSafeText("profRankNeed", `${needPoints} Điểm Lên Cấp`);

    // 7. Avatar
    if (currentUser.avatar_url) {
        const profAv = document.getElementById("profAvatar");
        const topAv = document.getElementById("userAvatarImg");
        if (profAv) profAv.src = currentUser.avatar_url;
        if (topAv) topAv.src = currentUser.avatar_url;
    }

    // 8. Thanh tiến trình Bang hội
    const rankBar = document.getElementById("rankProgressBar");
    if (rankBar) {
        const pct = Math.min(100, Math.floor(((currentUser.cong_hien_points || 0) / 100) * 100));
        rankBar.style.width = pct + "%";
    }

    // 9. Nút Đăng Nhập
    const btnTopLogin = document.getElementById("btnTopLogin");
    if (btnTopLogin) {
        if (currentUser.adventurer_code && currentUser.adventurer_code !== "AW----") {
            btnTopLogin.classList.add("hidden");
        } else {
            btnTopLogin.classList.remove("hidden");
        }
    }

    // 10. QR Code
    const profQrContainer = document.getElementById("userProfileQr");
    if (profQrContainer && typeof QRCode !== "undefined") {
        profQrContainer.innerHTML = "";
        new QRCode(profQrContainer, {
            text: `ADVENATURE_USER:${currentUser.adventurer_code || "AW----"}`,
            width: 100, height: 100
        });
    }
    
    // Update Gacha Ready Tooltip
    updateGachaReadyTooltip();
}

// ======================================================
// 2. THREE.JS ENGINE SETUP
// ======================================================
const scene = new THREE.Scene();
scene.fog = null;

// ĐOẠN CODE MỚI ĐÃ CĂN CHỈNH TỌA ĐỘ THEO ĐÚNG BỆ ĐÁ TRONG BACKGROUND:
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
// Nâng nhẹ camera và hướng góc nhìn chuẩn xác vào tâm bệ đá Runes
camera.position.set(0, 1.8, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.33; // Tăng sáng nhẹ để hạt lấp lánh như hình thiết kế
document.getElementById("app-3d").appendChild(renderer.domElement);
// Performance: will-change cho compositor layer
renderer.domElement.style.willChange = 'transform, opacity';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Chỉnh Bloom Pass để viên đá và bệ đá tỏa hào quang thần tiên
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.1, 0.5, 0.15));
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
// Tâm xoay đặt tại y = 0.85 (ngay tâm lơ lửng phía trên bệ đá)
controls.target.set(0, 0.85, 0);

scene.add(new THREE.AmbientLight(0x443366, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);

const pointLight = new THREE.PointLight(0xa58cff, 0, 20);
pointLight.position.set(0, 1, 2);
scene.add(pointLight);

const clock = new THREE.Clock();

// Detect mobile để giảm particle count
const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
const PARTICLE_COUNT = isMobile ? 600 : 1500;

// Particles Vortex
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleColors = new Float32Array(PARTICLE_COUNT * 3);
const particleData = [];
const colorPalette = [
    new THREE.Color(0x7c6cff), new THREE.Color(0xff71ce), new THREE.Color(0x67e8ff),
    new THREE.Color(0xffe66d), new THREE.Color(0xa878ff), new THREE.Color(0x75ffb2)
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = THREE.MathUtils.randFloat(2.5, 8.5);
    const theta = Math.random() * Math.PI * 2;
    const phiParticle = Math.acos(THREE.MathUtils.randFloat(-1, 1));

    const x = radius * Math.sin(phiParticle) * Math.cos(theta);
    const y = radius * Math.cos(phiParticle);
    const z = radius * Math.sin(phiParticle) * Math.sin(theta);

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    particleColors[i * 3] = col.r;
    particleColors[i * 3 + 1] = col.g;
    particleColors[i * 3 + 2] = col.b;

    particleData.push({
        baseX: x, baseY: y, baseZ: z,
        driftSpeed: THREE.MathUtils.randFloat(0.4, 1.2),
        driftRadius: THREE.MathUtils.randFloat(0.3, 0.7),
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        radius, angle: theta,
        vortexSpeed: THREE.MathUtils.randFloat(1.5, 3.5),
        random: Math.random()
    });
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(particles);

// Core Glow
const coreGroup = new THREE.Group();
scene.add(coreGroup);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xd9ccff, transparent: true, opacity: 0 });
coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), coreMaterial));
const coreGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8f75ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
});
coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), coreGlowMaterial));

let lootBox = null;
let currentGemResult = null;

function createProceduralRock() {
    if (lootBox) {
        scene.remove(lootBox);
        lootBox.traverse(c => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
        });
    }

    const faceCount = FACE_TIERS[Math.floor(Math.random() * FACE_TIERS.length)];
    const shape = SHAPE_STYLES[Math.floor(Math.random() * SHAPE_STYLES.length)];
    const palette = CRYSTAL_PALETTES[Math.floor(Math.random() * CRYSTAL_PALETTES.length)];
    const gemCode = `${palette.sys}${palette.sysIndex}${faceCount}${shape.id}`;

    currentGemResult = {
        code: gemCode,
        name: palette.name,
        sys: palette.sys,
        shapeId: shape.id,
        shapeName: shape.name,
        faceCount: faceCount
    };

    const points = [];
    const rx = THREE.MathUtils.randFloat(...shape.rx);
    const ry = THREE.MathUtils.randFloat(...shape.ry);
    const rz = THREE.MathUtils.randFloat(...shape.rz);

    for (let i = 0; i < faceCount; i++) {
        const y = 1 - (i / (faceCount - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = GOLDEN_ANGLE * i + THREE.MathUtils.randFloatSpread(0.6);
        const noise = THREE.MathUtils.randFloat(0.85, 1.25);
        points.push(new THREE.Vector3(
            Math.cos(theta) * radiusAtY * rx * noise,
            y * ry * noise,
            Math.sin(theta) * radiusAtY * rz * noise
        ));
    }

    const geometry = new ConvexGeometry(points);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: 0.33,
        roughness: 0.1,
        metalness: 0.4,
        flatShading: true
    });

    lootBox = new THREE.Mesh(geometry, material);
    lootBox.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.65
    })));

    lootBox.scale.setScalar(0.001);
    lootBox.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(lootBox);

    return currentGemResult;
}

function addItemToInventory(item) {
    const existing = currentUser.inventory.find(i => i.id === item.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        currentUser.inventory.push({
            id: item.id,
            name: item.name,
            iconClass: item.iconClass,
            tier: item.tier || "common",
            desc: item.desc || "",
            isBuff: !!item.isBuff,
            buff: item.buff || null,
            quantity: 1,
            qr_token: item.qr_token || ("QR_" + Math.random().toString(36).substring(2, 10).toUpperCase())
        });
    }
    saveUserData();
}

// ======================================================
// 4. GACHA CONTROLLER & STATE MACHINE
// ======================================================
// STATE and state are now declared at the top of the file

const claimContainer = document.getElementById("claimContainer");
if (claimContainer) claimContainer.classList.add("hidden");
const claimBtn = document.getElementById("claimButton");
const lootText = document.getElementById("lootText");
const crystalHeader = document.getElementById("crystalNameHeader");
const collectBanner = document.getElementById("collectBanner");
const app3dCanvas = document.getElementById("app-3d");

function triggerGachaSummon() {
    if (state !== STATE.IDLE && state !== STATE.CLAIMED) return;

    if (currentUser.gacha_counter > 0 && currentUser.tinh_quang_points < 1) {
        toast.warning('HẾT TINH QUANG', 'Tinh Thủ đã hết Điểm Tinh Quang ✨! Hãy Làm Quest ngày để tích thêm Tinh Quang.');
        return;
    }

    // Cancel init timeouts nếu đang chạy (an toàn cho gọi programmatic)
    if (guideHelperInitTimeout) clearTimeout(guideHelperInitTimeout);
    if (loreHelperInitTimeout) clearTimeout(loreHelperInitTimeout);

    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");
    
    // Hard reset collectBanner state trước khi gacha mới
    collectBanner.classList.remove("slide-down-exit");
    collectBanner.style.transform = '';
    collectBanner.style.opacity = '';
    collectBanner.style.transition = '';
    collectBanner.classList.add("hidden");

    coreGroup.position.set(0, 0.8, 0);
    coreGroup.scale.setScalar(0.001);

    const gem = createProceduralRock();
    crystalHeader.textContent = gem.name;

    lootText.innerHTML = `
        <div style="font-size: large; font-weight: bold; font-family: 'Spectral SC', serif; color: #fff9da;">✧ ${gem.name} ✧</div>
        <div style="font-size: 10px; color: #c9c3ff; letter-spacing: 1.5px; margin-top: 3px;">
            [${gem.shapeName.toUpperCase()}] • ${gem.faceCount} DIỆN THỂ • MÃ: ${gem.code}
        </div>
    `;

    state = STATE.GACHA;
    stateStart = performance.now();

    // SFX: âm thanh gacha chạy
    sfxGacha();
}

// Nút Gacha ở đáy
dockGachaTrigger.addEventListener("click", () => {
    const isGachaViewActive = document.getElementById("gacha-view").classList.contains("active") && 
                              !document.getElementById("gacha-view").classList.contains("hidden");

    if (isGachaViewActive) {
        // Cancel init timeouts nếu đang chạy
        if (guideHelperInitTimeout) clearTimeout(guideHelperInitTimeout);
        if (loreHelperInitTimeout) clearTimeout(loreHelperInitTimeout);
        
        // Hide Guest Helper trước khi trigger gacha
        hideGuestHelper();
        // Hide Guide & Lore Helpers khi Gacha triggered
        hideGuideHelper();
        hideLoreHelper();
        // Hide Gacha Ready Tooltip khi Gacha triggered
        hideGachaReadyTooltip();
        
        dockGachaTrigger.classList.add("moved"); 
        triggerGachaSummon();
    }
});

// Modal Chúc phúc
const blessingModal = document.getElementById("blessingModal");
function openBlessingModal(blessing, reasonText) {
    document.getElementById("blessTierTag").textContent = (blessing.tier || "common").toUpperCase();
    document.getElementById("blessTierTag").className = `blessing-tier-tag tier-${blessing.tier || "common"}`;
    document.getElementById("blessIconBox").innerHTML = `<i class="item-ico ${blessing.iconClass}" style="width:88px;height:88px;"></i>`;
    document.getElementById("blessTitle").textContent = blessing.name;
    document.getElementById("blessDesc").textContent = `${reasonText}\n${blessing.desc || ''}`;
    blessingModal.classList.remove("hidden");

    // SFX: âm thanh nhận vật phẩm / chúc phúc
    sfxBlessing();
}
document.getElementById("btnCloseBlessingModal").addEventListener("click", () => {
    blessingModal.classList.add("hidden");
});

// ======================================================
// MỐC SƯU TẦM QUANG THẠCH: MỖI 33 BIẾN THỂ → TẶNG PHIẾU TINH THẠCH
// Worker là nguồn sự thật và xử lý idempotent: /api/gacha đã trả sẵn danh sách mốc,
// còn checkAndClaimGemMilestones() chỉ quét bù cho các luồng không đi qua gacha
// (đăng nhập lại, mở Túi Đồ, admin mở full 990 đá).
// Lưu ý: BLESS_18 là thẻ QR thực địa, KHÔNG cộng điểm trực tiếp vào tài khoản.
// ======================================================
const GEM_MILESTONE_STEP = 33;
const GEM_TOTAL_COLLECTION = 990;
const gemMilestoneModal = document.getElementById("gemMilestoneModal");

/**
 * Mở modal thông báo đạt mốc sưu tầm.
 * @param {number} milestone - Mốc vừa đạt (33, 66, 99...)
 * @param {number} currentCount - Tổng số biến thể hiện có
 * @param {object} rewardItem - Vật phẩm thưởng (từ BLESSINGS_DATA)
 */
function openGemMilestoneModal(milestone, currentCount, rewardItem) {
    if (!gemMilestoneModal) return;

    const rewardName = rewardItem?.name || "Phiếu Tinh Thạch";
    const tag = gemMilestoneModal.querySelector("#gemMilestoneTag");
    const desc = gemMilestoneModal.querySelector("#gemMilestoneDesc");
    const note = gemMilestoneModal.querySelector(".milestone-note");

    if (tag) tag.textContent = `MỐC ${milestone}/${GEM_TOTAL_COLLECTION}`;
    if (desc) {
        desc.textContent =
            `Bạn đã sưu tầm đủ ${milestone} biến thể Quang Thạch!\n` +
            `Hội Ngọc Lục tặng bạn ${rewardName} đã được cộng vào Túi Đồ.`;
    }
    if (note) {
        note.textContent =
            `*Tiến trình sưu tầm: ${currentCount}/${GEM_TOTAL_COLLECTION}\n` +
            ` Mỗi mốc 33 biến thể nhận 1 phiếu quà tặng!`;
    }

    gemMilestoneModal.classList.remove("hidden");
}

// Hành động sẽ chạy sau khi user đóng modal mốc (dùng để hoãn chúc phúc bị che)
// Gán trực tiếp thay vì xếp hàng để luôn giữ đúng ưu tiên mới nhất.
let milestoneNextAction = null;

function queueMilestoneNextAction(fn) {
    milestoneNextAction = typeof fn === "function" ? fn : null;
}

document.getElementById("btnCloseGemMilestoneModal")?.addEventListener("click", () => {
    gemMilestoneModal?.classList.add("hidden");

    const next = milestoneNextAction;
    milestoneNextAction = null;
    if (next) next();
});

/**
 * Chuẩn hoá dữ liệu inventory từ Worker về đúng shape mà renderInventory5x5 cần.
 * Dùng chung cho cả mốc sưu tầm và syncUserDataFromBackend.
 */
function mapInventoryFromBackend(rawItems) {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map(invItem => {
        const masterItem = BLESSINGS_DATA.find(b => b.id === invItem.item_code);
        return {
            id: invItem.item_code,
            name: invItem.item_name,
            iconClass: masterItem ? masterItem.iconClass : "ico-item-01",
            tier: masterItem ? masterItem.tier : "common",
            desc: masterItem ? masterItem.desc : "Vật phẩm lưu trữ thực địa.",
            isBuff: masterItem ? masterItem.isBuff : false,
            buff: masterItem ? masterItem.buff : null,
            quantity: invItem.quantity || 1,
            qr_token: invItem.qr_token
        };
    });
}

/**
 * Kiểm tra & nhận thưởng các mốc sưu tầm còn thiếu.
 * - Nếu Worker trả về mốc mới: cập nhật túi đồ, render lại và mở modal.
 * - Nếu không có: im lặng, không tốn DOM.
 * @param {object|null} source - Nguồn dữ liệu (response của /api/gacha hoặc /api/gem-milestone)
 * @returns {Promise<boolean>} true nếu vừa nhận được phần thưởng
 */
async function handleGemMilestones(source) {
    if (!source) return false;

    const milestones = Array.isArray(source.newMilestones) ? source.newMilestones : [];
    if (milestones.length === 0) return false;

    // Đồng bộ túi đồ ngay để vật phẩm thưởng xuất hiện trong lưới 5x5
    if (Array.isArray(source.inventory) && source.inventory.length > 0) {
        currentUser.inventory = mapInventoryFromBackend(source.inventory);
    }
    saveUserData();
    renderInventory5x5();

    // Nhiều mốc cùng lúc (admin mở full 990 đá) -> hiện mốc cao nhất
    const highest = Math.max(...milestones);
    const gemCount = source.gemCount || new Set(currentUser.unlocked_gems).size;

    openGemMilestoneModal(highest, gemCount, source.rewardItem);
    return true;
}

/**
 * Gọi Worker để quét & nhận mốc sưu tầm bị bỏ lỡ.
 * Dùng khi mở Túi Đồ, sau đăng nhập và khi quay lại tab — im lặng khi lỗi mạng.
 * @returns {Promise<boolean>} true nếu vừa nhận được phần thưởng
 */
async function checkAndClaimGemMilestones() {
    if (!currentUser || !currentUser.id || currentUser.id.startsWith("AW_USER_")) return false;

    try {
        const res = await fetch(`${API_URL}/api/gem-milestone`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id })
        });
        if (!res.ok) return false;

        const data = await res.json();
        if (!data.success) return false;

        return await handleGemMilestones(data);
    } catch (e) {
        // Im lặng: polling nền không được làm phiền người chơi
        return false;
    }
}

// ======================================================
// 5. LUỒNG THU THẬP: FIRST GACHA & GACHA THƯỜNG
// ======================================================
// ======================================================
// HỆ THỐNG 12 AVATAR PRESET (4 NAM, 4 NỮ, 4 TỰ DO)
// ======================================================
const AVATAR_PRESETS = {
    "Nam": [
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720386/trtjjovqp4expfjv5ny1.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720389/cigyb5oyxs9ubotet3lf.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720390/gx0ked2bnhn7w3z5qcyu.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720393/skzpe30auffafzdednkl.png"
    ],
    "Nữ": [
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720387/lzwrwpho48ul6b1tml1v.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720390/hvfxpqvqoghqpcyvfzyd.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720392/dkdmmysvn8d7setmzgyl.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720395/niwihrjomrmqekdaecls.png"
    ],
    "Tự do": [
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720396/x4vsosyiyv4m8f48hovf.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720402/dd2gipxmttiumh6d2bhk.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720400/hugshm4nkvprsadmcabf.png",
        "https://res.cloudinary.com/aurorawoods/image/upload/t_iconWebP/v1790720402/gcc00qifqlqfv1uhjxea.png"
    ]
};

let currentGender = "Nam";
let selectedAvatarUrl = AVATAR_PRESETS.Nam[0];

// Render 4 avatar theo giới tính hiện tại
function renderAvatarOptions() {
    const container = document.getElementById("avatarSelectGrid");
    if (!container) return;

    const list = AVATAR_PRESETS[currentGender];
    selectedAvatarUrl = list[0]; // Mặc định chọn avatar đầu tiên

    container.innerHTML = list.map((url, idx) => `
        <div class="avatar-option-slot ${idx === 0 ? 'selected' : ''}" data-url="${url}">
            <img src="${url}" alt="Avatar ${idx + 1}">
        </div>
    `).join('');

    container.querySelectorAll(".avatar-option-slot").forEach(slot => {
        slot.addEventListener("click", () => {
            container.querySelectorAll(".avatar-option-slot").forEach(s => s.classList.remove("selected"));
            slot.classList.add("selected");
            selectedAvatarUrl = slot.dataset.url;
        });
    });
}

// Bắt sự kiện đổi Giới tính
document.querySelectorAll(".btn-gender-opt").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-gender-opt").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentGender = btn.dataset.gender;
        renderAvatarOptions(); // Đổi 4 avatar sang giới tính mới
    });
});

// Khởi tạo Google Auth
const btnGoogleCustom = document.getElementById("btnGoogleCustom");
const onboardStep1 = document.getElementById("onboardStep1");
const onboardStep2 = document.getElementById("onboardStep2");
// app.js: Bổ sung khai báo 2 phần tử modal còn thiếu
const onboardingModal = document.getElementById("onboardingModal");
const btnCompleteRegister = document.getElementById("btnCompleteRegister");

// ======================================================
// KHỞI TẠO GOOGLE AUTH TỰ ĐỘNG CHỜ THƯ VIỆN TẢI XONG
// ======================================================
function initGoogleAuth() {
    onboardStep1.classList.remove("hidden");
    onboardStep2.classList.add("hidden");

    const container = document.getElementById("googleBtnContainer");
    if (!container) return;

    // Hiển thị trạng thái đang kết nối
    container.innerHTML = `
        <div style="font-size: 11px; color: #ffe66d; padding: 10px; display: flex; align-items: center; gap: 6px;">
            <span>⏳</span> <span>Đang kết nối dịch vụ Google...</span>
        </div>
    `;

    let attempts = 0;
    const maxAttempts = 35; // Chờ tối đa 3.5 giây

    const checkGoogleInterval = setInterval(() => {
        attempts++;

        // Khi thư viện Google đã tải xong thành công
        if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
            clearInterval(checkGoogleInterval);
            try {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSuccess,
                    auto_select: false
                });

                container.innerHTML = "";
                // TỰ ĐỘNG VẼ NÚT GOOGLE CHÍNH THỨC
                google.accounts.id.renderButton(container, {
                    type: "standard",
                    theme: "filled_blue",
                    size: "large",
                    text: "signin_with",
                    shape: "pill",
                    logo_alignment: "left",
                    width: 260
                });
                return;
            } catch (err) {
                console.error("Lỗi Google GIS render:", err);
            }
        }

        // Nếu quá 3.5 giây vẫn chưa tải được (do mạng yếu hoặc bị AdBlock chặn)
        if (attempts >= maxAttempts) {
            clearInterval(checkGoogleInterval);
            container.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #ff99aa; margin-bottom: 6px;">
                        Không thể kết nối Google (thường do AdBlock hoặc mạng chậm)
                    </div>
                    <button type="button" class="btn-action" id="btnBypassGoogle" style="font-size: 10px; padding: 6px 12px;">
                        ✧ Nhập Gmail để tiếp tục ✧
                    </button>
                </div>
            `;
            document.getElementById("btnBypassGoogle")?.addEventListener("click", () => {
                const emailInput = prompt("Nhập địa chỉ Gmail của bạn:", "user@gmail.com");
                if (emailInput && emailInput.includes("@")) {
                    handleGoogleSuccess({
                        mock: true,
                        profile: {
                            sub: "AW_G_" + Math.random().toString(36).substring(2, 9),
                            email: emailInput.trim(),
                            name: emailInput.split("@")[0],
                            picture: "https://api.dicebear.com/7.x/adventurer/svg?seed=" + emailInput
                        }
                    });
                }
            });
        }
    }, 100);
}

// ======================================================
// XỬ LÝ GOOGLE AUTH THÔNG MINH (ĐÃ FIX TRIỆT ĐỂ LỖI DÒNG 557)
// ======================================================
async function handleGoogleSuccess(response) {
    if (response.mock) {
        tempGoogleProfile = response.profile;
    } else {
        // Giải mã JWT Payload từ Google Token (an toàn, đơn giản)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        tempGoogleProfile = JSON.parse(atob(base64));
    }

    // Hiển thị trạng thái an toàn trên khung chứa nút Google (KHÔNG dùng googleBtnText cũ)
    const container = document.getElementById("googleBtnContainer");
    if (container) {
        container.innerHTML = `
            <div style="font-size: 11px; color: #4cc9f0; padding: 10px; text-align: center;">
                <span>⏳</span> Đang kiểm tra tài khoản <b>${tempGoogleProfile.name}</b>...
            </div>
        `;
    }

    try {
        // Gửi lên Worker kiểm tra xem đây là người cũ hay người mới
        const res = await fetch(`${API_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                googleUser: tempGoogleProfile,
                gemData: currentGemResult || null
            })
        });
        const data = await res.json();

        // TRƯỜNG HỢP 1: NGƯỜI CŨ ĐÃ CÓ TÀI KHOẢN TRONG D1
        if (data.success && !data.isNewUser) {
            currentUser = data.user;
            saveUserData();
            document.body.classList.remove("guest-mode");
            hideGuestHelper(); // Ẩn fairy khi thoát guest mode
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();
            
            // Khởi tạo Guide & Lore Helpers (attach click handlers) sau khi thoát guest-mode
            initGuideHelper();
            initLoreHelper();

            // Đóng Modal ngay lập tức, KHÔNG bắt điền lại thông tin!
            onboardingModal.classList.add("hidden");
            if (claimContainer) claimContainer.classList.add("hidden");
            lootText.classList.remove("show");

            toast.magic('CHÀO MỪNG QUAY LẠI', `🎉 CHÀO MỪNG QUAY TRỞ LẠI, ${currentUser.full_name}!\nĐã khôi phục Danh tính [${currentUser.adventurer_code}] và kho đồ của bạn.`);
            state = STATE.IDLE;
            // Nhận mốc sưu tầm bị bỏ lỡ ở phiên trước (offline hoặc tab bị đóng)
            checkAndClaimGemMilestones();
            // Trigger helpers sau 3s khi đã login xong
            triggerHelpersAfterLogin();
            return;
        }

        // TRƯỜNG HỢP 2: NGƯỜI MỚI TOANH -> Chuyển sang Bước 2 để điền hồ sơ lần đầu
        onboardStep1.classList.add("hidden");
        onboardStep2.classList.remove("hidden");
        const badge = document.getElementById("googleBadgeVerified");
        if (badge) badge.textContent = `✓ Đã xác thực: ${tempGoogleProfile.email}`;
        const nameInput = document.getElementById("obName");
        if (nameInput) nameInput.value = tempGoogleProfile.name || "";
        renderAvatarOptions();

    } catch (err) {
        console.error("Lỗi xác thực:", err);
        // Nếu lỗi kết nối thì chuyển sang Bước 2 cho người dùng nhập
        onboardStep1.classList.add("hidden");
        onboardStep2.classList.remove("hidden");
        renderAvatarOptions();
    }
}

// Bổ sung sự kiện đóng onboarding modal
document.getElementById("closeOnboardingModal")?.addEventListener("click", () => {
    const onboardingModal = document.getElementById("onboardingModal");
    if (onboardingModal) {
        onboardingModal.classList.add("hidden");
        hideGuestHelper(); // Ẩn fairy khi đóng modal đăng ký
    }
});

// Bắt sự kiện bấm nút "✧ Đăng Nhập" trực tiếp trên Topbar
document.getElementById("btnTopLogin")?.addEventListener("click", () => {
    initGoogleAuth();
    onboardingModal.classList.remove("hidden");
});

// BẤM NÚT THU THẬP VÀO TÚI
claimBtn.addEventListener("click", () => {
    if (state !== STATE.LOOT) return;

    if (currentGemResult && currentGemResult.code) {
        if (!Array.isArray(currentUser.unlocked_gems)) currentUser.unlocked_gems = [];
        if (!currentUser.unlocked_gems.includes(currentGemResult.code)) {
            currentUser.unlocked_gems.push(currentGemResult.code);
            saveUserData();
            renderInventoryGems();
        }
    }

    if (currentUser.gacha_counter === 0) {
        initGoogleAuth();
        onboardingModal.classList.remove("hidden");
        return;
    }
    processClaimAfterLoot();
});

// BƯỚC 2: HOÀN TẤT & LƯU HỒ SƠ
btnCompleteRegister.addEventListener("click", async () => {
    const obName = document.getElementById("obName").value.trim();
    const obPhone = document.getElementById("obPhone") ? document.getElementById("obPhone").value.trim() : ""; // Đọc SĐT
    const obBirth = document.getElementById("obBirthYear").value.trim();
    const obClass = document.getElementById("obClass").value.trim();
    const obTribe = document.getElementById("obTribe").value.trim();

    if (!obName) { toast.warning('THIẾU THÔNG TIN', 'Vui lòng nhập Tên Nhà Phiêu Lưu!'); return; }
    if (!obPhone) { toast.warning('THIẾU THÔNG TIN', 'Vui lòng nhập Số điện thoại / Zalo!'); return; } // Bắt buộc
    if (!obBirth) { toast.warning('THIẾU THÔNG TIN', 'Vui lòng nhập Năm sinh!'); return; }
    if (!obClass) { toast.warning('THIẾU THÔNG TIN', 'Vui lòng nhập Chức nghiệp của bạn!'); return; }
    if (!obTribe) { toast.warning('THIẾU THÔNG TIN', 'Vui lòng nhập Bộ tộc của bạn!'); return; }

    btnCompleteRegister.textContent = "Đang kích hoạt căn cước...";
    btnCompleteRegister.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/auth/register-first-gacha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                googleUser: tempGoogleProfile,
                adventurerName: obName,
                phoneNumber: obPhone, // Gửi SĐT lên Worker
                birthYear: obBirth,
                gender: currentGender,
                className: obClass,
                tribe: obTribe,
                avatarUrl: selectedAvatarUrl,
                gemData: currentGemResult
            })
        });

        const data = await res.json();
        if (data.success) {
            currentUser = {
                ...data.user,
                birth_year: obBirth,
                gender: currentGender,
                tribe: obTribe,
                class_name: obClass
            };
            saveUserData();
            document.body.classList.remove("guest-mode");
            hideGuestHelper(); // Ẩn fairy khi thoát guest mode
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();
            
            // Khởi tạo Guide & Lore Helpers (attach click handlers) sau khi thoát guest-mode
            initGuideHelper();
            initLoreHelper();

            onboardingModal.classList.add("hidden");
            claimContainer.classList.add("hidden");
            lootText.classList.remove("show");

            openBlessingModal(data.blessing, "✧");
            state = STATE.IDLE;
            // Trigger helpers sau 3s khi đã đăng ký xong
            triggerHelpersAfterLogin();
        } else {
            toast.error('ĐĂNG KÝ THẤT BẠI', data.error || 'Vui lòng thử lại');
        }
    } catch (e) {
        toast.error('LỖI KẾT NỐI', 'Lỗi kết nối máy chủ! Vui lòng thử lại.');
    } finally {
        btnCompleteRegister.textContent = "✧ HOÀN TẤT & THU THẬP VÀO TÚI ✧";
        btnCompleteRegister.disabled = false;
    }
});

// XỬ LÝ THU THẬP CHO CÁC LẦN GACHA SAU (LẦN 2, 3, 4...)
async function processClaimAfterLoot() {
    state = STATE.CLAIMED;
    stateStart = performance.now();
    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");

    try {
        const res = await fetch(`${API_URL}/api/gacha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                gemData: currentGemResult
            })
        });

        const data = await res.json();
        if (data.success) {
            currentUser.gacha_counter = data.counter;
            currentUser.tinh_quang_points = data.remainingPoints;
            if (!currentUser.unlocked_gems.includes(currentGemResult.code)) {
                currentUser.unlocked_gems.push(currentGemResult.code);
            }
            if (data.blessing) {
                addItemToInventory(data.blessing);
            }

            saveUserData();
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();

            // Hiển thị banner - dùng requestIdleCallback để không block main thread
            const showBanner = () => {
                collectBanner.classList.remove("hidden");
                
                requestAnimationFrame(() => {
                    // Force reflow sau khi browser đã paint frame mới
                    collectBanner.offsetHeight;
                    
                    // Hiển thị 3 giây rồi bắt đầu slide down
                    setTimeout(startBannerExit, 3000);
                });
            };

            // Ưu tiên requestIdleCallback (non-blocking), fallback requestAnimationFrame
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(showBanner, { timeout: 200 });
            } else {
                requestAnimationFrame(showBanner);
            }

            function startBannerExit() {
                // Bắt đầu animation slide down
                collectBanner.classList.add("slide-down-exit");
                
                // Named function để removeEventListener chắc chắn work
                function handleBannerExit(e) {
                    if (e.propertyName !== 'transform') return;
                    collectBanner.removeEventListener('transitionend', handleBannerExit);
                    
                    // Chỉ ẩn hẳn sau khi animation xong
                    collectBanner.classList.add("hidden");
                    collectBanner.classList.remove("slide-down-exit");
                    
                    // Bây giờ mới xử lý blessing, fade canvas, reset state
                    // Mốc sưu tầm (33 biến thể) hiếm hơn nhiều nên được ưu tiên:
                    // nếu trúng mốc, chúc phúc bị hoãn lại mở sau khi đóng modal mốc.
                    handleGemMilestones(data).then(milestoneHit => {
                        if (data.blessing) {
                            const openBlessing = () => openBlessingModal(
                                data.blessing,
                                `Lượt quay thứ ${data.counter}! Nhận Tinh Linh chúc phúc:`
                            );
                            milestoneHit ? queueMilestoneNextAction(openBlessing) : openBlessing();
                        }
                    });
                    
                    // Fade canvas mượt
                    app3dCanvas.style.transition = 'opacity 0.4s ease';
                    app3dCanvas.style.opacity = "0.2";
                    
                    setTimeout(() => {
                        app3dCanvas.style.opacity = "1";
                        // Reset state IDLE ở cuối chain animation
                        state = STATE.IDLE;
                        
                        // Show Guide & Lore Helpers lại khi về IDLE (chỉ non-guest mode)
                        if (!document.body.classList.contains('guest-mode')) {
                            guideHelperShown = false;
                            loreHelperShown = false;
                            setTimeout(showGuideHelper, 3000);
                            setTimeout(showLoreHelper, 3500);
                        }
                        // Update Gacha Ready Tooltip
                        updateGachaReadyTooltip();
                    }, 400);
                }
                
                collectBanner.addEventListener('transitionend', handleBannerExit);
            }
        } else {
            toast.error('GACHA THẤT BẠI', data.error || 'Lỗi giao dịch Gacha!');
            state = STATE.IDLE;
            // Show helpers again on error
            if (!document.body.classList.contains('guest-mode')) {
                guideHelperShown = false;
                loreHelperShown = false;
                setTimeout(showGuideHelper, 3000);
                setTimeout(showLoreHelper, 3500);
            }
            // Update Gacha Ready Tooltip
            updateGachaReadyTooltip();
        }
    } catch (e) {
        // Fallback Offline
        currentUser.gacha_counter++;
        currentUser.tinh_quang_points = Math.max(0, currentUser.tinh_quang_points - 1);
        if (!currentUser.unlocked_gems.includes(currentGemResult.code)) {
            currentUser.unlocked_gems.push(currentGemResult.code);
        }
        saveUserData();
        updateTopBarUI();
        renderInventoryGems();
        renderInventory5x5();
        state = STATE.IDLE;
        // Offline không thể xác thực mốc sưu tầm trên D1 — để lần sync tới sẽ tự nhận.
        checkAndClaimGemMilestones();
        // Show helpers again on offline fallback
        if (!document.body.classList.contains('guest-mode')) {
            guideHelperShown = false;
            loreHelperShown = false;
            setTimeout(showGuideHelper, 500);
            setTimeout(showLoreHelper, 1000);
        }
        // Update Gacha Ready Tooltip
        updateGachaReadyTooltip();
    }
}

document.getElementById("btnGoToShopAfterBlessing")?.addEventListener("click", () => {
    blessingModal.classList.add("hidden");
    document.querySelector('.dock-btn[data-target="shop-view"]').click();
});

// ======================================================
// 6. ANIMATIONS & STATE UPDATE
// ======================================================
function updateParticles(elapsed, progress) {
    const positions = particleGeometry.attributes.position.array;
    const totalTime = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleData[i];
        const wanderX = p.baseX + Math.sin(totalTime * p.driftSpeed + p.phaseX) * p.driftRadius;
        const wanderY = p.baseY + Math.cos(totalTime * p.driftSpeed * 0.8 + p.phaseY) * p.driftRadius;
        const wanderZ = p.baseZ + Math.sin(totalTime * p.driftSpeed * 1.2 + p.phaseZ) * p.driftRadius;

        if (state === STATE.IDLE) {
            positions[i * 3]     = wanderX;
            positions[i * 3 + 1] = wanderY;
            positions[i * 3 + 2] = wanderZ;
        } else if (state === STATE.GACHA) {
            const currentAngle = p.angle + (elapsed * p.vortexSpeed) * (1 + progress * 2.5);
            const collapse = Math.max(0, (progress - 0.45) / 0.55);
            const currentRadius = THREE.MathUtils.lerp(p.radius, 0.25, collapse);
            const verticalWave = Math.sin(elapsed * 4 + p.random * 10) * 0.3 * (1 - collapse);

            positions[i * 3]     = Math.cos(currentAngle) * currentRadius;
            positions[i * 3 + 1] = Math.sin(currentAngle * 1.5) * currentRadius * 0.35 + verticalWave;
            positions[i * 3 + 2] = Math.sin(currentAngle * 1.5) * currentRadius;
        } else {
            const isNearGem = (i % 4 === 0);
            const orbitRadius = isNearGem ? (2.2 + p.random * 1.5) : (p.radius * 1.5);

            positions[i * 3]     = Math.cos(p.angle + elapsed * 0.25) * orbitRadius;
            positions[i * 3 + 1] = wanderY * (isNearGem ? 0.6 : 1.2);
            positions[i * 3 + 2] = Math.sin(p.angle + elapsed * 0.25) * orbitRadius;
        }
    }
    particleGeometry.attributes.position.needsUpdate = true;
}

function updateCore(elapsed, progress) {
    if (state === STATE.GACHA) {
        const appear = Math.max(0, (progress - 0.45) / 0.55);
        coreMaterial.opacity = appear;
        coreGlowMaterial.opacity = appear * 0.7;
        coreGroup.scale.setScalar(appear * (1 + Math.sin(elapsed * 12) * 0.05));
        
        if (progress > 0.5) {
            coreGroup.position.x = (Math.random() - 0.5) * 0.02 * appear;
            coreGroup.position.y = (Math.random() - 0.5) * 0.02 * appear;
        }
    } else if (state === STATE.CORE) {
        coreMaterial.opacity = 1;
        coreGlowMaterial.opacity = 0.85;
        coreGroup.position.x = Math.sin(elapsed * 65) * 0.04;
        coreGroup.position.y = Math.cos(elapsed * 50) * 0.03;
        coreGroup.scale.setScalar(1 + Math.sin(elapsed * 16) * 0.12);
    }
}

function updateState(now) {
    const elapsed = (now - stateStart) / 1000;
    let shakeStrength = 0;

    const fastGachaActive = (typeof isFastGachaEnabled !== "undefined" && isFastGachaEnabled) || window.isFastGachaEnabled;

    if (fastGachaActive && (state === STATE.GACHA || state === STATE.CORE)) {
        coreMaterial.opacity = 0;
        coreGlowMaterial.opacity = 0;
        coreGroup.scale.setScalar(0);
        coreGroup.position.set(0, 0, 0);
        
        state = STATE.LOOT;
        stateStart = now;
        lootText.classList.add("show");
        claimContainer.classList.remove("hidden");

        app3dCanvas.style.transform = "";
        camera.position.set(0, 1.2, 8);
        controls.target.set(0, 0.2, 0);
        return;
    }

    if (state === STATE.IDLE) {
        updateParticles(elapsed, 0);
    } else if (state === STATE.GACHA) {
        particles.material.opacity = THREE.MathUtils.lerp(particles.material.opacity, 0.9, 0.05);
        particles.material.size = THREE.MathUtils.lerp(particles.material.size, 0.07, 0.05);
        const progress = Math.min(elapsed / 3.5, 1);
        updateParticles(elapsed, progress);
        updateCore(elapsed, progress);

        if (progress > 0.5) {
            shakeStrength = ((progress - 0.5) / 0.5) * 3.5;
        }

        if (elapsed >= 3.5) {
            state = STATE.CORE;
            stateStart = now;
        }
    } else if (state === STATE.CORE) {
        updateParticles(elapsed, 1);
        updateCore(elapsed, 1);
        shakeStrength = 6 + Math.sin(elapsed * 30) * 2;

        if (elapsed >= 1.0) {
            coreMaterial.opacity = 0;
            coreGlowMaterial.opacity = 0;
            coreGroup.scale.setScalar(0);
            coreGroup.position.set(0, 0, 0);
            state = STATE.LOOT;
            stateStart = now;
            lootText.classList.add("show");
            claimContainer.classList.remove("hidden");
            
            camera.position.set(0, 1.2, 8);
            controls.target.set(0, 0.2, 0);
        }
    } else if (state === STATE.LOOT && lootBox) {
        updateParticles(elapsed, 0);
        lootBox.rotation.y += 0.008;
        lootBox.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.08);
        lootBox.position.lerp(new THREE.Vector3(0, 0.5, 0), 0.08);

        particles.material.opacity = THREE.MathUtils.lerp(particles.material.opacity, 0.35, 0.05);
        particles.material.size = THREE.MathUtils.lerp(particles.material.size, 0.04, 0.05);
    } else if (state === STATE.CLAIMED && lootBox) {
        updateParticles(elapsed, 0);
        lootBox.position.y -= 0.04;
        lootBox.scale.multiplyScalar(0.94);
    }

    if (shakeStrength > 0) {
        const rx = (Math.random() - 0.5) * shakeStrength;
        const ry = (Math.random() - 0.5) * shakeStrength;
        app3dCanvas.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        camera.position.x = (Math.random() - 0.5) * (shakeStrength * 0.01);
        camera.position.y = 1.2 + (Math.random() - 0.5) * (shakeStrength * 0.01);
    } else {
        app3dCanvas.style.transform = "";
    }
}

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    if (state === STATE.GACHA || state === STATE.CORE) {
        pointLight.intensity = 8 + Math.sin(elapsed * 5) * 2;
    } else if (state === STATE.LOOT) {
        pointLight.intensity = THREE.MathUtils.lerp(pointLight.intensity, 4.0, 0.05);
    } else {
        pointLight.intensity = THREE.MathUtils.lerp(pointLight.intensity, 0, 0.03);
    }

    updateState(performance.now());
    controls.update();
    composer.render();
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    // Cập nhật vị trí guest helper nếu đang active
    if (guestHelperShown && guestHelper && !guestHelper.classList.contains('hidden') && 
        guestHelper.classList.contains('active')) {
        const pos = getGuestHelperTargetPosition();
        guestHelper.style.top = pos.top;
        guestHelper.style.right = pos.right;
    }

    // Cập nhật vị trí guide helper nếu đang active
    if (guideHelperShown && guideHelper && !guideHelper.classList.contains('hidden') && 
        guideHelper.classList.contains('active')) {
        const pos = getGuideHelperTargetPosition();
        guideHelper.style.top = pos.top;
        guideHelper.style.left = pos.left;
    }

    // Cập nhật vị trí lore helper nếu đang active
    if (loreHelperShown && loreHelper && !loreHelper.classList.contains('hidden') && 
        loreHelper.classList.contains('active')) {
        const pos = getLoreHelperTargetPosition();
        loreHelper.style.top = pos.top;
        loreHelper.style.right = pos.right;
    }

    // Cổng 3D góc màn hình tự co giãn theo khung (ResizeObserver lo phần còn lại)
    cornerPortal?.resize();
});

// ======================================================
// 7. ĐIỀU HƯỚNG & NÚT TRỞ VỀ 🎪
// ======================================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (targetId === "inventory-view") {
            syncUserDataFromBackend(); // Kéo dữ liệu D1 mới nhất về túi đồ
            checkAndClaimGemMilestones(); // Nhận mốc sưu tầm 33 biến thể nếu còn thiếu
            // SFX: tiếng mở túi vật phẩm
            sfxBlanket();
        }
        if (targetId === "quest-view") {
            refreshRollQuestBadge(); // Cập nhật số lượt NHẬP VAI còn lại trên pin card
            // SFX: tiếng lật giấy khi mở Bảng Nhiệm Vụ
            sfxPaper();
        }
        if (targetId === "profile-view") {
            // SFX: tiếng lật giấy khi mở Hồ Sơ
            sfxPaper();
        }
        if (targetId === "shop-view") {
            // SFX: tiếng chuông khi mở Cửa Hàng Phiên Chợ
            sfxBell();
        }
        if (targetId === "gacha-view") {
            controls.enabled = true;
            document.getElementById("tabIndicator").textContent = "✧LINH CẢNH✦ \n CỔNG KẾT NỐI TINH LINH";
            viewPanels.forEach(p => {
                if (p.id !== "gacha-view") p.classList.add("hidden");
            });
            document.getElementById("gacha-view").classList.remove("hidden");
            document.getElementById("gacha-view").classList.add("active");
            // Update Gacha Ready Tooltip when entering gacha-view
            updateGachaReadyTooltip();
            // Cổng 3D góc màn hình quay lại cùng điều kiện với lore helper
            if (!document.body.classList.contains('guest-mode')) showCornerPortal();
            return;
        }

        controls.enabled = false;
        viewPanels.forEach(p => {
            if (p.id !== "gacha-view") p.classList.add("hidden");
        });
        
        // Hide Gacha Ready Tooltip when leaving gacha-view
        hideGachaReadyTooltip();
        // Cổng 3D góc màn hình chỉ sống trong gacha-view
        hideCornerPortal();

        const activePanel = document.getElementById(targetId);
        if (activePanel) {
            activePanel.classList.remove("hidden");
            document.getElementById("tabIndicator").textContent = btn.querySelector(".dock-label")?.textContent || "Menu";
        }
    });
});

function returnToGachaHome() {
    controls.enabled = true;
    viewPanels.forEach(p => {
        if (p.id !== "gacha-view") p.classList.add("hidden");
    });
    navButtons.forEach(b => b.classList.remove("active"));
    dockGachaTrigger.classList.add("active");
    document.getElementById("gacha-view").classList.remove("hidden");
    document.getElementById("gacha-view").classList.add("active");
    document.getElementById("tabIndicator").textContent = "✧LINH CẢNH✦ \n CỔNG KẾT NỐI TINH LINH";
    if (state !== STATE.LOOT && claimContainer) {
        claimContainer.classList.add("hidden");
    }
    // Update Gacha Ready Tooltip when returning to gacha-view
    updateGachaReadyTooltip();
    // Cổng 3D góc màn hình hiện lại (điều kiện y hệt lore helper)
    if (!document.body.classList.contains('guest-mode')) showCornerPortal();
}

document.querySelectorAll(".btn-back-dock").forEach(btn => btn.addEventListener("click", returnToGachaHome));
document.querySelectorAll(".close-panel-btn").forEach(btn => btn.addEventListener("click", returnToGachaHome));
document.getElementById("btnProfileQuick").addEventListener("click", () => {
    document.querySelector('.dock-btn[data-target="profile-view"]').click();
});

// ======================================================
// 8. TỦ 990 ĐÁ & LƯỚI VẬT PHẨM 5x5
// ======================================================
let currentFilterSys = "ALL";

document.querySelectorAll(".inv-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".inv-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const subId = btn.dataset.sub;
        document.querySelectorAll(".inv-content").forEach(c => c.classList.add("hidden"));
        document.getElementById(subId).classList.remove("hidden");
        if (subId === "sub-gems") {
            // SFX: tiếng blink khi chuyển sang tab Quang Thạch
            sfxBlink();
            renderInventoryGems();
        } else if (subId === "sub-items") {
            // SFX: tiếng mở hòm gỗ khi chuyển sang tab Vật Phẩm
            sfxWoodbox();
        }
    });
});

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilterSys = btn.dataset.sys;
        renderInventoryGems();
    });
});

// Mini 3D Preview
let previewRenderer = null;
let previewComposer = null;
let previewScene = null;
let previewCamera = null;
let previewControls = null;
let previewMesh = null;
let previewPointLight = null;
let isPreviewActive = false;

const gemPreviewModal = document.getElementById("gemPreviewModal");
const gem3dContainer = document.getElementById("gem3dPreviewContainer");

function initMiniGem3D() {
    if (previewRenderer) return;

    previewScene = new THREE.Scene();
    previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    previewCamera.position.set(0, 0.4, 4.2);

    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    previewRenderer.setSize(170, 170);
    previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
    previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    previewRenderer.toneMappingExposure = 1.2;
    gem3dContainer.appendChild(previewRenderer.domElement);

    previewComposer = new EffectComposer(previewRenderer);
    previewComposer.addPass(new RenderPass(previewScene, previewCamera));
    previewComposer.addPass(new UnrealBloomPass(
        new THREE.Vector2(170, 170), 
        0.7, 0.4, 0.3
    ));
    previewComposer.addPass(new OutputPass());

    previewControls = new OrbitControls(previewCamera, previewRenderer.domElement);
    previewControls.enableZoom = false;
    previewControls.enablePan = false;
    previewControls.enableDamping = true;
    previewControls.dampingFactor = 0.08;

    previewScene.add(new THREE.AmbientLight(0x443366, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 5, 3);
    previewScene.add(dirLight);

    previewPointLight = new THREE.PointLight(0xffffff, 4.0, 10);
    previewPointLight.position.set(0, 0.5, 1.5);
    previewScene.add(previewPointLight);
}

function openGemPreviewModal(gemData) {
    initMiniGem3D();

    document.getElementById("previewGemCodeTag").textContent = gemData.isUnlocked ? gemData.code : "???";
    document.getElementById("previewGemTitle").textContent = gemData.isUnlocked ? gemData.name : "Quang Thạch Ẩn Danh";
    document.getElementById("previewGemShape").textContent = gemData.isUnlocked ? gemData.shapeName : "Chưa khám phá";
    document.getElementById("previewGemFaces").textContent = gemData.isUnlocked ? `${gemData.face} Diện Thể` : "?? Mặt";
    document.getElementById("previewGemSysTag").innerHTML = `
        <i class="rpg-ico ico-elem-${gemData.sysKey}"></i> ${gemData.sysName || 'Nguyên Tố'}
    `;

    document.getElementById("previewGemDesc").textContent = gemData.isUnlocked 
        ? `Đã mở khóa! Khoáng thạch chứa linh lực nguyên tố tinh khiết bậc ${gemData.face} diện thể.`
        : "Biến thể huyền bí này chưa được khai mở. Hãy triệu hồi tại Bệ Đá Tinh Quang để thu thập vào bộ sưu tập!";

    if (previewMesh) {
        previewScene.remove(previewMesh);
        if (previewMesh.geometry) previewMesh.geometry.dispose();
        if (previewMesh.material) previewMesh.material.dispose();
        previewMesh = null;
    }

    const shape = SHAPE_STYLES.find(s => s.id === gemData.shapeId) || SHAPE_STYLES[0];
    const points = [];
    const rx = (shape.rx[0] + shape.rx[1]) / 2;
    const ry = (shape.ry[0] + shape.ry[1]) / 2;
    const rz = (shape.rz[0] + shape.rz[1]) / 2;

    for (let i = 0; i < gemData.face; i++) {
        const y = 1 - (i / (gemData.face - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = GOLDEN_ANGLE * i;
        points.push(new THREE.Vector3(
            Math.cos(theta) * radiusAtY * rx,
            y * ry,
            Math.sin(theta) * radiusAtY * rz
        ));
    }

    const geo = new ConvexGeometry(points);
    geo.computeVertexNormals();

    if (gemData.isUnlocked) {
        previewPointLight.color.setHex(gemData.color);
        previewPointLight.intensity = 2.0;
    } else {
        previewPointLight.intensity = 0;
    }

    const mat = new THREE.MeshStandardMaterial({
        color: gemData.isUnlocked ? gemData.color : 0x1a162b,
        emissive: gemData.isUnlocked ? gemData.emissive : 0x000000,
        emissiveIntensity: gemData.isUnlocked ? 0.2 : 0,
        roughness: gemData.isUnlocked ? 0.18 : 0.8,
        metalness: 0.35,
        flatShading: true,
        wireframe: !gemData.isUnlocked
    });

    previewMesh = new THREE.Mesh(geo, mat);
    previewMesh.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: gemData.isUnlocked ? 0.8 : 0.25 })
    ));
    previewScene.add(previewMesh);

    isPreviewActive = true;
    gemPreviewModal.classList.remove("hidden");
    applyI18nToElement(gemPreviewModal);
    previewCamera.position.set(0, 0.4, 4.2);
    previewControls.target.set(0, 0, 0);

    function loop() {
        if (!isPreviewActive) return;
        requestAnimationFrame(loop);
        if (previewMesh) {
            previewMesh.rotation.y += 0.009;
            previewMesh.rotation.x += 0.004;
        }
        previewControls.update();
        previewComposer.render();
    }
    loop();
}

document.getElementById("closeGemPreviewModal").addEventListener("click", () => {
    isPreviewActive = false;
    gemPreviewModal.classList.add("hidden");
});

function renderInventoryGems() {
    const grid = document.getElementById("gemGrid");
    if (!grid) return;

    // Đảm bảo unlocked_gems luôn là mảng, tránh lỗi null
    if (!Array.isArray(currentUser.unlocked_gems)) {
        currentUser.unlocked_gems = [];
    }

    const unlockedSet = new Set(currentUser.unlocked_gems);
    const count = unlockedSet.size;

    // Cập nhật chuẩn xác cho cả Topbar, Hồ Sơ và Nút bấm Tab
    const topbarCountEl = document.getElementById("topbarGemCount");
    if (topbarCountEl) topbarCountEl.textContent = count; // Số đá đã có trên Topbar

    const profileCountEl = document.getElementById("profStatGemCount");
    if (profileCountEl) profileCountEl.textContent = `${count}/990`; // Tiến trình sưu tầm trong Hồ Sơ

    const tabCountEl = document.getElementById("tabGemProgressCount");
    if (tabCountEl) tabCountEl.textContent = `${count}/990`; // Hiển thị tỉ lệ trên nút Tab

    const tabGemsBtn = document.getElementById("tabGemsBtn");
    if (tabGemsBtn) tabGemsBtn.innerHTML = `✧ Quang Thạch <span id="tabGemProgressCount">${count}/990</span>`;

    const pct = ((count / 990) * 100).toFixed(1);
    const pctEl = document.getElementById("gemProgressPct");
    if (pctEl) pctEl.textContent = `${pct}%`;
    const barEl = document.getElementById("gemProgressBar");
    if (barEl) barEl.style.width = `${pct}%`;

    // Nhắc mốc thưởng kế tiếp (mỗi 33 biến thể nhận 1 phiếu quà tặng)
    const milestoneHintEl = document.getElementById("gemMilestoneHint");
    if (milestoneHintEl) {
        if (count >= GEM_TOTAL_COLLECTION) {
            milestoneHintEl.textContent = "🏆 Đã sưu tầm trọn bộ 990 biến thể!";
        } else {
            const next = (Math.floor(count / GEM_MILESTONE_STEP) + 1) * GEM_MILESTONE_STEP;
            const remain = next - count;
            milestoneHintEl.textContent = `✧ Mốc thưởng tiếp theo: ${next}/990 (còn ${remain} biến thể → 1 phiếu quà tặng)`;
        }
    }

    const filteredPalettes = currentFilterSys === "ALL" 
        ? CRYSTAL_PALETTES 
        : CRYSTAL_PALETTES.filter(p => p.sysKey === currentFilterSys);

    const unlockedList = [];
    const lockedList = [];

    filteredPalettes.forEach(pal => {
        FACE_TIERS.forEach(face => {
            SHAPE_STYLES.forEach(shape => {
                const code = `${pal.sys}${pal.sysIndex}${face}${shape.id}`;
                const isUnlocked = unlockedSet.has(code);

                const itemData = {
                    code,
                    name: pal.name,
                    sysKey: pal.sysKey,
                    sysName: pal.name.split(" ")[0],
                    face,
                    shapeId: shape.id,
                    shapeName: shape.name,
                    color: pal.color,
                    emissive: pal.emissive,
                    isUnlocked
                };

                if (isUnlocked) unlockedList.push(itemData);
                else lockedList.push(itemData);
            });
        });
    });

    const sortedGems = [...unlockedList, ...lockedList];

    grid.innerHTML = sortedGems.map((g, idx) => {
        const elemIconClass = g.isUnlocked ? `ico-elem-${g.sysKey}` : `ico-elem-unknown`;
        return `
            <div class="gem-slot ${g.isUnlocked ? 'unlocked' : 'locked'}" data-idx="${idx}">
                <div class="gem-slot-icon"><i class="rpg-ico ${elemIconClass}"></i></div>
                <div class="gem-slot-code">${g.isUnlocked ? g.code : '???'}</div>
                <div class="gem-slot-name" ${g.isUnlocked ? '' : 'data-i18n="gemPreview.lockedName"'}>${g.isUnlocked ? g.name : ''}</div>
            </div>
        `;
    }).join('');

    applyI18nToElement(grid);

    grid.querySelectorAll(".gem-slot").forEach(slot => {
        slot.addEventListener("click", () => {
            const idx = parseInt(slot.dataset.idx);
            openGemPreviewModal(sortedGems[idx]);
        });
    });
}

function renderInventory5x5() {
    const grid = document.getElementById("itemGrid");
    if (!grid) return;

    let slotsHtml = "";
    for (let i = 0; i < 25; i++) {
        const item = currentUser.inventory[i];
        if (item) {
            slotsHtml += `
                <div class="item-slot" data-index="${i}">
                    <span class="item-slot-icon"><i class="item-ico ${item.iconClass}"></i></span>
                    <span class="item-slot-qty">x${item.quantity}</span>
                </div>
            `;
        } else {
            slotsHtml += `<div class="item-slot empty"></div>`;
        }
    }
    grid.innerHTML = slotsHtml;

    applyI18nToElement(grid);

    grid.querySelectorAll(".item-slot:not(.empty)").forEach(slot => {
        slot.addEventListener("click", () => {
            const idx = parseInt(slot.dataset.index);
            openItemModal(currentUser.inventory[idx], idx);
        });
    });
}

// Modal Item QR
const itemModal = document.getElementById("itemModal");
const qrcodeContainer = document.getElementById("qrcodeContainer");

// ======================================================
// PHASE 3: XỬ LÝ SỬ DỤNG ITEM BUFF & MÃ QR ĐỘNG THỰC ĐỊA
// ======================================================
let qrCheckPollTimer = null;
const BUFF_USE_BTN_LABEL = "✧ SỬ DỤNG BUFF NGAY ✧";

function openItemModal(item, itemIndex) {
    if (qrCheckPollTimer) clearInterval(qrCheckPollTimer);

    itemModal.classList.remove("hidden");
    applyI18nToElement(itemModal);
    document.getElementById("modalItemTitle").innerHTML = `<i class="item-ico ${item.iconClass}"></i> ${item.name}`;
    document.getElementById("modalItemDesc").textContent = item.desc || "Vật phẩm dã ngoại thuộc Hội Ngọc Lục.";
    
    const qrWrapper = document.getElementById("qrWrapperOffline");
    const qrcodeContainer = document.getElementById("qrcodeContainer");
    const btnUseBuff = document.getElementById("btnUseBuffItem");
    const noteText = document.getElementById("modalQrNote");
    const tokenTxt = document.getElementById("modalQrTokenTxt");
    const statusTxt = document.getElementById("qrLiveStatusTxt");

    qrcodeContainer.innerHTML = "";

    // Reset trạng thái về mặc định (trường hợp QR thực địa) trước khi áp dụng theo loại item
    qrWrapper.classList.remove("hidden", "is-buff");
    qrcodeContainer.classList.remove("hidden");
    tokenTxt.classList.remove("hidden");
    statusTxt.textContent = "Sẵn sàng xác thực thực địa";
    btnUseBuff.textContent = BUFF_USE_BTN_LABEL;
    btnUseBuff.disabled = false;

    // TRƯỜNG HỢP 1: VẬT PHẨM BUFF ĐIỂM TRỰC TIẾP
    if (item.isBuff) {
        // Buff không cần mã QR thực địa -> ẩn QR + token, chỉ giữ dòng trạng thái
        qrcodeContainer.classList.add("hidden");
        tokenTxt.classList.add("hidden");
        qrWrapper.classList.add("is-buff");
        statusTxt.textContent = "Sử dụng được ngay để nhận Buff";
        btnUseBuff.classList.remove("hidden");
        noteText.textContent = "Nhấn nút dưới để tiêu thụ vật phẩm và cộng chỉ số vào tài khoản của bạn.";

        btnUseBuff.onclick = async () => {
            btnUseBuff.textContent = "Đang áp dụng...";
            btnUseBuff.disabled = true;

            try {
                // Gọi API Worker để trừ item và cộng điểm an toàn trên D1
                const res = await fetch(`${API_URL}/api/inventory/use-buff`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUser.id, itemCode: item.id })
                });
                const data = await res.json();

                if (data.success) {
                    currentUser.tinh_quang_points = data.points.tinh_quang_points;
                    currentUser.cong_hien_points = data.points.cong_hien_points;

                    // Cập nhật số lượng ở client
                    item.quantity--;
                    if (item.quantity <= 0) currentUser.inventory.splice(itemIndex, 1);

                    saveUserData();
                    updateTopBarUI();
                    renderInventory5x5();
                    itemModal.classList.add("hidden");

                    const buffMsg = [];
                    if (data.buffApplied.tq) buffMsg.push(`+${data.buffApplied.tq} 🔮 Tinh Quang`);
                    if (data.buffApplied.ch) buffMsg.push(`+${data.buffApplied.ch} 🛡️ Cống Hiến`);
                    toast.success('SỬ DỤNG THÀNH CÔNG', `Bạn nhận được: ${buffMsg.join(", ")}`);
                } else {
                    toast.error('SỬ DỤNG THẤT BẠI', data.error || 'Không thể sử dụng vật phẩm này!');
                }
            } catch (err) {
                toast.error('LỖI KẾT NỐI', 'Lỗi kết nối máy chủ!');
            } finally {
                btnUseBuff.textContent = BUFF_USE_BTN_LABEL;
                btnUseBuff.disabled = false;
            }
        };
    } 
    // TRƯỜNG HỢP 2: VẬT PHẨM DỊCH VỤ / QUY ĐỔI THỰC ĐỊA (MÃ QR ĐỘNG)
    else {
        qrWrapper.classList.remove("hidden");
        btnUseBuff.classList.add("hidden");
        noteText.textContent = "Đưa mã QR này cho Hội Ngọc Lục quét tại Rừng Tinh Linh. \n Hiệu lực 50 ngày kể từ ngày nhận.";

        // 1. Đảm bảo vật phẩm luôn có token hợp lệ (nếu thiếu tự sinh ngay)
        if (!item.qr_token) {
            item.qr_token = "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase();
            saveUserData();
        }

        tokenTxt.textContent = `MÃ: ${item.qr_token}`;

        // 2. Đóng gói dữ liệu QR thuần ASCII (Không chứa tiếng Việt có dấu, nhẹ và quét siêu nhanh)
        const qrPayload = JSON.stringify({
            token: item.qr_token,
            code: currentUser.adventurer_code || "AW----",
            item: item.id
        });

        // 3. Khởi tạo mã QR an toàn với try/catch
        try {
            new QRCode(qrcodeContainer, {
                text: qrPayload,
                width: 120,
                height: 120,
                colorDark: "#08300aff",
                colorLight: "#ffffff",
                correctLevel: (typeof QRCode !== "undefined" && QRCode.CorrectLevel) ? QRCode.CorrectLevel.M : 0
            });
        } catch (err) {
            console.error("Lỗi tạo QR:", err);
            // Fallback: nếu chuỗi JSON vẫn quá dài thì chỉ mã hóa duy nhất qr_token
            new QRCode(qrcodeContainer, {
                text: item.qr_token,
                width: 120,
                height: 120
            });
        }

        // Lắng nghe trạng thái quét thời gian thực (polling)
        qrCheckPollTimer = setInterval(async () => {
            try {
                const checkRes = await fetch(`${API_URL}/api/inventory/check-qr?token=${item.qr_token}`);
                const checkData = await checkRes.json();
                if (checkData.success && checkData.isUsed) {
                    clearInterval(qrCheckPollTimer);
                    toast.success('XÁC THỰC THÀNH CÔNG', `🎉 XÁC THỰC THÀNH CÔNG TẠI THỰC ĐỊA!\nQuản lý đã xác nhận vật phẩm [${item.name}].`);
                    item.quantity--;
                    if (item.quantity <= 0) currentUser.inventory.splice(itemIndex, 1);
                    saveUserData();
                    renderInventory5x5();
                    itemModal.classList.add("hidden");
                }
            } catch (e) {}
        }, 3000);
    }
}

document.getElementById("closeItemModal").addEventListener("click", () => {
    if (qrCheckPollTimer) clearInterval(qrCheckPollTimer);
    itemModal.classList.add("hidden");
});

const selectedShopIds = new Set();
const shopDetailModal = document.getElementById("shopDetailModal");
let viewingShopItem = null;

function renderShop() {
    const container = document.getElementById("shopItemsContainer");
    if (!container) return;

    container.innerHTML = SHOP_ITEMS.map(p => `
        <div class="shop-2col-card ${selectedShopIds.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
            <div class="shop-2col-icon"><i class="rpg-ico ${p.iconClass}" style="width:32px;height:32px;"></i></div>
            <div class="shop-2col-title">${p.name}</div>
            <div class="shop-2col-tag">💎 ${p.tt} Tinh Thạch</div>
        </div>
    `).join('');

    container.querySelectorAll(".shop-2col-card").forEach(c => {
        c.addEventListener("click", () => {
            const id = c.dataset.id;
            viewingShopItem = SHOP_ITEMS.find(x => x.id === id);
            openShopDetail(viewingShopItem);
        });
    });
}

function openShopDetail(item) {
    document.getElementById("shopModalIconBox").innerHTML = `<i class="rpg-ico ${item.iconClass}" style="width:48px;height:48px;"></i>`;
    document.getElementById("shopModalTitle").textContent = item.name;
    document.getElementById("shopModalPrice").textContent = `💎 ${item.tt} Tinh Thạch (~${item.vnd.toLocaleString()} đ)`;
    document.getElementById("shopModalDesc").textContent = item.desc;

    const btn = document.getElementById("btnToggleCartItem");
    const isSelected = selectedShopIds.has(item.id);
    btn.textContent = isSelected ? "BỎ CHỌN MỤC NÀY" : "CHỌN MỤC NÀY";
    btn.style.background = isSelected ? "#c9184a" : "linear-gradient(180deg, #7c6cff, #4a34b8)";

    btn.onclick = () => {
        // SFX: tiếng mở túi vật phẩm khi chọn / bỏ chọn mục trong giỏ
        sfxBlanket();
        if (selectedShopIds.has(item.id)) selectedShopIds.delete(item.id);
        else selectedShopIds.add(item.id);

        renderShop();
        updateShopCheckout();
        shopDetailModal.classList.add("hidden");
    };

    shopDetailModal.classList.remove("hidden");
    applyI18nToElement(shopDetailModal);
}
document.getElementById("closeShopDetailModal")?.addEventListener("click", () => shopDetailModal.classList.add("hidden"));

function updateShopCheckout() {
    let totalTT = 0;
    let totalVND = 0;
    selectedShopIds.forEach(id => {
        const item = SHOP_ITEMS.find(x => x.id === id);
        if (item) {
            totalTT += item.tt;
            totalVND += item.vnd;
        }
    });
    document.getElementById("cartCount").textContent = selectedShopIds.size;
    document.getElementById("cartTotalTinhThach").textContent = `${totalTT} 💎`;
    document.getElementById("cartTotalVnd").textContent = totalVND.toLocaleString();
}

document.getElementById("btnCheckoutShop")?.addEventListener("click", async () => {
    if (selectedShopIds.size === 0) {
        toast.warning('CHƯA CHỌN SẢN PHẨM', 'Vui lòng chạm chọn ít nhất 1 gói hoặc tiện ích!');
        return;
    }
    const phone = prompt("Nhập SĐT hoặc Zalo để Hội Ngọc Lục liên hệ xác nhận đơn:");
    if (!phone) return;

    // SFX: tiếng xu khi đơn hàng thực sự được gửi đi
    // (đặt sau 2 lần check ở trên để không phát nhầm khi giỏ rỗng hoặc user bỏ prompt)
    sfxCoin();

    try {
        await fetch(`${API_URL}/api/shop-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                packageName: Array.from(selectedShopIds).join(", "),
                tinhThach: parseInt(document.getElementById("cartTotalTinhThach").textContent),
                vnd: parseInt(document.getElementById("cartTotalVnd").textContent.replace(/,/g, '')),
                phone: phone
            })
        });
    } catch(e) {}

    toast.success('ĐẶT HÀNG THÀNH CÔNG', '✧ Thông tin đơn hàng đã gửi tới Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.');
    selectedShopIds.clear();
    renderShop();
    updateShopCheckout();
});

// ======================================================
// 10. NHIỆM VỤ PIN-BOARD & QUIZ
// ======================================================
// Điểm danh hằng ngày với Server D1 (Chuỗi 7 ngày tặng thêm điểm)
document.getElementById("btnDoCheckin")?.addEventListener("click", async () => {
    const btn = document.getElementById("btnDoCheckin");
    btn.disabled = true;
    btn.textContent = "Đang kiểm tra...";

    try {
        const res = await fetch(`${API_URL}/api/quest/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id })
        });
        const data = await res.json();

        if (data.success) {
            currentUser.tinh_quang_points = data.tinh_quang_points;
            saveUserData();
            updateTopBarUI();

            const streakText = `Chuỗi: ${data.streak % 7}/7 ngày (Tổng: ${data.streak} ngày)`;
            document.getElementById("streakDisplay").textContent = streakText;
            btn.textContent = "Đã Điểm Danh";

            let alertMsg = `✧ Điểm danh thành công! Nhận +1 🔮 Tinh Quang.`;
            if (data.isBonus) {
                alertMsg = `🎉 XUẤT SẮC! Đạt mốc chuỗi 7 ngày liên tục! Thưởng thêm +1 🔮 (Tổng nhận +2 🔮).`;
            }
            toast.success('ĐIỂM DANH THÀNH CÔNG', alertMsg);
        } else {
            toast.error('ĐIỂM DANH THẤT BẠI', data.error || 'Không thể điểm danh!');
            btn.textContent = "Điểm Danh";
            btn.disabled = false;
        }
    } catch (e) {
        toast.error('LỖI KẾT NỐI', 'Lỗi kết nối máy chủ điểm danh!');
        btn.textContent = "Điểm Danh";
        btn.disabled = false;
    }
});

// app.js: Cập nhật sự kiện nộp bài viết Facebook
document.getElementById("btnSubmitFb")?.addEventListener("click", async () => {
    const linkInput = document.getElementById("inputFbLink");
    const link = linkInput.value.trim();
    if (!link.startsWith("http")) {
        toast.warning('LINK KHÔNG HỢP LỆ', 'Vui lòng nhập đường link bài viết hợp lệ (bắt đầu bằng http...)!');
        return;
    }

    const btn = document.getElementById("btnSubmitFb");
    btn.textContent = "Đang gửi...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/quest/submit-fb`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                postUrl: link
            })
        });
        const data = await res.json();
        if (data.success) {
            toast.success('GỬI THÀNH CÔNG', '✧ Đã gửi link bài viết cho Quản trị viên Telegram! Vui lòng chờ duyệt (+1 🔮).');
            linkInput.value = "";
        } else {
            toast.error('GỬI THẤT BẠI', data.error || 'Thử lại sau!');
        }
    } catch (e) {
        toast.error('LỖI KẾT NỐI', 'Không thể kết nối đến máy chủ duyệt nhiệm vụ!');
    } finally {
        btn.textContent = "Gửi Duyệt";
        btn.disabled = false;
    }
});

// Yêu cầu đổi tên Nhà Phiêu Lưu
document.getElementById("btnEditName")?.addEventListener("click", async () => {
    if (!currentUser) return;

    const currentName = currentUser.full_name || "Nhà Phiêu Lưu";
    const newName = prompt(`Nhập tên mới cho Nhà Phiêu Lưu:\n(Tên hiện tại: ${currentName})`, currentName);

    if (newName === null || newName.trim() === "") {
        return;
    }

    const trimmedName = newName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
        toast.warning('TÊN KHÔNG HỢP LỆ', 'Tên phải từ 2-30 ký tự!');
        return;
    }

    if (trimmedName === currentName) {
        return;
    }

    const btn = document.getElementById("btnEditName");
    btn.style.pointerEvents = "none";
    btn.textContent = "⏳";

    try {
        const res = await fetch(`${API_URL}/api/user/request-change-name`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                newName: trimmedName
            })
        });
        const data = await res.json();
        if (data.success) {
            toast.info('YÊU CẦU ĐÃ ĐƯỢC GHI NHẬN', 'Hội đã ghi nhận yêu cầu của Nhà Phiêu Lưu, hãy đợi Hội trưởng xác nhận nhé!');
        } else {
            toast.error('GỬI YÊU CẦU THẤT BẠI', data.error || 'Thử lại sau!');
        }
    } catch (e) {
        toast.error('LỖI KẾT NỐI', 'Không thể kết nối đến máy chủ!');
    } finally {
        btn.style.pointerEvents = "auto";
        btn.textContent = "✍🏻";
    }
});

// app.js: Nhiệm vụ Cốt Truyện (placeholder - chưa mở)
document.getElementById("btnOpenLoreQuest")?.addEventListener("click", () => {
    toast.info('VƯỜN TINH LINH', 'CHƯA MỞ KHOÁ');
});

// app.js: Xử lý kết nối bạn bè 2 chiều
document.getElementById("btnSubmitRef")?.addEventListener("click", async () => {
    const input = document.getElementById("inputFriendCode");
    const code = input.value.trim().toUpperCase();
    if (!code.startsWith("AW")) {
        alert("Vui lòng nhập đúng mã Nhà Phiêu Lưu (bắt đầu bằng AW, ví dụ: AW8391)!");
        return;
    }

    const btn = document.getElementById("btnSubmitRef");
    btn.disabled = true;
    btn.textContent = "Đang kết nối...";

    try {
        const res = await fetch(`${API_URL}/api/quest/referral`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, friendCode: code })
        });
        const data = await res.json();

        if (data.success) {
            currentUser.tinh_quang_points = data.tinh_quang_points;
            saveUserData();
            updateTopBarUI();

            alert(`🎉 KẾT NỐI THÀNH CÔNG!\nBạn và [${data.friendName} - ${data.friendCode}] đã kết nối thành công. Cả 2 đều được nhận +1 🔮 Tinh Quang!`);
            input.value = "";
        } else {
            alert(data.error || "Không thể kết nối với mã này!");
        }
    } catch (e) {
        alert("Lỗi kết nối đến máy chủ!");
    } finally {
        btn.disabled = false;
        btn.textContent = "Xác Nhận";
    }
});

// ======================================================
// QUEST MỚI: NHẬP VAI VUI VẺ (MODULE RPG ROLL D20)
// - Mỗi ngày tối đa 3 lượt, mỗi lượt 1 tình huống khác nhau
// - Bắt đầu chơi = mất 1 lượt, thắng 2/3 lượt = +1 🔮 Tinh Quang (tối đa 3 điểm/ngày)
// ======================================================
initRollQuest({
    apiUrl: API_URL,
    getUserId: () => currentUser?.id,
    // Kiểm tra REALTIME currentUser, không dùng isFirstTimeGuest vì đó là const
    // chỉ tính 1 lần lúc load trang -> user đã đăng ký trước đó sẽ bị chặn nhầm
    isGuest: () => !currentUser || !currentUser.adventurer_code || currentUser.adventurer_code === "AW----",
    onReward: (tinhQuang) => {
        currentUser.tinh_quang_points = tinhQuang;
        saveUserData();
        updateTopBarUI();
    }
});

document.getElementById("btnOpenRollQuest")?.addEventListener("click", openRollQuest);

// CỤM XỬ LÝ QUIZ
const quizModal = document.getElementById("quizModal");
let quizPool = [];
let quizCorrectCount = 0;
let currentQuizIdx = 0;

// Xáo trộn các đáp án của 1 câu và tính lại index đáp án đúng (q.c)
function shuffleAnswers(q) {
    if (!q || !Array.isArray(q.a) || q.a.length < 2) return q;
    const correctIdx = q.c;
    const answers = q.a.map((text, i) => ({ text, i }));
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return {
        ...q,
        a: answers.map(o => o.text),
        c: answers.findIndex(o => o.i === correctIdx)
    };
}

document.getElementById("btnOpenQuiz")?.addEventListener("click", async () => {
    const btn = document.getElementById("btnOpenQuiz");
    btn.textContent = "Đang tải câu đố...";

    try {
        const res = await fetch(`${API_URL}/api/quest/quiz-questions`);
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
            // Xáo trộn ngẫu nhiên (shuffle) từ kho 50 câu, kèm xáo trộn đáp án từng câu
            quizPool = data.questions.map(shuffleAnswers).sort(() => 0.5 - Math.random());
            quizCorrectCount = 0;
            currentQuizIdx = 0;
            showQuizQuestion();
            quizModal.classList.remove("hidden");
        }
    } catch (e) {
        toast.error('LỖI TẢI DỮ LIỆU', 'Chưa thể tải bộ câu đố Tinh Linh!');
    } finally {
        btn.textContent = "Giải Mã";
    }
});

function showQuizQuestion() {
    if (currentQuizIdx >= quizPool.length) {
        currentQuizIdx = 0; // Quay vòng nếu chưa đủ 10 câu đúng
    }
    const qData = quizPool[currentQuizIdx];
    document.getElementById("quizQuestionText").innerHTML = `
        <div style="font-size: 10px; color: #00f5d4; margin-bottom: 4px;">Tiến trình: ${quizCorrectCount}/10 câu đúng</div>
        <b>Câu hỏi:</b> ${qData.q}
    `;

    const ansBox = document.getElementById("quizAnswersBox");
    ansBox.innerHTML = qData.a.map((ans, idx) => `
        <button class="btn-quiz-ans" data-idx="${idx}">✧ ${ans}</button>
    `).join('');

    ansBox.querySelectorAll(".btn-quiz-ans").forEach(btn => {
        btn.addEventListener("click", async () => {
            const chosen = parseInt(btn.dataset.idx);
            if (chosen === qData.c) {
                quizCorrectCount++;
                currentQuizIdx++;

                // Khi tích lũy đủ 10 câu đúng
                if (quizCorrectCount >= 10) {
                    try {
                        const completeRes = await fetch(`${API_URL}/api/quest/quiz-complete`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: currentUser.id })
                        });
                        const completeData = await completeRes.json();
                        if (completeData.success) {
                            currentUser.tinh_quang_points = completeData.tinh_quang_points;
                            saveUserData();
                            updateTopBarUI();
                            quizModal.classList.add("hidden");
                            toast.magic('HOÀN THÀNH TRI THỨC', `🎉 HOÀN THÀNH TRI THỨC TINH LINH!\nBạn đã trả lời đúng 10 câu và nhận được +1 🔮 Tinh Quang! (Hôm nay: ${completeData.countToday}/1 lượt)`);
                        } else {
                            toast.error('NHẬN THƯỞNG THẤT BẠI', completeData.error);
                            quizModal.classList.add("hidden");
                        }
                    } catch (err) {
                        toast.error('LỖI KẾT NỐI', 'Lỗi kết nối khi nhận thưởng!');
                    }
                } else {
                    showQuizQuestion();
                }
            } else {
                toast.warning('SAI MẬT MÃ', 'Mật mã chưa chính xác! Hãy thử lại câu khác.');
                currentQuizIdx++;
                showQuizQuestion();
            }
        });
    });
}
document.getElementById("closeQuizModal")?.addEventListener("click", () => quizModal.classList.add("hidden"));

// BẬT CAMERA QUÉT QR KẾT NỐI
let html5QrScanner = null;

document.getElementById("btnScanFriendQr")?.addEventListener("click", () => {
    const scanModal = document.getElementById("friendQrScanModal");
    scanModal.classList.remove("hidden");

    if (typeof Html5Qrcode !== "undefined") {
        html5QrScanner = new Html5Qrcode("qrScannerReader");
        html5QrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 180, height: 180 } },
            (decodedText) => {
                // Nhận diện mã dạng ADVENATURE_USER:AWxxxx hoặc AWxxxx
                let friendCode = decodedText.trim();
                if (friendCode.includes("ADVENATURE_USER:")) {
                    friendCode = friendCode.replace("ADVENATURE_USER:", "").trim();
                }

                if (friendCode.startsWith("AW")) {
                    document.getElementById("inputFriendCode").value = friendCode;
                    stopScanner();
                    scanModal.classList.add("hidden");
                    toast.success('QUÉT THÀNH CÔNG', `✓ Đã nhận diện mã bạn bè: [${friendCode}]! Hãy bấm Xác Nhận.`);
                }
            },
            (error) => {}
        ).catch(err => {
            toast.error('LỖI CAMERA', 'Không thể truy cập Camera. Vui lòng cấp quyền máy ảnh!');
            scanModal.classList.add("hidden");
        });
    }
});

function stopScanner() {
    if (html5QrScanner) {
        html5QrScanner.stop().then(() => {
            html5QrScanner.clear();
            html5QrScanner = null;
        }).catch(() => {});
    }
}

document.getElementById("closeFriendQrScanModal")?.addEventListener("click", () => {
    stopScanner();
    document.getElementById("friendQrScanModal").classList.add("hidden");
});

// MỞ MODAL LỊCH PHIÊU LƯU, BANG HỘI, RANGER
// Mở / Đóng Modal Lịch Trình Shop
document.getElementById("btnOpenScheduleModal")?.addEventListener("click", () => {
    document.getElementById("scheduleModal").classList.remove("hidden");
    // SFX: tiếng lật giấy khi mở Lịch Trình
    sfxPaper();
});
document.getElementById("closeScheduleModal")?.addEventListener("click", () => {
    document.getElementById("scheduleModal").classList.add("hidden");
});

// Mở / Đóng Modal Brochure -> mở Lore Reader Modal
document.getElementById("btnOpenBrochureModal")?.addEventListener("click", () => {
    // SFX: tiếng lật giấy khi mở Cốt Tuyển Tinh Linh
    sfxPaper();
    openLoreReaderModal();
});

// Mở / Đóng Modal Bang Hội
document.getElementById("btnOpenGuildModal")?.addEventListener("click", () => {
    document.getElementById("guildModal").classList.remove("hidden");
    // SFX: âm thanh mở Guild Modal
    sfxGuild();
});
document.getElementById("closeGuildModal")?.addEventListener("click", () => {
    document.getElementById("guildModal").classList.add("hidden");
});

// Mở / Đóng Modal Ranger
document.getElementById("btnOpenRangerModal")?.addEventListener("click", () => {
    document.getElementById("rangerModal").classList.remove("hidden");
    // SFX: tiếng chuông khi mở modal Ranger
    sfxBell();
});
document.getElementById("closeRangerModal")?.addEventListener("click", () => {
    document.getElementById("rangerModal").classList.add("hidden");
});

// ======================================================
// NÚT "?" + MODAL "CHỜ MỞ KHOÁ"
// Toàn bộ nội dung đọc từ UPCOMING_FEATURES_DATA (data.js) để dễ cập nhật.
// Thêm/bớt mục trong data.js là giao diện tự động theo, không cần sửa file này.
// ======================================================
const upcomingModal = document.getElementById("upcomingModal");
const upcomingList = document.getElementById("upcomingFeatureList");

function renderUpcomingFeatures() {
    if (!upcomingList) return;

    const { title, subtitle, note, items = [] } = UPCOMING_FEATURES_DATA || {};

    const setTxt = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.textContent = value;
    };
    setTxt("upcomingModalTitle", title);
    setTxt("upcomingModalSub", subtitle);
    setTxt("upcomingModalNote", note);

    upcomingList.innerHTML = items.map((item, index) => `
        <div class="upcoming-item">
            <span class="upcoming-item-idx">${index + 1}.</span>
            <span class="upcoming-item-ico">${item.icon || "✦"}</span>
            <div class="upcoming-item-body">
                <b class="upcoming-item-name">${item.name}</b>
                <span class="upcoming-item-desc">${item.desc}</span>
            </div>
            <span class="upcoming-item-lock">🔒</span>
        </div>
    `).join("");
}

function openUpcomingModal() {
    if (!upcomingModal) return;
    renderUpcomingFeatures();
    upcomingModal.classList.remove("hidden");
    sfxBlink();
}

function closeUpcomingModal() {
    upcomingModal?.classList.add("hidden");
}

document.getElementById("btnUpcomingFeatures")?.addEventListener("click", openUpcomingModal);
document.getElementById("closeUpcomingModal")?.addEventListener("click", closeUpcomingModal);
// Bấm ra ngoài vùng modal cũng đóng được
upcomingModal?.addEventListener("click", (e) => {
    if (e.target === upcomingModal) closeUpcomingModal();
});
// Nhấn ESC để đóng
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && upcomingModal && !upcomingModal.classList.contains("hidden")) {
        closeUpcomingModal();
    }
});

// ======================================================
// 11. ADMIN GOD-MODE TEST TOOLBAR
// ======================================================
let logoClicks = 0;
let logoTimer = null;
const adminLogo = document.getElementById("adminTriggerLogo");
const adminModal = document.getElementById("adminGodModal");

adminLogo?.addEventListener("pointerdown", () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);

    if (logoClicks >= 5) {
        logoClicks = 0;
        adminModal?.classList.remove("hidden");
    }
});
document.getElementById("closeAdminModal")?.addEventListener("click", () => adminModal?.classList.add("hidden"));

// ======================================================
// 1. HÀM ĐỒNG BỘ ĐIỂM: VỪA CẬP NHẬT GIAO DIỆN VỪA GHI VÀO D1
// Chỉ còn 2 quyền tích lũy: Tinh Quang (dùng để Gacha) và Cống Hiến (thăng Căn Cước).
// ======================================================
async function syncPointsToBackend(tq = 0, ch = 0) {
    currentUser.tinh_quang_points += tq;
    currentUser.cong_hien_points += ch;
    saveUserData();
    updateTopBarUI();

    try {
        await fetch(`${API_URL}/api/user/add-points`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                tinhQuang: tq,
                congHien: ch
            })
        });
    } catch (e) {
        console.warn("Chưa đồng bộ điểm lên D1:", e);
    }
}

// 2. CÁC NÚT BƠM ĐIỂM ADMIN (GỌI ĐỒNG BỘ VÀO D1)
document.getElementById("admAddTQ")?.addEventListener("click", async () => {
    await syncPointsToBackend(99, 0);
    toast.info('ADMIN TEST', '⚡ Admin: +99 🔮 (Đã ghi nhận vào Database D1)');
});

document.getElementById("admAddCH")?.addEventListener("click", async () => {
    await syncPointsToBackend(0, 100);
    toast.info('ADMIN TEST', '⚡ Admin: +100 🛡️ (Đã ghi nhận vào Database D1)');
});

document.getElementById("admUnlockAllGems")?.addEventListener("click", () => {
    const all = [];
    CRYSTAL_PALETTES.forEach(p => {
        FACE_TIERS.forEach(f => {
            SHAPE_STYLES.forEach(s => all.push(`${p.sys}${p.sysIndex}${f}${s.id}`));
        });
    });
    currentUser.unlocked_gems = all;
    saveUserData();
    renderInventoryGems();
    toast.info('ADMIN TEST', '⚡ Admin: Đã mở full 990 đá!');
    // Mốc sưu tầm chỉ được Worker xác nhận trên D1, nên admin cũng phải gọi để nhận thưởng
    checkAndClaimGemMilestones();
});
document.getElementById("admAddAllItems")?.addEventListener("click", () => {
    BLESSINGS_DATA.forEach(b => addItemToInventory(b));
    saveUserData();
    renderInventory5x5();
    toast.info('ADMIN TEST', '⚡ Admin: Đã thêm đủ 30 Chúc Phúc vào túi!');
});

const fastGachaStatus = document.getElementById("admFastGachaStatus");
document.getElementById("admToggleFastGacha")?.addEventListener("click", () => {
    window.isFastGachaEnabled = !window.isFastGachaEnabled;
    if (fastGachaStatus) {
        fastGachaStatus.textContent = window.isFastGachaEnabled ? "BẬT (0.1s)" : "TẮT";
        fastGachaStatus.style.color = window.isFastGachaEnabled ? "#00f5d4" : "#ff3366";
    }
});

document.getElementById("admResetData")?.addEventListener("click", () => {
    if (confirm("Reset về Tân Thủ?")) {
        localStorage.removeItem("advenature_user");
        location.reload();
    }
});

// ======================================================
// XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN LÊN Cloudinary & LƯU VÀO D1
// ======================================================
const inputAvatarFile = document.getElementById("inputAvatarFile");
const btnTriggerUpload = document.getElementById("btnTriggerUpload");

btnTriggerUpload?.addEventListener("click", () => {
    inputAvatarFile?.click();
});

inputAvatarFile?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn dung lượng tối đa 5MB
    if (file.size > 5 * 1024 * 1024) {
        toast.warning('FILE QUÁ LỚN', 'Vui lòng chọn ảnh có dung lượng dưới 5MB!');
        return;
    }

    btnTriggerUpload.textContent = "⏳";
    btnTriggerUpload.style.pointerEvents = "none";

    const formData = new FormData();
    // 1. Cloudinary dùng tham số "file" và "upload_preset" (Khác với ImgBB dùng "image")
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        // 2. Gửi trực tiếp lên Cloudinary API
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });
        const uploadData = await res.json();

        // 3. Cloudinary trả về link ảnh an toàn trong trường "secure_url"
        if (uploadData.secure_url) {
            const newAvatarUrl = uploadData.secure_url.replace("/image/upload/", "/image/upload/t_avatar/");

            // Gửi link ảnh mới lên Cloudflare Worker để lưu vào Database D1
            await fetch(`${API_URL}/api/user/update-avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    avatarUrl: newAvatarUrl
                })
            });

            // Cập nhật giao diện người dùng
            currentUser.avatar_url = newAvatarUrl;
            saveUserData();
            document.getElementById("profAvatar").src = newAvatarUrl;
            document.getElementById("userAvatarImg").src = newAvatarUrl;

            alert("✧ Cập nhật ảnh đại diện thành công qua Cloudinary!");
        } else {
            alert("Lỗi tải ảnh: " + (uploadData.error?.message || "Kiểm tra lại Cloud Name / Preset!"));
        }
    } catch (err) {
        alert("Không thể kết nối đến máy chủ Cloudinary!");
    } finally {
        btnTriggerUpload.textContent = "📷";
        btnTriggerUpload.style.pointerEvents = "auto";
        inputAvatarFile.value = "";
    }
});

// ======================================================
// KHỞI ĐỘNG HỆ THỐNG
// ======================================================
updateTopBarUI();
renderInventoryGems();
renderInventory5x5();
renderShop();

// Khởi tạo Button VFX Particle System
initButtonVFX();

// Tự động kiểm tra điểm mới mỗi khi người chơi quay lại tab web hoặc chạm vào màn hình
window.addEventListener("focus", () => {
    syncUserDataFromBackend();
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        syncUserDataFromBackend();
    }
});

// Kiểm tra định kỳ mỗi 15 giây (Polling nhẹ)
setInterval(() => {
    syncUserDataFromBackend();
}, 15000);
