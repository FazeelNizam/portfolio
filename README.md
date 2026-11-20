# My New Portfolio Web Site

Visit - [Fazeel Nizam](https://fazeelnizam.github.io/portfolio/)

A space-themed, mobile-first portfolio built with React (Create React App), Three.js
and SCSS, deployed to GitHub Pages as a static build.

```bash
npm install
npm start          # dev server
npm run build      # production build (served from /portfolio/)
npm run deploy     # build + publish to GitHub Pages (gh-pages)
npm run images     # regenerate optimised images + manifest (see below)
```

## How it fits together

| Piece | Where | Notes |
| --- | --- | --- |
| Space background (nebula, black hole, stars, medusae) | `src/three/SpaceBackground.js`, `src/components/Space/` | One fixed WebGL canvas shared by the whole page. |
| Particle-portrait hero | `src/three/HeroParticles.js`, `src/three/shaders/portrait.js`, `src/components/Banner/` | GPU particles; all motion computed in the vertex shader. |
| Hero settings | **`src/config/hero.config.js`** | The one file to tweak the hero (documented below). |
| Projects WebGL carousel | `src/three/ProjectCarouselGL.js`, `src/components/Projects/ProjectShowcase.jsx` | Drawn inside the shared background renderer (scissored view). |
| Design gallery | `src/components/Projects/DesignGallery.jsx`, `Lightbox.jsx` | Uses the build-time image manifest. |
| Experience / Education | `src/components/Timeline/TimelineCarousel.jsx` | Scroll-snap coverflow (drag, wheel, swipe, keyboard). |
| Frame loop + adaptive quality | `src/lib/ticker.js`, `src/lib/device.js` | One rAF loop; quality tiers drop automatically on low FPS. |
| Optimised images | `scripts/optimize-images.mjs` → `public/media/`, `src/data/media-manifest.json` | WebP/AVIF variants, sizes, blurred placeholders. |

### Quality tiers

The site picks a tier from the device, then lowers it if the measured frame rate stays
below ~42 fps (and may step back up once if there's headroom):

| Tier | Who | What changes |
| --- | --- | --- |
| 3 high | desktop GPUs | ~120k hero particles, DPR ≤ 1.75, full star/medusae counts |
| 2 medium | phones/tablets, ≤4-core laptops | ~60k particles, DPR ≤ 1.35 |
| 1 low | low-end phones, after FPS drops | ~22k particles, DPR 1, background at 30 fps, 2D project cards |
| 0 static | no WebGL, software GL (SwiftShader/llvmpipe) | Canvas2D dotted portrait + static stars, no three.js download |

`prefers-reduced-motion` renders static frames only (no idle motion, no smooth scroll,
2D project cards). For testing you can force a tier with `?quality=0..3`.

## Hero configuration

Everything about the hero lives in [`src/config/hero.config.js`](src/config/hero.config.js).
Values under `mobile` (≤ 640 px) and `tablet` (641–1023 px) are merged over the base
values, so only list what should differ.

### `portrait`
| Option | Default | Meaning |
| --- | --- | --- |
| `image` | `media/hero/portrait-particles.webp` | Image (in `/public`) the particles are sampled from. Transparent background; brightness → density, size and depth. |
| `alt` | … | Accessible description of the portrait canvas. |
| `height` | `0.84` | Portrait height as a fraction of the hero height. |
| `x` | `0.5` | Horizontal centre (0 = left, 1 = right). |
| `bottom` | `1.0` | Where the portrait's bottom edge sits (1 = bottom of the hero). |

### `particles`
| Option | Default | Meaning |
| --- | --- | --- |
| `count` | `{ low: 22000, medium: 60000, high: 120000 }` | Particles per quality tier. |
| `size` | `2.1` | Base point size in CSS px (scaled per particle by brightness). |
| `depth` | `0.18` | How far bright pixels are pushed toward the camera. |
| `colors` | `['#3a0a6b', '#9200fa', '#c385f0', '#f4ecff']` | Palette from dark to light, mapped by brightness. |
| `intensity` | `1.5` | Overall glow (additive blending). |
| `idleMotion` | `1.0` | Idle drift/breathing amount (0 = still). |
| `tilt` | `0.12` | Max tilt (radians) toward the cursor. |

### `interaction`
| Option | Default | Meaning |
| --- | --- | --- |
| `radius` | `0.13` | Cursor/touch repel radius, in portrait heights. |
| `strength` | `0.85` | How far particles get pushed. |
| `damping` | `2.8` | Spring-back speed (higher settles faster). |
| `springiness` | `7.0` | Wobble frequency of the spring-back. |

### `intro` / `dissolve`
| Option | Default | Meaning |
| --- | --- | --- |
| `intro.duration` | `2.6` | Seconds for the scatter-to-form intro. |
| `intro.delay` | `0.15` | Delay before it starts. |
| `intro.scatter` | `2.2` | Radius of the starting cloud (portrait heights). |
| `dissolve.enabled` | `true` | Scroll-linked exit into the black hole. |
| `dissolve.speed` | `1.15` | 1 = fully dissolved when the hero has scrolled away. |
| `dissolve.swirl` | `5.0` | How much particles spiral on the way in. |

### `name`
| Option | Default | Meaning |
| --- | --- | --- |
| `words` | `['Fazeel', 'Nizam']` | The big headline, one entry per word (words stack on phones). |
| `kicker` | `"Hey, I'm"` | Small line above the name. |
| `roles`, `roleInterval` | … , `2.8` | Rotating role line and seconds per role. |
| `font` | `'Gugi', …` | CSS font-family (load new fonts in `public/index.html`). |
| `size` | `clamp(3.2rem, 11vw, 12.5rem)` | CSS font-size. |
| `y` | `0.47` | Vertical centre of the name (0–1 of hero height). |
| `layer` | `'behind'` | `'behind'`: portrait overlaps the name. `'front'`: name sits over the portrait. |
| `style` | `'outline-fill'` | `'outline'`, `'fill'`, or `'outline-fill'` (outlined first word, filled second). |
| `animation` | `'rise'` | Per-letter reveal: `'rise'` (mask wipe), `'blur'` (focus pull), `'wave'`. |
| `speed` | `1` | Animation speed multiplier. |
| `scrollParallax` | `140` | Per-letter parallax drift (px) while scrolling out. |

### `blackHole`
| Option | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Show the black hole. |
| `x`, `y` | `0.76`, `0.3` | Centre, relative to the first viewport. |
| `size` | `0.11` | Event-horizon radius as a fraction of `min(viewport width, height)`. |
| `intensity` | `0.9` | Brightness of the disk, lensing ring and glow. |
| `tilt` | `0.22` | Disk tilt (0 = edge-on, 1 = face-on). |
| `spin` | `0.35` | Disk rotation speed. |
| `parallax` | `0.45` | Fraction of scroll speed it moves at; it fades out after the hero. |

### Swapping the portrait image

1. Replace `src/img/dp.png` with your photo (square works best). The pipeline expects a
   flat, saturated background (like the current purple) with an optional white sticker
   outline; both get keyed out automatically.
2. Run `npm run images`. It regenerates `public/media/hero/portrait-particles.{png,webp}`
   (cut-out, grayscale, contrast-normalised) plus the About-card avatar. Your original
   file is never modified.
3. Rebuild. Tweak `particles.intensity`, `depth` and `colors` to taste.

If your photo already has a transparent background, you can skip the pipeline: drop a
PNG/WebP with alpha into `public/media/hero/` and point `portrait.image` at it.

## Images

`npm run images` reads the images imported by `src/data/*Projects.js` and writes
AVIF + WebP variants (gallery: 480/960/1600 px; projects: 640/1280 px) and
`src/data/media-manifest.json` (size, aspect ratio and a ~100-byte blurred LQIP per image).
Components look images up by their original file name, so to add a project or design you
only add the import + entry in the data file as before and then run `npm run images`.
Generated files are committed, so deploying doesn't need `sharp`.
