/**
 * rollquest.js - Module Quest "NHẬP VAI VUI VẺ"
 * ---------------------------------------------------------------
 * Cấu trúc module (UI + gameplay + khối D20 3D) được port từ rpg-quest.html,
 * sau đó nối với backend Worker:
 *   GET  /api/quest/rollquest-status   -> xem còn bao nhiêu lượt hôm nay
 *   POST /api/quest/rollquest-start    -> mở 1 lượt (mất 1 lượt/ngày) + nhận tình huống random
 *   POST /api/quest/rollquest-reward   -> hoàn thành nhiệm vụ, thưởng +1 🔮 Tinh Quang
 *
 * Quy tắc: mỗi ngày tối đa 3 lượt, mỗi lượt 1 tình huống KHÁC NHAU,
 *          đạt 2/3 lượt thành công để thắng lượt đó và nhận 1 điểm Tinh Quang
 *          (mỗi lượt thắng được thưởng 1 lần -> tối đa 3 điểm/ngày).
 */

// ======================================================
// 0. CẤU HÌNH & HẰNG SỐ
// ======================================================
import * as THREE from "three";
import { toast } from './toast.js';

let CFG = {
    apiUrl: "",
    getUserId: () => null,
    isGuest: () => false,
    onReward: () => { },
};

const MAX_ATTEMPTS = 3;      // Tối đa 3 lượt tung cho mỗi tình huống
const REQUIRED_SUCCESS = 2;  // Cần ít nhất 2 lần thành công để hoàn thành

const GSAP_SRC = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";

let els = null;              // Cache DOM
let gsapLib = null;          // instance GSAP (null nếu CDN lỗi)
let gsapPromise = null;

// Trạng thái gameplay
const state = {
    scenario: null,      // Tình huống hiện tại (lấy từ Worker)
    max: 3,              // Tổng lượt tối đa mỗi ngày (Worker trả về)
    remaining: 0,        // Số lượt còn lại hôm nay
    rewarded: false,     // Đã nhận thưởng lượt này chưa
    busy: false,         // Đang gọi API
    attempts: 0,         // Số lượt đã tung
    successCount: 0,     // Số lần thành công
    rollHistory: [],     // true/false theo từng lượt
    lastSpokenLine: "",  // Lời thoại vừa hiển thị (tránh lặp)
    attemptSlot: 0      // Slot lượt hôm nay (1-based, Worker trả về) - dùng chống thưởng trùng
};

// ======================================================
// 1. TIỆN ÍCH TEXT (đọc từ window.TEXTS của texts.js)
// ======================================================
function t(path, args = {}) {
    const raw = (window.TEXTS || {});
    const value = path.split(".").reduce((obj, key) => (obj ? obj[key] : null), raw);
    if (typeof value !== "string") return "";
    return value.replace(/\{(\w+)\}/g, (match, key) => (args[key] !== undefined ? args[key] : match));
}

/** Đảm bảo GSAP sẵn sàng (nạp động nếu CDN trong <head> chưa kịp) */
function ensureGsap() {
    if (window.gsap) {
        gsapLib = window.gsap;
        return Promise.resolve(gsapLib);
    }
    if (gsapPromise) return gsapPromise;

    gsapPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = GSAP_SRC;
        script.onload = () => {
            gsapLib = window.gsap || null;
            resolve(gsapLib);
        };
        script.onerror = () => resolve(null); // Chạy tiếp không có animation vẫn chơi được
        document.head.appendChild(script);
    });
    return gsapPromise;
}

