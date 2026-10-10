import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal } from 'lucide-react';
import CornerBrackets from './CornerBrackets';
import HintPill from './HintPill';
import LeaderLines from './LeaderLines';
import { identityAnchors } from './anchors';
import { FRAME_INTRO_END, coverTransform, imageToViewport } from './constants';

const NAME_GRADIENT = 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300';

// Landing frames: pilot identity (name + role) and dossier connected to the mecha by laser lines.
export default function IdentityPhase({ profile, typedName, nameComplete, frame, viewport, dashOffset }) {
    const parallax = (frame - FRAME_INTRO_END) * 1.2 * 0.4;

    const cover = coverTransform(viewport.w, viewport.h);
    const { head, chest } = identityAnchors(frame);
    const links = [
        { key: 'head', anchor: imageToViewport(cover, ...head), targetId: 'identity-left', side: 'left', delay: 0.15 },
        { key: 'chest', anchor: imageToViewport(cover, ...chest), targetId: 'identity-right', side: 'right', delay: 0.25 },
    ];

    return (
        <motion.div
            key="phase-robotic-identity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 pointer-events-none"
        >
            <LeaderLines id="cyan-glow" links={links} dashOffset={dashOffset} />

            {/* Desktop left: name & role */}
            <motion.div
                data-leader-target="identity-left"
                initial={{ opacity: 0, x: 25, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ y: -parallax }}
                className="hidden md:block absolute top-1/2 -translate-y-1/2 left-3 sm:left-6 lg:left-12 z-30 max-w-[260px] lg:max-w-[280px] xl:max-w-xs 2xl:max-w-sm w-full pointer-events-auto"
            >
                <div className="relative glass-card rounded-2xl p-5 sm:p-6 border border-cyan-500/30 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-4 overflow-hidden w-full">
                    <CornerBrackets />

                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" aria-hidden="true" />
                            <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase font-bold">
                                PILOT // IDENTIFICATION
                            </span>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            NEURAL_LINK
                        </span>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-400 tracking-wider block">// DESIGNATION RECOGNIZED:</span>
                        {/* Full name is exposed to assistive tech immediately; the typed text is decorative */}
                        <h2
                            aria-label={profile.name}
                            className={`text-xl sm:text-2xl lg:text-3xl font-black ${NAME_GRADIENT} tracking-tight uppercase font-mono min-h-[2.5rem] flex items-center`}
                        >
                            <span aria-hidden="true">{typedName || ' '}</span>
                            {!nameComplete && <span aria-hidden="true" className="inline-block w-2.5 h-6 ml-1 bg-cyan-400 animate-pulse" />}
                        </h2>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: nameComplete ? 1 : 0.4, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>{profile.role}</span>
                        </motion.div>
                    </div>

                    <div className="text-[10px] font-mono text-cyan-400/70 border-t border-white/5 pt-2 flex items-center justify-between">
                        <span>TETHER: KEPALA // VISOR LINK</span>
                        <span className="text-emerald-400 font-bold">ONLINE</span>
                    </div>
                </div>
            </motion.div>

            {/* Desktop right: bio & telemetry */}
            <motion.div
                data-leader-target="identity-right"
                initial={{ opacity: 0, x: -25, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{ y: parallax }}
                className="hidden md:block absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 lg:right-12 z-30 max-w-[260px] lg:max-w-[280px] xl:max-w-xs 2xl:max-w-sm w-full pointer-events-auto"
            >
                <div className="relative glass-card rounded-2xl p-5 sm:p-6 border border-cyan-500/30 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-3.5 overflow-hidden w-full">
                    <CornerBrackets />

                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                            <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase font-bold">
                                PILOT DOSSIER // TELEMETRY
                            </span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            SYNC 100%
                        </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{profile.about}</p>

                    <div className="space-y-2 pt-1">
                        {[
                            ['LOCATION:', profile.location, 'text-white'],
                            ['STACK:', profile.stack, 'text-cyan-300'],
                            ['STATUS:', profile.availability, 'text-emerald-400'],
                        ].map(([label, value, color]) => (
                            <div
                                key={label}
                                className="p-2.5 rounded-xl bg-zinc-900/80 border border-cyan-500/20 flex items-center justify-between text-xs font-mono"
                            >
                                <span className="text-[10px] text-cyan-400/80 uppercase">{label}</span>
                                <span className={`${color} font-bold`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <HintPill>SCROLL DOWN TO UNLOCK TECHNICAL SKILLS ARSENAL</HintPill>

            {/* Mobile: single compact pilot card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:hidden absolute bottom-16 inset-x-3 z-30 pointer-events-auto"
            >
                <div className="relative glass-card rounded-2xl p-4 border border-cyan-500/40 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-3 overflow-hidden">
                    <CornerBrackets size="w-2.5 h-2.5" />

                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" aria-hidden="true" />
                            <span className="font-mono text-[9px] text-cyan-400 uppercase font-bold tracking-wider">
                                PILOT IDENTIFICATION // NEURAL LINK
                            </span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            ONLINE
                        </span>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[9px] font-mono text-zinc-400 block tracking-wider">// DESIGNATION:</span>
                        <h2
                            aria-label={profile.name}
                            className={`text-lg font-black ${NAME_GRADIENT} font-mono tracking-tight uppercase flex items-center`}
                        >
                            <span aria-hidden="true">{typedName || ' '}</span>
                            {!nameComplete && <span aria-hidden="true" className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />}
                        </h2>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                            <span>{profile.role}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9px] font-mono">
                        {[
                            ['LOC', profile.location, 'text-white'],
                            ['STACK', profile.stack, 'text-cyan-300'],
                            ['STATUS', profile.availability, 'text-emerald-400'],
                        ].map(([label, value, color]) => (
                            <div key={label} className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/5 text-center truncate">
                                <span className="text-zinc-400 block text-[8px]">{label}</span>
                                <span className={`${color} font-bold truncate block`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
