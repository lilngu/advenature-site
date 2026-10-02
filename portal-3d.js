/**
 * portal-3d.js - Module 3D "CỔNG MA THUẬT" (Magical Portal)
 * ---------------------------------------------------------------------------
 * Tách phần scene 3D ra từ `.module/portal.html` để có thể nhúng vào bất kỳ
 * view nào (ví dụ `gacha-view` của index.html) mà không phải copy cả trang.
 *
 * Module dùng CHUNG Three.js đã khai báo trong importmap của index.html
 * (`three` + `three/addons/`) nên KHÔNG tải thêm thư viện nào.
 * CSS (nhãn 2D, scanline, fallback) được tự inject 1 lần, không cần sửa style.css.
 *
 * ---------------------------------------------------------------------------
 * CÁCH 1 - Dựng cảnh riêng (giống hệt portal.html: renderer + bloom + label):
 *
 *   <div id="portal3d" style="position:absolute;inset:0"></div>
 *   <script type="module">
 *     import { createPortalScene } from './portal-3d.js';
 *
 *     const portal = createPortalScene({ container: '#portal3d' });
 *
 *     // Rời khỏi view -> tạm dừng render cho nhẹ máy
 *     portal.setActive(false);
 *     // Không dùng nữa -> giải phóng GPU
 *     portal.destroy();
 *   </script>
 *
 * CÁCH 2 - Nhúng vào scene có sẵn của app.js (dùng chung 1 WebGL context):
 *
 *   import { createPortalScene } from './portal-3d.js';   // hoặc '@portal' nếu thêm vào importmap
 *
 *   const portal = createPortalScene({
 *       container: '#gacha-view',  // chỉ dùng làm khung cho nhãn 2D
 *       scene,                     // scene + camera của app.js
 *       camera,
 *       autoStart: false,          // để app.js điều khiển update
 *       portals: [{
 *           id: 'fb',
 *           position: [-4.2, 1.2, -3],
 *           colors: { primary: 0xff007f, secondary: 0x9900ff, core: 0x18001a },
 *           label: 'Fanpage Advenature',
 *           labelVariant: 'left',
 *           link: 'https://www.facebook.com/rungtinhlinh'
 *       }]
 *   });
 *
 *   function animate() {
 *       portal.update(clock.getElapsedTime(), clock.getDelta());
 *       composer.render();
 *   }
 *
 * Gợi ý khi dùng CÁCH 2 trong index.html:
 *   - Thêm alias vào importmap (cùng kiểu @data/@vfx):
 *         "@portal": "./portal-3d.js?v=20261002"
 *   - Cổng nên đặt PHÍA SAU tinh thể (z âm) và lệch sang 2 bên để không che UI.
 *   - `interactive` mặc định là 'passive': overlay không nuốt chuột nên người chơi
 *     vẫn xoay được camera của app.js; click vào nút của trang sẽ bị bỏ qua nhờ
 *     `ignoreSelector`. Đổi thành `true` nếu muốn overlay nhận chuột riêng.
 *   - Gọi `portal.setActive(false)` ở hàm chuyển view của app.js (khi rời gacha-view)
 *     để không render những view khác, `portal.setActive(true)` khi quay lại.
 *
 * ---------------------------------------------------------------------------
 * GHI CHÚ:
 * - `link` mặc định được `window.open(link, '_blank')`. Muốn xử lý riêng
 *   (vd: mở modal) thì truyền `onSelect(portal)` hoặc `link: (portal) => {...}`.
 * - Chuỗi link đặc biệt "modal" của portal.html cố ý KHÔNG xử lý ở đây,
 *   hãy tự bắt trong onSelect để module không phụ thuộc vào DOM của trang cũ.
 * - Cổng trong bản gốc bắt chuột bằng sự kiện `click`, nên kéo chuột xoay camera
 *   cũng mở nhầm cổng. Bản này phân biệt click với drag (ngưỡng 12px / 800ms).
 */
