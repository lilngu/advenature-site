/**
 * portal-3d.js - Module 3D "CỔNG MA THUẬT" (Magical Portal) cho widget góc màn hình
 * ---------------------------------------------------------------------------
 * Dựng cổng ma thuật trong khung `#cornerPortal3D` (132x178px, góc phải index.html,
 * style `.corner-portal3d`). Xem cách gọi thật ở `app.js: initCornerPortal()`.
 *
 * - Dùng CHUNG Three.js đã khai báo trong importmap của index.html
 *   (`three` + `three/addons/`) nên KHÔNG tải thêm thư viện nào.
 * - CSS (`.p3d-root`, `.p3d-fallback`) tự inject 1 lần, không cần sửa style.css.
 * - Nền TRONG SUỐT (alpha) để hòa vào phông cảnh rừng phía sau.
 * - KHÔNG bật UnrealBloomPass: khung 132px bị cắt cứng ở mép render target tạo
 *   viền vuông. Glow do chính shader (rimEnergy + dải additive) và drop-shadow
 *   CSS trong `.corner-portal3d` đảm nhiệm.
 *
 * ---------------------------------------------------------------------------
 * CÁCH DÙNG
 *
 *   const portal = createPortalScene({
 *       container: '#cornerPortal3D',   // bắt buộc, phải có position != static
 *       exposure: 1.45,                 // không có bloom -> nâng sáng
 *       pixelRatio: 1.5,                // khung nhỏ, không cần DPR 2
 *       fitOptions: {                   // khoảng cách camera cho khung nhỏ
 *           distance: 4.9,
 *           mobileDistance: 5.2,
 *           mobileAspectFactor: 3.2,
 *           mobileLift: 0.15
 *       },
 *       portals: [{
 *           id: 'corner-rtl',
 *           position: [0, 0, 0],
 *           size: { width: 3.0, height: 3.8 },
 *           strokeCount: 14,
 *           colors: { primary: 0xff007f, secondary: 0x00f0ff, core: 0x5379b5 },
 *           onSelect: () => { window.location.href = 'https://rungtinhlinh.pages.dev/'; }
 *       }]
 *   });
 *
 *   portal.setActive(false);  // rời khỏi view -> tạm dừng render cho nhẹ máy
 *   portal.setActive(true);   // quay lại
 *   portal.resize();          // sau khi khung vừa từ display:none -> tràn ra
 *   portal.destroy();         // không dùng nữa -> giải phóng GPU
 *
 * ---------------------------------------------------------------------------
 * GHI CHÚ
 * - `colors` là nơi DUY NHẤT quy định màu cổng:
 *     `primary`   = tâm xoáy + dải năng lượng (màu chủ đạo)
 *     `secondary` = lớp nền vùng ngoài
 *     `core`      = lõi giữa, bị `secondary` che gần hết nên gần như không thấy
 * - Overlay chỉ nhận chuột khi `interactive: true` (mặc định): module gắn class
 *   `.p3d-interactive`; style.css để `.corner-portal3d` là `pointer-events:none`
 *   nên mặc định widget không chặn chuột của phần còn lại trang.
 * - Kéo chuột (drag) không mở cổng: chỉ `click` trong khung mới kích hoạt, và
 *   bị bỏ qua nếu con trỏ dời quá `clickMoveTolerance` px giữa down và up.
 */
