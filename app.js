import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

// ======================================================
// 1. CONFIG & DATA SYNC (LOCALSTORAGE & CLOUDFLARE D1)
// ======================================================
const API_URL = "https://advenature-api.YOUR-SUBDOMAIN.workers.dev"; // Điền Endpoint Worker API khi deploy

let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || null;

if (!currentUser) {
    currentUser = {
        id: "AW_USER_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        full_name: "Nhà Phiêu Lưu Mới",
        adventurer_code: "AW" + Math.floor(1000 + Math.random() * 9000),
        role: "Tân Thủ",
        tinh_quang_points: 1, // Lần đầu Free
        tinh_thach_points: 0,
        cong_hien_points: 0,
        gacha_counter: 0,
        unlocked_gems: [],     // Danh sách gem_code đã mở
        inventory: []          // Danh sách vật phẩm túi 5x5
    };
    saveUserData();
}

function saveUserData() {
    localStorage.setItem("advenature_user", JSON.stringify(currentUser));
}

function updateTopBarUI() {
    document.getElementById("valTinhQuang").textContent = currentUser.tinh_quang_points.toLocaleString();
    document.getElementById("valTinhThach").textContent = currentUser.tinh_thach_points.toLocaleString();
    document.getElementById("valCongHien").textContent = currentUser.cong_hien_points.toLocaleString();
    document.getElementById("userAdvenCode").textContent = currentUser.adventurer_code;
    
    const costBtn = document.getElementById("summonBtnCost");
    if (currentUser.gacha_counter === 0) {
        costBtn.textContent = "FREE";
    } else {
        costBtn.textContent = "1 🔮";
    }

    // Profile Screen
    document.getElementById("profName").textContent = currentUser.full_name;
    document.getElementById("profCode").textContent = currentUser.adventurer_code;
    document.getElementById("profRole").textContent = currentUser.role;
    document.getElementById("profStatTQ").textContent = currentUser.tinh_quang_points;
    document.getElementById("profStatTT").textContent = currentUser.tinh_thach_points;
    document.getElementById("profStatCH").textContent = currentUser.cong_hien_points + " CP";
    document.getElementById("myRefCodeDisplay").textContent = currentUser.adventurer_code;
    
    // Progress rank
    const pct = Math.min(100, Math.floor((currentUser.cong_hien_points / 100) * 100));
    document.getElementById("rankProgressBar").style.width = pct + "%";
}

// ======================================================
// 2. 3D SCENE & ENGINE SETUP
// ======================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03030a);
scene.fog = new THREE.FogExp2(0x050514, 0.035);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
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

