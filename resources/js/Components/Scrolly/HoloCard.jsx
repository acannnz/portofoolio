import React, { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import CornerBrackets from './CornerBrackets';
import { chamferClip } from './constants';

const TONES = {
    cyan: { rgb: '34, 211, 238', bracket: 'border-cyan-300', plate: 'border-cyan-400/50', port: 'bg-cyan-300' },
    pink: { rgb: '244, 114, 182', bracket: 'border-pink-300', plate: 'border-pink-400/50', port: 'bg-pink-300' },
};

const PERSPECTIVE = 1100; // px
const BASE_YAW = 16; // deg, every panel turns its face towards the mecha
const DEPLOY_YAW = 55; // deg of extra yaw while the panel swings open
const POINTER_YAW = 7; // deg of extra yaw with the cursor at the screen edge
const POINTER_PITCH = 5;
const SPRING = { stiffness: 120, damping: 20, mass: 0.5 };

// Back plates (translateZ, opacity) that give the glass panel visible thickness when it tilts
const PLATES = [
    [-14, 0.55],
    [-30, 0.25],
];

/** Cursor position over the window, normalized to -1..1 and spring-smoothed. */
function usePointer(enabled) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        if (!enabled) return undefined;
        const onMove = (e) => {
            x.set((e.clientX / window.innerWidth) * 2 - 1);
            y.set((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, [enabled, x, y]);

    return [useSpring(x, SPRING), useSpring(y, SPRING)];
}

/**
 * Holographic HUD panel rendered in real 3D: angled towards the mecha, swings open on mount,
 * follows the cursor and floats its corner brackets in front of the glass.
 *
 * side:      'left' | 'right'  which screen edge the panel sits on (it turns towards the centre)
 * yaw:       base rotateY in deg; keep it lower on text-heavy panels
 * pitch:     base rotateX in deg, so stacked panels curve around the mecha
 * chamfer:   px; cuts the top-left and bottom-right corners (armor plate) instead of rounding them
 * leaderId:  exposes a dock point on the inner edge for <LeaderLines> to attach to
 * className / style: outer wrapper (positioning, scroll parallax)
 * faceClassName: the glass face itself
 */
export default function HoloCard({
    side,
    tone = 'cyan',
    yaw = BASE_YAW,
    pitch = 0,
    chamfer,
    delay = 0,
    leaderId,
    corners,
    bracketSize = 'w-3 h-3',
    rounded = 'rounded-2xl',
    className = '',
    style,
    faceClassName = '',
    children,
}) {
    const reduceMotion = useReducedMotion();
    const colors = TONES[tone];
    const isLeft = side === 'left';
    const sign = isLeft ? 1 : -1;
    const clipPath = chamfer ? chamferClip(chamfer) : undefined;

    const [px, py] = usePointer(!reduceMotion);
    const deploy = useMotionValue(reduceMotion ? 1 : 0);

    useEffect(() => {
        if (reduceMotion) return undefined;
        const controls = animate(deploy, 1, { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] });
        return () => controls.stop();
    }, [deploy, delay, reduceMotion]);

    const rotateY = useTransform([deploy, px], ([d, x]) => sign * (yaw + (1 - d) * DEPLOY_YAW) + x * POINTER_YAW);
    const rotateX = useTransform(py, (y) => pitch - y * POINTER_PITCH);
    // Glare sweeps across the glass as the panel turns
    const glarePosition = useTransform(px, [-1, 1], ['100% 0%', '0% 0%']);

    return (
        <motion.div
            initial={{ opacity: 0, x: sign * -24 }}
            animate={{ opacity: [0, 0.9, 0.35, 1], x: 0 }}
            transition={{ duration: 0.7, delay, opacity: { duration: 0.7, delay, times: [0, 0.35, 0.55, 1] } }}
            style={style}
            className={className}
        >
            <motion.div
                whileHover={{ z: 22 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{ rotateX, rotateY, transformPerspective: PERSPECTIVE, transformStyle: 'preserve-3d' }}
                className="relative"
            >
                {PLATES.map(([z, opacity]) => (
                    <div
                        key={z}
                        aria-hidden="true"
                        className={`absolute inset-0 ${rounded} border ${colors.plate} pointer-events-none`}
                        style={{
                            transform: `translateZ(${z}px)`,
                            opacity,
                            clipPath,
                            background: `rgba(${colors.rgb}, ${chamfer ? 0.08 : 0.04})`,
                            boxShadow: `0 0 24px rgba(${colors.rgb}, 0.25)`,
                        }}
                    />
                ))}

                <div className={`relative overflow-hidden ${rounded} ${faceClassName}`} style={{ clipPath }}>
                    {children}

                    <motion.div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(115deg, transparent 35%, rgba(${colors.rgb}, 0.10) 47%, rgba(255, 255, 255, 0.07) 50%, transparent 62%)`,
                            backgroundSize: '250% 100%',
                            backgroundPosition: glarePosition,
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                            backgroundImage: `repeating-linear-gradient(to bottom, rgba(${colors.rgb}, 0.05) 0 1px, transparent 1px 3px)`,
                        }}
                    />
                    {/* clip-path drops the border on the cut corners, so redraw those two diagonals */}
                    {chamfer &&
                        ['top-0 left-0', 'bottom-0 right-0'].map((position) => (
                            <svg
                                key={position}
                                aria-hidden="true"
                                width={chamfer}
                                height={chamfer}
                                className={`absolute ${position} pointer-events-none`}
                            >
                                <line x1="0" y1={chamfer} x2={chamfer} y2="0" stroke={`rgba(${colors.rgb}, 0.6)`} strokeWidth="2" />
                            </svg>
                        ))}
                </div>

                {/* Brackets hover in front of the glass, so they parallax against it */}
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(18px)' }}>
                    <CornerBrackets corners={corners} size={bracketSize} color={colors.bracket} />
                </div>

                {/* Docking port on the edge facing the mecha */}
                <div
                    aria-hidden="true"
                    className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? '-right-[2px]' : '-left-[2px]'} w-[3px] h-8 rounded-full ${colors.port} pointer-events-none`}
                    style={{ transform: 'translateZ(6px)', boxShadow: `0 0 10px rgba(${colors.rgb}, 0.9)` }}
                />
                {leaderId && (
                    <span
                        data-leader-target={leaderId}
                        aria-hidden="true"
                        className={`absolute top-1/2 ${isLeft ? 'right-0' : 'left-0'} w-px h-px pointer-events-none`}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
