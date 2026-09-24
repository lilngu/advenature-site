import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

// ======================================================
// 1. DATA USER & PERSISTENCE
// ======================================================
const API_URL = "https://advenature-api.YOUR-SUBDOMAIN.workers.dev";

let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || null;

if (!currentUser) {
    currentUser = {
        id: "AW_USER_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        full_name: "Nhà Phiêu Lưu",
        adventurer_code: "AW" + Math.floor(1000 + Math.random() * 9000),
        role: "Tân Thủ Rừng Già",
        tinh_quang_points: 1, // Lần đầu Free
        tinh_thach_points: 0,
        cong_hien_points: 0,
        gacha_counter: 0,
        unlocked_gems: [],     // Lưu gem_code đã mở
        inventory: []          // Lưới vật phẩm 5x5
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

    // Cập nhật giá trên Nút Gacha Dock tròn
    const dockCostBadge = document.getElementById("dockCostBadge");
    if (currentUser.gacha_counter === 0) {
        dockCostBadge.textContent = "FREE";
    } else {
        dockCostBadge.textContent = "1 🔮";
    }

    // Profile Screen
    document.getElementById("profName").textContent = currentUser.full_name;
    document.getElementById("profCode").textContent = currentUser.adventurer_code;
    document.getElementById("profRole").textContent = currentUser.role;
    document.getElementById("profStatTQ").innerHTML = `<i class="rpg-ico ico-tq"></i> ${currentUser.tinh_quang_points}`;
    document.getElementById("profStatTT").innerHTML = `<i class="rpg-ico ico-tt"></i> ${currentUser.tinh_thach_points}`;
    document.getElementById("profStatCH").innerHTML = `<i class="rpg-ico ico-ch"></i> ${currentUser.cong_hien_points} CP`;
    document.getElementById("myRefCodeDisplay").textContent = currentUser.adventurer_code;

    const pct = Math.min(100, Math.floor((currentUser.cong_hien_points / 100) * 100));
    document.getElementById("rankProgressBar").style.width = pct + "%";
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

// ======================================================
// 3. TOÁN HỌC 990 BIẾN THỂ THEO DATA.MD
// ======================================================
const CRYSTAL_PALETTES = [
    // 🔥 HỎA DIỆM
    { sys: "🔥",sysKey: "fire", sysIndex: 1, name: "Huyết Ngọc Ruby", color: 0xd90429, emissive: 0x9b001a },
    { sys: "🔥",sysKey: "fire", sysIndex: 2, name: "Thạch Anh Hồng", color: 0xff758f, emissive: 0xc9184a },
    { sys: "🔥",sysKey: "fire", sysIndex: 3, name: "San Hô Lửa", color: 0xff4d6d, emissive: 0xa4133c },
    { sys: "🔥",sysKey: "fire", sysIndex: 4, name: "Nham Thạch Hỏa Diệm", color: 0xff2a00, emissive: 0x8a0000 },
    { sys: "🔥",sysKey: "fire", sysIndex: 5, name: "Máu Rồng Garnet", color: 0x800f2f, emissive: 0x4a0011 },
    // ☀️ THÁI DƯƠNG
    { sys: "☀️",sysKey: "sun", sysIndex: 1, name: "Hổ Phách Mặt Trời", color: 0xff8800, emissive: 0xcc5500 },
    { sys: "☀️",sysKey: "sun", sysIndex: 2, name: "Hoàng Kim Đế Vương", color: 0xffb703, emissive: 0xd48b00 },
    { sys: "☀️",sysKey: "sun", sysIndex: 3, name: "Tinh Thể Thái Dương", color: 0xffd000, emissive: 0xe67e00 },
    { sys: "☀️",sysKey: "sun", sysIndex: 4, name: "Đồng Đỏ Cổ Đại", color: 0xcd6e4e, emissive: 0x8c3a1e },
    { sys: "☀️",sysKey: "sun", sysIndex: 5, name: "Hoàng Thạch Topaz", color: 0xffa200, emissive: 0xcc6600 },
    // 🌿 THẢO MỘC
    { sys: "🌿",sysKey: "wood", sysIndex: 1, name: "Ngọc Lục Bảo Emerald", color: 0x10b981, emissive: 0x047857 },
    { sys: "🌿",sysKey: "wood", sysIndex: 2, name: "Băng Lục Bạc Hà", color: 0x2ec4b6, emissive: 0x008080 },
    { sys: "🌿",sysKey: "wood", sysIndex: 3, name: "Rừng Thần Malachite", color: 0x2d6a4f, emissive: 0x1b4332 },
    { sys: "🌿",sysKey: "wood", sysIndex: 4, name: "Dạ Quang Độc Dược", color: 0x70e000, emissive: 0x38b000 },
    { sys: "🌿",sysKey: "wood", sysIndex: 5, name: "Ngọc Bích Phong Ma", color: 0x52b788, emissive: 0x1b7a4e },
    // ❄️ BĂNG TINH
    { sys: "❄️",sysKey: "ice", sysIndex: 1, name: "Hải Lam Ngọc Aquamarine", color: 0x4cc9f0, emissive: 0x0077b6 },
    { sys: "❄️",sysKey: "ice", sysIndex: 2, name: "Băng Tinh Bắc Cực", color: 0xa0c4ff, emissive: 0x0096c7 },
    { sys: "❄️",sysKey: "ice", sysIndex: 3, name: "Lam Tinh Thần Tú", color: 0x00f5d4, emissive: 0x00bbf9 },
    { sys: "❄️",sysKey: "ice", sysIndex: 4, name: "Sương Lam Huyền Ảo", color: 0xbde0fe, emissive: 0x48cae4 },
    { sys: "❄️",sysKey: "ice", sysIndex: 5, name: "Vực Sâu Biển Cả", color: 0x006d77, emissive: 0x004953 },
    // ⚡ THIÊN HÀ
    { sys: "⚡",sysKey: "lightning", sysIndex: 1, name: "Lam Bảo Sapphire", color: 0x2b4c7e, emissive: 0x132a4a },
    { sys: "⚡",sysKey: "lightning", sysIndex: 2, name: "Dạ Khúc Indigo", color: 0x3a0ca3, emissive: 0x1e0363 },
    { sys: "⚡",sysKey: "lightning", sysIndex: 3, name: "Bão Điện Thiên Không", color: 0x4361ee, emissive: 0x1a33b0 },
    { sys: "⚡",sysKey: "lightning", sysIndex: 4, name: "Thanh Lam Cổ Thần", color: 0x1d3557, emissive: 0x457b9d },
    { sys: "⚡",sysKey: "lightning", sysIndex: 5, name: "Tử Lam Hư Vô", color: 0x3f37c9, emissive: 0x241d99 },
    // 🔮 MA PHÁP
    { sys: "🔮",sysKey: "magic", sysIndex: 1, name: "Thạch Anh Tím Amethyst", color: 0x7209b7, emissive: 0x480ca8 },
    { sys: "🔮",sysKey: "magic", sysIndex: 2, name: "Tinh Vân Nebula", color: 0x9d4edd, emissive: 0x5a189a },
    { sys: "🔮",sysKey: "magic", sysIndex: 3, name: "Tử Đằng Nguyệt Tinh", color: 0xc77dff, emissive: 0x7b2cbf },
    { sys: "🔮",sysKey: "magic", sysIndex: 4, name: "Cực Quang Tinh Linh", color: 0xf72585, emissive: 0x7209b7 },
    { sys: "🔮",sysKey: "magic", sysIndex: 5, name: "Hồng Ma Pháp Opal", color: 0xff007f, emissive: 0x99004d }
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
// 4. DANH MỤC 30 CHÚC PHÚC & ITEM (ĐÃ CHUẨN HÓA DATA URI CLASS)
// ======================================================
const BLESSINGS_DATA = [
    // COMMON (1-12)
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

    // UNCOMMON (13-21)
    { id: "BLESS_13", name: "1 Bình Potion", tier: "uncommon", iconClass: "ico-item-13", isBuff: false, desc: "Nước tăng lực thảo mộc tiếp sức Ranger đi rừng." },
    { id: "BLESS_14", name: "1 Ly Cocktail Tavern", tier: "uncommon", iconClass: "ico-item-14", isBuff: false, desc: "Đổi đồ uống pha chế tại quầy Tavern Rừng Già." },
    { id: "BLESS_15", name: "Thẻ X2 Tinh Thạch Quest", tier: "uncommon", iconClass: "ico-item-15", isBuff: false, desc: "Nhân đôi phần thưởng Tinh Thạch từ Main Quest." },
    { id: "BLESS_16", name: "Thẻ Thuê Áo Choàng Free", tier: "uncommon", iconClass: "ico-item-16", isBuff: false, desc: "Mượn áo choàng pháp sư check-in miễn phí trong ngày." },
    { id: "BLESS_17", name: "Thẻ Trợ Thủ NPC", tier: "uncommon", iconClass: "ico-item-17", isBuff: false, desc: "Hỏi NPC Ranger 1 câu gợi ý giải mật mã Quest." },
    { id: "BLESS_18", name: "+1 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-18", isBuff: true, buff: { tt: 1 }, desc: "Cộng 1 Tinh Thạch mua dịch vụ hoặc tiện ích." },
    { id: "BLESS_19", name: "+2 Tinh Thạch", tier: "uncommon", iconClass: "ico-item-19", isBuff: true, buff: { tt: 2 }, desc: "Cộng 2 Tinh Thạch vào tài khoản tiêu dùng." },
    { id: "BLESS_20", name: "Thẻ mượn Đạo cụ Quest", tier: "uncommon", iconClass: "ico-item-20", isBuff: false, desc: "Mượn la bàn hoặc ống nhòm khám phá rừng." },
    { id: "BLESS_21", name: "Thẻ Mượn Đèn Bão Đêm", tier: "uncommon", iconClass: "ico-item-21", isBuff: false, desc: "Trang bị đèn bão lung linh cho buổi dạo đêm." },

    // RARE (22-27)
    { id: "BLESS_22", name: "Huy Hiệu Phiêu Lưu Xanh", tier: "rare", iconClass: "ico-item-22", isBuff: false, desc: "Huy hiệu kim loại độc bản chứng nhận thành viên Hội." },
    { id: "BLESS_23", name: "Thẻ Dịch Chuyển", tier: "rare", iconClass: "ico-item-23", isBuff: false, desc: "Buff miễn phí chuyến xe đưa đón Bảo Lộc - Rừng Già." },
    { id: "BLESS_24", name: "Thẻ Gacha Phiên Chợ", tier: "rare", iconClass: "ico-item-24", isBuff: false, desc: "1 vé quay 100% trúng quà tại Phiên Chợ Tinh Linh." },
    { id: "BLESS_25", name: "Dây chuyền Tinh Linh", tier: "rare", iconClass: "ico-item-25", isBuff: false, desc: "Vật phẩm đính đá khoáng thạch thiên nhiên." },
    { id: "BLESS_26", name: "Món Quà Bí Mật Tinh Linh", tier: "rare", iconClass: "ico-item-26", isBuff: false, desc: "Hộp quà bất ngờ do Trưởng quán Hội Ngọc Lục trao tặng." },
    { id: "BLESS_27", name: "Thẻ bài Tinh Linh Rừng", tier: "rare", iconClass: "ico-item-27", isBuff: false, desc: "Thẻ bài ma thuật mở khóa đặc quyền thực địa." },

    // LEGENDARY (28-30)
    { id: "BLESS_28", name: "Thẻ Nâng Cấp Phòng Riêng", tier: "legendary", iconClass: "ico-item-28", isBuff: false, desc: "Nâng cấp lều trại lên phòng riêng Glamping cao cấp." },
    { id: "BLESS_29", name: "Thẻ Lưu Trú Miễn Phí", tier: "legendary", iconClass: "ico-item-29", isBuff: false, desc: "01 đêm nghỉ dưỡng hoàn toàn miễn phí tại Rừng." },
    { id: "BLESS_30", name: "Trang Bị Nhà Phiêu Lưu", tier: "legendary", iconClass: "ico-item-30", isBuff: false, desc: "Bộ ba lô, áo khoác chuyên dụng dã ngoại cao cấp." }
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
            iconClass: item.iconClass, // Dùng class Data-URI
            tier: item.tier || "common",
            desc: item.desc || "",
            isBuff: item.isBuff,
            buff: item.buff || null,
            quantity: 1,
            qr_token: "QR_" + Math.random().toString(36).substring(2, 10).toUpperCase()
        });
    }
    saveUserData();
}

