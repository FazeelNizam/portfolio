/**
 * One animation loop for the whole site.
 *
 * Lenis, ScrollTrigger, the WebGL renderers and the adaptive-quality monitor all
 * hang off gsap.ticker (a single requestAnimationFrame). Browsers already stop rAF
 * in hidden tabs; subscribers additionally get `hidden` so they can skip work and
 * reset their clocks when the tab comes back.
 */
import gsap from 'gsap'
import { getDevice } from './device'

const subs = new Set()
let started = false
let hidden = typeof document !== 'undefined' ? document.hidden : false

function tick(time, deltaMs) {
  if (hidden) return
  const dt = Math.min(deltaMs, 100) / 1000 // clamp: a stalled frame must not explode simulations
  subs.forEach((fn) => fn(time, dt))
}

function start() {
  if (started) return
  started = true
  gsap.ticker.add(tick)
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden
    quality._reset()
  })
}

/** Subscribe to the frame loop. Returns an unsubscribe function. */
export function onFrame(fn) {
  start()
  subs.add(fn)
  return () => subs.delete(fn)
}

export const isHidden = () => hidden

/* ------------------------------------------------------------------ */
/* Adaptive quality                                                    */
/* ------------------------------------------------------------------ */

const LOW_FPS_MS = 1000 / 42 // sustained frames slower than ~42fps => step down
const HIGH_FPS_MS = 1000 / 57 // sustained ~60fps => allowed one step back up

const listeners = new Set()

export const quality = {
  ceiling: 0,
  tier: 0,
  ema: 16.7,
  slowFrames: 0,
  fastFrames: 0,
  upgrades: 0,
  active: 0, // number of WebGL layers currently rendering; we only judge while something renders
  history: [],
  init() {
    if (this.ceiling) return
    const d = getDevice()
    this.ceiling = d.tier
    this.tier = d.tier
    onFrame((t, dt) => this._sample(dt * 1000))
  },
  _reset() {
    this.ema = 16.7
    this.slowFrames = 0
    this.fastFrames = 0
  },
  _sample(ms) {
    // nothing to judge, or a hitch from tab switching / GC
    if (!this.active || ms > 250) return
    this.ema += (ms - this.ema) * 0.08
    if (this.ema > LOW_FPS_MS) this.slowFrames++
    else this.slowFrames = Math.max(0, this.slowFrames - 2)
    if (this.tier > 1 && this.slowFrames > 90) this.set(this.tier - 1, 'low fps')
    else this._maybeUpgrade()
  },
  _maybeUpgrade() {
    if (this.upgrades >= 1 || this.tier >= this.ceiling) return
    if (this.ema < HIGH_FPS_MS) this.fastFrames++
    else this.fastFrames = 0
    if (this.fastFrames > 600) {
      this.upgrades++
      this.set(this.tier + 1, 'headroom')
    }
  },
  set(tier, reason) {
    tier = Math.max(1, Math.min(this.ceiling, tier))
    if (tier === this.tier) return
    this.tier = tier
    this._reset()
    this.history.push({ tier, reason, t: Math.round(performance.now()) })
    listeners.forEach((fn) => fn(tier))
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

if (typeof window !== 'undefined') window.__quality = quality
