import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/*
 * Rotating 3D map of the clinic system, drawn on a 2D canvas with a small perspective projection:
 * an EMR core, a ring of modules, an outer orbit of clinic / practice units syncing to the core,
 * and a data packet walking the patient journey (REG -> POLI -> LAB -> E-RX -> KASIR).
 */

const PINK = [244, 114, 182];
const CYAN = [34, 211, 238];
const WHITE = [255, 255, 255];

const MODULES = ['REG', 'POLI', 'LAB', 'E-RX', 'KASIR', 'LOGISTIK'];
const JOURNEY = [0, 1, 2, 3, 4]; // indexes into MODULES, in patient order
const UNITS = 8;

const INNER_R = 1;
const OUTER_R = 1.65;
const OUTER_Y = -0.18;
const OUTER_TILT = 0.2; // rad, outer orbit leans against the module ring
const FLOOR_Y = -0.42;
const PITCH = 0.42; // rad, camera looks slightly down on the rings
const CAMERA = 4.2; // distance, smaller = stronger perspective
const SPIN = 0.22; // rad/s

const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const ring = (count, radius, y, phase = 0) =>
    Array.from({ length: count }, (_, i) => {
        const a = phase + (i / count) * Math.PI * 2;
        return [Math.cos(a) * radius, y, Math.sin(a) * radius];
    });

const MODULE_POINTS = ring(MODULES.length, INNER_R, 0);
const UNIT_POINTS = ring(UNITS, OUTER_R, OUTER_Y, Math.PI / UNITS).map(([x, y, z]) => [
    x,
    y + z * Math.sin(OUTER_TILT),
    z * Math.cos(OUTER_TILT),
]);
const CORE = [0, 0, 0];

function makeProjector(width, height, yaw) {
    const unit = Math.min((width / 2 - 14) / OUTER_R, (height / 2 - 10) / (OUTER_R * Math.sin(PITCH) + 0.35));
    const cx = width / 2;
    const cy = height / 2 + unit * 0.08;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(PITCH);
    const sinP = Math.sin(PITCH);

    return ([x, y, z]) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosP + z1 * sinP;
        const z2 = -y * sinP + z1 * cosP;
        const s = CAMERA / (CAMERA + z2);
        // depth: 0 = nearest, 1 = farthest
        return { x: cx + x1 * s * unit, y: cy - y2 * s * unit, s: s * unit, depth: (z2 + OUTER_R) / (OUTER_R * 2) };
    };
}

