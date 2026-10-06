import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

function ExperienceCard({ job, index }) {
    return (
        <motion.article
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden"
        >
            <div
                aria-hidden="true"
                className={`absolute top-0 left-0 w-1 h-full rounded-full bg-gradient-to-b ${
                    job.current ? 'from-cyan-400 to-purple-500' : 'from-zinc-600 to-zinc-800'
                }`}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{job.role}</h3>
                    <p className="text-xs text-purple-400 font-mono">{job.company}</p>
                    {job.division && <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{job.division}</p>}
                </div>
                <span
                    className={`text-xs font-mono px-3 py-1 rounded border self-start flex items-center gap-1.5 ${
                        job.current
                            ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                >
                    {job.current && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {job.period}
                </span>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400 leading-relaxed list-none">
                {job.highlights.map((text) => (
                    <li key={text} className="flex gap-2">
                        <span aria-hidden="true" className="text-cyan-500 mt-1 shrink-0">▹</span>
                        <span>{text}</span>
                    </li>
                ))}
            </ul>
        </motion.article>
    );
}

export default function ExperienceSection({ experience }) {
    return (
        <section id="experience" className="py-24 px-6 max-w-5xl mx-auto relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-3 mb-14 text-center sm:text-left"
            >
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
                    <Code2 className="w-3.5 h-3.5" aria-hidden="true" /> Track Record
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Experience &amp; Trajectory</h2>
            </motion.div>

            <div className="space-y-6">
                {experience.map((job, index) => (
                    <ExperienceCard key={`${job.company}-${job.period}`} job={job} index={index} />
                ))}
            </div>
        </section>
    );
}
