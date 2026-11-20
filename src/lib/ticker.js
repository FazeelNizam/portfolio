/**
 * One animation loop for the whole site.
 *
 * Lenis, the WebGL renderers, scroll-linked CSS variables and the adaptive-quality
 * monitor all hang off a single requestAnimationFrame. (This used to be
 * gsap.ticker; nothing else needed GSAP, so dropping it removed ~45 KB gzip from
 * the initial bundle.) Browsers already pause rAF in hidden tabs; we also skip
 * work while `document.hidden` and clamp the first delta after returning.
 */
import { getDevice } from './device'

const subs = new Set()
let started = false
let hidden = typeof document !== 'undefined' ? document.hidden : false

let last = 0

function tick(now) {
  requestAnimationFrame(tick)
  const deltaMs = last ? now - last : 16.7
  last = now
  if (hidden) return
  const dt = Math.min(deltaMs, 100) / 1000 // clamp: a stalled frame must not explode simulations
  subs.forEach((fn) => fn(now, dt))
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  requestAnimationFrame(tick)
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden
    last = 0
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
const FLOOR_FPS_MS = 1000 / 22 // still below ~22fps at the lowest tier => freeze (static frames)
const HIGH_FPS_MS = 1000 / 57 // sustained ~60fps => allowed one step back up

const listeners = new Set()

export const quality = {
  ceiling: 0,
  tier: 0,
  ema: 16.7,
  slowMs: 0,
  fastMs: 0,
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
    this.slowMs = 0
    this.fastMs = 0
  },
  _sample(ms) {
    // nothing to judge, already frozen, or a hitch from tab switching / GC
    if (!this.active || this.tier === 0 || ms > 250) return
    this.ema += (ms - this.ema) * 0.08
    // time-based (not frame-based) so a 10fps device reacts as fast as a 40fps one
    const limit = this.tier > 1 ? LOW_FPS_MS : FLOOR_FPS_MS
    if (this.ema > limit) this.slowMs += ms
    else this.slowMs = Math.max(0, this.slowMs - ms * 2)
    if (this.tier > 1 && this.slowMs > 1500) this.set(this.tier - 1, 'low fps')
    else if (this.tier === 1 && this.slowMs > 2500) this.set(0, 'very low fps: static frames')
    else this._maybeUpgrade(ms)
  },
  _maybeUpgrade(ms) {
    if (this.upgrades >= 1 || this.tier >= this.ceiling) return
    if (this.ema < HIGH_FPS_MS) this.fastMs += ms
    else this.fastMs = 0
    if (this.fastMs > 8000) {
      this.upgrades++
      this.set(this.tier + 1, 'headroom')
    }
  },
  set(tier, reason) {
    tier = Math.max(0, Math.min(this.ceiling, tier))
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

/** Frame counters per WebGL layer (read by the e2e checks: pause off-screen / hidden tab). */
export const stats = { bg: 0, hero: 0, projects: 0 }

if (typeof window !== 'undefined') {
  window.__quality = quality
  window.__frames = stats
}
