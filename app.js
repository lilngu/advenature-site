import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
// IMPORT TOÀN BỘ DATA TĨNH TỪ DATA.JS (RÚT GỌN APP.JS)
import { 
    CRYSTAL_PALETTES, 
    FACE_TIERS, 
    SHAPE_STYLES, 
    BLESSINGS_DATA, 
    SHOP_ITEMS, 
    QUIZ_LIST 
} from './data.js';

// ======================================================
// 1. CONFIG & DATA SYNC (BỎ DẤU / Ở CUỐI TRÁNH LỖI 404)
// ======================================================
const API_URL = "https://advenature-api.lilnguyen-dcr.workers.dev";
const GOOGLE_CLIENT_ID = "581456693359-uuhqadehjdotrjr37mo8iei02pvilthf.apps.googleusercontent.com";
const IMGBB_API_KEY = "452ef7a840767c5950ace92ef266c8bd";

let tempGoogleProfile = null;
let selectedClass = "Ranger";
window.isFastGachaEnabled = false;

let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || null;

if (!currentUser) {
    currentUser = {
        id: "AW_USER_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        full_name: "Nhà Phiêu Lưu",
        adventurer_code: "AW----",
        role: "Tân Thủ Rừng Già",
        tinh_quang_points: 1, // Lần đầu Free
        tinh_thach_points: 0,
        cong_hien_points: 0,
        gacha_counter: 0,
        unlocked_gems: [],
        inventory: []
    };
    saveUserData();
}

// ======================================================
// PHASE 3: ĐỒNG BỘ DỮ LIỆU TỪ D1 KHI MỞ TRANG HOẶC VÀO TÚI ĐỒ
// ======================================================
async function syncUserDataFromBackend() {
    if (!currentUser || !currentUser.id || currentUser.id.startsWith("AW_USER_")) return;

    try {
        const res = await fetch(`${API_URL}/api/user/sync?userId=${currentUser.id}`);
        const data = await res.json();
        if (data.success && data.user) {
            currentUser.tinh_quang_points = data.user.tinh_quang_points;
            currentUser.tinh_thach_points = data.user.tinh_thach_points;
            currentUser.cong_hien_points = data.user.cong_hien_points;
            currentUser.gacha_counter = data.user.gacha_counter;
            currentUser.role = data.user.role || currentUser.role;
            currentUser.unlocked_gems = data.user.unlocked_gems || [];

            // Ánh xạ iconClass và mô tả từ BLESSINGS_DATA cho từng món đồ từ D1
            if (data.user.inventory) {
                currentUser.inventory = data.user.inventory.map(invItem => {
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

            saveUserData();
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();
        }
    } catch (e) {
        console.warn("Chưa đồng bộ được với D1 (chế độ offline):", e);
    }
}

function saveUserData() {
    localStorage.setItem("advenature_user", JSON.stringify(currentUser));
}

function updateTopBarUI() {
    document.getElementById("valTinhQuang").textContent = currentUser.tinh_quang_points.toLocaleString();
    document.getElementById("valTinhThach").textContent = currentUser.tinh_thach_points.toLocaleString();
    document.getElementById("valCongHien").textContent = currentUser.cong_hien_points.toLocaleString();
    document.getElementById("userAdvenCode").textContent = currentUser.adventurer_code;

    const dockCostBadge = document.getElementById("dockCostBadge");
    if (currentUser.gacha_counter === 0) {
        dockCostBadge.textContent = "FREE";
    } else {
        dockCostBadge.textContent = "1 🔮";
    }

    // Hiển thị đầy đủ thông tin Căn Cước Nhà Phiêu Lưu
    document.getElementById("profName").textContent = currentUser.full_name || "Nhà Phiêu Lưu";
    document.getElementById("profCode").textContent = currentUser.adventurer_code || "AW----";
    document.getElementById("profEmail").textContent = currentUser.email || "chua_lien_ket@advenature.local";
    document.getElementById("profClass").textContent = currentUser.class_name || "Chưa thiết lập";
    document.getElementById("profTribe").textContent = currentUser.tribe || "Tự do";
    document.getElementById("profGender").textContent = currentUser.gender || "Nam";
    document.getElementById("profBirth").textContent = currentUser.birth_year || "----";

    // Phân quyền Role hiển thị
    const roleTitles = { admin: "Trưởng Quán (Admin)", manager: "Quản Lý (Manager)", user: "Tân Thủ Rừng Già" };
    document.getElementById("profRole").textContent = roleTitles[currentUser.role] || (currentUser.role || "Tân Thủ Rừng Già");

    document.getElementById("profStatTQ").innerHTML = `<i class="rpg-ico ico-tq"></i> ${currentUser.tinh_quang_points}`;
    document.getElementById("profStatTT").innerHTML = `<i class="rpg-ico ico-tt"></i> ${currentUser.tinh_thach_points}`;
    document.getElementById("profStatCH").innerHTML = `<i class="rpg-ico ico-ch"></i> ${currentUser.cong_hien_points} CP`;
    document.getElementById("myRefCodeDisplay").textContent = currentUser.adventurer_code;

    if (currentUser.avatar_url) {
        document.getElementById("profAvatar").src = currentUser.avatar_url;
        document.getElementById("userAvatarImg").src = currentUser.avatar_url;
    }

    const pct = Math.min(100, Math.floor((currentUser.cong_hien_points / 100) * 100));
    document.getElementById("rankProgressBar").style.width = pct + "%";

    const btnTopLogin = document.getElementById("btnTopLogin");
    if (btnTopLogin) {
        if (currentUser.adventurer_code && currentUser.adventurer_code !== "AW----") {
            btnTopLogin.classList.add("hidden");
        } else {
            btnTopLogin.classList.remove("hidden");
        }
    }
}

// ======================================================
// 2. THREE.JS ENGINE SETUP
// ======================================================
const scene = new THREE.Scene();
scene.fog = null;

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById("app-3d").appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0.1));
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0.2, 0);

