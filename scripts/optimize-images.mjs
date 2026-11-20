/**
 * Build-time image pipeline.
 *
 *   npm run images
 *
 * - Reads the original images referenced by src/data/*Projects.js (originals stay untouched).
 * - Writes responsive WebP + AVIF variants to public/media/** .
 * - Writes src/data/media-manifest.json with intrinsic size, aspect ratio and a tiny
 *   blurred LQIP (data URI) per image, so layouts never have to wait for image loads.
 * - Builds the hero particle source (public/media/hero/portrait-particles.png): the purple
 *   background and white sticker outline of src/img/dp.png are keyed out and the contrast
 *   is normalised so brightness maps nicely to particle density/size.
 *
 * The output is committed so `npm run build` / GitHub Pages deploys don't need sharp.
 */
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcImg = path.join(root, 'src/img')
const pub = path.join(root, 'public/media')

const groups = {
  gallery: { data: 'src/data/designProjects.js', widths: [480, 960, 1600] },
  projects: { data: ['src/data/embeddedProjects.js', 'src/data/webProjects.js'], widths: [640, 1280] },
}

async function filesFrom(dataFiles) {
  const list = []
  for (const f of [].concat(dataFiles)) {
    const txt = await fs.readFile(path.join(root, f), 'utf8')
    for (const m of txt.matchAll(/from\s+'\.\.\/img\/projects\/([^']+)'/g)) list.push(m[1])
  }
  return [...new Set(list)]
}

const slug = (file) => file.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

async function processImage(file, group, widths) {
  const input = path.join(srcImg, 'projects', file)
  const img = sharp(input, { failOn: 'none' }).rotate()
  const meta = await img.metadata()
  const outDir = path.join(pub, group)
  await fs.mkdir(outDir, { recursive: true })
  const name = slug(file)
  const usable = widths.filter((w) => w < meta.width)
  if (!usable.length || usable[usable.length - 1] < widths[widths.length - 1]) usable.push(Math.min(meta.width, widths[widths.length - 1]))
  const ws = [...new Set(usable)].sort((a, b) => a - b)
  for (const w of ws) {
    const base = sharp(input, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true })
    await base.clone().webp({ quality: 78, effort: 5 }).toFile(path.join(outDir, `${name}-${w}.webp`))
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(outDir, `${name}-${w}.avif`))
  }
  const lqipBuf = await sharp(input, { failOn: 'none' }).rotate().resize({ width: 16 }).blur(0.6).webp({ quality: 40 }).toBuffer()
  return {
    width: meta.width,
    height: meta.height,
    ratio: +(meta.width / meta.height).toFixed(4),
    widths: ws,
    base: `media/${group}/${name}`,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
  }
}

/** Key out the flat purple background + white sticker stroke of the portrait. */
async function buildPortrait() {
  const SIZE = 512
  const STROKE = 15 // px at 906px source: width of the white sticker outline (+ antialias)
  const input = path.join(srcImg, 'dp.png')
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const bg = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]
    bg[i] = r - g > 50 && b - g > 90 ? 1 : 0
  }
  // dilate background by STROKE px (separable square max filter) to eat the white outline
  const dil = (src, horiz) => {
    const out = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = 0
      for (let k = -STROKE; k <= STROKE && !v; k++) {
        const xx = horiz ? x + k : x, yy = horiz ? y : y + k
        if (xx >= 0 && xx < W && yy >= 0 && yy < H) v = src[yy * W + xx]
      }
      out[y * W + x] = v
    }
    return out
  }
  const mask = dil(dil(bg, true), false)
  // luminance + levels
  let lo = 255, hi = 0
  const lum = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    const l = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]
    lum[i] = l
    if (!mask[i]) { lo = Math.min(lo, l); hi = Math.max(hi, l) }
  }
  const out = Buffer.alloc(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    let l = (lum[i] - lo) / Math.max(1, hi - lo)
    l = Math.pow(Math.min(1, Math.max(0, l)), 0.9)
    const v = Math.round(l * 255)
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v
    out[i * 4 + 3] = mask[i] ? 0 : 255
  }
  await fs.mkdir(path.join(pub, 'hero'), { recursive: true })
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .blur(0.5)
    .resize(SIZE, SIZE)
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, 'hero', 'portrait-particles.png'))
  // About-card avatar (original look, just compressed)
  for (const w of [256, 512]) {
    await sharp(input).resize(w).webp({ quality: 80 }).toFile(path.join(pub, 'hero', `dp-${w}.webp`))
    await sharp(input).resize(w).avif({ quality: 55 }).toFile(path.join(pub, 'hero', `dp-${w}.avif`))
  }
}

const manifest = {}
for (const [group, cfg] of Object.entries(groups)) {
  for (const file of await filesFrom(cfg.data)) {
    manifest[file] = await processImage(file, group, cfg.widths)
    process.stdout.write('.')
  }
}
await buildPortrait()
// heavy decorative SVGs (embedded rasters) used in the About bento → small WebP
await fs.mkdir(path.join(pub, 'decor'), { recursive: true })
for (const [file, w] of [['b5.svg', 700]]) {
  await sharp(path.join(srcImg, file), { density: 144 }).resize({ width: w }).webp({ quality: 72 }).toFile(path.join(pub, 'decor', file.replace('.svg', '.webp')))
}
await fs.writeFile(path.join(root, 'src/data/media-manifest.json'), JSON.stringify(manifest, null, 1) + '\n')
console.log(`\n${Object.keys(manifest).length} images -> public/media, manifest -> src/data/media-manifest.json`)