// ======================================================
// 2. KHỞI TẠO & GẮN SỰ KIỆN
// ======================================================
export function initRollQuest(config) {
    CFG = { ...CFG, ...(config || {}) };

    els = {
        modal: document.getElementById("rollQuestModal"),
        canvasContainer: document.getElementById("rqCanvasContainer"),
        introModal: document.getElementById("rqIntroModal"),
        introQuota: document.getElementById("rqIntroQuota"),
        startBtn: document.getElementById("rqStartBtn"),
        questCard: document.getElementById("rqQuestCard"),
        img: document.getElementById("rqImg"),
        title: document.getElementById("rqTitle"),
        condition: document.getElementById("rqCondition"),
        desc: document.getElementById("rqDesc"),
        trackerLabel: document.getElementById("rqTrackerLabel"),
        pips: [1, 2, 3].map((i) => document.getElementById(`rq-pip-${i}`)),
        resultOverlay: document.getElementById("rqResultOverlay"),
        resultPanel: document.getElementById("rqResultPanel"),
        resTitle: document.getElementById("rqResTitle"),
        resNumber: document.getElementById("rqResNumber"),
        resBadge: document.getElementById("rqResBadge"),
        resSpeaker: document.getElementById("rqResSpeaker"),
        resLine: document.getElementById("rqResLine"),
        rollBtn: document.getElementById("rqRollBtn"),
        closeBtn: document.getElementById("rqCloseBtn"),
        winModal: document.getElementById("rqWinModal"),
        winBox: document.getElementById("rqWinBox"),
        winTitle: document.getElementById("rqWinTitle"),
        winMessage: document.getElementById("rqWinMessage"),
        winDialogue: document.getElementById("rqWinDialogue"),
        nextBtn: document.getElementById("rqNextBtn"),
    };

    if (!els.modal) return;

    els.startBtn?.addEventListener("click", () => beginAttempt());
    els.rollBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        rollDice();
    });
    els.closeBtn?.addEventListener("click", () => closeRollQuest());
    els.nextBtn?.addEventListener("click", () => handleNextBtn());
    els.canvasContainer?.addEventListener("click", () => {
        if (state.scenario && !isRolling) rollDice();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !els.modal.classList.contains("hidden")) closeRollQuest();
    });
}

/**
 * Mở module: kiểm tra lượt còn lại trước, không thì báo lỗi.
 */
export async function openRollQuest() {
    if (!els) initRollQuest();

    if (CFG.isGuest()) {
        toast.warning("CHƯA THAM GIA HỘI", "Vui lòng đăng nhập Google để nhận nhiệm vụ NHẬP VAI VUI VẺ nhé!");
        return;
    }

    const btn = document.getElementById("btnOpenRollQuest");
    if (btn) {
        btn.disabled = true;
        btn.textContent = t("quest.rollQuest.btnLoading");
    }

    try {
        const status = await fetchStatus();
        if (!status) return;

        state.remaining = status.remaining;
        state.max = status.max;

        if (state.remaining <= 0) {
            toast.warning("HẾT LƯỢT NHẬP VAI", t("quest.rollQuest.exhausted"));
            return;
        }

        await ensureGsap();
        await ensure3D();

        // Mở màn hình + hiện popup giới thiệu kèm số lượt còn lại
        els.modal.classList.remove("hidden");
        startLoop();
        resetToIntro();
    } catch (err) {
        toast.error("LỖI KẾT NỐI", t("quest.rollQuest.networkError"));
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = t("quest.rollQuest.btn");
        }
    }
}

/** Gọi Worker lấy số lượt còn lại hôm nay (null nếu lỗi) */
async function fetchStatus(silent = false) {
    try {
        const res = await fetch(`${CFG.apiUrl}/api/quest/rollquest-status?userId=${encodeURIComponent(CFG.getUserId())}`);
        const data = await res.json();
        if (!data.success) {
            if (!silent) toast.error("NHẬP VAI THẤT BẠI", data.error || t("quest.rollQuest.networkError"));
            return null;
        }
        return { remaining: data.remaining || 0, max: typeof data.max === "number" ? data.max : 3 };
    } catch (err) {
        if (!silent) toast.error("LỖI KẾT NỐI", t("quest.rollQuest.networkError"));
        return null;
    }
}

/**
 * Cập nhật badge trên pin card (gọi khi mở panel nhiệm vụ) để người chơi thấy còn mấy lượt.
 * Im lặng khi lỗi mạng để không gây phiền khi người chơi chỉ muốn xem bảng nhiệm vụ.
 */
