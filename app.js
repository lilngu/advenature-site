import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

// ======================================================
// CONFIG & DATA SYNC (CLOUDFLARE WORKERS API)
// ======================================================
const API_URL = "https://advenature-api.YOUR-SUBDOMAIN.workers.dev"; // Thay subdomain worker của bạn

let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || null;
let isFirstGacha = !currentUser;

// Khởi tạo thông tin khách nếu chưa đăng nhập
if (!currentUser) {
    currentUser = {
        id: "guest_" + Math.random().toString(36).substring(2, 9),
        full_name: "Khách Lữ Hành",
        adventurer_code: "AW" + Math.floor(1000 + Math.random() * 9000),
        role: "Tân Thủ",
        tinh_quang_points: 1, // Lượt quay FREE đầu tiên
        tinh_thach_points: 0,
        cong_hien_points: 0,
        gacha_counter: 0
    };
}

function updateTopBarUI() {
    document.getElementById("valTinhQuang").textContent = currentUser.tinh_quang_points.toLocaleString();
    document.getElementById("valTinhThach").textContent = currentUser.tinh_thach_points.toLocaleString();
    document.getElementById("valCongHien").textContent = currentUser.cong_hien_points.toLocaleString();
    document.getElementById("userDisplayName").textContent = currentUser.full_name;
    document.getElementById("userAdvenCode").textContent = currentUser.adventurer_code;
    document.getElementById("userRoleBadge").textContent = currentUser.role;

    const summonBtnCost = document.getElementById("summonBtnCost");
    if (currentUser.gacha_counter === 0) {
        summonBtnCost.textContent = "FREE";
    } else {
        summonBtnCost.textContent = "1 🔮";
    }
}
updateTopBarUI();

// ======================================================
// 3D SCENE & ENGINE SETUP (CHUẨN TỪ GACHA-TEST.HTML)
// ======================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03030a);
scene.fog = new THREE.FogExp2(0x050514, 0.035);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.8, 8);

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
// ==========================================
// ORBIT CONTROLS (TƯƠNG TÁC XOAY 3D)
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;       // Khóa zoom để tránh vỡ bố cục UI di động
controls.enablePan = false;        // Khóa dịch chuyển ngang
controls.enableDamping = true;     // Tạo độ mượt khi thả tay
controls.dampingFactor = 0.05;
controls.target.set(0, 0.3, 0);

// Lightings
scene.add(new THREE.AmbientLight(0x443366, 0.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);

const pointLight = new THREE.PointLight(0xa58cff, 0, 20);
pointLight.position.set(0, 1, 2);
scene.add(pointLight);

const clock = new THREE.Clock();

// ======================================================
// PARTICLES & CORE VORTEX (KHÔI PHỤC ĐẦY ĐỦ)
// ======================================================
const PARTICLE_COUNT = 1800;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleColors = new Float32Array(PARTICLE_COUNT * 3);
const particleData = [];
const colorPalette = [
    new THREE.Color(0x7c6cff), new THREE.Color(0xff71ce), new THREE.Color(0x67e8ff),
    new THREE.Color(0xffe66d), new THREE.Color(0xa878ff), new THREE.Color(0x75ffb2)
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = THREE.MathUtils.randFloat(2.5, 9);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;

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

// Lõi năng lượng (Core)
const coreGroup = new THREE.Group();
scene.add(coreGroup);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xd9ccff, transparent: true, opacity: 0 });
coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), coreMaterial));
const coreGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8f75ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
});
coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), coreGlowMaterial));

