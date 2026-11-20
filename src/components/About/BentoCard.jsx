import React, { useRef } from 'react'

const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Bento tile with a cursor spotlight and a subtle 3D tilt.
 * Replaces MagicContainer, which stored the global mouse position in React state
 * (re-rendering the whole grid and measuring every card on every mousemove).
 * Here only the hovered card is touched, writes are batched into one rAF, and
 * only CSS custom properties change (transform/background — no layout).
 */
export default function BentoCard({ as: Tag = 'article', className = '', children, tilt = true, ...rest }) {
  const ref = useRef(null)
  const raf = useRef(0)
  const rect = useRef(null)

  const onEnter = () => {
    rect.current = ref.current.getBoundingClientRect()
  }
  const onMove = (e) => {
    if (!fine || !rect.current) return
    const r = rect.current
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      if (tilt && !reduced) {
        el.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
      }
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    rect.current = null
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <Tag
      ref={ref}
      className={`bento-card reveal ${className}`}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      <div className="bento-card__inner">{children}</div>
    </Tag>
  )
}