import * as THREE from 'three';
import {
	EffectComposer
} from 'three/addons/postprocessing/EffectComposer.js';
import {
	RenderPass
} from 'three/addons/postprocessing/RenderPass.js';
import {
	UnrealBloomPass
} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
	OutputPass
} from 'three/addons/postprocessing/OutputPass.js';
// ===========================================================================
// 1. CẤU HÌNH MẶC ĐỊNH
// ===========================================================================
export const PORTAL_DEFAULTS = {
	speed: 1.4, // Tốc độ chung của shader
	strokeCountPerPortal: 20, // Số dải năng lượng uốn lượn quanh mỗi cổng
	particleCount: 80, // Số hạt nền
	background: 0x020106, // Màu nền (chỉ dùng ở chế độ dựng cảnh riêng)
	exposure: 1.15,
	bloom: {
		strength: 1.25,
		radius: 0.65,
		threshold: 0.28
	},
	camera: {
		fov: 55,
		near: 0.1,
		far: 1000
	},
	// Khoảng cách camera responsive (giống portal.html)
	distance: 14,
	mobileDistance: 16.5,
	mobileAspect: 1.0,
	mobileAspectFactor: 11.5,
	mobileLift: 0.3,
	labels: {
		offsetY: 2.25, // Nhãn nằm DƯỚI cổng trong không gian 3D
		offsetYMobile: 2.1,
		padding: 80, // Khoảng cách an toàn so với mép màn hình
		paddingMobile: 55
	},
	clickMoveTolerance: 12, // Di chuyển chuột dưới ngưỡng này = click (chống nhầm khi drag)
	clickMaxDuration: 800 // Giữ chuột quá lâu = drag, không mở portal
};
/** 3 cổng mặc định (giữ nguyên từ portal.html) */
export const DEFAULT_PORTALS = [{
	id: 'top',
	position: [0, 3.6, 0],
	colors: {
		primary: 0xff007f,
		secondary: 0x9900ff,
		core: 0x18001a
	},
	link: 'modal',
	label: 'Linh Cảnh Khởi Nguyên',
	labelVariant: 'top'
}, {
	id: 'left',
	position: [-4.5, -2.6, 0],
	colors: {
		primary: 0x00f0ff,
		secondary: 0x0055ff,
		core: 0x01081a
	},
	link: 'https://www.facebook.com/rungtinhlinh',
	label: 'Rừng Tinh Linh Fanpage',
	labelVariant: 'left'
}, {
	id: 'right',
	position: [4.5, -2.6, 0],
	colors: {
		primary: 0xffaa00,
		secondary: 0xff0055,
		core: 0x1a0c00
	},
	link: 'https://www.facebook.com/groups/668807515815899',
	label: 'Cộng đồng Advenature',
	labelVariant: 'right'
}];
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
.p3d-root.p3d-interactive{pointer-events:auto;touch-action:none;cursor:default;}
.p3d-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden;
    font-family:Handjet,'Press Start 2P','Jersey 25',monospace;font-weight:700;}
.p3d-label{position:absolute;transform:translate(-50%,0);background:rgba(6,4,14,.92);
    border:2px solid #fff;padding:6px 10px;font-size:16px;line-height:1.35;color:#fff;
    box-shadow:2px 2px 0 #000;border-radius:4px;max-width:160px;white-space:normal;
    text-align:center;transition:transform .15s ease,background .15s ease,color .15s ease;}
