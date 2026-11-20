/**
 * Shared space background: one fullscreen pass (nebula + black hole) and a
 * point-cloud starfield. No post-processing — the "bloom" is baked into the
 * analytic falloffs, which is far cheaper than a blur chain.
 */

export const fullscreenVertex = /* glsl */ `
  attribute vec3 position;
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const nebulaFragment = (octaves = 3) => /* glsl */ `
  precision highp float;
  uniform vec2 uRes;          // drawing-buffer px
  uniform float uTime;
  uniform float uScroll;      // buffer px scrolled
  uniform vec3 uBH;           // xy buffer px (y up), z = horizon radius px
  uniform float uBHInt;       // 0..1 (fades out after the hero)
  uniform float uTilt;
  uniform float uSpin;
  uniform float uNebula;
  uniform vec3 uBase;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uHot;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < ${octaves}; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  vec3 nebula(vec2 px) {
    float m = min(uRes.x, uRes.y);
    vec2 uv = px / m;
    uv.y += uScroll / m * 0.15;               // very slow parallax
    float t = uTime * 0.012;
    float n = fbm(uv * 1.6 + vec2(t, -t * 0.6));
    float n2 = fbm(uv * 3.1 - vec2(t * 0.7, t) + n);
    float cloud = smoothstep(0.35, 0.95, n * 0.7 + n2 * 0.5);
    vec3 col = mix(uC2, uC1, smoothstep(0.3, 0.8, n2));
    return col * cloud * uNebula;
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    vec3 col = uBase;

    // gravitational lensing: warp the nebula lookup around the hole
    vec2 q = (p - uBH.xy) / uBH.z;           // units of horizon radius
    float r = length(q);
    float lensK = uBHInt * 1.6 / (r * r + 0.35);
    vec2 warped = uBH.xy + q * (1.0 + lensK) * uBH.z;
    col += nebula(warped);

    if (uBHInt > 0.001) {
      float shadow = smoothstep(0.96, 1.08, r);
      col *= shadow;

      // accretion disk in its own (tilted) plane
      vec2 dq = vec2(q.x, q.y / uTilt);
      float rd = length(dq);
      vec2 rp = rot(uTime * uSpin * 2.2 / max(rd, 1.0)) * dq;  // inner rings orbit faster
      float streaks = fbm(rp * 1.7) * 0.75 + fbm(rp * 5.0) * 0.35;
      float band = smoothstep(1.3, 1.75, rd) * (1.0 - smoothstep(2.4, 5.2, rd));
      float doppler = 1.0 + 0.55 * clamp(-dq.x / max(rd, 0.001), -1.0, 1.0);
      vec3 diskCol = mix(uHot, uC1, smoothstep(1.4, 3.6, rd));
      diskCol = mix(diskCol, uC2, smoothstep(3.0, 5.0, rd));
      vec3 disk = diskCol * band * (0.35 + streaks) * doppler;
      float front = smoothstep(0.08, -0.08, dq.y);              // near half passes in front of the hole

      // lensed image of the far side, wrapped over the top (and a thin one underneath)
      vec2 lq = rot(uTime * uSpin * 0.8) * q;
      float arcN = 0.55 + fbm(lq * 2.4) * 0.7;
      float upper = exp(-pow((r - 1.42) / 0.28, 2.0)) * smoothstep(-0.55, 0.85, q.y);
      float lower = exp(-pow((r - 1.18) / 0.12, 2.0)) * smoothstep(0.2, -0.9, q.y) * 0.55;
      vec3 arc = mix(uHot, uC1, 0.45) * (upper + lower) * arcN;

      float ring = exp(-pow((r - 1.06) / 0.045, 2.0));            // photon ring
      float halo = exp(-max(r - 1.0, 0.0) * 0.9) * 0.22;           // soft "bloom"

      col += (disk * (1.0 - front) + arc) * shadow * uBHInt;
      col += disk * front * uBHInt;
      col += (uHot * ring * 0.9 + uC1 * halo) * uBHInt * shadow;
    }

    // vignette + dithering (avoids banding in the dark gradients)
    vec2 v = p / uRes - 0.5;
    col *= 1.0 - dot(v, v) * 0.55;
    col += (hash(p + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`

export const starVertex = /* glsl */ `
  attribute vec3 position;    // xy 0..1 screen seed, z = depth 0..1
  attribute vec2 aMeta;       // x = size, y = phase
  uniform vec2 uView;         // css px
  uniform float uPR;
  uniform float uTime;
  uniform float uScroll;      // css px
  uniform vec3 uBH;           // css px (y down), z = horizon radius css px
  uniform float uBHInt;
  uniform float uTwinkle;
  varying float vAlpha;
  varying float vTint;
  void main() {
    float depth = position.z;
    vec2 uv = position.xy;
    uv.y = fract(uv.y - uScroll / uView.y * (0.05 + depth * 0.25));
    uv.x = fract(uv.x + uTime * 0.0025 * (0.3 + depth));
    vec2 px = uv * (uView + 40.0) - 20.0;

    // lensing: push stars outward around the hole (Einstein-ring-ish) and hide them behind it
    vec2 rel = px - uBH.xy;
    float r = max(length(rel), 0.001);
    float rs = uBH.z;
    px += rel / r * (rs * rs * 1.4 / r) * uBHInt;
    float r2 = length(px - uBH.xy);
    float hide = mix(1.0, smoothstep(rs * 1.05, rs * 1.6, r2), uBHInt);

    vec2 ndc = px / uView * 2.0 - 1.0;
    gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
    float tw = mix(1.0, 0.55 + 0.45 * sin(uTime * (0.6 + aMeta.y * 2.0) + aMeta.y * 40.0), uTwinkle);
    gl_PointSize = aMeta.x * (0.6 + depth) * uPR;
    vAlpha = (0.25 + 0.75 * depth) * tw * hide;
    vTint = fract(aMeta.y * 7.13);
  }
`

export const starFragment = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying float vTint;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    float a = (1.0 - d) * (1.0 - d) * vAlpha;
    vec3 col = mix(vec3(0.85, 0.82, 1.0), vec3(0.78, 0.6, 1.0), step(0.7, vTint));
    gl_FragColor = vec4(col * a, a);
  }
`
