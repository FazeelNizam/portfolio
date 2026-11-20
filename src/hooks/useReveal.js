import { useEffect } from 'react'

let io = null
function observer() {
  if (io || typeof IntersectionObserver === 'undefined') return io
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  )
  return io
}

/**
 * Scroll-reveal for every `.reveal` element inside `ref`. One shared observer for
 * the whole page; CSS does the (transform/opacity-only) animation, stagger via --i.
 */
export default function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll('.reveal:not(.is-in)')
    const obs = observer()
    if (!obs) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    els.forEach((el) => obs.observe(el))
    return () => els.forEach((el) => obs.unobserve(el))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