.p3d-label.is-hovered{transform:translate(-50%,-4px) scale(1.05);background:#fff;
    color:#000!important;box-shadow:0 0 12px #fff;}
.p3d-label--top{border-color:#ff007f;color:#ff99c8;box-shadow:0 0 8px rgba(255,0,127,.35);}
.p3d-label--left{border-color:#00f0ff;color:#b3f7ff;box-shadow:0 0 8px rgba(0,240,255,.35);}
.p3d-label--right{border-color:#ffaa00;color:#ffe699;box-shadow:0 0 8px rgba(255,170,0,.35);}
.p3d-label--hidden{display:none!important;}
.p3d-scanlines{position:absolute;inset:0;pointer-events:none;z-index:2;
    background:linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,.2) 50%);background-size:100% 4px;}
.p3d-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    padding:16px;text-align:center;color:#b3f7ff;background:#020106;pointer-events:auto;
    font-family:Handjet,monospace;font-size:14px;}
@media (max-width:600px){.p3d-label{font-size:13px;padding:4px 7px;max-width:110px;}}
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

function makeParticleTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = 16;
	canvas.height = 16;
	const ctx = canvas.getContext('2d');
	const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
	grad.addColorStop(0, '#ffffff');
	grad.addColorStop(0.4, '#00f0ff');
	grad.addColorStop(1, 'transparent');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, 16, 16);
	return new THREE.CanvasTexture(canvas);
}
// ===========================================================================
// 5. TẠO 1 CỔNG MA THUẬT (không gắn vào scene, không tạo renderer)
// ===========================================================================
/**
 * Dựng một cổng ma thuật độc lập. Trả về "rig" có group + hitbox + update().
 * Dùng được cả trong createPortalScene() lẫn khi muốn tự add vào scene riêng.
 *
 * @param {Object} options
 * @param {string} [options.id]
 * @param {[number,number,number]} [options.position]      Vị trí trong scene
 * @param {{width:number,height:number}} [options.size]     Kích thước mặt phẳng
 * @param {{primary:number,secondary:number,core:number}} [options.colors]
 * @param {number} [options.strokeCount]                   Số dải năng lượng
 * @param {number} [options.hitRadius]                     Bán kính vùng bắt chuột
 * @param {number|string|null} [options.link]               URL, hàm, hoặc null
 * @param {string|null} [options.label]                    Nhãn 2D
 * @param {'top'|'left'|'right'|null} [options.labelVariant]
 * @param {(portal:Object)=>void} [options.onSelect]
 * @returns {Object} portal rig
 */
