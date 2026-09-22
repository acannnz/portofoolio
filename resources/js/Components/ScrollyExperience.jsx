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
    User,
    Server,
    Database,
    Zap,
    Network
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
    const [typedName, setTypedName] = useState('');
    const [nameComplete, setNameComplete] = useState(false);
    // Scroll-driven animation parameters for lines & components
    const p1Progress = Math.min(1, Math.max(0, (currentFrame - 46) / 30));
    const p1Delta = (currentFrame - 46) * 1.2;
    const p2Progress = Math.min(1, Math.max(0, (currentFrame - 77) / 79));
    const p2Center = currentFrame - 116; // Center standing frame
    const lineDashOffset = -currentFrame * 7; // Real-time laser pulse flowing with scroll

    const fullName = profile?.name || 'I PUTU GEDE CANDRA PRATAMA';
    useEffect(() => {
        if (isSummoned && !isIntroPlaying) {
            let i = 0;
            setTypedName('');
            setNameComplete(false);
            const delayTimer = setTimeout(() => {
                const typeInterval = setInterval(() => {
                    i++;
                    setTypedName(fullName.slice(0, i));
                    if (i >= fullName.length) {
                        clearInterval(typeInterval);
                        setNameComplete(true);
                    }
                }, 38);
                return () => clearInterval(typeInterval);
            }, 300);
            return () => clearTimeout(delayTimer);
        } else {
            setTypedName('');
            setNameComplete(false);
        }
    }, [isSummoned, isIntroPlaying, fullName]);
    const isSummonedRef = useRef(isSummoned);
    const rafIdRef = useRef(null);
    useEffect(() => {
        isSummonedRef.current = isSummoned;
        if (onSummonChange) onSummonChange(isSummoned && !isIntroPlaying);
    }, [isSummoned, isIntroPlaying, onSummonChange]);

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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

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
        setTypedName('');
        setNameComplete(false);
        targetFrameRef.current = 1;
        displayFrameRef.current = 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const skills = profile?.skills || [
        { name: 'Laravel, PHP, Golang', category: 'Backend' },
        { name: 'React & Next.js', category: 'Frontend' },
        { name: 'PostgreSQL, MySQL, SQL Server', category: 'Database' },
        { name: 'TailwindCSS & UI/UX', category: 'Design' },
        { name: 'REST API & WebSockets', category: 'Architecture' },
        { name: 'Git & Docker', category: 'DevOps' },
    ];

    const SKILL_METRICS = {
        'Laravel, PHP, Golang': {
            serial: 'MOD_01 // BACKEND',
            status: 'CORE_ENGINE',
            tags: ['Laravel', 'PHP', 'Golang'],
            icon: Server,
        },
        'Laravel & PHP': {
            serial: 'MOD_01 // BACKEND',
            status: 'CORE_ENGINE',
            tags: ['Laravel', 'PHP', 'Golang'],
            icon: Server,
        },
        'React & Next.js': {
            serial: 'MOD_02 // FRONTEND',
            status: 'INTERFACE',
            tags: ['React.js', 'Next.js', 'Framer Motion'],
            icon: Code2,
        },
        'PostgreSQL, MySQL, SQL Server': {
            serial: 'MOD_03 // DATABASE',
            status: 'DATA_CORE',
            tags: ['PostgreSQL', 'MySQL', 'SQL Server'],
            icon: Database,
        },
        'PostgreSQL & MySQL': {
            serial: 'MOD_03 // DATABASE',
            status: 'DATA_CORE',
            tags: ['PostgreSQL', 'MySQL', 'SQL Server'],
            icon: Database,
        },
        'TailwindCSS & UI/UX': {
            serial: 'MOD_04 // DESIGN',
            status: 'VISUAL_SYSTEM',
            tags: ['TailwindCSS', 'Cyberpunk HUD', 'UI/UX'],
            icon: Zap,
        },
        'REST API & WebSockets': {
            serial: 'MOD_05 // ARCHITECTURE',
            status: 'NETWORKING',
            tags: ['RESTful API', 'WebSockets', 'Real-time'],
            icon: Network,
        },
        'Git & Docker': {
            serial: 'MOD_06 // DEVOPS',
            status: 'DEPLOYMENT',
            tags: ['Git Flow', 'Docker Container', 'CI/CD'],
            icon: Terminal,
        }
    };

    const projects = profile?.projects || [
        {
            id: 1,
            title: 'Angry Birds 3D Web Game',
            description: 'Game 3D ketapel interaktif dengan simulasi fisika trajektori gravitasi (Rapier), peruntuhan struktur balok es/kayu/batu, dan WebGL Three.js.',
            tags: ['Three.js', 'React Three Fiber', 'Rapier Physics', 'Zustand'],
            github: 'https://github.com/acannnz/angry_bird',
            demo: 'https://burungngamuk.arcand.my.id/',
            image: '/images/angry_birds.webp'
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
                />

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
                {/* SCENE 1 & 2: ROBOTIC PILOT IDENTITY INITIALIZATION (Landing & Standing)   */}
                {/* Muncul perlahan secara robotik saat mecha mendarat & berdiri              */}
                {/* ========================================================================= */}
                {/* SCENE 1: ROBOTIC PILOT IDENTITY CONNECTED TO CHEST (Landing Frame 46 - 76)*/}
                {/* Terhubung garis laser dari dada robot ke Kiri (Nama) dan Kanan (Bio/Specs)*/}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isSummoned && !isIntroPlaying && currentPhase === 1 && (
                        <motion.div
                            key="phase-robotic-identity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 z-30 pointer-events-none"
                        >
                            {/* Laser Leader Lines SVG Overlay */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                                <defs>
                                    <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* 1. Head / Visor Anchor Node (Left Temple: 465, 175) */}
                                <circle cx="465" cy="175" r="4.5" fill="#22d3ee" filter="url(#cyan-glow)" />
                                <circle cx="465" cy="175" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Left 90-Degree Orthogonal Line: emerges from Head to Name Card */}
                                <motion.path
                                    d="M 465 175 H 370 V 440 H 300"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                />
                                <motion.circle
                                    cx="370"
                                    cy="440"
                                    r="2.5"
                                    fill="#22d3ee"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.3 }}
                                />
                                <motion.circle
                                    cx="300"
                                    cy="440"
                                    r="3.5"
                                    fill="#22d3ee"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.3 }}
                                />

                                {/* Right 90-Degree Orthogonal Line: emerges from Chest to Bio Card */}
                                <motion.path
                                    d="M 525 450 H 630 V 510 H 700"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                                />
                                <motion.circle
                                    cx="630"
                                    cy="510"
                                    r="2.5"
                                    fill="#22d3ee"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.3 }}
                                />
                                <motion.circle
                                    cx="700"
                                    cy="510"
                                    r="3.5"
                                    fill="#22d3ee"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.9, duration: 0.3 }}
                                />
                            </svg>

                            {/* Left Component: Nama & Role */}
                            <motion.div
                                initial={{ opacity: 0, x: 25, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                style={{
                                    transform: `translateY(${-p1Delta * 0.4}px)`
                                }}
                                className="hidden md:block absolute top-1/2 -translate-y-1/2 left-3 sm:left-6 lg:left-12 z-30 max-w-xs sm:max-w-sm w-full pointer-events-auto"
                            >
                                <div className="relative glass-card rounded-2xl p-5 sm:p-6 border border-cyan-500/30 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-4 overflow-hidden w-full">
                                    {/* Cybernetic Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                            <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase font-bold">
                                                PILOT // IDENTIFICATION
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                            NEURAL_LINK
                                        </span>
                                    </div>

                                    {/* Name & Role */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-mono text-zinc-400 tracking-wider block">
                                            // DESIGNATION RECOGNIZED:
                                        </span>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 tracking-tight uppercase font-mono min-h-[2.5rem] flex items-center">
                                            <span>{typedName || '\u00A0'}</span>
                                            {!nameComplete && (
                                                <span className="inline-block w-2.5 h-6 ml-1 bg-cyan-400 animate-pulse" />
                                            )}
                                        </h2>

                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: nameComplete ? 1 : 0.4, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                            <span>{profile?.role || 'Fullstack Developer'}</span>
                                        </motion.div>
                                    </div>

                                    <div className="text-[10px] font-mono text-cyan-400/70 border-t border-white/5 pt-2 flex items-center justify-between">
                                        <span>TETHER: KEPALA // VISOR LINK</span>
                                        <span className="text-emerald-400 font-bold">ONLINE</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Component: Bio & System Telemetry */}
                            <motion.div
                                initial={{ opacity: 0, x: -25, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                style={{
                                    transform: `translateY(${p1Delta * 0.4}px)`
                                }}
                                className="hidden md:block absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 lg:right-12 z-30 max-w-xs sm:max-w-sm w-full pointer-events-auto"
                            >
                                <div className="relative glass-card rounded-2xl p-5 sm:p-6 border border-cyan-500/30 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.18)] space-y-3.5 overflow-hidden w-full">
                                    {/* Cybernetic Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                            <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase font-bold">
                                                PILOT DOSSIER // TELEMETRY
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            SYNC 100%
                                        </span>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                                        {profile?.about || 'Software Engineer berpengalaman dalam merancang & membangun aplikasi web modern yang cepat, skalabel, serta berantarmuka intuitif.'}
                                    </p>

                                    {/* 3 Quick Modular Specs */}
                                    <div className="space-y-2 pt-1">
                                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                                            <span className="text-[10px] text-cyan-400/80 uppercase">LOCATION:</span>
                                            <span className="text-white font-bold">{profile?.location || 'Jembrana, Bali'}</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                                            <span className="text-[10px] text-cyan-400/80 uppercase">STACK:</span>
                                            <span className="text-cyan-300 font-bold">Laravel • React • Node</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                                            <span className="text-[10px] text-cyan-400/80 uppercase">STATUS:</span>
                                            <span className="text-emerald-400 font-bold">Available for Hire</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Center Bottom Guidance Hint */}
                            <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <div className="px-4 py-2 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-cyan-300 shadow-xl">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    <span>SCROLL DOWN TO UNLOCK TECHNICAL SKILLS ARSENAL</span>
                                    <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
                                </div>
                            </div>
                            {/* Mobile View: Single Compact Pilot Card at Bottom */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="md:hidden absolute bottom-16 inset-x-3 z-30 pointer-events-auto"
                            >
                                <div className="relative glass-card rounded-2xl p-4 border border-cyan-500/40 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-3 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
                                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />

                                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                            <span className="font-mono text-[9px] text-cyan-400 uppercase font-bold tracking-wider">
                                                PILOT IDENTIFICATION // NEURAL LINK
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            ONLINE
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[9px] font-mono text-zinc-400 block tracking-wider">// DESIGNATION:</span>
                                        <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 font-mono tracking-tight uppercase flex items-center">
                                            <span>{typedName || '\u00A0'}</span>
                                            {!nameComplete && (
                                                <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />
                                            )}
                                        </h2>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                                            <span>{profile?.role || 'Fullstack Developer'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9px] font-mono">
                                        <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/5 text-center truncate">
                                            <span className="text-zinc-400 block text-[8px]">LOC</span>
                                            <span className="text-white font-bold truncate block">{profile?.location || 'Bali'}</span>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/5 text-center truncate">
                                            <span className="text-zinc-400 block text-[8px]">STACK</span>
                                            <span className="text-cyan-300 font-bold truncate block">Laravel/React</span>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/5 text-center truncate">
                                            <span className="text-zinc-400 block text-[8px]">STATUS</span>
                                            <span className="text-emerald-400 font-bold truncate block">Available</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* SCENE 2: ROBOTIC SKILLS CONNECTED TO MECHA BODY (Standing Frame 77 - 156)  */}
                {/* 3 Skill di Kiri & 3 Skill di Kanan terhubung garis laser ke tubuh mecha   */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isSummoned && currentPhase === 2 && (
                        <motion.div
                            key="phase-robotic-skills"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 z-30 pointer-events-none"
                        >
                            {/* Laser Leader Lines from Mecha Body to 6 Skill Modules */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                                <defs>
                                    <filter id="cyan-glow-2" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* 6 Anchor Nodes on Mecha Body */}
                                {/* Left Shoulder (435, 260) */}
                                <circle cx="435" cy="260" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="435" cy="260" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Left Core / Chest (450, 440) */}
                                <circle cx="450" cy="440" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="450" cy="440" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Left Belt / Arm (435, 650) */}
                                <circle cx="435" cy="650" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="435" cy="650" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Right Shoulder (565, 260) */}
                                <circle cx="565" cy="260" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="565" cy="260" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Right Core / Chest (550, 440) */}
                                <circle cx="550" cy="440" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="550" cy="440" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* Right Belt / Arm (565, 650) */}
                                <circle cx="565" cy="650" r="4.5" fill="#22d3ee" filter="url(#cyan-glow-2)" />
                                <circle cx="565" cy="650" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                                {/* 3 Left 90-Degree Orthogonal Lines (Emerge from Mecha Body to Left Cards) */}
                                {/* Line L1: Shoulder (435, 260) -> H 360 -> V 316 -> H 307 */}
                                <motion.path
                                    d="M 435 260 H 360 V 316 H 307"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                />
                                <circle cx="360" cy="316" r="2.5" fill="#22d3ee" />
                                <circle cx="307" cy="316" r="3.5" fill="#22d3ee" />

                                {/* Line L2: Core (450, 440) -> H 370 -> V 500 -> H 299 */}
                                <motion.path
                                    d="M 450 440 H 370 V 500 H 299"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                                />
                                <circle cx="370" cy="500" r="2.5" fill="#22d3ee" />
                                <circle cx="299" cy="500" r="3.5" fill="#22d3ee" />

                                {/* Line L3: Waist (435, 650) -> H 360 -> V 684 -> H 297 */}
                                <motion.path
                                    d="M 435 650 H 360 V 684 H 297"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                />
                                <circle cx="360" cy="684" r="2.5" fill="#22d3ee" />
                                <circle cx="297" cy="684" r="3.5" fill="#22d3ee" />

                                {/* 3 Right 90-Degree Orthogonal Lines (Emerge from Mecha Body to Right Cards) */}
                                {/* Line R1: Shoulder (565, 260) -> H 640 -> V 316 -> H 693 */}
                                <motion.path
                                    d="M 565 260 H 640 V 316 H 693"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                                />
                                <circle cx="640" cy="316" r="2.5" fill="#22d3ee" />
                                <circle cx="693" cy="316" r="3.5" fill="#22d3ee" />

                                {/* Line R2: Core (550, 440) -> H 630 -> V 500 -> H 701 */}
                                <motion.path
                                    d="M 550 440 H 630 V 500 H 701"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                                />
                                <circle cx="630" cy="500" r="2.5" fill="#22d3ee" />
                                <circle cx="701" cy="500" r="3.5" fill="#22d3ee" />

                                {/* Line R3: Waist (565, 650) -> H 640 -> V 684 -> H 703 */}
                                <motion.path
                                    d="M 565 650 H 640 V 684 H 703"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="6 3"
                                    strokeDashoffset={lineDashOffset}
                                    fill="none"
                                    filter="url(#cyan-glow-2)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                />
                                <circle cx="640" cy="684" r="2.5" fill="#22d3ee" />
                                <circle cx="703" cy="684" r="3.5" fill="#22d3ee" />
                            </svg>

                            {/* Top Subsystem Status Header */}
                            <div className="absolute top-6 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <div className="px-4 py-1.5 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center gap-3 text-xs font-mono text-cyan-300 shadow-xl">
                                    <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                    <span>SUBSYSTEM ARSENAL: 6 MODULES SYNCHRONIZED WITH BODY</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                            </div>

                            {/* Left Column: 3 Skill Cards (Backend, Frontend, Database) */}
                            {/* Left Column: 3 Skill Cards (Desktop Only) */}
                            <div className="hidden md:flex absolute inset-y-0 left-3 sm:left-6 lg:left-12 z-30 flex-col justify-center gap-3 max-w-xs sm:max-w-sm w-full pointer-events-auto">
                                {skills.slice(0, 3).map((skill, idx) => {
                                    const meta = SKILL_METRICS[skill.name] || {
                                        serial: `MOD_0${idx + 1} // SYS`,
                                        efficiency: 90,
                                        status: 'ACTIVE',
                                        tags: [skill.category],
                                        icon: Layers
                                    };
                                    const IconComp = meta.icon || Layers;
                                    const yParallax = idx === 0 ? p2Center * -0.4 : idx === 1 ? p2Center * -0.1 : p2Center * 0.35;
                                    const scrollCharge = Math.min(1, Math.max(0.2, (currentFrame - 77) / 55));
                                    const filled = Math.min(8, Math.max(1, Math.round(((meta.efficiency / 100) * 8) * scrollCharge)));

                                    return (
                                        <motion.div
                                            key={skill.name}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                                            style={{
                                                transform: `translateY(${yParallax}px)`
                                            }}
                                            className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/85 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2 relative overflow-hidden group shadow-[0_0_25px_rgba(6,182,212,0.12)]"
                                        >
                                            {/* Corner Bracket */}
                                            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/80" />
                                            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/80" />

                                            <div className="flex items-center justify-between text-[8px] font-mono">
                                                <span className="text-cyan-400 uppercase font-bold tracking-wider">
                                                    {meta.serial}
                                                </span>
                                                <span className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-[8px] uppercase tracking-wider">
                                                    {meta.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                                                    <IconComp className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                                                        {skill.name}
                                                    </h4>
                                                    <span className="text-[9px] text-purple-400 font-mono block">
                                                        {skill.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {meta.tags.map((t, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-300/90 border border-cyan-500/20"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Status Indicator */}
                                            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-cyan-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span className="tracking-widest">SYSTEM READY</span>
                                                </div>
                                                <span className="text-zinc-500 font-bold">PRODUCTION</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                             </div>

                            {/* Right Column: 3 Skill Cards (Design, Architecture, DevOps) */}
                            {/* Right Column: 3 Skill Cards (Desktop Only) */}
                            <div className="hidden md:flex absolute inset-y-0 right-3 sm:right-6 lg:right-12 z-30 flex-col justify-center gap-3 max-w-xs sm:max-w-sm w-full pointer-events-auto">
                                {skills.slice(3, 6).map((skill, idx) => {
                                    const meta = SKILL_METRICS[skill.name] || {
                                        serial: `MOD_0${idx + 4} // SYS`,
                                        efficiency: 90,
                                        status: 'ACTIVE',
                                        tags: [skill.category],
                                        icon: Layers
                                    };
                                    const IconComp = meta.icon || Layers;
                                    const yParallax = idx === 0 ? p2Center * -0.4 : idx === 1 ? p2Center * -0.1 : p2Center * 0.35;
                                    const scrollCharge = Math.min(1, Math.max(0.2, (currentFrame - 77) / 55));
                                    const filled = Math.min(8, Math.max(1, Math.round(((meta.efficiency / 100) * 8) * scrollCharge)));

                                    return (
                                        <motion.div
                                            key={skill.name}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                                            style={{
                                                transform: `translateY(${yParallax}px)`
                                            }}
                                            className="p-3 sm:p-3.5 rounded-xl bg-zinc-950/85 border border-cyan-500/30 hover:border-cyan-400/60 transition-all space-y-2 relative overflow-hidden group shadow-[0_0_25px_rgba(6,182,212,0.12)]"
                                        >
                                            {/* Corner Bracket */}
                                            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/80" />
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/80" />

                                            <div className="flex items-center justify-between text-[8px] font-mono">
                                                <span className="text-cyan-400 uppercase font-bold tracking-wider">
                                                    {meta.serial}
                                                </span>
                                                <span className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-[8px] uppercase tracking-wider">
                                                    {meta.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                                                    <IconComp className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                                                        {skill.name}
                                                    </h4>
                                                    <span className="text-[9px] text-purple-400 font-mono block">
                                                        {skill.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {meta.tags.map((t, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-cyan-300/90 border border-cyan-500/20"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Status Indicator */}
                                            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-cyan-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span className="tracking-widest">SYSTEM READY</span>
                                                </div>
                                                <span className="text-zinc-500 font-bold">PRODUCTION</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Center Bottom Guidance Hint */}
                            <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <div className="px-4 py-2 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-cyan-300 shadow-xl">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    <span>SCROLL DOWN TO DEPLOY ARMOR MATRIX &amp; PROJECTS</span>
                                    <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
                                </div>
                            </div>
                            {/* Mobile View: Compact 2-Column Grid at Bottom */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="md:hidden absolute bottom-14 inset-x-2.5 z-30 pointer-events-auto space-y-1.5"
                            >
                                <div className="text-center">
                                    <span className="px-3 py-1 rounded-full bg-black/75 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 uppercase tracking-wider backdrop-blur-md">
                                        TECHNICAL ARSENAL • 6 MODULES
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {skills.map((skill, idx) => {
                                        const meta = SKILL_METRICS[skill.name] || {
                                            serial: `MOD_0${idx + 1}`,
                                            efficiency: 90,
                                            icon: Layers
                                        };
                                        const IconComp = meta.icon || Layers;
                                        return (
                                            <div
                                                key={skill.name}
                                                className="p-2 rounded-xl bg-zinc-950/90 border border-cyan-500/30 backdrop-blur-xl space-y-1 relative"
                                            >
                                                <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400">
                                                    <span>{meta.serial}</span>
                                                    <span className="text-cyan-300 font-bold text-[7px] uppercase tracking-wider">{meta.status}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <IconComp className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                                                    <h4 className="text-[10px] font-bold text-white truncate">{skill.name}</h4>
                                                </div>
                                                <div className="flex items-center gap-1 text-[7px] font-mono text-cyan-400/80 pt-0.5">
                                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span>PRODUCTION READY</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
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
                            className="absolute inset-0 z-30 pointer-events-none"
                        >
                            {/* Top Minimalist Hologram Badge (Positioned high so head is never covered) */}
                            <div className="absolute top-5 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/65 border border-pink-500/40 text-pink-300 font-mono text-xs uppercase tracking-widest backdrop-blur-md shadow-2xl">
                                    <Shield className="w-3.5 h-3.5 animate-pulse text-pink-400" />
                                    <span>STAGE 03 • ARMOR DETACHMENT // PROJECT MATRIX</span>
                                </div>
                            </div>

                            {/* Floating Shard Laser Tether Lines SVG */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden md:block" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                                <defs>
                                    <filter id="pink-glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M 370 340 H 295" stroke="#f472b6" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.7" filter="url(#pink-glow)" />
                                <circle cx="370" cy="340" r="3.5" fill="#f472b6" />
                                <circle cx="295" cy="340" r="3.5" fill="#f472b6" />

                                <path d="M 370 660 H 295" stroke="#f472b6" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.7" filter="url(#pink-glow)" />
                                <circle cx="370" cy="660" r="3.5" fill="#f472b6" />
                                <circle cx="295" cy="660" r="3.5" fill="#f472b6" />

                                <path d="M 630 340 H 705" stroke="#f472b6" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.7" filter="url(#pink-glow)" />
                                <circle cx="630" cy="340" r="3.5" fill="#f472b6" />
                                <circle cx="705" cy="340" r="3.5" fill="#f472b6" />

                                <path d="M 630 660 H 705" stroke="#f472b6" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.7" filter="url(#pink-glow)" />
                                <circle cx="630" cy="660" r="3.5" fill="#f472b6" />
                                <circle cx="705" cy="660" r="3.5" fill="#f472b6" />
                            </svg>

                            {/* Left Column: Floating Armor Shards #1 & #2 (Mecha in center is 100% clear) */}
                            {/* Left Column: Floating Armor Shards #1 & #2 (Desktop Only) */}
                            <div className="hidden md:flex absolute inset-y-0 left-3 sm:left-6 lg:left-12 z-30 flex-col justify-center gap-3.5 max-w-xs sm:max-w-sm w-full pointer-events-auto">
                                {projects.slice(0, 2).map((proj, idx) => (
                                    <motion.div
                                        key={proj.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                                        className="relative group glass-card rounded-2xl p-4 sm:p-5 border border-pink-500/30 bg-zinc-950/85 hover:border-pink-400/60 shadow-2xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300"
                                    >
                                        {/* Shard Corner Bracket */}
                                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-pink-400/80" />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-pink-400/80" />

                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                                                    <span className="font-mono text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                                                        ARMOR SHARD #{idx + 1}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[9px] text-zinc-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                                                    ACTIVE
                                                </span>
                                            </div>
                                            {proj.image && (
                                                <div className="relative h-20 w-full rounded-lg overflow-hidden border border-pink-500/20 mb-1">
                                                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                                                </div>
                                            )}
                                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                                                {proj.title}
                                            </h3>

                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                                {proj.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 space-y-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {proj.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-pink-300/90 border border-pink-500/20"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <a
                                                    href={proj.demo}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
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

                            {/* Right Column: Floating Armor Shard #3 & Project Matrix Telemetry */}
                            {/* Right Column: Floating Armor Shard #3 & Project Matrix Telemetry (Desktop Only) */}
                            <div className="hidden md:flex absolute inset-y-0 right-3 sm:right-6 lg:right-12 z-30 flex-col justify-center gap-3.5 max-w-xs sm:max-w-sm w-full pointer-events-auto">
                                {projects.slice(2, 3).map((proj) => (
                                    <motion.div
                                        key={proj.id}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="relative group glass-card rounded-2xl p-4 sm:p-5 border border-pink-500/30 bg-zinc-950/85 hover:border-pink-400/60 shadow-2xl backdrop-blur-2xl flex flex-col justify-between transition-all duration-300"
                                    >
                                        {/* Shard Corner Bracket */}
                                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400/80" />
                                        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400/80" />

                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                                                    <span className="font-mono text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                                                        ARMOR SHARD #3
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[9px] text-zinc-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                                                    ACTIVE
                                                </span>
                                            </div>

                                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                                                {proj.title}
                                            </h3>

                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                                {proj.description}
                                            </p>
                                        </div>

                                        <div className="pt-3 space-y-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {proj.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-pink-300/90 border border-pink-500/20"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <a
                                                    href={proj.demo}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
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

                                {/* Additional Shard Matrix Telemetry Panel */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="relative glass-card rounded-2xl p-4 sm:p-5 border border-pink-500/25 bg-zinc-950/80 backdrop-blur-2xl space-y-2.5 shadow-xl"
                                >
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <span className="font-mono text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                                            REPOSITORY TELEMETRY
                                        </span>
                                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            ALL REPOS DEPLOYED
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                                        Pecahan armor mecha membawa modul arsitektur fullstack, real-time sync audio, dan SSO hub.
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-400 border-t border-white/5">
                                        <span>STATUS: PRODUCTION</span>
                                        <span className="text-pink-400 font-bold">100% SYNCHRONIZED</span>
                                    </div>
                                </motion.div>
                            </div>
                            {/* Mobile View: Swipeable Horizontal Shard Deck */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="md:hidden absolute bottom-14 inset-x-0 z-30 pointer-events-auto space-y-2"
                            >
                                <div className="text-center">
                                    <span className="px-3 py-1 rounded-full bg-black/75 border border-pink-500/30 text-[9px] font-mono text-pink-300 uppercase tracking-wider backdrop-blur-md">
                                        ARMOR SHARDS • SWIPE HORIZONTALLY ➔
                                    </span>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-4 pb-2 no-scrollbar">
                                    {projects.map((proj, idx) => (
                                        <div
                                            key={proj.id}
                                            className="snap-center shrink-0 w-[270px] p-3.5 rounded-2xl bg-zinc-950/90 border border-pink-500/40 backdrop-blur-xl shadow-2xl space-y-2 flex flex-col justify-between"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                                                    <span className="font-mono text-[9px] text-pink-300 font-bold uppercase">
                                                        ARMOR SHARD #{idx + 1}
                                                    </span>
                                                    <span className="text-[8px] font-mono text-zinc-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                                <h4 className="text-xs font-bold text-white truncate">{proj.title}</h4>
                                                <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{proj.description}</p>
                                            </div>
                                            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                                <a href={proj.demo} className="text-[10px] font-semibold text-pink-400 flex items-center gap-1">
                                                    <span>Buka Modul</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <a href={proj.github} className="text-zinc-500 hover:text-white">
                                                    <GitBranch className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Bottom Guidance */}
                            <div className="absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-none">
                                <a
                                    href="#experience"
                                    className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-pink-500/50 transition-all backdrop-blur-md shadow-xl"
                                >
                                    <span>Lanjut ke Experience &amp; Kontak di Bawah</span>
                                    <ChevronDown className="w-4 h-4 text-pink-400 animate-bounce" />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
