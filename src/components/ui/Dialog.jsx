import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { lockScroll } from '../../lib/smoothScroll'

/**
 * Accessible modal shell: portal, role=dialog, focus trap, Esc to close,
 * scroll lock and focus restoration. Styling/animation is up to the caller.
 */
export default function Dialog({ open, onClose, label, className = '', children, initialFocus }) {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    lockScroll(true)
    const root = ref.current
    const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const first = (initialFocus && root.querySelector(initialFocus)) || root.querySelector(sel)
    ;(first || root).focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const els = [...root.querySelectorAll(sel)].filter((el) => el.offsetParent !== null)
      if (!els.length) return
      const i = els.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        els[els.length - 1].focus()
      } else if (!e.shiftKey && i === els.length - 1) {
        e.preventDefault()
        els[0].focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      lockScroll(false)
      if (prev && prev.focus) prev.focus({ preventScroll: true })
    }
  }, [open, initialFocus])

  if (!open) return null
  return createPortal(
    <div
      ref={ref}
      className={`dialog ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>,
    document.body
  )
}
