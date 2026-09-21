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

export default function ScrollyExperience({ profile, onSummonChange }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Frame state
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadedPercent, setLoadedPercent] = useState(0);
    const imagesRef = useRef([]);
    const totalFrames = 240;

    // Simulation & UI state
    // isSummoned: false = scene Summon saja (belum muncul mecha), true = mecha di-summon
    const [isSummoned, setIsSummoned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isIntroPlaying, setIsIntroPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(1);
    const [currentPhase, setCurrentPhase] = useState(0); // 0: summon, 1: descent/landing, 2: intro identity, 3: armor eject projects
    const [scrollPct, setScrollPct] = useState(0);

    const isSummonedRef = useRef(isSummoned);
    const rafIdRef = useRef(null);
    useEffect(() => {
        isSummonedRef.current = isSummoned;
        if (onSummonChange) onSummonChange(isSummoned);
    }, [isSummoned, onSummonChange]);

    const displayFrameRef = useRef(1);
    const targetFrameRef = useRef(1);
    const lastRenderedFrameRef = useRef(1);
    const isIntroPlayingRef = useRef(false);
    const introRafIdRef = useRef(null);

    useEffect(() => {
        return () => {
            if (introRafIdRef.current) cancelAnimationFrame(introRafIdRef.current);
        };
    }, []);
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
                // If intro animation is currently driving frames from 1 to 46
                if (!isIntroPlayingRef.current) {
                    const diff = targetFrameRef.current - displayFrameRef.current;
                    // High precision lerp - ultra responsive and buttery smooth
                    if (Math.abs(diff) > 0.01) {
                        displayFrameRef.current += diff * 0.45;
                    } else {
                        displayFrameRef.current = targetFrameRef.current;
                    }
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
                if (!isSummonedRef.current) {
                    setCurrentPhase(0);
                } else if (frameIndex <= 76) {
                    setCurrentPhase(1); // Descent & Landing
                } else if (frameIndex <= 156) {
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
    }, []);

    // 4. Scroll Listener - Active after intro finishes
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || isIntroPlayingRef.current || !isSummoned) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
            
            if (totalScrollable <= 0) return;
            const currentScroll = -rect.top;
            const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
            setScrollPct(Math.round(progress * 100));

            // Map progress [0..1] across remaining frames [46..240]
            const target = 46 + progress * (totalFrames - 46);
            targetFrameRef.current = target;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isSummoned]);

    // 5. Button Click Handler: Progress Loading -> Auto Play 1 to 46
    const handleStartSummon = () => {
        if (isLoading || isSummoned) return;
        window.scrollTo({ top: 0, behavior: 'instant' });
        setIsLoading(true);
        setLoadingProgress(0);

        let prog = 0;
        const interval = setInterval(() => {
            prog += 5;
            setLoadingProgress(Math.min(100, prog));

            if (prog >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoading(false);
                    setIsSummoned(true);
                    startIntroDescent();
                }, 200);
            }
        }, 20); // ~400ms clean progress bar
    };

    const startIntroDescent = () => {
        if (introRafIdRef.current) cancelAnimationFrame(introRafIdRef.current);
        setIsIntroPlaying(true);
        isIntroPlayingRef.current = true;
        displayFrameRef.current = 1;
        targetFrameRef.current = 46;

        const startFrame = 1;
        const endFrame = 46;
        const durationMs = 1500; // 1.5 seconds smooth cinematic arrival
        const startTime = performance.now();

        const animateIntro = (currentTime) => {
            const elapsed = currentTime - startTime;
            const t = Math.min(1, elapsed / durationMs);
            // Cubic ease out for dramatic cinematic superhero landing
            const ease = 1 - Math.pow(1 - t, 3);
            const frameNow = startFrame + ease * (endFrame - startFrame);
            
            displayFrameRef.current = frameNow;

            if (t < 1) {
                introRafIdRef.current = requestAnimationFrame(animateIntro);
            } else {
                displayFrameRef.current = endFrame;
                targetFrameRef.current = endFrame;
                isIntroPlayingRef.current = false;
                setIsIntroPlaying(false);
                introRafIdRef.current = null;
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
                    if (totalScrollable > 0) {
                        const currentScroll = -rect.top;
                        const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
                        setScrollPct(Math.round(progress * 100));
                        targetFrameRef.current = 46 + progress * (totalFrames - 46);
                    }
                }
            }
        };

        introRafIdRef.current = requestAnimationFrame(animateIntro);
    };

    const handleReset = () => {
        if (introRafIdRef.current) cancelAnimationFrame(introRafIdRef.current);
        isIntroPlayingRef.current = false;
        setIsIntroPlaying(false);
        setIsSummoned(false);
        setIsLoading(false);
        setLoadingProgress(0);
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
            className={`relative w-full bg-[#030307] text-white select-none ${
                isSummoned ? 'h-[600vh]' : 'h-screen overflow-hidden'
            }`}
        >
            {/* STICKY FULLSCREEN VIEWPORT (CANVAS & OVERLAYS) */}
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-20">
                {/* 1. Canvas video sequence (Muncul ketika summon di-trigger) */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
                        isSummoned ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    style={{
                        filter: 'brightness(1.05) contrast(1.05)',
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

                {/* Cyber HUD Status Bar (Top) - Muncul hanya saat mecha di-summon */}
                {isSummoned && (
                    <div className="absolute top-20 inset-x-0 z-30 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                            <span className="font-mono text-xs tracking-widest text-cyan-400 font-semibold uppercase">
                                {isIntroPlaying
                                    ? `APPROACHING ROOFTOP // FRAME ${currentFrame}/46`
                                    : `PHASE 0${currentPhase} // FRAME ${currentFrame}/${totalFrames} // ${scrollPct}%`}
                            </span>
                        </div>

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
                    </div>
                )}
                {/* ========================================================================= */}
                {/* SCENE 0: SUMMON INITIAL SCREEN (Hanya ada Summon saja sebelum diklik)   */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {!isSummoned && (
                        <motion.div
                            key="summon-screen"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-40 flex items-center justify-center p-6 select-none bg-[#030307]"
                        >
                            {!isLoading ? (
                                <button
                                    id="btn-summon-mecha"
                                    onClick={handleStartSummon}
                                    className="px-10 py-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-lg tracking-widest uppercase border border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                                >
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    <span>SUMMON MECHA</span>
                                    <ArrowRight className="w-5 h-5 text-purple-400" />
                                </button>
                            ) : (
                                /* Progress Loading saat tombol diklik */
                                <div className="flex flex-col items-center gap-4 bg-zinc-950/90 p-8 rounded-2xl border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] min-w-[320px]">
                                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                                        <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span>SUMMONING PROTOCOL...</span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-75"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>

                                    <div className="w-full flex items-center justify-between font-mono text-[11px] text-zinc-400">
                                        <span>INITIALIZING FRAMES</span>
                                        <span className="text-cyan-400 font-bold">{loadingProgress}%</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* SCENE 1: MECHA DESCENT & SMOOTH ROOFTOP LANDING (Frame 1 - 76)            */}
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
                {/* SCENE 2: STANDING & INTRODUCING PILOT IDENTITY (Frame 77 - 156)           */}
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
