# Portfolio audit — space redesign

Branch: `feat/space-redesign`. Audited the live site (https://fazeelnizam.github.io/portfolio/,
built from `main`) at 360, 390, 768, 1024, 1440 and 1920 px with Playwright/Chromium, then
re-checked every item on the redesigned build. Guidance applied: ui-ux-pro-max (priority
rules 1–9), web-animation-skills (60fps-animation, accessible-animation, glassmorphism,
gsap-web), webgl-animation-skills (particle-system, threejs-animation, shader-glsl) and
kinetic-typography.

Screenshots: `docs/screenshots/` (`before-*` = live site, `after-*` = this branch).

---

## 1. Stack & tooling (unchanged, by choice)

Create React App 5 + React 18, SCSS + Tailwind, three.js, deployed with `gh-pages` to
`/portfolio/` (`homepage` in `package.json`). The stack works for a static GitHub Pages
build, so I kept it. Changes are all inside it:

- **GSAP removed from the runtime** (it only drove a ticker by the end) → one tiny rAF loop
  (`src/lib/ticker.js`). Lenis is kept, but it was being advanced twice per frame (its own
  rAF *and* the GSAP ticker), which made wheel scrolling jittery.
- **React Three Fiber no longer loaded**: the Medusae effect now runs inside the shared
  background renderer, and three.js is code-split and loaded on idle.
- Below-the-fold sections, the gallery, the icon cloud and every three.js module are
  separate chunks.
- Build is warning-free (`npm run build` → "Compiled successfully").

## 2. Issues found on the live site

### Layout / responsiveness
| # | Breakpoint | Issue | Fix |
| --- | --- | --- | --- |
| L1 | all | 2 s fake loading spinner before *anything* renders (LCP 8.0 s on mobile). | Removed; the hero paints immediately and animates in. |
| L2 | 1024–1440 | Hero name clipped by the foreground parallax layer ("·zeel Nizam"). | Parallax replaced. The name is a layered element with configurable z-order. |
| L3 | 360–768 | Parallax layers are 200–260 % wide (`frontLayer -317…619px`) and floating images overflow. Hidden only by `body{overflow-x:hidden}`. | Replaced. 0 overflowing elements at every width (checked programmatically). |
| L4 | 360–390 | Project titles overflow their column (`project-text 24…550px` on a 360 px screen); long titles are cut off. | New card/info layouts with wrapping, clamping and `min-width:0`. |
| L5 | all | Experience/Education: GSAP-pinned "scrolling cards" never appear on desktop (headings only), and on mobile they stack rotated on top of each other. Pin spacing also broke when sections above changed height. | Replaced with a scroll-snap coverflow timeline (see §5). |
| L6 | all | Hero uses `100vh`. On mobile the URL bar hides content. | `100svh` (hero), `100lvh` (fixed canvas), safe-area insets for the nav, sheets and dialogs. |
| L7 | 360 | Three counter cards squeezed in one row ("100+" touching the edges). | One stats card with three columns and fluid type; the grid collapses to one column. |
| L8 | all | Design gallery shows a spinner until **all 28 full-size PNGs (~20 MB)** have downloaded, then shifts the layout. | Ratios come from a build-time manifest: instant layout, LQIP placeholders, lazy AVIF/WebP. |

### Bugs
| # | Issue | Fix |
| --- | --- | --- |
| B1 | **About cards render white on light-mode systems.** `MagicCard` uses `bg-white dark:bg-transparent` and Tailwind's `dark:` follows the OS setting, so the cards are white with white text. Headless Chrome (light) shows it; so would any visitor whose OS is in light mode. | New card surface, `color-scheme: dark` declared. |
| B2 | `Uncaught TypeError: Cannot read properties of undefined (reading 'hex')` on every load. `react-icon-cloud` looks up slugs that no longer exist in simple-icons (`adobephotoshop`, `autocad`, …), and its JSON index on raw.githubusercontent.com now 404s. That's 37 third-party requests and 1 console 404 per visit. | The cloud renders the logos already bundled with the site: no requests, no errors. |
| B3 | `MagicContainer` stores the global mouse position in React state, re-rendering the whole bento and calling `getBoundingClientRect()` on every card for every `mousemove` (layout thrash). | Per-card pointer handling that writes CSS variables in one rAF. Only the hovered card is touched. |
| B4 | Starfield made of 2 × 3 000 `box-shadow` stars (SCSS-generated), rotating forever in two places → huge CSS and constant repaints. | GPU starfield in the shared canvas. |
| B5 | Medusae (R3F) runs a full-viewport canvas behind Experience/Education at all times, even off-screen. | Same shader in the shared renderer. It fades in only where those sections are visible, at 55 % opacity. |
| B6 | Missing `key`s in mapped lists (Footer, About), `class=` + `className` on the nav. | Fixed. |
| B7 | `FlipWords` & co. use `filter: blur` keyframes per letter in the hero (paint-heavy). | Hero uses transform-only letter reveals. FlipWords remains only in the About card. |

