// ======================================================
// SFX MODULE — Hệ thống hiệu ứng âm thanh (Sound Effects)
// ======================================================
// Nguyên tắc:
//   1. SFX là one-shot, không loop -> reset currentTime về 0 trước khi phát
//      để có thể phát lại liên tiếp mà không bị cắt.
//   2. BGM nền phải duck (giảm volume) khi SFX phát, tránh lấn át.
//   3. Chỉ preload nhóm SFX hay dùng (gacha, blessing, teleport, paper, welcome,
//      guestHelper), nhóm còn lại nạp lazy ở lần phát đầu tiên để tiết kiệm băng thông mobile.
//   4. Unlock AudioContext từ gesture đầu tiên (Safari/iOS chặn autoplay).
//   5. Tất cả hàm đều no-op an toàn nếu phần tử audio chưa có (tránh crash).
//   6. Khai báo file âm thanh nằm trong data.js (AUDIO_SOURCES); thẻ <audio>
//      được dựng động từ đó, index.html không còn khai báo audio thủ công.
// ======================================================

// Danh sách file âm thanh (BGM nền + SFX) — nguồn duy nhất trong data.js
import { AUDIO_SOURCES, AUDIO_MAP } from '@data';

// Định nghĩa âm lượng cho từng SFX (voice dẫn truyện để to hơn SFX hiệu ứng)
const SFX_VOLUMES = {
    gacha: 0.5,
    teleport: 0.45,
    blanket: 0.45,
    blink: 0.4,
    guild: 0.5,
    blessing: 0.55,
    woodbox: 0.42,
    paper: 0.32,
    bell: 0.4,
    coin: 0.45,
    welcome: 0.65,
    guestHelper: 0.65,
};

// Nhạc nền Roll Quest (loop riêng, không dùng chung BGM chính)
const QUEST_BGM_VOLUME = 0.28;

// Ngưỡng duck BGM chính khi SFX phát
const DUCK_VOLUME = 0.12;
const DUCK_DURATION = 700; // ms

// Bảng cache các <audio> theo key
const audioCache = new Map();
let initialized = false;
let unlocked = false;           // đã có user activation thật chưa
let volumeEnabled = localStorage.getItem('advenature_sfx_enabled') !== 'false';

// SFX đang phát (dùng để duck BGM)
let activeSfx = 0;
let duckTimeout = null;

// Tham chiếu BGM chính (gán từ ngoài để tránh phụ thuộc vòng import)
let mainBgmAudio = null;
let mainBgmBaseVolume = null;
// BGM chính có đang phát trước khi quest BGM bật hay không -> quyết định có phát lại
let mainBgmWasPlayingBeforeQuest = false;
// Callback phát lại BGM chính (app.js tự quyết định dựa trên ý chí user)
let resumeMainBgmHandler = null;

// ======================================================
// INIT: dựng audio element từ manifest trong data.js, đăng ký listener unlock
// ======================================================

/** Dựng một thẻ <audio> theo cấu hình trong AUDIO_SOURCES rồi gắn vào DOM. */
function createAudioElement(cfg) {
    const el = document.createElement('audio');
    el.id = cfg.id;
    el.loop = !!cfg.loop;
    el.preload = cfg.preload || 'auto';
    el.setAttribute('aria-hidden', 'true');   // âm thanh nền, không cho trình đọc màn hình đọc

    const source = document.createElement('source');
    source.src = cfg.src;
    source.type = cfg.type || 'audio/mpeg';
    el.appendChild(source);

    document.body.appendChild(el);
    return el;
}

/**
 * Lấy phần tử <audio> theo key, tự dựng nếu DOM chưa có.
 * Không đụng tới volume (BGM chính tự quản lý volume của nó).
 */
function ensureAudioElement(key) {
    const cfg = AUDIO_MAP[key];
    if (!cfg) {
        console.warn(`[SFX] Không tìm thấy cấu hình audio: ${key}`);
        return null;
    }
    // Ưu tiên phần tử đã có trong DOM (id giữ nguyên như bản HTML cũ)
    const existing = document.getElementById(cfg.id);
    return existing || createAudioElement(cfg);
}

