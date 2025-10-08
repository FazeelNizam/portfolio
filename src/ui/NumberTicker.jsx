import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

import { cn } from '../../utils/cn'

export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
}) {
  const ref = useRef(null)
  const motionValue = useMotionValue(direction === 'down' ? value : 0)
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 120,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value)
      }, delay * 1000)
    }
  }, [motionValue, isInView, delay, value, direction])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US').format(
          latest.toFixed(0)
        )
      }
    })

    return () => unsubscribe()
  }, [springValue])

  return (
    <span
      className={cn('inline-block tabular-nums tracking-wider', className)}
      ref={ref}
    />
  )
}
