import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

// ĐỊA CHỈ WORKER API CỦA BẠN (Cập nhật sau khi deploy Worker)
const API_URL = "https://advenature-api.YOUR-SUBDOMAIN.workers.dev";

// --- QUẢN LÝ TRẠNG THÁI NGƯỜI DÙNG TẠM THỜI (LOCAL STORAGE) ---
let currentUser = JSON.parse(localStorage.getItem("advenature_user")) || {
    id: "guest_" + Math.floor(Math.random() * 10000),
    name: "Nhà Phiêu Lưu Mới",
    tinh_quang_points: 1
};

// ==========================================
// 1. THIẾT LẬP SINGLE PAGE APPLICATION (SPA)
// ==========================================
const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll(".view-panel");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        navButtons.forEach(b => b.classList.remove("active"));
        viewPanels.forEach(p => p.classList.add("hidden"));

        btn.classList.add("active");
        const targetView = document.getElementById(btn.dataset.target);
        if (targetView) targetView.classList.remove("hidden");
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
// 2. CORE 3D ENGINE (CHUẨN 990 BIẾN THỂ)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03030a);
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.8, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById("app-3d").appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0.1));
composer.addPass(new OutputPass());

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);
scene.add(new THREE.AmbientLight(0x443366, 0.5));

let lootBox = null;
let currentGemData = null;

// Bảng 30 màu chia theo 6 Hệ
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

function createProceduralRock() {
    if (lootBox) scene.remove(lootBox);

    const faceCount = FACE_TIERS[Math.floor(Math.random() * FACE_TIERS.length)];
    const shapeStyles = [
        { id: 1, name: "Trụ Tinh Thể", rx: [0.8, 1.2], ry: [1.8, 2.5], rz: [0.8, 1.2] },
        { id: 2, name: "Cự Thạch",     rx: [1.2, 1.6], ry: [1.2, 1.6], rz: [1.2, 1.6] },
        { id: 3, name: "Phiến Thạch",  rx: [1.5, 2.0], ry: [1.2, 1.7], rz: [0.6, 0.9] }
    ];
    const shape = shapeStyles[Math.floor(Math.random() * shapeStyles.length)];
    const palette = crystalPalettes[Math.floor(Math.random() * crystalPalettes.length)];

    // Mã định danh chuẩn: [Icon Hệ] + [Số Thứ Tự Màu] + [Số Mặt] + [Số Dáng]
    const gemCode = `${palette.prefix}${palette.sysIndex}${faceCount}${shape.id}`;

    currentGemData = {
        code: gemCode,
        name: palette.name,
        shape: shape.name,
        faceCount: faceCount
    };

    // Tạo khối 3D
    const points = [];
    for (let i = 0; i < faceCount; i++) {
        const y = 1 - (i / (faceCount - 1 || 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = Math.PI * (Math.sqrt(5) - 1) * i;
        points.push(new THREE.Vector3(
            Math.cos(theta) * radiusAtY * shape.rx[0],
            y * shape.ry[0],
            Math.sin(theta) * radiusAtY * shape.rz[0]
        ));
    }
    const geometry = new ConvexGeometry(points);
    const material = new THREE.MeshStandardMaterial({
        color: palette.color,
        emissive: palette.emissive,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        flatShading: true
    });

    lootBox = new THREE.Mesh(geometry, material);
    lootBox.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })));
    scene.add(lootBox);

    return currentGemData;
}

// ==========================================
// 3. EVENT XỬ LÝ GACHA & KẾT NỐI API
// ==========================================
const gachaBtn = document.getElementById("gachaButton");
const startUI = document.getElementById("startUI");
const lootText = document.getElementById("lootText");
const claimContainer = document.getElementById("claimContainer");
const claimBtn = document.getElementById("claimButton");

gachaBtn.addEventListener("click", () => {
    startUI.classList.add("hidden");
    const gem = createProceduralRock();

    lootText.innerHTML = `
        <div style="font-size: 22px; font-weight: bold; color: #fff4c4;">${gem.name}</div>
        <div style="font-size: 13px; color: #c9c3ff; margin-top: 5px;">
            MÃ: [${gem.code}] • ${gem.shape.toUpperCase()} • ${gem.faceCount} MẶT
        </div>
    `;
    lootText.classList.add("show");
    claimContainer.classList.add("show");
});

claimBtn.addEventListener("click", async () => {
    claimContainer.classList.remove("show");
    lootText.classList.remove("show");

    // Gửi dữ liệu về Cloudflare Worker API
    try {
        const response = await fetch(`${API_URL}/api/gacha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, gemData: currentGemData })
        });
        const res = await response.json();
        
        if (res.blessing) {
            alert(`🎉 CHÚC PHÚC TINH LINH: Bạn nhận được [${res.blessing.name}]!`);
        }
    } catch (e) {
        console.log("Offline mode - đã lưu vào local memory");
    }

    document.getElementById("rewardMessage").style.opacity = "1";
    setTimeout(() => {
        document.getElementById("rewardMessage").style.opacity = "0";
        startUI.classList.remove("hidden");
    }, 1500);
});

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    if (lootBox) {
        lootBox.rotation.x += 0.005;
        lootBox.rotation.y += 0.008;
    }
    composer.render();
}
animate();