### Accessibility
| # | Issue | Fix |
| --- | --- | --- |
| A1 | Nav links are icon-only on mobile with no accessible name, no `aria-current`, no skip link. | Labelled links with `aria-current="location"`, skip link, `<header>`/`<nav>`/`<main>` landmarks. |
| A2 | Touch targets: 15–22 interactive elements under 44 px per breakpoint (footer icons 42 px, dock icons 40 px, small pills). | All buttons/links ≥ 44 px (48 px for primary). |
| A3 | No visible focus styles; modals have no focus trap or Esc handling and don't restore focus. | Global `:focus-visible` ring; shared `Dialog` (portal, focus trap, Esc, scroll lock, focus return); mobile menu has a focus trap and is `inert` when closed. |
| A4 | Display font (Gugi) used for all body copy → poor legibility at small sizes. | Gugi kept for display type (identity); body in Space Grotesk; fluid `clamp()` type scale. |
| A5 | Per-character split text (typewriter titles, flip words) without accessible labels. | Split text is `aria-hidden` with an `sr-only` full string. |
| A6 | Carousels and the projects list are mouse-only. | Keyboard (←/→/Home/End/Enter), visible controls, and an `sr-only` list of all projects in WebGL mode. |
| A7 | No `prefers-reduced-motion` handling (parallax, scrubbed fly-ins, rotating stars). | Tiered: static WebGL frames, no smooth scroll, no idle motion, 2D project cards, instant transitions. |

Lighthouse accessibility went **84 → 100**.

## 3. UI/UX audit (ui-ux-pro-max checklist)

| Area | Before | After |
| --- | --- | --- |
| **Spacing** | Ad-hoc: `gap: 1vw`, `p-2`, many one-off margins and `nth-child` overrides (1 500 lines of About SCSS). | 4 px token scale (`--s-1…--s-8`), one `--bento-gap`, `--gutter`, `--section-y`. |
| **Type scale** | 10+ unrelated sizes (6xl counters, 3xl names, 0.9 rem pills…), display font for body. | Fluid steps `--step--1…--step-4` via `clamp()`; 1.6 body line height; balanced headings. |
| **Contrast** | `#ffffffcb` on near-transparent cards; white-on-white in light mode (B1). | Text tokens ≥ 4.5:1 (`--ink-faint`) / ≥ 7:1 (`--ink-dim`) on `--bg`; cards have an opaque-enough surface plus a `@supports` fallback without backdrop-filter. |
| **Touch targets** | See A2. | ≥ 44 px everywhere. 8 px+ spacing between targets. |
| **Focus states** | Browser default or removed. | 2 px `--focus` ring with offset on every interactive element. |
| **Hierarchy** | Sections had inconsistent headers (About had none). | Shared `section-head` (eyebrow → display title → lead) on every section. |
| **Consistency** | Each section had its own card style, border, radius and shine effect. | One card language (gradient surface, `--line` border, 26 px radius, purple rim) shared by About, Projects, Timeline and dialogs. |
| **Motion** | Many simultaneous loops (spotlights, two marquees, icon cloud, shine borders, stars). Long scrubbed entrances (random ±300 px, rotation). | Short eased reveals (≤ 700 ms, 60 ms stagger). Decorative loops are lazy and pause off-screen. |
| **Navigation** | Icon pill that expands on hover; bottom bar on mobile overlapping content; no active-state logic beyond ScrollTrigger. | Floating glass pill with a sliding indicator, scroll-spy (cached offsets, no layout reads per frame), hide-on-scroll-down / show-on-up, full-screen mobile sheet. |

## 4. About section: what felt "off"

The bento grid was close; these were the issues, in order of impact:

1. **No focal point.** The biggest text in the section was the three counters
   ("100+ hours of coding") in 6xl type, top-left, which is the first place the eye lands.
   The profile card, the thing the section is actually about, was lower and visually
   quieter. *Fix:* the profile is the largest tile (7/12 columns, first in reading order),
   with the name in the display font. The three counters merge into one compact stats strip below it.