// ======================================================
// 5. GACHA CONTROLLER (KÍCH HOẠT TỪ NÚT BOTTOM ARC DOCK)
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

// Bấm nút tròn trung tâm trên Dock
dockGachaTrigger.addEventListener("click", () => {
    const isGachaViewActive = document.getElementById("gacha-view").classList.contains("active") && 
                              !document.getElementById("gacha-view").classList.contains("hidden");

    if (isGachaViewActive) {
        triggerGachaSummon();
    }
});

// POPUP RPG CHÚC PHÚC THAY THẾ ALERT
const blessingModal = document.getElementById("blessingModal");
function openBlessingModal(blessing, reasonText) {
    document.getElementById("blessTierTag").textContent = blessing.tier.toUpperCase();
    document.getElementById("blessTierTag").className = `blessing-tier-tag tier-${blessing.tier}`;
    // Render icon Data URI lớn
    document.getElementById("blessIconBox").innerHTML = `<i class="item-ico ${blessing.iconClass}" style="width:48px;height:48px;"></i>`;
    document.getElementById("blessTitle").textContent = blessing.name;
    document.getElementById("blessDesc").textContent = `${reasonText}\n${blessing.desc}`;
    blessingModal.classList.remove("hidden");
}
document.getElementById("btnCloseBlessingModal").addEventListener("click", () => {
    blessingModal.classList.add("hidden");
});

