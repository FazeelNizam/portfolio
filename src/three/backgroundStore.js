/** Tiny singleton so sections (e.g. the Projects carousel) can draw into the shared background renderer. */
let instance = null
const waiters = new Set()

export function setBackground(bg) {
  instance = bg
  if (bg) waiters.forEach((fn) => fn(bg))
}

export const getBackground = () => instance

/** Calls fn(bg) now or when the background is ready. Returns unsubscribe. */
export function onBackground(fn) {
  if (instance) fn(instance)
  waiters.add(fn)
  return () => waiters.delete(fn)
}