// ======================================================
// 3. TOÁN HỌC 990 BIẾN THỂ THEO DATA.MD
// ======================================================
const CRYSTAL_PALETTES = [
    // 🔥 HỎA DIỆM
    { sys: "🔥", sysIndex: 1, name: "Huyết Ngọc Ruby", color: 0xd90429, emissive: 0x9b001a },
    { sys: "🔥", sysIndex: 2, name: "Thạch Anh Hồng", color: 0xff758f, emissive: 0xc9184a },
    { sys: "🔥", sysIndex: 3, name: "San Hô Lửa", color: 0xff4d6d, emissive: 0xa4133c },
    { sys: "🔥", sysIndex: 4, name: "Nham Thạch Hỏa Diệm", color: 0xff2a00, emissive: 0x8a0000 },
    { sys: "🔥", sysIndex: 5, name: "Máu Rồng Garnet", color: 0x800f2f, emissive: 0x4a0011 },
    // ☀️ THÁI DƯƠNG
    { sys: "☀️", sysIndex: 1, name: "Hổ Phách Mặt Trời", color: 0xff8800, emissive: 0xcc5500 },
    { sys: "☀️", sysIndex: 2, name: "Hoàng Kim Đế Vương", color: 0xffb703, emissive: 0xd48b00 },
    { sys: "☀️", sysIndex: 3, name: "Tinh Thể Thái Dương", color: 0xffd000, emissive: 0xe67e00 },
    { sys: "☀️", sysIndex: 4, name: "Đồng Đỏ Cổ Đại", color: 0xcd6e4e, emissive: 0x8c3a1e },
    { sys: "☀️", sysIndex: 5, name: "Hoàng Thạch Topaz", color: 0xffa200, emissive: 0xcc6600 },
    // 🌿 THẢO MỘC
    { sys: "🌿", sysIndex: 1, name: "Ngọc Lục Bảo Emerald", color: 0x10b981, emissive: 0x047857 },
    { sys: "🌿", sysIndex: 2, name: "Băng Lục Bạc Hà", color: 0x2ec4b6, emissive: 0x008080 },
    { sys: "🌿", sysIndex: 3, name: "Rừng Thần Malachite", color: 0x2d6a4f, emissive: 0x1b4332 },
    { sys: "🌿", sysIndex: 4, name: "Dạ Quang Độc Dược", color: 0x70e000, emissive: 0x38b000 },
    { sys: "🌿", sysIndex: 5, name: "Ngọc Bích Phong Ma", color: 0x52b788, emissive: 0x1b7a4e },
    // ❄️ BĂNG TINH
    { sys: "❄️", sysIndex: 1, name: "Hải Lam Ngọc Aquamarine", color: 0x4cc9f0, emissive: 0x0077b6 },
    { sys: "❄️", sysIndex: 2, name: "Băng Tinh Bắc Cực", color: 0xa0c4ff, emissive: 0x0096c7 },
    { sys: "❄️", sysIndex: 3, name: "Lam Tinh Thần Tú", color: 0x00f5d4, emissive: 0x00bbf9 },
    { sys: "❄️", sysIndex: 4, name: "Sương Lam Huyền Ảo", color: 0xbde0fe, emissive: 0x48cae4 },
    { sys: "❄️", sysIndex: 5, name: "Vực Sâu Biển Cả", color: 0x006d77, emissive: 0x004953 },
    // ⚡ THIÊN HÀ
    { sys: "⚡", sysIndex: 1, name: "Lam Bảo Sapphire", color: 0x2b4c7e, emissive: 0x132a4a },
    { sys: "⚡", sysIndex: 2, name: "Dạ Khúc Indigo", color: 0x3a0ca3, emissive: 0x1e0363 },
    { sys: "⚡", sysIndex: 3, name: "Bão Điện Thiên Không", color: 0x4361ee, emissive: 0x1a33b0 },
    { sys: "⚡", sysIndex: 4, name: "Thanh Lam Cổ Thần", color: 0x1d3557, emissive: 0x457b9d },
    { sys: "⚡", sysIndex: 5, name: "Tử Lam Hư Vô", color: 0x3f37c9, emissive: 0x241d99 },
    // 🔮 MA PHÁP
    { sys: "🔮", sysIndex: 1, name: "Thạch Anh Tím Amethyst", color: 0x7209b7, emissive: 0x480ca8 },
    { sys: "🔮", sysIndex: 2, name: "Tinh Vân Nebula", color: 0x9d4edd, emissive: 0x5a189a },
    { sys: "🔮", sysIndex: 3, name: "Tử Đằng Nguyệt Tinh", color: 0xc77dff, emissive: 0x7b2cbf },
    { sys: "🔮", sysIndex: 4, name: "Cực Quang Tinh Linh", color: 0xf72585, emissive: 0x7209b7 },
    { sys: "🔮", sysIndex: 5, name: "Hồng Ma Pháp Opal", color: 0xff007f, emissive: 0x99004d }
];

const FACE_TIERS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
const SHAPE_STYLES = [
    { id: 1, name: "Trụ Tinh Thể", rx: [0.8, 1.2], ry: [1.8, 2.5], rz: [0.8, 1.2] },
    { id: 2, name: "Cự Thạch",     rx: [1.2, 1.6], ry: [1.2, 1.6], rz: [1.2, 1.6] },
    { id: 3, name: "Phiến Thạch",  rx: [1.5, 2.0], ry: [1.2, 1.7], rz: [0.6, 0.9] }
];

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