// THU THẬP VÀO TÚI -> BANNER 3S -> 3D FADE-IN 4S
claimBtn.addEventListener("click", () => {
    if (state !== STATE.LOOT) return;
    state = STATE.CLAIMED;
    stateStart = performance.now();

    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");

    if (currentUser.gacha_counter > 0) {
        currentUser.tinh_quang_points = Math.max(0, currentUser.tinh_quang_points - 1);
    }
    currentUser.gacha_counter++;

    // Lưu mã đá đã mở
    if (!currentUser.unlocked_gems.includes(currentGemResult.code)) {
        currentUser.unlocked_gems.push(currentGemResult.code);
    }

    // Logic Chúc phúc
    let wonBlessing = null;
    let blessReason = "";
    if (currentUser.gacha_counter === 1) {
        const freeTiers = [BLESSINGS_DATA[9], BLESSINGS_DATA[11], BLESSINGS_DATA[23], BLESSINGS_DATA[0]];
        wonBlessing = freeTiers[Math.floor(Math.random() * freeTiers.length)];
        addItemToInventory(wonBlessing);
        blessReason = "Chúc Phúc Tân Thủ dành cho lần đầu triệu hồi thành công!";
    } else if (isPrime(currentUser.gacha_counter)) {
        wonBlessing = getRandomBlessing();
        addItemToInventory(wonBlessing);
        blessReason = `Lượt GACHA thứ ${currentUser.gacha_counter}! Bạn nhận được `;
    }

    saveUserData();
    updateTopBarUI();
    renderInventoryGems();
    renderInventory5x5();

    // 1. Hiện thông báo giữa màn hình 3 giây
    collectBanner.classList.remove("hidden");
    setTimeout(() => {
        collectBanner.classList.add("hidden");

        // 2. Mở popup Chúc phúc nếu có
        if (wonBlessing) {
            openBlessingModal(wonBlessing, blessReason);
        }

        // 3. Fade in giao diện 3D trong 4 giây
        app3dCanvas.style.opacity = "0.2";
        setTimeout(() => {
            app3dCanvas.style.opacity = "1";
            state = STATE.IDLE;
        }, 100);

    }, 3000);
});

