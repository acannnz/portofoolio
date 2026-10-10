import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, Lock, Orbit, ScanLine } from 'lucide-react';
import ClinicNetworkVisual from './ClinicNetworkVisual';
import HoloCard from './HoloCard';
import { chamferClip } from './constants';

export const pad = (n) => String(n).padStart(2, '0');

// Live visuals for projects that can't show screenshots (keyed by 'visual' in config/portfolio.php)
const VISUALS = {
    'clinic-network': ClinicNetworkVisual,
};

const GRID_BG = {
    backgroundImage:
        'linear-gradient(rgba(244, 114, 182, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 114, 182, 0.12) 1px, transparent 1px)',
    backgroundSize: '14px 14px',
};

/** Screenshot with a pink HUD treatment, a live visual, or a "no feed" placeholder for private builds. */
function ShardMedia({ project, number, className = '' }) {
    const Visual = VISUALS[project.visual];

    return (
        <div className={`relative overflow-hidden border border-pink-500/25 bg-zinc-950 ${className}`}>
            {Visual ? (
                <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(236, 72, 153, 0.16), transparent 70%)' }}
                >
                    <Visual />
                </div>
            ) : project.image ? (
                <>
                    <img
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-pink-500/10" />
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={GRID_BG}>
                    <span
                        aria-hidden="true"
                        className="font-mono font-black text-5xl text-transparent select-none"
                        style={{ WebkitTextStroke: '1px rgba(244, 114, 182, 0.55)' }}
                    >
                        {pad(number)}
                    </span>
                </div>
            )}

            <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-black/75 border border-pink-500/30 font-mono text-[8px] tracking-widest text-pink-300 uppercase">
                {Visual ? (
                    <>
                        <Orbit className="w-2.5 h-2.5" aria-hidden="true" />
                        Live 3D module map
                    </>
                ) : project.image ? (
                    <>
                        <ScanLine className="w-2.5 h-2.5" aria-hidden="true" />
                        Visual feed
                    </>
                ) : (
                    <>
                        <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                        No feed // private build
                    </>
                )}
            </span>

            {/* Targeting reticle */}
            <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-pink-400/80" />
            <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-pink-400/80" />
        </div>
    );
}

function ShardStatus({ project }) {
    return project.demo ? (
        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 border border-emerald-400/30 bg-emerald-500/10 font-mono text-[8px] font-bold tracking-widest text-emerald-300 uppercase">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Live
        </span>
    ) : (
        <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 border border-white/10 bg-white/5 font-mono text-[8px] font-bold tracking-widest text-zinc-400 uppercase">
            <Lock className="w-2.5 h-2.5" aria-hidden="true" />
            Private
        </span>
    );
}

function ShardTags({ tags, limit }) {
    return (
        <div className="flex flex-wrap gap-1">
            {tags.slice(0, limit).map((tag) => (
                <span
                    key={tag}
                    className="font-mono text-[9px] px-1.5 py-0.5 bg-pink-500/5 border border-pink-500/25 text-pink-200/90"
                >
                    {tag}
                </span>
            ))}
        </div>
    );
}

function ShardLinks({ project, compact = false }) {
    const size = compact ? 'text-[10px] px-2.5 py-1' : 'text-[11px] px-3 py-1.5';

    if (!project.demo && !project.github) {
        return (
            <div className="inline-flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                <Lock className="w-3 h-3" aria-hidden="true" />
                Classified // source private
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {project.demo && (
                <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ clipPath: chamferClip(6) }}
                    className={`inline-flex items-center gap-1.5 ${size} font-semibold bg-pink-500/20 text-pink-100 hover:bg-pink-500/35 hover:text-white transition-colors`}
                >
                    Launch module
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
            )}
            {project.github && (
                <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} source code on GitHub`}
                    className={`inline-flex items-center gap-1.5 ${size} border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 transition-colors`}
                >
                    <GitBranch className="w-3 h-3" aria-hidden="true" />
                    Source
                </a>
            )}
        </div>
    );
}

/** One bar per shard: past shards full, the active one fills with scroll progress. */
function ScanProgress({ count, index, progress }) {
    return (
        <div className="pt-2.5 border-t border-white/5 space-y-1.5">
            <div className="flex gap-1">
                {Array.from({ length: count }, (_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/5 overflow-hidden">
                        <div
                            className="h-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"
                            style={{ width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-zinc-500">
                <span>Matrix scan</span>
                <span className="text-pink-300/80">{index < count - 1 ? 'Scroll ▾ next shard' : 'Scan complete'}</span>
            </div>
        </div>
    );
}

/** Desktop: full readout of the active shard (left of the mecha). */
export function ShardDetail({ project, index, count, progress }) {
    return (
        <HoloCard
            side="left"
            tone="pink"
            yaw={10}
            chamfer={18}
            corners={['tr', 'bl']}
            bracketSize="w-2.5 h-2.5"
            rounded=""
            className="group hidden md:block absolute top-20 lg:top-24 left-3 sm:left-6 lg:left-10 xl:left-16 z-30 w-full max-w-[270px] lg:max-w-[300px] xl:max-w-[340px] pointer-events-auto"
            faceClassName="p-4 bg-zinc-950/85 border border-pink-500/35 backdrop-blur-xl space-y-3"
        >
            <header className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest">
                <span className="flex items-center gap-1.5 text-pink-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                    Shard {pad(index + 1)} // analysis
                </span>
                <span className="text-zinc-400">
                    {pad(index + 1)}
                    <span className="text-zinc-600">/{pad(count)}</span>
                </span>
            </header>

            {/* Keyed remount: each shard animates in. No exit/wait, so fast scrolling can't strand stale content */}
            <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3"
            >
                <ShardMedia project={project} number={index + 1} className="h-28 lg:h-32 xl:h-36" />

                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm lg:text-base font-bold text-white leading-snug">{project.title}</h3>
                        <ShardStatus project={project} />
                    </div>
                    <p className="text-[11px] lg:text-xs text-zinc-300/90 leading-relaxed line-clamp-4">{project.description}</p>
                </div>

                <ShardTags tags={project.tags} />
                <ShardLinks project={project} />
            </motion.div>

            <ScanProgress count={count} index={index} progress={progress} />
        </HoloCard>
    );
}

/** Mobile swipeable deck card. */
export function MobileProjectCard({ project, number }) {
    return (
        <div
            style={{ clipPath: chamferClip(14) }}
            className="snap-center shrink-0 w-[270px] p-px bg-gradient-to-br from-pink-400/60 via-pink-500/20 to-pink-400/50"
        >
            <div
                style={{ clipPath: chamferClip(14) }}
                className="h-full p-3.5 bg-zinc-950/95 backdrop-blur-xl space-y-2.5 flex flex-col justify-between"
            >
                <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest">
                        <span className="text-pink-300 font-bold">Shard {pad(number)}</span>
                        <ShardStatus project={project} />
                    </div>
                    <ShardMedia project={project} number={number} className="h-20" />
                    <h4 className="text-xs font-bold text-white leading-snug">{project.title}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{project.description}</p>
                    <ShardTags tags={project.tags} limit={3} />
                </div>
                <ShardLinks project={project} compact />
            </div>
        </div>
    );
}
