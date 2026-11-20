/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HERO CONFIG — the one file to edit to tweak the hero.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything the hero does (particle portrait, kinetic name, black hole) reads
 *  from this object. Values are plain numbers/strings so you can change them
 *  without touching any shader or component code. Every option is documented in
 *  README.md → "Hero configuration".
 *
 *  Coordinates: x/y values marked "relative" are fractions of the hero box
 *  (0 = left/top, 1 = right/bottom). Sizes marked "of hero height" are fractions
 *  of the hero's height.
 *
 *  `mobile` (≤ 640px wide) and `tablet` (641–1023px) are deep-merged on top of
 *  the base values — only list what you want to change there.
 *
 *  @typedef {'behind'|'front'} NameLayer
 *  @typedef {'outline'|'fill'|'outline-fill'} NameStyle
 *  @typedef {'rise'|'blur'|'wave'} NameAnimation
 */

const heroConfig = {
  portrait: {
    /** Image the particles are sampled from. Lives in /public so it is not bundled.
     *  Use a cut-out (transparent background) PNG; brightness drives particle
     *  density/size/depth. Rebuild with `npm run images` after replacing src/img/dp.png,
     *  or point this at any other transparent PNG in /public. */
    image: 'media/hero/portrait-particles.png',
    /** Alt text / accessible description of the portrait. */
    alt: 'Portrait of Fazeel Nizam drawn with glowing particles',
    /** Portrait height as a fraction of hero height. */
    height: 0.84,
    /** Horizontal centre of the portrait (relative). */
    x: 0.5,
    /** Where the bottom edge of the portrait sits (relative). 1 = flush with the bottom. */
    bottom: 1.0,
  },

  particles: {
    /** Particle count per quality tier. The tier is picked from the device and
     *  then lowered automatically if the measured frame rate drops. */
    count: { low: 22000, medium: 60000, high: 120000 },
    /** Base point size in CSS pixels (scaled per particle by brightness). */
    size: 2.1,
    /** How much image brightness pushes particles toward the camera (0 = flat). */
    depth: 0.18,
    /** Palette, dark → light. Particles are coloured by the portrait's brightness. */
    colors: ['#3a0a6b', '#9200fa', '#c385f0', '#f4ecff'],
    /** Global brightness multiplier (additive glow). */
    intensity: 1.5,
    /** Gentle idle "breathing"/drift amount (0 = perfectly still). */
    idleMotion: 1.0,
    /** Max tilt (radians) toward the cursor for a sense of depth. */
    tilt: 0.12,
  },

  interaction: {
    /** Cursor / touch repel radius as a fraction of the portrait height. */
    radius: 0.13,
    /** Repel strength (how far particles get pushed, roughly in radii). */
    strength: 0.85,
    /** Spring-back: higher = settles faster. */
    damping: 2.8,
    /** Spring-back wobble frequency. */
    springiness: 7.0,
  },

  intro: {
    /** Seconds for the scatter-to-form intro. */
    duration: 2.6,
    /** Delay before the intro starts (s). */
    delay: 0.15,
    /** Starting cloud radius, in portrait heights. */
    scatter: 2.2,
  },

  /** Scroll-linked exit: particles swirl into the black hole as you scroll past
   *  the hero. 1 = dissolve fully by the time the hero has scrolled away. */
  dissolve: { enabled: true, speed: 1.15, swirl: 5.0 },

  name: {
    /** The big kinetic headline. Each entry is one word (wraps on small screens). */
    words: ['Fazeel', 'Nizam'],
    /** Small line above the name. */
    kicker: "Hey, I'm",
    /** Rotating roles under the name. */
    roles: ['Computer Engineer', 'Embedded Systems Engineer', 'Software Engineer', 'Full-stack Developer', 'AI Engineer', 'Graphic Designer'],
    /** Seconds each role stays visible. */
    roleInterval: 2.8,
    /** CSS font-family of the name (must be loaded in public/index.html). */
    font: "'Gugi', 'Space Grotesk', system-ui, sans-serif",
    /** CSS font-size; clamp() keeps it fluid. */
    size: 'clamp(3.2rem, 11vw, 12.5rem)',
    /** Vertical centre of the name (relative). */
    y: 0.47,
    /** 'behind' → the portrait overlaps the name; 'front' → name over the portrait. */
    layer: 'behind',
    /** 'outline' | 'fill' | 'outline-fill' (outlined first word, filled second). */
    style: 'outline-fill',
    /** Letter reveal: 'rise' (mask wipe) | 'blur' (focus pull) | 'wave'. */
    animation: 'rise',
    /** Animation speed multiplier (2 = twice as fast). */
    speed: 1,
    /** Letter-by-letter parallax drift while scrolling (px at full scroll). */
    scrollParallax: 140,
  },

  blackHole: {
    enabled: true,
    /** Centre (relative to the hero / first viewport). */
    x: 0.76,
    y: 0.3,
    /** Event-horizon radius as a fraction of min(viewport width, height). */
    size: 0.11,
    /** Overall brightness of the accretion disk & lensing ring. */
    intensity: 0.9,
    /** Disk tilt: 0 = edge-on, 1 = face-on. */
    tilt: 0.22,
    /** Disk rotation speed. */
    spin: 0.35,
    /** Moves at this fraction of scroll speed (parallax); fades after the hero. */
    parallax: 0.45,
  },

  /** Overrides for ≤ 640px (merged over the values above). */
  mobile: {
    portrait: { height: 0.6, bottom: 0.79 },
    particles: { size: 1.8, tilt: 0.06 },
    interaction: { radius: 0.17 },
    name: { y: 0.3, size: 'clamp(3rem, 21vw, 7.5rem)', scrollParallax: 70 },
    blackHole: { x: 0.5, y: 0.12, size: 0.13 },
  },

  /** Overrides for 641–1023px. */
  tablet: {
    portrait: { height: 0.72, bottom: 0.92 },
    name: { y: 0.42 },
    blackHole: { x: 0.78, y: 0.2, size: 0.12 },
  },
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
function merge(a, b) {
  const out = { ...a }
  for (const k in b) out[k] = isObj(a[k]) && isObj(b[k]) ? merge(a[k], b[k]) : b[k]
  return out
}

/** Resolve the config for a given viewport width (mobile/tablet overrides applied). */
export function resolveHeroConfig(width = typeof window !== 'undefined' ? window.innerWidth : 1440) {
  const { mobile, tablet, ...base } = heroConfig
  if (width <= 640) return merge(base, mobile)
  if (width < 1024) return merge(base, tablet)
  return base
}

export default heroConfig
