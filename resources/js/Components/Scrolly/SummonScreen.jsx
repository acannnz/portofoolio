import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Cpu } from 'lucide-react';

const CORNERS = [
    'top-6 left-6 border-t-2 border-l-2',
    'top-6 right-6 border-t-2 border-r-2',
    'bottom-6 left-6 border-b-2 border-l-2',
    'bottom-6 right-6 border-b-2 border-r-2',
];

const BOOT_LINES = ['NEURAL LINK ........ OK', 'ARMOR PLATING ...... OK', 'REACTOR CORE ....... STANDBY'];

export default function SummonScreen({ profile, isLoading, loadingProgress, onSummon }) {
    const reduceMotion = useReducedMotion();
    const loop = (duration, extra = {}) =>
        reduceMotion ? { duration: 0 } : { duration, repeat: Infinity, ease: 'linear', ...extra };

    return (
        <motion.div
            key="summon-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-6 select-none bg-[#030307] overflow-hidden"
        >
            {/* Perspective grid floor */}
            <div className="absolute inset-0 [perspective:600px] pointer-events-none" aria-hidden="true">
                <motion.div
                    className="absolute left-[-50%] right-[-50%] bottom-[-30%] h-[80%] origin-bottom [transform:rotateX(65deg)]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                        maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
                    }}
                    animate={{ backgroundPositionY: ['0px', '60px'] }}
                    transition={loop(2.5)}
                />
            </div>

            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" aria-hidden="true" />
            <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[110px] pointer-events-none" aria-hidden="true" />

            {/* Scanning line */}
            <motion.div
                aria-hidden="true"
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none"
                animate={{ top: ['0%', '100%'] }}
                transition={loop(5, { ease: 'easeInOut', repeatType: 'reverse' })}
            />

            {/* HUD corner brackets */}
            {CORNERS.map((pos) => (
                <div key={pos} aria-hidden="true" className={`absolute w-10 h-10 border-cyan-400/50 ${pos}`} />
            ))}

            {/* HUD meta text */}
            <div className="absolute top-8 left-20 right-20 hidden sm:flex justify-between font-mono text-[10px] tracking-[0.3em] text-cyan-400/60 uppercase" aria-hidden="true">
                <span>Unit // CP-01</span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Hangar link online
                </span>
            </div>
            <div className="absolute bottom-8 left-20 right-20 hidden sm:flex justify-between font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase" aria-hidden="true">
                <span>Sector 07 · Bay A</span>
                <span>v2.6 // portfolio.sys</span>
            </div>

            {/* Center console */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-[11px] sm:text-xs tracking-[0.5em] text-cyan-400/80 uppercase mb-4"
                >
                    ▸ System standby
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none"
                >
                    <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        {profile.name}
                    </span>
                </motion.h1>

                {profile.role && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 text-sm sm:text-base text-zinc-400 tracking-[0.25em] uppercase"
                    >
                        {profile.role}
                    </motion.p>
                )}

                <div className="mt-12 h-[150px] flex items-center justify-center">
                    {!isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.55, type: 'spring', stiffness: 180, damping: 16 }}
                            className="relative flex flex-col items-center"
                        >
                            <div className="relative">
                                {/* Pulse rings */}
                                {[0, 1].map((i) => (
                                    <motion.span
                                        key={i}
                                        aria-hidden="true"
                                        className="absolute inset-0 rounded-2xl border border-cyan-400/40 pointer-events-none"
                                        animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                                        transition={loop(2.4, { ease: 'easeOut', delay: i * 1.2 })}
                                    />
                                ))}

                                <button
                                    id="btn-summon-mecha"
                                    type="button"
                                    onClick={onSummon}
                                    className="group relative p-[1.5px] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030307] shadow-[0_0_40px_rgba(6,182,212,0.35)] hover:shadow-[0_0_70px_rgba(168,85,247,0.5)]"
                                >
                                    {/* Rotating conic border */}
                                    <motion.span
                                        aria-hidden="true"
                                        className="absolute inset-[-150%] pointer-events-none"
                                        style={{
                                            background:
                                                'conic-gradient(from 0deg, transparent 0deg, #22d3ee 60deg, transparent 120deg, transparent 180deg, #a855f7 240deg, transparent 300deg)',
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={loop(3)}
                                    />
                                    <span className="relative flex items-center gap-3 px-10 h-[65px] rounded-[15px] bg-zinc-950/95 backdrop-blur-md text-white font-bold text-lg tracking-[0.25em] uppercase overflow-hidden">
                                        {/* Hover shine sweep */}
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] transition-all duration-700 group-hover:left-[150%]"
                                        />
                                        <span>Summon Mecha</span>
                                        <ArrowRight className="w-5 h-5 text-purple-400 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                                    </span>
                                </button>
                            </div>

                            <motion.p
                                className="mt-6 font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={loop(2.2, { ease: 'easeInOut' })}
                            >
                                Press to deploy · then scroll
                            </motion.p>
                        </motion.div>
                    ) : (
                        <motion.div
                            role="status"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4 bg-zinc-950/80 p-6 rounded-2xl border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] w-[min(360px,85vw)] text-left"
                        >
                            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                                <Cpu className="w-4 h-4 animate-spin" aria-hidden="true" />
                                <span>Summoning protocol...</span>
                            </div>

                            <ul className="font-mono text-[10px] text-zinc-500 space-y-1" aria-hidden="true">
                                {BOOT_LINES.map((line, i) => (
                                    <li
                                        key={line}
                                        className={loadingProgress >= (i + 1) * 30 ? 'text-emerald-400/80' : ''}
                                    >
                                        {line}
                                    </li>
                                ))}
                            </ul>

                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>

                            <div className="w-full flex items-center justify-between font-mono text-[11px] text-zinc-400">
                                <span>INITIALIZING FRAMES</span>
                                <span className="text-cyan-400 font-bold">{loadingProgress}%</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
