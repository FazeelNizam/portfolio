/**
 * Device / capability detection. Everything here is cheap and synchronous so it
 * can run before first paint. Results are cached.
 */

let cache = null

const mq = (q) => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches

export function prefersReducedMotion() {
  return mq('(prefers-reduced-motion: reduce)')
}

export function isCoarsePointer() {
  return mq('(pointer: coarse)')
}

export function isSmallScreen() {
  return typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 640
}

function probeWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return { ok: false }
    let renderer = ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
    const info = { ok: true, webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext, renderer }
    const lose = gl.getExtension('WEBGL_lose_context')
    if (lose) lose.loseContext()
    return info
  } catch (e) {
    return { ok: false }
  }
}

/**
 * Quality tiers:
 *   0 = no WebGL / static fallback
 *   1 = low   (phones, software renderers, <=4 cores)
 *   2 = medium
 *   3 = high  (desktop GPU)
 * The adaptive QualityMonitor can only move *down* from the initial tier (plus at
 * most one step back up), so this is the ceiling.
 */
export function getDevice() {
  if (cache) return cache
  if (typeof window === 'undefined') return { tier: 0, webgl: false }
  const gl = probeWebGL()
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  const coarse = isCoarsePointer()
  const small = isSmallScreen()
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gl.renderer || '')
  const saveData = !!(navigator.connection && navigator.connection.saveData)

  let tier = 3
  if (!gl.ok) tier = 0
  else {
    if (coarse || small) tier = 2
    if (cores <= 4 || mem <= 4) tier = Math.min(tier, 2)
    if ((coarse && (cores <= 4 || mem <= 3)) || saveData) tier = 1
    // Software rasterisers (SwiftShader/llvmpipe: GPU blocklisted, VMs, remote
    // desktops) run every WebGL frame on the CPU and block the main thread, so
    // they get the static Canvas2D fallback instead of a stuttering animation.
    if (software) tier = 0
  }
  // manual override for testing: ?quality=0..3
  const q = new URLSearchParams(window.location.search).get('quality')
  if (q !== null && !Number.isNaN(+q)) tier = Math.max(0, Math.min(3, +q))
  if (q !== null && +q > 0 && !gl.ok) tier = 0

  cache = { tier, webgl: gl.ok, webgl2: !!gl.webgl2, renderer: gl.renderer, cores, mem, coarse, small, software }
  return cache
}

/** Cap device pixel ratio per tier – the single biggest GPU cost lever. */
export function dprForTier(tier) {
  const dpr = window.devicePixelRatio || 1
  if (tier >= 3) return Math.min(dpr, 1.75)
  if (tier === 2) return Math.min(dpr, 1.35)
  return Math.min(dpr, 1)
}