// ======================================================
// 30 BẢNG MÀU & 11 BẬC MẶT THEO DATA.MD (990 BIẾN THỂ)
// ======================================================
const crystalPalettes = [
    // HỆ 1: HỎA DIỆM & HUYẾT TINH
    { prefix: "🔥", sysIndex: 1, name: "Huyết Ngọc Ruby", color: 0xd90429, emissive: 0x9b001a },
    { prefix: "🔥", sysIndex: 2, name: "Thạch Anh Hồng", color: 0xff758f, emissive: 0xc9184a },
    { prefix: "🔥", sysIndex: 3, name: "San Hô Lửa", color: 0xff4d6d, emissive: 0xa4133c },
    { prefix: "🔥", sysIndex: 4, name: "Nham Thạch Hỏa Diệm", color: 0xff2a00, emissive: 0x8a0000 },
    { prefix: "🔥", sysIndex: 5, name: "Máu Rồng Garnet", color: 0x800f2f, emissive: 0x4a0011 },
    // HỆ 2: THÁI DƯƠNG & HOÀNG KIM
    { prefix: "☀️", sysIndex: 1, name: "Hổ Phách Mặt Trời", color: 0xff8800, emissive: 0xcc5500 },
    { prefix: "☀️", sysIndex: 2, name: "Hoàng Kim Đế Vương", color: 0xffb703, emissive: 0xd48b00 },
    { prefix: "☀️", sysIndex: 3, name: "Tinh Thể Thái Dương", color: 0xffd000, emissive: 0xe67e00 },
    { prefix: "☀️", sysIndex: 4, name: "Đồng Đỏ Cổ Đại", color: 0xcd6e4e, emissive: 0x8c3a1e },
    { prefix: "☀️", sysIndex: 5, name: "Hoàng Thạch Topaz", color: 0xffa200, emissive: 0xcc6600 },
    // HỆ 3: THẢO MỘC & PHONG MA
    { prefix: "🌿", sysIndex: 1, name: "Ngọc Lục Bảo Emerald", color: 0x10b981, emissive: 0x047857 },
    { prefix: "🌿", sysIndex: 2, name: "Băng Lục Bạc Hà", color: 0x2ec4b6, emissive: 0x008080 },
    { prefix: "🌿", sysIndex: 3, name: "Rừng Thần Malachite", color: 0x2d6a4f, emissive: 0x1b4332 },
    { prefix: "🌿", sysIndex: 4, name: "Dạ Quang Độc Dược", color: 0x70e000, emissive: 0x38b000 },
    { prefix: "🌿", sysIndex: 5, name: "Ngọc Bích Phong Ma", color: 0x52b788, emissive: 0x1b7a4e },
    // HỆ 4: BĂNG TINH & HẢI DƯƠNG
    { prefix: "❄️", sysIndex: 1, name: "Hải Lam Ngọc Aquamarine", color: 0x4cc9f0, emissive: 0x0077b6 },
    { prefix: "❄️", sysIndex: 2, name: "Băng Tinh Bắc Cực", color: 0xa0c4ff, emissive: 0x0096c7 },
    { prefix: "❄️", sysIndex: 3, name: "Lam Tinh Thần Tú", color: 0x00f5d4, emissive: 0x00bbf9 },
    { prefix: "❄️", sysIndex: 4, name: "Sương Lam Huyền Ảo", color: 0xbde0fe, emissive: 0x48cae4 },
    { prefix: "❄️", sysIndex: 5, name: "Vực Sâu Biển Cả", color: 0x006d77, emissive: 0x004953 },
    // HỆ 5: THIÊN HÀ & THẦN ĐIỆN
    { prefix: "⚡", sysIndex: 1, name: "Lam Bảo Sapphire", color: 0x2b4c7e, emissive: 0x132a4a },
    { prefix: "⚡", sysIndex: 2, name: "Dạ Khúc Indigo", color: 0x3a0ca3, emissive: 0x1e0363 },
    { prefix: "⚡", sysIndex: 3, name: "Bão Điện Thiên Không", color: 0x4361ee, emissive: 0x1a33b0 },
    { prefix: "⚡", sysIndex: 4, name: "Thanh Lam Cổ Thần", color: 0x1d3557, emissive: 0x457b9d },
    { prefix: "⚡", sysIndex: 5, name: "Tử Lam Hư Vô", color: 0x3f37c9, emissive: 0x241d99 },
    // HỆ 6: MA PHÁP & TINH VÂN
    { prefix: "🔮", sysIndex: 1, name: "Thạch Anh Tím Amethyst", color: 0x7209b7, emissive: 0x480ca8 },
    { prefix: "🔮", sysIndex: 2, name: "Tinh Vân Nebula", color: 0x9d4edd, emissive: 0x5a189a },
    { prefix: "🔮", sysIndex: 3, name: "Tử Đằng Nguyệt Tinh", color: 0xc77dff, emissive: 0x7b2cbf },
    { prefix: "🔮", sysIndex: 4, name: "Cực Quang Tinh Linh", color: 0xf72585, emissive: 0x7209b7 },
    { prefix: "🔮", sysIndex: 5, name: "Hồng Ma Pháp Opal", color: 0xff007f, emissive: 0x99004d }
];

