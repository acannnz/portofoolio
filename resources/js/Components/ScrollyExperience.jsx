import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import useTypewriter from '../hooks/useTypewriter';
import IdentityPhase from './Scrolly/IdentityPhase';
import IdleLoop, { IDLE_FADE_OUT_MS, preloadIdleClip } from './Scrolly/IdleLoop';
import ProjectsPhase from './Scrolly/ProjectsPhase';
import SkillsPhase from './Scrolly/SkillsPhase';
import SummonScreen from './Scrolly/SummonScreen';
import {
    FRAME_INTRO_END,
    PHASE,
    TOTAL_FRAMES,
    clamp,
    coverTransform,
    getPhase,
    restFrames,
} from './Scrolly/constants';

const frameUrl = (index) => `/frames/frame_${String(index).padStart(3, '0')}.webp`;

// Scrolling doesn't scrub frame by frame: each scroll gesture plays the footage on to the next rest frame.
// Cruise speed is the footage's natural pace; long jumps speed up so no trip takes longer than MAX_TRAVEL_S.
const PLAYBACK_FPS = 30;
const MAX_TRAVEL_S = 2.5;
// Ramp up / ease into the rest frame, in frames per second²
const PLAYBACK_ACCEL = 90;
const PLAYBACK_DECEL = 45;
// Scroll events further apart than this (or reversing direction) start a new gesture
const GESTURE_GAP_MS = 180;
// Once the scene rests and scrolling has stopped this long, the page scroll is realigned to the scene
const REALIGN_IDLE_MS = 250;
// The idle loop takes over once the scene has rested on a rest frame this long (its first frame matches
// the still, so this only skips momentary stops)
const IDLE_DELAY_MS = 100;
const INTRO_DURATION_MS = 1500;
// Frames after the intro start downloading at the latest this long after page load
const REST_PRELOAD_DELAY_MS = 3000;
// Decoded bitmaps are kept only around the playhead (each 1280x720 frame is ~3.7 MB decoded):
// decode this many frames ahead / behind in the direction of travel, release beyond KEEP.
const DECODE_AHEAD = 20;
const DECODE_BEHIND = 6;
const DECODE_KEEP = 24;
// Crossfade between neighbouring frames is quantized so an idle scene stops repainting
const BLEND_STEPS = 32;

const nextRest = (rests, frame) => rests.find((rest) => rest > frame + 0.5) ?? rests[rests.length - 1];
const prevRest = (rests, frame) => rests.findLast((rest) => rest < frame - 0.5) ?? rests[0];

