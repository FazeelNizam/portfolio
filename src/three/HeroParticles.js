/**
 * GPU particle portrait for the hero.
 *
 * Owns its own small renderer on a transparent canvas inside the hero, layered
 * above the name (when name.layer === 'behind') and above the shared space
 * background canvas. Rendering stops when the hero is off-screen or the tab is
 * hidden; quality tier changes only shrink the draw range (no re-upload).
 */
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Points,
  Group,
  Color,
  Vector2,
  Vector3,
  Vector4,
  AdditiveBlending,
} from 'three'
import { portraitVertex, portraitFragment, WAKE_SIZE } from './shaders/portrait'
import { dprForTier } from '../lib/device'
import { samplePortrait } from './portraitSampler'
import { stats } from '../lib/ticker'

const FOV = 30
const CAM_Z = 10

export default class HeroParticles {
  constructor({ canvas, config, tier, reducedMotion, counts }) {
    this.canvas = canvas
    this.cfg = config
    this.tier = tier
    this.reduced = reducedMotion
    this.counts = counts
    this.active = true
    this.time = 0
    this.introStart = null
    this.width = 1
    this.height = 1
    this.scroll = 0
    this.pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false, strength: 0, lastX: 0, lastY: 0, lastT: 0 }
    this.wake = Array.from({ length: WAKE_SIZE }, () => new Vector4(0, 0, 99, 0))
    this.wakeIndex = 0
    this.needsRender = true
    this.tmp = new Vector3()
  }

  async init() {
    const maxCount = this.counts[Math.max(1, this.tier)]
    const url = `${process.env.PUBLIC_URL}/${this.cfg.portrait.image}`
    const { home, data, aspect } = await samplePortrait(url, maxCount)
    this.aspect = aspect
    this.maxCount = maxCount

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(dprForTier(this.tier))

    this.scene = new Scene()
    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
    this.camera.position.set(0, 0, CAM_Z)

    const geo = new BufferGeometry()
    geo.setAttribute('aHome', new BufferAttribute(home, 3))
    geo.setAttribute('aData', new BufferAttribute(data, 4))
    // `position` is required by three; reuse aHome's buffer (not read by the shader)
    geo.setAttribute('position', new BufferAttribute(home, 3))
    geo.setDrawRange(0, this.counts[this.tier] || maxCount)
    geo.boundingSphere = null
    this.geometry = geo

    const p = this.cfg.particles
    const it = this.cfg.interaction
    const col = (i) => new Color(p.colors[Math.min(i, p.colors.length - 1)])
    this.uniforms = {
      uTime: { value: 0 },
      uIntro: { value: this.reduced ? 1 : 0 },
      uDissolve: { value: 0 },
      uSize: { value: p.size },
      uPR: { value: this.renderer.getPixelRatio() },
      uDepth: { value: p.depth },
      uIdle: { value: this.reduced ? 0 : p.idleMotion },
      uScatter: { value: this.cfg.intro.scatter },
      uRadius: { value: it.radius },
      uStrength: { value: it.strength },
      uDamping: { value: it.damping },
      uSpring: { value: it.springiness },
      uSwirl: { value: this.cfg.dissolve.swirl },
      uIntensity: { value: p.intensity },
      uPointer: { value: new Vector3(0, 0, 0) },
      uWake: { value: this.wake },
      uBH: { value: new Vector2(0, 0.3) },
      uC0: { value: col(0) },
      uC1: { value: col(1) },
      uC2: { value: col(2) },
      uC3: { value: col(3) },
    }
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: portraitVertex,
      fragmentShader: portraitFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    this.points = new Points(geo, this.material)
    this.points.frustumCulled = false
    this.pivot = new Group()
    this.pivot.add(this.points)
    this.scene.add(this.pivot)
    this.resize(this.canvas.clientWidth, this.canvas.clientHeight)
    // compile now so the first visible frame doesn't hitch
    this.renderer.compile(this.scene, this.camera)
  }

  get worldH() {
    return 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360)
  }

  resize(w, h) {
    if (!this.renderer || !w || !h) return
    this.width = w
    this.height = h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const wh = this.worldH
    const ww = wh * this.camera.aspect
    const c = this.cfg.portrait
    let scale = c.height * wh
    // never let the portrait be wider than the viewport
    scale = Math.min(scale, (ww * 0.98) / this.aspect)
    this.scale = scale
    this.pivot.position.set((c.x - 0.5) * ww, (0.5 - c.bottom) * wh + scale * 0.5, 0)
    this.pivot.scale.setScalar(scale)
    // repel radius is configured in portrait heights == model units already
    this.needsRender = true
  }

  setConfig(cfg) {
    this.cfg = cfg
    if (this.renderer) this.resize(this.width, this.height)
  }

  setTier(tier) {
    this.tier = tier
    if (!this.renderer) return
    if (tier === 0) {
      // too slow even at the lowest tier: finish the intro and switch to static frames
      this.frozen = true
      this.uniforms.uIntro.value = 1
      this.uniforms.uIdle.value = 0
      this.needsRender = true
      return
    }
    this.geometry.setDrawRange(0, Math.min(this.maxCount, this.counts[Math.max(1, tier)]))
    this.renderer.setPixelRatio(dprForTier(tier))
    this.uniforms.uPR.value = this.renderer.getPixelRatio()
    this.resize(this.width, this.height)
  }

  /** css px (canvas local) → portrait model space */
  toModel(x, y, out) {
    const wh = this.worldH
    const ww = wh * this.camera.aspect
    const wx = (x / this.width - 0.5) * ww
    const wy = (0.5 - y / this.height) * wh
    out.set((wx - this.pivot.position.x) / this.scale, (wy - this.pivot.position.y) / this.scale, 0)
    return out
  }

  pointerMove(x, y, now) {
    if (this.reduced || !this.renderer) return
    const pt = this.pointer
    pt.inside = true
    pt.x = x
    pt.y = y
    pt.nx = (x / this.width) * 2 - 1
    pt.ny = (y / this.height) * 2 - 1
    const m = this.toModel(x, y, this.tmp)
    const dx = m.x - pt.lastX
    const dy = m.y - pt.lastY
    const dist = Math.hypot(dx, dy)
    if (dist > this.cfg.interaction.radius * 0.35 || now - pt.lastT > 90) {
      const speed = dist / Math.max(16, now - pt.lastT)
      const w = this.wake[this.wakeIndex]
      w.set(m.x, m.y, 0, Math.min(1, 0.35 + speed * 60))
      this.wakeIndex = (this.wakeIndex + 1) % WAKE_SIZE
      pt.lastX = m.x
      pt.lastY = m.y
      pt.lastT = now
    }
    this.uniforms.uPointer.value.x = m.x
    this.uniforms.uPointer.value.y = m.y
  }

  pointerLeave() {
    this.pointer.inside = false
  }

  /** p: 0 → hero at top, 1 → hero fully scrolled away */
  setScroll(p) {
    this.scroll = p
  }

  setBlackHole(x, y) {
    if (!this.renderer) return
    const m = this.toModel(x, y, this.tmp)
    this.uniforms.uBH.value.set(m.x, m.y)
  }

  update(dt) {
    if (!this.renderer || !this.active) return
    if (this.frozen) {
      if (!this.needsRender && this.scroll === this.lastScroll) return
      this.lastScroll = this.scroll
      this.uniforms.uDissolve.value = 0
      this.canvas.style.opacity = String(1 - Math.min(1, this.scroll * 1.6))
      this.renderer.render(this.scene, this.camera)
      stats.hero++
      this.needsRender = false
      return
    }
    const u = this.uniforms
    this.time += dt
    u.uTime.value = this.time

    if (!this.reduced) {
      if (this.introStart === null) this.introStart = this.time + this.cfg.intro.delay
      u.uIntro.value = Math.min(1, Math.max(0, (this.time - this.introStart) / this.cfg.intro.duration))
      const pt = this.pointer
      pt.strength += ((pt.inside ? 1 : 0) - pt.strength) * Math.min(1, dt * 6)
      u.uPointer.value.z = pt.strength
      for (let i = 0; i < WAKE_SIZE; i++) this.wake[i].z += dt
      const tilt = this.cfg.particles.tilt
      const tx = pt.inside ? pt.nx * tilt : 0
      const ty = pt.inside ? pt.ny * tilt * 0.6 : 0
      this.pivot.rotation.y += (tx - this.pivot.rotation.y) * Math.min(1, dt * 3)
      this.pivot.rotation.x += (ty - this.pivot.rotation.x) * Math.min(1, dt * 3)
    }
    const d = this.cfg.dissolve
    const target = d.enabled ? Math.min(1, this.scroll * d.speed) : 0
    u.uDissolve.value = this.reduced ? 0 : target
    this.canvas.style.opacity = this.reduced ? String(1 - Math.min(1, this.scroll * 1.6)) : ''

    this.renderer.render(this.scene, this.camera)
    stats.hero++
    this.needsRender = false
  }

  /** For reduced motion: render only when something changed. */
  renderOnce() {
    if (!this.renderer) return
    this.update(0)
  }

  dispose() {
    if (!this.renderer) return
    this.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer = null
  }
}