import * as THREE from 'three';
import {
	EffectComposer
} from 'three/addons/postprocessing/EffectComposer.js';
import {
	RenderPass
} from 'three/addons/postprocessing/RenderPass.js';
import {
	OutputPass
} from 'three/addons/postprocessing/OutputPass.js';
// ===========================================================================
// 1. CẤU HÌNH MẶC ĐỊNH
// ===========================================================================
const DEFAULTS = {
	strokeCountPerPortal: 20, // Số dải năng lượng uốn lượn quanh mỗi cổng
	exposure: 1.15,
	camera: {
		fov: 55,
		near: 0.1,
		far: 1000
	},
	// Khoảng cách camera responsive (widget luôn hẹp -> rơi vào nhánh mobile)
	distance: 14,
	mobileDistance: 16.5,
	mobileAspect: 1.0,
	mobileAspectFactor: 11.5,
	mobileLift: 0.3,
	clickMoveTolerance: 12 // Di chuyển chuột dưới ngưỡng này = click (chống nhầm khi drag)
};
// ===========================================================================
// 2. SHADERS
// ===========================================================================
const PORTAL_VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const PORTAL_FRAGMENT_SHADER = /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorCore;
    varying vec2 vUv;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        float dist = length(uv);

        // Tính toán đường xoáy
        float angle = atan(uv.y, uv.x);
        float spiral = angle + (3.2 / (dist + 0.2)) - uTime * 2.2;

        vec2 noiseUv = vec2(cos(spiral) * dist, sin(spiral) * dist);
        float n1 = snoise(noiseUv * 3.0 + vec2(uTime * 0.5));
        float n2 = snoise(noiseUv * 5.5 - vec2(uTime * 1.0));

        float swirl = sin(spiral * 4.5 + n1 * 3.0) * 0.5 + 0.5;
        swirl *= pow(dist, 0.75);

        vec3 color = mix(uColorCore, uColorSecondary, smoothstep(0.05, 0.65, dist + n1 * 0.1));
        color = mix(color, uColorPrimary * 1.5, pow(swirl, 2.0) * smoothstep(0.15, 0.9, dist));

        // Viền năng lượng
        float rim = smoothstep(0.65, 0.98, dist);
        float rimEnergy = pow(rim, 2.2) * (1.2 + n2 * 0.6);
        color += mix(uColorPrimary, vec3(1.0), 0.7) * rimEnergy * 1.4;

        float alpha = smoothstep(1.0, 0.78, dist);
        gl_FragColor = vec4(color, alpha);
    }
`;
const STROKE_VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const STROKE_FRAGMENT_SHADER = /* glsl */ `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uOffset;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    varying vec2 vUv;

    void main() {
        float flow = fract(vUv.x * 2.0 - uTime * uSpeed * 0.7 + uOffset);
        float pulse = pow(sin(flow * 3.14159), 3.0);
        float edge = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 1.4);

        vec3 glowColor = mix(uColorSecondary, uColorPrimary * 2.0, pulse);
        glowColor = mix(glowColor, vec3(1.0), pow(pulse, 3.5));

        float alpha = pulse * edge * 0.85;
        gl_FragColor = vec4(glowColor * 1.3, alpha);
    }
`;
// ===========================================================================
// 3. CSS TỰ INJECT (1 lần / trang)
// ===========================================================================
let stylesInjected = false;

function injectStyles() {
	if (stylesInjected || typeof document === 'undefined') return;
	stylesInjected = true;
	const style = document.createElement('style');
	style.id = 'portal3d-styles';
	style.textContent = `
.p3d-root{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
.p3d-root>canvas{display:block;width:100%!important;height:100%!important;}
.p3d-root.p3d-interactive{pointer-events:auto;cursor:default;}
.p3d-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    padding:16px;text-align:center;color:#b3f7ff;background:#020106;pointer-events:auto;
    font-family:Handjet,monospace;font-size:14px;}
