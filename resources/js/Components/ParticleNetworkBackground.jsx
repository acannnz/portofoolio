import React, { useEffect, useRef } from 'react';

export default function ParticleNetworkBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Viewport-fixed sizing for 60fps GPU acceleration across all screen sizes
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        // Mouse Tracker & Click State
        const mouse = {
            x: null,
            y: null,
            radius: 180,
            attractRadius: 220,
            isPressed: false,
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseDown = () => {
            mouse.isPressed = true;
        };

        const handleMouseUp = () => {
            mouse.isPressed = false;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
            mouse.isPressed = false;
        };

        const handleTouchStart = (e) => {
            if (e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
                mouse.isPressed = true;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        };

        const handleTouchEnd = () => {
            mouse.isPressed = false;
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Slow & ultra-smooth floating velocity
                this.baseVx = (Math.random() - 0.5) * 0.3;
                this.baseVy = (Math.random() - 0.5) * 0.3;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.radius = Math.random() * 1.8 + 1.2;
                this.color = Math.random() > 0.4 ? '#a855f7' : '#06b6d4'; // Purple or Cyan
            }

            update() {
                let isAttracted = false;

                // Apply Attraction ONLY if mouse is pressed AND particle is within attractRadius
                if (mouse.isPressed && mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distSq = dx * dx + dy * dy;
                    const attractRadiusSq = mouse.attractRadius * mouse.attractRadius;

                    if (distSq < attractRadiusSq) {
                        isAttracted = true;
                        if (distSq > 64) {
                            const dist = Math.sqrt(distSq);
                            const force = (mouse.attractRadius - dist) / mouse.attractRadius;
                            this.vx += (dx / dist) * force * 0.12;
                            this.vy += (dy / dist) * force * 0.12;
                        }
                        // Damping ONLY for particles inside attraction zone
                        this.vx *= 0.95;
                        this.vy *= 0.95;
                    }
                }

                // Un-attracted particles continue normal floating movement
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

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = mouse.isPressed ? 10 : 6;
                ctx.fill();
            }
        }

        let particles = [];
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile
            ? Math.min(Math.floor((width * height) / 18000), 45)
            : Math.min(Math.floor((width * height) / 14000), 95);

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            const maxDistance = 125;
            const maxDistanceSq = maxDistance * maxDistance;
            const attractRadiusSq = mouse.attractRadius * mouse.attractRadius;

            // Update & Draw Particles
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update();
                p1.draw(ctx);

                // Draw trajectories between particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    // Fast rejection using squared distance
                    if (distSq < maxDistanceSq) {
                        let isNearMouse = false;
                        if (mouse.isPressed && mouse.x !== null && mouse.y !== null) {
                            const d1x = p1.x - mouse.x;
                            const d1y = p1.y - mouse.y;
                            const dist1Sq = d1x * d1x + d1y * d1y;

                            const d2x = p2.x - mouse.x;
                            const d2y = p2.y - mouse.y;
                            const dist2Sq = d2x * d2x + d2y * d2y;

                            if (dist1Sq < attractRadiusSq || dist2Sq < attractRadiusSq) {
                                isNearMouse = true;
                            }
                        }

                        const dist = Math.sqrt(distSq);
                        const alphaMultiplier = isNearMouse ? 0.5 : 0.35;
                        const alpha = (1 - dist / maxDistance) * alphaMultiplier;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isNearMouse 
                            ? `rgba(6, 182, 212, ${alpha})` 
                            : `rgba(168, 85, 247, ${alpha})`;
                        ctx.lineWidth = isNearMouse ? 1.2 : 1;
                        ctx.shadowBlur = 0;
                        ctx.stroke();
                    }
                }

                // Connect to Mouse position if within radius or when holding click
                if (mouse.x !== null && mouse.y !== null) {
                    const mDx = p1.x - mouse.x;
                    const mDy = p1.y - mouse.y;
                    const mDistSq = mDx * mDx + mDy * mDy;
                    const effectiveRadius = mouse.isPressed ? mouse.attractRadius : mouse.radius;
                    const effectiveRadiusSq = effectiveRadius * effectiveRadius;

                    if (mDistSq < effectiveRadiusSq) {
                        const mDist = Math.sqrt(mDistSq);
                        const mAlpha = (1 - mDist / effectiveRadius) * (mouse.isPressed ? 0.6 : 0.4);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${mAlpha})`;
                        ctx.lineWidth = mouse.isPressed ? 1.4 : 1.2;
                        ctx.shadowColor = '#06b6d4';
                        ctx.shadowBlur = mouse.isPressed ? 8 : 4;
                        ctx.stroke();
                    }
                }
            }

            if (!document.hidden) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        />
    );
}
