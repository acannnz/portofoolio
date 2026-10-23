import React, { useEffect, useRef, useState } from 'react';
import { idleLoopUrl } from './constants';

// Matches the duration-300 fade-out below, so the clip only pauses once it's invisible
const FADE_OUT_MS = 300;

// While the scene rests on `frame`, fades its looping clip in over the canvas so the city keeps moving
// (flying cars, neon). `frame` is null while the scene travels, which fades the clip back out.
export default function IdleLoop({ frame }) {
    const videoRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        if (frame === null) {
            setVisible(false);
            const timer = setTimeout(() => video.pause(), FADE_OUT_MS);
            return () => clearTimeout(timer);
        }

        // Only shown once it's actually playing, so a slow or missing clip leaves the still frame in place
        const show = () => setVisible(true);
        video.addEventListener('playing', show, { once: true });
        video.pause();
        const src = idleLoopUrl(frame);
        if (video.getAttribute('src') !== src) video.src = src;
        video.currentTime = 0;
        video.muted = true;
        video.play().catch(() => {});
        return () => video.removeEventListener('playing', show);
    }, [frame]);

    return (
        <video
            ref={videoRef}
            aria-hidden="true"
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity ${
                visible ? 'opacity-100 duration-700' : 'opacity-0 duration-300'
            }`}
        />
    );
}
