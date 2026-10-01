// ======================================================
// SFX MODULE — Hệ thống hiệu ứng âm thanh (Sound Effects)
// ======================================================
// Nguyên tắc:
//   1. SFX là one-shot, không loop -> reset currentTime về 0 trước khi phát
//      để có thể phát lại liên tiếp mà không bị cắt.
//   2. BGM nền phải duck (giảm volume) khi SFX phát, tránh lấn át.
//   3. Chỉ preload nhóm SFX hay dùng (gacha, blessing, teleport), nhóm còn lại
//      nạp lazy ở lần phát đầu tiên để tiết kiệm băng thông mobile.
//   4. Unlock AudioContext từ gesture đầu tiên (Safari/iOS chặn autoplay).
//   5. Tất cả hàm đều no-op an toàn nếu phần tử audio chưa có (tránh crash).
// ======================================================

// Định nghĩa âm lượng cho từng SFX
const SFX_VOLUMES = {
    gacha: 0.5,
    teleport: 0.45,
    blanket: 0.45,
    blink: 0.4,
    guild: 0.5,
    blessing: 0.55,
};

// Nhạc nền Roll Quest (loop riêng, không dùng chung BGM chính)
const QUEST_BGM_VOLUME = 0.28;

// Ngưỡng duck BGM chính khi SFX phát
const DUCK_VOLUME = 0.12;
const DUCK_DURATION = 700; // ms

// Map key -> id phần tử <audio> trong index.html
const AUDIO_IDS = {
    gacha: 'sfxGacha',
    teleport: 'sfxTeleport',
    blanket: 'sfxBlanket',
    blink: 'sfxBlink',
    guild: 'sfxGuild',
    questBgm: 'sfxQuestBGM',
    blessing: 'sfxBlessing',
};

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

// ======================================================
// INIT: nạp audio element từ DOM, đăng ký listener unlock
// ======================================================
function getAudio(key) {
    if (audioCache.has(key)) return audioCache.get(key);
    const el = document.getElementById(AUDIO_IDS[key] || '');
    if (!el) {
        console.warn(`[SFX] Không tìm thấy audio element: ${AUDIO_IDS[key] || key}`);
        return null;
    }
    el.preload = 'auto';
    el.volume = SFX_VOLUMES[key] ?? (key === 'questBgm' ? QUEST_BGM_VOLUME : 0.5);
    audioCache.set(key, el);
    return el;
}

function initSfx(mainBgm = null) {
    if (initialized) return;
    initialized = true;

    mainBgmAudio = mainBgm;
    if (mainBgmAudio) mainBgmBaseVolume = mainBgmAudio.volume;

    // Nạp trước nhóm SFX hay dùng, nhóm còn lại nạp lazy ở lần phát đầu
    ['gacha', 'blessing', 'teleport'].forEach(getAudio);

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
 * @param {string} key - tên audio element (gacha, teleport, blanket, blink, guild, blessing)
 * @param {object} opts
 * @param {number} opts.volume - override volume 0..1
 * @param {number} opts.duckMs - thời gian giữ BGM ở mức thấp
 */
function playSfx(key, opts = {}) {
    if (!volumeEnabled) return;

    const el = getAudio(key);
    if (!el) return;

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

// ======================================================
// SHORTCUT WRAPPER CHO TỪNG SFX CỤ THỂ
// ======================================================
const sfxGacha = () => playSfx('gacha');
const sfxTeleport = () => playSfx('teleport');
const sfxBlanket = () => playSfx('blanket');
const sfxBlink = () => playSfx('blink');
const sfxGuild = () => playSfx('guild');
const sfxBlessing = () => playSfx('blessing');

// ======================================================
// EXPORTS
// ======================================================
export {
    initSfx,
    setMainBgm,
    playSfx,
    playQuestBGM,
    stopQuestBGM,
    setSfxEnabled,
    toggleSfx,
    isSfxEnabled,
    isSfxDucking,
    sfxGacha,
    sfxTeleport,
    sfxBlanket,
    sfxBlink,
    sfxGuild,
    sfxBlessing,
};