// ======================================================
// KHỐI CODE BỊ THIẾU: ĐIỀU KHIỂN BÃO HẠT VORTEX
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
            // Chỉ cho 25% lượng hạt (i % 4 === 0) bay lơ lửng gần viên ngọc
            // 75% còn lại tản rộng ra không gian nền xa để không che khuất khối đá
            const isNearGem = (i % 4 === 0);
            const orbitRadius = isNearGem ? (2.2 + p.random * 1.5) : (p.radius * 1.5);

            positions[i * 3]     = Math.cos(p.angle + elapsed * 0.25) * orbitRadius;
            positions[i * 3 + 1] = wanderY * (isNearGem ? 0.6 : 1.2);
            positions[i * 3 + 2] = Math.sin(p.angle + elapsed * 0.25) * orbitRadius;
        }
    }
    particleGeometry.attributes.position.needsUpdate = true;
}
// Three.js Loop Animations
function updateCore(elapsed, progress) {
    if (state === STATE.GACHA) {
        const appear = Math.max(0, (progress - 0.45) / 0.55);
        coreMaterial.opacity = appear;
        coreGlowMaterial.opacity = appear * 0.7;
        coreGroup.scale.setScalar(appear * (1 + Math.sin(elapsed * 12) * 0.05));
        
        // Lõi năng lượng bắt đầu rung nhẹ khi các hạt nén lại
        if (progress > 0.5) {
            coreGroup.position.x = (Math.random() - 0.5) * 0.02 * appear;
            coreGroup.position.y = (Math.random() - 0.5) * 0.02 * appear;
        }
    } else if (state === STATE.CORE) {
        coreMaterial.opacity = 1;
        coreGlowMaterial.opacity = 0.85;
        // Rung giật cực đại với tần số cao (60Hz)
        coreGroup.position.x = Math.sin(elapsed * 65) * 0.04;
        coreGroup.position.y = Math.cos(elapsed * 50) * 0.03;
        coreGroup.scale.setScalar(1 + Math.sin(elapsed * 16) * 0.12);
    }
}

