import React, { useCallback, useEffect, useRef, useState } from 'react';
import { idleLoopUrl } from './constants';

// Clips open on the exact rest frame and play an intro up to LOOP_START_S once; after that they loop from
// there, as each clip's tail is crossfaded into that moment (see idle-loops/README.md)
const LOOP_START_S = 1.5;
const FADE_IN_MS = 500;
export const IDLE_FADE_OUT_MS = 350;

// While the scene rests on `frame`, fades its looping clip in over the canvas so the city keeps moving
// (flying cars, neon). `frame` is null while the scene travels, which fades the clip back out.
// `rests` lists every rest frame, so the clips either side of the current one can be fetched ahead.
export default function IdleLoop({ frame, rests }) {
    const videoRef = useRef(null);
    const [visible, setVisible] = useState(false);
    // Clips are fetched whole into blob URLs: seeking back to LOOP_START_S then works on any host (even one
    // without HTTP range support) and the loop never stalls on the network. rest frame -> Promise<blob URL>
    const clipsRef = useRef(new Map());

    const loadClip = useCallback((rest) => {
        const clips = clipsRef.current;
        if (!clips.has(rest)) {
            const clip = fetch(idleLoopUrl(rest))
                .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(res.statusText))))
                .then((blob) => URL.createObjectURL(blob));
            // A failed fetch may be retried the next time the scene rests there
            clip.catch(() => clips.delete(rest));
            clips.set(rest, clip);
        }
        return clips.get(rest);
    }, []);

    useEffect(() => {
        const clips = clipsRef.current;
        return () => {
            clips.forEach((clip) => clip.then(URL.revokeObjectURL, () => {}));
            clips.clear();
        };
    }, []);

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

        // Only shown once it's actually playing, so a slow or missing clip leaves the still frame in place
        let cancelled = false;
        const show = () => setVisible(true);
        video.pause();
        loadClip(frame)
            .then((url) => {
                if (cancelled) return;
                video.addEventListener('playing', show, { once: true });
                if (video.src !== url) video.src = url;
                video.currentTime = 0;
                video.muted = true;
                video.play().catch(() => {});

                // Fetch the neighbouring rests' clips, so the next stop in either direction is ready
                const idx = rests.indexOf(frame);
                [rests[idx - 1], rests[idx + 1]].forEach((rest) => rest !== undefined && loadClip(rest).catch(() => {}));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
            video.removeEventListener('playing', show);
        };
    }, [frame, rests, loadClip]);

    return (
        <video
            ref={videoRef}
            aria-hidden="true"
            muted
            playsInline
            disablePictureInPicture
            preload="none"
            style={{ transitionDuration: `${visible ? FADE_IN_MS : IDLE_FADE_OUT_MS}ms` }}
            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity ease-in-out ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        />
    );
}
