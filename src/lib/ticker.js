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