`;
	document.head.appendChild(style);
}
// ===========================================================================
// 4. TIỆN ÍCH NHỎ
// ===========================================================================
function resolveElement(target) {
	if (!target) return null;
	if (typeof target === 'string') return document.querySelector(target);
	if (target.nodeType === 1) return target;
	return null;
}

function disposeMaterial(material) {
	if (!material) return;
	for (const key of Object.keys(material)) {
		const value = material[key];
		if (value && value.isTexture) value.dispose();
	}
	material.dispose();
}

/** Giải phóng toàn bộ geometry/material/texture bên trong một Object3D */
function disposeObject3D(object) {
	if (!object) return;
	object.traverse((child) => {
		if (child.geometry) child.geometry.dispose();
		const mat = child.material;
		if (Array.isArray(mat)) mat.forEach(disposeMaterial);
		else disposeMaterial(mat);
	});
}
// ===========================================================================
// 5. TẠO 1 CỔNG MA THUẬT (không gắn vào scene, không tạo renderer)
// ===========================================================================
/**
 * Dựng một cổng ma thuật độc lập. Trả về "rig" có group + hitbox + update().
 *
 * @param {Object} options
 * @param {string}   [options.id]
 * @param {[number,number,number]} [options.position]      Vị trí trong scene
 * @param {{width:number,height:number}} [options.size]     Kích thước mặt phẳng
 * @param {{primary:number,secondary:number,core:number}} [options.colors]
 * @param {number}   [options.strokeCount]                  Số dải năng lượng
 * @param {number}   [options.hitRadius]                    Bán kính vùng bắt chuột
 * @param {(portal:Object)=>void} [options.onSelect]        Xử lý khi click cổng
 * @returns {Object} portal rig
 */
function createMagicPortal(options = {}) {
	const cfg = {
		id: options.id || `portal-${Math.random().toString(36).slice(2, 7)}`,
		position: options.position || [0, 0, 0],
		width: options.size?.width ?? 3.0,
		height: options.size?.height ?? 3.8,
		colors: {
			primary: options.colors?.primary ?? 0xffffff,
			secondary: options.colors?.secondary ?? 0x8888ff,
			core: options.colors?.core ?? 0x000000
		},
		strokeCount: options.strokeCount ?? DEFAULTS.strokeCountPerPortal,
		speed: options.speed ?? 1.0,
		hitRadius: options.hitRadius ?? 1.8,
		hoverScale: options.hoverScale ?? 1.15,
		punchScale: options.punchScale ?? 1.3,
		floatAmplitude: options.floatAmplitude ?? 0.12,
		floatSpeed: options.floatSpeed ?? 2.0,
		spinAmplitude: options.spinAmplitude ?? 0.08,
		phase: options.phase ?? 0,
		onSelect: options.onSelect ?? null
	};
	const group = new THREE.Group();
	group.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
	const baseY = group.position.y;
	// Mặt phẳng vortex
	const material = new THREE.ShaderMaterial({
		uniforms: {
			uTime: {
				value: 0
			},
			uColorPrimary: {
				value: new THREE.Color(cfg.colors.primary)
			},
			uColorSecondary: {
				value: new THREE.Color(cfg.colors.secondary)
			},
			uColorCore: {
				value: new THREE.Color(cfg.colors.core)
			}
		},
		vertexShader: PORTAL_VERTEX_SHADER,
		fragmentShader: PORTAL_FRAGMENT_SHADER,
		transparent: true,
		side: THREE.DoubleSide,
		depthWrite: false
	});
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.width, cfg.height, 40, 40), material);
	group.add(mesh);
	// Các dải năng lượng uốn lượn xung quanh
	const strokeBaseMaterial = new THREE.ShaderMaterial({
		uniforms: {
			uTime: {
				value: 0
			},
			uSpeed: {
				value: 1.0
			},
			uOffset: {
				value: 0.0
			},
			uColorPrimary: {
				value: new THREE.Color(cfg.colors.primary)
			},
			uColorSecondary: {
				value: new THREE.Color(cfg.colors.secondary)
			}
		},
		vertexShader: STROKE_VERTEX_SHADER,
		fragmentShader: STROKE_FRAGMENT_SHADER,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	const strokes = [];
	for (let i = 0; i < cfg.strokeCount; i++) {
		const points = [];
		const numPoints = 24;
		const radiusX = 1.15 + Math.random() * 0.45;
		const radiusY = 1.55 + Math.random() * 0.55;
		const startAngle = Math.random() * Math.PI * 2;
		const arcLength = (Math.PI * 0.8) + Math.random() * (Math.PI * 1.1);
		const zDepth = (Math.random() - 0.5) * 0.7;
		for (let j = 0; j <= numPoints; j++) {
			const t = j / numPoints;
			const angle = startAngle + t * arcLength;
			const rX = radiusX * (1.0 - t * 0.3);
			const rY = radiusY * (1.0 - t * 0.3);
			points.push(new THREE.Vector3(Math.cos(angle) * rX, Math.sin(angle) * rY, zDepth + Math.sin(t * Math.PI * 2 + startAngle) * 0.25));
		}
		const curve = new THREE.CatmullRomCurve3(points);
		const tubeGeo = new THREE.TubeGeometry(curve, 30, 0.015 + Math.random() * 0.018, 5, false);
		const strokeMaterial = strokeBaseMaterial.clone();
		strokeMaterial.uniforms.uSpeed.value = 0.9 + Math.random() * 1.0;
		strokeMaterial.uniforms.uOffset.value = Math.random();
		const strokeMesh = new THREE.Mesh(tubeGeo, strokeMaterial);
		group.add(strokeMesh);
		strokes.push({
			mesh: strokeMesh,
			material: strokeMaterial,
			rotSpeed: (0.35 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1)
		});
	}
	strokeBaseMaterial.dispose(); // Các bản clone đã tự copy uniforms
	// Hitbox hỗ trợ raycast (material invisible => không render nhưng vẫn raycast được)
	const hitMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({
		visible: false
	}));
	hitMesh.userData.portalId = cfg.id;
	hitMesh.scale.set(cfg.hitRadius, cfg.hitRadius, 1);
	group.add(hitMesh);
	return {
		id: cfg.id,
		group,
		hitMesh,
		onSelect: cfg.onSelect,
		config: cfg,
		hovered: false,
		punchTimer: 0,
		setHovered(value) {
			this.hovered = !!value;
		},
		/** Hiệu ứng "bụp" khi click */
		punch() {
			this.punchTimer = 1;
		},
		/** Cập nhật shader + quỹ đạo. Gọi mỗi frame. */
		update(elapsed, delta) {
			const d = Math.min(delta, 0.1);
			const t = elapsed;
			material.uniforms.uTime.value = t * cfg.speed * (this.hovered ? 1.5 : 1.0);
			for (let i = 0; i < strokes.length; i++) {
				const stroke = strokes[i];
				stroke.material.uniforms.uTime.value = t * cfg.speed;
				stroke.mesh.rotation.z += stroke.rotSpeed * d * (this.hovered ? 2.0 : 1.0);
			}
			group.position.y = baseY + Math.sin(t * cfg.floatSpeed + cfg.phase) * cfg.floatAmplitude;
			group.rotation.y = Math.sin(t * 1.2 + cfg.phase) * cfg.spinAmplitude;
			const targetScale = this.hovered ? cfg.hoverScale : 1.0;
			if (this.punchTimer > 0) this.punchTimer = Math.max(0, this.punchTimer - d * 3.4);
			const wanted = targetScale + this.punchTimer * (cfg.punchScale - 1);
			const k = Math.min(1, d * 8);
			group.scale.x += (wanted - group.scale.x) * k;
			group.scale.y += (wanted - group.scale.y) * k;
			group.scale.z += (wanted - group.scale.z) * k;
			// Bù scale để hitbox giữ nguyên kích thước trên màn hình
			const inv = 1 / Math.max(0.0001, group.scale.x);
			hitMesh.scale.set(cfg.hitRadius * inv, cfg.hitRadius * inv, 1);
		},
		dispose() {
			disposeObject3D(group);
			group.removeFromParent();
		}
	};
}
// ===========================================================================
// 6. CẢNH PORTAL (renderer + composer + raycast + tương tác)
// ===========================================================================
/**
 * @param {Object} options
 * @param {string|HTMLElement} [options.container='#portal3d']  Khung chứa (module tự tạo .p3d-root bên trong)
 * @param {Array}    [options.portals]                          Danh sách định nghĩa cổng (BẮT BUỘC)
 * @param {boolean}  [options.interactive=true]                 true = overlay nhận chuột để bắt raycast
 * @param {number}   [options.exposure]                         Chỉnh độ sáng (không có bloom nên nên để ~1.4)
 * @param {number}   [options.pixelRatio=2]                     Giới hạn DPR của renderer
 * @param {Object}   [options.fitOptions]                        Ghi đè khoảng cách camera cho khung nhỏ
 * @returns {Object|null} controller (null nếu không khởi tạo được)
 */
export function createPortalScene(options = {}) {
	injectStyles();
	const host = resolveElement(options.container ?? '#portal3d');
	if (!host) {
		console.warn('[portal3d] Không tìm thấy container:', options.container);
		return null;
	}
	const defs = options.portals || [];
	if (!defs.length) {
		console.warn('[portal3d] Thiếu options.portals — không có cổng nào để dựng.');
		return null;
	}
	const interactive = options.interactive ?? true;
	// Khoảng cách camera responsive — ghi đè được cho các khung nhỏ (widget, góc màn hình)
	const fitCfg = {
		distance: DEFAULTS.distance,
		mobileDistance: DEFAULTS.mobileDistance,
		mobileAspect: DEFAULTS.mobileAspect,
		mobileAspectFactor: DEFAULTS.mobileAspectFactor,
		mobileLift: DEFAULTS.mobileLift,
		...(options.fitOptions || {})
	};
	// ---- Khung DOM -------------------------------------------------------
	const root = document.createElement('div');
	root.className = 'p3d-root';
	host.appendChild(root);
	// ---- Scene / Camera / Renderer ---------------------------------------
	// Nền trong suốt: không dựng scene.background, renderer alpha:true.
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(options.camera?.fov ?? DEFAULTS.camera.fov, 1, options.camera?.near ?? DEFAULTS.camera.near, options.camera?.far ?? DEFAULTS.camera.far);
	let renderer;
	try {
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance'
		});
	} catch (err) {
		console.warn('[portal3d] Không khởi tạo được WebGL:', err);
		const fallback = document.createElement('div');
		fallback.className = 'p3d-fallback';
		fallback.textContent = '⚠ Trình duyệt này không hỗ trợ WebGL nên không hiển thị được cổng 3D.';
		root.appendChild(fallback);
		return null;
	}
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = options.exposure ?? DEFAULTS.exposure;
	root.appendChild(renderer.domElement);
	// Chỉ RenderPass + OutputPass. OutputPass vẫn BẮT BUỘC phải giữ: shader của
	// module là ShaderMaterial tự viết, không có #include <tonemapping_fragment> /
	// <colorspace_fragment>, nên three.js không tự chèn tone mapping + chuyển sRGB cho nó.
	// Bỏ OutputPass thì màu sẽ sai (ảnh tuyến tính bị đọc như sRGB -> nhợt, mờ).
	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new OutputPass());
	// ---- Cổng -------------------------------------------------------------
	const portals = defs.map((def, index) => {
		const portal = createMagicPortal({
			...def,
			phase: def.phase ?? index * 2.0
		});
		scene.add(portal.group);
		return portal;
	});
	// ---- Tương tác (raycast) --------------------------------------------
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(-999, -999);
	const hitMeshes = portals.map((p) => p.hitMesh);
	let hoveredId = null;
	let pointerInside = false;
	let downX = 0;
	let downY = 0;

	function updatePointerFromEvent(event) {
		const rect = root.getBoundingClientRect();
		if (!rect.width || !rect.height) return false;
		pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		return true;
	}

	function raycastPortal() {
		raycaster.setFromCamera(pointer, camera);
		const hits = raycaster.intersectObjects(hitMeshes, false);
		if (!hits.length) return null;
		return portals.find((p) => p.hitMesh === hits[0].object) || null;
	}

	function setHovered(portal) {
		const nextId = portal ? portal.id : null;
		if (nextId === hoveredId) return;
		hoveredId = nextId;
		portals.forEach((p) => p.setHovered(p.id === nextId));
		root.style.cursor = nextId ? 'pointer' : 'default';
	}

	function selectPortal(portal) {
		if (!portal) return;
		portal.punch();
		if (typeof portal.onSelect === 'function') portal.onSelect(portal);
	}

	function onPointerDown(event) {
		downX = event.clientX;
		downY = event.clientY;
	}

	function onPointerMove(event) {
		pointerInside = updatePointerFromEvent(event);
	}

	function onPointerLeave() {
		pointerInside = false;
		setHovered(null);
	}

	function onClick(event) {
		if (!interactive) return;
		// Bỏ qua nếu người dùng kéo chuột (chỉ bấm yên mới mở cổng)
		if (Math.hypot(event.clientX - downX, event.clientY - downY) > DEFAULTS.clickMoveTolerance) return;
		if (!updatePointerFromEvent(event)) return;
		selectPortal(raycastPortal());
	}

	function bindEvents() {
		if (!interactive) return;
		root.addEventListener('pointerdown', onPointerDown);
		root.addEventListener('click', onClick);
		root.addEventListener('pointermove', onPointerMove);
		root.addEventListener('pointerleave', onPointerLeave);
		root.classList.add('p3d-interactive');
	}

	function unbindEvents() {
		root.removeEventListener('pointerdown', onPointerDown);
		root.removeEventListener('click', onClick);
		root.removeEventListener('pointermove', onPointerMove);
		root.removeEventListener('pointerleave', onPointerLeave);
		root.classList.remove('p3d-interactive');
	}
	bindEvents();
	// ---- Camera responsive ------------------------------------------------
	function fitCamera() {
		const width = root.clientWidth || 1;
		const height = root.clientHeight || 1;
		const aspect = width / height;
		if (aspect < fitCfg.mobileAspect) {
			camera.position.set(0, fitCfg.mobileLift, Math.max(fitCfg.mobileDistance, fitCfg.mobileAspectFactor / aspect));
		} else {
			camera.position.set(0, 0, fitCfg.distance);
		}
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	}

	function resize() {
		const width = Math.max(1, Math.round(root.clientWidth || host.clientWidth || 1));
		const height = Math.max(1, Math.round(root.clientHeight || host.clientHeight || 1));
		fitCamera();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio ?? 2));
		renderer.setSize(width, height, false);
		composer.setSize(width, height);
	}
	// ---- Vòng lặp ---------------------------------------------------------
	const clock = new THREE.Clock();
	let rafId = null;
	let userActive = true;
	let inView = true;

	function update(elapsed, delta) {
		const d = Math.min(delta ?? 0, 0.1);
		if (interactive && pointerInside) setHovered(raycastPortal());
		portals.forEach((portal) => portal.update(elapsed, d));
	}

	function tick() {
		rafId = requestAnimationFrame(tick);
		// Dừng khi tab ẩn, khung không còn hiện, hoặc app đã tắt qua setActive(false)
		if (!userActive || document.hidden || !inView) return;
		// Thứ tự quan trọng: getElapsedTime() tự gọi getDelta() bên trong,
		// nên phải lấy delta TRƯỚC, nếu không delta luôn ~= 0 và mọi hiệu ứng
		// dựa trên delta (xoay dải, scale, punch) sẽ đứng yên.
		const delta = clock.getDelta();
		update(clock.getElapsedTime(), delta);
		composer.render();
	}

	function start() {
		if (rafId !== null) return;
		clock.getDelta();
		rafId = requestAnimationFrame(tick);
	}

	function stop() {
		if (rafId === null) return;
		cancelAnimationFrame(rafId);
		rafId = null;
	}
	// ---- Theo dõi resize / hiển thị ---------------------------------------
	const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
	if (resizeObserver) resizeObserver.observe(host);
	else window.addEventListener('resize', resize);
	const intersectionObserver = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
		inView = entries.some((entry) => entry.isIntersecting);
	}) : null;
	if (intersectionObserver) intersectionObserver.observe(root);
	resize();
	// ---- Controller -------------------------------------------------------
	const controller = {
		root,
		portals,
		/** Bật/tắt render (app gọi khi rời khỏi gacha-view) */
		setActive(value) {
			userActive = !!value;
			if (userActive) clock.getDelta();
		},
		/** Đo lại khung — cần sau khi host vừa từ display:none -> tràn ra */
		resize,
		/** Giải phóng GPU + DOM */
		destroy() {
			stop();
			unbindEvents();
			window.removeEventListener('resize', resize);
			resizeObserver?.disconnect();
			intersectionObserver?.disconnect();
			portals.forEach((portal) => portal.dispose());
			portals.length = 0;
			disposeObject3D(scene);
			composer.dispose?.();
			renderer.dispose();
			root.remove();
		}
	};
	start();
	return controller;
}
