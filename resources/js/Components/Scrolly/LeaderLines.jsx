import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const CORNER_CUT = 10; // px, size of the 45° chamfer on elbows
const round = (v) => Math.round(v * 10) / 10;

/** Polyline with chamfered (45° cut) corners, HUD style. */
function chamferPath(points, cut) {
    let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const p = points[i];
        const next = points[i + 1];
        const lenA = Math.hypot(prev.x - p.x, prev.y - p.y);
        const lenB = Math.hypot(next.x - p.x, next.y - p.y);
        if (lenA < 1 || lenB < 1) {
            d += ` L ${round(p.x)} ${round(p.y)}`;
            continue;
        }
        const ra = Math.min(cut, lenA / 2);
        const rb = Math.min(cut, lenB / 2);
        d += ` L ${round(p.x + ((prev.x - p.x) / lenA) * ra)} ${round(p.y + ((prev.y - p.y) / lenA) * ra)}`;
        d += ` L ${round(p.x + ((next.x - p.x) / lenB) * rb)} ${round(p.y + ((next.y - p.y) / lenB) * rb)}`;
    }
    const last = points[points.length - 1];
    return `${d} L ${round(last.x)} ${round(last.y)}`;
}

/** Anchor -> horizontal -> vertical jog -> horizontal into the card edge. Null if the card is on the wrong side. */
function route(anchor, target, side, frac) {
    const dir = side === 'left' ? -1 : 1;
    if ((target.x - anchor.x) * dir <= 8) return null;

    if (Math.abs(target.y - anchor.y) < 2) return chamferPath([anchor, target], CORNER_CUT);
    const elbowX = anchor.x + (target.x - anchor.x) * frac;
    return chamferPath(
        [anchor, { x: elbowX, y: anchor.y }, { x: elbowX, y: target.y }, target],
        CORNER_CUT,
    );
}

/**
 * Laser leader lines from points on the mecha body to the edge of HUD cards.
 *
 * links: [{ key, anchor: [x, y] (px in this overlay), targetId, side: 'left' | 'right', frac, delay }]
 * The target is any element with data-leader-target={targetId}; its rect is re-measured every
 * animation frame, so lines stay attached through entrance animations and scroll parallax.
 */
export default function LeaderLines({ id, links, dashOffset, stroke = '#06b6d4', node = '#22d3ee' }) {
    const svgRef = useRef(null);
    const linksRef = useRef(links);
    linksRef.current = links;
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        let rafId;

        const measure = () => {
            const svg = svgRef.current;
            if (svg) {
                const origin = svg.getBoundingClientRect();
                const next = [];

                for (const link of linksRef.current) {
                    const el = document.querySelector(`[data-leader-target="${link.targetId}"]`);
                    const rect = el?.getBoundingClientRect();
                    if (!rect || rect.width === 0) continue; // hidden (e.g. mobile layout)

                    const anchor = { x: link.anchor[0], y: link.anchor[1] };
                    const target = {
                        x: (link.side === 'left' ? rect.right : rect.left) - origin.left,
                        y: rect.top + rect.height / 2 - origin.top,
                    };
                    const d = route(anchor, target, link.side, link.frac ?? 0.5);
                    if (d) next.push({ key: link.key, d, anchor, target, delay: link.delay ?? 0 });
                }

                setRoutes((prev) =>
                    prev.length === next.length && prev.every((r, i) => r.d === next[i].d && r.key === next[i].key)
                        ? prev
                        : next,
                );
            }
            rafId = requestAnimationFrame(measure);
        };

        rafId = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <svg
            ref={svgRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block"
        >
            <defs>
                <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {routes.map(({ key, d, anchor, target, delay }) => (
                <g key={key}>
                    {/* Base laser, drawn in from the body towards the card */}
                    <motion.path
                        d={d}
                        stroke={stroke}
                        strokeWidth="1.75"
                        strokeLinejoin="round"
                        fill="none"
                        filter={`url(#${id})`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.9 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
                    />
                    {/* Energy pulses flowing with scroll */}
                    <motion.path
                        d={d}
                        stroke="#ecfeff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="2 14"
                        strokeDashoffset={dashOffset}
                        fill="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        transition={{ delay: delay + 0.5, duration: 0.3 }}
                    />

                    {/* Anchor on the body */}
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay, duration: 0.3 }}
                    >
                        <circle cx={anchor.x} cy={anchor.y} r="9" fill="none" stroke={node} strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
                        <circle cx={anchor.x} cy={anchor.y} r="3.5" fill={node} filter={`url(#${id})`} />
                    </motion.g>

                    {/* Docking point on the card edge */}
                    <motion.rect
                        x={target.x - 3.5}
                        y={target.y - 3.5}
                        width="7"
                        height="7"
                        fill={node}
                        transform={`rotate(45 ${target.x} ${target.y})`}
                        filter={`url(#${id})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.6, duration: 0.3 }}
                    />
                </g>
            ))}
        </svg>
    );
}