/**
 * Dựng toàn bộ thẻ <audio> từ AUDIO_SOURCES (BGM nền + SFX).
 * Idempotent nên gọi lại nhiều lần vẫn an toàn.
 * @returns {Object} key -> HTMLAudioElement
 */
function mountAudioElements() {
    const elements = {};
    AUDIO_SOURCES.forEach((cfg) => {
        const el = ensureAudioElement(cfg.key);
        if (el) elements[cfg.key] = el;
    });
    return elements;
}

/** Lấy audio + set volume mặc định, cache lại để dùng nhiều lần. */
function getAudio(key) {
    if (audioCache.has(key)) return audioCache.get(key);
    const el = ensureAudioElement(key);
    if (!el) return null;
    el.preload = AUDIO_MAP[key].preload || 'auto';
    el.volume = SFX_VOLUMES[key] ?? (key === 'questBgm' ? QUEST_BGM_VOLUME : 0.5);
    audioCache.set(key, el);
    return el;
}

function initSfx(mainBgm = null) {
    if (initialized) return;
    initialized = true;

    mainBgmAudio = mainBgm;
    if (mainBgmAudio) mainBgmBaseVolume = mainBgmAudio.volume;

    // Nạp trước nhóm SFX hay dùng + voice guest-mode, nhóm còn lại nạp lazy ở lần phát đầu
    ['gacha', 'blessing', 'teleport', 'paper', 'welcome', 'guestHelper'].forEach(getAudio);

    // AudioContext để "unlock" âm thanh trên Safari/iOS
    // Nếu không có AudioContext thì các lần play() sau vẫn bị chặn
    document.addEventListener('pointerdown', unlockAudio, true);
    document.addEventListener('touchend', unlockAudio, true);
    document.addEventListener('keydown', unlockAudio, true);

    // Nếu user đã có BGM phát, coi như đã unlock (dùng chung activation)
    if (mainBgmAudio && !mainBgmAudio.paused) unlocked = true;
}

/** Gán/cập nhật BGM chính. Gọi lại mỗi khi user đổi volume BGM để duck đúng mốc. */
function setMainBgm(mainBgm) {
    if (!mainBgm) return;
    // Không nạp lại mốc volume khi đang duck, tránh nhảy volume đột ngột
    if (activeSfx === 0) mainBgmBaseVolume = mainBgm.volume;
    mainBgmAudio = mainBgm;
}

/**
 * Đăng ký callback phát lại BGM chính.
 * app.js sở hữu quyền quyết định (user đã tắt nhạc chưa, autoplay policy...),
 * nên sfx.js không tự gọi play() mà gọi lại handler này.
 */
function setMainBgmResumeHandler(fn) {
    resumeMainBgmHandler = typeof fn === 'function' ? fn : null;
}

/** Tạm dừng BGM chính để nhường chỗ cho quest BGM. */
function pauseMainBgmForQuest() {
    if (!mainBgmAudio) return;
    // Chỉ ghi nhớ nếu BGM đang thật sự phát -> tránh phát lại khi user đã tắt nhạc
    mainBgmWasPlayingBeforeQuest = !mainBgmAudio.paused;
    if (mainBgmWasPlayingBeforeQuest) mainBgmAudio.pause();
}

/** Phát lại BGM chính sau khi quest BGM kết thúc. */
function resumeMainBgmAfterQuest() {
    mainBgmWasPlayingBeforeQuest = false;
    // Luôn gọi handler và để app.js tự quyết định (user đã tắt nhạc chưa, đang phát rồi,
    // quest BGM còn đang chiếm sân khấu...). Nhờ vậy main BGM cũng phát lại được khi
    // trước đó nó chỉ bị tạm dừng vì đổi tab — lúc đó mainBgmWasPlayingBeforeQuest = false
    // dù user vẫn muốn nghe nhạc nền.
    if (resumeMainBgmHandler) resumeMainBgmHandler();
}

