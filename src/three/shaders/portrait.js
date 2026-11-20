/**
 * Particle-portrait shaders.
 *
 * The whole simulation is analytic and stateless: every frame each vertex
 * recomputes its position from (home position, per-particle seeds, a handful of
 * uniforms). There is no CPU per-particle work after the one-off image sampling
 * and no feedback buffers, so it costs one draw call and scales with the GPU.
 *
 *  - intro:    scattered shell → home, per-particle delay (bright pixels first)
 *              with a curved flight path (eased, quintic smootherstep)
 *  - idle:     low-amplitude divergence-free-ish sine flow + global breathing
 *  - pointer:  a persistent repel field under the cursor plus a short "wake"
 *              ring buffer of impulses. Each impulse decays as a damped
 *              oscillation  e^(-k·age)·cos(ω·age)  which reads as spring-back
 *              with a little overshoot, without simulating springs.
 *  - depth:    image luminance pushes particles toward the camera
 *  - dissolve: scroll-linked; particles peel off bottom → top and spiral
 *              into the black hole target (uBH), fading as they go
 */

export const WAKE_SIZE = 6

export const portraitVertex = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uDissolve;
  uniform float uSize;
  uniform float uPR;
  uniform float uDepth;
  uniform float uIdle;
  uniform float uScatter;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uDamping;
  uniform float uSpring;
  uniform float uSwirl;
  uniform float uIntensity;
  uniform vec3 uPointer;          // xy model space, z = strength 0..1
  uniform vec4 uWake[${WAKE_SIZE}]; // xy model space, z = age (s), w = strength
  uniform vec2 uBH;               // dissolve target, model space
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;

  attribute vec3 aHome;   // x,y in model space, z = luminance-driven depth (0..1)
  attribute vec4 aData;   // x = luminance, y/z = random seeds, w = size factor

  varying vec3 vColor;
  varying float vAlpha;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  vec3 flow(vec3 q, float t) {
    return 0.5 * vec3(
      sin(q.y * 2.3 + t) + sin(q.z * 3.1 - t * 0.7 + q.x),
      sin(q.x * 2.7 - t * 0.8) + sin(q.z * 2.9 + t * 0.6 + q.y),
      sin(q.x * 3.3 + t * 0.5) + sin(q.y * 3.7 - t)
    );
  }

  float smoother(float x) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }

  void main() {
    float lum = aData.x;
    float s1 = aData.y;
    float s2 = aData.z;

    vec3 home = vec3(aHome.xy, (aHome.z - 0.35) * uDepth);

    // ── intro: scattered shell → home ──────────────────────────────
    vec3 dir = normalize(vec3(s1 - 0.5, s2 - 0.5, hash(s1 * 91.7 + s2) - 0.5) + 1e-4);
    vec3 start = dir * uScatter * (0.55 + 0.9 * hash(s2 * 13.1));
    float delay = mix(1.0 - lum, s1, 0.6) * 0.5;
    float e = smoother(clamp((uIntro - delay) / 0.5, 0.0, 1.0));
    vec3 p = mix(start, home, e);
    float inFlight = sin(3.14159265 * e);
    p += flow(home * 1.4 + s1 * 5.0, uTime * 0.7) * inFlight * 0.22;

    // ── idle drift + breathing ─────────────────────────────────────
    p += flow(home * 2.2 + s2 * 3.0, uTime * 0.28) * uIdle * 0.006;
    p.xy *= 1.0 + 0.007 * uIdle * sin(uTime * 0.55);

    // ── pointer: persistent repel + springy wake ──────────────────
    vec2 d = p.xy - uPointer.xy;
    float r2 = uRadius * uRadius;
    float fall = exp(-dot(d, d) / r2);
    vec2 n = normalize(d + vec2(1e-5, 0.0));
    float push = uPointer.z * fall * uStrength * (0.55 + 0.9 * s1);
    for (int i = 0; i < ${WAKE_SIZE}; i++) {
      vec4 w = uWake[i];
      vec2 dw = p.xy - w.xy;
      float f = exp(-dot(dw, dw) / (r2 * 1.4));
      float spring = exp(-w.z * uDamping) * cos(w.z * uSpring);
      float amt = w.w * f * spring * uStrength * 0.6;
      p.xy += normalize(dw + vec2(1e-5, 0.0)) * amt * uRadius;
      p.z += amt * 0.25 * (s2 - 0.3);
    }
    p.xy += n * push * uRadius;
    p.z += push * 0.35 * (s2 - 0.2);

    // ── scroll dissolve: spiral into the black hole ────────────────
    float th = clamp(uDissolve * 1.9 - (0.5 - home.y) * 0.7 - s1 * 0.55, 0.0, 1.0);
    float alive = 1.0;
    if (th > 0.0) {
      float k = th * th;
      vec2 rel = p.xy - uBH;
      float ang = k * uSwirl * (0.6 + s2);
      float c = cos(ang), s = sin(ang);
      rel = mat2(c, s, -s, c) * rel * (1.0 - k * 0.97);
      p.xy = uBH + rel;
      p += flow(p * 2.0 + s1 * 4.0, uTime * 0.5) * th * (1.0 - k) * 0.12;
      p.z -= k * 0.6;
      alive = 1.0 - smoothstep(0.55, 1.0, th);
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float sizeK = (0.55 + lum * 0.85) * aData.w * (1.0 + push * 0.6);
    gl_PointSize = uSize * uPR * sizeK * (10.0 / -mv.z);

    // palette by brightness
    vec3 col = mix(uC0, uC1, smoothstep(0.0, 0.35, lum));
    col = mix(col, uC2, smoothstep(0.3, 0.7, lum));
    col = mix(col, uC3, smoothstep(0.7, 1.0, lum));
    col *= 0.8 + 0.4 * aHome.z;
    col += vec3(0.25, 0.1, 0.45) * push;           // excited particles glow
    vColor = col * uIntensity;
    vAlpha = alive * (0.4 + 0.6 * e) * (0.6 + 0.4 * lum);
  }
`

export const portraitFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;          // 0 centre → 1 edge
    if (d > 1.0) discard;
    float a = (1.0 - d);
    a *= a * vAlpha;
    gl_FragColor = vec4(vColor * a, a); // premultiplied, additive
  }
`