// ======================================================
// 4. DANH MỤC 30 CHÚC PHÚC & ITEM THEO DATA.MD
// ======================================================
const BLESSINGS_DATA = [
    // COMMON (1-12)
    { id: "BLESS_01", name: "1 ống tre", tier: "common", icon: "🎋", isBuff: false },
    { id: "BLESS_02", name: "Nhựa thông", tier: "common", icon: "🪵", isBuff: false },
    { id: "BLESS_03", name: "+1 Điểm Tinh Quang", tier: "common", icon: "🔮", isBuff: true, buff: { tq: 1 } },
    { id: "BLESS_04", name: "1 mảnh vải ngẫu nhiên", tier: "common", icon: "🧣", isBuff: false },
    { id: "BLESS_05", name: "1 Gậy gỗ", tier: "common", icon: "🦯", isBuff: false },
    { id: "BLESS_06", name: "2 quả trứng gà", tier: "common", icon: "🥚", isBuff: false },
    { id: "BLESS_07", name: "1 quả bắp", tier: "common", icon: "🌽", isBuff: false },
    { id: "BLESS_08", name: "+1 Điểm Cống Hiến", tier: "common", icon: "🛡️", isBuff: true, buff: { ch: 1 } },
    { id: "BLESS_09", name: "+2 Điểm Cống Hiến", tier: "common", icon: "🛡️", isBuff: true, buff: { ch: 2 } },
    { id: "BLESS_10", name: "1 Ly Trà Thảo Mộc", tier: "common", icon: "🍵", isBuff: false },
    { id: "BLESS_11", name: "1 Củ khoai lang", tier: "common", icon: "🍠", isBuff: false },
    { id: "BLESS_12", name: "Thẻ thêm thịt nướng", tier: "common", icon: "🥩", isBuff: false },
    // UNCOMMON (13-21)
    { id: "BLESS_13", name: "1 Bình Potion", tier: "uncommon", icon: "🧪", isBuff: false },
    { id: "BLESS_14", name: "1 Ly Cocktail Tavern", tier: "uncommon", icon: "🍹", isBuff: false },
    { id: "BLESS_15", name: "Thẻ X2 Tinh Thạch Main Quest", tier: "uncommon", icon: "📜", isBuff: false },
    { id: "BLESS_16", name: "Thẻ Thuê Áo Choàng Free", tier: "uncommon", icon: "🧥", isBuff: false },
    { id: "BLESS_17", name: "Thẻ Trợ Thủ NPC", tier: "uncommon", icon: "🧝", isBuff: false },
    { id: "BLESS_18", name: "+1 Tinh Thạch", tier: "uncommon", icon: "💎", isBuff: true, buff: { tt: 1 } },
    { id: "BLESS_19", name: "+2 Tinh Thạch", tier: "uncommon", icon: "💎", isBuff: true, buff: { tt: 2 } },
    { id: "BLESS_20", name: "Thẻ mượn Đạo cụ Quest", tier: "uncommon", icon: "🧭", isBuff: false },
    { id: "BLESS_21", name: "Thẻ Mượn Đèn Bão Đêm", tier: "uncommon", icon: "🏮", isBuff: false },
    // RARE (22-27)
    { id: "BLESS_22", name: "Huy Hiệu Phiêu Lưu Xanh", tier: "rare", icon: "🏅", isBuff: false },
    { id: "BLESS_23", name: "Thẻ Dịch Chuyển", tier: "rare", icon: "🌀", isBuff: false },
    { id: "BLESS_24", name: "Thẻ Gacha Phiên Chợ", tier: "rare", icon: "🎟️", isBuff: false },
    { id: "BLESS_25", name: "Dây chuyền Tinh Linh", tier: "rare", icon: "📿", isBuff: false },
    { id: "BLESS_26", name: "Món Quà Bí Mật Tinh Linh", tier: "rare", icon: "🎁", isBuff: false },
    { id: "BLESS_27", name: "Thẻ bài Tinh Linh Rừng", tier: "rare", icon: "🃏", isBuff: false },
    // LEGENDARY (28-30)
    { id: "BLESS_28", name: "Thẻ Nâng cấp phòng riêng", tier: "legendary", icon: "🗝️", isBuff: false },
    { id: "BLESS_29", name: "Thẻ lưu trú miễn phí", tier: "legendary", icon: "⛺", isBuff: false },
    { id: "BLESS_30", name: "Trang bị Nhà Phiêu Lưu", tier: "legendary", icon: "⚔️", isBuff: false }
];

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function getRandomBlessing() {
    const roll = Math.random() * 100;
    let pool = [];
    if (roll < 1) pool = BLESSINGS_DATA.slice(27, 30);      // 1% Legendary
    else if (roll < 13) pool = BLESSINGS_DATA.slice(21, 27); // 12% Rare
    else if (roll < 38) pool = BLESSINGS_DATA.slice(12, 21); // 25% Uncommon
    else pool = BLESSINGS_DATA.slice(0, 12);                 // 62% Common
    return pool[Math.floor(Math.random() * pool.length)];
}

