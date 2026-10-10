import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Cpu, Sparkles } from 'lucide-react';
import useTypewriter from '../hooks/useTypewriter';
import IdentityPhase from './Scrolly/IdentityPhase';
import ProjectsPhase from './Scrolly/ProjectsPhase';
import SkillsPhase from './Scrolly/SkillsPhase';
import {
    FRAME_INTRO_END,
    PHASE,
    TOTAL_FRAMES,
    clamp,
    coverTransform,
    getPhase,
} from './Scrolly/constants';

const frameUrl = (index) => `/frames/frame_${String(index).padStart(3, '0')}.webp`;

// Lerp factor towards the scroll-driven target frame (higher = snappier)
const FRAME_LERP = 0.45;
const INTRO_DURATION_MS = 1500;
// Frames after the intro start downloading at the latest this long after page load
const REST_PRELOAD_DELAY_MS = 3000;

export default function ScrollyExperience({ profile }) {
    const reduceMotion = useReducedMotion();

    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Image sequence. `lastDrawnRef` avoids repainting the canvas when the frame did not change.
    const imagesRef = useRef([]);
    const lastDrawnRef = useRef(0);
    const restStartedRef = useRef(false);

    // Animation state lives in refs so the rAF loop never re-subscribes
    const displayFrameRef = useRef(1);
    const targetFrameRef = useRef(1);
    const isIntroPlayingRef = useRef(false);
    const rafIdRef = useRef(null);
    const introRafIdRef = useRef(null);

    const [introLoaded, setIntroLoaded] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummoned, setIsSummoned] = useState(false);
    const [isIntroPlaying, setIsIntroPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(1);
    // Needed so HUD overlays can map image coordinates through the same cover crop as the canvas
    const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

    const phase = getPhase(currentFrame, isSummoned);
    const loadingProgress = Math.round((introLoaded / FRAME_INTRO_END) * 100);
    // Laser pulse flows with scroll
    const lineDashOffset = -currentFrame * 7;

    const { text: typedName, done: nameComplete } = useTypewriter(profile.name, isSummoned && !isIntroPlaying);

    // ---- Canvas rendering (object-fit: cover, DPR aware) ----
    const renderFrame = useCallback((img) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !img) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
        }

        const { drawW, drawH, offX, offY } = coverTransform(width, height);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, offX, offY, drawW, drawH);
        ctx.restore();
    }, []);

    // ---- Frame preloading: intro frames first, the rest in the background ----
    const loadFrame = useCallback((index, onSettled) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => onSettled?.();
        img.src = frameUrl(index);
        imagesRef.current[index - 1] = img;
    }, []);

    const startRestLoading = useCallback(() => {
        if (restStartedRef.current) return;
        restStartedRef.current = true;
        for (let i = FRAME_INTRO_END + 1; i <= TOTAL_FRAMES; i++) loadFrame(i);
    }, [loadFrame]);

    useEffect(() => {
        let settled = 0;
        let unmounted = false;
        for (let i = 1; i <= FRAME_INTRO_END; i++) {
            loadFrame(i, () => {
                settled += 1;
                if (!unmounted) setIntroLoaded(settled);
            });
        }
        const timer = setTimeout(startRestLoading, REST_PRELOAD_DELAY_MS);
        return () => {
            unmounted = true;
            clearTimeout(timer);
        };
    }, [loadFrame, startRestLoading]);

    // ---- Render loop: lerp towards the target frame, repaint only on change ----
    useEffect(() => {
        const isReady = (img) => img && img.complete && img.naturalWidth > 0;

        const loop = () => {
            if (!isIntroPlayingRef.current) {
                const diff = targetFrameRef.current - displayFrameRef.current;
                displayFrameRef.current = Math.abs(diff) > 0.01
                    ? displayFrameRef.current + diff * FRAME_LERP
                    : targetFrameRef.current;
            }

            const frameIndex = clamp(Math.round(displayFrameRef.current), 1, TOTAL_FRAMES);
            const img = imagesRef.current[frameIndex - 1];
            if (isReady(img) && lastDrawnRef.current !== frameIndex) {
                renderFrame(img);
                lastDrawnRef.current = frameIndex;
            }
            // Frame not downloaded yet: keep showing the last painted one
            setCurrentFrame(frameIndex);

            rafIdRef.current = requestAnimationFrame(loop);
        };
        rafIdRef.current = requestAnimationFrame(loop);

        // Resizing clears the canvas, so repaint the last drawn frame
        const handleResize = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight });
            const img = imagesRef.current[lastDrawnRef.current - 1];
            if (isReady(img)) renderFrame(img);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(rafIdRef.current);
            cancelAnimationFrame(introRafIdRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [renderFrame]);

    // ---- Scroll -> target frame (frames INTRO_END..TOTAL_FRAMES) ----
    const syncTargetToScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const scrollable = container.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return;

        const progress = clamp(-container.getBoundingClientRect().top / scrollable, 0, 1);
        targetFrameRef.current = FRAME_INTRO_END + progress * (TOTAL_FRAMES - FRAME_INTRO_END);
    }, []);

    useEffect(() => {
        if (!isSummoned) return undefined;

        const handleScroll = () => {
            if (!isIntroPlayingRef.current) syncTargetToScroll();
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isSummoned, syncTargetToScroll]);

    // Scrolls the page so the scene lands on `frame` (inverse of syncTargetToScroll)
    const seekToFrame = useCallback(
        (frame) => {
            const container = containerRef.current;
            if (!container) return;
            const scrollable = container.scrollHeight - window.innerHeight;
            const progress = (frame - FRAME_INTRO_END) / (TOTAL_FRAMES - FRAME_INTRO_END);
            const top = container.getBoundingClientRect().top + window.scrollY + progress * scrollable;
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        },
        [reduceMotion],
    );

    // ---- Summon: wait for the intro frames, then auto-play 1 -> INTRO_END ----
    const startIntroDescent = useCallback(() => {
        cancelAnimationFrame(introRafIdRef.current);
        setIsIntroPlaying(true);
        isIntroPlayingRef.current = true;
        displayFrameRef.current = 1;
        targetFrameRef.current = FRAME_INTRO_END;

        const duration = reduceMotion ? 0 : INTRO_DURATION_MS;
        const startTime = performance.now();

        const animateIntro = (now) => {
            const t = duration === 0 ? 1 : Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out: dramatic landing
            displayFrameRef.current = 1 + eased * (FRAME_INTRO_END - 1);

            if (t < 1) {
                introRafIdRef.current = requestAnimationFrame(animateIntro);
                return;
            }
            displayFrameRef.current = FRAME_INTRO_END;
            isIntroPlayingRef.current = false;
            setIsIntroPlaying(false);
            syncTargetToScroll();
        };
        introRafIdRef.current = requestAnimationFrame(animateIntro);
    }, [reduceMotion, syncTargetToScroll]);

    const handleStartSummon = () => {
        if (isLoading || isSummoned) return;
        window.scrollTo({ top: 0, behavior: 'instant' });
        startRestLoading();
        setIsLoading(true);
    };

    useEffect(() => {
        if (!isLoading || introLoaded < FRAME_INTRO_END) return undefined;

        const timer = setTimeout(() => {
            setIsLoading(false);
            setIsSummoned(true);
            startIntroDescent();
        }, 200);
        return () => clearTimeout(timer);
    }, [isLoading, introLoaded, startIntroDescent]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full bg-[#030307] text-white select-none ${
                isSummoned ? 'h-[600vh]' : 'h-screen overflow-hidden'
            }`}
        >
            {/* Sticky fullscreen viewport (canvas + HUD overlays) */}
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-20">
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
                        isSummoned ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                />

                {/* Scene 0: Summon button / loading */}
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
                                    type="button"
                                    onClick={handleStartSummon}
                                    className="px-10 py-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-lg tracking-widest uppercase border border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
                                >
                                    <Sparkles className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                                    <span>SUMMON MECHA</span>
                                    <ArrowRight className="w-5 h-5 text-purple-400" aria-hidden="true" />
                                </button>
                            ) : (
                                <div
                                    role="status"
                                    className="flex flex-col items-center gap-4 bg-zinc-950/90 p-8 rounded-2xl border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] min-w-[320px]"
                                >
                                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                                        <Cpu className="w-4 h-4 animate-spin text-cyan-400" aria-hidden="true" />
                                        <span>SUMMONING PROTOCOL...</span>
                                    </div>

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

                {/* Scene 1: landing -> pilot identity */}
                <AnimatePresence>
                    {phase === PHASE.IDENTITY && !isIntroPlaying && (
                        <IdentityPhase
                            key="identity"
                            profile={profile}
                            typedName={typedName}
                            nameComplete={nameComplete}
                            frame={currentFrame}
                            viewport={viewport}
                            dashOffset={lineDashOffset}
                        />
                    )}
                </AnimatePresence>

                {/* Scene 2: standing -> skills */}
                <AnimatePresence>
                    {phase === PHASE.SKILLS && (
                        <SkillsPhase
                            key="skills"
                            skills={profile.skills}
                            frame={currentFrame}
                            viewport={viewport}
                            dashOffset={lineDashOffset}
                        />
                    )}
                </AnimatePresence>

                {/* Scene 3: armor detachment -> projects */}
                <AnimatePresence>
                    {phase === PHASE.PROJECTS && (
                        <ProjectsPhase
                            key="projects"
                            projects={profile.projects}
                            frame={currentFrame}
                            onSeekFrame={seekToFrame}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
