/**
 * Smooth scrolling (Lenis) driven by the site's single rAF loop (lib/ticker).
 *
 * - Disabled for reduced-motion users and on touch devices (native momentum
 *   scrolling is better there and avoids input latency).
 * - The previous implementation drove Lenis from BOTH its own rAF loop and the
 *   gsap ticker, which advanced it twice per frame (jittery scroll). Fixed here.
 */
import Lenis from 'lenis'
import { prefersReducedMotion, isCoarsePointer } from './device'
import { onFrame } from './ticker'

let lenis = null
let stop = null

export function initSmoothScroll() {
  if (lenis || prefersReducedMotion() || isCoarsePointer()) return null
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  })
  stop = onFrame((time) => lenis.raf(time))
  return lenis
}

export function destroySmoothScroll() {
  if (!lenis) return
  stop()
  lenis.destroy()
  lenis = null
}

export const getLenis = () => lenis

/** Scroll to a selector / element / y-position, honoring reduced motion. */
export function scrollToTarget(target, { offset = 0, immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (lenis) {
    lenis.scrollTo(el ?? target, { offset, immediate, duration: 1.2 })
    return
  }
  const behavior = immediate || prefersReducedMotion() ? 'auto' : 'smooth'
  if (typeof target === 'number') window.scrollTo({ top: target, behavior })
  else if (el) el.scrollIntoView({ behavior, block: 'start' })
}

/** Stop/start page scrolling (used by modals and the mobile menu). */
export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start()
  document.documentElement.classList.toggle('scroll-locked', locked)
}
