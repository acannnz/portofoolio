import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch } from 'lucide-react';
import CornerBrackets from './CornerBrackets';

function ProjectLinks({ project, compact = false }) {
    if (!project.demo && !project.github) return null;

    return (
        <div className={`flex items-center justify-between border-t border-white/5 ${compact ? 'pt-2' : 'pt-1.5'}`}>
            {project.demo ? (
                <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 font-semibold text-pink-400 hover:text-pink-300 transition-colors ${compact ? 'text-[10px]' : 'text-[11px]'}`}
                >
                    <span>Open Module</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
            ) : (
                <span />
            )}
            {project.github && (
                <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} source code on GitHub`}
                    title="GitHub Repo"
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
            )}
        </div>
    );
}

/** Desktop floating shard (left/right column). */
export function ProjectShard({ project, number, side, delay = 0 }) {
    const isLeft = side === 'left';

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
            className="relative group glass-card rounded-xl p-3 sm:p-3.5 border border-pink-500/30 bg-zinc-950/85 hover:border-pink-400/60 shadow-xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300"
        >
            <CornerBrackets
                corners={isLeft ? ['tl', 'br'] : ['tr', 'bl']}
                size="w-2 h-2"
                color="border-pink-400/80"
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        <span className="font-mono text-[9px] text-pink-300 font-bold uppercase tracking-wider">
                            ARMOR SHARD #{number}
                        </span>
                    </div>
                    <span className="font-mono text-[8px] text-zinc-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                        ACTIVE
                    </span>
                </div>

                {project.image && (
                    <div className="relative h-14 sm:h-16 w-full rounded-md overflow-hidden border border-pink-500/20">
                        <img
                            src={project.image}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    </div>
                )}

                <h3 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                    {project.title}
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{project.description}</p>
            </div>

            <div className="pt-2 space-y-2">
                <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-pink-300/90 border border-pink-500/20"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <ProjectLinks project={project} />
            </div>
        </motion.div>
    );
}

/** Mobile swipeable deck card. */
export function MobileProjectCard({ project, number }) {
    return (
        <div className="snap-center shrink-0 w-[270px] p-3.5 rounded-2xl bg-zinc-950/90 border border-pink-500/40 backdrop-blur-xl shadow-2xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="font-mono text-[9px] text-pink-300 font-bold uppercase">ARMOR SHARD #{number}</span>
                    <span className="text-[8px] font-mono text-zinc-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                        ACTIVE
                    </span>
                </div>
                {project.image && (
                    <div className="relative h-16 w-full rounded-lg overflow-hidden border border-pink-500/20">
                        <img src={project.image} alt={project.title} loading="lazy" className="w-full h-full object-cover object-center" />
                    </div>
                )}
                <h4 className="text-xs font-bold text-white truncate">{project.title}</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{project.description}</p>
            </div>
            <ProjectLinks project={project} compact />
        </div>
    );
}