function updateState(now) {
    const elapsed = (now - stateStart) / 1000;
    let shakeStrength = 0;

    // 1. Kiểm tra an toàn cả biến module lẫn biến window
    const fastGachaActive = (typeof isFastGachaEnabled !== "undefined" && isFastGachaEnabled) || window.isFastGachaEnabled;

    // Hỗ trợ Fast Gacha cho Admin: Bỏ qua chờ đợi, hiện đá ngay lập tức
    if (fastGachaActive && (state === STATE.GACHA || state === STATE.CORE)) {
        coreMaterial.opacity = 0;
        coreGlowMaterial.opacity = 0;
        coreGroup.scale.setScalar(0);
        coreGroup.position.set(0, 0, 0);
        
        state = STATE.LOOT;
        stateStart = now;
        lootText.classList.add("show");
        claimContainer.classList.remove("hidden");

        // Trả lại trạng thái background & camera chuẩn ngay khi bỏ qua animation
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
            
            // Đặt lại góc camera chuẩn 1 lần duy nhất khi đá bung ra (cho phép OrbitControls xoay tự do sau đó)
            camera.position.set(0, 1.2, 8);
            controls.target.set(0, 0.2, 0);
        }
     } else if (state === STATE.LOOT && lootBox) {
        updateParticles(elapsed, 0);
        lootBox.rotation.y += 0.008;
        lootBox.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);

        // THÊM 2 DÒNG NÀY: Thu nhỏ kích thước và giảm độ sáng để tôn vinh viên ngọc 3D
        particles.material.opacity = THREE.MathUtils.lerp(particles.material.opacity, 0.35, 0.05);
        particles.material.size = THREE.MathUtils.lerp(particles.material.size, 0.04, 0.05);
    } else if (state === STATE.CLAIMED && lootBox) {
        updateParticles(elapsed, 0);
        lootBox.position.y -= 0.04;
        lootBox.scale.multiplyScalar(0.94);
    }

    // Áp dụng rung giật: CHỈ can thiệp khi có rung chấn để KHÔNG làm kẹt OrbitControls
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
// 6. ĐIỀU HƯỚNG & NÚT TRỞ VỀ 🎐
// ======================================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

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

