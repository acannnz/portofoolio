// Fragment shader for the live cyberpunk city behind the pilot (see CityBackdrop.jsx). Layers of procedural
// towers far -> near, with flickering windows, pulsing neon signs, aviation lights, flying traffic and haze.
export const CITY_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLook; // slow camera drift / pointer parallax, roughly -1..1
uniform float uRise; // camera height above the rooftops: 0 = roof level, 1 = high above during the descent

float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }

vec3 neon(float h) {
    if (h < 0.45) return vec3(0.2, 0.9, 1.0);   // cyan
    if (h < 0.8) return vec3(1.0, 0.3, 0.75);   // pink
    if (h < 0.9) return vec3(0.6, 0.45, 1.0);   // violet
    return vec3(1.0, 0.65, 0.35);               // amber
}

// Flying car crossing the skyline: bright core, soft halo and a streak behind it
vec3 car(vec2 p, float aspect, float seed, float near, float lo, float hi) {
    float dir = h11(seed * 9.1) > 0.5 ? 1.0 : -1.0;
    float speed = mix(0.04, 0.11, near) * mix(0.7, 1.3, h11(seed * 4.7));
    float span = aspect + 0.8;
    float x = (fract(uTime * speed / span + h11(seed * 5.3)) - 0.5) * span * dir;
    float y = mix(lo, hi, h11(seed * 7.7)) + 0.006 * sin(uTime * 0.7 + seed);
    vec2 d = vec2(p.x - x, p.y - y);
    float size = mix(0.0025, 0.007, near);
    vec2 e = d / vec2(size * 2.6, size);
    float core = exp(-dot(e, e));
    float halo = exp(-length(d) / (size * 4.0)) * 0.25;
    float behind = max(-d.x * dir, 0.0);
    float trail = exp(-abs(d.y) / (size * 0.6)) * exp(-behind / (size * 12.0)) * step(0.0, behind) * 0.22;
    vec3 c = h11(seed * 2.2) > 0.35 ? vec3(0.75, 0.88, 1.0) : vec3(1.0, 0.3, 0.25);
    return c * (core + halo + trail) * mix(0.45, 1.1, near);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

    // Night haze sky, a touch lighter towards the horizon glow of the city
    vec3 col = mix(vec3(0.10, 0.12, 0.18), vec3(0.04, 0.05, 0.08), smoothstep(0.35, 1.0, uv.y));
    col += 0.05 * fbm(vec2(p.x * 1.2 + uTime * 0.008, uv.y * 2.5 - uTime * 0.003)) * vec3(0.6, 0.7, 1.0);

    const int LAYERS = 5;
    for (int i = 0; i < LAYERS; i++) {
        float fi = float(i);
        float t = fi / float(LAYERS - 1); // 0 = far skyline, 1 = big towers framing the shot
        float cols = mix(14.0, 2.6, pow(t, 0.8)); // buildings per screen-height of width
        float par = mix(0.015, 0.12, t);
        float x = (p.x + uLook.x * par) * cols + fi * 17.31;
        float cell = floor(x);
        float lx = fract(x);
        float hb = h11(cell + fi * 31.7);
        float w = mix(0.55, 0.88, h11(cell * 1.73 + fi));
        float x0 = (1.0 - w) * h11(cell * 2.31 + fi * 5.1);
        float base = mix(0.15, -0.2, t) + uLook.y * par * 0.4 - uRise * mix(0.35, 1.1, t);
        float top = base + mix(0.45, 0.95, t) * (0.4 + 0.6 * hb) + step(0.75, h11(cell * 3.9 + fi)) * 0.4;
        float edge = mix(0.006, 0.002, t) * cols;
        float inX = smoothstep(x0 - edge, x0 + edge, lx) * smoothstep(x0 + w + edge, x0 + w - edge, lx);
        float m = inX * smoothstep(top + 0.004, top - 0.004, uv.y);

        float bx = (lx - x0) / w;
        float by = uv.y - base;
        float height = top - base;
        // Faces catch a little cool city light towards one side
        vec3 wall = mix(vec3(0.018, 0.022, 0.035), vec3(0.04, 0.05, 0.075), hb) * (0.8 + 0.4 * bx);
        vec3 glow = vec3(0.0);

        // Windows: floors light up in clusters, mostly warm, a few switching on and off over time
        float wcols = floor(mix(6.0, 12.0, h11(cell + 3.3)) * mix(1.0, 1.6, t));
        vec2 wg = vec2(bx * wcols, by * mix(170.0, 115.0, t));
        vec2 wid = floor(wg);
        vec2 wf = fract(wg);
        float floorBusy = h21(vec2(cell * 3.1 + fi, wid.y));
        float lit = step(mix(0.5, 0.92, floorBusy), h21(wid + cell * 7.1 + fi * 13.0));
        lit = abs(lit - step(0.975, h21(wid * 0.7 + cell + floor(uTime * 0.25 + h21(wid + cell) * 9.0))));
        float pane = smoothstep(0.44, 0.3, abs(wf.x - 0.5)) * smoothstep(0.42, 0.28, abs(wf.y - 0.5));
        vec3 wcol = h21(wid * 1.31 + cell) > 0.82 ? vec3(0.6, 0.82, 1.0) : vec3(1.0, 0.86, 0.66);
        float inside = step(0.05, bx) * step(bx, 0.95) * step(by, height - 0.012);
        glow += wcol * lit * pane * inside * mix(0.35, 0.8, t);

        // Vertical neon signs: framed columns of glyphs, pulsing and now and then stuttering
        float hasSign = step(mix(0.8, 0.45, t), h11(cell * 4.13 + fi * 2.9)) * step(0.2, t);
        float halfW = mix(0.006, 0.022, t);
        float sx = mix(0.25, 0.75, h11(cell * 6.1));
        float sy = height * mix(0.35, 0.72, h11(cell * 5.3));
        float sh = mix(0.05, 0.17, t) * mix(0.7, 1.2, h11(cell * 8.7));
        vec2 sd = vec2((bx - sx) * w / cols, by - sy);
        float rect = max(abs(sd.x) - halfW, abs(sd.y) - sh);
        // Glyphs: each character is a few horizontal and vertical strokes, stacked down the sign
        vec2 q = sd / halfW;                         // sign-local units, 1 = half the sign's width
        float charId = floor(q.y / 1.8);
        vec2 cq = vec2(q.x * 0.5 + 0.5, fract(q.y / 1.8)) * 4.0; // 4x4 stroke grid per character
        vec2 cc = floor(cq);
        vec2 cf = fract(cq);
        float hStroke = step(0.45, h21(vec2(cc.y, charId * 3.7 + cell))) * smoothstep(0.32, 0.18, abs(cf.y - 0.5));
        float vStroke = step(0.55, h21(vec2(cc.x + 9.0, charId * 5.1 + cell))) * smoothstep(0.32, 0.18, abs(cf.x - 0.5));
        float margin = step(0.35, cq.x) * step(cq.x, 3.65) * step(0.4, cq.y) * step(cq.y, 3.6);
        float stroke = max(hStroke, vStroke) * margin;
        float frame = smoothstep(-0.15 * halfW, 0.0, rect);
        float pulse = 0.8 + 0.2 * sin(uTime * (1.2 + h11(cell) * 2.0) + cell);
        pulse *= mix(0.35, 1.0, step(0.04, fract(uTime * 0.11 + h11(cell * 9.9))));
        vec3 sc = neon(h11(cell * 11.3 + fi));
        float signFace = smoothstep(0.002, 0.0, rect) * hasSign;
        glow += sc * signFace * (max(stroke, frame * 0.8) + 0.08) * pulse * 2.0;

        // Light cuts through the haze better than dark walls do
        float fog = mix(0.78, 0.06, t);
        vec3 fogCol = vec3(0.1, 0.12, 0.18);
        vec3 bcol = mix(wall, fogCol, fog) + glow * (1.0 - fog * 0.55);
        col = mix(col, bcol, m);
        // Sign glow spills into the air around it
        col += sc * hasSign * exp(-max(rect, 0.0) / (halfW * 1.6)) * 0.22 * pulse * (1.0 - fog * 0.5);

        // Red aviation light on the taller roofs
        vec2 ad = vec2((lx - (x0 + w * 0.5)) / cols, uv.y - top - 0.004);
        float blink = smoothstep(0.6, 1.0, sin(uTime * 2.0 + cell * 1.7));
        col += vec3(1.0, 0.12, 0.1) * exp(-length(ad) / 0.0028) * blink * step(0.45, hb) * mix(0.35, 0.9, t);

        // Traffic flies between the layers, so nearer buildings pass in front of it
        if (i < LAYERS - 1) {
            for (int k = 0; k < 3; k++) {
                float seed = fi * 10.0 + float(k);
                col += car(p, aspect, seed, t, mix(0.5, 0.35, t), mix(0.92, 0.8, t));
            }
        }
    }

    // Low drifting haze lit by the neon below
    float haze = fbm(vec2(p.x * 1.6 - uTime * 0.02, uv.y * 3.0 + uTime * 0.01));
    col = mix(col, vec3(0.2, 0.17, 0.3), 0.28 * haze * smoothstep(0.75, 0.0, uv.y));

    // Vignette and a hint of film grain
    col *= 1.0 - 0.35 * pow(length((uv - 0.5) * vec2(1.0, 0.8)) * 1.3, 2.2);
    col += (h21(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.015;
    gl_FragColor = vec4(col, 1.0);
}
`;