export function createMagicPortal(options = {}) {
	const cfg = {
		id: options.id || `portal-${Math.random().toString(36).slice(2, 7)}`,
		position: options.position || [0, 0, 0],
		width: options.size?.width ?? options.width ?? 3.0,
		height: options.size?.height ?? options.height ?? 3.8,
		colors: {
			primary: options.colors?.primary ?? 0xffffff,
			secondary: options.colors?.secondary ?? 0x8888ff,
			core: options.colors?.core ?? 0x000000
		},
		strokeCount: options.strokeCount ?? PORTAL_DEFAULTS.strokeCountPerPortal,
		speed: options.speed ?? 1.0,
		hitRadius: options.hitRadius ?? 1.8,
		hoverScale: options.hoverScale ?? 1.15,
		punchScale: options.punchScale ?? 1.3,
		floatAmplitude: options.floatAmplitude ?? 0.12,
		floatSpeed: options.floatSpeed ?? 2.0,
		spinAmplitude: options.spinAmplitude ?? 0.08,
		phase: options.phase ?? 0,
		link: options.link ?? null,
		onSelect: options.onSelect ?? null,
		label: options.label ?? null,
		labelVariant: options.labelVariant ?? null
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
	group.add(hitMesh);
	const portal = {
		id: cfg.id,
		group,
		mesh,
		material,
		strokes,
		hitMesh,
		link: cfg.link,
		label: cfg.label,
		labelVariant: cfg.labelVariant,
		onSelect: cfg.onSelect,
		baseY,
		hovered: false,
		targetScale: 1,
		punchTimer: 0,
		config: cfg,
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
			this.material.uniforms.uTime.value = t * cfg.speed * (this.hovered ? 1.5 : 1.0);
			for (let i = 0; i < strokes.length; i++) {
				const stroke = strokes[i];
				stroke.material.uniforms.uTime.value = t * cfg.speed;
				stroke.mesh.rotation.z += stroke.rotSpeed * d * (this.hovered ? 2.0 : 1.0);
			}
			group.position.y = baseY + Math.sin(t * cfg.floatSpeed + cfg.phase) * cfg.floatAmplitude;
			group.rotation.y = Math.sin(t * 1.2 + cfg.phase) * cfg.spinAmplitude;
			this.targetScale = this.hovered ? cfg.hoverScale : 1.0;
			if (this.punchTimer > 0) this.punchTimer = Math.max(0, this.punchTimer - d * 3.4);
			const punchBoost = this.punchTimer * (cfg.punchScale - 1);
			const wanted = this.targetScale + punchBoost;
			const k = Math.min(1, d * 8);
			group.scale.x += (wanted - group.scale.x) * k;
			group.scale.y += (wanted - group.scale.y) * k;
			group.scale.z += (wanted - group.scale.z) * k;
			// Bù scale để hitbox giữ nguyên kích thước trên màn hình
			const inv = 1 / Math.max(0.0001, group.scale.x);
			hitMesh.scale.set(cfg.hitRadius * inv, cfg.hitRadius * inv, 1);
		},
		getWorldPosition(target = new THREE.Vector3()) {
			return group.getWorldPosition(target);
		},
		dispose() {
			disposeObject3D(group);
			group.removeFromParent();
		}
	};
	hitMesh.scale.set(cfg.hitRadius, cfg.hitRadius, 1);
	return portal;
}
// ===========================================================================
// 6. HẠT NỀN (Vortex particles)
// ===========================================================================
export function createPortalVortex(options = {}) {
	const count = options.count ?? PORTAL_DEFAULTS.particleCount;
	const minRadius = options.minRadius ?? 3.5;
	const radiusRange = options.radiusRange ?? 12;
	const yRange = options.yRange ?? 16;
	const geometry = new THREE.BufferGeometry();
	const positions = new Float32Array(count * 3);
	const data = [];
	for (let i = 0; i < count; i++) {
		const radius = minRadius + Math.random() * radiusRange;
		const angle = Math.random() * Math.PI * 2;
		const y = (Math.random() - 0.5) * yRange;
		data.push({
			radius,
			angle,
			y,
			speed: 0.004 + Math.random() * 0.008
		});
		positions[i * 3] = Math.cos(angle) * radius;
		positions[i * 3 + 1] = y;
		positions[i * 3 + 2] = Math.sin(angle) * radius;
	}
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	const material = new THREE.PointsMaterial({
		color: options.color ?? 0xaaccff,
		size: options.size ?? 0.28,
		map: makeParticleTexture(),
		transparent: true,
		opacity: options.opacity ?? 0.75,
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});
	const points = new THREE.Points(geometry, material);
	return {
		object3D: points,
		update(elapsed) {
			const attr = geometry.attributes.position;
			for (let i = 0; i < count; i++) {
				const p = data[i];
				p.angle += p.speed;
				p.y += Math.sin(elapsed + i) * 0.008;
				if (p.y > 8) p.y = -8;
				attr.array[i * 3] = Math.cos(p.angle) * p.radius;
				attr.array[i * 3 + 1] = p.y;
				attr.array[i * 3 + 2] = Math.sin(p.angle) * p.radius;
			}
			attr.needsUpdate = true;
			points.rotation.y = elapsed * 0.04;
		},
		dispose() {
			disposeObject3D(points);
			points.removeFromParent();
		}
	};
}
// ===========================================================================
// 7. CẢNH PORTAL HOÀN CHỈNH (renderer + bloom + label + tương tác)
// ===========================================================================
/**
 * Sửa bloom để KHÔNG phá kênh alpha khi nền cần trong suốt.
 *
 * Vì sao cần: UnrealBloomPass của three.js r160 ghi cứng `alpha = 1.0` ở tầng
 * blur separable (`gl_FragColor = vec4(diffuseSum/weightSum, 1.0);`) và ở tầng
 * composite (`vec4(bloomTintColors[i], 1.0) * texture(...)`). Hệ quả là toàn bộ
 * vùng KHÔNG có ánh sáng cũng nhận alpha ≈ 1. Sau đó `blendMaterial` (Additive)
 * cộng alpha đó vào framebuffer -> toàn bộ canvas thành đục, dù đã truyền
 * `transparent: true` và `scene.background = null`. Đây chính là lý do nền cổng
 * bị đen đặc thay vì trong suốt.
 *
 * Cách sửa: thay shader blur bằng bản lấy cả alpha (vector 4 thay vì vec3) để
 * alpha được quét mờ đúng theo ánh sáng. Ở vùng tối alpha bằng 0 nên composite
 * và additive-blend không cộng thêm gì -> nền trong suốt, còn vùng glow thì vẫn
 * cộng alpha như trước nên cổng hiện rõ.
 *
 * Chỉ gọi khi `transparent: true`; chế độ nền đặc (portal.html) giữ nguyên
 * hành vi gốc.
 *
 * @param {UnrealBloomPass} pass
 */