scene.add(new THREE.AmbientLight(0x443366, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);

const pointLight = new THREE.PointLight(0xa58cff, 0, 20);
pointLight.position.set(0, 1, 2);
scene.add(pointLight);

const clock = new THREE.Clock();

// Particles Vortex
const PARTICLE_COUNT = 1500;
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
    const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

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
    size: 0.07, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
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
    const phi = Math.PI * (Math.sqrt(5) - 1);
    const rx = THREE.MathUtils.randFloat(...shape.rx);
    const ry = THREE.MathUtils.randFloat(...shape.ry);
    const rz = THREE.MathUtils.randFloat(...shape.rz);

    for (let i = 0; i < faceCount; i++) {
        const y = 1 - (i / (faceCount - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i + THREE.MathUtils.randFloatSpread(0.6);
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
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.35,
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
const STATE = { IDLE: "idle", GACHA: "gacha", CORE: "core", LOOT: "loot", CLAIMED: "claimed" };
let state = STATE.IDLE;
let stateStart = performance.now();

const dockGachaTrigger = document.getElementById("dockGachaTrigger");
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
        alert("Bạn đã hết Điểm Tinh Quang 🔮! Hãy giải mã tri thức hoặc điểm danh để nhận thêm.");
        return;
    }

    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");
    collectBanner.classList.add("hidden");

    coreGroup.position.set(0, 0, 0);
    coreGroup.scale.setScalar(0.001);

    const gem = createProceduralRock();
    crystalHeader.textContent = gem.name;

    lootText.innerHTML = `
        <div style="font-size: 15px; font-weight: bold; color: #ffe66d;">✦ ${gem.name} ✦</div>
        <div style="font-size: 10px; color: #c9c3ff; letter-spacing: 1.5px; margin-top: 3px;">
            [${gem.shapeName.toUpperCase()}] • ${gem.faceCount} DIỆN THỂ • MÃ: ${gem.code}
        </div>
    `;

    state = STATE.GACHA;
    stateStart = performance.now();
}

// Nút Gacha ở đáy
dockGachaTrigger.addEventListener("click", () => {
    const isGachaViewActive = document.getElementById("gacha-view").classList.contains("active") && 
                              !document.getElementById("gacha-view").classList.contains("hidden");

    if (isGachaViewActive) {
        triggerGachaSummon();
    }
});

// Modal Chúc phúc
const blessingModal = document.getElementById("blessingModal");
function openBlessingModal(blessing, reasonText) {
    document.getElementById("blessTierTag").textContent = (blessing.tier || "common").toUpperCase();
    document.getElementById("blessTierTag").className = `blessing-tier-tag tier-${blessing.tier || "common"}`;
    document.getElementById("blessIconBox").innerHTML = `<i class="item-ico ${blessing.iconClass}" style="width:48px;height:48px;"></i>`;
    document.getElementById("blessTitle").textContent = blessing.name;
    document.getElementById("blessDesc").textContent = `${reasonText}\n${blessing.desc || ''}`;
    blessingModal.classList.remove("hidden");
}
document.getElementById("btnCloseBlessingModal").addEventListener("click", () => {
    blessingModal.classList.add("hidden");
});

// ======================================================
// 5. LUỒNG THU THẬP: FIRST GACHA & GACHA THƯỜNG
// ======================================================
// ======================================================
// HỆ THỐNG 8 AVATAR PRESET (4 NAM & 4 NỮ)
// ======================================================
const AVATAR_PRESETS = {
    Nam: [
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&hair=short01",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&hair=short02",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&hair=short04",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&hair=short05"
    ],
    Nữ: [
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella&hair=long01",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&hair=long02",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&hair=long04",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie&hair=long05"
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
                        ✦ Nhập Gmail để tiếp tục ✦
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
// XỬ LÝ GOOGLE AUTH THÔNG MINH (TỰ ĐỘNG PHÂN BIỆT MỚI / CŨ)
// ======================================================
async function handleGoogleSuccess(response) {
    if (response.mock) {
        tempGoogleProfile = response.profile;
    } else {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        tempGoogleProfile = JSON.parse(jsonPayload);
    }

    googleBtnText.textContent = `⏳ Đang kiểm tra tài khoản: ${tempGoogleProfile.name}...`;

    try {
        // GỬI LÊN WORKER ĐỂ KIỂM TRA XEM CÓ PHẢI TÀI KHOẢN CŨ ĐÃ TỪNG ĐĂNG KÝ
        const res = await fetch(`${API_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                googleUser: tempGoogleProfile,
                gemData: currentGemResult || null
            })
        });
        const data = await res.json();

        // TRƯỜNG HỢP 1: ĐÂY LÀ NGƯỜI CŨ ĐÃ CÓ TÀI KHOẢN
        if (data.success && !data.isNewUser) {
            currentUser = data.user;
            saveUserData();
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();

            // Đóng Modal ngay lập tức, KHÔNG BẮT ĐIỀN LẠI BƯỚC 2!
            onboardingModal.classList.add("hidden");
            if (claimContainer) claimContainer.classList.add("hidden");
            lootText.classList.remove("show");

            alert(`🎉 CHÀO MỪNG QUAY TRỞ LẠI, ${currentUser.full_name}!\nĐã khôi phục Căn Cước [${currentUser.adventurer_code}] và đồng bộ toàn bộ kho đồ của bạn.`);
            state = STATE.IDLE;
            return;
        }

        // TRƯỜNG HỢP 2: ĐÂY LÀ NGƯỜI MỚI TOANH -> Chuyển sang Bước 2 để khai báo hồ sơ
        onboardStep1.classList.add("hidden");
        onboardStep2.classList.remove("hidden");
        document.getElementById("googleBadgeVerified").textContent = `✓ Đã xác thực: ${tempGoogleProfile.email}`;
        document.getElementById("obName").value = tempGoogleProfile.name || "";
        renderAvatarOptions();

    } catch (err) {
        // Nếu lỗi mạng thì chuyển sang Bước 2 để nhập
        onboardStep1.classList.add("hidden");
        onboardStep2.classList.remove("hidden");
        renderAvatarOptions();
    }
}

// Bắt sự kiện bấm nút "✦ Đăng Nhập" trực tiếp trên Topbar
document.getElementById("btnTopLogin")?.addEventListener("click", () => {
    initGoogleAuth();
    onboardingModal.classList.remove("hidden");
});

// BẤM NÚT THU THẬP VÀO TÚI
claimBtn.addEventListener("click", () => {
    if (state !== STATE.LOOT) return;

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

    if (!obName) { alert("Vui lòng nhập Tên Nhà Phiêu Lưu!"); return; }
    if (!obPhone) { alert("Vui lòng nhập Số điện thoại / Zalo!"); return; } // Bắt buộc
    if (!obBirth) { alert("Vui lòng nhập Năm sinh!"); return; }
    if (!obClass) { alert("Vui lòng nhập Chức nghiệp của bạn!"); return; }
    if (!obTribe) { alert("Vui lòng nhập Bộ tộc của bạn!"); return; }

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
            updateTopBarUI();
            renderInventoryGems();
            renderInventory5x5();

            onboardingModal.classList.add("hidden");
            claimContainer.classList.add("hidden");
            lootText.classList.remove("show");

            openBlessingModal(data.blessing, "Chúc Phúc Tân Thủ dành riêng cho bạn!");
            state = STATE.IDLE;
        } else {
            alert("Lỗi đăng ký: " + (data.error || "Vui lòng thử lại"));
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ! Vui lòng thử lại.");
    } finally {
        btnCompleteRegister.textContent = "✦ HOÀN TẤT & THU THẬP VÀO TÚI ✦";
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

            collectBanner.classList.remove("hidden");
            setTimeout(() => {
                collectBanner.classList.add("hidden");
                if (data.blessing) {
                    openBlessingModal(data.blessing, `Lượt quay thứ ${data.counter} là Số Nguyên Tố! Tinh Linh ban chúc phúc:`);
                }
                app3dCanvas.style.opacity = "0.2";
                setTimeout(() => {
                    app3dCanvas.style.opacity = "1";
                    state = STATE.IDLE;
                }, 100);
            }, 3000);
        } else {
            alert(data.error || "Lỗi giao dịch Gacha!");
            state = STATE.IDLE;
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
        lootBox.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);

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
});

// ======================================================
// 7. ĐIỀU HƯỚNG & NÚT TRỞ VỀ 🎐
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
        }
        if (targetId === "gacha-view") {
            controls.enabled = true;
            document.getElementById("tabIndicator").textContent = "Home Gacha";
            viewPanels.forEach(p => {
                if (p.id !== "gacha-view") p.classList.add("hidden");
            });
            document.getElementById("gacha-view").classList.remove("hidden");
            document.getElementById("gacha-view").classList.add("active");
            return;
        }

        controls.enabled = false;
        viewPanels.forEach(p => {
            if (p.id !== "gacha-view") p.classList.add("hidden");
        });

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
    document.getElementById("tabIndicator").textContent = "Home Gacha";
    if (state !== STATE.LOOT && claimContainer) {
        claimContainer.classList.add("hidden");
    }
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
    document.getElementById("previewGemTitle").textContent = gemData.isUnlocked ? gemData.name : "Tinh Quang Thạch Ẩn Danh";
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
    const phi = Math.PI * (Math.sqrt(5) - 1);
    const rx = (shape.rx[0] + shape.rx[1]) / 2;
    const ry = (shape.ry[0] + shape.ry[1]) / 2;
    const rz = (shape.rz[0] + shape.rz[1]) / 2;

    for (let i = 0; i < gemData.face; i++) {
        const y = 1 - (i / (gemData.face - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
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

    const unlockedSet = new Set(currentUser.unlocked_gems);
    const count = unlockedSet.size;
    document.getElementById("gemProgressCount").textContent = `${count}/990`;
    const pct = ((count / 990) * 100).toFixed(1);
    document.getElementById("gemProgressPct").textContent = `${pct}%`;
    document.getElementById("gemProgressBar").style.width = `${pct}%`;

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
                <div class="gem-slot-name">${g.isUnlocked ? g.name : 'Chưa mở'}</div>
            </div>
        `;
    }).join('');

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

function openItemModal(item, itemIndex) {
    if (qrCheckPollTimer) clearInterval(qrCheckPollTimer);

    itemModal.classList.remove("hidden");
    document.getElementById("modalItemTitle").innerHTML = `<i class="item-ico ${item.iconClass}"></i> ${item.name}`;
    document.getElementById("modalItemDesc").textContent = item.desc || "Vật phẩm dã ngoại thuộc Hội Ngọc Lục.";
    
    const qrWrapper = document.getElementById("qrWrapperOffline");
    const qrcodeContainer = document.getElementById("qrcodeContainer");
    const btnUseBuff = document.getElementById("btnUseBuffItem");
    const noteText = document.getElementById("modalQrNote");
    const tokenTxt = document.getElementById("modalQrTokenTxt");

    qrcodeContainer.innerHTML = "";

    // TRƯỜNG HỢP 1: VẬT PHẨM BUFF ĐIỂM TRỰC TIẾP
    if (item.isBuff) {
        qrWrapper.classList.add("hidden");
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
                    currentUser.tinh_thach_points = data.points.tinh_thach_points;
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
                    if (data.buffApplied.tt) buffMsg.push(`+${data.buffApplied.tt} 💎 Tinh Thạch`);
                    if (data.buffApplied.ch) buffMsg.push(`+${data.buffApplied.ch} 🛡️ Cống Hiến`);
                    alert(`✦ SỬ DỤNG THÀNH CÔNG!\nBạn nhận được: ${buffMsg.join(", ")}`);
                } else {
                    alert(data.error || "Không thể sử dụng vật phẩm này!");
                }
            } catch (err) {
                alert("Lỗi kết nối máy chủ!");
            } finally {
                btnUseBuff.textContent = "✦ SỬ DỤNG BUFF NGAY ✦";
                btnUseBuff.disabled = false;
            }
        };
    } 
    // TRƯỜNG HỢP 2: VẬT PHẨM DỊCH VỤ / QUY ĐỔI THỰC ĐỊA (MÃ QR ĐỘNG)
    else {
        qrWrapper.classList.remove("hidden");
        btnUseBuff.classList.add("hidden");
        noteText.textContent = "Đưa mã QR này cho Quản lý / NPC Ranger Hội Ngọc Lục quét tại khu dã ngoại.";
        tokenTxt.textContent = `MÃ: ${item.qr_token || 'QR_TOKEN'}`;

        // Sinh mã QR động bằng thư viện qrcodejs
        new QRCode(qrcodeContainer, {
            text: JSON.stringify({
                token: item.qr_token,
                code: currentUser.adventurer_code,
                item: item.id,
                name: item.name
            }),
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });

        // Lắng nghe trạng thái quét thời gian thực (chuẩn bị sẵn cho Phase 5 Miniapp)
        qrCheckPollTimer = setInterval(async () => {
            try {
                const checkRes = await fetch(`${API_URL}/api/inventory/check-qr?token=${item.qr_token}`);
                const checkData = await checkRes.json();
                if (checkData.success && checkData.isUsed) {
                    clearInterval(qrCheckPollTimer);
                    alert(`🎉 XÁC THỰC THÀNH CÔNG TẠI THỰC ĐỊA!\nQuản lý đã xác nhận vật phẩm [${item.name}].`);
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
document.getElementById("closeItemModal").addEventListener("click", () => itemModal.classList.add("hidden"));

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
            <div class="shop-2col-tag">💎 ${p.tt} TT</div>
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
        if (selectedShopIds.has(item.id)) selectedShopIds.delete(item.id);
        else selectedShopIds.add(item.id);

        renderShop();
        updateShopCheckout();
        shopDetailModal.classList.add("hidden");
    };

    shopDetailModal.classList.remove("hidden");
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
        alert("Vui lòng chạm chọn ít nhất 1 gói hoặc tiện ích!");
        return;
    }
    const phone = prompt("Nhập SĐT hoặc Zalo để Hội Ngọc Lục liên hệ xác nhận đơn:");
    if (!phone) return;

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

    alert("✦ Thông tin đơn hàng đã gửi tới Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.");
    selectedShopIds.clear();
    renderShop();
    updateShopCheckout();
});

// ======================================================
// 10. NHIỆM VỤ PIN-BOARD & QUIZ
// ======================================================
document.getElementById("btnDoCheckin")?.addEventListener("click", async () => {
    await syncPointsToBackend(1, 0, 0); // Cộng 1 🔮 vào cả giao diện lẫn Database D1
    alert("✦ Điểm danh thành công! Nhận +1 🔮 Tinh Quang.");
    document.getElementById("btnDoCheckin").textContent = "Đã Điểm Danh";
    document.getElementById("btnDoCheckin").disabled = true;
});

document.getElementById("btnSubmitFb")?.addEventListener("click", () => {
    const link = document.getElementById("inputFbLink").value.trim();
    if (link.startsWith("http")) {
        alert("✦ Đã gửi link bài viết cho Quản trị viên Telegram! Vui lòng chờ duyệt (+1 🔮).");
        document.getElementById("inputFbLink").value = "";
    } else {
        alert("Vui lòng nhập đường link bài viết hợp lệ!");
    }
});

document.getElementById("btnSubmitRef")?.addEventListener("click", () => {
    const code = document.getElementById("inputFriendCode").value.trim().toUpperCase();
    if (code.startsWith("AW") && code !== currentUser.adventurer_code) {
        currentUser.tinh_quang_points += 1;
        saveUserData();
        updateTopBarUI();
        alert(`✦ Kết nối thành công với nhà phiêu lưu [${code}]! Nhận +1 🔮.`);
        document.getElementById("inputFriendCode").value = "";
    } else {
        alert("Mã bạn bè không hợp lệ hoặc trùng với mã của bạn!");
    }
});

let currentQuizIdx = 0;
const quizModal = document.getElementById("quizModal");

document.getElementById("btnOpenQuiz")?.addEventListener("click", () => {
    currentQuizIdx = 0;
    showQuizQuestion();
    quizModal.classList.remove("hidden");
});

function showQuizQuestion() {
    const qData = QUIZ_LIST[currentQuizIdx];
    document.getElementById("quizQuestionText").textContent = `Câu ${currentQuizIdx + 1}: ${qData.q}`;
    const ansBox = document.getElementById("quizAnswersBox");
    ansBox.innerHTML = qData.a.map((ans, idx) => `
        <button class="btn-quiz-ans" data-idx="${idx}">✦ ${ans}</button>
    `).join('');

    ansBox.querySelectorAll(".btn-quiz-ans").forEach(btn => {
        btn.addEventListener("click", () => {
            const chosen = parseInt(btn.dataset.idx);
            if (chosen === qData.c) {
                currentQuizIdx++;
                if (currentQuizIdx < QUIZ_LIST.length) {
                    showQuizQuestion();
                } else {
                    currentUser.tinh_quang_points += 1;
                    saveUserData();
                    updateTopBarUI();
                    quizModal.classList.add("hidden");
                    alert("🎉 XUẤT SẮC! Bạn đã giải mã toàn bộ tri thức Rừng Tinh Linh, nhận +1 🔮 Tinh Quang!");
                }
            } else {
                alert("Mật mã chưa chính xác! Hãy đọc kỹ tri thức và thử lại.");
            }
        });
    });
}
document.getElementById("closeQuizModal")?.addEventListener("click", () => quizModal.classList.add("hidden"));

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
// ======================================================
async function syncPointsToBackend(tq = 0, tt = 0, ch = 0) {
    currentUser.tinh_quang_points += tq;
    currentUser.tinh_thach_points += tt;
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
                tinhThach: tt,
                congHien: ch
            })
        });
    } catch (e) {
        console.warn("Chưa đồng bộ điểm lên D1:", e);
    }
}

