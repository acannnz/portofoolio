import React from 'react';
import { Lock } from 'lucide-react';
import HoloCard from './HoloCard';
import { pad } from './ProjectShard';
import { chamferClip } from './constants';

/** Desktop: index of every detached shard (right of the mecha). Selecting one scrolls the scene to it. */
export default function ShardManifest({ projects, active, progress, onSelect }) {
    return (
        <HoloCard
            side="right"
            tone="pink"
            yaw={10}
            chamfer={14}
            delay={0.15}
            corners={['tr', 'bl']}
            bracketSize="w-2 h-2"
            rounded=""
            className="hidden md:block absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 lg:right-10 xl:right-16 z-30 w-full max-w-[230px] lg:max-w-[250px] xl:max-w-[270px] pointer-events-auto"
            faceClassName="p-3 bg-zinc-950/85 border border-pink-500/30 backdrop-blur-xl space-y-2.5"
        >
            <header className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest">
                <span className="text-pink-300 font-bold">Shard manifest</span>
                <span className="text-zinc-500">{projects.length} detached</span>
            </header>

            <ol className="space-y-1.5">
                {projects.map((project, i) => {
                    const isActive = i === active;
                    return (
                        <li key={project.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(i)}
                                aria-current={isActive ? 'true' : undefined}
                                style={{ clipPath: chamferClip(8) }}
                                className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 text-left border transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-pink-500/15 ${
                                    isActive
                                        ? 'bg-pink-500/10 border-pink-400/50'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-pink-500/5 hover:border-pink-500/30'
                                }`}
                            >
                                {isActive && <span aria-hidden="true" className="absolute left-0 inset-y-0 w-0.5 bg-pink-400" />}

                                <span
                                    className={`font-mono font-black text-lg leading-none transition-colors ${
                                        isActive ? 'text-pink-300' : 'text-zinc-600'
                                    }`}
                                >
                                    {pad(i + 1)}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block text-[11px] font-semibold truncate transition-colors ${
                                            isActive ? 'text-white' : 'text-zinc-400'
                                        }`}
                                    >
                                        {project.title.split(' — ')[0]}
                                    </span>
                                    <span className="block font-mono text-[8.5px] text-zinc-500 truncate">
                                        {project.tags.slice(0, 2).join(' · ')}
                                    </span>
                                </span>

                                {project.demo ? (
                                    <span title="Live demo" className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-400" />
                                ) : (
                                    <Lock aria-label="Private" className="w-3 h-3 shrink-0 text-zinc-600" />
                                )}

                                {isActive && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-0 bottom-0 h-px bg-pink-400"
                                        style={{ width: `${progress * 100}%` }}
                                    />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 text-center">
                Select a shard or keep scrolling
            </p>
        </HoloCard>
    );
}
