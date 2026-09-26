/**
 * Button VFX Particle System - Hiệu ứng hạt khi hover/click button
 * Style 01: Celtic Fantasy - Leaf/Emerald dust
 * Style 02: Medieval RPG - Forge Sparks
 * Style 05: Magical RPG - Cosmic Starburst
 */

// Setup canvas
const vfxCanvas = document.getElementById('vfxCanvas');
const vfxCtx = vfxCanvas ? vfxCanvas.getContext('2d') : null;

let vfxWidth = window.innerWidth;
let vfxHeight = window.innerHeight;
let vfxParticles = [];

function resizeVfxCanvas() {
    vfxWidth = window.innerWidth;
    vfxHeight = window.innerHeight;
    if (vfxCanvas) {
        vfxCanvas.width = vfxWidth;
        vfxCanvas.height = vfxHeight;
    }
}

if (vfxCanvas) {
    resizeVfxCanvas();
    window.addEventListener('resize', resizeVfxCanvas);
}

class VfxParticle {
    constructor(x, y, style) {
        this.x = x;
        this.y = y;
        this.style = style;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;

        if (style === 'celtic') {
            // Style 01: Leaf / Nature Emerald dust
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2 - 1;
            this.size = Math.random() * 4 + 2;
            this.color = Math.random() > 0.5 ? '#34d399' : '#fef08a';
            this.rotation = Math.random() * Math.PI;
            this.shape = 'leaf';
        } else if (style === 'medieval') {
            // Style 02: Forge Sparks (golden/orange)
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = -Math.random() * 3 - 1;
            this.size = Math.random() * 3 + 1;
            this.color = Math.random() > 0.3 ? '#fbbf24' : '#f97316';
            this.shape = 'circle';
        } else if (style === 'magical') {
            // Style 05: Cosmic Starburst (purple/cyan)
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 3 + 2;
            this.color = Math.random() > 0.5 ? '#a855f7' : '#38bdf8';
            this.shape = 'circle';
        } else {
            // Default fallback
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 3 + 1;
            this.color = '#ffffff';
            this.shape = 'circle';
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        // Gravity effect for medieval sparks
        if (this.style === 'medieval') {
            this.vy += 0.05;
        }
        // Fade out
        this.vx *= 0.99;
        this.vy *= 0.99;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;

        if (this.shape === 'leaf') {
            // Draw small leaf/diamond shape for Celtic
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation || 0);
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size / 2, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size / 2, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw circular particle for others
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow for magical
            if (this.style === 'magical') {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

// Render Loop
function renderVFX() {
    if (!vfxCtx) return;
    
    vfxCtx.clearRect(0, 0, vfxWidth, vfxHeight);
    
    for (let i = vfxParticles.length - 1; i >= 0; i--) {
        const p = vfxParticles[i];
        p.update();
        p.draw(vfxCtx);
        if (p.life <= 0) {
            vfxParticles.splice(i, 1);
        }
    }
    requestAnimationFrame(renderVFX);
}

if (vfxCtx) {
    renderVFX();
}

/**
 * Attach VFX to a button
 * @param {HTMLElement} btn - Button element
 * @param {string} style - 'celtic' | 'medieval' | 'magical'
 */
export function attachButtonVFX(btn, style) {
    if (!btn || !vfxCanvas) return;

    // Hover particles spawn
    btn.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.3) { // 30% chance per mousemove
            vfxParticles.push(new VfxParticle(e.clientX, e.clientY, style));
        }
    });

    // Click particle burst
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const burstCount = style === 'medieval' ? 30 : 25;
        
        for (let i = 0; i < burstCount; i++) {
            vfxParticles.push(new VfxParticle(centerX, centerY, style));
        }
    });
}

/**
 * Auto-attach VFX to all buttons with data-vfx-style attribute
 */
export function initButtonVFX() {
    if (!vfxCanvas) return;
    
    // Map button selectors to VFX styles
    const buttonVFXMap = [
        // Style 01: Celtic Fantasy
        { selector: '.btn-celtic', style: 'celtic' },
        // Style 02: Medieval RPG
        { selector: '.btn-medieval', style: 'medieval' },
        // Style 05: Magical RPG
        { selector: '.btn-magical', style: 'magical' },
    ];

    buttonVFXMap.forEach(({ selector, style }) => {
        document.querySelectorAll(selector).forEach(btn => {
            attachButtonVFX(btn, style);
        });
    });
}

// Also expose globally for non-module usage
if (typeof window !== 'undefined') {
    window.attachButtonVFX = attachButtonVFX;
    window.initButtonVFX = initButtonVFX;
}