function drawFrame(ctx, width, height, time) {
    // Hidden (e.g. the mobile deck on desktop is display:none): nothing to draw, and the scale would go negative
    if (width < 40 || height < 40) return;

    const project = makeProjector(width, height, time * SPIN);
    const showLabels = height >= 100;
    const fade = (depth) => 1 - Math.min(1, Math.max(0, depth)) * 0.65;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';

    // Floor: concentric rings under the system
    for (const r of [0.6, 1.2, 1.85]) {
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
            const a = (i / 48) * Math.PI * 2;
            const p = project([Math.cos(a) * r, FLOOR_Y, Math.sin(a) * r]);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(PINK, 0.12);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const core = project(CORE);
    const modules = MODULE_POINTS.map(project);
    const units = UNIT_POINTS.map(project);

    // Spokes core -> modules, faint uplinks units -> core
    modules.forEach((m) => {
        ctx.beginPath();
        ctx.moveTo(core.x, core.y);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = rgba(PINK, 0.32 * fade(m.depth));
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    units.forEach((u) => {
        ctx.beginPath();
        ctx.moveTo(core.x, core.y);
        ctx.lineTo(u.x, u.y);
        ctx.strokeStyle = rgba(CYAN, 0.1 * fade(u.depth));
        ctx.stroke();
    });

    // Patient journey path
    ctx.beginPath();
    JOURNEY.forEach((idx, i) => {
        const m = modules[idx];
        if (i === 0) ctx.moveTo(m.x, m.y);
        else ctx.lineTo(m.x, m.y);
    });
    ctx.strokeStyle = rgba(PINK, 0.55);
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Units syncing to the core: packets travelling inwards
    UNIT_POINTS.forEach((point, i) => {
        const t = (time * 0.35 + i / UNITS) % 1;
        const p = project(lerp3(point, CORE, t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.s * 0.022), 0, Math.PI * 2);
        ctx.fillStyle = rgba(CYAN, 0.7 * Math.sin(t * Math.PI));
        ctx.fill();
    });

    // Nodes, far to near so near ones overlap
    const nodes = [
        { p: core, kind: 'core' },
        ...modules.map((p, i) => ({ p, kind: 'module', label: MODULES[i] })),
        ...units.map((p) => ({ p, kind: 'unit' })),
    ].sort((a, b) => b.p.depth - a.p.depth);

    for (const { p, kind, label } of nodes) {
        const alpha = fade(p.depth);

        if (kind === 'core') {
            const r = p.s * 0.2;
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.6);
            glow.addColorStop(0, rgba(PINK, 0.55));
            glow.addColorStop(1, rgba(PINK, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba([24, 10, 20], 0.95);
            ctx.fill();
            ctx.strokeStyle = rgba(PINK, 0.95);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Spinning scan arc
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 1.45, time * 2, time * 2 + Math.PI * 0.7);
            ctx.strokeStyle = rgba(WHITE, 0.6);
            ctx.lineWidth = 1;
            ctx.stroke();

            if (showLabels) {
                ctx.font = `700 ${Math.round(Math.max(7, r * 0.55))}px ui-monospace, monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = rgba(WHITE, 0.9);
                ctx.fillText('EMR', p.x, p.y);
            }
            continue;
        }

        if (kind === 'unit') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.2, p.s * 0.035), 0, Math.PI * 2);
            ctx.fillStyle = rgba(CYAN, 0.85 * alpha);
            ctx.fill();
            continue;
        }

        // Module: diamond tile with a light beam
        const r = Math.max(2.5, p.s * 0.07);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r * 3.2);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = rgba(PINK, 0.35 * alpha);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r);
        ctx.lineTo(p.x + r, p.y);
        ctx.lineTo(p.x, p.y + r);
        ctx.lineTo(p.x - r, p.y);
        ctx.closePath();
        ctx.fillStyle = rgba(PINK, 0.9 * alpha);
        ctx.shadowColor = rgba(PINK, 0.9);
        ctx.shadowBlur = 8 * alpha;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (showLabels) {
            ctx.font = `600 ${Math.round(Math.max(7, p.s * 0.085))}px ui-monospace, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = rgba(WHITE, 0.92 * alpha);
            ctx.fillText(label, p.x, p.y - r * 3.4);
        }
    }

    // Patient packet walking the journey, with a short trail
    const steps = JOURNEY.length - 1;
    for (let k = 0; k < 6; k++) {
        const u = (((time * 0.55 - k * 0.035) % steps) + steps) % steps;
        const seg = Math.floor(u);
        const pos = lerp3(MODULE_POINTS[JOURNEY[seg]], MODULE_POINTS[JOURNEY[seg + 1]], u - seg);
        const p = project(pos);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.s * (0.05 - k * 0.006)), 0, Math.PI * 2);
        ctx.fillStyle = rgba(k === 0 ? WHITE : PINK, k === 0 ? 1 : 0.5 - k * 0.07);
        ctx.fill();
    }
}

export default function ClinicNetworkVisual() {
    const canvasRef = useRef(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let rafId = 0;
        let visible = false;
        const start = performance.now();

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawFrame(ctx, width, height, reduceMotion ? 1.2 : (performance.now() - start) / 1000);
        };

        const loop = (now) => {
            drawFrame(ctx, width, height, (now - start) / 1000);
            rafId = requestAnimationFrame(loop);
        };

        const setRunning = (run) => {
            cancelAnimationFrame(rafId);
            if (run && !reduceMotion) rafId = requestAnimationFrame(loop);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        // Only animate while on screen (the mobile deck keeps every card mounted)
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            setRunning(visible);
        });
        visibilityObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
        };
    }, [reduceMotion]);

    return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />;
}
