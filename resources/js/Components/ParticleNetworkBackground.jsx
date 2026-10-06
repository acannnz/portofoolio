import React, { useEffect, useRef } from 'react';

const MAX_LINK_DISTANCE = 125;
const PURPLE = '#a855f7';
const CYAN = '#06b6d4';

function particleCountFor(width, height) {
    return width < 768
        ? Math.min(Math.floor((width * height) / 18000), 45)
        : Math.min(Math.floor((width * height) / 14000), 95);
}

export default function ParticleNetworkBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return undefined;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const mouse = { x: null, y: null, radius: 180, attractRadius: 220, isPressed: false };
        const attractRadiusSq = mouse.attractRadius * mouse.attractRadius;
        const maxDistanceSq = MAX_LINK_DISTANCE * MAX_LINK_DISTANCE;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Slow & smooth floating velocity
                this.baseVx = (Math.random() - 0.5) * 0.3;
                this.baseVy = (Math.random() - 0.5) * 0.3;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.radius = Math.random() * 1.8 + 1.2;
                this.color = Math.random() > 0.4 ? PURPLE : CYAN;
            }

            update() {
                let isAttracted = false;

                // Attraction only while the pointer is pressed and the particle is inside the radius
                if (mouse.isPressed && mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < attractRadiusSq) {
                        isAttracted = true;
                        if (distSq > 64) {
                            const dist = Math.sqrt(distSq);
                            const force = (mouse.attractRadius - dist) / mouse.attractRadius;
                            this.vx += (dx / dist) * force * 0.12;
                            this.vy += (dy / dist) * force * 0.12;
                        }
                        this.vx *= 0.95;
                        this.vy *= 0.95;
                    }
                }

                if (!isAttracted) {
                    this.vx += (this.baseVx - this.vx) * 0.04;
                    this.vy += (this.baseVy - this.vy) * 0.04;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Bounce gently on boundaries
                if (this.x < 0) { this.x = 0; this.vx *= -1; }
                if (this.x > width) { this.x = width; this.vx *= -1; }
                if (this.y < 0) { this.y = 0; this.vy *= -1; }
                if (this.y > height) { this.y = height; this.vy *= -1; }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        let particles = [];
        const initParticles = () => {
            particles = Array.from({ length: particleCountFor(width, height) }, () => new Particle());
        };

        const isNearPressedMouse = (p) => {
            if (!mouse.isPressed || mouse.x === null) return false;
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            return dx * dx + dy * dy < attractRadiusSq;
        };

        const drawFrame = () => {
            ctx.clearRect(0, 0, width, height);

            // Pass 1: particles (glow is only paid for here, once per particle)
            ctx.shadowBlur = mouse.isPressed ? 10 : 6;
            for (const p of particles) {
                p.update();
                ctx.shadowColor = p.color;
                p.draw();
            }

            // Pass 2: links between particles, no glow
            ctx.shadowBlur = 0;
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq >= maxDistanceSq) continue; // cheap rejection on squared distance

                    const nearMouse = isNearPressedMouse(p1) || isNearPressedMouse(p2);
                    const alpha = (1 - Math.sqrt(distSq) / MAX_LINK_DISTANCE) * (nearMouse ? 0.5 : 0.35);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = nearMouse ? `rgba(6, 182, 212, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
                    ctx.lineWidth = nearMouse ? 1.2 : 1;
                    ctx.stroke();
                }
            }

            // Pass 3: links to the pointer
            if (mouse.x !== null) {
                const radius = mouse.isPressed ? mouse.attractRadius : mouse.radius;
                ctx.shadowColor = CYAN;
                ctx.shadowBlur = mouse.isPressed ? 8 : 4;
                ctx.lineWidth = mouse.isPressed ? 1.4 : 1.2;
                for (const p of particles) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq >= radius * radius) continue;

                    const alpha = (1 - Math.sqrt(distSq) / radius) * (mouse.isPressed ? 0.6 : 0.4);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
            }
        };

        const animate = () => {
            drawFrame();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles(); // particle count depends on the viewport size
            if (reduceMotion) drawFrame();
        };

        const setPointer = (x, y) => {
            mouse.x = x;
            mouse.y = y;
        };
        const handleMouseMove = (e) => setPointer(e.clientX, e.clientY);
        const handleDown = () => { mouse.isPressed = true; };
        const handleUp = () => { mouse.isPressed = false; };
        const handleLeave = () => { setPointer(null, null); mouse.isPressed = false; };
        const handleTouchStart = (e) => {
            const t = e.touches[0];
            if (t) { setPointer(t.clientX, t.clientY); mouse.isPressed = true; }
        };
        const handleTouchMove = (e) => {
            const t = e.touches[0];
            if (t) setPointer(t.clientX, t.clientY);
        };
        const handleVisibilityChange = () => {
            if (reduceMotion) return;
            cancelAnimationFrame(animationFrameId);
            if (!document.hidden) animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        // Reduced motion: render one static frame instead of an endless animation
        if (reduceMotion) drawFrame();
        else animate();

        const passive = { passive: true };
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('mouseleave', handleLeave);
        window.addEventListener('touchstart', handleTouchStart, passive);
        window.addEventListener('touchmove', handleTouchMove, passive);
        window.addEventListener('touchend', handleLeave, passive);
        window.addEventListener('touchcancel', handleLeave, passive);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('mouseleave', handleLeave);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleLeave);
            window.removeEventListener('touchcancel', handleLeave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 w-full h-full" />;
}