export default function ScrollyExperience({ profile }) {
    const reduceMotion = useReducedMotion();
    const reduceMotionRef = useRef(reduceMotion);
    reduceMotionRef.current = reduceMotion;
    const rests = useMemo(() => restFrames(profile.projects.length), [profile.projects.length]);
    const restsRef = useRef(rests);
    restsRef.current = rests;

    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    const ctxRef = useRef(null);

    // Image sequence: compressed blobs for every frame, decoded ImageBitmaps only near the playhead.
    // Bitmaps are decoded off the main thread, so drawing a new frame never stalls on image decoding.
    const blobsRef = useRef([]);
    const bitmapsRef = useRef(new Map());
    const decodingRef = useRef(new Set());
    // `drawnRef` avoids repainting the canvas when the frame and blend did not change
    const drawnRef = useRef(null);
    const restStartedRef = useRef(false);

    // Animation state lives in refs so the rAF loop never re-subscribes
    const displayFrameRef = useRef(1);
    const targetFrameRef = useRef(1);
    const isIntroPlayingRef = useRef(false);
    // Scroll gesture tracking: the scroll position (as a frame) last seen, when, and which way
    const lastScrollFrameRef = useRef(FRAME_INTRO_END);
    const lastScrollTimeRef = useRef(0);
    const gestureDirRef = useRef(0);
    const scrollAlignedRef = useRef(true);
    const idleFrameRef = useRef(null);
    const rafIdRef = useRef(null);
    const introRafIdRef = useRef(null);

    const [introLoaded, setIntroLoaded] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummoned, setIsSummoned] = useState(false);
    const [isIntroPlaying, setIsIntroPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(1);
    // Rest frame whose idle loop is showing, or null while the scene travels
    const [idleFrame, setIdleFrame] = useState(null);
    // Needed so HUD overlays can map image coordinates through the same cover crop as the canvas
    const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

    const phase = getPhase(currentFrame, isSummoned);
    const loadingProgress = Math.round((introLoaded / FRAME_INTRO_END) * 100);
    // Laser pulse flows with scroll
    const lineDashOffset = -currentFrame * 7;

    const { text: typedName, done: nameComplete } = useTypewriter(profile.name, isSummoned && !isIntroPlaying);

    // ---- Canvas rendering (object-fit: cover, DPR aware) ----
    // `top` is the next frame crossfaded over `bottom` at `alpha`, giving sub-frame motion between images.
    const renderFrame = useCallback((bottom, top, alpha) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Frames always cover the whole canvas, so an opaque context skips clearing and alpha compositing
        ctxRef.current ??= canvas.getContext('2d', { alpha: false });
        const ctx = ctxRef.current;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
        }

        const { drawW, drawH, offX, offY } = coverTransform(width, height);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalAlpha = 1;
        ctx.drawImage(bottom, offX, offY, drawW, drawH);
        if (top) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(top, offX, offY, drawW, drawH);
        }
    }, []);

    // ---- Frame preloading: intro frames first, the rest in the background ----
    const loadFrame = useCallback(async (index, onSettled) => {
        try {
            const res = await fetch(frameUrl(index));
            if (res.ok) blobsRef.current[index - 1] = await res.blob();
        } catch {
            // Missing frame: the renderer falls back to the nearest decoded one
        }
        onSettled?.();
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
        // The landing's idle clip is queued right behind the intro frames, ahead of the rest of the sequence
        preloadIdleClip(FRAME_INTRO_END, 'high');
        const timer = setTimeout(startRestLoading, REST_PRELOAD_DELAY_MS);
        return () => {
            unmounted = true;
            clearTimeout(timer);
        };
    }, [loadFrame, startRestLoading]);

    // ---- Scroll position <-> frame (the scrollable range covers frames INTRO_END..TOTAL_FRAMES) ----
    const scrollFrame = useCallback(() => {
        const container = containerRef.current;
        if (!container) return null;
        const scrollable = container.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return null;

        const progress = clamp(-container.getBoundingClientRect().top / scrollable, 0, 1);
        return FRAME_INTRO_END + progress * (TOTAL_FRAMES - FRAME_INTRO_END);
    }, []);

    // Jumps the page to where `frame` sits, without the scroll handler reading it as a new gesture
    const alignScrollTo = useCallback((frame) => {
        const container = containerRef.current;
        if (!container) return;
        const scrollable = container.scrollHeight - window.innerHeight;
        const progress = (frame - FRAME_INTRO_END) / (TOTAL_FRAMES - FRAME_INTRO_END);
        lastScrollFrameRef.current = frame;
        scrollAlignedRef.current = true;
        window.scrollTo({
            top: container.getBoundingClientRect().top + window.scrollY + progress * scrollable,
            behavior: 'instant',
        });
    }, []);

    // ---- Render loop: play towards the target frame, crossfade neighbours, repaint only on change ----
    useEffect(() => {
        const bitmaps = bitmapsRef.current;
        const decoding = decodingRef.current;
        let unmounted = false;
        let direction = 1;
        let velocity = 0; // frames per second
        let restingSince = null;
        // The scene holds still until this time while the idle loop dissolves back into the still frame
        let holdUntil = 0;
        let lastTime = performance.now();

        // Keeps decoded bitmaps in a window around the playhead, biased towards the direction of travel
        const syncDecodeWindow = (pos) => {
            const playhead = Math.round(pos);
            const keepLo = playhead - DECODE_KEEP;
            const keepHi = playhead + DECODE_KEEP;
            for (const [frame, bitmap] of bitmaps) {
                if (frame < keepLo || frame > keepHi) {
                    bitmap.close();
                    bitmaps.delete(frame);
                }
            }

            const lo = clamp(playhead - (direction > 0 ? DECODE_BEHIND : DECODE_AHEAD), 1, TOTAL_FRAMES);
            const hi = clamp(playhead + (direction > 0 ? DECODE_AHEAD : DECODE_BEHIND), 1, TOTAL_FRAMES);
            for (let frame = lo; frame <= hi; frame++) {
                const blob = blobsRef.current[frame - 1];
                if (!blob || bitmaps.has(frame) || decoding.has(frame)) continue;
                decoding.add(frame);
                createImageBitmap(blob)
                    .then((bitmap) => {
                        // The playhead may have moved on while this frame was decoding
                        const now = Math.round(displayFrameRef.current);
                        if (unmounted || Math.abs(frame - now) > DECODE_KEEP) bitmap.close();
                        else bitmaps.set(frame, bitmap);
                    })
                    .catch(() => {})
                    .finally(() => decoding.delete(frame));
            }
        };

        const nearestBitmap = (frame) => {
            for (let d = 1; d <= DECODE_KEEP; d++) {
                const bitmap = bitmaps.get(frame - d) ?? bitmaps.get(frame + d);
                if (bitmap) return bitmap;
            }
            return null;
        };

        const loop = (now) => {
            // Clamp the step so returning to a background tab doesn't teleport the scene
            const dt = Math.min(now - lastTime, 100);
            lastTime = now;

            // Resting on a rest frame for a moment hands the scene over to that frame's idle loop. Leaving it
            // first dissolves the clip back into the still rest frame, so it never blends into a moving scene.
            const restFrame = !isIntroPlayingRef.current && !reduceMotionRef.current && velocity === 0
                && targetFrameRef.current === displayFrameRef.current
                && restsRef.current.includes(displayFrameRef.current) ? displayFrameRef.current : null;
            restingSince = restFrame === null ? null : restingSince ?? now;
            const idle = restingSince !== null && now - restingSince > IDLE_DELAY_MS ? restFrame : null;
            if (idle !== idleFrameRef.current) {
                if (idle === null) holdUntil = now + IDLE_FADE_OUT_MS;
                idleFrameRef.current = idle;
                setIdleFrame(idle);
            }

            if (!isIntroPlayingRef.current && now >= holdUntil) {
                const target = targetFrameRef.current;
                const diff = target - displayFrameRef.current;
                const dist = Math.abs(diff);
                if (reduceMotionRef.current || (dist < 0.02 && Math.abs(velocity) < 2)) {
                    displayFrameRef.current = target;
                    velocity = 0;
                } else {
                    // Play at (at least) the footage's own pace, braking so it settles on the rest frame
                    const cruise = Math.max(PLAYBACK_FPS, dist / MAX_TRAVEL_S);
                    const desired = Math.sign(diff) * Math.min(cruise, Math.sqrt(2 * PLAYBACK_DECEL * dist));
                    const maxChange = (PLAYBACK_ACCEL * dt) / 1000;
                    velocity += clamp(desired - velocity, -maxChange, maxChange);
                    displayFrameRef.current += (velocity * dt) / 1000;
                    if (Math.sign(target - displayFrameRef.current) !== Math.sign(diff)) {
                        displayFrameRef.current = target;
                        velocity = 0;
                    }
                }

                // At rest after scrolling stopped: bring the page scroll back in line with the scene, so the
                // next gesture starts from where the viewer actually is. Skipped at the very top / bottom.
                if (velocity === 0 && !scrollAlignedRef.current && now - lastScrollTimeRef.current > REALIGN_IDLE_MS) {
                    scrollAlignedRef.current = true;
                    const at = scrollFrame();
                    if (at !== null && at > FRAME_INTRO_END && at < TOTAL_FRAMES && Math.abs(at - target) > 0.5) {
                        alignScrollTo(target);
                    }
                }
            }

            const pos = clamp(displayFrameRef.current, 1, TOTAL_FRAMES);
            const travel = targetFrameRef.current - pos;
            if (Math.abs(travel) > 0.5) direction = Math.sign(travel);
            syncDecodeWindow(pos);

            const base = Math.floor(pos);
            const blend = Math.round((pos - base) * BLEND_STEPS) / BLEND_STEPS;
            const from = bitmaps.get(base);
            const to = blend > 0 ? bitmaps.get(base + 1) : undefined;
            // Frame not decoded yet: show the closest one we have rather than stalling
            const [bottom, top, alpha] = from && to
                ? [from, to, blend]
                : [from ?? to ?? nearestBitmap(Math.round(pos)), null, 0];

            const drawn = drawnRef.current;
            if (bottom && (!drawn || drawn.bottom !== bottom || drawn.top !== top || drawn.alpha !== alpha)) {
                renderFrame(bottom, top, alpha);
                drawnRef.current = { bottom, top, alpha };
            }
            setCurrentFrame(Math.round(pos));

            rafIdRef.current = requestAnimationFrame(loop);
        };
        rafIdRef.current = requestAnimationFrame(loop);

        // Resizing changes the canvas size, so force a repaint on the next tick
        const handleResize = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight });
            drawnRef.current = null;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            unmounted = true;
            cancelAnimationFrame(rafIdRef.current);
            cancelAnimationFrame(introRafIdRef.current);
            window.removeEventListener('resize', handleResize);
            bitmaps.forEach((bitmap) => bitmap.close());
            bitmaps.clear();
            drawnRef.current = null;
        };
    }, [renderFrame, scrollFrame, alignScrollTo]);

    // ---- Scroll gestures -> target rest frame ----
    useEffect(() => {
        if (!isSummoned) return undefined;

        const handleScroll = () => {
            if (isIntroPlayingRef.current) return;
            const at = scrollFrame();
            if (at === null) return;
            // Tiny moves (sub-pixel realignment noise, a trackpad's first pixels) accumulate until they count
            const delta = at - lastScrollFrameRef.current;
            if (Math.abs(delta) < 0.1) return;
            lastScrollFrameRef.current = at;
            scrollAlignedRef.current = false;

            if (reduceMotionRef.current) {
                targetFrameRef.current = at;
                return;
            }

            const now = performance.now();
            const dir = Math.sign(delta);
            if (now - lastScrollTimeRef.current > GESTURE_GAP_MS || dir !== gestureDirRef.current) {
                // A new gesture plays on to the next rest frame. While the scene is still travelling that way,
                // it queues one more stop after the current target instead.
                const display = displayFrameRef.current;
                const target = targetFrameRef.current;
                const from = Math.sign(target - display) === dir ? target : display;
                targetFrameRef.current = dir > 0 ? nextRest(rests, from) : prevRest(rests, from);
            }
            // A long fling carries the scene at least as far as the page itself scrolled
            targetFrameRef.current = dir > 0
                ? Math.max(targetFrameRef.current, nextRest(rests, at - 1))
                : Math.min(targetFrameRef.current, prevRest(rests, at + 1));
            lastScrollTimeRef.current = now;
            gestureDirRef.current = dir;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isSummoned, scrollFrame, rests]);

    // Plays the scene to `frame` and moves the page along with it
    const seekToFrame = useCallback(
        (frame) => {
            targetFrameRef.current = frame;
            alignScrollTo(frame);
        },
        [alignScrollTo],
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
            lastScrollFrameRef.current = scrollFrame() ?? FRAME_INTRO_END;
        };
        introRafIdRef.current = requestAnimationFrame(animateIntro);
    }, [reduceMotion, scrollFrame]);

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

                {/* Looping clip of the resting scene keeps the city moving between scrolls */}
                <IdleLoop frame={idleFrame} rests={rests} />

                {/* Scene 0: Summon button / loading */}
                <AnimatePresence>
                    {!isSummoned && (
                        <SummonScreen
                            key="summon-screen"
                            profile={profile}
                            isLoading={isLoading}
                            loadingProgress={loadingProgress}
                            onSummon={handleStartSummon}
                        />
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