// Nút Trở về 🎐 & nút X đóng panel
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
// 7. INVENTORY: VẬT PHẨM LÊN ĐẦU & SẮP XẾP ĐÁ ĐÃ MỞ LÊN TRƯỚC
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

// ======================================================
// MINI THREE.JS PREVIEW (ĐÃ BỔ SUNG BLOOM GLOW & EDGES)
// ======================================================
let previewRenderer = null;
let previewComposer = null; // Thêm bộ hậu kỳ Bloom
let previewScene = null;
let previewCamera = null;
let previewControls = null;
let previewMesh = null;
let previewPointLight = null; // Đèn mang màu sắc viên đá
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

    // TÍCH HỢP EFFECT COMPOSER & UNREAL BLOOM CHO KHUNG PREVIEW
    previewComposer = new EffectComposer(previewRenderer);
    previewComposer.addPass(new RenderPass(previewScene, previewCamera));
    // Độ rực phát sáng (Bloom strength: 1.4)
    previewComposer.addPass(new UnrealBloomPass(new THREE.Vector2(170, 170), 1.4, 0.5, 0.1));
    previewComposer.addPass(new OutputPass());

    previewControls = new OrbitControls(previewCamera, previewRenderer.domElement);
    previewControls.enableZoom = false;
    previewControls.enablePan = false;
    previewControls.enableDamping = true;
    previewControls.dampingFactor = 0.08;

    // Hệ thống đèn tạo khối 3D
    previewScene.add(new THREE.AmbientLight(0x443366, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(4, 5, 3);
    previewScene.add(dirLight);

    // Đèn điểm phát sáng tâm cảnh
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

    // Xóa mô hình cũ
    if (previewMesh) {
        previewScene.remove(previewMesh);
        if (previewMesh.geometry) previewMesh.geometry.dispose();
        if (previewMesh.material) previewMesh.material.dispose();
        previewMesh = null;
    }

    // Tái tạo hình thái 3D viên đá
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

    // Cập nhật đèn tâm cảnh theo màu của viên đá
    if (gemData.isUnlocked) {
        previewPointLight.color.setHex(gemData.color);
        previewPointLight.intensity = 5.0;
    } else {
        previewPointLight.intensity = 0;
    }

    // Vật liệu đa giác phát quang
    const mat = new THREE.MeshStandardMaterial({
        color: gemData.isUnlocked ? gemData.color : 0x1a162b,
        emissive: gemData.isUnlocked ? gemData.emissive : 0x000000,
        emissiveIntensity: gemData.isUnlocked ? 0.45 : 0,
        roughness: gemData.isUnlocked ? 0.18 : 0.8,
        metalness: 0.35,
        flatShading: true,
        wireframe: !gemData.isUnlocked
    });

    previewMesh = new THREE.Mesh(geo, mat);

    // ĐƯỜNG VIỀN PHÁT SÁNG TRẮNG BẮT MẮT (CRYSTAL EDGES)
    const edgesGeometry = new THREE.EdgesGeometry(geo);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: gemData.isUnlocked ? 0.85 : 0.25
    });
    previewMesh.add(new THREE.LineSegments(edgesGeometry, edgesMaterial));
    previewScene.add(previewMesh);

    // Kích hoạt Render Loop qua Composer
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
        // RENDER QUA BỘ LỌC PHÁT SÁNG COMPOSER
        previewComposer.render();
    }
    loop();
}

