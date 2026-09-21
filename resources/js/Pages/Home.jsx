import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ScrollyExperience from '../Components/ScrollyExperience';
import ParticleNetworkBackground from '../Components/ParticleNetworkBackground';
import { 
    Mail, 
    Code2, 
    Layers
} from 'lucide-react';

export default function Home({ profile }) {
    const [isSummoned, setIsSummoned] = useState(false);

    // Native scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-purple-500/20 selection:text-purple-300 relative select-none">
            <Head title="Candra - Mecha Portfolio Experience" />

            {/* Moving Particle Network Background */}
            <ParticleNetworkBackground />

            {/* Ambient Background Glows */}
            <div className="ambient-glow w-[500px] h-[500px] bg-purple-900/15 -top-40 -left-40 pointer-events-none z-0" />
            <div className="ambient-glow w-[600px] h-[600px] bg-cyan-900/10 top-1/3 -right-40 pointer-events-none z-0" />
            <div className="ambient-glow w-[500px] h-[500px] bg-indigo-900/15 bottom-10 left-1/4 pointer-events-none z-0" />

            {/* Glass Navigation Bar - Hanya muncul jika mecha sudah di-summon */}
            {isSummoned && (
                <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
                    <nav className="glass-card rounded-full px-6 py-2.5 flex items-center gap-6 sm:gap-8 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-auto">
                        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">
                            CANDRA.3D
                        </span>
                        <a href="#skills" className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
                            Skills
                        </a>
                        <a href="#experience" className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
                            Experience
                        </a>
                        <a href="#contact" className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
                            Contact
                        </a>
                    </nav>
                </header>
            )}

            {/* HERO SCROLLYEXPERIENCE CONTAINER */}
            <main>
                <ScrollyExperience profile={profile} onSummonChange={setIsSummoned} />

                {/* Additional Sections below motion experience (Muncul setelah summon) */}
                {isSummoned && (
                    <>
                {/* Skills Section */}
                <section id="skills" className="py-24 px-6 max-w-6xl mx-auto relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3 mb-14 text-center sm:text-left"
                    >
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
                            <Layers className="w-3.5 h-3.5" /> Technical Expertise
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Skills & Stack
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {profile?.skills?.map((skill, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="glass-card rounded-xl p-5 text-center space-y-2 hover:border-purple-500/30 transition-all group"
                            >
                                <div className="text-xs text-purple-400 font-medium">{skill.category}</div>
                                <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                    {skill.name}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Experience / Milestones Section */}
                <section id="experience" className="py-24 px-6 max-w-5xl mx-auto relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3 mb-14 text-center sm:text-left"
                    >
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
                            <Code2 className="w-3.5 h-3.5" /> Track Record
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                            Experience & Trajectory
                        </h2>
                    </motion.div>

                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Fullstack Engineer & Web Specialist</h3>
                                    <p className="text-xs text-purple-400 font-mono">Independent Consultant • Remote</p>
                                </div>
                                <span className="text-xs font-mono px-3 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 self-start">
                                    2022 — Present
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Merancang arsitektur backend berskala tinggi dengan Laravel & database relational, serta mengembangkan frontend interaktif 60fps dengan React, Inertia, dan TailwindCSS.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="glass-card rounded-3xl p-10 sm:p-14 space-y-8 border border-white/10 relative overflow-hidden"
                    >
                        <div className="ambient-glow w-60 h-60 bg-purple-600/20 -top-20 -right-20 pointer-events-none" />
                        
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                            Ready to Collaborate?
                        </h2>
                        <p className="text-zinc-400 max-w-lg mx-auto text-base">
                            Berminat membangun produk digital berstandar tinggi atau mengintegrasikan pengalaman interaktif pada platform Anda?
                        </p>

                        <div className="flex justify-center gap-4 pt-2">
                            <a 
                                href="mailto:candra@example.com" 
                                className="px-8 py-4 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <Mail className="w-4 h-4" /> Send Email
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="py-8 border-t border-zinc-900 text-center text-xs text-zinc-600 relative z-20">
                    © {new Date().getFullYear()} I PUTU GEDE CANDRA PRATAMA. Built with Laravel, Inertia, React & Framer Motion.
                </footer>
                </>
                )}
            </main>
        </div>
    );
}