function makeBloomAlphaSafe(pass) {
	const mats = pass?.separableBlurMaterials;
	if (!mats?.length) {
		console.warn('[portal3d] Không tìm thấy separableBlurMaterials, bỏ qua bản vá alpha.');
		return false;
	}
	mats.forEach((mat) => {
		mat.fragmentShader = /* glsl */ `
            #include <common>
            varying vec2 vUv;
            uniform sampler2D colorTexture;
            uniform vec2 invSize;
            uniform vec2 direction;
            uniform float gaussianCoefficients[KERNEL_RADIUS];

            void main() {
                float weightSum = gaussianCoefficients[0];
                // vec4 (không phải vec3) để alpha cùng được quét mờ.
                vec4 diffuseSum = texture2D( colorTexture, vUv ) * weightSum;
                for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
                    float x = float(i);
                    float w = gaussianCoefficients[i];
                    vec2 uvOffset = direction * invSize * x;
                    vec4 sample1 = texture2D( colorTexture, vUv + uvOffset );
                    vec4 sample2 = texture2D( colorTexture, vUv - uvOffset );
                    diffuseSum += (sample1 + sample2) * w;
                    weightSum += 2.0 * w;
                }
                gl_FragColor = diffuseSum / weightSum;
            }
        `;
		mat.needsUpdate = true;
	});
	return true;
}
/**
 * @param {Object} options
 * @param {string|HTMLElement} [options.container='#portal3d']  Khung chứa (module tự tạo .p3d-root bên trong)
 * @param {Array} [options.portals=DEFAULT_PORTALS]             Danh sách định nghĩa cổng
 * @param {boolean} [options.labels=true]                       Có nhãn 2D bám theo tọa độ 3D
 * @param {boolean|'passive'} [options.interactive]             true = overlay nhận chuột
 *                                                               'passive' = không chặn chuột của trang
 * @param {THREE.Scene} [options.scene]                         Dùng scene có sẵn (không tạo renderer)
 * @param {THREE.PerspectiveCamera} [options.camera]
 * @param {boolean} [options.autoStart]                         Module tự chạy vòng lặp rAF
 * @param {boolean} [options.pauseWhenHidden=true]              Tạm dừng khi container bị ẩn
 * @param {boolean} [options.transparent=false]                  Nền trong suốt (không dựng
 *                                                               scene.background, renderer
 *                                                               alpha:true, vá alpha cho bloom)
 * @param {boolean|Object} [options.bloom]                      `false` = tắt UnrealBloomPass
 *                                                               (khung nhỏ bị cắt cứng ở mép
 *                                                               render target). Object = chỉnh
 *                                                               strength/radius/threshold.
 * @param {(portal:Object)=>void} [options.onSelect]            Xử lý khi click cổng
 * @returns {Object|null} controller (null nếu không khởi tạo được)
 */
