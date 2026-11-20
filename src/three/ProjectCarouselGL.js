/**
 * Curved WebGL project gallery, rendered as a scissored "view" inside the shared
 * space-background renderer (no extra WebGL context).
 *
 * Cards sit on the inside of a cylinder around the camera. Scrolling/dragging
 * rotates the ring; velocity bends the planes and splits RGB slightly, and the
 * active card is sharp while neighbours are dimmed and desaturated.
 * All interaction state is owned by the React component; this class just draws
 * `current` (a float index) and reports hits.
 */
import {
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  TextureLoader,
  SRGBColorSpace,
  LinearFilter,
  Raycaster,
  Vector2,
} from 'three'
import { stats } from '../lib/ticker'

const R = 2.2
const STEP = 0.82
const CARD_W = 1.6
const CARD_H = 1.0

const vertex = /* glsl */ `
  uniform float uVel;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float bend = sin(uv.x * 3.14159265);
    p.z += bend * uVel * 0.35 + uHover * 0.06;
    p.y *= 1.0 + abs(uVel) * 0.04 * bend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uImgRatio;
  uniform float uPlaneRatio;
  uniform float uActive;
  uniform float uHover;
  uniform float uVel;
  uniform float uFade;
  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // cover-fit the image inside the card
    vec2 uv = vUv - 0.5;
    if (uImgRatio > uPlaneRatio) uv.x *= uPlaneRatio / uImgRatio;
    else uv.y *= uImgRatio / uPlaneRatio;
    uv *= 1.0 - 0.06 * uHover;                    // hover zoom
    uv += 0.5;

    float shift = uVel * 0.012;
    vec3 col;
    if (uHasMap > 0.5) {
      col.r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
      col.g = texture2D(uMap, uv).g;
      col.b = texture2D(uMap, uv - vec2(shift, 0.0)).b;
    } else {
      col = mix(vec3(0.09, 0.03, 0.18), vec3(0.25, 0.05, 0.45), vUv.y);
    }

    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 tint = mix(vec3(grey) * vec3(0.75, 0.6, 1.0), col, 0.25 + 0.75 * uActive);
    tint *= 0.45 + 0.55 * uActive + 0.12 * uHover;

    // vignette + purple rim
    vec2 c = vUv - 0.5;
    tint *= 1.0 - dot(c, c) * 0.6;
    float d = roundedBox(c * vec2(uPlaneRatio, 1.0), vec2(0.5 * uPlaneRatio, 0.5), 0.06);
    float rim = smoothstep(0.0, -0.012, d) - smoothstep(-0.012, -0.03, d);
    tint += vec3(0.57, 0.0, 0.98) * rim * (0.35 + 0.65 * uActive);
    float alpha = smoothstep(0.004, -0.004, d) * uFade;
    gl_FragColor = vec4(tint * alpha, alpha);
  }
`

export default class ProjectCarouselGL {
  constructor({ projects, imageFor, onReady }) {
    this.projects = projects
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(35, 2, 0.1, 20)
    this.camera.position.set(0, 0, 0)
    this.current = 0
    this.velocity = 0
    this.hover = -1
    this.visible = false
    this.fade = 0
    this.raycaster = new Raycaster()
    this.ndc = new Vector2()
    this.geometry = new PlaneGeometry(CARD_W, CARD_H, 32, 1)
    this.textures = []
    const loader = new TextureLoader()
    this.cards = projects.map((p, i) => {
      const material = new ShaderMaterial({
        uniforms: {
          uMap: { value: null },
          uHasMap: { value: 0 },
          uImgRatio: { value: 1.6 },
          uPlaneRatio: { value: CARD_W / CARD_H },
          uActive: { value: 0 },
          uHover: { value: 0 },
          uVel: { value: 0 },
          uFade: { value: 0 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: true,
      })
      const mesh = new Mesh(this.geometry, material)
      mesh.userData.index = i
      this.scene.add(mesh)
      const src = imageFor(p)
      if (src) {
        loader.load(src.url, (tex) => {
          tex.colorSpace = SRGBColorSpace
          tex.minFilter = LinearFilter
          tex.generateMipmaps = false
          material.uniforms.uMap.value = tex
          material.uniforms.uHasMap.value = 1
          material.uniforms.uImgRatio.value = src.ratio || tex.image.width / tex.image.height
          this.textures.push(tex)
          if (onReady) onReady(i)
        })
      }
      return { mesh, material, hover: 0, active: 0 }
    })
  }

  /** Index of the card under a point (stage-local css px), or -1. */
  hit(x, y, w, h) {
    this.ndc.set((x / w) * 2 - 1, -(y / h) * 2 + 1)
    this.raycaster.setFromCamera(this.ndc, this.camera)
    const hits = this.raycaster.intersectObjects(this.cards.map((c) => c.mesh), false)
    // nearest-to-front wins (cards never overlap much)
    return hits.length ? hits[0].object.userData.index : -1
  }

  /** The React side drives `current` (damped float index) and velocity. */
  setState(current, velocity, hover) {
    this.current = current
    this.velocity = velocity
    this.hover = hover
  }

  render(renderer, dt, rect) {
    const aspect = rect.width / rect.height
    if (Math.abs(this.camera.aspect - aspect) > 0.001) {
      this.camera.aspect = aspect
      // keep the active card comfortably inside narrow stages
      this.camera.fov = aspect < 1.6 ? 35 * (1.6 / aspect) * 0.85 : 35
      this.camera.updateProjectionMatrix()
    }
    this.fade = Math.min(1, this.fade + dt * 1.5)
    const k = 1 - Math.exp(-dt * 10)
    const vel = Math.max(-1.5, Math.min(1.5, this.velocity))
    this.cards.forEach((c, i) => {
      const a = (i - this.current) * STEP
      c.mesh.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R)
      c.mesh.rotation.y = -a
      c.mesh.renderOrder = -Math.round(Math.abs(a) * 100)
      c.mesh.visible = Math.abs(a) < 1.9
      const active = Math.max(0, 1 - Math.abs(i - this.current))
      c.hover += ((this.hover === i ? 1 : 0) - c.hover) * k
      const u = c.material.uniforms
      u.uActive.value = active
      u.uHover.value = c.hover
      u.uVel.value = vel
      u.uFade.value = this.fade
    })
    renderer.render(this.scene, this.camera)
    stats.projects++
  }

  dispose() {
    this.geometry.dispose()
    this.cards.forEach((c) => c.material.dispose())
    this.textures.forEach((t) => t.dispose())
  }
}
