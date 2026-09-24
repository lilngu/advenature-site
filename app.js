import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

const API_URL = "https://advenature-api.YOUR-SUBDOMAIN.workers.dev";

// --- QUẢN LÝ DỮ LIỆU USER THỰC TẾ ---
let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || {
    id: "user_" + Math.floor(1000 + Math.random() * 9000),
    full_name: "Nhà Phiêu Lưu",
    adventurer_code: "AW" + Math.floor(1000 + Math.random() * 9000),
    tinh_quang_points: 1, // 1 lượt quay miễn phí ban đầu
    tinh_thach_points: 0,
    cong_hien_points: 0,
    gacha_counter: 0
};

// Cập nhật Topbar UI
function updateTopBarUI() {
    document.getElementById("valTinhQuang").innerText = currentUser.tinh_quang_points.toLocaleString();
    document.getElementById("valTinhThach").innerText = currentUser.tinh_thach_points.toLocaleString();
    document.getElementById("userDisplayName").innerText = currentUser.full_name;
    document.getElementById("userAdvCode").innerText = currentUser.adventurer_code;
    localStorage.setItem("advenature_user", JSON.stringify(currentUser));
}
updateTopBarUI();

// ==========================================
// 1. THIẾT LẬP NAVIGATION SPA
// ==========================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        if (!targetId) return;

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (targetId === "gacha-view") {
            viewPanels.forEach(p => p.classList.add("hidden"));
            document.getElementById("gacha-view").classList.remove("hidden");
            document.getElementById("gacha-view").classList.add("active");
        } else {
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.remove("hidden");
        }
    });
});

// Chuyển Tab trong Inventory
const invTabs = document.querySelectorAll(".inv-tab-btn");
invTabs.forEach(btn => {
    btn.addEventListener("click", () => {
        invTabs.forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".inv-content").forEach(c => c.classList.add("hidden"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.sub).classList.remove("hidden");
    });
});

// ==========================================
// 2. SCENE 3D, BỆ ĐÁ & HẠT SÁNG VORTEX
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03030a);
scene.fog = new THREE.FogExp2(0x050514, 0.035);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.9, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById("app-3d").appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.1, 0.5, 0.1));
composer.addPass(new OutputPass());

// Ánh sáng tạo khối
scene.add(new THREE.AmbientLight(0x443366, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 7, 4);
scene.add(keyLight);

const pointLight = new THREE.PointLight(0xa58cff, 2.0, 15);
pointLight.position.set(0, 1, 2);
scene.add(pointLight);

// --- BỆ ĐÁ MA PHÁP (ALTAR PEDESTAL) ---
const altarGroup = new THREE.Group();
const baseGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.4, 32);
const altarMat = new THREE.MeshStandardMaterial({ color: 0x16182e, roughness: 0.8, metalness: 0.2 });
const altarBase = new THREE.Mesh(baseGeo, altarMat);
altarBase.position.y = -1.2;
altarGroup.add(altarBase);

const ringGeo = new THREE.RingGeometry(1.2, 1.9, 32);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x5c7cfa, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
const runeRing = new THREE.Mesh(ringGeo, ringMat);
runeRing.rotation.x = -Math.PI / 2;
runeRing.position.y = -0.99;
altarGroup.add(runeRing);
scene.add(altarGroup);

// --- HẠT SÁNG VORTEX (1000 HẠT) ---
const PARTICLE_COUNT = 1000;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleData = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = THREE.MathUtils.randFloat(1.5, 6);
    const theta = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.randFloat(-1.0, 3.5);

    particlePositions[i * 3] = Math.cos(theta) * radius;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = Math.sin(theta) * radius;

    particleData.push({ radius, angle: theta, speed: THREE.MathUtils.randFloat(0.5, 1.5), y });
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    size: 0.05, color: 0xa58cff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
}));
scene.add(particles);

