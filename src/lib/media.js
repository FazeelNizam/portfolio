/**
 * Responsive-image helpers backed by the build-time manifest
 * (scripts/optimize-images.mjs → src/data/media-manifest.json).
 *
 * Data files keep importing the original images (so nothing in /data had to
 * change); we map the bundled URL ("static/media/ANRP.1a2b3c4d.jpeg") back to the
 * original file name and serve the optimised WebP/AVIF variants instead.
 */
import manifest from '../data/media-manifest.json'

const PUBLIC = process.env.PUBLIC_URL || ''

export function mediaKey(src) {
  if (!src || typeof src !== 'string') return null
  const base = src.split('/').pop().split('?')[0]
  // strip the webpack content hash (CRA 5 uses 20 hex chars): name.<hash>.ext → name.ext
  return base.replace(/\.[0-9a-f]{8,32}(\.[a-z0-9]+)$/i, '$1')
}

export function getMedia(src) {
  const key = mediaKey(src)
  const m = key && manifest[key]
  if (!m) return null
  const url = (w, type) => `${PUBLIC}/${m.base}-${w}.${type}`
  const largest = m.widths[m.widths.length - 1]
  return {
    ...m,
    url,
    srcSet: (type) => m.widths.map((w) => `${url(w, type)} ${w}w`).join(', '),
    fallback: url(largest, 'webp'),
    /** best single URL for a given display width (css px × dpr) */
    pick: (px, type = 'webp') => url(m.widths.find((w) => w >= px) || largest, type),
  }
}

/**
 * <picture> with AVIF + WebP sources, intrinsic size (no CLS) and a blurred LQIP
 * background that the image fades in over.
 */
export function ResponsivePicture({ src, alt, sizes = '100vw', className = '', imgClassName = '', loading = 'lazy', fetchPriority, onLoad, style }) {
  const m = getMedia(src)
  if (!m) {
    return <img src={src} alt={alt} className={imgClassName} loading={loading} decoding="async" style={style} />
  }
  return (
    <picture className={`rpic ${className}`} style={{ backgroundImage: `url(${m.lqip})`, ...style }}>
      <source type="image/avif" srcSet={m.srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={m.srcSet('webp')} sizes={sizes} />
      <img
        src={m.fallback}
        alt={alt}
        width={m.width}
        height={m.height}
        loading={loading}
        decoding="async"
        fetchpriority={fetchPriority}
        className={imgClassName}
        onLoad={(e) => {
          e.currentTarget.classList.add('is-loaded')
          onLoad && onLoad(e)
        }}
      />
    </picture>
  )
}
