import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Shield } from 'lucide-react';
import { MobileProjectCard, ShardDetail } from './ProjectShard';
import ShardManifest from './ShardManifest';
import { FRAME_STANDING_END, TOTAL_FRAMES, clamp } from './constants';

// Last frames: armor detaches into floating shards, one per project. The frame range is split into
// one segment per project, so scrolling scans through them; the manifest seeks to a segment.
export default function ProjectsPhase({ projects, frame, onSeekFrame }) {
    const count = projects.length;
    const span = (TOTAL_FRAMES - FRAME_STANDING_END) / Math.max(count, 1);
    const position = (frame - FRAME_STANDING_END) / span;
    const active = clamp(Math.floor(position), 0, Math.max(count - 1, 0));
    const progress = clamp(position - active, 0, 1);

    const selectShard = (idx) => onSeekFrame(FRAME_STANDING_END + span * (idx + 0.5));

    return (
        <motion.div
            key="phase-armor-projects"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-30 pointer-events-none"
        >
            {/* Kept high so the mecha's head is never covered */}
            <div className="absolute top-5 inset-x-0 z-30 flex justify-center pointer-events-none">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/65 border border-pink-500/40 text-pink-300 font-mono text-xs uppercase tracking-widest backdrop-blur-md shadow-2xl">
                    <Shield className="w-3.5 h-3.5 animate-pulse text-pink-400" aria-hidden="true" />
                    <span>STAGE 03 • ARMOR DETACHMENT // PROJECT MATRIX</span>
                </div>
            </div>

            {count > 0 && (
                <>
                    <ShardDetail project={projects[active]} index={active} count={count} progress={progress} />
                    <ShardManifest projects={projects} active={active} progress={progress} onSelect={selectShard} />
                </>
            )}

            {/* Mobile: swipeable horizontal deck */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="md:hidden absolute bottom-14 inset-x-0 z-30 pointer-events-auto space-y-2"
            >
                <div className="text-center">
                    <span className="px-3 py-1 rounded-full bg-black/75 border border-pink-500/30 text-[9px] font-mono text-pink-300 uppercase tracking-wider backdrop-blur-md">
                        ARMOR SHARDS • SWIPE HORIZONTALLY ➔
                    </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-4 pb-2 no-scrollbar">
                    {projects.map((project, idx) => (
                        <MobileProjectCard key={project.id} project={project} number={idx + 1} />
                    ))}
                </div>
            </motion.div>

            <div className="absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-none">
                <a
                    href="#experience"
                    className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-pink-500/50 transition-all backdrop-blur-md shadow-xl"
                >
                    <span>Continue to Experience &amp; Contact below</span>
                    <ChevronDown className="w-4 h-4 text-pink-400 animate-bounce" aria-hidden="true" />
                </a>
            </div>
        </motion.div>
    );
}
