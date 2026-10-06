import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Types `text` out character by character while `active` is true.
 * Resets when `active` turns false; shows the full text instantly for reduced-motion users.
 */
export default function useTypewriter(text, active, { speed = 38, delay = 300 } = {}) {
    const reduceMotion = useReducedMotion();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active) {
            setCount(0);
            return undefined;
        }
        if (reduceMotion) {
            setCount(text.length);
            return undefined;
        }

        let interval;
        let i = 0;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                i += 1;
                setCount(i);
                if (i >= text.length) clearInterval(interval);
            }, speed);
        }, delay);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [text, active, reduceMotion, speed, delay]);

    return { text: text.slice(0, count), done: active && count >= text.length };
}
