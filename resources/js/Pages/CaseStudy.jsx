import React from 'react';
import { Head } from '@inertiajs/react';
import { MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, MoveHorizontal } from 'lucide-react';
import { chamferClip } from '../Components/Scrolly/constants';
import { VISUALS } from '../Components/Scrolly/visuals';

const pad = (n) => String(n).padStart(2, '0');

const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease: 'easeOut' },
};

const GRID_BG = {
    backgroundImage:
        'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)',
    WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)',
};

/** Thin gradient border with chamfered corners (armor-plate shape used across the portfolio). */
function Plate({ cut = 14, className = '', innerClassName = '', children }) {
    return (
        <div
            style={{ clipPath: chamferClip(cut) }}
            className={`p-px bg-gradient-to-br from-pink-400/45 via-white/5 to-cyan-400/30 ${className}`}
        >
            <div style={{ clipPath: chamferClip(cut) }} className={`h-full bg-[#0a080b] ${innerClassName}`}>
                {children}
            </div>
        </div>
    );
}

function Section({ index, eyebrow, title, children }) {
    return (
        <motion.section {...reveal} className="py-12 sm:py-16 border-t border-white/5">
            <div className="mb-8 space-y-2">
                <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-pink-300/90">
                    {pad(index)} // {eyebrow}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            {children}
        </motion.section>
    );
}

function HeroVisual({ project }) {
    const Visual = VISUALS[project.visual];

    if (!Visual && !project.image) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
        >
            <Plate cut={22} className="h-72 sm:h-96 lg:h-[440px]" innerClassName="relative">
                <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at 50% 58%, rgba(236, 72, 153, 0.18), transparent 70%)' }}
                >
                    {Visual ? (
                        // Inset so the model never runs under the HUD label (top) or the legend (bottom)
                        <div className="absolute inset-x-3 top-10 bottom-12">
                            <Visual interactive />
                        </div>
                    ) : (
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover object-top" />
                    )}
                </div>

                {Visual && (
                    <>
                        <div className="absolute top-4 left-5 right-5 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-widest uppercase pointer-events-none">
                            <span className="text-pink-300">Live 3D module map</span>
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-500">
                                <MoveHorizontal className="w-3 h-3" aria-hidden="true" />
                                Drag to rotate
                            </span>
                        </div>
                        <ul className="absolute bottom-4 left-5 right-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-zinc-400 pointer-events-none">
                            <li className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rotate-45 bg-pink-400" /> Modul
                            </li>
                            <li className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Unit klinik & praktik
                            </li>
                            <li className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" /> Alur pasien
                            </li>
                        </ul>
                    </>
                )}
            </Plate>
        </motion.div>
    );
}

