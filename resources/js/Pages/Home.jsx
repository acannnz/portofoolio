import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import ParticleNetworkBackground from '../Components/ParticleNetworkBackground';
import { 
    Mail, 
    ExternalLink, 
    Code2, 
    Layers, 
    Sparkles, 
    ArrowUpRight,
    ChevronDown,
    Globe,
    MapPin,
    Calendar
} from 'lucide-react';

export default function Home({ profile }) {
    const [showMap, setShowMap] = useState(false);

    // Initialize Lenis Smooth Scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-purple-500/20 selection:text-purple-300 relative overflow-hidden select-none">
            {/* Moving Particle Network Trajectory Canvas Background */}
            <ParticleNetworkBackground />

            {/* Ambient Background Glows */}
            <div className="ambient-glow w-[500px] h-[500px] bg-purple-900/15 -top-40 -left-40 pointer-events-none z-0" />
            <div className="ambient-glow w-[600px] h-[600px] bg-blue-900/10 top-1/3 -right-40 pointer-events-none z-0" />
            <div className="ambient-glow w-[500px] h-[500px] bg-indigo-900/15 bottom-10 left-1/4 pointer-events-none z-0" />

            {/* Glass Navigation Bar */}
            <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
                <nav className="glass-card rounded-full px-6 py-3 flex items-center gap-8 border border-white/10 shadow-2xl backdrop-blur-md">
                    <a href="#hero" className="text-sm font-semibold tracking-wide text-white hover:text-purple-400 transition-colors">
                        Home
                    </a>
                    <a href="#projects" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        Projects
                    </a>
                    <a href="#skills" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        Skills
                    </a>
                    <a href="#contact" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        Contact
                    </a>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-6 pt-28 pb-16 relative z-10">
                <motion.div 
                    className="max-w-4xl mx-auto text-center space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Profile Photo Container with Animated Rotating Conic Light Ring */}
                    <motion.div variants={itemVariants} className="relative inline-block group">
                        {/* Soft Outer Glowing Spinning Ring */}
                        <div className="absolute -inset-1.5 rounded-full conic-glow-bg opacity-75 blur-md animate-spin-glow group-hover:opacity-100 transition duration-500" />
                        
                        {/* Inner Sharp Spinning Light Ring Frame */}
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-[3px] overflow-hidden glass-card shadow-2xl">
                            <div className="absolute inset-0 rounded-full conic-glow-bg animate-spin-glow" />
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-950 p-0.5">
                                <img 
                                    src={profile?.avatar || '/images/profile.png'} 
                                    alt={profile?.name || 'I PUTU GEDE CANDRA PRATAMA'} 
                                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Active Status Badge */}
                        <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-lg z-10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Available
                        </div>
                    </motion.div>

                    {/* Full Name & Title */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 uppercase leading-none">
                            {profile?.name || 'I PUTU GEDE CANDRA PRATAMA'}
                        </h1>
                        <p className="text-xl sm:text-2xl font-bold tracking-wide text-purple-400">
                            {profile?.role || 'Fullstack Developer'}
                        </p>
                    </motion.div>

                    {/* Metadata Pills (Age, Location with Interactive Map Popup) */}
                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-3 pt-1">
                        <div className="px-4 py-1.5 rounded-full glass-card border border-white/10 text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            {profile?.age || '23 Years Old'}
                        </div>

                        {/* Interactive Location Badge with Dark Map Popup Tooltip */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setShowMap(true)}
                            onMouseLeave={() => setShowMap(false)}
                        >
                            <div className="px-4 py-1.5 rounded-full glass-card border border-white/10 text-xs font-medium text-zinc-300 flex items-center gap-1.5 cursor-pointer hover:border-purple-500/40 hover:text-white transition-all shadow-md">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                                {profile?.location || 'Jembrana, Bali'}
                            </div>

                            {/* Map Popup Modal / Tooltip */}
                            <AnimatePresence>
                                {showMap && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.92 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.94 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 sm:w-80 glass-card rounded-2xl p-3.5 border border-purple-500/40 shadow-2xl z-50 backdrop-blur-xl pointer-events-none"
                                    >
                                        {/* Header info */}
                                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                                                <span className="text-xs font-bold text-white tracking-wide">Jembrana, Bali, Indonesia</span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-mono">8.3582° S, 114.6291° E</span>
                                        </div>

                                        {/* Map Preview Canvas / Dark Mode Embed */}
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-zinc-950">
                                            <iframe
                                                title="Jembrana Bali Map"
                                                width="100%"
                                                height="100%"
                                                className="w-full h-full filter invert-[90%] hue-rotate-180 brightness-95 opacity-85 contrast-125 pointer-events-none"
                                                src="https://www.openstreetmap.org/export/embed.html?bbox=114.4500%2C-8.4800%2C114.8200%2C-8.2200&layer=mapnik&marker=-8.3582%2C114.6291"
                                                style={{ border: 0 }}
                                            />
                                            
                                            {/* Glowing Custom Pin Marker Overlay */}
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className="relative flex items-center justify-center">
                                                    <span className="absolute w-8 h-8 rounded-full bg-purple-500/40 animate-ping" />
                                                    <div className="p-2 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/50 border border-white/30 z-10">
                                                        <MapPin className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Tag */}
                                        <div className="pt-2 text-[10px] text-center text-zinc-400 font-medium flex items-center justify-center gap-1">
                                            <span>🌴</span> Negaroa • Bali, Indonesia
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Brief Bio */}
                    <motion.p 
                        variants={itemVariants}
                        className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed pt-2"
                    >
                        {profile?.about}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 pt-4">
                        <a 
                            href="#projects" 
                            className="px-7 py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg hover:shadow-purple-500/10 flex items-center gap-2 group"
                        >
                            View Projects
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                        <a 
                            href="#contact" 
                            className="px-7 py-3.5 rounded-full glass-card text-zinc-300 font-medium text-sm hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2"
                        >
                            Contact Me
                        </a>
                    </motion.div>
                </motion.div>

                {/* Down Arrow Indicator */}
                <motion.div 
                    className="absolute bottom-6 inset-x-0 flex justify-center text-zinc-500"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-3 mb-14 text-center sm:text-left"
                >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" /> Portfolio Showcase
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                        Featured Projects
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile?.projects?.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                                        <Code2 className="w-5 h-5" />
                                    </span>
                                    <div className="flex gap-2 text-zinc-400">
                                        <a href={project.github} className="p-1 hover:text-white transition-colors" title="Repository">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                        <a href={project.demo} className="p-1 hover:text-white transition-colors" title="Live Preview">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="pt-6 flex flex-wrap gap-2">
                                {project.tags.map((tag, tIdx) => (
                                    <span 
                                        key={tIdx} 
                                        className="text-xs px-2.5 py-1 rounded-md bg-zinc-900/80 text-zinc-400 border border-zinc-800"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
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

            {/* Contact Section */}
            <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-card rounded-3xl p-10 sm:p-14 space-y-8 border border-white/10 relative overflow-hidden"
                >
                    <div className="ambient-glow w-60 h-60 bg-purple-600/20 -top-20 -right-20 pointer-events-none" />
                    
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        Let's Work Together
                    </h2>
                    <p className="text-zinc-400 max-w-lg mx-auto text-base">
                        Apakah Anda berminat untuk berkolaborasi atau mendiskusikan peluang proyek baru?
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
            <footer className="py-8 border-t border-zinc-900 text-center text-xs text-zinc-600 relative z-10">
                © {new Date().getFullYear()} I PUTU GEDE CANDRA PRATAMA. Built with Laravel 13, Inertia & React.
            </footer>
        </div>
    );
}
