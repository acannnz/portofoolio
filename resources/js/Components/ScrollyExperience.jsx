import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Shield,
    Terminal,
    ChevronDown,
    ExternalLink,
    GitBranch,
    Code2,
    Cpu,
    Layers,
    ArrowRight,
    Play,
    RotateCcw,
    Radio,
    User
} from 'lucide-react';

export default function ScrollyExperience({ profile }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Frame state
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadedPercent, setLoadedPercent] = useState(0);
    const imagesRef = useRef([]);
    const totalFrames = 120;

    // Simulation & UI state
    // isSummoned: false = scene Summon saja (belum muncul mecha), true = mecha di-summon
    const [isSummoned, setIsSummoned] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(1);
    const [currentPhase, setCurrentPhase] = useState(0); // 0: summon, 1: descent/landing, 2: intro identity, 3: armor eject projects
    const [scrollPct, setScrollPct] = useState(0);

    const rafIdRef = useRef(null);
    const targetFrameRef = useRef(1);
    const displayFrameRef = useRef(1);
    const lastRenderedFrameRef = useRef(1);
    // 1. Preload 120 frames
    useEffect(() => {
        const loadedImages = [];
        let count = 0;

        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            const frameNum = String(i).padStart(3, '0');
            img.src = `/frames/frame_${frameNum}.webp`;

            img.onload = () => {
                count++;
                setLoadedPercent(Math.round((count / totalFrames) * 100));

                if (i === 1) {
                    renderFrame(img);
                }
                if (count === totalFrames) {
                    setImagesLoaded(true);
                }
            };
            loadedImages.push(img);
        }
        imagesRef.current = loadedImages;

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    // 2. Responsive Canvas Rendering (object-fit cover)
    const renderFrame = (img) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);

        const imgRatio = (img.naturalWidth || 1280) / (img.naturalHeight || 720);
        const canvasRatio = width / height;

        let drawW, drawH, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawW = width;
            drawH = width / imgRatio;
            drawX = 0;
            drawY = (height - drawH) / 2;
        } else {
            drawH = height;
            drawW = height * imgRatio;
            drawX = (width - drawW) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
    };

    // 3. Smooth Lerp Animation Loop
    useEffect(() => {
        const loop = () => {
            if (imagesRef.current.length > 0) {
                const diff = targetFrameRef.current - displayFrameRef.current;
                // High precision lerp - ultra responsive and buttery smooth
                if (Math.abs(diff) > 0.01) {
                    displayFrameRef.current += diff * 0.45;
                } else {
                    displayFrameRef.current = targetFrameRef.current;
                }

                const frameIndex = Math.min(
                    totalFrames,
                    Math.max(1, Math.round(displayFrameRef.current))
                );

                // Find valid loaded image: exact frame or closest loaded frame
                let img = imagesRef.current[frameIndex - 1];
                if (!img || !img.complete || img.naturalWidth === 0) {
                    img = imagesRef.current[lastRenderedFrameRef.current - 1];
                }

                if (img && img.complete && img.naturalWidth > 0) {
                    renderFrame(img);
                    lastRenderedFrameRef.current = frameIndex;
                }

                setCurrentFrame(frameIndex);

                // Update phase based on frame index
                if (!isSummoned) {
                    setCurrentPhase(0);
                } else if (frameIndex <= 38) {
                    setCurrentPhase(1); // Descent & Landing
                } else if (frameIndex <= 78) {
                    setCurrentPhase(2); // Standing Identity Introduction
                } else {
                    setCurrentPhase(3); // Armor Ejection & Projects
                }
            }

            rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);

        const handleResize = () => {
            const frameIndex = Math.min(
                totalFrames,
                Math.max(1, Math.round(displayFrameRef.current))
            );
            const img = imagesRef.current[frameIndex - 1];
            if (img && img.complete) {
                renderFrame(img);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [isSummoned]);

    // 4. Scroll Listener - Ultra-smooth 240Hz direct mouse tracking
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
            
            if (totalScrollable <= 0) return;
            const currentScroll = -rect.top;
            const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
            setScrollPct(Math.round(progress * 100));

            // Auto summon on scroll
            if (currentScroll > 20 && !isSummoned) {
                setIsSummoned(true);
            }

            // Instant responsive mapping to frames [1..120]
            const target = 1 + progress * (totalFrames - 1);
            targetFrameRef.current = target;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isSummoned]);

    const handleStartSummon = () => {
        setIsSummoned(true);
        if (containerRef.current) {
            const targetY = containerRef.current.offsetTop + window.innerHeight * 0.5;
            window.scrollTo({
                top: targetY,
                behavior: 'smooth',
            });
        }
    };
    const handleReset = () => {
        setIsSummoned(false);
        targetFrameRef.current = 1;
        displayFrameRef.current = 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const projects = profile?.projects || [
        {
            id: 1,
            title: 'Sistem Informasi Preskripsi & Farmasi',
            description: 'Aplikasi manajemen stok obat real-time dan sistem preskripsi pasien terintegrasi dengan validasi transaksi.',
            tags: ['Laravel', 'PostgreSQL', 'TailwindCSS'],
            github: '#',
            demo: '#'
        },
        {
            id: 2,
            title: 'Real-Time Audio Sync Platform',
            description: 'Platform sinkronisasi pemutaran audio multi-device dengan latensi rendah (<15ms) via WebSockets.',
            tags: ['Flutter Web', 'WebSockets', 'Go / Node'],
            github: '#',
            demo: '#'
        },
        {
            id: 3,
            title: 'SSO Identity Hub & App Launcher',
            description: 'Sistem otentikasi terpusat Single Sign-On berbasis OIDC dengan dashboard peluncur aplikasi dan perizinan dinamis.',
            tags: ['Laravel', 'OAuth2/OIDC', 'React'],
            github: '#',
            demo: '#'
        }
    ];

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[600vh] bg-[#030307] text-white select-none"
        >
            {/* STICKY FULLSCREEN VIEWPORT (CANVAS & OVERLAYS) */}
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-20">
                {/* 1. Canvas video sequence */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    style={{
                        filter: !isSummoned ? 'brightness(0.8) contrast(1.05)' : 'brightness(1.05) contrast(1.05)',
                    }}
                />

                {/* Subtle Cinematic Vignette - Clear View of Mecha & City */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none z-10" />
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
                    style={{
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Cyber HUD Status Bar (Top) */}
                <div className="absolute top-20 inset-x-0 z-30 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="font-mono text-xs tracking-widest text-cyan-400 font-semibold uppercase">
                            {!isSummoned 
                                ? 'MECHA STANDBY // READY FOR SUMMON' 
                                : `PHASE 0${currentPhase} // FRAME ${currentFrame}/${totalFrames} // ${scrollPct}%`}
                        </span>
                    </div>

                    {isSummoned && (
                        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-zinc-400">
                            <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md">
                                LAT: 8.36° S | LONG: 114.62° E
                            </span>
                            <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                                SYNC: ULTRA 240FPS
                            </span>
                            <button
                                onClick={handleReset}
                                className="pointer-events-auto p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-purple-500 transition-colors"
                                title="Reset Summon"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* SCENE 0: SUMMON INITIAL SCREEN (Hanya ada Summon saja sebelum diklik)   */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {!isSummoned && (
                        <motion.div
                            key="summon-screen"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center"
                        >
                            {/* Radial Glow */}
                            <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
                            <div className="absolute w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-2xl pointer-events-none -z-10" />

                            {/* Tech Chip Badge */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs tracking-wider mb-6 shadow-lg shadow-cyan-950/50 backdrop-blur-md"
                            >
                                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                                <span>CYBERNETIC LINK ONLINE • STANDBY</span>
                            </motion.div>

                            {/* Main Summon Title */}
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none max-w-4xl"
                            >
                                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                                    INITIALIZE
                                </span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
                                    MECHA PROTOCOL
                                </span>
                            </motion.h1>

                            {/* Subtitle / Description */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-5 text-zinc-400 max-w-lg text-sm sm:text-base font-normal leading-relaxed"
                            >
                                Tekan tombol summon untuk memulai deploy unit mecha ke rooftop kota cyber. Scroll untuk mengendalikan frame pergerakan, profil pilot, dan pelepasan pecahan armor proyek.
                            </motion.p>

                            {/* The Summon Button */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-10 relative group"
                            >
                                {/* Glowing outer ring */}
                                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition duration-500 animate-pulse" />

                                <button
                                    onClick={handleStartSummon}
                                    className="relative px-10 py-5 rounded-2xl bg-zinc-950 text-white font-bold text-base sm:text-lg tracking-wider uppercase border border-cyan-400/50 shadow-2xl flex items-center gap-3 transition-all transform group-hover:scale-[1.03] group-active:scale-[0.98]"
                                >
                                    <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                                    <span>SUMMON MECHA CANDRA</span>
                                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1.5 transition-transform" />
                                </button>
                            </motion.div>

                            {/* Loading Indicator when frames still downloading */}
                            {!imagesLoaded && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="mt-6 flex flex-col items-center gap-2"
                                >
                                    <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                                            style={{ width: `${loadedPercent}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-[11px] text-zinc-500">
                                        Buffering Neural Frames: {loadedPercent}%
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* SCENE 1: MECHA DESCENT & SMOOTH ROOFTOP LANDING (Frame 1 - 38)            */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isSummoned && currentPhase === 1 && (
                        <motion.div
                            key="phase-descent"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="absolute bottom-16 inset-x-0 z-30 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
                        >
                            <div className="glass-card rounded-2xl px-6 py-4 border border-cyan-500/30 backdrop-blur-xl shadow-2xl max-w-md pointer-events-auto">
                                <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
                                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                                    <span>STAGE 01 • DESCENT IN PROGRESS</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    MECHA APPROACHING ROOFTOP
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Scroll ke bawah untuk mendaratkan mecha secara perlahan & membuka identitas pilot.
                                </p>
                                
                                <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500 font-mono text-[11px]">
                                    <ChevronDown className="w-4 h-4 animate-bounce text-cyan-400" />
                                    <span>SCROLL TO TOUCHDOWN</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* SCENE 2: STANDING & INTRODUCING PILOT IDENTITY (Frame 39 - 78)            */}
                {/* Mecha berdiri gagah di rooftop & memperkenalkan dirinya (identitas user) */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isSummoned && currentPhase === 2 && (
                        <motion.div
                            key="phase-identity"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-y-0 left-0 sm:left-10 md:left-16 z-30 flex items-center p-6 pointer-events-none max-w-xl"
                        >
                            <div className="glass-card rounded-3xl p-7 sm:p-9 border border-purple-500/40 backdrop-blur-2xl shadow-2xl shadow-purple-950/40 pointer-events-auto space-y-6">
                                {/* Pilot Header Tag */}
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-mono text-[10px] text-purple-400 tracking-wider uppercase font-bold">
                                                PILOT IDENTITY PROTOCOL
                                            </div>
                                            <div className="text-xs text-zinc-300 font-mono">
                                                STATUS: STANDING READY
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        ONLINE
                                    </span>
                                </div>

                                {/* Main Identity Intro */}
                                <div className="space-y-2">
                                    <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                                        // MECHA INTRODUCES:
                                    </span>
                                    <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 tracking-tight uppercase">
                                        {profile?.name || 'I PUTU GEDE CANDRA PRATAMA'}
                                    </h2>
                                    <p className="text-lg font-bold text-purple-400">
                                        {profile?.role || 'Fullstack Developer'}
                                    </p>
                                    <p className="text-sm text-zinc-400 leading-relaxed pt-1">
                                        {profile?.about || 'Software Engineer berpengalaman dalam merancang dan membangun aplikasi web modern yang cepat, skalabel, serta berantarmuka interaktif.'}
                                    </p>
                                </div>

                                {/* Identity Specs Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">LOCATION</span>
                                        <span className="text-xs font-bold text-zinc-200">
                                            {profile?.location || 'Jembrana, Bali'}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">PRIMARY STACK</span>
                                        <span className="text-xs font-bold text-cyan-300">
                                            Laravel • React • Node
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">EXPERIENCE</span>
                                        <span className="text-xs font-bold text-purple-300">
                                            2+ Years Building
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">STATUS</span>
                                        <span className="text-xs font-bold text-emerald-400">
                                            Available for Hire
                                        </span>
                                    </div>
                                </div>

                                {/* Step Hint to Next Stage */}
                                <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-white/5">
                                    <span className="font-mono text-[11px] text-zinc-500">
                                        Scroll down untuk armor detachment
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-purple-400 animate-bounce" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* SCENE 3: ARMOR DETACHMENT & PROJECT FRAGMENTS (Frame 79 - 120)            */}
                {/* Mecha melepas armor, di pecahan melayang ada proyek-proyek                */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isSummoned && currentPhase === 3 && (
                        <motion.div
                            key="phase-armor-projects"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 pointer-events-none"
                        >
                            {/* Top Hologram Title */}
                            <div className="text-center pt-8 pointer-events-auto">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-xs uppercase tracking-widest mb-2 backdrop-blur-md">
                                    <Shield className="w-3.5 h-3.5 animate-pulse" />
                                    <span>STAGE 03 • ARMOR DETACHMENT // PROJECT MATRIX</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                                    PECAHAN ARMOR & PROYEK TERPILIH
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl mx-auto">
                                    Setiap pecahan armor yang terlepas membawa modul sistem dan portofolio karya yang telah dirancang.
                                </p>
                            </div>

                            {/* The 3 Floating Armor Shard Project Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-6 pointer-events-auto">
                                {projects.map((proj, idx) => (
                                    <motion.div
                                        key={proj.id}
                                        initial={{ opacity: 0, y: 40, rotate: idx === 0 ? -3 : idx === 2 ? 3 : 0 }}
                                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="relative group glass-card rounded-2xl p-6 border border-cyan-500/30 hover:border-purple-400/60 shadow-2xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300"
                                    >
                                        {/* Shard Corner Glow */}
                                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-purple-400/40 transition-colors" />

                                        <div className="space-y-3">
                                            {/* Shard ID Header */}
                                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span className="font-mono text-[11px] text-cyan-300 font-bold uppercase tracking-wider">
                                                        ARMOR SHARD #{idx + 1}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[10px] text-zinc-500">
                                                    STATUS: ACTIVE
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                {proj.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                                                {proj.description}
                                            </p>
                                        </div>

                                        {/* Tags & Action Links */}
                                        <div className="pt-4 space-y-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {proj.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/90 text-cyan-300/90 border border-cyan-500/20"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <a
                                                    href={proj.demo}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                                >
                                                    <span>Buka Modul</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <a
                                                    href={proj.github}
                                                    className="text-zinc-500 hover:text-white transition-colors"
                                                    title="GitHub Repo"
                                                >
                                                    <GitBranch className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bottom Guidance */}
                            <div className="text-center pb-2 pointer-events-auto">
                                <a
                                    href="#skills"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-purple-500/50 transition-all backdrop-blur-md shadow-lg"
                                >
                                    <span>Lanjut ke Modul Skills & Kontak di Bawah</span>
                                    <ChevronDown className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
