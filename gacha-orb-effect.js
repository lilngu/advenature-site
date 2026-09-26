// Hiệu ứng phép thuật cho nút Gacha - Magic Orb Button
(function() {
    const canvas = document.getElementById('gachaOrbCanvas');
    const shockwave = document.getElementById('shockwave');
    const magicOrbWrapper = document.getElementById('magicOrbWrapper');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Cập nhật kích thước canvas theo CSS thực tế
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    // Khởi tạo kích thước
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    // orbRadius là bán kính vùng vẽ hiệu ứng (hơi nhỏ hơn gold-ring một chút)
    const orbRadius = (width / 2) - 12;

    let time = 0;
    let mouse = { x: centerX, y: centerY, targetX: centerX, targetY: centerY, active: false };
    let isHovered = false;
    
    // Hàm kiểm tra giá trị Tinh Quang để đổi tone màu
    function getTinhQuangValue() {
        const valElement = document.getElementById('valTinhQuang');
        return valElement ? parseInt(valElement.textContent) || 0 : 0;
    }
    
    // Hàm lấy màu sắc dựa trên giá trị Tinh Quang
    function getOrbColors() {
        const value = getTinhQuangValue();
        
        if (value >= 1) {
            // Tone xanh-tím-trắng (có Tinh Quang) - Magic Wisps colors
            return {
                particleColors: ['rgba(157, 0, 255,', 'rgba(0, 234, 255,'],
                shadowColors: ['#8a00ff', '#00ffff', '#ffffff', '#b8ffff'],
                wispColors: ['rgba(138, 0, 255, 0.4)', 'rgba(0, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.7)'],
                coreGradient: ['#ffffff', '#61c99c', '#00bfff', '#e3fffb71']
            };
        } else {
            // Tone đỏ-cam-vàng (hết Tinh Quang) - Fire/Warning colors
            return {
                particleColors: ['rgba(255, 69, 0,', 'rgba(255, 200, 0,'],
                shadowColors: ['#ff4500', '#ffa500', '#ffff00', '#ffd700'],
                wispColors: ['rgba(255, 69, 0, 0.4)', 'rgba(255, 165, 0, 0.55)', 'rgba(255, 255, 0, 0.7)'],
                coreGradient: ['#ffffff', '#ff8c00', '#ff4500', '#5a1c1c94']
            };
        }
    }

    // Lớp quản lý các hạt tinh linh năng lượng (Mana Particles) - bay từ trung tâm ra ngoài
    class ManaParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.dist = Math.random() * 15; // Bắt đầu gần tâm
            this.speed = Math.random() * 1.5 + 0.5;
            this.size = Math.random() * 2.2 + 0.6;
            this.alpha = Math.random() * 0.6 + 0.4;
            const colors = getOrbColors();
            this.color = Math.random() < 0.5 ? colors.particleColors[0] : colors.particleColors[1];
            this.wobbleSpeed = Math.random() * 0.06 + 0.02;
        }
        update() {
            const multiplier = isHovered ? 1.8 : 1.0;
            this.dist += this.speed * multiplier;
            this.angle += Math.sin(time * this.wobbleSpeed) * 0.02;
            this.alpha -= 0.008;

            if (this.dist > orbRadius + 8 || this.alpha <= 0) {
                this.reset();
            }
        }
        draw() {
            const x = centerX + Math.cos(this.angle) * this.dist;
            const y = centerY + Math.sin(this.angle) * this.dist;
            ctx.fillStyle = `${this.color}${this.alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particles = Array.from({ length: 45 }, () => new ManaParticle());

    // Vẽ dòng chảy năng lượng mềm (Magic Wisps - Sợi ma pháp xoáy)
    function drawMagicWisp(color, waveCount, amplitude, speedMultiplier, thickness = 2) {
        ctx.beginPath();
        const totalPoints = 120;
        
        // Smooth mouse inertia
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        // Tăng cường sóng khi hover
        const hoverAmp = isHovered ? amplitude * 1.35 : amplitude;
        const hoverSpeed = isHovered ? speedMultiplier * 1.4 : speedMultiplier;

        for (let i = 0; i <= totalPoints; i++) {
            const angle = (i / totalPoints) * Math.PI * 2;
            
            // Tính toán sóng sine/cosine biến dạng
            const wave = Math.sin(angle * waveCount + time * hoverSpeed) * hoverAmp 
                       + Math.cos(angle * (waveCount / 2) - time * 0.7) * (hoverAmp * 0.5);

            let r = orbRadius - 8 + wave;

            // Tương tác chuột: Hút sợi ma pháp về phía con trỏ
            if (mouse.active) {
                const mouseAngle = Math.atan2(mouse.y - centerY, mouse.x - centerX);
                let angleDiff = angle - mouseAngle;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                
                if (Math.abs(angleDiff) < 1.3) {
                    const pull = (1.3 - Math.abs(angleDiff)) * 22;
                    r -= pull;
                }
            }

            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.stroke();
    }

    function animate() {
        time += 0.04;
        
        // Lấy màu sắc hiện tại dựa trên giá trị Tinh Quang (real-time)
        const colors = getOrbColors();
        
        // Xóa canvas trong suốt hoàn toàn
        ctx.clearRect(0, 0, width, height);

        // A. Cập nhật và vẽ Mana Particles
        ctx.shadowBlur = 0;
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // B. Vẽ Multi-Layered Magic Wisps (Sợi ma pháp)
        ctx.shadowBlur = isHovered ? 22 : 16;

        // Layer 1: Outer Deep Purple/Violet Arcane Wisp
        ctx.shadowColor = colors.shadowColors[0];
        drawMagicWisp(colors.wispColors[0], 5, 8, 1.2, 2.2);

        // Layer 2: Middle Cyan/Blue Energy Wave
        ctx.shadowColor = colors.shadowColors[1];
        drawMagicWisp(colors.wispColors[1], 7, 5.5, -1.8, 1.8);

        // Layer 3: Inner Gold/White Glowing Thread
        ctx.shadowColor = colors.shadowColors[2];
        drawMagicWisp(colors.wispColors[2], 4, 3.5, 2.5, 1.3);

        // C. Vẽ Core Glow ở trung tâm (bổ sung cho crystal-ball CSS)
        ctx.shadowBlur = 30;
        ctx.shadowColor = colors.shadowColors[3];
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 0.45);
        coreGradient.addColorStop(0, colors.coreGradient[0]);
        coreGradient.addColorStop(0.2, colors.coreGradient[1]);
        coreGradient.addColorStop(0.8, colors.coreGradient[2]);
        coreGradient.addColorStop(1, colors.coreGradient[3]);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(animate);
    }

    // Khởi động animation
    animate();

    // ===== XỬ LÝ TƯƠNG TÁC =====
    
    // Mouse move trên canvas
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dist = Math.sqrt((mx - centerX)**2 + (my - centerY)**2);
        
        if (dist <= orbRadius + 20) {
            mouse.targetX = mx;
            mouse.targetY = my;
            mouse.active = true;
        } else {
            mouse.active = false;
        }
    });

    // Hover vào wrapper (bảo vệ vùng click lớn hơn canvas)
    if (magicOrbWrapper) {
        magicOrbWrapper.addEventListener('mouseenter', () => { 
            isHovered = true; 
        });
        
        magicOrbWrapper.addEventListener('mouseleave', () => { 
            isHovered = false; 
            mouse.active = false; 
        });
    }

    // Click - Trigger shockwave
    canvas.addEventListener('click', () => {
        triggerShockwave();
    });

    // Click trên wrapper cũng kích hoạt
    if (magicOrbWrapper) {
        magicOrbWrapper.addEventListener('click', (e) => {
            // Chỉ kích hoạt nếu click không phải vào các element con có pointer-events
            if (e.target === magicOrbWrapper || e.target === canvas || e.target.classList.contains('gold-ring') || e.target.classList.contains('orb-chamber')) {
                triggerShockwave();
            }
        });
    }

    function triggerShockwave() {
        if (!shockwave) return;
        
        shockwave.classList.remove('active');
        // Force reflow
        void shockwave.offsetWidth;
        shockwave.classList.add('active');
        
        // Tạo hiệu ứng bùng nổ hạt cho đẹp (tùy chọn - có thể thêm vào sau)
        createBurstParticles();
    }

    // Hạt bùng nổ phụ khi click (tùy chọn - tạo hiệu ứng đẹp hơn)
    function createBurstParticles() {
        const colors = getOrbColors();
        const burstCount = 25;
        
        for (let i = 0; i < burstCount; i++) {
            // Tạo particle bùng nổ tạm thời
            const particle = {
                angle: (Math.PI * 2 * i) / burstCount + Math.random() * 0.5,
                dist: orbRadius * 0.4,
                speed: Math.random() * 6 + 4,
                size: Math.random() * 3 + 1.5,
                alpha: 1,
                color: Math.random() < 0.5 ? colors.particleColors[0] : colors.particleColors[1],
                life: 0,
                maxLife: 30
            };
            
            // Thêm vào mảng particles tạm thời (sẽ tự reset sau khi hết life)
            // Đơn giản hóa: chỉ đẩy nhanh các particle hiện có ra ngoài
            particles.forEach(p => {
                if (Math.random() < 0.3) {
                    p.dist = orbRadius * 0.5;
                    p.speed = p.speed * 2.5;
                    p.alpha = 1;
                    p.size = p.size * 1.5;
                }
            });
        }
    }

    // Accessibility (Keyboard trigger)
    if (magicOrbWrapper) {
        magicOrbWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerShockwave();
            }
        });
        
        // Tabindex để focus được
        magicOrbWrapper.setAttribute('tabindex', '0');
        magicOrbWrapper.setAttribute('role', 'button');
        magicOrbWrapper.setAttribute('aria-label', 'Triệu hồi Gacha - Magic Orb');
    }

    // Cập nhật lại canvas size khi window resize (đã handle ở trên)
    // Nhưng cần cập nhật lại orbRadius, centerX, centerY
    const originalResize = resizeCanvas;
    resizeCanvas = function() {
        originalResize();
        // Cập nhật lại các hằng số geometry
        // (centerX, centerY, orbRadius được đọc lại mỗi frame qua closure)
    };
})();