/**
 * The shared, fixed WebGL background for the whole page.
 *
 *  Layer order (one renderer, one canvas, behind all content):
 *   1. nebula + black hole   – one fullscreen triangle, analytic lensing
 *   2. starfield             – Points, lensed around the black hole, scroll parallax
 *   3. medusae halo          – the existing jellyfish effect, faded in only behind
 *                              the Experience/Education sections, low opacity
 *   4. "views"               – scissored sub-viewports for section scenes (the
 *                              Projects WebGL carousel), so they share this context
 *
 *  Rendering is skipped while the tab is hidden; reduced-motion users get a
 *  static frame that only re-renders on resize/scroll.
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  RawShaderMaterial,
  ShaderMaterial,
  Mesh,
  Points,
  PlaneGeometry,
  InstancedMesh,
  InstancedBufferAttribute,
  Color,
  Vector2,
  Vector3,
  AdditiveBlending,
} from 'three'
import { fullscreenVertex, nebulaFragment, starVertex, starFragment } from './shaders/space'
import { medusaeVertex, medusaeFragment } from './shaders/medusae'
import MEDUSAE_DEFAULTS from '../components/ui/medusae/defaults'
import { dprForTier } from '../lib/device'
import { stats } from '../lib/ticker'

const STARS = { 1: 900, 2: 1800, 3: 3000 }
const MEDUSAE_GRID = { 1: [70, 38], 2: [104, 56], 3: [140, 75] }
const OCTAVES = { 1: 2, 2: 3, 3: 3 }

export default class SpaceBackground {
  constructor({ canvas, tier, reducedMotion, blackHole }) {
    this.canvas = canvas
    this.tier = tier
    this.reduced = reducedMotion
    this.bhCfg = blackHole
    this.time = 0
    this.scrollY = 0
    this.views = new Set()
    this.medusaeRange = null // [startY, endY] in document px
    this.pointer = { x: 0, y: 0, has: false }
    this.dirty = true
    this.frame = 0
    this.w = 1
    this.h = 1
  }

  init() {
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'default' })
    this.renderer.setClearColor(0x06000b, 1)
    this.renderer.autoClear = false
    this.renderer.setPixelRatio(dprForTier(this.tier))

    // 1. nebula + black hole
    const tri = new BufferGeometry()
    tri.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
    this.bgUniforms = {
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uBH: { value: new Vector3(0, 0, 50) },
      uBHInt: { value: 0 },
      uTilt: { value: this.bhCfg.tilt },
      uSpin: { value: this.reduced ? 0 : this.bhCfg.spin },
      uNebula: { value: 0.16 },
      uBase: { value: new Color('#06000b') },
      uC1: { value: new Color('#9200fa') },
      uC2: { value: new Color('#1d0b5c') },
      uHot: { value: new Color('#f3e6ff') },
    }
    this.bgMesh = new Mesh(tri, this.makeBgMaterial())
    this.bgMesh.frustumCulled = false
    this.bgScene = new Scene()
    this.bgScene.add(this.bgMesh)
    this.orthoCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // 2. starfield
    this.starUniforms = {
      uView: { value: new Vector2(1, 1) },
      uPR: { value: 1 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uBH: { value: new Vector3(0, 0, 50) },
      uBHInt: { value: 0 },
      uTwinkle: { value: this.reduced ? 0 : 1 },
    }
    this.starMat = new RawShaderMaterial({
      uniforms: this.starUniforms,
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    this.stars = new Points(this.makeStarGeometry(STARS[3]), this.starMat)
    this.stars.frustumCulled = false
    this.bgScene.add(this.stars)

    // 3. medusae
    this.medusae = this.makeMedusae()

    this.resize()
    this.setTier(this.tier, true)
  }

  makeBgMaterial() {
    return new RawShaderMaterial({
      uniforms: this.bgUniforms,
      vertexShader: fullscreenVertex,
      fragmentShader: nebulaFragment(OCTAVES[Math.max(1, this.tier)]),
      depthTest: false,
      depthWrite: false,
    })
  }

  makeStarGeometry(n) {
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    const pos = new Float32Array(n * 3)
    const meta = new Float32Array(n * 2)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rnd()
      pos[i * 3 + 1] = rnd()
      pos[i * 3 + 2] = Math.pow(rnd(), 2.2) // most stars far away
      meta[i * 2] = 1.2 + rnd() * rnd() * 2.6
      meta[i * 2 + 1] = rnd()
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('aMeta', new BufferAttribute(meta, 2))
    return g
  }

  makeMedusae() {
    const d = MEDUSAE_DEFAULTS
    const uniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uResolution: { value: new Vector2(1, 1) },
      uOuterOscFrequency: { value: d.halo.outerOscFrequency },
      uOuterOscAmplitude: { value: d.halo.outerOscAmplitude },
      uHaloRadiusBase: { value: d.halo.radiusBase },
      uHaloRadiusAmplitude: { value: d.halo.radiusAmplitude },
      uHaloShapeAmplitude: { value: d.halo.shapeAmplitude },
      uHaloRimWidth: { value: d.halo.rimWidth },
      uHaloOuterStartOffset: { value: d.halo.outerStartOffset },
      uHaloOuterEndOffset: { value: d.halo.outerEndOffset },
      uHaloScaleX: { value: d.halo.scaleX },
      uHaloScaleY: { value: d.halo.scaleY },
      uParticleBaseSize: { value: d.particles.baseSize },
      uParticleActiveSize: { value: d.particles.activeSize },
      uBlobScaleX: { value: d.particles.blobScaleX },
      uBlobScaleY: { value: d.particles.blobScaleY },
      uParticleRotationSpeed: { value: d.particles.rotationSpeed },
      uParticleRotationJitter: { value: d.particles.rotationJitter },
      uParticleOscillationFactor: { value: d.particles.oscillationFactor },
      uParticleColorBase: { value: new Color(d.particles.colorBase) },
      uParticleColorOne: { value: new Color(d.particles.colorOne) },
      uParticleColorTwo: { value: new Color(d.particles.colorTwo) },
      uParticleColorThree: { value: new Color(d.particles.colorThree) },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: medusaeVertex,
      fragmentShader: medusaeFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const camera = new PerspectiveCamera(75, 1, 0.1, 100)
    camera.position.set(0, 0, 5)
    const scene = new Scene()
    return { uniforms, material, camera, scene, mesh: null, geometry: new PlaneGeometry(1, 1), grid: null, opacity: 0 }
  }

  buildMedusaeGrid(cx, cy) {
    const m = this.medusae
    if (m.grid && m.grid[0] === cx) return
    if (m.mesh) {
      m.scene.remove(m.mesh)
      m.mesh.dispose()
    }
    const count = cx * cy
    const offsets = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    let i = 0
    for (let y = 0; y < cy; y++) {
      for (let x = 0; x < cx; x++) {
        offsets[i * 3] = (x / (cx - 1) - 0.5) * 40 + (Math.random() - 0.5) * 0.25
        offsets[i * 3 + 1] = (y / (cy - 1) - 0.5) * 22 + (Math.random() - 0.5) * 0.25
        randoms[i] = Math.random()
        i++
      }
    }
    // geometry is shared; attributes are per-grid
    const geo = m.geometry.clone()
    geo.setAttribute('aOffset', new InstancedBufferAttribute(offsets, 3))
    geo.setAttribute('aRandom', new InstancedBufferAttribute(randoms, 1))
    if (m.instGeo) m.instGeo.dispose()
    m.instGeo = geo
    m.mesh = new InstancedMesh(geo, m.material, count)
    m.mesh.frustumCulled = false
    m.scene.add(m.mesh)
    m.grid = [cx, cy]
  }

  setTier(tier, force) {
    if (!this.renderer || (!force && tier === this.tier)) return
    // tier 0 at runtime = too slow even at the lowest settings: keep the lowest
    // settings but only render static frames (on scroll/resize), like reduced motion
    this.frozen = tier === 0
    if (this.frozen) this.dirty = true
    const prev = this.tier
    this.tier = Math.max(1, tier)
    this.renderer.setPixelRatio(dprForTier(this.tier))
    this.stars.geometry.setDrawRange(0, STARS[this.tier])
    if (OCTAVES[this.tier] !== OCTAVES[Math.max(1, prev)] || force) {
      const old = this.bgMesh.material
      this.bgMesh.material = this.makeBgMaterial()
      old.dispose()
    }
    const [cx, cy] = MEDUSAE_GRID[this.tier]
    if (this.medusae.grid) this.buildMedusaeGrid(cx, cy)
    this.resize()
  }

  resize() {
    if (!this.renderer) return
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.w = w
    this.h = h
    this.renderer.setSize(w, h, false)
    const pr = this.renderer.getPixelRatio()
    this.bgUniforms.uRes.value.set(w * pr, h * pr)
    this.starUniforms.uView.value.set(w, h)
    this.starUniforms.uPR.value = pr
    this.medusae.camera.aspect = w / h
    this.medusae.camera.updateProjectionMatrix()
    this.medusae.uniforms.uResolution.value.set(w, h)
    this.dirty = true
  }

  setScroll(y) {
    if (y !== this.scrollY) this.dirty = true
    this.scrollY = y
  }

  setPointer(x, y) {
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.has = true
  }

  /** Black-hole screen position in css px (y down) for a given scroll. */
  blackHoleScreen(cfg = this.bhCfg) {
    const minDim = Math.min(this.w, this.h)
    const vh = window.innerHeight
    const x = cfg.x * this.w
    const y = cfg.y * vh - this.scrollY * cfg.parallax
    return { x, y, r: cfg.size * minDim }
  }

  setBlackHoleConfig(cfg) {
    this.bhCfg = cfg
    this.bgUniforms.uTilt.value = cfg.tilt
    this.dirty = true
  }

  addView(view) {
    this.views.add(view)
    this.dirty = true
    return () => {
      this.views.delete(view)
      this.dirty = true
    }
  }

  setMedusaeRange(range) {
    this.medusaeRange = range
  }

  /** Does anything need continuous rendering this frame? */
  get animating() {
    if (this.reduced) return false
    return true
  }

  update(dt) {
    if (!this.renderer) return
    this.frame++
    let viewsActive = false
    this.views.forEach((v) => {
      if (v.isActive()) viewsActive = true
    })
    // low tier: background at 30fps unless an interactive view is on screen
    const still = this.reduced || this.frozen
    if (!still) this.time += dt
    if (this.tier <= 1 && !viewsActive && !this.dirty && this.frame % 2 === 1) return
    if (still && !this.dirty && !viewsActive) return

    const r = this.renderer
    const pr = r.getPixelRatio()
    const vh = window.innerHeight

    // black hole: full strength in the hero, fades over the next viewport
    const bh = this.blackHoleScreen()
    const bhFade = this.bhCfg.enabled ? Math.max(0, 1 - Math.max(0, this.scrollY - vh * 0.35) / (vh * 0.9)) : 0
    const bhInt = bhFade * this.bhCfg.intensity
    this.bgUniforms.uTime.value = this.time
    this.bgUniforms.uScroll.value = this.scrollY * pr
    this.bgUniforms.uBH.value.set(bh.x * pr, (this.h - bh.y) * pr, bh.r * pr)
    this.bgUniforms.uBHInt.value = bhInt
    this.starUniforms.uTime.value = this.time
    this.starUniforms.uScroll.value = this.scrollY
    this.starUniforms.uBH.value.set(bh.x, bh.y, bh.r)
    this.starUniforms.uBHInt.value = bhInt

    r.setScissorTest(false)
    r.setViewport(0, 0, this.w, this.h)
    r.clear()
    r.render(this.bgScene, this.orthoCam)
    stats.bg++

    // medusae: only where its sections are on screen
    const m = this.medusae
    let target = 0
    if (this.medusaeRange) {
      const [a, b] = this.medusaeRange
      const top = a - this.scrollY
      const bottom = b - this.scrollY
      const visible = Math.min(bottom, this.h) - Math.max(top, 0)
      target = Math.max(0, Math.min(1, visible / (this.h * 0.6)))
    }
    m.opacity += (target - m.opacity) * (still ? 1 : Math.min(1, dt * 3 || 1))
    if (m.opacity > 0.01) {
      if (!m.grid) this.buildMedusaeGrid(...MEDUSAE_GRID[this.tier])
      this.updateMedusae(dt)
      m.uniforms.uOpacity.value = m.opacity * 0.55
      r.render(m.scene, m.camera)
    }

    // scissored section views (projects carousel)
    this.views.forEach((v) => {
      if (!v.isActive()) return
      const rect = v.getRect()
      if (!rect || rect.bottom < 0 || rect.top > this.h) return
      const x = Math.max(0, rect.left)
      const y = this.h - rect.bottom
      r.setViewport(rect.left, y, rect.width, rect.height)
      r.setScissor(x, Math.max(0, y), Math.min(rect.width, this.w - x), rect.height)
      r.setScissorTest(true)
      v.render(r, dt, rect)
      r.setScissorTest(false)
    })
    r.setViewport(0, 0, this.w, this.h)
    this.dirty = false
  }

  updateMedusae(dt) {
    const m = this.medusae
    const d = MEDUSAE_DEFAULTS
    m.uniforms.uTime.value = this.reduced ? 0 : this.time
    if (!this.pointer.has || this.reduced) return
    const vhW = 2 * 5 * Math.tan((75 * Math.PI) / 360)
    const vwW = vhW * m.camera.aspect
    const nx = (this.pointer.x / this.w) * 2 - 1
    const ny = -(this.pointer.y / this.h) * 2 + 1
    const t = this.time
    const jr = Math.min(vwW, vhW) * d.cursor.radius
    const jx = (Math.sin(t * 0.35) + Math.sin(t * 0.77 + 1.2)) * 0.5
    const jy = (Math.cos(t * 0.31) + Math.sin(t * 0.63 + 2.4)) * 0.5
    const tx = ((nx * vwW) / 2 + jx * jr * d.cursor.strength) * d.particles.cursorFollowStrength
    const ty = ((ny * vhW) / 2 + jy * jr * d.cursor.strength) * d.particles.cursorFollowStrength
    const cur = m.uniforms.uMouse.value
    const k = 1 - Math.pow(1 - d.cursor.dragFactor * 5, dt * 60)
    cur.x += (tx - cur.x) * k
    cur.y += (ty - cur.y) * k
  }

  dispose() {
    if (!this.renderer) return
    this.bgMesh.geometry.dispose()
    this.bgMesh.material.dispose()
    this.stars.geometry.dispose()
    this.starMat.dispose()
    const m = this.medusae
    if (m.instGeo) m.instGeo.dispose()
    m.geometry.dispose()
    m.material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer = null
  }
}