2. **Rows forced into `100vh`.** The grid was a 12 × 9 template locked to the viewport height,
   so content was squeezed on laptops and spilled on tall phones (the tech-stack card
   clipped its icon cloud; card text was cut off). *Fix:* content-sized rows; the grid only
   defines columns and areas.
3. **Inconsistent rhythm.** Gaps scaled with viewport *width* (`1vw`: ≈ 4 px on phones,
   19 px on 1920), and paddings varied per card through `nth-child` rules. *Fix:* one
   `--bento-gap`, one card padding, one radius.
4. **Weak surfaces.** Cards were `#0c001546` with a 10 % white border: almost invisible on
   the dark page, and white on light-mode systems (B1). *Fix:* a defined gradient surface
   with a rim light that follows the cursor.
5. **Too much competing motion.** Icon cloud, two vertical marquees, two animated
   spotlights, shimmering gradient text and a chaotic scrubbed entrance (each tile flew in
   from a random ±300 px with rotation) all ran at once. *Fix:* entrances are a calm
   staggered rise; the icon cloud mounts only near the viewport (and is hidden on phones);
   spotlights are gone; the tilt is subtle (±3°) and only on fine pointers.
6. **Duplicated content.** Social links appeared three times in the section (profile
   card, Follow-me card, CTA card) and again in the footer. *Fix:* the profile card keeps
   résumé + WhatsApp/Messenger, Follow-me keeps socials, and the CTA card is just "Email me".
7. **Typography mismatch with the new hero.** The Gugi display face was used for 12 px labels.
   *Fix:* display face for names/numbers/headings only, Space Grotesk for everything else.

## 5. What was built (summary)

- **Shared space background** (`SpaceBackground.js`): one fixed canvas. Nebula (2–3 octave
  value noise) and an analytic black hole (accretion disk with Doppler beaming, lensed far-side
  arc, photon ring, nebula lensing) render in a single fullscreen triangle. Stars are lensed
  around the hole in the vertex shader. Medusae is a faded layer, and section views are scissored.
- **Particle-portrait hero**: importance-sampled from the cut-out portrait (bright → dense),
  random order so lower tiers just draw a prefix. Intro, idle flow, cursor/touch repel with
  a springy wake (`e^(-k·t)·cos(ω·t)` impulses), luminance depth, and a scroll dissolve
  that spirals into the black hole all run in one vertex shader. No per-frame CPU loop over particles.
  Studied gather.be-of-dao.com first (its single 512² point draw, texture-driven
  positions, stateless flight maths and pointer wake); this implementation and its shaders are
  my own.
- **Kinetic name**: per-letter mask reveal (or blur/wave), outline + gradient fill, and
  per-letter scroll parallax via one CSS variable. Behind/front layering is configurable.
- **Projects**: curved WebGL gallery (velocity bend, RGB split, rounded SDF corners, hover
  zoom), drawn in the shared renderer; DOM info panel with real links; drag, click,
  horizontal wheel, keyboard; 2D scroll-snap cards on phones/low tiers/reduced motion.
- **Gallery**: same arrangement algorithm (ratio classes + Fisher–Yates + dense grid) with
  instant layout, FLIP filter transitions (≈ 420 ms + ≤ 160 ms stagger), shared-element
  lightbox, ←/→/Esc, swipe.
- **Experience/Education**: native scroll-snap coverflow (touch/trackpad for free), mouse
  drag, wheel-with-intent (never traps page scroll), keyboard, year rail.
- **Nav**: glass pill + sliding indicator, scroll-spy, hide/show on scroll, mobile sheet with
  focus trap.

## 6. Performance

All numbers come from Lighthouse 12 (simulated throttling), run in this sandbox against the
production build served under `/portfolio/`. "Before" is the live site.

| | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Before — mobile** | 34 | 84 | 96 | 100 | 3.0 s | 8.0 s | 3 100 ms | 0 | 6 481 KiB |
| **After — mobile** | 98 | 100 | 100 | 100 | 1.2 s | 2.4 s | 60 ms | 0.006 | 348 KiB |
| **Before — desktop** | 81 | 84 | 96 | 100 | 1.4 s | 1.9 s | 70 ms | 0 | 6 482 KiB |
| **After — desktop** | 100 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0.005 | 639 KiB |

