/** Pure-JS image sampling (no three.js) – shared by the WebGL portrait and the Canvas2D fallback. */

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One-off CPU sampling of the portrait into particle attributes. */
export async function samplePortrait(url, count) {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  await img.decode()
  const S = Math.min(512, img.naturalWidth)
  const H = Math.round((S * img.naturalHeight) / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = S
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, S, H)
  const px = ctx.getImageData(0, 0, S, H).data

  // importance-sampling CDF: brighter pixels get more particles, darks still get some
  const cdf = new Float32Array(S * H)
  let acc = 0
  for (let i = 0; i < S * H; i++) {
    const a = px[i * 4 + 3] / 255
    const l = px[i * 4] / 255
    acc += a > 0.5 ? 0.22 + 0.78 * Math.pow(l, 1.35) : 0
    cdf[i] = acc
  }
  const rnd = mulberry32(1337)
  const aspect = S / H
  const home = new Float32Array(count * 3)
  const data = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const t = rnd() * acc
    let lo = 0
    let hi = cdf.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cdf[mid] < t) lo = mid + 1
      else hi = mid
    }
    const x = (lo % S) + rnd()
    const y = Math.floor(lo / S) + rnd()
    const l = px[lo * 4] / 255
    home[i * 3] = (x / S - 0.5) * aspect
    home[i * 3 + 1] = 0.5 - y / H
    home[i * 3 + 2] = l
    data[i * 4] = l
    data[i * 4 + 1] = rnd()
    data[i * 4 + 2] = rnd()
    data[i * 4 + 3] = 0.6 + rnd() * 0.8
  }
  return { home, data, aspect }
}