// 2. CÁC NÚT BƠM ĐIỂM ADMIN (GỌI ĐỒNG BỘ VÀO D1)
document.getElementById("admAddTQ")?.addEventListener("click", async () => {
    await syncPointsToBackend(99, 0, 0);
    alert("⚡ Admin: +99 🔮 (Đã ghi nhận vào Database D1)");
});

document.getElementById("admAddTT")?.addEventListener("click", async () => {
    await syncPointsToBackend(0, 99, 0);
    alert("⚡ Admin: +99 💎 (Đã ghi nhận vào Database D1)");
});

document.getElementById("admAddCH")?.addEventListener("click", async () => {
    await syncPointsToBackend(0, 0, 100);
    alert("⚡ Admin: +100 🛡️ (Đã ghi nhận vào Database D1)");
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
    alert("⚡ Admin: Đã mở full 990 đá!");
});
document.getElementById("admAddAllItems")?.addEventListener("click", () => {
    BLESSINGS_DATA.forEach(b => addItemToInventory(b));
    saveUserData();
    renderInventory5x5();
    alert("⚡ Admin: Đã thêm đủ 30 Chúc Phúc vào túi!");
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
// XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN LÊN IMGBB & LƯU VÀO D1
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
        alert("Vui lòng chọn ảnh có dung lượng dưới 5MB!");
        return;
    }

    btnTriggerUpload.textContent = "⏳";
    btnTriggerUpload.style.pointerEvents = "none";

    const formData = new FormData();
    formData.append("image", file);

    try {
        // 1. Gửi ảnh trực tiếp lên ImgBB API
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const imgData = await res.json();

        if (imgData.success) {
            const newAvatarUrl = imgData.data.url;

            // 2. Gửi link ảnh mới lên Cloudflare Worker để cập nhật bảng D1
            await fetch(`${API_URL}/api/user/update-avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    avatarUrl: newAvatarUrl
                })
            });

            // 3. Cập nhật giao diện người dùng
            currentUser.avatar_url = newAvatarUrl;
            saveUserData();
            document.getElementById("profAvatar").src = newAvatarUrl;
            document.getElementById("userAvatarImg").src = newAvatarUrl;

            alert("✦ Cập nhật ảnh đại diện thành công!");
        } else {
            alert("Lỗi tải ảnh: " + (imgData.error?.message || "Kiểm tra lại ImgBB API Key!"));
        }
    } catch (err) {
        alert("Không thể kết nối đến máy chủ ảnh!");
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

new QRCode(document.getElementById("userProfileQr"), {
    text: `ADVENATURE_USER:${currentUser.adventurer_code}`,
    width: 100,
    height: 100
});
