import { useEffect, useState } from 'react'

/** Subscribe to a media query. */
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatches(m.matches)
    on()
    m.addEventListener ? m.addEventListener('change', on) : m.addListener(on)
    return () => (m.removeEventListener ? m.removeEventListener('change', on) : m.removeListener(on))
  }, [query])
  return matches
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/**
 * IntersectionObserver hook. `once` keeps it true after first intersection.
 * Returns [ref, inView].
 */
export function useInView({ rootMargin = '0px', threshold = 0, once = false } = {}) {
  const [node, setNode] = useState(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [node, rootMargin, threshold, once])
  return [setNode, inView]
}