export async function refreshRollQuestBadge() {
    const badge = document.getElementById("rollQuestBadgeDisplay");
    if (!badge || !CFG.apiUrl || CFG.isGuest()) return;

    const status = await fetchStatus(true);
    if (!status) return;

    state.remaining = status.remaining;
    state.max = status.max;
    badge.textContent = t("quest.rollQuest.quotaUsed", { remaining: status.remaining, max: status.max });
}

function resetToIntro() {
    state.scenario = null;
    state.attempts = 0;
    state.successCount = 0;
    state.rollHistory = [];
    state.lastSpokenLine = "";
    state.rewarded = false;

    els.questCard.style.display = "none";
    els.rollBtn.style.display = "none";
    els.winModal.style.display = "none";
    hideResultBanner();

    els.introQuota.textContent = t("quest.rollQuest.quotaUsed", { remaining: state.remaining, max: state.max });
    els.introModal.style.display = "flex";
}

/** Đóng module (nút ✕ hoặc phím Esc) */
function closeRollQuest() {
    if (!els || els.modal.classList.contains("hidden")) return;
    els.modal.classList.add("hidden");
    stopLoop();
    if (gsapLib) {
        gsapLib.killTweensOf(typeWriterProxy);
        gsapLib.to("#rqResultOverlay", { opacity: 0, scale: 0.6, duration: 0.2 });
    } else {
        els.resultOverlay.style.opacity = "0";
        els.resultOverlay.style.transform = "scale(0.6)";
    }
    state.scenario = null;
}

// ======================================================
// 3. LUỒNG CHƠI: MỞ LƯỢT -> TUNG D20 -> KẾT LUẬN
// ======================================================

