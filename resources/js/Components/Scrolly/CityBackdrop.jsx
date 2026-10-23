import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CITY_FRAGMENT_SHADER } from './cityShader';
import { cityCamera } from './constants';

// Rendered below screen resolution: cheaper, and with the blur it matches the bokeh of the footage
const RENDER_SCALE = 0.6;
// With reduced motion the city still follows the scroll camera, but its own clock stands still
const STILL_TIME_S = 24;

const VERTEX_SHADER = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';

/** The pilot frames are cut out for this backdrop, so without WebGL the original frames are used instead. */
export function supportsWebGL() {
    try {
        return !!document.createElement('canvas').getContext('webgl');
    } catch {
        return false;
    }
}

// Live cyberpunk city behind the cut-out pilot: always moving (traffic, neon, windows, haze), so the scene
// stays alive whether or not the visitor is scrolling. `frameRef` holds the scene's current frame, which
// steers the virtual camera so the city follows the footage.
export default function CityBackdrop({ active, frameRef }) {
    const reduceMotion = useReducedMotion();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = active ? canvas?.getContext('webgl', { antialias: false, alpha: false }) : null;
        if (!gl) return undefined;

        const compile = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };
        const program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, CITY_FRAGMENT_SHADER));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
        gl.useProgram(program);

        // One oversized triangle covers the whole viewport
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const attr = gl.getAttribLocation(program, 'a');
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

        const uniform = (name) => gl.getUniformLocation(program, name);
        const uRes = uniform('uRes');
        const uTime = uniform('uTime');
        const uLook = uniform('uLook');
        const uRise = uniform('uRise');

        const resize = () => {
            canvas.width = Math.round(window.innerWidth * RENDER_SCALE);
            canvas.height = Math.round(window.innerHeight * RENDER_SCALE);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        // The pointer adds a little parallax on top of a slow cinematic drift
        const pointer = { x: 0, y: 0 };
        const handlePointer = (e) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        if (!reduceMotion) window.addEventListener('pointermove', handlePointer, { passive: true });

        const look = { x: 0, y: 0 };
        const start = performance.now();
        let rafId;
        const render = (now) => {
            const t = reduceMotion ? STILL_TIME_S : (now - start) / 1000;
            const camera = cityCamera(frameRef.current);
            look.x += (camera.pan + pointer.x * 0.5 + Math.sin(t * 0.07) * 0.4 - look.x) * 0.05;
            look.y += (-pointer.y * 0.3 - look.y) * 0.05;

            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, t);
            gl.uniform2f(uLook, look.x, look.y);
            gl.uniform1f(uRise, camera.rise);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointer);
        };
    }, [active, reduceMotion, frameRef]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ filter: 'blur(1.8px) saturate(1.1)', transform: 'scale(1.02)' }}
            className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-700 ${
                active ? 'opacity-100' : 'opacity-0'
            }`}
        />
    );
}
