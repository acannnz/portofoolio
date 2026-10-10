import { Code2, Database, Layers, Network, Server, Terminal, Zap } from 'lucide-react';

// Image sequence layout (public/frames/frame_001.webp ... frame_240.webp)
export const TOTAL_FRAMES = 240;
export const FRAME_INTRO_END = 46; // auto-played descent on Summon
export const FRAME_LANDING_END = 76; // landing + identity cards
export const FRAME_STANDING_END = 156; // standing + skill cards
export const FRAME_STANDING_CENTER = 116; // midpoint of the standing range, used as parallax origin

export const PHASE = {
    SUMMON: 0,
    IDENTITY: 1,
    SKILLS: 2,
    PROJECTS: 3,
};

export function getPhase(frame, isSummoned) {
    if (!isSummoned) return PHASE.SUMMON;
    if (frame <= FRAME_LANDING_END) return PHASE.IDENTITY;
    if (frame <= FRAME_STANDING_END) return PHASE.SKILLS;
    return PHASE.PROJECTS;
}

// Skill icons are referenced by name from config/portfolio.php
export const ICONS = { Server, Code2, Database, Zap, Network, Terminal, Layers };

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ---- Image <-> viewport mapping (canvas draws the frame with object-fit: cover) ----
export const IMAGE_SIZE = { w: 1280, h: 720 };

export function coverTransform(viewportW, viewportH) {
    const imageRatio = IMAGE_SIZE.w / IMAGE_SIZE.h;
    const isWider = viewportW / viewportH > imageRatio;
    const drawW = isWider ? viewportW : viewportH * imageRatio;
    const drawH = isWider ? viewportW / imageRatio : viewportH;
    return { drawW, drawH, offX: (viewportW - drawW) / 2, offY: (viewportH - drawH) / 2 };
}

/** Maps a normalized image point (0..1) to viewport pixels using the same cover crop as the canvas. */
export const imageToViewport = (t, nx, ny) => [t.offX + nx * t.drawW, t.offY + ny * t.drawH];

/** clip-path for an armor-plate shape: top-left and bottom-right corners cut at 45°. */
export const chamferClip = (cut) =>
    `polygon(${cut}px 0, 100% 0, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, 0 100%, 0 ${cut}px)`;
