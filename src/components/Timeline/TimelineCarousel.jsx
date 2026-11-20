import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { prefersReducedMotion } from '../../lib/device'
import './TimelineCarousel.scss'

/**
 * Coverflow-style timeline used by Experience and Education.
 *
 * Built on a native horizontal scroll-snap track, so touch swipe, trackpads,
 * shift+wheel and screen readers work out of the box. On top of that:
 *  - mouse drag (snap is suspended while dragging, then we glide to the nearest card)
 *  - vertical wheel → horizontal, but only after the pointer has rested on the
 *    track (intent), and never at the ends, so it can't trap page scrolling
 *  - ←/→/Home/End when the track has focus, plus prev/next buttons and a
 *    clickable year rail
 *  - 3D tilt/depth per card from its distance to the centre, written as
 *    transforms in one rAF per scroll (cached geometry, no layout reads per frame)
 * Replaces the pinned GSAP "scrolling cards", whose pin spacing broke with the
 * lazily-loaded sections and stacked/clipped cards on small screens.
 */
export default function TimelineCarousel({ items, label, renderCard }) {
  const trackRef = useRef(null)
  const geo = useRef({ centers: [], half: 0 })
  const [index, setIndex] = useState(items.length - 1)
  const drag = useRef(null)
  const hoverSince = useRef(0)
  const reduced = useRef(false)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const cards = [...track.children]
    geo.current.centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2)
    geo.current.half = track.clientWidth / 2
    geo.current.cardW = cards[0] ? cards[0].offsetWidth : 1
  }, [])

  const apply = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { centers, half, cardW } = geo.current
    const mid = track.scrollLeft + half
    let best = 0
    let bestD = Infinity
    const cards = track.children
    for (let i = 0; i < cards.length; i++) {
      const off = (centers[i] - mid) / (cardW || 1) // -n..n, 0 = centred
      const a = Math.min(1.4, Math.abs(off))
      if (Math.abs(off) < bestD) {
        bestD = Math.abs(off)
        best = i
      }
      if (reduced.current) continue
      const el = cards[i].firstElementChild
      el.style.transform = `translate3d(0,0,${(-a * 90).toFixed(1)}px) rotateY(${(-Math.max(-1.2, Math.min(1.2, off)) * 16).toFixed(2)}deg) scale(${(1 - a * 0.06).toFixed(3)})`
      el.style.opacity = (1 - Math.min(0.55, a * 0.4)).toFixed(3)
    }
    setIndex((p) => (p === best ? p : best))
  }, [])

  // initial position: latest entry, centred, without animation
  useEffect(() => {
    reduced.current = prefersReducedMotion()
    measure()
    const track = trackRef.current
    const last = geo.current.centers[items.length - 1]
    if (last !== undefined) track.scrollLeft = last - geo.current.half
    apply()
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(apply)
    }
    const ro = new ResizeObserver(() => {
      measure()
      apply()
    })
    ro.observe(track)
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      track.removeEventListener('scroll', onScroll)
    }
  }, [items.length, measure, apply])

  const go = useCallback((i) => {
    const track = trackRef.current
    const c = geo.current.centers[Math.max(0, Math.min(items.length - 1, i))]
    if (c === undefined) return
    track.scrollTo({ left: c - geo.current.half, behavior: reduced.current ? 'auto' : 'smooth' })
  }, [items.length])

  // wheel with intent
  useEffect(() => {
    const track = trackRef.current
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // native horizontal scroll
      if (performance.now() - hoverSince.current < 350) return
      const max = track.scrollWidth - track.clientWidth
      const atStart = track.scrollLeft <= 2 && e.deltaY < 0
      const atEnd = track.scrollLeft >= max - 2 && e.deltaY > 0
      if (atStart || atEnd) return // let the page scroll on
      e.preventDefault()
      track.classList.add('is-wheeling')
      track.scrollLeft += e.deltaY
      clearTimeout(track._wt)
      track._wt = setTimeout(() => track.classList.remove('is-wheeling'), 160)
    }
    track.addEventListener('wheel', onWheel, { passive: false })
    return () => track.removeEventListener('wheel', onWheel)
  }, [])

  // mouse drag
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: 0 }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    d.moved = Math.max(d.moved, Math.abs(dx))
    if (d.moved > 4) {
      trackRef.current.classList.add('is-dragging')
      if (!trackRef.current.hasPointerCapture(e.pointerId)) trackRef.current.setPointerCapture(e.pointerId)
    }
    trackRef.current.scrollLeft = d.left - dx
  }
  const endDrag = (e) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const track = trackRef.current
    track.classList.remove('is-dragging')
    if (d.moved > 4) {
      // nearest card, nudged by drag direction
      const dir = Math.sign(d.left - track.scrollLeft)
      const { centers, half, cardW } = geo.current
      const mid = track.scrollLeft + half + dir * cardW * 0.15
      let best = 0
      centers.forEach((c, i) => {
        if (Math.abs(c - mid) < Math.abs(centers[best] - mid)) best = i
      })
      go(best)
    }
  }
  const onClickCapture = (e) => {
    // swallow clicks that ended a drag
    if (trackRef.current.classList.contains('is-dragging')) e.stopPropagation()
  }

  const onKeyDown = (e) => {
    if (e.target !== trackRef.current) return
    let i = null
    if (e.key === 'ArrowRight') i = index + 1
    if (e.key === 'ArrowLeft') i = index - 1
    if (e.key === 'Home') i = 0
    if (e.key === 'End') i = items.length - 1
    if (i === null) return
    e.preventDefault()
    go(i)
  }

  return (
    <div className="tl">
      <ol
        ref={trackRef}
        className="tl__track"
        tabIndex={0}
        aria-label={`${label}. Use left and right arrow keys to move between entries.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => (hoverSince.current = performance.now())}
        onClickCapture={onClickCapture}
        data-lenis-prevent-wheel
      >
        {items.map((item, i) => (
          <li key={item.id} className={`tl__slot${i === index ? ' is-active' : ''}`} aria-current={i === index ? 'step' : undefined}>
            <article className="tl-card">{renderCard(item, i)}</article>
          </li>
        ))}
      </ol>

      <div className="tl__controls">
        <button type="button" className="btn btn--ghost btn--icon" onClick={() => go(index - 1)} disabled={index <= 0} aria-label="Previous entry">
          <FaChevronLeft aria-hidden="true" />
        </button>
        <ol className="tl__rail" aria-label={`${label} timeline`}>
          <span className="tl__rail-fill" style={{ transform: `scaleX(${items.length > 1 ? index / (items.length - 1) : 1})` }} aria-hidden="true" />
          {items.map((item, i) => (
            <li key={item.id}>
              <button type="button" className={`tl__mark${i <= index ? ' is-past' : ''}${i === index ? ' is-active' : ''}`} onClick={() => go(i)} aria-label={`${item.railLabel}: ${item.title}`} aria-current={i === index ? 'step' : undefined}>
                <span className="tl__mark-dot" aria-hidden="true" />
                <span className="tl__mark-year" aria-hidden="true">
                  {item.railLabel}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn--ghost btn--icon" onClick={() => go(index + 1)} disabled={index >= items.length - 1} aria-label="Next entry">
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
