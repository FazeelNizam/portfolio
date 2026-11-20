import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FaBehance, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import Dialog from '../ui/Dialog'
import { getMedia } from '../../lib/media'
import { prefersReducedMotion } from '../../lib/device'

/**
 * Lightbox with a shared-element (FLIP) open/close from the clicked thumbnail,
 * ←/→ keys, swipe, and a counter. Only transform/opacity are animated.
 */
export default function Lightbox({ items, start, originRect, onClose }) {
  const [index, setIndex] = useState(start)
  const imgRef = useRef(null)
  const closing = useRef(false)
  const swipe = useRef(null)
  const item = items[index]
  const m = getMedia(item.image)
  const n = items.length

  const go = useCallback((d) => setIndex((i) => (i + d + n) % n), [n])

  const flipFrom = (rect, reverse) => {
    const img = imgRef.current
    if (!img || !rect || prefersReducedMotion()) return null
    const to = img.getBoundingClientRect()
    if (!to.width) return null
    const t = `translate(${rect.left - to.left}px, ${rect.top - to.top}px) scale(${rect.width / to.width}, ${rect.height / to.height})`
    const frames = [{ transformOrigin: '0 0', transform: t, borderRadius: '18px' }, { transformOrigin: '0 0', transform: 'none', borderRadius: '10px' }]
    return img.animate(reverse ? frames.reverse() : frames, { duration: reverse ? 320 : 460, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' })
  }

  // open: grow from the thumbnail
  useLayoutEffect(() => {
    flipFrom(originRect, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const anim = index === start ? flipFrom(originRect, true) : null
    if (anim) anim.onfinish = onClose
    else onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, start, originRect, onClose])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // preload neighbours
  useEffect(() => {
    ;[1, -1].forEach((d) => {
      const nm = getMedia(items[(index + d + n) % n].image)
      if (nm) new Image().src = nm.pick(1600)
    })
  }, [index, items, n])

  return (
    <Dialog open onClose={close} label={`${item.title} (${index + 1} of ${n})`} className="lightbox" initialFocus=".lightbox__close">
      <button type="button" className="lightbox__close btn btn--ghost btn--icon" onClick={close} aria-label="Close">
        <FaTimes aria-hidden="true" />
      </button>
      <figure
        className="lightbox__figure"
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current
          swipe.current = null
          if (!s) return
          const dx = e.clientX - s.x
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1)
        }}
      >
        <img
          key={item.id}
          ref={imgRef}
          className="lightbox__img"
          src={m ? m.pick(1600) : item.image}
          srcSet={m ? m.srcSet('webp') : undefined}
          sizes="92vw"
          width={m ? m.width : undefined}
          height={m ? m.height : undefined}
          alt={item.title}
          style={m ? { backgroundImage: `url(${m.lqip})` } : undefined}
          draggable={false}
        />
        <figcaption className="lightbox__caption">
          <span className="lightbox__count" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <span className="lightbox__title">{item.title}</span>
          <span className="lightbox__meta">
            {item.category}
            {item.tools ? ` · ${item.tools.join(', ')}` : ''}
          </span>
          {item.behanceUrl && (
            <a className="lightbox__link" href={item.behanceUrl} target="_blank" rel="noopener noreferrer">
              <FaBehance aria-hidden="true" /> View on Behance
            </a>
          )}
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev btn btn--ghost btn--icon" onClick={() => go(-1)} aria-label="Previous image">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next btn btn--ghost btn--icon" onClick={() => go(1)} aria-label="Next image">
            <FaChevronRight aria-hidden="true" />
          </button>
        </>
      )}
    </Dialog>
  )
}