export default function CaseStudy({ project, number, profile }) {
    const cs = project.case_study;
    const contact = profile.contact ?? {};

    const facts = [
        ['Peran', cs.role],
        ['Periode', cs.period],
        ['Klien', cs.client],
        ['Kode sumber', project.github ? 'Publik' : 'Privat'],
    ];

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-[#050505] text-zinc-100 relative overflow-x-clip">
                <Head title={`${project.title} — Case Study`} />

                <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0" style={GRID_BG} />
                    <div className="ambient-glow w-[520px] h-[520px] bg-pink-900/15 -top-48 -left-40" />
                    <div className="ambient-glow w-[560px] h-[560px] bg-cyan-900/10 top-1/3 -right-48" />
                </div>

                <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/75 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                        <a href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            Portofolio
                        </a>
                        <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 truncate">{profile.name}</span>
                    </div>
                </header>

                <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Hero */}
                    <section className="pt-10 sm:pt-16 pb-12 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6 min-w-0"
                        >
                            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-pink-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                Case study // Shard {pad(number)}
                            </p>
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.05] text-white">
                                {project.title}
                            </h1>
                            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">{cs.summary}</p>

                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border border-white/5">
                                {facts.map(([label, value]) => (
                                    <div key={label} className="bg-[#08070a] p-3 space-y-1">
                                        <dt className="font-mono text-[9px] tracking-widest uppercase text-zinc-500">{label}</dt>
                                        <dd className="text-sm text-white font-medium inline-flex items-center gap-1.5">
                                            {label === 'Kode sumber' && !project.github && (
                                                <Lock className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                                            )}
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </motion.div>

                        <HeroVisual project={project} />
                    </section>

                    {/* Stats */}
                    {cs.stats?.length > 0 && (
                        <motion.div {...reveal} className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-14">
                            {cs.stats.map((stat) => (
                                <Plate key={stat.label} cut={12} innerClassName="p-4 sm:p-5 space-y-1">
                                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-300">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-snug">{stat.label}</p>
                                </Plate>
                            ))}
                        </motion.div>
                    )}

                    <Section index={1} eyebrow="Tantangan" title="Kenapa sistem ini tidak sederhana">
                        <div className="grid md:grid-cols-3 gap-4">
                            {cs.challenges.map((item) => (
                                <article key={item.title} className="p-5 sm:p-6 bg-white/[0.02] border border-white/5 space-y-2">
                                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </Section>

                    <Section index={2} eyebrow="Modul" title="Modul yang saya kerjakan">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cs.modules.map((module, i) => (
                                <article
                                    key={module.code}
                                    className="group relative p-5 sm:p-6 bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-colors space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold tracking-widest px-2 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-300">
                                            {module.code}
                                        </span>
                                        <span className="font-mono text-[10px] text-zinc-600">{pad(i + 1)}</span>
                                    </div>
                                    <h3 className="text-base font-semibold text-white">{module.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{module.body}</p>
                                </article>
                            ))}
                        </div>
                    </Section>

                    <Section index={3} eyebrow="Sorotan teknis" title="Masalah nyata yang saya selesaikan">
                        <div className="grid md:grid-cols-2 gap-4">
                            {cs.highlights.map((item) => (
                                <Plate key={item.title} cut={14} innerClassName="p-5 sm:p-6 space-y-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-white">{item.title}</h3>
                                    <div className="space-y-1">
                                        <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">Masalah</p>
                                        <p className="text-sm text-zinc-400 leading-relaxed">{item.problem}</p>
                                    </div>
                                    <div className="space-y-1 pl-3 border-l-2 border-pink-400/60">
                                        <p className="font-mono text-[10px] tracking-widest uppercase text-pink-300">Solusi</p>
                                        <p className="text-sm text-zinc-200 leading-relaxed">{item.solution}</p>
                                    </div>
                                </Plate>
                            ))}
                        </div>
                    </Section>

                    <Section index={4} eyebrow="Teknologi" title="Stack yang dipakai">
                        <div className="flex flex-wrap gap-2">
                            {cs.stack.map((tech) => (
                                <span key={tech} className="font-mono text-xs px-3 py-1.5 bg-white/[0.03] border border-white/10 text-zinc-200">
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <p className="mt-5 text-sm text-zinc-500 leading-relaxed max-w-2xl">
                            Kode sumber dan data milik klien, sehingga tidak dipublikasikan. Visual 3D di atas adalah representasi alur
                            sistem, bukan tangkapan layar aplikasi.
                        </p>
                    </Section>

                    {/* CTA */}
                    <motion.section {...reveal} className="py-14 sm:py-20 border-t border-white/5">
                        <Plate cut={20} innerClassName="relative overflow-hidden p-8 sm:p-12 text-center space-y-6">
                            <div className="ambient-glow w-72 h-72 bg-pink-600/15 -top-24 -right-24 pointer-events-none" />
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Butuh sistem serupa?</h2>
                            <p className="text-zinc-400 max-w-lg mx-auto">
                                Saya terbiasa membangun dan merawat aplikasi operasional yang dipakai setiap hari. Mari diskusikan kebutuhan Anda.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                {contact.email && (
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="px-7 py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" aria-hidden="true" /> Kirim email
                                    </a>
                                )}
                                <a
                                    href="/"
                                    className="px-7 py-3.5 rounded-full border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/30 transition-colors inline-flex items-center gap-2"
                                >
                                    Lihat portofolio <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </a>
                            </div>
                        </Plate>
                    </motion.section>
                </main>

                <footer className="relative z-10 py-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
                    © {new Date().getFullYear()} {profile.name}
                </footer>
            </div>
        </MotionConfig>
    );
}