// ==========================================
// 3. LOGIC 30 BẢNG MÀU & 990 BIẾN THỂ CHUẨN
// ==========================================
const crystalPalettes = [
    { prefix: "🔥", sysIndex: 1, name: "Huyết Ngọc Ruby", color: 0xd90429, emissive: 0x9b001a },
    { prefix: "🔥", sysIndex: 2, name: "Thạch Anh Hồng", color: 0xff758f, emissive: 0xc9184a },
    { prefix: "🔥", sysIndex: 3, name: "San Hô Lửa", color: 0xff4d6d, emissive: 0xa4133c },
    { prefix: "🔥", sysIndex: 4, name: "Nham Thạch Hỏa Diệm", color: 0xff2a00, emissive: 0x8a0000 },
    { prefix: "🔥", sysIndex: 5, name: "Máu Rồng Garnet", color: 0x800f2f, emissive: 0x4a0011 },
    { prefix: "☀️", sysIndex: 1, name: "Hổ Phách Mặt Trời", color: 0xff8800, emissive: 0xcc5500 },
    { prefix: "☀️", sysIndex: 2, name: "Hoàng Kim Đế Vương", color: 0xffb703, emissive: 0xd48b00 },
    { prefix: "☀️", sysIndex: 3, name: "Tinh Thể Thái Dương", color: 0xffd000, emissive: 0xe67e00 },
    { prefix: "☀️", sysIndex: 4, name: "Đồng Đỏ Cổ Đại", color: 0xcd6e4e, emissive: 0x8c3a1e },
    { prefix: "☀️", sysIndex: 5, name: "Hoàng Thạch Topaz", color: 0xffa200, emissive: 0xcc6600 },
    { prefix: "🌿", sysIndex: 1, name: "Ngọc Lục Bảo Emerald", color: 0x10b981, emissive: 0x047857 },
    { prefix: "🌿", sysIndex: 2, name: "Băng Lục Bạc Hà", color: 0x2ec4b6, emissive: 0x008080 },
    { prefix: "🌿", sysIndex: 3, name: "Rừng Thần Malachite", color: 0x2d6a4f, emissive: 0x1b4332 },
    { prefix: "🌿", sysIndex: 4, name: "Dạ Quang Độc Dược", color: 0x70e000, emissive: 0x38b000 },
    { prefix: "🌿", sysIndex: 5, name: "Ngọc Bích Phong Ma", color: 0x52b788, emissive: 0x1b7a4e },
    { prefix: "❄️", sysIndex: 1, name: "Hải Lam Ngọc Aquamarine", color: 0x4cc9f0, emissive: 0x0077b6 },
    { prefix: "❄️", sysIndex: 2, name: "Băng Tinh Bắc Cực", color: 0xa0c4ff, emissive: 0x0096c7 },
    { prefix: "❄️", sysIndex: 3, name: "Lam Tinh Thần Tú", color: 0x00f5d4, emissive: 0x00bbf9 },
    { prefix: "❄️", sysIndex: 4, name: "Sương Lam Huyền Ảo", color: 0xbde0fe, emissive: 0x48cae4 },
    { prefix: "❄️", sysIndex: 5, name: "Vực Sâu Biển Cả", color: 0x006d77, emissive: 0x004953 },
    { prefix: "⚡", sysIndex: 1, name: "Lam Bảo Sapphire", color: 0x2b4c7e, emissive: 0x132a4a },
    { prefix: "⚡", sysIndex: 2, name: "Dạ Khúc Indigo", color: 0x3a0ca3, emissive: 0x1e0363 },
    { prefix: "⚡", sysIndex: 3, name: "Bão Điện Thiên Không", color: 0x4361ee, emissive: 0x1a33b0 },
    { prefix: "⚡", sysIndex: 4, name: "Thanh Lam Cổ Thần", color: 0x1d3557, emissive: 0x457b9d },
    { prefix: "⚡", sysIndex: 5, name: "Tử Lam Hư Vô", color: 0x3f37c9, emissive: 0x241d99 },
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
    if (lootBox) scene.remove(lootBox);

    const faceCount = FACE_TIERS[Math.floor(Math.random() * FACE_TIERS.length)];
    const shapeStyles = [
        { id: 1, name: "Trụ Tinh Thể", rx: 0.9, ry: 2.1, rz: 0.9 },
        { id: 2, name: "Cự Thạch",     rx: 1.4, ry: 1.4, rz: 1.4 },
        { id: 3, name: "Phiến Thạch",  rx: 1.7, ry: 1.4, rz: 0.7 }
    ];
    const shape = shapeStyles[Math.floor(Math.random() * shapeStyles.length)];
    const palette = crystalPalettes[Math.floor(Math.random() * crystalPalettes.length)];

    const gemCode = `${palette.prefix}${palette.sysIndex}${faceCount}${shape.id}`;
    currentGemData = { code: gemCode, name: palette.name, shape: shape.name, faceCount: faceCount };

    const points = [];
    for (let i = 0; i < faceCount; i++) {
        const y = 1 - (i / (faceCount - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = Math.PI * (Math.sqrt(5) - 1) * i;
        points.push(new THREE.Vector3(
            Math.cos(theta) * radiusAtY * shape.rx,
            y * shape.ry + 0.3, // Nâng cao vừa vặn trên bệ
            Math.sin(theta) * radiusAtY * shape.rz
        ));
    }

    const geometry = new ConvexGeometry(points);
    const material = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: 0.45,
        roughness: 0.15,
        metalness: 0.25,
        flatShading: true
    });

    lootBox = new THREE.Mesh(geometry, material);
    lootBox.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));
    scene.add(lootBox);

    return currentGemData;
}

