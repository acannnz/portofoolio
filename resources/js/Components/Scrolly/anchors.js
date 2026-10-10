/*
 * Anchor points on the mecha's body, in normalized image coordinates (0..1 of the 1280x720 frame).
 * The mecha changes pose over the sequence (crouch -> stand), so each anchor is keyframed by frame
 * number and linearly interpolated. Values were measured against public/frames/frame_NNN.webp.
 */

/** keys: [[frame, v1, v2, ...], ...] sorted by frame. Returns interpolated [v1, v2, ...]. */
function sample(keys, frame) {
    if (frame <= keys[0][0]) return keys[0].slice(1);
    const last = keys[keys.length - 1];
    if (frame >= last[0]) return last.slice(1);

    const next = keys.findIndex(([f]) => f >= frame);
    const [f0, ...a] = keys[next - 1];
    const [f1, ...b] = keys[next];
    const t = (frame - f0) / (f1 - f0);
    return a.map((v, i) => v + (b[i] - v) * t);
}

// Landing / identity phase (frames 46-76): [frame, x, y]
const HEAD_KEYS = [[46, 0.475, 0.32], [61, 0.465, 0.285], [76, 0.465, 0.255]]; // left temple
const CHEST_KEYS = [[46, 0.52, 0.46], [76, 0.535, 0.44]];

export function identityAnchors(frame) {
    return { head: sample(HEAD_KEYS, frame), chest: sample(CHEST_KEYS, frame) };
}

// Standing / skills phase (frames 77-156):
// [frame, centerX, shoulderY, shoulderHalfW, chestY, chestHalfW, waistY, waistHalfW]
const BODY_KEYS = [
    [84, 0.494, 0.19, 0.076, 0.32, 0.07, 0.5, 0.063],
    [92, 0.49, 0.23, 0.075, 0.35, 0.068, 0.55, 0.066],
    [100, 0.5, 0.29, 0.075, 0.4, 0.065, 0.6, 0.07],
    [108, 0.5, 0.32, 0.072, 0.43, 0.065, 0.66, 0.07],
];

/** Returns { left: [shoulder, chest, waist], right: [shoulder, chest, waist] } as [x, y] pairs. */
export function skillAnchors(frame) {
    const [cx, sY, sW, cY, cW, wY, wW] = sample(BODY_KEYS, frame);
    const rows = [[sY, sW], [cY, cW], [wY, wW]];
    return {
        left: rows.map(([y, hw]) => [cx - hw, y]),
        right: rows.map(([y, hw]) => [cx + hw, y]),
    };
}
