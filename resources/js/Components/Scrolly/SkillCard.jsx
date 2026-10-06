import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import CornerBrackets from './CornerBrackets';
import { ICONS } from './constants';

export default function SkillCard({ skill, index, side, parallaxY }) {
    const Icon = ICONS[skill.icon] ?? Layers;
    const isLeft = side === 'left';

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            style={{ y: parallaxY }}
            className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/85 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2 relative overflow-hidden group shadow-[0_0_25px_rgba(6,182,212,0.12)]"
        >
            <CornerBrackets
                corners={isLeft ? ['tr', 'bl'] : ['tl', 'br']}
                size="w-2.5 h-2.5"
                color="border-cyan-400/80"
            />

            <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-cyan-400 uppercase font-bold tracking-wider">{skill.serial}</span>
                <span className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wider">
                    {skill.status}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                        {skill.name}
                    </h4>
                    <span className="text-[9px] text-purple-400 font-mono block">{skill.category}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1">
                {skill.tags.map((tag) => (
                    <span
                        key={tag}
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-300/90 border border-cyan-500/20"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="tracking-widest">SYSTEM READY</span>
                </div>
                <span className="text-zinc-500 font-bold">PRODUCTION</span>
            </div>
        </motion.div>
    );
}
