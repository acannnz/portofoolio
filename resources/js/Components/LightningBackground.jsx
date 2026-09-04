import React, { useEffect, useRef } from 'react';

export default function LightningBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Lightning / Plasma Bolt Class
        class Lightning {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = 0;
                this.xEnd = this.x + (Math.random() * 300 - 150);
                this.yEnd = height * (0.6 + Math.random() * 0.4);
                this.life = 0;
                this.maxLife = 20 + Math.random() * 25;
                this.branches = [];
                this.color = Math.random() > 0.4 ? '#a855f7' : '#06b6d4'; // Purple or Cyan
                this.generatePath();
            }

            generatePath() {
                this.path = [{ x: this.x, y: this.y }];
                let currentX = this.x;
                let currentY = this.y;

                const steps = 18;
                const dy = (this.yEnd - this.y) / steps;

                for (let i = 0; i < steps; i++) {
                    currentY += dy;
                    currentX += (Math.random() - 0.5) * 45;
                    this.path.push({ x: currentX, y: currentY });

                    // Generate small side branches
                    if (Math.random() < 0.25 && i > 3 && i < steps - 3) {
                        this.branches.push(this.generateBranch(currentX, currentY));
                    }
                }
            }

            generateBranch(startX, startY) {
                const branchPath = [{ x: startX, y: startY }];
                let bx = startX;
                let by = startY;
                const length = 4 + Math.floor(Math.random() * 5);
                const angle = (Math.random() - 0.5) * Math.PI * 0.6;

                for (let i = 0; i < length; i++) {
                    bx += Math.sin(angle) * 15 + (Math.random() - 0.5) * 12;
                    by += Math.cos(angle) * 15 + Math.random() * 10;
                    branchPath.push({ x: bx, y: by });
                }
                return branchPath;
            }

            draw(ctx) {
                const alpha = Math.max(0, 1 - this.life / this.maxLife);
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15;
                ctx.lineWidth = 1.8;
                ctx.globalAlpha = alpha * 0.45;

                // Draw main bolt
                ctx.beginPath();
                for (let i = 0; i < this.path.length; i++) {
                    if (i === 0) ctx.moveTo(this.path[i].x, this.path[i].y);
                    else ctx.lineTo(this.path[i].x, this.path[i].y);
                }
                ctx.stroke();

                // Draw branches
                ctx.lineWidth = 0.9;
                ctx.globalAlpha = alpha * 0.3;
                this.branches.forEach((bPath) => {
                    ctx.beginPath();
                    for (let i = 0; i < bPath.length; i++) {
                        if (i === 0) ctx.moveTo(bPath[i].x, bPath[i].y);
                        else ctx.lineTo(bPath[i].x, bPath[i].y);
                    }
                    ctx.stroke();
                });

                ctx.restore();
                this.life++;

                if (this.life >= this.maxLife) {
                    this.reset();
                }
            }
        }

        // Animated Beams / Light Waves
        let lightnings = [new Lightning(), new Lightning(), new Lightning()];
        let time = 0;

        const animate = () => {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.25)'; // Smooth fade trail
            ctx.fillRect(0, 0, width, height);

            time += 0.01;

            // Draw moving gradient light aura
            const gradientX = width * 0.5 + Math.sin(time * 0.8) * 200;
            const gradientY = height * 0.3 + Math.cos(time * 0.6) * 150;
            const aura = ctx.createRadialGradient(gradientX, gradientY, 10, gradientX, gradientY, 450);
            aura.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
            aura.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
            aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, width, height);

            // Trigger lightning intermittently
            lightnings.forEach((bolt) => {
                bolt.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
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
