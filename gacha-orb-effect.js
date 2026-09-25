// Hiệu ứng phép thuật cho nút Gacha
(function() {
    const canvas = document.getElementById('gachaOrbCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const orbRadius = 52; // Tăng từ 35 lên 52 (50% lớn hơn)

    let time = 0;
    let mouse = { x: centerX, y: centerY, targetX: centerX, targetY: centerY, active: false };
    
    // Hàm kiểm tra giá trị Tinh Quang để đổi tone màu
    function getTinhQuangValue() {
        const valElement = document.getElementById('valTinhQuang');
        return valElement ? parseInt(valElement.textContent) || 0 : 0;
    }
    
    // Hàm lấy màu sắc dựa trên giá trị Tinh Quang
    function getOrbColors() {
        const value = getTinhQuangValue();
        
        if (value >= 1) {
            // Tone xanh-trắng (có Tinh Quang)
            return {
                particleColors: ['rgba(157, 0, 255,', 'rgba(0, 234, 255,'],
                shadowColors: ['#8a00ff', '#00ffff', '#ffffff', '#b8ffff'],
                wispColors: ['rgba(138, 0, 255, 0.35)', 'rgba(0, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.7)'],
                coreGradient: ['#ffffff', '#61c99c', '#00bfff', '#ffffff']
            };
        } else {
            // Tone đỏ-vàng (hết Tinh Quang)
            return {
                particleColors: ['rgba(255, 69, 0,', 'rgba(255, 200, 0,'],
                shadowColors: ['#ff4500', '#ffa500', '#ffff00', '#ffd700'],
                wispColors: ['rgba(255, 69, 0, 0.35)', 'rgba(255, 165, 0, 0.5)', 'rgba(255, 255, 0, 0.7)'],
                coreGradient: ['#ffffff', '#ff8c00', '#ff4500', '#ffffff']
            };
        }
    }

    // Lớp quản lý các hạt tinh linh năng lượng (Mana Particles)
    class ManaParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.dist = Math.random() * 10;
            this.speed = Math.random() * 0.8 + 0.3;
            this.size = Math.random() * 1.2 + 0.3;
            this.alpha = Math.random() * 0.5 + 0.5;
            // Động động lấy màu từ getOrbColors()
            const colors = getOrbColors();
            this.color = Math.random() < 0.5 ? colors.particleColors[0] : colors.particleColors[1];
            this.wobbleSpeed = Math.random() * 0.05 + 0.02;
        }
        update() {
            this.dist += this.speed;
            this.angle += Math.sin(time * this.wobbleSpeed) * 0.02;
            this.alpha -= 0.007;

            if (this.dist > orbRadius || this.alpha <= 0) {
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

    const particles = Array.from({ length: 30 }, () => new ManaParticle());

    // Vẽ dòng chảy năng lượng mềm
    function drawMagicWisp(layer, color, waveCount, amplitude, speedMultiplier) {
        ctx.beginPath();
        const totalPoints = 80;
        
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        for (let i = 0; i <= totalPoints; i++) {
            const angle = (i / totalPoints) * Math.PI * 2;
            
            const wave = Math.sin(angle * waveCount + time * speedMultiplier) * amplitude 
                       + Math.cos(angle * (waveCount / 2) - time * 0.7) * (amplitude * 0.5);

            let r = orbRadius - 8 + wave;

            if (mouse.active) {
                const mouseAngle = Math.atan2(mouse.y - centerY, mouse.x - centerX);
                let angleDiff = angle - mouseAngle;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                
                if (Math.abs(angleDiff) < 1.2) {
                    const pull = (1.2 - Math.abs(angleDiff)) * 15;
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
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function animate() {
        time += 0.04;
        
        // Lấy màu sắc hiện tại dựa trên giá trị Tinh Quang
        const colors = getOrbColors();
        
        // Xóa canvas trong suốt hoàn toàn
        ctx.clearRect(0, 0, width, height);

        ctx.shadowBlur = 0;
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        ctx.shadowBlur = 15;
        
        ctx.shadowColor = colors.shadowColors[0];
        drawMagicWisp(1, colors.wispColors[0], 5, 6, 1.2);
        
        ctx.shadowColor = colors.shadowColors[1];
        drawMagicWisp(2, colors.wispColors[1], 7, 4, -1.8);

        ctx.shadowColor = colors.shadowColors[2];
        drawMagicWisp(3, colors.wispColors[2], 4, 2.5, 2.5);

        ctx.shadowBlur = 25;
        ctx.shadowColor = colors.shadowColors[3];
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 28);
        coreGradient.addColorStop(0, colors.coreGradient[0]);
        coreGradient.addColorStop(0.2, colors.coreGradient[1]);
        coreGradient.addColorStop(0.8, colors.coreGradient[2]);
        coreGradient.addColorStop(1, colors.coreGradient[3]);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 38, 0, Math.PI * 2); // Tăng từ 25 lên 38
        ctx.fill();

        requestAnimationFrame(animate);
    }

    animate();

    // Xử lý tương tác chuột
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dist = Math.sqrt((mx - centerX)**2 + (my - centerY)**2);
        
        if (dist <= orbRadius) {
            mouse.targetX = mx;
            mouse.targetY = my;
            mouse.active = true;
        } else {
            mouse.active = false;
        }
    });

    canvas.addEventListener('mouseleave', () => { mouse.active = false; });
})();