export function createPortalScene(options = {}) {
	injectStyles();
	const host = resolveElement(options.container ?? '#portal3d');
	if (!host) {
		console.warn('[portal3d] Không tìm thấy container:', options.container);
		return null;
	}
	if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
	const sharedScene = !!(options.scene && options.camera);
	const autoStart = options.autoStart ?? !sharedScene;
	const wantLabels = options.labels ?? true;
	let interactiveMode = options.interactive ?? (sharedScene ? 'passive' : true);
	const labelCfg = {
		...PORTAL_DEFAULTS.labels,
		...(options.labelOptions || {})
	};
	// Khoảng cách camera responsive — ghi đè được cho các khung nhỏ (widget, góc màn hình)
	const fitCfg = {
		distance: options.distance ?? PORTAL_DEFAULTS.distance,
		mobileDistance: options.mobileDistance ?? PORTAL_DEFAULTS.mobileDistance,
		mobileAspect: options.mobileAspect ?? PORTAL_DEFAULTS.mobileAspect,
		mobileAspectFactor: options.mobileAspectFactor ?? PORTAL_DEFAULTS.mobileAspectFactor,
		mobileLift: options.mobileLift ?? PORTAL_DEFAULTS.mobileLift,
		...(options.fitOptions || {})
	};
	// ---- Khung DOM -------------------------------------------------------
	const root = document.createElement('div');
	root.className = 'p3d-root';
	host.appendChild(root);
	// ---- Scene / Camera / Renderer ---------------------------------------
	let scene = null;
	let camera = null;
	let renderer = null;
	let composer = null;
	let bloomPass = null;
	if (sharedScene) {
		scene = options.scene;
		camera = options.camera;
	} else {
		scene = new THREE.Scene();
		if (options.fog) {
			scene.fog = new THREE.FogExp2(options.fog.color ?? 0x020106, options.fog.density ?? 0.025);
		} else if (!options.transparent) {
			scene.background = new THREE.Color(options.background ?? PORTAL_DEFAULTS.background);
		}
		camera = new THREE.PerspectiveCamera(options.camera?.fov ?? PORTAL_DEFAULTS.camera.fov, 1, options.camera?.near ?? PORTAL_DEFAULTS.camera.near, options.camera?.far ?? PORTAL_DEFAULTS.camera.far);
		try {
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: !!options.transparent,
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
		renderer.toneMappingExposure = options.exposure ?? PORTAL_DEFAULTS.exposure;
		renderer.domElement.style.willChange = 'transform, opacity';
		root.appendChild(renderer.domElement);
		// `bloom: false` -> bỏ UnrealBloomPass, chỉ giữ RenderPass + OutputPass.
		// OutputPass vẫn BẮT BUỘC phải giữ: shader của module là ShaderMaterial tự viết,
		// không có #include <tonemapping_fragment> / <colorspace_fragment>, nên three.js
		// không tự chèn tone mapping + chuyển sRGB cho nó. Bỏ OutputPass thì màu sẽ
		// sai (ảnh tuyến tính bị đọc như sRGB -> nhợt, mờ).
		const useBloom = options.bloom !== false;
		const bloom = {
			...PORTAL_DEFAULTS.bloom,
			...(options.bloom || {})
		};
		composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		if (useBloom) {
			bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), bloom.strength, bloom.radius, bloom.threshold);
			// Nền trong suốt: phải vá alpha của bloom, nếu không canvas sẽ đục.
			if (options.transparent) makeBloomAlphaSafe(bloomPass);
			composer.addPass(bloomPass);
		}
		composer.addPass(new OutputPass());
	}
	// ---- Scanline (mặc định chỉ bật ở chế độ dựng cảnh riêng) -----------
	let scanlinesEl = null;
	if (options.scanlines ?? !sharedScene) {
		scanlinesEl = document.createElement('div');
		scanlinesEl.className = 'p3d-scanlines';
		root.appendChild(scanlinesEl);
	}
	// ---- Hạt nền ----------------------------------------------------------
	let vortex = null;
	if (options.particles !== false && !sharedScene) {
		vortex = createPortalVortex({
			count: options.particleCount ?? PORTAL_DEFAULTS.particleCount
		});
		scene.add(vortex.object3D);
	}
	// ---- Nhãn 2D ----------------------------------------------------------
	let labelRoot = null;
	const labelEls = new Map();
	if (wantLabels) {
		labelRoot = document.createElement('div');
		labelRoot.className = 'p3d-labels';
		root.appendChild(labelRoot);
	}
	const portals = [];
	const hitTargets = [];

	function addPortal(def = {}) {
		const portal = createMagicPortal({
			...def,
			phase: def.phase ?? portals.length * 2.0
		});
		scene.add(portal.group);
		portals.push(portal);
		if (interactiveMode) hitTargets.push(portal.hitMesh);
		if (labelRoot && portal.label) {
			const el = document.createElement('div');
			el.className = `p3d-label${portal.labelVariant ? ` p3d-label--${portal.labelVariant}` : ''}`;
			el.textContent = portal.label;
			labelRoot.appendChild(el);
			labelEls.set(portal.id, el);
		}
		return portal;
	}

	function removePortal(id) {
		const index = portals.findIndex((p) => p.id === id);
		if (index === -1) return;
		const [portal] = portals.splice(index, 1);
		portal.dispose();
		const hitIndex = hitTargets.indexOf(portal.hitMesh);
		if (hitIndex !== -1) hitTargets.splice(hitIndex, 1);
		const el = labelEls.get(id);
		if (el) {
			el.remove();
			labelEls.delete(id);
		}
	}
	(options.portals || DEFAULT_PORTALS).forEach(addPortal);
	// ---- Tương tác (raycast) --------------------------------------------
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(-999, -999);
	let hoveredId = null;
	let pointerInside = false;

	function updatePointerFromEvent(event) {
		const rect = root.getBoundingClientRect();
		if (!rect.width || !rect.height) return false;
		pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		return true;
	}

	function raycastPortal() {
		if (!interactiveMode || !hitTargets.length) return null;
		raycaster.setFromCamera(pointer, camera);
		const hits = raycaster.intersectObjects(hitTargets, false);
		if (!hits.length) return null;
		return portals.find((p) => p.hitMesh === hits[0].object) || null;
	}

	function setHovered(portal) {
		const nextId = portal ? portal.id : null;
		if (nextId === hoveredId) return;
		hoveredId = nextId;
		portals.forEach((p) => p.setHovered(p.id === nextId));
		labelEls.forEach((el, id) => el.classList.toggle('is-hovered', id === nextId));
		if (interactiveMode === true) root.style.cursor = nextId ? 'pointer' : 'default';
	}

	function selectPortal(portal) {
		if (!portal) return;
		portal.punch();
		if (typeof portal.onSelect === 'function') {
			portal.onSelect(portal);
		} else if (typeof options.onSelect === 'function') {
			options.onSelect(portal);
		} else if (typeof portal.link === 'function') {
			portal.link(portal);
		} else if (typeof portal.link === 'string' && portal.link && portal.link !== 'modal') {
			window.open(portal.link, '_blank', 'noopener');
		}
	}
	let downX = 0;
	let downY = 0;
	let downTime = 0;

	function onPointerDown(event) {
		downX = event.clientX;
		downY = event.clientY;
		downTime = performance.now();
	}

	function onPointerUp(event) {
		if (!interactiveMode) return;
		// Phân biệt click với drag (kéo xoay camera của app.js)
		const moved = Math.hypot(event.clientX - downX, event.clientY - downY);
		if (moved > PORTAL_DEFAULTS.clickMoveTolerance) return;
		if (performance.now() - downTime > PORTAL_DEFAULTS.clickMaxDuration) return;
		// Chế độ passive: bỏ qua khi bấm vào UI của trang (dock, modal, nút...)
		if (interactiveMode === 'passive' && options.ignoreSelector) {
			const ui = event.target instanceof Element && event.target.closest(options.ignoreSelector);
			if (ui) return;
		}
		if (!updatePointerFromEvent(event)) return;
		selectPortal(raycastPortal());
	}

	function onPointerMove(event) {
		if (!interactiveMode) return;
		pointerInside = updatePointerFromEvent(event);
	}

	function onPointerLeave() {
		pointerInside = false;
		setHovered(null);
	}

	function bindEvents(mode) {
		const target = mode === 'passive' ? window : root;
		const opts = mode === 'passive' ? {
			passive: true
		} : false;
		target.addEventListener('pointermove', onPointerMove, opts);
		target.addEventListener('pointerdown', onPointerDown, opts);
		target.addEventListener('pointerup', onPointerUp, opts);
		if (mode === 'passive') target.addEventListener('pointerout', onPointerLeave, opts);
		else root.addEventListener('pointerleave', onPointerLeave);
		root.classList.toggle('p3d-interactive', mode === true);
	}

	function unbindEvents() {
		const target = interactiveMode === 'passive' ? window : root;
		const opts = interactiveMode === 'passive' ? {
			passive: true
		} : false;
		target.removeEventListener('pointermove', onPointerMove, opts);
		target.removeEventListener('pointerdown', onPointerDown, opts);
		target.removeEventListener('pointerup', onPointerUp, opts);
		if (interactiveMode === 'passive') target.removeEventListener('pointerout', onPointerLeave, opts);
		root.removeEventListener('pointerleave', onPointerLeave);
		root.classList.remove('p3d-interactive');
	}
	bindEvents(interactiveMode);

	function setInteractive(mode) {
		unbindEvents();
		interactiveMode = mode;
		pointerInside = false;
		setHovered(null);
		hitTargets.length = 0;
		portals.forEach((p) => hitTargets.push(p.hitMesh));
		bindEvents(interactiveMode);
	}
	// ---- Camera responsive ------------------------------------------------
	function fitCamera() {
		if (sharedScene) return;
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
		if (!renderer) return;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio ?? 2));
		renderer.setSize(width, height, false);
		composer.setSize(width, height);
	}
	// ---- Nhãn 2D theo tọa độ 3D -----------------------------------------
	const tmpVec = new THREE.Vector3();

	function updateLabels() {
		if (!labelRoot || !labelEls.size) return;
		const width = root.clientWidth || 1;
		const height = root.clientHeight || 1;
		const narrow = width < 600;
		const offsetY = narrow ? labelCfg.offsetYMobile : labelCfg.offsetY;
		const padding = narrow ? labelCfg.paddingMobile : labelCfg.padding;
		portals.forEach((portal) => {
			const el = labelEls.get(portal.id);
			if (!el) return;
			portal.group.getWorldPosition(tmpVec);
			tmpVec.y -= offsetY;
			tmpVec.project(camera);
			const outside = tmpVec.z > 1 || tmpVec.x < -1.2 || tmpVec.x > 1.2 || tmpVec.y < -1.2 || tmpVec.y > 1.2;
			if (outside) {
				el.classList.add('p3d-label--hidden');
				return;
			}
			el.classList.remove('p3d-label--hidden');
			let x = (tmpVec.x * 0.5 + 0.5) * width;
			const y = (-tmpVec.y * 0.5 + 0.5) * height;
			x = Math.max(padding, Math.min(width - padding, x));
			el.style.left = `${x}px`;
			el.style.top = `${y}px`;
		});
	}
	// ---- Vòng lặp ---------------------------------------------------------
	const clock = new THREE.Clock();
	let rafId = null;
	let userActive = true;
	let inView = true;

	function isRenderable() {
		if (typeof document !== 'undefined' && document.hidden) return false;
		if (!inView) return false;
		// Chỉ cần đo lại khi không có IntersectionObserver hỗ trợ
		if (typeof IntersectionObserver !== 'undefined') return true;
		const rect = root.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0;
	}

	function update(elapsed, delta) {
		const d = Math.min(delta ?? 0, 0.1);
		if (vortex) vortex.update(elapsed);
		if (interactiveMode && pointerInside) setHovered(raycastPortal());
		else if (!interactiveMode) setHovered(null);
		portals.forEach((portal) => portal.update(elapsed, d));
		// Nhãn 2D cần ma trận thế giới đã cập nhật từ frame trước
		if (labelRoot && labelEls.size) {
			scene.updateMatrixWorld(true);
			updateLabels();
		}
	}

	function tick() {
		rafId = requestAnimationFrame(tick);
		if (!userActive || !isRenderable()) return;
		const delta = clock.getDelta();
		const elapsed = clock.getElapsedTime();
		update(elapsed, delta);
		if (composer) composer.render();
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
		get scene() {
			return scene;
		},
		get camera() {
			return camera;
		},
		get renderer() {
			return renderer;
		},
		addPortal,
		removePortal,
		setLabel(id, text) {
			const portal = portals.find((p) => p.id === id);
			if (portal) portal.label = text;
			const el = labelEls.get(id);
			if (el) el.textContent = text;
		},
		setInteractive,
		setActive(value) {
			userActive = !!value;
			if (userActive) clock.getDelta();
		},
		start,
		stop,
		resize,
		update,
		destroy() {
			stop();
			unbindEvents();
			window.removeEventListener('resize', resize);
			resizeObserver?.disconnect();
			intersectionObserver?.disconnect();
			portals.forEach((portal) => portal.dispose());
			portals.length = 0;
			vortex?.dispose();
			vortex = null;
			if (renderer) {
				disposeObject3D(scene);
				composer?.dispose?.();
				renderer.dispose();
			}
			root.remove();
			controller.destroyed = true;
		},
		destroyed: false
	};
	if (autoStart) start();
	return controller;
}
// Cho phép dùng nhanh từ console / script không phải module
if (typeof window !== 'undefined') {
	window.initPortal3D = createPortalScene;
	window.Portal3D = {
		createPortalScene,
		createMagicPortal,
		createPortalVortex,
		DEFAULT_PORTALS
	};
}
export default createPortalScene;