function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
            const ctx = new AC();
            if (ctx.state === 'suspended') ctx.resume();
            // Tạo oscillator gain=0 để "prime" audio pipeline
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.01);
        }
    } catch (err) {
        // im lặng lỗi unlock (không critical)
        console.warn(`[SFX] Unlock audio thất bại:`, err);
    }
}

// ======================================================
// DUCK BGM: giảm volume BGM chính trong lúc SFX phát
// ======================================================
function duckBGM() {
    if (!mainBgmAudio || mainBgmAudio.paused) return;
    activeSfx++;
    clearTimeout(duckTimeout);
    mainBgmAudio.volume = DUCK_VOLUME;
}

function unduckBGM() {
    if (!mainBgmAudio) return;
    activeSfx = Math.max(0, activeSfx - 1);
    if (activeSfx > 0) return;
    clearTimeout(duckTimeout);
    duckTimeout = setTimeout(() => {
        if (mainBgmBaseVolume !== null) {
            mainBgmAudio.volume = mainBgmBaseVolume;
        }
    }, DUCK_DURATION);
}

// ======================================================
// PLAY SFX chung
// ======================================================
/**
 * Phát một SFX one-shot
 * @param {string} key - tên audio element (gacha, teleport, blanket, blink, guild,
//                        blessing, woodbox, paper, bell, coin, welcome, guestHelper)
 * @param {object} opts
 * @param {number} opts.volume - override volume 0..1
 * @param {number} opts.duckMs - thời gian giữ BGM ở mức thấp
 * @returns {Promise<void>|undefined} promise của el.play() (để caller phát hiện autoplay bị chặn)
 */
function playSfx(key, opts = {}) {
    if (!volumeEnabled) return undefined;

    const el = getAudio(key);
    if (!el) return undefined;

    // Nếu chưa có user activation, thử unlock rồi thử phát
    if (!unlocked) unlockAudio();

    // Reset về đầu để phát lại được nhiều lần liên tiếp
    try {
        el.currentTime = 0;
    } catch {
        // Safari có thể chưa load metadata, bỏ qua
    }

    if (opts.volume !== undefined) {
        el.volume = Math.min(1, Math.max(0, opts.volume));
    }

    duckBGM();
    const resumeAfter = opts.duckMs ?? 600;
    setTimeout(unduckBGM, resumeAfter);

    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
            // Bị block autoplay hoặc file lỗi -> im lặng, không crash game
        });
    }
    return playPromise;
}

/**
 * Dừng hẳn một SFX đang phát (dùng khi chuyển cảnh voice, tránh 2 voice chồng nhau).
 * @param {string} key - tên audio element trong AUDIO_MAP
 */
function stopSfx(key) {
    const cached = audioCache.get(key);
    const cfg = AUDIO_MAP[key];
    const el = cached || (cfg ? document.getElementById(cfg.id) : null);
    if (!el) return;
    try {
        el.pause();
        el.currentTime = 0;
    } catch {
        // Bỏ qua lỗi khi chưa load
    }
}

// ======================================================
// QUEST BGM: nhạc nền riêng cho Roll Quest (loop)
// ======================================================
let questBgmPlaying = false;
let questBgmShouldResume = false;   // modal quest còn mở khi user rời tab

function playQuestBGM() {
    if (!volumeEnabled) return;
    const el = getAudio('questBgm');
    if (!el) return;

    if (!unlocked) unlockAudio();

    // Nhường chỗ cho quest BGM: tạm dừng BGM nền của trang
    pauseMainBgmForQuest();

    questBgmShouldResume = true;
    el.volume = QUEST_BGM_VOLUME;
    const p = el.play();
    if (p && typeof p.then === 'function') {
        p.then(() => {
            questBgmPlaying = true;
        }).catch(() => {
            questBgmPlaying = false;
        });
    } else {
        questBgmPlaying = true;
    }
}

/** Dừng có nhớ ý định: dùng khi rời tab (quay lại sẽ phát tiếp nếu modal còn mở) */
function pauseQuestBGM() {
    const el = getAudio('questBgm');
    if (!el || el.paused) return;
    questBgmPlaying = false;
    el.pause();
}