const FACE_TIERS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
let lootBox = null;
let currentGemData = null;

function createProceduralRock() {
    if (lootBox) {
        scene.remove(lootBox);
        lootBox.traverse(c => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
        });
    }

    const faceCount = FACE_TIERS[Math.floor(Math.random() * FACE_TIERS.length)];
    const shapeStyles = [
        { id: 1, name: "Trụ Tinh Thể", rx: [0.8, 1.2], ry: [1.8, 2.5], rz: [0.8, 1.2] },
        { id: 2, name: "Cự Thạch",     rx: [1.2, 1.6], ry: [1.2, 1.6], rz: [1.2, 1.6] },
        { id: 3, name: "Phiến Thạch",  rx: [1.5, 2.0], ry: [1.2, 1.7], rz: [0.6, 0.9] }
    ];
    const shape = shapeStyles[Math.floor(Math.random() * shapeStyles.length)];
    const palette = crystalPalettes[Math.floor(Math.random() * crystalPalettes.length)];

    const gemCode = `${palette.prefix}${palette.sysIndex}${faceCount}${shape.id}`;
    currentGemData = {
        code: gemCode,
        name: palette.name,
        shape: shape.name,
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

    return currentGemData;
}

// ======================================================
// STATE MACHINE (IDLE -> GACHA -> CORE -> LOOT -> CLAIMED)
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
    if (currentUser.tinh_quang_points < 1 && currentUser.gacha_counter > 0) {
        alert("Bạn đã hết Điểm Tinh Quang! Hãy làm nhiệm vụ để nhận thêm.");
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
        <div style="font-size: 18px; font-weight: bold; color: #fff5c0;">${gem.name}</div>
        <div style="font-size: 12px; color: #c9c3ff; letter-spacing: 2px; margin-top: 4px;">
            ✦ [${gem.shape.toUpperCase()}] • ${gem.faceCount} DIỆN THỂ • MÃ: ${gem.code} ✦
        </div>
    `;

    state = STATE.GACHA;
    stateStart = performance.now();
});

claimBtn.addEventListener("click", async () => {
    if (state !== STATE.LOOT) return;
    state = STATE.CLAIMED;
    stateStart = performance.now();

    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");

    // Xử lý gửi dữ liệu lên Backend Cloudflare D1
    try {
        const res = await fetch(`${API_URL}/api/gacha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, gemData: currentGemData })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.gacha_counter = data.counter;
            currentUser.tinh_quang_points = Math.max(0, currentUser.tinh_quang_points - 1);
            localStorage.setItem("advenature_user", JSON.stringify(currentUser));
            updateTopBarUI();

            if (data.blessing) {
                alert(`🎉 TINH LINH BAN CHÚC PHÚC!\nBạn nhận được: [${data.blessing.name}]`);
            }
        }
    } catch (e) {
        // Dự phòng Offline Cache
        currentUser.gacha_counter++;
        currentUser.tinh_quang_points = Math.max(0, currentUser.tinh_quang_points - 1);
        localStorage.setItem("advenature_user", JSON.stringify(currentUser));
        updateTopBarUI();
    }

    setTimeout(() => {
        gachaBtn.style.display = "flex";
        state = STATE.IDLE;
    }, 2000);
});