/** Mở 1 lượt nhập vai (tiêu tốn 1 lượt/ngày, nhận về 1 tình huống random từ Worker) */
async function beginAttempt() {
    if (state.busy) return;
    state.busy = true;
    els.startBtn.disabled = true;

    try {
        const res = await fetch(`${CFG.apiUrl}/api/quest/rollquest-start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: CFG.getUserId() })
        });
        const data = await res.json();

        if (!data.success || !data.scenario) {
            toast.error("NHẬP VAI THẤT BẠI", data.error || t("quest.rollQuest.noScenario"));
            if (typeof data.remaining === "number") state.remaining = data.remaining;
            els.introModal.style.display = "none";
            closeRollQuest();
            return;
        }

        state.remaining = typeof data.remaining === "number" ? data.remaining : state.remaining;
        els.introModal.style.display = "none";
        loadScenario(data.scenario, typeof data.attemptSlot === "number" ? data.attemptSlot : 0);
    } catch (err) {
        toast.error("LỖI KẾT NỐI", t("quest.rollQuest.networkError"));
    } finally {
        state.busy = false;
        els.startBtn.disabled = false;
    }
}

/** Nạp tình huống vào khung quest và reset bộ đếm lượt tung */
function loadScenario(scenario, attemptSlot = 0) {
    state.scenario = scenario;
    state.attempts = 0;
    state.successCount = 0;
    state.rollHistory = [];
    state.lastSpokenLine = "";
    state.rewarded = false;
    state.attemptSlot = attemptSlot;

    els.img.src = scenario.image || "";
    els.title.textContent = scenario.title || "";
    els.desc.textContent = scenario.desc || "";
    els.condition.textContent = t("rollQuest.thresholdLabel", { threshold: scenario.threshold });

    updateQuestUI();
    els.questCard.style.display = "flex";
    els.rollBtn.style.display = "inline-flex";
    els.winModal.style.display = "none";
    hideResultBanner();
}

function updateQuestUI() {
    const scenario = state.scenario;
    if (!scenario) return;

    els.trackerLabel.textContent = t("rollQuest.trackerLabel", {
        attempts: state.attempts,
        max: MAX_ATTEMPTS,
        success: state.successCount,
        required: REQUIRED_SUCCESS
    });

    els.pips.forEach((pip, idx) => {
        pip.className = "rq-pip";
        if (idx < state.attempts) {
            if (state.rollHistory[idx]) {
                pip.classList.add("active");
                pip.textContent = "✓";
            } else {
                pip.classList.add("failed");
                pip.textContent = "✗";
            }
        } else {
            pip.textContent = "-";
        }
    });
}

// ======================================================
// 4. HÀNH ĐỘNG TUNG XÚC XẮC
// ======================================================
function rollDice() {
    if (isRolling || !state.scenario || state.attempts >= MAX_ATTEMPTS) return;
    isRolling = true;

    hideResultBanner();

    const rolledResult = Math.floor(Math.random() * 20) + 1;
    const randomRotX = (Math.random() * 3 + 3) * Math.PI * 2;
    const randomRotY = (Math.random() * 3 + 3) * Math.PI * 2;

    const onRollDone = () => {
        orientFaceToCamera(rolledResult, true);
        setTimeout(() => {
            handleRollOutcome(rolledResult);
            isRolling = false;
        }, 350);
    };

    if (gsapLib) {
        gsapLib.timeline({ onComplete: onRollDone })
            .to(d20Group.position, { y: 2.8, duration: 0.9, ease: "power2.out" }, 0)
            .to(d20Group.rotation, { x: `+=${randomRotX}`, y: `+=${randomRotY}`, duration: 1.5, ease: "power1.inOut" }, 0)
            .to(d20Group.position, { y: -0.2, duration: 0.6, ease: "bounce.out" }, 0.5)
            .to(d20Group.position, { y: 0, duration: 0.2 }, 1.1);
    } else {
        spinFallback(randomRotX, randomRotY, 1300, onRollDone);
    }
}

/** Dự phòng khi GSAP không tải được: xoay xúc xắc bằng requestAnimationFrame */
function spinFallback(rotX, rotY, durationMs, onDone) {
    const startRot = { x: d20Group.rotation.x, y: d20Group.rotation.y };
    const startPos = d20Group.position.y;
    const t0 = performance.now();

    function step(now) {
        const k = Math.min(1, (now - t0) / durationMs);
        d20Group.rotation.x = startRot.x + rotX * k;
        d20Group.rotation.y = startRot.y + rotY * k;
        d20Group.position.y = startPos + (k < 0.5 ? k * 3.2 : (1 - k) * 1.6);
        if (k < 1) requestAnimationFrame(step);
        else {
            d20Group.position.y = 0;
            onDone();
        }
    }
    requestAnimationFrame(step);
}

function handleRollOutcome(num) {
    state.attempts++;
    const isSuccess = num >= state.scenario.threshold;
    state.rollHistory.push(isSuccess);

    if (isSuccess) {
        state.successCount++;
        showResultBanner(true, num, `THÀNH CÔNG! (Lượt ${state.attempts}/${MAX_ATTEMPTS})`);
    } else {
        showResultBanner(false, num, `THẤT BẠI (Lượt ${state.attempts}/${MAX_ATTEMPTS})`);
    }

    updateQuestUI();

    // Hết 3 lượt -> kết luận nhiệm vụ
    if (state.attempts >= MAX_ATTEMPTS) {
        els.rollBtn.style.display = "none";
        setTimeout(finalizeQuest, 1300);
    }
}

/** Kết luận: thắng -> nhận thưởng qua Worker; thua -> hiện lời thoại thất bại */
async function finalizeQuest() {
    const won = state.successCount >= REQUIRED_SUCCESS;

    if (!won) {
        showWinModal(false, "");
        return;
    }

    // Hiện popup kết luận ngay, nút bấm ở trạng thái chờ Worker trả thưởng
    showWinModal(true, "");
    els.nextBtn.disabled = true;
    els.nextBtn.textContent = t("rollQuest.waitReward");

    const result = await claimReward();
    showWinModal(true, result.ok ? result.note : "");
}

/**
 * Gọi Worker nhận thưởng +1 Tinh Quang cho lượt vừa thắng.
 * Trả về { ok, note }: ok = người chơi có thắng (dù lượt này đã nhận thưởng hay chưa),
 * note = ghi chú hiển thị trong popup kết luận.
 */
async function claimReward() {
    try {
        const res = await fetch(`${CFG.apiUrl}/api/quest/rollquest-reward`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: CFG.getUserId(),
                scenarioId: state.scenario ? state.scenario.id : undefined,
                attemptSlot: state.attemptSlot || undefined
            })
        });
        const data = await res.json();

        if (data.success) {
            state.rewarded = true;
            state.remaining = typeof data.remaining === "number" ? data.remaining : state.remaining;
            CFG.onReward(data.tinh_quang_points);

            // Lượt này đã được thưởng trước đó (Worker trả reward: 0): vẫn là THẮNG,
            // chỉ không cộng thêm điểm -> báo thành công chứ không báo lỗi.
            if (data.reward > 0) {
                const earned = typeof data.rewardedCount === "number" ? data.rewardedCount : 1;
                toast.magic("HOÀN THÀNH NHẬP VAI", `🎭 Bạn đã hoàn thành tình huống và nhận +1 ✨ Tinh Quang! (Hôm nay đã nhận ${earned}/${state.max} điểm)`);
                return { ok: true, note: t("quest.rollQuest.rewardNote") };
            }

            toast.magic("HOÀN THÀNH NHẬP VAI", `🎭 Bạn đã hoàn thành tình huống! ${t("quest.rollQuest.rewardedAlready")}`);
            return { ok: true, note: t("quest.rollQuest.rewardNoteAlready") };
        }

        toast.error("NHẬN THƯỞNG THẤT BẠI", t("quest.rollQuest.rewardFail", { error: data.error || "" }));
        return { ok: false, note: "" };
    } catch (err) {
        toast.error("LỖI KẾT NỐI", t("quest.rollQuest.networkError"));
        return { ok: false, note: "" };
    }
}

function showWinModal(won, rewardNote) {
    const q = state.scenario.dialogue || {};

    els.winTitle.textContent = won ? t("rollQuest.winTitle") : t("rollQuest.failTitle");
    els.winTitle.style.color = won ? "var(--rq-success)" : "var(--rq-fail)";
    els.winBox.style.borderColor = won ? "var(--rq-success)" : "var(--rq-fail)";

    els.winMessage.innerHTML = won
        ? t("rollQuest.winMessage", {
            success: state.successCount, max: MAX_ATTEMPTS, title: state.scenario.title
        }) + rewardNote
        : t("rollQuest.failMessage", {
            success: state.successCount, max: MAX_ATTEMPTS, required: REQUIRED_SUCCESS
        });

    els.winDialogue.textContent = (won ? q.victory : q.defeat) || "";

    // Còn lượt thì cho nhập vai tiếp (Worker sẽ trả về tình huống khác), hết lượt thì thoát
    const canRetry = state.remaining > 0;
    els.nextBtn.disabled = false;
    els.nextBtn.textContent = canRetry ? t("rollQuest.btnAgain") : t("rollQuest.btnClose");
    els.nextBtn.dataset.retry = canRetry ? "1" : "0";

    els.winModal.style.display = "flex";
}

function handleNextBtn() {
    els.winModal.style.display = "none";
    hideResultBanner();

    if (els.nextBtn.dataset.retry === "1") {
        state.scenario = null;
        els.questCard.style.display = "none";
        els.rollBtn.style.display = "none";
        beginAttempt();
    } else {
        closeRollQuest();
    }
}

// ======================================================
// 5. HIỂN THỊ KẾT QUẢ & LỜI THOẠI
// ======================================================
function showResultBanner(success, num, badgeText) {
    const variant = success ? "v-success" : "v-fail";

    els.resNumber.textContent = num;
    els.resTitle.textContent = success ? "THÀNH CÔNG" : "THẤT BẠI";
    els.resBadge.textContent = badgeText;

    els.resultPanel.className = `rq-result-panel ${variant}`;
    els.resTitle.className = `rq-result-title ${variant}`;
    els.resBadge.className = `rq-result-badge ${variant}`;

    const dialogue = (state.scenario && state.scenario.dialogue) || {};
    showDialogue(
        (state.scenario && state.scenario.speaker) || "Người Dẫn Chuyện",
        pickDialogue(success ? dialogue.success : dialogue.fail)
    );

    if (gsapLib) {
        gsapLib.to("#rqResultOverlay", { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.6)" });
    } else {
        els.resultOverlay.style.opacity = "1";
        els.resultOverlay.style.transform = "scale(1)";
    }
}

/** Lấy ngẫu nhiên 1 lời thoại, tránh lặp lại đúng câu vừa nói */
function pickDialogue(list) {
    if (!Array.isArray(list) || list.length === 0) return "";
    if (list.length === 1) {
        state.lastSpokenLine = list[0];
        return state.lastSpokenLine;
    }

    let index = Math.floor(Math.random() * list.length);
    if (list[index] === state.lastSpokenLine) {
        index = (index + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
    }
    state.lastSpokenLine = list[index];
    return state.lastSpokenLine;
}

const typeWriterProxy = { i: 0 };

/** Hiển thị lời thoại kèm hiệu ứng gõ chữ từng ký tự */
function showDialogue(speaker, text) {
    els.resSpeaker.textContent = speaker || "Người Dẫn Chuyện";

    if (gsapLib) gsapLib.killTweensOf(typeWriterProxy);

    if (!text) {
        els.resLine.textContent = "";
        return;
    }

    typeWriterProxy.i = 0;
    els.resLine.textContent = "";

    if (!gsapLib) {
        els.resLine.textContent = text;
        return;
    }

    gsapLib.to(typeWriterProxy, {
        i: text.length,
        duration: Math.min(0.9, text.length * 0.018),
        ease: "none",
        onUpdate: () => { els.resLine.textContent = text.slice(0, Math.round(typeWriterProxy.i)); },
        onComplete: () => { els.resLine.textContent = text; }
    });
}

function hideResultBanner() {
    if (gsapLib) {
        gsapLib.killTweensOf(typeWriterProxy);
        gsapLib.to("#rqResultOverlay", { opacity: 0, scale: 0.6, duration: 0.2 });
    } else {
        els.resultOverlay.style.opacity = "0";
        els.resultOverlay.style.transform = "scale(0.6)";
    }
}

// ======================================================
// 6. THREE.JS - KHỐI D20 (port từ rpg-quest.html)
// ======================================================
let scene, camera, renderer, d20Group, mainMesh;
let faceOrientations = [];
let isRolling = false;
let rafId = null;
let threeReady = null;

const DICE_COLOR = "#fffbecff";
const OUTLINE_COLOR = "#0a170b";
const NUMBER_COLOR = "#232915";
const FACE_BG = "#fffede";
const BG_COLOR = 0x120d1c;
const FLOOR_CIRCLE_COLOR = 0x241a33;
const DICE_RADIUS = 1.1;
const PIXEL_SCALE = 3;

/** Khởi tạo 3D một lần duy nhất (mở lại module không tạo lại renderer) */
function ensure3D() {
    if (threeReady) return threeReady;
    threeReady = (async () => {
        try {
            // Chờ font số trên canvas đã sẵn sàng trước khi vẽ texture mặt xúc xắc
            if (document.fonts && document.fonts.load) {
                try {
                    await document.fonts.load('400 190px "Jersey 25"');
                    await document.fonts.ready;
                } catch (e) { /* bỏ qua, dùng font dự phòng */ }
            }
            init3D();
        } catch (err) {
            console.error("Không khởi tạo được khối D20:", err);
        }
    })();
    return threeReady;
}

function init3D() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 1.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(1);
    resizeRenderer();
    renderer.shadowMap.enabled = true;
    els.canvasContainer.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 0.9);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xffa04a, 0.4);
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

    const circleGeo = new THREE.CircleGeometry(4, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: FLOOR_CIRCLE_COLOR });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = -1.81;
    scene.add(circle);

    d20Group = new THREE.Group();
    scene.add(d20Group);
    createD20();

    window.addEventListener("resize", onWindowResize);
}

/** Vẽ số lên từng mặt bằng CanvasTexture (phong cách pixel) */
function createFaceTexture(number) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = FACE_BG;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "#e8a33d";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(256, 50);
    ctx.lineTo(50, 430);
    ctx.lineTo(462, 430);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = NUMBER_COLOR;
    ctx.font = '400 190px "Jersey 25", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number.toString(), 256, 285);

    // Gạch chân cho số 6 và 9 để dễ đọc giống bản gốc
    if (number === 6 || number === 9) {
        ctx.fillRect(216, 375, 80, 14);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

function createD20() {
    const geometry = new THREE.IcosahedronGeometry(DICE_RADIUS, 0);
    const nonIndexedGeo = geometry.toNonIndexed();
    const posAttr = nonIndexedGeo.attributes.position;
    const faceCount = posAttr.count / 3;

    faceOrientations = [];
    const materials = [];

    for (let i = 0; i < faceCount; i++) {
        const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i * 3);
        const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i * 3 + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i * 3 + 2);

        const faceCenter = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3).normalize();
        const number = i + 1;

        faceOrientations.push({ number, normal: faceCenter });
        materials.push(new THREE.MeshToonMaterial({
            map: createFaceTexture(number),
            color: DICE_COLOR
        }));
    }

    nonIndexedGeo.clearGroups();
    for (let i = 0; i < faceCount; i++) {
        nonIndexedGeo.addGroup(i * 3, 3, i);
    }

    const uvs = new Float32Array(faceCount * 3 * 2);
    for (let i = 0; i < faceCount; i++) {
        uvs[i * 6 + 0] = 0.5; uvs[i * 6 + 1] = 0.9;
        uvs[i * 6 + 2] = 0.05; uvs[i * 6 + 3] = 0.15;
        uvs[i * 6 + 4] = 0.95; uvs[i * 6 + 5] = 0.15;
    }
    nonIndexedGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    nonIndexedGeo.computeVertexNormals();

    mainMesh = new THREE.Mesh(nonIndexedGeo, materials);
    mainMesh.castShadow = true;
    d20Group.add(mainMesh);

    // Viền đen toon
    const outlineMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: OUTLINE_COLOR,
        side: THREE.BackSide
    }));
    outlineMesh.scale.setScalar(1.04);
    d20Group.add(outlineMesh);

    orientFaceToCamera(20, false);
}

/** Xoay khối D20 để mặt số target hướng về phía camera */
function orientFaceToCamera(targetNumber, animate = true) {
    const faceData = faceOrientations.find((f) => f.number === targetNumber);
    if (!faceData) return;

    const targetNormal = new THREE.Vector3(0, 0.4, 1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(faceData.normal, targetNormal);

    if (!animate || !gsapLib) {
        d20Group.quaternion.copy(q);
        return;
    }
    gsapLib.to(d20Group.quaternion, {
        x: q.x, y: q.y, z: q.z, w: q.w,
        duration: 0.25,
        ease: "back.out(1.5)"
    });
}

function resizeRenderer() {
    if (!renderer) return;
    const w = Math.max(1, Math.floor(window.innerWidth / PIXEL_SCALE));
    const h = Math.max(1, Math.floor(window.innerHeight / PIXEL_SCALE));
    renderer.setSize(w, h, false);
}

function onWindowResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    resizeRenderer();
}

// Vòng lặp render: chỉ chạy khi module đang mở để không tốn CPU
function startLoop() {
    if (rafId !== null || !renderer) return;
    const loop = () => {
        rafId = requestAnimationFrame(loop);
        if (!isRolling && d20Group) {
            const float = Math.sin(Date.now() * 0.002) * 0.08;
            d20Group.position.y = Math.round(float * 16) / 16;
        }
        renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(loop);
}

function stopLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}
