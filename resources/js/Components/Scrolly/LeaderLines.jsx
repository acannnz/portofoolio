import React from 'react';
import { motion } from 'framer-motion';

/**
 * Orthogonal "laser" leader lines drawn in a 1000x1000 viewBox over the canvas.
 *
 * anchors: [[x, y], ...]             glowing nodes on the mecha body
 * lines:   [{ d, mid, end, delay }]  path + its elbow/end node coordinates
 */
export default function LeaderLines({
    id,
    anchors = [],
    lines,
    stroke = '#06b6d4',
    node = '#22d3ee',
    dashOffset,
    dash = '6 3',
    duration = 0.8,
    opacity = 1,
}) {
    return (
        <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
        >
            <defs>
                <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {anchors.map(([x, y]) => (
                <g key={`${x}-${y}`}>
                    <circle cx={x} cy={y} r="4.5" fill={node} filter={`url(#${id})`} />
                    <circle cx={x} cy={y} r="8" fill="none" stroke={node} strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
                </g>
            ))}

            {lines.map(({ d, mid, end, delay = 0 }) => (
                <React.Fragment key={d}>
                    <motion.path
                        d={d}
                        stroke={stroke}
                        strokeWidth="2"
                        strokeDasharray={dash}
                        strokeDashoffset={dashOffset}
                        fill="none"
                        filter={`url(#${id})`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity }}
                        transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
                    />
                    <motion.circle
                        cx={mid[0]}
                        cy={mid[1]}
                        r="2.5"
                        fill={node}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: delay + 0.35, duration: 0.3 }}
                    />
                    <motion.circle
                        cx={end[0]}
                        cy={end[1]}
                        r="3.5"
                        fill={node}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: delay + 0.65, duration: 0.3 }}
                    />
                </React.Fragment>
            ))}
        </svg>
    );
}