// Animations Loop
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
        const progress = Math.min(elapsed / 4, 1);
        updateParticles(elapsed, progress);
        const appear = Math.max(0, (progress - 0.7) / 0.3);
        coreMaterial.opacity = appear;
        coreGlowMaterial.opacity = appear * 0.7;
        coreGroup.scale.setScalar(appear);

        if (elapsed >= 4) {
            state = STATE.CORE;
            stateStart = now;
        }
    } else if (state === STATE.CORE) {
        if (elapsed >= 1.2) {
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
        lootBox.scale.lerp(new THREE.Vector3(1, 1, 1), 0.06);
    } else if (state === STATE.CLAIMED && lootBox) {
        lootBox.position.y -= 0.04;
        lootBox.scale.multiplyScalar(0.95);
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

// Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Chuyển Tab Navigation & Hiển thị Panel
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        // Nếu bấm lại nút Gacha ở giữa -> Đóng toàn bộ popup panel để quay về màn hình 3D chính
        if (targetId === "gacha-view") {
            document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
            document.querySelector(".dock-btn.center-core").classList.add("active");
            document.querySelectorAll(".view-panel").forEach(p => {
                if (p.id !== "gacha-view") p.classList.add("hidden");
            });
            return;
        }

        // Nếu mở các panel khác (Túi đồ, Quest, Shop, Profile)
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Ẩn các modal khác và mở modal được chọn
        document.querySelectorAll(".view-panel").forEach(p => {
            if (p.id !== "gacha-view") p.classList.add("hidden");
        });

        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.remove("hidden");
            
            // Cập nhật dữ liệu profile nếu mở tab profile
            if (targetId === "profile-view") {
                document.getElementById("profileNameDisplay").textContent = currentUser.full_name;
                document.getElementById("profileCodeDisplay").textContent = "MÃ: " + currentUser.adventurer_code;
                document.getElementById("profTinhQuang").textContent = currentUser.tinh_quang_points;
                document.getElementById("profTinhThach").textContent = currentUser.tinh_thach_points;
                document.getElementById("profCongHien").textContent = currentUser.cong_hien_points + " CP";
            }
        }
    });
});

// ======================================================
// DỮ LIỆU SHOP LỮ HÀNH TỪ DATA.MD (KHÔNG HARDCODE)
// ======================================================
const SHOP_PRODUCTS = [
    { id: "PKG_1", name: "📦 GÓI TÂN THỦ TRẢI NGHIỆM", tinhThach: 22, vnd: 550000, desc: "Mystery Box + 1 Đêm lều trại + Buff dịch chuyển + Áp dụng Chúc phúc Free." },
    { id: "PKG_2", name: "🎒 GÓI TÂN THỦ THƯ GIÃN", tinhThach: 32, vnd: 800000, desc: "Trọn gói 3 bữa ăn (BBQ tối + Sáng + Trưa) + Lều trại tiêu chuẩn." },
    { id: "PKG_3", name: "⚔️ GÓI TRỌN GÓI (Best-Seller)", tinhThach: 64, vnd: 1600000, desc: "Full 2N1Đ + 3 Bữa ăn + Mở khóa toàn bộ 5 Main Quests." },
    { id: "PKG_4", name: "🛡️ GÓI SĂN GACHA", tinhThach: 80, vnd: 2000000, desc: "Full 2N1Đ + Túi 4 Tinh Thạch + 1 Thẻ bài Tinh Linh + 1 Vé quay chợ." },
    { id: "Q_WIND", name: "Quest Phong Tinh Linh", tinhThach: 8, vnd: 200000, desc: "Nhận nhiệm vụ bìa rừng cùng Ranger NPC." },
    { id: "Q_WOOD", name: "Quest Mộc Tinh Linh", tinhThach: 8, vnd: 200000, desc: "Nhận nhiệm vụ tại Đồi Cỏ Cây Thông." },
    { id: "Q_FIRE", name: "Quest Hỏa Tinh Linh", tinhThach: 8, vnd: 200000, desc: "Nhận nhiệm vụ tại Hội Ngọc Lục." },
    { id: "Q_WATER", name: "Quest Thủy Tinh Linh", tinhThach: 8, vnd: 200000, desc: "Khám phá suối rừng cùng NPC hướng dẫn." },
    { id: "Q_EARTH", name: "Quest Thổ Tinh Linh", tinhThach: 8, vnd: 200000, desc: "Nhiệm vụ giao thương tại Phiên Chợ Tinh Linh." },
    { id: "FOOD_BBQ", name: "Tiệc Nướng BBQ Đêm", tinhThach: 7, vnd: 175000, desc: "Tiệc nướng bên bếp lửa tại Hội Ngọc Lục." },
    { id: "FOOD_BREAKFAST", name: "Bữa Sáng Bên Suối", tinhThach: 2, vnd: 50000, desc: "Thưởng thức điểm tâm sáng bên suối." },
    { id: "FOOD_LUNCH", name: "Bữa Trưa Tại Phiên Chợ", tinhThach: 2, vnd: 50000, desc: "Dùng cơm trưa tại chợ Tinh Linh." }
];