function resumeQuestBGM() {
    if (!questBgmShouldResume || questBgmPlaying) return;
    playQuestBGM();
}

/** Dừng hẳn: dùng khi thoát module quest */
function stopQuestBGM() {
    const el = getAudio('questBgm');
    if (!el) return;
    questBgmPlaying = false;
    questBgmShouldResume = false;
    try {
        el.pause();
        el.currentTime = 0;
    } catch {
        // Bỏ qua lỗi khi chưa load
    }
    // Trả lại BGM nền của trang nếu trước đó nó đang phát
    resumeMainBgmAfterQuest();
}

// Tự dừng BGM quest khi rời tab, phát lại khi quay về (nếu modal chưa đóng)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseQuestBGM();
    else resumeQuestBGM();
});

// Dừng mọi âm thanh khi đóng tab
window.addEventListener('pagehide', () => {
    pauseQuestBGM();
    unduckBGM();
});

// ======================================================
// TOGGLE SFX bật/tắt
// ======================================================
function setSfxEnabled(enabled) {
    volumeEnabled = !!enabled;
    localStorage.setItem('advenature_sfx_enabled', String(volumeEnabled));
    if (!volumeEnabled) {
        // Tắt tất cả SFX đang phát
        audioCache.forEach((el) => {
            if (!el.loop) {
                el.pause();
                try { el.currentTime = 0; } catch { /* ignore */ }
            }
        });
        // stopQuestBGM cũng trả BGM nền của trang về trạng thái trước đó
        stopQuestBGM();
    }
}
function toggleSfx() {
    setSfxEnabled(!volumeEnabled);
    return volumeEnabled;
}

function isSfxEnabled() {
    return volumeEnabled;
}

/** BGM chính đang bị duck hay không (app.js dùng để không ghi đè volume) */
function isSfxDucking() {
    return activeSfx > 0;
}

/**
 * Quest BGM có đang phát không.
 * app.js dùng để chặn tryPlayBGM tự phát lại BGM nền giữa lúc quest đang mở
 * (listener pointerdown sẽ re-arm sau mỗi lần pause).
 */
function isQuestBgmActive() {
    return questBgmShouldResume;
}

// ======================================================
// SHORTCUT WRAPPER CHO TỪNG SFX CỤ THỂ
// ======================================================
// Voice guest-mode cần duck BGM lâu hơn SFX hiệu ứng (giữ nhạc nền nhỏ suốt lời thoại)
const VOICE_DUCK_MS = 8000;
const sfxGacha = () => playSfx('gacha');
const sfxTeleport = () => playSfx('teleport');
const sfxBlanket = () => playSfx('blanket');
const sfxBlink = () => playSfx('blink');
const sfxGuild = () => playSfx('guild');
const sfxBlessing = () => playSfx('blessing');
const sfxWoodbox = () => playSfx('woodbox');
const sfxPaper = () => playSfx('paper');
const sfxBell = () => playSfx('bell');
const sfxCoin = () => playSfx('coin');
const sfxWelcome = () => playSfx('welcome', { duckMs: VOICE_DUCK_MS });
const sfxGuestHelper = () => playSfx('guestHelper', { duckMs: VOICE_DUCK_MS });

// ======================================================
// EXPORTS
// ======================================================
export {
    mountAudioElements,
    initSfx,
    setMainBgm,
    setMainBgmResumeHandler,
    playSfx,
    stopSfx,
    playQuestBGM,
    stopQuestBGM,
    setSfxEnabled,
    toggleSfx,
    isSfxEnabled,
    isSfxDucking,
    isQuestBgmActive,
    sfxGacha,
    sfxTeleport,
    sfxBlanket,
    sfxBlink,
    sfxGuild,
    sfxBlessing,
    sfxWoodbox,
    sfxPaper,
    sfxBell,
    sfxCoin,
    sfxWelcome,
    sfxGuestHelper,
};