function addItemToInventory(item) {
    const existing = currentUser.inventory.find(i => i.id === item.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        currentUser.inventory.push({
            id: item.id,
            name: item.name,
            icon: item.icon,
            isBuff: item.isBuff,
            buff: item.buff || null,
            quantity: 1,
            qr_token: "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase()
        });
    }
    saveUserData();
}

// ======================================================
// 5. GACHA STATE MACHINE & SỰ KIỆN TRIỆU HỒI
// ======================================================
const STATE = { IDLE: "idle", GACHA: "gacha", CORE: "core", LOOT: "loot", CLAIMED: "claimed" };
let state = STATE.IDLE;
let stateStart = performance.now();

const gachaBtn = document.getElementById("gachaButton");
const claimContainer = document.getElementById("claimContainer");
const claimBtn = document.getElementById("claimButton");
const lootText = document.getElementById("lootText");
const crystalHeader = document.getElementById("crystalNameHeader");

gachaBtn.addEventListener("click", () => {
    if (state !== STATE.IDLE && state !== STATE.CLAIMED) return;

    if (currentUser.gacha_counter > 0 && currentUser.tinh_quang_points < 1) {
        alert("Bạn đã hết Điểm Tinh Quang 🔮! Hãy điểm danh hoặc mời bạn bè để nhận thêm.");
        return;
    }

    gachaBtn.style.display = "none";
    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");

    coreGroup.position.set(0, 0, 0);
    coreGroup.scale.setScalar(0.001);

    const gem = createProceduralRock();
    crystalHeader.textContent = gem.name;

    lootText.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: #ffe66d;">✦ ${gem.name} ✦</div>
        <div style="font-size: 11px; color: #c9c3ff; letter-spacing: 1.5px; margin-top: 4px;">
            [${gem.shapeName.toUpperCase()}] • ${gem.faceCount} DIỆN THỂ • MÃ: ${gem.code}
        </div>
    `;

    state = STATE.GACHA;
    stateStart = performance.now();
});

claimBtn.addEventListener("click", () => {
    if (state !== STATE.LOOT) return;
    state = STATE.CLAIMED;
    stateStart = performance.now();

    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");

    // Khấu trừ điểm & cộng bộ đếm
    if (currentUser.gacha_counter > 0) {
        currentUser.tinh_quang_points = Math.max(0, currentUser.tinh_quang_points - 1);
    }
    currentUser.gacha_counter++;

    // Lưu kho Tinh Quang Thạch (tránh trùng)
    if (!currentUser.unlocked_gems.includes(currentGemResult.code)) {
        currentUser.unlocked_gems.push(currentGemResult.code);
    }

    // Logic Chúc Phúc Lần Đầu hoặc Kiểm Tra Số Nguyên Tố
    let wonBlessing = null;
    if (currentUser.gacha_counter === 1) {
        // Lần đầu: Tặng 1 trong 4 Chúc Phúc Free
        const freeTiers = [BLESSINGS_DATA[9], BLESSINGS_DATA[11], BLESSINGS_DATA[23], BLESSINGS_DATA[0]];
        wonBlessing = freeTiers[Math.floor(Math.random() * freeTiers.length)];
        addItemToInventory(wonBlessing);
        alert(`🎉 LẦN ĐẦU TRIỆU HỒI THÀNH CÔNG!\nBạn thu thập [${currentGemResult.name} - ${currentGemResult.code}] và nhận Chúc Phúc Tân Thủ: [${wonBlessing.icon} ${wonBlessing.name}]!`);
    } else if (isPrime(currentUser.gacha_counter)) {
        wonBlessing = getRandomBlessing();
        addItemToInventory(wonBlessing);
        alert(`🌟 TINH LINH BAN CHÚC PHÚC (Lần quay thứ ${currentUser.gacha_counter} là Số Nguyên Tố)!\nBạn nhận được: [${wonBlessing.icon} ${wonBlessing.name}]`);
    }

    saveUserData();
    updateTopBarUI();
    renderInventoryGems();
    renderInventory5x5();

    setTimeout(() => {
        gachaBtn.style.display = "flex";
        state = STATE.IDLE;
    }, 1500);
});

// Update vòng lặp hạt & lõi
function updateParticles(elapsed, progress) {
    const positions = particleGeometry.attributes.position.array;
    const totalTime = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleData[i];
        const wanderX = p.baseX + Math.sin(totalTime * p.driftSpeed + p.phaseX) * p.driftRadius;
        const wanderY = p.baseY + Math.cos(totalTime * p.driftSpeed * 0.8 + p.phaseY) * p.driftRadius;
        const wanderZ = p.baseZ + Math.sin(totalTime * p.driftSpeed * 1.2 + p.phaseZ) * p.driftRadius;

        if (state === STATE.IDLE) {
            positions[i * 3] = wanderX;
            positions[i * 3 + 1] = wanderY;
            positions[i * 3 + 2] = wanderZ;
        } else if (state === STATE.GACHA) {
            const currentAngle = p.angle + (elapsed * p.vortexSpeed) * (1 + progress * 2.5);
            const collapse = Math.max(0, (progress - 0.45) / 0.55);
            const currentRadius = THREE.MathUtils.lerp(p.radius, 0.25, collapse);
            const verticalWave = Math.sin(elapsed * 4 + p.random * 10) * 0.3 * (1 - collapse);

            positions[i * 3] = Math.cos(currentAngle) * currentRadius;
            positions[i * 3 + 1] = Math.sin(currentAngle * 1.5) * currentRadius * 0.35 + verticalWave;
            positions[i * 3 + 2] = Math.sin(currentAngle) * currentRadius;
        }
    }
    particleGeometry.attributes.position.needsUpdate = true;
}

function updateState(now) {
    const elapsed = (now - stateStart) / 1000;

    if (state === STATE.IDLE) {
        updateParticles(elapsed, 0);
    } else if (state === STATE.GACHA) {
        const progress = Math.min(elapsed / 3.5, 1);
        updateParticles(elapsed, progress);
        const appear = Math.max(0, (progress - 0.7) / 0.3);
        coreMaterial.opacity = appear;
        coreGlowMaterial.opacity = appear * 0.7;
        coreGroup.scale.setScalar(appear);

        if (elapsed >= 3.5) {
            state = STATE.CORE;
            stateStart = now;
        }
    } else if (state === STATE.CORE) {
        if (elapsed >= 1.0) {
            coreMaterial.opacity = 0;
            coreGlowMaterial.opacity = 0;
            coreGroup.scale.setScalar(0);
            state = STATE.LOOT;
            stateStart = now;
            lootText.classList.add("show");
            claimContainer.classList.remove("hidden");
        }
    } else if (state === STATE.LOOT && lootBox) {
        lootBox.rotation.y += 0.008;
        lootBox.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
    } else if (state === STATE.CLAIMED && lootBox) {
        lootBox.position.y -= 0.04;
        lootBox.scale.multiplyScalar(0.94);
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
// 6. ĐIỀU HƯỚNG & KHÓA ORBITCONTROLS KHI MỞ OVERLAY
// ======================================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (targetId === "gacha-view") {
            controls.enabled = true; // Mở lại tương tác 3D
            document.getElementById("tabIndicator").textContent = "Home Gacha";
            viewPanels.forEach(p => {
                if (p.id !== "gacha-view") p.classList.add("hidden");
            });
            return;
        }

        // Khóa tương tác 3D để cuộn panel mượt mà
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

document.querySelectorAll(".close-panel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        controls.enabled = true;
        viewPanels.forEach(p => {
            if (p.id !== "gacha-view") p.classList.add("hidden");
        });
        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector(".dock-btn.center-core").classList.add("active");
        document.getElementById("tabIndicator").textContent = "Home Gacha";
    });
});

document.getElementById("btnProfileQuick").addEventListener("click", () => {
    document.querySelector('.dock-btn[data-target="profile-view"]').click();
});

// ======================================================
// 7. PHASE 3: RENDER TỦ 990 THẠCH & LƯỚI 5x5 QR CODE
// ======================================================
let currentFilterSys = "ALL";

// Tabs trong Túi đồ
document.querySelectorAll(".inv-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".inv-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const subId = btn.dataset.sub;
        document.querySelectorAll(".inv-content").forEach(c => c.classList.add("hidden"));
        document.getElementById(subId).classList.remove("hidden");
    });
});

// Bộ lọc 6 Hệ
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilterSys = btn.dataset.sys;
        renderInventoryGems();
    });
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

    // Lọc theo hệ
    const filteredPalettes = currentFilterSys === "ALL" 
        ? CRYSTAL_PALETTES 
        : CRYSTAL_PALETTES.filter(p => p.sys === currentFilterSys);

    let html = "";
    filteredPalettes.forEach(pal => {
        FACE_TIERS.forEach(face => {
            SHAPE_STYLES.forEach(shape => {
                const code = `${pal.sys}${pal.sysIndex}${face}${shape.id}`;
                const isUnlocked = unlockedSet.has(code);

                html += `
                    <div class="gem-slot ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="gem-slot-icon">${isUnlocked ? pal.sys : '❓'}</div>
                        <div class="gem-slot-code">${isUnlocked ? code : '???'}</div>
                        <div class="gem-slot-name">${isUnlocked ? pal.name : 'Chưa mở'}</div>
                    </div>
                `;
            });
        });
    });
    grid.innerHTML = html;
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
                    <span class="item-slot-icon">${item.icon}</span>
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

// Modal Item & QR Generator
const itemModal = document.getElementById("itemModal");
const qrcodeContainer = document.getElementById("qrcodeContainer");
let currentQrInstance = null;

function openItemModal(item, itemIndex) {
    itemModal.classList.remove("hidden");
    document.getElementById("modalItemTitle").textContent = `${item.icon} ${item.name}`;
    qrcodeContainer.innerHTML = "";

    const btnUseBuff = document.getElementById("btnUseBuffItem");
    const noteText = document.getElementById("modalQrNote");

    if (item.isBuff) {
        qrcodeContainer.style.display = "none";
        btnUseBuff.classList.remove("hidden");
        noteText.textContent = "Nhấn [SỬ DỤNG NGAY] để cộng trực tiếp vào chỉ số của bạn.";
        btnUseBuff.onclick = () => {
            if (item.buff.tq) currentUser.tinh_quang_points += item.buff.tq;
            if (item.buff.tt) currentUser.tinh_thach_points += item.buff.tt;
            if (item.buff.ch) currentUser.cong_hien_points += item.buff.ch;
            
            item.quantity--;
            if (item.quantity <= 0) currentUser.inventory.splice(itemIndex, 1);
            saveUserData();
            updateTopBarUI();
            renderInventory5x5();
            itemModal.classList.add("hidden");
            alert("✦ Đã sử dụng thành công buff!");
        };
    } else {
        qrcodeContainer.style.display = "flex";
        btnUseBuff.classList.add("hidden");
        noteText.textContent = "Đưa mã QR này cho NPC / Quản lý Hội Ngọc Lục để sử dụng ngoài đời thực.";
        
        // Tạo mã QR động từ thư viện qrcodejs
        currentQrInstance = new QRCode(qrcodeContainer, {
            text: JSON.stringify({ token: item.qr_token, user: currentUser.adventurer_code, item: item.name }),
            width: 120,
            height: 120,
            colorDark : "#000000",
            colorLight : "#ffffff"
        });
    }
}

document.getElementById("closeItemModal").addEventListener("click", () => {
    itemModal.classList.add("hidden");
});

// ======================================================
// 8. SHOP LỮ HÀNH RỪNG TINH LINH (DATA.MD)
// ======================================================
const SHOP_ITEMS = [
    { id: "PKG_1", name: "📦 GÓI TRẢI NGHIỆM", tt: 22, vnd: 550000, desc: "Lều trại 01 đêm + Mystery Box + Buff dịch chuyển Bảo Lộc." },
    { id: "PKG_2", name: "🎒 GÓI THƯ GIÃN", tt: 32, vnd: 800000, desc: "Trọn gói 3 bữa ăn (BBQ tối + Sáng + Trưa) + Lều trại lưu trú." },
    { id: "PKG_3", name: "⚔️ GÓI TRỌN GÓI (Best)", tt: 64, vnd: 1600000, desc: "Full trải nghiệm 2N1Đ + 3 Bữa ăn + Mở toàn bộ 5 Main Quests." },
    { id: "PKG_4", name: "🛡️ GÓI SĂN GACHA", tt: 80, vnd: 2000000, desc: "Full 2N1Đ + Túi 4 Tinh Thạch + 1 Thẻ bài Tinh Linh + 1 Lượt quay chợ." },
    { id: "Q_1", name: "Quest Phong Tinh Linh", tt: 8, vnd: 200000, desc: "Nhận nhiệm vụ tại bìa rừng cùng Ranger NPC." },
    { id: "Q_2", name: "Quest Mộc Tinh Linh", tt: 8, vnd: 200000, desc: "Nhiệm vụ tại Đồi Cỏ Cây Thông." },
    { id: "Q_3", name: "Quest Hỏa Tinh Linh", tt: 8, vnd: 200000, desc: "Nhiệm vụ bên ngọn lửa tại Hội Ngọc Lục." },
    { id: "Q_4", name: "Quest Thủy Tinh Linh", tt: 8, vnd: 200000, desc: "Khám phá suối rừng cùng NPC hướng dẫn." },
    { id: "Q_5", name: "Quest Thổ Tinh Linh", tt: 8, vnd: 200000, desc: "Giao thương thử thách tại Phiên Chợ Tinh Linh." },
    { id: "F_1", name: "Tiệc BBQ Đêm Tinh Nghịch", tt: 7, vnd: 175000, desc: "Tiệc nướng đêm bên bếp lửa Hội Ngọc Lục." },
    { id: "F_2", name: "Bữa Sáng Bên Suối", tt: 2, vnd: 50000, desc: "Điểm tâm sáng thư thái bên suối tự nhiên." },
    { id: "F_3", name: "Bữa Trưa Tại Phiên Chợ", tt: 2, vnd: 50000, desc: "Dùng bữa trưa đậm bản sắc tinh linh." }
];

const selectedShopIds = new Set();

function renderShop() {
    const container = document.getElementById("shopItemsContainer");
    if (!container) return;
    container.innerHTML = SHOP_ITEMS.map(p => `
        <div class="shop-card ${selectedShopIds.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
            <div class="shop-card-title">${p.name}</div>
            <div class="shop-card-price">💎 ${p.tt} Tinh Thạch (~${p.vnd.toLocaleString()} đ)</div>
            <div class="shop-card-desc">${p.desc}</div>
        </div>
    `).join('');

    container.querySelectorAll(".shop-card").forEach(c => {
        c.addEventListener("click", () => {
            const id = c.dataset.id;
            if (selectedShopIds.has(id)) selectedShopIds.delete(id);
            else selectedShopIds.add(id);
            renderShop();
            updateShopCheckout();
        });
    });
}

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

document.getElementById("btnCheckoutShop").addEventListener("click", () => {
    if (selectedShopIds.size === 0) {
        alert("Vui lòng tích chọn ít nhất 1 gói hoặc tiện ích!");
        return;
    }
    const phone = prompt("Nhập số điện thoại / Zalo để Hội Ngọc Lục liên hệ xác nhận:");
    if (!phone) return;

    alert("✦ Thông tin đơn hàng đã được gửi cho Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.");
    selectedShopIds.clear();
    renderShop();
    updateShopCheckout();
});

// ======================================================
// 9. NHIỆM VỤ DAILY (CHECK-IN & REFERRAL)
// ======================================================
document.getElementById("btnDoCheckin").addEventListener("click", () => {
    currentUser.tinh_quang_points += 1;
    saveUserData();
    updateTopBarUI();
    alert("✦ Điểm danh thành công! Nhận +1 🔮 Điểm Tinh Quang.");
    document.getElementById("btnDoCheckin").textContent = "Đã Điểm Danh";
    document.getElementById("btnDoCheckin").disabled = true;
});

document.getElementById("btnSubmitFb").addEventListener("click", () => {
    const link = document.getElementById("inputFbLink").value.trim();
    if (link.startsWith("http")) {
        alert("✦ Đã gửi link bài viết cho Quản trị viên Telegram! Vui lòng chờ duyệt (+1 🔮).");
        document.getElementById("inputFbLink").value = "";
    } else {
        alert("Vui lòng nhập đường link bài viết hợp lệ!");
    }
});

document.getElementById("btnSubmitRef").addEventListener("click", () => {
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

// Khởi chạy ban đầu
updateTopBarUI();
renderInventoryGems();
renderInventory5x5();
renderShop();

// Sinh mã QR Profile cá nhân
new QRCode(document.getElementById("userProfileQr"), {
    text: `ADVENATURE_USER:${currentUser.adventurer_code}`,
    width: 120,
    height: 120
});

// ======================================================
// KHỐI CODE THÊM MỚI: LOGIC ADMIN GOD-MODE & FAST GACHA
// ======================================================
let logoClickCount = 0;
let logoClickTimer = null;
let isFastGachaEnabled = false;

const brandLogo = document.querySelector(".brand-logo");
const adminModal = document.getElementById("adminGodModal");
const closeAdminModal = document.getElementById("closeAdminModal");

// Bấm liên tục 5 lần vào Logo để mở Admin Tool
brandLogo.style.cursor = "pointer";
brandLogo.addEventListener("click", () => {
    logoClickCount++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1500);

    if (logoClickCount >= 5) {
        logoClickCount = 0;
        adminModal.classList.remove("hidden");
    }
});

closeAdminModal.addEventListener("click", () => {
    adminModal.classList.add("hidden");
});

// 1. Bơm tài nguyên
document.getElementById("admAddTQ").addEventListener("click", () => {
    currentUser.tinh_quang_points += 99;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: Đã cộng +99 🔮 Tinh Quang!");
});

document.getElementById("admAddTT").addEventListener("click", () => {
    currentUser.tinh_thach_points += 99;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: Đã cộng +99 💎 Tinh Thạch!");
});

document.getElementById("admAddCH").addEventListener("click", () => {
    currentUser.cong_hien_points += 100;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: Đã cộng +100 🛡️ Cống Hiến!");
});

// 2. Mở khóa toàn bộ 990 Đá
document.getElementById("admUnlockAllGems").addEventListener("click", () => {
    const allGems = [];
    CRYSTAL_PALETTES.forEach(pal => {
        FACE_TIERS.forEach(face => {
            SHAPE_STYLES.forEach(shape => {
                allGems.push(`${pal.sys}${pal.sysIndex}${face}${shape.id}`);
            });
        });
    });
    currentUser.unlocked_gems = allGems;
    saveUserData();
    renderInventoryGems();
    alert("⚡ Admin: Đã mở khóa trọn bộ 990/990 Tinh Quang Thạch!");
});

// 3. Nhận đủ 30 Chúc Phúc vào Túi Đồ
document.getElementById("admAddAllItems").addEventListener("click", () => {
    BLESSINGS_DATA.forEach(item => {
        addItemToInventory(item);
    });
    saveUserData();
    renderInventory5x5();
    alert("⚡ Admin: Đã nhận trọn vẹn 30 Chúc Phúc Tinh Linh vào túi!");
});

// 4. Bật/Tắt Fast Gacha (Triệu hồi tức thì không chờ xoáy hạt)
const fastGachaStatus = document.getElementById("admFastGachaStatus");
document.getElementById("admToggleFastGacha").addEventListener("click", () => {
    isFastGachaEnabled = !isFastGachaEnabled;
    fastGachaStatus.textContent = isFastGachaEnabled ? "BẬT (0.1s)" : "TẮT";
    fastGachaStatus.style.color = isFastGachaEnabled ? "#00f5d4" : "#ff3366";
});

// Chèn logic Fast Gacha vào nút Triệu Hồi Gacha
const originalGachaBtnHandler = gachaBtn.onclick;
gachaBtn.addEventListener("click", () => {
    if (isFastGachaEnabled && state === STATE.GACHA) {
        // Rút ngắn thời gian chuyển trạng thái LOOT ngay lập tức
        setTimeout(() => {
            state = STATE.LOOT;
            coreMaterial.opacity = 0;
            coreGlowMaterial.opacity = 0;
            coreGroup.scale.setScalar(0);
            lootText.classList.add("show");
            claimContainer.classList.remove("hidden");
        }, 150);
    }
});

// 5. Reset toàn bộ dữ liệu về trạng thái ban đầu
document.getElementById("admResetData").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu test và về trạng thái Tân Thủ?")) {
        localStorage.removeItem("advenature_user");
        location.reload();
    }
});