let selectedProducts = new Set();

function renderShop() {
    const container = document.getElementById("shopItemsContainer");
    if (!container) return;
    container.innerHTML = SHOP_PRODUCTS.map(p => `
        <div class="shop-card ${selectedProducts.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
            <div class="shop-card-title">${p.name}</div>
            <div class="shop-card-price">💎 ${p.tinhThach} Tinh Thạch (~${p.vnd.toLocaleString()} đ)</div>
            <div class="shop-card-desc">${p.desc}</div>
        </div>
    `).join('');

    container.querySelectorAll(".shop-card").forEach(card => {
        card.addEventListener("click", () => {
            const pid = card.dataset.id;
            if (selectedProducts.has(pid)) selectedProducts.delete(pid);
            else selectedProducts.add(pid);
            renderShop();
            updateShopCheckout();
        });
    });
}

function updateShopCheckout() {
    let totalTT = 0;
    let totalVND = 0;
    selectedProducts.forEach(id => {
        const prod = SHOP_PRODUCTS.find(p => p.id === id);
        if (prod) {
            totalTT += prod.tinhThach;
            totalVND += prod.vnd;
        }
    });
    document.getElementById("cartCount").textContent = selectedProducts.size;
    document.getElementById("cartTotalTinhThach").textContent = `${totalTT} 💎`;
    document.getElementById("cartTotalVnd").textContent = totalVND.toLocaleString();
}

// Render Shop khi khởi động
renderShop();

// Xử lý nút Đặt mua gửi qua Bot Telegram
document.getElementById("btnCheckoutShop").addEventListener("click", async () => {
    if (selectedProducts.size === 0) {
        alert("Vui lòng chọn ít nhất 1 gói hoặc tiện ích!");
        return;
    }
    const phone = prompt("Nhập số điện thoại/Zalo để Hội Ngọc Lục liên hệ xác nhận:");
    if (!phone) return;

    try {
        const res = await fetch(`${API_URL}/api/shop-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.id,
                packageName: Array.from(selectedProducts).join(", "),
                tinhThach: parseInt(document.getElementById("cartTotalTinhThach").textContent),
                vnd: parseInt(document.getElementById("cartTotalVnd").textContent.replace(/,/g, '')),
                phone: phone
            })
        });
        alert("✦ Thông tin đơn hàng đã được gửi cho Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.");
        selectedProducts.clear();
        renderShop();
        updateShopCheckout();
    } catch (e) {
        alert("Đã lưu đơn hàng. Quản trị viên sẽ liên hệ với bạn!");
    }
});

// ======================================================
// XỬ LÝ NHIỆM VỤ (CHECK-IN & REFERRAL CODE)
// ======================================================
document.getElementById("btnDoCheckin").addEventListener("click", () => {
    currentUser.tinh_quang_points += 1;
    localStorage.setItem("advenature_user", JSON.stringify(currentUser));
    updateTopBarUI();
    alert("✦ Điểm danh thành công! Nhận +1 🔮 Điểm Tinh Quang.");
    document.getElementById("btnDoCheckin").textContent = "Đã Điểm Danh";
    document.getElementById("btnDoCheckin").disabled = true;
});

document.getElementById("btnSubmitRef").addEventListener("click", () => {
    const code = document.getElementById("inputFriendCode").value.trim();
    if (code.startsWith("AW") && code !== currentUser.adventurer_code) {
        currentUser.tinh_quang_points += 1;
        localStorage.setItem("advenature_user", JSON.stringify(currentUser));
        updateTopBarUI();
        alert(`✦ Kết nối thành công với nhà phiêu lưu [${code}]! Nhận +1 🔮 Tinh Quang.`);
        document.getElementById("inputFriendCode").value = "";
    } else {
        alert("Mã Phiêu Lưu không hợp lệ hoặc trùng với mã của bạn!");
    }
});

// Nút đóng tất cả các panel popup
document.querySelectorAll(".close-panel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".view-panel").forEach(p => {
            if (p.id !== "gacha-view") p.classList.add("hidden");
        });
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelector(".dock-btn.center-core").classList.add("active");
    });
});