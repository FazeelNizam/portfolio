import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FaBehance } from 'react-icons/fa'
import { getMedia, ResponsivePicture } from '../../lib/media'
import { prefersReducedMotion } from '../../lib/device'
import Lightbox from './Lightbox'
import './DesignGallery.scss'

/*
 * Arrangement algorithm — unchanged from the original:
 *   1. classify each design by aspect ratio (> 1.3 landscape → spans 2 columns,
 *      < 0.75 portrait → spans 2 rows, otherwise square),
 *   2. Fisher–Yates shuffle,
 *   3. CSS grid with `grid-auto-flow: dense` packs them.
 *
 * What changed is *when* the ratio is known. Before, every full-size PNG
 * (~20 MB total) had to download and decode before the grid could render at all,
 * behind a spinner. Now ratios come from the build-time manifest, so the layout
 * is computed synchronously on first render (memoised), with intrinsic sizes and
 * LQIP placeholders reserving space while optimised images stream in lazily.
 */
const classify = (ratio) => (ratio > 1.3 ? 'landscape' : ratio < 0.75 ? 'portrait' : 'square')

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SIZES = {
  landscape: '(min-width: 1024px) 66vw, (min-width: 768px) 100vw, 100vw',
  portrait: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
  square: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
}

const DesignGallery = ({ designs }) => {
  // computed once per mount — no async work, no spinner, no ScrollTrigger refresh hack
  const arranged = useMemo(
    () =>
      shuffle(
        designs.map((d) => {
          const m = getMedia(d.image)
          return { ...d, ratio: m ? m.ratio : 1, aspectClass: classify(m ? m.ratio : 1) }
        })
      ),
    [designs]
  )
  const categories = useMemo(() => ['All', ...Array.from(new Set(designs.map((d) => d.category)))], [designs])
  const [filter, setFilter] = useState('All')
  const visible = useMemo(() => (filter === 'All' ? arranged : arranged.filter((d) => d.category === filter)), [arranged, filter])
  const [lightbox, setLightbox] = useState(null) // { index, rect }

  // FLIP: animate cards from their old grid slot to the new one (transform/opacity only)
  const gridRef = useRef(null)
  const rects = useRef(new Map())
  const snapshot = () => {
    const map = new Map()
    gridRef.current.querySelectorAll('[data-flip]').forEach((el) => map.set(el.dataset.flip, el.getBoundingClientRect()))
    rects.current = map
  }
  const changeFilter = (c) => {
    if (c === filter) return
    snapshot()
    setFilter(c)
  }
  useLayoutEffect(() => {
    const prev = rects.current
    if (!prev.size || prefersReducedMotion()) return
    rects.current = new Map()
    const els = [...gridRef.current.querySelectorAll('[data-flip]')]
    const next = els.map((el) => el.getBoundingClientRect()) // batch reads
    els.forEach((el, i) => {
      // then writes
      const before = prev.get(el.dataset.flip)
      const after = next[i]
      const delay = Math.min(i * 18, 160)
      if (before) {
        const dx = before.left - after.left
        const dy = before.top - after.top
        const sx = before.width / after.width
        const sy = before.height / after.height
        if (Math.abs(dx) + Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return
        el.animate(
          [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }],
          { duration: 420, delay, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' }
        )
      } else {
        el.animate([{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' })
      }
    })
  }, [visible])

  return (
    <div className="gallery">
      <div className="gallery__filters" role="toolbar" aria-label="Filter designs by category">
        {categories.map((c) => (
          <button key={c} type="button" className={`gallery__filter${c === filter ? ' is-active' : ''}`} aria-pressed={c === filter} onClick={() => changeFilter(c)}>
            {c}
            <span className="gallery__filter-count">{c === 'All' ? designs.length : designs.filter((d) => d.category === c).length}</span>
          </button>
        ))}
      </div>

      <ul className="gallery__grid" ref={gridRef} aria-label="Design works">
        {visible.map((d, i) => (
          <li key={d.id} data-flip={d.id} className={`gallery__item gallery__item--${d.aspectClass}`} style={{ '--ratio': d.ratio }}>
            <button
              type="button"
              className="gallery__card"
              onClick={(e) => setLightbox({ index: i, rect: e.currentTarget.querySelector('img').getBoundingClientRect() })}
              aria-label={`${d.title} — open image`}
            >
              <ResponsivePicture src={d.image} alt={d.title} sizes={SIZES[d.aspectClass]} className="gallery__pic" />
              <span className="gallery__overlay" aria-hidden="true">
                <span className="gallery__cat">{d.category}</span>
                <span className="gallery__title">{d.title}</span>
                {d.tools && <span className="gallery__tools">{d.tools.join(' · ')}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="gallery__more">
        <a className="btn btn--ghost" href="https://www.behance.net/fazeelnizam/projects" target="_blank" rel="noopener noreferrer">
          <FaBehance aria-hidden="true" /> More on Behance
        </a>
      </p>

      {lightbox && <Lightbox items={visible} start={lightbox.index} originRect={lightbox.rect} onClose={() => setLightbox(null)} />}
    </div>
  )
}

export default DesignGallery
