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
