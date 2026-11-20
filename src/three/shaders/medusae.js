/**
 * Medusae ("breathing jellyfish halo") shaders, extracted unchanged from
 * components/ui/medusae/Medusae.jsx so the effect can run inside the shared
 * space-background renderer. Only change: a uOpacity uniform for subtle blending.
 */
export const medusaeVertex = /* glsl */ `
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uOuterOscFrequency;
            uniform float uOuterOscAmplitude;
            uniform float uHaloRadiusBase;
            uniform float uHaloRadiusAmplitude;
            uniform float uHaloShapeAmplitude;
            uniform float uHaloRimWidth;
            uniform float uHaloOuterStartOffset;
            uniform float uHaloOuterEndOffset;
            uniform float uHaloScaleX;
            uniform float uHaloScaleY;
            uniform float uParticleBaseSize;
            uniform float uParticleActiveSize;
            uniform float uBlobScaleX;
            uniform float uBlobScaleY;
            uniform float uParticleRotationSpeed;
            uniform float uParticleRotationJitter;
            uniform float uParticleOscillationFactor;
            uniform vec3 uParticleColorBase;
            uniform vec3 uParticleColorOne;
            uniform vec3 uParticleColorTwo;
            uniform vec3 uParticleColorThree;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;
            
            attribute vec3 aOffset; 
            attribute float aRandom;
            // aAngleOffset removed/unused for alignment

            #define PI 3.14159265359

            // Simple noise for extra organic feel
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix( mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            mat2 rotate2d(float _angle){
                return mat2(cos(_angle), sin(_angle),
                            -sin(_angle), cos(_angle));
            }

            void main() {
                vUv = uv;
                
                // --- 1. ALIVE FLOW (Base layer) ---
                vec3 pos = aOffset;
                
                float driftSpeed = uTime * 0.15;
                
                float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
                float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);
                
                pos.x += dx * 0.25; 
                pos.y += dy * 0.25;

                // --- 2. THE JELLYFISH HALO (Smooth & Subtle) ---
                
                vec2 relToMouse = pos.xy - uMouse;
                vec2 haloScale = max(vec2(uHaloScaleX, uHaloScaleY), vec2(0.0001));
                float distFromMouse = length(relToMouse / haloScale);
                float angleToMouse = atan(relToMouse.y, relToMouse.x);
                vec2 dirToMouse = normalize(relToMouse + vec2(0.0001, 0.0));
                
                float shapeFactor = noise(dirToMouse * 2.0 + vec2(0.0, uTime * 0.1));
                
                float radiusBase = uHaloRadiusBase;
                float radiusAmplitude = uHaloRadiusAmplitude;
                float shapeAmplitude = uHaloShapeAmplitude;
                float rimWidth = uHaloRimWidth;
                float outerStartOffset = uHaloOuterStartOffset;
                float outerEndOffset = uHaloOuterEndOffset;

                float breathCycle = sin(uTime * 0.8);
                
                float baseRadius = radiusBase + breathCycle * radiusAmplitude;
                float currentRadius = baseRadius + (shapeFactor * shapeAmplitude);
                
                float dist = distFromMouse; 
                float rimInfluence = smoothstep(rimWidth, 0.0, abs(dist - currentRadius));
                
                vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
                
                float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;
                
                pos.xy += pushDir * pushAmt * rimInfluence;
                
                pos.z += rimInfluence * 0.3 * sin(uTime);

                // --- 3.5 OUTER OSCILLATION (Smooth, Faster) ---
                float outerInfluence = smoothstep(baseRadius + outerStartOffset, baseRadius + outerEndOffset, dist);
                float outerOsc = sin(uTime * uOuterOscFrequency + pos.x * 0.6 + pos.y * 0.6);
                pos.xy += normalize(relToMouse + vec2(0.0001, 0.0)) * outerOsc * uOuterOscAmplitude * outerInfluence;

                // --- 4. SIZE & SCALE ---
                
                float baseSize = uParticleBaseSize + (sin(uTime + pos.x)*0.003);
                
                float activeSize = uParticleActiveSize; 
                float currentScale = baseSize + (rimInfluence * activeSize);
                
                float stretch = rimInfluence * 0.02;
                
                vec3 transformed = position;
                transformed.x *= (currentScale + stretch) * uBlobScaleX;
                transformed.y *= currentScale * uBlobScaleY; 
                
                vSize = rimInfluence;
                vPos = pos.xy;
                
                // --- 5. ROTATION ---
                
                float dirLen = max(length(relToMouse), 0.0001);
                vec2 dir = relToMouse / dirLen;
                float oscPhase = aRandom * 6.28318530718;
                float osc = 0.5 + 0.5 * sin(
                  uTime * (0.25 + uParticleOscillationFactor * 0.35) + oscPhase
                );
                float speedScale = mix(0.55, 1.35, osc) * (0.8 + uParticleOscillationFactor * 0.2);
                float jitterScale = mix(0.7, 1.45, osc) * (0.85 + uParticleOscillationFactor * 0.15);
                float jitter = sin(
                  uTime * uParticleRotationSpeed * speedScale + pos.x * 0.35 + pos.y * 0.35
                ) * (uParticleRotationJitter * jitterScale);
                vec2 perp = vec2(-dir.y, dir.x);
                vec2 jitteredDir = normalize(dir + perp * jitter);
                mat2 rot = mat2(jitteredDir.x, jitteredDir.y, -jitteredDir.y, jitteredDir.x);
                transformed.xy = rot * transformed.xy;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
            }
        `

export const medusaeFragment = /* glsl */ `
            uniform float uTime;
            uniform float uOpacity;
            uniform vec3 uParticleColorBase;
            uniform vec3 uParticleColorOne;
            uniform vec3 uParticleColorTwo;
            uniform vec3 uParticleColorThree;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;

            void main() {
                vec2 center = vec2(0.5);
                vec2 pos = abs(vUv - center) * 2.0; 
                
                float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0/2.6);
                float alpha = 1.0 - smoothstep(0.8, 1.0, d);
                
                if (alpha < 0.01) discard;

                vec3 black = uParticleColorBase;
                vec3 cBlue = uParticleColorOne;
                vec3 cRed = uParticleColorTwo;
                vec3 cYellow = uParticleColorThree;
                
                float t = uTime * 1.2;
                
                float p1 = sin(vPos.x * 0.8 + t);
                float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);
                
                vec3 activeColor = mix(cBlue, cRed, p1 * 0.5 + 0.5);
                activeColor = mix(activeColor, cYellow, p2 * 0.5 + 0.5);
                
                vec3 finalColor = mix(black, activeColor, smoothstep(0.1, 0.8, vSize));
                float finalAlpha = alpha * mix(0.4, 0.95, vSize);

                gl_FragColor = vec4(finalColor, finalAlpha * uOpacity);
            }
        `