document.getElementById("closeGemPreviewModal").addEventListener("click", () => {
    isPreviewActive = false; // Ngủ đông khi đóng modal để tiết kiệm pin
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
                    sysName: pal.name.split(" ")[0], // Lấy tên hệ ngắn
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

    // BẮT SỰ KIỆN CLICK VÀO TỪNG Ô ĐÁ
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

// Modal QR Item
const itemModal = document.getElementById("itemModal");
const qrcodeContainer = document.getElementById("qrcodeContainer");

function openItemModal(item, itemIndex) {
    itemModal.classList.remove("hidden");
    // Render icon Data URI cạnh tiêu đề modal
    document.getElementById("modalItemTitle").innerHTML = `<i class="item-ico ${item.iconClass}"></i> ${item.name}`;
    document.getElementById("modalItemDesc").textContent = item.desc || "Vật phẩm lưu trữ trong túi đồ.";
    qrcodeContainer.innerHTML = "";

    const btnUseBuff = document.getElementById("btnUseBuffItem");
    const noteText = document.getElementById("modalQrNote");

    if (item.isBuff) {
        qrcodeContainer.style.display = "none";
        btnUseBuff.classList.remove("hidden");
        noteText.textContent = "Nhấn [SỬ DỤNG NGAY] để cộng chỉ số trực tiếp vào tài khoản.";
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
        noteText.textContent = "Đưa mã QR cho Quản lý / NPC Hội Ngọc Lục để sử dụng offline.";
        
        new QRCode(qrcodeContainer, {
            text: JSON.stringify({ token: item.qr_token, user: currentUser.adventurer_code, item: item.name }),
            width: 110,
            height: 110,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }
}
document.getElementById("closeItemModal").addEventListener("click", () => itemModal.classList.add("hidden"));

// ======================================================
// 8. SHOP 2 CỘT & MODAL CHI TIẾT
// ======================================================
const SHOP_ITEMS = [
    { id: "PKG_1", name: "Gói Trải Nghiệm", tt: 22, vnd: 550000, iconClass: "ico-pkg", desc: "Mystery Box + 01 đêm lều trại lưu trú tiêu chuẩn + Buff hỗ trợ dịch chuyển Bảo Lộc - Rừng Tinh Linh." },
    { id: "PKG_2", name: "Gói Thư Giãn", tt: 32, vnd: 800000, iconClass: "ico-pkg", desc: "Trọn gói 3 bữa ăn (BBQ tối + Sáng + Trưa) + Lều trại lưu trú + Buff dịch chuyển." },
    { id: "PKG_3", name: "Gói Trọn Gói (Best)", tt: 64, vnd: 1600000, iconClass: "ico-pkg", desc: "Full trải nghiệm 2N1Đ + 3 Bữa ăn ẩm thực + Mở khóa toàn bộ 5 Main Quests Tinh Linh." },
    { id: "PKG_4", name: "Gói Săn Gacha", tt: 80, vnd: 2000000, iconClass: "ico-pkg", desc: "Full trải nghiệm 2N1Đ + 4 Tinh Thạch tự do + 1 Thẻ bài Tinh Linh + 1 Vé quay chợ." },
    { id: "Q_1", name: "Quest Phong Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest", desc: "Nhận nhiệm vụ tại bìa rừng cùng Ranger NPC hướng dẫn." },
    { id: "Q_2", name: "Quest Mộc Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest", desc: "Khám phá mật ngữ thực vật tại Đồi Cỏ Cây Thông." },
    { id: "Q_3", name: "Quest Hỏa Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest", desc: "Nhiệm vụ bên bếp lửa ma thuật tại Hội Ngọc Lục." },
    { id: "Q_4", name: "Quest Thủy Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest", desc: "Nhiệm vụ lội suối tìm kho báu cùng NPC." },
    { id: "Q_5", name: "Quest Thổ Tinh", tt: 8, vnd: 200000, iconClass: "ico-quest", desc: "Thử thách giao thương tại Phiên Chợ Tinh Linh." },
    { id: "F_1", name: "Tiệc BBQ Đêm", tt: 7, vnd: 175000, iconClass: "ico-food", desc: "Tiệc nướng thịt thơm lừng bên ánh lửa trại ấm cúng." },
    { id: "F_2", name: "Bữa Sáng Bên Suối", tt: 2, vnd: 50000, iconClass: "ico-food", desc: "Điểm tâm sáng trà bánh ngắm bình minh rừng già." },
    { id: "F_3", name: "Bữa Trưa Tại Chợ", tt: 2, vnd: 50000, iconClass: "ico-food", desc: "Bữa trưa đặc sản đậm phong vị bản địa." }
];

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
document.getElementById("closeShopDetailModal").addEventListener("click", () => shopDetailModal.classList.add("hidden"));

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
        alert("Vui lòng chạm chọn ít nhất 1 gói hoặc tiện ích!");
        return;
    }
    const phone = prompt("Nhập SĐT hoặc Zalo để Hội Ngọc Lục liên hệ xác nhận đơn:");
    if (!phone) return;

    alert("✦ Thông tin đơn hàng đã gửi tới Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.");
    selectedShopIds.clear();
    renderShop();
    updateShopCheckout();
});

// ======================================================
// 9. NHIỆM VỤ PIN-BOARD & QUIZ MẬT MÃ RỪNG TINH LINH
// ======================================================
document.getElementById("btnDoCheckin").addEventListener("click", () => {
    currentUser.tinh_quang_points += 1;
    saveUserData();
    updateTopBarUI();
    alert("✦ Điểm danh thành công! Nhận +1 🔮 Tinh Quang.");
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

// QUIZ 10 CÂU HỎI MẬT MÃ
const QUIZ_LIST = [
    { q: "Hội Ngọc Lục nằm ở vùng đất rừng nào?", a: ["Bảo Lộc", "Đà Lạt", "Sa Pa", "Cát Bà"], c: 0 },
    { q: "Biến thể Tinh Quang Thạch có bao nhiêu bậc số mặt?", a: ["11 bậc", "6 bậc", "3 bậc", "30 bậc"], c: 0 },
    { q: "Hệ đá nào đại diện cho Hỏa Diệm & Huyết Tinh?", a: ["🔥 Hệ 1", "☀️ Hệ 2", "❄️ Hệ 4", "⚡ Hệ 5"], c: 0 }
];
let currentQuizIdx = 0;
const quizModal = document.getElementById("quizModal");

document.getElementById("btnOpenQuiz").addEventListener("click", () => {
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
document.getElementById("closeQuizModal").addEventListener("click", () => quizModal.classList.add("hidden"));

// ======================================================
// 10. ADMIN GOD-MODE (CHẠM 5 LẦN LOGO)
// ======================================================
let logoClicks = 0;
let logoTimer = null;
const adminLogo = document.getElementById("adminTriggerLogo");
const adminModal = document.getElementById("adminGodModal");

adminLogo.addEventListener("pointerdown", () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);

    if (logoClicks >= 5) {
        logoClicks = 0;
        adminModal.classList.remove("hidden");
    }
});
document.getElementById("closeAdminModal").addEventListener("click", () => adminModal.classList.add("hidden"));

document.getElementById("admAddTQ").addEventListener("click", () => {
    currentUser.tinh_quang_points += 99;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: +99 🔮");
});
document.getElementById("admAddTT").addEventListener("click", () => {
    currentUser.tinh_thach_points += 99;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: +99 💎");
});
document.getElementById("admAddCH").addEventListener("click", () => {
    currentUser.cong_hien_points += 100;
    saveUserData();
    updateTopBarUI();
    alert("⚡ Admin: +100 🛡️");
});
document.getElementById("admUnlockAllGems").addEventListener("click", () => {
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
document.getElementById("admAddAllItems").addEventListener("click", () => {
    BLESSINGS_DATA.forEach(b => addItemToInventory(b));
    saveUserData();
    renderInventory5x5();
    alert("⚡ Admin: Đã thêm đủ 30 Chúc Phúc vào túi!");
});
document.getElementById("admResetData").addEventListener("click", () => {
    if (confirm("Reset về Tân Thủ?")) {
        localStorage.removeItem("advenature_user");
        location.reload();
    }
});

// KHỞI ĐỘNG HỆ THỐNG
updateTopBarUI();
renderInventoryGems();
renderInventory5x5();
renderShop();

new QRCode(document.getElementById("userProfileQr"), {
    text: `ADVENATURE_USER:${currentUser.adventurer_code}`,
    width: 100,
    height: 100
});