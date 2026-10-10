import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers } from 'lucide-react';
import HintPill from './HintPill';
import LeaderLines from './LeaderLines';
import SkillCard from './SkillCard';
import { skillAnchors } from './anchors';
import { FRAME_STANDING_CENTER, ICONS, coverTransform, imageToViewport } from './constants';

// Where the elbow of each line sits between body and card (0 = at the body, 1 = at the card)
const ELBOW_FRAC = [0.6, 0.4, 0.6];

// Vertical parallax factor per card row (top, middle, bottom)
const PARALLAX = [-0.4, -0.1, 0.35];

// Base rotateX per card row, so each column curves around the mecha
const PITCH = [-6, 0, 6];

function SkillColumn({ skills, side, frame }) {
    const sidePosition = side === 'left' ? 'left-3 sm:left-6 lg:left-12' : 'right-3 sm:right-6 lg:right-12';

    return (
        <div className={`hidden md:flex absolute inset-y-0 ${sidePosition} z-30 flex-col justify-center gap-3 max-w-[260px] lg:max-w-[280px] xl:max-w-xs 2xl:max-w-sm w-full pointer-events-auto`}>
            {skills.map((skill, idx) => (
                <SkillCard
                    key={skill.name}
                    skill={skill}
                    index={idx}
                    side={side}
                    pitch={PITCH[idx]}
                    leaderId={`skill-${side}-${idx}`}
                    parallaxY={(frame - FRAME_STANDING_CENTER) * PARALLAX[idx]}
                />
            ))}
        </div>
    );
}

// Standing frames: six skill modules tethered to the mecha body by laser lines.
export default function SkillsPhase({ skills, frame, viewport, dashOffset }) {
    const cover = coverTransform(viewport.w, viewport.h);
    const anchors = skillAnchors(frame);
    const links = ['left', 'right'].flatMap((side) =>
        anchors[side].map((anchor, idx) => ({
            key: `${side}-${idx}`,
            anchor: imageToViewport(cover, ...anchor),
            targetId: `skill-${side}-${idx}`,
            side,
            frac: ELBOW_FRAC[idx],
            delay: 0.15 + idx * 0.1,
        })),
    );

    return (
        <motion.div
            key="phase-robotic-skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 pointer-events-none"
        >
            <LeaderLines id="cyan-glow-2" links={links} dashOffset={dashOffset} />

            <div className="absolute top-6 inset-x-0 z-30 flex justify-center pointer-events-none">
                <div className="px-4 py-1.5 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center gap-3 text-xs font-mono text-cyan-300 shadow-xl">
                    <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" aria-hidden="true" />
                    <span>SUBSYSTEM ARSENAL: {skills.length} MODULES SYNCHRONIZED WITH BODY</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </div>

            <SkillColumn skills={skills.slice(0, 3)} side="left" frame={frame} />
            <SkillColumn skills={skills.slice(3, 6)} side="right" frame={frame} />

            <HintPill>SCROLL DOWN TO DEPLOY ARMOR MATRIX &amp; PROJECTS</HintPill>

            {/* Mobile: compact 2-column grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="md:hidden absolute bottom-14 inset-x-2.5 z-30 pointer-events-auto space-y-1.5"
            >
                <div className="text-center">
                    <span className="px-3 py-1 rounded-full bg-black/75 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 uppercase tracking-wider backdrop-blur-md">
                        TECHNICAL ARSENAL • {skills.length} MODULES
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    {skills.map((skill) => {
                        const Icon = ICONS[skill.icon] ?? Layers;
                        return (
                            <div key={skill.name} className="p-2 rounded-xl bg-zinc-950/90 border border-cyan-500/30 backdrop-blur-xl space-y-1 relative">
                                <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400">
                                    <span>{skill.serial.split(' ')[0]}</span>
                                    <span className="text-cyan-300 font-bold text-[7px] uppercase tracking-wider">{skill.status}</span>
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Icon className="w-3.5 h-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
                                    <h4 className="text-[10px] font-bold text-white truncate">{skill.name}</h4>
                                </div>
                                <div className="flex items-center gap-1 text-[7px] font-mono text-cyan-400/80 pt-0.5">
                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                    <span>PRODUCTION READY</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}
