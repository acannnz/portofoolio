import React, { useEffect, useRef, useState } from 'react';
import { idleLoopUrl } from './constants';

// Clips open on the exact rest frame and play an intro up to LOOP_START_S once; after that they loop from
// there, as each clip's tail is crossfaded into that moment (see idle-loops/README.md)
const LOOP_START_S = 1.5;
// The clip's first frame matches the still rest frame, so it can fade in quickly
const FADE_IN_MS = 300;
export const IDLE_FADE_OUT_MS = 350;

// Clips are fetched whole into blob URLs: seeking back to LOOP_START_S then works on any host (even one
// without HTTP range support) and replays never touch the network. Kept for the whole visit, so coming back
// to the page reuses them. rest frame -> { promise, url (once loaded) }
const clips = new Map();

/**
 * Idle clips are a nice-to-have of ~2 MB each: skipped when the visitor asked to save data or is on a slow
 * connection, where the still rest frame stays on screen instead.
 */
export function idleClipsAllowed() {
    const connection = navigator.connection;
    return !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
}

/** Starts downloading the idle clip for `rest` (once). `priority` is a fetch priority hint. */
export function preloadIdleClip(rest, priority = 'low') {
    if (!clips.has(rest)) {
        const entry = { url: null };
        entry.promise = fetch(idleLoopUrl(rest), { priority })
            .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(res.statusText))))
            .then((blob) => {
                entry.url = URL.createObjectURL(blob);
                return entry.url;
            })
            // A failed download may be retried the next time the scene rests there
            .catch(() => clips.delete(rest));
        clips.set(rest, entry);
    }
    return clips.get(rest).promise;
}

// While the scene rests on `frame`, fades its looping clip in over the canvas so the city keeps moving
// (flying cars, neon). `frame` is null while the scene travels, which fades the clip back out.
// `rests` lists every rest frame, so the clips either side of the current one can be fetched ahead.
export default function IdleLoop({ frame, rests }) {
    const videoRef = useRef(null);
    const [visible, setVisible] = useState(false);

    // Loops back to LOOP_START_S just before the end, so the wrap lands on the matching frame without a stall
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        const wrap = () => {
            video.currentTime = LOOP_START_S;
            video.play().catch(() => {});
        };
        let handle;
        const onFrame = (_, { mediaTime }) => {
            if (video.duration && mediaTime >= video.duration - 0.1) video.currentTime = LOOP_START_S;
            handle = video.requestVideoFrameCallback(onFrame);
        };
        if ('requestVideoFrameCallback' in video) handle = video.requestVideoFrameCallback(onFrame);
        // Browsers without frame callbacks wrap once the clip ends
        video.addEventListener('ended', wrap);
        return () => {
            if (handle !== undefined) video.cancelVideoFrameCallback(handle);
            video.removeEventListener('ended', wrap);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        if (frame === null) {
            setVisible(false);
            const timer = setTimeout(() => video.pause(), IDLE_FADE_OUT_MS);
            return () => clearTimeout(timer);
        }

        // Waits for the single download (usually already done: clips are fetched ahead), so nothing is ever
        // downloaded twice. Only shown once it's actually playing, so the still frame covers any wait.
        let cancelled = false;
        const show = () => setVisible(true);
        video.pause();
        preloadIdleClip(frame, 'high').then((src) => {
            if (cancelled || typeof src !== 'string') return;
            video.addEventListener('playing', show, { once: true });
            if (video.src !== src) video.src = src;
            video.currentTime = 0;
            video.muted = true;
            video.play().catch(() => {});
        });

        // Fetch the neighbouring rests' clips, so the next stop in either direction is ready
        const idx = rests.indexOf(frame);
        [rests[idx - 1], rests[idx + 1]].forEach((rest) => rest !== undefined && preloadIdleClip(rest));

        return () => {
            cancelled = true;
            video.removeEventListener('playing', show);
        };
    }, [frame, rests]);

    return (
        <video
            ref={videoRef}
            aria-hidden="true"
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            style={{ transitionDuration: `${visible ? FADE_IN_MS : IDLE_FADE_OUT_MS}ms` }}
            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity ease-in-out ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        />
    );
}