**Important caveat:** headless Lighthouse renders WebGL with SwiftShader (a CPU
rasteriser). The site deliberately treats software GL as tier 0 (static Canvas2D
fallback), because every WebGL frame on a software rasteriser blocks the main thread. So
the table above measures the *fallback* path. With the WebGL path forced (`?quality=…`) under
the same software renderer:

| Forced tier | Mobile perf | Mobile TBT | Desktop perf | Desktop TBT |
| --- | --- | --- | --- | --- |
| `?quality=1` (22k particles) | 68 | 2 980 ms | 60 | 8 390 ms |
| `?quality=3` (120k particles) | 58 | 41 s | 60 | 12 s |

These numbers are CPU rasterisation cost: SwiftShader draws every pixel of every WebGL frame on the
main machine's CPU. They are the reason software GL gets the static tier.

On real GPUs the per-frame cost is a few milliseconds. The frame-rate measurements below
cover that path.

### Frame rate & adaptive quality

Playwright + CDP `Emulation.setCPUThrottlingRate`, SwiftShader WebGL (so these are
worst-case numbers; GPU work runs on the CPU too). FPS is sampled for 3 s, right after load and
again 9 s later.

| Scenario | FPS after load | FPS ~12 s later | Worst frame | Tier steps |
| --- | --- | --- | --- | --- |
| Desktop 1440, no throttle, start tier 3 | 22 | 24 | 100 ms | 3 → 2 @2.2 s → 1 @3.8 s |
| Desktop 1440, **4× CPU**, start tier 3 | 7 | **60** | 33 ms | 3 → 2 @3.9 s → 1 @6.3 s → 0 (static) @9.7 s |
| Desktop 1440, **6× CPU**, start tier 3 | 7 | **58** | 67 ms | 3 → 2 @4.8 s → 1 @7.3 s → 0 (static) @11.0 s |
| Mobile 390, **4× CPU**, start tier 2 | 33 | 35 | 67 ms | 2 → 1 @3.0 s |
| Static fallback (tier 0), **6× CPU** | 32 | 42 | 67 ms | — |

Adaptive quality is time-based: about 1.5 s below ~42 fps steps down one tier. At the
lowest tier, 2.5 s below ~22 fps switches to static frames (rendered only on
scroll/resize), with no reload or flash. Every quality change only shrinks draw ranges or
pixel ratio; nothing is re-uploaded.

### Verified behaviour (Playwright, `/tmp`-only e2e script, 26/26 passing)

- The hero stops rendering when scrolled off-screen (frame counter unchanged); the projects
  carousel renders only while visible.
- Hidden tab (Page Visibility API): background, hero and carousel frame counters freeze, and
  resume when the tab is visible again.
- Carousel: ← / → / Enter, mouse drag, details dialog with focus trap, Esc closes and returns focus.
- Gallery: 28 items laid out in ~40 ms with no image preload; AVIF/WebP variants served;
  filter + FLIP; lightbox ←/→/Esc.
- Timeline: keyboard and year-rail navigation; nav scroll-spy follows sections.
- Mobile menu opens, traps focus, closes on Esc, and its links land on the section.
- `prefers-reduced-motion`: no continuous rendering, 2D project cards.
- No page errors on desktop, mobile or reduced motion; production build under `/portfolio/`.
- No horizontal overflow at 360 / 390 / 768 / 1024 / 1440 / 1920 (checked for every element,
  ignoring intentional horizontal scrollers); every interactive target ≥ 44 px.

### Not verified here

- **Firefox and WebKit**: only Chromium is installed in this environment, and the Playwright
  browser downloads (cdn.playwright.dev) are blocked by its network policy. The code avoids
  Chromium-only APIs or feature-detects them (`requestIdleCallback`, `inert`,
  `backdrop-filter` with an `@supports` fallback, WebGL1-compatible GLSL). It still needs a manual
  pass in Firefox and Safari.
- **Real GPUs / phones**: every number above is from a CPU rasteriser. Please check on a real
  low-end phone; `?quality=1` forces the low tier if you want to compare.

### Bundle

| | Before | After |
| --- | --- | --- |
| Initial JS (gzip) | main 128 KB + vendor chunk 131 KB (React, R3F, three, GSAP, framer-motion…) | main 83 KB (React, Lenis, icons, nav, hero) |
| three.js | in the initial load | separate chunk, fetched on idle, not at all on tier 0 |
| Images on first load | ~6 MB (parallax PNGs, full-size project images) | ≈ 30 KB portrait WebP + logos; everything else lazy, AVIF/WebP |