// ==========================================
// 4. LUỒNG TRIỆU HỒI (GACHA EVENT)
// ==========================================
const gachaBtn = document.getElementById("gachaButton");
const lootText = document.getElementById("lootText");
const claimContainer = document.getElementById("claimContainer");
const claimBtn = document.getElementById("claimButton");
const crystalHeader = document.getElementById("crystalNameHeader");

gachaBtn.addEventListener("click", () => {
    if (currentUser.tinh_quang_points < 1) {
        alert("Bạn đã hết Điểm Tinh Quang! Hãy làm nhiệm vụ để nhận thêm.");
        return;
    }

    // Trừ điểm ngay
    currentUser.tinh_quang_points -= 1;
    currentUser.gacha_counter += 1;
    updateTopBarUI();

    gachaBtn.classList.add("hidden");
    const gem = createProceduralRock();

    crystalHeader.innerText = gem.name.toUpperCase();
    lootText.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; color: #fff4c4;">${gem.name}</div>
        <div style="font-size: 12px; color: #c9c3ff; margin-top: 4px;">
            MÃ: [${gem.code}] • ${gem.shape.toUpperCase()} • ${gem.faceCount} MẶT
        </div>
    `;
    lootText.classList.add("show");
    claimContainer.classList.remove("hidden");
});

claimBtn.addEventListener("click", async () => {
    claimContainer.classList.add("hidden");
    lootText.classList.remove("show");
    gachaBtn.classList.remove("hidden");
    crystalHeader.innerText = "KHOÁNG THẠCH TINH NGUYÊN";

    // Lưu vào bộ nhớ cục bộ
    let myGems = JSON.parse(localStorage.getItem("advenature_gems")) || [];
    if (!myGems.find(g => g.code === currentGemData.code)) {
        myGems.push(currentGemData);
        localStorage.setItem("advenature_gems", JSON.stringify(myGems));
    }

    // Gửi đồng bộ lên Cloudflare D1
    try {
        await fetch(`${API_URL}/api/gacha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, gemData: currentGemData })
        });
    } catch (e) {
        console.log("Offline mode - đã ghi nhận vào LocalStorage.");
    }
});

// Render Loop
function animate() {
    requestAnimationFrame(animate);

    // Xoay bệ ma pháp & đá
    runeRing.rotation.z += 0.005;
    if (lootBox) {
        lootBox.rotation.y += 0.008;
    }

    // Cập nhật hạt bụi sao
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleData[i];
        p.angle += p.speed * 0.01;
        pos[i * 3] = Math.cos(p.angle) * p.radius;
        pos[i * 3 + 2] = Math.sin(p.angle) * p.radius;
    }
    particleGeo.attributes.position.needsUpdate = true;

    composer.render();
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});